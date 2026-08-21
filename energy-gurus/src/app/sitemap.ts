import { MetadataRoute } from 'next';
import { db } from '@/db';
import { epcInstallers, brands, users, epcOffices, epcProjects, products, podcasts, news } from '@/db/schema';
import { eq, sql, desc, or, lte } from 'drizzle-orm';
import { getEpcCompleteness, getBrandCompleteness } from '@/lib/utils/completeness';

const BASE_URL = 'https://www.energygurus.online';

export const revalidate = 86400; // Cache for 24 hours (Incremental Static Regeneration)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Core static routes for all locales (Always return these)
  const staticPaths = [
    '',
    '/epcs',
    '/epcs/compare',
    '/brands',
    '/brands/compare',
    '/audit',
    '/monitoring',
    '/om',
    '/podcast',
    '/news',
    '/live-qa',
    '/resources',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
  ];

  for (const path of staticPaths) {
    sitemapEntries.push({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '' || path === '/news' ? 'daily' : 'weekly',
      priority: path === '' ? 1.0 : path === '/epcs' || path === '/brands' || path === '/news' ? 0.9 : 0.8
    });
  }

  try {
    // Fetch active EPC installers
    const activeInstallers = await db
      .select({
        id: epcInstallers.id,
        companyName: epcInstallers.companyName,
        ceoName: epcInstallers.ceoName,
        sectors: epcInstallers.sectors,
        logoUrl: epcInstallers.logoUrl,
        about: epcInstallers.about,
        website: epcInstallers.website,
        socialLinks: epcInstallers.socialLinks,
        officesCount: sql<number>`(SELECT COUNT(*) FROM ${epcOffices} WHERE ${epcOffices.epcId} = ${epcInstallers.id})`.mapWith(Number),
        projectsCount: sql<number>`(SELECT COUNT(*) FROM ${epcProjects} WHERE ${epcProjects.epcId} = ${epcInstallers.id})`.mapWith(Number)
      })
      .from(epcInstallers)
      .innerJoin(users, eq(users.id, epcInstallers.userId))
      .where(eq(users.isActive, true));

    const validInstallers = activeInstallers.filter(inst => {
      const { score } = getEpcCompleteness(inst, inst.officesCount || 0, inst.projectsCount || 0);
      return score >= 50;
    });

    // 2. Dynamic EPC profile pages
    for (const installer of validInstallers) {
      const path = `/epcs/${installer.id}`;
      sitemapEntries.push({
        url: `${BASE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7
      });
    }

    // Fetch active Brands
    const activeBrands = await db
      .select({
        id: brands.id,
        brandName: brands.brandName,
        countryHead: brands.countryHead,
        customerCareHead: brands.customerCareHead,
        logoUrl: brands.logoUrl,
        about: brands.about,
        headOffice: brands.headOffice,
        website: brands.website,
        socialLinks: brands.socialLinks,
        warrantyUrl: brands.warrantyUrl,
        productsCount: sql<number>`(SELECT COUNT(*) FROM ${products} WHERE ${products.brandId} = ${brands.id})`.mapWith(Number)
      })
      .from(brands)
      .innerJoin(users, eq(users.id, brands.userId))
      .where(eq(users.isActive, true));

    const validBrands = activeBrands.filter(b => {
      const { score } = getBrandCompleteness(b, b.productsCount || 0);
      return score >= 50;
    });

    // 3. Dynamic Brand profile pages
    for (const brand of validBrands) {
      const path = `/brands/${brand.id}`;
      sitemapEntries.push({
        url: `${BASE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7
      });
    }

    // Fetch published Podcasts
    const activePodcasts = await db
      .select({
        id: podcasts.id,
        createdAt: podcasts.createdAt
      })
      .from(podcasts)
      .orderBy(desc(podcasts.createdAt));

    // 4. Dynamic Podcast episode pages
    for (const episode of activePodcasts) {
      const path = `/podcast/${episode.id}`;
      sitemapEntries.push({
        url: `${BASE_URL}${path}`,
        lastModified: episode.createdAt ? new Date(episode.createdAt) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6
      });
    }

    // Fetch published News articles
    const publishedNews = await db
      .select({
        id: news.id,
        slug: news.slug,
        publishedAt: news.publishedAt,
        updatedAt: news.updatedAt,
        createdAt: news.createdAt,
      })
      .from(news)
      .where(
        or(
          eq(news.isPublished, true),
          lte(news.publishedAt, new Date())
        )
      )
      .orderBy(desc(news.createdAt));

    // 5. Dynamic News article pages
    for (const article of publishedNews) {
      const path = `/news/${article.slug || article.id}`;
      const lastModDate = article.publishedAt
        ? new Date(article.publishedAt)
        : article.updatedAt
        ? new Date(article.updatedAt)
        : article.createdAt
        ? new Date(article.createdAt)
        : new Date();

      sitemapEntries.push({
        url: `${BASE_URL}${path}`,
        lastModified: lastModDate,
        changeFrequency: 'weekly',
        priority: 0.8
      });
    }

  } catch (error) {
    console.error("Error generating dynamic sitemap routes:", error);
    // If DB fails, we still return the static routes above so GSC doesn't get a 500 Error
  }

  return sitemapEntries;
}
