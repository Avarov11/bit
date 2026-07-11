import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateChecksum, getSadadForm, formatTxnDate } from "@/lib/sadad";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://biteezcustomer.vercel.app";

export async function POST(req: NextRequest) {
  try {
    const { order, subtotal } = await req.json();
    const items = order.items as Array<{
      productName: string;
      unitPrice:   number;
      quantity:    number;
    }>;

    // Save order to Supabase before redirecting
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

    const txnDate     = formatTxnDate(new Date());
    const amountStr   = Number(subtotal).toFixed(2);
    const callbackUrl = `${SITE_URL}/api/payment-callback`;

    const productdetail = items.map((item, i) => ({
      order_id: orderNumber,
      itemname:  item.productName,
      amount:    item.unitPrice.toFixed(2),
      quantity:  item.quantity,
      type:      "line_item" as const,
    }));

    // Step 1 — generate checksum
    const checksumhash = await generateChecksum({
      ORDER_ID:      orderNumber,
      TXN_AMOUNT:    amountStr,
      CALLBACK_URL:  callbackUrl,
      txnDate,
      productdetail,
    });

    // Step 2 — get payment form HTML from Sadad
    const form = await getSadadForm({
      ORDER_ID:      orderNumber,
      TXN_AMOUNT:    amountStr,
      CUST_ID:       order.customer_phone ?? orderNumber,
      EMAIL:         order.customer_email ?? "",
      MOBILE_NO:     order.customer_phone ?? "",
      txnDate,
      productdetail,
      checksumhash,
    });

    return NextResponse.json({ form, orderNumber });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[checkout]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
