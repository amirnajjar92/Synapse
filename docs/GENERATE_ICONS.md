# PWA Icon Generation Instructions

## Auto-Generate Icons from Logo

To generate all PWA icons from your logo SVG, follow these steps:

### Option 1: Use an online PWA icon generator

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload `/public/vectors/simple-log.svg`
3. Download the generated icons
4. Extract and place them in `/public/icons/`

### Option 2: Use the PWA Asset Generator (Recommended)

Install and run:
```bash
npx @pwa/asset-generator public/vectors/simple-log.svg public/icons --icon-only --background "#0a0a0a" --padding "20%"
```

This will generate all required icon sizes automatically.

### Option 3: Manual icon generation using ImageMagick

If you have ImageMagick installed:

```bash
# Convert SVG to PNG at different sizes
for size in 72 96 128 144 152 192 384 512; do
  convert -background none -resize ${size}x${size} public/vectors/simple-log.svg public/icons/icon-${size}x${size}.png
done
```

## Required Icon Sizes

The following icon sizes are required by the PWA manifest:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## After Generating Icons

1. Place all icons in `/public/icons/`
2. Rebuild the app: `npm run build`
3. The PWA will be ready to install!

## Testing PWA

1. Build and start: `npm run build && npm start`
2. Open Chrome DevTools > Application > Manifest
3. Check "Service Workers" tab to verify registration
4. Use Lighthouse to audit PWA score
