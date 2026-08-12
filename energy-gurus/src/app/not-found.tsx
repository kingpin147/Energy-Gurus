import { FileQuestion, ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
    return (
        <div className="min-h-[75vh] bg-paper/5 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-8 border-t-8 border-amber relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

                <div className="relative z-10">
                    <div className="w-24 h-24 bg-amber/10 text-amber rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-amber/20 border border-amber/20">
                        <FileQuestion className="w-12 h-12" />
                    </div>
                    
                    <div className="space-y-4">
                        <h1 className="text-8xl font-black text-amber tracking-tighter drop-shadow-sm">404</h1>
                        <h2 className="text-3xl font-bold tracking-tight text-graphite">Page Not Found</h2>
                        <p className="text-slate-custom leading-relaxed max-w-md mx-auto">
                            The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 pt-8 border-t border-paper/10">
                        <Button className="h-14 px-8 rounded-2xl font-bold text-base shadow-lg shadow-amber/20 hover:scale-105 transition-all" asChild>
                            <Link href="/">
                                <Home className="w-5 h-5 mr-2" /> Return Home
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold text-base hover:bg-paper/5 transition-all" asChild>
                            <Link href="/brands">
                                <Search className="w-5 h-5 mr-2" /> Browse Brands
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
