import { NextRequest, NextResponse } from 'next/server'
import { query, execute, queryOne } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { name, price, active, changed_by, notes } = body
    const id = parseInt(params.id)

    const current = await queryOne<any>('SELECT * FROM service_catalog WHERE id = ?', [id])
    if (!current) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    // Log price change in history if price changed
    if (price !== undefined && Number(price) !== Number(current.price)) {
      await execute(
        'INSERT INTO service_price_history (service_id, old_price, new_price, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
        [id, current.price, price, changed_by || 1, notes || null]
      )
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    if (name !== undefined)   { updates.push('name = ?');   values.push(name) }
    if (price !== undefined)  { updates.push('price = ?');  values.push(Number(price)) }
    if (active !== undefined) { updates.push('active = ?'); values.push(active) }

    if (updates.length > 0) {
      values.push(id)
      await execute(`UPDATE service_catalog SET ${updates.join(', ')} WHERE id = ?`, values)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Catalog PATCH error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await execute('UPDATE service_catalog SET active = 0 WHERE id = ?', [parseInt(params.id)])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
