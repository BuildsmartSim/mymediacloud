const https = require('https');

const API_KEY = "OINO2PTRHGRL4IINOWQUCDSVS2OYIW5HAUOUR7D5IOZHKIX7OOXQ";
const options = {
    hostname: 'api.real-debrid.com',
    path: '/rest/1.0/torrents?limit=20',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${API_KEY}`
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("FRESH_CLOUD_LIST:");
            if (Array.isArray(json)) {
                json.forEach(t => console.log(`- ${t.filename} (Status: ${t.status})`));
            } else {
                console.log("API returned non-array:", json);
            }
        } catch (e) {
            console.error(e);
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
