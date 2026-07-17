import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const n     = req.nextUrl.searchParams.get("n");
  const token = req.nextUrl.searchParams.get("token");

  if (!n || !token) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  // Verify the token is the one we embedded in the success redirect URL.
  // This prevents enumeration of customer data by random 6-digit guessing.
  const expected = crypto
    .createHmac("sha256", process.env.SADAD_SECRET_KEY!)
    .update(n)
    .digest("hex")
    .slice(0, 16);

  if (token !== expected) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await sb
    .from("orders")
    .select("order_number, customer_name, customer_phone, delivery_address, items, total, pickup_date, pickup_time, status")
    .eq("order_number", n)
    .eq("status", "paid")   // only return confirmed-paid orders
    .single();

  if (error || !data) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(data);
}
