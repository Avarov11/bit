import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function ensureBucket(supabase: ReturnType<typeof getAdmin>, bucket: string) {
  const { error } = await supabase.storage.createBucket(bucket, { public: true });
  if (error && !error.message.includes("already exists") && !error.message.includes("23505")) throw error;
}

export async function GET(_req: NextRequest, { params }: { params: { type: string } }) {
  const bucket = params.type;
  const supabase = getAdmin();
  const { data, error } = await supabase.storage
    .from(bucket)
    .list("", { limit: 200, sortBy: { column: "name", order: "asc" } });
  if (error) return NextResponse.json([]);
  const items = (data ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder" && f.id)
    .map((f) => {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(f.name);
      return { name: f.name, url: urlData.publicUrl };
    });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest, { params }: { params: { type: string } }) {
  const bucket = params.type;
  const supabase = getAdmin();
  await ensureBucket(supabase, bucket);
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

  const uploaded: string[] = [];
  const errors: string[] = [];
  for (const file of files) {
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from(bucket).upload(safeName, file, { contentType: file.type });
    if (error) errors.push(`${file.name}: ${error.message}`);
    else uploaded.push(safeName);
  }
  return NextResponse.json({ uploaded, errors });
}

export async function DELETE(req: NextRequest, { params }: { params: { type: string } }) {
  const bucket = params.type;
  const { name } = await req.json();
  const supabase = getAdmin();
  const { error } = await supabase.storage.from(bucket).remove([name]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
