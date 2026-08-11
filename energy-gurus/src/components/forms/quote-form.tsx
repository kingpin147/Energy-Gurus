"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { sendInquiry } from "@/lib/actions/inquiry";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Mail, Phone, User, MessageSquare, ArrowRight, ArrowLeft, Home, Zap, MapPin } from "lucide-react";
import { toast } from "sonner";

export function QuoteForm({ receiverId, receiverName }: { receiverId: string, receiverName: string }) {
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [step, setStep] = useState(1);

    // Form state
    const [monthlyBill, setMonthlyBill] = useState("10000-25000");
    const [roofType, setRoofType] = useState("Flat");
    const [city, setCity] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            
            // Append metadata
            formData.append("metadata", JSON.stringify({
                monthlyBill,
                roofType,
                city
            }));

            // If message is empty, set a default
            if (!formData.get("message")) {
                formData.set("message", `I would like to request a quote for a solar system. My monthly bill is around Rs. ${monthlyBill}, my roof type is ${roofType}, and my property is located in ${city}.`);
            }

            await sendInquiry(formData);
            toast.success("Quote Request Sent!", {
                description: `Your request has been delivered to ${receiverName}.`
    });
            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            toast.error("Failed to send request", {
                description: "Something went wrong. Please try again."
    });
        } finally {
            setLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-graphite">Quote Request Sent!</h3>
                <p className="text-slate-custom text-sm max-w-xs mx-auto">Your details have been sent to <strong>{receiverName}</strong>. They will contact you shortly with a personalized quote.</p>
                <Button variant="outline" className="rounded-xl" onClick={() => {
                    setIsSubmitted(false);
                    setStep(1);
                }}>Request another quote</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="receiverId" value={receiverId} />
            <input type="hidden" name="inquiryType" value="client" />

            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-2">
                <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-amber' : 'bg-paper'}`} />
                <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-amber' : 'bg-paper'}`} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-custom text-center mb-6">
                Step {step} of 2
            </div>

            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    {/* Monthly Bill */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-amber" /> Average Monthly Bill (PKR)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {["0-10000", "10000-25000", "25000-50000", "50000+"].map((range) => (
                                <div 
                                    key={range}
                                    onClick={() => setMonthlyBill(range)}
                                    className={`p-3 rounded-xl border text-center text-sm font-semibold cursor-pointer transition-all ${monthlyBill === range ? 'border-amber bg-amber/10 text-ink' : 'border-line bg-paper/30 text-slate-custom hover:border-line/80'}`}
                                >
                                    {range}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Roof Type */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                            <Home className="w-3 h-3 text-amber" /> Roof Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {["Flat", "Slanted", "Shed"].map((type) => (
                                <div 
                                    key={type}
                                    onClick={() => setRoofType(type)}
                                    className={`p-2.5 rounded-xl border text-center text-sm font-semibold cursor-pointer transition-all ${roofType === type ? 'border-amber bg-amber/10 text-ink' : 'border-line bg-paper/30 text-slate-custom hover:border-line/80'}`}
                                >
                                    {type}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-amber" /> Installation City
                        </label>
                        <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Lahore, Karachi"
                            className="w-full p-3 rounded-xl border bg-paper/5 outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
                            required
                        />
                    </div>

                    <Button type="button" onClick={() => {
                        if(city.trim() !== "") setStep(2);
                        else toast.error("Please enter your city.");
                    }} className="w-full rounded-xl bg-ink text-white hover:bg-ink/90 font-bold h-12">
                        Next Step <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-8 px-2 -ml-2 text-slate-custom hover:text-ink">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-amber" /> Full Name
                        </label>
                        <input
                            name="guestName"
                            placeholder="Your full name"
                            defaultValue={isLoaded && user ? (user.fullName ?? "") : ""}
                            className="w-full p-3 rounded-xl border bg-paper/5 outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
                            required
                        />
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-amber" /> Email Address
                            </label>
                            <input
                                name="guestEmail"
                                type="email"
                                placeholder="email@example.com"
                                defaultValue={isLoaded && user ? (user.primaryEmailAddress?.emailAddress ?? "") : ""}
                                className="w-full p-3 rounded-xl border bg-paper/5 outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-amber" /> Phone / WhatsApp
                            </label>
                            <input
                                name="guestPhone"
                                placeholder="+92 3XX XXXXXXX"
                                className="w-full p-3 rounded-xl border bg-paper/5 outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Message (Optional) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3 text-amber" /> Additional Notes (Optional)
                        </label>
                        <textarea
                            name="message"
                            placeholder="Any specific brands or requirements?"
                            className="w-full p-3 rounded-xl border bg-paper/5 outline-none focus:ring-2 focus:ring-primary text-sm transition-all min-h-[80px]"
                        />
                    </div>

                    <Button disabled={loading} type="submit" className="w-full rounded-xl bg-amber text-ink hover:bg-amber/90 font-bold h-12">
                        {loading ? "Sending..." : "Submit Quote Request"} <Send className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}
        </form>
    );
}
