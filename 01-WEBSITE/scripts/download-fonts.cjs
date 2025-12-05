/**
 * Download Google Fonts as self-hosted WOFF2 files
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, '..', 'fonts');

// Font configurations from Google Fonts CSS
const fonts = [
    // Playfair Display
    { name: 'playfair-display-v30-latin-regular', url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK.woff2' },
    { name: 'playfair-display-v30-latin-600', url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiu3DXbtXK.woff2' },
    { name: 'playfair-display-v30-latin-700', url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKebunDXbtXK.woff2' },

    // Inter
    { name: 'inter-v13-latin-300', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuOKfAZJhjp-Ek-_EeA.woff2' },
    { name: 'inter-v13-latin-regular', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZJhjp-Ek-_EeA.woff2' },
    { name: 'inter-v13-latin-500', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZJhjp-Ek-_EeA.woff2' },
    { name: 'inter-v13-latin-600', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZJhjp-Ek-_EeA.woff2' },
    { name: 'inter-v13-latin-700', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZJhjp-Ek-_EeA.woff2' },

    // Dancing Script
    { name: 'dancing-script-v25-latin-regular', url: 'https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSoHTeB9ptDqpw.woff2' },
    { name: 'dancing-script-v25-latin-700', url: 'https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7B1y0HTeB9ptDqpw.woff2' },
];

function downloadFont(font) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(FONTS_DIR, `${font.name}.woff2`);
        const file = fs.createWriteStream(filepath);

        https.get(font.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        }, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirect
                https.get(response.headers.location, (res) => {
                    res.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        const stats = fs.statSync(filepath);
                        resolve({ name: font.name, size: stats.size });
                    });
                }).on('error', reject);
            } else if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(filepath);
                    resolve({ name: font.name, size: stats.size });
                });
            } else {
                reject(new Error(`HTTP ${response.statusCode} for ${font.name}`));
            }
        }).on('error', reject);
    });
}

async function main() {
    console.log('Downloading Google Fonts for self-hosting...\n');

    // Ensure fonts directory exists
    if (!fs.existsSync(FONTS_DIR)) {
        fs.mkdirSync(FONTS_DIR, { recursive: true });
    }

    let totalSize = 0;

    for (const font of fonts) {
        try {
            const result = await downloadFont(font);
            totalSize += result.size;
            console.log(`  ✓ ${result.name} (${Math.round(result.size / 1024)}KB)`);
        } catch (err) {
            console.log(`  ✗ ${font.name}: ${err.message}`);
        }
    }

    console.log(`\nTotal font size: ${Math.round(totalSize / 1024)}KB`);
    console.log('Fonts saved to:', FONTS_DIR);
}

main();
