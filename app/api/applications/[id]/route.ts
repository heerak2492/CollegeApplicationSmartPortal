// app/api/applications/[id]/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const store = await ensureStore();
    const index = store.applications.findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const allowedKeys: (keyof ApplicationRecord)[] = [
      "status",
      "applicantFullName",
      "intendedProgram",
      "emailAddress",
      "phoneNumber",
      "dateOfBirth",
      "highSchoolName",
      "gpaScore",
      "graduationYear",
      "intakeSeason",
      "hasScholarshipInterest",
    ];

    const updated = { ...store.applications[index] };
    for (const k of allowedKeys) {
      if (k in body) (updated as any)[k] = body[k];
    }

    store.applications[index] = updated;
    await saveStore(store);

    return NextResponse.json({ ok: true, record: updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Failed to update" },
      { status: 500 },
    );
  }
}
