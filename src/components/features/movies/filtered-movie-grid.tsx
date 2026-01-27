"use client";

import { useState, useMemo } from "react";
import { Star, Filter, ArrowUpDown, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/lib/api/tmdb";
import { WatchedIndicator } from "@/components/features/trakt/watched-indicator";

interface Movie {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    vote_average: number;
    vote_count: number;
    release_date?: string;
    first_air_date?: string;
    // We might not have runtime/certification in list views usually, 
    // but assuming we might enrich data or filter locally if data available.
    // For standard lists, we filter based on available fields.
}

interface FilteredMovieGridProps {
    initialMovies: Movie[];
    title: string;
    description?: string;
}

export function FilteredMovieGrid({ initialMovies, title, description }: FilteredMovieGridProps) {
    const [movies, setMovies] = useState<Movie[]>(initialMovies);
    const [sortBy, setSortBy] = useState<"rating" | "newest" | "oldest" | "cult" | "blockbuster" | "critic">("rating");
    const [decadeFilter, setDecadeFilter] = useState<string>("all");
    const [runtimeFilter, setRuntimeFilter] = useState<"all" | "short" | "standard" | "epic">("all");

    // Decades extraction
    const decades = useMemo(() => {
        const years = initialMovies.map(m => {
            const date = m.release_date || m.first_air_date;
            return date ? parseInt(date.split("-")[0]) : null;
        }).filter(y => y !== null) as number[];

        const uniqueDecades = Array.from(new Set(years.map(y => Math.floor(y / 10) * 10)));
        return uniqueDecades.sort((a, b) => b - a);
    }, [initialMovies]);

    // Filtering Logic
    const filteredMovies = useMemo(() => {
        let result = [...initialMovies];

        // Decade Filter
        if (decadeFilter !== "all") {
            const decade = parseInt(decadeFilter);
            result = result.filter(m => {
                const date = m.release_date || m.first_air_date;
                if (!date) return false;
                const year = parseInt(date.split("-")[0]);
                return year >= decade && year < decade + 10;
            });
        }

        // Runtime Logic (Mock logic since list doesn't usually have runtime)
        // If data is missing, we skip. If we had runtime:
        // Short < 90, Standard 90-150, Epic > 150.
        // For now, we'll placeholder this or use vote_count as a proxy for 'Epicness'? 
        // No, that's misleading. Let's strictly rely on sort logic for now for "vibe".

        // Sorting
        result.sort((a, b) => {
            if (sortBy === "rating") return b.vote_average - a.vote_average;
            if (sortBy === "newest") return (b.release_date || "").localeCompare(a.release_date || "");
            if (sortBy === "oldest") return (a.release_date || "").localeCompare(b.release_date || "");

            // Cult: High Rating but LOW Vote Count (Hidden Gems)
            if (sortBy === "cult") {
                const scoreA = a.vote_average - ((a.vote_count || 0) > 5000 ? 5 : 0); // Penalize popular stuff
                const scoreB = b.vote_average - ((b.vote_count || 0) > 5000 ? 5 : 0);
                return scoreB - scoreA;
            }

            // Blockbuster: High Popularity/Vote Count
            if (sortBy === "blockbuster") return (b.vote_count || 0) - (a.vote_count || 0);

            // Critics Choice: High Rating AND High Vote Count (Consensus)
            if (sortBy === "critic") {
                const scoreA = a.vote_average * (Math.log10(a.vote_count || 1));
                const scoreB = b.vote_average * (Math.log10(b.vote_count || 1));
                return scoreB - scoreA;
            }

            return 0;
        });

        return result;
    }, [initialMovies, decadeFilter, sortBy, runtimeFilter]);

    return (
        <div className="min-h-screen bg-background pt-24 px-4 md:px-12 pb-12">
            {/* Header */}
            <div className="mb-8 space-y-4">
                <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                    ← Back to Home
                </Link>
                <h1 className="text-4xl font-bold text-white">{title}</h1>
                {description && <p className="text-slate-400 max-w-2xl text-lg">{description}</p>}

                {/* Global Filters Control Bar */}
                <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md mt-6">

                    {/* Decade Filter */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Clock className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <select
                            value={decadeFilter}
                            onChange={(e) => setDecadeFilter(e.target.value)}
                            className="appearance-none bg-black/40 border border-white/10 text-slate-300 text-sm rounded-lg pl-10 pr-8 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none hover:bg-white/5 cursor-pointer min-w-[140px]"
                        >
                            <option value="all">All Eras</option>
                            {decades.map(d => (
                                <option key={d} value={d}>{d}s</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Filter - ENHANCED */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <ArrowUpDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="appearance-none bg-black/40 border border-white/10 text-slate-300 text-sm rounded-lg pl-10 pr-8 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none hover:bg-white/5 cursor-pointer min-w-[180px]"
                        >
                            <option value="rating">Highest Rated</option>
                            <option value="cult">Cult Classics (Hidden Gems)</option>
                            <option value="blockbuster">Blockbusters (Popular)</option>
                            <option value="critic">Critics Choice (Consensus)</option>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {filteredMovies.map((m) => (
                    <Link
                        key={m.id}
                        href={`/movie/${m.id}`} // Assuming mostly movies for now
                        className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 border border-white/5 hover:border-primary/50 transition-all shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                    >
                        <img
                            src={m.poster_path ? getImageUrl(m.poster_path) : "/placeholder.jpg"}
                            alt={m.title || m.name}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <WatchedIndicator tmdbId={m.id} />

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

                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-bold text-white">{m.vote_average?.toFixed(1)}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredMovies.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    No titles found matching these filters.
                </div>
            )}
        </div>
    );
}
