import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function saveUploadedFile(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
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
