import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function bucketName(category: string) {
  return `${category} Sticker`;
}

async function ensureBucket(supabase: ReturnType<typeof getAdmin>, bucket: string) {
  const { error } = await supabase.storage.createBucket(bucket, { public: true });
  // error code 23505 = already exists — safe to ignore
  if (error && !error.message.includes("already exists") && !error.message.includes("23505")) {
    throw error;
  }
}

// ── GET: list stickers for a category ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "Birthday";
  const bucket   = bucketName(category);
  const supabase = getAdmin();

  const { data, error } = await supabase.storage
    .from(bucket)
    .list("", { limit: 200, sortBy: { column: "name", order: "asc" } });

  if (error) return NextResponse.json([]);

  const stickers = (data ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder" && f.id)
    .map((f) => {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(f.name);
      return { name: f.name, url: urlData.publicUrl };
    });

  return NextResponse.json(stickers);
}

// ── POST: upload sticker(s) to a category ─────────────────────────────────────
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const category = (formData.get("category") as string) ?? "Birthday";
  const bucket   = bucketName(category);
  const supabase = getAdmin();

  await ensureBucket(supabase, bucket);

  const files = formData.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "No files provided" }, { status: 400 });

  const uploaded: string[] = [];
  const errors:   string[] = [];

  for (const file of files) {
    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, { contentType: file.type, upsert: false });

    if (error) errors.push(`${file.name}: ${error.message}`);
    else uploaded.push(filename);
    void ext;
  }

  return NextResponse.json({ uploaded, errors });
}

// ── DELETE: remove a sticker ──────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const { category, name } = await req.json();
  const bucket   = bucketName(category);
  const supabase = getAdmin();

  const { error } = await supabase.storage.from(bucket).remove([name]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
