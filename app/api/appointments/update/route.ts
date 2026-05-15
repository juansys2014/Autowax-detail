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
    const body = await req.json()
    const { id, status, confirmed_by, service, preferred_date, time, vehicle_make, vehicle_color, vin, notes } = body

    const updates: string[] = []
    const values: any[] = []

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
    await pool.execute(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`, values)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('UPDATE ERROR:', err.message, err.code)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}