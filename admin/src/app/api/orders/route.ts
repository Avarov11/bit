import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const { error } = await getAdmin().from("orders").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date   = searchParams.get("date");

  let query = getAdmin()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (date)   query = query.eq("pickup_date", date);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
