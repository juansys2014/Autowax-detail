import { NextRequest, NextResponse } from 'next/server'
import { clientQueries } from '@/lib/queries'

export async function GET() {
  try {
    const clients = await clientQueries.findAll()
    return NextResponse.json({ clients })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, seller_id } = await req.json()
    if (!name || !phone) return NextResponse.json({ error: 'Name and phone required' }, { status: 400 })
    const result = await clientQueries.create({ name, phone, email, seller_id })
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'Phone already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
