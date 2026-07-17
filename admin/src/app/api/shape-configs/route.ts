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
  const { shape, max_chars } = await req.json();
  if (!shape || typeof max_chars !== "number" || max_chars < 1) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const sb = getAdmin();
  const { error } = await sb
    .from("shape_configs")
    .update({ max_chars })
    .eq("shape", shape);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
