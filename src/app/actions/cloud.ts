"use server";

import { getTorrents, getTorrent } from "@/lib/api/rd";

export async function findInCloud(query: string) {
    if (!query) return [];

    try {
        // Deep Fetch Strategy: Check first 5 pages (500 items)
        const limits = [1, 2, 3, 4, 5];
        const responses = await Promise.all(
            limits.map(page => getTorrents(100, page))
        );

        // Flatten results and filter out nulls/errors
        const allTorrents = responses.flatMap(r => Array.isArray(r) ? r : []);

        if (allTorrents.length === 0) return [];

        const lowerQuery = query.toLowerCase();

        // 1. Try Exact Match First (Fastest)
        // Tokenize Query: "Silo S01E01" -> ["silo", "s01e01"]
        const queryTokens = lowerQuery.split(/[\s\.]+/)
            .filter(t => t.length > 0);

        const exactMatches = allTorrents.filter((t: any) => {
            if (t.status !== 'downloaded') return false;
            const filename = t.filename.toLowerCase();
            return queryTokens.every(token => filename.includes(token));
        });

        if (exactMatches.length > 0) {
            return exactMatches.map((t: any) => ({
                id: t.id,
                filename: t.filename, // Torrent name
                targetFilename: t.filename, // For single files, target matches torrent name roughly
                original_bytes: t.original_bytes
            }));
        }

        // 2. Deep Search for Season Packs (Slower but necessary)
        // Detect if query is for an episode: "S01E01"
        const episodeMatch = lowerQuery.match(/(s\d+)(e\d+)/i);
        if (episodeMatch) {
            const [fullSeasonEpisode, seasonStr, episodeStr] = episodeMatch;
            // Remove the episode part from tokens to find the Season Pack
            // e.g. ["silo", "s01e01"] -> ["silo", "s01"] (roughly)

            // Safer: Match torrents that contain the SHOW NAME and the SEASON
            // Query: "Silo S01E01" -> Show: "Silo", Season: "S01"
            const showNameTokens = queryTokens.filter(t => !t.includes(seasonStr) && !t.includes(episodeStr));

            // Candidates must have: Show Name AND Season (S01) but NOT necessarily Episode (E01)
            const candidates = allTorrents.filter((t: any) => {
                if (t.status !== 'downloaded') return false;
                const filename = t.filename.toLowerCase();

                const hasShowName = showNameTokens.every(token => filename.includes(token));
                const hasSeason = filename.includes(seasonStr);

                return hasShowName && hasSeason;
            });

            console.log(`[CloudSearch] Checking ${candidates.length} season pack candidates for ${fullSeasonEpisode}...`);

            // Check files inside candidates
            // Limit to first 5 candidates to avoid excessive API calls
            for (const candidate of candidates.slice(0, 5)) {
                try {
                    const details = await getTorrent(candidate.id);
                    if (!details || !details.files) continue;

                    // Look for the episode file
                    const episodeFile = details.files.find((f: any) =>
                        f.path.toLowerCase().includes(fullSeasonEpisode) ||
                        f.path.toLowerCase().includes(`${seasonStr}${episodeStr}`)
                    );

                    if (episodeFile) {
                        console.log(`[CloudSearch] Found episode in pack: ${candidate.filename}`);
                        return [{
                            id: candidate.id,
                            filename: candidate.filename, // Pack Name
                            targetFilename: episodeFile.path.split('/').pop(), // Specific File Name
                            original_bytes: candidate.original_bytes
                        }];
                    }
                } catch (e) {
                    console.error(`[CloudSearch] Failed to check candidate ${candidate.id}`, e);
                }
            }
        }

        return [];

    } catch (error) {
        console.error("Cloud Search Error:", error);
        return [];
    }
}
