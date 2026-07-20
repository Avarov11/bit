import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const SETTING_KEY = "delivery_areas";

const DEFAULTS = [
  { id: "doha",         name_en: "Doha",         name_ar: "الدوحة",    fee: 30, sort_order: 1,  active: true },
  { id: "al_rayyan",   name_en: "Al Rayyan",    name_ar: "الريان",    fee: 35, sort_order: 2,  active: true },
  { id: "umm_salal",   name_en: "Umm Salal",    name_ar: "ام صلال",   fee: 35, sort_order: 3,  active: true },
  { id: "azghawa",     name_en: "Azghawa",      name_ar: "ازغوى",     fee: 30, sort_order: 4,  active: true },
  { id: "al_dafna",    name_en: "Al Dafna",     name_ar: "الدفنة",    fee: 30, sort_order: 5,  active: true },
  { id: "al_wakrah",   name_en: "Al Wakrah",    name_ar: "الوكرة",    fee: 40, sort_order: 6,  active: true },
  { id: "al_khor",     name_en: "Al Khor",      name_ar: "الخور",     fee: 50, sort_order: 7,  active: true },
  { id: "al_ruwais",   name_en: "Al Ruwais",    name_ar: "الرويس",    fee: 70, sort_order: 8,  active: true },
  { id: "al_shahaniya",name_en: "Al Shahaniya", name_ar: "الشحانية",  fee: 65, sort_order: 9,  active: true },
  { id: "ain_khaled",  name_en: "Ain Khaled",   name_ar: "عين خالد",  fee: 35, sort_order: 10, active: true },
  { id: "al_thumama",  name_en: "Al Thumama",   name_ar: "الثمامة",   fee: 35, sort_order: 11, active: true },
];

async function readAreas() {
  const sb = getAdmin();
  const { data } = await sb.from("site_settings").select("value").eq("key", SETTING_KEY).single();
  if (data?.value) {
    try { return JSON.parse(data.value) as typeof DEFAULTS; } catch {}
  }
  // First visit — seed defaults
  await sb.from("site_settings").upsert({ key: SETTING_KEY, value: JSON.stringify(DEFAULTS) }, { onConflict: "key" });
  return DEFAULTS;
}

async function writeAreas(areas: typeof DEFAULTS) {
  await getAdmin().from("site_settings").upsert({ key: SETTING_KEY, value: JSON.stringify(areas) }, { onConflict: "key" });
}

export async function GET() {
  const areas = await readAreas();
  return NextResponse.json(areas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const areas = await readAreas();
  const nextOrder = areas.reduce((m, a) => Math.max(m, a.sort_order), 0) + 1;
  const newArea = {
    id:         crypto.randomUUID(),
    name_en:    body.name_en    ?? "New Area",
    name_ar:    body.name_ar    ?? "",
    fee:        body.fee        ?? 0,
    sort_order: body.sort_order ?? nextOrder,
    active:     true,
  };
  await writeAreas([...areas, newArea]);
  return NextResponse.json(newArea);
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const areas = await readAreas();
  const updated = areas.map(a => a.id === id ? { ...a, ...updates } : a);
  await writeAreas(updated);
  return NextResponse.json(updated.find(a => a.id === id) ?? {});
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const areas = await readAreas();
  await writeAreas(areas.filter(a => a.id !== id));
  return NextResponse.json({ success: true });
}
