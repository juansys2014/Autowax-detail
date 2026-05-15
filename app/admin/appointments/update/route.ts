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
    const { id, status, confirmed_by } = await req.json()
    await pool.execute(
      'UPDATE appointments SET status = ?, confirmed_by = ?, confirmed_at = NOW() WHERE id = ?',
      [status, confirmed_by || null, id]
    )
   } catch (err: any) {
    console.error('UPDATE ERROR:', err.message, err.code)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
