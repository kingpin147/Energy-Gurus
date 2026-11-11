import { BetaAnalyticsDataClient } from "@google-analytics/data";

export interface GAOverview {
  activeUsers: number;
  totalUsers: number;
  screenPageViews: number;
  sessions: number;
  averageSessionDuration: number; // in seconds
}

export interface GAPageStat {
  pagePath: string;
  pageTitle: string;
  views: number;
  activeUsers: number;
}

export interface GALocationStat {
  name: string;
  users: number;
  views: number;
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

    // Parallel GA4 queries across all 3 ranges
    const [overviewReport, pagesReport, countriesReport, citiesReport, sourcesReport, trendsReport] =
      await Promise.all([
        // 1. Overview for 7d, 14d, 30d
        client.runReport({
          property: formattedProperty,
          dateRanges,
          metrics: [
            { name: "activeUsers" },
            { name: "totalUsers" },
            { name: "screenPageViews" },
            { name: "sessions" },
            { name: "averageSessionDuration" },
          ],
        }),

        // 2. Top Pages for 7d, 14d, 30d
        client.runReport({
          property: formattedProperty,
          dateRanges,
          dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
          metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 60,
        }),

        // 3. Top Countries for 7d, 14d, 30d
        client.runReport({
          property: formattedProperty,
          dateRanges,
          dimensions: [{ name: "country" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 30,
        }),

        // 4. Top Cities for 7d, 14d, 30d
        client.runReport({
          property: formattedProperty,
          dateRanges,
          dimensions: [{ name: "city" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 30,
        }),

        // 5. Traffic Sources for 7d, 14d, 30d
        client.runReport({
          property: formattedProperty,
          dateRanges,
          dimensions: [{ name: "sessionSource" }],
          metrics: [{ name: "activeUsers" }, { name: "sessions" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 30,
        }),

        // 6. Daily Trends (Last 30 days daily series for line chart)
        client.runReport({
          property: formattedProperty,
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
          orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
        }),
      ]);

    // Initialize per-range bundles
    const ranges: {
      "7d": GARangeBundle;
      "14d": GARangeBundle;
      "30d": GARangeBundle;
    } = {
      "7d": {
        overview: { activeUsers: 0, totalUsers: 0, screenPageViews: 0, sessions: 0, averageSessionDuration: 0 },
        topPages: [],
        topCountries: [],
        topCities: [],
        trafficSources: [],
      },
      "14d": {
        overview: { activeUsers: 0, totalUsers: 0, screenPageViews: 0, sessions: 0, averageSessionDuration: 0 },
        topPages: [],
        topCountries: [],
        topCities: [],
        trafficSources: [],
      },
      "30d": {
        overview: { activeUsers: 0, totalUsers: 0, screenPageViews: 0, sessions: 0, averageSessionDuration: 0 },
        topPages: [],
        topCountries: [],
        topCities: [],
        trafficSources: [],
      },
    };

    // Parse Overview by dateRange
    overviewReport[0]?.rows?.forEach((row) => {
      const range = (row.dimensionValues?.[0]?.value as "7d" | "14d" | "30d") || "30d";
      if (ranges[range]) {
        ranges[range].overview = {
          activeUsers: Number(row.metricValues?.[0]?.value || 0),
          totalUsers: Number(row.metricValues?.[1]?.value || 0),
          screenPageViews: Number(row.metricValues?.[2]?.value || 0),
          sessions: Number(row.metricValues?.[3]?.value || 0),
          averageSessionDuration: Math.round(Number(row.metricValues?.[4]?.value || 0)),
        };
      }
    });

    // Parse Top Pages by dateRange
    pagesReport[0]?.rows?.forEach((row) => {
      const dimCount = row.dimensionValues?.length || 0;
      const range = (row.dimensionValues?.[dimCount - 1]?.value as "7d" | "14d" | "30d") || "30d";
      if (ranges[range] && ranges[range].topPages.length < 10) {
        ranges[range].topPages.push({
          pagePath: row.dimensionValues?.[0]?.value || "/",
          pageTitle: row.dimensionValues?.[1]?.value || "Untitled",
          views: Number(row.metricValues?.[0]?.value || 0),
          activeUsers: Number(row.metricValues?.[1]?.value || 0),
        });
      }
    });

    // Parse Countries by dateRange
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

    // Parse Cities by dateRange
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

    // Parse Sources by dateRange
    sourcesReport[0]?.rows?.forEach((row) => {
      const dimCount = row.dimensionValues?.length || 0;
      const range = (row.dimensionValues?.[dimCount - 1]?.value as "7d" | "14d" | "30d") || "30d";
      if (ranges[range] && ranges[range].trafficSources.length < 6) {
        ranges[range].trafficSources.push({
          source: row.dimensionValues?.[0]?.value || "direct",
          users: Number(row.metricValues?.[0]?.value || 0),
          sessions: Number(row.metricValues?.[1]?.value || 0),
        });
      }
    });

    // Parse Daily Trends (All 30 days)
    const dailyTrends: GADailyTrend[] = (trendsReport[0]?.rows || []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value || ""; // YYYYMMDD
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

    // Default top-level fields to 30d for backwards compatibility
    const defaultBundle = ranges["30d"];

    return {
      isConfigured: true,
      propertyId,
      overview: defaultBundle.overview,
      topPages: defaultBundle.topPages,
      topCountries: defaultBundle.topCountries,
      topCities: defaultBundle.topCities,
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
