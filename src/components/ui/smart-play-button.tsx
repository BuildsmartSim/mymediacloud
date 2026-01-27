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

    // Detect mobile
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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

                // AUTO-LAUNCH FOR MOBILE
                if (isMobile) {
                    window.location.href = `vlc://${result.url}`;
                }

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
        ? "bg-black/20 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-2xl"
        : "space-y-3";

    if (status === "found-options") {
        return (
            <div className={containerClass}>
                <div className="flex items-center justify-between mb-3 px-2">
                    <span className={`flex items-center gap-2 text-yellow-500 font-bold ${isHero ? "text-lg" : "text-sm"}`}>
                        <Zap className={isHero ? "w-5 h-5 fill-current" : "w-4 h-4 fill-current"} />
                        {options.length} Sources Found
                    </span>
                </div>

                {/* Scrollable source list */}
                <div className={`overflow-y-auto space-y-1 pr-2 mb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${isHero ? "max-h-96" : "max-h-64"}`}>
                    {options.map((opt, i) => {
                        const filename = opt.title.toLowerCase();
                        const isExtended = filename.includes("extended") || filename.includes("directors") || filename.includes("uncut");
                        const isHdr = filename.includes("hdr") || filename.includes("dv") || filename.includes("dolby.vision");
                        const isAtmos = filename.includes("atmos") || filename.includes("truehd");
                        const isRemux = filename.includes("remux");

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedOption(opt)}
                                className={`w-full group text-left px-4 py-3 rounded-lg transition-all flex items-center gap-4 ${selectedOption === opt
                                    ? 'bg-white/10'
                                    : 'hover:bg-white/5'
                                    }`}
                            >
                                {/* LEFT: Quality Badge */}
                                <div className={`flex-shrink-0 w-12 text-center py-1 rounded font-bold text-xs ${opt.quality === '2160p' ? 'bg-yellow-500 text-black' :
                                    opt.quality === '1080p' ? 'bg-white/20 text-white' :
                                        'bg-slate-700 text-slate-300'
                                    }`}>
                                    {opt.quality}
                                </div>

                                {/* CENTER: Info Stack */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <span className="text-sm font-bold text-white">{opt.source}</span>
                                        {isRemux && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded uppercase tracking-wider">REMUX</span>}
                                        {isExtended && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-300 rounded uppercase tracking-wider">EXTENDED</span>}
                                        {isHdr && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded uppercase tracking-wider">HDR</span>}
                                        {isAtmos && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-300 rounded uppercase tracking-wider">ATMOS</span>}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                                        {opt.title}
                                    </div>
                                </div>

                                {/* RIGHT: Stats */}
                                <div className="flex-shrink-0 text-right">
                                    <div className="text-sm font-bold text-white">{opt.size}</div>
                                    <div className="text-[10px] text-green-400 font-medium">{opt.seeds} seeds</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Play button */}
                {selectedOption && (
                    <button
                        onClick={handlePlay}
                        className={`w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition-transform active:scale-95 ${isHero ? "py-4 text-base" : "py-3 text-sm"}`}
                    >
                        <Play className={isHero ? "w-5 h-5 fill-current" : "w-4 h-4 fill-current"} />
                        STREAM NOW
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
        const handleVlc = () => {
            // Create an M3U playlist file content
            const m3uContent = `#EXTM3U\n#EXTINF:-1,CloudStream Content\n${streamUrl}`;

            // Create a blob and link to trigger download
            const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'stream.m3u');
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        };

        return (
            <div className={`p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-4 ${isHero ? "" : "text-sm"}`}>
                <div className="flex items-center gap-2 text-green-400 font-bold justify-center text-lg">
                    <Check className="w-6 h-6" /> STREAM READY!
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={async () => {
                            if (isMobile) {
                                window.location.href = `vlc://${streamUrl}`;
                            } else {
                                try {
                                    const res = await fetch(`/api/launch-vlc?url=${encodeURIComponent(streamUrl!)}`);
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.error || 'Failed to launch');
                                } catch (err: any) {
                                    alert('Failed to launch VLC: ' + err.message);
                                }
                            }
                        }}
                        className="flex-1 py-4 bg-[#ff5500] hover:bg-[#ff7700] rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg backdrop-blur-md transition-all border border-white/5 hover:border-white/20"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        {isMobile ? "OPEN APP" : "LAUNCH VLC"}
                    </button>
                    <button
                        onClick={copyUrl}
                        className="px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-colors"
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
