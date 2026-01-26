import Link from "next/link";
import { cn } from "@/lib/utils";

interface SeasonSelectorProps {
    tvId: string;
    seasons: any[];
    currentSeason: number;
}

export function SeasonSelector({ tvId, seasons, currentSeason }: SeasonSelectorProps) {
    // Filter out Season 0 (Specials) usually, or keep them at the end? 
    // Usually standard seasons are 1+, strictly.
    const validSeasons = seasons.filter(s => s.season_number > 0);

    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {validSeasons.map((season) => {
                const isActive = season.season_number === currentSeason;
                return (
                    <Link
                        key={season.id}
                        href={`/tv/${tvId}?season=${season.season_number}`}
                        scroll={false} // Don't scroll to top on season switch
                        className={cn(
                            "flex-shrink-0 px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap",
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
