import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Star, User, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { replyToReview } from "@/lib/actions/reviews";

export async function DashboardReviewList({ targetId, targetType }: { targetId: string, targetType: string }) {
    const allReviews = await db.select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        reply: reviews.reply,
        createdAt: reviews.createdAt,
        userName: users.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.authorId, users.id))
    .where(eq(reviews.targetId, targetId))
    .orderBy(desc(reviews.createdAt));

    if (allReviews.length === 0) {
        return (
            <div className="py-12 text-center bg-secondary/5 rounded-3xl border-2 border-dashed">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground font-medium">No reviews received yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {allReviews.map((review) => (
                <Card key={review.id} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold">{review.userName || "Verified User"}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-xl">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-black">{review.rating}</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed italic mb-6">
                            "{review.comment}"
                        </p>
                        
                        {review.reply ? (
                            <div className="p-6 bg-primary/5 rounded-2xl border-l-4 border-primary space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Your Reply</p>
                                <p className="text-sm text-foreground leading-relaxed">{review.reply}</p>
                            </div>
                        ) : (
                            <form action={replyToReview} className="space-y-3 pt-4 border-t">
                                <input type="hidden" name="reviewId" value={review.id} />
                                <input type="hidden" name="targetType" value={targetType} />
                                <input type="hidden" name="targetId" value={targetId} />
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Reply to this review</label>
                                <div className="flex gap-2">
                                    <textarea 
                                        name="reply" 
                                        placeholder="Type your response..." 
                                        className="flex-1 border rounded-xl p-3 text-sm bg-secondary/5 focus:ring-2 focus:ring-primary outline-none"
                                        required 
                                    />
                                    <Button type="submit" className="self-end rounded-xl font-bold h-12">
                                        <MessageCircle className="w-4 h-4 mr-2" /> Reply
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
