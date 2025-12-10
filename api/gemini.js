module.exports = async function handler(request, response) {
  // CORS headers
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
    const { imageData, location, modeDescription, language } = request.body;

    if (!imageData) {
      return response.status(400).json({ error: 'imageData is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return response.status(500).json({ error: 'Server configuration error - no API key' });
    }

    const langMap = {
      tr: 'Türkçe', en: 'English', de: 'German', fr: 'French',
      es: 'Spanish', it: 'Italian', ja: 'Japanese', zh: 'Chinese'
    };
    const geminiLang = langMap[language] || 'English';

    const loc = location ? `Location hint: ${location.latitude}, ${location.longitude}` : '';

    // Simplified prompt - analyze ANY image, no landmark check
    const prompt = `Analyze this photo. ${loc}
${modeDescription || 'Describe what you see in an engaging way.'}
Respond in ${geminiLang}.
Start with "NAME:" followed by what you see (building name, object, or scene).
Then provide an interesting description.
IMPORTANT: Do NOT mention the user's location, coordinates, or GPS data in your response. Never say things like "you are at..." or mention latitude/longitude.
Keep it 100-200 words. No markdown formatting.`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: imageData } }
        ]
      }]
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';

    return response.status(200).json({ text, success: true });
  } catch (error) {
    return response.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
