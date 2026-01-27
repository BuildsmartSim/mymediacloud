"use client";

import { TraktProvider as TraktProviderContext } from "@/context/trakt-context";

export function TraktProvider({ children }: { children: React.ReactNode }) {
    return <TraktProviderContext>{children}</TraktProviderContext>;
}
