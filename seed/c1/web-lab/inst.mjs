import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
for (const pg of ['manifest2.html', 'manifest-ruim.html', 'lab3.html']) {
  const p = await b.newPage(); await p.goto('http://127.0.0.1:8765/' + pg, { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 800));
  const s = await p.createCDPSession();
  const r = await s.send('Page.getInstallabilityErrors');
  console.log(pg, '->', r.installabilityErrors.length ? r.installabilityErrors.map((e) => e.errorId + JSON.stringify(e.errorArguments.map((a) => a.value))).join(' | ') : 'sem erros de instalabilidade');
  await p.close();
}
await b.close();
