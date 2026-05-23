"use client";

import { useState } from "react";
import { Database, Sparkles, Trash2, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SeedPage() {
    const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [clearStatus, setClearStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSeed = async () => {
        setSeedStatus("loading");
        setMessage("");
        try {
            const res = await fetch("/api/seed", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Seed failed");
            setSeedStatus("success");
            setMessage(data.message || "Seed complete!");
        } catch (err: any) {
            setSeedStatus("error");
            setMessage(err.message || "Something went wrong");
        }
    };

    const handleClear = async () => {
        setClearStatus("loading");
        setMessage("");
        try {
            const res = await fetch("/api/seed", { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Clear failed");
            setClearStatus("success");
            setSeedStatus("idle");
            setMessage(data.message || "Dummy data cleared!");
        } catch (err: any) {
            setClearStatus("error");
            setMessage(err.message || "Something went wrong");
        }
    };

    return (
        <div className="p-12 max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Database className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Database Seeder</h1>
                    <p className="text-muted-foreground text-sm">Populate or clear dummy data for testing</p>
                </div>
            </div>

            {/* Status message */}
            {message && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${
                    seedStatus === "success" || clearStatus === "success"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                }`}>
                    {seedStatus === "success" || clearStatus === "success"
                        ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                        : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    }
                    <span>{message}</span>
                </div>
            )}

            {/* What gets seeded */}
            <div className="bg-secondary/30 rounded-xl p-5 border border-border/40 space-y-2 text-sm text-muted-foreground">
                <p className="font-bold text-foreground text-xs uppercase tracking-widest mb-3">What gets seeded</p>
                <ul className="space-y-1.5 list-disc list-inside">
                    <li>4 EPC installer profiles (Alpha Energy, Solar Peak, GreenVolt, SunCraft)</li>
                    <li>6 EPC offices across Karachi, Lahore, Islamabad, Faisalabad</li>
                    <li>6 showcase projects with images and specs</li>
                    <li>4 Brand profiles (Longi, Huawei, Growatt, Sungrow)</li>
                    <li>8 brand products with images and datasheets</li>
                    <li>7 brand certifications</li>
                    <li>3 podcasts + 3 live QA sessions</li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                {/* Seed button */}
                <Button
                    size="lg"
                    className="flex-1 h-14 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
                    onClick={handleSeed}
                    disabled={seedStatus === "loading" || clearStatus === "loading"}
                >
                    {seedStatus === "loading" ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Seeding...</>
                    ) : seedStatus === "success" ? (
                        <><CheckCircle2 className="w-5 h-5" /> Seeded!</>
                    ) : (
                        <><Sparkles className="w-5 h-5" /> Populate Everything</>
                    )}
                </Button>

                {/* Clear button */}
                <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 h-14 rounded-xl font-bold gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={handleClear}
                    disabled={seedStatus === "loading" || clearStatus === "loading"}
                >
                    {clearStatus === "loading" ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Clearing...</>
                    ) : clearStatus === "success" ? (
                        <><CheckCircle2 className="w-5 h-5" /> Cleared!</>
                    ) : (
                        <><Trash2 className="w-5 h-5" /> Clear Dummy Data</>
                    )}
                </Button>
            </div>

            <p className="text-xs text-muted-foreground/60 text-center">
                Clear removes only dummy accounts (emails ending in @energygurus.demo). Real user data is never affected.
            </p>
        </div>
    );
}
