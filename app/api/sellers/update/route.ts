import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, name, phone, email, commission_type, commission_value, active, device_token } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    if (commission_type && !['percent', 'fixed'].includes(commission_type)) {
      return NextResponse.json({ error: 'Invalid commission_type' }, { status: 400 })
    }

    // Update users table
    const userUpdates: string[] = []
    const userValues: unknown[] = []
    if (name  !== undefined) { userUpdates.push('name = ?');  userValues.push(name) }
    if (phone !== undefined) { userUpdates.push('phone = ?'); userValues.push(phone || null) }
    if (email !== undefined) { userUpdates.push('email = ?'); userValues.push(email || null) }
    if (userUpdates.length > 0) {
      userValues.push(id)
      await execute(
        `UPDATE users u JOIN sellers s ON s.user_id = u.id SET ${userUpdates.join(', ')} WHERE s.id = ?`,
        userValues
      )
    }

    // Update sellers table
    const sellerUpdates: string[] = []
    const sellerValues: unknown[] = []
    if (commission_type  !== undefined) { sellerUpdates.push('commission_type = ?');  sellerValues.push(commission_type) }
    if (commission_value !== undefined) { sellerUpdates.push('commission_value = ?'); sellerValues.push(commission_value) }
    if (active           !== undefined) { sellerUpdates.push('active = ?');           sellerValues.push(active ? 1 : 0) }
    if (device_token     !== undefined) { sellerUpdates.push('device_token = ?');     sellerValues.push(device_token) }
    if (sellerUpdates.length > 0) {
      sellerValues.push(id)
      await execute(`UPDATE sellers SET ${sellerUpdates.join(', ')} WHERE id = ?`, sellerValues)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
