import lighthouse from 'lighthouse'; import * as chromeLauncher from 'chrome-launcher';
const chrome = await chromeLauncher.launch({ chromePath: '/usr/bin/google-chrome', chromeFlags: ['--headless=new', '--no-sandbox'] });
for (const pg of ['ruim', 'bom', 'ruim', 'bom']) {
  const r = await lighthouse('http://localhost:3120/' + pg + '.html', { port: chrome.port, onlyCategories: ['performance'], output: 'json', logLevel: 'error' });
  const a = r.lhr.audits; const m = (k) => a[k].displayValue || a[k].numericValue;
  console.log(pg, '| nota', Math.round(r.lhr.categories.performance.score * 100), '| FCP', m('first-contentful-paint'), '| LCP', m('largest-contentful-paint'), '| CLS', m('cumulative-layout-shift'), '| TBT', m('total-blocking-time'), '| SI', m('speed-index'));
}
await chrome.kill();
