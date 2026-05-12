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

    // 5. Add Live QA Sessions
    const liveQAData = [
        {
            topic: "Net Metering",
            description: "Deep dive into how net metering works and its impact on your solar ROI.",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnailUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800",
            expertName: "Engr. Ali Khan",
            expertTitle: "Renewable Energy Specialist",
            status: "archived" as const,
            sessionDate: new Date("2026-05-01T14:00:00Z")
        },
        {
            topic: "Hybrid Inverters",
            description: "Why hybrid inverters are the future of energy management.",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnailUrl: "https://images.unsplash.com/photo-1620215175664-cb9a6f598f12?auto=format&fit=crop&q=80&w=800",
            expertName: "Sarah Johnson",
            expertTitle: "Inverter Design Engineer",
            status: "live" as const,
            sessionDate: new Date()
        },
        {
            topic: "Battery Storage",
            description: "Choosing between Lead Acid and Lithium-Ion batteries for your home.",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnailUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
            expertName: "Dr. Robert Smith",
            expertTitle: "Battery Chemist",
            status: "upcoming" as const,
            sessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
            topic: "Fake Products",
            description: "A guide to identifying counterfeit solar panels and components.",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnailUrl: "https://images.unsplash.com/photo-1611365892117-00ac5ef43759?auto=format&fit=crop&q=80&w=800",
            expertName: "Zahid Ahmed",
            expertTitle: "Quality Assurance Auditor",
            status: "upcoming" as const,
            sessionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        },
        {
            topic: "Solar Policies",
            description: "Analyzing the latest government policies on solar energy.",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
            expertName: "Adv. Mehwish",
            expertTitle: "Energy Policy Consultant",
            status: "upcoming" as const,
            sessionDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
        },
        {
            topic: "Installation Standards",
            description: "Standard practices for safe and efficient solar installations.",
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnailUrl: "https://images.unsplash.com/photo-1542336391-ae2936d8ef44?auto=format&fit=crop&q=80&w=800",
            expertName: "Mustafa Qureshi",
            expertTitle: "Master Installer",
            status: "upcoming" as const,
            sessionDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
        }
    ];

    for (const q of liveQAData) {
        await db.insert(liveQA).values(q);
    }

    console.log("✅ Seed complete!");
}
