import { NextRequest, NextResponse } from 'next/server'
import { invoiceQueries } from '@/lib/queries'
import { requireAdmin } from '@/lib/auth'
import { execute } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id: rawId } = await params
    const invoice = await invoiceQueries.findById(parseInt(rawId))
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ invoice })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    const { items, payment_method, notes } = await req.json()

    if (!items?.length) return NextResponse.json({ error: 'Items required' }, { status: 400 })

    const subtotal = items.reduce((sum: number, i: any) => sum + Number(i.quantity) * Number(i.unit_price), 0)
    const total = subtotal

    await execute(
      'UPDATE invoices SET payment_method = ?, notes = ?, subtotal = ?, total = ? WHERE id = ?',
      [payment_method, notes || null, subtotal, total, id]
    )

    await execute('DELETE FROM invoice_items WHERE invoice_id = ?', [id])
    for (const item of items) {
      const lineTotal = Number(item.quantity) * Number(item.unit_price)
      await invoiceQueries.createItem({
        invoice_id:  id,
        description: item.description,
        quantity:    Number(item.quantity),
        unit_price:  Number(item.unit_price),
        total:       lineTotal,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)

    await execute('DELETE FROM commissions WHERE invoice_id = ?', [id])
    await execute('DELETE FROM invoice_items WHERE invoice_id = ?', [id])
    await execute('DELETE FROM invoices WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
