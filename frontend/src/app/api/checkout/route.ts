import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { login, createInvoice } from "@/lib/sadad";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { order, subtotal } = await req.json();
    const items = order.items as Array<{ productName: string; unitPrice: number; quantity: number }>;

    // Save order as pending_payment before redirecting
    const orderNumber = Math.floor(100_000 + Math.random() * 900_000).toString();
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await sb.from("orders").insert({
      ...order,
      order_number:   orderNumber,
      payment_method: "sadad_online",
      status:         "pending_payment",
    });
    if (error) throw error;

    // Step 1 — authenticate
    const accessToken = await login();

    // Step 2 — create invoice
    const { invoiceId, invoiceNo, shareUrl } = await createInvoice(accessToken, {
      cellnumber: order.customer_phone ?? "",
      clientname: order.customer_name  ?? "",
      amount:     Number(subtotal),
      items: items.map((i) => ({
        description: i.productName,
        quantity:    i.quantity,
        amount:      i.unitPrice,
      })),
      remarks: `Order #${orderNumber}`,
    });

    // Build payment URL — shareUrl may be a short code or full URL
    const payBase = process.env.SADAD_SANDBOX === "true"
      ? "https://sandbox.sadad.qa"
      : "https://sadad.qa";
    const paymentUrl = shareUrl
      ? (shareUrl.startsWith("http") ? shareUrl : `${payBase}/pay/${shareUrl}`)
      : `${payBase}/invoice/${invoiceNo}`;

    return NextResponse.json({ paymentUrl, orderNumber, invoiceId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[checkout]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
