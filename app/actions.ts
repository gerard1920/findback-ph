"use server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { loginSchema, registerSchema, itemSchema } from "@/lib/validation";
import { z } from "zod";
import { clearSession, currentUser, requireUser, setSession } from "@/lib/auth";
import { generateMatches } from "@/lib/matching";
import { isUuid, sha256 } from "@/lib/crypto";
import { sendPasswordResetEmail, isAnyEmailConfigured, shouldExposeResetLink } from "@/lib/mail";
import { logAdmin } from "@/lib/admin";
import { saveUploadedFile } from "@/lib/storage";
import type { ReportReason } from "@prisma/client";
export type FormState={error?:string;success?:string};
export async function register(_:FormState,fd:FormData):Promise<FormState>{
  const raw=Object.fromEntries(fd);
  const normalizeOpt = (v: unknown) => {
    const s = String(v ?? "").trim();
    return s.length > 0 ? s : undefined;
  };
  const payload={
    email:String(raw.email ?? raw.email_display ?? "").trim(),
    password:String(raw.password ?? raw.password_display ?? ""),
    displayName:String(raw.displayName ?? raw.name ?? raw.name_display ?? "").trim(),
    phoneNumber:normalizeOpt(raw.phoneNumber ?? raw.phone),
    campus:normalizeOpt(raw.campus),
    preferredCity:normalizeOpt(raw.preferredCity ?? raw.city),
    preferredProvince:normalizeOpt(raw.preferredProvince ?? raw.province),
  };
  const parsed=registerSchema.safeParse(payload);
  if(!parsed.success){
    const issues=parsed.error.issues.map(i=>{
      const field=i.path[0];
      const msg=i.message;
      if(field==="email"&&msg.toLowerCase().includes("email"))return"Enter a valid email address.";
      if(field==="password"&&msg.includes("at least 8"))return"Password must be at least 8 characters.";
      if(field==="password"&&msg.includes("72"))return"Password must be 72 characters or less.";
      if(field==="displayName"&&msg.includes("at least 2"))return"Your name needs at least 2 characters.";
      if(field==="displayName"&&msg.includes("60"))return"Your name is too long (max 60 characters).";
      if(field==="phoneNumber")return msg || "Use a valid PH number (09171234567).";
      return msg;
    });
    return{error:issues[0]??"Please check your details and try again."};
  }
  const email=parsed.data.email.toLowerCase();
  const username=email.split("@")[0].replace(/[^a-z0-9]/g,"").slice(0,16)+Math.floor(Math.random()*9999);
  try{
    const user=await db.user.create({data:{
      email,
      passwordHash:await bcrypt.hash(parsed.data.password,12),
      displayName:parsed.data.displayName,
      username,
      phoneNumber:parsed.data.phoneNumber ?? null,
      campus:parsed.data.campus ?? null,
      preferredCity:parsed.data.preferredCity ?? null,
      preferredProvince:parsed.data.preferredProvince ?? null,
    }});
    await setSession(user.id);
  }catch{
    return{error:"An account already exists with that email."};
  }
  redirect("/settings");
}
export async function login(_:FormState,fd:FormData):Promise<FormState>{
  try {
    const raw=Object.fromEntries(fd);
    const payload={
      email:String(raw.email ?? raw.email_display ?? "").trim(),
      password:String(raw.password ?? raw.password_display ?? ""),
    };
    const parsed=loginSchema.safeParse(payload);
    if(!parsed.success)return{error:"Enter a valid email and password."};
    const user=await db.user.findUnique({where:{email:parsed.data.email.toLowerCase()}});
    if(!user||!await bcrypt.compare(parsed.data.password,user.passwordHash))return{error:"Incorrect email or password."};
    if(user.role==="SUSPENDED"||user.status==="SUSPENDED"||user.status==="BANNED"){
      const ban=await db.ban.findFirst({where:{userId:user.id,action:{in:["SUSPEND","BAN"]},liftedAt:null},orderBy:{createdAt:"desc"}});
      return{error:`Your account has been suspended from Lost & Found.\n\nReason: ${ban?.reason??"No reason provided."}\n\nIf you believe this was a mistake, contact the administrator.`};
    }
    await setSession(user.id);
    return{success:"Welcome back! Redirecting…"};
  } catch {
    return { error: "We couldn’t sign you in right now. Please try again in a moment." };
  }
}
export async function logout(){await clearSession();redirect("/")}
export async function createItem(type:"LOST"|"FOUND",_:FormState,fd:FormData):Promise<FormState>{try{const user=await requireUser();const parsed=itemSchema.safeParse(Object.fromEntries(fd));if(!parsed.success)return{error:"Please complete all required fields correctly."};const files=fd.getAll("images").filter((v):v is File=>v instanceof File&&v.size>0);const allowed=new Set(["image/jpeg","image/png","image/webp"]);if(files.length>5)return{error:"You can upload a maximum of 5 images."};if(files.some(f=>f.size>5*1024*1024||!allowed.has(f.type))){return{error:"Images must be JPG, PNG, or WebP and no larger than 5 MB each."}}const data=parsed.data;const item=await db.item.create({data:{...data,type,ownerId:user.id,privateSerial:data.privateSerial||null,brand:data.brand||null,color:data.color||null,barangay:data.barangay||null,distinguishingFeatures:data.distinguishingFeatures||null,reward:data.reward||null,privateProof:data.privateProof||null}});if(files.length){const urls=await Promise.all(files.map(async file=>saveUploadedFile(file)));await db.itemImage.createMany({data:urls.map(url=>({itemId:item.id,url,alt:item.title}))})}await generateMatches(item.id);redirect(`/items/${item.id}`)}catch(err){if(err instanceof Error && err.message==="NEXT_REDIRECT")throw err;return{error:err instanceof Error?err.message:"Failed to create report."}}}
export async function saveItem(itemId:string){const user=await requireUser();await db.savedItem.upsert({where:{userId_itemId:{userId:user.id,itemId}},create:{userId:user.id,itemId},update:{}})}
export async function reportItem(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const itemId = String(fd.get("itemId") ?? "").trim();
    const reason = String(fd.get("reason") ?? "").trim();
    const details = String(fd.get("details") ?? "").trim();
    if (!itemId) return { error: "Missing item ID." };
    const valid = ["FAKE_LISTING", "SCAM", "HARASSMENT", "STOLEN", "INAPPROPRIATE", "SPAM", "SUSPICIOUS"] as const;
    if (!valid.includes(reason as (typeof valid)[number])) return { error: "Invalid reason." };
    if (details.length < 10) return { error: "Please provide at least 10 characters so we can investigate." };
    if (details.length > 2000) return { error: "Keep it under 2000 characters." };
    const user = await requireUser();
    const existing = await db.report.findFirst({ where: { itemId, reporterId: user.id } });
    if (existing) return { error: "You have already reported this item." };
    await db.report.create({ data: { itemId, reporterId: user.id, reason: reason as typeof valid[number], details: details || null } });
    return { success: "Report submitted. Our Safety team will review it within 24 hours." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to submit report." };
  }
}
export async function startConversation(itemId:string){const user=await currentUser();if(!user)redirect("/login");const item=await db.item.findUnique({where:{id:itemId},select:{id:true,ownerId:true,status:true}});if(!item||item.ownerId===user.id||item.status==="RESOLVED"||item.status==="REMOVED")redirect(`/items/${itemId}`);const blocked=await db.block.findFirst({where:{OR:[{blockerId:item.ownerId,blockedId:user.id},{blockerId:user.id,blockedId:item.ownerId}]}});if(blocked)redirect(`/messages?error=blocked`);const [a,b]=[user.id,item.ownerId].sort();const existing=await db.conversation.findUnique({where:{itemId_participantAId_participantBId:{itemId:item.id,participantAId:a,participantBId:b}}});if(existing)redirect(`/messages/${existing.id}`);const conversation=await db.conversation.create({data:{itemId:item.id,participantAId:a,participantBId:b}});redirect(`/messages/${conversation.id}`)}
export async function sendMessage(conversationId:string,fd:FormData){const user=await requireUser();const conversation=await db.conversation.findUnique({where:{id:conversationId}});if(!conversation||(conversation.participantAId!==user.id&&conversation.participantBId!==user.id))throw new Error("UNAUTHORIZED");const otherId=conversation.participantAId===user.id?conversation.participantBId:conversation.participantAId;const blocked=await db.block.findFirst({where:{OR:[{blockerId:otherId,blockedId:user.id},{blockerId:user.id,blockedId:otherId}]}});if(blocked)throw new Error("You cannot send messages to this user.");const body=String(fd.get("body")||"").trim();if(!body)redirect(`/messages/${conversationId}`);if(body.length>2000)throw new Error("Message too long");await db.message.create({data:{conversationId,senderId:user.id,body}});await db.notification.create({data:{userId:otherId,title:"New message",body:`${user.displayName} sent you a message.`,link:`/messages/${conversationId}`}});redirect(`/messages/${conversationId}`)}
export async function unsaveItem(itemId:string){const user=await requireUser();await db.savedItem.deleteMany({where:{userId:user.id,itemId}})}
export async function claimItem(itemId:string,fd:FormData){const user=await requireUser();const item=await db.item.findUnique({where:{id:itemId},select:{id:true,type:true,status:true,ownerId:true,title:true}});const answer=String(fd.get("answer")||"").trim();if(!item||item.type!=="FOUND"||item.ownerId===user.id||!["ACTIVE","MATCHED"].includes(item.status)||answer.length<10||answer.length>1000)redirect(`/items/${itemId}`);const dup=await db.claim.findFirst({where:{itemId:item.id,claimantId:user.id,status:{in:["PENDING","UNDER_REVIEW","APPROVED"]}}});if(!dup){await db.claim.create({data:{itemId:item.id,claimantId:user.id,verificationAnswer:answer}});await db.notification.create({data:{userId:item.ownerId,title:"New ownership claim",body:`${user.displayName} submitted a claim for ${item.title}.`,link:"/dashboard/claims"}})}redirect(`/items/${itemId}`)}
export async function updateItem(itemId:string,_:FormState,fd:FormData):Promise<FormState>{try{const user=await requireUser();const item=await db.item.findUnique({where:{id:itemId}});if(!item||item.ownerId!==user.id)return{error:"You can only edit reports you own."};const parsed=itemSchema.safeParse(Object.fromEntries(fd));if(!parsed.success)return{error:"Please complete all required fields correctly."};const files=fd.getAll("images").filter((v):v is File=>v instanceof File&&v.size>0);const allowed=new Set(["image/jpeg","image/png","image/webp"]);if(files.length>5)return{error:"You can upload a maximum of 5 images."};if(files.some(f=>f.size>5*1024*1024||!allowed.has(f.type)))return{error:"Images must be JPG, PNG, or WebP and no larger than 5 MB each."};const removeIds=fd.getAll("removeImage").filter((v):v is string=>typeof v==="string");const data=parsed.data;await db.item.update({where:{id:item.id},data:{...data,privateSerial:data.privateSerial||null,brand:data.brand||null,color:data.color||null,barangay:data.barangay||null,distinguishingFeatures:data.distinguishingFeatures||null,privateProof:data.privateProof||null,reward:data.reward||null}});if(removeIds.length)await db.itemImage.deleteMany({where:{id:{in:removeIds},itemId:item.id}});if(files.length){const urls=await Promise.all(files.map(async file=>saveUploadedFile(file)));await db.itemImage.createMany({data:urls.map(url=>({itemId:item.id,url,alt:data.title}))})}await generateMatches(item.id);redirect(`/items/${item.id}`)}catch(err){if(err instanceof Error && err.message==="NEXT_REDIRECT")throw err;return{error:err instanceof Error?err.message:"Failed to update report."}}}
export async function deleteItem(itemId:string){const user=await requireUser();await db.item.updateMany({where:{id:itemId,ownerId:user.id},data:{status:"REMOVED"}});redirect("/dashboard")}
export async function reviewClaim(claimId:string,action:"APPROVED"|"REJECTED"){const user=await requireUser();const claim=await db.claim.findUnique({where:{id:claimId}});if(!claim||(action!=="APPROVED"&&action!=="REJECTED"))redirect("/dashboard/claims");const item=await db.item.findUnique({where:{id:claim.itemId},select:{id:true,ownerId:true,title:true,status:true}});if(!item||item.ownerId!==user.id)redirect("/dashboard/claims");if(claim.status==="PENDING"||claim.status==="UNDER_REVIEW"){if(action==="APPROVED"&&!["RESOLVED","REMOVED"].includes(item.status)){await db.claim.update({where:{id:claim.id},data:{status:"APPROVED"}});await db.item.update({where:{id:item.id},data:{status:"CLAIM_PENDING"}});await db.notification.create({data:{userId:claim.claimantId,title:"Claim approved",body:`Your claim for ${item.title} was approved. Coordinate a safe handover with the reporter.`,link:`/items/${item.id}`}})}else if(action==="REJECTED"){await db.claim.update({where:{id:claim.id},data:{status:"REJECTED"}});await db.notification.create({data:{userId:claim.claimantId,title:"Claim declined",body:`Your claim for ${item.title} was not approved.`,link:`/items/${item.id}`}})}}redirect("/dashboard/claims")}

