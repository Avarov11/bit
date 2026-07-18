import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getAdmin()
    .from("customizer_pricing")
    .select("key, label, price, sort, section")
    .order("sort");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? [], { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request) {
  const { key, label, price } = await req.json();
  if (!key || price === undefined) return NextResponse.json({ error: "key and price required" }, { status: 400 });
  const update: Record<string, unknown> = { price };
  if (label !== undefined) update.label = label;
  const { data, error } = await getAdmin()
    .from("customizer_pricing")
    .update(update)
    .eq("key", key)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { label, price, section } = await req.json();
  if (!label || price === undefined) return NextResponse.json({ error: "label and price required" }, { status: 400 });
  const key = "custom_" + label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") + "_" + Date.now();
  const { data: maxRow } = await getAdmin().from("customizer_pricing").select("sort").order("sort", { ascending: false }).limit(1).single();
  const sort = (maxRow?.sort ?? 0) + 1;
  const { data, error } = await getAdmin()
    .from("customizer_pricing")
    .insert({ key, label, price, sort, section: section ?? "custom" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: Request) {
  const { key } = await req.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  if (!key.startsWith("custom_")) return NextResponse.json({ error: "Only custom items can be deleted" }, { status: 403 });
  const { error } = await getAdmin().from("customizer_pricing").delete().eq("key", key);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
