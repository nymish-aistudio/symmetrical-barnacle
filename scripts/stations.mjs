#!/usr/bin/env node
/**
 * Composition QA without the GPU: hold the camera at each station (?cam=<id>&snap=1) with plain slabs
 * and no post-processing, wait for real frames, and screenshot.
 *   node scripts/stations.mjs [--url http://127.0.0.1:5173] [--out shots-st] [--mobile] [--full]
 * --full keeps post-processing (slow in software rendering; pair with --size 960x600). --ids a,b picks stations.
 */
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const url = opt('url', 'http://127.0.0.1:5173'), out = opt('out', 'shots-st');
const mobile = flag('mobile'), full = flag('full');
const [vw, vh] = (opt('size', mobile ? '390x844' : '1440x900')).split('x').map(Number); // e.g. --size 960x600 for cheaper full-effects frames
const ids = (opt('ids', '') || 'surface,fund,deal,company,floor,sheet,method,altitudes,who,start').split(',');

const exe = [process.env.CHROME_PATH, join(homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell')].filter(Boolean).find((p) => existsSync(p));
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
const context = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
for (const id of ids) {
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  const q = `?cam=${id}&snap=1${full ? '' : '&fx=0&glass=0'}`;
  await page.goto(url + q, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__rig && window.__rig.frames > 6, null, { timeout: 120000 }).catch(() => console.log('slow frames at', id));
  await page.waitForFunction(() => !document.querySelector('.intro'), null, { timeout: 30000 }).catch(() => console.log('intro still up at', id));
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(out, `${id}${mobile ? '-m' : ''}.png`) });
  console.log('wrote', id, errs.length ? errs.slice(0, 2) : '');
  await page.close();
}
await browser.close();
