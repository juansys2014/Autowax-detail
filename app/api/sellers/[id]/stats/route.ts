import { NextRequest, NextResponse } from 'next/server'
import { sellerQueries, commissionQueries, clientQueries } from '@/lib/queries'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sellerId = parseInt(params.id)
    const [stats, clients, commissions] = await Promise.all([
      sellerQueries.getStats(sellerId),
      clientQueries.findBySeller(sellerId),
      commissionQueries.findBySeller(sellerId),
    ])
    return NextResponse.json({ stats, clients, commissions })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
