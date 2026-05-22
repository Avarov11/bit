import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("customizer_pricing")
    .select("key, label, price")
    .order("sort");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pricing: Record<string, number> = {};
  for (const row of data ?? []) {
    pricing[row.key] = Number(row.price);
  }

  return NextResponse.json(pricing);
}
