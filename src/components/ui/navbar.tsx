"use client";

import Link from "next/link";
import { Search, User, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-20 px-4 md:px-12 flex items-center justify-between glass-panel border-b-0 rounded-none bg-background/80">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center group-hover:border-primary/80 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-primary/20 blur-sm absolute" />
                    <Cloud className="w-5 h-5 text-primary relative z-10" />
                </div>
                <span className="text-xl font-bold tracking-widest uppercase text-foreground/90 group-hover:text-white transition-colors">
                    Cloud<span className="text-primary">Stream</span>
                </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8 font-medium text-sm tracking-wide text-muted-foreground/80">
                <Link href="/" className="hover:text-primary transition-colors hover:text-glow">MOVIES</Link>
                <Link href="/tv" className="hover:text-primary transition-colors hover:text-glow">SERIES</Link>
                <Link href="/settings" className="hover:text-primary transition-colors hover:text-glow">SETTINGS</Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <div className="relative group">
                    <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-foreground/70 hover:text-primary">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
                <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-foreground/70 hover:text-primary">
                    <User className="w-5 h-5" />
                </button>
            </div>
        </nav>
    );
}
