/**
 * Strips HTML tags, markdown formatting, bullets, and excessive whitespace
 * to produce a clean plain-text excerpt.
 *
 * Safe for use in both Server Components and Client Components.
 */
export function cleanArticleExcerpt(content?: string | null, maxLen = 160): string {
  if (!content) return "";
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/#+\s+/g, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/[•●■▪]/g, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/[\r\n\s]+/g, " ")
    .trim();
  if (plainText.length <= maxLen) return plainText;
  return plainText.slice(0, maxLen).trim() + "...";
}
