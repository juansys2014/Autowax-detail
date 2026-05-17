import { NextRequest, NextResponse } from 'next/server'
import { invoiceQueries, commissionQueries, clientQueries } from '@/lib/queries'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status    = searchParams.get('status')    || undefined
    const client_id = searchParams.get('client_id') ? parseInt(searchParams.get('client_id')!) : undefined
    const [invoices, stats] = await Promise.all([
      invoiceQueries.findAll({ status, client_id }),
      invoiceQueries.getMonthStats(),
    ])
    return NextResponse.json({ invoices, stats })
  } catch (err: any) {
    console.error('INVOICES ERROR:', err.message, err.code)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { client_id, appointment_id, items, payment_method, notes, paid_by } = body

    if (!client_id || !items?.length) {
      return NextResponse.json({ error: 'Client and items are required' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, i: any) => sum + i.quantity * i.unit_price, 0)
    const tax      = 0
    const total    = subtotal + tax

    // Get next invoice number
    const invoiceNumber = await invoiceQueries.getNextNumber()

    // Create invoice
    const result = await invoiceQueries.create({
      invoice_number: invoiceNumber,
      client_id,
      appointment_id: appointment_id || undefined,
      subtotal,
      tax,
      total,
      payment_method,
      notes,
    })
    const invoiceId = result.insertId

    // Save line items
    for (const item of items) {
      const lineTotal = Number(item.quantity) * Number(item.unit_price)
      await invoiceQueries.createItem({
        invoice_id:  invoiceId,
        description: item.description,
        quantity:    Number(item.quantity),
        unit_price:  Number(item.unit_price),
        total:       lineTotal,
      })
    }

    // Mark as paid immediately if paid_by provided
    if (paid_by) {
      await invoiceQueries.markPaid(invoiceId, paid_by)

      // Auto-generate commissions for seller
      const client = await clientQueries.findById(client_id)
      if (client?.seller_id) {
        const service = items.map((i: any) => i.description).join(', ')
        const commCalc = await commissionQueries.calculateForInvoice(invoiceId, client.seller_id, total, service)
        if (commCalc) {
          await commissionQueries.create({
            seller_id:       client.seller_id,
            invoice_id:      invoiceId,
            client_id,
            service,
            invoice_total:   total,
            commission_type: commCalc.commission_type,
            commission_rate: commCalc.commission_rate,
            amount:          commCalc.amount,
          })
        }
      }
    }

    return NextResponse.json({ success: true, invoice_id: invoiceId, invoice_number: invoiceNumber })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
