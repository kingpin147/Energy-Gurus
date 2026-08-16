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
        if (currentRole !== 'super-admin' && currentRole !== 'admin') {
            return { success: false, message: "Unauthorized" };
        }

        const email = formData.get("email") as string;
        const companyName = formData.get("companyName") as string;
        
        if (!email || !companyName) {
            return { success: false, message: "Email and Company Name are required" };
        }

        // Generate a random secure password
        const generatedPassword = Array(16).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*")
            .map(x => x[Math.floor(Math.random() * x.length)]).join('');

        // 1. Create User in Clerk
        const clerkUser = await clerkClient.users.createUser({
            emailAddress: [email],
            password: generatedPassword,
            publicMetadata: { role: 'epc' },
        });

        // 2. Insert into local users table
        const [newUser] = await db.insert(users).values({
            clerkId: clerkUser.id,
            email: email.toLowerCase(),
            name: companyName,
            role: 'epc',
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
            email: email,
            contactNo: formData.get("contactNo") as string || null,
            address: formData.get("address") as string || null,
            area: formData.get("area") as string || null,
            city: formData.get("city") as string || null,
            country: formData.get("country") as string || 'Pakistan',
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
            team: team,
            logoUrl: formData.get("logoUrl") as string || null,
            licenceDocuments: formData.get("licenceDocuments") ? JSON.parse(formData.get("licenceDocuments") as string) : [],
            isVerified: true, // Auto verify since admin is onboarding
        }).returning();

        // 5. Insert additional offices if any
        if (offices && offices.length > 0) {
            const officeRecords = offices
                .filter((o: any) => o.city || o.address || o.area)
                .map((o: any) => ({
                    epcId: newEpc.id,
                    officeNumber: o.address || null,
                    area: o.area || null,
                    city: o.city || formData.get("city") as string || "Main",
                }));
            if (officeRecords.length > 0) {
                await db.insert(epcOffices).values(officeRecords);
            }
        }

        // 6. Insert projects if any
        const allProjectRecords = [];

        if (projects && projects.length > 0) {
            const projectRecords = projects
                .filter((p: any) => p.youtubeUrl || p.customerName || p.companyName || p.description)
                .map((p: any) => ({
                    epcId: newEpc.id,
                    name: p.name || p.companyName || p.customerName || "Project",
                    youtubeUrl: p.youtubeUrl || null,
                    installationDate: p.installationDate || null,
                    customerName: p.customerName || null,
                    companyName: p.companyName || null,
                    city: p.city || null,
                    country: p.country || null,
                    description: p.description || null
                }));
            allProjectRecords.push(...projectRecords);
        }

        // 7. Insert customer testimonials if any
        if (testimonials && testimonials.length > 0) {
            const testimonialRecords = testimonials
                .filter((t: any) => t.youtubeUrl || t.customerName || t.companyName || t.description)
                .map((t: any) => ({
                    epcId: newEpc.id,
                    name: t.customerName ? `Testimonial - ${t.customerName}` : "Customer Testimonial",
                    youtubeUrl: t.youtubeUrl || null,
                    installationDate: t.installationDate || null,
                    customerName: t.customerName || null,
                    companyName: t.companyName || null,
                    city: t.city || null,
                    country: t.country || null,
                    description: t.description || null
                }));
            allProjectRecords.push(...testimonialRecords);
        }

        if (allProjectRecords.length > 0) {
            await db.insert(epcProjects).values(allProjectRecords);
        }

        revalidatePath("/dashboard/users", "layout");
        revalidatePath("/epcs", "layout");
        
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
