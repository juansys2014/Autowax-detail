import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'autowax_db',
})

export async function POST(req: NextRequest) {
  try {
    const { id, paid_by, payment_method } = await req.json()

    const [rows] = await pool.execute('SELECT * FROM invoices WHERE id = ?', [id]) as any
    const invoice = rows[0]
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    await pool.execute(
      'UPDATE invoices SET payment_method = ?, status = "paid", paid_at = NOW(), paid_by = ? WHERE id = ?',
      [payment_method, paid_by, id]
    )

    // Auto-generate commission if client has a seller
    const [clientRows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [invoice.client_id]) as any
    const client = clientRows[0]
    if (client?.seller_id) {
      const [sellerRows] = await pool.execute('SELECT * FROM sellers WHERE id = ?', [client.seller_id]) as any
      const seller = sellerRows[0]
      if (seller) {
        const amount = seller.commission_type === 'percent'
          ? Math.round(invoice.total * seller.commission_value / 100 * 100) / 100
          : seller.commission_value

        await pool.execute(
          `INSERT INTO commissions (seller_id, invoice_id, client_id, service, invoice_total, commission_type, commission_rate, amount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [client.seller_id, id, invoice.client_id, 'Service', invoice.total,
           seller.commission_type, seller.commission_value, amount]
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Pay error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}