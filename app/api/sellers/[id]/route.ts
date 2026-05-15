import { NextRequest, NextResponse } from 'next/server'
import { sellerQueries } from '@/lib/queries'
import QRCode from 'qrcode'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const seller = await sellerQueries.findById(parseInt(params.id))
    if (!seller) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const qrImage = await QRCode.toDataURL(seller.qr_url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 400,
      color: { dark: '#1a1f8a', light: '#ffffff' },
    })

    return NextResponse.json({ seller, qr_image: qrImage })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    await sellerQueries.update(parseInt(params.id), body)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
