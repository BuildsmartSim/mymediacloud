import { NextRequest, NextResponse } from "next/server";

const APIBAY_URL = "https://apibay.org";

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    try {
        // Fetch from APIBay with User-Agent
        const res = await fetch(`${APIBAY_URL}/q.php?q=${encodeURIComponent(query)}&cat=`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: res.statusText }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("[Torrent API Proxy] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
