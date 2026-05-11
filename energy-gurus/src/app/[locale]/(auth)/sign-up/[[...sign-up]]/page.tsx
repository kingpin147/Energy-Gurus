import { SignUp } from "@clerk/nextjs";

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <SignUp routing="path" path={`/${locale}/sign-up`} signInUrl={`/${locale}/sign-in`} />
    </div>
  );
}
