"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { cn } from "@/lib/utils";

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    iconSize?: string;
}

export function SearchBar({ placeholder = "Search movies, shows...", className, iconSize = "w-5 h-5" }: SearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(searchParams.get("q") || "");

    // simple debounce
    const handleSearch = useCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }

        startTransition(() => {
            router.replace(`/search?${params.toString()}`);
        });
    }, [searchParams, router]);

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 ${iconSize}`} />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(value);
                        }
                    }}
                    placeholder={placeholder}
                    className={cn(
                        "w-full h-14 pl-12 pr-4 bg-secondary/50 border border-primary/10 rounded-full text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-2xl backdrop-blur-xl",
                        className
                    )}
                />
                {isPending && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
            </div>
        </div>
    );
}
