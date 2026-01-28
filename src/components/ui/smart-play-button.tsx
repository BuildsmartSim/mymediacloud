"use client";

import { useState } from "react";
import { X, Loader2, Play, Download, Film } from "lucide-react";
import { getStreamOptions, addAndResolveStream, StreamOption } from "@/app/actions/scraper";
import { usePlayer } from "@/components/providers/player-provider";

interface SmartPlayButtonProps {
    query: string;
    tmdbId?: number; // Pass this for X-Ray
    title?: string; // For Player Title
    poster?: string; // For Player Poster
    year?: string;
    season?: number;
    episode?: number;
    variant?: "default" | "hero" | "card";
    details?: any; // Full TMDB details for X-Ray
}

export function SmartPlayButton({ query, tmdbId, title, poster, year, season, episode, variant = "default", details }: SmartPlayButtonProps) {
    const { play } = usePlayer();

    // States
    const [status, setStatus] = useState<"idle" | "searching" | "resolving-auto" | "selecting-vlc" | "selecting-download">("idle");
    const [options, setOptions] = useState<StreamOption[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingMsg, setLoadingMsg] = useState<string>("");

    // Helper to perform search
    const performSearch = async () => {
        let searchQuery = query;
        let targetFilename: string | undefined = undefined;
        const yearNum = year ? parseInt(year, 10) : undefined;

        if (season !== undefined && episode !== undefined) {
            const s = season.toString().padStart(2, '0');
            const e = episode.toString().padStart(2, '0');
            const episodeCode = `S${s}E${e}`;
            searchQuery = `${query} ${episodeCode}`;
            targetFilename = episodeCode;
        } else if (year) {
            searchQuery = `${query} ${year}`;
        }

        const results = await getStreamOptions(searchQuery, yearNum);

        // Inject targetFilename for the resolver
        return results.map(r => ({ ...r, targetFilename }));
    };

    // 1. WATCH NOW (Auto-Play)
    const handleWatchNow = async () => {
        setStatus("searching");
        setLoadingMsg("Finding best stream...");
        setError(null);

        try {
            const results = await performSearch();

            if (results.length === 0) {
                setStatus("idle");
                setError("No streams found.");
                return;
            }

            // Auto-Resolve Logic
            setStatus("resolving-auto");
            setLoadingMsg("Starting playback...");

            // Try the first result, but let the resolver loop for compatible ones
            const bestOption = results[0];
            const result = await addAndResolveStream(bestOption.magnet, results, (bestOption as any).targetFilename, 'embedded');

            if (result.success && result.url) {
                play(result.url, title || query, poster, details);
                setStatus("idle"); // Reset to idle since player is global
            } else {
                setError(result.error || "Could not play stream. Try VLC.");
                setOptions(results); // Fallback to list so they can try manually? Or just error.
                setStatus("selecting-vlc"); // Fallback to manual selection
            }

        } catch (e: any) {
            setError(e.message);
            setStatus("idle");
        }
    };

    // 2. WATCH IN VLC (Manual Selection)
    const handleVLC = async () => {
        setStatus("searching");
        setLoadingMsg("Finding sources for VLC...");
        setError(null);

        try {
            const results = await performSearch();
            if (results.length === 0) {
                setStatus("idle");
                setError("No streams found.");
                return;
            }
            setOptions(results);
            setStatus("selecting-vlc");
        } catch (e: any) {
            setError(e.message);
            setStatus("idle");
        }
    };

    // 3. DOWNLOAD (Manual Selection)
    const handleDownload = async () => {
        setStatus("searching");
        setLoadingMsg("Finding downloads...");
        setError(null);

        try {
            const results = await performSearch();
            if (results.length === 0) {
                setStatus("idle");
                setError("No streams found.");
                return;
            }
            setOptions(results);
            setStatus("selecting-download");
        } catch (e: any) {
            setError(e.message);
            setStatus("idle");
        }
    };

    // Action: Select Option (VLC or Download)
    const handleSelectOption = async (opt: StreamOption) => {
        const mode = status === "selecting-vlc" ? 'external' : 'download';
        const target = (opt as any).targetFilename;

        // Optimistic UI updates
        // If downloading, maybe toast? For now, simple.

        try {
            const result = await addAndResolveStream(opt.magnet, options, target, 'external'); // external mode for raw link

            if (result.success && result.url) {
                if (mode === 'external') {
                    window.location.href = `vlc://${result.url}`;
                } else {
                    // DIRECT BROWSER DOWNLOAD
                    // We simply open the URL. Real-Debrid headers usually force download for these links.
                    // If not, the browser will try to play it, but users can "Save As".
                    const link = document.createElement('a');
                    link.href = result.url;
                    link.setAttribute('download', result.filename || `${query}.mp4`);
                    link.setAttribute('target', '_blank'); // Determine if needs new tab
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    setStatus("idle");
                }
            }
        } catch (e) {
            console.error(e);
        }
    };


    // --- RENDER ---
    const isHero = variant === "hero";
    const isCard = variant === "card";

    // LOADING STATE
    if (status === "searching" || status === "resolving-auto") {
        return (
            <button disabled className={`px-8 py-4 font-bold rounded-xl flex items-center gap-3 bg-white/5 text-slate-300 animate-pulse border border-white/10 ${isHero ? "text-lg" : "text-sm"} ${isCard ? "w-full py-2 px-4 justify-center" : ""}`}>
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                {loadingMsg}
            </button>
        );
    }

    // SELECTION MODAL (VLC or DOWNLOAD)
    if (status === "selecting-vlc" || status === "selecting-download") {
        return (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {status === "selecting-vlc" ? <Film className="w-5 h-5 text-orange-500" /> : <Download className="w-5 h-5 text-blue-500" />}
                            {status === "selecting-vlc" ? "Select Source for VLC" : "Download to Library"}
                        </h3>
                        <button onClick={() => setStatus("idle")} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <div className="space-y-1">
                            {options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectOption(opt)}
                                    className="w-full text-left p-3 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition-all group flex items-center gap-4"
                                >
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${opt.quality?.includes('2160') ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>
                                        {opt.quality}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-primary transition-colors">{opt.title}</p>
                                        <div className="flex gap-3 text-[10px] text-slate-500 font-mono mt-0.5">
                                            <span>{opt.size}</span>
                                            <span className="text-green-500/80">{opt.seeds} seeds</span>
                                            <span>{opt.source}</span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        {status === "selecting-vlc" ? <Play className="w-4 h-4 text-white" /> : <Download className="w-4 h-4 text-white" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // IDLE (DEFAULT UI)
    return (
    // IDLE (DEFAULT UI)
    return (
        <div className="flex flex-wrap gap-3 items-center justify-start md:justify-start w-full">
            {/* Primary: WATCH NOW (Auto-Play) */}
            <button
                onClick={handleWatchNow}
                className={`group relative flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-primary text-black font-black font-serif italic tracking-tight rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] md:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] hover:scale-105 active:scale-95 whitespace-nowrap ${isHero ? "text-lg md:text-xl min-w-[160px]" : "text-sm"} ${isCard ? "w-full py-2 px-4 shadow-none hover:shadow-none font-sans not-italic font-bold" : ""}`}
            >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Play className="w-5 h-5 md:w-6 md:h-6 fill-black" />
                WATCH NOW
            </button>

            {/* Secondary: VLC */}
            <button
                onClick={handleVLC}
                title="Watch in VLC (High Quality)"
                className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95 group flex-none"
            >
                <Film className="w-5 h-5 md:w-6 md:h-6 group-hover:text-orange-400 transition-colors" />
            </button>

            {/* Secondary: Download */}
            <button
                onClick={handleDownload}
                title="Download to Library"
                className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95 group flex-none"
            >
                <Download className="w-5 h-5 md:w-6 md:h-6 group-hover:text-blue-400 transition-colors" />
            </button>

            {error && (
                <div className="w-full md:w-auto md:absolute md:top-full md:mt-2 md:left-0 bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1 rounded text-xs text-center md:text-left">
                    {error}
                </div>
            )}
        </div>
    );
    );
}
