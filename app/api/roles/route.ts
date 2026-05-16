import { NextRequest, NextResponse } from 'next/server'
import { roleQueries } from '@/lib/queries'

export async function GET() {
  try {
    const roles = await roleQueries.findAll()
    return NextResponse.json({ roles })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, color, permissions } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const result = await roleQueries.create({ name, description: description || '', color: color || 'blue' })
    if (permissions?.length) {
      await roleQueries.setPermissions(result.insertId, permissions)
    }
    const role = await roleQueries.findById(result.insertId)
    return NextResponse.json({ role })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
