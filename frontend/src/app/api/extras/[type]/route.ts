import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: { type: string } }) {
  const bucket = params.type;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } }
  );

  const [storageRes, hiddenRes] = await Promise.all([
    supabase.storage.from(bucket).list("", { limit: 200, sortBy: { column: "name", order: "asc" } }),
    supabase.from("extras_hidden").select("name").eq("type", bucket),
  ]);

  if (storageRes.error) return NextResponse.json([]);

  const hiddenNames = new Set((hiddenRes.data ?? []).map(r => r.name));
  const items = (storageRes.data ?? [])
    .filter(f => f.name !== ".emptyFolderPlaceholder" && f.id && !hiddenNames.has(f.name))
    .map(f => {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(f.name);
      return { name: f.name, url: urlData.publicUrl };
    });

  return NextResponse.json(items, { headers: { "Cache-Control": "no-store" } });
}
