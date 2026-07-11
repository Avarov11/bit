import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// AES-128-CBC, IV and salt logic ported from Sadad's PHP library
const IV = "@@@@&&&&####$$$$";
const SALT_CHARS = "AbcDE123IJKLMNQRSTUVWXYZaBCdefghijklmn123opq45rs67tuv89wxyz0FGH45OP89";

function genSalt(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += SALT_CHARS[Math.floor(Math.random() * SALT_CHARS.length)];
  return s;
}

function aesEncrypt(input: string, key: string): string {
  // PHP openssl truncates key to 16 bytes for AES-128
  const k = Buffer.from(key).subarray(0, 16);
  const cipher = crypto.createCipheriv("aes-128-cbc", k, Buffer.from(IV));
  return cipher.update(input, "utf8", "base64") + cipher.final("base64");
}

function makeChecksumhash(payload: object, secretKey: string, merchantId: string): string {
  const salt = genSalt(4);
  const finalStr = JSON.stringify(payload) + "|" + salt;
  const hash = crypto.createHash("sha256").update(finalStr).digest("hex");
  return aesEncrypt(hash + salt, secretKey + merchantId);
}

export async function POST(req: NextRequest) {
  try {
    const { order, items, subtotal } = await req.json();

    const merchantId = process.env.SADAD_MERCHANT_ID!;
    const secretKey  = process.env.SADAD_SECRET_KEY!;
    const website    = process.env.SADAD_WEBSITE ?? "BITEEZ";
    const baseUrl    = process.env.NEXT_PUBLIC_SITE_URL!;

    const orderNumber = Math.floor(100_000 + Math.random() * 900_000).toString();
    const txnDate = new Date().toISOString().replace("T", " ").slice(0, 19);

    // Save order as pending_payment before redirecting to Sadad
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await sb.from("orders").insert({
      ...order,
      order_number:   orderNumber,
      payment_method: "sadad_online",
      status:         "pending_payment",
    });
    if (error) throw error;

    // Build postData in the exact key order the PHP library uses
    const postData: Record<string, unknown> = {
      merchant_id:                     merchantId,
      WEBSITE:                         website,
      SADAD_WEBCHECKOUT_PAGE_LANGUAGE: "ENG",
      ORDER_ID:                        orderNumber,
      TXN_AMOUNT:                      Number(subtotal).toFixed(2),
      EMAIL:                           order.customer_email ?? "",
      MOBILE_NO:                       order.customer_phone ?? "",
      CALLBACK_URL:                    `${baseUrl}/api/sadad-callback`,
      txnDate,
      productdetail: (items as Array<{ productName: string; unitPrice: number; quantity: number }>).map((item) => ({
        order_id: orderNumber,
        itemname: item.productName,
        amount:   Number(item.unitPrice).toFixed(2),
        quantity: String(item.quantity),
        type:     "1",
      })),
    };

    // PHP wraps {postData, secretKey} before hashing — must match exactly
    const checksumPayload = { postData, secretKey };
    const checksumhash = makeChecksumhash(checksumPayload, secretKey, merchantId);

    const isTest = process.env.SADAD_TEST_MODE === "true";
    const paymentUrl = isTest
      ? "https://test.sadadqa.com/jslib/callapi.php"
      : "https://sadadqa.com/jslib/callapi.php";

    return NextResponse.json({
      paymentUrl,
      fields:      postData,
      checksumhash,
      orderNumber,
    });
  } catch (err) {
    const msg = err instanceof Error
      ? err.message
      : (err && typeof err === "object" && "message" in err)
        ? String((err as Record<string, unknown>).message)
        : JSON.stringify(err);
    console.error("[sadad-pay]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
