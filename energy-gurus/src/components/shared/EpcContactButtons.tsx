"use client";

import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "@/components/forms/contact-form";
import { TrackedInteraction, TrackedLink } from "@/components/shared/AnalyticsTracker";
import { Globe, ExternalLink } from "lucide-react";

interface EpcContactButtonsProps {
    epcId: string;
    companyName: string;
    userId: string;
    website?: string | null;
    whatsappNumber?: string | null;
}

export function EpcContactButtons({ epcId, companyName, userId, website, whatsappNumber }: EpcContactButtonsProps) {
    return (
        <div className="space-y-3">
            {whatsappNumber && (
                <TrackedInteraction
                    as="a"
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    className="w-full h-12 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20bd5a] text-white gap-2.5 shadow-md shadow-[#25D366]/20 transition-all hover:scale-[1.01] flex items-center justify-center"
                    eventName="epc_whatsapp_click"
                    eventProperties={{ epcId, companyName }}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                </TrackedInteraction>
            )}

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full h-12 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-white gap-2.5 shadow-md shadow-primary/20 transition-all hover:scale-[1.01]">
                        <Mail className="w-4 h-4" /> Direct Message
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg rounded-2xl border border-border/60 p-0 overflow-hidden bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border/50">
                        <DialogHeader className="space-y-0.5">
                            <DialogTitle className="text-lg font-black text-foreground">
                                Message {companyName}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                Your inquiry goes directly to their inbox
                            </p>
                        </DialogHeader>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ml-4">
                            <Mail className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    {/* Form */}
                    <div className="px-6 py-5">
                        <ContactForm receiverId={userId} receiverName={companyName} />
                    </div>
                </DialogContent>
            </Dialog>

            {website && (
                <TrackedLink
                    href={website}
                    target="_blank"
                    className="w-full h-12 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/80 text-foreground border border-border/50 gap-2 transition-all inline-flex items-center justify-center"
                    eventName="epc_website_click"
                    eventProperties={{ epcId, companyName, url: website }}
                >
                    <Globe className="w-4 h-4 text-primary" /> Visit Website <ExternalLink className="w-3 h-3 opacity-40 ml-0.5" />
                </TrackedLink>
            )}
        </div>
    );
}
