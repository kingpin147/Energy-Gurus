import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic, Outfit } from "next/font/google";
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
        className={`${inter.variable} ${outfit.variable} ${notoArabic.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {isClerkConfigured ? (
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: "#006d6d",
                colorText: "#1f2937",
                colorBackground: "#ffffff",
                fontFamily: "var(--font-outfit), var(--font-inter), sans-serif",
                borderRadius: "12px",
              },
              elements: {
                logoBox: {
                  display: "none",
                },
                card: {
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  border: "1px solid rgba(190, 201, 200, 0.5)",
                  borderRadius: "16px",
                },
                headerTitle: {
                  color: "#005353",
                  fontWeight: "700",
                },
                formButtonPrimary: {
                  backgroundColor: "#006d6d",
                  color: "#ffffff",
                  fontWeight: "700",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#005353",
                  },
                },
                footerActionLink: {
                  color: "#006d6d",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#005353",
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

