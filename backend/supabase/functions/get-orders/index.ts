import { corsHeaders } from "../_shared/cors.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";

// Admin-only: requires service role key in Authorization header
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");    // filter by status
  const date   = url.searchParams.get("date");      // filter by pickup_date (YYYY-MM-DD)
  const page   = parseInt(url.searchParams.get("page") ?? "1");
  const limit  = 20;
  const from   = (page - 1) * limit;

  let query = supabaseAdmin
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (status) query = query.eq("status", status);
  if (date)   query = query.eq("pickup_date", date);

  const { data, error, count } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ orders: data, total: count, page, limit }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
