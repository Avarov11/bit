import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const BUCKET   = "hero";
const FILENAME = "logo.png";

export async function GET() {
  const { data, error } = await getAdmin()
    .from("site_settings")
    .select("value")
    .eq("key", "logo_url")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ url: data?.value ?? null });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file     = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  const supabase = getAdmin();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(FILENAME, file, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(FILENAME);
  const url = `${urlData.publicUrl}?t=${Date.now()}`;

  await supabase.from("site_settings").upsert({ key: "logo_url", value: url });

  return NextResponse.json({ url });
}
