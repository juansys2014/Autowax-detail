import { NextRequest, NextResponse } from 'next/server'
import { sellerQueries } from '@/lib/queries'
import QRCode from 'qrcode'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const seller = await sellerQueries.findById(parseInt(params.id))
    if (!seller) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const qrImage = await QRCode.toDataURL(seller.qr_url, {
      errorCorrectionLevel: 'M', margin: 2, width: 400,
      color: { dark: '#1a1f8a', light: '#ffffff' },
    })
    return NextResponse.json({ seller, qr_image: qrImage })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id   = parseInt(params.id)
    const body = await req.json()
    const { name, phone, email, commission_type, commission_value, active, device_token } = body

    const userFields: any = {}
    if (name  !== undefined) userFields.name  = name
    if (phone !== undefined) userFields.phone = phone
    if (email !== undefined) userFields.email = email ?? null
    if (Object.keys(userFields).length > 0) await sellerQueries.updateUser(id, userFields)

    const sellerFields: any = {}
    if (commission_type  !== undefined) sellerFields.commission_type  = commission_type
    if (commission_value !== undefined) sellerFields.commission_value = commission_value
    if (active           !== undefined) sellerFields.active           = active ? 1 : 0
    if (device_token     !== undefined) sellerFields.device_token     = device_token ?? null
    if (Object.keys(sellerFields).length > 0) await sellerQueries.update(id, sellerFields)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Seller PATCH error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}