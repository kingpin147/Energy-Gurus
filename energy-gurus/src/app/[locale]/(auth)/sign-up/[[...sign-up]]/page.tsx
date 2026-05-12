import { SignUp } from "@clerk/nextjs";
import { AlertCircle } from "lucide-react";

export default async function SignUpPage({ 
    params,
    searchParams
}: { 
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;

  let errorMessage = null;
  if (error === "not_invited") {
      errorMessage = "You are not the part of organization please contact website administrator.";
  } else if (error === "removed") {
      errorMessage = "You are no longer part of organization.";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3 max-w-md w-full shadow-sm animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
          </div>
      )}
      <SignUp routing="path" path={`/${locale}/sign-up`} signInUrl={`/${locale}/sign-in`} />
    </div>
  );
}
