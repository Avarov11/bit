import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "Birthday";

  // Bucket name pattern: "{Category} Sticker"
  const bucket = `${category} Sticker`;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.storage
    .from(bucket)
    .list("", { limit: 200, sortBy: { column: "name", order: "asc" } });

  // If bucket doesn't exist yet, return empty list instead of crashing
  if (error) return NextResponse.json([]);

  const stickers = (data ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder" && f.id)
    .map((f) => {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(f.name);
      return { name: f.name, url: urlData.publicUrl };
    });

  return NextResponse.json(stickers);
}
