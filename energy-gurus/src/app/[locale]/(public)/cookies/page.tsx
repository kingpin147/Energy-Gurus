import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.energygurus.online";
  const title = "Cookie Policy | EnergyGurus";
  const description = "Learn how EnergyGurus uses cookies and technical telemetry tracking to improve user experience and site performance.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/cookies`,
      languages: {
        en: `${baseUrl}/en/cookies`,
        ur: `${baseUrl}/ur/cookies`,
        "x-default": `${baseUrl}/en/cookies`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/cookies`,
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

export default function CookiePolicyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
                <p className="lead text-lg text-slate-custom">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">1. What Are Cookies</h2>
                <p>
                    As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">2. How We Use Cookies</h2>
                <p>
                    We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
                </p>

                <h2 className="text-2xl font-semibold mt-10 mb-4">3. The Cookies We Set</h2>
                <ul className="list-disc pl-6 space-y-4 mt-4 ml-4">
                    <li>
                        <strong>Account related cookies</strong>
                        <br />
                        If you create an account with us, we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out; however, in some cases, they may remain afterwards to remember your site preferences when logged out.
                    </li>
                    <li>
                        <strong>Login related cookies</strong>
                        <br />
                        We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page. These cookies are typically removed or cleared when you log out to ensure that you can only access restricted features and areas when logged in.
                    </li>
                    <li>
                        <strong>Site preferences cookies</strong>
                        <br />
                        In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences, we need to set cookies so that this information can be called whenever you interact with a page affected by your preferences.
                    </li>
                </ul>

                <h2 className="text-2xl font-semibold mt-10 mb-4">4. Third Party Cookies</h2>
                <p>
                    In some special cases, we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 ml-4">
                    <li>This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-10 mb-4">5. More Information</h2>
                <p>
                    Hopefully, that has clarified things for you and as was previously mentioned if there is something that you aren't sure whether you need or not it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
                </p>
                <p>
                    If you are still looking for more information, then you can contact us via our preferred contact method on our contact page.
                </p>
            </div>
        </div>
    );
}
