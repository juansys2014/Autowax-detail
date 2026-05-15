import { NextRequest, NextResponse } from 'next/server'
import { sellerQueries, userQueries } from '@/lib/queries'
import QRCode from 'qrcode'

export async function GET() {
  try {
    const sellers = await sellerQueries.findAll()
    return NextResponse.json({ sellers })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, commission_type, commission_value } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    // 1 — Create user with role vendedor
    const userResult = await userQueries.create({ name, phone, role: 'vendedor' })
    const userId = userResult.insertId

    // 2 — Generate unique QR code
    const qrCode = `SELLER_${String(userId).padStart(6, '0')}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const qrUrl   = `${baseUrl}/?ref=${qrCode}`

    // 3 — Generate QR image as base64
    const qrImage = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: { dark: '#1a1f8a', light: '#ffffff' },
    })

    // 4 — Create seller record
    await sellerQueries.create({
      user_id:          userId,
      qr_code:          qrCode,
      qr_url:           qrUrl,
      commission_type:  commission_type  || 'percent',
      commission_value: commission_value || 10,
    })

    return NextResponse.json({ success: true, qr_code: qrCode, qr_url: qrUrl, qr_image: qrImage })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
