const SADAD_API =
  process.env.SADAD_SANDBOX === "true"
    ? "https://api-sandbox.sadad.qa/api"
    : "https://api-s.sadad.qa/api";

// Invoice query + payment redirect lives on sadadpay.net
const SADADPAY_API =
  process.env.SADAD_SANDBOX === "true"
    ? "https://apisandbox.sadadpay.net/api"
    : "https://api.sadadpay.net/api";

const SADADPAY_PAY =
  process.env.SADAD_SANDBOX === "true"
    ? "https://sandbox.sadadpay.net/pay"
    : "https://sadadpay.net/pay";

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

/** Step 2 — create invoice, returns the raw invoice object (includes numeric id) */
export async function createInvoice(
  accessToken: string,
  data: {
    cellnumber: string;
    clientname: string;
    amount: number;
    items: SadadItem[];
    remarks?: string;
  }
): Promise<Record<string, unknown>> {
  const res = await fetch(`${SADAD_API}/invoices/createInvoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({
      countryCode:    974,
      cellnumber:     data.cellnumber,
      clientname:     data.clientname,
      invoicedetails: data.items,
      status:         2,
      remarks:        data.remarks ?? "",
      amount:         data.amount,
    }),
  });
  const json = await res.json();
  const inv = Array.isArray(json) ? json[0] : json;
  if (!inv || inv.error)
    throw new Error(`Sadad createInvoice failed: ${JSON.stringify(json)}`);
  console.log("[sadad] createInvoice id:", inv.id, "invoiceno:", inv.invoiceno);
  return inv as Record<string, unknown>;
}

/**
 * Step 3 — fetch the invoice from sadadpay.net to get the "key" needed for the
 * payment redirect URL.  Also used by payment-status to check invoicestatusId.
 */
export async function getInvoiceById(
  accessToken: string,
  invoiceId: number
): Promise<Record<string, unknown>> {
  const res = await fetch(
    `${SADADPAY_API}/Invoice/getbyid?id=${invoiceId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const json = await res.json();
  console.log("[sadad] getbyid response:", JSON.stringify(json));
  return json as Record<string, unknown>;
}

/** Build the hosted payment page URL from the invoice key */
export function buildPaymentUrl(key: string): string {
  return `${SADADPAY_PAY}/${key}`;
}
