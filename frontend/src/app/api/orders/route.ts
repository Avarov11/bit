import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const NOTIFY_EMAIL = process.env.ORDER_NOTIFY_EMAIL ?? "youssef.farid13003@gmail.com";

async function sendOrderEmail(order: {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address?: string;
  pickup_date: string;
  pickup_time: string;
  items: unknown;
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
  notes?: string;
  delivery_method: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const resend = new Resend(apiKey);

  const itemsArr = Array.isArray(order.items) ? order.items : [];
  const itemRows = itemsArr.map((item: { productName?: string; quantity?: number; subtotal?: number | string; customization?: { shape?: string; flavor?: string; color?: string; message?: string } }) => {
    const c = item.customization ?? {};
    const details = [c.shape, c.flavor, c.color].filter(Boolean).join(", ");
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8ec">${item.productName ?? "Item"}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8ec;text-align:center">${item.quantity ?? 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8ec;color:#666;font-size:12px">${details || "—"}</td>
        ${c.message ? `<td style="padding:8px 12px;border-bottom:1px solid #f0e8ec;font-style:italic;color:#888;font-size:12px">"${c.message}"</td>` : `<td style="padding:8px 12px;border-bottom:1px solid #f0e8ec;color:#ccc">—</td>`}
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8ec;text-align:right;font-weight:600">${item.subtotal} QAR</td>
      </tr>`;
  }).join("");

  const isDelivery = order.delivery_method === "delivery";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fdf6f8;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(128,0,32,0.08)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#800020,#c0416a);padding:28px 32px">
      <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,0.7)">Biteez</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:22px">🎂 New Order Received!</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:14px">Order #${order.order_number}</p>
    </div>

    <div style="padding:28px 32px">
      <!-- Customer info -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr>
          <td style="width:50%;vertical-align:top;padding-right:12px">
            <div style="background:#fdf6f8;border-radius:10px;padding:14px">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#999">Customer</p>
              <p style="margin:0 0 3px;font-weight:700;color:#111">${order.customer_name}</p>
              <p style="margin:0 0 3px;color:#555;font-size:13px">${order.customer_phone}</p>
              ${order.customer_email ? `<p style="margin:0;color:#888;font-size:12px">${order.customer_email}</p>` : ""}
            </div>
          </td>
          <td style="width:50%;vertical-align:top;padding-left:12px">
            <div style="background:#fdf6f8;border-radius:10px;padding:14px">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#999">${isDelivery ? "Delivery" : "Pickup"}</p>
              <p style="margin:0 0 3px;font-weight:600;color:#111">${order.pickup_date} · ${order.pickup_time}</p>
              ${isDelivery && order.delivery_address ? `<p style="margin:0;color:#555;font-size:13px">${order.delivery_address}</p>` : ""}
              ${order.delivery_fee && Number(order.delivery_fee) > 0 ? `<p style="margin:4px 0 0;color:#2563eb;font-size:12px;font-weight:600">+${order.delivery_fee} QAR delivery</p>` : ""}
            </div>
          </td>
        </tr>
      </table>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;border:1px solid #f0e8ec;border-radius:10px;overflow:hidden;margin-bottom:16px">
        <thead>
          <tr style="background:#fdf6f8">
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888">Qty</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888">Details</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888">Message</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          ${Number(order.delivery_fee) > 0 ? `<tr><td colspan="4" style="padding:8px 12px;text-align:right;color:#666;font-size:13px">Delivery fee</td><td style="padding:8px 12px;text-align:right;font-size:13px">${order.delivery_fee} QAR</td></tr>` : ""}
          <tr style="background:#fdf6f8">
            <td colspan="4" style="padding:10px 12px;text-align:right;font-weight:700;font-size:15px">Total</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;font-size:15px;color:#800020">${order.total} QAR</td>
          </tr>
        </tfoot>
      </table>

      ${order.notes ? `
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;margin-bottom:16px">
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#92400e">📝 Notes</p>
        <p style="margin:0;font-size:13px;color:#78350f">${order.notes}</p>
      </div>` : ""}

      <div style="text-align:center;margin-top:24px">
        <a href="${process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.biteez.com"}/dashboard/orders"
          style="display:inline-block;background:linear-gradient(90deg,#800020,#c0416a);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px">
          View in Dashboard →
        </a>
      </div>
    </div>

    <div style="padding:16px 32px;border-top:1px solid #f0e8ec;text-align:center">
      <p style="margin:0;font-size:11px;color:#ccc">Biteez Admin Notifications</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: "Biteez <onboarding@resend.dev>",
    to: NOTIFY_EMAIL,
    subject: `🎂 New Order #${order.order_number} — ${order.customer_name} · ${order.total} QAR`,
    html,
  });
}

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

  // Fire-and-forget — don't block the response if email fails
  sendOrderEmail({
    order_number: data.order_number,
    customer_name,
    customer_phone,
    customer_email,
    delivery_address,
    pickup_date,
    pickup_time,
    items,
    subtotal,
    delivery_fee,
    total,
    notes,
    delivery_method: "delivery",
  }).catch(() => {});

  return NextResponse.json(data, { status: 201 });
}
