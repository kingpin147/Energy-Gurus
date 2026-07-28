import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic, Outfit, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CSPostHogProvider } from '@/components/providers/PostHogProvider';
import { Toaster } from 'sonner';
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
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: "EnergyGurus - Energy Insights for Pakistan",
    description: "Weekly podcast, expert audits, real‑time monitoring and O&M services for smarter energy decisions in Pakistan.",
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

  const content = (
    <CSPostHogProvider>
      <NextIntlClientProvider messages={messages}>
        {children}
        <Toaster position="top-right" expand={true} richColors />
      </NextIntlClientProvider>
    </CSPostHogProvider>
  );

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
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

