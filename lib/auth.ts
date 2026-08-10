import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
const key = new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-change-me-to-a-long-secret");
const cookieName = "findback_session";
export async function setSession(userId:string) { const token=await new SignJWT({userId}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(key); (await cookies()).set(cookieName,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:604800}); }
export async function clearSession(){ (await cookies()).delete(cookieName); }
export async function currentUser(){ try { const token=(await cookies()).get(cookieName)?.value; if(!token)return null; const {payload}=await jwtVerify(token,key); return await db.user.findUnique({where:{id:String(payload.userId)},select:{id:true,email:true,displayName:true,username:true,role:true}}); } catch{return null;} }
export async function requireUser(){const u=await currentUser();if(!u) throw new Error("UNAUTHORIZED");if(u.role==="SUSPENDED")throw new Error("SUSPENDED");return u;}
