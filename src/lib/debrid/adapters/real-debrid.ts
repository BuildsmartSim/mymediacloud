import { DebridClient, DebridTorrent, UnrestrictedLink, UserInfo } from "../types";

const BASE_URL = "https://api.real-debrid.com/rest/1.0";

export class RealDebridClient implements DebridClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async fetch(endpoint: string, options: RequestInit = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            ...options.headers,
        };

        try {
            const res = await fetch(url, { ...options, headers });

            if (res.status === 204) return null; // No content

            if (!res.ok) {
                // Try to parse error
                try {
                    const err = await res.json();
                    console.error(`RD API Error [${res.status}]:`, err);
                } catch {
                    console.error(`RD API Error [${res.status}]: ${res.statusText}`);
                }
                return null;
            }

            return await res.json();
        } catch (error) {
            console.error("RD Network Error:", error);
            return null;
        }
    }

    async getUserInfo(): Promise<UserInfo | null> {
        const data = await this.fetch("/user");
        if (!data) return null;

        return {
            username: data.username,
            email: data.email,
            credits: data.points,
            premium_left: data.premium, // Seconds left
            type: data.type === 'premium' ? 'premium' : 'free'
        };
    }

    async addMagnet(magnet: string): Promise<{ id: string } | null> {
        const data = new URLSearchParams();
        data.append('magnet', magnet);

        const res = await this.fetch("/torrents/addMagnet", {
            method: 'POST',
            body: data
        });

        if (!res || !res.id) return null;
        return { id: res.id };
    }

    async getTorrents(limit = 50, page = 1): Promise<DebridTorrent[]> {
        const data = await this.fetch(`/torrents?limit=${limit}&page=${page}`);
        if (!Array.isArray(data)) return [];

        return data.map((t: any) => ({
            id: t.id,
            filename: t.filename,
            bytes: t.bytes,
            status: t.status,
            progress: t.progress,
            links: t.links,
            host: t.host
        }));
    }

    async getTorrentInfo(id: string): Promise<DebridTorrent | null> {
        const t = await this.fetch(`/torrents/info/${id}`);
        if (!t) return null;

        return {
            id: t.id,
            filename: t.filename,
            bytes: t.bytes,
            status: t.status,
            progress: t.progress,
            links: t.links,
            host: t.host,
            // RD Specific extras can be attached if needed, but keeping interface clean
            ...t // Spread original files info if needed by advanced scrapers
        } as any;
    }

    async selectFiles(id: string, fileIds: string | 'all'): Promise<boolean> {
        const data = new URLSearchParams();
        data.append('files', fileIds);

        const res = await this.fetch(`/torrents/selectFiles/${id}`, {
            method: 'POST',
            body: data
        });

        // selectFiles often returns 204 or 202
        return res === null || (res && !res.error);
    }

    async unrestrictLink(link: string): Promise<UnrestrictedLink | null> {
        const data = new URLSearchParams();
        data.append('link', link);

        const res = await this.fetch("/unrestrict/link", {
            method: 'POST',
            body: data
        });

        if (!res || !res.download) return null;

        return {
            id: res.id,
            filename: res.filename,
            mimeType: res.mimeType,
            filesize: res.filesize,
            link: res.link,
            download: res.download
        };
    }
}
