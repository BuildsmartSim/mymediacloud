import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Configure your local download directory here
// Ideally this should be configurable via env or settings
const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');

// Ensure directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
    try {
        const { url, filename } = await request.json();

        if (!url || !filename) {
            return NextResponse.json({ error: 'Missing url or filename' }, { status: 400 });
        }

        console.log(`[Download] Starting download: ${filename} from ${url}`);

        // Fetch the file from RD (or wherever)
        // Note: This relies on the server having enough bandwidth and not timing out.
        // For large files, a background job queue (like BullMQ) is better, but this is a simple start.
        const response = await fetch(url);

        if (!response.ok || !response.body) {
            throw new Error(`Failed to fetch source: ${response.statusText}`);
        }

        const safeFilename = filename.replace(/[^a-z0-9.]/gi, '_');
        const filePath = path.join(DOWNLOAD_DIR, safeFilename);
        const fileStream = fs.createWriteStream(filePath);

        // Pipe the web stream to the file stream
        // @ts-ignore - Readable.fromWeb is available in newer Node versions or use standard piping
        const reader = response.body.getReader();

        // Simple stream pump
        const pump = async () => {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fileStream.write(value);
            }
            fileStream.end();
        };

        // We don't await the pump here if we want to return "Started" immediately
        // BUT Vercel/Next serverless functions will kill the process if we return.
        // Since this is likely running on a persistent local server (user mentioned "hard drive"),
        // we might get away with it if it's `npm run start`.
        // However, it's safer to wait or use a real background worker.
        // For this iteration, we'll await it to ensure it works, but warn user about timeouts.

        await pump();

        console.log(`[Download] Completed: ${filePath}`);
        return NextResponse.json({ success: true, path: filePath });

    } catch (error: any) {
        console.error('[Download] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
