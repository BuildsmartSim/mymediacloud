export interface DebridTorrent {
    id: string;
    filename: string;
    bytes: number;
    status: string; // 'downloaded', 'downloading', 'magnet_error', etc.
    progress: number;
    links: string[]; // Original host links
    host?: string;
    files?: {
        id: number;
        path: string;
        bytes: number;
        selected: number; // 0 or 1
    }[];
}

export interface UnrestrictedLink {
    id: string;
    filename: string;
    mimeType: string;
    filesize: number;
    link: string; // Original link
    download: string; // The direct download/stream URL
}

export interface UserInfo {
    username: string;
    email: string;
    credits: number;
    premium_left: number; // Days or seconds depending on provider
    type: 'premium' | 'free';
}

export interface DebridClient {
    /**
     * Get user account info
     */
    getUserInfo(): Promise<UserInfo | null>;

    /**
     * Add a magnet link to the cloud
     */
    addMagnet(magnet: string): Promise<{ id: string } | null>;

    /**
     * Get list of torrents in the cloud
     */
    getTorrents(limit?: number, page?: number): Promise<DebridTorrent[]>;

    /**
     * Get details for a specific torrent
     */
    getTorrentInfo(id: string): Promise<DebridTorrent | null>;

    /**
     * Select files for a torrent (if applicable)
     * Real-Debrid requires this. Premiumize usually auto-selects.
     */
    selectFiles(id: string, fileIds: string | 'all'): Promise<boolean>;

    /**
     * Unrestrict a host link (folder link or direct file link)
     */
    unrestrictLink(link: string): Promise<UnrestrictedLink | null>;
}
