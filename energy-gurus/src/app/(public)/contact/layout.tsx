import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ }> }): Promise<Metadata> {
  
  const baseUrl = "https://www.energygurus.online";
  const title = "Contact Us | EnergyGurus Pakistan";
  const description = "Get in touch with EnergyGurus for inquiries regarding EPC installer verifications, brand listings, energy audits, telemetry systems, or media partnerships.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/contact`,
      
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/contact`,
      siteName: "EnergyGurus",
      locale: "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "Contact EnergyGurus" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/new_hero_banner.jpg`]
    }
    };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
