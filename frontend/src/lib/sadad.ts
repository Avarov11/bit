const SADAD_API =
  process.env.SADAD_SANDBOX === "true"
    ? "https://api-sandbox.sadad.qa/api"
    : "https://api-s.sadad.qa/api";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://biteezcustomer.vercel.app";

/** Step 1 — login with sadadId + secretKey + domain → accessToken */
export async function login(): Promise<string> {
  const res = await fetch(`${SADAD_API}/userbusinesses/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sadadId:   Number(process.env.SADAD_MERCHANT_ID),
      secretKey: process.env.SADAD_SECRET_KEY,
      domain:    process.env.SADAD_DOMAIN ?? "biteezcustomer.vercel.app",
    }),
  });
  const json = await res.json();
  if (!json.accessToken)
    throw new Error(`Sadad login failed: ${JSON.stringify(json)}`);
  return json.accessToken as string;
}

export interface SadadItem {
  description: string;
  quantity: number;
  amount: number;
}

/** Step 2 — create invoice; pass success/webhook URLs so Sadad populates shareUrl */
export async function createInvoice(
  accessToken: string,
  data: {
    cellnumber: string;
    clientname: string;
    amount: number;
    items: SadadItem[];
    remarks?: string;
    orderNumber?: string;
  }
): Promise<Record<string, unknown>> {
  const res = await fetch(`${SADAD_API}/invoices/createInvoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({
      countryCode:               974,
      cellnumber:                data.cellnumber,
      clientname:                data.clientname,
      invoicedetails:            data.items,
      status:                    2,
      remarks:                   data.remarks ?? "",
      amount:                    data.amount,
      // Provide these so Sadad populates shareUrl / invoice_customer_share_url
      invoice_webhook_url:       `${SITE_URL}/api/sadad-webhook`,
      invoice_thankyou_page_url: `${SITE_URL}/checkout/success`,
    }),
  });
  const json = await res.json();
  const inv = Array.isArray(json) ? json[0] : json;
  if (!inv || inv.error)
    throw new Error(`Sadad createInvoice failed: ${JSON.stringify(json)}`);

  // Log every field so we can see what Sadad actually returns
  console.log("[sadad] createInvoice fields:");
  for (const [k, v] of Object.entries(inv)) {
    console.log(`  ${k}: ${JSON.stringify(v)}`);
  }
  return inv as Record<string, unknown>;
}

/**
 * Fetch an invoice by its numeric id. Tries the main Sadad API first
 * (using query-param form since path-param returns 401).
 */
export async function getInvoiceById(
  accessToken: string,
  invoiceId: number
): Promise<Record<string, unknown>> {
  // Try GET /api/invoices/getbyid?id={invoiceId}
  const res = await fetch(
    `${SADAD_API}/invoices/getbyid?id=${invoiceId}`,
    { headers: { Authorization: accessToken } }
  );
  const json = await res.json();
  console.log("[sadad] getbyid response:", JSON.stringify(json));
  return json as Record<string, unknown>;
}
