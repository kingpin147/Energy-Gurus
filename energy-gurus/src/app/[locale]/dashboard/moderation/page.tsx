import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Trash2, Star, MessageSquare, ShieldCheck, User } from "lucide-react";
import { revalidatePath } from "next/cache";

import { getUserRole } from "@/lib/roles";

export default async function ModerationPage() {
    const role = await getUserRole();

    // Strictly for Super Admins and Admins
    if (role !== 'super-admin' && role !== 'admin') {
        redirect("/dashboard");
    }

    const allReviews = await db.select({
        review: reviews,
        author: users
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.authorId, users.id))
    .orderBy(desc(reviews.createdAt));

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber text-ink rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
                    <p className="text-slate-custom">Monitor and moderate reviews for EPCs and Brands.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {allReviews.map(({ review, author }) => (
                    <Card key={review.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center">
                                            <User className="w-5 h-5 text-slate-custom" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{author?.name || "Anonymous"}</p>
                                            <div className="flex items-center text-yellow-500 gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                review.targetType === 'epc' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-green-100 text-green-600 border-green-200'
                                            }`}>
                                                {review.targetType} Target
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-paper/5 p-4 rounded-xl border italic text-slate-custom">
                                        "{review.comment}"
                                    </div>
                                    
                                    <p className="text-[10px] font-bold text-slate-custom uppercase tracking-widest">
                                        Posted on {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <form action={async () => {
                                        "use server";
                                        await db.delete(reviews).where(eq(reviews.id, review.id));
                                        revalidatePath("/dashboard/moderation");
                                    }}>
                                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {allReviews.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed rounded-[3rem] bg-paper/5">
                        <MessageSquare className="w-12 h-12 text-slate-custom/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">No reviews yet</h3>
                        <p className="text-slate-custom">User feedback will appear here for moderation.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
