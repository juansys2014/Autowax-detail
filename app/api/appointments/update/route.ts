import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, status, confirmed_by, service, preferred_date, time, vehicle_make, vehicle_color, vin, notes } = body

    const updates: string[] = []
    const values: unknown[] = []

    if (service        !== undefined) { updates.push('service = ?');        values.push(service) }
    if (preferred_date !== undefined) { updates.push('preferred_date = ?'); values.push(preferred_date || null) }
    if (time           !== undefined) { updates.push('time = ?');           values.push(time || null) }
    if (vehicle_make   !== undefined) { updates.push('vehicle_make = ?');   values.push(vehicle_make || null) }
    if (vehicle_color  !== undefined) { updates.push('vehicle_color = ?');  values.push(vehicle_color || null) }
    if (vin            !== undefined) { updates.push('vin = ?');            values.push(vin || null) }
    if (notes          !== undefined) { updates.push('notes = ?');          values.push(notes || null) }
    if (status         !== undefined) { updates.push('status = ?');         values.push(status) }
    if (confirmed_by   !== undefined) { updates.push('confirmed_by = ?');   values.push(confirmed_by) }

    if (updates.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    values.push(id)
    await execute(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`, values)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
