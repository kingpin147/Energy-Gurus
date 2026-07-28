"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { sendInquiry } from "@/lib/actions/inquiry";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Mail, Phone, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export function ContactForm({ receiverId, receiverName, initialMessage }: { receiverId: string, receiverName: string, initialMessage?: string }) {
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            await sendInquiry(formData);
            toast.success("Inquiry Sent!", {
                description: `Your message has been delivered to ${receiverName}.`,
            });
            setIsSubmitted(true);
        } catch (error) {
            console.error(error);
            toast.error("Failed to send inquiry", {
                description: "Something went wrong. Please try again.",
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
                <h3 className="text-xl font-bold text-graphite">Inquiry Sent!</h3>
                <p className="text-slate-custom text-sm max-w-xs mx-auto">Your message has been delivered to <strong>{receiverName}</strong>. They will contact you using the details you provided.</p>
                <Button variant="outline" className="rounded-xl" onClick={() => setIsSubmitted(false)}>Send another inquiry</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="receiverId" value={receiverId} />
            <input type="hidden" name="inquiryType" value="client" />

            {/* Name */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Full Name
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
                        <Mail className="w-3 h-3" /> Email Address
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
                        <Phone className="w-3 h-3" /> Phone / WhatsApp
                    </label>
                    <input
                        name="guestPhone"
                        placeholder="+92 3XX XXXXXXX"
                        className="w-full p-3 rounded-xl border bg-paper/5 outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
                    />
                </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" /> Your Message
                </label>
                <textarea
                    name="message"
                    placeholder={`Describe what you need from ${receiverName}...`}
                    className="w-full min-h-[120px] p-4 rounded-2xl border bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-sm"
                    required
                    defaultValue={initialMessage}
                />
            </div>

            <Button
                type="submit"
                className="w-full h-12 rounded-2xl font-bold text-base gap-2 transition-all"
                disabled={loading}
            >
                {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Inquiry</>}
            </Button>
        </form>
    );
}
