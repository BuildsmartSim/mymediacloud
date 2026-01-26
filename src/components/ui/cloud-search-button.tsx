"use client";

import { useState } from "react";
import { Cloud, Search, Check, X, Loader2 } from "lucide-react";
import { findInCloud } from "@/app/actions/cloud";
import { PlayButton } from "@/components/ui/play-button";

interface CloudSearchButtonProps {
    query: string; // Movie Title
    variant?: "default" | "hero";
}

export function CloudSearchButton({ query, variant = "default" }: CloudSearchButtonProps) {
    const [status, setStatus] = useState<"idle" | "searching" | "found" | "not-found">("idle");
    const [match, setMatch] = useState<any>(null);

    const handleSearch = async () => {
        setStatus("searching");
        try {
            const results = await findInCloud(query);
            if (results && results.length > 0) {
                setMatch(results[0]); // Take best match
                setStatus("found");
            } else {
                setStatus("not-found");
            }
        } catch (e) {
            setStatus("not-found");
        }
    };

    if (status === "idle") {
        if (variant === "hero") {
            return (
                <button
                    onClick={handleSearch}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-transform active:scale-95 shadow-lg shadow-primary/20"
                >
                    <Cloud className="w-5 h-5" />
                    WATCH NOW
                </button>
            );
        }
        return (
            <button
                onClick={handleSearch}
                className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white text-xs font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2"
            >
                <Cloud className="w-4 h-4" />
                SEARCH CLOUD
            </button>
        );
    }

    if (status === "searching") {
        return (
            <button disabled className="w-full py-2 bg-black/50 text-slate-500 text-xs font-bold rounded flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                CHECKING...
            </button>
        );
    }

    if (status === "found" && match) {
        return (
            <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-center gap-1 text-xs text-green-400 font-medium mb-1">
                    <Check className="w-3 h-3" />
                    Found in Cloud
                </div>
                <PlayButton
                    torrentId={match.id}
                    filename={match.filename}
                    targetFilename={match.targetFilename} // Pass specific file if available
                    className="w-full bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20"
                />
            </div>
        );
    }

    return (
        <button disabled className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded flex items-center justify-center gap-2">
            <X className="w-4 h-4" />
            NOT FOUND
        </button>
    );
}
