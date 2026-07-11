const BASE        = "https://sadadqa.com";
const MERCHANT_ID = process.env.SADAD_MERCHANT_ID!;
const SECRET_KEY  = process.env.SADAD_SECRET_KEY!;
const WEBSITE     = process.env.SADAD_DOMAIN ?? "biteezcustomer.vercel.app";
const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? "https://biteezcustomer.vercel.app";

export interface ProductDetail {
  order_id: string;
  itemname:  string;
  amount:    string;
  quantity:  number;
  type:      string;
}

/** Format a Date as "YYYY-MM-DD HH:mm:ss" (Sadad txnDate format) */
export function formatTxnDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} `
       + `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Step 1 — ask Sadad to generate the checksumhash */
export async function generateChecksum(params: {
  ORDER_ID:     string;
  TXN_AMOUNT:   string;
  CALLBACK_URL: string;
  txnDate:      string;
  productdetail: ProductDetail[];
}): Promise<string> {
  const res = await fetch(`${BASE}/api/Checksum/generate`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      merchant_id:   MERCHANT_ID,
      ORDER_ID:      params.ORDER_ID,
      WEBSITE,
      TXN_AMOUNT:    params.TXN_AMOUNT,
      CALLBACK_URL:  params.CALLBACK_URL,
      txnDate:       params.txnDate,
      productdetail: params.productdetail,
      secretkey:     SECRET_KEY,
    }),
  });
  if (!res.ok) throw new Error(`Sadad checksum generate HTTP ${res.status}`);
  const json = await res.json();
  console.log("[sadad] checksum response:", JSON.stringify(json));
  if (!json.checksumhash) throw new Error(`No checksumhash: ${JSON.stringify(json)}`);
  return json.checksumhash as string;
}

/** Step 2 — POST to callapi.php; returns the HTML form string from response.msg */
export async function getSadadForm(params: {
  ORDER_ID:      string;
  TXN_AMOUNT:    string;
  CUST_ID:       string;
  EMAIL:         string;
  MOBILE_NO:     string;
  txnDate:       string;
  productdetail: ProductDetail[];
  checksumhash:  string;
}): Promise<string> {
  const body = new URLSearchParams();
  body.append("merchant_id",  MERCHANT_ID);
  body.append("ORDER_ID",     params.ORDER_ID);
  body.append("WEBSITE",      WEBSITE);
  body.append("TXN_AMOUNT",   params.TXN_AMOUNT);
  body.append("CUST_ID",      params.CUST_ID);
  body.append("EMAIL",        params.EMAIL);
  body.append("MOBILE_NO",    params.MOBILE_NO);
  body.append("CALLBACK_URL", `${SITE_URL}/api/payment-callback`);
  body.append("txnDate",      params.txnDate);
  params.productdetail.forEach((item, i) => {
    body.append(`productdetail[${i}][order_id]`,  item.order_id);
    body.append(`productdetail[${i}][itemname]`,  item.itemname);
    body.append(`productdetail[${i}][amount]`,    item.amount);
    body.append(`productdetail[${i}][quantity]`,  String(item.quantity));
    body.append(`productdetail[${i}][type]`,      item.type);
  });
  body.append("checksumhash", params.checksumhash);

  const res = await fetch(`${BASE}/jslib/callapi.php`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });
  if (!res.ok) throw new Error(`Sadad callapi.php HTTP ${res.status}`);
  const json = await res.json();
  console.log("[sadad] callapi status:", json.status, "msg length:", String(json.msg ?? "").length);
  if (json.status === "failed") throw new Error(`Sadad callapi failed: ${JSON.stringify(json)}`);
  if (!json.msg) throw new Error(`No form HTML from Sadad: ${JSON.stringify(json)}`);
  return json.msg as string;
}

/** Verify the checksumhash that Sadad sends to the callback URL */
export async function verifyChecksum(params: {
  ORDER_ID:     string;
  STATUS:       string;
  TXNAMOUNT:    string;
  checksumhash: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/Checksum/verify`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...params, merchant_id: MERCHANT_ID, secretkey: SECRET_KEY }),
    });
    const json = await res.json();
    console.log("[sadad] checksum verify:", JSON.stringify(json));
    return json.isValid === true || json.status === "success" || json.checksumhash === params.checksumhash;
  } catch (err) {
    console.error("[sadad] checksum verify error:", err);
    return false;
  }
}
