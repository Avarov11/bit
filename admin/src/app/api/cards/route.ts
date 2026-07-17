import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const BUCKET = "cards";

async function ensureBucket(supabase: ReturnType<typeof getAdmin>) {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error && !error.message.includes("already exists") && !error.message.includes("23505")) throw error;
}

export async function GET() {
  const supabase = getAdmin();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list("", { limit: 200, sortBy: { column: "name", order: "asc" } });
  if (error) return NextResponse.json([]);
  const cards = (data ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder" && f.id)
    .map((f) => {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
      return { name: f.name, url: urlData.publicUrl };
    });
  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const supabase  = getAdmin();
  await ensureBucket(supabase);
  const formData  = await req.formData();
  const files     = formData.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

  const uploaded: string[] = [];
  const errors:   string[] = [];
  for (const file of files) {
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from(BUCKET).upload(safeName, file, { contentType: file.type });
    if (error) errors.push(`${file.name}: ${error.message}`);
    else uploaded.push(safeName);
  }
  return NextResponse.json({ uploaded, errors });
}

export async function DELETE(req: Request) {
  const { name } = await req.json();
  const supabase  = getAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([name]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
