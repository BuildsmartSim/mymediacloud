"use server";

import { addToWatchlist, removeFromWatchlist, addToHistory, getUserWatchlist, getHistory } from "@/lib/api/trakt";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get("trakt_token")?.value;
}

export async function toggleWatchlist(tmdbId: number | string, type: "movie" | "show", action: "add" | "remove") {
    const token = await getToken();
    if (!token) return { error: "Not connected to Trakt" };

    try {
        if (action === "add") {
            await addToWatchlist(token, tmdbId, type);
        } else {
            await removeFromWatchlist(token, tmdbId, type);
        }

        revalidatePath("/movies");
        revalidatePath(`/movie/${tmdbId}`);
        revalidatePath("/settings"); // If we show watchlist there
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function checkWatchlistStatus(tmdbId: number | string) {
    const token = await getToken();
    if (!token) return { inWatchlist: false };

    // This is inefficient (fetching whole watchlist to check one), but Trakt requires 
    // specific "check" calls or syncing local state. 
    // For MVP, if watchlist is small, this works. 
    // Optimization: Cache watchlist in a lighter way or valid use of revalidate.

    // Better approach for check: Trakt doesn't have a simple "is this ID in watchlist?" endpoint 
    // without fetching the list or history.
    // We will stick to fetching the watchlist.

    // NOTE: This might be SLOW if watchlist is huge.
    const watchlist = await getUserWatchlist(token);
    const found = watchlist.find((item: any) => item.ids.tmdb == tmdbId);
    return { inWatchlist: !!found };
}

export async function markAsWatchedAction(tmdbId: number | string, type: "movie" | "episode") {
    const token = await getToken();
    if (!token) return { error: "Not connected to Trakt" };

    try {
        await addToHistory(token, tmdbId, type);
        revalidatePath(`/movie/${tmdbId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function getWatchedStatus(tmdbId: number | string, type: "movies" | "shows") {
    const token = await getToken();
    if (!token) return { watched: false };

    // Again, inefficient to fetch whole history.
    // But Trakt's `/sync/history` supports ?start_at etc.
    // Or we could fetch specific item history? POST /sync/history/get
    // Wait, `getHistory` uses GET /sync/history.
    // There isn't a direct "check if watched" for a specific ID easily via GET.

    // Optimization: The client should probably just load the whole history ONCE at startup 
    // and context provider checks it? 
    // For now, let's do the simple server action fetch.
    const history = await getHistory(token, type);
    // History items have `movie` or `show` or `episode` object
    const found = history.find((item: any) => {
        if (type === "movies" && item.movie) return item.movie.ids.tmdb == tmdbId;
        // For shows, history returns EPISODES. 
        // We probably won't use this action for "Show Watched" status directly yet.
        return false;
    });

    return { watched: !!found };
}

export async function getUserTraktData() {
    const token = await getToken();
    if (!token) return { watchlist: [], history: [] };

    try {
        const [watchlist, historyMovies, historyShows] = await Promise.all([
            getUserWatchlist(token),
            getHistory(token, "movies"),
            getHistory(token, "shows"),
        ]);

        return {
            watchlist: watchlist.map((item: any) => Number(item.id || item.movie?.ids?.tmdb || item.show?.ids?.tmdb)).filter(Boolean),
            historyMovies: historyMovies.map((item: any) => Number(item.movie?.ids?.tmdb)).filter(Boolean),
            historyShows: Array.from(new Set(
                historyShows.map((item: any) =>
                    Number(item.show?.ids?.tmdb || item.episode?.show?.ids?.tmdb)
                ).filter(Boolean)
            ))
        };
    } catch (e) {
        console.error("Failed to fetch user trakt data", e);
        return { watchlist: [], historyMovies: [], historyShows: [] };
    }
}
