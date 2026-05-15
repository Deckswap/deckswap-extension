import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:4321/screenshots';
const STATES = ['detect', 'scanning', 'complete', 'pushed'];
const OUT = new URL('.', import.meta.url).pathname;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

// Match Chrome Web Store requirement: 1280x800
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });

for (const state of STATES) {
    await page.goto(`${BASE}#${state}`, { waitUntil: 'networkidle0' });
    // Wait for Google Fonts to load
    await new Promise(r => setTimeout(r, 1500));

    const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1280, height: 800 } });
    const filename = `${OUT}screenshot-${STATES.indexOf(state) + 1}-${state}.png`;
    writeFileSync(filename, png);
    console.log(`Saved: screenshot-${STATES.indexOf(state) + 1}-${state}.png`);
}

await browser.close();
console.log('Done — 4 screenshots saved.');
