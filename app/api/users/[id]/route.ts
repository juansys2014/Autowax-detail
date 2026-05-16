import { NextRequest, NextResponse } from 'next/server'
import { userQueries } from '@/lib/queries'
import bcrypt from 'bcryptjs'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const { name, email, phone, password, role, role_id, active } = await req.json()

    const data: any = {}
    if (name     !== undefined) data.name     = name
    if (email    !== undefined) data.email    = email || null
    if (phone    !== undefined) data.phone    = phone || null
    if (role     !== undefined) data.role     = role
    if (role_id  !== undefined) data.role_id  = role_id || null
    if (active   !== undefined) data.active   = active ? 1 : 0
    if (password)               data.password_hash = await bcrypt.hash(password, 10)

    await userQueries.update(id, data)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    await userQueries.deactivate(id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
