import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Star, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export async function ReviewList({ targetId }: { targetId: string }) {
    const allReviews = await db.select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userName: users.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.authorId, users.id))
    .where(eq(reviews.targetId, targetId))
    .orderBy(desc(reviews.createdAt));

    if (allReviews.length === 0) {
        return (
            <div className="py-12 text-center bg-secondary/10 rounded-[2rem] border-2 border-dashed">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">No reviews yet. Be the first to share your experience!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {allReviews.map((review) => (
                <Card key={review.id} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-shadow">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
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
                        <p className="text-muted-foreground leading-relaxed italic">
                            "{review.comment}"
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
