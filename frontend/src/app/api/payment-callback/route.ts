import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body    = await req.formData()
    const status  = body.get('STATUS')  as string ?? ''
    const orderId = body.get('ORDERID') as string ?? ''

    console.log('[callback] SADAD callback received:', Object.fromEntries(body))

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (status === 'TXN_SUCCESS') {
      await sb
        .from('orders')
        .update({ status: 'paid' })
        .eq('order_number', orderId)
        .eq('status', 'pending_payment')

      const { data: orderData } = await sb
        .from('orders')
        .select('customer_name, pickup_date, pickup_time')
        .eq('order_number', orderId)
        .single()

      const qs = new URLSearchParams({
        order: orderId,
        name:  orderData?.customer_name ?? '',
        date:  orderData?.pickup_date   ?? '',
        time:  orderData?.pickup_time   ?? '',
      })
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?${qs.toString()}`
      )
    }

    await sb
      .from('orders')
      .update({ status: 'payment_failed' })
      .eq('order_number', orderId)
      .eq('status', 'pending_payment')

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/fail?order=${orderId}`
    )
  } catch (err) {
    console.error('[payment-callback]', err)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://biteezcustomer.vercel.app'}/checkout/fail`
    )
  }
}
