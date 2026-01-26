import { CATEGORY_SLUGS } from "@/lib/config/categories";
import { discoverMovies } from "@/lib/api/tmdb";
import { FilteredMovieGrid } from "@/components/features/movies/filtered-movie-grid";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = CATEGORY_SLUGS[slug];

    if (!category) {
        return notFound();
    }

    // Deep Fetch Strategy: Parallel fetch pages 1-5 to get ~100 results
    // This enables client-side filters (Decades, Cult, etc.) to work effectivey.
    const pagesToFetch = [1, 2, 3, 4, 5];

    try {
        const responses = await Promise.all(
            pagesToFetch.map(page =>
                discoverMovies({ ...category.params, page: page.toString() })
            )
        );

        // Combine all results
        const allResults = responses.flatMap(r => r?.results || []);

        // Deduplicate by ID
        const seen = new Set();
        const movies = allResults.filter(m => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });

        return (
            <FilteredMovieGrid
                initialMovies={movies}
                title={category.title}
                description={category.description}
            />
        );
    } catch (e) {
        console.error("Error fetching category:", e);
        // Fallback to single page if deep fetch fails
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                Error loading category. Please try again.
            </div>
        );
    }
}
