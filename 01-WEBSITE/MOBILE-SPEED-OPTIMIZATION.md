# Mobile Speed Optimization Plan

## Current Issues (Why We're Slow on Mobile)

1. **Large Images** - Using JPG/PNG instead of WebP
2. **No Lazy Loading** - Loading all images at once
3. **Render-Blocking CSS** - Tailwind CDN loads before content
4. **No Compression** - HTML/CSS/JS not minified
5. **Font Loading** - Font Awesome loads 200+ icons we don't use

## Immediate Actions

### 1. Convert Images to WebP
```bash
# Install cwebp tool
brew install webp

# Convert all images
for file in images/*.jpg images/*.jpeg images/*.png; do
  cwebp -q 80 "$file" -o "${file%.*}.webp"
done
```

### 2. Add Lazy Loading to Images
```html
<!-- Change all img tags from: -->
<img src="image.jpg" alt="...">

<!-- To: -->
<img src="image.webp" loading="lazy" alt="...">
```

### 3. Optimize CSS Loading
```html
<!-- Move Tailwind to bottom of body -->
<!-- Add critical CSS inline in <head> -->
<style>
  /* Critical above-fold styles only */
  body { margin: 0; font-family: system-ui; }
  .hero { min-height: 100vh; }
</style>
```

### 4. Reduce Font Awesome
```html
<!-- Instead of loading all icons: -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<!-- Load only what we use: -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/fontawesome.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/solid.min.css">
```

### 5. Enable Compression on Vercel
```json
// vercel.json
{
  "builds": [
    {
      "src": "**/*.{html,css,js}",
      "use": "@vercel/static"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Expected Results

- **Current Mobile Speed**: ~65/100
- **After WebP**: ~75/100
- **After Lazy Loading**: ~80/100
- **After CSS Optimization**: ~85/100
- **After Full Optimization**: ~90/100

## How to Measure

1. Google PageSpeed Insights: https://pagespeed.web.dev/
2. Enter: https://www.chrisdavidsalon.com
3. Check Mobile score

## Priority Order

1. **WebP conversion** - Biggest impact (10-15 point gain)
2. **Lazy loading** - Second biggest (5-10 points)
3. **CSS optimization** - (3-5 points)
4. **Font reduction** - (2-3 points)
5. **Compression** - (2-3 points)

Total potential gain: 22-36 points (from 65 to 87-101)