import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/storage";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const _user = await requireUser();
    const formData = await request.formData();
    const files = formData.getAll("files").filter((v): v is File => v instanceof File && v.size > 0);

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    const urls: string[] = [];
    for (const file of files) {
      const url = await saveUploadedFile(file);
      urls.push(url);
    }

    return NextResponse.json({ urls });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}
