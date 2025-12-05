# How to Download ALL GBP Photos from business.google.com

Since you're logged into business.google.com as the business owner, you have access to ALL photos. Here's how to download them:

## Option 1: Use Google Takeout (RECOMMENDED - Gets EVERYTHING)

1. Go to: https://takeout.google.com
2. Click "Deselect all" at the top
3. Scroll down and check ONLY "Google Business Profile"
4. Click "Next step"
5. Choose delivery method (email download link)
6. Click "Create export"
7. Wait for email with download link (usually 1-24 hours)
8. Download the ZIP file - it contains ALL your GBP photos!

## Option 2: Manual Download from GBP Dashboard

1. In Safari, go to: https://business.google.com/locations
2. Click on "Chris David Salon"
3. Click "Photos" in the left menu
4. Click on each photo and use "Download" option (3 dots menu)

## Option 3: Browser Console Script

While on business.google.com with photos visible:

1. Open Safari Developer Tools:
   - Safari → Preferences → Advanced → Check "Show Develop menu in menu bar"
   - Then: Develop → Show Web Inspector (or Cmd+Option+I)

2. Go to the Console tab

3. Paste and run this script:

```javascript
// GBP Photo URL Extractor for business.google.com
(function() {
    const photos = new Set();

    // Find all image elements
    document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.dataset.src || '';
        if (src.includes('googleusercontent.com') || src.includes('lh3.') || src.includes('lh4.') || src.includes('lh5.')) {
            // Convert to high-res URL
            let highRes = src.replace(/=w\d+-h\d+/, '=w2000-h2000').replace(/=s\d+/, '=s2000');
            if (!highRes.includes('=w') && !highRes.includes('=s')) {
                highRes += '=w2000-h2000';
            }
            photos.add(highRes);
        }
    });

    // Check background images
    document.querySelectorAll('[style*="background"]').forEach(el => {
        const style = el.getAttribute('style') || '';
        const match = style.match(/url\(["']?([^"')]+)["']?\)/);
        if (match && (match[1].includes('googleusercontent.com') || match[1].includes('lh'))) {
            let url = match[1].replace(/=w\d+-h\d+/, '=w2000-h2000');
            photos.add(url);
        }
    });

    // Output results
    const urls = Array.from(photos);
    console.log(`Found ${urls.length} photos:`);
    console.log(urls.join('\n'));

    // Copy to clipboard
    const text = urls.join('\n');
    navigator.clipboard.writeText(text).then(() => {
        alert(`Found ${urls.length} photo URLs!\n\nThey have been copied to your clipboard.\n\nPaste them into a text file, then use the download script.`);
    }).catch(() => {
        // If clipboard fails, create downloadable file
        const blob = new Blob([text], {type: 'text/plain'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'gbp-photo-urls.txt';
        a.click();
        alert(`Found ${urls.length} photo URLs!\n\nDownloading as text file.`);
    });
})();
```

4. This will either:
   - Copy all URLs to clipboard, OR
   - Download a text file with all URLs

5. Once you have the URLs, save them to a file and I can create a script to download them all.

## Option 4: Scroll Through Photos First

If only a few photos appear, you need to scroll to load more:

1. Go to business.google.com → Your location → Photos
2. Scroll down slowly until ALL photos are loaded (wait for each batch)
3. Keep scrolling until no new photos load
4. THEN run the console script above

## After Getting URLs

Once you have a file with all the photo URLs, save it as:
`/Users/stuartkerr/Code/Chris_David_Salon/chrisdavidsalon/01-WEBSITE/scripts/gbp-urls.txt`

Then run:
```bash
cd /Users/stuartkerr/Code/Chris_David_Salon/chrisdavidsalon/01-WEBSITE
node scripts/download-from-urls.cjs
```

---

## Why I Can't Access Safari Directly

Unlike Chrome, Safari doesn't support the Chrome DevTools Protocol (CDP) that Playwright uses for remote debugging. Safari uses Apple's WebDriver protocol which requires a fresh browser session - it can't connect to your existing logged-in session.

That's why Google Takeout (Option 1) is the best approach - it's Google's official way to export all your business data including photos.
