import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { login, getInvoiceById } from "@/lib/sadad";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const invoiceId = req.nextUrl.searchParams.get("invoice_id");
    if (!invoiceId) {
      return NextResponse.json({ error: "Missing invoice_id" }, { status: 400 });
    }

    const accessToken = await login();
    const invoice = await getInvoiceById(accessToken, Number(invoiceId));

    // Sadad invoice status: invoicestatusId 3 = paid, check name too
    const statusName = String(
      (invoice.invoicestatus as Record<string, unknown>)?.name ?? invoice.status ?? ""
    ).toLowerCase();
    const paid =
      invoice.invoicestatusId === 3 ||
      statusName === "paid" ||
      statusName === "completed";

    // remarks field contains "Order #XXXXXX" — extract order number
    const remarks = String(invoice.remarks ?? "");
    const orderNumber = remarks.replace("Order #", "").trim() ||
      String(invoice.invoiceno ?? "");

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (orderNumber) {
      await sb
        .from("orders")
        .update({ status: paid ? "paid" : "payment_failed" })
        .eq("order_number", orderNumber)
        .eq("status", "pending_payment");
    }

    const { data: orderData } = await sb
      .from("orders")
      .select("customer_name, pickup_date, pickup_time")
      .eq("order_number", orderNumber)
      .single();

    return NextResponse.json({
      paid,
      orderNumber,
      customerName: orderData?.customer_name ?? "",
      pickupDate:   orderData?.pickup_date   ?? "",
      pickupTime:   orderData?.pickup_time   ?? "",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[payment-status]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
