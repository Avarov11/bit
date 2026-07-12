import { NextRequest, NextResponse } from 'next/server'
import { generateSignature } from '@/lib/sadad'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string>
    const { checksumhash, ...sigParams } = body

    const computedSig = generateSignature(sigParams, process.env.SADAD_SECRET_KEY!)
    const sigValid    = computedSig === checksumhash
    console.log('[webhook] SADAD webhook received, sig valid:', sigValid, 'status:', body.transactionStatus)

    return NextResponse.json({ status: 'success' })
  } catch (err) {
    console.error('[webhook]', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
