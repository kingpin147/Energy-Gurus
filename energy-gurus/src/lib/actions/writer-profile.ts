"use server";

import { db } from "@/db";
import { users, writerProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";

export async function getCurrentWriterProfile() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (!user) return null;

    const [profile] = await db
      .select()
      .from(writerProfiles)
      .where(eq(writerProfiles.userId, user.id))
      .limit(1);

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

    const name = (formData.get("name") as string)?.trim();
    const designation = (formData.get("designation") as string)?.trim() || "";
    const pictureUrl = (formData.get("pictureUrl") as string)?.trim() || "";
    const bio = (formData.get("bio") as string)?.trim() || "";

    // Social Handles
    const linkedin = (formData.get("linkedin") as string)?.trim() || "";
    const facebook = (formData.get("facebook") as string)?.trim() || "";
    const instagram = (formData.get("instagram") as string)?.trim() || "";
    const twitter = (formData.get("twitter") as string)?.trim() || "";
    const tiktok = (formData.get("tiktok") as string)?.trim() || "";

    if (!name) {
      return { success: false, message: "Author / Writer display name is required." };
    }

    // Validation: 50 to 100-word short intro
    const words = bio ? bio.split(/\s+/).filter(Boolean) : [];
    if (words.length < 50 || words.length > 100) {
      return {
        success: false,
        message: `Your short intro must be between 50 and 100 words. (Currently: ${words.length} words)`
      };
    }

    // Validation: At least 2 social handles are mandatory
    const socialEntries = [
      { key: "linkedin", value: linkedin },
      { key: "facebook", value: facebook },
      { key: "instagram", value: instagram },
      { key: "twitter", value: twitter },
      { key: "tiktok", value: tiktok }
    ];

    const filledSocials = socialEntries.filter((s) => s.value.length > 0);
    if (filledSocials.length < 2) {
      return {
        success: false,
        message: "At least 2 social media handles are required (LinkedIn, Facebook, Instagram, X/Twitter, or TikTok)."
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
  } catch (error: any) {
    console.error("Error saving writer profile:", error);
    return { success: false, message: error?.message || "Failed to save profile." };
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
  } catch (error: any) {
    console.error("Admin review writer profile error:", error);
    return { success: false, message: error?.message || "Failed to update profile status." };
  }
}
