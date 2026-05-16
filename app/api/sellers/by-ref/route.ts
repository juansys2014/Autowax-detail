import { NextRequest, NextResponse } from 'next/server'
import { sellerQueries } from '@/lib/queries'

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'Missing ref' }, { status: 400 })

  try {
    const seller = await sellerQueries.findByQrCode(ref)
    if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    return NextResponse.json({ name: seller.name, id: seller.id })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
