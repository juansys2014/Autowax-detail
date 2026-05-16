import { NextRequest, NextResponse } from 'next/server'
import { roleQueries } from '@/lib/queries'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const { name, description, color, permissions } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    await roleQueries.update(id, { name, description: description || '', color: color || 'blue' })
    if (permissions) {
      await roleQueries.setPermissions(id, permissions)
    }
    const role = await roleQueries.findById(id)
    return NextResponse.json({ role })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const result = await roleQueries.delete(id)
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Role not found or is a system role' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
