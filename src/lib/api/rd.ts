"use server";

import { getDebridClient } from "../debrid/client";

// --- WRAPPER FOR BACKWARD COMPATIBILITY ---
// This file ensures all existing imports in scraper.ts and page components 
// automatically switch to the new Multi-Provider Adapter system.

export async function getUserInfo() {
    const client = await getDebridClient();
    return client.getUserInfo();
}

export async function getTorrents(limit = 50, page = 1) {
    const client = await getDebridClient();
    return client.getTorrents(limit, page);
}

export async function getTorrent(id: string) {
    const client = await getDebridClient();
    return client.getTorrentInfo(id);
}

export async function unrestrictLink(link: string) {
    const client = await getDebridClient();
    return client.unrestrictLink(link);
}

export async function addMagnet(magnet: string) {
    const client = await getDebridClient();
    return client.addMagnet(magnet);
}

// --- CLOUD MEDIA HELPER ---
// Originally in rd.ts, ported to use the new client
export async function getCloudMedia() {
    try {
        const client = await getDebridClient();
        const torrents = await client.getTorrents(100);

        if (!torrents) return [];

        const validExt = ['.mkv', '.mp4', '.avi', '.mov'];

        return torrents.filter((t: any) => t.status === 'downloaded').map((t: any) => ({
            id: t.id,
            filename: t.filename,
            bytes: t.bytes,
            links: t.links,
            host: t.host
        }));
    } catch (e) {
        console.error("Failed to fetch cloud media:", e);
        return [];
    }
}

// --- INSTANT AVAILABILITY ---
// NOTE: This usually requires a provider-specific call not yet in the generic interface.
// For now, we will assume Real-Debrid logic or extend the interface later.
// Since checkInstantAvailability was specific to RD in the original file, 
// we can keep a direct fetch here if needed, OR add to interface.
// For now, we'll keep the direct simplified implementation but use the key from the client if possible?
// Actually simpler: Just grab the key from cookie here too for this specific function 
// since it's not in the generic interface yet.
import { cookies } from "next/headers";
const BASE_URL = "https://api.real-debrid.com/rest/1.0";

export async function checkInstantAvailability(hashes: string[]) {
    if (!hashes.length) return {};

    // Fallback logic for this specific RD-only function
    const cookieStore = await cookies();
    const apiKey = cookieStore.get("rd_api_key")?.value || process.env.REAL_DEBRID_API_KEY;

    if (!apiKey) return {};

    const chunk = hashes.slice(0, 10);
    const path = `/${chunk.join('/')}`;

    try {
        const res = await fetch(`${BASE_URL}/torrents/instantAvailability${path}`, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
        return await res.json();
    } catch {
        return {};
    }
}
