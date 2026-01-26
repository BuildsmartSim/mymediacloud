"use server";

import { getTorrent, unrestrictLink } from "@/lib/api/rd";

export async function resolveStreamUrl(torrentId: string, targetFilename?: string) {
    try {
        console.log(`Resolving Torrent ID: ${torrentId} ${targetFilename ? `(Target: ${targetFilename})` : ''}`);

        // 1. Get Torrent Info to find the resolved links
        const torrent = await getTorrent(torrentId);
        if (!torrent || !torrent.links || torrent.links.length === 0) {
            throw new Error("No links found in this torrent.");
        }

        let targetLink = torrent.links[0]; // Default to first link

        // 2. Select the link based on filename if provided
        if (targetFilename && torrent.files) {
            console.log("Searching for file match...");

            // Real-Debrid 'files' array contains all files in the torrent.
            // 'links' array DOES NOT map 1:1 to 'files' array if some files are not selected.
            // HOWEVER, for 'downloaded' torrents (which we filter for in cloud search), 
            // usually only selected files are present.
            // But 'links' is just a list of URLs. 
            // We can match by finding the file index and hoping the links are in order of selected files?
            // Actually, RD returns 'selected' files with a 'selected' property (1 or 0).
            // A safer bet for playback is to iterate 'files' that are selected (selected === 1)
            // and find our target. The 'links' array *usually* corresponds to the selected files in order.

            const selectedFiles = torrent.files.filter((f: any) => f.selected === 1);
            const fileIndex = selectedFiles.findIndex((f: any) =>
                f.path.toLowerCase().endsWith(targetFilename.toLowerCase()) ||
                f.path.toLowerCase().includes(targetFilename.toLowerCase())
            );

            if (fileIndex !== -1 && torrent.links[fileIndex]) {
                targetLink = torrent.links[fileIndex];
                console.log(`Matched file at index ${fileIndex}: ${targetLink}`);
            } else {
                console.warn("Target file not found in selected files, falling back to first link.");
            }
        }

        console.log(`Unrestricting link: ${targetLink}`);

        // 3. Unrestrict it
        const json = await unrestrictLink(targetLink);

        if (json && json.download) {
            return { url: json.download, filename: json.filename, mime: json.mimeType };
        } else {
            console.error("Unrestrict failed:", json);
            throw new Error("Failed to unrestrict link.");
        }

    } catch (e: any) {
        console.error("Stream Resolution Error:", e);
        return { error: e.message };
    }
}
