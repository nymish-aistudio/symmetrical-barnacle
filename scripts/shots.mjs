#!/usr/bin/env node
/**
 * Visual QA. Loads the page in a locally cached headless Chromium and writes a
 * screenshot per section, plus a full-page strip.
 *   node scripts/shots.mjs [--url ...] [--mobile] [--reduce] [--out shots] [--full]
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

const exe = [process.env.CHROME_PATH,
  join(homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
  join(homedir(), '.cache/puppeteer/chrome-headless-shell/mac_arm-149.0.7827.22/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
].filter(Boolean).find((p) => existsSync(p));
if (!exe) { console.error('No Chromium found. Set CHROME_PATH.'); process.exit(1); }

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({
  viewport: og ? { width: 1200, height: 630 } : mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile,
  reducedMotion: reduce ? 'reduce' : 'no-preference',
});
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 240)); });

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), null, { timeout: 30000 }).catch(() => console.log('never became ready'));
await page.waitForTimeout(2200);

if (og) {
  await page.evaluate(() => { document.querySelector('.nav')?.remove(); document.querySelector('.lift')?.remove(); document.querySelector('.hero__hint')?.remove(); });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/og.png' });
  console.log('wrote public/og.png');
  await browser.close();
  process.exit(0);
}
const sfx = `${mobile ? '-m' : ''}${reduce ? '-rm' : ''}`;
const ids = await page.evaluate(() => Array.from(document.querySelectorAll('section[id]')).map((s) => s.id));
let i = 0;
await page.screenshot({ path: join(out, `${String(++i).padStart(2, '0')}-load${sfx}.png`) });
for (const id of ids) {
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    const top = el.getBoundingClientRect().top + scrollY, h = el.offsetHeight;
    const y = Math.max(0, h <= innerHeight ? top - (innerHeight - h) / 2 : top - 78);
    window.scrollTo({ top: y, behavior: 'instant' });
  }, id);
  await page.waitForTimeout(1300);
  await page.screenshot({ path: join(out, `${String(++i).padStart(2, '0')}-${id}${sfx}.png`) });
  console.log('wrote', id);
}
// the sheet, mid-transformation
await page.evaluate(() => { const f = document.getElementById('sheet-fig'); window.scrollTo({ top: f.getBoundingClientRect().top + scrollY - innerHeight * 0.3, behavior: 'instant' }); });
await page.waitForTimeout(1300);
await page.screenshot({ path: join(out, `${String(++i).padStart(2, '0')}-sheet-mid${sfx}.png`) });
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
await page.waitForTimeout(1200);
await page.screenshot({ path: join(out, `${String(++i).padStart(2, '0')}-footer${sfx}.png`) });
if (flag('full')) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(out, `00-full${sfx}.png`), fullPage: true });
}
await browser.close();