export async function setRole(userId: string, role: "USER" | "ADMIN" | "SUSPENDED") {
  const admin = await requireUser();
  if (admin.role !== "ADMIN") throw new Error("FORBIDDEN");
  if (admin.id === userId) return;
  await db.user.update({ where: { id: userId }, data: { role } });
  redirect("/admin");
}

export async function deleteUser(userId: string) {
  const admin = await requireUser();
  if (admin.role !== "ADMIN") throw new Error("FORBIDDEN");
  if (admin.id === userId) return;
  await db.$transaction(async (tx) => {
    await tx.report.deleteMany({ where: { reporterId: userId } });
    await tx.message.deleteMany({ where: { senderId: userId } });
    await tx.savedItem.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { userId } });
    await tx.block.deleteMany({ where: { OR: [{ blockerId: userId }, { blockedId: userId }] } });
        await tx.user.delete({ where: { id: userId } });
    });
  redirect("/admin");
}

// =====================================================================
// ADMIN: user moderation (ban / suspend / warn / restore / delete)
// Every action is gated server-side: caller must be a logged-in ADMIN.
// All actions are recorded in AdminLog and user-facing notifications.
// =====================================================================

async function adminActor() {
  const u = await requireUser();
  if (u.role !== "ADMIN") throw new Error("FORBIDDEN");
  return u;
}

