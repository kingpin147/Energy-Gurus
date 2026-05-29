import { db } from "@/db";
import { liveQA } from "@/db/schema";
import { desc, eq, asc, or, and } from "drizzle-orm";

/**
 * Shared logic to determine which Live QA session should be featured/featured.
 * Priority: 
 * 1. Current LIVE session (newest)
 * 2. UPCOMING session (closest to current time)
 * 3. ARCHIVED session (fallback to newest)
 */
export async function getFeaturedLiveQASession() {
    try {
        // 1. Check for LIVE sessions
        const activeQA = await db.select()
            .from(liveQA)
            .where(eq(liveQA.status, 'live'))
            .orderBy(desc(liveQA.createdAt))
            .limit(1);

        if (activeQA.length > 0) return activeQA[0];

        // 2. Check for UPCOMING sessions
        // We order by sessionDate asc to get the one starting soonest
        const upcomingQA = await db.select()
            .from(liveQA)
            .where(eq(liveQA.status, 'upcoming'))
            .orderBy(asc(liveQA.sessionDate))
            .limit(1);

        if (upcomingQA.length > 0) return upcomingQA[0];

        // 3. Fallback to latest session (likely archived)
        const latestQA = await db.select()
            .from(liveQA)
            .orderBy(desc(liveQA.createdAt))
            .limit(1);

        return latestQA[0] || null;
    } catch (error) {
        console.error("Failed to fetch featured Live QA session:", error);
        return null;
    }
}
