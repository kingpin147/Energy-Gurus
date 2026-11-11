import { getPostHogTrends, getPostHogTable } from "@/lib/posthog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Briefcase, MousePointerClick, Globe, Facebook, Twitter, Linkedin, Instagram, MessageSquare, LayoutDashboard, Trophy } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListSort } from "@/components/shared/list-sort";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";
import { inquiries, reviews } from "@/db/schema";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

function renderRank(rank: number) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber/20 text-amber-deep font-bold font-mono text-xs border border-amber/30">
        #1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold font-mono text-xs border border-slate-300">
        #2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/10 text-amber-900 font-bold font-mono text-xs border border-amber-900/20">
        #3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 text-slate-400 font-semibold font-mono text-xs">
      #{rank}
    </span>
  );
}

function renderActiveSocials(row: any[]) {
  const socials = [
    { name: "Facebook", count: Number(row[4] || 0), icon: <Facebook className="w-3 h-3 text-blue-600" /> },
    { name: "Twitter", count: Number(row[5] || 0), icon: <Twitter className="w-3 h-3 text-sky-500" /> },
    { name: "LinkedIn", count: Number(row[6] || 0), icon: <Linkedin className="w-3 h-3 text-blue-700" /> },
    { name: "Instagram", count: Number(row[7] || 0), icon: <Instagram className="w-3 h-3 text-pink-600" /> },
    { name: "WhatsApp", count: Number(row[8] || 0), icon: <MessageSquare className="w-3 h-3 text-emerald-600" /> },
  ].filter((s) => s.count > 0);

  if (socials.length === 0) {
    return <span className="text-slate-400 font-mono text-xs">—</span>;
  }

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {socials.map((s, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-paper border border-line/80 text-[10.5px] font-mono font-semibold text-navy-deep shadow-2xs"
          title={`${s.name}: ${s.count} clicks`}
        >
          {s.icon}
          <span>{s.count}</span>
        </span>
      ))}
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: Promise<{ epcSort?: string; brandSort?: string }>;
}) {
  const { epcSort, brandSort } = await searchParams;

  // Parallel non-blocking fetching for all external PostHog and DB queries
  const [
    brandViewsResult,
    brandWebsiteClicksResult,
    epcProfileViewsResult,
    contactClicksResult,
    brandTableResult,
    epcTableResult,
    totalInquiriesResult,
    totalReviewsResult,
  ] = await Promise.allSettled([
    getPostHogTrends('brand_portfolio_view'),
    getPostHogTrends('brand_website_click'),
    getPostHogTrends('epc_profile_view'),
    getPostHogTrends('brand_contact_click'),
    getPostHogTable('brand', brandSort || 'engagement'),
    getPostHogTable('epc', epcSort || 'engagement'),
    db.select({ count: count() }).from(inquiries),
    db.select({ count: count() }).from(reviews),
  ]);

  const brandViews = brandViewsResult.status === "fulfilled" ? brandViewsResult.value : null;
  const brandWebsiteClicks = brandWebsiteClicksResult.status === "fulfilled" ? brandWebsiteClicksResult.value : null;
  const epcProfileViews = epcProfileViewsResult.status === "fulfilled" ? epcProfileViewsResult.value : null;
  const contactClicks = contactClicksResult.status === "fulfilled" ? contactClicksResult.value : null;
  const brandTable = brandTableResult.status === "fulfilled" ? brandTableResult.value : null;
  const epcTable = epcTableResult.status === "fulfilled" ? epcTableResult.value : null;

  const dbInquiriesCount = totalInquiriesResult.status === "fulfilled" ? totalInquiriesResult.value[0]?.count || 0 : 0;
  const dbReviewsCount = totalReviewsResult.status === "fulfilled" ? totalReviewsResult.value[0]?.count || 0 : 0;

  // Use PostHog stream count, or fallback to real DB activity if events are pending
  const directContactsCount = Math.max(contactClicks?.result?.[0]?.count || 0, dbInquiriesCount);

  // High-level aggregated statistics
  const totalBrandViews = brandViews?.result?.[0]?.count || 0;
  const totalEpcViews = epcProfileViews?.result?.[0]?.count || 0;
  const totalViews = totalBrandViews + totalEpcViews;

  const stats = [
    {
      title: "Total Platform Views",
      value: totalViews.toLocaleString(),
      icon: <Building2 className="w-4 h-4 text-amber" />,
      description: "Brand & EPC portfolio traffic",
      accent: "bg-amber"
    },
    {
      title: "Active Interactions",
      value: directContactsCount.toLocaleString(),
      icon: <MousePointerClick className="w-4 h-4 text-navy-deep" />,
      description: "Inquiries & direct leads",
      accent: "bg-navy-deep"
    },
    {
      title: "Top Engaged Entity",
      value: brandTable?.[0]?.[0] || epcTable?.[0]?.[0] || "Huawei",
      icon: <Trophy className="w-4 h-4 text-amber-deep" />,
      description: `${(brandTable?.[0]?.[9] || epcTable?.[0]?.[9] || 0)} total engagements`,
      accent: "bg-amber-deep"
    },
    {
      title: "Website Referrals",
      value: (brandWebsiteClicks?.result?.[0]?.count || 0).toLocaleString(),
      icon: <Globe className="w-4 h-4 text-teal" />,
      description: "External website clicks",
      accent: "bg-teal"
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="font-space-grotesk text-3xl md:text-4xl font-bold tracking-tight text-navy-deep">Engagement Hub</h1>
          <p className="text-slate-custom text-sm md:text-base">Real-time interaction telemetry for Brands &amp; EPC Installers</p>
        </div>
        <div className="bg-amber/10 text-amber px-3.5 py-1.5 rounded-full border border-amber/20 text-[11px] font-bold uppercase tracking-wider font-ibm-plex-mono flex items-center gap-2">
          <span className="w-2 h-2 bg-amber rounded-full animate-pulse" />
          <span>Live PostHog Stream</span>
        </div>
      </div>

      {/* Unified Bento Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-line shadow-xs relative overflow-hidden group hover:border-amber/50 hover:shadow-sm transition-all duration-200">
            <div className={`absolute top-0 left-0 right-0 h-1 ${stat.accent}`} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-ibm-plex-mono">{stat.title}</span>
              <div className="p-1.5 rounded-lg bg-paper border border-line/60">
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-navy-deep font-space-grotesk tracking-tight truncate">{stat.value}</div>
            <p className="text-[11px] font-medium text-slate-400 font-ibm-plex-mono mt-1 truncate">{stat.description}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-3">
          <TabsList className="grid grid-cols-3 w-full sm:w-[480px] h-11 p-1 bg-paper border border-line rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg font-bold gap-2 text-xs data-[state=active]:bg-white data-[state=active]:text-navy-deep data-[state=active]:shadow-xs">
              <LayoutDashboard className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="epc" className="rounded-lg font-bold gap-2 text-xs data-[state=active]:bg-white data-[state=active]:text-navy-deep data-[state=active]:shadow-xs">
              <Briefcase className="w-3.5 h-3.5" /> EPC Rankings
            </TabsTrigger>
            <TabsTrigger value="brand" className="rounded-lg font-bold gap-2 text-xs data-[state=active]:bg-white data-[state=active]:text-navy-deep data-[state=active]:shadow-xs">
              <Building2 className="w-3.5 h-3.5" /> Brand Rankings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab: Combined Highlights */}
        <TabsContent value="overview" className="space-y-8 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Brands Teaser Card */}
            <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white">
              <CardHeader className="p-5 border-b border-line/60 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-amber" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold font-space-grotesk text-navy-deep">Top Brands by Engagement</CardTitle>
                    <p className="text-[11px] text-slate-custom">Ranked by user interactions</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-line/60">
                  {brandTable && brandTable.length > 0 ? (
                    brandTable.slice(0, 5).map((row: any, i: number) => (
                      <div key={i} className="p-3.5 flex items-center justify-between hover:bg-paper/40 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          {renderRank(i + 1)}
                          <span className="font-semibold text-sm text-navy-deep truncate">{row[0]}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono text-slate-custom">{row[1]} views</span>
                          <span className="px-2.5 py-0.5 bg-amber/10 text-amber font-mono font-bold text-xs rounded-md border border-amber/20">
                            {row[9]}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-custom">No brand telemetry recorded yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top EPCs Teaser Card */}
            <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white">
              <CardHeader className="p-5 border-b border-line/60 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-navy-deep/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-navy-deep" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold font-space-grotesk text-navy-deep">Top EPCs by Engagement</CardTitle>
                    <p className="text-[11px] text-slate-custom">Ranked by profile interactions</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-line/60">
                  {epcTable && epcTable.length > 0 ? (
                    epcTable.slice(0, 5).map((row: any, i: number) => (
                      <div key={i} className="p-3.5 flex items-center justify-between hover:bg-paper/40 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          {renderRank(i + 1)}
                          <span className="font-semibold text-sm text-navy-deep truncate">{row[0]}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono text-slate-custom">{row[1]} views</span>
                          <span className="px-2.5 py-0.5 bg-navy-deep/10 text-navy-deep font-mono font-bold text-xs rounded-md border border-navy-deep/20">
                            {row[9]}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-custom">No EPC telemetry recorded yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Brand Tab: Streamlined Table + Mobile Stacked Cards */}
        <TabsContent value="brand" className="space-y-8 focus-visible:outline-none">
          <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white">
            <CardHeader className="p-5 sm:p-6 border-b border-line/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber/10 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-amber" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold font-space-grotesk text-navy-deep tracking-tight">Brand Performance Leaderboard</CardTitle>
                    <p className="text-xs text-slate-custom font-medium mt-0.5">Top solar brands ranked by verified user telemetry</p>
                  </div>
                </div>
                <ListSort
                  paramName="brandSort"
                  defaultValue="engagement"
                  options={[
                    { label: "Elite Engagement", value: "engagement" },
                    { label: "Emerging", value: "engagement-low" },
                    { label: "Alpha (A-Z)", value: "name" },
                  ]}
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-paper/60 border-b border-line/60">
                    <TableRow className="hover:bg-transparent border-line/60">
                      <TableHead className="w-[80px] font-bold uppercase tracking-wider text-[10px] pl-6 font-ibm-plex-mono text-slate-500">Rank</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Brand Entity</TableHead>
                      <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Views</TableHead>
                      <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Web Clicks</TableHead>
                      <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Contacts / InMail</TableHead>
                      <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Active Channels</TableHead>
                      <TableHead className="text-right font-bold uppercase tracking-wider text-[10px] pr-6 font-ibm-plex-mono text-slate-500">Total Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brandTable && brandTable.length > 0 ? (
                      brandTable.map((row: any, i: number) => (
                        <TableRow key={i} className="group hover:bg-paper/40 border-line/60 transition-colors">
                          <TableCell className="pl-6 py-4">{renderRank(i + 1)}</TableCell>
                          <TableCell className="font-bold text-sm text-navy-deep py-4">{row[0]}</TableCell>
                          <TableCell className="text-center font-mono text-xs text-slate-custom font-semibold">{row[1]}</TableCell>
                          <TableCell className="text-center font-mono text-xs text-slate-custom">{row[2]}</TableCell>
                          <TableCell className="text-center font-mono text-xs text-slate-custom">{row[3]}</TableCell>
                          <TableCell className="text-center">{renderActiveSocials(row)}</TableCell>
                          <TableCell className="text-right font-black pr-6">
                            <span className="px-3 py-1 bg-amber/10 text-amber font-mono text-xs rounded-lg border border-amber/20 font-bold">
                              {row[9]}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-slate-custom text-xs font-medium italic">
                          Waiting for Brand engagement data from PostHog...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Stacked Card View */}
              <div className="md:hidden divide-y divide-line/60">
                {brandTable && brandTable.length > 0 ? (
                  brandTable.map((row: any, i: number) => (
                    <div key={i} className="p-4 space-y-3 bg-white hover:bg-paper/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderRank(i + 1)}
                          <span className="font-bold text-sm text-navy-deep truncate">{row[0]}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-amber/10 text-amber font-mono font-bold text-xs rounded-lg border border-amber/20 shrink-0">
                          {row[9]} Total
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-paper/70 p-2 rounded-lg border border-line/60">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Views</span>
                          <span className="font-mono font-bold text-navy-deep">{row[1]}</span>
                        </div>
                        <div className="bg-paper/70 p-2 rounded-lg border border-line/60">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Web</span>
                          <span className="font-mono font-bold text-navy-deep">{row[2]}</span>
                        </div>
                        <div className="bg-paper/70 p-2 rounded-lg border border-line/60">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">InMail</span>
                          <span className="font-mono font-bold text-navy-deep">{row[3]}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10.5px] font-mono text-slate-400">Social Channels:</span>
                        {renderActiveSocials(row)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-custom">Waiting for Brand engagement data...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EPC Tab: Streamlined Table + Mobile Stacked Cards */}
        <TabsContent value="epc" className="space-y-8 focus-visible:outline-none">
          <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white">
            <CardHeader className="p-5 sm:p-6 border-b border-line/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy-deep/10 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-navy-deep" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold font-space-grotesk text-navy-deep tracking-tight">EPC Installer Ranking</CardTitle>
                    <p className="text-xs text-slate-custom font-medium mt-0.5">Top performing installers based on customer lead generation</p>
                  </div>
                </div>
                <ListSort
                  paramName="epcSort"
                  defaultValue="engagement"
                  options={[
                    { label: "High Impact", value: "engagement" },
                    { label: "Growing", value: "engagement-low" },
                    { label: "Alpha (A-Z)", value: "name" },
                  ]}
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-paper/60 border-b border-line/60">
                    <TableRow className="hover:bg-transparent border-line/60">
                      <TableHead className="w-[80px] font-bold uppercase tracking-wider text-[10px] pl-6 font-ibm-plex-mono text-slate-500">Rank</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Company Name</TableHead>
                      <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Profile Views</TableHead>
                      <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Web Clicks</TableHead>
                      <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">InMail Inquiries</TableHead>
                      <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Active Channels</TableHead>
                      <TableHead className="text-right font-bold uppercase tracking-wider text-[10px] pr-6 font-ibm-plex-mono text-slate-500">Total Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {epcTable && epcTable.length > 0 ? (
                      epcTable.map((row: any, i: number) => (
                        <TableRow key={i} className="group hover:bg-paper/40 border-line/60 transition-colors">
                          <TableCell className="pl-6 py-4">{renderRank(i + 1)}</TableCell>
                          <TableCell className="font-bold text-sm text-navy-deep py-4">{row[0]}</TableCell>
                          <TableCell className="text-center font-mono text-xs text-slate-custom font-semibold">{row[1]}</TableCell>
                          <TableCell className="text-center font-mono text-xs text-slate-custom">{row[2]}</TableCell>
                          <TableCell className="text-center font-mono text-xs text-slate-custom">{row[3]}</TableCell>
                          <TableCell className="text-center">{renderActiveSocials(row)}</TableCell>
                          <TableCell className="text-right font-black pr-6">
                            <span className="px-3 py-1 bg-amber/10 text-amber font-mono text-xs rounded-lg border border-amber/20 font-bold">
                              {row[9]}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-slate-custom text-xs font-medium italic">
                          Waiting for EPC engagement data from PostHog...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Stacked Card View */}
              <div className="md:hidden divide-y divide-line/60">
                {epcTable && epcTable.length > 0 ? (
                  epcTable.map((row: any, i: number) => (
                    <div key={i} className="p-4 space-y-3 bg-white hover:bg-paper/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderRank(i + 1)}
                          <span className="font-bold text-sm text-navy-deep truncate">{row[0]}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-amber/10 text-amber font-mono font-bold text-xs rounded-lg border border-amber/20 shrink-0">
                          {row[9]} Total
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-paper/70 p-2 rounded-lg border border-line/60">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Views</span>
                          <span className="font-mono font-bold text-navy-deep">{row[1]}</span>
                        </div>
                        <div className="bg-paper/70 p-2 rounded-lg border border-line/60">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Web</span>
                          <span className="font-mono font-bold text-navy-deep">{row[2]}</span>
                        </div>
                        <div className="bg-paper/70 p-2 rounded-lg border border-line/60">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">InMail</span>
                          <span className="font-mono font-bold text-navy-deep">{row[3]}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10.5px] font-mono text-slate-400">Social Channels:</span>
                        {renderActiveSocials(row)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-custom">Waiting for EPC engagement data...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
