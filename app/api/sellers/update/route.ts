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
    const { id, name, phone, email, commission_type, commission_value, active, device_token } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    // Update users table
    const userUpdates: string[] = []
    const userValues: any[] = []
    if (name)                { userUpdates.push('name = ?');  userValues.push(name) }
    if (phone)               { userUpdates.push('phone = ?'); userValues.push(phone) }
    if (email !== undefined) { userUpdates.push('email = ?'); userValues.push(email || null) }
    if (userUpdates.length > 0) {
      userValues.push(id)
      await pool.execute(
        `UPDATE users u JOIN sellers s ON s.user_id = u.id SET ${userUpdates.join(', ')} WHERE s.id = ?`,
        userValues
      )
    }

    // Update sellers table
    const sellerUpdates: string[] = []
    const sellerValues: any[] = []
    if (commission_type  !== undefined) { sellerUpdates.push('commission_type = ?');  sellerValues.push(commission_type) }
    if (commission_value !== undefined) { sellerUpdates.push('commission_value = ?'); sellerValues.push(commission_value) }
    if (active           !== undefined) { sellerUpdates.push('active = ?');           sellerValues.push(active ? 1 : 0) }
    if (device_token     !== undefined) { sellerUpdates.push('device_token = ?');     sellerValues.push(device_token) }
    if (sellerUpdates.length > 0) {
      sellerValues.push(id)
      await pool.execute(`UPDATE sellers SET ${sellerUpdates.join(', ')} WHERE id = ?`, sellerValues)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Seller update error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
