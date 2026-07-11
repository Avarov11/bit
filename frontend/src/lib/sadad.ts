export async function initiateSadadPayment(orderData: {
  orderId:        string
  amount:         string
  customerEmail:  string
  customerMobile: string
  customerId:     string
  itemName:       string
}) {
  const merchantId  = process.env.SADAD_MERCHANT_ID!
  const secretKey   = process.env.SADAD_SECRET_KEY!
  const website     = process.env.SADAD_WEBSITE ?? process.env.SADAD_DOMAIN ?? 'biteezcustomer.vercel.app'
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment-callback`
  const txnDate     = new Date().toISOString().replace('T', ' ').slice(0, 19)

  const productdetail = [
    {
      order_id: orderData.orderId,
      quantity: '1',
      amount:   orderData.amount,
    },
  ]

  // Step 1 — ask SADAD to generate the checksumhash
  const checksumPayload = {
    merchant_id:   merchantId,
    WEBSITE:       website,
    TXN_AMOUNT:    orderData.amount,
    ORDER_ID:      orderData.orderId,
    CALLBACK_URL:  callbackUrl,
    MOBILE_NO:     orderData.customerMobile,
    EMAIL:         orderData.customerEmail,
    productdetail,
    txnDate,
    VERSION:       '2.1',
  }

  console.log('[sadad] generateChecksum payload:', JSON.stringify(checksumPayload))

  const attempts = [
    {
      label:   'A1: secretkey + Origin (no https)',
      url:     'https://api.sadadqatar.com/api-v4/userbusinesses/generateChecksum',
      headers: { 'Content-Type': 'application/json', 'secretkey': secretKey, 'Origin': website },
    },
    {
      label:   'A2: secretkey + Origin https://',
      url:     'https://api.sadadqatar.com/api-v4/userbusinesses/generateChecksum',
      headers: { 'Content-Type': 'application/json', 'secretkey': secretKey, 'Origin': `https://${website}` },
    },
    {
      label:   'A3: secretkey + sadadid + Origin https://',
      url:     'https://api.sadadqatar.com/api-v4/userbusinesses/generateChecksum',
      headers: { 'Content-Type': 'application/json', 'secretkey': secretKey, 'sadadid': merchantId, 'Origin': `https://${website}` },
    },
    {
      label:   'A4a: sandbox api-s.sadadqatar.com',
      url:     'https://api-s.sadadqatar.com/api-v4/userbusinesses/generateChecksum',
      headers: { 'Content-Type': 'application/json', 'secretkey': secretKey, 'Origin': `https://${website}` },
    },
    {
      label:   'A4b: sandbox.sadadqa.com',
      url:     'https://sandbox.sadadqa.com/api-v4/userbusinesses/generateChecksum',
      headers: { 'Content-Type': 'application/json', 'secretkey': secretKey, 'Origin': `https://${website}` },
    },
    {
      label:   'A4c: api-test.sadadqatar.com',
      url:     'https://api-test.sadadqatar.com/api-v4/userbusinesses/generateChecksum',
      headers: { 'Content-Type': 'application/json', 'secretkey': secretKey, 'Origin': `https://${website}` },
    },
  ]

  let checksumhash = ''
  for (const attempt of attempts) {
    try {
      const res  = await fetch(attempt.url, { method: 'POST', headers: attempt.headers as Record<string,string>, body: JSON.stringify(checksumPayload) })
      const text = await res.text()
      console.log(`[sadad] ${attempt.label} → HTTP ${res.status}:`, text)
      const json = JSON.parse(text) as { checksum?: string }
      if (json.checksum) {
        checksumhash = json.checksum
        console.log('[sadad] SUCCESS with', attempt.label, '— checksum:', checksumhash)
        break
      }
    } catch (e) {
      console.log(`[sadad] ${attempt.label} → ERROR:`, e)
    }
  }

  if (!checksumhash) {
    throw new Error('All generateChecksum attempts failed — check logs above')
  }

  // Step 2 — POST same params + checksumhash to callapi.php
  const body = new URLSearchParams()
  body.append('merchant_id',  merchantId)
  body.append('WEBSITE',      website)
  body.append('TXN_AMOUNT',   orderData.amount)
  body.append('ORDER_ID',     orderData.orderId)
  body.append('CALLBACK_URL', callbackUrl)
  body.append('MOBILE_NO',    orderData.customerMobile)
  body.append('EMAIL',        orderData.customerEmail)
  body.append('CUST_ID',      orderData.customerId)
  body.append('txnDate',      txnDate)
  body.append('VERSION',      '2.1')
  productdetail.forEach((item, i) => {
    body.append(`productdetail[${i}][order_id]`, item.order_id)
    body.append(`productdetail[${i}][quantity]`, item.quantity)
    body.append(`productdetail[${i}][amount]`,   item.amount)
  })
  body.append('checksumhash', checksumhash)

  console.log('[sadad] posting to callapi.php, ORDER_ID:', orderData.orderId)

  const capiRes  = await fetch('https://sadadqa.com/jslib/callapi.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })

  const capiText = await capiRes.text()
  console.log('[sadad] callapi.php raw response:', capiText)

  let capiJson: { status?: string; msg?: string }
  try {
    capiJson = JSON.parse(capiText)
  } catch {
    throw new Error('callapi.php response not JSON: ' + capiText)
  }

  if (capiJson.status !== 'success') {
    throw new Error('SADAD callapi error: ' + capiText)
  }

  return capiJson.msg as string
}
