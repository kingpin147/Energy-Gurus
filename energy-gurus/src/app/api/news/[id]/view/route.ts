import { db } from "@/db";
import { news } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/news/[id]/view
 * 
 * Increments the view count for a news article.
 * Uses a simple session-based approach: 
 *   - The client sends a sessionKey (stored in sessionStorage).
 *   - If the same sessionKey has already been recorded for this article,
 *     skip the increment.
 * 
 * This prevents double-counting on page refresh while still being lightweight.
 */

// In-memory set of viewed keys (articleId:sessionKey) to deduplicate within the same server instance.
// For a multi-instance deployment, this is best-effort; PostHog or a Redis store would be more precise.
const viewedSet = new Set<string>();

// Limit the set size to prevent memory leaks
const MAX_SET_SIZE = 50_000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const sessionKey = body.sessionKey || "";

    // Build a dedup key
    const dedupKey = `${id}:${sessionKey}`;

    // If we've already counted this view in this server instance, skip
    if (sessionKey && viewedSet.has(dedupKey)) {
      return NextResponse.json({ success: true, deduplicated: true });
    }

    // Increment view count atomically
    await db
      .update(news)
      .set({ viewCount: sql`COALESCE(${news.viewCount}, 0) + 1` })
      .where(eq(news.id, id));

    // Track in memory for dedup
    if (sessionKey) {
      if (viewedSet.size >= MAX_SET_SIZE) {
        viewedSet.clear(); // Reset if we hit the limit
      }
      viewedSet.add(dedupKey);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[news/view] Error incrementing view count:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
