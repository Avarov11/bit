import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const admin = getAdmin();

  const [{ count: totalOrders }, { count: todayOrders }, { count: pendingOrders }, { data: revenue }] =
    await Promise.all([
      admin.from("orders").select("*", { count: "exact", head: true }),
      admin.from("orders").select("*", { count: "exact", head: true }).eq("pickup_date", today),
      admin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("orders").select("total"),
    ]);

  const totalRevenue = revenue?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

  return NextResponse.json(
    { totalOrders, todayOrders, pendingOrders, totalRevenue },
    { headers: { "Cache-Control": "no-store" } }
  );
}
