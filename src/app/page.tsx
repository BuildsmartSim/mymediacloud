import { Play, Info, Star, Cloud, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTrendingMovies, getImageUrl, discoverMovies, KEYWORDS, getTopRatedMovies } from "@/lib/api/tmdb";
import { getUserWatchlist, getRecommendedMovies } from "@/lib/api/trakt";
import { SmartPlayButton } from "@/components/ui/smart-play-button";
import Link from "next/link";
import { MovieRow } from "@/components/features/movies/movie-row";
import { GenreBar } from "@/components/features/movies/genre-bar";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const traktToken = cookieStore.get("trakt_token")?.value;

  // Fetch Watchlist & Recommendations if token exists
  const [watchlist, recommendations] = traktToken ? await Promise.all([
    getUserWatchlist(traktToken),
    getRecommendedMovies(traktToken)
  ]) : [[], []];

  // Fetch specific "Lanes" based on user persona
  const [
    spaceEpics,
    highStakes,
    seaMovies,
    eightiesSciFi,
    adventure,
    smartComedy,
    trending
  ] = await Promise.all([
    discoverMovies({ with_genres: "878", with_keywords: KEYWORDS.SPACE, sort_by: "vote_average.desc", "vote_count.gte": "500" }),
    discoverMovies({ with_keywords: KEYWORDS.SURVIVAL, sort_by: "popularity.desc" }),
    discoverMovies({ with_keywords: KEYWORDS.SEA, sort_by: "vote_average.desc", "vote_count.gte": "100" }),
    discoverMovies({ with_genres: "878", "primary_release_date.gte": "1980-01-01", "primary_release_date.lte": "1989-12-31", sort_by: "vote_count.desc" }),
    discoverMovies({ with_genres: "12", sort_by: "vote_average.desc", "vote_count.gte": "1000", "vote_average.gte": "7" }),
    discoverMovies({ with_genres: "35", sort_by: "vote_count.desc", "vote_average.gte": "7.0" }),
    getTrendingMovies()
  ]);

  // HERO SELECTION: Pick a random movie from Top 500 Movies Ever Made
  // TMDB /movie/top_rated returns 20 per page. 500 movies = 25 pages.
  const randomPage = Math.floor(Math.random() * 25) + 1;
  const topRatedPage = await getTopRatedMovies(randomPage);

  const heroCandidates = topRatedPage?.results || trending?.results || [];
  const heroMovieData = heroCandidates[Math.floor(Math.random() * heroCandidates.length)];

  const heroMovie = heroMovieData ? {
    title: heroMovieData.title,
    description: heroMovieData.overview,
    rating: heroMovieData.vote_average?.toFixed(1),
    year: heroMovieData.release_date?.split("-")[0],
    backdrop: getImageUrl(heroMovieData.backdrop_path),
    id: heroMovieData.id
  } : null;

  return (
    <div className="min-h-screen pb-20">
      {/* HERO SECTION */}
      <div className="relative w-full h-[80vh] flex items-end pb-24">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-1000"
          style={{ backgroundImage: `url('${heroMovie?.backdrop || ''}')` }}
        >
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 md:px-12 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {heroMovie ? (
            <>
              <div className="flex items-center gap-4 mb-8">
                <span className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase bg-primary text-black rounded-sm shadow-[0_0_20px_rgba(234,179,8,0.6)]">
                  Masterpiece Collection
                </span>
                <span className="px-4 py-1.5 text-xs font-bold bg-black/40 backdrop-blur-md rounded-sm border border-primary/20 text-primary">
                  {heroMovie.year}
                </span>
                <div className="flex items-center gap-2 text-primary text-sm font-bold">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span>{heroMovie.rating}</span>
                </div>
              </div>

              <h1 className="text-6xl md:text-8xl font-black font-serif mb-8 tracking-tighter text-white drop-shadow-2xl leading-[0.9]">
                {heroMovie.title}
              </h1>

              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 line-clamp-3 leading-relaxed font-light">
                {heroMovie.description}
              </p>

              <div className="flex flex-wrap gap-6">
                <SmartPlayButton query={heroMovie.title} year={heroMovie.year} variant="hero" />
                <Link
                  href={`/movie/${heroMovie.id}`}
                  className="flex items-center gap-3 px-8 py-4 bg-transparent backdrop-blur-sm text-white font-bold tracking-widest text-sm rounded-sm border border-white/20 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                >
                  <Info className="w-5 h-5 group-hover:text-primary transition-colors" />
                  DETAILS
                </Link>
              </div>
            </>
          ) : (
            <div className="text-white">Initialize Core Systems...</div>
          )}
        </div>
      </div>



      {/* GENRE BAR */}
      <div className="relative z-30 mb-4">
        <GenreBar />
      </div>

      {/* LANES */}
      <div className="space-y-2 relative z-20">

        {watchlist.length > 0 ? (
          <MovieRow title="Your Watchlist (Trakt)" movies={watchlist} viewAllLink="/watchlist" />
        ) : (
          traktToken && (
            <div className="px-4 md:px-12 py-8 text-center border border-white/10 rounded-xl mx-4 md:mx-12 mb-8 bg-white/5">
              <h3 className="text-xl font-bold text-white mb-2">Your Watchlist is Empty</h3>
              <p className="text-slate-400">Add movies to your watchlist on Trakt.tv and they will appear here.</p>
            </div>
          )
        )}

        {recommendations.length > 0 && (
          <MovieRow title="Recommended For You" movies={recommendations} viewAllLink="/recommendations" />
        )}

        <MovieRow title="Trending Now" movies={trending?.results} />
        <MovieRow title="Cosmic Dread & Space Epics" movies={spaceEpics?.results} categorySlug="space-epics" />
        <MovieRow title="High Stakes: Survival & Disaster" movies={highStakes?.results} categorySlug="high-stakes" />
        <MovieRow title="The Abyss: Deep Sea & Submarines" movies={seaMovies?.results} categorySlug="the-abyss" />
        <MovieRow title="80s Sci-Fi Gold" movies={eightiesSciFi?.results} categorySlug="80s-scifi" />
        <MovieRow title="Adventure with Heart" movies={adventure?.results} categorySlug="adventure-heart" />
        <MovieRow title="Smart Comedy" movies={smartComedy?.results} categorySlug="smart-comedy" />
      </div>
    </div>
  );
}