export async function adminBanUser(userId: string, fd: FormData) {
  const admin = await adminActor();
  if (admin.id === userId) throw new Error("FORBIDDEN"); // cannot ban yourself
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Banned by administrator";
  await db.user.update({ where: { id: userId }, data: { status: "BANNED", role: "SUSPENDED" } });
  await db.ban.create({ data: { userId, adminId: admin.id, action: "BAN", reason } });
  await db.notification.create({
    data: {
      userId,
      title: "Account banned",
      body: `Your account has been banned. Reason: ${reason}`,
    },
  });
  await logAdmin({ adminId: admin.id, action: "BAN", targetType: "USER", targetId: userId, reason });
  redirect("/admin/users");
}

export async function adminSuspendUser(userId: string, fd: FormData) {
  const admin = await adminActor();
  if (admin.id === userId) throw new Error("FORBIDDEN");
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Suspended by administrator";
  await db.user.update({ where: { id: userId }, data: { status: "SUSPENDED" } });
  await db.ban.create({ data: { userId, adminId: admin.id, action: "SUSPEND", reason } });
  await db.notification.create({
    data: { userId, title: "Account suspended", body: `Your account has been temporarily suspended. Reason: ${reason}` },
  });
  await logAdmin({ adminId: admin.id, action: "SUSPEND", targetType: "USER", targetId: userId, reason });
  redirect("/admin/users");
}

