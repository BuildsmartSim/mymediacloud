"use client";

import { usePlayer } from "@/components/providers/player-provider";
import { VideoPlayer } from "@/components/ui/video-player/player";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AnimatePresence, motion } from "framer-motion";

export function GlobalPlayer() {
    const { state, close } = usePlayer();

    if (!state.isOpen || !state.url) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black">
            <ErrorBoundary>
                <VideoPlayer
                    url={state.url}
                    title={state.title || "Unknown Title"}
                    poster={state.poster || ""}
                    details={state.details}
                    onClose={close}
                />
            </ErrorBoundary>
        </div>
    );
}
