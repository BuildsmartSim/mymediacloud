import { getTrendingShows, discoverTV, getImageUrl } from "@/lib/api/tmdb";
import { SmartPlayButton } from "@/components/ui/smart-play-button";
import { SearchBar } from "@/components/ui/search-bar";
import Link from "next/link";
import { MovieRow } from "@/components/features/movies/movie-row";
import { Play, Info, Star } from "lucide-react";
import { Suspense } from "react";

export default async function TVHome() {
    // Fetch TV Data
    const trending = await getTrendingShows();
    const heroShow = trending?.results?.[0];

    // Parallel fetch lanes
    const [
        sciFiShows,
        actionShows,
        comedyShows,
        dramaShows,
        animationShows,
        netflixShows,
        hboShows,
        disneyShows,
        appleShows,
        paramountShows,
        huluShows,
        primeShows
    ] = await Promise.all([
        discoverTV({ with_genres: "10765", sort_by: "popularity.desc" }), // Sci-Fi & Fantasy
        discoverTV({ with_genres: "10759", sort_by: "popularity.desc" }), // Action & Adventure
        discoverTV({ with_genres: "35", sort_by: "popularity.desc" }), // Comedy
        discoverTV({ with_genres: "18", sort_by: "popularity.desc" }), // Drama
        discoverTV({ with_genres: "16", sort_by: "popularity.desc" }), // Animation
        // Network Lanes
        discoverTV({ with_networks: "213", sort_by: "popularity.desc" }), // Netflix
        discoverTV({ with_networks: "49", sort_by: "popularity.desc" }), // HBO
        discoverTV({ with_networks: "2739", sort_by: "popularity.desc" }), // Disney+
        discoverTV({ with_networks: "2552", sort_by: "popularity.desc" }), // Apple TV+
        discoverTV({ with_networks: "4330", sort_by: "popularity.desc" }), // Paramount+ (Check ID)
        discoverTV({ with_networks: "453", sort_by: "popularity.desc" }), // Hulu
        discoverTV({ with_networks: "1024", sort_by: "popularity.desc" }), // Amazon Prime
    ]);

    return (
        <div className="min-h-screen bg-background pb-20">

            {/* HERO SECTION */}
            <div className="relative h-[85vh] w-full overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    {heroShow && (
                        <img
                            src={getImageUrl(heroShow.backdrop_path)}
                            alt={heroShow.name}
                            className="w-full h-full object-cover opacity-60"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-black/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-12 pt-20">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 max-w-4xl leading-tight">
                        {heroShow?.name}
                    </h1>

                    <div className="flex items-center gap-4 text-slate-300 mb-8 text-lg">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-md text-sm font-bold border border-primary/20">
                            SERIES
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            {heroShow?.vote_average?.toFixed(1)}
                        </span>
                        <span>{(heroShow?.first_air_date || "").split("-")[0]}</span>
                    </div>

                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-10 line-clamp-3 leading-relaxed">
                        {heroShow?.overview}
                    </p>

                    <div className="flex items-center gap-4">
                        {/* For TV Hero, usually we link to details page instead of direct play since we need episode selection */}
                        <Link
                            href={`/tv/${heroShow?.id}`}
                            className="flex items-center gap-2 px-8 py-4 bg-primary text-black font-bold rounded-xl hover:bg-white transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
                        >
                            <Play className="w-6 h-6 fill-current" />
                            START WATCHING
                        </Link>

                        <Link
                            href={`/tv/${heroShow?.id}`}
                            className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
                        >
                            <Info className="w-6 h-6" />
                            MORE INFO
                        </Link>
                    </div>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="px-4 md:px-12 -mt-8 relative z-30 mb-12">
                <Suspense fallback={<div className="h-14 w-full max-w-2xl mx-auto bg-slate-900/50 rounded-full animate-pulse" />}>
                    <SearchBar placeholder="Search for TV Series..." />
                </Suspense>
            </div>

            {/* LANES */}
            <div className="space-y-8 relative z-20">
                <MovieRow title="Generic Sci-Fi & Fantasy" movies={sciFiShows?.results} isSeries />
                <MovieRow title="Action & Adventure" movies={actionShows?.results} isSeries />
                <MovieRow title="Comedy Hits" movies={comedyShows?.results} isSeries />
                <MovieRow title="Critically Acclaimed Dramas" movies={dramaShows?.results} isSeries />
                <MovieRow title="Animation" movies={animationShows?.results} isSeries />

                <div className="pt-8 pb-4">
                    <h2 className="text-2xl font-bold text-white mb-4 px-4 md:px-12 opacity-80 uppercase tracking-widest">Streaming Services</h2>
                </div>

                <MovieRow title="Popular on Netflix" movies={netflixShows?.results} isSeries viewAllLink="/tv/network/netflix" />
                <MovieRow title="HBO Max Hits" movies={hboShows?.results} isSeries viewAllLink="/tv/network/hbo" />
                <MovieRow title="Disney+ Originals" movies={disneyShows?.results} isSeries viewAllLink="/tv/network/disney" />
                <MovieRow title="Apple TV+ Exclusives" movies={appleShows?.results} isSeries viewAllLink="/tv/network/apple" />
                <MovieRow title="Paramount+ Mountain" movies={paramountShows?.results} isSeries viewAllLink="/tv/network/paramount" />
                <MovieRow title="Hulu Highlights" movies={huluShows?.results} isSeries viewAllLink="/tv/network/hulu" />
                <MovieRow title="Amazon Prime Video" movies={primeShows?.results} isSeries viewAllLink="/tv/network/amazon" />
            </div>
        </div>
    );
}
