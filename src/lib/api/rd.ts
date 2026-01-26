"use server";

const RD_API_KEY = process.env.REAL_DEBRID_API_KEY;
const BASE_URL = "https://api.real-debrid.com/rest/1.0";

if (!RD_API_KEY) {
    console.error("REAL_DEBRID_API_KEY is missing from environment variables.");
}

async function fetchRD(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        Authorization: `Bearer ${RD_API_KEY}`,
        ...options.headers,
    };

    try {
        const res = await fetch(url, { ...options, headers });
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`RD Error [${res.status}]: ${errorText}`);
            throw new Error(`Real-Debrid API Error: ${res.statusText}`);
        }
        // Handle empty responses (like DELETE)
        if (res.status === 204) return null;
        return await res.json();
    } catch (error) {
        console.error("Fetch RD operations failed:", error);
        return null;
    }
}

export async function getUserInfo() {
    return fetchRD("/user");
}

export async function getTorrents(limit = 50, page = 1) {
    return fetchRD(`/torrents?limit=${limit}&page=${page}`);
}

export async function getTorrent(id: string) {
    return fetchRD(`/torrents/info/${id}`);
}

export async function unrestrictLink(link: string) {
    const formData = new URLSearchParams();
    formData.append("link", link);

    return fetchRD("/unrestrict/link", {
        method: "POST",
        body: formData,
    });
}

// Helper to filter for "watchable" video files
export async function getCloudMedia() {
    const torrents = await getTorrents(100);
    if (!torrents) return [];

    // Valid video extensions
    const validExt = ['.mkv', '.mp4', '.avi', '.mov'];

    // For simplicity in this iteration, we just return the list.
    // In a real premium app, we would:
    // 1. Fetch details for each torrent to get internal files
    // 2. Or just use the main filename if it's a single file

    return torrents.filter((t: any) => t.status === 'downloaded').map((t: any) => ({
        id: t.id,
        filename: t.filename,
        bytes: t.bytes,
        links: t.links,
        host: t.host
    }));
}

// --- INSTANT AVAILABILITY & MAGNETS ---

export async function checkInstantAvailability(hashes: string[]) {
    if (!hashes.length) return {};
    const chunk = hashes.slice(0, 10);
    const path = `/${chunk.join('/')}`;
    return fetchRD(`/torrents/instantAvailability${path}`);
}

export async function addMagnet(magnet: string) {
    if (!process.env.REAL_DEBRID_API_KEY) return null;

    const data = new URLSearchParams();
    data.append('magnet', magnet);

    try {
        const res = await fetch(`${BASE_URL}/torrents/addMagnet`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${process.env.REAL_DEBRID_API_KEY}`
            },
            body: data
        });

        if (!res.ok) {
            console.error("RD Add Magnet Error:", await res.text());
            return null;
        }

        return await res.json();
    } catch (e) {
        console.error("RD Add Magnet Exception:", e);
        return null;
    }
}
