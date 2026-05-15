import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

export async function GET() {
  try {
    const items = await query<any>(`
      SELECT * FROM service_catalog WHERE active = 1
      ORDER BY category, name
    `)

    // Load price history separately for each item
    for (const item of items) {
      const history = await query<any>(`
        SELECT sph.*, u.name AS changed_by_name
        FROM service_price_history sph
        JOIN users u ON u.id = sph.changed_by
        WHERE sph.service_id = ?
        ORDER BY sph.changed_at DESC
      `, [item.id])
      item.price_history = history
    }

    return NextResponse.json({ items })
  } catch (err: any) {
    console.error('Catalog GET error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, category, price } = await req.json()
    if (!name || !price) return NextResponse.json({ error: 'Name and price required' }, { status: 400 })
    const result = await execute(
      'INSERT INTO service_catalog (name, category, price) VALUES (?, ?, ?)',
      [name, category || 'service', price]
    )
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