export async function adminWarnUser(userId: string, fd: FormData) {
  const admin = await adminActor();
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Warning from administrator";
  await db.ban.create({ data: { userId, adminId: admin.id, action: "WARN", reason } });
  await db.notification.create({
    data: { userId, title: "Admin warning", body: `You received a warning. Reason: ${reason}` },
  });
  await logAdmin({ adminId: admin.id, action: "WARN", targetType: "USER", targetId: userId, reason });
  redirect("/admin/users");
}

export async function adminUnbanUser(userId: string, fd: FormData) {
  const admin = await adminActor();
  if (admin.id === userId) throw new Error("FORBIDDEN");
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Restored by administrator";
  await db.user.update({ where: { id: userId }, data: { status: "ACTIVE", role: "USER" } });
  // lift any active bans (keep history with liftedAt set)
  await db.ban.updateMany({ where: { userId, liftedAt: null }, data: { liftedAt: new Date() } });
  await db.ban.create({ data: { userId, adminId: admin.id, action: "UNBAN", reason } });
  await db.notification.create({
    data: { userId, title: "Account restored", body: `Your account has been restored. Reason: ${reason}` },
  });
  await logAdmin({ adminId: admin.id, action: "UNBAN", targetType: "USER", targetId: userId, reason });
  redirect("/admin/users");
}

export async function adminSetUserRole(userId: string, role: "USER" | "ADMIN") {
  const admin = await adminActor();
  if (admin.id === userId && role !== "ADMIN") throw new Error("FORBIDDEN");
  const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) throw new Error("NOT_FOUND");
  await db.user.update({ where: { id: userId }, data: { role } });
  await logAdmin({
    adminId: admin.id,
    action: role === "ADMIN" ? "MAKE_ADMIN" : "REVOKE_ADMIN",
    targetType: "USER",
    targetId: userId,
    reason: role === "ADMIN" ? "Promoted to administrator" : "Administrator access revoked",
  });
  redirect("/admin/users");
}

export async function adminDeleteUser(userId: string, fd: FormData) {
  const admin = await adminActor();
  if (admin.id === userId) throw new Error("FORBIDDEN");
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Account deleted by administrator";
  await db.ban.create({ data: { userId, adminId: admin.id, action: "DELETE_USER", reason } });
  await logAdmin({ adminId: admin.id, action: "DELETE_USER", targetType: "USER", targetId: userId, reason });
  await db.$transaction(async (tx) => {
    await tx.report.deleteMany({ where: { reporterId: userId } });
    await tx.message.deleteMany({ where: { senderId: userId } });
    await tx.savedItem.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { userId } });
    await tx.block.deleteMany({ where: { OR: [{ blockerId: userId }, { blockedId: userId }] } });
    await tx.user.delete({ where: { id: userId } });
  });
    redirect("/admin/users");
}

// =====================================================================
// ADMIN: post (item) moderation
// =====================================================================

export async function adminHideItem(itemId: string, fd: FormData) {
  const admin = await adminActor();
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Hidden by administrator";
  await db.item.update({ where: { id: itemId }, data: { status: "REMOVED" } });
  await logAdmin({ adminId: admin.id, action: "HIDE_ITEM", targetType: "ITEM", targetId: itemId, reason });
  redirect("/admin/posts");
}

export async function adminRestoreItem(itemId: string, _fd: FormData) {
  const admin = await adminActor();
  await db.item.update({ where: { id: itemId }, data: { status: "ACTIVE" } });
  await logAdmin({ adminId: admin.id, action: "RESTORE_ITEM", targetType: "ITEM", targetId: itemId });
  redirect("/admin/posts");
}

