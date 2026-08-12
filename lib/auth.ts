import type { Role, UserStatus } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
const key = new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-change-me-to-a-long-secret");
const cookieName = "findback_session";

function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return Promise.resolve(fn());
  } catch {
    return Promise.resolve(fallback);
  }
}

export async function setSession(userId:string) { const token=await new SignJWT({userId}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(key); (await cookies()).set(cookieName,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:604800}); }
export async function clearSession(){ (await cookies()).delete(cookieName); }
export async function currentUser(){ try { const token=(await cookies()).get(cookieName)?.value; if(!token)return null; const {payload}=await jwtVerify(token,key); const user = await db.user.findUnique({where:{id:String(payload.userId)},select:{id:true,email:true,displayName:true,username:true,avatarUrl:true,role:true,status:true}}); return user ?? null; } catch{return null;} }
export async function requireUser(){const u=await currentUser();if(!u) throw new Error("UNAUTHORIZED");if(u.status==="SUSPENDED"||u.status==="BANNED"||u.role==="SUSPENDED")throw new Error("SUSPENDED");return u;}

export type ActiveUser =
  | { ok: true; user: { id: string; email: string; displayName: string; username: string; role: Role; status: UserStatus } }
  | { ok: false; reason: "UNAUTHENTICATED" | "SUSPENDED" | "BANNED"; message: string };

export async function activeUser(): Promise<ActiveUser> {
  const u = await currentUser();
  if (!u) return { ok: false, reason: "UNAUTHENTICATED", message: "Please sign in to continue." };
  if (u.status === "SUSPENDED" || u.status === "BANNED" || u.role === "SUSPENDED") {
    const status: "SUSPENDED" | "BANNED" = u.status === "BANNED" ? "BANNED" : "SUSPENDED";
    const ban = await safe(
      () => db.ban.findFirst({
        where: { userId: u.id, action: { in: ["SUSPEND", "BAN"] }, liftedAt: null },
        orderBy: { createdAt: "desc" },
        select: { reason: true, action: true, createdAt: true },
      }),
      null
    );
    return {
      ok: false,
      reason: status,
      message: ban?.reason ?? "Your account access has been restricted by an administrator.",
    };
  }
  return { ok: true, user: u };
}
