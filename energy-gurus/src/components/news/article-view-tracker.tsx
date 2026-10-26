"use client";

import { useEffect, useRef } from "react";

/**
 * ArticleViewTracker
 * 
 * A zero-UI client component that fires a single POST to /api/news/[id]/view
 * on mount. It uses sessionStorage to avoid double-counting when a user
 * navigates back to the same article within the same tab session.
 */
export function ArticleViewTracker({ articleId }: { articleId: string }) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Generate or retrieve a per-tab session key
    let sessionKey = "";
    try {
      const storageKey = `eg_view_session`;
      sessionKey = sessionStorage.getItem(storageKey) || "";
      if (!sessionKey) {
        sessionKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem(storageKey, sessionKey);
      }
    } catch {
      // sessionStorage may not be available (e.g. SSR or privacy mode)
    }

    // Check if this article was already viewed in this session
    const viewedKey = `eg_viewed_${articleId}`;
    try {
      if (sessionStorage.getItem(viewedKey)) return;
      sessionStorage.setItem(viewedKey, "1");
    } catch {
      // proceed anyway
    }

    // Fire-and-forget view tracking
    fetch(`/api/news/${articleId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionKey }),
    }).catch(() => {
      // Silent fail – view tracking is non-critical
    });
  }, [articleId]);

  return null; // Zero UI – invisible tracker
}
