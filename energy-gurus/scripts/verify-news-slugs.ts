import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/db";
import { news } from "../src/db/schema";

async function verifySlugs() {
  const articles = await db.select({
    id: news.id,
    title: news.title,
    slug: news.slug,
    isPublished: news.isPublished,
  }).from(news);

  console.log("\n=== Current Database News Articles & SEO Slugs ===");
  articles.forEach(a => {
    console.log(`- Title: "${a.title}"`);
    console.log(`  UUID: ${a.id}`);
    console.log(`  SEO Slug: ${a.slug}`);
    console.log(`  New URL: https://www.energygurus.online/news/${a.slug}`);
    console.log("--------------------------------------------------");
  });
  process.exit(0);
}

verifySlugs();
