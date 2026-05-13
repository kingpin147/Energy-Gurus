"use client";

import { useState } from "react";
import { addEpcOffice, deleteEpcOffice } from "@/lib/actions/epc";
import { Plus, Trash2, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Office {
    id: string;
    officeNumber: string | null;
    block: string | null;
    area: string | null;
    city: string;
}

interface OfficeManagementProps {
    epcId: string;
    initialOffices: Office[];
}

export function OfficeManagement({ epcId, initialOffices }: OfficeManagementProps) {
    const [offices, setOffices] = useState(initialOffices);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const newOffice = {
                officeNumber: formData.get("officeNumber") as string,
                block: formData.get("block") as string,
                area: formData.get("area") as string,
                city: formData.get("city") as string,
            };
            await addEpcOffice(epcId, newOffice);
            setIsAdding(false);
            // Refresh would be handled by revalidatePath, but for optimistic UI or local state:
            window.location.reload(); 
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this office?")) return;
        await deleteEpcOffice(id);
        setOffices(offices.filter(o => o.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Company Offices
                </h3>
                <Button 
                    onClick={() => setIsAdding(!isAdding)} 
                    variant={isAdding ? "ghost" : "secondary"}
                    className="rounded-xl font-bold gap-2"
                >
                    <Plus className="w-4 h-4" /> {isAdding ? "Cancel" : "Add Office"}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-2 border-primary/20 bg-primary/5 rounded-[2rem]">
                    <CardContent className="p-6">
                        <form action={handleAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Office Number</label>
                                    <input name="officeNumber" placeholder="e.g. Office 101" className="w-full border rounded-xl p-3 bg-background outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Block</label>
                                    <input name="block" placeholder="e.g. Block C" className="w-full border rounded-xl p-3 bg-background outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Area / Street</label>
                                    <input name="area" placeholder="e.g. Gulberg III" className="w-full border rounded-xl p-3 bg-background outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">City</label>
                                    <input name="city" placeholder="e.g. Lahore" className="w-full border rounded-xl p-3 bg-background outline-none" required />
                                </div>
                            </div>
                            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Office"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offices.map(office => (
                    <Card key={office.id} className="border-none shadow-sm rounded-2xl group hover:shadow-md transition-all">
                        <CardContent className="p-5 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-sm">{office.city}</h4>
                                <p className="text-xs text-muted-foreground">
                                    {[office.officeNumber, office.block, office.area].filter(Boolean).join(", ")}
                                </p>
                            </div>
                            <Button 
                                onClick={() => handleDelete(office.id)} 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:bg-destructive/10 rounded-xl"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {offices.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center bg-secondary/5 rounded-[2rem] border-2 border-dashed border-secondary/20">
                        <MapPin className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm font-medium">No offices added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
