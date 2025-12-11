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

    // Location hint for AI to help identify the building (internal use only)
    const locationHint = location ? `[INTERNAL HINT - DO NOT MENTION: approximate area is ${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}]` : '';

    // Strict factual accuracy prompt
    const prompt = `Analyze this photo of a building, monument, or landmark.
${locationHint}

${modeDescription || 'Describe what you see in an engaging way.'}

ABSOLUTE RULES - VIOLATION MEANS FAILURE:
1. State verified, factual information; you can use hearsay for rumors.
2. NEVER mention ANY coordinates, numbers, GPS, latitude, longitude in your response
3. STRICT PRIVACY: NEVER say "You are at...", "We are in...", "Your location is...", or "Here in...". This scares the user. output must NOT sound like tracking.
4. Describe the LANDMARK directly. (e.g., "The Galata Tower is..." instead of "You are looking at the Galata Tower")
5. If the landmark is in a specific city, you can mention the city as part of the landmark's history, but NOT as the user's current state.
6. The location hint above is ONLY for your identification - NEVER include it in response
7. Write simple descriptions for ordinary objects such as slippers, tables, side tables, and chairs that are not historical structures or buildings and have no historical value. Do not exaggerate or write long texts.

Respond in ${geminiLang}.
Start with "NAME:" followed by the building/landmark name (or "Bilinmeyen Yapı" if unknown).
Then provide description based ONLY on verified facts.
Keep it 100-150 words. No markdown.`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: imageData } }
        ]
      }]
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';

    // Post-process: Remove any coordinate-like numbers
    text = text.replace(/\d{5,}/g, ''); // Remove long number sequences
    text = text.replace(/\d+\.\d{4,}/g, ''); // Remove decimal coordinates
    text = text.replace(/latitude|longitude|koordinat|enlem|boylam/gi, '');

    return response.status(200).json({ text, success: true });
  } catch (error) {
    return response.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
