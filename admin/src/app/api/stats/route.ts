import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const admin = getAdmin();

  // Last 7 days (oldest → newest)
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  const weekAgo = days[0];

  // First day of current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [{ data: allOrders }, { data: recentOrders }] = await Promise.all([
    admin.from("orders").select("total, status, pickup_date, created_at"),
    admin
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const orders = allOrders ?? [];

  // Only count orders that represent real revenue (exclude payment in-flight or failed)
  const REVENUE_STATUSES = ["paid", "confirmed", "preparing", "ready", "delivered", "pending"];
  const realOrders = orders.filter(o => REVENUE_STATUSES.includes(o.status));

  const totalOrders   = realOrders.length;
  const totalRevenue  = realOrders.reduce((s, o) => s + Number(o.total), 0);
  const todayOrders   = realOrders.filter(o => o.pickup_date === today).length;
  // "Need action" = paid (awaiting confirmation) + legacy pending
  const pendingOrders = orders.filter(o => o.status === "paid" || o.status === "pending").length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const monthRevenue  = realOrders
    .filter(o => o.created_at.slice(0, 10) >= monthStart)
    .reduce((s, o) => s + Number(o.total), 0);

  // Revenue by day — last 7 days, real orders only
  const revMap: Record<string, number> = Object.fromEntries(days.map(d => [d, 0]));
  realOrders
    .filter(o => o.created_at.slice(0, 10) >= weekAgo)
    .forEach(o => {
      const d = o.created_at.slice(0, 10);
      if (d in revMap) revMap[d] += Number(o.total);
    });
  const revenueByDay = days.map(d => ({ date: d, revenue: revMap[d] }));

  // Orders by status (all orders including payment states)
  const statusCounts: Record<string, number> = {
    pending_payment: 0, paid: 0, payment_failed: 0,
    pending: 0, confirmed: 0, preparing: 0, ready: 0, delivered: 0, cancelled: 0,
  };
  orders.forEach(o => { if (o.status in statusCounts) statusCounts[o.status]++; });
  const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  return NextResponse.json(
    {
      totalOrders,
      todayOrders,
      pendingOrders,
      totalRevenue,
      avgOrderValue,
      monthRevenue,
      revenueByDay,
      ordersByStatus,
      recentOrders: recentOrders ?? [],
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
