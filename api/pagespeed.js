// PageSpeed API proxy - returns real Google PageSpeed data
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url = 'https://www.chrisdavidsalon.com' } = req.query;

  try {
    const API_KEY = process.env.GOOGLE_API_KEY || '';
    const apiUrl = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=seo&category=best-practices${API_KEY ? `&key=${API_KEY}` : ''}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('PageSpeed API error:', error);
    res.status(500).json({ error: 'PageSpeed test failed', message: error.message });
  }
}
