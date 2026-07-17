import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, parent, sort_order, badge_bg, badge_text, filter_mode")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json([]);
  return NextResponse.json(data ?? [], { headers: { "Cache-Control": "no-store" } });
}
