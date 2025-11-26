// Vercel Serverless Function - Handles Gemini API calls securely
export default async function handler(req, res) {
  // Enable CORS for admin pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API key from Vercel environment variables only (never hardcoded)
  const API_KEY = process.env.GOOGLE_API_KEY || '';
  
  try {
    const { prompt, url } = req.body;
    
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt || `Analyze the SEO for ${url}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ 
      error: 'API call failed', 
      message: error.message,
      fallback: true 
    });
  }
}