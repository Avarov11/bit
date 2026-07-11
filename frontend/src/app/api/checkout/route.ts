import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { initiateSadadPayment } from '@/lib/sadad'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { order, subtotal } = await req.json()
    const items = order.items as Array<{ productName: string; unitPrice: number; quantity: number }>

    // Save order to Supabase as pending_payment
    const orderNumber = Math.floor(100_000 + Math.random() * 900_000).toString()
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await sb.from('orders').insert({
      ...order,
      order_number:   orderNumber,
      payment_method: 'sadad_online',
      status:         'pending_payment',
    })
    if (error) throw error

    const itemName =
      items.length === 1
        ? items[0].productName
        : `Biteez Order (${items.length} items)`

    const formHtml = await initiateSadadPayment({
      orderId:        orderNumber,
      amount:         Number(subtotal).toFixed(2),
      customerEmail:  order.customer_email  ?? '',
      customerMobile: order.customer_phone  ?? '',
      customerId:     order.customer_phone  ?? orderNumber,
      itemName,
    })

    return NextResponse.json({ formHtml, orderNumber })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error)
    console.error('[checkout]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
