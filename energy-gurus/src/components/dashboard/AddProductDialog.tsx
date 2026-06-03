"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DatasheetUpload } from "@/components/dashboard/DatasheetUpload";
import { addProductModel } from "@/lib/actions/brand";
import { toast } from "sonner";

export function AddProductDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            await addProductModel(formData);
            toast.success("Product model added successfully");
            setOpen(false);
            formRef.current?.reset();
        } catch (err) {
            console.error("Failed to add product:", err);
            toast.error("Failed to add product model");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl font-bold gap-2">
                    <Plus className="w-4 h-4" /> Add Model
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 max-h-[85vh] flex flex-col overflow-hidden sm:top-[20%] sm:translate-y-0">
                <DialogHeader className="px-8 pt-6 pb-2 shrink-0">
                    <DialogTitle className="text-2xl font-bold text-center">Add Product Model</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 px-8 pb-8 custom-scrollbar">
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Model Name</label>
                                <input name="name" placeholder="e.g. Hi-MO 6" className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Category</label>
                                <select name="category" className="w-full border rounded-xl p-3 bg-secondary/5 outline-none">
                                    <option>Solar Panels</option>
                                    <option>Inverters</option>
                                    <option>Batteries</option>
                                    <option>Accessories</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Description</label>
                            <textarea name="description" placeholder="Technical highlights..." className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" rows={3} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block">Serial/Model Prefix</label>
                            <input name="serialNumber" placeholder="LR5-72HPH" className="w-full border rounded-xl p-3 bg-secondary/5 outline-none" />
                        </div>
                        <DatasheetUpload />
                        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-bold mt-2">
                            {loading ? "Saving..." : "Save Product Model"}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
