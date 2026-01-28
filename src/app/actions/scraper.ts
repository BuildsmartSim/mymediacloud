"use server";

import { searchTorrents, ParsedTorrent } from "@/lib/api/torrent";
import { addMagnet, getTorrent, unrestrictLink } from "@/lib/api/rd";

export interface StreamOption {
    title: string;
    quality: string;
    size: string;
    seeds: number;
    magnet: string;
    hash: string;
    source: string;
    year: number | null;
    score: number;
    tags: string[];
}

export async function getStreamOptions(query: string, year?: number): Promise<StreamOption[]> {
    if (!query) return [];

    console.log("[Scraper] Searching for:", query, year ? `(${year})` : '');

    // Search with year for better filtering
    const torrents = await searchTorrents(query, year);
    console.log("[Scraper] Found", torrents.length, "relevant torrents");

    if (!torrents.length) return [];

    // Map to StreamOptions
    const options: StreamOption[] = torrents.map(t => {
        const magnet = `magnet:?xt=urn:btih:${t.hash}&dn=${encodeURIComponent(t.originalName)}`;

        return {
            title: t.originalName,
            quality: t.quality,
            size: t.size,
            seeds: t.seeds,
            magnet,
            hash: t.hash,
            source: t.source,
            year: t.parsedYear,
            score: t.relevanceScore,
            tags: t.tags
        };
    });

    // Already sorted by relevance in torrent.ts
    return options;
}

// Try to add and resolve a single magnet
async function tryResolve(magnet: string, targetFilename?: string): Promise<{
    success: boolean;
    url?: string;
    error?: string;
    status?: string;
    torrentId?: string
}> {
    try {
        const addResult = await addMagnet(magnet);
        if (!addResult || !addResult.id) {
            return { success: false, error: "Failed to add magnet" };
        }

        const torrentId = addResult.id;
        console.log("[Scraper] Added torrent:", torrentId);

        // Select files
        await selectFiles(torrentId);

        // Check status
        const info = await getTorrent(torrentId);
        const status = info?.status || 'unknown';
        console.log("[Scraper] Status:", status);

        if (status === 'downloaded' && info?.links?.length > 0) {
            let targetLink = info.links[0];

            // Logic to select specific file if targetFilename provided
            if (targetFilename && info.files) {
                const selectedFiles = info.files.filter((f: any) => f.selected === 1);
                const fileIndex = selectedFiles.findIndex((f: any) =>
                    f.path.toLowerCase().endsWith(targetFilename.toLowerCase()) ||
                    f.path.toLowerCase().includes(targetFilename.toLowerCase())
                );

                if (fileIndex !== -1 && info.links[fileIndex]) {
                    targetLink = info.links[fileIndex];
                    console.log(`[Scraper] Matched file at index ${fileIndex}: ${targetLink}`);
                }
            }

            const unrestricted = await unrestrictLink(targetLink);
            if (unrestricted?.download) {
                return { success: true, url: unrestricted.download, status, torrentId };
            }
        }

        return { success: false, status, torrentId, error: `Status: ${status}` };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Main function: Try multiple torrents until one works
export async function addAndResolveStream(
    magnet: string,
    allOptions?: StreamOption[],
    targetFilename?: string
): Promise<{
    success: boolean;
    url?: string;
    error?: string;
    torrentId?: string;
    status?: string;
    triedCount?: number;
}> {
    console.log("[Scraper] Attempting to resolve stream...", targetFilename ? `Target: ${targetFilename}` : '');

    // First, try the selected magnet
    const result = await tryResolve(magnet, targetFilename);

    if (result.success) {
        console.log("[Scraper] ✓ Got stream URL on first try!");
        return result;
    }

    // If failed and we have alternatives, try them (sorted by relevance score)
    if (allOptions && allOptions.length > 1) {
        console.log("[Scraper] First torrent not cached, trying alternatives...");

        // Try up to 4 more alternatives
        for (let i = 1; i < Math.min(5, allOptions.length); i++) {
            const alt = allOptions[i];
            console.log(`[Scraper] Trying #${i + 1}:`, alt.quality, alt.source, `(score: ${alt.score})`);

            const altResult = await tryResolve(alt.magnet, targetFilename);
            if (altResult.success) {
                console.log("[Scraper] ✓ Found cached alternative!");
                return { ...altResult, triedCount: i + 1 };
            }
        }
    }

    return {
        success: false,
        error: result.status === 'downloading' || result.status === 'queued'
            ? "Not cached on Real-Debrid. Try later or pick a different quality."
            : result.error || "No cached source found",
        status: result.status,
        torrentId: result.torrentId,
        triedCount: allOptions ? Math.min(5, allOptions.length) : 1
    };
}

async function selectFiles(torrentId: string): Promise<boolean> {
    try {
        const res = await fetch(`https://api.real-debrid.com/rest/1.0/torrents/selectFiles/${torrentId}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${process.env.REAL_DEBRID_API_KEY}`
            },
            body: new URLSearchParams({ files: 'all' })
        });
        return res.ok || res.status === 204;
    } catch {
        return false;
    }
}
