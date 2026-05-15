import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file     = formData.get("file")   as File | null;
  const folder   = formData.get("folder") as string | null;

  if (!file)   return NextResponse.json({ error: "No file"   }, { status: 400 });
  if (!folder) return NextResponse.json({ error: "No folder" }, { status: 400 });

  const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path     = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const supabase = getAdmin();

  const { error } = await supabase.storage
    .from("orders")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from("orders").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
