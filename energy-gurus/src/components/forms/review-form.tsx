"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitReview } from "@/lib/actions/reviews";

export function ReviewForm({ targetId, targetType }: { targetId: string, targetType: "epc" | "brand" }) {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('loading');
        const formData = new FormData(e.currentTarget);
        formData.append("rating", rating.toString());
        await submitReview(formData);
        setStatus('success');
    }

    if (status === 'success') {
        return (
            <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-[2rem] text-center space-y-4 animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                    <Star className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-xl font-bold">Review Submitted!</h3>
                <p className="text-muted-foreground text-sm">Thank you for your feedback. It helps the community make better energy decisions.</p>
                <Button variant="outline" className="rounded-xl" onClick={() => setStatus('idle')}>Write another</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-secondary/5 p-8 rounded-[2.5rem] border border-secondary/10 shadow-sm">
            <input type="hidden" name="targetId" value={targetId} />
            <input type="hidden" name="targetType" value={targetType} />

            {/* Required name field */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                    Your Name <span className="text-red-500">*</span>
                </label>
                <input
                    name="reviewerName"
                    placeholder="e.g. Ahmed Khan"
                    required
                    className="w-full p-4 rounded-2xl border bg-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm text-sm"
                />
            </div>

            {/* Star rating */}
            <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Your Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="transition-all transform hover:scale-125"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            <Star
                                className={`w-8 h-8 ${
                                    (hover || rating) >= star
                                    ? "text-yellow-500 fill-current shadow-yellow-500/20"
                                    : "text-secondary-foreground/20"
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Your Experience</label>
                <textarea
                    name="comment"
                    placeholder="Tell others about the quality of service, installation, or products..."
                    className="w-full min-h-[120px] p-4 rounded-2xl border bg-white focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                    required
                />
            </div>

            <Button
                type="submit"
                className="w-full h-14 rounded-2xl font-bold text-lg gap-2 shadow-xl shadow-primary/20"
                disabled={status === 'loading'}
            >
                {status === 'loading' ? "Submitting..." : <><Send className="w-5 h-5" /> Submit Review</>}
            </Button>
        </form>
    );
}
