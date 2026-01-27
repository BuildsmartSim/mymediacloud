"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getUserTraktData } from "@/app/actions/trakt";

interface TraktContextType {
    watchlist: Set<number>;
    historyMovies: Set<number>;
    historyShows: Set<number>;
    refresh: () => Promise<void>;
    isLoading: boolean;
}

const TraktContext = createContext<TraktContextType>({
    watchlist: new Set(),
    historyMovies: new Set(),
    historyShows: new Set(),
    refresh: async () => { },
    isLoading: true,
});

export function TraktProvider({ children }: { children: ReactNode }) {
    const [watchlist, setWatchlist] = useState<Set<number>>(new Set());
    const [historyMovies, setHistoryMovies] = useState<Set<number>>(new Set());
    const [historyShows, setHistoryShows] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const refresh = async () => {
        try {
            const data = await getUserTraktData();
            setWatchlist(new Set(data.watchlist as number[]));
            setHistoryMovies(new Set(data.historyMovies as number[]));
            setHistoryShows(new Set(data.historyShows as number[]));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <TraktContext.Provider value={{ watchlist, historyMovies, historyShows, refresh, isLoading }}>
            {children}
        </TraktContext.Provider>
    );
}

export function useTrakt() {
    return useContext(TraktContext);
}
