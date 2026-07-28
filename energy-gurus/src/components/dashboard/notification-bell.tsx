"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash2, Mail, MessageSquare, Info } from "lucide-react";
import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from "@/lib/actions/notification";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Notification = {
    id: string;
    title: string;
    message: string;
    type: "inquiry" | "reply" | "system";
    link: string | null;
    senderLogoUrl: string | null;
    isRead: boolean;
    createdAt: Date;
};

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        const data = await getMyNotifications();
        setNotifications(data as Notification[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id: string) => {
        const res = await markNotificationAsRead(id);
        if (res.success) {
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        }
    };

    const handleMarkAllAsRead = async () => {
        const res = await markAllNotificationsAsRead();
        if (res.success) {
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success("All notifications marked as read");
        }
    };

    const handleDelete = async (e: React.MouseEvent | React.TouchEvent, id: string) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const res = await deleteNotification(id);
        if (res.success) {
            setNotifications(notifications.filter(n => n.id !== id));
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "inquiry": return <Mail className="h-4 w-4 text-blue-500" />;
            case "reply": return <MessageSquare className="h-4 w-4 text-green-500" />;
            default: return <Info className="h-4 w-4 text-amber-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-paper/10 hover:bg-paper/20 transition-all">
                    <Bell className="h-5 w-5 text-amber" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-2 border-white animate-in zoom-in"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl overflow-hidden shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl">
                <div className="flex items-center justify-between p-4 bg-amber/5 text-ink border-b">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-amber">Notifications</span>
                        <span className="text-[10px] text-slate-custom uppercase tracking-widest font-bold">Stay Updated</span>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] font-black uppercase text-amber hover:underline"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center bg-paper/5 rounded-2xl border-2 border-dashed">
                            <Bell className="w-8 h-8 text-slate-custom mx-auto mb-2 opacity-20" />
                            <p className="text-sm text-slate-custom">No new notifications</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 p-2">
                            {notifications.map((n) => (
                                <Link
                                    key={n.id}
                                    href={n.link || "#"}
                                    onClick={() => handleMarkAsRead(n.id)}
                                    className={`flex flex-col gap-1.5 p-4 rounded-2xl transition-all border border-transparent hover:bg-paper/10 hover:border-line/50 relative group ${!n.isRead ? 'bg-amber/5 text-ink border-amber/10' : 'bg-transparent'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            {n.senderLogoUrl ? (
                                                <img
                                                    src={n.senderLogoUrl}
                                                    alt="Sender"
                                                    className="w-10 h-10 rounded-full object-contain bg-white border border-line/50 shadow-sm"
                                                />
                                            ) : (
                                                <div className={`p-2 rounded-xl border ${n.type === 'inquiry' ? 'bg-amber/10 text-ink text-amber border-amber/20' :
                                                    n.type === 'reply' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                                        'bg-blue-100 text-blue-600 border-blue-200'
                                                    }`}>
                                                    {getTypeIcon(n.type)}
                                                </div>
                                            )}
                                            {!n.isRead && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber text-ink rounded-full border-2 border-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <span className={`text-xs font-black tracking-tight truncate ${!n.isRead ? 'text-graphite' : 'text-slate-custom'}`}>{n.title}</span>
                                                <span className="text-[10px] text-slate-custom whitespace-nowrap opacity-60 font-bold">{new Date(n.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className={`text-xs leading-relaxed line-clamp-2 ${!n.isRead ? 'text-slate-custom font-medium' : 'text-slate-custom/60'}`}>{n.message}</p>
                                        </div>
                                    </div>

                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-lg text-slate-custom hover:text-red-500 hover:bg-red-50"
                                            onClick={(e) => {
                                                handleDelete(e, n.id);
                                            }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <div className="p-2">
                    <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest h-8 text-slate-custom hover:text-amber" asChild>
                        <Link href="/dashboard/inbox">View All In Inbox</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
