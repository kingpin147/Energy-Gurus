import { db } from "@/db";
import { inquiries, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MessageSquare, Clock, User, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateInquiryStatus } from "@/lib/actions/inquiry";

export async function DashboardInquiryList({ receiverId }: { receiverId: string }) {
    const inquiryList = await db.select()
        .from(inquiries)
        .where(eq(inquiries.receiverId, receiverId))
        .orderBy(desc(inquiries.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Inquiries</h2>
                <div className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {inquiryList.filter(i => i.status === 'pending').length} New
                </div>
            </div>

            <div className="space-y-4">
                {inquiryList.map((inquiry) => (
                    <Card key={inquiry.id} className={`border-none shadow-sm ${inquiry.status === 'pending' ? 'bg-white border-l-4 border-l-accent' : 'bg-secondary/5 opacity-80'}`}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Potential Customer</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                                    inquiry.status === 'pending' ? 'bg-accent/20 text-accent' : 'bg-green-100 text-green-600'
                                }`}>
                                    {inquiry.status}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                                "{inquiry.message}"
                            </p>
                            {inquiry.status === 'pending' && (
                                <form action={async () => {
                                    "use server";
                                    await updateInquiryStatus(inquiry.id, 'replied');
                                }}>
                                    <Button size="sm" className="w-full gap-2 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4" /> Mark as Replied
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {inquiryList.length === 0 && (
                    <div className="text-center py-12 bg-secondary/5 rounded-3xl border-2 border-dashed">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                        <p className="text-muted-foreground font-medium">No inquiries yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
