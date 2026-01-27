import Link from "next/link";
import { Star } from "lucide-react";
import { getImageUrl } from "@/lib/api/tmdb";
import { WatchedIndicator } from "@/components/features/trakt/watched-indicator";

interface MovieRowProps {
    title: string;
    movies: any[];
    isSeries?: boolean;
    categorySlug?: string; // Optional slug for "See All"
}

// Internal component to handle image fetching if only ID is known (Trakt items)
function SmartPoster({ movie }: { movie: any }) {
    // Determine image source
    // In a real app, we'd use SWR or React Query to fetch the poster if missing.
    // For this MVP, we will rely on the fact that if it's from Trakt, we passed the OMDB/TMDB ID?
    // Actually, Trakt API mapping is complex.
    // Let's use a simple placeholder if missing, OR...
    // The Trakt API library SHOULD have fetched it.
    // Let's assume for now we use placeholder if missing to avoid N+1 complexity in this component.

    // BETTER FIX: We will just fetch the image URL directly from TMDB in a useEffect? 
    // No, standard `img` tag with TMDB URL pattern needs the path.
    // Let's just use the placeholder for now if it's missing, effectively showing "No Image" for watchlist items
    // until we implement the bulk fetcher properly in the API layer.

    const src = movie.poster_path ? getImageUrl(movie.poster_path) : "/placeholder.jpg";

    return (
        <img
            src={src}
            alt={movie.title || movie.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
    );
}

export function MovieRow({ title, movies, isSeries, categorySlug }: MovieRowProps) {
    if (!movies || movies.length === 0) return null;

    return (
        <div className="py-6 space-y-4">
            <div className="flex items-center justify-between px-4 md:px-12">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    {title}
                </h2>
                {categorySlug && (
                    <Link
                        href={`/category/${categorySlug}`}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-black bg-primary rounded-full hover:bg-white transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        EXPAND
                    </Link>
                )}
            </div>

            <div className="flex gap-4 overflow-x-auto px-4 md:px-12 pb-8 scrollbar-hide snap-x">
                {movies.map((m) => (
                    <Link
                        key={m.id}
                        href={`/${isSeries ? 'tv' : 'movie'}/${m.id}`}
                        className="flex-shrink-0 w-[150px] md:w-[200px] snap-start group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 border border-white/5 shadow-lg transition-all duration-300 hover:scale-105 hover:z-10 hover:border-primary/50 hover:shadow-primary/20"
                    >
                        <SmartPoster movie={m} />
                        <WatchedIndicator tmdbId={m.id} type={isSeries ? "shows" : "movies"} />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <h3 className="font-bold text-white text-sm line-clamp-2">{m.title || m.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] text-slate-300">
                                    {(m.release_date || m.first_air_date || "").split("-")[0]}
                                </span>
                                <div className="flex items-center gap-1 text-primary text-xs font-bold">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>{m.vote_average?.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
