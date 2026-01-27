import { getUserWatchlist } from "@/lib/api/trakt";
import { FilteredMovieGrid } from "@/components/features/movies/filtered-movie-grid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function WatchlistPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_token")?.value;

    if (!token) {
        redirect("/api/auth/trakt");
    }

    const movies = await getUserWatchlist(token);

    return (
        <FilteredMovieGrid
            title="Your Watchlist"
            description="Movies you want to watch from your Trakt account."
            initialMovies={movies}
        />
    );
}
