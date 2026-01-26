import { getPersonDetails, getPersonCredits, getImageUrl } from "@/lib/api/tmdb";
import { Star, Calendar, MapPin, Film } from "lucide-react";
import Link from "next/link";
import { PersonCreditsGrid } from "@/components/features/person/person-credits-grid";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
    let person = null;
    let credits = null;
    let sortedCredits = [];

    try {
        const { id } = await params;
        person = await getPersonDetails(id);
        const creditsData = await getPersonCredits(id);

        if (creditsData && person) {
            let rawCredits = [];

            // Intelligent Selection:
            // Use TMDB's 'known_for_department' to strictly filter the person's credits.
            // This prevents a Composer (Dept: Sound) from showing 'Actor' credits (cameos) or 'Thanks' credits.
            const dept = person.known_for_department;

            if (dept === "Acting") {
                rawCredits = creditsData.cast || [];
            } else {
                // For Crew (Directors, Writers, Composers, etc.), only show credits 
                // that match their primary department.
                rawCredits = (creditsData.crew || []).filter((c: any) => c.department === dept);

                // Fallback: If strict filtering returns nothing (rare edge cases), 
                // show top-level jobs or revert to all crew.
                if (rawCredits.length === 0) {
                    rawCredits = creditsData.crew || [];
                }
            }

            // Deduplicate by ID
            const seen = new Set();
            const uniqueCredits = rawCredits.filter((c: any) => {
                if (seen.has(c.id)) return false;
                seen.add(c.id);
                return true;
            });

            // Sort by vote average (Best to Worst)
            sortedCredits = uniqueCredits
                .filter((c: any) => c.vote_count > 50 && c.poster_path)
                .sort((a: any, b: any) => b.vote_average - a.vote_average);
        }
    } catch (e) {
        console.error("Error loading person:", e);
    }

    if (!person) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-white text-xl">Person not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 px-4 md:px-12 pb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm">
                ← Back to Home
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* LEFT: Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        <img
                            src={getImageUrl(person.profile_path)}
                            alt={person.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold text-white">{person.name}</h1>

                        <div className="space-y-2 text-sm text-slate-300">
                            {person.birthday && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>Born: {person.birthday}</span>
                                </div>
                            )}
                            {person.place_of_birth && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>{person.place_of_birth}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-white font-bold text-lg">Biography</h2>
                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-[10]">
                                {person.biography || "No biography available."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Filmography */}
                <div className="lg:col-span-3 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Film className="w-6 h-6 text-primary" />
                        Filmography
                    </h2>

                    <PersonCreditsGrid
                        credits={sortedCredits}
                        personDept={person.known_for_department}
                    />
                </div>
            </div>
        </div>
    );
}
