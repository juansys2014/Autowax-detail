import { NextRequest, NextResponse } from 'next/server'
import { commissionQueries } from '@/lib/queries'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const seller_id = searchParams.get('seller_id') ? parseInt(searchParams.get('seller_id')!) : undefined
    const status    = searchParams.get('status') || undefined

    const commissions = seller_id
      ? await commissionQueries.findBySeller(seller_id, status)
      : await commissionQueries.findAll({ seller_id, status })

    return NextResponse.json({ commissions })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, commission_ids, seller_id, paid_by, method, notes } = body

    if (action === 'pay') {
      // Create payment record
      const total = body.total
      const payResult = await commissionQueries.createPayment({ seller_id, total, paid_by, method, notes })
      // Mark commissions as paid
      await commissionQueries.markPaid(commission_ids, payResult.insertId)
      return NextResponse.json({ success: true, payment_id: payResult.insertId })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
