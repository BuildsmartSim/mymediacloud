import { KEYWORDS } from "@/lib/api/tmdb";

export interface CategoryDef {
    title: string;
    description: string;
    params: Record<string, string>;
    subCategories?: {
        title: string;
        params: Record<string, string>;
    }[];
}

export const CATEGORY_SLUGS: Record<string, CategoryDef> = {
    // 1. Action
    "action": {
        title: "Action",
        description: "High-octane excitement, explosions, and heroes.",
        params: { with_genres: "28", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Superhero", params: { with_genres: "28", with_keywords: "9715" } }, // superhero
            { title: "Spy / Espionage", params: { with_genres: "28", with_keywords: "470" } }, // spy
            { title: "Martial Arts", params: { with_genres: "28", with_keywords: "9374" } }, // martial arts
            { title: "Heist", params: { with_genres: "28", with_keywords: "10051" } }, // heist
            { title: "Disaster", params: { with_genres: "28", with_keywords: "1960" } }, // disaster
            { title: "War", params: { with_genres: "10752" } },
            { title: "Police Action", params: { with_genres: "28", with_keywords: "11005" } },
            { title: "Western Action", params: { with_genres: "28,37" } }
        ]
    },

    // 2. Adventure
    "adventure": {
        title: "Adventure",
        description: "Journeys into the unknown.",
        params: { with_genres: "12", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Swashbuckler", params: { with_genres: "12", with_keywords: "12480" } }, // swashbuckler
            { title: "Survival", params: { with_genres: "12", with_keywords: "10322" } }, // survival
            { title: "Treasure Hunt", params: { with_genres: "12", with_keywords: "3986" } }, // treasure hunt
            { title: "Journey & Quest", params: { with_genres: "12", with_keywords: "1930" } }, // quest
        ]
    },

    // 3. Animation
    "animation": {
        title: "Animation",
        description: "Art in motion, for all ages.",
        params: { with_genres: "16", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Anime", params: { with_genres: "16", with_keywords: "210024" } }, // anime
            { title: "Ghibli & Classics", params: { with_genres: "16", sort_by: "vote_average.desc", "vote_count.gte": "1000" } },
            { title: "Adult Animation", params: { with_genres: "16", certification_country: "US", certification: "R" } }
        ]
    },

    // 4. Comedy
    "comedy": {
        title: "Comedy",
        description: "Laughter is the best medicine.",
        params: { with_genres: "35", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Romantic Comedy", params: { with_genres: "35,10749" } },
            { title: "Dark Comedy", params: { with_genres: "35", with_keywords: "9716" } },
            { title: "Satire", params: { with_genres: "35", with_keywords: "587" } },
            { title: "Parody", params: { with_genres: "35", with_keywords: "9799" } },
            { title: "Mockumentary", params: { with_genres: "35", with_keywords: "160492" } }
        ]
    },

    // 5. Drama
    "drama": {
        title: "Drama",
        description: "Compelling stories of the human condition.",
        params: { with_genres: "18", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Biopic", params: { with_genres: "18", with_keywords: "5565" } }, // biography
            { title: "Historical", params: { with_genres: "18,36" } },
            { title: "Coming of Age", params: { with_genres: "18", with_keywords: "10683" } },
            { title: "Legal", params: { with_genres: "18", with_keywords: "10606" } }, // courtroom
            { title: "Medical", params: { with_genres: "18", with_keywords: "9679" } } // medicine
        ]
    },

    // 6. Horror
    "horror": {
        title: "Horror",
        description: "Fear, suspense, and the supernatural.",
        params: { with_genres: "27", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Slasher", params: { with_genres: "27", with_keywords: "12339" } }, // slasher
            { title: "Supernatural", params: { with_genres: "27", with_keywords: "6152" } }, // supernatural
            { title: "Psychological", params: { with_genres: "27", with_keywords: "10808" } }, // psychological horror
            { title: "Found Footage", params: { with_genres: "27", with_keywords: "15639" } },
            { title: "Monster", params: { with_genres: "27", with_keywords: "3133" } }, // monster
            { title: "Zombie", params: { with_genres: "27", with_keywords: "12377" } }
        ]
    },

    // 7. Sci-Fi
    "scifi": {
        title: "Sci-Fi",
        description: "The future, today.",
        params: { with_genres: "878", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Space Opera", params: { with_genres: "878", with_keywords: "9882" } }, // space
            { title: "Cyberpunk", params: { with_genres: "878", with_keywords: "12190" } }, // cyberpunk
            { title: "Dystopian", params: { with_genres: "878", with_keywords: "4565" } }, // dystopian
            { title: "Time Travel", params: { with_genres: "878", with_keywords: "4388" } }, // time travel
            { title: "Alien Invasion", params: { with_genres: "878", with_keywords: "14819" } }, // alien invasion
            { title: "AI & Robots", params: { with_genres: "878", with_keywords: "10950" } }
        ]
    },

    // 8. Thriller
    "thriller": {
        title: "Thriller",
        description: "Edge of your seat suspense.",
        params: { with_genres: "53", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Psychological Thriller", params: { with_genres: "53", with_keywords: "10410" } },
            { title: "Crime Mystery", params: { with_genres: "53,80" } },
            { title: "Political", params: { with_genres: "53", with_keywords: "2041" } }, // politics
            { title: "Espionage", params: { with_genres: "53", with_keywords: "470" } }
        ]
    },

    // 9. Fantasy
    "fantasy": {
        title: "Fantasy",
        description: "Magic, myths, and legends.",
        params: { with_genres: "14", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Dark Fantasy", params: { with_genres: "14", with_keywords: "12554" } },
            { title: "Sword & Sorcery", params: { with_genres: "14", with_keywords: "12470" } }, // sorcery
        ]
    },

    // 10. Romance
    "romance": {
        title: "Romance",
        description: "Love is in the air.",
        params: { with_genres: "10749", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Romantic Drama", params: { with_genres: "10749,18" } },
            { title: "Romantic Comedy", params: { with_genres: "10749,35" } }
        ]
    },

    // 11. Musical
    "musical": {
        title: "Musical",
        description: "Songs and dance.",
        params: { with_genres: "10402", sort_by: "popularity.desc" },
        subCategories: [
            { title: "Biopic", params: { with_genres: "10402", with_keywords: "5565" } },
            { title: "Concert", params: { with_genres: "10402", with_keywords: "10090" } }
        ]
    },

    // 12. Documentary
    "documentary": {
        title: "Documentary",
        description: "Real life stories.",
        params: { with_genres: "99", sort_by: "popularity.desc" },
        subCategories: [
            { title: "True Crime", params: { with_genres: "99", with_keywords: "9663" } }, // true crime
            { title: "Nature", params: { with_genres: "99", with_keywords: "10594" } }, // nature
            { title: "Biographical", params: { with_genres: "99", with_keywords: "5565" } },
            { title: "Science & Technology", params: { with_genres: "99", with_keywords: "10732" } },
            { title: "Politics & History", params: { with_genres: "99,36" } }
        ]
    },

    // --- HOMEPAGE SLUGS (to fix 404s) ---

    "space-epics": {
        title: "Cosmic Dread & Space Epics",
        description: "The vast loneliness and terrifying mystery of the final frontier.",
        params: { with_genres: "878", with_keywords: KEYWORDS.SPACE, sort_by: "vote_average.desc", "vote_count.gte": "500" }
    },

    "high-stakes": {
        title: "High Stakes: Survival & Disaster",
        description: "Characters pushed to their limits in the face of certain doom.",
        params: { with_keywords: KEYWORDS.SURVIVAL, sort_by: "popularity.desc" }
    },

    "the-abyss": {
        title: "The Abyss: Deep Sea & Submarines",
        description: "Claustrophobic tension in the world's deepest, darkest waters.",
        params: { with_keywords: KEYWORDS.SEA, sort_by: "vote_average.desc", "vote_count.gte": "100" }
    },

    "80s-scifi": {
        title: "80s Sci-Fi Gold",
        description: "Synths, neon, and high-concept imagination from a golden era.",
        params: { with_genres: "878", "primary_release_date.gte": "1980-01-01", "primary_release_date.lte": "1989-12-31", sort_by: "vote_count.desc" }
    },

    "adventure-heart": {
        title: "Adventure with Heart",
        description: "Epic journeys that stir the soul and warm the heart.",
        params: { with_genres: "12", sort_by: "vote_average.desc", "vote_count.gte": "1000", "vote_average.gte": "7" }
    },

    "smart-comedy": {
        title: "Smart Comedy",
        description: "Witty, intelligent, and genuinely funny stories.",
        params: { with_genres: "35", sort_by: "vote_count.desc", "vote_average.gte": "7.0" }
    }
};
