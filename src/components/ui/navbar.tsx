"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Search, User, Cloud, Menu, X, Settings, Tv, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/ui/search-bar";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 h-20 px-4 md:px-12 flex items-center justify-between glass-panel border-b-0 rounded-none bg-background/80 backdrop-blur-md">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group z-50">
                    <div className="w-10 h-10 flex items-center justify-center border border-primary/20 bg-primary/5 rotate-45 group-hover:bg-primary/10 group-hover:border-primary/50 transition-all duration-500">
                        <div className="w-5 h-5 bg-primary/20 blur text-primary -rotate-45 font-serif font-black flex items-center justify-center text-xs">O</div>
                    </div>
                    <span className="text-2xl font-black font-serif tracking-tighter text-foreground group-hover:text-primary transition-colors text-glow">
                        ONYX
                    </span>
                </Link>

                {/* Search Bar & Nav (Desktop) */}
                <div className="flex-1 max-w-xl mx-8 hidden md:block">
                    <Suspense fallback={<div className="h-10 bg-secondary/50 rounded-full w-full" />}>
                        <SearchBar placeholder="Search..." className="h-10 text-sm bg-secondary/50 border-white/5 focus:ring-1" iconSize="w-4 h-4" />
                    </Suspense>
                </div>

                {/* Navigation Links (Desktop) */}
                <div className="hidden md:flex items-center gap-6 font-medium text-sm tracking-wide text-muted-foreground/80">
                    <Link href="/" className="hover:text-primary transition-colors hover:text-glow uppercase">Movies</Link>
                    <Link href="/tv" className="hover:text-primary transition-colors hover:text-glow uppercase">Series</Link>
                    <Link href="/settings" className="hover:text-primary transition-colors hover:text-glow uppercase">Settings</Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsMenuOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-foreground/70 hover:text-primary">
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 md:hidden",
                    isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu Content (Slide-in) */}
            <div
                className={cn(
                    "fixed top-0 right-0 w-[80%] max-w-xs h-full bg-slate-900 z-[101] shadow-2xl transition-transform duration-300 flex flex-col md:hidden",
                    isMenuOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <span className="font-bold text-lg text-white">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 space-y-2">
                    <div className="mb-6">
                        <Suspense fallback={<div className="h-10 bg-secondary/50 rounded-full w-full" />}>
                            <SearchBar placeholder="Search..." className="h-10 text-sm bg-secondary/50 border-white/5 focus:ring-1" iconSize="w-4 h-4" />
                        </Suspense>
                    </div>

                    <Link
                        href="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                    >
                        <Film className="w-5 h-5" />
                        <span className="font-medium">Movies</span>
                    </Link>
                    <Link
                        href="/tv"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                    >
                        <Tv className="w-5 h-5" />
                        <span className="font-medium">Series</span>
                    </Link>
                    <Link
                        href="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </Link>
                </div>

                <div className="mt-auto p-8 text-center border-t border-white/5">
                    <p className="text-xs text-slate-600">CloudStream v0.1.0</p>
                </div>
            </div>
        </>
    );
}

