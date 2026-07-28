import { Link } from "@/i18n/routing";

export function Footer() {
    return (
        <footer className="bg-ink text-paper/60 py-14 pb-8 text-[0.88rem]">
            <div className="max-w-[1180px] mx-auto px-8 flex justify-between items-start flex-wrap gap-6">
                <div className="max-w-[340px] text-paper/85 font-space-grotesk text-[1rem]">
                    Powering informed solar decisions — brands, installers, and expertise, all in one place.
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
            
            <div className="max-w-[1180px] mx-auto px-8 mt-12 border-t border-paper/12 pt-5 text-[0.78rem]">
                © {new Date().getFullYear()} EnergyGurus.online — All rights reserved.
            </div>
        </footer>
    );
}
