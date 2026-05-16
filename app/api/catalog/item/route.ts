import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, name, price, active, notes } = await req.json()

    const current = await queryOne<any>('SELECT * FROM service_catalog WHERE id = ?', [id])
    if (!current) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    if (price !== undefined && Number(price) !== Number(current.price)) {
      await execute(
        'INSERT INTO service_price_history (service_id, old_price, new_price, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
        [id, current.price, price, admin.userId, notes || null]
      )
    }

    const updates: string[] = []
    const values: unknown[] = []
    if (name   !== undefined) { updates.push('name = ?');   values.push(name) }
    if (price  !== undefined) { updates.push('price = ?');  values.push(Number(price)) }
    if (active !== undefined) { updates.push('active = ?'); values.push(active) }

    if (updates.length > 0) {
      values.push(id)
      await execute(`UPDATE service_catalog SET ${updates.join(', ')} WHERE id = ?`, values)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await req.json()
    await execute('UPDATE service_catalog SET active = 0 WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
