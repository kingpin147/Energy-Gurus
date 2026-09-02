import { getUserRole } from "@/lib/roles";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { ads } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AdEditForm } from "@/components/forms/ad-edit-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EditAdPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditAdPage({ params }: EditAdPageProps) {
    const role = await getUserRole();

    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    const { id } = await params;

    const [ad] = await db.select().from(ads).where(eq(ads.id, id)).limit(1);

    if (!ad) {
        notFound();
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl shrink-0">
                    <Link href="/dashboard/ads">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Ad</h1>
                    <p className="text-slate-custom text-sm md:text-base">Update the banner ad details and settings.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
                <AdEditForm ad={ad} />
            </div>
        </div>
    );
}
