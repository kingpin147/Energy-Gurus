export async function getPostHogTrends(eventName: string, properties?: Record<string, any>) {
  const project_id = process.env.NEXT_POSTHOG_PROJECT_ID; 
  const personal_api_key = process.env.POSTHOG_API_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

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
        "date_from": "-30d"
      }
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${personal_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PostHog API error:', errorText);
      return null;
    }

    const data = await response.json();
    
    // The response structure for TrendsQuery is different
    // We normalize it to return a simple count
    const totalCount = data.results?.[0]?.data?.reduce((acc: number, val: number) => acc + val, 0) || 0;
    
    return { result: [{ count: totalCount }] };
  } catch (error) {
    console.error('Failed to fetch PostHog trends:', error);
    return null;
  }
}

export async function getPostHogTable(type: 'brand' | 'epc', sort: string = 'engagement') {
  const project_id = process.env.NEXT_POSTHOG_PROJECT_ID;
  const personal_api_key = process.env.POSTHOG_API_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!personal_api_key || !project_id) return null;

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
      AND timestamp > now() - INTERVAL 30 DAY
    GROUP BY name
    ORDER BY ${orderBy}
    LIMIT 20
  `;

  const apiUrl = `${host.replace('.i.', '.')}/api/projects/${project_id}/query/`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${personal_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "query": {
          "kind": "HogQLQuery",
          "query": hogQL
        }
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error('PostHog Table Error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.results; // Returns array of [name, views, website, contacts, facebook, twitter, linkedin, instagram, whatsapp, total]
  } catch (error) {
    console.error('Failed to fetch PostHog table:', error);
    return null;
  }
}
