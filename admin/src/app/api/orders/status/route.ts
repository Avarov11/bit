import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { OrderStatus } from "@/lib/types";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const VALID: OrderStatus[] = ["pending","confirmed","preparing","ready","delivered","cancelled"];

export async function PATCH(req: Request) {
  const { orderId, status } = await req.json();

  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data, error } = await getAdmin()
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("id, order_number, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
