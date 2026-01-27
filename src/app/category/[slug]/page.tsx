import { CATEGORY_SLUGS } from "@/lib/config/categories";
import { discoverMovies } from "@/lib/api/tmdb";
import { FilteredMovieGrid } from "@/components/features/movies/filtered-movie-grid";
import { MovieRow } from "@/components/features/movies/movie-row";
import { notFound } from "next/navigation";

export default async function CategoryPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ sub?: string }>
}) {
    const { slug } = await params;
    const { sub } = await searchParams;

    const category = CATEGORY_SLUGS[slug];

    if (!category) {
        return notFound();
    }

    // MODE 1: Sub-Category Grid View
    // If a specific sub-category is selected via ?sub=Title, render THAT as a grid.
    if (sub && category.subCategories) {
        const subCat = category.subCategories.find(c => c.title === sub);
        if (subCat) {
            return (
                <CategoryGrid
                    title={`${category.title}: ${subCat.title}`}
                    description={`Browsing ${subCat.title} movies.`}
                    params={subCat.params}
                />
            );
        }
    }

    // MODE 2: Hub View (Main Category with Sub-Categories)
    // If the category has sub-categories and we are NOT filtering, show rows.
    if (category.subCategories && !sub) {
        const subCategoryResults = await Promise.all(
            category.subCategories.map(async (subCat) => {
                const res = await discoverMovies({ ...subCat.params });
                return {
                    title: subCat.title,
                    movies: res?.results || [],
                    link: `/category/${slug}?sub=${encodeURIComponent(subCat.title)}`
                };
            })
        );

        return (
            <div className="min-h-screen bg-background pb-20 pt-24">
                <div className="px-4 md:px-12 mb-8">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        {category.title}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        {category.description}
                    </p>
                </div>

                <div className="space-y-2">
                    {subCategoryResults.map((section) => (
                        <MovieRow
                            key={section.title}
                            title={section.title}
                            movies={section.movies}
                            viewAllLink={section.link}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // MODE 3: Standard Category Grid View (Default)
    return (
        <CategoryGrid
            title={category.title}
            description={category.description}
            params={category.params}
        />
    );
}

// Helper to render the Grid View logic (reused)
async function CategoryGrid({ title, description, params }: { title: string, description: string, params: Record<string, string> }) {
    // Deep Fetch Strategy: Parallel fetch pages 1-5 to get ~100 results
    const pagesToFetch = [1, 2, 3, 4, 5];

    try {
        const responses = await Promise.all(
            pagesToFetch.map(page =>
                discoverMovies({ ...params, page: page.toString() })
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
                title={title}
                description={description}
            />
        );
    } catch (e) {
        console.error("Error fetching category:", e);
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400 pt-20">
                Error loading category. Please try again.
            </div>
        );
    }
}
