"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, User, Briefcase } from "lucide-react";

export function BrandRepsForm({ initialReps }: { initialReps: any[] }) {
    const [reps, setReps] = useState(initialReps);

    const addRep = () => {
        setReps([...reps, { name: "", designation: "" }]);
    };

    const removeRep = (index: number) => {
        setReps(reps.filter((_, i) => i !== index));
    };

    const updateRep = (index: number, field: string, value: string) => {
        const newReps = [...reps];
        newReps[index] = { ...newReps[index], [field]: value };
        setReps(newReps);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Brand Representatives</label>
                <Button type="button" variant="ghost" size="sm" onClick={addRep} className="h-7 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-1.5 transition-all">
                    <Plus className="w-3.5 h-3.5" /> Add Representative
                </Button>
            </div>

            <div className="space-y-3">
                {reps.map((rep, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-secondary/5 p-5 rounded-[2rem] border border-dashed border-secondary/20 relative group transition-all hover:bg-secondary/10">
                        <div className="flex-1 w-full space-y-1.5">
                            <div className="flex items-center gap-2 px-1">
                                <User className="w-3 h-3 opacity-30" />
                                <label className="text-[9px] font-bold uppercase tracking-wider opacity-30">Full Name</label>
                            </div>
                            <input
                                value={rep.name}
                                onChange={(e) => updateRep(index, "name", e.target.value)}
                                className="w-full bg-transparent border-b border-secondary/10 px-1 py-1 outline-none text-sm font-bold focus:border-primary transition-colors"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div className="flex-1 w-full space-y-1.5">
                            <div className="flex items-center gap-2 px-1">
                                <Briefcase className="w-3 h-3 opacity-30" />
                                <label className="text-[9px] font-bold uppercase tracking-wider opacity-30">Designation</label>
                            </div>
                            <input
                                value={rep.designation}
                                onChange={(e) => updateRep(index, "designation", e.target.value)}
                                className="w-full bg-transparent border-b border-secondary/10 px-1 py-1 outline-none text-sm focus:border-primary transition-colors"
                                placeholder="e.g. Regional Manager"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRep(index)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-10 w-10 shrink-0 self-end sm:self-center"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}

                {reps.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-secondary/10 rounded-[2.5rem] opacity-30 bg-secondary/5">
                        <User className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No representatives listed</p>
                    </div>
                )}
            </div>

            <input type="hidden" name="reps" value={JSON.stringify(reps)} />
        </div>
    );
}
