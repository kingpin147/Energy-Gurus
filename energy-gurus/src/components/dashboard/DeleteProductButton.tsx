"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProductModel } from "@/lib/actions/brand";
import { toast } from "sonner";

interface DeleteProductButtonProps {
    productId: string;
    productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteProductModel(productId);
            toast.success("Product deleted successfully");
            setOpen(false);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to delete product");
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setOpen(true)}
                type="button"
            >
                <Trash2 className="w-4 h-4" />
            </Button>

            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !loading && setOpen(false)}
                    />
                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl border border-line/60 shadow-2xl p-6 w-full max-w-sm space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-base text-graphite">Delete Product</h3>
                                <p className="text-sm text-slate-custom mt-1">
                                    Are you sure you want to delete <strong>{productName}</strong>? This will also remove the technical datasheet and any associated media from our cloud storage.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white gap-2"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                                ) : (
                                    <><Trash2 className="w-4 h-4" /> Delete</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
