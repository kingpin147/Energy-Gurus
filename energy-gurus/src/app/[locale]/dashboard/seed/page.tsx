import { seedDummyData } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { Database, Sparkles } from "lucide-react";

export default async function SeedPage() {
    return (
        <div className="p-20 text-center space-y-8">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                <Database className="w-10 h-10" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight">Database Seeder</h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Click the button below to populate your platform with premium dummy energy data.
                </p>
            </div>

            <form action={async () => {
                "use server";
                await seedDummyData();
            }}>
                <Button size="lg" className="h-16 px-10 rounded-2xl font-black text-xl gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6" /> Populate Everything
                </Button>
            </form>
        </div>
    );
}
