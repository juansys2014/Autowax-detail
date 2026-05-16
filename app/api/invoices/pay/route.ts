import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, payment_method } = await req.json()

    const invoice = await queryOne<any>('SELECT * FROM invoices WHERE id = ?', [id])
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    await execute(
      'UPDATE invoices SET payment_method = ?, status = "paid", paid_at = NOW(), paid_by = ? WHERE id = ?',
      [payment_method, admin.userId, id]
    )

    // Auto-generate commission if client has a seller
    const client = await queryOne<any>('SELECT * FROM clients WHERE id = ?', [invoice.client_id])
    if (client?.seller_id) {
      const seller = await queryOne<any>('SELECT * FROM sellers WHERE id = ?', [client.seller_id])
      if (seller) {
        const amount = seller.commission_type === 'percent'
          ? Math.round(invoice.total * seller.commission_value / 100 * 100) / 100
          : seller.commission_value

        await execute(
          `INSERT INTO commissions (seller_id, invoice_id, client_id, service, invoice_total, commission_type, commission_rate, amount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [client.seller_id, id, invoice.client_id, 'Service', invoice.total,
           seller.commission_type, seller.commission_value, amount]
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
