"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

export function SearchBar({ placeholder = "Search movies, shows..." }: { placeholder?: string }) {
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
        <div className="relative w-full max-w-2xl mx-auto mb-12">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                    className="w-full h-14 pl-12 pr-4 bg-slate-900/50 border border-white/10 rounded-full text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl backdrop-blur-md"
                />
                {isPending && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
            </div>
        </div>
    );
}
