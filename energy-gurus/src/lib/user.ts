import { currentUser } from "@clerk/nextjs/server";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  try {
    return await currentUser();
  } catch (error: any) {
    console.warn("Clerk currentUser() failed:", error?.message || "Unknown error");
    return null;
  }
});
