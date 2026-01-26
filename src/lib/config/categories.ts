import { KEYWORDS } from "@/lib/api/tmdb";

export interface CategoryDef {
    title: string;
    description: string;
    params: Record<string, string>;
}

export const CATEGORY_SLUGS: Record<string, CategoryDef> = {
    // Custom Lanes
    "space-epics": {
        title: "Cosmic Dread & Space Epics",
        description: "High-concept sci-fi themes exploring the unknown, AI, and the vastness of space.",
        params: { with_genres: "878", with_keywords: KEYWORDS.SPACE, sort_by: "vote_average.desc", "vote_count.gte": "500" }
    },
    "high-stakes": {
        title: "High Stakes: Survival & Disaster",
        description: "True stories and fictional tales of survival against extreme odds.",
        params: { with_keywords: KEYWORDS.SURVIVAL, sort_by: "popularity.desc" }
    },
    "the-abyss": {
        title: "The Abyss: Deep Sea & Submarines",
        description: "Claustrophobic tension and the mysteries of the deep ocean.",
        params: { with_keywords: KEYWORDS.SEA, sort_by: "vote_average.desc", "vote_count.gte": "100" }
    },
    "80s-scifi": {
        title: "80s Sci-Fi Gold",
        description: "The golden era of practical effects and synth soundtracks.",
        params: { with_genres: "878", "primary_release_date.gte": "1980-01-01", "primary_release_date.lte": "1989-12-31", sort_by: "vote_count.desc" }
    },
    "adventure-heart": {
        title: "Adventure with Heart",
        description: "Journeys that move you, featuring classic heroes and emotional depth.",
        params: { with_genres: "12", sort_by: "vote_average.desc", "vote_count.gte": "1000", "vote_average.gte": "7" }
    },
    "smart-comedy": {
        title: "Smart Comedy",
        description: "Wit over slapstick. Comedies that respect your intelligence.",
        params: { with_genres: "35", sort_by: "vote_count.desc", "vote_average.gte": "7.0" }
    },

    // Standard Genres
    "action": { title: "Action Movies", description: "Adrenaline fueling cinema.", params: { with_genres: "28", sort_by: "popularity.desc" } },
    "scifi": { title: "Science Fiction", description: "Beyond the known world.", params: { with_genres: "878", sort_by: "popularity.desc" } },
    "drama": { title: "Drama", description: "Deep, human stories.", params: { with_genres: "18", sort_by: "popularity.desc" } },
    "thriller": { title: "Thrillers", description: "Suspense and tension.", params: { with_genres: "53", sort_by: "popularity.desc" } },
    "comedy": { title: "Comedy", description: "Laughs and lightheartedness.", params: { with_genres: "35", sort_by: "popularity.desc" } },
};
