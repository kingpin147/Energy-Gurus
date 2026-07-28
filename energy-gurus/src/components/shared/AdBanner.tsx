import { ExternalLink } from "lucide-react";

export type AdBannerVariant = "horizontal" | "sidebar" | "inline";

interface AdBannerProps {
  variant?: AdBannerVariant;
  /** Override with real ad content later */
  slot?: number;
}

const ADS: Record<
  number,
  { label: string; headline: string; sub: string; cta: string; href: string; bg: string }
> = {
  1: {
    label: "Sponsored",
    headline: "Advertise Your Solar Brand Here",
    sub: "Reach thousands of verified EPC installers and solar buyers every month.",
    cta: "Get in Touch",
    href: "/contact",
    bg: "from-primary/10 to-accent/10",
  },
  2: {
    label: "Promoted",
    headline: "List Your EPC Company",
    sub: "Join Pakistan's fastest-growing solar professional network.",
    cta: "Apply Now",
    href: "/contact",
    bg: "from-accent/10 to-primary/5",
  },
  3: {
    label: "Sponsored",
    headline: "Solar Product Verification",
    sub: "Authenticate your panels and inverters with our serial number database.",
    cta: "Verify Now",
    href: "/brands",
    bg: "from-emerald-500/10 to-primary/5",
  },
};

export function AdBanner({ variant = "horizontal", slot = 1 }: AdBannerProps) {
  const ad = ADS[slot] ?? ADS[1];

  if (variant === "sidebar") {
    return (
      <div
        className={`rounded-2xl border border-line/50 bg-gradient-to-br ${ad.bg} p-5 space-y-3 relative overflow-hidden`}
      >
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-custom/50 border border-line/40 px-2 py-0.5 rounded-full">
          {ad.label}
        </span>
        <p className="text-sm font-black leading-tight text-graphite">{ad.headline}</p>
        <p className="text-xs text-slate-custom leading-relaxed">{ad.sub}</p>
        <a
          href={ad.href}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber hover:underline"
        >
          {ad.cta} <ExternalLink className="w-3 h-3" />
        </a>
        {/* Decorative blob */}
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-amber/10 text-ink rounded-full blur-2xl pointer-events-none" />
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`rounded-xl border border-line/40 bg-gradient-to-r ${ad.bg} px-5 py-4 flex items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-custom/50 border border-line/40 px-2 py-0.5 rounded-full shrink-0">
            {ad.label}
          </span>
          <p className="text-sm font-bold text-graphite truncate">{ad.headline}</p>
        </div>
        <a
          href={ad.href}
          className="shrink-0 text-xs font-bold text-amber hover:underline flex items-center gap-1"
        >
          {ad.cta} <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  // horizontal (default) — full-width banner
  return (
    <div
      className={`rounded-2xl border border-line/50 bg-gradient-to-r ${ad.bg} px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden`}
    >
      <div className="space-y-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-custom/50 border border-line/40 px-2 py-0.5 rounded-full">
          {ad.label}
        </span>
        <p className="text-base font-black text-graphite">{ad.headline}</p>
        <p className="text-sm text-slate-custom">{ad.sub}</p>
      </div>
      <a
        href={ad.href}
        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-amber text-ink text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-amber/90 text-ink transition-colors shadow-md shadow-primary/20"
      >
        {ad.cta} <ExternalLink className="w-3.5 h-3.5" />
      </a>
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber/5 text-ink rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
