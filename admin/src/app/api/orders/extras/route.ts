import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const { orderId, itemIndex, candleUrl, balloonUrl, cardUrl } = await req.json();

  if (!orderId || itemIndex === undefined) {
    return NextResponse.json({ error: "Missing orderId or itemIndex" }, { status: 400 });
  }

  const { data: order, error: fetchError } = await getAdmin()
    .from("orders")
    .select("items")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const items = [...(order.items as Record<string, unknown>[] ?? [])];
  if (!items[itemIndex]) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const prev = items[itemIndex] as { customization?: Record<string, unknown> };
  const prevToppings: string[] = (prev.customization?.toppings as string[]) ?? [];

  // Sync "Candles" text in toppings array based on whether a candleUrl is set
  const hasCandleUrl = !!candleUrl;
  let newToppings = prevToppings.filter((t) => t !== "Candles");
  if (hasCandleUrl) newToppings = [...newToppings, "Candles"];

  items[itemIndex] = {
    ...items[itemIndex],
    customization: {
      ...(prev.customization ?? {}),
      toppings:   newToppings.length ? newToppings : undefined,
      candleUrl:  candleUrl  ?? null,
      balloonUrl: balloonUrl ?? null,
      cardUrl:    cardUrl    ?? null,
    },
  };

  const { error } = await getAdmin()
    .from("orders")
    .update({ items })
    .eq("id", orderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, items });
}
