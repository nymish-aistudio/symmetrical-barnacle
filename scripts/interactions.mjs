#!/usr/bin/env node
/** Behaviour QA: elevator navigation, chapter reveal, keyboard reach, console errors. Fast flags on. */
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
const url = process.argv[2] || 'http://127.0.0.1:5173';
const exe = [process.env.CHROME_PATH, join(homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell')].filter(Boolean).find((p) => existsSync(p));
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
await page.goto(url + '/?fx=0&glass=0&snap=1', { waitUntil: 'load' });
await page.waitForFunction(() => window.__rig && window.__rig.frames > 4 && !document.querySelector('.intro'), null, { timeout: 120000 });
// elevator: ride to the floor
await page.evaluate(() => document.querectorAll ? null : document.querySelectorAll('.lift__list li button')[4].click());
await page.waitForTimeout(2600);
const lift = await page.evaluate(() => ({ active: document.querySelector('.lift__list .is-active')?.textContent, scrollY: Math.round(scrollY), depth: +window.__rig.depth.toFixed(2), plaque: document.querySelector('#floor .ch__plaque')?.textContent, bodyOpacity: getComputedStyle(document.querySelector('#floor .ch__body')).opacity }));
// descend button from the surface
await page.evaluate(() => window.__lenis.scrollTo(0, { immediate: true }));
await page.waitForTimeout(600);
await page.click('#surface .plate--ghost');
await page.waitForTimeout(2400);
const descend = await page.evaluate(() => ({ active: document.querySelector('.lift__list .is-active')?.textContent, scrollY: Math.round(scrollY) }));
// keyboard reach from the top
await page.evaluate(() => window.__lenis.scrollTo(0, { immediate: true }));
await page.waitForTimeout(400);
const order = [];
for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); order.push(await page.evaluate(() => (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent || '').trim().slice(0, 28))); }
// hover a plate: the fill should be present
const hover = await page.evaluate(() => { const b = document.querySelector('#surface .plate--solid'); return getComputedStyle(b, '::before').transform !== 'none'; });
console.log(JSON.stringify({ lift, descend, tabOrder: order, plateHasFill: hover, errors: errs }, null, 2));
await browser.close();
