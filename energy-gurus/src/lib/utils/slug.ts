import { db } from "@/db";
import { news } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

/**
 * Converts a string title into a clean, URL-friendly slug.
 * e.g., "Choosing the right Installer or Company" -> "choosing-the-right-installer-or-company"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace accented characters with standard latin characters
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9\s-]/g, "")
    // Replace multiple spaces or hyphens with a single hyphen
    .replace(/[\s-]+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "");
}

/**
 * Generates a unique slug for a news article by checking existing database records.
 * If a duplicate exists, appends numeric suffixes like "-1", "-2".
 */
export async function generateUniqueNewsSlug(title: string, currentArticleId?: string): Promise<string> {
  const baseSlug = slugify(title) || "news-article";
  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: news.id, slug: news.slug })
      .from(news)
      .where(
        currentArticleId
          ? and(eq(news.slug, candidateSlug), ne(news.id, currentArticleId))
          : eq(news.slug, candidateSlug)
      )
      .limit(1);

    if (existing.length === 0) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${counter}`;
    counter++;
  }
}