export async function adminResolveItem(itemId: string, fd: FormData) {
  const admin = await adminActor();
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Marked resolved by administrator";
  await db.item.update({ where: { id: itemId }, data: { status: "RESOLVED" } });
  await logAdmin({ adminId: admin.id, action: "RESOLVE_ITEM", targetType: "ITEM", targetId: itemId, reason });
  redirect("/admin/posts");
}

export async function adminFlagItem(itemId: string) {
  const admin = await adminActor();
  await db.item.update({ where: { id: itemId }, data: { flagged: true } });
  await logAdmin({ adminId: admin.id, action: "FLAG_ITEM", targetType: "ITEM", targetId: itemId, reason: "Marked suspicious" });
  redirect("/admin/posts");
}

export async function adminUnflagItem(itemId: string) {
  const admin = await adminActor();
  await db.item.update({ where: { id: itemId }, data: { flagged: false } });
  await logAdmin({ adminId: admin.id, action: "UNFLAG_ITEM", targetType: "ITEM", targetId: itemId, reason: "Suspicious flag cleared" });
  redirect("/admin/posts");
}

export async function adminDeleteItem(itemId: string, fd: FormData) {
  const admin = await adminActor();
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Post deleted by administrator";
  await logAdmin({ adminId: admin.id, action: "DELETE_ITEM", targetType: "ITEM", targetId: itemId, reason });
  await db.item.delete({ where: { id: itemId } });
  redirect("/admin/posts");
}
// =====================================================================
// ADMIN: report moderation
// =====================================================================

export async function adminReviewReport(reportId: string) {
  const admin = await adminActor();
  await db.report.update({ where: { id: reportId }, data: { status: "REVIEWING" } });
  await logAdmin({ adminId: admin.id, action: "REVIEW_REPORT", targetType: "REPORT", targetId: reportId });
  redirect("/admin/reports");
}

export async function adminResolveReport(reportId: string, fd: FormData) {
  const admin = await adminActor();
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Report resolved by administrator";
  await db.report.update({ where: { id: reportId }, data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: admin.id } });
  await logAdmin({ adminId: admin.id, action: "RESOLVE_REPORT", targetType: "REPORT", targetId: reportId, reason });
  redirect("/admin/reports");
}

export async function adminRejectReport(reportId: string, fd: FormData) {
  const admin = await adminActor();
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Report dismissed";
  await db.report.update({ where: { id: reportId }, data: { status: "REJECTED", resolvedAt: new Date(), resolvedBy: admin.id } });
  await logAdmin({ adminId: admin.id, action: "REJECT_REPORT", targetType: "REPORT", targetId: reportId, reason });
  redirect("/admin/reports");
}

export async function adminRemovePostFromReport(reportId: string, fd: FormData) {
  const admin = await adminActor();
  const report = await db.report.findUnique({ where: { id: reportId }, select: { id: true, itemId: true } });
  if (!report) throw new Error("NOT_FOUND");
  const reason = String(fd.get("reason") ?? "No reason given").trim() || "Content removed by administrator";
  if (report.itemId) {
    await db.item.update({ where: { id: report.itemId }, data: { status: "REMOVED" } });
  }
  await db.report.update({ where: { id: reportId }, data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: admin.id } });
  await logAdmin({ adminId: admin.id, action: "DELETE_ITEM", targetType: "REPORT", targetId: reportId, reason });
  redirect("/admin/reports");
}

export async function adminBanReportedUser(reportId: string, fd: FormData) {
  const admin = await adminActor();
  const report = await db.report.findUnique({ where: { id: reportId }, select: { id: true, reportedUserId: true, itemId: true } });
  if (!report) throw new Error("NOT_FOUND");
  const userId =
    report.reportedUserId ??
    (report.itemId ? (await db.item.findUnique({ where: { id: report.itemId }, select: { ownerId: true } }))?.ownerId : null);
  if (userId && userId !== admin.id) {
    const reason = String(fd.get("reason") ?? "No reason given").trim() || "Banned following a report";
    await db.user.update({ where: { id: userId }, data: { status: "BANNED", role: "SUSPENDED" } });
    await db.ban.create({ data: { userId, adminId: admin.id, action: "BAN", reason } });
    await db.notification.create({
      data: { userId, title: "Account banned", body: `Your account has been banned following a moderation report. Reason: ${reason}` },
    });
    await logAdmin({ adminId: admin.id, action: "BAN", targetType: "USER", targetId: userId, reason });
  }
  await db.report.update({ where: { id: reportId }, data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: admin.id } });
  redirect("/admin/reports");
}

// =====================================================================
// PUBLIC: report another user (any signed-in user)
// =====================================================================

