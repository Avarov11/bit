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
    const { order, items, subtotal } = await req.json();

    const orderNumber = Math.floor(100_000 + Math.random() * 900_000).toString();

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await sb.from("orders").insert({
      ...order,
      order_number: orderNumber,
      payment_method: "sadad_online",
      status: "pending_payment",
    });
    if (error) throw error;

    // Sadad auth
    const refreshToken = await getRefreshToken();
    const accessToken = await getAccessToken(refreshToken);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    // Create invoice — ref_Number ties back to our order
    const invoiceId = await createInvoice(accessToken, {
      ref_Number: orderNumber,
      amount: Number(subtotal).toFixed(2),
      customer_Name: order.customer_name ?? "",
      customer_Mobile: order.customer_phone ?? "",
      customer_Email: order.customer_email ?? "",
      returnUrl: `${baseUrl}/checkout/success`,
      cancelUrl: `${baseUrl}/checkout/fail`,
      items: (
        items as Array<{ productName: string; unitPrice: number; quantity: number }>
      ).map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        amount: item.unitPrice,
      })),
    });

    // Get payment key
    const invoice = await getInvoiceById(accessToken, invoiceId);
    const key = invoice.key as string;
    const paymentUrl = getPaymentUrl(key);

    return NextResponse.json({ paymentUrl, orderNumber, invoiceId });
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : err && typeof err === "object" && "message" in err
        ? String((err as Record<string, unknown>).message)
        : JSON.stringify(err);
    console.error("[sadad-checkout]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
