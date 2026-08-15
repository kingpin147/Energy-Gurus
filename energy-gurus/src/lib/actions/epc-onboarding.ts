"use server";

import { db } from "@/db";
import { users, epcInstallers, epcProjects, UserRole } from "@/db/schema";
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
            website: formData.get("website") as string || null,
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

        // 5. Insert projects if any
        if (projects && projects.length > 0) {
            const projectRecords = projects.map((p: any) => ({
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
            await db.insert(epcProjects).values(projectRecords);
        }

        revalidatePath("/dashboard/users", "layout");
        
        return { 
            success: true, 
            message: "EPC Onboarded Successfully.",
            password: generatedPassword // Return this just so admin can share it, or rely on welcome email
        };
        
    } catch (error: any) {
        console.error("Failed to onboard EPC:", error);
        return { success: false, message: error?.message || "An error occurred during onboarding." };
    }
}
