const BASE_URL = "https://yts.mx/api/v2";

export interface YTSMovie {
    id: number;
    url: string;
    imdb_code: string;
    title: string;
    year: number;
    rating: number;
    torrents: YTSTorrent[];
}

export interface YTSTorrent {
    url: string;
    hash: string;
    quality: "720p" | "1080p" | "2160p" | "3D";
    type: string;
    seeds: number;
    peers: number;
    size: string;
    size_bytes: number;
    date_uploaded: string;
}

export async function searchYTS(query: string): Promise<YTSMovie[]> {
    try {
        // limit=20 is default, sort by seeds to get best sources first
        const res = await fetch(`${BASE_URL}/list_movies.json?query_term=${encodeURIComponent(query)}&sort_by=seeds&limit=20`);

        if (!res.ok) {
            console.error("YTS Fetch Error:", res.statusText);
            return [];
        }

        const data = await res.json();

        if (data.status !== "ok" || !data.data.movies) {
            return [];
        }

        return data.data.movies;
    } catch (error) {
        console.error("YTS Search Exception:", error);
        return [];
    }
}
