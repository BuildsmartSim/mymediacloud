import { getTVDetails, getEpisodeDetails, getImageUrl } from "@/lib/api/tmdb";
import { SmartPlayButton } from "@/components/ui/smart-play-button";
import { Star, Calendar, ArrowLeft, Clock, User, Film } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EpisodePageProps {
    params: Promise<{
        id: string;
        season: string;
        episode: string;
    }>;
}

export default async function EpisodePage({ params }: EpisodePageProps) {
    const { id, season, episode } = await params;
    const seasonNum = parseInt(season);
    const episodeNum = parseInt(episode);

    console.log(`[EpisodePage] Loading details for Show: ${id}, Season: ${seasonNum}, Episode: ${episodeNum}`);

    // parallel fetch
    const [show, ep] = await Promise.all([
        getTVDetails(id),
        getEpisodeDetails(id, seasonNum, episodeNum)
    ]);

    if (!show || !ep) {
        return notFound();
    }

    const episodeCode = `S${seasonNum.toString().padStart(2, '0')}E${episodeNum.toString().padStart(2, '0')}`;
    const runtime = ep.runtime ? `${ep.runtime}m` : null;
    const airDate = ep.air_date ? ep.air_date.split("-")[0] : null;

    // Director & Writer
    const director = ep.crew?.find((c: any) => c.job === "Director");
    const writers = ep.crew?.filter((c: any) => c.job === "Writer" || c.job === "Screenplay" || c.job === "Story").slice(0, 2);

    // Guest Stars
    const guestStars = ep.guest_stars?.slice(0, 8) || [];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* BACKDROP */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={getImageUrl(ep.still_path || show.backdrop_path)}
                        alt={ep.name}
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-12 pb-12">
                    <Link
                        href={`/tv/${id}?season=${seasonNum}`}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Season {seasonNum}
                    </Link>

                    <h1 className="text-xl text-primary font-bold mb-2 tracking-widest uppercase">
                        {show.name} • {episodeCode}
                    </h1>
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        {ep.name}
                    </h2>

                    <div className="flex items-center gap-6 text-slate-300 text-sm md:text-base mb-6">
                        <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            {ep.vote_average?.toFixed(1)}
                        </span>
                        {ep.air_date && (
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {ep.air_date}
                            </span>
                        )}
                        {runtime && (
                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {runtime}
                            </span>
                        )}
                    </div>

                    <p className="max-w-3xl text-slate-300 line-clamp-3 md:line-clamp-none text-lg leading-relaxed">
                        {ep.overview || "No overview available for this episode."}
                    </p>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="px-4 md:px-12 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* LEFT: Info & Cast */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Crew Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                        {director && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 mb-1">Director</h3>
                                <Link href={`/person/${director.id}`} className="text-white hover:text-primary transition-colors font-medium">
                                    {director.name}
                                </Link>
                            </div>
                        )}
                        {writers && writers.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 mb-1">Writer{writers.length > 1 ? 's' : ''}</h3>
                                <div className="flex flex-col">
                                    {writers.map((w: any) => (
                                        <Link key={w.id} href={`/person/${w.id}`} className="text-white hover:text-primary transition-colors font-medium">
                                            {w.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 mb-1">Season</h3>
                            <p className="text-white font-medium">Season {seasonNum}, Episode {episodeNum}</p>
                        </div>
                    </div>

                    {/* Guest Stars */}
                    {guestStars.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <User className="w-5 h-5" /> Guest Stars
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {guestStars.map((person: any) => (
                                    <Link
                                        key={person.id}
                                        href={`/person/${person.id}`}
                                        className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-black/50 flex-shrink-0">
                                            <img
                                                src={getImageUrl(person.profile_path)}
                                                alt={person.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                            />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm text-white font-bold truncate group-hover:text-primary transition-colors">
                                                {person.name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {person.character}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Stream Section */}
                <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Film className="w-5 h-5 text-primary" /> Stream This Episode
                        </h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Search the cloud for high-quality streams of
                            <span className="text-white font-bold mx-1">{show.name}</span>
                            <span className="text-primary font-bold">{episodeCode}</span>
                        </p>

                        <SmartPlayButton
                            query={show.name}
                            year={show.first_air_date?.split('-')[0]} // Show year helps context
                            season={seasonNum}
                            episode={episodeNum}
                            variant="hero"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
