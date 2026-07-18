import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function bucketName(categoryId: string) {
  return `cat-${categoryId.replace(/-/g, "").slice(0, 20)}`;
}

async function ensureBucket(supabase: ReturnType<typeof getAdmin>, name: string) {
  const { error } = await supabase.storage.createBucket(name, { public: true });
  if (error && !error.message.includes("already exists") && !error.message.includes("23505")) {
    throw error;
  }
}

export async function POST(req: Request) {
  const formData   = await req.formData();
  const file       = formData.get("file") as File | null;
  const categoryId = formData.get("categoryId") as string | null;

  if (!file || !categoryId) {
    return NextResponse.json({ error: "file and categoryId required" }, { status: 400 });
  }

  const supabase = getAdmin();
  const bucket   = bucketName(categoryId);

  await ensureBucket(supabase, bucket);

  const ext      = file.name.split(".").pop() ?? "jpg";
  const filename = `cover.${ext}`;

  // Remove old file first (ignore errors)
  await supabase.storage.from(bucket).remove([filename]);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);
  const url = `${urlData.publicUrl}?t=${Date.now()}`;

  // Persist url on the category row
  await supabase.from("categories").update({ image_url: url }).eq("id", categoryId);

  return NextResponse.json({ url });
}

export async function DELETE(req: Request) {
  const { categoryId } = await req.json();
  if (!categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });

  const supabase = getAdmin();
  const bucket   = bucketName(categoryId);

  // Remove image file and clear DB field
  await supabase.storage.from(bucket).remove(["cover.jpg", "cover.png", "cover.webp", "cover.jpeg"]);
  await supabase.from("categories").update({ image_url: null }).eq("id", categoryId);

  return NextResponse.json({ success: true });
}
