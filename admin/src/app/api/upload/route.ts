import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = getAdmin();

  const { error } = await supabase.storage
    .from("products")
    .upload(filename, file, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from("products").getPublicUrl(filename);

  return NextResponse.json({ url: data.publicUrl });
}
