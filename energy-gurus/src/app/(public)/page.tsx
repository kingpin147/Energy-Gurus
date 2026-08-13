import type { Metadata } from "next";
import { AboutUsView } from "@/components/about/AboutUsView";

export async function generateMetadata(): Promise<Metadata> {
    const baseUrl = "https://www.energygurus.online";
    const title = "EnergyGurus - Building Trust into Solar & Storage Decisions";
    const description = "EnergyGurus.Online exists so customers never have to guess how and when to go for Solar & Storage — with reliable brands, workmanship, and after-sales services.";

    return {
        title,
        description,
        keywords: [
            "EnergyGurus",
            "Solar Pakistan",
            "Solar Installers Pakistan",
            "Solar Monitoring",
            "Solar O&M",
            "Verified EPC Installers",
            "Aafaaq Ali Khan"
        ],
        alternates: {
            canonical: baseUrl
        },
        openGraph: {
            title,
            description,
            url: baseUrl,
            siteName: "EnergyGurus",
            locale: "en_US",
            type: "website",
            images: [{ url: `${baseUrl}/new_hero_banner.jpg`, width: 1200, height: 630, alt: "EnergyGurus" }]
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [`${baseUrl}/new_hero_banner.jpg`]
        }
    };
}

export default function Homepage() {
    return <AboutUsView />;
}
