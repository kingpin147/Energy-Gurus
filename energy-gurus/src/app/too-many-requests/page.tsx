"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Timer, RefreshCw, ArrowLeft, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TooManyRequestsPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(30);
    const [canRetry, setCanRetry] = useState(false);

    useEffect(() => {
        if (countdown <= 0) {
            setCanRetry(true);
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-amber/5 text-ink rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-lg w-full bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-14 text-center space-y-8 relative z-10 border border-line/50">

                {/* Icon */}
                <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                    <Wifi className="w-12 h-12" />
                </div>

                {/* Heading */}
                <div className="space-y-3">
                    <div className="inline-block bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                        429 — Slow Down
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-graphite">
                        Too Many Requests
                    </h1>
                    <p className="text-slate-custom leading-relaxed">
                        It looks like you're navigating quite quickly. Please take a brief pause and refresh the page; it will be available for you again in just a moment.                    </p>
                </div>

                {/* Countdown */}
                <div className="p-6 bg-paper/10 rounded-2xl border border-paper/20 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-graphite font-bold">
                        <Timer className="w-5 h-5 text-amber" />
                        <span>Auto-retry in</span>
                    </div>
                    <div className={`text-6xl font-black tabular-nums transition-all ${
                        countdown <= 10 ? "text-orange-500" : "text-amber"
                    }`}>
                        {canRetry ? "✓" : countdown}
                    </div>
                    {canRetry && (
                        <p className="text-sm text-green-600 font-bold">Ready! You can now go back.</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        className="flex-1 h-14 rounded-xl font-bold text-base"
                        disabled={!canRetry}
                        onClick={() => router.back()}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {canRetry ? "Go Back & Retry" : `Wait ${countdown}s...`}
                    </Button>
                    <Button variant="outline" className="flex-1 h-14 rounded-xl font-bold text-base" asChild>
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
