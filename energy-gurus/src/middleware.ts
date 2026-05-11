import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import { ratelimit } from './lib/ratelimit';

const isProtectedRoute = createRouteMatcher([
    '/:locale/dashboard(.*)',
]);

const intlMiddleware = createMiddleware(routing);

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = clerkKey && clerkKey.startsWith('pk_') && !clerkKey.includes('your_') && clerkKey !== 'pk_test_...';

export default function middleware(req: any) {
    const ip = req.ip ?? "127.0.0.1";
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');

    // If Clerk is not properly configured, just run the i18n middleware directly
    if (!isClerkConfigured) {
        return isApiRoute ? undefined : intlMiddleware(req);
    }

    // Otherwise, use Clerk's middleware wrapper
    return clerkMiddleware(async (auth, req) => {
        // Rate limiting for API and Dashboard
        if (isApiRoute || req.nextUrl.pathname.includes('/dashboard')) {
            const { success } = await ratelimit.limit(ip);
            if (!success) {
                return new NextResponse("Too Many Requests", { status: 429 });
            }
        }

        if (isProtectedRoute(req)) await auth.protect();
        
        // Skip intl middleware for API routes to avoid /en/api redirects
        if (isApiRoute) return;

        return intlMiddleware(req);
    })(req, {} as any);
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
