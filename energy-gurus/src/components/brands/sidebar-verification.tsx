"use client";

import { useState } from "react";
import { verifySerialNumber } from "@/lib/actions/verify";
import { QrCode, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function SidebarVerification() {
    const [sn, setSn] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    async function handleVerify() {
        if (!sn) return;
        setLoading(true);
        try {
            const res = await verifySerialNumber(sn);
            setResult(res);
        } catch (error) {
            console.error("Verification error:", error);
        }
        setLoading(false);
    }

    return (
        <div className="flex flex-col gap-5 items-center">
            <div className="relative w-full group">
                <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                <input 
                    type="text" 
                    value={sn}
                    onChange={(e) => setSn(e.target.value)}
                    className="w-full pl-12 pr-4 h-14 bg-white/50 backdrop-blur-xl border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-base placeholder:text-muted-foreground/40 outline-none transition-all font-medium shadow-sm" 
                    placeholder="Serial Number..." 
                />
            </div>
            
            <button 
                onClick={handleVerify}
                disabled={loading || !sn}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-primary/90 active:scale-[0.98] transition-all text-[10px] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
            >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {loading ? "Verifying..." : "Verify Now"}
            </button>

            {result && (
                <div className={`w-full p-6 rounded-[2rem] text-sm font-bold border animate-in zoom-in duration-500 ${
                    result.status === 'genuine' 
                    ? 'bg-green-500/5 text-green-600 border-green-500/20' 
                    : 'bg-red-500/5 text-red-600 border-red-500/20'
                }`}>
                    <div className="flex flex-col items-center gap-3 text-center">
                        {result.status === 'genuine' ? (
                          <CheckCircle2 className="w-8 h-8" />
                        ) : (
                          <AlertCircle className="w-8 h-8" />
                        )}
                        <div>
                            {result.status === 'genuine' ? (
                                <>
                                    <p className="text-[10px] uppercase tracking-[0.2em] mb-1">Authentic Asset</p>
                                    <p className="text-lg font-black tracking-tight">{result.brandName}</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-[10px] uppercase tracking-[0.2em] mb-1">Verification Failed</p>
                                    <p className="text-sm font-medium opacity-80 leading-relaxed">The serial number provided was not found in our manufacturer database.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <p className="text-[10px] text-muted-foreground/40 italic text-center font-black uppercase tracking-[0.2em] mt-2">
                Secure Global Authentication
            </p>
        </div>
    );
}
