import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const BUCKET   = "hero";
const BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

export async function GET() {
  const supabase = getAdmin();
  const { data, error } = await supabase.storage.from(BUCKET).list("", { limit: 200 });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const images = (data ?? [])
    .filter(f => f.name !== ".emptyFolderPlaceholder" && /\.(jpe?g|png|webp|gif)$/i.test(f.name))
    .map(f => ({ name: f.name, url: `${BASE_URL}/${encodeURIComponent(f.name)}` }));

  return NextResponse.json(images);
}

export async function DELETE(req: Request) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const supabase = getAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([name]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
