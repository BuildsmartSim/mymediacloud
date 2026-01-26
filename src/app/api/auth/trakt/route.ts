import { getAuthUrl } from "@/lib/api/trakt";
import { redirect } from "next/navigation";

export async function GET() {
    const url = await getAuthUrl();
    if (!url) {
        return new Response("Trakt Client ID missing", { status: 500 });
    }
    redirect(url);
}
