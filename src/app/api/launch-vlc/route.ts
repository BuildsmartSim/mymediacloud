import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    let vlcPath: string | null = null;

    // 1. Try to find VLC in the system PATH
    try {
        const command = process.platform === 'win32' ? 'where vlc' : 'which vlc';
        const path = require('child_process').execSync(command, { encoding: 'utf-8' }).trim().split('\n')[0];
        if (path) {
            vlcPath = path.trim();
        }
    } catch (e) {
        // Ignore error if not found in PATH
    }

    // 2. Fallback to common locations if not found in PATH
    if (!vlcPath) {
        const vlcPaths = [
            'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
            'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe',
            '/Applications/VLC.app/Contents/MacOS/VLC', // Mac fallback
            '/usr/bin/vlc' // Linux fallback
        ];

        vlcPath = vlcPaths.find(p => {
            try {
                require('fs').accessSync(p);
                return true;
            } catch { return false; }
        }) || null;
    }

    if (!vlcPath) {
        console.error('VLC not found in PATH or standard locations.');
        return NextResponse.json({ error: 'VLC not found' }, { status: 404 });
    }

    console.log(`Launching VLC from: ${vlcPath}`);

    // Launch VLC with the URL and fullscreen flag
    // Use 'start' command on Windows to force a new window and bring it to front
    const command = process.platform === 'win32'
        ? `start "" "${vlcPath}" "${url}" --fullscreen`
        : `"${vlcPath}" "${url}" --fullscreen`;

    exec(command, (error: any) => {
        if (error) {
            console.error('VLC launch error:', error);
        }
    });

    return NextResponse.json({ success: true, message: 'VLC launching...' });
}
