import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRefreshToken, getAccessToken, getInvoiceById } from "@/lib/sadad";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const invoiceId = req.nextUrl.searchParams.get("invoice_id");
    if (!invoiceId) {
      return NextResponse.json({ error: "Missing invoice_id" }, { status: 400 });
    }

    const refreshToken = await getRefreshToken();
    const accessToken = await getAccessToken(refreshToken);
    const invoice = await getInvoiceById(accessToken, invoiceId);

    // Sadad may use paymentStatus, status, or isPaid — check all
    const statusStr = String(
      invoice.paymentStatus ?? invoice.payment_status ?? invoice.status ?? ""
    ).toLowerCase();
    const paid =
      statusStr === "paid" ||
      statusStr === "success" ||
      statusStr === "completed" ||
      invoice.isPaid === true;

    // ref_Number is the orderNumber we set when creating the invoice
    const orderNumber = String(invoice.ref_Number ?? invoice.refNumber ?? "");

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (paid && orderNumber) {
      // Idempotent: only update if still pending_payment
      await sb
        .from("orders")
        .update({ status: "paid" })
        .eq("order_number", orderNumber)
        .eq("status", "pending_payment");
    } else if (!paid && orderNumber) {
      await sb
        .from("orders")
        .update({ status: "payment_failed" })
        .eq("order_number", orderNumber)
        .eq("status", "pending_payment");
    }

    // Fetch order details for the success page
    const { data: orderData } = await sb
      .from("orders")
      .select("customer_name, pickup_date, pickup_time")
      .eq("order_number", orderNumber)
      .single();

    return NextResponse.json({
      paid,
      orderNumber,
      customerName: orderData?.customer_name ?? "",
      pickupDate: orderData?.pickup_date ?? "",
      pickupTime: orderData?.pickup_time ?? "",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[payment-status]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
