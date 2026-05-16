import { NextRequest, NextResponse } from 'next/server'
import { roleQueries } from '@/lib/queries'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const roles = await roleQueries.findAll()
    return NextResponse.json({ roles })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, description, color, permissions } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const result = await roleQueries.create({ name, description: description || '', color: color || 'blue' })
    if (permissions?.length) {
      await roleQueries.setPermissions(result.insertId, permissions)
    }
    const role = await roleQueries.findById(result.insertId)
    return NextResponse.json({ role })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
