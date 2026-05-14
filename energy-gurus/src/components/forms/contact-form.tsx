"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { sendInquiry } from "@/lib/actions/inquiry";
import { Button } from "@/components/ui/button";
import { Mail, Send, CheckCircle2 } from "lucide-react";

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
                <h3 className="text-xl font-bold">Message Sent!</h3>
                <p className="text-muted-foreground">Your inquiry has been sent to {receiverName}. They will get back to you shortly.</p>
                <Button variant="outline" onClick={() => setStatus('idle')}>Send another message</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="receiverId" value={receiverId} />
            
            {isLoaded && !user && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Name</label>
                            <input name="guestName" placeholder="Full Name" className="w-full p-3 rounded-xl border bg-secondary/5 outline-none focus:ring-2 focus:ring-primary" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Email Address</label>
                            <input name="guestEmail" type="email" placeholder="email@example.com" className="w-full p-3 rounded-xl border bg-secondary/5 outline-none focus:ring-2 focus:ring-primary" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Phone / WhatsApp (Optional)</label>
                        <input name="guestPhone" placeholder="+92 3XX XXXXXXX" className="w-full p-3 rounded-xl border bg-secondary/5 outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Inquiry</label>
                <textarea 
                    name="message" 
                    placeholder={`Describe what you need from ${receiverName}...`}
                    className="w-full min-h-[120px] p-4 rounded-2xl border bg-secondary/5 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                    required
                    defaultValue={initialMessage}
                />
            </div>
            <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl font-bold text-lg gap-2"
                disabled={status === 'loading'}
            >
                {status === 'loading' ? 'Sending...' : <><Send className="w-5 h-5" /> Send Message</>}
            </Button>
        </form>
    );
}
