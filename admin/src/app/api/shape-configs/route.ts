import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = getAdmin();
  const { data, error } = await sb.from("shape_configs").select("*").order("shape");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { shape, max_chars, allowed_colors } = body;

  if (!shape) return NextResponse.json({ error: "Missing shape" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (typeof max_chars === "number" && max_chars >= 1) update.max_chars = max_chars;
  if (Array.isArray(allowed_colors)) update.allowed_colors = allowed_colors;

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const sb = getAdmin();
  const { error } = await sb.from("shape_configs").update(update).eq("shape", shape);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
