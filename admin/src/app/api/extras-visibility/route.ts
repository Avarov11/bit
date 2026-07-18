import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const type = new URL(req.url).searchParams.get("type");
  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

  const { data, error } = await getAdmin()
    .from("extras_hidden")
    .select("name")
    .eq("type", type);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ hidden: (data ?? []).map((r) => r.name) });
}

export async function PATCH(req: Request) {
  const { type, name } = await req.json();
  if (!type || !name) return NextResponse.json({ error: "type and name required" }, { status: 400 });

  const admin = getAdmin();
  const { data } = await admin
    .from("extras_hidden")
    .select("name")
    .eq("type", type)
    .eq("name", name)
    .maybeSingle();

  if (data) {
    const { error } = await admin.from("extras_hidden").delete().eq("type", type).eq("name", name);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ hidden: false });
  } else {
    const { error } = await admin.from("extras_hidden").insert({ type, name });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ hidden: true });
  }
}
