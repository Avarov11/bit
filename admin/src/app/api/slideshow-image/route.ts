import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const BUCKET = "slideshow";

async function ensureBucket(supabase: ReturnType<typeof getAdmin>) {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error && !error.message.includes("already exists") && !error.message.includes("23505")) {
    throw error;
  }
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file     = formData.get("file")    as File | null;
  const slideId  = formData.get("slideId") as string | null;
  const type     = formData.get("type")    as "desktop" | "mobile" | null;

  if (!file || !slideId || !type) {
    return NextResponse.json({ error: "file, slideId and type required" }, { status: 400 });
  }

  const supabase = getAdmin();
  await ensureBucket(supabase);

  const ext    = file.name.split(".").pop() ?? "jpg";
  const prefix = slideId.replace(/-/g, "");
  const suffix = type === "desktop" ? "d" : "m";

  // Remove any existing file for this slide+type
  const { data: files } = await supabase.storage.from(BUCKET).list("", { limit: 1000 });
  const toDelete = (files ?? []).filter(f => f.name.startsWith(`${prefix}-${suffix}.`));
  if (toDelete.length) {
    await supabase.storage.from(BUCKET).remove(toDelete.map(f => f.name));
  }

  const filename = `${prefix}-${suffix}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  const url = `${urlData.publicUrl}?t=${Date.now()}`;

  const column = type === "desktop" ? "desktop_url" : "mobile_url";
  await supabase.from("slideshow").update({ [column]: url }).eq("id", slideId);

  return NextResponse.json({ url });
}

export async function DELETE(req: Request) {
  const { slideId, type } = await req.json();
  if (!slideId || !type) {
    return NextResponse.json({ error: "slideId and type required" }, { status: 400 });
  }

  const supabase = getAdmin();
  const prefix = slideId.replace(/-/g, "");
  const suffix = type === "desktop" ? "d" : "m";

  try {
    const { data: files } = await supabase.storage.from(BUCKET).list("", { limit: 1000 });
    const toDelete = (files ?? []).filter(f => f.name.startsWith(`${prefix}-${suffix}.`));
    if (toDelete.length) {
      await supabase.storage.from(BUCKET).remove(toDelete.map(f => f.name));
    }
  } catch {}

  const column = type === "desktop" ? "desktop_url" : "mobile_url";
  await supabase.from("slideshow").update({ [column]: null }).eq("id", slideId);

  return NextResponse.json({ success: true });
}
