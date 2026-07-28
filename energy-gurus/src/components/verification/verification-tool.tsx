"use client";

import { useState } from "react";
import { ShieldCheck, AlertCircle, Search, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifySerialNumber } from "@/lib/actions/verify";

export function VerificationTool({ brandName, defaultSN = "" }: { brandName: string, defaultSN?: string }) {
    const [sn, setSn] = useState(defaultSN);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function handleVerify() {
        if (!sn) return;
        setLoading(true);
        const res = await verifySerialNumber(sn);
        setResult(res);
        setLoading(false);
    }

    return (
        <div className="max-w-xl mx-auto text-center space-y-8 py-8">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto transition-colors duration-500 ${
                result?.status === 'genuine' ? 'bg-green-100 text-green-600' : 
                result?.status === 'not_found' ? 'bg-red-100 text-red-600' : 'bg-amber/10 text-ink text-amber'
            }`}>
                {result?.status === 'genuine' ? <CheckCircle2 className="w-10 h-10" /> : 
                 result?.status === 'not_found' ? <XCircle className="w-10 h-10" /> : <Search className="w-10 h-10" />}
            </div>

            <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                    {result?.status === 'genuine' ? "Authentic Product Found" : 
                     result?.status === 'not_found' ? "Verification Failed" : "Authenticity Guaranteed"}
                </h3>
                <p className="text-slate-custom">
                    {result?.status === 'genuine' 
                        ? `This ${result.productName} is a genuine ${result.brandName} product.`
                        : result?.status === 'not_found' 
                        ? "The serial number provided was not found in our global database. Please contact the brand directly."
                        : `Verify your ${brandName} product by entering the serial number on the physical unit.`}
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <div className="relative">
                    <input 
                        type="text" 
                        value={sn}
                        onChange={(e) => setSn(e.target.value)}
                        placeholder="Enter Serial Number (e.g. SN-XXXX-XXXX)" 
                        className="w-full h-14 px-6 rounded-2xl border bg-white focus:ring-2 focus:ring-primary outline-none text-lg font-mono"
                    />
                    {result && (
                        <button 
                            onClick={() => {setResult(null); setSn("");}}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-custom hover:text-amber font-bold text-xs"
                        >
                            CLEAR
                        </button>
                    )}
                </div>
                <Button 
                    size="lg" 
                    className="h-14 rounded-2xl font-bold text-lg gap-2"
                    onClick={handleVerify}
                    disabled={loading || !sn}
                >
                    {loading ? "Verifying..." : <><ShieldCheck className="w-5 h-5" /> Verify Authenticity</>}
                </Button>
            </div>

            {result?.status === 'genuine' && (
                <div className="grid grid-cols-2 gap-4 p-6 bg-green-50 rounded-2xl border border-green-100 animate-in fade-in slide-in-from-top-2">
                    <div className="text-left">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 opacity-60">Warranty Status</p>
                        <p className="font-bold text-green-800">Valid & Active</p>
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 opacity-60">Expiry Date</p>
                        <p className="font-bold text-green-800">{result.expiry ? new Date(result.expiry).toLocaleDateString() : "Lifetime"}</p>
                    </div>
                </div>
            )}

            {!result && (
                <div className="grid grid-cols-2 gap-4 text-xs font-medium uppercase tracking-widest text-slate-custom">
                    <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Warranty Status</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Genuine Parts</span>
                    </div>
                </div>
            )}
        </div>
    );
}
