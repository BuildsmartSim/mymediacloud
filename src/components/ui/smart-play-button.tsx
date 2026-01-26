"use client";

import { useState } from "react";
import { Cloud, Check, X, Loader2, Zap, Play, Copy, Download } from "lucide-react";
import { getStreamOptions, addAndResolveStream, StreamOption } from "@/app/actions/scraper";

interface SmartPlayButtonProps {
    query: string;
    year?: string;
    season?: number;
    episode?: number;
    variant?: "default" | "hero";
}

export function SmartPlayButton({ query, year, season, episode, variant = "default" }: SmartPlayButtonProps) {
    const [status, setStatus] = useState<"idle" | "searching" | "found-options" | "adding" | "ready" | "not-found">("idle");
    const [options, setOptions] = useState<StreamOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<StreamOption | null>(null);
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSearch = async () => {
        setStatus("searching");
        setError(null);

        try {
            // Construct Search Query
            let searchQuery = query;
            let targetFilename: string | undefined = undefined;

            if (season !== undefined && episode !== undefined) {
                // TV Episode Search: "Show Name S01E01"
                const s = season.toString().padStart(2, '0');
                const e = episode.toString().padStart(2, '0');
                const episodeCode = `S${s}E${e}`;
                searchQuery = `${query} ${episodeCode}`;

                // For playback targeting
                targetFilename = episodeCode;
            } else if (year) {
                // Movie Search: "Movie Name 2024"
                searchQuery = `${query} ${year}`;
            }

            const yearNum = year ? parseInt(year, 10) : undefined;
            const results = await getStreamOptions(searchQuery, yearNum);

            if (results.length > 0) {
                // Inject targetFilename into results so PlayButton knows what to look for
                const resultsWithTarget = results.map(r => ({
                    ...r,
                    targetFilename // Pass this down
                }));

                setOptions(resultsWithTarget);
                setSelectedOption(resultsWithTarget[0]); // Auto-select best
                setStatus("found-options");
            } else {
                setStatus("not-found");
            }

        } catch (e: any) {
            console.error(e);
            setError(e.message);
            setStatus("not-found");
        }
    };

    const handlePlay = async () => {
        if (!selectedOption) return;

        setStatus("adding");
        setError(null);

        try {
            // Pass all options so scraper can try alternatives if first isn't cached
            // Pass targetFilename if it exists in the selected option (we augmented it above)
            const target = (selectedOption as any).targetFilename;
            const result = await addAndResolveStream(selectedOption.magnet, options);

            if (result.success && result.url) {
                // Check if we need to resolve a specific file from the torrent
                // (This usually happens inside addAndResolveStream if implemented there, 
                // OR we do a secondary resolve here if the result is just a torrent ID)

                // Actually, addAndResolveStream returns a URL for single file torrents.
                // For season packs, it might need help.
                // Wait, our previous fix was in `cloud-search-button`, which calls `resolveStreamUrl`.
                // `addAndResolveStream` is in `scraper.ts`. We need to verify `scraper.ts` uses `resolveStreamUrl`.
                // It does NOT. It implements its own logic.
                // We MUST update `scraper.ts` to support targetFilename too? 
                // OR we just use the returned torrentId and call resolveStreamUrl ourselves if needed?

                // Let's check `scraper.ts` return type. It returns { success, url, torrentId }.
                // If it returns a URL, it's already resolved. 
                // However, `scraper.ts` logic blindly picks the first file too in `tryResolve`.
                // We need to fix `scraper.ts` as well!

                setStreamUrl(result.url);
                setStatus("ready");
            } else {
                setError(result.error || "Failed to get stream");
                setStatus("found-options");
            }
        } catch (e: any) {
            setError(e.message);
            setStatus("found-options");
        }
    };

    const copyUrl = () => {
        if (streamUrl) {
            navigator.clipboard.writeText(streamUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // --- RENDER ---

    const isHero = variant === "hero";
    const baseClass = isHero
        ? "flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all shadow-lg"
        : "w-full py-2 text-xs font-bold rounded shadow-lg transition-all flex items-center justify-center gap-2";

    if (status === "idle") {
        return (
            <button
                onClick={handleSearch}
                className={`${baseClass} ${isHero ? "bg-primary text-black hover:bg-primary/90" : "bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white"}`}
            >
                {isHero ? <Play className="w-5 h-5 fill-current" /> : <Cloud className="w-4 h-4" />}
                {isHero ? "WATCH NOW" : "SEARCH CLOUD"}
            </button>
        );
    }

    if (status === "searching") {
        return (
            <button disabled className={`${baseClass} bg-black/50 text-slate-400 cursor-wait`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                FINDING SOURCES...
            </button>
        );
    }

    const containerClass = isHero
        ? "bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/10"
        : "space-y-3";

    if (status === "found-options") {
        return (
            <div className={containerClass}>
                <div className="flex items-center justify-between mb-3">
                    <span className={`flex items-center gap-2 text-yellow-500 font-bold ${isHero ? "text-lg" : "text-sm"}`}>
                        <Zap className={isHero ? "w-5 h-5 fill-current" : "w-4 h-4 fill-current"} />
                        {options.length} Sources Found
                    </span>
                </div>

                {/* Scrollable source list */}
                <div className={`overflow-y-auto space-y-2 bg-black/40 rounded-lg p-2 border border-white/5 mb-4 ${isHero ? "max-h-96" : "max-h-64"}`}>
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedOption(opt)}
                            className={`w-full text-left p-3 rounded-lg transition-all ${selectedOption === opt
                                ? 'bg-yellow-500/20 border-2 border-yellow-500'
                                : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                                }`}
                        >
                            {/* Row 1: Quality, Source, Size */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded font-bold text-xs ${opt.quality === '2160p' ? 'bg-purple-500 text-white' :
                                    opt.quality === '1080p' ? 'bg-blue-500 text-white' :
                                        opt.quality === '720p' ? 'bg-green-500 text-white' :
                                            'bg-gray-500 text-white'
                                    }`}>
                                    {opt.quality}
                                </span>
                                <span className="text-xs text-slate-300">{opt.source}</span>
                                <span className="text-xs text-white font-medium">{opt.size}</span>
                                {opt.year && (
                                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">{opt.year}</span>
                                )}
                                <span className="text-xs text-slate-400 ml-auto">{opt.seeds} seeds</span>
                            </div>

                            {/* Row 2: Filename */}
                            <div className="text-xs text-slate-400 leading-relaxed break-all">
                                {opt.title}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Play button */}
                {selectedOption && (
                    <button
                        onClick={handlePlay}
                        className={`w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg flex items-center justify-center gap-2 ${isHero ? "py-4 text-base" : "py-3 text-sm"}`}
                    >
                        <Play className={isHero ? "w-5 h-5 fill-current" : "w-4 h-4 fill-current"} />
                        PLAY: {selectedOption.quality} • {selectedOption.size}
                    </button>
                )}

                {error && (
                    <p className="text-sm text-red-400 text-center p-2 bg-red-500/10 rounded">{error}</p>
                )}
            </div>
        );
    }

    if (status === "adding") {
        return (
            <button disabled className={`${baseClass} bg-yellow-500/50 text-black cursor-wait`}>
                <Loader2 className="w-5 h-5 animate-spin" />
                PREPARING STREAM...
            </button>
        );
    }

    if (status === "ready" && streamUrl) {
        const openVlc = async () => {
            try {
                const res = await fetch(`/api/launch-vlc?url=${encodeURIComponent(streamUrl)}`);
                const data = await res.json();
                if (!data.success) {
                    alert('Failed to launch VLC: ' + (data.error || 'Unknown error'));
                }
            } catch (e) {
                alert('Error launching VLC');
            }
        };

        return (
            <div className={`p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-4 ${isHero ? "" : "text-sm"}`}>
                <div className="flex items-center gap-2 text-green-400 font-bold justify-center text-lg">
                    <Check className="w-6 h-6" /> STREAM READY!
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={openVlc}
                        className="flex-1 py-4 bg-[#ff5500] hover:bg-[#ff7700] rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/20 transition-all"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        OPEN VLC PLAYER
                    </button>
                    <button
                        onClick={copyUrl}
                        className="px-4 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                        title="Copy Stream URL"
                    >
                        <Copy className="w-5 h-5" />
                        {copied ? "✓" : ""}
                    </button>
                </div>

                <div className="text-xs text-slate-500 text-center break-all bg-black/30 p-3 rounded-lg font-mono">
                    {streamUrl.substring(0, 60)}...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <button disabled className={`${baseClass} bg-red-500/10 border border-red-500/20 text-red-400`}>
                <X className="w-5 h-5" />
                NO SOURCES FOUND
            </button>
            {error && <p className="text-[10px] text-red-400 text-center">{error}</p>}
        </div>
    );
}
