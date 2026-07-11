import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { login, createInvoice, getInvoiceById } from "@/lib/sadad";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://biteezcustomer.vercel.app";

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

    // Step 2 — create invoice (pass URLs so Sadad may populate shareUrl)
    const inv = await createInvoice(accessToken, {
      cellnumber:  order.customer_phone ?? "",
      clientname:  order.customer_name  ?? "",
      amount:      Number(subtotal),
      items: items.map((i) => ({
        description: i.productName,
        quantity:    i.quantity,
        amount:      i.unitPrice,
      })),
      remarks:     `Order #${orderNumber}`,
      orderNumber,
    });

    const invoiceId  = inv.id as number;
    const invoiceNo  = inv.invoiceno as string;

    // Step 3 — find the customer payment URL
    // Priority: invoice_customer_share_url > shareUrl > fetch via getbyid
    let paymentUrl: string | undefined;

    const customerShareUrl = inv.invoice_customer_share_url as string | undefined | null;
    const shareUrl         = inv.shareUrl as string | undefined | null;

    if (customerShareUrl) {
      paymentUrl = customerShareUrl.startsWith("http")
        ? customerShareUrl
        : `https://sadad.qa/pay/${customerShareUrl}`;
    } else if (shareUrl) {
      paymentUrl = shareUrl.startsWith("http")
        ? shareUrl
        : `https://sadad.qa/pay/${shareUrl}`;
    } else {
      // Fall back: try GET /api/invoices/getbyid?id=...
      const fetched = await getInvoiceById(accessToken, invoiceId);
      const fCustomerUrl = fetched.invoice_customer_share_url as string | undefined | null;
      const fShareUrl    = fetched.shareUrl as string | undefined | null;
      if (fCustomerUrl) {
        paymentUrl = fCustomerUrl.startsWith("http") ? fCustomerUrl : `https://sadad.qa/pay/${fCustomerUrl}`;
      } else if (fShareUrl) {
        paymentUrl = fShareUrl.startsWith("http") ? fShareUrl : `https://sadad.qa/pay/${fShareUrl}`;
      }
    }

    if (!paymentUrl) {
      console.error("[checkout] No payment URL — full invoice:", JSON.stringify(inv));
      throw new Error(
        `Sadad did not return a payment URL for invoice ${invoiceNo}. ` +
        `Check Sadad merchant portal: enable Payment Gateway and configure Success/Webhook URLs.`
      );
    }

    console.log("[checkout] paymentUrl:", paymentUrl, "order:", orderNumber);
    return NextResponse.json({ paymentUrl, orderNumber, invoiceId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[checkout]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
