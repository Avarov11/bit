import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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
