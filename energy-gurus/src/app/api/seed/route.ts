import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, brands, epcInstallers, epcOffices, epcProjects, products, brandCertifications, podcasts, liveQA } from "@/db/schema";
import { like, inArray } from "drizzle-orm";
import { seedDummyData } from "@/lib/seed";
import { redis } from "@/lib/redis";
import { revalidateTag } from "next/cache";

const DUMMY_EMAIL_SUFFIX = "@energygurus.demo";

// POST — run seed
export async function POST() {
    try {
        // Check if already seeded to avoid duplicate key errors
        const existing = await db
            .select({ id: users.id })
            .from(users)
            .where(like(users.email, `%${DUMMY_EMAIL_SUFFIX}`))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json(
                { error: "Dummy data already exists. Click 'Clear Dummy Data' first, then seed again." },
                { status: 409 }
            );
        }

        await seedDummyData();

        // Bust Redis caches
        await redis.del("epcs:all", "brands:all");
        // Bust Next.js unstable_cache
        revalidateTag("epcs");
        revalidateTag("brands");
        revalidateTag("homepage");

        return NextResponse.json({
            message: "✅ Seeded 4 EPCs, 4 Brands, offices, projects, products, certifications, podcasts & live QA sessions."
        });
    } catch (error: any) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: error?.message || "Seed failed" }, { status: 500 });
    }
}

// DELETE — clear dummy data only
export async function DELETE() {
    try {
        // Find all dummy users
        const dummyUsers = await db
            .select({ id: users.id })
            .from(users)
            .where(like(users.email, `%${DUMMY_EMAIL_SUFFIX}`));

        if (dummyUsers.length === 0) {
            return NextResponse.json({ message: "No dummy data found to clear." });
        }

        const dummyUserIds = dummyUsers.map(u => u.id);

        // Find EPC profiles for these users
        const dummyEpcs = await db
            .select({ id: epcInstallers.id })
            .from(epcInstallers)
            .where(inArray(epcInstallers.userId, dummyUserIds));

        const dummyEpcIds = dummyEpcs.map(e => e.id);

        // Find Brand profiles for these users
        const dummyBrands = await db
            .select({ id: brands.id })
            .from(brands)
            .where(inArray(brands.userId, dummyUserIds));

        const dummyBrandIds = dummyBrands.map(b => b.id);

        // Delete in dependency order
        if (dummyEpcIds.length > 0) {
            await db.delete(epcProjects).where(inArray(epcProjects.epcId, dummyEpcIds));
            await db.delete(epcOffices).where(inArray(epcOffices.epcId, dummyEpcIds));
            await db.delete(epcInstallers).where(inArray(epcInstallers.id, dummyEpcIds));
        }

        if (dummyBrandIds.length > 0) {
            await db.delete(brandCertifications).where(inArray(brandCertifications.brandId, dummyBrandIds));
            await db.delete(products).where(inArray(products.brandId, dummyBrandIds));
            await db.delete(brands).where(inArray(brands.id, dummyBrandIds));
        }

        // Delete dummy users
        await db.delete(users).where(inArray(users.id, dummyUserIds));

        // Bust Redis caches
        await redis.del("epcs:all", "brands:all");
        // Bust Next.js unstable_cache
        revalidateTag("epcs");
        revalidateTag("brands");
        revalidateTag("homepage");

        return NextResponse.json({
            message: `✅ Cleared ${dummyUserIds.length} dummy users and all associated data.`
        });
    } catch (error: any) {
        console.error("Clear error:", error);
        return NextResponse.json({ error: error?.message || "Clear failed" }, { status: 500 });
    }
}
