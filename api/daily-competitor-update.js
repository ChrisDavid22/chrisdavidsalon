// Daily Competitor SEO Update
// Runs 4 competitors per day to stay within PageSpeed API quota
// Day 1: Competitors 1-4
// Day 2: Competitors 5-8
// Day 3: Competitors 9-12
// Day 4: Competitors 13-16
// Day 5: Competitors 17-20
// Day 6-7: Chris David Salon (refresh our own score)
//
// Call this via Vercel Cron: 0 6 * * * (daily at 6 AM)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // All competitor domains in order
  const allCompetitors = [
    // Day 1 (Monday)
    { name: 'Rové Hair Salon', domain: 'rovesalon.com' },
    { name: 'Bond Street Salon', domain: 'bondstreetsalon.com' },
    { name: 'Studio 34 Delray', domain: 'studio34delray.com' },
    { name: 'Kaan Hair Design', domain: 'kaanhairdesign.com' },
    // Day 2 (Tuesday)
    { name: 'Amanda Major Studio', domain: 'amandamajor.com' },
    { name: 'Salon South Flow', domain: 'salonsouthflow.com' },
    { name: 'Cloud 10 Salon', domain: 'cloud10usa.com' },
    { name: 'Imbue Salon', domain: 'imbuesalon.com' },
    // Day 3 (Wednesday)
    { name: 'Studio 10 Boca', domain: 'studio10bocaraton.com' },
    { name: 'ShearLuck Salon', domain: 'slshair.com' },
    { name: 'ONE Aveda Salon', domain: 'onesalondelray.com' },
    { name: 'Tyler Presley Salon', domain: 'tylerpresleysalon.com' },
    // Day 4 (Thursday)
    { name: 'Conte Salon', domain: 'contesalon.com' },
    { name: 'Salon Sora', domain: 'salonsora.com' },
    { name: 'Pyure Salon', domain: 'pyuresalon.com' },
    { name: 'Dapper & Divine', domain: 'dapperanddivinestudio.com' },
    // Day 5 (Friday)
    { name: 'Hair Mess Salon', domain: 'hairmesssalon.com' },
    { name: 'Salon Trace', domain: 'salontrace.com' },
    { name: 'Arielle Settel', domain: 'ariellesettel.com' },
    { name: 'Chris David Salon', domain: 'chrisdavidsalon.com', isUs: true }
  ];

  // Determine which batch to run based on day of week
  // 0 = Sunday, 1 = Monday, etc.
  const dayOfWeek = new Date().getDay();
  const batchSize = 4;

  // Map day to batch: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat/Sun=skip or re-run Chris David
  let batchIndex;
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    batchIndex = dayOfWeek - 1; // Mon=0, Tue=1, etc.
  } else {
    // Weekend - just update Chris David Salon
    batchIndex = 4; // Last batch which includes Chris David
  }

  // Allow manual override via query param
  const { batch, key } = req.query;
  if (batch !== undefined) {
    batchIndex = parseInt(batch);
  }

  // Simple auth check
  const SECRET = process.env.CRON_SECRET || 'daily-update-2024';
  if (key && key !== SECRET) {
    return res.status(401).json({ error: 'Invalid key' });
  }

  const startIdx = batchIndex * batchSize;
  const todaysCompetitors = allCompetitors.slice(startIdx, startIdx + batchSize);

  if (todaysCompetitors.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No competitors to update for this batch',
      batchIndex,
      dayOfWeek
    });
  }

  const results = [];

  for (const comp of todaysCompetitors) {
    console.log(`Fetching PageSpeed for ${comp.domain}...`);

    try {
      // Try with www first, then without
      let data = await fetchPageSpeed(`https://www.${comp.domain}`);
      if (data.error && data.error.includes('FAILED_DOCUMENT_REQUEST')) {
        data = await fetchPageSpeed(`https://${comp.domain}`);
      }

      if (data.error) {
        results.push({
          ...comp,
          error: data.error,
          performance: null,
          seoScore: null
        });
      } else {
        results.push({
          ...comp,
          performance: data.performance,
          seoScore: data.seoScore,
          accessibility: data.accessibility,
          bestPractices: data.bestPractices,
          fetchedAt: new Date().toISOString()
        });
      }

      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      results.push({
        ...comp,
        error: error.message
      });
    }
  }

  // TODO: Save results to KV store or database for persistence
  // For now, return results to be manually saved

  return res.status(200).json({
    success: true,
    dayOfWeek,
    batchIndex,
    batchName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][batchIndex] || 'Weekend',
    competitorsUpdated: results.length,
    timestamp: new Date().toISOString(),
    results,
    schedule: {
      monday: allCompetitors.slice(0, 4).map(c => c.name),
      tuesday: allCompetitors.slice(4, 8).map(c => c.name),
      wednesday: allCompetitors.slice(8, 12).map(c => c.name),
      thursday: allCompetitors.slice(12, 16).map(c => c.name),
      friday: allCompetitors.slice(16, 20).map(c => c.name)
    }
  });
}

async function fetchPageSpeed(url) {
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.error) {
      return { error: data.error.message };
    }

    const categories = data.lighthouseResult?.categories || {};

    return {
      performance: Math.round((categories.performance?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100)
    };
  } catch (error) {
    return { error: error.message };
  }
}
