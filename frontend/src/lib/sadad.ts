const BASE = () =>
  process.env.SADAD_SANDBOX === "true"
    ? "https://apisandbox.sadadpay.net/api"
    : "https://api.sadadpay.net/api";

const PAY_BASE = () =>
  process.env.SADAD_SANDBOX === "true"
    ? "https://sandbox.sadadpay.net"
    : "https://sadadpay.net";

export async function getRefreshToken(): Promise<string> {
  const res = await fetch(`${BASE()}/User/GenerateRefreshToken`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.SADAD_SECRET_KEY}` },
  });
  const json = await res.json();
  if (!json.isValid) throw new Error(`Sadad refresh token: ${JSON.stringify(json)}`);
  return json.response.refreshToken as string;
}

export async function getAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(`${BASE()}/User/GenerateAccessToken`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  const json = await res.json();
  if (!json.isValid) throw new Error(`Sadad access token: ${JSON.stringify(json)}`);
  return json.response.accessToken as string;
}

export interface SadadItem {
  name: string;
  quantity: number;
  amount: number;
}

export interface SadadInvoiceInput {
  ref_Number: string;
  amount: string;
  customer_Name: string;
  customer_Mobile: string;
  customer_Email: string;
  items: SadadItem[];
}

export async function createInvoice(
  accessToken: string,
  data: SadadInvoiceInput
): Promise<string> {
  const res = await fetch(`${BASE()}/Invoice/insert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Invoices: [{ ...data, lang: "en", currency_Code: "QAR" }],
    }),
  });
  const json = await res.json();
  if (!json.isValid) throw new Error(`Sadad create invoice: ${JSON.stringify(json)}`);
  return String(json.response.invoiceId ?? json.response[0]?.invoiceId ?? "");
}

export async function getInvoiceById(
  accessToken: string,
  invoiceId: string
): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE()}/Invoice/getbyid?id=${invoiceId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!json.isValid) throw new Error(`Sadad get invoice: ${JSON.stringify(json)}`);
  return json.response as Record<string, unknown>;
}

export function getPaymentUrl(key: string): string {
  return `${PAY_BASE()}/pay/${key}`;
}
