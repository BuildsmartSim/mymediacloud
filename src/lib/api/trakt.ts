

const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID;
const BASE_URL = "https://api.trakt.tv";

const headers = {
    "Content-Type": "application/json",
    "trakt-api-version": "2",
    "trakt-api-key": TRAKT_CLIENT_ID || "",
};

export async function fetchTrakt(endpoint: string) {
    if (!TRAKT_CLIENT_ID) {
        console.warn("TRAKT_CLIENT_ID not set");
        return [];
    }

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
        if (!res.ok) throw new Error(res.statusText);
        return await res.json();
    } catch (error) {
        console.error("Trakt Fetch Error:", error);
        return [];
    }
}

// Trakt OAuth - Use stable production domain ONLY
const STABLE_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const REDIRECT_URI = `${STABLE_APP_URL}/api/auth/trakt/callback`;

export async function getAuthUrl() {
    if (!TRAKT_CLIENT_ID) return "";
    return `${BASE_URL}/oauth/authorize?response_type=code&client_id=${TRAKT_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
}

export async function exchangeCode(code: string) {
    if (!TRAKT_CLIENT_ID || !process.env.TRAKT_CLIENT_SECRET) {
        throw new Error("Trakt secrets missing");
    }

    const payload = {
        code,
        client_id: TRAKT_CLIENT_ID,
        client_secret: process.env.TRAKT_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
    };

    const res = await fetch(`${BASE_URL}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Trakt Auth Failed: ${error}`);
    }

    return await res.json();
}

// Helper to get authenticated headers if token exists
export async function getAuthHeaders(token?: string) {
    return {
        ...headers,
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
}

// Helper to hydrate Trakt items with TMDB images
async function hydrateWithImages(items: any[]) {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) return items;

    // Parallel fetch image data
    // Limit to recent 20 to avoid rate limits? Or just go for it.
    // Let's do all of them but handle errors gracefully.

    // We can use the existing `getMovieDetails` from tmdb.ts but we need to import it carefully to avoid circular deps if any.
    // Actually, let's just do a quick fetch here or import `fetchTMDB` if possible?
    // `fetchTMDB` is not exported from tmdb.ts. 
    // Let's assume we can fetch TMDB directly here or better, import `getMovieDetails`.
    // Wait, `getMovieDetails` is in `@/lib/api/tmdb`.

    const hydrated = await Promise.all(items.map(async (item: any) => {
        try {
            const tmdbId = item.movie?.ids?.tmdb || item.id;
            if (!tmdbId) return item;

            const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
            if (!res.ok) return item;

            const tmdbData = await res.json();
            return {
                ...item,
                poster_path: tmdbData.poster_path,
                backdrop_path: tmdbData.backdrop_path,
                vote_average: tmdbData.vote_average || item.vote_average,
                title: tmdbData.title || item.title
            };
        } catch (e) {
            return item;
        }
    }));

    return hydrated;
}

export async function getUserWatchlist(token: string) {
    if (!token) return [];

    const authHeaders = await getAuthHeaders(token);
    try {
        const res = await fetch(`${BASE_URL}/sync/watchlist/movies?extended=full&sort=added,asc`, {
            headers: authHeaders,
            next: { revalidate: 0 }
        });

        if (!res.ok) return [];
        const data = await res.json();

        // Transform and then hydrate
        const basicItems = data.map((item: any) => ({
            id: item.movie.ids.tmdb,
            title: item.movie.title,
            poster_path: null,
            vote_average: item.movie.rating,
            release_date: item.movie.year ? `${item.movie.year}-01-01` : null,
            ...item.movie
        }));

        return await hydrateWithImages(basicItems);
    } catch (e) {
        console.error("Watchlist error", e);
        return [];
    }
}

export async function getRecommendedMovies(token: string) {
    if (!token) return [];

    const authHeaders = await getAuthHeaders(token);
    try {
        const res = await fetch(`${BASE_URL}/recommendations/movies?limit=20&extended=full`, {
            headers: authHeaders,
            next: { revalidate: 3600 }
        });

        if (!res.ok) return [];
        const data = await res.json();

        const basicItems = data.map((item: any) => ({
            id: item.ids.tmdb,
            title: item.title,
            poster_path: null,
            vote_average: item.rating,
            release_date: item.year ? `${item.year}-01-01` : null,
            ...item
        }));

        return await hydrateWithImages(basicItems);
    } catch (e) {
        console.error("Recommendations error", e);
        return [];
    }
}

export async function addToWatchlist(token: string, tmdbId: number | string, type: "movie" | "show" = "movie") {
    if (!token) return { error: "Not connected" };

    // Convert tmdb ID to Trakt object structure
    const body = type === "movie"
        ? { movies: [{ ids: { tmdb: Number(tmdbId) } }] }
        : { shows: [{ ids: { tmdb: Number(tmdbId) } }] };

    try {
        const res = await fetch(`${BASE_URL}/sync/watchlist`, {
            method: "POST",
            headers: await getAuthHeaders(token),
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Failed to add to watchlist");
        return await res.json();
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function removeFromWatchlist(token: string, tmdbId: number | string, type: "movie" | "show" = "movie") {
    if (!token) return { error: "Not connected" };

    const body = type === "movie"
        ? { movies: [{ ids: { tmdb: Number(tmdbId) } }] }
        : { shows: [{ ids: { tmdb: Number(tmdbId) } }] };

    try {
        const res = await fetch(`${BASE_URL}/sync/watchlist/remove`, {
            method: "POST",
            headers: await getAuthHeaders(token),
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Failed to remove from watchlist");
        return await res.json();
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function getHistory(token: string, type: "movies" | "shows" = "movies") {
    if (!token) return [];

    try {
        const res = await fetch(`${BASE_URL}/sync/history/${type}?limit=100`, {
            headers: await getAuthHeaders(token),
            next: { revalidate: 60 }
        });

        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
}

export async function addToHistory(token: string, tmdbId: number | string, type: "movie" | "episode" = "movie") {
    if (!token) return { error: "Not connected" };

    // For history, we usually add movies or episodes. 
    // If it's a show, we typically add specific episodes, but Trakt allows adding a show to mark all watched?
    // Let's support movies for now as requested.

    const body = type === "movie"
        ? { movies: [{ ids: { tmdb: Number(tmdbId) } }] }
        : { episodes: [{ ids: { tmdb: Number(tmdbId) } }] }; // Note: accessing episodes by TMDB ID usually requires the episode's TMDB ID, not the show's.

    try {
        const res = await fetch(`${BASE_URL}/sync/history`, {
            method: "POST",
            headers: await getAuthHeaders(token),
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Failed to add to history");
        return await res.json();
    } catch (e: any) {
        return { error: e.message };
    }
}
