import { corsHeaders } from "../_shared/cors.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const {
    customerName, customerPhone, customerEmail,
    deliveryMethod, deliveryAddress,
    pickupDate, pickupTime,
    paymentMethod,
    items, subtotal, deliveryFee, total,
    notes, language,
  } = body;

  // Upsert customer by phone
  const { data: customer, error: customerError } = await supabaseAdmin
    .from("customers")
    .upsert({ name: customerName, phone: customerPhone, email: customerEmail }, {
      onConflict: "phone",
      ignoreDuplicates: false,
    })
    .select("id")
    .single();

  if (customerError) {
    return new Response(JSON.stringify({ error: customerError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customer.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      delivery_method: deliveryMethod,
      delivery_address: deliveryAddress ?? null,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      payment_method: paymentMethod,
      items: items,
      subtotal,
      delivery_fee: deliveryFee ?? 0,
      total,
      notes: notes ?? null,
      language: language ?? "en",
    })
    .select("id, order_number")
    .single();

  if (orderError) {
    return new Response(JSON.stringify({ error: orderError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ orderId: order.id, orderNumber: order.order_number }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
