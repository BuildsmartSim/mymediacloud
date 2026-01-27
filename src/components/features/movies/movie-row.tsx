"use client";

import { useRef } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { getImageUrl } from "@/lib/api/tmdb";
import { WatchedIndicator } from "@/components/features/trakt/watched-indicator";

interface MovieRowProps {
    title: string;
    movies: any[];
    isSeries?: boolean;
    categorySlug?: string; // Optional slug for "See All"
    viewAllLink?: string; // Added to fix build error
}

// Internal component to handle image fetching if only ID is known (Trakt items)
function SmartPoster({ movie }: { movie: any }) {
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

export function MovieRow({ title, movies, isSeries, categorySlug, viewAllLink }: MovieRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (!movies || movies.length === 0) return null;

    // Determine the target link: viewAllLink takes precedence, then categorySlug construction
    const targetLink = viewAllLink || (categorySlug ? `/category/${categorySlug}` : null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!scrollRef.current) return;

        const scrollAmount = 300;
        if (e.key === "ArrowRight") {
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        } else if (e.key === "ArrowLeft") {
            scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="py-6 space-y-4">
            <div className="flex items-center justify-between px-4 md:px-12">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    {title}
                </h2>
                {targetLink && (
                    <Link
                        href={targetLink}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-black bg-primary rounded-full hover:bg-white transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        EXPAND
                    </Link>
                )}
            </div>

            <div
                ref={scrollRef}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                className="flex gap-4 overflow-x-auto px-4 md:px-12 pb-8 scrollbar-hide snap-x focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
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

