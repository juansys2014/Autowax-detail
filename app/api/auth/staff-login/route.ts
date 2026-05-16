import { NextRequest, NextResponse } from 'next/server'
import { userQueries } from '@/lib/queries'
import { sign } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await userQueries.findByEmail(email.trim().toLowerCase())
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('NEXTAUTH_SECRET is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const token = sign(
      { userId: user.id, role: user.role, name: user.name },
      secret,
      { expiresIn: '8h' }
    )

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
