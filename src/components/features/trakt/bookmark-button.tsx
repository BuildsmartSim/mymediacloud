"use client";

import { useState } from "react";
import { Bookmark, Check, Loader2 } from "lucide-react";
import { toggleWatchlist } from "@/app/actions/trakt";
import { useRouter } from "next/navigation";
import { useTrakt } from "@/context/trakt-context";

interface BookmarkButtonProps {
    tmdbId: number | string;
    type?: "movie" | "show";
    variant?: "default" | "icon";
}

export function BookmarkButton({ tmdbId, type = "movie", variant = "default" }: BookmarkButtonProps) {
    const { watchlist, refresh, isLoading } = useTrakt();
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    const inWatchlist = watchlist.has(Number(tmdbId));

    // If global loading, we can show spinner or just disable? 
    // Let's show spinner if we don't know status yet.
    const isReady = !isLoading;

    const handleToggle = async () => {
        if (!isReady) return;
        setActionLoading(true);

        const action = inWatchlist ? "remove" : "add";
        const res = await toggleWatchlist(tmdbId, type, action);

        if (res.success) {
            await refresh(); // Sync context
            router.refresh(); // Sync server components if needed
        } else {
            alert(res.error);
        }

        setActionLoading(false);
    };

    const isPending = actionLoading || !isReady;

    if (variant === "icon") {
        return (
            <button
                onClick={handleToggle}
                disabled={isPending}
                className={`p-2 rounded-full transition-colors ${inWatchlist ? "bg-yellow-500 text-black" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
            >
                {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : inWatchlist ? (
                    <Check className="w-5 h-5" />
                ) : (
                    <Bookmark className="w-5 h-5" />
                )}
            </button>
        );
    }

    // Default button style
    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${inWatchlist
                    ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border border-yellow-500/50"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                }`}
        >
            {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : inWatchlist ? (
                <Check className="w-5 h-5" />
            ) : (
                <Bookmark className="w-5 h-5" />
            )}
            {inWatchlist ? "IN WATCHLIST" : "WATCHLIST"}
        </button>
    );
}
