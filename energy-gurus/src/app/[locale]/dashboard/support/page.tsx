import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SupportForm } from "@/components/forms/support-form";

export default async function SupportPage() {
    const { userId: clerkId } = await auth();
    if (!clerkId) redirect("/sign-in");

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
            <SupportForm />
        </div>
    );
}
