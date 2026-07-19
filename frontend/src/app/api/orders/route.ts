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

  // ── Minimum order amount ──────────────────────────────────────────────────
  if (!total || Number(total) < 1) {
    return NextResponse.json({ error: "Minimum order amount is 1 QAR." }, { status: 400 });
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ── Capacity enforcement ──────────────────────────────────────────────────
  if (pickup_date && pickup_time) {
    const sb = getAdmin();

    const [slotRes, settingRes, dayCountRes] = await Promise.all([
      sb.from("time_slots").select("max_orders").eq("label", pickup_time).eq("active", true).single(),
      sb.from("site_settings").select("value").eq("key", "max_orders_per_day").single(),
      sb.from("orders").select("id", { count: "exact", head: true }).eq("pickup_date", pickup_date).neq("status", "cancelled"),
    ]);

    const maxPerDay   = parseInt(settingRes.data?.value ?? "50");
    const dayCount    = dayCountRes.count ?? 0;
    if (dayCount >= maxPerDay) {
      return NextResponse.json({ error: "This day is fully booked. Please choose another date." }, { status: 409 });
    }

    if (slotRes.data) {
      const slotMax     = slotRes.data.max_orders;
      const { count: slotCount } = await sb
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("pickup_date", pickup_date)
        .eq("pickup_time", pickup_time)
        .neq("status", "cancelled");
      if ((slotCount ?? 0) >= slotMax) {
        return NextResponse.json({ error: "This time slot is fully booked. Please choose another slot." }, { status: 409 });
      }
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

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
