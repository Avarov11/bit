const API =
  process.env.SADAD_SANDBOX === "true"
    ? "https://apisandbox.sadadpay.net"
    : "https://api.sadadpay.net";

const PAY =
  process.env.SADAD_SANDBOX === "true"
    ? "https://sandbox.sadadpay.net"
    : "https://sadadpay.net";

export async function getRefreshToken(): Promise<string> {
  const res = await fetch(`${API}/api/User/GenerateRefreshToken`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.SADAD_SECRET_KEY}` },
  });
  const json = await res.json();
  if (!json.isValid)
    throw new Error(`GenerateRefreshToken: ${JSON.stringify(json)}`);
  return json.response.refreshToken as string;
}

export async function getAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(`${API}/api/User/GenerateAccessToken`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  const json = await res.json();
  if (!json.isValid)
    throw new Error(`GenerateAccessToken: ${JSON.stringify(json)}`);
  return json.response.accessToken as string;
}

export async function createInvoice(
  accessToken: string,
  data: {
    ref_Number: string;
    amount: string;
    customer_Name: string;
    customer_Mobile: string;
    customer_Email: string;
  }
): Promise<string> {
  const res = await fetch(`${API}/api/Invoice/insert`, {
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
  if (!json.isValid)
    throw new Error(`Invoice/insert: ${JSON.stringify(json)}`);
  return String(json.response.invoiceId ?? json.response[0]?.invoiceId ?? "");
}

export async function getInvoiceById(
  accessToken: string,
  invoiceId: string
): Promise<Record<string, unknown>> {
  const res = await fetch(`${API}/api/Invoice/getbyid?id=${invoiceId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!json.isValid)
    throw new Error(`Invoice/getbyid: ${JSON.stringify(json)}`);
  return json.response as Record<string, unknown>;
}

export function getPaymentUrl(key: string): string {
  return `${PAY}/pay/${key}`;
}
