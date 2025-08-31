// app/api/applications/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { ApplicationRecord } from "@/features/faculty/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dataDirectoryPath = path.join(process.cwd(), "data");
const dbFilePath = path.join(dataDirectoryPath, "applications.json");

async function ensureStore(): Promise<{ applications: ApplicationRecord[] }> {
  await fs.mkdir(dataDirectoryPath, { recursive: true });
  try {
    const raw = await fs.readFile(dbFilePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.applications)) throw new Error("bad db");
    return parsed;
  } catch {
    const seed = { applications: [] as ApplicationRecord[] };
    await fs.writeFile(dbFilePath, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

async function saveStore(store: { applications: ApplicationRecord[] }) {
  const tmp = dbFilePath + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmp, dbFilePath);
}

export async function GET() {
  const store = await ensureStore();
  return NextResponse.json(store.applications);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const applicantFullName: string = body?.applicantFullName ?? body?.fullName ?? "";
    const intendedProgram: string = body?.intendedProgram ?? "";
    if (!applicantFullName || !intendedProgram) {
      return NextResponse.json(
        { ok: false, error: "Missing applicantFullName or intendedProgram" },
        { status: 400 },
      );
    }

    const nowIso = new Date().toISOString();

    // normalize docs to string[] of absolute/relative URLs
    const documentUrls: string[] = Array.isArray(body?.uploadedDocumentUrls)
      ? body.uploadedDocumentUrls.filter((u: unknown) => typeof u === "string")
      : [];

    const newRecord: ApplicationRecord = {
      id: crypto.randomUUID(),
      applicantFullName,
      intendedProgram,
      submittedAtIso: nowIso,
      status: "Pending",
      emailAddress: body?.emailAddress ?? "",
      phoneNumber: body?.phoneNumber ?? "",
      dateOfBirth: body?.dateOfBirth ?? "",
      highSchoolName: body?.highSchoolName ?? "",
      gpaScore: Number(body?.gpaScore ?? 0),
      graduationYear: Number(body?.graduationYear ?? 0),
      intakeSeason: body?.intakeSeason ?? "",
      hasScholarshipInterest: Boolean(body?.hasScholarshipInterest ?? false),
      uploadedDocumentUrls: documentUrls,
    };

    const store = await ensureStore();
    store.applications.unshift(newRecord); // newest first
    await saveStore(store);

    return NextResponse.json({ ok: true, record: newRecord }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Failed to create application" },
      { status: 500 },
    );
  }
}
