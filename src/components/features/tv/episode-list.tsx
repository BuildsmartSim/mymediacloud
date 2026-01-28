"use client";

import { Play, Cloud, Info } from "lucide-react";
import Link from "next/link";
import { SmartPlayButton } from "@/components/ui/smart-play-button";

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
                            {/* Action Buttons */}
                            <div className="mt-auto flex gap-2">
                                <div className="flex-1">
                                    <SmartPlayButton
                                        query={showName}
                                        season={seasonNumber}
                                        episode={ep.episode_number}
                                        title={`${showName} - ${episodeCode}`}
                                        tmdbId={Number(tvId)}
                                        details={ep}
                                    />
                                </div>
                                <Link
                                    href={`/tv/${tvId}/season/${seasonNumber}/episode/${ep.episode_number}`}
                                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                                    title="View Details"
                                >
                                    <Info className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
