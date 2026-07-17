import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const BUCKETS: Record<string, string> = {
  cake:   "shapes",
  heart:  "shapes heart",
  square: "shape square",
};

export async function GET(req: NextRequest) {
  const shape  = req.nextUrl.searchParams.get("shape") ?? "cake";
  const bucket = BUCKETS[shape];
  if (!bucket) return NextResponse.json({ error: "Unknown shape" }, { status: 400 });

  const sb = getAdmin();
  const { data, error } = await sb.storage
    .from(bucket)
    .list("", { limit: 200, sortBy: { column: "name", order: "asc" } });

  if (error) return NextResponse.json([]);

  const images = (data ?? [])
    .filter(f => f.name !== ".emptyFolderPlaceholder" && f.id)
    .map(f => {
      const { data: urlData } = sb.storage.from(bucket).getPublicUrl(f.name);
      return { name: f.name, url: urlData.publicUrl };
    });

  return NextResponse.json(images);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const shape    = (formData.get("shape") as string) ?? "cake";
  const bucket   = BUCKETS[shape];
  if (!bucket) return NextResponse.json({ error: "Unknown shape" }, { status: 400 });

  const files = formData.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

  const sb = getAdmin();
  const uploaded: string[] = [];
  const errors:   string[] = [];

  for (const file of files) {
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await sb.storage
      .from(bucket)
      .upload(safeName, file, { contentType: file.type, upsert: false });
    if (error) errors.push(`${file.name}: ${error.message}`);
    else uploaded.push(safeName);
  }

  return NextResponse.json({ uploaded, errors });
}

export async function DELETE(req: NextRequest) {
  const { shape, name } = await req.json();
  const bucket = BUCKETS[shape];
  if (!bucket) return NextResponse.json({ error: "Unknown shape" }, { status: 400 });

  const sb = getAdmin();
  const { error } = await sb.storage.from(bucket).remove([name]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
