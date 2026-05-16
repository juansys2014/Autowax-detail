import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

export type AdminPayload = { userId: number; role: string; name: string }

export async function requireAdmin(): Promise<AdminPayload | null> {
  try {
    const store = await cookies()
    const token = store.get('admin_token')?.value
    if (!token) return null

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) return null

    return verify(token, secret) as AdminPayload
  } catch {
    return null
  }
}
