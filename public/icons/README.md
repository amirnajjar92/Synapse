# PWA Icons

## Generate Icons

Run this command to generate all PWA icons from the logo:

```bash
npx pwa-asset-generator ../vectors/simple-log.svg . --icon-only --background "#0a0a0a" --padding "20%"
```

This will create all required icon sizes (72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512).

## Or use online tools:

1. https://www.pwabuilder.com/imageGenerator
2. Upload the logo SVG
3. Download and extract icons here

After generating icons, rebuild the app with `npm run build`.
