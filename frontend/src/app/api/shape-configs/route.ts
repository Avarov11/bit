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

  const { data, error } = await supabase
    .from("shape_configs")
    .select("shape, max_chars, allowed_colors")
    .order("shape");

  if (error) console.error("[shape-configs]", error.message);
  return NextResponse.json(data ?? [], {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
