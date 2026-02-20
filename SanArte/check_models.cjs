const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const models = JSON.parse(data);
            if (models.models) {
                console.log("Available Models:");
                models.models.forEach(m => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                        console.log(`- ${m.name} (${m.displayName})`);
                    }
                });
            } else {
                console.log("Error or no models found:", data);
            }
        } catch (e) {
            console.error("Parse error:", e);
        }
    });
}).on('error', (e) => {
    console.error("Request error:", e);
});
