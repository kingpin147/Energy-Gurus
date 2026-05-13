import { currentUser } from "@clerk/nextjs/server";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  try {
    return await currentUser();
  } catch (error) {
    console.error("Clerk currentUser() failed:", error);
    return null;
  }
});
