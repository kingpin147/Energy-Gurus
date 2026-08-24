"use server";

import { db } from "@/db";
import { users, epcInstallers, epcOffices, epcProjects, UserRole } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClerkClient } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function onboardEpcInstaller(formData: FormData) {
    try {
        const currentRole = await getUserRole();
        const isAdmin = currentRole === 'super-admin' || currentRole === 'admin';

        const email = formData.get("email") as string;
        const companyName = formData.get("companyName") as string;
        
        if (!email || !companyName) {
            return { success: false, message: "Email and Company Name are required" };
        }

        // Check if user already exists
        const [existingUser] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
        if (existingUser) {
            return { success: false, message: "An account with this email address already exists. Please log in or use a different email." };
        }

        // Generate a random secure password
        const generatedPassword = Array(16).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*")
            .map(x => x[Math.floor(Math.random() * x.length)]).join('');

        // 1. Create User in Clerk
        let clerkUserId: string;
        try {
            const clerkUser = await clerkClient.users.createUser({
                emailAddress: [email],
                password: generatedPassword,
                publicMetadata: { role: 'epc' },
            });
            clerkUserId = clerkUser.id;
        } catch (clerkErr: any) {
            console.error("Clerk user creation error:", clerkErr);
            // If user already exists in Clerk, search for their id
            const [existingClerkUser] = await clerkClient.users.getUserList({ emailAddress: [email] }).then(res => res.data);
            if (existingClerkUser) {
                clerkUserId = existingClerkUser.id;
            } else {
                return { success: false, message: clerkErr?.errors?.[0]?.longMessage || clerkErr?.message || "Failed to create user account." };
            }
        }

        // 2. Insert into local users table
        const [newUser] = await db.insert(users).values({
            clerkId: clerkUserId,
            email: email.toLowerCase(),
            name: companyName,
            role: 'epc',
            isActive: true,
        }).returning();

        // 3. Process array fields (Sectors, Certifications, Brands)
        const sectors = formData.getAll("sectors") as string[];
        const certifications = formData.getAll("certifications") as string[];
        const brandsCertified = formData.getAll("brandsCertified") as string[]; // legacy
        const solarBrands = formData.getAll("solarBrands") as string[];
        const inverterBrands = formData.getAll("inverterBrands") as string[];
        const batteryBrands = formData.getAll("batteryBrands") as string[];
        
        // Process JSON fields
        const teamStr = formData.get("team") as string;
        const team = teamStr ? JSON.parse(teamStr) : [];
        
        const projectsStr = formData.get("projects") as string;
        const projects = projectsStr ? JSON.parse(projectsStr) : [];

        const testimonialsStr = formData.get("testimonials") as string;
        const testimonials = testimonialsStr ? JSON.parse(testimonialsStr) : [];

        const officesStr = formData.get("offices") as string;
        const offices = officesStr ? JSON.parse(officesStr) : [];

        const photosStr = formData.get("photos") as string;
        const photos = photosStr ? JSON.parse(photosStr) : [];

        const solarCertDocsStr = formData.get("solarCertDocuments") as string;
        const solarCertDocuments = solarCertDocsStr ? JSON.parse(solarCertDocsStr) : [];

        const inverterCertDocsStr = formData.get("inverterCertDocuments") as string;
        const inverterCertDocuments = inverterCertDocsStr ? JSON.parse(inverterCertDocsStr) : [];

        const batteryCertDocsStr = formData.get("batteryCertDocuments") as string;
        const batteryCertDocuments = batteryCertDocsStr ? JSON.parse(batteryCertDocsStr) : [];

        // Social Links
        const socialLinks: { platform: string; url: string }[] = [];
        const website = formData.get("website") as string;
        const facebook = formData.get("facebook") as string;
        const instagram = formData.get("instagram") as string;
        const linkedin = formData.get("linkedin") as string;
        const youtube = formData.get("youtube") as string;

        if (website) socialLinks.push({ platform: "Website", url: website });
        if (facebook) socialLinks.push({ platform: "Facebook", url: facebook });
        if (instagram) socialLinks.push({ platform: "Instagram", url: instagram });
        if (linkedin) socialLinks.push({ platform: "LinkedIn", url: linkedin });
        if (youtube) socialLinks.push({ platform: "YouTube", url: youtube });

        // 4. Insert into epcInstallers table
        const [newEpc] = await db.insert(epcInstallers).values({
            userId: newUser.id,
            companyName: companyName,
            ceoName: formData.get("ceoName") as string || null,
            designation: formData.get("designation") as string || null,
            businessType: formData.get("businessType") as string || null,
            email: email,
            contactNo: formData.get("contactNo") as string || null,
            whatsapp: formData.get("whatsapp") as string || null,
            address: formData.get("address") as string || null,
            area: formData.get("area") as string || null,
            city: formData.get("city") as string || null,
            country: formData.get("country") as string || 'Pakistan',
            coordinates: formData.get("coordinates") as string || null,
            website: website || null,
            socialLinks: socialLinks,
            yearsInBusiness: parseInt(formData.get("yearsInBusiness") as string) || null,
            regNumber: formData.get("regNumber") as string || null,
            tier: (formData.get("tier") as 'bronze' | 'silver' | 'gold') || 'bronze',
            about: formData.get("about") as string || null,
            sectors: sectors.length > 0 ? sectors : [],
            certifications: certifications.length > 0 ? certifications : [],
            brandsCertified: brandsCertified.length > 0 ? brandsCertified : [],
            solarBrands: solarBrands.length > 0 ? solarBrands : [],
            inverterBrands: inverterBrands.length > 0 ? inverterBrands : [],
            batteryBrands: batteryBrands.length > 0 ? batteryBrands : [],
            solarCertDocuments: solarCertDocuments,
            inverterCertDocuments: inverterCertDocuments,
            batteryCertDocuments: batteryCertDocuments,
            team: team,
            logoUrl: formData.get("logoUrl") as string || null,
            photos: photos,
            licenceDocuments: formData.get("licenceDocuments") ? JSON.parse(formData.get("licenceDocuments") as string) : [],
            isVerified: isAdmin, // Auto verify if admin is onboarding, otherwise pending verification
        }).returning();

        // 5. Insert additional offices if any
        if (offices && offices.length > 0) {
            const officeRecords = offices
                .filter((o: any) => o.city || o.address || o.area)
                .map((o: any) => ({
                    epcId: newEpc.id,
                    officeNumber: o.officeNumber || null,
                    address: o.address || null,
                    area: o.area || null,
                    city: o.city || formData.get("city") as string || "Main",
                    country: o.country || 'Pakistan',
                    coordinates: o.coordinates || null,
                }));
            if (officeRecords.length > 0) {
                await db.insert(epcOffices).values(officeRecords);
            }
        }

        // 6. Insert projects & testimonials if any
        const allProjectRecords = [];

        if (projects && projects.length > 0) {
            const projectRecords = projects
                .filter((p: any) => p.youtubeUrl || p.customerName || p.companyName || p.description)
                .map((p: any) => ({
                    epcId: newEpc.id,
                    name: p.name || p.companyName || p.customerName || "Project",
                    entryType: (p.entryType as 'project' | 'testimonial') || 'project',
                    youtubeUrl: p.youtubeUrl || null,
                    installationDate: p.installationDate || null,
                    customerName: p.customerName || null,
                    companyName: p.companyName || null,
                    city: p.city || null,
                    country: p.country || null,
                    description: p.description || null,
                    systemType: p.systemType || null,
                }));
            allProjectRecords.push(...projectRecords);
        }

        // 7. Insert customer testimonials if any (legacy separate testimonials)
        if (testimonials && testimonials.length > 0) {
            const testimonialRecords = testimonials
                .filter((t: any) => t.youtubeUrl || t.customerName || t.companyName || t.description)
                .map((t: any) => ({
                    epcId: newEpc.id,
                    name: t.customerName ? `Testimonial - ${t.customerName}` : "Customer Testimonial",
                    entryType: 'testimonial' as const,
                    youtubeUrl: t.youtubeUrl || null,
                    installationDate: t.installationDate || null,
                    customerName: t.customerName || null,
                    companyName: t.companyName || null,
                    city: t.city || null,
                    country: t.country || null,
                    description: t.description || null,
                    systemType: t.systemType || null,
                }));
            allProjectRecords.push(...testimonialRecords);
        }

        if (allProjectRecords.length > 0) {
            await db.insert(epcProjects).values(allProjectRecords);
        }

        // 8. Invalidate Redis Cache & Next.js cache
        try {
            const { redis, CACHE_KEYS } = await import("@/lib/redis");
            await redis.del(CACHE_KEYS.EPCS_LIST);
            if (newEpc?.id) {
                await redis.del(CACHE_KEYS.EPC_DETAILS(newEpc.id));
            }
        } catch (cacheErr) {
            console.warn("Redis cache invalidation warning:", cacheErr);
        }

        revalidatePath("/dashboard/users", "layout");
        revalidatePath("/dashboard/epc", "layout");
        revalidatePath("/epcs", "layout");
        revalidatePath("/", "layout");
        
        return { 
            success: true, 
            message: "EPC Onboarded Successfully.",
            password: generatedPassword
        };
        
    } catch (error: any) {
        console.error("Failed to onboard EPC:", error);
        return { success: false, message: error?.message || "An error occurred during onboarding." };
    }
}
