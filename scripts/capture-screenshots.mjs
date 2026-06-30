import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGES = [
  { path: '/workout-tracker?show=true', name: 'workout-tracker' },
  { path: '/planner?show=true', name: 'planner' },
  { path: '/water-tracker?show=true', name: 'water-tracker' },
  { path: '/my-plans?show=true', name: 'my-plans' },
  { path: '/training-studio?tab=dashboard&show=true', name: 'training-studio-dashboard' },
  { path: '/training-studio?tab=messages&show=true', name: 'training-studio-messages' },
  { path: '/plan-progress-tracker?show=true', name: 'plan-progress-tracker' },
  { path: '/monitor?show=true', name: 'monitor' },
  { path: '/reminders?show=true', name: 'reminders' },
  { path: '/entertain?show=true', name: 'entertain' },
  { path: '/events?show=true', name: 'events' },
  { path: '/training-chat?show=true', name: 'training-chat' },
  { path: '/musclemap?show=true', name: 'musclemap' },
  { path: '/plan-list?show=true', name: 'plan-list' },
];

const OUT_DIR = path.resolve(__dirname, '..', 'public', 'screenshots', 'pages');
const BASE_URL = 'http://localhost:3000';
const VIEWPORT = { width: 402, height: 874 };

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`Server did not start within ${timeoutMs}ms`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log('📸 Screenshot capture starting...\n');

  // Build the app
  console.log('🔨 Building app...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

  // Start the server
  console.log('\n🚀 Starting server...');
  const server = spawn('npm', ['start'], {
    stdio: 'pipe',
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: '3000' },
    shell: true,
  });
  server.stdout.on('data', d => process.stdout.write(d));
  server.stderr.on('data', d => process.stderr.write(d));

  try {
    await waitForServer(`${BASE_URL}/`, 60000);
    console.log('✅ Server is ready\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
      locale: 'en-US',
      colorScheme: 'dark',
    });

    let captured = 0;
    let failed = 0;

    for (const page of PAGES) {
      const url = `${BASE_URL}${page.path}`;
      console.log(`  📄 ${page.name}...`);
      const tab = await context.newPage();

      try {
        await tab.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        await tab.waitForTimeout(2000);
        const outPath = path.join(OUT_DIR, `${page.name}.png`);
        await tab.screenshot({ path: outPath, fullPage: true });
        const size = existsSync(outPath) ? `${(await import('fs')).statSync(outPath).size / 1024 | 0}KB` : '?';
        console.log(`    ✅ ${page.name}.png (${VIEWPORT.width}x${VIEWPORT.height}, ${size})`);
        captured++;
      } catch (e) {
        console.error(`    ❌ ${page.name}: ${e.message}`);
        failed++;
        try {
          const outPath = path.join(OUT_DIR, `${page.name}-error.png`);
          await tab.screenshot({ path: outPath });
        } catch {}
      }

      await tab.close();
    }

    await browser.close();
    console.log(`\n📊 Done — ${captured} captured, ${failed} failed`);
    console.log(`📁 Output: ${OUT_DIR}`);
  } finally {
    server.kill('SIGTERM');
    setTimeout(() => process.exit(0), 1000);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
