import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Clerk makes the authenticated session available to auth() in route handlers.
export default clerkMiddleware(async (auth, req) => {
    if (req.nextUrl.pathname.startsWith('/__clerk')) {
        return
    }

    const { userId } = await auth()
    const isHomePage = req.nextUrl.pathname === '/'
    const isSignInPage = req.nextUrl.pathname.startsWith('/sign-in')

    if (!userId && !isHomePage && !isSignInPage) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    if (userId && (isHomePage || isSignInPage)) {
        return NextResponse.redirect(new URL('/events', req.url))
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
        // Always run for Clerk-specific frontend API routes
        '/__clerk/(.*)',
    ],
}