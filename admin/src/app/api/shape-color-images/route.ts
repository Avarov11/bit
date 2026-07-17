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
  const { data, error } = await sb
    .from("shape_color_images")
    .select("color, view_index, filename")
    .eq("shape", shape)
    .order("color").order("view_index");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map(row => {
    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(row.filename ?? "");
    return { color: row.color, view_index: row.view_index, filename: row.filename, url: row.filename ? urlData.publicUrl : null };
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const formData  = await req.formData();
  const shape     = formData.get("shape") as string;
  const color     = formData.get("color") as string;
  const viewIndex = parseInt(formData.get("view_index") as string, 10);
  const file      = formData.get("file") as File;

  if (!shape || !color || isNaN(viewIndex) || !file)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const bucket = BUCKETS[shape];
  if (!bucket) return NextResponse.json({ error: "Unknown shape" }, { status: 400 });

  const sb  = getAdmin();
  const ext = file.name.split(".").pop() ?? "png";
  const filename = `${shape}_${color}_${viewIndex}_${Date.now()}.${ext}`;

  const { error: uploadErr } = await sb.storage
    .from(bucket)
    .upload(filename, file, { contentType: file.type, upsert: true });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { error: dbErr } = await sb.from("shape_color_images").upsert(
    { shape, color, view_index: viewIndex, filename, updated_at: new Date().toISOString() },
    { onConflict: "shape,color,view_index" }
  );

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  const { data: urlData } = sb.storage.from(bucket).getPublicUrl(filename);
  return NextResponse.json({ url: urlData.publicUrl, filename });
}

export async function DELETE(req: NextRequest) {
  const { shape, color, view_index } = await req.json();
  const bucket = BUCKETS[shape];
  if (!bucket) return NextResponse.json({ error: "Unknown shape" }, { status: 400 });

  const sb = getAdmin();

  const { data: existing } = await sb.from("shape_color_images")
    .select("filename")
    .eq("shape", shape).eq("color", color).eq("view_index", view_index)
    .single();

  if (existing?.filename) {
    await sb.storage.from(bucket).remove([existing.filename]);
  }

  const { error } = await sb.from("shape_color_images")
    .delete()
    .eq("shape", shape).eq("color", color).eq("view_index", view_index);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
