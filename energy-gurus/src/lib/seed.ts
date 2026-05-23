import { db } from "@/db";
import { users, brands, products, podcasts, liveQA, epcInstallers, epcOffices, epcProjects, brandCertifications } from "@/db/schema";

export async function seedDummyData() {
    console.log("🌱 Starting full seed...");

    // ── 4 EPC Users ──────────────────────────────────────────────────────────
    const epcUsers = await db.insert(users).values([
        { clerkId: "dummy_epc_001", email: "alpha@energygurus.demo", name: "Alpha Energy Systems", role: "epc" as const, isActive: true },
        { clerkId: "dummy_epc_002", email: "solarpeak@energygurus.demo", name: "Solar Peak Solutions", role: "epc" as const, isActive: true },
        { clerkId: "dummy_epc_003", email: "greenvolt@energygurus.demo", name: "GreenVolt Engineering", role: "epc" as const, isActive: true },
        { clerkId: "dummy_epc_004", email: "suncraft@energygurus.demo", name: "SunCraft Installations", role: "epc" as const, isActive: true },
    ]).returning();

    // ── 4 Brand Users ─────────────────────────────────────────────────────────
    const brandUsers = await db.insert(users).values([
        { clerkId: "dummy_brand_001", email: "longi@energygurus.demo", name: "Longi Solar", role: "brand" as const, isActive: true },
        { clerkId: "dummy_brand_002", email: "huawei@energygurus.demo", name: "Huawei FusionSolar", role: "brand" as const, isActive: true },
        { clerkId: "dummy_brand_003", email: "growatt@energygurus.demo", name: "Growatt Technologies", role: "brand" as const, isActive: true },
        { clerkId: "dummy_brand_004", email: "sungrow@energygurus.demo", name: "Sungrow Power", role: "brand" as const, isActive: true },
    ]).returning();

    // ── EPC Profiles ──────────────────────────────────────────────────────────
    const epcProfiles = await db.insert(epcInstallers).values([
        {
            userId: epcUsers[0].id,
            companyName: "Alpha Energy Systems",
            ceoName: "Ahmed Raza",
            about: "Leading EPC contractor in Pakistan with over 500MW installed capacity across residential, commercial, and industrial sectors. We specialize in turnkey solar solutions with a 10-year workmanship warranty.",
            website: "https://alphaenergy.example.com",
            logoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
            sectors: ["Residential", "Commercial", "Industrial"],
            certifications: ["AEDB Certified", "ISO 9001", "NEPRA Licensed"],
            socialLinks: [
                { platform: "Facebook", url: "https://facebook.com/alphaenergy" },
                { platform: "LinkedIn", url: "https://linkedin.com/company/alphaenergy" },
                { platform: "WhatsApp", url: "+923001234567" },
            ],
            isVerified: true,
        },
        {
            userId: epcUsers[1].id,
            companyName: "Solar Peak Solutions",
            ceoName: "Sara Khan",
            about: "Solar Peak Solutions is a premier solar EPC company focused on delivering high-efficiency grid-tied and hybrid systems. With 200+ completed projects, we bring engineering excellence to every installation.",
            website: "https://solarpeak.example.com",
            logoUrl: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=200&h=200&fit=crop",
            sectors: ["Residential", "Agriculture"],
            certifications: ["AEDB Certified", "Huawei Authorized Partner"],
            socialLinks: [
                { platform: "Instagram", url: "https://instagram.com/solarpeak" },
                { platform: "YouTube", url: "https://youtube.com/@solarpeak" },
                { platform: "WhatsApp", url: "+923009876543" },
            ],
            isVerified: true,
        },
        {
            userId: epcUsers[2].id,
            companyName: "GreenVolt Engineering",
            ceoName: "Usman Malik",
            about: "GreenVolt Engineering specializes in large-scale commercial and industrial solar projects. Our team of certified engineers has delivered over 50MW of capacity with zero safety incidents.",
            website: "https://greenvolt.example.com",
            logoUrl: "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?w=200&h=200&fit=crop",
            sectors: ["Commercial", "Industrial"],
            certifications: ["ISO 14001", "NEPRA Licensed", "Longi Authorized"],
            socialLinks: [
                { platform: "LinkedIn", url: "https://linkedin.com/company/greenvolt" },
                { platform: "Twitter", url: "https://twitter.com/greenvolt" },
                { platform: "WhatsApp", url: "+923331234567" },
            ],
            isVerified: true,
        },
        {
            userId: epcUsers[3].id,
            companyName: "SunCraft Installations",
            ceoName: "Fatima Zahra",
            about: "SunCraft is a boutique solar installation company known for premium residential rooftop systems. We focus on quality over quantity, ensuring every client gets a custom-designed system optimized for their energy needs.",
            website: "https://suncraft.example.com",
            logoUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=200&h=200&fit=crop",
            sectors: ["Residential"],
            certifications: ["AEDB Certified", "Sungrow Partner"],
            socialLinks: [
                { platform: "Facebook", url: "https://facebook.com/suncraft" },
                { platform: "Instagram", url: "https://instagram.com/suncraft" },
                { platform: "WhatsApp", url: "+923451234567" },
            ],
            isVerified: false,
        },
    ]).returning();

    // ── EPC Offices ───────────────────────────────────────────────────────────
    await db.insert(epcOffices).values([
        { epcId: epcProfiles[0].id, city: "Karachi", officeNumber: "Office 5", block: "Block B", area: "PECHS" },
        { epcId: epcProfiles[0].id, city: "Lahore", officeNumber: "Suite 12", block: "Block C", area: "Gulberg III" },
        { epcId: epcProfiles[1].id, city: "Islamabad", officeNumber: "Office 3", block: "F-7", area: "Markaz" },
        { epcId: epcProfiles[2].id, city: "Faisalabad", officeNumber: "Plot 22", block: "Industrial Zone", area: "D-Ground" },
        { epcId: epcProfiles[2].id, city: "Lahore", officeNumber: "Office 8", block: "DHA Phase 5", area: "Commercial" },
        { epcId: epcProfiles[3].id, city: "Karachi", officeNumber: "Shop 4", block: "Block 13-D", area: "Gulshan-e-Iqbal" },
    ]);

    // ── EPC Projects ──────────────────────────────────────────────────────────
    await db.insert(epcProjects).values([
        {
            epcId: epcProfiles[0].id,
            name: "DHA Karachi Residential Complex",
            city: "Karachi",
            segmentType: ["Residential"],
            systemSize: "25",
            systemType: "Hybrid",
            inverterModel: "Huawei SUN2000-25KTL",
            solarPanelModel: "Longi Hi-MO 6 580W",
            images: [
                "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&q=80&w=800",
            ],
        },
        {
            epcId: epcProfiles[0].id,
            name: "Korangi Industrial Unit",
            city: "Karachi",
            segmentType: ["Industrial"],
            systemSize: "200",
            systemType: "Grid Tied",
            inverterModel: "Sungrow SG250HX",
            solarPanelModel: "Canadian Solar 550W",
            images: [
                "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800",
            ],
        },
        {
            epcId: epcProfiles[1].id,
            name: "Bahria Town Villa Project",
            city: "Islamabad",
            segmentType: ["Residential"],
            systemSize: "10",
            systemType: "Hybrid",
            inverterModel: "Growatt SPH10000TL3",
            solarPanelModel: "Jinko Tiger Neo 580W",
            images: [
                "https://images.unsplash.com/photo-1620215175664-cb9a6f598f12?auto=format&fit=crop&q=80&w=800",
            ],
        },
        {
            epcId: epcProfiles[1].id,
            name: "Chakwal Agri Farm",
            city: "Chakwal",
            segmentType: ["Agriculture"],
            systemSize: "50",
            systemType: "Off Grid",
            inverterModel: "Huawei SUN2000-50KTL",
            solarPanelModel: "Longi Hi-MO 5 540W",
            images: [
                "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800",
            ],
        },
        {
            epcId: epcProfiles[2].id,
            name: "Faisalabad Textile Mill",
            city: "Faisalabad",
            segmentType: ["Industrial", "Commercial"],
            systemSize: "500",
            systemType: "Grid Tied",
            inverterModel: "Sungrow SG350HX",
            solarPanelModel: "Longi Hi-MO 6 580W",
            images: [
                "https://images.unsplash.com/photo-1611365892117-00ac5ef43759?auto=format&fit=crop&q=80&w=800",
            ],
        },
        {
            epcId: epcProfiles[3].id,
            name: "Gulshan Residence",
            city: "Karachi",
            segmentType: ["Residential"],
            systemSize: "8",
            systemType: "Hybrid",
            inverterModel: "Growatt MIN 8000TL-X",
            solarPanelModel: "Canadian Solar 450W",
            images: [
                "https://images.unsplash.com/photo-1542336391-ae2936d8ef44?auto=format&fit=crop&q=80&w=800",
            ],
        },
    ]);

    // ── Brand Profiles ────────────────────────────────────────────────────────
    const brandProfiles = await db.insert(brands).values([
        {
            userId: brandUsers[0].id,
            brandName: "Longi Solar",
            countryHead: "Zhang Wei",
            customerCareHead: "Ali Hassan",
            customerCare: "+86-29-8388-6666",
            headOffice: "Xi'an, Shaanxi, China",
            about: "LONGi is the world's leading solar technology company, committed to becoming the world's most valuable solar energy company. With over 20 years of R&D, LONGi delivers the highest efficiency monocrystalline silicon solar products globally.",
            website: "https://www.longi.com",
            warrantyUrl: "https://www.longi.com/en/warranty",
            logoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
            socialLinks: [
                { platform: "LinkedIn", url: "https://linkedin.com/company/longi-solar" },
                { platform: "YouTube", url: "https://youtube.com/@longisolar" },
                { platform: "Twitter", url: "https://twitter.com/longisolar" },
            ],
            reps: [
                { name: "Bilal Ahmed", designation: "Regional Sales Manager - Pakistan" },
                { name: "Sana Mirza", designation: "Technical Support Lead" },
            ],
            isVerified: true,
        },
        {
            userId: brandUsers[1].id,
            brandName: "Huawei FusionSolar",
            countryHead: "Wang Fang",
            customerCareHead: "Tariq Mahmood",
            customerCare: "+92-21-111-HUAWEI",
            headOffice: "Shenzhen, Guangdong, China",
            about: "Huawei FusionSolar is the world's #1 smart PV inverter brand. With AI-powered smart string inverters and cloud management platforms, Huawei delivers intelligent energy solutions for residential, commercial, and utility-scale projects.",
            website: "https://solar.huawei.com",
            warrantyUrl: "https://solar.huawei.com/en/warranty",
            logoUrl: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=300&h=300&fit=crop",
            socialLinks: [
                { platform: "LinkedIn", url: "https://linkedin.com/company/huawei" },
                { platform: "YouTube", url: "https://youtube.com/@huaweifusionsolar" },
                { platform: "Facebook", url: "https://facebook.com/huaweifusionsolar" },
            ],
            reps: [
                { name: "Kamran Iqbal", designation: "Country Manager - Pakistan" },
                { name: "Ayesha Noor", designation: "Pre-Sales Engineer" },
            ],
            isVerified: true,
        },
        {
            userId: brandUsers[2].id,
            brandName: "Growatt Technologies",
            countryHead: "Li Ming",
            customerCareHead: "Zubair Khan",
            customerCare: "+92-42-111-GROWATT",
            headOffice: "Shenzhen, China",
            about: "Growatt is a leading global provider of distributed energy solutions. With 6 million+ units shipped to 150+ countries, Growatt offers a complete range of string inverters, hybrid inverters, and energy storage systems for all scales.",
            website: "https://www.ginverter.com",
            warrantyUrl: "https://www.ginverter.com/warranty",
            logoUrl: "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?w=300&h=300&fit=crop",
            socialLinks: [
                { platform: "Facebook", url: "https://facebook.com/growatt" },
                { platform: "Instagram", url: "https://instagram.com/growatt_official" },
                { platform: "WhatsApp", url: "+923001112233" },
            ],
            reps: [
                { name: "Hassan Raza", designation: "Technical Sales Engineer" },
            ],
            isVerified: true,
        },
        {
            userId: brandUsers[3].id,
            brandName: "Sungrow Power",
            countryHead: "Chen Jing",
            customerCareHead: "Imran Siddiqui",
            customerCare: "+92-51-111-SUNGROW",
            headOffice: "Hefei, Anhui, China",
            about: "Sungrow is the world's most bankable inverter brand with 405GW+ installed globally. Sungrow's comprehensive product portfolio covers PV inverters, energy storage systems, and floating PV solutions for all applications.",
            website: "https://www.sungrowpower.com",
            warrantyUrl: "https://www.sungrowpower.com/warranty",
            logoUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&h=300&fit=crop",
            socialLinks: [
                { platform: "LinkedIn", url: "https://linkedin.com/company/sungrow" },
                { platform: "YouTube", url: "https://youtube.com/@sungrow" },
                { platform: "Twitter", url: "https://twitter.com/sungrow_power" },
            ],
            reps: [
                { name: "Nadia Hussain", designation: "Regional Business Development" },
                { name: "Faisal Qureshi", designation: "After-Sales Support Manager" },
            ],
            isVerified: true,
        },
    ]).returning();

    // ── Brand Products ────────────────────────────────────────────────────────
    await db.insert(products).values([
        // Longi
        {
            brandId: brandProfiles[0].id,
            name: "Hi-MO 6 580W",
            category: "Solar Panels",
            series: "Hi-MO 6",
            description: "LONGi Hi-MO 6 580W monocrystalline PERC module with 22.8% efficiency. Features anti-LID technology and 30-year linear power warranty.",
            imageUrl: "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=600",
            datasheetUrl: "https://www.longi.com/en/products/modules/hi-mo6/",
        },
        {
            brandId: brandProfiles[0].id,
            name: "Hi-MO X6 610W",
            category: "Solar Panels",
            series: "Hi-MO X6",
            description: "Next-generation N-type TOPCon module with 23.2% efficiency. Ideal for space-constrained rooftops requiring maximum power density.",
            imageUrl: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&q=80&w=600",
            datasheetUrl: "https://www.longi.com/en/products/modules/hi-mo-x6/",
        },
        // Huawei
        {
            brandId: brandProfiles[1].id,
            name: "SUN2000-25KTL-M3",
            category: "Inverters",
            series: "SUN2000",
            description: "25kW smart string inverter with AI-powered MPPT. Features built-in arc fault detection, 10-year warranty, and FusionSolar cloud monitoring.",
            imageUrl: "https://images.unsplash.com/photo-1620215175664-cb9a6f598f12?auto=format&fit=crop&q=80&w=600",
            datasheetUrl: "https://solar.huawei.com/en/products/inverters",
        },
        {
            brandId: brandProfiles[1].id,
            name: "LUNA2000-10KWH",
            category: "Batteries",
            series: "LUNA2000",
            description: "10kWh modular lithium iron phosphate battery storage system. Stackable up to 30kWh, 6000+ cycle life, and seamless integration with SUN2000 inverters.",
            imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=600",
            datasheetUrl: "https://solar.huawei.com/en/products/batteries",
        },
        // Growatt
        {
            brandId: brandProfiles[2].id,
            name: "SPH10000TL3-BH",
            category: "Inverters",
            series: "SPH",
            description: "10kW hybrid inverter with built-in EPS function. Supports up to 30kWh battery storage, 3-phase output, and Growatt ShineServer monitoring.",
            imageUrl: "https://images.unsplash.com/photo-1611365892117-00ac5ef43759?auto=format&fit=crop&q=80&w=600",
            datasheetUrl: "https://www.ginverter.com/products/hybrid-inverter",
        },
        {
            brandId: brandProfiles[2].id,
            name: "ARK 2.5H-A1",
            category: "Batteries",
            series: "ARK",
            description: "2.5kWh stackable LFP battery module. Up to 10 units in parallel for 25kWh total capacity. IP65 rated for indoor and outdoor installation.",
            imageUrl: "https://images.unsplash.com/photo-1542336391-ae2936d8ef44?auto=format&fit=crop&q=80&w=600",
            datasheetUrl: "https://www.ginverter.com/products/battery",
        },
        // Sungrow
        {
            brandId: brandProfiles[3].id,
            name: "SG10RT",
            category: "Inverters",
            series: "SG-RT",
            description: "10kW residential string inverter with 98.4% peak efficiency. Features DC switch, built-in PID recovery, and iSolarCloud monitoring platform.",
            imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600",
            datasheetUrl: "https://www.sungrowpower.com/products/inverter",
        },
        {
            brandId: brandProfiles[3].id,
            name: "SBR096 Battery",
            category: "Batteries",
            series: "SBR",
            description: "9.6kWh high-voltage LFP battery with 100% DoD. Modular design supports 9.6–100kWh capacity. Compatible with SH series hybrid inverters.",
            imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600",
            datasheetUrl: "https://www.sungrowpower.com/products/battery",
        },
    ]);

    // ── Brand Certifications ──────────────────────────────────────────────────
    await db.insert(brandCertifications).values([
        { brandId: brandProfiles[0].id, name: "IEC 61215", issuingBody: "TÜV Rheinland", expiryDate: new Date("2027-12-31") },
        { brandId: brandProfiles[0].id, name: "ISO 9001:2015", issuingBody: "Bureau Veritas", expiryDate: new Date("2026-06-30") },
        { brandId: brandProfiles[1].id, name: "IEC 62109", issuingBody: "TÜV SÜD", expiryDate: new Date("2027-03-31") },
        { brandId: brandProfiles[1].id, name: "CE Marking", issuingBody: "European Commission", expiryDate: new Date("2028-01-01") },
        { brandId: brandProfiles[2].id, name: "IEC 62109-1", issuingBody: "SGS", expiryDate: new Date("2026-09-30") },
        { brandId: brandProfiles[3].id, name: "IEC 61215", issuingBody: "TÜV Rheinland", expiryDate: new Date("2027-06-30") },
        { brandId: brandProfiles[3].id, name: "ISO 14001", issuingBody: "DNV GL", expiryDate: new Date("2026-12-31") },
    ]);

    // ── Podcasts ──────────────────────────────────────────────────────────────
    await db.insert(podcasts).values([
        { title: "The Future of Solar in Pakistan 2026", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", guestName: "Engr. Tariq Mehmood", guestDesignation: "AEDB Director", description: "A deep dive into the next decade of renewable energy policy and investment in Pakistan.", thumbnailUrl: "https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=800" },
        { title: "Grid Independence 101", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", guestName: "Dr. Ayesha Siddiqui", guestDesignation: "Energy Consultant", description: "How to build a fully off-grid home with modern batteries and smart inverters.", thumbnailUrl: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&q=80&w=800" },
        { title: "Choosing the Right Inverter", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", guestName: "Kamran Iqbal", guestDesignation: "Huawei Country Manager", description: "String vs hybrid vs micro-inverters — which is right for your project?", thumbnailUrl: "https://images.unsplash.com/photo-1620215175664-cb9a6f598f12?auto=format&fit=crop&q=80&w=800" },
    ]).onConflictDoNothing();

    // ── Live QA Sessions ──────────────────────────────────────────────────────
    await db.insert(liveQA).values([
        { topic: "Net Metering Policy 2026", description: "Deep dive into how net metering works and its impact on your solar ROI.", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800", expertName: "Engr. Ali Khan", expertTitle: "Renewable Energy Specialist", status: "archived" as const, sessionDate: new Date("2026-05-01T14:00:00Z") },
        { topic: "Hybrid Inverters Deep Dive", description: "Why hybrid inverters are the future of energy management.", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800", expertName: "Sarah Johnson", expertTitle: "Inverter Design Engineer", status: "upcoming" as const, sessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        { topic: "Battery Storage Selection", description: "Choosing between LFP and NMC batteries for your home.", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://images.unsplash.com/photo-1611365892117-00ac5ef43759?auto=format&fit=crop&q=80&w=800", expertName: "Dr. Robert Smith", expertTitle: "Battery Chemist", status: "upcoming" as const, sessionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    ]).onConflictDoNothing();

    console.log("✅ Full seed complete — 4 EPCs, 4 Brands, products, offices, projects, certifications, podcasts, live QA.");
}
