import crypto from 'crypto'

export function generateSadadChecksum(
  params: Record<string, string>,
  secretKey: string,
  merchantId: string
): string {
  const postData = { ...params }
  const checksum_key = secretKey + merchantId

  const chars = 'AbcDE123IJKLMNabcdefghijklmn0FGH67QRSTUVWXYZopqrstuvwxyz45OP89'
  let salt = ''
  for (let i = 0; i < 4; i++) {
    salt += chars[Math.floor(Math.random() * chars.length)]
  }

  const jsonStr = JSON.stringify({ postData, secretKey })
  const finalStr = jsonStr + '|' + salt
  const hash = crypto.createHash('sha256').update(finalStr).digest('hex')
  const hashString = hash + salt

  const iv = '@@@@&&&&####$$$$'
  const keyBuffer = Buffer.from(checksum_key.slice(0, 16), 'utf8')
  const ivBuffer = Buffer.from(iv, 'utf8')
  const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer, ivBuffer)
  let encrypted = cipher.update(hashString, 'utf8', 'base64')
  encrypted += cipher.final('base64')

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

  const params: Record<string, string> = {
    merchant_id:                      merchantId,
    WEBSITE:                          website,
    SADAD_WEBCHECKOUT_PAGE_LANGUAGE:  'ENG',
    ORDER_ID:                         orderData.orderId,
    TXN_AMOUNT:                       orderData.amount,
    CUST_ID:                          orderData.customerId,
    EMAIL:                            orderData.customerEmail,
    MOBILE_NO:                        orderData.customerMobile,
    CALLBACK_URL:                     callbackUrl,
    txnDate:                          txnDate,
  }

  const checksumhash = generateSadadChecksum(params, secretKey, merchantId)

  const body = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => body.append(k, v))
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
