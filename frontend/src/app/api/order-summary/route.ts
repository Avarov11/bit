import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const n = req.nextUrl.searchParams.get("n");
  if (!n) return NextResponse.json({ error: "Missing order number" }, { status: 400 });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await sb
    .from("orders")
    .select("order_number, customer_name, customer_phone, delivery_address, items, total, pickup_date, pickup_time, status")
    .eq("order_number", n)
    .single();

  if (error || !data) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(data);
}
