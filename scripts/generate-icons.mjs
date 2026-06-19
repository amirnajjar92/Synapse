import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Icon sizes required for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

// Read the SVG file
const svgPath = resolve(__dirname, '../public/vectors/simple-log.svg');
const svgBuffer = readFileSync(svgPath);

console.log('🎨 Generating PWA icons from logo...\n');

// Generate icons for each size
for (const size of sizes) {
  const outputPath = resolve(__dirname, `../public/icons/icon-${size}x${size}.png`);
  
  try {
    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 1 } // #0a0a0a background
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated icon-${size}x${size}.png`);
  } catch (error) {
    console.error(`❌ Failed to generate ${size}x${size}:`, error.message);
  }
}

// Generate maskable icons with padding for safe zone
console.log('\n🎭 Generating maskable icons...\n');

for (const size of maskableSizes) {
  const outputPath = resolve(__dirname, `../public/icons/manifest-icon-${size}.maskable.png`);
  
  try {
    // For maskable icons, we need to shrink the logo to 80% and center it
    // This ensures the icon looks good when masked in a circle or rounded square
    const iconSize = Math.floor(size * 0.7); // 70% of total size for safe zone
    
    await sharp(svgBuffer)
      .resize(iconSize, iconSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent
      })
      .extend({
        top: Math.floor((size - iconSize) / 2),
        bottom: Math.floor((size - iconSize) / 2),
        left: Math.floor((size - iconSize) / 2),
        right: Math.floor((size - iconSize) / 2),
        background: { r: 10, g: 10, b: 10, alpha: 1 } // #0a0a0a background
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated manifest-icon-${size}.maskable.png`);
  } catch (error) {
    console.error(`❌ Failed to generate maskable ${size}x${size}:`, error.message);
  }
}

// Generate Apple touch icon
const appleTouchPath = resolve(__dirname, '../public/icons/apple-icon-180.png');
try {
  await sharp(svgBuffer)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 10, g: 10, b: 10, alpha: 1 } // #0a0a0a background
    })
    .png()
    .toFile(appleTouchPath);
  
  console.log(`✅ Generated apple-icon-180.png`);
} catch (error) {
  console.error(`❌ Failed to generate apple touch icon:`, error.message);
}

console.log('\n🎉 All PWA icons generated successfully!');
console.log('📁 Location: /public/icons/');
console.log('🚀 Ready to build and test PWA installation!');
