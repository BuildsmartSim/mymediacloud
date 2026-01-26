const https = require('https');

const query = "superman";
const url = `https://yts.mx/api/v2/list_movies.json?query_term=${query}&limit=5`;

console.log("Testing YTS API:", url);

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Status:", json.status);
            console.log("Movie count:", json.data?.movie_count || 0);
            if (json.data?.movies) {
                json.data.movies.forEach(m => {
                    console.log(`- ${m.title} (${m.year}) - ${m.torrents?.length || 0} torrents`);
                    if (m.torrents) {
                        m.torrents.forEach(t => console.log(`   ${t.quality} - Hash: ${t.hash?.substring(0, 10)}...`));
                    }
                });
            }
        } catch (e) {
            console.error("Parse error:", e.message);
            console.log("Raw response:", data.substring(0, 500));
        }
    });
}).on('error', e => console.error("Request error:", e.message));
