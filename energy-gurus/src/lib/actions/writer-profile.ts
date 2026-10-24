"use server";

import { db } from "@/db";
import { users, writerProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { writerProfileSchema } from "@/lib/validations/schemas";
import { sanitizeDbError } from "@/lib/utils/errors";

export async function getCurrentWriterProfile() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (!user) return null;

    let [profile] = await db
      .select()
      .from(writerProfiles)
      .where(eq(writerProfiles.userId, user.id))
      .limit(1);

    if (!profile && user.role === "writer") {
      const [newProfile] = await db
        .insert(writerProfiles)
        .values({
          userId: user.id,
          name: user.name || user.email.split("@")[0],
          designation: "Contributing Columnist",
          status: "approved",
          approvalHistory: [
            {
              date: new Date().toISOString(),
              action: "Auto-Provisioned & Approved",
              note: "Writer profile initialized.",
            },
          ],
        })
        .onConflictDoNothing()
        .returning();
      profile = newProfile;
    }

    return { user, profile };
  } catch (error) {
    console.error("Failed to get current writer profile:", error);
    return null;
  }
}

export async function saveWriterProfile(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, message: "Unauthorized. Please sign in." };

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (!user) return { success: false, message: "User account not found." };

    const role = await getUserRole();
    if (role !== "writer" && role !== "admin" && role !== "super-admin") {
      return { success: false, message: "Only article writers or admins can manage writer profiles." };
    }

    const rawData = {
      name: (formData.get("name") as string)?.trim() || "",
      designation: (formData.get("designation") as string)?.trim() || "",
      pictureUrl: (formData.get("pictureUrl") as string)?.trim() || "",
      bio: (formData.get("bio") as string)?.trim() || "",
      linkedin: (formData.get("linkedin") as string)?.trim() || "",
      facebook: (formData.get("facebook") as string)?.trim() || "",
      instagram: (formData.get("instagram") as string)?.trim() || "",
      twitter: (formData.get("twitter") as string)?.trim() || "",
      tiktok: (formData.get("tiktok") as string)?.trim() || "",
    };

    const validated = writerProfileSchema.safeParse(rawData);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "Validation failed";
      return { success: false, message: firstError };
    }

    const { name, designation, pictureUrl, bio, linkedin, facebook, instagram, twitter, tiktok } = validated.data;

    // Strict 50 to 100-word intro check
    const words = bio ? bio.split(/\s+/).filter(Boolean) : [];
    if (words.length < 50 || words.length > 100) {
      return {
        success: false,
        message: `Your short intro must be between 50 and 100 words. (Currently: ${words.length} words)`
      };
    }

    const socialLinks = {
      ...(linkedin ? { linkedin } : {}),
      ...(facebook ? { facebook } : {}),
      ...(instagram ? { instagram } : {}),
      ...(twitter ? { twitter } : {}),
      ...(tiktok ? { tiktok } : {})
    };

    // Any changes by writer require admin approval first ("anything writers change they must need approval first")
    const newStatus = "pending_review";

    const [existingProfile] = await db
      .select()
      .from(writerProfiles)
      .where(eq(writerProfiles.userId, user.id))
      .limit(1);

    const history = existingProfile?.approvalHistory || [];
    const newHistory = [
      ...history,
      {
        date: new Date().toISOString(),
        action: existingProfile ? "Profile Updated (Submitted for Review)" : "Profile Created (Submitted for Review)",
        note: "Writer submitted profile updates. Awaiting admin approval."
      }
    ];

    if (existingProfile) {
      await db
        .update(writerProfiles)
        .set({
          name,
          designation,
          pictureUrl,
          bio,
          socialLinks,
          status: newStatus,
          adminFeedback: null, // Clear past feedback on resubmission
          approvalHistory: newHistory,
          updatedAt: new Date()
        })
        .where(eq(writerProfiles.id, existingProfile.id));
    } else {
      await db.insert(writerProfiles).values({
        userId: user.id,
        name,
        designation,
        pictureUrl,
        bio,
        socialLinks,
        status: newStatus,
        approvalHistory: newHistory
      });
    }

    // Also update users.name to match writer display name
    await db.update(users).set({ name }).where(eq(users.id, user.id));

    revalidatePath("/dashboard/writer");
    revalidatePath("/dashboard/moderation");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Profile submitted successfully! It is now pending admin review before you can publish articles."
    };
  } catch (error) {
    const cleanMessage = sanitizeDbError(error, "Failed to save profile. Please try again.");
    return { success: false, message: cleanMessage };
  }
}

export async function adminUpdateWriterProfileStatusAction(
  profileId: string,
  newStatus: "approved" | "changes_requested" | "pending_review" | "draft",
  feedbackNote?: string
) {
  try {
    const role = await getUserRole();
    if (role !== "admin" && role !== "super-admin") {
      throw new Error("Unauthorized. Admin role required.");
    }

    const [profile] = await db
      .select()
      .from(writerProfiles)
      .where(eq(writerProfiles.id, profileId))
      .limit(1);

    if (!profile) throw new Error("Writer profile not found.");

    const history = profile.approvalHistory || [];
    const actionLabel =
      newStatus === "approved"
        ? "Writer Profile Approved"
        : newStatus === "changes_requested"
        ? "Changes Requested"
        : `Status set to ${newStatus}`;

    const newHistory = [
      ...history,
      {
        date: new Date().toISOString(),
        action: actionLabel,
        note: feedbackNote || (newStatus === "approved" ? "Approved by EnergyGurus Admin." : undefined)
      }
    ];

    await db
      .update(writerProfiles)
      .set({
        status: newStatus,
        adminFeedback: feedbackNote || (newStatus === "approved" ? null : profile.adminFeedback),
        approvalHistory: newHistory,
        updatedAt: new Date()
      })
      .where(eq(writerProfiles.id, profileId));

    revalidatePath("/dashboard/writer");
    revalidatePath("/dashboard/moderation");
    revalidatePath("/dashboard/news");

    return { success: true, message: `Writer profile status updated to ${newStatus}.` };
  } catch (error) {
    const cleanMessage = sanitizeDbError(error, "Failed to update profile status.");
    return { success: false, message: cleanMessage };
  }
}
