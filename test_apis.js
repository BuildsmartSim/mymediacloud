async function testTorrents() {
    const query = "Deadpool";
    const apibayUrl = `https://apibay.org/q.php?q=${encodeURIComponent(query)}&cat=`;
    const ytsUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}`;

    console.log("Testing APIBay...");
    try {
        const res = await fetch(apibayUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log(`APIBay Status: ${res.status}`);
        const data = await res.json();
        console.log(`APIBay Results: ${data.length || 0}`);
    } catch (e) {
        console.error("APIBay Failed:", e.message);
    }

    console.log("\nTesting YTS...");
    try {
        const res = await fetch(ytsUrl);
        console.log(`YTS Status: ${res.status}`);
        const data = await res.json();
        console.log(`YTS Results: ${data.data?.movies?.length || 0}`);
    } catch (e) {
        console.error("YTS Failed:", e.message);
    }
}

testTorrents();
