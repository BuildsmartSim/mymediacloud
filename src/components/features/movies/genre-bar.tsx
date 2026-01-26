import Link from "next/link";
import { Telescope, Mountain, Anchor, Zap, Laugh, Skull } from "lucide-react";

const GENRES = [
    { name: "Action", slug: "action", icon: Zap },
    { name: "Comedy", slug: "smart-comedy", icon: Laugh },
    { name: "Drama", slug: "drama", icon: null },
    { name: "Thriller", slug: "thriller", icon: Skull },
    { name: "Sci-Fi", slug: "scifi", icon: Telescope },
    { name: "Adventure", slug: "adventure-heart", icon: Mountain },
];

export function GenreBar() {
    return (
        <div className="w-full px-4 md:px-12 py-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3">
                {GENRES.map((g) => {
                    const Icon = g.icon;
                    return (
                        <Link
                            key={g.slug}
                            href={`/category/${g.slug}`}
                            className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 hover:border-primary/50 hover:text-primary transition-all group whitespace-nowrap"
                        >
                            {Icon && <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />}
                            <span className="text-sm font-medium text-slate-200 group-hover:text-white">{g.name}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
