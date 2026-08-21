import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { db } from "../src/db";
import { news } from "../src/db/schema";
import { sql } from "drizzle-orm";
import { slugify } from "../src/lib/utils/slug";

async function backfillSlugs() {
  console.log("--- Starting News Slug Migration & Backfill ---");

  // 1. Ensure slug column and index exist in PostgreSQL
  console.log("Checking and creating slug column on news table if needed...");
  await db.execute(sql`
    ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "slug" text;
  `);
  
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "news_slug_unique" ON "news" ("slug");
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "news_slug_idx" ON "news" ("slug");
  `);
  console.log("Database schema ready.");

  // 2. Fetch all news articles
  const allNews = await db.select({
    id: news.id,
    title: news.title,
    slug: news.slug,
  }).from(news);

  console.log(`Found ${allNews.length} news articles.`);

  const usedSlugs = new Set<string>();

  for (const article of allNews) {
    let baseSlug = slugify(article.title) || `news-${article.id.slice(0, 8)}`;
    let finalSlug = baseSlug;
    let counter = 1;

    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    usedSlugs.add(finalSlug);

    console.log(`Updating Article [${article.id}]: "${article.title}" -> slug: "${finalSlug}"`);
    
    await db.execute(sql`
      UPDATE "news" SET "slug" = ${finalSlug} WHERE "id" = ${article.id}
    `);
  }

  console.log("--- Backfill Completed Successfully! ---");
  process.exit(0);
}

backfillSlugs().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
