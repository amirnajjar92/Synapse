import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Icon sizes required for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

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

console.log('\n🎉 All PWA icons generated successfully!');
console.log('📁 Location: /public/icons/');
console.log('🚀 Ready to build and test PWA installation!');
