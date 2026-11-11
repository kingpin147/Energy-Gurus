export async function getPostHogTrends(eventName: string, properties?: Record<string, any>) {
  const project_id = process.env.NEXT_POSTHOG_PROJECT_ID?.trim(); 
  const personal_api_key = process.env.POSTHOG_API_KEY?.trim();
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').trim();

  if (!personal_api_key) {
    console.error('POSTHOG_API_KEY is missing');
    return null;
  }

  if (!project_id) {
    console.error('NEXT_POSTHOG_PROJECT_ID is missing');
    return null;
  }

  // Using the modern PostHog Query API
  const apiUrl = `${host.replace('.i.', '.')}/api/projects/${project_id}/query/`;
  
  const queryPayload = {
    "query": {
      "kind": "TrendsQuery",
      "series": [
        {
          "kind": "EventsNode",
          "event": eventName,
          "math": "total"
        }
      ],
      "interval": "day",
      "dateRange": {
        "date_from": "-90d"
      }
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${personal_api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryPayload),
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PostHog API error:', errorText);
      return null;
    }

    const data = await response.json();
    
    // Normalize count across series
    const totalCount = data.results?.[0]?.data?.reduce((acc: number, val: number) => acc + val, 0) || 0;
    
    return { result: [{ count: totalCount }] };
  } catch (error) {
    console.error('Failed to fetch PostHog trends:', error);
    return null;
  }
}

export async function getPostHogTable(type: 'brand' | 'epc', sort: string = 'engagement') {
  const project_id = process.env.NEXT_POSTHOG_PROJECT_ID?.trim();
  const personal_api_key = process.env.POSTHOG_API_KEY?.trim();
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').trim();

  if (!personal_api_key || !project_id) return null;

  // 1. Get the list of ACTIVE names from our database to filter PostHog results
  const activeEntities = await (async () => {
    try {
      const { db } = await import("@/db");
      const { brands, epcInstallers, users } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      if (type === 'brand') {
        const results = await db.select({ name: brands.brandName })
          .from(brands)
          .innerJoin(users, eq(users.id, brands.userId))
          .where(eq(users.isActive, true));
        return new Set(results.map(r => r.name));
      } else {
        const results = await db.select({ name: epcInstallers.companyName })
          .from(epcInstallers)
          .innerJoin(users, eq(users.id, epcInstallers.userId))
          .where(eq(users.isActive, true));
        return new Set(results.map(r => r.name));
      }
    } catch (e) {
      console.error("Database fetch failed in PostHog query:", e);
      return null;
    }
  })();

  const nameProperty = type === 'brand' ? 'brandName' : 'companyName';
  const eventPrefix = type === 'brand' ? 'brand_' : 'epc_';
  
  // Dynamic sorting logic
  const orderBy = sort === 'name' ? 'name ASC' : 
                  sort === 'engagement-low' ? 'total ASC' : 
                  'total DESC';
  
  // HogQL Query to aggregate all interactions into a table format
  const hogQL = `
    SELECT 
      properties.${nameProperty} as name,
      countIf(event = '${eventPrefix}portfolio_view' OR event = '${eventPrefix}profile_view') as views,
      countIf(event = '${eventPrefix}website_click') as website,
      countIf(event = '${eventPrefix}contact_click') as contacts,
      countIf(event = '${eventPrefix}social_click' AND properties.platform = 'Facebook') as facebook,
      countIf(event = '${eventPrefix}social_click' AND properties.platform = 'Twitter') as twitter,
      countIf(event = '${eventPrefix}social_click' AND properties.platform = 'LinkedIn') as linkedin,
      countIf(event = '${eventPrefix}social_click' AND properties.platform = 'Instagram') as instagram,
      countIf(event = '${eventPrefix}social_click' AND properties.platform = 'WhatsApp') as whatsapp,
      count() as total
    FROM events
    WHERE event LIKE '${eventPrefix}%'
      AND properties.${nameProperty} IS NOT NULL
      AND timestamp > now() - INTERVAL 90 DAY
    GROUP BY name
    ORDER BY ${orderBy}
    LIMIT 100
  `;

  const apiUrl = `${host.replace('.i.', '.')}/api/projects/${project_id}/query/`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${personal_api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "query": {
          "kind": "HogQLQuery",
          "query": hogQL
        }
      }),
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      console.error('PostHog Table Error:', await response.text());
      if (activeEntities && activeEntities.size > 0) {
        return Array.from(activeEntities).slice(0, 20).map(name => [name, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      }
      return null;
    }

    const data = await response.json();
    const results = data.results || [];

    // Case-insensitive active entity lookup
    const activeEntitiesLower = activeEntities
      ? new Set(Array.from(activeEntities).map(n => n.toLowerCase().trim()))
      : null;

    // 2. Filter results based on active status in our DB
    const filteredResults = results.filter((row: any) => {
      if (!activeEntitiesLower) return true;
      const rowName = String(row[0] || '').toLowerCase().trim();
      return activeEntitiesLower.has(rowName);
    });

    // 3. Fallback to active registered entities if no telemetry rows exist yet
    if (filteredResults.length === 0 && activeEntities && activeEntities.size > 0) {
      return Array.from(activeEntities).slice(0, 20).map(name => [name, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    return (filteredResults.length > 0 ? filteredResults : results).slice(0, 20);
  } catch (error) {
    console.error('Failed to fetch PostHog table:', error);
    if (activeEntities && activeEntities.size > 0) {
      return Array.from(activeEntities).slice(0, 20).map(name => [name, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    return null;
  }
}
