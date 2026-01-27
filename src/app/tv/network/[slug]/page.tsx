import { discoverTV } from "@/lib/api/tmdb";
import { FilteredMovieGrid } from "@/components/features/movies/filtered-movie-grid";
import { notFound } from "next/navigation";

// Map slugs to TMDB Network IDs and Display Titles
const NETWORKS: Record<string, { id: string; title: string; description: string }> = {
    "netflix": { id: "213", title: "Netflix", description: "Popular series streaming on Netflix." },
    "hbo": { id: "49", title: "HBO Max", description: "Award-winning series from HBO." },
    "disney": { id: "2739", title: "Disney+", description: "Original series from Disney, Marvel, and Star Wars." },
    "apple": { id: "2552", title: "Apple TV+", description: "Originals from Apple TV+." },
    "paramount": { id: "4330", title: "Paramount+", description: "Mountain of entertainment from Paramount+." },
    "hulu": { id: "453", title: "Hulu", description: "Hit series streaming on Hulu." },
    "amazon": { id: "1024", title: "Amazon Prime Video", description: "Included with Prime." },
};

export default async function TVNetworkPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const network = NETWORKS[slug];

    if (!network) {
        return notFound();
    }

    // Deep fetch wrapper
    const pagesToFetch = [1, 2, 3]; // Fetch 3 pages (~60 items)

    try {
        const responses = await Promise.all(
            pagesToFetch.map(page =>
                discoverTV({ with_networks: network.id, sort_by: "popularity.desc", page: page.toString() })
            )
        );

        const allResults = responses.flatMap(r => r?.results || []);

        // Dedupe
        const seen = new Set();
        const shows = allResults.filter(s => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
        });

        // Transform for Grid (TV items have 'name' instead of 'title', FilteredMovieGrid expects title/id/poster_path)
        // Actually FilteredMovieGrid handles "movie" type objects.
        // We need to ensure the objects resemble movies or the grid handles them.
        // Let's modify the objects.
        const gridItems = shows.map((show: any) => ({
            ...show,
            title: show.name, // Map name to title
            release_date: show.first_air_date // Map to release_date
        }));

        return (
            <FilteredMovieGrid
                title={network.title}
                description={network.description}
                initialMovies={gridItems}
                isSeries={true}
            />
        );
    } catch (e) {
        return <div className="p-20 text-center text-slate-400">Failed to load content.</div>;
    }
}
