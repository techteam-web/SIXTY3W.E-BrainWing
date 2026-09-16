import { chromium } from 'playwright';
const outDir = 'C:/Users/Hujrgs/AppData/Local/Temp/claude/c--Users-Hujrgs-Desktop-Sixty3/cbc203d8-5d4c-4d3e-8124-d9a891536c50/scratchpad';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto('http://localhost:5185/specifications', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const enter = page.getByRole('button', { name: /enter/i }).first();
if (await enter.isVisible().catch(() => false)) { await enter.click(); await page.waitForTimeout(3500); }
await page.screenshot({ path: `${outDir}/72-crop-check.png`, clip: { x: 60, y: 420, width: 400, height: 60 } });
await browser.close();
