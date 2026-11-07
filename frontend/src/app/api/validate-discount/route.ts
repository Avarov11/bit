import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { code, subtotal } = await req.json();
  if (!code?.trim()) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("discount_codes")
    .select("id, code, type, value")
    .eq("code", code.toUpperCase().trim())
    .eq("active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Invalid or expired discount code" }, { status: 404 });
  }

  const sub = Number(subtotal) || 0;
  let amount = 0;
  if (data.type === "fixed") {
    amount = Math.min(Number(data.value), sub);
  } else {
    amount = Math.round(sub * Number(data.value)) / 100;
  }

  return NextResponse.json({ code: data.code, type: data.type, value: data.value, amount });
}
