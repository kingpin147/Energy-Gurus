import { SignIn } from "@clerk/nextjs";

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <SignIn routing="path" path={`/${locale}/sign-in`} signUpUrl={`/${locale}/sign-up`} />
    </div>
  );
}
