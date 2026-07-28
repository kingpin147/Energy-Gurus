import { db } from "@/db";
import { inquiries, users, brands, epcInstallers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { MessageSquare, Clock, User, CheckCircle2, Mail, Phone, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateInquiryStatus } from "@/lib/actions/inquiry";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function DashboardInquiryList({ receiverId }: { receiverId: string }) {
    const inquiryList = await db.select({
        id: inquiries.id,
        message: inquiries.message,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
        guestName: inquiries.guestName,
        guestEmail: inquiries.guestEmail,
        guestPhone: inquiries.guestPhone,
        authorId: inquiries.senderId,
        brandLogo: brands.logoUrl,
        epcLogo: epcInstallers.logoUrl
    })
        .from(inquiries)
        .leftJoin(users, eq(inquiries.senderId, users.id))
        .leftJoin(brands, eq(brands.userId, users.id))
        .leftJoin(epcInstallers, eq(epcInstallers.userId, users.id))
        .where(eq(inquiries.receiverId, receiverId))
        .orderBy(desc(inquiries.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Inquiries</h2>
                <div className="text-xs font-medium bg-amber/10 text-ink text-amber px-3 py-1 rounded-full">
                    {inquiryList.filter(i => i.status === 'pending').length} New
                </div>
            </div>

            <div className="space-y-4">
                {inquiryList.map((inquiry) => (
                    <Card key={inquiry.id} className={`border-none shadow-sm ${inquiry.status === 'pending' ? 'bg-white border-l-4 border-l-accent' : 'bg-paper/5 opacity-80'}`}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 rounded-full">
                                        <AvatarImage src={inquiry.brandLogo || inquiry.epcLogo || undefined} />
                                        <AvatarFallback className="bg-paper text-amber">
                                            <User className="w-5 h-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-sm">{inquiry.guestName || "Potential Customer"}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-custom">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${inquiry.status === 'pending' ? 'bg-paper/20 text-amber' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {inquiry.status}
                                </div>
                            </div>

                            <p className="text-sm text-graphite leading-relaxed mb-6 bg-paper/5 p-4 rounded-xl border italic">
                                "{inquiry.message}"
                            </p>

                            {((inquiry as any).guestEmail || (inquiry as any).guestPhone) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                    {(inquiry as any).guestEmail && (
                                        <a href={`mailto:${(inquiry as any).guestEmail}`} className="flex items-center gap-2 text-xs font-bold text-amber hover:underline">
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
                    <div className="text-center py-12 bg-paper/5 rounded-3xl border-2 border-dashed">
                        <MessageSquare className="w-12 h-12 text-slate-custom mx-auto mb-4 opacity-10" />
                        <p className="text-slate-custom font-medium">No inquiries yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
