import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'autowax_db',
})

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, price, active, changed_by, notes } = await req.json()

    const [rows] = await pool.execute('SELECT * FROM service_catalog WHERE id = ?', [id]) as any
    const current = rows[0]
    if (!current) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    if (price !== undefined && Number(price) !== Number(current.price)) {
      await pool.execute(
        'INSERT INTO service_price_history (service_id, old_price, new_price, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
        [id, current.price, price, changed_by || 1, notes || null]
      )
    }

    const updates: string[] = []
    const values: any[] = []
    if (name !== undefined)   { updates.push('name = ?');   values.push(name) }
    if (price !== undefined)  { updates.push('price = ?');  values.push(Number(price)) }
    if (active !== undefined) { updates.push('active = ?'); values.push(active) }

    if (updates.length > 0) {
      values.push(id)
      await pool.execute(`UPDATE service_catalog SET ${updates.join(', ')} WHERE id = ?`, values)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Item PATCH error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await pool.execute('UPDATE service_catalog SET active = 0 WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}