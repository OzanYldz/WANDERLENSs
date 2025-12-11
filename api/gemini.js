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
    const prompt = `Analyze this image strictly as a travel guide AI.

    FIRST, determine if this is a legitimate LANDMARK, MONUMENT, MUSEUM, or HISTORICAL BUILDING.
    
    CRITICAL CHECK:
    - If the image shows ONLY a person, selfie, food, animal, car, electronic device, room interior, or common object (like slippers, cup, table):
    - DO NOT HALLUCINATE A LANDMARK NAME.
    - Instead, output: "NAME: [What you see, e.g. Bir Çift Terlik / A Coffee Cup]"
    - Then describe it briefly and say: "This seems to be an ordinary object. To hear the hidden stories of the city, please point your camera at a historical building, monument, or statue!" (Translate this guiding message to ${geminiLang}).
    - Do NOT use the location hint to make up a name for a non-landmark.

    LOCATION CONTEXT (Use ONLY if a physical landmark is clearly visible):
    ${locationHint}

    MODE: ${modeDescription || 'General Guide'}

    ABSOLUTE RULES (If it IS a landmark):
    1. NEVER say "You are at", "We are in", or share user's coordinates.
    2. Name the specific building. If you don't recognize the VISUAL, say "Bilinmeyen Yapı/Unknown Landmark". Do NOT use the city name as the landmark name (e.g. Do NOT say "Istanbul Building").
    3. Provide verified historical/cultural facts.
    4. Respond in ${geminiLang}.
    5. Format: "NAME: [Landmark Name]" followed by the description.`;

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
