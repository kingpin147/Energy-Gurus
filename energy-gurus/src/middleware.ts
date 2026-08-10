import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import { apiRatelimit } from './lib/ratelimit';

const isProtectedRoute = createRouteMatcher([
    '/:locale/dashboard(.*)',
]);

const intlMiddleware = createMiddleware(routing);

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = clerkKey && clerkKey.startsWith('pk_') && !clerkKey.includes('your_') && clerkKey !== 'pk_test_...';

export default function middleware(req: any) {
    const ip = req.ip ?? "127.0.0.1";
    const pathname = req.nextUrl.pathname;
    
    // Only rate-limit actual API routes, NOT page navigation
    // Page navigation caused false 429s due to Next.js prefetching
    const isApiRoute = pathname.startsWith('/api');

    // If Clerk is not properly configured, just run the i18n middleware directly
    if (!isClerkConfigured) {
        return isApiRoute ? undefined : intlMiddleware(req);
    }

    // Otherwise, use Clerk's middleware wrapper
    return clerkMiddleware(async (auth, req) => {
        // Only rate-limit API calls, not page navigation
        if (isApiRoute) {
            const { success } = await apiRatelimit.limit(ip);
            if (!success) {
                // Return a JSON error for API routes
                return NextResponse.json(
                    { error: "Too many requests. Please slow down." },
                    { status: 429 }
                );
            }
            // Skip intl middleware for API routes to avoid /en/api redirects
            return;
        }

        // Protect dashboard routes with Clerk auth
        if (isProtectedRoute(req)) await auth.protect();

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
