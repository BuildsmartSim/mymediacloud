import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Find VLC path
    const vlcPaths = [
        'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
        'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe'
    ];

    const vlcPath = vlcPaths.find(p => {
        try {
            require('fs').accessSync(p);
            return true;
        } catch { return false; }
    });

    if (!vlcPath) {
        return NextResponse.json({ error: 'VLC not found' }, { status: 404 });
    }

    // Launch VLC with the URL
    exec(`"${vlcPath}" "${url}"`, (error) => {
        if (error) {
            console.error('VLC launch error:', error);
        }
    });

    return NextResponse.json({ success: true, message: 'VLC launching...' });
}
