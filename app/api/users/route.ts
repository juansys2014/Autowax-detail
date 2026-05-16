import { NextRequest, NextResponse } from 'next/server'
import { userQueries } from '@/lib/queries'
import { requireAdmin } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const users = await userQueries.findAll()
    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, email, phone, password, role, role_id } = await req.json()
    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    const password_hash = await bcrypt.hash(password, 10)
    const result = await userQueries.create({ name, email: email || null, phone: phone || null, password_hash, role: role || 'user' })

    if (role_id) {
      await userQueries.update(result.insertId, { role_id: parseInt(role_id) })
    }
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email or phone already in use' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
