import { exchangeCode } from "@/lib/api/trakt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return new Response("No code provided", { status: 400 });
    }

    try {
        const data = await exchangeCode(code);

        // Store tokens
        // Access Token (Valid for 3 months usually)
        if (data.access_token) {
            const cookieStore = await cookies();
            cookieStore.set("trakt_token", data.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: data.expires_in || 7776000, // Default ~3 months
            });

            // Store Refresh Token to renew later
            if (data.refresh_token) {
                cookieStore.set("trakt_refresh", data.refresh_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
                });
            }
        }

        // Redirect back to Settings
        redirect("/settings?connected=true");
    } catch (error) {
        console.error("Trakt Callback Error:", error);
        redirect("/settings?error=trakt_auth_failed");
    }
}
