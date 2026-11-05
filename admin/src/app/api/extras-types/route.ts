import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const SETTING_KEY = "extras_types";

const DEFAULTS = [
  { key: "candles",  label: "Candles",  emoji: "🕯️", color: "#F59E0B", active: true },
  { key: "balloons", label: "Balloons", emoji: "🎈", color: "#8B5CF6", active: true },
  { key: "cards",    label: "Cards",    emoji: "🎴", color: "#10B981", active: true },
];

export type ExtraType = typeof DEFAULTS[number];

async function readTypes(): Promise<ExtraType[]> {
  const sb = getAdmin();
  const { data } = await sb.from("site_settings").select("value").eq("key", SETTING_KEY).single();
  if (data?.value) {
    try { return JSON.parse(data.value); } catch {}
  }
  await sb.from("site_settings").upsert({ key: SETTING_KEY, value: JSON.stringify(DEFAULTS) }, { onConflict: "key" });
  return DEFAULTS;
}

async function writeTypes(types: ExtraType[]) {
  await getAdmin().from("site_settings").upsert({ key: SETTING_KEY, value: JSON.stringify(types) }, { onConflict: "key" });
}

export async function GET() {
  const types = await readTypes();
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.label?.trim()) return NextResponse.json({ error: "Label required" }, { status: 400 });
  const types = await readTypes();
  const key = body.label.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
  if (types.find(t => t.key === key)) return NextResponse.json({ error: "A type with this name already exists" }, { status: 409 });
  const newType: ExtraType = {
    key,
    label: body.label.trim(),
    emoji: body.emoji ?? "🎁",
    color: body.color ?? "#EC4899",
    active: true,
  };
  await writeTypes([...types, newType]);
  return NextResponse.json(newType);
}

export async function PATCH(req: NextRequest) {
  const { key, ...updates } = await req.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  const types = await readTypes();
  const updated = types.map(t => t.key === key ? { ...t, ...updates } : t);
  await writeTypes(updated);
  return NextResponse.json(updated.find(t => t.key === key) ?? {});
}

export async function DELETE(req: NextRequest) {
  const { key } = await req.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  const types = await readTypes();
  await writeTypes(types.filter(t => t.key !== key));
  return NextResponse.json({ success: true });
}
