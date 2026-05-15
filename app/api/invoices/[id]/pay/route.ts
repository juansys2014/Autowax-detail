import { NextRequest, NextResponse } from 'next/server'
import { invoiceQueries, commissionQueries, clientQueries } from '@/lib/queries'
import { execute } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { paid_by, payment_method } = await req.json()
    const invoiceId = parseInt(params.id)

    const invoice = await invoiceQueries.findById(invoiceId)
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    // Update payment method and mark as paid
    await execute(
      'UPDATE invoices SET payment_method = ?, status = "paid", paid_at = NOW(), paid_by = ? WHERE id = ?',
      [payment_method, paid_by, invoiceId]
    )

    // Auto-generate commission if client has a seller
    const client = await clientQueries.findById(invoice.client_id)
    if (client?.seller_id) {
      const commCalc = await commissionQueries.calculateForInvoice(invoiceId, client.seller_id, invoice.total, 'Service')
      if (commCalc) {
        await commissionQueries.create({
          seller_id: client.seller_id,
          invoice_id: invoiceId,
          client_id: invoice.client_id,
          service: 'Service',
          invoice_total: invoice.total,
          commission_type: commCalc.commission_type,
          commission_rate: commCalc.commission_rate,
          amount: commCalc.amount,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
