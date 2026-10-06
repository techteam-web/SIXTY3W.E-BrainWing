// Drive the real application and photograph every screen at every viewport, reporting
// any LAW 1 violation the overflow guard picked up along the way.
//
//   npm run shoot
//   VP=390x844,1024x768,1920x1080,2560x1440 npm run shoot
//   VP=390x844 SECTIONS=plans,location npm run shoot
//
// Navigation goes through the app's own controls, not through the address bar: a raw
// <a href> is a full page load, which lands you back on the gate, and the point of this
// script is to exercise the transitions as well as the layouts.
//
// Needs the dev server running (npm run dev), or URL= pointing somewhere else.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL = process.env.URL ?? 'http://localhost:5184';
const OUT = process.env.OUT ?? '.cache/shots';
await mkdir(OUT, { recursive: true });

const VIEWPORTS = (process.env.VP ?? '1920x1080').split(',').map((v) => {
  const [w, h] = v.split('x').map(Number);
  return { name: v, width: w, height: h };
});

const SECTIONS = (
  process.env.SECTIONS ??
  'overview,residences,amenities,level-26,plans,location,specifications'
)
  .split(',')
  .filter(Boolean);

const browser = await chromium.launch();
const problems = [];

for (const vp of VIEWPORTS) {
  const phone = vp.width < 700;
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: phone,
    hasTouch: phone,
  });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`[${vp.name}] ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[${vp.name}] PAGEERROR ${e.message}`));

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${vp.name}-gate.png` });

  await page.evaluate(() => document.querySelector('#gate button')?.click());
  await page.waitForTimeout(7000);
  await page.screenshot({ path: `${OUT}/${vp.name}-landing.png` });

  const click = async (selector, wait = 3400) => {
    const ok = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return false;
      el.click();
      return true;
    }, selector);
    if (!ok) problems.push(`[${vp.name}] missing control ${selector}`);
    await page.waitForTimeout(wait);
    return ok;
  };

  // ENTER opens the visitor card first; photograph it, then skip through to the menu.
  await click('[data-enter]', 1200);
  await page.screenshot({ path: `${OUT}/${vp.name}-visitor.png` });
  await page.evaluate(() => {
    const skip = [...document.querySelectorAll('[data-visitor-card] button')].find((b) =>
      /skip/i.test(b.textContent),
    );
    skip?.click();
  });
  await page.waitForTimeout(3400);
  await page.screenshot({ path: `${OUT}/${vp.name}-menu.png` });

  for (const id of SECTIONS) {
    await click(`[data-section="${id}"]`);
    await page.screenshot({ path: `${OUT}/${vp.name}-${id}.png` });
    // Back to the menu through the rail, which is also the archFall direction.
    await click('[data-nav="back"]');
  }

  const overflows = await page.evaluate(() => window.__W63__?.overflows ?? []);
  if (overflows.length) {
    const seen = new Set();
    console.log(`\n${vp.name} — LAW 1:`);
    for (const o of overflows) {
      const key = `${o.screen}|${o.node}|${o.why}`;
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`   ${o.screen.padEnd(15)} ${o.node} — ${o.why}`);
    }
  }
  await ctx.close();
}

await browser.close();
if (problems.length) {
  console.log('\nproblems:');
  for (const p of [...new Set(problems)].slice(0, 40)) console.log('  ' + p);
}
console.log(`\nshots → ${OUT}`);
