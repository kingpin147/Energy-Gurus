import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/*/dashboard/',
          '/access-denied',
          '/*/access-denied',
          '/too-many-requests',
          '/*/too-many-requests',
          '/(auth)/',
          '/*/sign-in',
          '/*/sign-up',
        ]
    },
    ],
    sitemap: 'https://www.energygurus.online/sitemap.xml'
    };
}
