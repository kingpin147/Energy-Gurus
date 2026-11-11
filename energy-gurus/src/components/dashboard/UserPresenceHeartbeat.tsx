"use client";

import { useEffect } from "react";
import { recordUserHeartbeat } from "@/lib/actions/users";

export function UserPresenceHeartbeat() {
  useEffect(() => {
    // Immediate heartbeat on mount
    recordUserHeartbeat().catch(() => {});

    // Recurring heartbeat every 60 seconds
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        recordUserHeartbeat().catch(() => {});
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

