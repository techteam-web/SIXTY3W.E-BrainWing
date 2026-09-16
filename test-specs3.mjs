import { chromium } from 'playwright';

const url = process.env.APP_URL || 'http://localhost:5185/';
const outDir = 'C:/Users/Hujrgs/AppData/Local/Temp/claude/c--Users-Hujrgs-Desktop-Sixty3/cbc203d8-5d4c-4d3e-8124-d9a891536c50/scratchpad';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));

await page.goto(`${url}specifications`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);

const enter = page.getByRole('button', { name: /enter/i }).first();
if (await enter.isVisible().catch(() => false)) {
  await enter.click();
  await page.waitForTimeout(3500);
}

await page.screenshot({ path: `${outDir}/70-fixed-hallmarks.png` });

await page.getByRole('button', { name: /internal finishes/i }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${outDir}/71-fixed-interiors.png` });

console.log('CONSOLE_ERRORS:', JSON.stringify(errors, null, 2));
await browser.close();
