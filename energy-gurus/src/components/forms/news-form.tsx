"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createNews } from "@/lib/actions/news";
import { toast } from "sonner";
import { Newspaper, Loader2, UploadCloud, Plus } from "lucide-react";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";

const DEFAULT_NEWS_CATEGORIES = [
    "Industry News",
    "Policy & Incentives",
    "Product Launches",
    "Project Sign Off",
];

export function NewsForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [isPublished, setIsPublished] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_NEWS_CATEGORIES[0]);
    const [customCategory, setCustomCategory] = useState<string>("");
    const { uploadFile, isUploading } = useR2Upload();

    async function onSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            if (selectedCategory === "custom") {
                if (!customCategory.trim()) {
                    toast.error("Please enter a custom category name");
                    setIsLoading(false);
                    return;
                }
                formData.set("category", customCategory.trim());
            } else {
                formData.set("category", selectedCategory);
            }

            if (imageUrl) {
                formData.append("imageUrl", imageUrl);
            }
            
            const result = await createNews(formData);
            
            if (result.success) {
                toast.success(result.message);
                router.push("/dashboard/news");
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={onSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-bold text-ink">Article Title <span className="text-red-500">*</span></Label>
                    <Input id="title" name="title" required placeholder="Enter an engaging title..." className="h-11 rounded-xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-amber" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-bold text-ink">Category <span className="text-red-500">*</span></Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger id="category" className="h-11 rounded-xl bg-slate-50 border-transparent focus:ring-amber font-medium">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {DEFAULT_NEWS_CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                                <SelectItem value="custom" className="text-amber font-bold flex items-center">
                                    + Add Custom Category...
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {selectedCategory === "custom" && (
                            <div className="pt-2 space-y-1">
                                <Label htmlFor="customCategoryInput" className="text-xs font-bold text-slate-custom uppercase tracking-wider">Custom Category Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="customCategoryInput"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="Enter custom category (e.g. Battery Storage, Solar Tariffs)"
                                    required
                                    className="h-10 rounded-xl bg-slate-50 border-amber/50 text-sm focus-visible:ring-amber"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 flex flex-col justify-start md:justify-end pb-2">
                        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-transparent">
                            <Switch id="isPublished" name="isPublished" value="true" checked={isPublished} onCheckedChange={setIsPublished} className="data-[state=checked]:bg-teal" />
                            <Label htmlFor="isPublished" className="text-sm font-bold cursor-pointer">Publish immediately</Label>
                        </div>
                    </div>
                </div>

                {!isPublished && (
                    <div className="space-y-2">
                        <Label htmlFor="publishedAt" className="text-sm font-bold text-ink">Publish Date & Time <span className="text-red-500">*</span></Label>
                        <Input type="datetime-local" id="publishedAt" name="publishedAt" required={!isPublished} className="h-11 rounded-xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-amber" />
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="text-sm font-bold text-ink">Cover Image</Label>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                        {imageUrl ? (
                            <div className="relative aspect-video max-h-[300px] w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center group">
                                <img src={imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button type="button" variant="destructive" onClick={() => setImageUrl("")} className="font-bold">
                                        Remove Image
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                                <UploadCloud className="w-12 h-12 text-slate-300" />
                                <div>
                                    <p className="text-sm font-semibold text-ink">Click to upload cover image</p>
                                    <p className="text-xs text-slate-custom mt-1">SVG, PNG, JPG or GIF (max 5MB)</p>
                                </div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploading}
                                    className="cursor-pointer file:cursor-pointer w-full max-w-xs"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            const { publicUrl } = await uploadFile(file, "news");
                                            setImageUrl(publicUrl);
                                            toast.success("Image uploaded successfully");
                                        } catch (error: any) {
                                            toast.error(`Error: ${error.message}`);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-custom mt-1">Recommended size: 1200x800px or similar 3:2 ratio.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-bold text-ink">Article Content <span className="text-red-500">*</span></Label>
                    <Textarea 
                        id="content" 
                        name="content" 
                        required 
                        placeholder="Write your article content here... (Markdown supported)" 
                        className="min-h-[250px] rounded-xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-amber resize-y p-4" 
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-line flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading} className="rounded-xl h-11 px-6 font-bold">
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="rounded-xl h-11 px-6 font-bold bg-amber text-ink hover:bg-amber/90">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Newspaper className="w-4 h-4 mr-2" />}
                    Save Article
                </Button>
            </div>
        </form>
    );
}
