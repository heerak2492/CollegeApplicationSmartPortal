// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs"; // enable Node APIs (fs)
export const dynamic = "force-dynamic"; // don't pre-render this route

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = ["application/pdf"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Accept either one "file" or many "files"
    const many = formData.getAll("files");
    const single = formData.get("file");

    const files: File[] = (many.length ? many : single ? [single] : []).filter(
      (f): f is File => f instanceof File,
    );

    if (files.length === 0) {
      return NextResponse.json({ ok: false, error: "No files provided." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const savedUrls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_MIME.includes(file.type)) {
        return NextResponse.json(
          { ok: false, error: "Only PDF files are allowed." },
          { status: 415 },
        );
      }

      const data = await file.arrayBuffer();
      if (data.byteLength > MAX_BYTES) {
        return NextResponse.json(
          { ok: false, error: "File too large (max 10MB)." },
          { status: 413 },
        );
      }

      const buffer = Buffer.from(data);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}_${safeName}`;
      const filepath = path.join(uploadDir, filename);

      await fs.writeFile(filepath, buffer);
      savedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ ok: true, fileUrls: savedUrls }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Upload failed. Try again." },
      { status: 500 },
    );
  }
}
