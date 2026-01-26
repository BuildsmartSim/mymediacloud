"use client";

import { Play, Cloud } from "lucide-react";
import Link from "next/link";

interface EpisodeListProps {
    tvId: string;
    showName: string;
    seasonNumber: number;
    episodes: any[];
}

export function EpisodeList({ tvId, showName, seasonNumber, episodes }: EpisodeListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((ep) => {
                const episodeCode = `S${seasonNumber.toString().padStart(2, '0')}E${ep.episode_number.toString().padStart(2, '0')}`;

                // Smart Query: "Show Name S01E01"
                // Clean special chars from show name for better matching?
                // Usually "Show Name S01E01" is the standard release format.
                const searchQuery = `${showName} ${episodeCode}`;

                return (
                    <div key={ep.id} className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden group hover:border-white/10 transition-colors">
                        {/* Image */}
                        <div className="aspect-video relative bg-black/50">
                            {ep.still_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${ep.still_path}`}
                                    alt={ep.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-600">
                                    No Image
                                </div>
                            )}

                            {/* Overlay Play Hint */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <Play className="w-8 h-8 text-white fill-current" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-primary font-bold text-xs tracking-wider">
                                    {episodeCode}
                                </span>
                                <span className="text-slate-400 text-xs">
                                    {ep.air_date}
                                </span>
                            </div>

                            <h3 className="font-bold text-white text-base mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                {ep.name}
                            </h3>

                            <p className="text-slate-400 text-xs line-clamp-2 mb-4 h-8">
                                {ep.overview}
                            </p>

                            {/* Action Button */}
                            <div className="mt-auto">
                                <Link
                                    href={`/tv/${tvId}/season/${seasonNumber}/episode/${ep.episode_number}`}
                                    className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white text-xs font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    VIEW EPISODE
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
