import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SETTING_KEY = "extras_types";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } }
  );

  const { data } = await supabase.from("site_settings").select("value").eq("key", SETTING_KEY).single();
  if (!data?.value) return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });

  try {
    const types = JSON.parse(data.value);
    const active = Array.isArray(types) ? types.filter((t: { active: boolean }) => t.active) : [];
    return NextResponse.json(active, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
