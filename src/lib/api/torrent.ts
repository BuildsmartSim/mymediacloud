// Enhanced Torrent API with parsing and scoring

const APIBAY_URL = "https://apibay.org";

export interface TorrentResult {
    id: string;
    name: string;
    info_hash: string;
    size: string;
    seeders: number;
    leechers: number;
    category: string;
}

export interface ParsedTorrent {
    originalName: string;
    parsedTitle: string;
    parsedYear: number | null;
    quality: '2160p' | '1080p' | '720p' | '480p' | 'Unknown';
    source: 'BluRay' | 'WEB-DL' | 'WEBRip' | 'HDRip' | 'DVDRip' | 'CAM' | 'Unknown';
    codec: 'x265' | 'x264' | 'HEVC' | 'Unknown';
    hash: string;
    size: string;
    seeds: number;
    relevanceScore: number;
    tags: string[];
}

// Parse torrent name to extract metadata
export function parseTorrentName(name: string): {
    title: string;
    year: number | null;
    quality: ParsedTorrent['quality'];
    source: ParsedTorrent['source'];
    codec: ParsedTorrent['codec'];
    tags: string[];
} {
    // Normalize separators
    const normalized = name.replace(/\./g, ' ').replace(/_/g, ' ');

    // Extract year (4 digits, usually 19xx or 20xx)
    const yearMatch = normalized.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

    // Extract quality
    let quality: ParsedTorrent['quality'] = 'Unknown';
    if (/2160p|4K|UHD/i.test(name)) quality = '2160p';
    else if (/1080p/i.test(name)) quality = '1080p';
    else if (/720p/i.test(name)) quality = '720p';
    else if (/480p/i.test(name)) quality = '480p';

    // Extract source
    let source: ParsedTorrent['source'] = 'Unknown';
    if (/BluRay|BDRip|BRRip/i.test(name)) source = 'BluRay';
    else if (/WEB-DL|WEBDL/i.test(name)) source = 'WEB-DL';
    else if (/WEBRip/i.test(name)) source = 'WEBRip';
    else if (/HDRip/i.test(name)) source = 'HDRip';
    else if (/DVDRip/i.test(name)) source = 'DVDRip';
    else if (/CAM|HDCAM|TS|TELESYNC/i.test(name)) source = 'CAM';

    // Extract codec
    let codec: ParsedTorrent['codec'] = 'Unknown';
    if (/x265|HEVC|H\.?265/i.test(name)) codec = 'x265';
    else if (/x264|H\.?264/i.test(name)) codec = 'x264';

    // Extract Tags (HDR, Atmos, etc)
    const tags: string[] = [];
    if (/HDR10\+|HDR10Plus/i.test(name)) tags.push('HDR10+');
    else if (/HDR/i.test(name)) tags.push('HDR');

    if (/DV|Dolby\s*Vision/i.test(name)) tags.push('DV');
    if (/Atmos/i.test(name)) tags.push('Atmos');
    if (/TrueHD/i.test(name)) tags.push('TrueHD');
    if (/DTS-?HD|DTS-?X/i.test(name)) tags.push('DTS-X');
    else if (/DTS/i.test(name)) tags.push('DTS');

    if (/Remux/i.test(name)) tags.push('REMUX');
    if (/IMAX/i.test(name)) tags.push('IMAX');

    // Extract title (everything before the year or quality indicators)
    let title = normalized;
    if (year) {
        title = normalized.split(String(year))[0].trim();
    } else {
        // Try to cut at quality indicator
        const qualityMatch = normalized.match(/(720p|1080p|2160p|4K)/i);
        if (qualityMatch && qualityMatch.index) {
            title = normalized.substring(0, qualityMatch.index).trim();
        }
    }

    // Clean up title
    title = title.replace(/\s+/g, ' ').trim();

    return { title, year, quality, source, codec, tags };
}

// Calculate fuzzy match score between two strings
function fuzzyMatch(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (s1 === s2) return 100;
    if (s1.includes(s2) || s2.includes(s1)) return 80;

    // Simple character overlap score
    const chars1 = new Set(s1.split(''));
    const chars2 = new Set(s2.split(''));
    const intersection = [...chars1].filter(c => chars2.has(c)).length;
    const union = new Set([...chars1, ...chars2]).size;

    return Math.round((intersection / union) * 100);
}

// Detect spam/fake torrents
function isSpamTorrent(name: string, sizeBytes: number): boolean {
    const nameLower = name.toLowerCase();

    // Spam indicators in name
    const spamKeywords = [
        'how to', 'tutorial', 'download free', 'crack', 'keygen',
        'sample', 'xxx', 'porn', 'read nfo', 'password', '.exe'
    ];

    if (spamKeywords.some(kw => nameLower.includes(kw))) {
        return true;
    }

    // Size checks - real movies are at least 300MB
    const minSize = 300 * 1024 * 1024; // 300MB minimum
    if (sizeBytes < minSize) {
        return true;
    }

    // No max size - let user decide
    return false;
}

