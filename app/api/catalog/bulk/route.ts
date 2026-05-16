import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

const VALID_CATEGORIES = ['service', 'product']

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type, value, category, notes } = await req.json()

    if (!type || value === undefined) {
      return NextResponse.json({ error: 'Type and value required' }, { status: 400 })
    }
    if (!['percent', 'fixed'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // Parameterized query — no string interpolation
    let sql = 'SELECT id, price FROM service_catalog WHERE active = 1'
    const queryValues: unknown[] = []
    if (category && category !== 'all') {
      if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }
      sql += ' AND category = ?'
      queryValues.push(category)
    }

    const items = await query<any>(sql, queryValues)

    const reason = notes || `Bulk adjustment: ${type === 'percent' ? value + '%' : '$' + value}`

    for (const item of items) {
      let newPrice: number
      if (type === 'percent') {
        newPrice = Math.round(Number(item.price) * (1 + Number(value) / 100) * 100) / 100
      } else {
        newPrice = Math.round((Number(item.price) + Number(value)) * 100) / 100
      }
      if (newPrice < 0) newPrice = 0

      await execute(
        'INSERT INTO service_price_history (service_id, old_price, new_price, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
        [item.id, item.price, newPrice, admin.userId, reason]
      )
      await execute('UPDATE service_catalog SET price = ? WHERE id = ?', [newPrice, item.id])
    }

    return NextResponse.json({ success: true, updated: items.length })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
