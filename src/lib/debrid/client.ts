import { cookies } from "next/headers";
import { DebridClient } from "./types";
import { RealDebridClient } from "./adapters/real-debrid";

export type DebridProvider = 'real-debrid' | 'premiumize' | 'alldebrid';

export async function getDebridClient(): Promise<DebridClient> {
    const cookieStore = await cookies();

    // Future proofing: Check for selected service
    // const service = cookieStore.get("debrid_service")?.value as DebridProvider || 'real-debrid';
    const service: DebridProvider = 'real-debrid'; // Force RD for now until we fully implement others

    // Check for user-provided key
    const userKey = cookieStore.get("rd_api_key")?.value;

    // Check for admin fallback
    const adminKey = process.env.REAL_DEBRID_API_KEY;

    const apiKey = userKey || adminKey;

    if (!apiKey) {
        throw new Error("No Debrid API Key found. Please configure settings or environment variables.");
    }

    switch (service) {
        case 'real-debrid':
            return new RealDebridClient(apiKey);
        // case 'premiumize':
        //     return new PremiumizeClient(apiKey);
        // case 'alldebrid':
        //     return new AllDebridClient(apiKey);
        default:
            return new RealDebridClient(apiKey);
    }
}
