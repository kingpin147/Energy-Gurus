import { db } from "@/db";
import { users, brands, products, podcasts, liveQA, epcInstallers } from "@/db/schema";

export async function seedDummyData() {
    console.log("🌱 Starting seed...");

    // 1. Create a System User for EPCs/Brands
    const [systemUser] = await db.insert(users).values({
        clerkId: "dummy_clerk_001",
        email: "demo@energygurus.online",
        name: "Demo Installer",
        role: "epc"
    }).returning();

    // 2. Add Brands
    const brandData = [
        { brandName: "Longi Solar", website: "https://www.longi.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Longi_logo.svg/1200px-Longi_logo.svg.png" },
        { brandName: "Huawei FusionSolar", website: "https://solar.huawei.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Huawei_logo.svg/1200px-Huawei_logo.svg.png" },
        { brandName: "Growatt", website: "https://www.ginverter.com", logoUrl: "https://growatt.com/assets/images/logo.png" }
    ];

    for (const b of brandData) {
        await db.insert(brands).values({
            userId: systemUser.id,
            ...b
        });
    }

    // 3. Add Podcasts
    const podcastData = [
        { title: "The Future of Solar in 2026", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", guestName: "Elon Musk", description: "A deep dive into the next decade of renewable energy." },
        { title: "Grid Independence 101", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", guestName: "Dr. Jane Smith", description: "How to build a fully off-grid home with modern batteries." }
    ];

    for (const p of podcastData) {
        await db.insert(podcasts).values(p);
    }

    // 4. Add EPC Installer
    await db.insert(epcInstallers).values({
        userId: systemUser.id,
        companyName: "Alpha Energy Systems",
        about: "Leading EPC in the region with over 500MW installed capacity. We specialize in residential and commercial rooftops.",
        portfolio: [
            "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&q=80&w=800"
        ],
        website: "https://alphaenergy.example.com",
        isVerified: true
    });

    console.log("✅ Seed complete!");
}
