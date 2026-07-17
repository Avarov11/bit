import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getAdmin()
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { name, parent, badge_bg, badge_text, filter_mode } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  // Auto sort_order = max + 1
  const { data: existing } = await getAdmin()
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = ((existing?.[0]?.sort_order as number) ?? 0) + 1;

  const { data, error } = await getAdmin()
    .from("categories")
    .insert({
      name:        name.trim(),
      parent:      parent || null,
      badge_bg:    badge_bg    || "#F5D0D8",
      badge_text:  badge_text  || "#800020",
      filter_mode: filter_mode || "direct",
      sort_order:  nextOrder,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const { data, error } = await getAdmin()
    .from("categories")
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

  const { error } = await getAdmin().from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
