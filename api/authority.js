// Authority API - Redirect to authority-score for backwards compatibility
// This endpoint exists because some code references /api/authority instead of /api/authority-score

export default async function handler(req, res) {
  // Forward all requests to authority-score
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://www.chrisdavidsalon.com';

  // Build the query string from the original request
  const queryString = new URLSearchParams(req.query).toString();
  const targetUrl = `${baseUrl}/api/authority-score${queryString ? '?' + queryString : ''}`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to proxy to authority-score',
      message: error.message
    });
  }
}
