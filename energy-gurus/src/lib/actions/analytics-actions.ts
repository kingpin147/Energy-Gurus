"use server";

import { revalidatePath } from "next/cache";

export async function refreshAnalytics() {
  try {
    revalidatePath("/dashboard/analytics");
    return { success: true };
  } catch (error) {
    console.error("Error revalidating analytics path:", error);
    return { success: false };
  }
}
