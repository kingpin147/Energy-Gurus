import type { Metadata } from "next";
import { AboutUsView } from "@/components/about/AboutUsView";

export async function generateMetadata(): Promise<Metadata> {
    const baseUrl = "https://www.energygurus.online";
    const title = "About EnergyGurus | Building Trust into Solar & Storage Decisions";
    const description = "EnergyGurus.Online exists so customers never have to guess how and when to go for Solar & Storage — with reliable brands, workmanship, and after-sales services.";

    return {
        title,
        description,
        keywords: [
            "best solar panels in Pakistan",
            "solar inverter price in Pakistan",
            "solar company in Pakistan",
            "reliable solar installation Pakistan",
            "EnergyGurus"
        ],
        alternates: {
            canonical: `${baseUrl}/about`
        },
        openGraph: {
            title,
            description,
            url: `${baseUrl}/about`,
            siteName: "EnergyGurus",
            locale: "en_US",
            type: "website",
            images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "About EnergyGurus" }]
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [`${baseUrl}/new_hero_banner.jpg`]
        }
    };
}

export default function AboutPage() {
    return <AboutUsView />;
}
