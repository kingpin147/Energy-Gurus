"use server";

import { db } from "@/db";
import { productSerials } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function bulkImportSerials(productId: string, rawSerials: string) {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const serials = rawSerials.split("\n").map(s => s.trim()).filter(s => s.length > 0);
    
    if (serials.length === 0) return;

    const data = serials.map(sn => ({
        productId,
        serialNumber: sn,
        status: 'genuine' as const,
        warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Default 1 year
    }));

    // Use insert with onConflictDoNothing to avoid duplicates crashing the import
    for (const entry of data) {
        try {
            await db.insert(productSerials).values(entry).onConflictDoNothing();
        } catch (e) {
            console.error(`Failed to import SN: ${entry.serialNumber}`);
        }
    }

    revalidatePath("/dashboard/brand", "layout");
}

export async function verifySerialNumber(serialNumber: string) {
    if (!serialNumber) return null;
    
    const result = await db.query.productSerials.findFirst({
        where: (serials, { eq }) => eq(serials.serialNumber, serialNumber),
        with: {
            product: {
                with: {
                    brand: true
                }
            }
        }
    });

    return result;
}
