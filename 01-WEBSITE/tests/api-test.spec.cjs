// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.chrisdavidsalon.com';

test.describe('API Endpoints Direct Test', () => {
    test('PageSpeed API (Performance, Technical, Mobile, UX)', async ({ request }) => {
        console.log('Testing PageSpeed API...');
        const response = await request.get(`${BASE_URL}/api/admin-data?type=seo-analysis`);
        const data = await response.json();
        console.log('PageSpeed Response:', JSON.stringify(data, null, 2).substring(0, 1000));
        expect(response.ok()).toBeTruthy();
    });

    test('Claude AI API (Content score)', async ({ request }) => {
        console.log('Testing AI Recommendations API...');
        const response = await request.get(`${BASE_URL}/api/admin-data?type=ai-recommendations`, { timeout: 30000 });
        const data = await response.json();
        console.log('AI Response:', JSON.stringify(data, null, 2).substring(0, 500));
        expect(response.ok()).toBeTruthy();
    });

    test('Google Places API (Local SEO)', async ({ request }) => {
        console.log('Testing Competitors API (Google Places)...');
        const response = await request.get(`${BASE_URL}/api/admin-data?type=competitors`, { timeout: 30000 });
        const data = await response.json();
        console.log('Competitors Response:', JSON.stringify(data, null, 2).substring(0, 500));
        expect(response.ok()).toBeTruthy();
    });

    test('OpenPageRank API (Authority)', async ({ request }) => {
        console.log('Testing Authority Score API...');
        const response = await request.get(`${BASE_URL}/api/authority-score?competitors=true`, { timeout: 30000 });
        const data = await response.json();
        console.log('Authority Response:', JSON.stringify(data, null, 2).substring(0, 500));
        expect(response.ok()).toBeTruthy();
    });
});
