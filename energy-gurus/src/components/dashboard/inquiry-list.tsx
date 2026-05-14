import { db } from "@/db";
import { inquiries, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MessageSquare, Clock, User, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateInquiryStatus } from "@/lib/actions/inquiry";

import { Mail, Phone, ExternalLink } from "lucide-react";

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
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{(inquiry as any).guestName || "Potential Customer"}</p>
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

                            <p className="text-sm text-foreground leading-relaxed mb-6 bg-secondary/5 p-4 rounded-xl border italic">
                                "{inquiry.message}"
                            </p>

                            {((inquiry as any).guestEmail || (inquiry as any).guestPhone) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                    {(inquiry as any).guestEmail && (
                                        <a href={`mailto:${(inquiry as any).guestEmail}`} className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
                                            <Mail className="w-4 h-4" /> {(inquiry as any).guestEmail}
                                        </a>
                                    )}
                                    {(inquiry as any).guestPhone && (
                                        <a href={`https://wa.me/${(inquiry as any).guestPhone.replace(/\D/g, "")}`} target="_blank" className="flex items-center gap-2 text-xs font-bold text-green-600 hover:underline">
                                            <Phone className="w-4 h-4" /> {(inquiry as any).guestPhone}
                                        </a>
                                    )}
                                </div>
                            )}

                            {inquiry.status === 'pending' && (
                                <div className="flex gap-2">
                                    <form action={async () => {
                                        "use server";
                                        await updateInquiryStatus(inquiry.id, 'replied');
                                    }} className="flex-1">
                                        <Button size="sm" className="w-full gap-2 rounded-xl">
                                            <CheckCircle2 className="w-4 h-4" /> Mark as Replied
                                        </Button>
                                    </form>
                                    {(inquiry as any).guestPhone && (
                                        <Button variant="outline" size="sm" className="rounded-xl border-green-200 text-green-700 hover:bg-green-50" asChild>
                                            <a href={`https://wa.me/${(inquiry as any).guestPhone.replace(/\D/g, "")}`} target="_blank">
                                                <ExternalLink className="w-4 h-4 mr-2" /> WhatsApp Reply
                                            </a>
                                        </Button>
                                    )}
                                </div>
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
