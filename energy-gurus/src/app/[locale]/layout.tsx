import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "../globals.css";
import "@uploadthing/react/styles.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
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
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoArabic.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {isClerkConfigured ? (
          <ClerkProvider>{content}</ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
