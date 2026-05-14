"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { sendInquiry } from "@/lib/actions/inquiry";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Mail, Phone, User, MessageSquare } from "lucide-react";

export function ContactForm({ receiverId, receiverName, initialMessage }: { receiverId: string, receiverName: string, initialMessage?: string }) {
    const { user, isLoaded } = useUser();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('loading');
        try {
            const formData = new FormData(e.currentTarget);
            await sendInquiry(formData);
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Inquiry Sent!</h3>
                <p className="text-muted-foreground text-sm">Your message has been delivered to <strong>{receiverName}</strong>. They will contact you using the details you provided.</p>
                <Button variant="outline" onClick={() => setStatus('idle')}>Send another inquiry</Button>
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
                    className="w-full p-3 rounded-xl border bg-secondary/5 outline-none focus:ring-2 focus:ring-primary text-sm"
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
                        className="w-full p-3 rounded-xl border bg-secondary/5 outline-none focus:ring-2 focus:ring-primary text-sm"
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
                        className="w-full p-3 rounded-xl border bg-secondary/5 outline-none focus:ring-2 focus:ring-primary text-sm"
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
                    className="w-full min-h-[120px] p-4 rounded-2xl border bg-secondary/5 focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-sm"
                    required
                    defaultValue={initialMessage}
                />
            </div>

            {status === 'error' && (
                <p className="text-sm text-red-500 text-center">Something went wrong. Please try again.</p>
            )}

            <Button
                type="submit"
                className="w-full h-12 rounded-2xl font-bold text-base gap-2"
                disabled={status === 'loading'}
            >
                {status === 'loading' ? 'Sending...' : <><Send className="w-4 h-4" /> Send Inquiry</>}
            </Button>
        </form>
    );
}
