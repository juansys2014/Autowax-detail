import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const vin = searchParams.get('vin')?.trim().toUpperCase()

  if (!vin || vin.length !== 17) {
    return NextResponse.json({ error: 'VIN must be exactly 17 characters' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    )
    const data = await res.json()

    if (!data.Results) {
      return NextResponse.json({ error: 'Could not decode VIN' }, { status: 400 })
    }

    const get = (name: string) =>
      data.Results.find((r: any) => r.Variable === name)?.Value || ''

    const make  = get('Make')
    const model = get('Model')
    const year  = get('Model Year')
    const trim  = get('Trim')

    if (!make || make === 'null' || make === '') {
      return NextResponse.json({ error: 'VIN not found or invalid' }, { status: 404 })
    }

    return NextResponse.json({
      vin,
      make,
      model,
      year,
      trim,
      display: `${year} ${make} ${model}${trim ? ' ' + trim : ''}`.trim(),
    })
  } catch {
    return NextResponse.json({ error: 'VIN lookup failed' }, { status: 500 })
  }
}
