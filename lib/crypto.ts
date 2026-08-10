import { createHash } from "crypto";

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
