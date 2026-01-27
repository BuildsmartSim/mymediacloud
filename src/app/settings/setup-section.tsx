"use client";

import { useState } from "react";
import { Play, Settings, Download, Monitor, Command, Terminal } from "lucide-react";

export function SetupSection() {
    const [os, setOs] = useState<"win" | "mac" | "linux">("win");

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">Desktop Player Setup</h2>
                    <p className="text-slate-400 text-sm">Configure your device to auto-launch VLC.</p>
                </div>

                {/* OS Toggles */}
                <div className="flex p-1 bg-black/40 rounded-lg border border-white/5 self-start">
                    <button
                        onClick={() => setOs("win")}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${os === "win" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                        Windows
                    </button>
                    <button
                        onClick={() => setOs("mac")}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${os === "mac" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                        Mac
                    </button>
                    <button
                        onClick={() => setOs("linux")}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${os === "linux" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                        Linux
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#ff5500] rounded-lg flex items-center justify-center shrink-0">
                            <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">VLC Media Player</h3>
                            <p className="text-slate-400 text-sm">
                                {os === "win" && "The standard for Windows playback."}
                                {os === "mac" && "Required. Must be in /Applications folder."}
                                {os === "linux" && "Ensure 'vlc' is in your PATH."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <a
                            href="https://www.videolan.org/vlc/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium transition-colors border border-white/5"
                        >
                            <Download className="w-4 h-4" />
                            1. Install VLC
                        </a>

                        {os === "win" && (
                            <a
                                href="/cloudstream-setup.bat"
                                download="cloudstream-setup.bat"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/80 text-black font-bold rounded-lg transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                2. Download Script (.bat)
                            </a>
                        )}

                        {os === "mac" && (
                            <a
                                href="/setup-mac.sh"
                                download="setup-mac.sh"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/80 text-black font-bold rounded-lg transition-colors"
                            >
                                <Command className="w-4 h-4" />
                                2. Download Script (.sh)
                            </a>
                        )}

                        {os === "linux" && (
                            <a
                                href="/setup-linux.sh"
                                download="setup-linux.sh"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/80 text-black font-bold rounded-lg transition-colors"
                            >
                                <Terminal className="w-4 h-4" />
                                2. Download Script (.sh)
                            </a>
                        )}
                    </div>

                    <div className="text-xs text-slate-500 text-center bg-white/5 p-3 rounded-lg font-mono">
                        {os === "win" && "Run the .bat file once. Accept admin prompts if asked."}
                        {os === "mac" && "chmod +x setup-mac.sh && ./setup-mac.sh"}
                        {os === "linux" && "chmod +x setup-linux.sh && ./setup-linux.sh"}
                    </div>
                </div>
            </div>
        </div>
    );
}
