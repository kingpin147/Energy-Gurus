import { getPostHogTrends, getPostHogTable } from "@/lib/posthog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Briefcase, MousePointerClick, Globe, Facebook, Twitter, Linkedin, Instagram, MessageSquare, LayoutDashboard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListSort } from "@/components/shared/list-sort";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";
import { inquiries, reviews } from "@/db/schema";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

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

  const stats = [
    {
      title: "Brand Interest",
      value: (brandViews?.result?.[0]?.count || 0).toLocaleString(),
      icon: <Building2 className="w-4 h-4 text-amber" />,
      description: "Total portfolio views",
      accent: "bg-amber"
    },
    {
      title: "EPC Engagement",
      value: (epcProfileViews?.result?.[0]?.count || 0).toLocaleString(),
      icon: <Briefcase className="w-4 h-4 text-navy-deep" />,
      description: "Total profile views",
      accent: "bg-navy-deep"
    },
    {
      title: "Direct Contacts & Leads",
      value: directContactsCount.toLocaleString(),
      icon: <MousePointerClick className="w-4 h-4 text-amber-deep" />,
      description: "Contact clicks & inquiries",
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

        <TabsContent value="overview" className="space-y-8 focus-visible:outline-none">
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
                <div className="text-3xl font-black text-navy-deep font-space-grotesk tracking-tight">{stat.value}</div>
                <p className="text-[11px] font-medium text-slate-400 font-ibm-plex-mono mt-1">{stat.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="brand" className="space-y-8 focus-visible:outline-none">
          {/* Brand Engagement Table */}
          <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-line/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-amber" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold font-space-grotesk text-navy-deep tracking-tight">Brand Performance Matrix</CardTitle>
                    <p className="text-xs text-slate-custom font-medium mt-0.5">Top brands ranked by total user engagement</p>
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
              <Table>
                <TableHeader className="bg-paper/40">
                  <TableRow className="hover:bg-transparent border-line/60">
                    <TableHead className="w-[250px] font-bold uppercase tracking-wider text-[10px] pl-6 font-ibm-plex-mono text-slate-500">Brand Entity</TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Views</TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Web</TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">InMail</TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500"><Facebook className="w-3.5 h-3.5 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500"><Twitter className="w-3.5 h-3.5 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500"><Linkedin className="w-3.5 h-3.5 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500"><Instagram className="w-3.5 h-3.5 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500"><MessageSquare className="w-3.5 h-3.5 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-right font-bold uppercase tracking-wider text-[10px] pr-6 font-ibm-plex-mono text-slate-500">Total Eng.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandTable && brandTable.length > 0 ? brandTable.map((row: any, i: number) => (
                    <TableRow key={i} className="group hover:bg-paper/40 border-line/60 transition-colors">
                      <TableCell className="font-bold text-sm text-navy-deep pl-6 py-4">{row[0]}</TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-custom">{row[1]}</TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-custom">{row[2]}</TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-custom">{row[3]}</TableCell>
                      <TableCell className="text-center font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{row[4] || 0}</TableCell>
                      <TableCell className="text-center font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{row[5] || 0}</TableCell>
                      <TableCell className="text-center font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{row[6] || 0}</TableCell>
                      <TableCell className="text-center font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{row[7] || 0}</TableCell>
                      <TableCell className="text-center font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{row[8] || 0}</TableCell>
                      <TableCell className="text-right font-black pr-6">
                        <span className="px-3 py-1 bg-amber/10 text-amber font-mono text-xs rounded-lg border border-amber/20">
                          {row[9]}
                        </span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-slate-custom text-xs font-medium italic">
                        Waiting for Brand engagement data...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="epc" className="space-y-8 focus-visible:outline-none">
          {/* EPC Engagement Table */}
          <Card className="border border-line shadow-xs rounded-2xl overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-line/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-paper rounded-xl flex items-center justify-center border border-line">
                    <Briefcase className="w-5 h-5 text-navy-deep" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold font-space-grotesk text-navy-deep tracking-tight">EPC Installer Ranking</CardTitle>
                    <p className="text-xs text-slate-custom font-medium mt-0.5">Top performing installers based on profile interactions</p>
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
              <Table>
                <TableHeader className="bg-paper/40">
                  <TableRow className="hover:bg-transparent border-line/60">
                    <TableHead className="w-[250px] font-bold uppercase tracking-wider text-[10px] pl-6 font-ibm-plex-mono text-slate-500">Company Name</TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Views</TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">Portf.</TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500">InMail</TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500"><Facebook className="w-3.5 h-3.5 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500"><Twitter className="w-3.5 h-3.5 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500"><Linkedin className="w-3.5 h-3.5 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500"><Instagram className="w-3.5 h-3.5 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-bold uppercase tracking-wider text-[10px] font-ibm-plex-mono text-slate-500"><MessageSquare className="w-3.5 h-3.5 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-right font-bold uppercase tracking-wider text-[10px] pr-6 font-ibm-plex-mono text-slate-500">Total Eng.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {epcTable && epcTable.length > 0 ? epcTable.map((row: any, i: number) => (
                    <TableRow key={i} className="group hover:bg-paper/40 border-line/60 transition-colors">
                      <TableCell className="font-bold text-sm text-navy-deep pl-6 py-4">{row[0]}</TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-custom">{row[1]}</TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-custom">{row[2]}</TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-custom">{row[3]}</TableCell>
                      <TableCell className="text-center font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{row[4] || 0}</TableCell>
                      <TableCell className="text-center font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{row[5] || 0}</TableCell>
                      <TableCell className="text-center font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{row[6] || 0}</TableCell>
                      <TableCell className="text-center font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{row[7] || 0}</TableCell>
                      <TableCell className="text-center font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">{row[8] || 0}</TableCell>
                      <TableCell className="text-right font-black pr-6">
                        <span className="px-3 py-1 bg-navy-deep/10 text-navy-deep font-mono text-xs rounded-lg border border-navy-deep/20">
                          {row[9]}
                        </span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-slate-custom text-xs font-medium italic">
                        Waiting for EPC engagement data...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
