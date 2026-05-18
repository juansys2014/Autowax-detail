import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { password } = await req.json()
  if (!password) return NextResponse.json({ ok: false })

  const admins = await query<any>(
    "SELECT password_hash FROM users WHERE active = 1 AND role IN ('superadmin','admin') AND password_hash IS NOT NULL"
  )

  for (const a of admins) {
    if (await bcrypt.compare(password, a.password_hash)) {
      return NextResponse.json({ ok: true })
    }
  }

  return NextResponse.json({ ok: false })
}
