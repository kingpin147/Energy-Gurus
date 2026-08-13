import { getUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { NewsForm } from "@/components/forms/news-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewNewsPage() {
    const role = await getUserRole();

    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl shrink-0">
                    <Link href="/dashboard/news">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create News Article</h1>
                    <p className="text-slate-custom text-sm md:text-base">Write and publish a new article for the platform.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
                <NewsForm />
            </div>
        </div>
    );
}
