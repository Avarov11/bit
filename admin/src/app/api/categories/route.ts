import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getAdmin()
    .from("products")
    .select("category")
    .order("category", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const seen = new Set<string>();
  const categories = (data ?? [])
    .map((r: { category: string }) => r.category)
    .filter((c: string) => { if (seen.has(c)) return false; seen.add(c); return true; });
  return NextResponse.json(categories);
}
