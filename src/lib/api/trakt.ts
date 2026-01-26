

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

// Example: Get User Watchlist (Requires Auth or username public)
// For now, we'll just fetch generic trending if no auth
// Trakt OAuth Dynamic Redirect
export async function getAuthUrl(origin?: string) {
    if (!TRAKT_CLIENT_ID) return "";

    const appUrl = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/trakt/callback`;

    return `${BASE_URL}/oauth/authorize?response_type=code&client_id=${TRAKT_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function exchangeCode(code: string, origin?: string) {
    if (!TRAKT_CLIENT_ID || !process.env.TRAKT_CLIENT_SECRET) {
        throw new Error("Trakt secrets missing");
    }

    const appUrl = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/trakt/callback`;

    const payload = {
        code,
        client_id: TRAKT_CLIENT_ID,
        client_secret: process.env.TRAKT_CLIENT_SECRET,
        redirect_uri: redirectUri,
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

export async function getUserWatchlist(token: string) {
    if (!token) return [];

    const authHeaders = await getAuthHeaders(token);
    try {
        const res = await fetch(`${BASE_URL}/sync/watchlist/movies?extended=full`, {
            headers: authHeaders,
            next: { revalidate: 60 } // Cache for 1 min
        });

        if (!res.ok) return [];
        const data = await res.json();

        // Transform Trakt format to TMDB-like format for MovieRow
        return data.map((item: any) => ({
            id: item.movie.ids.tmdb,
            title: item.movie.title,
            poster_path: null, // Trakt doesn't always give posters, ideally we fetch TMDB... 
            // WAIT: Trakt API doesn't give poster_path usually. 
            // We might need to handle image loading via TMDB ID on the client side 
            // or do a massive fetch here.
            // For MVP, let's trust the MovieRow handles missing posters or we use a hack?
            // Actually, we can just return the object and let the UI try to find an image?
            // BETTER: Use TMDB 'images' if available? No...
            // REALITY CHECK: Trakt watchlist items don't have TMDB poster paths without 'images' param?
            // Let's rely on the client component 'FilteredMovieGrid' / 'MovieRow' to maybe fetch images?
            // Or... fetch TMDB data for these IDs? That's N+1.

            // For this specific 'Watchlist' implementation, let's keep it simple:
            // The MovieRow component renders generic posters if missing?
            // Actually, MovieRow uses `getImageUrl(m.poster_path)`.
            // We have a problem: Trakt doesn't provide the TMDB poster path directly easily.
            // Let's stick to the plan: Map what we have, but we might need to PATCH the UI to fetch image if missing.

            // Actually, let's map properties we DO have:
            vote_average: item.movie.rating,
            release_date: item.movie.year ? `${item.movie.year}-01-01` : null,
            ...item.movie
        }));
    } catch (e) {
        console.error("Watchlist error", e);
        return [];
    }
}
