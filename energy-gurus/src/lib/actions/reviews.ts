"use server";

import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { eq, avg, count, and, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { getUserRole } from "@/lib/roles";

export async function submitReview(formData: FormData) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) throw new Error("Must be signed in to review");

        // Find the internal DB user
        const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
        if (!user) throw new Error("User record not found");

        const targetId = formData.get("targetId") as string;
        const targetType = formData.get("targetType") as "epc" | "brand";
        const rating = parseInt(formData.get("rating") as string);
        const comment = formData.get("comment") as string;
        const reviewerName = (formData.get("reviewerName") as string)?.trim();

        // Always update the display name with what the reviewer typed
        // so it shows correctly in the review list
        if (reviewerName) {
            await db.update(users)
                .set({ name: reviewerName, updatedAt: new Date() })
                .where(eq(users.clerkId, clerkId));
        }

        await db.insert(reviews).values({
            authorId: user.id,
            targetId,
            targetType,
            rating,
            comment,
        });

        // Invalidate Redis cache for specific profiles and list cache keys
        try {
            if (targetType === "brand") {
                await redis.del(CACHE_KEYS.BRAND_DETAILS(targetId), CACHE_KEYS.BRANDS_LIST);
            } else if (targetType === "epc") {
                await redis.del(CACHE_KEYS.EPC_DETAILS(targetId), CACHE_KEYS.EPCS_LIST);
            }
        } catch (error) {
            console.error("Failed to delete Redis cache in submitReview:", error);
        }

        revalidatePath("/", "layout");
    } catch (error) {
        console.error("[submitReview Error]:", error);
        throw error;
    }
}

export async function getProfileRating(targetId: string) {
    const result = await db.select({
        average: avg(reviews.rating),
        total: count(reviews.id),
    })
        .from(reviews)
        .where(eq(reviews.targetId, targetId));

    return {
        rating: result[0]?.average ? parseFloat(result[0].average) : null,
        count: result[0]?.total || 0,
    };
}

export async function getTeamRating(targetId: string, targetType: "epc" | "brand") {
    const result = await db.select({
        average: avg(reviews.rating),
        total: count(reviews.id),
    })
        .from(reviews)
        .innerJoin(users, eq(reviews.authorId, users.id))
        .where(
            and(
                eq(reviews.targetId, targetId),
                eq(reviews.targetType, targetType),
                inArray(users.role, ["admin", "super-admin"])
            )
        );

    return {
        rating: result[0]?.average ? parseFloat(result[0].average) : null,
        count: result[0]?.total || 0,
    };
}

export async function submitAdminReview(formData: FormData) {
    try {
        const role = await getUserRole();
        if (role !== "super-admin" && role !== "admin") {
            return { success: false, message: "Unauthorized. Admin role required." };
        }

        const { userId: clerkId } = await auth();
        if (!clerkId) return { success: false, message: "Authentication required" };

        const [adminUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
        if (!adminUser) return { success: false, message: "User not found" };

        const targetId = formData.get("targetId") as string;
        const targetType = formData.get("targetType") as "epc" | "brand";
        const rating = parseInt(formData.get("rating") as string);
        const comment = formData.get("comment") as string;

        if (!targetId || !targetType || !rating) {
            return { success: false, message: "Missing required fields" };
        }

        // Insert admin review
        await db.insert(reviews).values({
            authorId: adminUser.id,
            targetId,
            targetType,
            rating,
            comment: comment || "Official EnergyGurus Team Rating.",
        });

        // Invalidate Redis cache
        try {
            if (targetType === "brand") {
                await redis.del(CACHE_KEYS.BRAND_DETAILS(targetId), CACHE_KEYS.BRANDS_LIST);
            } else if (targetType === "epc") {
                await redis.del(CACHE_KEYS.EPC_DETAILS(targetId), CACHE_KEYS.EPCS_LIST);
            }
        } catch (error) {
            console.error("Failed to clear cache:", error);
        }

        revalidatePath("/", "layout");
        revalidatePath("/dashboard/reviews", "layout");
        revalidatePath("/dashboard/moderation", "layout");

        return { success: true, message: "Official Team Rating submitted successfully!" };
    } catch (error) {
        console.error("submitAdminReview error:", error);
        return { success: false, message: "Failed to submit review" };
    }
}

export async function deleteReviewAction(reviewId: string, targetId?: string, targetType?: string) {
    try {
        const role = await getUserRole();
        if (role !== "super-admin" && role !== "admin") {
            return { success: false, message: "Unauthorized" };
        }

        await db.delete(reviews).where(eq(reviews.id, reviewId));

        if (targetId && targetType) {
            try {
                if (targetType === "brand") {
                    await redis.del(CACHE_KEYS.BRAND_DETAILS(targetId), CACHE_KEYS.BRANDS_LIST);
                } else if (targetType === "epc") {
                    await redis.del(CACHE_KEYS.EPC_DETAILS(targetId), CACHE_KEYS.EPCS_LIST);
                }
            } catch (e) {
                console.error("Cache clear failed:", e);
            }
        }

        revalidatePath("/", "layout");
        revalidatePath("/dashboard/reviews", "layout");
        revalidatePath("/dashboard/moderation", "layout");

        return { success: true, message: "Review deleted successfully" };
    } catch (error) {
        console.error("deleteReviewAction error:", error);
        return { success: false, message: "Failed to delete review" };
    }
}

export async function replyToReview(formData: FormData) {
    const reviewId = formData.get("reviewId") as string;
    const reply = formData.get("reply") as string;
    const targetType = formData.get("targetType") as string;
    const targetId = formData.get("targetId") as string;

    if (!reviewId || !reply) return;

    await db.update(reviews)
        .set({ reply })
        .where(eq(reviews.id, reviewId));

    // Invalidate Redis cache for specific profiles
    try {
        if (targetType === "brand" && targetId) {
            await redis.del(CACHE_KEYS.BRAND_DETAILS(targetId));
        } else if (targetType === "epc" && targetId) {
            await redis.del(CACHE_KEYS.EPC_DETAILS(targetId));
        }
    } catch (error) {
        console.error("Failed to delete Redis cache in replyToReview:", error);
    }

    revalidatePath("/", "layout");
}
