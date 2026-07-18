import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } }
  );

  const { data } = await supabase
    .from("site_settings")
    .select("key, value");

  const settings: Record<string, string> = {};
  for (const row of data ?? []) settings[row.key] = row.value;

  return NextResponse.json(settings, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
