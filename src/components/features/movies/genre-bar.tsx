"use client";

import { useRef } from "react";
import Link from "next/link";
import { Telescope, Mountain, Anchor, Zap, Laugh, Skull } from "lucide-react";

const GENRES = [
    { name: "Action", slug: "action", icon: Zap },
    { name: "Adventure", slug: "adventure", icon: Mountain },
    { name: "Animation", slug: "animation", icon: null },
    { name: "Comedy", slug: "comedy", icon: Laugh },
    { name: "Drama", slug: "drama", icon: null },
    { name: "Horror", slug: "horror", icon: Skull },
    { name: "Sci-Fi", slug: "scifi", icon: Telescope },
    { name: "Thriller", slug: "thriller", icon: null },
    { name: "Fantasy", slug: "fantasy", icon: null },
    { name: "Romance", slug: "romance", icon: null },
    { name: "Musical", slug: "musical", icon: null },
    { name: "Documentary", slug: "documentary", icon: null },
];

export function GenreBar() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!scrollRef.current) return;
        const scrollAmount = 200;
        if (e.key === "ArrowRight") {
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        } else if (e.key === "ArrowLeft") {
            scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="w-full px-4 md:px-12 py-6">
            <div
                ref={scrollRef}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 focus:outline-none focus:ring-1 focus:ring-primary/20 rounded-xl"
            >
                {GENRES.map((g) => {
                    const Icon = g.icon;
                    return (
                        <Link
                            key={g.slug}
                            href={`/category/${g.slug}`}
                            className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 hover:border-primary/50 hover:text-primary transition-all group whitespace-nowrap"
                        >
                            {Icon && <Icon className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />}
                            <span className="text-sm font-bold text-slate-300 group-hover:text-primary font-serif italic tracking-wide transition-colors">{g.name}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}

