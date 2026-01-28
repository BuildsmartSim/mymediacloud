"use client";

import { useState, useMemo } from "react";
import { Star, Filter, ArrowUpDown } from "lucide-react";
import Link from "next/link";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500"; // Use w500 for grid to save bandwidth

interface Credit {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    vote_average: number;
    vote_count: number;
    release_date?: string;
    first_air_date?: string;
    character?: string;
    job?: string;
    media_type: "movie" | "tv";
}

interface PersonCreditsGridProps {
    credits: Credit[];
    personDept: string;
}

export function PersonCreditsGrid({ credits, personDept }: PersonCreditsGridProps) {
    const [activeTab, setActiveTab] = useState<"movie" | "tv">("movie");
    const [decadeFilter, setDecadeFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"rating" | "newest">("rating");

    // 1. Filter by Media Type
    const typeFiltered = useMemo(() => {
        return credits.filter(c => c.media_type === activeTab);
    }, [credits, activeTab]);

    // 2. Extract Decades
    const decades = useMemo(() => {
        const years = typeFiltered.map(c => {
            const date = c.release_date || c.first_air_date;
            return date ? parseInt(date.split("-")[0]) : null;
        }).filter(y => y !== null) as number[];

        const uniqueDecades = Array.from(new Set(years.map(y => Math.floor(y / 10) * 10)));
        return uniqueDecades.sort((a, b) => b - a); // Descending (2020s, 2010s...)
    }, [typeFiltered]);

    // 3. Apply Decade & Sort filters
    const finalCredits = useMemo(() => {
        let result = [...typeFiltered];

        // Decade Filter
        if (decadeFilter !== "all") {
            const decade = parseInt(decadeFilter);
            result = result.filter(c => {
                const date = c.release_date || c.first_air_date;
                if (!date) return false;
                const year = parseInt(date.split("-")[0]);
                return year >= decade && year < decade + 10;
            });
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === "rating") {
                return b.vote_average - a.vote_average;
            } else {
                const dateA = a.release_date || a.first_air_date || "";
                const dateB = b.release_date || b.first_air_date || "";
                return dateB.localeCompare(dateA); // Newest first
            }
        });

        return result;
    }, [typeFiltered, decadeFilter, sortBy]);

    // Helper to get image url safely
    const getPoster = (path: string | null) => path ? `${IMAGE_BASE}${path}` : "/placeholder.jpg";

    return (
        <div className="space-y-8">
            {/* Controls Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">

                {/* Tabs: Movies vs TV */}
                <div className="flex p-1 bg-black/40 rounded-lg">
                    <button
                        onClick={() => { setActiveTab("movie"); setDecadeFilter("all"); }}
                        className={`px-6 py-2 rounded-sm text-sm font-black transition-all font-serif italic tracking-wide ${activeTab === "movie"
                            ? "bg-primary text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        MOVIES
                    </button>
                    <button
                        onClick={() => { setActiveTab("tv"); setDecadeFilter("all"); }}
                        className={`px-6 py-2 rounded-sm text-sm font-black transition-all font-serif italic tracking-wide ${activeTab === "tv"
                            ? "bg-primary text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        TV SHOWS
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">

                    {/* Decade Select */}
                    {decades.length > 0 && (
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Filter className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                            </div>
                            <select
                                value={decadeFilter}
                                onChange={(e) => setDecadeFilter(e.target.value)}
                                className="appearance-none bg-black/40 border border-white/10 text-slate-300 text-sm rounded-lg pl-10 pr-8 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none hover:bg-white/5 cursor-pointer min-w-[140px]"
                            >
                                <option value="all">All Decades</option>
                                {decades.map(decade => (
                                    <option key={decade} value={decade}>{decade}s</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Sort Toggle */}
                    <button
                        onClick={() => setSortBy(prev => prev === "rating" ? "newest" : "rating")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        {sortBy === "rating" ? "By Rating" : "By Year"}
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="space-y-4">
                <h3 className="text-2xl font-black text-white flex items-center gap-3 font-serif italic tracking-tight">
                    <span className="w-1.5 h-6 bg-primary -skew-x-12" />
                    {activeTab === "movie" ? "Movies" : "TV Series"}
                    <span className="px-2 py-0.5 bg-primary/20 rounded-sm text-[10px] text-primary border border-primary/20 font-sans font-bold not-italic tracking-normal">
                        {finalCredits.length}
                    </span>
                    {decadeFilter !== "all" && (
                        <span className="text-sm font-normal text-slate-400 font-sans not-italic tracking-normal">from the {decadeFilter}s</span>
                    )}
                </h3>

                {finalCredits.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        No credits found for this filter.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in duration-500">
                        {finalCredits.map((credit: any) => (
                            <Link
                                key={credit.id}
                                href={`/${credit.media_type === 'tv' ? 'tv' : 'movie'}/${credit.id}`}
                                className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 border border-white/5 hover:border-primary/50 transition-all shadow-lg hover:shadow-primary/10"
                            >
                                <img
                                    src={getPoster(credit.poster_path)}
                                    alt={credit.title || credit.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                    <h3 className="text-white font-serif font-black italic text-sm line-clamp-2 leading-tight">{credit.title || credit.name}</h3>

                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1 text-primary text-xs font-bold">
                                                <Star className="w-3 h-3 fill-primary" />
                                                <span>{credit.vote_average?.toFixed(1)}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {(credit.release_date || credit.first_air_date || "").split("-")[0]}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-slate-400 text-[10px] mt-2 line-clamp-1 border-t border-white/10 pt-2">
                                        {credit.character ? `as ${credit.character}` : credit.job || personDept}
                                    </p>
                                </div>

                                {/* Badge */}
                                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                    <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-sm flex items-center gap-1 border border-primary/20">
                                        <Star className="w-3 h-3 text-primary fill-primary" />
                                        <span className="text-xs font-bold text-white font-sans">{credit.vote_average?.toFixed(1)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
