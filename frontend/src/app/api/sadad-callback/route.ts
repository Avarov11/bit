import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { getSadadSecretKey } from '@/lib/sadad'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[sadad-webhook] received:', JSON.stringify(body))

    const { checksumhash, ...rest } = body
    const secretKey = getSadadSecretKey()

    const sorted = Object.keys(rest).sort()
    const str = secretKey + sorted.map((k: string) => String(rest[k])).join('')
    const calculatedHash = crypto.createHash('sha256').update(str).digest('hex')

    const isValid = calculatedHash === checksumhash
    console.log('[sadad-webhook] signature valid:', isValid)
    console.log('[sadad-webhook] transactionStatus:', body.transactionStatus)
    console.log('[sadad-webhook] websiteRefNo:', body.websiteRefNo)
    console.log('[sadad-webhook] message:', body.message)

    // transactionStatus: 1=in progress, 2=failed, 3=success
    const status: number = Number(body.transactionStatus)
    const orderRef: string = String(body.websiteRefNo ?? '')

    if (orderRef && isValid) {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      if (status === 3) {
        await sb
          .from('orders')
          .update({ status: 'paid' })
          .eq('order_number', orderRef)
          .eq('status', 'pending_payment')
        console.log('[sadad-webhook] order', orderRef, 'marked paid')
      } else if (status === 2) {
        await sb
          .from('orders')
          .update({ status: 'payment_failed' })
          .eq('order_number', orderRef)
          .eq('status', 'pending_payment')
        console.log('[sadad-webhook] order', orderRef, 'marked payment_failed')
      }
      // status 1 (in progress) — leave as pending_payment, await follow-up callback
    }

    // ALWAYS return 200 + success per SADAD's requirement,
    // even if verification fails internally (log it, don't reject)
    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[sadad-webhook] error:', msg)
    // Still return 200 to prevent SADAD from disabling the webhook
    return NextResponse.json({ status: 'success' }, { status: 200 })
  }
}
