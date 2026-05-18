import { MetadataRoute } from 'next';
import { db } from '@/db';
import { epcInstallers, brands, users, epcOffices, epcProjects, products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getEpcCompleteness, getBrandCompleteness } from '@/lib/utils/completeness';

const BASE_URL = 'https://energygurus.online';
const LOCALES = ['en', 'ur'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      projectsCount: sql<number>`(SELECT COUNT(*) FROM ${epcProjects} WHERE ${epcProjects.epcId} = ${epcInstallers.id})`.mapWith(Number),
    })
    .from(epcInstallers)
    .innerJoin(users, eq(users.id, epcInstallers.userId))
    .where(eq(users.isActive, true));

  const validInstallers = activeInstallers.filter(inst => {
    const { score } = getEpcCompleteness(inst, inst.officesCount || 0, inst.projectsCount || 0);
    return score >= 50;
  });

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
      productsCount: sql<number>`(SELECT COUNT(*) FROM ${products} WHERE ${products.brandId} = ${brands.id})`.mapWith(Number),
    })
    .from(brands)
    .innerJoin(users, eq(users.id, brands.userId))
    .where(eq(users.isActive, true));

  const validBrands = activeBrands.filter(b => {
    const { score } = getBrandCompleteness(b, b.productsCount || 0);
    return score >= 50;
  });

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Core static routes for all dynamic locales
  const staticPaths = ['', '/epcs', '/brands', '/live-qa', '/podcast'];

  for (const locale of LOCALES) {
    for (const path of staticPaths) {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1.0 : 0.8,
      });
    }
  }

  // 2. Dynamic EPC profile pages
  for (const installer of validInstallers) {
    for (const locale of LOCALES) {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}/epcs/${installer.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  // 3. Dynamic Brand profile pages
  for (const brand of validBrands) {
    for (const locale of LOCALES) {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}/brands/${brand.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return sitemapEntries;
}
