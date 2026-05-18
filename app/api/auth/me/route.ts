import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { queryOne } from '@/lib/db'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (admin.role === 'superadmin') {
    return NextResponse.json({
      userId: admin.userId, name: admin.name, role: admin.role,
      billingPerms: { can_edit: true, can_delete: true },
    })
  }

  const user = await queryOne<any>('SELECT role_id FROM users WHERE id = ?', [admin.userId])
  if (!user?.role_id) {
    return NextResponse.json({
      userId: admin.userId, name: admin.name, role: admin.role,
      billingPerms: { can_edit: false, can_delete: false },
    })
  }

  const perm = await queryOne<any>(
    "SELECT can_edit, can_delete FROM role_permissions WHERE role_id = ? AND module = 'billing'",
    [user.role_id]
  )

  return NextResponse.json({
    userId: admin.userId, name: admin.name, role: admin.role,
    billingPerms: {
      can_edit:   Boolean(perm?.can_edit),
      can_delete: Boolean(perm?.can_delete),
    },
  })
}
