import { getAuthUrl } from "@/lib/api/trakt";
import { redirect } from "next/navigation";

import { headers } from "next/headers";

export async function GET() {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    const url = await getAuthUrl(origin);
    if (!url) {
        return new Response("Trakt Client ID missing", { status: 500 });
    }
    redirect(url);
}
