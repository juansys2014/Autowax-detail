import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''

    const clients = await query<any>(`
      SELECT c.id, c.name, c.phone, c.email,
        u.name AS seller_name,
        (SELECT service FROM appointments 
         WHERE client_id = c.id 
         ORDER BY created_at DESC LIMIT 1) AS last_service
      FROM clients c
      LEFT JOIN sellers s ON s.id = c.seller_id
      LEFT JOIN users u ON u.id = s.user_id
      WHERE c.name LIKE ? OR c.phone LIKE ?
      ORDER BY c.name ASC
      LIMIT 50
    `, [`%${q}%`, `%${q}%`])

    return NextResponse.json({ clients })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}