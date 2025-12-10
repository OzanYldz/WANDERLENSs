module.exports = async function handler(request, response) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, location, modeDescription, language, requestType } = request.body;

    if (!imageData) {
      return response.status(400).json({ error: 'imageData is required' });
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

    let prompt = '';
    if (requestType === 'quickDetect') {
      const loc = location ? `User at Lat ${location.latitude}, Lon ${location.longitude}.` : '';
      prompt = `Analyze this image. ${loc} If historical landmark: "LANDMARK: [Name]". If not: "NOT_LANDMARK: [reason]". Max 50 words.`;
    } else {
      const loc = location ? `Location: ${location.latitude}, ${location.longitude}` : '';
      prompt = `Analyze this landmark photo. ${loc} ${modeDescription} Respond in ${geminiLang}. Start with "NAME:" then description. 150-250 words. No markdown.`;
    }

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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return response.status(200).json({ text, success: true });
  } catch (error) {
    return response.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
