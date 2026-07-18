import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const REVENUE_STATUSES = ["paid", "confirmed", "preparing", "ready", "delivered", "pending"];

export async function GET() {
  const { data, error } = await getAdmin()
    .from("orders")
    .select("customer_name, customer_phone, total, status")
    .in("status", REVENUE_STATUSES);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map = new Map<string, { name: string; phone: string; orders: number; total: number }>();
  for (const o of data ?? []) {
    const key = o.customer_phone ?? "";
    if (!key) continue;
    const entry = map.get(key);
    if (entry) {
      entry.orders++;
      entry.total += Number(o.total);
      entry.name = o.customer_name; // keep most recent name
    } else {
      map.set(key, { name: o.customer_name, phone: key, orders: 1, total: Number(o.total) });
    }
  }

  const result = Array.from(map.values()).sort((a, b) => b.total - a.total);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
