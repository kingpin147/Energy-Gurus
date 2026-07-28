"use client";

import { useState } from "react";
import { verifySerialNumber } from "@/lib/actions/serials";
import { Button } from "@/components/ui/button";
import { Search, ShieldCheck, ShieldAlert, Zap, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ProductVerification({ brandId }: { brandId: string }) {
    const [serial, setSerial] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serial) return;
        
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await verifySerialNumber(serial) as any;
            if (data) {
                // Ensure it belongs to THIS brand
                if (data.product.brandId !== brandId) {
                    setError("This serial number belongs to another manufacturer.");
                } else {
                    setResult(data);
                }
            } else {
                setError("No record found. Please verify the serial number carefully.");
            }
        } catch (err) {
            setError("Verification service is currently unavailable.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-amber/5 text-ink p-8 md:p-12 rounded-[3.5rem] border border-amber/10">
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black tracking-tight">Authenticity Audit</h3>
                        <p className="text-slate-custom text-sm font-medium italic">
                            Validate your hardware and check warranty status through the global serial registry.
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-custom opacity-40" />
                            <input 
                                value={serial}
                                onChange={(e) => setSerial(e.target.value)}
                                placeholder="Enter Serial Number (e.g. SN-882-991)" 
                                className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-amber/5 bg-white outline-none focus:border-amber/20 transition-all font-mono text-sm"
                            />
                        </div>
                        <Button 
                            disabled={loading}
                            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-amber text-ink text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        >
                            {loading ? "Scanning..." : "Verify Identity"}
                        </Button>
                    </form>

                    {error && (
                        <div className="flex items-center justify-center gap-3 text-red-500 font-bold text-sm bg-red-50 p-4 rounded-xl border border-red-100">
                            <ShieldAlert className="w-5 h-5" /> {error}
                        </div>
                    )}
                </div>
            </div>

            {result && (
                <Card className="border-none shadow-2xl bg-white rounded-[3.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-12">
                            <div className="md:col-span-4 bg-[#0F172A] p-12 text-white flex flex-col justify-center items-center text-center gap-6">
                                <div className="w-24 h-24 bg-green-500/20 rounded-[2.5rem] flex items-center justify-center border-4 border-green-500/30">
                                    <ShieldCheck className="w-12 h-12 text-green-500" />
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black tracking-tighter">GENUINE</h4>
                                    <p className="text-green-500/60 text-[10px] font-black uppercase tracking-[0.2em]">Verified Integrity</p>
                                </div>
                            </div>
                            <div className="md:col-span-8 p-12 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 leading-none">Product Model</p>
                                        <p className="text-2xl font-black flex items-center gap-3">
                                            <Zap className="w-6 h-6 text-amber" /> {result.product.name}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 leading-none">Warranty Status</p>
                                        <p className="text-2xl font-black flex items-center gap-3 text-green-600">
                                            <Calendar className="w-6 h-6" /> ACTIVE
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 leading-none">Registry Date</p>
                                        <p className="text-lg font-bold">{new Date(result.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 leading-none">Expiry Estimate</p>
                                        <p className="text-lg font-bold">{result.warrantyExpiry ? new Date(result.warrantyExpiry).toLocaleDateString() : "Check Manual"}</p>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-line/50">
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                                        <ShieldCheck className="w-4 h-4" /> Blockchain Verified Ledger Item: {result.id.slice(0, 8)}...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
