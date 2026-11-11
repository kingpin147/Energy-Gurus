import { BetaAnalyticsDataClient } from "@google-analytics/data";

export interface GAOverview {
  activeUsers: number;
  totalUsers: number;
  screenPageViews: number;
  sessions: number;
  averageSessionDuration: number; // in seconds
  engagementRate: number; // percentage (0 - 100)
  bounceRate: number; // percentage (0 - 100)
}

export interface GAPageStat {
  pagePath: string;
  pageTitle: string;
  views: number;
  activeUsers: number;
  engagementRate: number; // percentage (0 - 100)
  bounceRate: number; // percentage (0 - 100)
  avgDuration: number; // average seconds per view
}

export interface GALocationStat {
  name: string;
  users: number;
  views: number;
}

export interface GADeviceStat {
  category: string; // desktop, mobile, tablet
  users: number;
  sessions: number;
  percentage: number;
}

export interface GAChannelStat {
  channel: string;
  users: number;
  sessions: number;
  engagementRate: number; // percentage (0 - 100)
}

export interface GAMultiChannelStat {
  key: string;
  name: string;
  category: string;
  users: number;
  sessions: number;
  views: number;
  engagementRate: number; // percentage (0 - 100)
  badgeColor: string;
  iconType: "google" | "facebook" | "tiktok" | "linkedin" | "youtube" | "direct" | "referral";
}

export interface GASourceStat {
  source: string;
  users: number;
  sessions: number;
}

export interface GADailyTrend {
  date: string;
  label: string;
  users: number;
  views: number;
}

export interface GARangeBundle {
  overview: GAOverview;
  topPages: GAPageStat[];
  topCountries: GALocationStat[];
  topCities: GALocationStat[];
  topRegions: GALocationStat[];
  devices: GADeviceStat[];
  channels: GAChannelStat[];
  multiChannelSources: GAMultiChannelStat[];
  trafficSources: GASourceStat[];
}

export interface GAResponse {
  isConfigured: boolean;
  propertyId?: string;
  error?: string;
  overview?: GAOverview;
  topPages?: GAPageStat[];
  topCountries?: GALocationStat[];
  topCities?: GALocationStat[];
  topRegions?: GALocationStat[];
  devices?: GADeviceStat[];
  channels?: GAChannelStat[];
  multiChannelSources?: GAMultiChannelStat[];
  trafficSources?: GASourceStat[];
  dailyTrends?: GADailyTrend[];
  ranges?: {
    "7d": GARangeBundle;
    "14d": GARangeBundle;
    "30d": GARangeBundle;
  };
}

function getClient() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const propertyId = process.env.GA_PROPERTY_ID;

  if (!email || !privateKey || !propertyId || propertyId.trim() === "") {
    return { client: null, propertyId: null };
  }

  const formattedKey = privateKey.replace(/\\n/g, "\n");
  const client = new BetaAnalyticsDataClient({
    fallback: "rest",
    credentials: {
      client_email: email,
      private_key: formattedKey,
    },
  });

  return { client, propertyId: propertyId.trim() };
}

