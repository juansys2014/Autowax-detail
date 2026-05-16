import { NextRequest, NextResponse } from 'next/server'
import { userQueries } from '@/lib/queries'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await userQueries.findAll()
    return NextResponse.json({ users })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, role, role_id } = await req.json()
    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password are required' }, { status: 400 })
    }
    const password_hash = await bcrypt.hash(password, 10)
    const result = await userQueries.create({ name, email, phone, password_hash, role: role || 'user' })

    if (role_id) {
      await userQueries.update(result.insertId, { role_id })
    }
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (err: any) {
    console.error(err)
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email or phone already in use' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
