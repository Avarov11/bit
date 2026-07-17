import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const url =
    `${base}/rest/v1/categories` +
    `?select=id,name,parent,sort_order,badge_bg,badge_text,filter_mode` +
    `&is_active=eq.true` +
    `&order=sort_order.asc`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!res.ok) return NextResponse.json([]);
  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : [], {
    headers: { "Cache-Control": "no-store" },
  });
}
