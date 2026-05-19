import { getPostHogTrends, getPostHogTable } from "@/lib/posthog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Briefcase, MousePointerClick, Globe, Facebook, Twitter, Linkedin, Instagram, MessageSquare, LayoutDashboard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListSort } from "@/components/shared/list-sort";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;

  // Fetch trends for overview cards
  const brandViews = await getPostHogTrends('brand_portfolio_view');
  const brandWebsiteClicks = await getPostHogTrends('brand_website_click');
  const epcProfileViews = await getPostHogTrends('epc_profile_view');
  const contactClicks = await getPostHogTrends('brand_contact_click');

  // Fetch detailed tables with sort
  const brandTable = await getPostHogTable('brand', sort);
  const epcTable = await getPostHogTable('epc', sort);

  const stats = [
    {
      title: "Brand Interest",
      value: brandViews?.result?.[0]?.count || 0,
      icon: <Building2 className="w-4 h-4 text-primary" />,
      description: "Total portfolio views"
    },
    {
      title: "EPC Engagement",
      value: epcProfileViews?.result?.[0]?.count || 0,
      icon: <Briefcase className="w-4 h-4 text-primary" />,
      description: "Total profile views"
    },
    {
      title: "Direct Contacts",
      value: contactClicks?.result?.[0]?.count || 0,
      icon: <MousePointerClick className="w-4 h-4 text-primary" />,
      description: "Clicks on contact buttons"
    },
    {
      title: "Website Referrals",
      value: brandWebsiteClicks?.result?.[0]?.count || 0,
      icon: <Globe className="w-4 h-4 text-primary" />,
      description: "External website clicks"
    }
  ];

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter">Engagement Hub</h1>
          <p className="text-muted-foreground font-medium">Real-time interaction analytics for Brands & EPC Installers</p>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-full border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Live PostHog Stream
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <TabsList className="grid grid-cols-3 w-full sm:w-[480px] h-12 p-1 bg-secondary/20 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg font-bold gap-2">
              <LayoutDashboard className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="epc" className="rounded-lg font-bold gap-2">
              <Briefcase className="w-4 h-4" /> EPC Rankings
            </TabsTrigger>
            <TabsTrigger value="brand" className="rounded-lg font-bold gap-2">
              <Building2 className="w-4 h-4" /> Brand Rankings
            </TabsTrigger>
          </TabsList>

          <ListSort 
            defaultValue="engagement"
            options={[
              { label: "Highest Engagement", value: "engagement" },
              { label: "Lowest Engagement", value: "engagement-low" },
              { label: "A - Z (Name)", value: "name" },
            ]}
          />
        </div>

        <TabsContent value="overview" className="space-y-8 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="border-border/50 shadow-sm rounded-3xl overflow-hidden bg-white/50 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest opacity-40">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black tracking-tight">{stat.value}</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="brand" className="space-y-8 focus-visible:outline-none">
          {/* Brand Engagement Table */}
          <Card className="border-border/50 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Brand Performance Matrix</CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">Top brands ranked by total user engagement</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-secondary/5">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[250px] font-black uppercase tracking-widest text-[10px] pl-8">Brand Entity</TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]">Views</TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]">Web</TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]">InMail</TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]"><Facebook className="w-4 h-4 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]"><Twitter className="w-4 h-4 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]"><Linkedin className="w-4 h-4 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]"><Instagram className="w-4 h-4 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]"><MessageSquare className="w-4 h-4 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-right font-black uppercase tracking-widest text-[10px] pr-8">Total Eng.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandTable && brandTable.length > 0 ? brandTable.map((row: any, i: number) => (
                    <TableRow key={i} className="group hover:bg-primary/[0.02] border-border/50 transition-colors">
                      <TableCell className="font-black text-base pl-8 py-6">{row[0]}</TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">{row[1]}</TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">{row[2]}</TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">{row[3]}</TableCell>
                      <TableCell className="text-center font-medium opacity-40 group-hover:opacity-100 transition-opacity">{row[4] || 0}</TableCell>
                      <TableCell className="text-center font-medium opacity-40 group-hover:opacity-100 transition-opacity">{row[5] || 0}</TableCell>
                      <TableCell className="text-center font-medium opacity-40 group-hover:opacity-100 transition-opacity">{row[6] || 0}</TableCell>
                      <TableCell className="text-center font-medium opacity-40 group-hover:opacity-100 transition-opacity">{row[7] || 0}</TableCell>
                      <TableCell className="text-center font-medium opacity-40 group-hover:opacity-100 transition-opacity">{row[8] || 0}</TableCell>
                      <TableCell className="text-right font-black pr-8">
                        <span className="px-4 py-2 bg-primary/5 text-primary rounded-xl border border-primary/10">
                          {row[9]}
                        </span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-muted-foreground font-bold italic">
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
          <Card className="border-border/50 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">EPC Installer Ranking</CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">Top performing installers based on profile interactions</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-secondary/5">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[250px] font-black uppercase tracking-widest text-[10px] pl-8">Company Name</TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]">Views</TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]">Portf.</TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]">InMail</TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]"><Facebook className="w-4 h-4 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]"><Twitter className="w-4 h-4 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]"><Linkedin className="w-4 h-4 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]"><Instagram className="w-4 h-4 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-center font-black uppercase tracking-widest text-[10px]"><MessageSquare className="w-4 h-4 mx-auto opacity-40" /></TableHead>
                    <TableHead className="text-right font-black uppercase tracking-widest text-[10px] pr-8">Total Eng.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {epcTable && epcTable.length > 0 ? epcTable.map((row: any, i: number) => (
                    <TableRow key={i} className="group hover:bg-accent/[0.02] border-border/50 transition-colors">
                      <TableCell className="font-black text-base pl-8 py-6">{row[0]}</TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">{row[1]}</TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">{row[2]}</TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">{row[3]}</TableCell>
                      <TableCell className="text-center font-medium opacity-40 group-hover:opacity-100 transition-opacity">{row[4] || 0}</TableCell>
                      <TableCell className="text-center font-medium opacity-40 group-hover:opacity-100 transition-opacity">{row[5] || 0}</TableCell>
                      <TableCell className="text-center font-medium opacity-40 group-hover:opacity-100 transition-opacity">{row[6] || 0}</TableCell>
                      <TableCell className="text-center font-medium opacity-40 group-hover:opacity-100 transition-opacity">{row[7] || 0}</TableCell>
                      <TableCell className="text-center font-medium opacity-40 group-hover:opacity-100 transition-opacity">{row[8] || 0}</TableCell>
                      <TableCell className="text-right font-black pr-8">
                        <span className="px-4 py-2 bg-accent/5 text-accent-foreground rounded-xl border border-accent/10">
                          {row[9]}
                        </span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-muted-foreground font-bold italic">
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
