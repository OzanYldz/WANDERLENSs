module.exports = async function handler(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { landmarkName, language } = request.body;

        if (!landmarkName) {
            return response.status(400).json({ error: 'landmarkName is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return response.status(500).json({ error: 'Server configuration error' });
        }

        const langMap = {
            tr: 'Türkçe', en: 'English', de: 'German', fr: 'French',
            es: 'Spanish', it: 'Italian', ja: 'Japanese', zh: 'Chinese'
        };
        const geminiLang = langMap[language] || 'English';

        const prompt = `Tell me a secret about "${landmarkName}". Respond in ${geminiLang}. 50-100 words. No markdown.`;

        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!geminiResponse.ok) {
            const err = await geminiResponse.text();
            return response.status(geminiResponse.status).json({ error: 'Gemini API error', details: err });
        }

        const data = await geminiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return response.status(200).json({ secret: text, success: true });
    } catch (error) {
        return response.status(500).json({ error: 'Internal server error', message: error.message });
    }
};
