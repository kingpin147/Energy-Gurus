import { Link } from "@/i18n/routing";
import { Twitter, Linkedin, Youtube, Facebook, Music2 } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-ink text-paper/60 py-14 pb-8 text-[0.88rem]">
            <div className="max-w-[1180px] mx-auto px-5 md:px-8 flex justify-between items-start flex-wrap gap-6">
                <div className="flex flex-col gap-6 max-w-[340px]">
                    <div className="text-paper/85 font-space-grotesk text-[1rem]">
                        Powering informed solar decisions — brands, installers, and expertise, all in one place.
                    </div>
                    <div className="flex gap-3 items-center">
                        <a href="https://www.tiktok.com/@energygurus.online" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-paper/5 border border-paper/10 text-amber hover:bg-amber hover:text-ink transition-colors" aria-label="TikTok">
                            <Music2 className="w-5 h-5" />
                        </a>
                        <a href="https://www.linkedin.com/company/energygurusonline" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-paper/5 border border-paper/10 text-amber hover:bg-amber hover:text-ink transition-colors" aria-label="LinkedIn">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="https://x.com/energyguruspk" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-paper/5 border border-paper/10 text-amber hover:bg-amber hover:text-ink transition-colors" aria-label="X (Twitter)">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="https://www.youtube.com/@energygurus.online" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-paper/5 border border-paper/10 text-amber hover:bg-amber hover:text-ink transition-colors" aria-label="YouTube">
                            <Youtube className="w-5 h-5" />
                        </a>
                        <a href="https://www.facebook.com/energygurus.online" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-paper/5 border border-paper/10 text-amber hover:bg-amber hover:text-ink transition-colors" aria-label="Facebook">
                            <Facebook className="w-5 h-5" />
                        </a>
                    </div>
                </div>
                
                <div className="flex gap-14 flex-wrap">
                    <div className="flex flex-col gap-2.5">
                        <Link href="/brands" className="text-paper/60 hover:text-white transition-colors">Solar Brands</Link>
                        <Link href="/epcs" className="text-paper/60 hover:text-white transition-colors">Find an Installer</Link>
                        <Link href="/monitoring" className="text-paper/60 hover:text-white transition-colors">Monitoring & O&M</Link>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        <Link href="/podcast" className="text-paper/60 hover:text-white transition-colors">Podcast</Link>
                        <Link href="/privacy" className="text-paper/60 hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-paper/60 hover:text-white transition-colors">Terms of Use</Link>
                    </div>
                </div>
            </div>
            
            <div className="max-w-[1180px] mx-auto px-5 md:px-8 mt-12 border-t border-paper/12 pt-5 text-[0.78rem]">
                © {new Date().getFullYear()} EnergyGurus.online — All rights reserved.
            </div>
        </footer>
    );
}
