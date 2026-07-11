import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";

// Sadad POSTs to this URL after payment (browser redirect + form POST)
export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const p: Record<string, string> = {};
    fd.forEach((v, k) => { p[k] = v.toString(); });

    // Sadad may send ORDERID or ORDER_ID
    const orderId = p["ORDERID"] ?? p["ORDER_ID"] ?? "";
    const status  = p["STATUS"]   ?? "";
    const resCode = p["RESPCODE"] ?? "";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const success = status === "TXN_SUCCESS" || resCode === "01" || resCode === "0000";

    await sb.from("orders")
      .update({ status: success ? "paid" : "payment_failed" })
      .eq("order_number", orderId);

    if (success) {
      const { data: o } = await sb
        .from("orders")
        .select("customer_name, pickup_date, pickup_time")
        .eq("order_number", orderId)
        .single();

      return NextResponse.redirect(
        `${baseUrl}/checkout/success?order=${orderId}&date=${o?.pickup_date ?? ""}&time=${encodeURIComponent(o?.pickup_time ?? "")}&name=${encodeURIComponent(o?.customer_name ?? "")}`,
        303
      );
    }

    return NextResponse.redirect(
      `${baseUrl}/checkout?payment=failed&order=${orderId}`,
      303
    );
  } catch (err) {
    console.error("[sadad-callback]", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?payment=error`,
      303
    );
  }
}

// Sadad may also send a GET ping
export async function GET() {
  return NextResponse.json({ ok: true });
}
