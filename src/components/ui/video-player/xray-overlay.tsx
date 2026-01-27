"use client";

import { useState } from "react";
import { User, Music, Info, X, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface XRayOverlayProps {
    details?: any; // The full TMDB details object
    onClose: () => void;
}

export function XRayOverlay({ details, onClose }: XRayOverlayProps) {
    const [activeTab, setActiveTab] = useState<"cast" | "crew" | "music" | "info">("cast");

    if (!details) return null;

    // Mock Music Data (Advanced: Fetch from TuneFind API later)
    const soundtrack = [
        { title: "Main Title", artist: "Hans Zimmer" },
        { title: "The Battle", artist: "Hans Zimmer" },
    ];

    return (
        <div className="w-full bg-black/60 backdrop-blur-xl border-t border-white/10 pb-8 pt-2 animate-in slide-in-from-bottom duration-500">
            {/* Handle/Close Bar */}
            <div className="flex justify-center mb-2" onClick={onClose}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full cursor-pointer hover:bg-white/40 transition-colors" />
            </div>

            <div className="px-8 md:px-16 flex items-start gap-8 h-[300px]">
                {/* Left: Navigation Tabs */}
                <div className="w-48 flex-shrink-0 flex flex-col gap-2 border-r border-white/10 pr-6 h-full pt-4">
                    <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4">X-Ray</h3>
                    <TabButton active={activeTab === "cast"} onClick={() => setActiveTab("cast")} icon={<User className="w-4 h-4" />} label="Cast" />
                    <TabButton active={activeTab === "crew"} onClick={() => setActiveTab("crew")} icon={<User className="w-4 h-4" />} label="Crew" />
                    <TabButton active={activeTab === "music"} onClick={() => setActiveTab("music")} icon={<Music className="w-4 h-4" />} label="Music" />
                    <TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")} icon={<Info className="w-4 h-4" />} label="Info" />
                </div>

                {/* Right: Content Area */}
                <div className="flex-1 overflow-x-auto h-full py-4 scrollbar-hide">

                    {/* CAST TAB */}
                    {activeTab === "cast" && (
                        <div className="flex gap-6">
                            {details.credits?.cast?.slice(0, 15).map((actor: any) => (
                                <div key={actor.id} className="group relative flex-shrink-0 w-32 flex flex-col gap-2 cursor-pointer">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all relative">
                                        {actor.profile_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                                alt={actor.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                <User className="w-10 h-10 text-slate-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-white text-sm truncate">{actor.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{actor.character}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CREW TAB */}
                    {activeTab === "crew" && (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {details.credits?.crew?.slice(0, 12).map((member: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{member.name}</p>
                                        <p className="text-xs text-yellow-500/80 truncate">{member.job}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* MUSIC TAB */}
                    {activeTab === "music" && (
                        <div className="space-y-2 w-full max-w-2xl">
                            {soundtrack.map((track, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary">
                                            <Music className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{track.title}</p>
                                            <p className="text-xs text-slate-400">{track.artist}</p>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-white/10 rounded-full text-xs font-bold hover:bg-white/20 transition-all">
                                        Find
                                    </button>
                                </div>
                            ))}
                            <p className="text-xs text-slate-500 mt-4 italic">Soundtrack data implementation pending API integration.</p>
                        </div>
                    )}

                    {/* INFO TAB */}
                    {activeTab === "info" && (
                        <div className="flex gap-8 max-w-4xl">
                            <div className="flex-1 space-y-4">
                                <h4 className="text-white font-bold border-b border-white/10 pb-2">Production</h4>
                                <div className="flex flex-wrap gap-3">
                                    {details.production_companies?.map((company: any) => (
                                        <div key={company.id} className="px-3 py-1.5 bg-white/10 rounded-lg text-sm font-medium text-slate-200">
                                            {company.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <h4 className="text-white font-bold border-b border-white/10 pb-2">Information</h4>
                                <div className="space-y-2 text-sm text-slate-300">
                                    <p><span className="text-slate-500 w-24 inline-block">Released:</span> {details.release_date}</p>
                                    <p><span className="text-slate-500 w-24 inline-block">Status:</span> {details.status}</p>
                                    <p><span className="text-slate-500 w-24 inline-block">Budget:</span> ${details.budget?.toLocaleString()}</p>
                                    <p><span className="text-slate-500 w-24 inline-block">Revenue:</span> ${details.revenue?.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left",
                active
                    ? "bg-white text-black shadow-lg shadow-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
        >
            {icon}
            {label}
            {active && <ChevronRight className="w-3 h-3 ml-auto" />}
        </button>
    );
}
