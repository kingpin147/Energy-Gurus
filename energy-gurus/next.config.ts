import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'v5.airtableusercontent.com' },
      { protocol: 'https', hostname: 'energygurus.online' },
      { protocol: 'https', hostname: 'pub-e5b765a7c8b54f2da6a2b30d08d60039.r2.dev' },
    ],
  },
};

export default withNextIntl(nextConfig);
