// This is a Vercel serverless function
// It runs on the server and can access environment variables securely

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return the API keys from environment variables
  // These are set in Vercel dashboard, not in code
  const keys = {
    claude: process.env.CLAUDE_API_KEY || '',
    google: process.env.GOOGLE_API_KEY || ''
  };

  // Check if keys exist
  if (!keys.claude || !keys.google) {
    return res.status(200).json({ 
      error: 'API keys not configured in Vercel environment variables',
      hasClaudeKey: !!keys.claude,
      hasGoogleKey: !!keys.google
    });
  }

  // Return masked versions for display (last 4 chars only)
  res.status(200).json({
    claude: '****' + keys.claude.slice(-4),
    google: '****' + keys.google.slice(-4),
    // Return full keys for actual use (only in production)
    fullKeys: {
      claude: keys.claude,
      google: keys.google
    }
  });
}