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
    filename?: string;
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

        if (status === 'downloaded' && info?.links && info.links.length > 0) {
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
                // Find filename from info.files if possible, or unrestricted info
                const filename = info.files?.find((f: any) => f.id === targetLink.split('/').pop())?.path || unrestricted.filename || "video.mp4";
                return { success: true, url: unrestricted.download, filename, status, torrentId };
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
    targetFilename?: string,
    mode: 'embedded' | 'external' = 'external'
): Promise<{
    success: boolean;
    url?: string;
    filename?: string;
    error?: string;
    torrentId?: string;
    status?: string;
    triedCount?: number;
}> {
    console.log(`[Scraper] Attempting to resolve stream (Mode: ${mode})...`, targetFilename ? `Target: ${targetFilename}` : '');

    // Helper to check compatibility
    const isCompatible = (filename?: string) => {
        if (mode === 'external') return true; // External plays everything
        if (!filename) return true; // Optimistic
        return !filename.toLowerCase().endsWith('.mkv');
    };

    // 1. Try the user-selected magnet first
    let result = await tryResolve(magnet, targetFilename);

    if (result.success) {
        if (isCompatible(result.filename)) {
            console.log("[Scraper] ✓ Got compatible stream on first try!", result.filename);
            return result;
        } else {
            console.log("[Scraper] ⚠️ First result was MKV, skipping for embedded player...");
        }
    }

    // 2. If failed OR incompatible, try alternatives
    if (allOptions && allOptions.length > 1) {
        console.log("[Scraper] Searching alternatives for better match...");

        // Try up to 10 alternatives to find a working MP4
        const limit = Math.min(10, allOptions.length);

        for (let i = 0; i < limit; i++) {
            // Skip the one we just tried (if it was the first one)
            if (allOptions[i].magnet === magnet && !result.success) continue;

            const alt = allOptions[i];

            // Optimization: If title says HEVC/x265 and we are embedded, maybe lower priority? 
            // For now, let's just resolve and check extension.

            console.log(`[Scraper] Trying #${i + 1}:`, alt.quality, alt.source);

            const altResult = await tryResolve(alt.magnet, targetFilename);

            if (altResult.success) {
                if (isCompatible(altResult.filename)) {
                    console.log("[Scraper] ✓ Found compatible alternative!", altResult.filename);
                    return { ...altResult, triedCount: i + 1 };
                } else {
                    console.log(`[Scraper] ⚠️ Alternative #${i + 1} is MKV, skipping...`);
                }
            }
        }
    }

    // If we're here, we failed to find a compatible stream
    return {
        success: false,
        error: mode === 'embedded'
            ? "No browser-compatible (MP4) streams found. Try 'External VLC'."
            : "No cached stream found.",
        status: result.status,
        torrentId: result.torrentId,
        triedCount: allOptions ? Math.min(10, allOptions.length) : 1
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
