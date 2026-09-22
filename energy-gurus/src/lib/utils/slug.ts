/**
 * Generates an SEO-friendly slug from any string
 * e.g., "Growatt Solar (Pakistan)" -> "growatt-solar-pakistan"
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // separate accent from letter
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric except spaces and hyphens
    .replace(/[\s_]+/g, "-") // replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
}

export function isUUID(str: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
}

export async function generateUniqueNewsSlug(title: string, currentId?: string): Promise<string> {
  const { db } = await import("@/db");
  const { news } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  const baseSlug = slugify(title) || "news";
  let candidate = baseSlug;
  let count = 1;

  while (true) {
    const existing = await db.select({ id: news.id }).from(news).where(eq(news.slug, candidate)).limit(1);
    if (existing.length === 0 || (currentId && existing[0].id === currentId)) {
      return candidate;
    }
    candidate = `${baseSlug}-${count}`;
    count++;
  }
}

