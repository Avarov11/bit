import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SETTING_KEY = "delivery_areas";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } }
  );

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", SETTING_KEY)
    .single();

  if (error || !data?.value) return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });

  try {
    const areas = JSON.parse(data.value);
    const active = Array.isArray(areas) ? areas.filter((a: { active: boolean }) => a.active) : [];
    return NextResponse.json(active, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
