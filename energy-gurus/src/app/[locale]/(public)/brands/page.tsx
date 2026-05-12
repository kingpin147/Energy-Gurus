import { db } from "@/db";
import { brands, products } from "@/db/schema";
import { Link } from "@/i18n/routing";
import { ShieldCheck, Shield } from "lucide-react";
import { redis } from "@/lib/redis";
import { SidebarVerification } from "@/components/brands/sidebar-verification";

// Use a versioned cache key to bust stale cache
const BRANDS_LIST_CACHE_KEY = "brands:all:v5";

export default async function BrandsListingPage() {
    let brandList: any[] | null = await redis.get(BRANDS_LIST_CACHE_KEY);

    if (!brandList) {
        const brandsData = await db.select().from(brands).orderBy(brands.brandName);
        const allProducts = await db.select().from(products);

        brandList = brandsData.map(brand => ({
            ...brand,
            products: allProducts.filter(p => p.brandId === brand.id).slice(0, 2)
        }));

        await redis.set(BRANDS_LIST_CACHE_KEY, brandList, { ex: 3600 });
        console.log("🗄️ Public Brands Cache Miss (v5)");
    } else {
        console.log("🚀 Public Brands Cache Hit (v5)");
    }

    return (
        <div className="bg-[#eefcfc] min-h-screen text-[#111e1e] font-noto selection:bg-[#fdc74c]/30">
            {/* External Asset Imports */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />

            <style dangerouslySetInnerHTML={{ __html: `
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    display: inline-block;
                    line-height: 1;
                    font-size: inherit;
                    vertical-align: middle;
                }
                .material-symbols-filled {
                    font-variation-settings: 'FILL' 1;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #bec9c8; border-radius: 10px; }
            ` }} />

            <main className="max-w-[1200px] mx-auto px-6 py-12">
                {/* Hero Section */}
                <section className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#fdc74c] text-[#715300] rounded-full mb-6 shadow-sm">
                        <span className="material-symbols-outlined material-symbols-filled !text-sm">verified</span>
                        <span className="text-[11px] font-black uppercase tracking-widest font-inter">AUTHENTICITY GUARANTEED</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-[#005353] tracking-tighter font-inter">
                        Verified Energy Brand Directory
                    </h1>
                    <p className="text-lg md:text-xl text-[#3e4948] max-w-2xl mx-auto leading-relaxed font-medium opacity-90">
                        Your primary destination for authenticating solar panels, inverters, and battery systems from world-class manufacturers.
                    </p>
                </section>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* Brand Listing Area */}
                    <div className="flex-1 min-w-0 w-full space-y-12">
                        <div className="flex items-center justify-between border-b border-[#bec9c8] pb-4">
                            <h2 className="text-2xl font-bold text-[#005353] font-inter">
                                Featured Partners
                            </h2>
                            <span className="text-[10px] font-bold text-[#3e4948]/60 uppercase tracking-widest font-inter">
                                {brandList.length} Brands Available
                            </span>
                        </div>

                        <div className="flex flex-col gap-8">
                            {brandList.map((brand, index) => (
                                <article 
                                    key={brand.id} 
                                    className="bg-white rounded-2xl border border-[#bec9c8] overflow-hidden hover:shadow-xl hover:border-[#005353]/30 transition-all duration-300 group/card animate-in fade-in slide-in-from-bottom-4"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                            <div className="flex gap-6 flex-1 min-w-0">
                                                {/* Brand Logo Wrapper */}
                                                <div className="w-24 h-24 bg-white p-3 rounded-2xl border border-[#bec9c8]/50 shadow-sm flex items-center justify-center shrink-0 group-hover/card:border-[#005353]/20 transition-colors">
                                                    {brand.logoUrl ? (
                                                        <img src={brand.logoUrl} alt={brand.brandName} className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full bg-[#eefcfc] rounded-lg flex items-center justify-center">
                                                            <span className="text-lg font-black text-[#005353] font-inter opacity-40">
                                                                {brand.brandName.substring(0, 2).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Brand Details */}
                                                <div className="min-w-0 flex-1 space-y-3">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h2 className="text-2xl font-black text-[#005353] font-inter tracking-tight">
                                                            {brand.brandName}
                                                        </h2>
                                                        {brand.isVerified && (
                                                            <div className="flex items-center gap-1 px-3 py-1 bg-[#9ef1f0] text-[#002020] rounded-full text-[10px] font-black font-inter uppercase tracking-tighter">
                                                                <span className="material-symbols-outlined !text-[12px] material-symbols-filled">verified_user</span>
                                                                Verified
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm md:text-base text-[#3e4948] leading-relaxed font-medium">
                                                        {brand.about || "Leading global provider of high-efficiency energy solutions and smart technology."}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-3 py-1 bg-[#d7e5e5] text-[#3e4948] rounded-lg text-[10px] font-black uppercase tracking-widest font-inter">Inverters</span>
                                                        <span className="px-3 py-1 bg-[#d7e5e5] text-[#3e4948] rounded-lg text-[10px] font-black uppercase tracking-widest font-inter">Modules</span>
                                                        {brand.customerCare && (
                                                            <span className="px-3 py-1 bg-[#d7e5e5] text-[#3e4948] rounded-lg text-[10px] font-black uppercase tracking-widest font-inter">Support</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Link */}
                                            <Link 
                                                href={`/brands/${brand.id}` as any} 
                                                className="bg-[#005353]/5 hover:bg-[#005353] text-[#005353] hover:text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap shrink-0 uppercase tracking-widest font-inter transition-all duration-300"
                                            >
                                                VIEW PROFILE <span className="material-symbols-outlined !text-base">arrow_forward</span>
                                            </Link>
                                        </div>

                                        {/* Product Showcase Container */}
                                        <div className="bg-[#eefcfc]/50 rounded-2xl p-4 md:p-6 border border-[#bec9c8]/30">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="w-1 h-4 bg-[#005353] rounded-full"></span>
                                                <h3 className="text-[11px] font-black text-[#005353] uppercase tracking-[0.2em] font-inter">
                                                    Featured Series
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                                {brand.products && brand.products.length > 0 ? (
                                                    brand.products.map((product: any) => (
                                                        <div key={product.id} className="group/item relative overflow-hidden rounded-xl aspect-[16/10] bg-white border border-[#bec9c8]/40 hover:border-[#005353]/40 shadow-sm transition-all duration-300">
                                                            {product.imageUrl ? (
                                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center bg-white gap-3">
                                                                    <div className="w-12 h-12 rounded-full bg-[#eefcfc] flex items-center justify-center">
                                                                        <Shield className="w-6 h-6 text-[#005353]/30" />
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-[#005353]/20 uppercase tracking-widest font-inter">Technical Unit</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity duration-300"></div>
                                                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 md:translate-y-4 md:group-hover/item:translate-y-0 transition-transform duration-300">
                                                                <p className="text-white font-black text-xs md:text-sm tracking-tight font-inter">{product.name}</p>
                                                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1 hidden md:block">Certified Authentic</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    // High-end placeholders
                                                    <>
                                                        <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-white border border-dashed border-[#bec9c8] flex flex-col items-center justify-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center animate-pulse">
                                                                <ShieldCheck className="w-5 h-5 text-[#7a5900]/20" />
                                                            </div>
                                                            <p className="text-[#3e4948]/40 text-[10px] font-black uppercase tracking-[0.2em] font-inter">Inventory Loading</p>
                                                        </div>
                                                        <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-white border border-dashed border-[#bec9c8] flex flex-col items-center justify-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-[#eefcfc] flex items-center justify-center">
                                                                <Shield className="w-5 h-5 text-[#005353]/10" />
                                                            </div>
                                                            <p className="text-[#3e4948]/40 text-[10px] font-black uppercase tracking-[0.2em] font-inter">Updating Showcase</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {brandList.length === 0 && (
                            <div className="text-center py-32 bg-white/50 rounded-3xl border-4 border-dashed border-[#bec9c8]/50 animate-in zoom-in-95 duration-500">
                                <ShieldCheck className="w-20 h-20 text-[#005353]/10 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-[#005353] font-inter uppercase tracking-tight">No Verified Brands</h3>
                                <p className="text-[#3e4948] font-medium opacity-60 mt-2">The verified brand directory is currently being updated.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Navigation & Tools */}
                    <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-[100px] flex flex-col gap-8">
                        {/* Instant Verification Module */}
                        <section className="bg-white p-8 rounded-3xl border border-[#bec9c8] shadow-xl shadow-[#005353]/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#eefcfc] rounded-bl-[100px] -mr-12 -mt-12 transition-all duration-500 group-hover:w-32 group-hover:h-32"></div>
                            <h3 className="text-sm font-black text-[#005353] mb-3 uppercase tracking-widest font-inter relative z-10">
                                Global Verification
                            </h3>
                            <p className="text-[12px] text-[#3e4948] mb-8 leading-relaxed font-medium opacity-80 relative z-10">
                                Authenticate your solar equipment instantly using the manufacturer-linked serial database.
                            </p>
                            <div className="relative z-10">
                                <SidebarVerification />
                            </div>
                        </section>

                        {/* Value Proposition Module */}
                        <section className="bg-[#005353] p-8 rounded-3xl text-white shadow-xl shadow-[#005353]/20 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#fdc74c]"></div>
                            <h3 className="text-xs font-black text-[#9ef1f0] uppercase tracking-[0.25em] border-b border-white/10 pb-4 mb-8 font-inter">
                                Quality Assurance
                            </h3>
                            <div className="flex flex-col gap-8">
                                <div className="flex gap-5 group">
                                    <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#fdc74c] transition-colors duration-300">
                                        <span className="material-symbols-outlined material-symbols-filled !text-xl text-[#9ef1f0] group-hover:text-[#715300]">security</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black mb-1 font-inter tracking-tight">Warranty Protection</h4>
                                        <p className="text-[12px] text-white/60 leading-relaxed font-medium">Eligible for performance warranties up to 25 years.</p>
                                    </div>
                                </div>
                                <div className="flex gap-5 group">
                                    <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#fdc74c] transition-colors duration-300">
                                        <span className="material-symbols-outlined material-symbols-filled !text-xl text-[#9ef1f0] group-hover:text-[#715300]">bolt</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black mb-1 font-inter tracking-tight">Output Efficiency</h4>
                                        <p className="text-[12px] text-white/60 leading-relaxed font-medium">Ensure components meet rated power output specs.</p>
                                    </div>
                                </div>
                                <div className="flex gap-5 group">
                                    <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-[#fdc74c] transition-colors duration-300">
                                        <span className="material-symbols-outlined material-symbols-filled !text-xl text-[#9ef1f0] group-hover:text-[#715300]">verified</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black mb-1 font-inter tracking-tight">Safety Compliance</h4>
                                        <p className="text-[12px] text-white/60 leading-relaxed font-medium">Reduce fire and electrical hazards in your system.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}
