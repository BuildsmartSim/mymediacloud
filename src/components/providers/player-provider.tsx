"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { StreamOption } from "@/app/actions/scraper";

interface PlayerState {
    isOpen: boolean;
    url: string | null;
    title: string | null;
    poster: string | null;
    details: any | null; // XRay Details
}

interface PlayerContextType {
    state: PlayerState;
    play: (url: string, title?: string, poster?: string, details?: any) => void;
    close: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<PlayerState>({
        isOpen: false,
        url: null,
        title: null,
        poster: null,
        details: null,
    });

    const play = (url: string, title?: string, poster?: string, details?: any) => {
        setState({
            isOpen: true,
            url,
            title: title || null,
            poster: poster || null,
            details: details || null,
        });
    };

    const close = () => {
        setState(prev => ({ ...prev, isOpen: false, url: null }));
    };

    return (
        <PlayerContext.Provider value={{ state, play, close }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}
