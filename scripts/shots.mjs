#!/usr/bin/env node
/**
 * Visual QA: load the site in headless Chromium, scroll to named positions,
 * and write screenshots to ./shots. Uses a locally cached browser; no download.
 *
 *   node scripts/shots.mjs [--url http://127.0.0.1:5173] [--mobile] [--reduce] [--out shots]
 */
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : []).filter(Boolean));
const url = typeof args.url === 'string' ? args.url : 'http://127.0.0.1:5173';
const out = typeof args.out === 'string' ? args.out : 'shots';
const mobile = !!args.mobile;
const reduce = !!args.reduce;
const og = !!args.og; // write public/og.png from the loaded hero and exit

const candidates = [
  process.env.CHROME_PATH,
  join(homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
  join(homedir(), '.cache/puppeteer/chrome-headless-shell/mac_arm-149.0.7827.22/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
  join(homedir(), 'Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'),
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
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(`[console.${m.type()}]`, m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.addScriptTag({ content: 'window.__top = (el) => el.getBoundingClientRect().top + window.scrollY;' });
await page.waitForTimeout(2600);
if (og) { await page.evaluate(() => { document.querySelector('.nav')?.remove(); document.querySelector('.hero__hint')?.remove(); }); await page.waitForTimeout(300); await page.screenshot({ path: 'public/og.png' }); console.log('wrote public/og.png'); await browser.close(); process.exit(0); }

const targets = [
  ['hero-load', () => 0],
  ['hero-mid', () => document.querySelector('.hero').offsetHeight * 0.42],
  ['hero-ledger', () => document.querySelector('.hero').offsetHeight * 0.74],
  ['alts-deal', () => { const a = document.querySelector('#where'); return __top(a) + a.offsetHeight * 0.1; }],
  ['alts-fund', () => { const a = document.querySelector('#where'); return __top(a) + a.offsetHeight * 0.45; }],
  ['alts-portfolio', () => { const a = document.querySelector('#where'); return __top(a) + a.offsetHeight * 0.8; }],
  ['work-top', () => __top(document.querySelector('#work')) - 40],
  ['work-rows', () => __top(document.querySelector('#work')) + 380],
  ['work-earlier', () => __top(document.querySelector('.earlier')) - 420],
  ['develop-mid', () => { const d = document.querySelector('#develop'); return __top(d) - window.innerHeight * 0.45 + d.offsetHeight * 0.5; }],
  ['method', () => __top(document.querySelector('#method')) - 60],
  ['principles', () => __top(document.querySelector('#principles')) + 120],
  ['team', () => __top(document.querySelector('#team')) - 60],
  ['close', () => __top(document.querySelector('#close')) - 80],
  ['footer', () => document.body.scrollHeight],
];

let i = 0;
for (const [name, fn] of targets) {
  const y = await page.evaluate(fn);
  await page.evaluate((y) => { const l = window.__lenis; if (l) l.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); window.__ScrollTrigger?.update(); }, y);
  await page.waitForTimeout(2200);
  const file = join(out, `${String(++i).padStart(2, '0')}-${name}${mobile ? '-m' : ''}${reduce ? '-rm' : ''}.png`);
  await page.screenshot({ path: file });
  console.log('wrote', file, 'y=', Math.round(y));
}

// open the first ledger row to check the expanded state
await page.evaluate(() => { const d = document.querySelector('.row details'); d.open = true; const y = __top(d.closest('.row')) - 120; const l = window.__lenis; if (l) l.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); });
await page.waitForTimeout(1800);
await page.screenshot({ path: join(out, `${String(++i).padStart(2, '0')}-row-open${mobile ? '-m' : ''}.png`) });

await browser.close();
