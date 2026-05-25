"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "cmdk";
import {
    Search,
    LayoutDashboard,
    Mail,
    Users,
    Settings,
    Zap,
    Shield,
    FileText,
    Mic,
    Plus
} from "lucide-react";

interface CommandPaletteProps {
    role?: string;
}

export function CommandPalette({ role }: CommandPaletteProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl">
                <Command className="flex flex-col h-full bg-transparent">
                    <div className="flex items-center border-b px-4 py-4 gap-3">
                        <Search className="w-5 h-5 text-muted-foreground opacity-50" />
                        <CommandInput
                            placeholder="Type a command or search..."
                            className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-base font-medium placeholder:text-muted-foreground/50"
                        />
                        <div className="px-2 py-1 rounded-md bg-secondary/10 text-[10px] font-black uppercase tracking-widest opacity-40">
                            ESC
                        </div>
                    </div>
                    <CommandList className="max-h-[400px] overflow-y-auto p-2 scrollbar-none">
                        <CommandEmpty className="py-12 text-center text-sm text-muted-foreground italic">
                            No results found. Try searching for "Inbox" or "Users".
                        </CommandEmpty>

                        <CommandGroup heading="Navigation" className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">
                            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <LayoutDashboard className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-bold text-sm text-foreground">Overview</span>
                                <span className="ml-auto text-[10px] font-black opacity-0 group-hover:opacity-20 uppercase tracking-widest">Go to</span>
                            </CommandItem>

                            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/inbox"))} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Mail className="w-4 h-4 text-accent" />
                                </div>
                                <span className="font-bold text-sm text-foreground">Inbox & Inquiries</span>
                            </CommandItem>
                        </CommandGroup>

                        {role === 'super-admin' && (
                            <CommandGroup heading="Administration" className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2 mt-4">
                                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/users"))} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="font-bold text-sm text-foreground">User Management</span>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/analytics"))} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Shield className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="font-bold text-sm text-foreground">Security & Analytics</span>
                                </CommandItem>
                            </CommandGroup>
                        )}

                        <CommandGroup heading="Settings" className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2 mt-4">
                            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Settings className="w-4 h-4 text-slate-500" />
                                </div>
                                <span className="font-bold text-sm text-foreground">Profile Settings</span>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}

// Custom styles to inject for cmdk if not using global css
const cmdkStyles = `
  [cmdk-group-heading] {
    padding: 8px 12px;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(0,0,0,0.4);
  }
  [cmdk-item][aria-selected="true"] {
    background: rgba(0, 109, 109, 0.05);
  }
`;
