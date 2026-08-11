"use client";

import { useState, useTransition, useOptimistic } from "react";
import { markInquiryAsRead, deleteInquiry, replyToInquiry, bulkDeleteInquiries, bulkMarkInquiriesAsRead } from "@/lib/actions/inquiry";
import { Mail, Phone, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Clock, User, CheckSquare, Square, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
    } from "@/components/ui/dropdown-menu";

type Inquiry = {
    id: string;
    guestName: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    subject: string | null;
    message: string;
    inquiryType: "client" | "support" | "public";
    status: string;
    isRead: boolean;
    reply: string | null;
    createdAt: Date;
};

type Filter = "all" | "unread" | "read";

export function InquiriesTable({ inquiries, hideReply = false }: { inquiries: Inquiry[], hideReply?: boolean }) {
    const [filter, setFilter] = useState<Filter>("all");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();

    const [optimisticInquiries, setOptimisticInquiries] = useOptimistic(
        inquiries,
        (current, { action, id, ids }: { action: "markRead" | "delete" | "bulkMarkRead" | "bulkDelete", id?: string, ids?: string[] }) => {
            if (action === "markRead") return current.map(i => i.id === id ? { ...i, isRead: true } : i);
            if (action === "delete") return current.filter(i => i.id !== id);
            if (action === "bulkMarkRead") return current.map(i => ids?.includes(i.id) ? { ...i, isRead: true } : i);
            if (action === "bulkDelete") return current.filter(i => !ids?.includes(i.id));
            return current;
        }
    );

    const filtered = optimisticInquiries.filter(i =>
        filter === "all" ? true : filter === "read" ? i.isRead : !i.isRead
    );

    const unreadCount = optimisticInquiries.filter(i => !i.isRead).length;

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) setSelectedIds([]);
        else setSelectedIds(filtered.map(i => i.id));
    };

    async function handleBulkMarkRead() {
        if (!selectedIds.length) return;
        startTransition(async () => {
            try {
                setOptimisticInquiries({ action: "bulkMarkRead", ids: selectedIds });
                const res = await bulkMarkInquiriesAsRead(selectedIds);
                if (res.success) {
                    toast.success(res.message);
                    setSelectedIds([]);
                } else toast.error(res.message);
            } catch (error) {
                toast.error("Failed to update inquiries");
            }
        });
    }

    async function handleBulkDelete() {
        if (!selectedIds.length || !confirm(`Delete ${selectedIds.length} inquiries?`)) return;
        startTransition(async () => {
            try {
                setOptimisticInquiries({ action: "bulkDelete", ids: selectedIds });
                const res = await bulkDeleteInquiries(selectedIds);
                if (res.success) {
                    toast.success(res.message);
                    setSelectedIds([]);
                } else toast.error(res.message);
            } catch (error) {
                toast.error("Failed to delete inquiries");
            }
        });
    }

    function handleMarkRead(id: string) {
        startTransition(async () => {
            try {
                setOptimisticInquiries({ action: "markRead", id });
                await markInquiryAsRead(id);
                toast.success("Marked as read");
            } catch (error) {
                toast.error("Failed to update inquiry");
            }
        });
    }

    function handleDelete(id: string) {
        if (!confirm("Delete this inquiry? This cannot be undone.")) return;
        startTransition(async () => {
            try {
                setOptimisticInquiries({ action: "delete", id });
                await deleteInquiry(id);
                toast.success("Inquiry deleted");
            } catch (error) {
                toast.error("Failed to delete inquiry");
            }
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
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
                                transition: "all 0.15s"
    }}
                        >
                            {f === "all" ? `All (${inquiries.length})` :
                                f === "unread" ? `Unread (${unreadCount})` :
                                    `Read (${inquiries.length - unreadCount})`}
                        </button>
                    ))}
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                        <span className="text-xs font-bold text-amber px-2">{selectedIds.length} Selected</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8 gap-1 rounded-lg">
                                    <MoreHorizontal className="w-4 h-4" /> Bulk Actions
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-xl">
                                <DropdownMenuItem onClick={handleBulkMarkRead} className="gap-2 cursor-pointer">
                                    <Eye className="w-4 h-4" /> Mark as Read
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleBulkDelete} className="gap-2 text-red-500 cursor-pointer">
                                    <Trash2 className="w-4 h-4" /> Delete Multi
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-custom">
                    <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No {filter === "all" ? "" : filter} inquiries yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="px-4 flex items-center gap-3">
                        <button onClick={toggleSelectAll} className="p-1 rounded hover:bg-paper/20 transition-colors border-none bg-transparent cursor-pointer">
                            {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4 text-amber" /> : <Square className="w-4 h-4 text-slate-custom" />}
                        </button>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-custom">Select All</span>
                    </div>

                    {filtered.map((inq) => (
                        <div
                            key={inq.id}
                            className={`rounded-2xl border transition-all ${inq.isRead ? "bg-white border-line" : "bg-amber/5 text-ink border-amber/20"} ${selectedIds.includes(inq.id) ? "ring-2 ring-primary ring-offset-2" : ""}`}
                        >
                            {/* Row Header */}
                            <div className="flex items-start gap-3 p-4">
                                <button onClick={() => toggleSelect(inq.id)} className="pt-1.5 p-1 rounded hover:bg-paper/20 transition-colors border-none bg-transparent cursor-pointer shrink-0">
                                    {selectedIds.includes(inq.id) ? <CheckSquare className="w-4 h-4 text-amber" /> : <Square className="w-4 h-4 text-slate-custom" />}
                                </button>

                                {/* Unread dot */}
                                <div style={{ paddingTop: "10px", flexShrink: 0 }}>
                                    <div style={{
                                        width: "8px", height: "8px", borderRadius: "50%",
                                        background: inq.isRead ? "transparent" : "hsl(var(--primary))",
                                        border: inq.isRead ? "2px solid hsl(var(--border))" : "none"
                                    }} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0" onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}>
                                    <div className="flex items-center gap-2 flex-wrap cursor-pointer">
                                        <span className="font-semibold text-sm">{inq.guestName || "Anonymous"}</span>
                                        {inq.guestEmail && (
                                            <a href={`mailto:${inq.guestEmail}`} onClick={(e) => e.stopPropagation()} className="text-xs text-amber flex items-center gap-1 hover:underline">
                                                <Mail className="w-3 h-3" />{inq.guestEmail}
                                            </a>
                                        )}
                                        {inq.guestPhone && (
                                            <a href={`tel:${inq.guestPhone}`} onClick={(e) => e.stopPropagation()} className="text-xs text-green-600 flex items-center gap-1 hover:underline">
                                                <Phone className="w-3 h-3" />{inq.guestPhone}
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-custom mt-0.5 line-clamp-1 cursor-pointer">
                                        {inq.subject ? <><strong>{inq.subject}:</strong> </> : ""}{inq.message}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3 text-slate-custom" />
                                        <span className="text-[11px] text-slate-custom">
                                            {new Date(inq.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
                                        className="p-1.5 rounded-lg text-slate-custom hover:bg-paper transition-colors border-none bg-transparent cursor-pointer"
                                        title="Expand"
                                    >
                                        {expanded === inq.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    {!inq.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(inq.id)}
                                            disabled={isPending}
                                            className="p-1.5 rounded-lg text-amber hover:bg-amber/10 text-ink transition-colors border-none bg-transparent cursor-pointer"
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
                                <div className="px-4 pb-4 pt-0 border-t border-dashed border-line ml-7">
                                    <p className="text-sm text-graphite leading-relaxed mt-3 whitespace-pre-wrap">{inq.message}</p>

                                    {!hideReply && (
                                        <>
                                            {inq.reply ? (
                                                <div className="mt-4 p-4 rounded-xl bg-amber/5 text-ink border border-amber/10">
                                                    <p className="text-xs font-bold text-amber uppercase tracking-widest mb-2">Reply</p>
                                                    <p className="text-sm text-graphite leading-relaxed whitespace-pre-wrap">{inq.reply}</p>
                                                </div>
                                            ) : (
                                                <form
                                                    action={async (formData) => {
                                                        const text = formData.get("reply") as string;
                                                        if (!text) return;
                                                        startTransition(async () => {
                                                            try {
                                                                const res = await replyToInquiry(inq.id, text);
                                                                if (res.success) {
                                                                    toast.success(res.message);
                                                                    setExpanded(null);
                                                                } else toast.error(res.message);
                                                            } catch (error) {
                                                                toast.error("Failed to send reply");
                                                            }
                                                        });
                                                    }}
                                                    className="mt-4 space-y-3"
                                                >
                                                    <textarea
                                                        name="reply"
                                                        placeholder="Type your reply here to maintain the chat in the dashboard..."
                                                        className="w-full min-h-[100px] p-3 rounded-xl border bg-paper/5 focus:ring-2 focus:ring-primary outline-none resize-none text-sm transition-all"
                                                        required
                                                    />
                                                    <div className="flex justify-end">
                                                        <Button size="sm" type="submit" disabled={isPending} className="gap-2">
                                                            <Mail className="w-3.5 h-3.5" /> Send Reply
                                                        </Button>
                                                    </div>
                                                </form>
                                            )}
                                        </>
                                    )}

                                    {hideReply && (
                                        <div className="mt-4 p-4 rounded-xl bg-paper/5 border border-dashed text-center">
                                            <p className="text-xs text-slate-custom italic">Public inquiry. Please contact via email or phone provided above.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
