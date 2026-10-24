"use server";

import { db } from "@/db";
import { writerProfiles, users, news } from "@/db/schema";
import { eq, desc, sql, and, isNull } from "drizzle-orm";
import { getUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { deleteUser } from "@/lib/actions/users";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { deleteFile, extractKeyFromUrl } from "@/lib/r2";

const adminWhitelist = ["nomiking0072012@gmail.com", "energygurusonline@gmail.com"];

export async function getAllWritersAdmin() {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    throw new Error("Unauthorized access");
  }

  // Auto-sync: Ensure all users with role 'writer' have a corresponding writerProfiles entry
  const missingProfiles = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .leftJoin(writerProfiles, eq(users.id, writerProfiles.userId))
    .where(and(eq(users.role, "writer"), isNull(writerProfiles.id)));

  if (missingProfiles.length > 0) {
    for (const writerUser of missingProfiles) {
      await db
        .insert(writerProfiles)
        .values({
          userId: writerUser.id,
          name: writerUser.name || writerUser.email.split("@")[0],
          designation: "Contributing Columnist",
          status: "approved",
          approvalHistory: [
            {
              date: new Date().toISOString(),
              action: "Account Provisioned & Approved",
              note: "Writer profile initialized from registered writer account.",
            },
          ],
        })
        .onConflictDoNothing();
    }
  }

  const list = await db
    .select({
      id: writerProfiles.id,
      userId: writerProfiles.userId,
      name: writerProfiles.name,
      pictureUrl: writerProfiles.pictureUrl,
      designation: writerProfiles.designation,
      bio: writerProfiles.bio,
      socialLinks: writerProfiles.socialLinks,
      status: writerProfiles.status,
      adminFeedback: writerProfiles.adminFeedback,
      createdAt: writerProfiles.createdAt,
      updatedAt: writerProfiles.updatedAt,
      email: users.email,
      userEmail: users.email,
      userIsActive: users.isActive,
      articlesCount: sql<number>`(SELECT COUNT(*) FROM ${news} WHERE ${news.authorId} = ${writerProfiles.userId})`.mapWith(Number),
    })
    .from(writerProfiles)
    .innerJoin(users, eq(writerProfiles.userId, users.id))
    .orderBy(desc(writerProfiles.createdAt));

  return list;
}

export async function getWriterFullDetails(profileId: string) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    throw new Error("Unauthorized access");
  }

  const [profile] = await db
    .select({
      id: writerProfiles.id,
      userId: writerProfiles.userId,
      name: writerProfiles.name,
      pictureUrl: writerProfiles.pictureUrl,
      designation: writerProfiles.designation,
      bio: writerProfiles.bio,
      socialLinks: writerProfiles.socialLinks,
      status: writerProfiles.status,
      adminFeedback: writerProfiles.adminFeedback,
      approvalHistory: writerProfiles.approvalHistory,
      createdAt: writerProfiles.createdAt,
      updatedAt: writerProfiles.updatedAt,
      userEmail: users.email,
      userIsActive: users.isActive,
    })
    .from(writerProfiles)
    .innerJoin(users, eq(writerProfiles.userId, users.id))
    .where(eq(writerProfiles.id, profileId));

  if (!profile) return null;

  const writerArticles = await db
    .select({
      id: news.id,
      title: news.title,
      slug: news.slug,
      category: news.category,
      imageUrl: news.imageUrl,
      isPublished: news.isPublished,
      status: news.status,
      createdAt: news.createdAt,
      publishedAt: news.publishedAt,
    })
    .from(news)
    .where(eq(news.authorId, profile.userId))
    .orderBy(desc(news.createdAt));

  return {
    ...profile,
    articles: writerArticles,
  };
}

