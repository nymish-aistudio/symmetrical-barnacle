#!/usr/bin/env node
/** Behaviour and accessibility checks: anchors, rail, focus order, contrast, console. */
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:5173';
const exe = [process.env.CHROME_PATH, join(homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell')].filter(Boolean).find((p) => existsSync(p));
const browser = await chromium.launch({ executablePath: exe, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), null, { timeout: 30000 });

/** wait until the smooth scroll has moved and then held still */
async function settle() {
  let last = await page.evaluate(() => scrollY), moved = false, still = 0;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(200);
    const y = await page.evaluate(() => scrollY);
    if (Math.abs(y - last) > 0.5) { moved = true; still = 0; } else if (moved && ++still >= 2) return y;
    last = y;
  }
  return last;
}

// every in-page anchor arrives at its section and lights the right rail entry
const anchors = [];
for (const id of ['fund', 'sheet', 'build', 'who', 'start', 'surface']) {
  await page.click(`.lift__list a[href="#${id}"]`);
  await settle();
  anchors.push(await page.evaluate((id) => {
    const el = document.getElementById(id);
    return { id, top: Math.round(el.getBoundingClientRect().top), at: document.querySelector('.lift__list a.is-at')?.dataset.lift };
  }, id));
}

// contrast: resolve any CSS colour format through a canvas, and test against the
// darkest tone the shader backdrop can paint as well as the flat fallback
const WORST_BACKDROP = '#ccdcf2';
const contrast = await page.evaluate((worst) => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d');
  const rgb = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); return Array.from(cx.getImageData(0, 0, 1, 1).data).slice(0, 3); };
  const lum = (c) => { const v = rgb(c).map((n) => { const x = n / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
  const bg = getComputedStyle(document.body).backgroundColor;
  const out = {};
  for (const [name, sel] of [['prose', '.prose'], ['sign', '.floor__name'], ['gauge', '.floor__gauge'], ['rail idle', '.lift__list a:not(.is-at)'], ['lede', '.lede'], ['role', '.people__role'], ['footer', '.foot__in p'], ['pillar', '.pillars li']]) {
    const el = document.querySelector(sel); if (!el) continue;
    const fg = getComputedStyle(el).color;
    out[name] = [ratio(fg, bg), ratio(fg, worst)];
  }
  return out;
}, WORST_BACKDROP);

// keyboard: the first tabs must reach the skip link and the nav actions
await page.reload({ waitUntil: 'networkidle' });
await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'), null, { timeout: 30000 });
await page.waitForTimeout(600);
const tabs = [];
for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); tabs.push(await page.evaluate(() => (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent || '').trim().slice(0, 26))); }

const headings = await page.evaluate(() => Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => h.tagName));
console.log(JSON.stringify({ anchors, contrast, tabs, headings: `${headings.filter((h) => h === 'H1').length}×h1, ${headings.filter((h) => h === 'H2').length}×h2, ${headings.filter((h) => h === 'H3').length}×h3`, errors: errs }, null, 1));
await browser.close();
