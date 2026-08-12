"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Application Error Captured:", error);
  }, [error]);

  return (
        <div className="min-h-[75vh] bg-paper/5 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-8 border-t-8 border-red-500 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-500/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

                <div className="relative z-10">
                    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-red-500/10 border border-red-100">
                        <AlertOctagon className="w-12 h-12" />
                    </div>
                    
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-red-500 tracking-tight">Something went wrong!</h1>
                        <p className="text-slate-custom leading-relaxed max-w-md mx-auto">
                            We've encountered an unexpected error while loading this page. Our technical team has been notified.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 pt-8 border-t border-paper/10">
                        <Button 
                            onClick={() => reset()} 
                            className="h-14 px-8 rounded-2xl font-bold text-base bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
                        >
                            <RotateCcw className="w-5 h-5 mr-2" /> Try Again
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold text-base hover:bg-paper/5 transition-all" asChild>
                            <Link href="/">
                                <Home className="w-5 h-5 mr-2" /> Return Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
  );
}
