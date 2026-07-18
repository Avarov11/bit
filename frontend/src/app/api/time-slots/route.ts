import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

function getAnon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: "no-store" }) } }
  );
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const date = new URL(req.url).searchParams.get("date");
  const anon = getAnon();

  const [slotsRes, settingRes] = await Promise.all([
    anon.from("time_slots").select("*").eq("active", true).order("sort_order", { ascending: true }),
    anon.from("site_settings").select("value").eq("key", "max_orders_per_day").single(),
  ]);

  const slots    = slotsRes.data ?? [];
  const maxPerDay = parseInt(settingRes.data?.value ?? "50");

  if (!date) {
    return NextResponse.json(
      { slots, maxPerDay },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // Count orders per slot for this date (exclude cancelled)
  const { data: orders } = await getAdmin()
    .from("orders")
    .select("pickup_time")
    .eq("pickup_date", date)
    .neq("status", "cancelled");

  const countMap: Record<string, number> = {};
  for (const o of orders ?? []) {
    countMap[o.pickup_time] = (countMap[o.pickup_time] ?? 0) + 1;
  }
  const totalForDay = Object.values(countMap).reduce((s, n) => s + n, 0);
  const dayFull     = totalForDay >= maxPerDay;

  const slotsWithCounts = slots.map(s => ({
    ...s,
    booked: countMap[s.label] ?? 0,
    full:   dayFull || (countMap[s.label] ?? 0) >= s.max_orders,
  }));

  return NextResponse.json(
    { slots: slotsWithCounts, maxPerDay, totalForDay, dayFull },
    { headers: { "Cache-Control": "no-store" } }
  );
}
