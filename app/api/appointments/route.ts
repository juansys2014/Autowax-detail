import { NextRequest, NextResponse } from 'next/server'
import { clientQueries, appointmentQueries, sellerQueries } from '@/lib/queries'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, phone, email, service, vehicle_make, vehicle_color, vin, preferred_date, notes, seller_ref } = body

    if (!fullName || !phone || !service) {
      return NextResponse.json({ error: 'Name, phone and service are required' }, { status: 400 })
    }

    // 1 — Find or create client
    let client = await clientQueries.findByPhone(phone)
    let sellerId: number | undefined

    // 2 — Resolve seller from QR ref
    if (seller_ref) {
      const seller = await sellerQueries.findByQrCode(seller_ref)
      if (seller) sellerId = seller.id
    }

    if (!client) {
      const result = await clientQueries.create({
        name: fullName,
        phone,
        email: email || undefined,
        seller_id: sellerId,
      })
      client = { id: result.insertId }
    } else {
      if (sellerId && !client.seller_id) {
        await clientQueries.updateSeller(client.id, sellerId)
      }
      if (!sellerId && client.seller_id) {
        sellerId = client.seller_id
      }
    }

    // 3 — Create appointment
    const apptResult = await appointmentQueries.create({
      client_id:     client.id,
      seller_id:     sellerId,
      service,
      vehicle_make:  vehicle_make  || undefined,
      vehicle_color: vehicle_color || undefined,
      vin:           vin           || undefined,
      preferred_date: preferred_date || undefined,
      notes:         notes         || undefined,
    })

    return NextResponse.json({
      success: true,
      appointment_id: apptResult.insertId,
      message: "Request received! We'll call you to confirm.",
    })

  } catch (err: any) {
    console.error('Book appointment error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const date   = searchParams.get('date')   || undefined
    const appointments = await appointmentQueries.findAll({ status, date })
    return NextResponse.json({ appointments })
  } catch (err: any) {
    console.error('Get appointments error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
