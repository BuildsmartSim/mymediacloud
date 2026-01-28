import { getMovieDetails, getMovieCredits, getImageUrl } from "@/lib/api/tmdb";
import { SmartPlayButton } from "@/components/ui/smart-play-button";
import { BookmarkButton } from "@/components/features/trakt/bookmark-button";
import { BackButton } from "@/components/ui/back-button";
import { Star, Clock, Calendar, User, Film } from "lucide-react";
import Link from "next/link";

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
    let movie = null;
    let credits = null;
    let error = null;

    try {
        const { id } = await params;
        movie = await getMovieDetails(id);
        credits = await getMovieCredits(id);
    } catch (e) {
        console.error("Error loading movie:", e);
        error = e;
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-white text-xl">Movie not found</p>
            </div>
        );
    }

    const director = credits?.crew?.find((c: any) => c.job === "Director");
    const cast = credits?.cast?.slice(0, 8) || [];
    const year = movie.release_date?.split("-")[0];
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;
    const genres = movie.genres?.slice(0, 3).map((g: any) => g.name) || [];

    return (
        <div className="min-h-screen">
            {/* Backdrop */}
            <div
                className="absolute top-0 left-0 right-0 h-[75vh] bg-cover bg-center"
                style={{ backgroundImage: `url(${getImageUrl(movie.backdrop_path)})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-background" />
            </div>

            {/* Content */}
            <div className="relative z-10 pt-28 px-4 md:px-12 pb-12">
                {/* Back button */}
                <BackButton label="Back to Library" />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* LEFT: Movie Details */}
                    <div className="space-y-6">
                        <div className="flex gap-6">
                            {/* Poster */}
                            <div className="flex-shrink-0 w-48 md:w-64">
                                <img
                                    src={getImageUrl(movie.poster_path)}
                                    alt={movie.title}
                                    className="w-full rounded-xl shadow-2xl border border-white/10"
                                />
                            </div>

                            {/* Title & Meta */}
                            <div className="flex-1 space-y-4">
                                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                    {movie.title}
                                </h1>

                                {/* Year & Runtime */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                                    {year && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" /> {year}
                                        </span>
                                    )}
                                    {runtime && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> {runtime}
                                        </span>
                                    )}
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 rounded-lg">
                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-lg font-bold text-white">{movie.vote_average?.toFixed(1)}</span>
                                    </div>
                                    <span className="text-sm text-slate-400">
                                        ({movie.vote_count?.toLocaleString()} votes)
                                    </span>
                                </div>

                                {/* Genres */}
                                <div className="flex flex-wrap gap-2">
                                    {genres.map((genre: string) => (
                                        <span key={genre} className="px-3 py-1 text-xs font-medium bg-white/10 text-slate-300 rounded-full border border-white/10">
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Synopsis */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Film className="w-5 h-5" /> Synopsis
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-sm">
                                {movie.overview || "No synopsis available."}
                            </p>
                        </div>

                        {/* Director */}
                        {director && (
                            <div className="space-y-2">
                                <h2 className="text-lg font-bold text-white">Director</h2>
                                <Link href={`/person/${director.id}`} className="text-primary font-medium hover:text-white transition-colors">
                                    {director.name}
                                </Link>
                            </div>
                        )}

                        {/* Extended Key Crew */}
                        {credits?.crew && (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                {[
                                    { title: "Writer", jobs: ["Screenplay", "Writer", "Story"] },
                                    { title: "Cinematography", jobs: ["Director of Photography"] },
                                    { title: "Music", jobs: ["Original Music Composer", "Music"] },
                                    { title: "Sound", jobs: ["Sound Designer", "Supervising Sound Editor", "Sound Re-Recording Mixer"] }
                                ].map((role) => {
                                    const people = credits.crew
                                        .filter((c: any) => role.jobs.includes(c.job))
                                        .filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.id === v.id) === i) // Dedupe
                                        .slice(0, 3); // Limit per role

                                    if (people.length === 0) return null;

                                    return (
                                        <div key={role.title} className="space-y-1">
                                            <h3 className="text-sm font-bold text-slate-400">{role.title}</h3>
                                            <div className="flex flex-col">
                                                {people.map((p: any) => (
                                                    <Link
                                                        key={p.id}
                                                        href={`/person/${p.id}`}
                                                        className="text-white hover:text-primary text-sm transition-colors"
                                                    >
                                                        {p.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Cast */}
                        {cast.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <User className="w-5 h-5" /> Top Cast
                                </h2>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {cast.map((actor: any) => (
                                        <Link
                                            key={actor.id}
                                            href={`/person/${actor.id}`}
                                            className="flex-shrink-0 w-24 text-center group"
                                        >
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-white/10 mb-2 group-hover:border-primary transition-colors">
                                                <img
                                                    src={actor.profile_path ? getImageUrl(actor.profile_path) : "/placeholder.jpg"}
                                                    alt={actor.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <p className="text-xs text-white font-medium truncate group-hover:text-primary transition-colors">{actor.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{actor.character}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Torrent Sources */}
                    <div className="lg:sticky lg:top-28 lg:self-start">
                        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                🎬 Stream This Movie
                            </h2>
                            <SmartPlayButton
                                query={movie.title}
                                year={year}
                                variant="hero"
                                tmdbId={movie.id}
                                details={{ ...movie, credits }}
                            />

                            <div className="mt-4">
                                <BookmarkButton tmdbId={movie.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
