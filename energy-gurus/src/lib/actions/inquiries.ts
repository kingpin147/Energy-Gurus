"use server";

import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateInquiryStatus(id: string, status: string, notes?: string) {
    await db.update(inquiries)
        .set({ status, adminNotes: notes, updatedAt: new Date() } as any)
        .where(eq(inquiries.id, id));
    
    revalidatePath("/dashboard/inquiries");
}

export async function deleteInquiry(id: string) {
    await db.delete(inquiries).where(eq(inquiries.id, id));
    revalidatePath("/dashboard/inquiries");
}
