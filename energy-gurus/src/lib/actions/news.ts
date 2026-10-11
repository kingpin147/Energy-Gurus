"use server";

import { db } from "@/db";
import { news, users, writerProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { generateUniqueNewsSlug } from "@/lib/utils/slug";
import { getUserRole } from "@/lib/roles";

export async function getMyWriterArticles() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return [];

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (!user) return [];

    const articles = await db
      .select()
      .from(news)
      .where(eq(news.authorId, user.id))
      .orderBy(desc(news.createdAt));

    return articles;
  } catch (error) {
    console.error("Failed to fetch writer articles:", error);
    return [];
  }
}

export async function createNews(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, message: "Unauthorized. Please sign in." };

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (!user) return { success: false, message: "User account not found." };

    const role = await getUserRole();
    const isWriter = role === "writer";
    const isAdmin = role === "admin" || role === "super-admin";

    if (!isWriter && !isAdmin) {
      return { success: false, message: "Unauthorized. Only verified writers and admins can create articles." };
    }

    const title = (formData.get("title") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const imageUrl = (formData.get("imageUrl") as string)?.trim();
    const isPublishedImmediate = formData.get("isPublished") === "true";
    const publishedAtStr = formData.get("publishedAt") as string;

    if (!title || !content || !category) {
      return { success: false, message: "Missing required fields (title, category, or content)." };
    }

    let authorName = "Energy Gurus Team";
    let authorPictureUrl: string | null = null;
    let authorDesignation: string | null = "Official Publication";
    let authorOrganization: string | null = "EnergyGurus";
    let authorLinkedIn: string | null = null;
    let authorFacebook: string | null = null;
    let authorInstagram: string | null = null;
    let authorTwitter: string | null = null;
    let authorTiktok: string | null = null;
    let authorBio: string | null = null;
    let authorEmail: string | null = user.email || null;

    let isPublished = false;
    let articleStatus: "draft" | "pending_review" | "changes_requested" | "published" = "draft";
    let finalPublishedAt: Date | null = null;

    if (isWriter) {
      // 1. Verify Writer Profile is approved
      const [writerProfile] = await db
        .select()
        .from(writerProfiles)
        .where(eq(writerProfiles.userId, user.id))
        .limit(1);

      if (!writerProfile || writerProfile.status !== "approved") {
        return {
          success: false,
          message:
            "You cannot create articles until your Writer Profile has been approved by an administrator. Please complete and submit your profile at /dashboard/writer."
        };
      }

      // 2. Lock author metadata strictly to the writer's approved profile
      authorName = writerProfile.name;
      authorPictureUrl = writerProfile.pictureUrl || null;
      authorDesignation = writerProfile.designation || null;
      authorOrganization = null;
      authorBio = writerProfile.bio || null;
      authorLinkedIn = writerProfile.socialLinks?.linkedin || null;
      authorFacebook = writerProfile.socialLinks?.facebook || null;
      authorInstagram = writerProfile.socialLinks?.instagram || null;
      authorTwitter = writerProfile.socialLinks?.twitter || null;
      authorTiktok = writerProfile.socialLinks?.tiktok || null;

      // 3. Writers cannot self-publish. All submissions require admin approval.
      isPublished = false;
      articleStatus = "pending_review";
      finalPublishedAt = null;
    } else {
      // Admin creation
      authorName = (formData.get("authorName") as string) || "Energy Gurus Team";
      authorPictureUrl = (formData.get("authorPictureUrl") as string) || null;
      authorDesignation = (formData.get("authorDesignation") as string) || "Official Publication";
      authorOrganization = (formData.get("authorOrganization") as string) || "EnergyGurus";
      authorLinkedIn = (formData.get("authorLinkedIn") as string) || null;
      authorEmail = (formData.get("authorEmail") as string) || user.email || null;

      if (isPublishedImmediate) {
        finalPublishedAt = new Date();
      } else if (publishedAtStr) {
        finalPublishedAt = new Date(publishedAtStr);
      }

      const isNowOrPast = finalPublishedAt ? finalPublishedAt <= new Date() : false;
      isPublished = isPublishedImmediate || isNowOrPast;
      articleStatus = isPublished ? "published" : "draft";
    }

    const slug = await generateUniqueNewsSlug(title);

    await db.insert(news).values({
      slug,
      title,
      content,
      category,
      imageUrl: imageUrl || null,
      authorId: user.id,
      authorName,
      authorPictureUrl,
      authorDesignation,
      authorOrganization,
      authorLinkedIn,
      authorFacebook,
      authorInstagram,
      authorTwitter,
      authorTiktok,
      authorBio,
      authorEmail,
      isPublished,
      status: articleStatus,
      publishedAt: finalPublishedAt || (isPublished ? new Date() : null),
    });

    revalidatePath("/dashboard/news");
    revalidatePath("/dashboard/writer/articles");
    revalidatePath("/news");
    revalidatePath(`/news/${slug}`);
    revalidateTag("news", {});

    return {
      success: true,
      message: isWriter
        ? "Article submitted successfully for editorial review! It will appear live once approved by an administrator."
        : isPublished
        ? "Article published live successfully."
        : "Article saved as draft."
    };
  } catch (error: any) {
    console.error("Failed to create news article:", error);
    return { success: false, message: error?.message || "Failed to create article." };
  }
}

