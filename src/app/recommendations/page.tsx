import { getRecommendedMovies } from "@/lib/api/trakt";
import { FilteredMovieGrid } from "@/components/features/movies/filtered-movie-grid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function RecommendationsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_token")?.value;

    if (!token) {
        redirect("/api/auth/trakt");
    }

    const movies = await getRecommendedMovies(token);

    return (
        <FilteredMovieGrid
            title="Recommended For You"
            description="Personalized recommendations based on your Trakt history."
            initialMovies={movies}
        />
    );
}
