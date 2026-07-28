"use client";

import { useState } from "react";
import { sendSupportMessage } from "@/lib/actions/inquiry";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, HeadphonesIcon } from "lucide-react";

export function SupportForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('loading');
        try {
            const formData = new FormData(e.currentTarget);
            await sendSupportMessage(formData);
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <div className="text-center py-16 space-y-4 max-w-lg mx-auto bg-white border rounded-3xl p-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Message Sent!</h3>
                <p className="text-slate-custom text-sm">
                    Your support request has been sent to the EnergyGurus admin team. We will get back to you via email shortly.
                </p>
                <Button variant="outline" onClick={() => setStatus('idle')} className="mt-4">
                    Send another message
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white border rounded-3xl p-6 sm:p-8">
            <div className="space-y-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <HeadphonesIcon className="w-6 h-6 text-amber" />
                    Contact Support
                </h2>
                <p className="text-sm text-slate-custom">
                    Need help with your profile, verifying your account, or reporting an issue? Send us a message below.
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Subject</label>
                <input
                    name="subject"
                    placeholder="Briefly describe the issue"
                    className="w-full p-3 rounded-xl border bg-paper/5 outline-none focus:ring-2 focus:ring-primary text-sm"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Message</label>
                <textarea
                    name="message"
                    placeholder="How can we help you today?"
                    className="w-full min-h-[160px] p-4 rounded-2xl border bg-paper/5 focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-sm"
                    required
                />
            </div>

            {status === 'error' && (
                <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                    Something went wrong. Please try again.
                </p>
            )}

            <Button
                type="submit"
                className="w-full sm:w-auto px-8 h-12 rounded-2xl font-bold text-base gap-2"
                disabled={status === 'loading'}
            >
                {status === 'loading' ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
            </Button>
        </form>
    );
}