export async function reportUser(targetUserId: string, fd: FormData) {
  const user = await requireUser();
  if (user.id === targetUserId) throw new Error("FORBIDDEN");
  const reason = String(fd.get("reason") ?? "").trim();
  const details = String(fd.get("details") ?? "").trim();
  const valid = ["FAKE_LISTING", "SCAM", "HARASSMENT", "STOLEN", "INAPPROPRIATE", "SPAM", "SUSPICIOUS"] as const;
  if (!valid.includes(reason as (typeof valid)[number])) throw new Error("Invalid reason");
  const target = await db.user.findUnique({ where: { id: targetUserId }, select: { id: true } });
  if (!target) throw new Error("NOT_FOUND");
  const existing = await db.report.findFirst({ where: { reporterId: user.id, reportedUserId: targetUserId } });
  if (existing) throw new Error("You have already reported this user.");
  await db.report.create({ data: { reporterId: user.id, reportedUserId: targetUserId, reason: reason as ReportReason, details } });
  redirect(`/users/${targetUserId}?reported=1`);
}
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour
const RESET_COOLDOWN_MS = 1000 * 60 * 15; // 15 minutes

export type ResetState = FormState & { link?: string };

// Admin action: generate a single-use password-reset link for a customer.
// Passwords are bcrypt hashes, so they can never be shown; the only safe way to
// "recover" access is to issue a reset link. The link is emailed to the customer
// and also returned to the admin as a fallback.
export async function sendPasswordReset(
  userId: string,
  _prevState: ResetState,
  _fd: FormData,
): Promise<ResetState> {
  const admin = await requireUser();
  if (admin.role !== "ADMIN") throw new Error("FORBIDDEN");
  if (!isUuid(userId)) return { error: "Invalid account." };

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true },
  });
  if (!target) return { error: "Account not found." };

  const now = new Date();

  // Prevent spamming the same account with reset emails.
  const recent = await db.passwordReset.findFirst({
    where: {
      userId: target.id,
      usedAt: null,
      expiresAt: { gte: now },
      createdAt: { gte: new Date(Date.now() - RESET_COOLDOWN_MS) },
    },
    select: { id: true },
  });

  if (recent) {
    return { error: `A reset link was already sent recently for @${target.username}. Please wait before sending another.` };
  }

  // invalidate any outstanding reset tokens for this user
  await db.passwordReset.deleteMany({ where: { userId: target.id } });

  const token = randomUUID();
  await db.passwordReset.create({
    data: {
      tokenHash: sha256(token),
      userId: target.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail({ to: target.email, username: target.username, link });
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error.message : "Failed to send reset email.",
      link,
    };
  }

  return { success: `Reset link generated for @${target.username}.`, link };
}

// Public action (token-based): set a new password for the user identified by the token.
export async function resetPassword(_prevState: FormState, fd: FormData): Promise<FormState> {
  const token = (fd.get("token")?.toString() ?? "").trim();
  const password = fd.get("password")?.toString() ?? "";
  const parsed = z
    .object({ token: z.string().uuid(), password: z.string().min(8).max(72) })
    .safeParse({ token, password });
  if (!parsed.success) return { error: "This password-reset link is invalid or expired. Please request a new one." };

  const now = new Date();
  const row = await db.passwordReset.findFirst({
    where: { tokenHash: sha256(parsed.data.token), usedAt: null, expiresAt: { gte: now } },
    select: { id: true, userId: true },
  });
  if (!row) return { error: "This password-reset link is invalid or expired. Please request a new one." };

  await db.$transaction(async (tx) => {
    await tx.passwordReset.update({ where: { id: row.id }, data: { usedAt: now } });
    await tx.passwordReset.deleteMany({ where: { userId: row.userId } });
    await tx.user.update({
      where: { id: row.userId },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
    });
  });

  return { success: "Your password has been reset. You can now log in." };
}

// Public action: user requests a password reset via email.
// Returns generic success when the email is unknown to avoid enumeration.
// Returns a specific error only when the account exists but sending failed,
// so the user knows to try again later instead of waiting for nothing.
const RESET_GENERIC_SUCCESS =
  "If an account exists with that email, we've sent a password-reset link. Check your inbox and spam folder.";

