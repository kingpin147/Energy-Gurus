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

    // Parallel GA4 queries
    const [overviewReport, pagesReport, countriesReport, citiesReport, sourcesReport, trendsReport] =
      await Promise.all([
        // 1. Overview (Last 30 days)
        client.runReport({
          property: formattedProperty,
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          metrics: [
            { name: "activeUsers" },
            { name: "totalUsers" },
            { name: "screenPageViews" },
            { name: "sessions" },
            { name: "averageSessionDuration" },
          ],
        }),

        // 2. Top Pages (Last 30 days)
        client.runReport({
          property: formattedProperty,
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
          metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 10,
        }),

        // 3. Top Countries
        client.runReport({
          property: formattedProperty,
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "country" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 8,
        }),

        // 4. Top Cities
        client.runReport({
          property: formattedProperty,
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "city" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 8,
        }),

        // 5. Traffic Sources
        client.runReport({
          property: formattedProperty,
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "sessionSource" }],
          metrics: [{ name: "activeUsers" }, { name: "sessions" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 6,
        }),

        // 6. Daily Trends (Last 30 days)
        client.runReport({
          property: formattedProperty,
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
          orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
        }),
      ]);

    // Parse Overview
    const overviewRow = overviewReport[0]?.rows?.[0];
    const overview: GAOverview = {
      activeUsers: Number(overviewRow?.metricValues?.[0]?.value || 0),
      totalUsers: Number(overviewRow?.metricValues?.[1]?.value || 0),
      screenPageViews: Number(overviewRow?.metricValues?.[2]?.value || 0),
      sessions: Number(overviewRow?.metricValues?.[3]?.value || 0),
      averageSessionDuration: Math.round(Number(overviewRow?.metricValues?.[4]?.value || 0)),
    };

    // Parse Top Pages
    const topPages: GAPageStat[] = (pagesReport[0]?.rows || []).map((row) => ({
      pagePath: row.dimensionValues?.[0]?.value || "/",
      pageTitle: row.dimensionValues?.[1]?.value || "Untitled",
      views: Number(row.metricValues?.[0]?.value || 0),
      activeUsers: Number(row.metricValues?.[1]?.value || 0),
    }));

    // Parse Countries
    const topCountries: GALocationStat[] = (countriesReport[0]?.rows || [])
      .map((row) => ({
        name: row.dimensionValues?.[0]?.value || "Unknown",
        users: Number(row.metricValues?.[0]?.value || 0),
        views: Number(row.metricValues?.[1]?.value || 0),
      }))
      .filter((c) => c.name !== "(not set)");

    // Parse Cities
    const topCities: GALocationStat[] = (citiesReport[0]?.rows || [])
      .map((row) => ({
        name: row.dimensionValues?.[0]?.value || "Unknown",
        users: Number(row.metricValues?.[0]?.value || 0),
        views: Number(row.metricValues?.[1]?.value || 0),
      }))
      .filter((c) => c.name !== "(not set)");

    // Parse Sources
    const trafficSources: GASourceStat[] = (sourcesReport[0]?.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "direct",
      users: Number(row.metricValues?.[0]?.value || 0),
      sessions: Number(row.metricValues?.[1]?.value || 0),
    }));

    // Parse Daily Trends
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

    return {
      isConfigured: true,
      propertyId,
      overview,
      topPages,
      topCountries,
      topCities,
      trafficSources,
      dailyTrends,
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

