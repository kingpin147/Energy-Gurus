/**
 * PodBean API Types and Service
 */

export interface PodBeanEpisode {
    id: string;
    title: string;
    content: string;
    media_url: string;
    permalink: string;
    publish_time: string;
    duration: number;
    logo?: string;
}

// Mock data until real API keys are provided
const MOCK_EPISODES: PodBeanEpisode[] = [
    {
        id: "e1",
        title: "Building Pakistan's Solar Future",
        content: "In this episode, we talk with leading policy experts about the current state of net-metering and what it means for consumers in 2026.",
        media_url: "https://mcdn.podbean.com/mf/web/mock-audio.mp3",
        permalink: "https://www.podbean.com/media/share/mock-1",
        publish_time: "2026-03-01T10:00:00Z",
        duration: 2700,
        logo: "/podcast-hero.jpg"
    },
    {
        id: "e2",
        title: "The Role of Storage in Grid Stability",
        content: "Exploring how lithium-ion and chemical storage solutions are transforming the reliability of Pakistan's industrial power grid.",
        media_url: "https://mcdn.podbean.com/mf/web/mock-audio-2.mp3",
        permalink: "https://www.podbean.com/media/share/mock-2",
        publish_time: "2026-02-22T10:00:00Z",
        duration: 3150
    }
];

const PODBEAN_CLIENT_ID = process.env.POD_BEAN_CLIENT_ID;
const PODBEAN_CLIENT_SECRET = process.env.POD_BEAN_CLIENT_SECRET;

async function getAccessToken() {
    if (!PODBEAN_CLIENT_ID || !PODBEAN_CLIENT_SECRET) {
        console.warn("PodBean API keys missing. Using mock data.");
        return null;
    }

    try {
        const auth = Buffer.from(`${PODBEAN_CLIENT_ID}:${PODBEAN_CLIENT_SECRET}`).toString('base64');
        const response = await fetch('https://api.podbean.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error fetching PodBean access token:", error);
        return null;
    }
}

export async function getEpisodes(): Promise<PodBeanEpisode[]> {
    const token = await getAccessToken();

    if (!token) {
        // Fallback to mock data for demonstration
        return MOCK_EPISODES;
    }

    try {
        const response = await fetch(`https://api.podbean.com/v1/episodes?access_token=${token}`);
        const data = await response.json();

        // Map PodBean API response to our interface
        return data.episodes.map((ep: any) => ({
            id: ep.id,
            title: ep.title,
            content: ep.content,
            media_url: ep.media_url,
            permalink: ep.permalink,
            publish_time: new Date(ep.publish_time * 1000).toISOString(),
            duration: ep.duration,
            logo: ep.logo
        }));
    } catch (error) {
        console.error("Error fetching PodBean episodes:", error);
        return MOCK_EPISODES;
    }
}

export async function getEpisodeById(id: string): Promise<PodBeanEpisode | undefined> {
    const episodes = await getEpisodes();
    return episodes.find(e => e.id === id || e.id === String(id));
}