export async function updateNews(id: string, formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, message: "Unauthorized" };

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (!user) return { success: false, message: "Unauthorized" };

    const [existingArticle] = await db.select().from(news).where(eq(news.id, id)).limit(1);
    if (!existingArticle) return { success: false, message: "Article not found" };

    const role = await getUserRole();
    const isWriter = role === "writer";
    const isAdmin = role === "admin" || role === "super-admin";

    // Writers can only edit their own articles
    if (isWriter && existingArticle.authorId !== user.id) {
      return { success: false, message: "Unauthorized. You can only edit your own articles." };
    }

    const title = (formData.get("title") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const imageUrl = (formData.get("imageUrl") as string)?.trim();
    const isPublishedImmediate = formData.get("isPublished") === "true";
    const publishedAtStr = formData.get("publishedAt") as string;

    if (!title || !content || !category) {
      return { success: false, message: "Missing required fields" };
    }

    const slug = await generateUniqueNewsSlug(title, id);

    if (isWriter) {
      // 1. Verify Writer Profile is approved
      const [writerProfile] = await db
        .select()
        .from(writerProfiles)
        .where(eq(writerProfiles.userId, user.id))
        .limit(1);

      if (!writerProfile || writerProfile.status !== "approved") {
        return {
          success: false,
          message: "You must have an approved Writer Profile before submitting article updates."
        };
      }

      // 2. Any edits by writers require re-approval before going live ("anything writers change they must need approval first")
      await db
        .update(news)
        .set({
          slug,
          title,
          content,
          category,
          imageUrl: imageUrl || null,
          authorName: writerProfile.name,
          authorPictureUrl: writerProfile.pictureUrl || null,
          authorDesignation: writerProfile.designation || null,
          authorBio: writerProfile.bio || null,
          authorLinkedIn: writerProfile.socialLinks?.linkedin || null,
          authorFacebook: writerProfile.socialLinks?.facebook || null,
          authorInstagram: writerProfile.socialLinks?.instagram || null,
          authorTwitter: writerProfile.socialLinks?.twitter || null,
          authorTiktok: writerProfile.socialLinks?.tiktok || null,
          isPublished: false,
          status: "pending_review",
          adminFeedback: null,
          updatedAt: new Date()
        })
        .where(eq(news.id, id));

      revalidatePath("/dashboard/writer/articles");
      revalidatePath(`/dashboard/writer/articles/${id}/edit`);
      revalidatePath("/dashboard/news");
      revalidatePath("/news");
      revalidateTag("news", {});

      return {
        success: true,
        message: "Article updated and submitted for admin review! Changes will go live upon approval."
      };
    } else {
      // Admin update
      let finalPublishedAt: Date | undefined = undefined;
      if (isPublishedImmediate) {
        finalPublishedAt = new Date();
      } else if (publishedAtStr) {
        finalPublishedAt = new Date(publishedAtStr);
      }

      const isNowOrPast = finalPublishedAt ? finalPublishedAt <= new Date() : false;
      const isPublished = isPublishedImmediate || isNowOrPast;

      await db
        .update(news)
        .set({
          slug,
          title,
          content,
          category,
          imageUrl: imageUrl || null,
          isPublished,
          status: isPublished ? "published" : "draft",
          publishedAt: finalPublishedAt,
          updatedAt: new Date()
        })
        .where(eq(news.id, id));

      revalidatePath("/dashboard/news");
      revalidatePath(`/dashboard/news/${id}/edit`);
      revalidatePath("/news");
      revalidatePath(`/news/${slug}`);
      revalidateTag("news", {});

      return { success: true, message: "News article updated successfully" };
    }
  } catch (error: any) {
    console.error("Failed to update news article:", error);
    return { success: false, message: error?.message || "Failed to update article" };
  }
}

