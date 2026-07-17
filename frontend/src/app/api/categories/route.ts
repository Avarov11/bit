import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options) =>
          fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, parent, sort_order, badge_bg, badge_text, filter_mode")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) console.error("[categories]", error.message);
  return NextResponse.json(data ?? [], {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
