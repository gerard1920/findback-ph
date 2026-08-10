"use server";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { authSchema, itemSchema } from "@/lib/validation";
import { z } from "zod";
import { clearSession, currentUser, requireUser, setSession } from "@/lib/auth";
import { generateMatches } from "@/lib/matching";
import { isUuid, sha256 } from "@/lib/crypto";
import { sendPasswordResetEmail } from "@/lib/mail";
export type FormState={error?:string;success?:string};
export async function register(_:FormState,fd:FormData):Promise<FormState>{const parsed=authSchema.safeParse(Object.fromEntries(fd));if(!parsed.success||!parsed.data.displayName)return{error:"Enter a valid name, email, and password (8+ characters)."};const email=parsed.data.email.toLowerCase();const username=email.split("@")[0].replace(/[^a-z0-9]/g,"").slice(0,16)+Math.floor(Math.random()*9999);try{const user=await db.user.create({data:{email,passwordHash:await bcrypt.hash(parsed.data.password,12),displayName:parsed.data.displayName,username}});await setSession(user.id)}catch{return{error:"An account already exists with that email."}}redirect("/dashboard")}
export async function login(_:FormState,fd:FormData):Promise<FormState>{const parsed=authSchema.safeParse(Object.fromEntries(fd));if(!parsed.success)return{error:"Enter a valid email and password."};const user=await db.user.findUnique({where:{email:parsed.data.email.toLowerCase()}});if(!user||!await bcrypt.compare(parsed.data.password,user.passwordHash))return{error:"Incorrect email or password."};if(user.role==="SUSPENDED")return{error:"This account is suspended."};await setSession(user.id);redirect("/dashboard")}
export async function logout(){await clearSession();redirect("/")}
export async function createItem(type:"LOST"|"FOUND",_:FormState,fd:FormData):Promise<FormState>{const user=await requireUser();const parsed=itemSchema.safeParse(Object.fromEntries(fd));if(!parsed.success)return{error:"Please complete all required fields correctly."};const files=fd.getAll("images").filter((v):v is File=>v instanceof File&&v.size>0);const allowed=new Set(["image/jpeg","image/png","image/webp"]);if(files.length>5)return{error:"You can upload a maximum of 5 images."};if(files.some(f=>f.size>5*1024*1024||!allowed.has(f.type)))return{error:"Images must be JPG, PNG, or WebP and no larger than 5 MB each."};const data=parsed.data;const item=await db.item.create({data:{...data,type,ownerId:user.id,privateSerial:data.privateSerial||null,brand:data.brand||null,color:data.color||null,barangay:data.barangay||null,distinguishingFeatures:data.distinguishingFeatures||null,reward:data.reward||null,privateProof:data.privateProof||null}});if(files.length){const uploadDir=path.join(process.cwd(),"public","uploads");await mkdir(uploadDir,{recursive:true});const urls=await Promise.all(files.map(async file=>{const extension=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";const name=`${randomUUID()}.${extension}`;await writeFile(path.join(uploadDir,name),Buffer.from(await file.arrayBuffer()));return `/uploads/${name}`}));await db.itemImage.createMany({data:urls.map(url=>({itemId:item.id,url,alt:item.title}))})}await generateMatches(item.id);redirect(`/items/${item.id}`)}
export async function saveItem(itemId:string){const user=await requireUser();await db.savedItem.upsert({where:{userId_itemId:{userId:user.id,itemId}},create:{userId:user.id,itemId},update:{}})}
export async function reportItem(itemId:string,reason:string){const user=await requireUser();const valid=["FAKE_LISTING","SCAM","HARASSMENT","STOLEN","INAPPROPRIATE","SPAM","SUSPICIOUS"] as const;if(!valid.includes(reason as typeof valid[number]))throw new Error("Invalid reason");await db.report.create({data:{itemId,reporterId:user.id,reason:reason as typeof valid[number]}})}
export async function startConversation(itemId:string){const user=await currentUser();if(!user)redirect("/login");const item=await db.item.findUnique({where:{id:itemId},select:{id:true,ownerId:true,status:true}});if(!item||item.ownerId===user.id||item.status==="RESOLVED"||item.status==="REMOVED")redirect(`/items/${itemId}`);const [a,b]=[user.id,item.ownerId].sort();const existing=await db.conversation.findUnique({where:{itemId_participantAId_participantBId:{itemId:item.id,participantAId:a,participantBId:b}}});if(existing)redirect(`/messages/${existing.id}`);const conversation=await db.conversation.create({data:{itemId:item.id,participantAId:a,participantBId:b}});redirect(`/messages/${conversation.id}`)}
export async function sendMessage(conversationId:string,fd:FormData){const user=await requireUser();const conversation=await db.conversation.findUnique({where:{id:conversationId}});if(!conversation||(conversation.participantAId!==user.id&&conversation.participantBId!==user.id))throw new Error("UNAUTHORIZED");const body=String(fd.get("body")||"").trim();if(!body)redirect(`/messages/${conversationId}`);if(body.length>2000)throw new Error("Message too long");await db.message.create({data:{conversationId,senderId:user.id,body}});const otherId=conversation.participantAId===user.id?conversation.participantBId:conversation.participantAId;await db.notification.create({data:{userId:otherId,title:"New message",body:`${user.displayName} sent you a message.`,link:`/messages/${conversationId}`}});redirect(`/messages/${conversationId}`)}
export async function unsaveItem(itemId:string){const user=await requireUser();await db.savedItem.deleteMany({where:{userId:user.id,itemId}})}
export async function claimItem(itemId:string,fd:FormData){const user=await requireUser();const item=await db.item.findUnique({where:{id:itemId},select:{id:true,type:true,status:true,ownerId:true,title:true}});const answer=String(fd.get("answer")||"").trim();if(!item||item.type!=="FOUND"||item.ownerId===user.id||!["ACTIVE","MATCHED"].includes(item.status)||answer.length<10||answer.length>1000)redirect(`/items/${itemId}`);const dup=await db.claim.findFirst({where:{itemId:item.id,claimantId:user.id,status:{in:["PENDING","UNDER_REVIEW","APPROVED"]}}});if(!dup){await db.claim.create({data:{itemId:item.id,claimantId:user.id,verificationAnswer:answer}});await db.notification.create({data:{userId:item.ownerId,title:"New ownership claim",body:`${user.displayName} submitted a claim for ${item.title}.`,link:"/dashboard/claims"}})}redirect(`/items/${itemId}`)}
export async function updateItem(itemId:string,_:FormState,fd:FormData):Promise<FormState>{const user=await requireUser();const item=await db.item.findUnique({where:{id:itemId}});if(!item||item.ownerId!==user.id)return{error:"You can only edit reports you own."};const parsed=itemSchema.safeParse(Object.fromEntries(fd));if(!parsed.success)return{error:"Please complete all required fields correctly."};const files=fd.getAll("images").filter((v):v is File=>v instanceof File&&v.size>0);const allowed=new Set(["image/jpeg","image/png","image/webp"]);if(files.length>5)return{error:"You can upload a maximum of 5 images."};if(files.some(f=>f.size>5*1024*1024||!allowed.has(f.type)))return{error:"Images must be JPG, PNG, or WebP and no larger than 5 MB each."};const removeIds=fd.getAll("removeImage").filter((v):v is string=>typeof v==="string");const data=parsed.data;await db.item.update({where:{id:item.id},data:{...data,privateSerial:data.privateSerial||null,brand:data.brand||null,color:data.color||null,barangay:data.barangay||null,distinguishingFeatures:data.distinguishingFeatures||null,privateProof:data.privateProof||null,reward:data.reward||null}});if(removeIds.length)await db.itemImage.deleteMany({where:{id:{in:removeIds},itemId:item.id}});if(files.length){const uploadDir=path.join(process.cwd(),"public","uploads");await mkdir(uploadDir,{recursive:true});const urls=await Promise.all(files.map(async file=>{const extension=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";const name=`${randomUUID()}.${extension}`;await writeFile(path.join(uploadDir,name),Buffer.from(await file.arrayBuffer()));return `/uploads/${name}`}));await db.itemImage.createMany({data:urls.map(url=>({itemId:item.id,url,alt:data.title}))})}await generateMatches(item.id);redirect(`/items/${item.id}`)}
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
  const recent = await (db as any).passwordReset.findFirst({
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
  await (db as any).passwordReset.deleteMany({ where: { userId: target.id } });

  const token = randomUUID();
  await (db as any).passwordReset.create({
    data: {
      tokenHash: sha256(token),
      userId: target.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail({ to: target.email, username: target.username, link });
  } catch (error: any) {
    return { error: error?.message ?? "Failed to send reset email." };
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
  const row = await (db as any).passwordReset.findFirst({
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
export async function requestPasswordReset(_prevState: FormState, fd: FormData): Promise<FormState> {
  const email = (fd.get("email")?.toString() ?? "").trim().toLowerCase();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }

  const target = await db.user.findUnique({
    where: { email: parsed.data },
    select: { id: true, email: true, username: true },
  });

  if (!target) {
    return { success: "If an account exists with that email, we&apos;ve sent a password-reset link." };
  }

  const now = new Date();

  const recent = await (db as any).passwordReset.findFirst({
    where: {
      userId: target.id,
      usedAt: null,
      expiresAt: { gte: now },
      createdAt: { gte: new Date(Date.now() - RESET_COOLDOWN_MS) },
    },
    select: { id: true },
  });

  if (recent) {
    return { success: "If an account exists with that email, we&apos;ve sent a password-reset link." };
  }

  await (db as any).passwordReset.deleteMany({ where: { userId: target.id } });

  const token = randomUUID();
  await (db as any).passwordReset.create({
    data: {
      tokenHash: sha256(token),
      userId: target.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail({ to: target.email, username: target.username, link });
  } catch (error: any) {
    return { error: error?.message ?? "We couldn&apos;t send the reset email. Please try again later." };
  }

  return { success: "If an account exists with that email, we&apos;ve sent a password-reset link." };
}
