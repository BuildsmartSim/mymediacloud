"use client";

import { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import { X, Maximize, Minimize, Settings, SkipForward, Play, Pause, Cast } from "lucide-react";
import { cn } from "@/lib/utils";
import { XRayOverlay } from "./xray-overlay";

interface VideoPlayerProps {
    url: string;
    poster?: string;
    title?: string;
    details?: any; // For X-Ray data (cast, etc)
    onClose?: () => void;
    onTraktProgress?: (percentage: number) => void;
    onTraktComplete?: () => void;
}

export function VideoPlayer({ url, poster, title, details, onClose, onTraktProgress, onTraktComplete }: VideoPlayerProps) {
    const artRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<Artplayer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!artRef.current) return;

        const art = new Artplayer({
            container: artRef.current,
            url: url,
            poster: poster || "",
            volume: 1,
            isLive: false,
            muted: false,
            autoplay: true,
            pip: true,
            autoSize: true,
            autoMini: true,
            screenshot: true,
            setting: true,
            loop: false,
            flip: true,
            playbackRate: true,
            aspectRatio: true,
            fullscreen: true,
            fullscreenWeb: true,
            subtitleOffset: true,
            miniProgressBar: true,
            mutex: true,
            backdrop: true,
            playsInline: true,
            autoPlayback: true,
            airplay: true,
            theme: '#ff5500', // Primary color

            // HLS Support
            customType: {
                m3u8: function (video: HTMLVideoElement, url: string, art: Artplayer) {
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        art.hls = hls;
                        art.on('destroy', () => hls.destroy());
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                    } else {
                        art.notice.show = 'Unsupported playback format: m3u8';
                    }
                },
            },
        });

        // Event Listeners
        art.on('play', () => {
            setIsPlaying(true);
            setShowOverlay(false);
        });

        art.on('pause', () => {
            setIsPlaying(false);
            setShowOverlay(true); // Auto-show X-Ray on pause? Maybe subtle version.
        });

        art.on('video:timeupdate', () => {
            const percentage = (art.currentTime / art.duration) * 100;
            setProgress(percentage);

            // Trakt Scrobbling Logic (throttled in parent usually, but we fire events)
            if (onTraktProgress) onTraktProgress(percentage);

            // Completion check (e.g., 90%)
            if (percentage > 90 && onTraktComplete) {
                // Trigger once logic handled in parent usually
                onTraktComplete();
            }
        });

        art.on('ready', () => {
            console.log('Player Ready');
        });

        playerRef.current = art;

        return () => {
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy(false);
            }
        };
    }, [url]);

    // Keyboard shortcuts for overlay
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                setShowOverlay(true);
            } else if (e.key === 'ArrowDown') {
                setShowOverlay(false);
            } else if (e.key === 'Escape') {
                if (onClose) onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[9999] bg-black animate-in fade-in duration-300 w-screen h-screen">
            {/* Player Container */}
            <div ref={artRef} className="w-full h-full absolute inset-0 z-0" />

            {/* Manual Play Button Overlay (if blocked or paused) */}
            {!isPlaying && !showOverlay && (
                <div className="absolute inset-0 flex items-center justify-center z-[10005] pointer-events-none">
                    <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 animate-pulse pointer-events-auto cursor-pointer group"
                        onClick={() => playerRef.current?.play()}>
                        <Play className="w-8 h-8 text-white fill-current group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            )}

            {/* Custom Top Bar */}
            <div className={cn(
                "absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 pointer-events-none z-[10010]",
                isPlaying && !showOverlay ? "opacity-0" : "opacity-100"
            )}>
                <div className="pointer-events-auto">
                    <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors flex items-center gap-2 pr-4">
                        <X className="w-6 h-6" />
                        <span className="text-xs font-bold">CLOSE</span>
                    </button>
                </div>

                <div className="text-right pointer-events-auto">
                    <h2 className="text-xl font-bold text-white shadow-black drop-shadow-md">{title}</h2>
                    <p className="text-sm text-slate-300 font-medium">In-App Player</p>
                </div>
            </div>

            {/* X-Ray Overlay Drawer */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 transition-transform duration-500 ease-out z-[10020]",
                showOverlay ? "translate-y-0" : "translate-y-full"
            )}>
                <XRayOverlay details={details} onClose={() => setShowOverlay(false)} />
            </div>

            {/* X-Ray Toggle (Visible when controls hidden) */}
            {!showOverlay && (
                <div className={cn(
                    "absolute bottom-8 right-8 transition-opacity duration-300 z-[10010]",
                    isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                )}>
                    <button
                        onClick={() => setShowOverlay(true)}
                        className="px-6 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-white uppercase tracking-widest transition-all hover:scale-105 flex items-center gap-2"
                    >
                        <Cast className="w-4 h-4" />
                        X-Ray
                    </button>
                </div>
            )}
        </div>
    );
}
