"use client";


import { useState } from "react";
import { Play, Loader2, X, Copy, ExternalLink, Download } from "lucide-react";
import { resolveStreamUrl } from "@/app/actions/stream";
import { cn } from "@/lib/utils";

interface PlayButtonProps {
    torrentId: string;
    filename?: string;
    targetFilename?: string; // New prop for specific file selection
    className?: string;
    variant?: "primary" | "icon" | "minimal";
    label?: string;
}

export function PlayButton({ torrentId, filename, targetFilename, className, variant = "primary", label = "PLAY" }: PlayButtonProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);
    const [open, setOpen] = useState(false);

    // Detect mobile
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handlePlay = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);
        setOpen(true);
        setResult(null);

        try {
            const res = await resolveStreamUrl(torrentId, targetFilename); // Pass targetFilename
            setResult(res as any);

            // AUTO-LAUNCH FOR MOBILE
            if (isMobile && res && (res as any).url) {
                window.location.href = `vlc://${(res as any).url}`;
            }

        } catch (err) {
            setResult({ error: "Failed to resolve stream." });
        } finally {
            setLoading(false);
        }
    };

    const close = () => {
        setOpen(false);
        setResult(null);
    };

    return (
        <>
            {/* The Trigger Button */}
            {variant === "primary" && (
                <button
                    onClick={handlePlay}
                    className={cn("mt-3 w-full py-2 bg-primary text-black text-xs font-bold rounded shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2", className)}
                >
                    <Play className="w-3 h-3 fill-current" />
                    PLAY
                </button>
            )}

            {variant === "icon" && (
                <button
                    onClick={handlePlay}
                    className={cn("p-2 rounded-full bg-primary text-black hover:bg-primary/90 transition-colors", className)}
                >
                    <Play className="w-5 h-5 fill-current" />
                </button>
            )}

            {variant === "minimal" && (
                <button
                    onClick={handlePlay}
                    className={cn("p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors", className)}
                >
                    <Download className="w-4 h-4" />
                </button>
            )}

            {/* The Modal Overlay */}
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                        {/* Close Button */}
                        <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">
                                {loading && "Resolving Link..."}
                                {!loading && result?.url && "Ready to Play"}
                                {!loading && result?.error && "Error"}
                            </h3>

                            {loading && (
                                <div className="flex flex-col items-center justify-center py-8 gap-4">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    <p className="text-sm text-slate-400">Unrestricting via Real-Debrid...</p>
                                </div>
                            )}

                            {!loading && result?.error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {result.error}
                                </div>
                            )}

                            {!loading && result?.url && (
                                <div className="space-y-4">
                                    <div className="p-3 bg-black/50 rounded-lg border border-white/5">
                                        <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">Direct Link</p>
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs text-green-400 truncate flex-1 font-mono">
                                                {result.url}
                                            </code>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(result.url!)}
                                                className="p-2 hover:bg-white/10 rounded"
                                                title="Copy to Clipboard"
                                            >
                                                <Copy className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <a
                                            href={result.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </a>
                                        <button
                                            onClick={async () => {
                                                if (isMobile) {
                                                    window.location.href = `vlc://${result.url}`;
                                                } else {
                                                    try {
                                                        const res = await fetch(`/api/launch-vlc?url=${encodeURIComponent(result.url!)}`);
                                                        const data = await res.json();
                                                        if (!res.ok) throw new Error(data.error || 'Failed to launch');
                                                    } catch (err: any) {
                                                        alert('Failed to launch VLC: ' + err.message);
                                                    }
                                                }
                                            }}
                                            className="flex items-center justify-center gap-2 py-3 bg-[#ff5500] hover:bg-[#ff7700] text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                            {isMobile ? "Open App" : "Launch VLC"}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-center text-slate-500 mt-2">
                                        {isMobile
                                            ? "* Tries to open VLC app directly"
                                            : "* Launches VLC Player on the host machine"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
