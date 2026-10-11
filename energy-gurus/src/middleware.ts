import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
]);

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = clerkKey && clerkKey.startsWith('pk_') && !clerkKey.includes('your_') && clerkKey !== 'pk_test_...';

export default function middleware(req: any) {
    const pathname = req.nextUrl.pathname;
    
    // Skip Clerk middleware for static root files like sitemap.xml and robots.txt
    const isPublicRootFile = pathname === '/sitemap.xml' || pathname === '/robots.txt' || pathname.endsWith('.xml') || pathname.endsWith('.txt');
    if (isPublicRootFile) {
        return NextResponse.next();
    }

    const userAgent = req.headers.get('user-agent') || '';
    const isBot = /googlebot|bingbot|yandexbot|duckduckbot|slurp|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora\ link\ preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp/i.test(userAgent);
    
    // Skip Clerk for bots to prevent infinite redirect loops on test keys (Google Search Console error fix)
    if (isBot) {
        return NextResponse.next();
    }

    // If Clerk is not properly configured, just run directly
    if (!isClerkConfigured) {
        return NextResponse.next();
    }

    // Otherwise, use Clerk's middleware wrapper
    return clerkMiddleware(async (auth, req) => {
        // Protect dashboard routes with Clerk auth
        if (isProtectedRoute(req)) await auth.protect();

        return NextResponse.next();
    })(req, {} as any);
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files (including .xml and .txt)
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ]
};
