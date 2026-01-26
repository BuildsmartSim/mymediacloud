const TMDB_API_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb";
const BASE_URL = "https://api.themoviedb.org/3";

async function testTMDB() {
    console.log("Testing TMDB Connection...");
    const url = `${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`;

    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            const data = await res.json();
            console.log(`Success! Found ${data.results?.length} trending movies.`);
            console.log(`First result: ${data.results?.[0]?.title}`);
        } else {
            const err = await res.text();
            console.error("Error response:", err);
        }
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}

testTMDB();