export async function onboardWriterAction(formData: FormData) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const name = (formData.get("name") as string)?.trim();
    const designation = (formData.get("designation") as string)?.trim() || null;
    const pictureUrl = (formData.get("pictureUrl") as string)?.trim() || null;
    const bio = (formData.get("bio") as string)?.trim() || null;

    if (!email || !name) {
      return { success: false, message: "Email and Author Name are required" };
    }

    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email));
    if (existingUser) {
      return { success: false, message: "An account with this email address already exists. Please use a unique email." };
    }

    // Generate secure random password
    const generatedPassword = Array(16)
      .fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*")
      .map((x) => x[Math.floor(Math.random() * x.length)])
      .join("");

    // 1. Create User in Clerk
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    let clerkUserId: string;
    try {
      const clerkUser = await clerk.users.createUser({
        emailAddress: [email],
        password: generatedPassword,
        publicMetadata: { role: "writer" },
      });
      clerkUserId = clerkUser.id;
    } catch (clerkErr: any) {
      console.error("Clerk user creation error:", clerkErr);
      const [existingClerkUser] = await clerk.users.getUserList({ emailAddress: [email] }).then((res) => res.data);
      if (existingClerkUser) {
        clerkUserId = existingClerkUser.id;
      } else {
        return {
          success: false,
          message: clerkErr?.errors?.[0]?.longMessage || clerkErr?.message || "Failed to create user account in Clerk.",
        };
      }
    }

    // 2. Insert into users table
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUserId,
        email,
        name,
        role: "writer",
        isActive: true,
      })
      .returning();

    // 3. Construct social handles
    const linkedin = (formData.get("linkedin") as string)?.trim();
    const facebook = (formData.get("facebook") as string)?.trim();
    const instagram = (formData.get("instagram") as string)?.trim();
    const twitter = (formData.get("twitter") as string)?.trim();
    const tiktok = (formData.get("tiktok") as string)?.trim();

    const socialLinks = {
      ...(linkedin ? { linkedin } : {}),
      ...(facebook ? { facebook } : {}),
      ...(instagram ? { instagram } : {}),
      ...(twitter ? { twitter } : {}),
      ...(tiktok ? { tiktok } : {}),
    };

    // 4. Insert into writerProfiles table (Directly approved because onboarded by Super Admin)
    const [newProfile] = await db
      .insert(writerProfiles)
      .values({
        userId: newUser.id,
        name,
        designation,
        pictureUrl,
        bio,
        socialLinks,
        status: "approved",
        approvalHistory: [
          {
            date: new Date().toISOString(),
            action: "Directly Onboarded & Approved by Super Admin",
            note: "Account and author profile created via Super Admin Hub.",
          },
        ],
      })
      .returning();

    revalidatePath("/dashboard/admin/onboard-writer");
    revalidatePath("/dashboard/writer");
    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/news");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Writer Onboarded Successfully.",
      password: generatedPassword,
      profileId: newProfile.id,
    };
  } catch (error: any) {
    console.error("Failed to onboard writer:", error);
    return {
      success: false,
      message: error?.message || "An unexpected error occurred during Writer onboarding.",
    };
  }
}

export async function adminUpdateWriterFull(
  profileId: string,
  data: {
    name: string;
    designation?: string | null;
    pictureUrl?: string | null;
    bio?: string | null;
    socialLinks?: {
      linkedin?: string;
      facebook?: string;
      instagram?: string;
      twitter?: string;
      tiktok?: string;
    };
    status?: "draft" | "pending_review" | "changes_requested" | "approved";
    adminFeedback?: string | null;
  }
) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized access" };
  }

  try {
    const [existing] = await db.select().from(writerProfiles).where(eq(writerProfiles.id, profileId));
    if (!existing) {
      return { success: false, message: "Writer profile not found" };
    }

    await db
      .update(writerProfiles)
      .set({
        name: data.name,
        designation: data.designation ?? null,
        pictureUrl: data.pictureUrl !== undefined ? data.pictureUrl : existing.pictureUrl,
        bio: data.bio ?? null,
        socialLinks: data.socialLinks ?? existing.socialLinks,
        status: data.status ?? existing.status,
        adminFeedback: data.adminFeedback ?? null,
        updatedAt: new Date(),
      })
      .where(eq(writerProfiles.id, profileId));

    // Also update users.name to match
    if (existing.userId) {
      await db.update(users).set({ name: data.name }).where(eq(users.id, existing.userId));
    }

    revalidatePath("/dashboard/admin/onboard-writer");
    revalidatePath("/dashboard/writer");
    revalidatePath("/dashboard/news");
    revalidatePath("/", "layout");

    return { success: true, message: "Writer profile updated successfully" };
  } catch (error: any) {
    console.error("Error updating writer:", error);
    return { success: false, message: "Failed to update writer profile. Please try again." };
  }
}

export async function deleteWriterAction(profileId: string, userId: string) {
  const role = await getUserRole();
  if (role !== "super-admin" && role !== "admin") {
    return { success: false, message: "Unauthorized access" };
  }

  const { userId: currentClerkId } = await auth();

  try {
    const [profile] = await db.select().from(writerProfiles).where(eq(writerProfiles.id, profileId));
    if (!profile) {
      return { success: false, message: "Writer profile not found" };
    }

    // Delete R2 avatar if present
    if (profile.pictureUrl) {
      try {
        const key = extractKeyFromUrl(profile.pictureUrl);
        await deleteFile(key);
      } catch (e) {
        console.error("Failed to delete avatar from R2:", e);
      }
    }

    // Delete profile
    await db.delete(writerProfiles).where(eq(writerProfiles.id, profileId));

    // Delete user account safely
    if (userId) {
      const [linkedUser] = await db.select().from(users).where(eq(users.id, userId));
      const isSelf = linkedUser?.clerkId && linkedUser.clerkId === currentClerkId;
      const isAdminUser =
        linkedUser &&
        (adminWhitelist.includes(linkedUser.email.toLowerCase()) ||
          linkedUser.role === "super-admin" ||
          linkedUser.role === "admin");

      if (linkedUser && !isSelf && !isAdminUser) {
        try {
          await deleteUser(userId);
        } catch (err) {
          console.warn("User account cleanup notice:", err);
        }
      }
    }

    revalidatePath("/dashboard/admin/onboard-writer");
    revalidatePath("/dashboard/writer");
    revalidatePath("/dashboard/users");
    revalidatePath("/", "layout");

    return { success: true, message: "Writer profile deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting writer:", error);
    return { success: false, message: "Failed to delete writer. Please try again." };
  }
}
