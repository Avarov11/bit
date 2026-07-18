import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getAdmin();
  const [slotsRes, settingsRes] = await Promise.all([
    sb.from("time_slots").select("*").order("sort_order", { ascending: true }),
    sb.from("site_settings").select("key, value").in("key", ["max_orders_per_day"]),
  ]);
  const settings: Record<string, string> = {};
  for (const row of settingsRes.data ?? []) settings[row.key] = row.value;
  return NextResponse.json({ slots: slotsRes.data ?? [], settings });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.setting_key !== undefined) {
    const { error } = await getAdmin()
      .from("site_settings")
      .upsert({ key: body.setting_key, value: String(body.setting_value) }, { onConflict: "key" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const { data: existing } = await getAdmin()
    .from("time_slots")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = ((existing?.[0]?.sort_order as number) ?? 0) + 1;

  const { data, error } = await getAdmin()
    .from("time_slots")
    .insert({ label: "New Slot", sort_order: nextOrder })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const { data, error } = await getAdmin()
    .from("time_slots")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const { error } = await getAdmin().from("time_slots").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