export async function requestPasswordReset(_prevState: ResetState, fd: FormData): Promise<ResetState> {
  const email = (fd.get("email")?.toString() ?? "").trim().toLowerCase();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }

  if (!isAnyEmailConfigured()) {
    return {
      error:
        "Password reset email is not configured on this server. Ask an administrator to set DEV_EMAIL_MODE=true (dev), or configure SMTP/Gmail or Resend credentials.",
    };
  }

  const target = await db.user.findUnique({
    where: { email: parsed.data },
    select: { id: true, email: true, username: true },
  });

  if (!target) {
    if (process.env.NODE_ENV === "development") {
      return {
        error:
          "No account is registered with this email. Create an account with this address first, or use the email you used when you signed up.",
      };
    }
    return { success: RESET_GENERIC_SUCCESS };
  }

  const now = new Date();

  const recent = await db.passwordReset.findFirst({
    where: {
      userId: target.id,
      usedAt: null,
      expiresAt: { gte: now },
      createdAt: { gte: new Date(Date.now() - RESET_COOLDOWN_MS) },
    },
    select: { id: true },
  });

  if (recent) {
    return {
      success:
        "A reset link was already sent recently. Check your inbox and spam folder, or wait about 15 minutes before requesting another.",
    };
  }

  await db.passwordReset.deleteMany({ where: { userId: target.id } });

  const token = randomUUID();
  await db.passwordReset.create({
    data: {
      tokenHash: sha256(token),
      userId: target.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  let emailResult: "success" | "failed" = "success";
  let emailError: string | undefined;

  try {
    await sendPasswordResetEmail({ to: target.email, username: target.username, link });
  } catch (error: unknown) {
    emailResult = "failed";
    emailError = error instanceof Error ? error.message : "We couldn't send the reset email.";
  }

  if (shouldExposeResetLink()) {
    if (emailResult === "failed") {
      return {
        success:
          "Email couldn't be sent, but here's your reset link (development mode). Click the link below to reset your password.",
        link,
      };
    }
    return {
      success:
        "We sent a password-reset link to your email (and it's shown below for development). Check your inbox and spam folder — the link expires in 1 hour.",
      link,
    };
  }

  if (emailResult === "failed") {
    return { error: emailError ?? "We couldn't send the reset email. Please try again later." };
  }

  return {
    success:
      "We sent a password-reset link to your email. Check your inbox and spam folder — the link expires in 1 hour.",
  };
}

// ==============================
// Account Settings Actions
// ==============================

export type ProfileState = FormState & {
  avatarUrl?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  campus?: string | null;
  preferredProvince?: string | null;
  preferredCity?: string | null;
};

export async function updateProfile(_prev: ProfileState, fd: FormData): Promise<ProfileState> {
  const user = await requireUser();
  try {
    const displayName = fd.get("displayName")?.toString().trim();
    if (!displayName || displayName.length < 2) {
      return { error: "Display name must be at least 2 characters." };
    }
    if (displayName.length > 60) {
      return { error: "Display name must be 60 characters or less." };
    }
    const phoneRaw = fd.get("phoneNumber")?.toString().trim();
    const phoneNumber = phoneRaw && phoneRaw.length > 0 ? phoneRaw : null;
    if (phoneNumber && phoneNumber.length < 7) {
      return { error: "Please enter a valid phone number." };
    }
    const campusRaw = fd.get("campus")?.toString().trim();
    const campus = campusRaw && campusRaw.length > 0 ? campusRaw : null;
    const provinceRaw = fd.get("preferredProvince")?.toString().trim();
    const preferredProvince = provinceRaw && provinceRaw.length > 0 ? provinceRaw : null;
    const cityRaw = fd.get("preferredCity")?.toString().trim();
    const preferredCity = cityRaw && cityRaw.length > 0 ? cityRaw : null;
    const avatarRaw = fd.get("avatarUrl")?.toString().trim();
    const avatarUrl = avatarRaw && avatarRaw.length > 0 ? avatarRaw : null;

    const updated = await db.user.update({
      where: { id: user.id },
      data: { displayName, phoneNumber, campus, preferredProvince, preferredCity, avatarUrl },
    });

    return {
      success: "Profile updated successfully!",
      avatarUrl: updated.avatarUrl,
      displayName: updated.displayName,
      phoneNumber: updated.phoneNumber,
      campus: updated.campus,
      preferredProvince: updated.preferredProvince,
      preferredCity: updated.preferredCity,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update profile." };
  }
}

export async function changePassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  try {
    const currentPassword = fd.get("currentPassword")?.toString() ?? "";
    const newPassword = fd.get("newPassword")?.toString() ?? "";
    const confirmPassword = fd.get("confirmPassword")?.toString() ?? "";
    if (!currentPassword || currentPassword.length < 8) {
      return { error: "Please enter your current password." };
    }
    if (!newPassword || newPassword.length < 8) {
      return { error: "New password must be at least 8 characters." };
    }
    if (newPassword.length > 72) {
      return { error: "New password must be 72 characters or less." };
    }
    if (newPassword !== confirmPassword) {
      return { error: "New passwords do not match." };
    }
    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return { error: "User not found." };
    const ok = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!ok) return { error: "Current password is incorrect." };
    if (newPassword === currentPassword) {
      return { error: "New password cannot be the same as your current password." };
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
    return { success: "Password changed successfully." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to change password." };
  }
}

export type NotificationPrefs = {
  notifyOnCommentEmail: boolean;
  notifyOnCommentInApp: boolean;
  notifyOnClaimEmail: boolean;
  notifyOnClaimInApp: boolean;
  notifyOnMessageEmail: boolean;
  notifyOnMessageInApp: boolean;
};

export type NotifState = FormState & Partial<NotificationPrefs>;

export async function updateNotificationPrefs(_prev: NotifState, fd: FormData): Promise<NotifState> {
  const user = await requireUser();
  try {
    const on = (key: string) => (fd.get(key)?.toString() === "1" ? true : false);
    const prefs = {
      notifyOnCommentEmail: on("notifyOnCommentEmail"),
      notifyOnCommentInApp: on("notifyOnCommentInApp"),
      notifyOnClaimEmail: on("notifyOnClaimEmail"),
      notifyOnClaimInApp: on("notifyOnClaimInApp"),
      notifyOnMessageEmail: on("notifyOnMessageEmail"),
      notifyOnMessageInApp: on("notifyOnMessageInApp"),
    };
    await db.user.update({ where: { id: user.id }, data: prefs });
    return { success: "Notification preferences saved.", ...prefs };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save preferences." };
  }
}

export async function markItemResolved(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  try {
    const itemId = fd.get("itemId")?.toString();
    if (!itemId) return { error: "Missing item id." };
    const item = await db.item.findFirst({ where: { id: itemId, ownerId: user.id } });
    if (!item) return { error: "Item not found." };
    await db.item.update({ where: { id: item.id }, data: { status: "RESOLVED" } });
    return { success: "Item marked as resolved. Great news!" };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update item." };
  }
}

export async function createItemReport(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const user = await requireUser();
    const typeRaw = fd.get("type")?.toString().toUpperCase();
    if (typeRaw !== "LOST" && typeRaw !== "FOUND") return { error: "Invalid item type." };
    const categoryId = fd.get("categoryId")?.toString();
    if (!categoryId) return { error: "Please select a category." };
    const title = fd.get("title")?.toString().trim();
    if (!title || title.length < 5) return { error: "Title must be at least 5 characters." };
    if (title.length > 100) return { error: "Title must be 100 characters or less." };
    const description = fd.get("description")?.toString().trim();
    if (!description || description.length < 20) return { error: "Please provide a more detailed description (at least 20 characters)." };

    const province = fd.get("province")?.toString().trim();
    const city = fd.get("city")?.toString().trim();
    if (!province || !city) return { error: "Province and city are required." };

    const dateStr = fd.get("dateOccurred")?.toString();
    const timeStr = fd.get("timeOccurred")?.toString() ?? "12:00";
    if (!dateStr) return { error: "Please select the date." };
    const dateOccurred = new Date(`${dateStr}T${timeStr}`);
    if (Number.isNaN(dateOccurred.getTime())) return { error: "Invalid date/time." };
    if (dateOccurred > new Date()) return { error: "Date cannot be in the future." };

    const brand = fd.get("brand")?.toString().trim() || null;
    const color = fd.get("color")?.toString().trim() || null;
    const serialNumber = fd.get("serialNumber")?.toString().trim() || null;
    const distinguishingFeatures = fd.get("distinguishingFeatures")?.toString().trim() || null;
    const barangay = fd.get("barangay")?.toString().trim() || null;
    const approximateLocation = fd.get("approximateLocation")?.toString().trim();
    if (!approximateLocation || approximateLocation.length < 5) {
      return { error: "Please describe the approximate location." };
    }
    const reward = fd.get("reward")?.toString().trim() || null;

    const latRaw = fd.get("latitude")?.toString();
    const lngRaw = fd.get("longitude")?.toString();
    const latitude = latRaw && !Number.isNaN(Number(latRaw)) ? Number(latRaw) : null;
    const longitude = lngRaw && !Number.isNaN(Number(lngRaw)) ? Number(lngRaw) : null;

    const cat = await db.category.findUnique({ where: { id: categoryId } });
    if (!cat) return { error: "Invalid category." };

    const item = await db.item.create({
      data: {
        ownerId: user.id,
        categoryId,
        type: typeRaw,
        title,
        description,
        province,
        city,
        barangay,
        approximateLocation,
        dateOccurred,
        brand,
        color,
        serialNumber,
        distinguishingFeatures,
        reward,
        latitude,
        longitude,
      },
    });

    const files = fd.getAll("images").filter((v): v is File => v instanceof File && v.size > 0);
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (files.length > 5) return { error: "You can upload a maximum of 5 images." };
    if (files.some((f) => f.size > 5 * 1024 * 1024 || !allowed.has(f.type))) {
      return { error: "Images must be JPG, PNG, or WebP and no larger than 5 MB each." };
    }

    if (files.length) {
      const urls = await Promise.all(
        files.map(async (file) => {
          return saveUploadedFile(file);
        }),
      );
      for (const url of urls) {
        await db.itemImage.create({ data: { itemId: item.id, url, alt: `${title} image` } });
      }
    }

    const imagesJson = fd.get("imageUrls")?.toString();
    if (imagesJson) {
      try {
        const urls = JSON.parse(imagesJson) as string[];
        if (Array.isArray(urls) && urls.length > 0) {
          for (const url of urls) {
            if (typeof url === "string" && url.length > 0 && !url.startsWith("blob:")) {
              await db.itemImage.create({
                data: { itemId: item.id, url, alt: `${title} image` },
              });
            }
          }
        }
      } catch {
        // ignore bad images json
      }
    }
    redirect(`/items/${item.id}`);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { error: err instanceof Error ? err.message : "Failed to create report." };
  }
}
