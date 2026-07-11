import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyChecksum } from "@/lib/sadad";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://biteezcustomer.vercel.app";

export async function POST(req: NextRequest) {
  try {
    const body   = await req.text();
    const params = new URLSearchParams(body);

    const STATUS       = params.get("STATUS")       ?? "";
    const ORDERID      = params.get("ORDERID")      ?? "";
    const TXNAMOUNT    = params.get("TXNAMOUNT")    ?? "";
    const checksumhash = params.get("checksumhash") ?? "";
    const RESPCODE     = params.get("RESPCODE")     ?? "";
    const RESPMSG      = params.get("RESPMSG")      ?? "";

    console.log("[callback] STATUS:", STATUS, "ORDERID:", ORDERID, "RESPCODE:", RESPCODE, "RESPMSG:", RESPMSG);

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const paid = STATUS === "TXN_SUCCESS";

    // Verify checksum before trusting the result
    const isValid = await verifyChecksum({ ORDER_ID: ORDERID, STATUS, TXNAMOUNT, checksumhash });
    console.log("[callback] checksum valid:", isValid);

    if (paid && isValid) {
      await sb
        .from("orders")
        .update({ status: "paid" })
        .eq("order_number", ORDERID)
        .eq("status", "pending_payment");

      const { data: orderData } = await sb
        .from("orders")
        .select("customer_name, pickup_date, pickup_time")
        .eq("order_number", ORDERID)
        .single();

      const qs = new URLSearchParams({
        order: ORDERID,
        name:  orderData?.customer_name ?? "",
        date:  orderData?.pickup_date   ?? "",
        time:  orderData?.pickup_time   ?? "",
      });
      return NextResponse.redirect(`${SITE_URL}/checkout/success?${qs.toString()}`);
    }

    // Payment failed or checksum invalid
    await sb
      .from("orders")
      .update({ status: "payment_failed" })
      .eq("order_number", ORDERID)
      .eq("status", "pending_payment");

    return NextResponse.redirect(`${SITE_URL}/checkout/fail?order=${ORDERID}`);
  } catch (err) {
    console.error("[payment-callback]", err);
    return NextResponse.redirect(`${SITE_URL}/checkout/fail`);
  }
}
