import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin pages require admin_token cookie
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Seller pages require seller_token cookie
  if (pathname.startsWith('/seller')) {
    const token = req.cookies.get('seller_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*'],
}
