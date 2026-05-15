import { NextRequest, NextResponse } from 'next/server'
import { userQueries, sellerQueries } from '@/lib/queries'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'autowax-secret-2025'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })

    // Clean phone — keep digits only
    const cleanPhone = phone.replace(/\D/g, '')

    const user = await userQueries.findByPhone(cleanPhone)
      || await userQueries.findByPhone(`1${cleanPhone}`)

    if (!user || user.role !== 'vendedor') {
      return NextResponse.json({ error: 'Phone not registered as a seller' }, { status: 401 })
    }

    const seller = await sellerQueries.findByUserId(user.id)
    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 401 })
    }

    // Generate JWT token for PWA
    const token = sign(
      { userId: user.id, sellerId: seller.id, role: 'vendedor', name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    const response = NextResponse.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
      seller: { id: seller.id, qr_code: seller.qr_code, qr_url: seller.qr_url },
    })

    // Set cookie for PWA
    response.cookies.set('seller_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
