"use client";

import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SeasonSelectorProps {
    tvId: string;
    seasons: any[];
    currentSeason: number;
}

export function SeasonSelector({ tvId, seasons, currentSeason }: SeasonSelectorProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const validSeasons = seasons.filter(s => s.season_number > 0);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!scrollRef.current) return;
        const scrollAmount = 150;
        if (e.key === "ArrowRight") {
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        } else if (e.key === "ArrowLeft") {
            scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div
            ref={scrollRef}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="flex flex-wrap items-center gap-3 pb-4 focus:outline-none focus:ring-1 focus:ring-primary/20 rounded-xl"
        >
            {validSeasons.map((season) => {
                const isActive = season.season_number === currentSeason;
                return (
                    <Link
                        key={season.id}
                        href={`/tv/${tvId}?season=${season.season_number}`}
                        scroll={false}
                        className={cn(
                            "px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap",
                            isActive
                                ? "bg-white text-black scale-105"
                                : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                        )}
                    >
                        {season.name}
                    </Link>
                );
            })}
        </div>
    );
}

