"use client";

import { UploadButton } from "@/lib/uploadthing";
import { updateEpcProfile } from "@/lib/actions/epc";
import { Briefcase, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PortfolioUploadProps {
  initialLogoUrl?: string | null;
  initialPortfolio?: string[] | null;
}

export function PortfolioUpload({ initialLogoUrl, initialPortfolio }: PortfolioUploadProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [portfolio, setPortfolio] = useState(initialPortfolio || []);

  const handleLogoUpload = async (res: any) => {
    const url = res[0].url;
    setLogoUrl(url);
    await updateEpcProfile({ logoUrl: url });
    router.refresh();
  };

  const handlePortfolioUpload = async (res: any) => {
    const newUrls = res.map((f: any) => f.url);
    const updatedPortfolio = [...portfolio, ...newUrls];
    setPortfolio(updatedPortfolio);
    await updateEpcProfile({ portfolio: updatedPortfolio });
    router.refresh();
  };

  const handleDeleteImage = async (urlToDelete: string) => {
    const updatedPortfolio = portfolio.filter(url => url !== urlToDelete);
    setPortfolio(updatedPortfolio);
    await updateEpcProfile({ portfolio: updatedPortfolio });
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Company Logo</label>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-2xl border bg-white flex items-center justify-center overflow-hidden p-2">
            {logoUrl ? (
              <img src={logoUrl} className="max-h-full max-w-full object-contain" alt="Company Logo" />
            ) : (
              <Briefcase className="w-8 h-8 text-primary/20" />
            )}
          </div>
          <UploadButton
            endpoint="brandLogo"
            onClientUploadComplete={handleLogoUpload}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Portfolio Images</label>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {portfolio.map((url, i) => (
            <div key={i} className="aspect-video rounded-xl border overflow-hidden relative group">
              <img src={url} className="w-full h-full object-cover" alt={`Portfolio ${i + 1}`} />
              <button
                onClick={() => handleDeleteImage(url)}
                className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <UploadButton
          endpoint="epcPortfolio"
          onClientUploadComplete={handlePortfolioUpload}
        />
      </div>
    </div>
  );
}
