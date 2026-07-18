import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } }
  );

  const [storageRes, hiddenRes] = await Promise.all([
    supabase.storage.from("cards").list("", { limit: 200, sortBy: { column: "name", order: "asc" } }),
    supabase.from("extras_hidden").select("name").eq("type", "cards"),
  ]);

  if (storageRes.error) return NextResponse.json([]);

  const hiddenNames = new Set((hiddenRes.data ?? []).map((r) => r.name));
  const cards = (storageRes.data ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder" && f.id && !hiddenNames.has(f.name))
    .map((f) => {
      const { data: urlData } = supabase.storage.from("cards").getPublicUrl(f.name);
      return { name: f.name, url: urlData.publicUrl };
    });

  return NextResponse.json(cards, { headers: { "Cache-Control": "no-store" } });
}
