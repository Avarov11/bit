import { NextRequest, NextResponse } from 'next/server'
import { buildSadadForm } from '@/lib/sadad'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, amount, customerEmail, customerMobile, itemName } = body

    if (!orderId || !amount || !customerEmail || !customerMobile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { formHtml } = buildSadadForm({
      orderId,
      amount: Number(amount).toFixed(2),
      customerEmail,
      customerMobile,
      itemName: itemName || 'Biteez Order',
    })

    return NextResponse.json({ formHtml })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[checkout] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
