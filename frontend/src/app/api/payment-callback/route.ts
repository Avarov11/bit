import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateSignature } from '@/lib/sadad'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body   = await req.formData()
    const fields: Record<string, string> = {}
    body.forEach((value, key) => {
      if (typeof value === 'string') fields[key] = value
    })

    console.log('[callback] SADAD callback received:', fields)

    const { checksumhash, ...sigParams } = fields
    const computedSig = generateSignature(sigParams, process.env.SADAD_SECRET_KEY!)
    const sigValid    = computedSig === checksumhash
    // If sigValid is false, compare these two values in Vercel function logs.
    // A mismatch almost always means SADAD_SECRET_KEY in Vercel env vars differs
    // from the key shown in the SADAD merchant sandbox console for merchant 4228868.
    // Verify and update the env var before going live.
    console.log('[callback] signature check — valid:', sigValid)
    console.log('[callback]   computed :', computedSig)
    console.log('[callback]   received :', checksumhash)

    const orderId = fields.ORDERID ?? fields.ORDER_ID ?? ''
    const status  = fields.STATUS  ?? ''

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // TXN_PENDING: bank is still processing — leave order in pending_payment,
    // don't redirect to fail. SADAD will send a follow-up TXN_SUCCESS or
    // TXN_FAILURE callback when the bank responds.
    if (status === 'TXN_PENDING') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/fail?orderId=${orderId}&reason=${encodeURIComponent('Your payment is being processed by the bank. You will receive a confirmation shortly.')}`,
        { status: 303 }
      )
    }

    if (status === 'TXN_SUCCESS' && sigValid) {
      await sb
        .from('orders')
        .update({ status: 'paid' })
        .eq('order_number', orderId)
        .eq('status', 'pending_payment')

      const { data: orderData } = await sb
        .from('orders')
        .select('customer_name, customer_phone, delivery_address, pickup_date, pickup_time')
        .eq('order_number', orderId)
        .single()

      const token = crypto
        .createHmac('sha256', process.env.SADAD_SECRET_KEY!)
        .update(orderId)
        .digest('hex')
        .slice(0, 16)

      const qs = new URLSearchParams({
        order:   orderId,
        name:    orderData?.customer_name    ?? '',
        date:    orderData?.pickup_date      ?? '',
        time:    orderData?.pickup_time      ?? '',
        phone:   orderData?.customer_phone   ?? '',
        address: orderData?.delivery_address ?? '',
        token,
      })
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?${qs.toString()}`,
        { status: 303 }
      )
    }

    await sb
      .from('orders')
      .update({ status: 'payment_failed' })
      .eq('order_number', orderId)
      .eq('status', 'pending_payment')

    const reason = fields.RESPMSG ?? 'Payment failed'
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/fail?orderId=${orderId}&reason=${encodeURIComponent(reason)}`,
      { status: 303 }
    )
  } catch (err) {
    console.error('[payment-callback]', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://biteezcustomer.vercel.app'}/checkout/fail`,
      { status: 303 }
    )
  }
}
