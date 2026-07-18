import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year  = parseInt(searchParams.get("year")  ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to   = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const sb = getAdmin();

  const [ordersRes, slotsRes, settingRes] = await Promise.all([
    sb.from("orders")
      .select("pickup_date, pickup_time, status")
      .gte("pickup_date", from)
      .lte("pickup_date", to)
      .neq("status", "cancelled"),
    sb.from("time_slots").select("label, max_orders").eq("active", true),
    sb.from("site_settings").select("value").eq("key", "max_orders_per_day").single(),
  ]);

  const maxPerDay = parseInt(settingRes.data?.value ?? "50");
  const slots = slotsRes.data ?? [];

  // Build map: date → { total, slots: { label → count } }
  const map: Record<string, { total: number; slots: Record<string, number> }> = {};
  for (const o of ordersRes.data ?? []) {
    if (!map[o.pickup_date]) map[o.pickup_date] = { total: 0, slots: {} };
    map[o.pickup_date].total++;
    map[o.pickup_date].slots[o.pickup_time] = (map[o.pickup_date].slots[o.pickup_time] ?? 0) + 1;
  }

  return NextResponse.json({ days: map, maxPerDay, slots });
}
