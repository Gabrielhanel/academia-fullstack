import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { criarServidor } from '../src/servidor.mjs';

const CHROME = process.env.CHROME_BIN || '/usr/bin/google-chrome';
test('E2E: o fluxo de compra no navegador real (Chrome headless, servidor e SQLite reais)', async (t) => {
  const s = criarServidor({ relogio: () => new Date('2026-11-25T10:00:00Z') });
  const porta = await s.ouvir();
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await s.fechar(); });
  const base = 'http://127.0.0.1:' + porta;
  await t.test('compra com sucesso', async () => {
    const page = await browser.newPage();
    await page.goto(base + '/');
    await page.click('#comprar');
    await page.waitForFunction(() => document.getElementById('resultado').textContent.startsWith('Pedido'));
    assert.equal(await page.$eval('#resultado', (e) => e.textContent), 'Pedido 1 pago: R$ 20.00');
    assert.equal(s.repo.buscar(1).status, 'pago');
    await page.close();
  });
  await t.test('cupom desconhecido mostra o erro', async () => {
    const page = await browser.newPage();
    await page.goto(base + '/');
    await page.type('#cupom', 'XYZ');
    await page.click('#comprar');
    await page.waitForFunction(() => document.getElementById('resultado').textContent.length > 0);
    assert.equal(await page.$eval('#resultado', (e) => e.textContent), 'Erro: cupom desconhecido');
    await page.close();
  });
});
