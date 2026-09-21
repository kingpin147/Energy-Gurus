"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/lib/actions/users";
import { toast } from "sonner";

interface DeleteUserButtonProps {
    userId: string;
    userName: string;
    userEmail: string;
}

export function DeleteUserButton({ userId, userName, userEmail }: DeleteUserButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteUser(userId);
            toast.success(`User ${userName || userEmail} deleted successfully`);
            setOpen(false);
        } catch (err: any) {
            console.error("Delete user error:", err);
            toast.error(err?.message || "Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => setOpen(true)}
                type="button"
                title={`Delete ${userName || userEmail}`}
            >
                <Trash2 className="w-4 h-4" />
            </Button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !loading && setOpen(false)}
                    />
                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl border border-line/60 shadow-2xl p-6 w-full max-w-sm mx-4 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black text-base text-graphite">Delete User</h3>
                                <p className="text-sm text-slate-custom leading-relaxed">
                                    This will permanently delete <strong className="text-graphite">{userName || userEmail}</strong> and all associated profile, project, and media data. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl font-bold"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white gap-2 font-bold shadow-md shadow-red-600/20"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
