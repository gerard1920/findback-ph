import { z } from "zod";
export const loginSchema=z.object({email:z.string().email(),password:z.string().min(8).max(72)});
const PHONE_RE = /^(\+?63|0)9\d{9}$/;
export const registerSchema=z.object({
  email:z.string().email(),
  password:z.string().min(8).max(72),
  displayName:z.string().min(2,"Name must be at least 2 characters").max(60,"Name must be 60 characters or less"),
  phoneNumber:z.string().max(15).optional().or(z.literal("")).transform(v=>v&&v.length>0?v:undefined).pipe(z.string().regex(PHONE_RE,"Use a valid PH number (09171234567).").optional()),
  campus:z.string().max(100).optional().or(z.literal("")).transform(v=>v&&v.length>0?v:undefined),
  preferredCity:z.string().max(60).optional().or(z.literal("")).transform(v=>v&&v.length>0?v:undefined),
  preferredProvince:z.string().max(60).optional().or(z.literal("")).transform(v=>v&&v.length>0?v:undefined),
});
export const authSchema=registerSchema.or(loginSchema);
export const itemSchema=z.object({title:z.string().min(3).max(120),categoryId:z.string().uuid(),brand:z.string().max(60).optional(),color:z.string().max(40).optional(),description:z.string().min(10).max(2000),distinguishingFeatures:z.string().max(1000).optional(),privateSerial:z.string().max(200).optional(),privateProof:z.string().max(2000).optional(),reward:z.string().max(100).optional(),province:z.string().min(2).max(80),city:z.string().min(2).max(80),barangay:z.string().max(80).optional(),approximateLocation:z.string().min(2).max(160),dateOccurred:z.coerce.date()}).passthrough();
