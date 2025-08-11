// Vercel Serverless Function to save/retrieve API keys
// This runs on the server, not in the browser

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Save API keys to Vercel environment variables
    // This would need to be configured in Vercel dashboard
    res.status(200).json({ message: 'Use Vercel Dashboard to set environment variables' });
  } else if (req.method === 'GET') {
    // Return masked API keys (only for display)
    const keys = {
      openai: process.env.OPENAI_API_KEY ? '****' + process.env.OPENAI_API_KEY.slice(-4) : '',
      google: process.env.GOOGLE_REVIEWS_API_KEY ? '****' + process.env.GOOGLE_REVIEWS_API_KEY.slice(-4) : '',
      yelp: process.env.YELP_API_KEY ? '****' + process.env.YELP_API_KEY.slice(-4) : ''
    };
    res.status(200).json(keys);
  }
}