// Calculate relevance score for a torrent
export function calculateRelevanceScore(
    parsed: ReturnType<typeof parseTorrentName>,
    expectedTitle: string,
    expectedYear: number | null,
    seeds: number
): number {
    let score = 0;

    // Title matching (most important)
    const titleScore = fuzzyMatch(parsed.title, expectedTitle);
    if (titleScore >= 90) score += 50;
    else if (titleScore >= 70) score += 30;
    else if (titleScore >= 50) score += 10;
    else score -= 50; // Poor title match is a red flag

    // Year matching (critical for avoiding wrong movies)
    if (expectedYear && parsed.year) {
        if (parsed.year === expectedYear) {
            score += 100; // Exact year match is very important
        } else if (Math.abs(parsed.year - expectedYear) === 1) {
            score += 20; // Off by one year (sometimes releases vary)
        } else if (Math.abs(parsed.year - expectedYear) <= 2) {
            score -= 50; // Suspicious
        } else {
            score -= 200; // Wrong movie entirely
        }
    }

    // Quality scoring - all qualities are fine with compressed encodes
    if (parsed.quality === '2160p') score += 40; // 4K is great
    else if (parsed.quality === '1080p') score += 35;
    else if (parsed.quality === '720p') score += 20;
    else score += 5; // Unknown quality

    // Source scoring - prefer WEB-DL and compressed BluRay encodes
    // REMUX files are TOO LARGE (40-80GB) and cause buffering
    if (parsed.source === 'WEB-DL') score += 25; // Best for streaming (compressed)
    else if (parsed.source === 'WEBRip') score += 20;
    else if (parsed.source === 'BluRay') score += 15; // Could be REMUX or encode
    else if (parsed.source === 'HDRip') score += 10;
    else if (parsed.source === 'CAM') score -= 100; // Strongly avoid CAM rips

    // Codec scoring - x265/HEVC is much smaller than x264
    if (parsed.codec === 'x265') score += 30; // Excellent compression
    else if (parsed.codec === 'x264') score += 15;

    // Seeds bonus (but not too much weight)
    if (seeds > 100) score += 10;
    else if (seeds > 50) score += 5;
    else if (seeds < 5) score -= 10;

    return score;
}

function formatSize(bytes: string): string {
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return bytes;
    const gb = num / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = num / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
}

// Normalize movie titles for better search results
function normalizeTitle(title: string): string {
    let normalized = title;

    // Remove colons and special punctuation
    normalized = normalized.replace(/[:;,!?]/g, ' ');

    // Convert common roman numerals to arabic numbers
    const romanMap: Record<string, string> = {
        ' I ': ' 1 ', ' II ': ' 2 ', ' III ': ' 3 ', ' IV ': ' 4 ',
        ' V ': ' 5 ', ' VI ': ' 6 ', ' VII ': ' 7 ', ' VIII ': ' 8 ',
        ' IX ': ' 9 ', ' X ': ' 10 ', ' XI ': ' 11 ', ' XII ': ' 12 '
    };

    // Pad with spaces for matching
    normalized = ' ' + normalized + ' ';
    for (const [roman, arabic] of Object.entries(romanMap)) {
        normalized = normalized.replace(new RegExp(roman, 'gi'), arabic);
    }
    normalized = normalized.trim();

    // Clean up multiple spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
}

export async function searchTorrents(query: string, expectedYear?: number): Promise<ParsedTorrent[]> {
    try {
        // Normalize the query for better search results
        const normalizedQuery = normalizeTitle(query);
        console.log("[TorrentAPI] Searching for:", normalizedQuery, expectedYear ? `(${expectedYear})` : '');

        const res = await fetch(`${APIBAY_URL}/q.php?q=${encodeURIComponent(normalizedQuery)}&cat=`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!res.ok) {
            console.error("[TorrentAPI] Fetch error:", res.statusText);
            return [];
        }

        const data: TorrentResult[] = await res.json();
        console.log("[TorrentAPI] Got", data.length, "raw results");

        // Filter out "No results" placeholder
        if (data.length === 1 && data[0].id === "0") {
            console.log("[TorrentAPI] No results found");
            return [];
        }

        // Extract the expected title from query (remove year if included)
        const expectedTitle = query.replace(/\s*\d{4}\s*$/, '').trim();

        // Parse, score, and filter results
        const parsed: ParsedTorrent[] = data
            .filter(t => {
                const cat = parseInt(t.category, 10);
                const sizeBytes = parseInt(t.size, 10) || 0;

                // Must be video category
                if (cat < 200 || cat >= 300) return false;

                // Filter out spam/fake torrents
                if (isSpamTorrent(t.name, sizeBytes)) {
                    console.log("[TorrentAPI] Filtered spam:", t.name.substring(0, 50));
                    return false;
                }

                return true;
            })
            .map(t => {
                const info = parseTorrentName(t.name);
                const seeds = parseInt(String(t.seeders), 10) || 0;
                const score = calculateRelevanceScore(info, expectedTitle, expectedYear || null, seeds);

                return {
                    originalName: t.name,
                    parsedTitle: info.title,
                    parsedYear: info.year,
                    quality: info.quality,
                    source: info.source,
                    codec: info.codec,
                    tags: info.tags,
                    hash: t.info_hash,
                    size: formatSize(t.size),
                    seeds,
                    relevanceScore: score
                };
            })
            .filter(t => t.relevanceScore > -50) // Show most results, hide very bad matches
            .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
            .slice(0, 25); // Show more results

        console.log("[TorrentAPI] Filtered to", parsed.length, "relevant torrents");

        if (parsed.length > 0) {
            console.log("[TorrentAPI] Top result:", parsed[0].originalName, "Score:", parsed[0].relevanceScore);
        }

        return parsed;
    } catch (error) {
        console.error("[TorrentAPI] Search Exception:", error);
        return [];
    }
}
