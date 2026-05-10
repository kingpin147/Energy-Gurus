"use server";

import { db } from "@/db";
import { podcasts, liveQA } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";

export async function addPodcast(data: typeof podcasts.$inferInsert) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") throw new Error("Unauthorized");

  await db.insert(podcasts).values(data);
  revalidatePath("/dashboard/podcasts");
  revalidatePath("/");
}

export async function addLiveQA(data: typeof liveQA.$inferInsert) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") throw new Error("Unauthorized");

  await db.insert(liveQA).values(data);
  revalidatePath("/dashboard/podcasts");
  revalidatePath("/");
}
