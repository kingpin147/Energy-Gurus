"use client";

import { updateEpcProfile } from "@/lib/actions/epc";
import { Briefcase, Trash2, Upload, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useR2Upload } from "@/lib/hooks/use-r2-upload";
import { toast } from "sonner";

interface PortfolioUploadProps {
  initialLogoUrl?: string | null;
  initialPortfolio?: string[] | null;
}

export function PortfolioUpload({ initialLogoUrl, initialPortfolio }: PortfolioUploadProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [portfolio, setPortfolio] = useState(initialPortfolio || []);
  const { uploadFile, isUploading } = useR2Upload();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { publicUrl } = await uploadFile(file, "epc-logos");
      setLogoUrl(publicUrl);
      await updateEpcProfile({ logoUrl: publicUrl });
      toast.success("Company logo updated");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePortfolioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const { publicUrl } = await uploadFile(files[i], "epc-portfolio");
        newUrls.push(publicUrl);
      }
      const updatedPortfolio = [...portfolio, ...newUrls];
      setPortfolio(updatedPortfolio);
      await updateEpcProfile({ portfolio: updatedPortfolio });
      toast.success(`${files.length} image(s) added to portfolio`);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteImage = async (urlToDelete: string) => {
    const updatedPortfolio = portfolio.filter(url => url !== urlToDelete);
    setPortfolio(updatedPortfolio);
    await updateEpcProfile({ portfolio: updatedPortfolio });
    toast.success("Image removed from portfolio");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Company Logo</label>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-2xl border bg-white flex items-center justify-center overflow-hidden p-2 shadow-sm">
            {logoUrl ? (
              <img src={logoUrl} className="max-h-full max-w-full object-contain" alt="Company Logo" />
            ) : (
              <Briefcase className="w-8 h-8 text-amber/20" />
            )}
          </div>
          <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
          <button
            onClick={() => logoInputRef.current?.click()}
            disabled={isUploading}
            className="bg-amber text-ink text-white font-bold rounded-xl px-4 h-10 text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-primary/10"
          >
            <Upload className="w-3 h-3" />
            {isUploading ? "Uploading..." : "Change Logo"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Portfolio Showcases</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {portfolio.map((url, i) => (
            <div key={i} className="aspect-video rounded-2xl border overflow-hidden relative group shadow-sm bg-white">
              <img src={url} className="w-full h-full object-cover" alt={`Portfolio ${i + 1}`} />
              <button
                onClick={() => handleDeleteImage(url)}
                className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => portfolioInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-video rounded-2xl border-2 border-dashed border-paper/20 flex flex-col items-center justify-center bg-paper/5 hover:bg-paper/10 transition-all gap-2"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-amber border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5 text-amber/40" />
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Add Project</span>
              </>
            )}
          </button>
        </div>
        <input type="file" ref={portfolioInputRef} className="hidden" accept="image/*" multiple onChange={handlePortfolioChange} />
      </div>
    </div>
  );
}
