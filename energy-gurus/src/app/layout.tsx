import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic, Outfit, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CSPostHogProvider } from '@/components/providers/PostHogProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { CompareProvider } from '@/components/shared/compare-context';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"]
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.energygurus.online"),
  title: {
    default: "EnergyGurus - Find Best & Top Solar Installers in Pakistan",
    template: "%s | EnergyGurus"
  },
  description: "Discover the best and top solar installers in Pakistan with EnergyGurus. Get expert ideas on solar energy, compare tier-1 brands, and consult with the top gurus of solar.",
  keywords: [
    "best solar installers in Pakistan",
    "top solar installers in Pakistan",
    "top gurus of solar from Pakistan",
    "best ideas on solar",
    "EnergyGurus",
    "verified solar EPC installers Pakistan",
    "tier-1 solar brands",
    "solar panel verification",
    "solar energy audit Pakistan",
    "solar monitoring Pakistan",
    "commercial solar solutions Pakistan",
    "residential solar installation Pakistan",
  ],
  authors: [{ name: "EnergyGurus Team", url: "https://www.energygurus.online" }],
  creator: "EnergyGurus",
  publisher: "EnergyGurus",
  icons: {
    icon: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo-icon.svg"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.energygurus.online",
    siteName: "EnergyGurus",
    title: "EnergyGurus - Find Best & Top Solar Installers in Pakistan",
    description: "Discover the best and top solar installers in Pakistan with EnergyGurus. Get expert ideas on solar energy, compare tier-1 brands, and consult with the top gurus of solar.",
    images: [
      {
        url: "https://www.energygurus.online/new_hero_banner.jpg",
        width: 1200,
        height: 630,
        alt: "EnergyGurus Pakistan"
      },
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "EnergyGurus - Find Best & Top Solar Installers in Pakistan",
    description: "Discover the best and top solar installers in Pakistan with EnergyGurus. Get expert ideas on solar energy, compare tier-1 brands, and consult with the top gurus of solar.",
    images: ["https://www.energygurus.online/new_hero_banner.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: "https://www.energygurus.online"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
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
        "inLanguage": "en"
      }
    ]
  };

  const content = (
    <CSPostHogProvider>
      <CompareProvider>
        {children}
        <Toaster position="top-right" expand={true} richColors />
        <SpeedInsights />
        <Analytics />
      </CompareProvider>
    </CSPostHogProvider>
  );

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
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
                colorText: "#12213A",
                colorBackground: "#ffffff",
                colorTextOnPrimaryBackground: "#ffffff",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                borderRadius: "16px"
              },
              layout: {
                logoImageUrl: "https://www.energygurus.online/logo-icon.svg",
                socialButtonsVariant: "iconButton"
              },
              elements: {
                card: {
                  boxShadow: "0 12px 40px 0 rgba(18, 33, 58, 0.08)",
                  border: "1px solid rgba(18, 33, 58, 0.1)",
                  borderRadius: "24px",
                  padding: "2rem"
                },
                headerTitle: {
                  color: "#12213A",
                  fontWeight: "700",
                  fontFamily: "var(--font-space-grotesk), sans-serif"
                },
                formButtonPrimary: {
                  backgroundColor: "#E8A33D",
                  color: "#12213A",
                  fontWeight: "700",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f2b458"
                  }
                },
                footerActionLink: {
                  color: "#E8A33D",
                  fontWeight: "700",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#f2b458"
                  }
                }
              }
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
