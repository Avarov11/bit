import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const body = await req.json();

  // Allowlist: destructure only safe client-supplied fields.
  // status, payment_method, and delivery_method are never trusted from the client.
  const {
    customer_name,
    customer_phone,
    customer_email,
    delivery_address,
    pickup_date,
    pickup_time,
    sticker_url,
    image_url,
    items,
    subtotal,
    delivery_fee,
    total,
    notes,
    language,
    order_number,
  } = body;

  const { data, error } = await getAdmin()
    .from("orders")
    .insert({
      customer_name,
      customer_phone,
      customer_email,
      delivery_method:  "delivery",         // never trust from client
      delivery_address,
      pickup_date,
      pickup_time,
      sticker_url,
      image_url,
      items,
      subtotal,
      delivery_fee,
      total,
      notes,
      language,
      order_number,
      status:           "pending_payment",  // only the SADAD callback may advance this
      payment_method:   "sadad_online",
    })
    .select("id, order_number")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
