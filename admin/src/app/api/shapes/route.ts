import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { label } = await req.json();
  if (!label?.trim()) return NextResponse.json({ error: "Label is required" }, { status: 400 });

  // Generate a clean ID from the label
  const shape = label.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  if (!shape) return NextResponse.json({ error: "Invalid label" }, { status: 400 });

  const bucketName = `shapes-${shape}`;
  const sb = getAdmin();

  // Check for duplicate
  const { data: existing } = await sb.from("shape_configs").select("shape").eq("shape", shape).single();
  if (existing) return NextResponse.json({ error: `Shape "${shape}" already exists` }, { status: 409 });

  // Create the storage bucket
  const { error: bucketErr } = await sb.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 10485760,
  });
  if (bucketErr && !bucketErr.message.toLowerCase().includes("already exists")) {
    return NextResponse.json({ error: `Bucket creation failed: ${bucketErr.message}` }, { status: 500 });
  }

  // Insert shape config
  const { data, error } = await sb.from("shape_configs").insert({
    shape,
    label: label.trim(),
    bucket_name: bucketName,
    max_chars:      3,
    view_count:     2,
    allowed_colors: ["brown", "beige", "black", "white", "pink", "blue"],
    active: true,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { shape } = await req.json();
  if (!shape) return NextResponse.json({ error: "Shape required" }, { status: 400 });
  if (["cake", "heart", "square"].includes(shape))
    return NextResponse.json({ error: "Cannot delete built-in shapes" }, { status: 400 });

  const { error } = await getAdmin().from("shape_configs").delete().eq("shape", shape);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
