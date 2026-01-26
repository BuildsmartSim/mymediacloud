import { getTVDetails, getSeasonDetails, getImageUrl } from "@/lib/api/tmdb";
import { SeasonSelector } from "@/components/features/tv/season-selector";
import { EpisodeList } from "@/components/features/tv/episode-list";
import { Link } from "lucide-react"; // Wait, wrong import, standard Link from next
import NextLink from "next/link";
import { Star, Calendar, ArrowLeft } from "lucide-react";

interface TVPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ season?: string }>;
}

export default async function TVDetailPage({ params, searchParams }: TVPageProps) {
    const { id } = await params;
    const { season } = await searchParams;

    const show = await getTVDetails(id);
    if (!show) {
        return <div className="min-h-screen pt-24 text-center">Show not found</div>;
    }

    // Default to Season 1 if not specified
    // Also handle case where show has no seasons (rare, but possible for unreleased)
    const currentSeason = season ? parseInt(season) : 1;

    // Fetch Season Data
    const seasonData = await getSeasonDetails(id, currentSeason);
    const episodes = seasonData?.episodes || [];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* HERO BACKDROP - Compact version compared to Home */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={getImageUrl(show.backdrop_path)}
                        alt={show.name}
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-12 pb-12">
                    <NextLink href="/tv" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Series
                    </NextLink>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{show.name}</h1>

                    <div className="flex items-center gap-6 text-slate-300 text-sm md:text-base mb-6">
                        <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            {show.vote_average?.toFixed(1)}
                        </span>
                        <span>{show.first_air_date?.split("-")[0]}</span>
                        <span>{show.number_of_seasons} Seasons</span>
                        <div className="flex gap-2">
                            {show.genres?.map((g: any) => (
                                <span key={g.id} className="bg-white/10 px-2 py-0.5 rounded text-xs">
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className="max-w-3xl text-slate-300 line-clamp-3 md:line-clamp-none">
                        {show.overview}
                    </p>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="px-4 md:px-12 mt-8">

                {/* Season Selector */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Seasons</h2>
                    <SeasonSelector
                        tvId={id}
                        seasons={show.seasons}
                        currentSeason={currentSeason}
                    />
                </div>

                {/* Episode List */}
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-white mb-4">
                        {seasonData?.name || `Season ${currentSeason}`}
                        <span className="ml-2 text-slate-500 text-sm font-normal">
                            ({episodes.length} Episodes)
                        </span>
                    </h2>

                    {episodes.length > 0 ? (
                        <EpisodeList
                            tvId={id}
                            showName={show.name}
                            seasonNumber={currentSeason}
                            episodes={episodes}
                        />
                    ) : (
                        <div className="text-slate-500 italic">
                            No episodes found for this season.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
