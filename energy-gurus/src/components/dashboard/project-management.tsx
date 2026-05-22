"use client";

import { useState, useRef } from "react";
import { addEpcProject, updateEpcProject, deleteEpcProject } from "@/lib/actions/epc";
import { Plus, Trash2, Zap, Loader2, Image as ImageIcon, Video as VideoIcon, LayoutGrid, Edit2, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { toast } from "sonner";

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
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

    const { uploadFile, isUploading } = useR2Upload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openAddForm = () => {
        setEditingProject(null);
        setUploadedImages([]);
        setUploadedVideos([]);
        setIsFormOpen(true);
    };

    const openEditForm = (project: Project) => {
        setEditingProject(project);
        setUploadedImages(project.images || []);
        setUploadedVideos(project.videos || []);
        setIsFormOpen(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const folder = file.type.startsWith("video") ? "project-videos" : "project-images";
                const { publicUrl } = await uploadFile(file, folder);

                if (file.type.startsWith("video")) {
                    setUploadedVideos(prev => [...prev, publicUrl]);
                } else {
                    setUploadedImages(prev => [...prev, publicUrl]);
                }
            }
            toast.success(`${files.length} file(s) uploaded`);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const projectData = {
                name: formData.get("name") as string,
                city: formData.get("city") as string,
                segmentType: formData.get("segmentType") as string,
                systemSize: formData.get("systemSize") as string,
                systemType: formData.get("systemType") as string,
                inverterModel: formData.get("inverterModel") as string,
                batteryModel: formData.get("batteryModel") as string,
                solarPanelModel: formData.get("solarPanelModel") as string,
                images: uploadedImages,
                videos: uploadedVideos,
            };

            if (editingProject) {
                await updateEpcProject(editingProject.id, projectData);
            } else {
                await addEpcProject(epcId, projectData);
            }

            setIsFormOpen(false);
            setEditingProject(null);
            setUploadedImages([]);
            setUploadedVideos([]);
            window.location.reload();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this project?")) return;
        await deleteEpcProject(id);
        setProjects((prev: Project[]) => prev.filter((p: Project) => p.id !== id));
    };

    const removeImage = (url: string) => {
        setUploadedImages((prev: string[]) => prev.filter((i: string) => i !== url));
    };

    const removeVideo = (url: string) => {
        setUploadedVideos((prev: string[]) => prev.filter((v: string) => v !== url));
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <LayoutGrid className="w-6 h-6 text-primary" /> Showcase Projects
                </h3>
                <Button
                    onClick={() => isFormOpen ? setIsFormOpen(false) : openAddForm()}
                    variant={isFormOpen ? "ghost" : "primary"}
                    className="rounded-xl font-bold gap-2 h-11"
                >
                    {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isFormOpen ? "Cancel" : "Add Project"}
                </Button>
            </div>

            {isFormOpen && (
                <Card className="border-none shadow-xl rounded-[2.5rem] bg-secondary/5 overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
                        <CardTitle className="text-2xl font-bold">{editingProject ? "Edit Showcase Project" : "New Showcase Project"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form action={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-40">Project Info</h4>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">Project Name</label>
                                        <input name="name" defaultValue={editingProject?.name || ""} placeholder="e.g. 10kW Residential Installation" className="w-full border rounded-2xl p-4 bg-background outline-none" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">City</label>
                                            <input name="city" defaultValue={editingProject?.city || ""} placeholder="Islamabad" className="w-full border rounded-2xl p-4 bg-background outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">Segment</label>
                                            <select name="segmentType" defaultValue={editingProject?.segmentType || "Residential"} className="w-full border rounded-2xl p-4 bg-background outline-none">
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
                                            <input name="systemSize" defaultValue={editingProject?.systemSize || ""} placeholder="10" className="w-full border rounded-2xl p-4 bg-background outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest mb-2 block">System Type</label>
                                            <select name="systemType" defaultValue={editingProject?.systemType || "Hybrid"} className="w-full border rounded-2xl p-4 bg-background outline-none">
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
                                            <input name="inverterModel" defaultValue={editingProject?.inverterModel || ""} placeholder="Inverter Brand/Model" className="w-full border rounded-xl p-3 bg-background outline-none text-sm" />
                                            <input name="solarPanelModel" defaultValue={editingProject?.solarPanelModel || ""} placeholder="Solar Panel Brand/Model" className="w-full border rounded-xl p-3 bg-background outline-none text-sm" />
                                            <input name="batteryModel" defaultValue={editingProject?.batteryModel || ""} placeholder="Battery Brand/Model" className="w-full border rounded-xl p-3 bg-background outline-none text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-primary/10">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 block">Project Media</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="border-2 border-dashed border-primary/20 rounded-[2rem] p-8 text-center bg-white/50 relative overflow-hidden">
                                            {isUploading ? (
                                                <div className="flex flex-col items-center gap-4 py-4">
                                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Uploading Content...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-8 h-8 text-primary/30 mx-auto mb-3" />
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*,video/*"
                                                        multiple
                                                        onChange={handleFileChange}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="bg-primary text-white font-bold rounded-xl px-6 h-12 text-sm flex items-center justify-center gap-2 mx-auto hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        Select Photos & Videos
                                                    </button>
                                                    <p className="text-[10px] font-bold text-muted-foreground mt-4 uppercase tracking-widest">Images (Max 10) & Videos (Max 2)</p>
                                                </>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black uppercase tracking-widest opacity-30">Gallery Preview</h5>
                                            <div className="grid grid-cols-4 gap-3">
                                                {uploadedImages.map((img, i) => (
                                                    <div key={i} className="aspect-square rounded-xl overflow-hidden border group relative bg-white shadow-sm">
                                                        <img src={img} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(img)}
                                                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {uploadedVideos.map((vid, i) => (
                                                    <div key={i} className="aspect-square rounded-xl overflow-hidden border group relative bg-secondary/10 flex items-center justify-center shadow-sm">
                                                        <VideoIcon className="w-6 h-6 text-primary/40" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVideo(vid)}
                                                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 rounded-[2.5rem] p-8 space-y-4 border border-primary/10">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Quick Guidelines</h4>
                                        <ul className="text-xs space-y-3 font-medium text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                                                <span>Use high-quality images of the completed installation.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                                                <span>Videos should be short walkthroughs (max 16MB).</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                                                <span>Include specific equipment models for technical trust.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading || isUploading} className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20">
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : editingProject ? "Update Showcase Project" : "Publish Showcase Project"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: Project) => (
                    <Card key={project.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-500 bg-white">
                        <div className="aspect-video relative overflow-hidden bg-secondary/10">
                            {project.images && project.images[0] ? (
                                <img src={project.images[0]} alt={project.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-10 h-10 opacity-10" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-primary/10">
                                    {project.segmentType}
                                </span>
                                {project.videos && project.videos.length > 0 && (
                                    <span className="bg-accent/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                                        <VideoIcon className="w-3 h-3 inline mr-1" /> HD Video
                                    </span>
                                )}
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-lg leading-tight">{project.name}</h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                        <Zap className="w-3 h-3 text-yellow-500 fill-current" /> {project.systemSize}kW • {project.city}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => openEditForm(project)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-primary hover:bg-primary/10 rounded-xl"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(project.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10 rounded-xl"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-secondary/10 flex justify-between items-center">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">
                                    {project.systemType}
                                </div>
                                <div className="text-[10px] font-black text-primary uppercase tracking-widest">
                                    Manage Content
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {projects.length === 0 && !isFormOpen && (
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