export async function adminReviewArticleAction(
  id: string,
  action: "publish" | "changes_requested" | "unpublish",
  feedback?: string
) {
  try {
    const role = await getUserRole();
    if (role !== "admin" && role !== "super-admin") {
      throw new Error("Unauthorized. Admin role required.");
    }

    const [article] = await db.select().from(news).where(eq(news.id, id)).limit(1);
    if (!article) throw new Error("Article not found.");

    if (action === "publish") {
      await db
        .update(news)
        .set({
          isPublished: true,
          status: "published",
          adminFeedback: null,
          publishedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(news.id, id));
    } else if (action === "changes_requested") {
      await db
        .update(news)
        .set({
          isPublished: false,
          status: "changes_requested",
          adminFeedback: feedback || "Changes requested by editor.",
          updatedAt: new Date()
        })
        .where(eq(news.id, id));
    } else {
      // Unpublish / revert to draft
      await db
        .update(news)
        .set({
          isPublished: false,
          status: "draft",
          updatedAt: new Date()
        })
        .where(eq(news.id, id));
    }

    revalidatePath("/dashboard/news");
    revalidatePath("/dashboard/moderation");
    revalidatePath("/dashboard/writer/articles");
    revalidatePath("/news");
    revalidatePath(`/news/${article.slug}`);
    revalidateTag("news", {});

    return {
      success: true,
      message:
        action === "publish"
          ? "Article approved and published live!"
          : action === "changes_requested"
          ? "Feedback sent to author for revisions."
          : "Article unpublished."
    };
  } catch (error: any) {
    console.error("Admin review article error:", error);
    return { success: false, message: error?.message || "Failed to review article." };
  }
}

export async function deleteNews(id: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, message: "Unauthorized" };

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    if (!user) return { success: false, message: "Unauthorized" };

    const [article] = await db.select().from(news).where(eq(news.id, id)).limit(1);
    if (!article) return { success: false, message: "Article not found" };

    const role = await getUserRole();
    const isAdmin = role === "admin" || role === "super-admin";

    // Writers can delete their own draft/pending articles
    if (!isAdmin && article.authorId !== user.id) {
      return { success: false, message: "Unauthorized to delete this article" };
    }

    await db.delete(news).where(eq(news.id, id));
    revalidatePath("/dashboard/news");
    revalidatePath("/dashboard/writer/articles");
    revalidatePath("/news");
    revalidateTag("news", {});
    return { success: true, message: "Article deleted successfully" };
  } catch (error: any) {
    console.error("Failed to delete news:", error);
    return { success: false, message: "Failed to delete article" };
  }
}

export async function toggleNewsStatus(id: string, isPublished: boolean) {
  try {
    const role = await getUserRole();
    if (role !== "admin" && role !== "super-admin") {
      throw new Error("Unauthorized");
    }

    await db
      .update(news)
      .set({
        isPublished,
        status: isPublished ? "published" : "draft",
        publishedAt: isPublished ? new Date() : undefined,
        updatedAt: new Date()
      })
      .where(eq(news.id, id));

    revalidatePath("/dashboard/news");
    revalidatePath("/news");
    revalidateTag("news", {});
    return { success: true, message: "News status updated successfully" };
  } catch (error: any) {
    console.error("Failed to update news status:", error);
    return { success: false, message: "Failed to update news status" };
  }
}
