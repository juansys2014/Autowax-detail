import { NextRequest, NextResponse } from 'next/server'
import { appointmentQueries, commissionQueries, invoiceQueries } from '@/lib/queries'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const body = await req.json()
    const { status, confirmed_by } = body

    await appointmentQueries.updateStatus(id, status, confirmed_by)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const appointment = await appointmentQueries.findById(parseInt(params.id))
    if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ appointment })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
