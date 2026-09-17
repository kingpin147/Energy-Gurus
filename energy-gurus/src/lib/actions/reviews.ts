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
        let authorId: string | null = null;
        let authorRole: string = "user";

        if (clerkId) {
            const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
            if (user) {
                authorId = user.id;
                authorRole = user.role;
            }
        }

        // If not signed in via Clerk, lookup or create a guest user placeholder
        if (!authorId) {
            const guestEmail = (formData.get("authorEmail") as string)?.trim() || `guest_${Date.now()}@energygurus.online`;
            const guestName = (formData.get("reviewerName") as string || formData.get("authorName") as string)?.trim() || "Customer";
            
            let [existingUser] = await db.select().from(users).where(eq(users.email, guestEmail));
            if (!existingUser) {
                [existingUser] = await db.insert(users).values({
                    clerkId: `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    email: guestEmail,
                    name: guestName,
                    role: "epc",
                    isActive: true
                }).returning();
            }
            authorId = existingUser.id;
        }

        const targetId = formData.get("targetId") as string;
        const targetType = formData.get("targetType") as "epc" | "brand";
        const rating = parseInt(formData.get("rating") as string) || 5;
        const comment = formData.get("comment") as string;
        const reviewerName = (formData.get("reviewerName") as string || formData.get("authorName") as string)?.trim();
        const authorEmail = (formData.get("authorEmail") as string)?.trim();
        const proofUrl = (formData.get("proofUrl") as string)?.trim() || null;

        if (reviewerName && clerkId) {
            await db.update(users)
                .set({ name: reviewerName, updatedAt: new Date() })
                .where(eq(users.clerkId, clerkId));
        }

        // Admin submissions are auto-approved, public customer reviews go to pending moderation
        const isAdmin = authorRole === "admin" || authorRole === "super-admin";
        const initialStatus = isAdmin ? "approved" : "pending";

        const [newReview] = await db.insert(reviews).values({
            authorId,
            targetId,
            targetType,
            rating,
            comment,
            status: initialStatus,
            proofUrl,
            authorName: reviewerName,
            authorEmail,
            isVerifiedPurchase: !!proofUrl
        }).returning();

        // Invalidate Redis cache
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
        revalidatePath("/dashboard/reviews", "layout");
        revalidatePath("/dashboard/moderation", "layout");

        return {
            success: true,
            status: initialStatus,
            message: initialStatus === "pending"
                ? "Thank you! Your review has been submitted for moderation and will appear once approved."
                : "Review published successfully!"
        };
    } catch (error: any) {
        console.error("[submitReview Error]:", error);
        return { success: false, message: error?.message || "Failed to submit review" };
    }
}

export async function approveReviewAction(reviewId: string, isVerifiedPurchase?: boolean) {
    try {
        const role = await getUserRole();
        if (role !== "super-admin" && role !== "admin") {
            return { success: false, message: "Unauthorized" };
        }

        const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId));
        if (!review) return { success: false, message: "Review not found" };

        await db.update(reviews)
            .set({
                status: "approved",
                rejectionReason: null,
                isVerifiedPurchase: isVerifiedPurchase !== undefined ? isVerifiedPurchase : review.isVerifiedPurchase
            })
            .where(eq(reviews.id, reviewId));

        if (review.targetId) {
            try {
                if (review.targetType === "brand") {
                    await redis.del(CACHE_KEYS.BRAND_DETAILS(review.targetId), CACHE_KEYS.BRANDS_LIST);
                } else if (review.targetType === "epc") {
                    await redis.del(CACHE_KEYS.EPC_DETAILS(review.targetId), CACHE_KEYS.EPCS_LIST);
                }
            } catch (e) {
                console.error("Cache clear failed:", e);
            }
        }

        revalidatePath("/", "layout");
        revalidatePath("/dashboard/reviews", "layout");
        revalidatePath("/dashboard/moderation", "layout");

        return { success: true, message: "Review approved and published!" };
    } catch (error: any) {
        console.error("approveReviewAction error:", error);
        return { success: false, message: error?.message || "Failed to approve review" };
    }
}

export async function rejectReviewAction(reviewId: string, rejectionReason: string) {
    try {
        const role = await getUserRole();
        if (role !== "super-admin" && role !== "admin") {
            return { success: false, message: "Unauthorized" };
        }

        const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId));
        if (!review) return { success: false, message: "Review not found" };

        await db.update(reviews)
            .set({
                status: "rejected",
                rejectionReason: rejectionReason || "Review did not meet EnergyGurus publishing guidelines."
            })
            .where(eq(reviews.id, reviewId));

        if (review.targetId) {
            try {
                if (review.targetType === "brand") {
                    await redis.del(CACHE_KEYS.BRAND_DETAILS(review.targetId), CACHE_KEYS.BRANDS_LIST);
                } else if (review.targetType === "epc") {
                    await redis.del(CACHE_KEYS.EPC_DETAILS(review.targetId), CACHE_KEYS.EPCS_LIST);
                }
            } catch (e) {
                console.error("Cache clear failed:", e);
            }
        }

        revalidatePath("/", "layout");
        revalidatePath("/dashboard/reviews", "layout");
        revalidatePath("/dashboard/moderation", "layout");

        return { success: true, message: "Review rejected and moved to archive." };
    } catch (error: any) {
        console.error("rejectReviewAction error:", error);
        return { success: false, message: error?.message || "Failed to reject review" };
    }
}

export async function toggleVerifyReviewAction(reviewId: string) {
    try {
        const role = await getUserRole();
        if (role !== "super-admin" && role !== "admin") {
            return { success: false, message: "Unauthorized" };
        }

        const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId));
        if (!review) return { success: false, message: "Review not found" };

        await db.update(reviews)
            .set({ isVerifiedPurchase: !review.isVerifiedPurchase })
            .where(eq(reviews.id, reviewId));

        revalidatePath("/", "layout");
        revalidatePath("/dashboard/reviews", "layout");
        revalidatePath("/dashboard/moderation", "layout");

        return { success: true, message: `Review marked as ${!review.isVerifiedPurchase ? "Verified Purchase" : "Standard Review"}` };
    } catch (error: any) {
        console.error("toggleVerifyReviewAction error:", error);
        return { success: false, message: error?.message || "Failed to toggle verification" };
    }
}

export async function getProfileRating(targetId: string) {
    const result = await db.select({
        average: avg(reviews.rating),
        total: count(reviews.id)
    })
        .from(reviews)
        .where(and(eq(reviews.targetId, targetId), eq(reviews.status, "approved")));

    return {
        rating: result[0]?.average ? parseFloat(result[0].average) : null,
        count: result[0]?.total || 0
    };
}

export async function getTeamRating(targetId: string, targetType: "epc" | "brand") {
    const result = await db.select({
        average: avg(reviews.rating),
        total: count(reviews.id)
    })
        .from(reviews)
        .innerJoin(users, eq(reviews.authorId, users.id))
        .where(
            and(
                eq(reviews.targetId, targetId),
                eq(reviews.targetType, targetType),
                eq(reviews.status, "approved"),
                inArray(users.role, ["admin", "super-admin"])
            )
        );

    return {
        rating: result[0]?.average ? parseFloat(result[0].average) : null,
        count: result[0]?.total || 0
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
            status: "approved",
            isVerifiedPurchase: true
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
