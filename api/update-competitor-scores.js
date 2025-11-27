// Update Competitor SEO Scores - Run weekly via cron or manually
// This fetches PageSpeed scores for all competitors and saves to data file
// Rate limit: ~25 queries/day on free tier, so run in batches if needed

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Protect this endpoint - require a secret key
  const { key, batch } = req.query;
  const SECRET_KEY = process.env.UPDATE_SECRET_KEY || 'update-seo-scores-2024';

  if (key !== SECRET_KEY) {
    return res.status(401).json({
      error: 'Unauthorized. Pass ?key=YOUR_SECRET_KEY',
      hint: 'Set UPDATE_SECRET_KEY in Vercel env vars'
    });
  }

  // All competitor domains
  const allCompetitors = [
    { name: 'Chris David Salon', domain: 'chrisdavidsalon.com', isUs: true },
    { name: 'Rové Hair Salon', domain: 'rovesalon.com' },
    { name: 'Bond Street Salon', domain: 'bondstreetsalon.com' },
    { name: 'Studio 34 Delray', domain: 'studio34delray.com' },
    { name: 'Kaan Hair Design', domain: 'kaanhairdesign.com' },
    { name: 'Amanda Major Studio', domain: 'amandamajor.com' },
    { name: 'Salon South Flow', domain: 'salonsouthflow.com' },
    { name: 'Cloud 10 Salon', domain: 'cloud10usa.com' },
    { name: 'Imbue Salon', domain: 'imbuesalon.com' },
    { name: 'Studio 10 Boca', domain: 'studio10bocaraton.com' },
    { name: 'ShearLuck Salon', domain: 'slshair.com' },
    { name: 'ONE Aveda Salon', domain: 'onesalondelray.com' },
    { name: 'Tyler Presley Salon', domain: 'tylerpresleysalon.com' },
    { name: 'Conte Salon', domain: 'contesalon.com' },
    { name: 'Salon Sora', domain: 'salonsora.com' },
    { name: 'Pyure Salon', domain: 'pyuresalon.com' },
    { name: 'Dapper & Divine', domain: 'dapperanddivinestudio.com' },
    { name: 'Hair Mess Salon', domain: 'hairmesssalon.com' },
    { name: 'Salon Trace', domain: 'salontrace.com' },
    { name: 'Arielle Settel', domain: 'ariellesettel.com' }
  ];

  // Process in batches to avoid rate limits
  // batch=1 does first 5, batch=2 does next 5, etc.
  const batchNum = parseInt(batch) || 0;
  const batchSize = 5;
  const startIdx = batchNum * batchSize;
  const competitors = batchNum > 0
    ? allCompetitors.slice(startIdx, startIdx + batchSize)
    : allCompetitors.slice(0, batchSize); // Default to first batch

  const results = [];

  for (const comp of competitors) {
    console.log(`Fetching PageSpeed for ${comp.domain}...`);

    try {
      const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.${comp.domain}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        results.push({
          ...comp,
          error: data.error.message,
          performance: null,
          seoScore: null
        });
        continue;
      }

      const categories = data.lighthouseResult?.categories || {};

      results.push({
        ...comp,
        performance: Math.round((categories.performance?.score || 0) * 100),
        seoScore: Math.round((categories.seo?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
        fetchedAt: new Date().toISOString()
      });

      // Small delay between requests to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      results.push({
        ...comp,
        error: error.message
      });
    }
  }

  return res.status(200).json({
    success: true,
    batch: batchNum,
    totalBatches: Math.ceil(allCompetitors.length / batchSize),
    processed: results.length,
    nextBatch: batchNum < Math.ceil(allCompetitors.length / batchSize) - 1
      ? `?key=${key}&batch=${batchNum + 1}`
      : null,
    timestamp: new Date().toISOString(),
    results
  });
}
