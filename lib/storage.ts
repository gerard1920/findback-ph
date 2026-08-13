import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function saveUploadedFile(file: File): Promise<string> {
  if (!file.type || !ALLOWED_TYPES[file.type]) {
    throw new Error("Unsupported file type. Use JPG, PNG, WebP, or GIF.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File too large. Maximum 5 MB per image.");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = ALLOWED_TYPES[file.type];
  const filename = `${crypto.randomUUID()}.${extension}`;

  if (process.env.VERCEL === "1" && process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(filename, bytes, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}
