"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function saveDebridSettings(formData: FormData) {
    const key = formData.get("apiKey") as string;
    const service = formData.get("service") as string || 'real-debrid';

    const cookieStore = await cookies();

    if (key) {
        // Save secure, HTTP-only cookie
        cookieStore.set("rd_api_key", key, {
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            path: "/", // Available globally
            maxAge: 60 * 60 * 24 * 365 // 1 year
        });
    } else {
        // If empty, delete it (revert to Admin key)
        cookieStore.delete("rd_api_key");
    }

    // Save service preference
    cookieStore.set("debrid_service", service, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 365
    });

    console.log(`[Settings] Updated Debrid settings: Service=${service}, Key=${key ? 'Provided' : 'Removed'}`);
    revalidatePath("/settings");
}
