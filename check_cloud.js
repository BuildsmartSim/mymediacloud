const { getTorrents } = require('./src/lib/api/rd');

// Mock fetch for Node environment if needed, but since we are running in the project context with ts-node or similar, 
// we might need to handle the imports carefully. 
// actually, let's just use the existing API file if possible, or correct the imports.
// Since we are in a Next.js environment, running a standalone script is tricky with imports.
// I will just use a direct fetch script to be fail-safe.

const API_KEY = "OINO2PTRHGRL4IINOWQUCDSVS2OYIW5HAUOUR7D5IOZHKIX7OOXQ"; // From user's file
const URL = "https://api.real-debrid.com/rest/1.0/torrents?limit=20";

async function listFiles() {
    try {
        const res = await fetch(URL, {
            headers: { "Authorization": `Bearer ${API_KEY}` }
        });
        const json = await res.json();
        console.log("Your Cloud Content:");
        json.forEach(t => console.log(`- ${t.filename} (Status: ${t.status})`));
    } catch (e) {
        console.error(e);
    }
}

listFiles();
