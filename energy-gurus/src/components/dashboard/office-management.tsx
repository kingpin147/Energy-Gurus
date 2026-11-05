"use client";
import { useState } from "react";
import { addEpcOffice, updateEpcOffice, deleteEpcOffice } from "@/lib/actions/epc";
import { Plus, Trash2, MapPin, Loader2, Edit2, X, Building2, ExternalLink } from "lucide-react";
import { LocationPickerModal } from "@/components/shared/LocationPickerModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Office {
    id: string;
    officeNumber: string | null;
    block: string | null;
    area: string | null;
    city: string;
    coordinates?: string | null;
}

interface OfficeManagementProps {
    epcId: string;
    initialOffices: Office[];
}

export function OfficeManagement({ epcId, initialOffices }: OfficeManagementProps) {
    const router = useRouter();
    const [offices, setOffices] = useState(initialOffices);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOffice, setEditingOffice] = useState<Office | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [coordsValue, setCoordsValue] = useState("");
    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

    const openAddForm = () => {
        setEditingOffice(null);
        setIsFormOpen(true);
    };

    const openEditForm = (office: Office) => {
        setEditingOffice(office);
        setIsFormOpen(true);
    };

    const handleSave = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const officeData = {
                officeNumber: formData.get("officeNumber") as string,
                block: formData.get("block") as string,
                area: formData.get("area") as string,
                city: formData.get("city") as string
    };

            if (editingOffice) {
                await updateEpcOffice(editingOffice.id, officeData);
                toast.success("Office location updated");
            } else {
                await addEpcOffice(epcId, officeData);
                toast.success("Office location added");
            }

            setIsFormOpen(false);
            setEditingOffice(null);
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save office location");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this office?")) return;
        try {
            await deleteEpcOffice(id);
            setOffices((prev: Office[]) => prev.filter((o: Office) => o.id !== id));
            toast.success("Office location removed");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete office");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-amber" /> Company Offices
                </h3>
                <Button
                    onClick={() => isFormOpen ? setIsFormOpen(false) : openAddForm()}
                    variant={isFormOpen ? "ghost" : "primary"}
                    className="rounded-xl font-bold gap-2 h-11"
                >
                    {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isFormOpen ? "Cancel" : "Add Office"}
                </Button>
            </div>

            {isFormOpen && (
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-paper/5 overflow-hidden">
                    <CardHeader className="bg-amber/5 text-ink border-b border-amber/10 p-8">
                        <CardTitle className="text-2xl font-bold">{editingOffice ? "Edit Office Location" : "New Office Location"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form action={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">City / Region</label>
                                    <input name="city" defaultValue={editingOffice?.city || ""} placeholder="e.g. Islamabad" className="w-full border rounded-2xl p-4 bg-paper outline-none focus:ring-2 focus:ring-primary transition-all" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">Office / Unit Number</label>
                                    <input name="officeNumber" defaultValue={editingOffice?.officeNumber || ""} placeholder="e.g. Office 402, 4th Floor" className="w-full border rounded-2xl p-4 bg-paper outline-none focus:ring-2 focus:ring-primary transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">Block / Phase</label>
                                    <input name="block" defaultValue={editingOffice?.block || ""} placeholder="e.g. Block D, Gulberg" className="w-full border rounded-2xl p-4 bg-paper outline-none focus:ring-2 focus:ring-primary transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">Street / Area</label>
                                    <input name="area" defaultValue={editingOffice?.area || ""} placeholder="e.g. Main Boulevard" className="w-full border rounded-2xl p-4 bg-paper outline-none focus:ring-2 focus:ring-primary transition-all" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">Location Coordinates (Latitude, Longitude)</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            name="coordinates" 
                                            value={coordsValue} 
                                            onChange={(e) => setCoordsValue(e.target.value)} 
                                            placeholder="e.g. 31.4805, 74.3286" 
                                            className="flex-1 border rounded-2xl p-4 bg-paper outline-none font-mono text-sm focus:ring-2 focus:ring-primary transition-all" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setIsMapPickerOpen(true)}
                                            className="px-4 py-4 bg-[#FBF9F4] hover:bg-[#F3EEDF] border border-line rounded-2xl text-xs font-bold text-navy-deep flex items-center gap-2 transition-colors shrink-0 shadow-sm cursor-pointer"
                                        >
                                            <MapPin className="w-4 h-4 text-amber" />
                                            {coordsValue ? "Change Pin" : "Pick on map"}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-custom mt-2">Click &quot;Pick on map&quot; to drop an exact pin marker for this branch.</p>
                                </div>
                            </div>
                            <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : editingOffice ? "Update Office Location" : "Save Office Location"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offices.map((office: Office) => (
                    <Card key={office.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-500 bg-white">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber/5 text-ink flex items-center justify-center group-hover:bg-amber text-ink group-hover:text-white transition-colors duration-500">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => openEditForm(office)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-amber hover:bg-amber/10 text-ink rounded-xl"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(office.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10 rounded-xl"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold mb-2">{office.city}</h4>
                            <p className="text-sm text-slate-custom font-medium leading-relaxed">
                                {[office.officeNumber, office.block, office.area].filter(Boolean).join(", ")}
                            </p>
                            <div className="mt-6 pt-6 border-t border-paper/10 flex items-center justify-between">
                                {office.coordinates && (
                                    <span className="text-[11px] font-mono text-slate-500">📍 {office.coordinates}</span>
                                )}
                                <a
                                    href={office.coordinates ? `https://maps.google.com/?q=${office.coordinates}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${office.officeNumber || ''} ${office.block || ''} ${office.area || ''} ${office.city}`)}`}
                                    target="_blank"
                                    className="text-[10px] font-black uppercase tracking-widest text-amber hover:opacity-70 transition-opacity flex items-center gap-1"
                                >
                                    View on Map →
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {offices.length === 0 && !isFormOpen && (
                    <div className="col-span-full py-20 text-center bg-paper/5 rounded-[3rem] border-2 border-dashed border-paper/20">
                        <Building2 className="w-12 h-12 text-slate-custom/20 mx-auto mb-4" />
                        <h4 className="font-bold text-lg">No Offices Listed</h4>
                        <p className="text-slate-custom text-sm max-w-xs mx-auto mt-2 font-medium">
                            Add your office locations so customers can find you easily.
                        </p>
                    </div>
                )}
            </div>
            {isMapPickerOpen && (
                <LocationPickerModal
                    isOpen={true}
                    onClose={() => setIsMapPickerOpen(false)}
                    initialCoordinates={coordsValue}
                    defaultCity={editingOffice?.city || "Lahore"}
                    locationLabel={editingOffice?.city ? `${editingOffice.city} Branch` : "Office Location"}
                    onSave={(coords) => {
                        setCoordsValue(coords);
                        setIsMapPickerOpen(false);
                    }}
                />
            )}
        </div>
    );
}
