import { searchMulti, getImageUrl } from "@/lib/api/tmdb";
import { SearchBar } from "@/components/ui/search-bar";
import { Star } from "lucide-react";
import Link from "next/link";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q: query } = await searchParams;
    const results = query ? await searchMulti(query) : null;
    const items = results?.results || [];

    return (
        <div className="min-h-screen px-4 md:px-12 py-8">
            <h1 className="text-3xl font-bold text-white text-center mb-8">Search</h1>

            <SearchBar />

            {query && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {items.filter((i: any) => i.media_type !== 'person').map((m: any) => (
                        <Link
                            key={m.id}
                            href={m.media_type === 'tv' ? `/tv/${m.id}` : `/movie/${m.id}`}
                            className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-slate-800 border border-white/5 shadow-2xl hover:border-primary/50 transition-all duration-300 hover:scale-105"
                        >
                            {/* Poster Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110 duration-700"
                                style={{ backgroundImage: `url(${getImageUrl(m.poster_path || m.profile_path)})` }}
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent flex flex-col justify-end p-4">
                                <h3 className="font-bold text-white leading-tight mb-1">{m.title || m.name}</h3>
                                <div className="flex justify-between items-center text-xs text-slate-300">
                                    <span>{m.release_date?.split('-')[0] || m.first_air_date?.split('-')[0]}</span>
                                    <div className="flex items-center gap-1 text-primary">
                                        <Star className="w-3 h-3 fill-primary" />
                                        <span>{m.vote_average?.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {query && items.length === 0 && (
                <div className="text-center text-slate-500 mt-12">
                    No results found for "{query}"
                </div>
            )}
        </div>
    );
}
