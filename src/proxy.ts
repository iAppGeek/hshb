import { NextResponse } from 'next/server'

import { auth } from '@/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const isLoginPage = pathname === '/portal/login'
  const isReportsPage = pathname.startsWith('/portal/reports')

  if (!isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/portal/login', req.url))
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/portal/dashboard', req.url))
  }

  // Only admin and headteacher can access reports
  if (isReportsPage) {
    const role = req.auth?.user?.role
    if (role !== 'admin' && role !== 'headteacher') {
      return NextResponse.redirect(new URL('/portal/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: ['/portal/:path*'],
}
