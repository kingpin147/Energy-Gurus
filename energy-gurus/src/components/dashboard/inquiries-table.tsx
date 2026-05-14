"use client";

import { useState, useTransition } from "react";
import { markInquiryAsRead, deleteInquiry } from "@/lib/actions/inquiry";
import { Mail, Phone, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type Inquiry = {
    id: string;
    guestName: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    subject: string | null;
    message: string;
    status: string;
    isRead: boolean;
    createdAt: Date;
};

type Filter = "all" | "unread" | "read";

export function InquiriesTable({ inquiries }: { inquiries: Inquiry[] }) {
    const [filter, setFilter] = useState<Filter>("all");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const filtered = inquiries.filter(i =>
        filter === "all" ? true : filter === "read" ? i.isRead : !i.isRead
    );

    const unreadCount = inquiries.filter(i => !i.isRead).length;

    function handleMarkRead(id: string) {
        startTransition(() => markInquiryAsRead(id));
    }

    function handleDelete(id: string) {
        if (!confirm("Delete this inquiry? This cannot be undone.")) return;
        startTransition(() => deleteInquiry(id));
    }

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {(["all", "unread", "read"] as Filter[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: "6px 16px",
                            borderRadius: "999px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none",
                            background: filter === f ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                            color: filter === f ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                            transition: "all 0.15s",
                        }}
                    >
                        {f === "all" ? `All (${inquiries.length})` :
                         f === "unread" ? `Unread (${unreadCount})` :
                         `Read (${inquiries.length - unreadCount})`}
                    </button>
                ))}
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No {filter === "all" ? "" : filter} inquiries yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((inq) => (
                        <div
                            key={inq.id}
                            className={`rounded-2xl border transition-all ${inq.isRead ? "bg-card border-border" : "bg-primary/5 border-primary/20"}`}
                        >
                            {/* Row Header */}
                            <div className="flex items-start gap-3 p-4">
                                {/* Unread dot */}
                                <div style={{ paddingTop: "6px", flexShrink: 0 }}>
                                    <div style={{
                                        width: "8px", height: "8px", borderRadius: "50%",
                                        background: inq.isRead ? "transparent" : "hsl(var(--primary))",
                                        border: inq.isRead ? "2px solid hsl(var(--border))" : "none"
                                    }} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm">{inq.guestName || "Anonymous"}</span>
                                        {inq.guestEmail && (
                                            <a href={`mailto:${inq.guestEmail}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
                                                <Mail className="w-3 h-3" />{inq.guestEmail}
                                            </a>
                                        )}
                                        {inq.guestPhone && (
                                            <a href={`tel:${inq.guestPhone}`} className="text-xs text-green-600 flex items-center gap-1 hover:underline">
                                                <Phone className="w-3 h-3" />{inq.guestPhone}
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                        {inq.subject ? <><strong>{inq.subject}:</strong> </> : ""}{inq.message}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[11px] text-muted-foreground">
                                            {new Date(inq.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors border-none bg-transparent cursor-pointer"
                                        title="Expand"
                                    >
                                        {expanded === inq.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    {!inq.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(inq.id)}
                                            disabled={isPending}
                                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors border-none bg-transparent cursor-pointer"
                                            title="Mark as read"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(inq.id)}
                                        disabled={isPending}
                                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expanded === inq.id && (
                                <div className="px-4 pb-4 pt-0 border-t border-dashed border-border ml-7">
                                    <p className="text-sm text-foreground leading-relaxed mt-3 whitespace-pre-wrap">{inq.message}</p>
                                    <div className="flex gap-3 mt-4">
                                        {inq.guestEmail && (
                                            <a href={`mailto:${inq.guestEmail}`}>
                                                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                                                    <Mail className="w-3.5 h-3.5" /> Reply via Email
                                                </Button>
                                            </a>
                                        )}
                                        {inq.guestPhone && (
                                            <a href={`https://wa.me/${inq.guestPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="outline" className="gap-1.5 text-xs text-green-600 border-green-200">
                                                    <Phone className="w-3.5 h-3.5" /> WhatsApp
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
