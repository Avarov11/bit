import crypto from 'crypto'

export function generateSadadChecksum(
  params: Record<string, string>,
  secretKey: string,
  merchantId: string
): string {
  // Step 1: Get values only, trimmed, excluding checksumhash
  const values = Object.entries(params)
    .filter(([k]) => k !== 'checksumhash')
    .map(([, v]) => String(v).trim())

  // Step 2: Generate 4-char random salt
  const saltChars = 'AbcDE123IJKLMN67QRSTUVWXYZaBCdefghijklmn123opq45rs67tuv89wxyz0FGH45OP89'
  let salt = ''
  for (let i = 0; i < 4; i++) {
    salt += saltChars[Math.floor(Math.random() * saltChars.length)]
  }

  // Step 3: SHA256 of (values joined by |) + | + salt
  const valuesString  = values.join('|')
  const finalString   = valuesString + '|' + salt

  console.log('[sadad] values array:', values)
  console.log('[sadad] valuesString:', valuesString)
  console.log('[sadad] finalString:', finalString)
  console.log('[sadad] salt:', salt)

  const hash       = crypto.createHash('sha256').update(finalString).digest('hex')
  const hashString = hash + salt

  console.log('[sadad] hash:', hash)
  console.log('[sadad] hashString:', hashString)

  // Step 4: AES-128-CBC encrypt — try all key combinations and log each
  const iv = Buffer.from('@@@@&&&&####$$$$', 'utf8')

  function encrypt(hs: string, keyBuf: Buffer): string {
    const c = crypto.createCipheriv('aes-128-cbc', keyBuf, iv)
    return c.update(hs, 'utf8', 'base64') + c.final('base64')
  }

  const key1 = Buffer.from(secretKey, 'utf8')                                  // secretKey only (16 chars)
  const key2 = Buffer.from((merchantId + secretKey).slice(0, 16), 'utf8')      // merchantId + secretKey
  const key3 = Buffer.from((secretKey + merchantId).slice(0, 16), 'utf8')      // secretKey + merchantId

  console.log('[sadad] checksum with secretKey only:', encrypt(hashString, key1))
  console.log('[sadad] checksum with merchantId+secretKey:', encrypt(hashString, key2))
  console.log('[sadad] checksum with secretKey+merchantId:', encrypt(hashString, key3))

  // Use secretKey only — it is exactly 16 chars, ideal for AES-128
  const encrypted = encrypt(hashString, key1)
  console.log('[sadad] final checksumhash (key1):', encrypted)

  return encrypted
}

export async function initiateSadadPayment(orderData: {
  orderId: string
  amount: string
  customerEmail: string
  customerMobile: string
  customerId: string
  itemName: string
}) {
  const merchantId = process.env.SADAD_MERCHANT_ID!
  const secretKey  = process.env.SADAD_SECRET_KEY!
  const website    = process.env.SADAD_WEBSITE ?? process.env.SADAD_DOMAIN ?? 'biteezcustomer.vercel.app'
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment-callback`

  const txnDate = new Date().toISOString().replace('T', ' ').slice(0, 19)

  // Only these 6 fields in this exact order go into the checksum
  const params: Record<string, string> = {
    merchant_id:  merchantId,
    ORDER_ID:     orderData.orderId,
    TXN_AMOUNT:   orderData.amount,
    WEBSITE:      website,
    CALLBACK_URL: callbackUrl,
    txnDate:      txnDate,
  }

  const checksumhash = generateSadadChecksum(params, secretKey, merchantId)

  // Build full form body: checksum params + extra fields + product detail
  const body = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => body.append(k, v))
  body.append('SADAD_WEBCHECKOUT_PAGE_LANGUAGE', 'ENG')
  body.append('CUST_ID',    orderData.customerId)
  body.append('EMAIL',      orderData.customerEmail)
  body.append('MOBILE_NO',  orderData.customerMobile)
  body.append('productdetail[0][order_id]', orderData.orderId)
  body.append('productdetail[0][itemname]', orderData.itemName)
  body.append('productdetail[0][amount]',   orderData.amount)
  body.append('productdetail[0][quantity]', '1')
  body.append('productdetail[0][type]',     'line_item')
  body.append('checksumhash', checksumhash)

  console.log('[sadad] posting to callapi.php, ORDER_ID:', orderData.orderId, 'amount:', orderData.amount)

  const response = await fetch('https://sadadqa.com/jslib/callapi.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })

  const text = await response.text()
  console.log('[sadad] callapi.php raw response:', text)

  let json: { status?: string; msg?: string; error_code?: string; error_message?: unknown }
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('SADAD response not JSON: ' + text)
  }

  if (json.status !== 'success') {
    throw new Error('SADAD error: ' + JSON.stringify(json))
  }

  return json.msg as string
}
