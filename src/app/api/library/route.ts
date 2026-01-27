import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');

// Ensure directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

export async function GET(request: NextRequest) {
    try {
        const files = fs.readdirSync(DOWNLOAD_DIR);

        const fileStats = files.map(file => {
            const filePath = path.join(DOWNLOAD_DIR, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: stats.size,
                created: stats.birthtime,
                path: filePath
            };
        });

        // Sort by newest first
        fileStats.sort((a, b) => b.created.getTime() - a.created.getTime());

        return NextResponse.json({ files: fileStats });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { filename } = await request.json();
        if (!filename) return NextResponse.json({ error: 'Filename required' }, { status: 400 });

        // Security check: simple path traversal prevention
        const safeFilename = path.basename(filename);
        const filePath = path.join(DOWNLOAD_DIR, safeFilename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
