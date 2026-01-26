"use server";

// This action now just validates parameters and returns them.
// The actual torrent fetch happens client-side to avoid Vercel IP blocking.

export interface TorrentSearchParams {
    query: string;
    year?: number;
}

export async function prepareSearch(query: string, year?: number): Promise<TorrentSearchParams> {
    return { query, year };
}
