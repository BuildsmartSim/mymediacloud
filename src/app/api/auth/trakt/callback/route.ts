import { exchangeCode } from "@/lib/api/trakt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    try {
        const tokenData = await exchangeCode(code);

        if (tokenData && tokenData.access_token) {
            const cookieStore = await cookies();
            cookieStore.set("trakt_token", tokenData.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 90, // 90 days
            });

            // If refresh token exists, store it too (optional, for now just access token)
            // Trakt tokens last 3 months, refresh lasts longer.
        }

        // Redirect back to settings or home
        // Check if there was a 'from' param? No, simplified flow.
    } catch (e) {
        console.error("Trakt Auth Error:", e);
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }

    redirect("/settings");
}
