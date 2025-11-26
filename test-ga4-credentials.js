// Test GA4 Credentials - Verify everything works before Vercel
// Run with: node test-ga4-credentials.js

const { BetaAnalyticsDataClient } = require('@google-analytics/data');

// Load from .env.local
require('dotenv').config({ path: '.env.local' });

async function testCredentials() {
  console.log('='.repeat(60));
  console.log('GA4 CREDENTIALS TEST');
  console.log('='.repeat(60));

  // Step 1: Check if env vars are set
  console.log('\n1. CHECKING ENVIRONMENT VARIABLES...\n');

  const propertyId = process.env.GA4_PROPERTY_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!propertyId) {
    console.log('❌ GA4_PROPERTY_ID is MISSING');
    return;
  }
  console.log(`✓ GA4_PROPERTY_ID: ${propertyId}`);

  if (!serviceAccountJson) {
    console.log('❌ GOOGLE_SERVICE_ACCOUNT_JSON is MISSING');
    return;
  }
  console.log(`✓ GOOGLE_SERVICE_ACCOUNT_JSON: Found (${serviceAccountJson.length} characters)`);

  // Step 2: Parse the JSON
  console.log('\n2. PARSING SERVICE ACCOUNT JSON...\n');

  let credentials;
  try {
    credentials = JSON.parse(serviceAccountJson);
    console.log('✓ JSON is valid');
    console.log(`  - type: ${credentials.type}`);
    console.log(`  - project_id: ${credentials.project_id}`);
    console.log(`  - client_email: ${credentials.client_email}`);
    console.log(`  - private_key_id: ${credentials.private_key_id}`);
    console.log(`  - private_key: ${credentials.private_key ? 'Present (' + credentials.private_key.length + ' chars)' : 'MISSING'}`);
  } catch (e) {
    console.log('❌ JSON PARSE ERROR:', e.message);
    console.log('\nFirst 200 chars of JSON:');
    console.log(serviceAccountJson.substring(0, 200));
    return;
  }

  // Step 3: Initialize the GA4 client
  console.log('\n3. INITIALIZING GA4 CLIENT...\n');

  let analyticsClient;
  try {
    analyticsClient = new BetaAnalyticsDataClient({
      credentials: credentials
    });
    console.log('✓ GA4 client initialized successfully');
  } catch (e) {
    console.log('❌ CLIENT INIT ERROR:', e.message);
    return;
  }

  // Step 4: Make a test API call
  console.log('\n4. TESTING GA4 API CALL...\n');
  console.log(`   Fetching data for property: ${propertyId}`);

  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }]
    });

    console.log('✓ API CALL SUCCESSFUL!\n');
    console.log('='.repeat(60));
    console.log('RESULTS:');
    console.log('='.repeat(60));

    if (response.rows && response.rows.length > 0) {
      const activeUsers = response.rows[0].metricValues[0].value;
      console.log(`\n   Active Users (last 7 days): ${activeUsers}\n`);
    } else {
      console.log('\n   No data returned (property may be new or have no traffic)\n');
    }

    console.log('='.repeat(60));
    console.log('✅ ALL CREDENTIALS ARE CORRECT AND WORKING!');
    console.log('='.repeat(60));
    console.log('\nThe problem is NOT your credentials.');
    console.log('The issue is getting them into Vercel correctly.\n');

  } catch (e) {
    console.log('❌ API CALL FAILED:', e.message);
    console.log('\nPossible issues:');
    console.log('  1. Service account not added to GA4 as Viewer');
    console.log('  2. Wrong Property ID');
    console.log('  3. API not enabled in Google Cloud Console');

    if (e.message.includes('permission')) {
      console.log('\n→ LIKELY: Service account needs Viewer access in GA4');
      console.log('  Go to: analytics.google.com → Admin → Property Access Management');
      console.log(`  Add: ${credentials.client_email} as Viewer`);
    }

    if (e.message.includes('not found') || e.message.includes('404')) {
      console.log('\n→ LIKELY: Wrong Property ID or API not enabled');
      console.log('  1. Verify Property ID in GA4 Admin → Property Settings');
      console.log('  2. Enable "Google Analytics Data API" in Google Cloud Console');
    }
  }
}

testCredentials();
