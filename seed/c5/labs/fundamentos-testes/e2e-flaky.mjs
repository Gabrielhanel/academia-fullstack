// Mede a flakiness de uma espera fixa x espera por condição em um E2E com resposta atrasada (0 a 300 ms).
import puppeteer from 'puppeteer-core';
import { criarServidor } from './src/servidor.mjs';
const s = criarServidor(); const porta = await s.ouvir();
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
const atrasos = [0, 50, 100, 150, 200, 250, 300, 0, 50, 100, 150, 200, 250, 300];
let falhasFixa = 0, falhasCondicao = 0, tFixa = 0, tCond = 0;
for (const atraso of atrasos) {
  for (const modo of ['fixa', 'condicao']) {
    const page = await browser.newPage(); await page.goto('http://127.0.0.1:' + porta + '/?atraso=' + atraso);
    const t0 = performance.now(); await page.click('#comprar');
    if (modo === 'fixa') await new Promise((r) => setTimeout(r, 120)); else await page.waitForFunction(() => document.getElementById('resultado').textContent.startsWith('Pedido'), { timeout: 5000 });
    const ok = (await page.$eval('#resultado', (e) => e.textContent)).startsWith('Pedido');
    const dt = performance.now() - t0;
    if (modo === 'fixa') { tFixa += dt; if (!ok) falhasFixa++; } else { tCond += dt; if (!ok) falhasCondicao++; }
    await page.close();
  }
}
console.log('execuções por modo:', atrasos.length, '| atrasos simulados: 0 a 300 ms');
console.log('espera fixa de 120 ms: falhas', falhasFixa + '/' + atrasos.length, '| tempo médio', (tFixa / atrasos.length).toFixed(0), 'ms');
console.log('espera por condição : falhas', falhasCondicao + '/' + atrasos.length, '| tempo médio', (tCond / atrasos.length).toFixed(0), 'ms');
await browser.close(); await s.fechar();
