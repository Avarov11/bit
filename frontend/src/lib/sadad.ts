const API =
  process.env.SADAD_SANDBOX === "true"
    ? "https://api-sandbox.sadad.qa/api"
    : "https://api-s.sadad.qa/api";

/** Step 1 — login with sadadId + secretKey + domain → accessToken */
export async function login(): Promise<string> {
  const res = await fetch(`${API}/userbusinesses/login`, {
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

/** Step 2 — create invoice → { shareUrl, invoiceId } */
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
  const res = await fetch(`${API}/invoices/createInvoice`, {
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
  // Response is an array — take first element
  const inv = Array.isArray(json) ? json[0] : json;
  if (!inv || inv.error)
    throw new Error(`Sadad createInvoice failed: ${JSON.stringify(json)}`);
  console.log("[sadad] createInvoice keys:", Object.keys(inv));
  console.log("[sadad] createInvoice full:", JSON.stringify(inv));
  return inv as Record<string, unknown>;
}

/** Get invoice by ID to check payment status */
export async function getInvoice(
  accessToken: string,
  invoiceId: number
): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}/invoices/${invoiceId}`, {
    headers: { Authorization: accessToken },
  });
  const json = await res.json();
  return json as Record<string, unknown>;
}
