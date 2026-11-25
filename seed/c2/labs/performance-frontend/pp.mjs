import puppeteer from '/tmp/claude-1000/-home-gabriel-Documentos-github-academia-v2/39978e8e-550c-4a6f-a4d6-437f8bb6a766/scratchpad/runner/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
async function medir(url, clicar) {
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 800 });
  await p.evaluateOnNewDocument(() => { window.__cls = 0; window.__ev = []; window.__lcp = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) window.__ev.push(Math.round(e.duration)); }).observe({ type: 'event', durationThreshold: 16, buffered: true }); });
  await p.goto('http://localhost:3120/' + url, { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 1500));
  if (clicar) { await p.click('#b'); await new Promise((r) => setTimeout(r, 1500)); }
  const r = await p.evaluate(() => ({ cls: Math.round(window.__cls * 1000) / 1000, lcp: Math.round(window.__lcp), eventos: window.__ev }));
  await p.close(); return r;
}
for (const u of ['cls-ruim.html', 'cls-bom.html']) console.log(u, JSON.stringify(await medir(u, false)));
for (const u of ['inp-lento.html', 'inp-dividido.html']) console.log(u, JSON.stringify(await medir(u, true)));
await b.close();
