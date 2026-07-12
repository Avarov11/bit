import crypto from 'crypto'

export function generateSignature(
  params: Record<string, string>,
  secretKey: string
): string {
  const sorted = Object.keys(params)
    .filter(k => k !== 'productdetail')
    .sort()

  const str = secretKey + sorted.map(k => params[k]).join('')
  return crypto.createHash('sha256').update(str).digest('hex')
}

export function buildSadadForm(orderData: {
  orderId: string
  amount: string
  customerEmail: string
  customerMobile: string
  itemName: string
}): { formHtml: string; signature: string; params: Record<string, string> } {
  const merchantId  = process.env.SADAD_MERCHANT_ID!
  const secretKey   = process.env.SADAD_SECRET_KEY!
  const website     = 'biteezcustomer.vercel.app'
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment-callback`

  // ISSUE 1: strip ALL non-numeric characters — SADAD requires digits only
  // e.g. +201019383610 → 201019383610, +974 5555 6666 → 97455556666
  const cleanMobile = orderData.customerMobile.replace(/[^0-9]/g, '')
  console.log('[sadad] cleaned MOBILE_NO:', cleanMobile)

  // ISSUE 2: toISOString() gives UTC in format "2026-07-11T20:15:00.000Z"
  // → replace T with space, slice to 19 chars → "2026-07-11 20:15:00" (exactly 19)
  // SADAD docs don't specify timezone; UTC is used here for consistency
  const txnDate = new Date().toISOString().replace('T', ' ').slice(0, 19)
  console.log('[sadad] txnDate value:', txnDate, 'length:', txnDate.length)

  const params: Record<string, string> = {
    CALLBACK_URL: callbackUrl,
    EMAIL:        orderData.customerEmail,
    MOBILE_NO:    cleanMobile,
    ORDER_ID:     orderData.orderId,
    // ISSUE 3: docs say lowercase "eng"/"arb" but official demo HTML uses "ENG"
    // Keeping "ENG" to match the demo sample — switch to "eng" if issues persist
    SADAD_WEBCHECKOUT_PAGE_LANGUAGE: 'ENG',
    TXN_AMOUNT:  orderData.amount,
    VERSION:     '1.1',
    WEBSITE:     website,
    merchant_id: merchantId,
    txnDate:     txnDate,
  }

  const signature = generateSignature(params, secretKey)

  console.log('[sadad] FINAL params before signature:', JSON.stringify(params, null, 2))
  console.log('[sadad] FINAL signature:', signature)
  console.log('[sadad] MOBILE_NO in params has no +/-/space:', /^[0-9]+$/.test(params.MOBILE_NO))

  const formHtml = `
<form action="https://sadadqa.com/webpurchase" method="post" name="gosadad" id="sadad_form">
  <input type="hidden" name="CALLBACK_URL" value="${callbackUrl}">
  <input type="hidden" name="EMAIL" value="${orderData.customerEmail}">
  <input type="hidden" name="MOBILE_NO" value="${cleanMobile}">
  <input type="hidden" name="ORDER_ID" value="${orderData.orderId}">
  <input type="hidden" name="SADAD_WEBCHECKOUT_PAGE_LANGUAGE" value="ENG">
  <input type="hidden" name="TXN_AMOUNT" value="${orderData.amount}">
  <input type="hidden" name="VERSION" value="1.1">
  <input type="hidden" name="WEBSITE" value="${website}">
  <input type="hidden" name="merchant_id" value="${merchantId}">
  <input type="hidden" name="txnDate" value="${txnDate}">
  <input type="hidden" name="signature" value="${signature}">
  <input type="hidden" name="productdetail[0][order_id]" value="${orderData.orderId}">
  <input type="hidden" name="productdetail[0][amount]" value="${orderData.amount}">
  <input type="hidden" name="productdetail[0][quantity]" value="1">
</form>`

  return { formHtml, signature, params }
}
