"use client";

import { useState } from "react";
import { Cloud, Check, X, Loader2, Zap, Play, Copy, Download, MonitorPlay, Film } from "lucide-react";
import { getStreamOptions, addAndResolveStream, StreamOption } from "@/app/actions/scraper";
import { usePlayer } from "@/components/providers/player-provider";
import { addToHistory, addToWatchlist, removeFromWatchlist } from "@/lib/api/trakt"; // Hypothetical imports for now - we'll implement these later if needed here, or handle in player

interface SmartPlayButtonProps {
    query: string;
    tmdbId?: number; // Pass this for X-Ray
    title?: string; // For Player Title
    poster?: string; // For Player Poster
    year?: string;
    season?: number;
    episode?: number;
    variant?: "default" | "hero";
    details?: any; // Full TMDB details for X-Ray
}

export function SmartPlayButton({ query, tmdbId, title, poster, year, season, episode, variant = "default", details }: SmartPlayButtonProps) {
    const [status, setStatus] = useState<"idle" | "searching" | "found-options" | "adding" | "ready" | "playing" | "not-found">("idle");
    const [options, setOptions] = useState<StreamOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<StreamOption | null>(null);
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const { play } = usePlayer();

    // Player Mode: 'embedded' | 'external'
    const [playerMode, setPlayerMode] = useState<'embedded' | 'external'>('embedded');

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

    const handlePlay = async (mode: 'embedded' | 'external') => {
        if (!selectedOption) return;

        setStatus("adding");
        setError(null);
        setPlayerMode(mode);

        try {
            const target = (selectedOption as any).targetFilename;

            // Pass the mode ('embedded' or 'external') to the resolver
            // It will smart-filter MKVs for embedded mode
            const result = await addAndResolveStream(selectedOption.magnet, options, target, mode);

            if (result.success && result.url) {
                setStreamUrl(result.url);

                if (mode === 'external') {
                    // AUTO-LAUNCH FOR MOBILE or DESKTOP VLC Protocol
                    window.location.href = `vlc://${result.url}`;
                    setStatus("ready");
                } else {
                    // Start Global Player
                    play(result.url, title || query, poster, details);
                    setStatus("found-options"); // Reset UI to options, player opens on top
                }

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

    // Scrobbling Logic
    const handleTraktProgress = (percentage: number) => {
        // Here we would call the Trakt API to update progress
        // throttle this to every 15s or 1%
        // console.log("Scrobbling:", percentage);
    };

    const handleTraktComplete = () => {
        // Mark as watched
        console.log("Marking as watched on Trakt");
    };


    // --- RENDER ---

    const isHero = variant === "hero";
    const baseClass = isHero
        ? "flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all shadow-lg"
        : "w-full py-2 text-xs font-bold rounded shadow-lg transition-all flex items-center justify-center gap-2";

    // 2. IDLE STATE
    if (status === "idle") {
        return (
            <button
                onClick={handleSearch}
                className={`${baseClass} ${isHero ? "bg-primary text-black hover:bg-primary/90 shadow-[0_0_30px_rgba(212,175,55,0.4)]" : "bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-white"}`}
            >
                {isHero ? <Play className="w-5 h-5 fill-current" /> : <Cloud className="w-4 h-4" />}
                {isHero ? "WATCH NOW" : "SEARCH"}
            </button>
        );
    }

    // 3. SEARCHING
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

    // 4. FOUND OPTIONS - SELECTION UI
    if (status === "found-options") {
        return (
            <div className={containerClass}>
                <div className="flex items-center justify-between mb-3 px-2">
                    <span className={`flex items-center gap-2 text-primary font-bold ${isHero ? "text-lg" : "text-sm"}`}>
                        <Zap className={isHero ? "w-5 h-5 fill-current" : "w-4 h-4 fill-current"} />
                        {options.length} Sources Found
                    </span>
                    <button
                        onClick={() => setStatus("idle")}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable source list could go here, but keeping it compact for now or allowing expand */}
                <div className={`overflow-y-auto space-y-1 pr-2 mb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${isHero ? "max-h-96" : "max-h-64"}`}>
                    {options.map((opt, i) => (
                        <div key={i} onClick={() => setSelectedOption(opt)}
                            className={`px-3 py-2 rounded flex flex-col gap-1 cursor-pointer border ${selectedOption === opt ? 'bg-primary/10 border-primary/30 text-primary' : 'border-transparent hover:bg-white/5 text-muted-foreground'}`}>

                            <div className="flex items-center gap-2 overflow-hidden w-full">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0 ${opt.quality === '2160p' ? 'bg-primary text-black' : 'bg-muted text-muted-foreground border border-white/10'}`}>{opt.quality}</span>
                                <span className="text-xs truncate font-medium flex-1">{opt.title}</span>
                                <span className="text-[10px] font-mono opacity-50 whitespace-nowrap">{opt.size}</span>
                            </div>

                            {/* Tags Row */}
                            {Array.isArray(opt.tags) && opt.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pl-1">
                                    {opt.tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-1 rounded border border-white/10 text-slate-400 bg-black/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* DUAL ACTION BUTTONS */}
                {selectedOption && (
                    <div className="grid grid-cols-2 gap-3">
                        {/* CONVENIENCE MODE */}
                        <button
                            onClick={() => handlePlay('embedded')}
                            className={`flex flex-col items-center justify-center gap-1 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-all group active:scale-95`}
                        >
                            <MonitorPlay className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                            <div className="text-center">
                                <span className="block text-xs font-bold">WATCH NOW</span>
                                <span className="block text-[10px] text-slate-400">Integrated Player</span>
                            </div>
                        </button>

                        {/* CINEPHILE MODE */}
                        <button
                            onClick={() => handlePlay('external')}
                            className={`flex flex-col items-center justify-center gap-1 p-3 bg-black/40 hover:bg-black/60 border border-white/5 hover:border-white/20 rounded-xl text-slate-300 hover:text-white transition-all group active:scale-95`}
                        >
                            <Film className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                            <div className="text-center">
                                <span className="block text-xs font-bold">EXTERNAL VLC</span>
                                <span className="block text-[10px] text-slate-500">Max Quality • HDR</span>
                            </div>
                        </button>
                    </div>
                )}

                {error && (
                    <p className="text-sm text-red-400 text-center p-2 bg-red-500/10 rounded">{error}</p>
                )}
            </div>
        );
    }

    // 5. ADDING / LOADING STREAM
    if (status === "adding") {
        return (
            <button disabled className={`${baseClass} bg-primary/20 text-primary cursor-wait`}>
                <Loader2 className="w-5 h-5 animate-spin" />
                {playerMode === 'embedded' ? "STARTING PLAYER..." : "PREPARING VLC LINK..."}
            </button>
        );
    }

    // 6. READY (For External Launch fallback)
    if (status === "ready" && streamUrl) {
        const handleVlc = () => {
            const m3uContent = `#EXTM3U\n#EXTINF:-1,CloudStream Content\n${streamUrl}`;
            const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'stream.m3u');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        };

        return (
            <div className={`p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-4 ${isHero ? "" : "text-sm"}`}>
                <div className="flex items-center gap-2 text-green-400 font-bold justify-center text-lg">
                    <Check className="w-6 h-6" /> VLC LINK READY!
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={async () => {
                            window.location.href = `vlc://${streamUrl}`;
                        }}
                        className="flex-1 py-4 bg-[#ff5500] hover:bg-[#ff7700] rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg backdrop-blur-md transition-all border border-white/5 hover:border-white/20"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        LAUNCH AGAIN
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

                <div className="text-center">
                    <button onClick={() => setStatus("playing")} className="text-xs text-primary underline hover:text-primary/80">
                        Or play in browser
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
