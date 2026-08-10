import { useTranslations } from "next-intl";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.energygurus.online";
  const title = "Privacy Policy | EnergyGurus";
  const description = "Learn about EnergyGurus privacy policy, data protection practices, and how your personal data is handled securely.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/privacy`,
      languages: {
        en: `${baseUrl}/en/privacy`,
        ur: `${baseUrl}/ur/privacy`,
        "x-default": `${baseUrl}/en/privacy`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/privacy`,
      siteName: "EnergyGurus",
      locale: locale === "ur" ? "ur_PK" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                <p className="lead text-lg text-slate-custom">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">1. Introduction</h2>
                <p>
                    Welcome to EnergyGurus. We respect your privacy and are committed to protecting your personal data.
                    This privacy policy will inform you as to how we look after your personal data when you visit our website
                    and tell you about your privacy rights and how the law protects you.
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">2. The Data We Collect About You</h2>
                <p>
                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 ml-4">
                    <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                    <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
                    <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                    <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-10 mb-4">3. How We Use Your Personal Data</h2>
                <p>
                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 ml-4">
                    <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., providing an Energy Audit).</li>
                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                    <li>Where we need to comply with a legal obligation.</li>
                </ul>
                
                <h2 className="text-2xl font-semibold mt-10 mb-4">4. Data Security</h2>
                <p>
                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">5. Contact Us</h2>
                <p>
                    If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@energygurus.online.
                </p>
            </div>
        </div>
    );
}