const createDefaultMultiChannels = (): GAMultiChannelStat[] => [
  { key: "google", name: "Google (Search & Ads)", category: "Search Engine", users: 0, sessions: 0, views: 0, engagementRate: 0, badgeColor: "bg-amber-50 text-amber-700 border-amber-200", iconType: "google" },
  { key: "facebook", name: "Facebook & Instagram", category: "Meta Social", users: 0, sessions: 0, views: 0, engagementRate: 0, badgeColor: "bg-blue-50 text-blue-700 border-blue-200", iconType: "facebook" },
  { key: "tiktok", name: "TikTok Traffic", category: "Short Video Feed", users: 0, sessions: 0, views: 0, engagementRate: 0, badgeColor: "bg-slate-100 text-slate-800 border-slate-300", iconType: "tiktok" },
  { key: "linkedin", name: "LinkedIn Network", category: "B2B Professional", users: 0, sessions: 0, views: 0, engagementRate: 0, badgeColor: "bg-sky-50 text-sky-700 border-sky-200", iconType: "linkedin" },
  { key: "youtube", name: "YouTube Traffic", category: "Video Platform", users: 0, sessions: 0, views: 0, engagementRate: 0, badgeColor: "bg-rose-50 text-rose-700 border-rose-200", iconType: "youtube" },
  { key: "direct", name: "Direct / Bookmarks", category: "Direct Visits", users: 0, sessions: 0, views: 0, engagementRate: 0, badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200", iconType: "direct" },
];

export async function fetchGoogleAnalyticsDashboardData(): Promise<GAResponse> {
  const { client, propertyId } = getClient();

  if (!client || !propertyId) {
    return {
      isConfigured: false,
      error: "GA_PROPERTY_ID is not configured in .env",
    };
  }

  try {
    const formattedProperty = propertyId.startsWith("properties/")
      ? propertyId
      : `properties/${propertyId}`;

    const dateRanges = [
      { startDate: "7daysAgo", endDate: "today", name: "7d" },
      { startDate: "14daysAgo", endDate: "today", name: "14d" },
      { startDate: "30daysAgo", endDate: "today", name: "30d" },
    ];

    // Parallel GA4 queries executed simultaneously in one go
    const [
      overviewReport,
      pagesReport,
      countriesReport,
      citiesReport,
      regionsReport,
      channelsReport,
      devicesReport,
      trendsReport,
      multiChannelReport,
    ] = await Promise.all([
      // 1. Overview metrics
      client.runReport({
        property: formattedProperty,
        dateRanges,
        metrics: [
          { name: "activeUsers" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "sessions" },
          { name: "averageSessionDuration" },
          { name: "engagementRate" },
          { name: "bounceRate" },
        ],
      }),

      // 2. Top Pages with human-readable titles, engagement, bounce, & active duration
      client.runReport({
        property: formattedProperty,
        dateRanges,
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "activeUsers" },
          { name: "engagementRate" },
          { name: "bounceRate" },
          { name: "userEngagementDuration" },
        ],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 60,
      }),

      // 3. Top Countries
      client.runReport({
        property: formattedProperty,
        dateRanges,
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 30,
      }),

      // 4. Top Cities
      client.runReport({
        property: formattedProperty,
        dateRanges,
        dimensions: [{ name: "city" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 30,
      }),

      // 5. Top Sub-Regions / Provinces (e.g., Punjab, Sindh, Federal Capital)
      client.runReport({
        property: formattedProperty,
        dateRanges,
        dimensions: [{ name: "region" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 30,
      }),

      // 6. Default Channel Group
      client.runReport({
        property: formattedProperty,
        dateRanges,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "engagementRate" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 30,
      }),

      // 7. Device Category Distribution
      client.runReport({
        property: formattedProperty,
        dateRanges,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 15,
      }),

      // 8. Daily Trends
      client.runReport({
        property: formattedProperty,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      }),

      // 9. Multi-Channel Referral Sources (Google, Facebook/Instagram, TikTok, YouTube, LinkedIn, Direct)
      client.runReport({
        property: formattedProperty,
        dateRanges,
        dimensions: [
          { name: "sessionSource" },
          { name: "sessionDefaultChannelGroup" },
        ],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "engagementRate" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 100,
      }),
    ]);

    // Initialize per-range bundles
    const ranges: {
      "7d": GARangeBundle;
      "14d": GARangeBundle;
      "30d": GARangeBundle;
    } = {
      "7d": {
        overview: {
          activeUsers: 0,
          totalUsers: 0,
          screenPageViews: 0,
          sessions: 0,
          averageSessionDuration: 0,
          engagementRate: 0,
          bounceRate: 0,
        },
        topPages: [],
        topCountries: [],
        topCities: [],
        topRegions: [],
        devices: [],
        channels: [],
        multiChannelSources: createDefaultMultiChannels(),
        trafficSources: [],
      },
      "14d": {
        overview: {
          activeUsers: 0,
          totalUsers: 0,
          screenPageViews: 0,
          sessions: 0,
          averageSessionDuration: 0,
          engagementRate: 0,
          bounceRate: 0,
        },
        topPages: [],
        topCountries: [],
        topCities: [],
        topRegions: [],
        devices: [],
        channels: [],
        multiChannelSources: createDefaultMultiChannels(),
        trafficSources: [],
      },
      "30d": {
        overview: {
          activeUsers: 0,
          totalUsers: 0,
          screenPageViews: 0,
          sessions: 0,
          averageSessionDuration: 0,
          engagementRate: 0,
          bounceRate: 0,
        },
        topPages: [],
        topCountries: [],
        topCities: [],
        topRegions: [],
        devices: [],
        channels: [],
        multiChannelSources: createDefaultMultiChannels(),
        trafficSources: [],
      },
    };

    // 1. Parse Overview by dateRange
    overviewReport[0]?.rows?.forEach((row) => {
      const range = (row.dimensionValues?.[0]?.value as "7d" | "14d" | "30d") || "30d";
      if (ranges[range]) {
        const engRate = Number(row.metricValues?.[5]?.value || 0);
        const bounce = Number(row.metricValues?.[6]?.value || 0);
        ranges[range].overview = {
          activeUsers: Number(row.metricValues?.[0]?.value || 0),
          totalUsers: Number(row.metricValues?.[1]?.value || 0),
          screenPageViews: Number(row.metricValues?.[2]?.value || 0),
          sessions: Number(row.metricValues?.[3]?.value || 0),
          averageSessionDuration: Math.round(Number(row.metricValues?.[4]?.value || 0)),
          engagementRate: Math.round(engRate * 1000) / 10,
          bounceRate: Math.round(bounce * 1000) / 10,
        };
      }
    });

    // 2. Parse Top Pages with full metrics
    pagesReport[0]?.rows?.forEach((row) => {
      const dimCount = row.dimensionValues?.length || 0;
      const range = (row.dimensionValues?.[dimCount - 1]?.value as "7d" | "14d" | "30d") || "30d";
      if (ranges[range] && ranges[range].topPages.length < 10) {
        const views = Number(row.metricValues?.[0]?.value || 0);
        const users = Number(row.metricValues?.[1]?.value || 0);
        const engRate = Number(row.metricValues?.[2]?.value || 0);
        const bounce = Number(row.metricValues?.[3]?.value || 0);
        const totalDuration = Number(row.metricValues?.[4]?.value || 0);
        const avgDuration = views > 0 ? Math.round(totalDuration / views) : 0;

        ranges[range].topPages.push({
          pagePath: row.dimensionValues?.[0]?.value || "/",
          pageTitle: row.dimensionValues?.[1]?.value || "Untitled",
          views,
          activeUsers: users,
          engagementRate: Math.round(engRate * 1000) / 10,
          bounceRate: Math.round(bounce * 1000) / 10,
          avgDuration,
        });
      }
    });

    // 3. Parse Countries
    countriesReport[0]?.rows?.forEach((row) => {
      const dimCount = row.dimensionValues?.length || 0;
      const range = (row.dimensionValues?.[dimCount - 1]?.value as "7d" | "14d" | "30d") || "30d";
      const name = row.dimensionValues?.[0]?.value || "Unknown";
      if (ranges[range] && name !== "(not set)" && ranges[range].topCountries.length < 8) {
        ranges[range].topCountries.push({
          name,
          users: Number(row.metricValues?.[0]?.value || 0),
          views: Number(row.metricValues?.[1]?.value || 0),
        });
      }
    });

    // 4. Parse Cities
    citiesReport[0]?.rows?.forEach((row) => {
      const dimCount = row.dimensionValues?.length || 0;
      const range = (row.dimensionValues?.[dimCount - 1]?.value as "7d" | "14d" | "30d") || "30d";
      const name = row.dimensionValues?.[0]?.value || "Unknown";
      if (ranges[range] && name !== "(not set)" && ranges[range].topCities.length < 8) {
        ranges[range].topCities.push({
          name,
          users: Number(row.metricValues?.[0]?.value || 0),
          views: Number(row.metricValues?.[1]?.value || 0),
        });
      }
    });

    // 5. Parse Regions / Provinces
    regionsReport[0]?.rows?.forEach((row) => {
      const dimCount = row.dimensionValues?.length || 0;
      const range = (row.dimensionValues?.[dimCount - 1]?.value as "7d" | "14d" | "30d") || "30d";
      const name = row.dimensionValues?.[0]?.value || "Unknown";
      if (ranges[range] && name !== "(not set)" && ranges[range].topRegions.length < 8) {
        ranges[range].topRegions.push({
          name,
          users: Number(row.metricValues?.[0]?.value || 0),
          views: Number(row.metricValues?.[1]?.value || 0),
        });
      }
    });

    // 6. Parse Channels
    channelsReport[0]?.rows?.forEach((row) => {
      const dimCount = row.dimensionValues?.length || 0;
      const range = (row.dimensionValues?.[dimCount - 1]?.value as "7d" | "14d" | "30d") || "30d";
      const channel = row.dimensionValues?.[0]?.value || "Direct";
      if (ranges[range] && ranges[range].channels.length < 8) {
        const sessions = Number(row.metricValues?.[0]?.value || 0);
        const users = Number(row.metricValues?.[1]?.value || 0);
        const engRate = Number(row.metricValues?.[2]?.value || 0);
        ranges[range].channels.push({
          channel,
          sessions,
          users,
          engagementRate: Math.round(engRate * 1000) / 10,
        });

        ranges[range].trafficSources.push({
          source: channel,
          sessions,
          users,
        });
      }
    });

    // 7. Parse Devices and calculate percentage share
    devicesReport[0]?.rows?.forEach((row) => {
      const dimCount = row.dimensionValues?.length || 0;
      const range = (row.dimensionValues?.[dimCount - 1]?.value as "7d" | "14d" | "30d") || "30d";
      const category = (row.dimensionValues?.[0]?.value || "desktop").toLowerCase();
      if (ranges[range]) {
        const users = Number(row.metricValues?.[0]?.value || 0);
        const sessions = Number(row.metricValues?.[1]?.value || 0);
        ranges[range].devices.push({
          category,
          users,
          sessions,
          percentage: 0,
        });
      }
    });

    // Compute device percentages per range
    (["7d", "14d", "30d"] as const).forEach((r) => {
      const totalSessions = ranges[r].devices.reduce((acc, d) => acc + d.sessions, 0) || 1;
      ranges[r].devices.forEach((d) => {
        d.percentage = Math.round((d.sessions / totalSessions) * 100);
      });
    });

    // 8. Parse Daily Trends
    const dailyTrends: GADailyTrend[] = (trendsReport[0]?.rows || []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value || "";
      let label = rawDate;
      if (rawDate.length === 8) {
        const year = rawDate.substring(0, 4);
        const month = rawDate.substring(4, 6);
        const day = rawDate.substring(6, 8);
        const d = new Date(`${year}-${month}-${day}`);
        label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return {
        date: rawDate,
        label,
        users: Number(row.metricValues?.[0]?.value || 0),
        views: Number(row.metricValues?.[1]?.value || 0),
      };
    });

    // 9. Parse Multi-Channel Traffic (Google, Facebook/Instagram, TikTok, YouTube, LinkedIn, Direct)
    multiChannelReport[0]?.rows?.forEach((row) => {
      const dimCount = row.dimensionValues?.length || 0;
      const range = (row.dimensionValues?.[dimCount - 1]?.value as "7d" | "14d" | "30d") || "30d";
      const source = (row.dimensionValues?.[0]?.value || "direct").toLowerCase();
      const users = Number(row.metricValues?.[0]?.value || 0);
      const sessions = Number(row.metricValues?.[1]?.value || 0);
      const views = Number(row.metricValues?.[2]?.value || 0);
      const engRate = Number(row.metricValues?.[3]?.value || 0);

      if (ranges[range]) {
        let targetKey: string | null = null;
        if (source.includes("google")) targetKey = "google";
        else if (source.includes("facebook") || source.includes("instagram") || source === "fb" || source === "ig") targetKey = "facebook";
        else if (source.includes("tiktok") || source.includes("byteoversea")) targetKey = "tiktok";
        else if (source.includes("linkedin") || source === "lnkd.in") targetKey = "linkedin";
        else if (source.includes("youtube") || source.includes("youtu.be")) targetKey = "youtube";
        else if (source.includes("direct") || source === "(direct)") targetKey = "direct";

        if (targetKey) {
          const item = ranges[range].multiChannelSources.find((ch) => ch.key === targetKey);
          if (item) {
            item.users += users;
            item.sessions += sessions;
            item.views += views;
            item.engagementRate = item.engagementRate === 0
              ? Math.round(engRate * 1000) / 10
              : Math.round(((item.engagementRate + engRate * 100) / 2) * 10) / 10;
          }
        }
      }
    });

    // Default top-level fields to 30d
    const defaultBundle = ranges["30d"];

    return {
      isConfigured: true,
      propertyId,
      overview: defaultBundle.overview,
      topPages: defaultBundle.topPages,
      topCountries: defaultBundle.topCountries,
      topCities: defaultBundle.topCities,
      topRegions: defaultBundle.topRegions,
      devices: defaultBundle.devices,
      channels: defaultBundle.channels,
      multiChannelSources: defaultBundle.multiChannelSources,
      trafficSources: defaultBundle.trafficSources,
      dailyTrends,
      ranges,
    };
  } catch (err: any) {
    console.error("Google Analytics Data API fetch error:", err);
    return {
      isConfigured: false,
      propertyId,
      error: err?.message || "Failed to query Google Analytics Data API",
    };
  }
}
