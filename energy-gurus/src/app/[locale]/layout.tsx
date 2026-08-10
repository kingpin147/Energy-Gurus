import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic, Outfit, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CSPostHogProvider } from '@/components/providers/PostHogProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { CompareProvider } from '@/components/shared/compare-context';
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.energygurus.online";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: "EnergyGurus - Certified Solar EPCs & Energy Brands in Pakistan",
      template: "%s | EnergyGurus",
    },
    description: "Pakistan's premier platform for verified solar EPC installers, tier-1 brand discovery, expert energy audits, real-time telemetry, and technical energy podcasts.",
    keywords: [
      "EnergyGurus",
      "Solar Pakistan",
      "EPC Installers Pakistan",
      "Solar Brands",
      "Solar Panel Verification",
      "Energy Audit Pakistan",
      "Solar Monitoring",
      "Solar Podcast Pakistan",
    ],
    authors: [{ name: "EnergyGurus Team", url: baseUrl }],
    creator: "EnergyGurus",
    publisher: "EnergyGurus",
    icons: {
      icon: [
        { url: "/logo-icon.svg", type: "image/svg+xml" },
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "32x32" },
      ],
      shortcut: "/favicon.ico",
      apple: "/logo-icon.svg",
    },
    openGraph: {
      type: "website",
      locale: locale === "ur" ? "ur_PK" : "en_US",
      url: `${baseUrl}/${locale}`,
      siteName: "EnergyGurus",
      title: "EnergyGurus - Certified Solar EPCs & Energy Brands in Pakistan",
      description: "Discover verified solar installers, compare top energy brands, request technical audits, and stream expert podcasts.",
      images: [
        {
          url: `${baseUrl}/new_hero_banner.jpg`,
          width: 1200,
          height: 630,
          alt: "EnergyGurus Pakistan",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "EnergyGurus - Certified Solar EPCs & Energy Brands in Pakistan",
      description: "Discover verified solar installers, compare top energy brands, request technical audits, and stream expert podcasts.",
      images: [`${baseUrl}/new_hero_banner.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        ur: `${baseUrl}/ur`,
        "x-default": `${baseUrl}/en`,
      },
    },
  };
}


export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = clerkKey && clerkKey.startsWith('pk_') && !clerkKey.includes('your_') && clerkKey !== 'pk_test_...';

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.energygurus.online/#organization",
        "name": "EnergyGurus",
        "url": "https://www.energygurus.online",
        "logo": "https://www.energygurus.online/logo-icon.svg",
        "sameAs": [
          "https://www.tiktok.com/@energygurus.online",
          "https://www.linkedin.com/company/energygurusonline",
          "https://x.com/energyguruspk",
          "https://www.youtube.com/@energygurus.online",
          "https://www.facebook.com/energygurus.online"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.energygurus.online/#website",
        "url": "https://www.energygurus.online",
        "name": "EnergyGurus",
        "publisher": {
          "@id": "https://www.energygurus.online/#organization"
        },
        "inLanguage": ["en", "ur"]
      }
    ]
  };

  const content = (
    <CSPostHogProvider>
      <NextIntlClientProvider messages={messages}>
        <CompareProvider>
          {children}
          <Toaster position="top-right" expand={true} richColors />
          <SpeedInsights />
          <Analytics />
        </CompareProvider>
      </NextIntlClientProvider>
    </CSPostHogProvider>
  );

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${notoArabic.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {isClerkConfigured ? (
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: "#12213A",
                colorText: "#1B1F24",
                colorBackground: "#ffffff",
                colorTextOnPrimaryBackground: "#ffffff",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                borderRadius: "4px",
              },
              layout: {
                logoImageUrl: "/logo-icon.svg",
              },
              elements: {
                card: {
                  boxShadow: "0 8px 32px 0 rgba(18, 33, 58, 0.07)",
                  border: "1px solid rgba(18, 33, 58, 0.12)",
                  borderRadius: "4px",
                },
                headerTitle: {
                  color: "#12213A",
                  fontWeight: "700",
                },
                formButtonPrimary: {
                  backgroundColor: "#E8A33D",
                  color: "#12213A",
                  fontWeight: "700",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f2b458",
                  },
                },
                footerActionLink: {
                  color: "#E8A33D",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#f2b458",
                  },
                },
              },
            }}
          >
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}

