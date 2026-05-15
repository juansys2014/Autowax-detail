import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { type, value, category, changed_by, notes } = await req.json()

    if (!type || value === undefined) return NextResponse.json({ error: 'Type and value required' }, { status: 400 })

    let whereClause = 'WHERE active = 1'
    if (category && category !== 'all') whereClause += ` AND category = '${category}'`

    const items = await query<any>(`SELECT id, price FROM service_catalog ${whereClause}`)

    for (const item of items) {
      let newPrice: number
      if (type === 'percent') {
        newPrice = Math.round(Number(item.price) * (1 + Number(value) / 100) * 100) / 100
      } else {
        newPrice = Math.round((Number(item.price) + Number(value)) * 100) / 100
      }
      if (newPrice < 0) newPrice = 0

      const reason = notes || `Bulk adjustment: ${type === 'percent' ? value + '%' : '$' + value}`
      await execute(
        'INSERT INTO service_price_history (service_id, old_price, new_price, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
        [item.id, item.price, newPrice, changed_by || 1, reason]
      )
      await execute('UPDATE service_catalog SET price = ? WHERE id = ?', [newPrice, item.id])
    }

    return NextResponse.json({ success: true, updated: items.length })
  } catch (err: any) {
    console.error('Bulk update error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
