#!/usr/bin/env node
/**
 * Visual QA: load the site in headless Chromium, ride to every chapter station,
 * and write a screenshot per stop. Uses a locally cached browser; no download.
 *
 *   node scripts/shots.mjs [--url http://127.0.0.1:5173] [--mobile] [--reduce] [--og] [--out shots]
 */
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const url = opt('url', 'http://127.0.0.1:5173');
const out = opt('out', 'shots');
const mobile = flag('mobile'), reduce = flag('reduce'), og = flag('og');
const q = opt('q', ''); // extra query string, e.g. 'fx=0&glass=0&snap=1' for fast composition runs

const candidates = [
  process.env.CHROME_PATH,
  join(homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
  join(homedir(), '.cache/puppeteer/chrome-headless-shell/mac_arm-149.0.7827.22/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) { console.error('No Chromium found. Set CHROME_PATH.'); process.exit(1); }

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true, args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const context = await browser.newContext({
  viewport: og ? { width: 1200, height: 630 } : mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: mobile ? 2 : 1,
  isMobile: mobile, hasTouch: mobile,
  reducedMotion: reduce ? 'reduce' : 'no-preference',
});
const page = await context.newPage();
page.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !m.text().includes('GL Driver')) console.log(`[console.${m.type()}]`, m.text().slice(0, 300)); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url + (q ? `?${q}` : ''), { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => window.__rig && window.__rig.frames > 4 && !document.querySelector('.intro'), null, { timeout: 120000 }).catch(() => console.log('slow start'));
await page.waitForTimeout(600);

if (og) {
  await page.evaluate(() => { document.querySelector('.nav')?.remove(); document.querySelector('.lift')?.remove(); document.querySelector('.ch__hint')?.remove(); });
  // let the canvas finish fading in and the arrival dolly settle
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.gl')).opacity === '1', null, { timeout: 30000 }).catch(() => {});
  await page.waitForFunction((n) => window.__rig.frames > n, await page.evaluate(() => window.__rig.frames + 24), { timeout: 400000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/og.png' });
  console.log('wrote public/og.png');
  await browser.close();
  process.exit(0);
}

const targets = await page.evaluate(() =>
  Array.from(document.querySelectorAll('section.ch')).map((el) => [el.id, el.getBoundingClientRect().top + window.scrollY + Math.max(0, el.offsetHeight - window.innerHeight) * 0.5]),
);
targets.push(['footer', await page.evaluate(() => document.body.scrollHeight)]);

let i = 0;
for (const [name, y] of targets) {
  await page.evaluate((y) => { const l = window.__lenis; if (l) l.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); }, y);
  await page.waitForFunction((n) => window.__rig && window.__rig.frames > n, await page.evaluate(() => window.__rig.frames + 8), { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(400);
  const file = join(out, `${String(++i).padStart(2, '0')}-${name}${mobile ? '-m' : ''}${reduce ? '-rm' : ''}.png`);
  await page.screenshot({ path: file });
  console.log('wrote', file, 'y=', Math.round(y));
}
await browser.close();
