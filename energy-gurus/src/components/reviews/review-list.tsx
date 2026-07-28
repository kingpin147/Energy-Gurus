import { db } from "@/db";
import { reviews, users, brands, epcInstallers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Star, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function ReviewList({ targetId }: { targetId: string }) {
    const allReviews = await db.select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        reply: reviews.reply,
        createdAt: reviews.createdAt,
        userName: users.name,
        brandLogo: brands.logoUrl,
        epcLogo: epcInstallers.logoUrl
    })
        .from(reviews)
        .leftJoin(users, eq(reviews.authorId, users.id))
        .leftJoin(brands, eq(brands.userId, users.id))
        .leftJoin(epcInstallers, eq(epcInstallers.userId, users.id))
        .where(eq(reviews.targetId, targetId))
        .orderBy(desc(reviews.createdAt));

    if (allReviews.length === 0) {
        return (
            <div className="py-12 text-center bg-paper/10 rounded-[2rem] border-2 border-dashed">
                <Star className="w-12 h-12 text-slate-custom mx-auto mb-4 opacity-20" />
                <p className="text-slate-custom font-medium">No reviews yet. Be the first to share your experience!</p>
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
                                <Avatar className="w-12 h-12 rounded-2xl">
                                    <AvatarImage src={review.brandLogo || review.epcLogo || undefined} />
                                    <AvatarFallback className="bg-amber/10 text-ink text-amber">
                                        <User className="w-6 h-6" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{review.userName || "Verified User"}</p>
                                    <p className="text-xs text-slate-custom">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-xl">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-black">{review.rating}</span>
                            </div>
                        </div>
                        <p className="text-slate-custom leading-relaxed italic">
                            "{review.comment}"
                        </p>

                        {(review as any).reply && (
                            <div className="mt-6 p-6 bg-amber/5 text-ink rounded-2xl border-l-4 border-amber space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber opacity-60">Company Reply</p>
                                <p className="text-sm text-graphite leading-relaxed">{(review as any).reply}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
