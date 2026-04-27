import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)',
  '/auth/forget-password(.*)',
  '/api/uploadthing(.*)', 
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return

  const { userId } = await auth()

  if (req.nextUrl.pathname.startsWith('/api')) {
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }
    return
  }

  if (!userId) {
    const signUpUrl = new URL('/auth/sign-up', req.url)
    signUpUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signUpUrl)
  }
})

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
}