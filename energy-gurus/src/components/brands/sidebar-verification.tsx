"use client";

import { useState } from "react";
import { verifySerialNumber } from "@/lib/actions/verify";

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
        <div className="flex flex-col gap-4">
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3e4948]/60 !text-lg">qr_code_scanner</span>
                <input 
                    type="text" 
                    value={sn}
                    onChange={(e) => setSn(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-[#bec9c8] bg-[#e8f6f6] rounded-lg focus:ring-2 focus:ring-[#005353] focus:border-transparent text-sm placeholder:text-[#3e4948]/40 outline-none transition-all" 
                    placeholder="Serial Number..." 
                />
            </div>
            <button 
                onClick={handleVerify}
                disabled={loading || !sn}
                className="w-full bg-[#7a5900] text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#5c4300] active:scale-[0.98] transition-all text-xs disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider font-inter shadow-sm"
            >
                <span className="material-symbols-outlined !text-base">verified_user</span>
                {loading ? "VERIFYING..." : "VERIFY NOW"}
            </button>

            {result && (
                <div className={`p-4 rounded-lg text-xs font-bold border animate-in fade-in slide-in-from-top-2 duration-300 ${
                    result.status === 'genuine' 
                    ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' 
                    : 'bg-red-50 text-red-700 border-red-200 shadow-sm'
                }`}>
                    <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined !text-base shrink-0 mt-0.5">
                            {result.status === 'genuine' ? 'check_circle' : 'error'}
                        </span>
                        <div>
                            {result.status === 'genuine' ? (
                                <>
                                    <p className="mb-1 uppercase tracking-tight">Genuine Product Found!</p>
                                    <p className="opacity-80 font-normal">Validated: {result.brandName}</p>
                                </>
                            ) : (
                                <>
                                    <p className="mb-1 uppercase tracking-tight">Verification Failed</p>
                                    <p className="opacity-80 font-normal">Serial number not found in manufacturer database.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <p className="text-[10px] text-[#3e4948]/50 italic text-center font-medium mt-1">
                Secure bilingual authentication system
            </p>
        </div>
    );
}
