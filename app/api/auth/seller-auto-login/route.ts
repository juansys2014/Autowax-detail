import { NextRequest, NextResponse } from 'next/server'
import { sellerQueries, userQueries } from '@/lib/queries'
import { sign } from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

    const seller = await sellerQueries.findByQrCode(code)
    if (!seller || !seller.active) {
      return NextResponse.json({ error: 'Invalid or inactive seller' }, { status: 401 })
    }

    const user = await userQueries.findById(seller.user_id)
    if (!user || user.role !== 'vendedor') {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) return NextResponse.json({ error: 'Server config error' }, { status: 500 })

    const token = sign(
      { userId: user.id, sellerId: seller.id, role: 'vendedor', name: user.name },
      secret,
      { expiresIn: '30d' }
    )

    const response = NextResponse.json({ success: true })
    response.cookies.set('seller_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return response
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
