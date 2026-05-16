import { NextRequest, NextResponse } from 'next/server'
import { userQueries } from '@/lib/queries'
import { requireAdmin } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    const { name, email, phone, password, role, role_id, active } = await req.json()

    if (password && password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (name     !== undefined) data.name     = name
    if (email    !== undefined) data.email    = email || null
    if (phone    !== undefined) data.phone    = phone || null
    if (role     !== undefined) data.role     = role
    if (role_id  !== undefined) data.role_id  = role_id || null
    if (active   !== undefined) data.active   = active ? 1 : 0
    if (password)               data.password_hash = await bcrypt.hash(password, 10)

    await userQueries.update(id, data)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    await userQueries.deactivate(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
