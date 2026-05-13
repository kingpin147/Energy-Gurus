"use client";

import { useState } from "react";
import { addEpcProject, deleteEpcProject } from "@/lib/actions/epc";
import { Plus, Trash2, Zap, Loader2, Image as ImageIcon, Video as VideoIcon, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadButton } from "@/lib/uploadthing";

interface Project {
    id: string;
    name: string;
    city: string | null;
    segmentType: string | null;
    systemSize: string | null;
    systemType: string | null;
    inverterModel: string | null;
    batteryModel: string | null;
    solarPanelModel: string | null;
    images: string[] | null;
    videos: string[] | null;
}

interface ProjectManagementProps {
    epcId: string;
    initialProjects: Project[];
}

export function ProjectManagement({ epcId, initialProjects }: ProjectManagementProps) {
    const [projects, setProjects] = useState(initialProjects);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);

    const handleAdd = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const newProject = {
                name: formData.get("name") as string,
                city: formData.get("city") as string,
                segmentType: formData.get("segmentType") as string,
                systemSize: formData.get("systemSize") as string,
                systemType: formData.get("systemType") as string,
                inverterModel: formData.get("inverterModel") as string,
                batteryModel: formData.get("batteryModel") as string,
                solarPanelModel: formData.get("solarPanelModel") as string,
                images: uploadedImages,
            };
            await addEpcProject(epcId, newProject);
            setIsAdding(false);
            setUploadedImages([]);
            window.location.reload();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this project?")) return;
        await deleteEpcProject(id);
        setProjects(projects.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <LayoutGrid className="w-6 h-6 text-primary" /> Showcase Projects
                </h3>
                <Button 
                    onClick={() => setIsAdding(!isAdding)} 
                    variant={isAdding ? "ghost" : "primary"}
                    className="rounded-xl font-bold gap-2 h-11"
                >
                    <Plus className="w-4 h-4" /> {isAdding ? "Cancel" : "Add Project"}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-secondary/5 overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
                        <CardTitle className="text-2xl font-bold">New Showcase Project</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form action={handleAdd} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-40">Project Info</h4>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">Project Name</label>
                                        <input name="name" placeholder="e.g. 10kW Residential Installation" className="w-full border rounded-2xl p-4 bg-background outline-none" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">City</label>
                                            <input name="city" placeholder="Islamabad" className="w-full border rounded-2xl p-4 bg-background outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">Segment</label>
                                            <select name="segmentType" className="w-full border rounded-2xl p-4 bg-background outline-none">
                                                <option>Residential</option>
                                                <option>Commercial</option>
                                                <option>Industrial</option>
                                                <option>Agriculture</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-40">Technical Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">System Size (kW)</label>
                                            <input name="systemSize" placeholder="10" className="w-full border rounded-2xl p-4 bg-background outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">System Type</label>
                                            <select name="systemType" className="w-full border rounded-2xl p-4 bg-background outline-none">
                                                <option>Hybrid</option>
                                                <option>Grid Tied</option>
                                                <option>Off Grid</option>
                                                <option>VFD Tube Well</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">Equipment Used</label>
                                        <div className="space-y-2">
                                            <input name="inverterModel" placeholder="Inverter Brand/Model" className="w-full border rounded-xl p-3 bg-background outline-none text-sm" />
                                            <input name="solarPanelModel" placeholder="Solar Panel Brand/Model" className="w-full border rounded-xl p-3 bg-background outline-none text-sm" />
                                            <input name="batteryModel" placeholder="Battery Brand/Model" className="w-full border rounded-xl p-3 bg-background outline-none text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-primary/10">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block">Project Media</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border-2 border-dashed border-primary/20 rounded-[2rem] p-8 text-center bg-white/50">
                                        <ImageIcon className="w-8 h-8 text-primary/30 mx-auto mb-3" />
                                        <UploadButton
                                            endpoint="epcPortfolio"
                                            onClientUploadComplete={(res) => {
                                                if (res) setUploadedImages(prev => [...prev, ...res.map(r => r.url)]);
                                            }}
                                            className="ut-button:bg-primary ut-button:rounded-xl"
                                        />
                                        <p className="text-[10px] font-bold text-muted-foreground mt-4 uppercase tracking-widest">Upload Project Images</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {uploadedImages.map((img, i) => (
                                            <div key={i} className="aspect-square rounded-2xl overflow-hidden border">
                                                <img src={img} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Publish Showcase Project"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <Card key={project.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <div className="aspect-video relative overflow-hidden bg-secondary/10">
                            {project.images && project.images[0] ? (
                                <img src={project.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-10 h-10 opacity-10" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                                    {project.segmentType}
                                </span>
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-lg leading-tight mb-1">{project.name}</h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-yellow-500" /> {project.systemSize}kW • {project.city}
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => handleDelete(project.id)} 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:bg-destructive/10 rounded-xl"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="pt-4 border-t border-secondary/10 grid grid-cols-2 gap-2">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                    {project.systemType}
                                </div>
                                <div className="text-[10px] text-right font-bold text-primary">
                                    View Details →
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {projects.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center bg-secondary/5 rounded-[3rem] border-2 border-dashed border-secondary/20">
                        <LayoutGrid className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <h4 className="font-bold text-lg">No Projects Showcased</h4>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
                            Add your best installations to build trust with potential customers.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
