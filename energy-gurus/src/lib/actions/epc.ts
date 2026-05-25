"use server";

import { db } from "@/db";
import { epcInstallers, epcOffices, epcProjects, users } from "@/db/schema";
import { getUserRole } from "@/lib/roles";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { redis, CACHE_KEYS } from "@/lib/redis";

export async function updateEpcProfile(data: FormData | Partial<typeof epcInstallers.$inferInsert>) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!user) throw new Error("User not found");

  const role = await getUserRole();
  const isAdmin = role === "admin" || role === "super-admin";

  const isFormData = data instanceof FormData;
  const updateData = isFormData ? {
    companyName: data.get("companyName") as string,
    ceoName: data.get("ceoName") as string,
    sectors: data.get("sectors") ? JSON.parse(data.get("sectors") as string) : [],
    certifications: data.get("certifications") ? JSON.parse(data.get("certifications") as string) : [],
    about: data.get("about") as string,
    website: data.get("website") as string,
  } : data;

  let targetUserId = user.id;
  if (!isFormData && (data as any).userId && isAdmin) {
    targetUserId = (data as any).userId;
  }

  const [existingEpc] = await db.select().from(epcInstallers).where(eq(epcInstallers.userId, targetUserId));
  if (!existingEpc) throw new Error("EPC profile not found");

  await db.update(epcInstallers)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(epcInstallers.userId, targetUserId));

  // Invalidate Cache
  await redis.del(CACHE_KEYS.EPC_DETAILS(existingEpc.id));
  await redis.del(CACHE_KEYS.EPCS_LIST);

  // Revalidate Next.js tag for EPC list & homepage
  revalidateTag('epcs', {});
  revalidateTag('homepage', {});

  revalidatePath("/dashboard/epc");
  revalidatePath("/epcs");
}

// Office Actions
export async function addEpcOffice(epcId: string, data: Omit<typeof epcOffices.$inferInsert, "epcId" | "id" | "createdAt">) {
  await db.insert(epcOffices).values({
    ...data,
    epcId,
  });
  await redis.del(CACHE_KEYS.EPC_DETAILS(epcId));
  revalidateTag('epcs', {});
  revalidateTag('homepage', {});
  revalidatePath("/dashboard/epc");
  revalidatePath("/epcs", "page");
}

export async function updateEpcOffice(officeId: string, data: Partial<typeof epcOffices.$inferInsert>) {
  const [office] = await db.select().from(epcOffices).where(eq(epcOffices.id, officeId));
  await db.update(epcOffices).set(data).where(eq(epcOffices.id, officeId));
  if (office) {
    await redis.del(CACHE_KEYS.EPC_DETAILS(office.epcId));
    revalidateTag('epcs', {});
    revalidateTag('homepage', {});
  }
  revalidatePath("/dashboard/epc");
}

export async function deleteEpcOffice(officeId: string) {
  const [office] = await db.select().from(epcOffices).where(eq(epcOffices.id, officeId));
  await db.delete(epcOffices).where(eq(epcOffices.id, officeId));
  if (office) {
    await redis.del(CACHE_KEYS.EPC_DETAILS(office.epcId));
    revalidateTag('epcs', {});
    revalidateTag('homepage', {});
  }
  revalidatePath("/dashboard/epc");
}

// Project Actions
export async function addEpcProject(epcId: string, data: Omit<typeof epcProjects.$inferInsert, "epcId" | "id" | "createdAt" | "updatedAt">) {
  await db.insert(epcProjects).values({
    ...data,
    epcId,
  });
  await redis.del(CACHE_KEYS.EPC_DETAILS(epcId));
  revalidateTag('epcs', {});
  revalidateTag('homepage', {});
  revalidatePath("/dashboard/epc");
  revalidatePath("/epcs", "page");
}

export async function updateEpcProject(projectId: string, data: Partial<typeof epcProjects.$inferInsert>) {
  const [project] = await db.select().from(epcProjects).where(eq(epcProjects.id, projectId));
  await db.update(epcProjects).set({ ...data, updatedAt: new Date() }).where(eq(epcProjects.id, projectId));
  if (project) {
    await redis.del(CACHE_KEYS.EPC_DETAILS(project.epcId));
    revalidateTag('epcs', {});
    revalidateTag('homepage', {});
  }
  revalidatePath("/dashboard/epc");
}

export async function deleteEpcProject(projectId: string) {
  const [project] = await db.select().from(epcProjects).where(eq(epcProjects.id, projectId));
  await db.delete(epcProjects).where(eq(epcProjects.id, projectId));
  if (project) {
    await redis.del(CACHE_KEYS.EPC_DETAILS(project.epcId));
    revalidateTag('epcs', {});
    revalidateTag('homepage', {});
  }
  revalidatePath("/dashboard/epc");
}
