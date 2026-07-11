import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getRefreshToken,
  getAccessToken,
  createInvoice,
  getInvoiceById,
  getPaymentUrl,
} from "@/lib/sadad";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { order, subtotal } = await req.json();

    // Save order to Supabase before redirecting to payment
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

    // Step 1 — refresh token
    const refreshToken = await getRefreshToken();

    // Step 2 — access token
    const accessToken = await getAccessToken(refreshToken);

    // Step 3 — create invoice
    const invoiceId = await createInvoice(accessToken, {
      ref_Number:      orderNumber,
      amount:          Number(subtotal).toFixed(2),
      customer_Name:   order.customer_name  ?? "",
      customer_Mobile: order.customer_phone ?? "",
      customer_Email:  order.customer_email ?? "",
    });

    // Step 4 — get key from invoice
    const invoice = await getInvoiceById(accessToken, invoiceId);
    const key = invoice.key as string;
    if (!key) throw new Error(`No key in invoice response: ${JSON.stringify(invoice)}`);

    // Step 5 — return payment URL for client redirect
    return NextResponse.json({
      paymentUrl: getPaymentUrl(key),
      orderNumber,
      invoiceId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[checkout]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
