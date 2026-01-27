"use client";

import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { markAsWatchedAction } from "@/app/actions/trakt";
import { useTrakt } from "@/context/trakt-context";

interface WatchedIndicatorProps {
    tmdbId: number | string;
    type?: "movies" | "shows"; // Trakt API types
}

export function WatchedIndicator({ tmdbId, type = "movies" }: WatchedIndicatorProps) {
    const { historyMovies, historyShows, refresh, isLoading } = useTrakt();
    const [actionLoading, setActionLoading] = useState(false);

    // Check if ID is in correct history set
    const watched = type === "movies"
        ? historyMovies.has(Number(tmdbId))
        : historyShows.has(Number(tmdbId));

    if (isLoading) return null;

    const handleMarkWatched = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (watched) return;

        setActionLoading(true);
        const actionType = type === "movies" ? "movie" : "episode";

        const res = await markAsWatchedAction(tmdbId, actionType as any);
        if (res.success) {
            await refresh();
        }
        setActionLoading(false);
    };

    if (actionLoading) {
        return (
            <div className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/50 animate-pulse z-20">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
        );
    }

    if (!watched) {
        return (
            <button
                onClick={handleMarkWatched}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/20 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 z-20"
                title="Mark as Watched"
            >
                <Eye className="w-4 h-4" />
            </button>
        );
    }

    return (
        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded flex items-center gap-1 shadow-lg z-20">
            <Eye className="w-3 h-3 fill-current" />
            WATCHED
        </div>
    );
}
