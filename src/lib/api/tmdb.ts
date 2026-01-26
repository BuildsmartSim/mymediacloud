// TMDB API Client - No "use server" needed, works as regular server component code

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/original";

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
    if (!TMDB_API_KEY) {
        console.error("TMDB_API_KEY is missing in environment");
        return null;
    }

    const query = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: "en-US",
        ...params,
    });

    try {
        const fullUrl = `${BASE_URL}${endpoint}?${query.toString()}`;
        console.log(`Fetching TMDB: ${endpoint} (Key Length: ${TMDB_API_KEY.length})`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for stability

        const res = await fetch(fullUrl, {
            next: { revalidate: 3600 },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            const errorBody = await res.text().catch(() => "No body");
            console.error(`TMDB Error Details: ${res.status} ${res.statusText} | Body: ${errorBody.substring(0, 100)}`);
            throw new Error(`TMDB Error: ${res.status}`);
        }

        const data = await res.json();
        console.log(`TMDB Success: ${endpoint} | Results: ${data?.results?.length || 0}`);
        return data;
    } catch (error: any) {
        console.error("TMDB Fetch Exception:", error.message);
        return null;
    }
}

// Helper function - NOT async, NOT a server action
export function getImageUrl(path: string | null): string {
    if (!path) return "/placeholder.jpg";
    return `${IMAGE_BASE}${path}`;
}

export async function getTrendingMovies() {
    return fetchTMDB("/trending/movie/week");
}

export async function getTrendingShows() {
    return fetchTMDB("/trending/tv/week");
}

export async function searchMulti(query: string) {
    return fetchTMDB("/search/multi", { query });
}

export async function getMovieDetails(id: string) {
    return fetchTMDB(`/movie/${id}`);
}

export async function getMovieCredits(id: string) {
    return fetchTMDB(`/movie/${id}/credits`);
}

export async function getPersonDetails(id: string) {
    return fetchTMDB(`/person/${id}`);
}

export async function getPersonCredits(id: string) {
    return fetchTMDB(`/person/${id}/combined_credits`);
}

// Keyword IDs for personalization
export const KEYWORDS = {
    SPACE: "9882|3409|4565|10633", // space | space travel | dystopia | deep space
    SURVIVAL: "10322|3502|591",     // survival | castaway | rescue
    DISASTER: "1960|12401",         // disaster | natural disaster
    SEA: "3678|3006|3734",          // ocean | submarine | shipwreck
    TRUE_STORY: "9672",             // based on true story
    COMEDY_DARK: "9716",            // dark comedy
};

export async function discoverMovies(params: Record<string, string>) {
    return fetchTMDB("/discover/movie", params);
}

// TV Series API
export async function getTVDetails(id: string) {
    return fetchTMDB(`/tv/${id}`);
}

export async function getSeasonDetails(tvId: string, seasonNumber: number) {
    return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function getEpisodeDetails(tvId: string, seasonNumber: number, episodeNumber: number) {
    return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {
        append_to_response: "credits,images"
    });
}

export async function discoverTV(params: Record<string, string>) {
    return fetchTMDB("/discover/tv", params);
}
