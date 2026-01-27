import { cookies } from "next/headers";
import Link from "next/link";
import { Check, LogOut, ExternalLink } from "lucide-react";

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const traktToken = cookieStore.get("trakt_token");
    const isConnected = !!traktToken;

    return (
        <div className="min-h-screen bg-background pt-24 px-4 md:px-12 pb-12">
            <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

            <div className="max-w-2xl space-y-8">
                {/* ACCOUNT SECTION */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white mb-4">Integrations</h2>

                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#ed1c24] rounded-lg flex items-center justify-center font-bold text-white text-xl">
                                T
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Trakt.tv</h3>
                                <p className="text-slate-400 text-sm">Sync your watch history and recommendations.</p>
                            </div>
                        </div>

                        {isConnected ? (
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2 text-green-500 font-bold text-sm bg-green-500/10 px-3 py-1.5 rounded-full">
                                    <Check className="w-4 h-4" />
                                    CONNECTED
                                </span>
                                <form action={async () => {
                                    "use server";
                                    const { cookies } = await import("next/headers");
                                    const cookieStore = await cookies();
                                    cookieStore.delete("trakt_token");
                                }}>
                                    <button className="text-red-400 hover:text-red-300 text-sm font-bold flex items-center gap-2">
                                        <LogOut className="w-4 h-4" /> DISCONNECT
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <Link
                                href="/api/auth/trakt"
                                className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-white transition-colors"
                            >
                                CONNECT
                            </Link>
                        )}
                    </div>
                </div>

                {/* ABOUT SECTION */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm text-slate-400 text-sm">
                    <h2 className="text-xl font-bold text-white mb-4">About</h2>
                    <p>CloudStream Web v0.1.0</p>
                    <p className="mt-2 text-xs opacity-50">
                        Powered by TMDB, Trakt, and Real-Debrid.
                    </p>
                </div>
            </div>
        </div>
    );
}
