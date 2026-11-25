import express from 'express';
import { rateLimit } from 'express-rate-limit';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sobe = (app) => new Promise((ok) => { const s = app.listen(0, '127.0.0.1', () => ok({ s, b: 'http://127.0.0.1:' + s.address().port })); });
console.log('== 1. express-rate-limit 8.7.5: 5 requisições por janela de 2 s');
{
  const app = express(); app.use(rateLimit({ windowMs: 2000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false, message: { erro: 'muitas requisições' } })); app.get('/x', (req, res) => res.json({ ok: 1 }));
  const { s, b } = await sobe(app); const codigos = []; let ultimo;
  for (let i = 0; i < 8; i++) { ultimo = await fetch(b + '/x'); codigos.push(ultimo.status); await ultimo.text(); }
  console.log('status das 8 requisições seguidas:', codigos.join(' '));
  console.log('cabeçalhos da última:', ['ratelimit', 'ratelimit-policy', 'retry-after'].map((h) => h + ': ' + ultimo.headers.get(h)).join(' | '));
  await sleep(2100); const r = await fetch(b + '/x'); console.log('depois da janela:', r.status); await r.text(); s.close();
}
console.log('\n== 2. janela fixa x balde de fichas: a rajada na virada da janela (limite 10 por segundo)');
const fixa = (limite, janelaMs, agora) => { let inicio = 0, cont = 0; return () => { const t = agora(); const j = Math.floor(t / janelaMs); if (j !== inicio) { inicio = j; cont = 0; } if (cont >= limite) return false; cont++; return true; }; };
const balde = (capacidade, repoeporSeg, agora) => { let fichas = capacidade, ultimo = agora(); return () => { const t = agora(); fichas = Math.min(capacidade, fichas + ((t - ultimo) / 1000) * repoeporSeg); ultimo = t; if (fichas >= 1) { fichas -= 1; return true; } return false; }; };
let relogio = 0; const agora = () => relogio;
const testa = (rotulo, fabrica) => { relogio = 900; const limitador = fabrica(); let aceitas = 0; for (let i = 0; i < 10; i++) { relogio = 900 + i * 5; if (limitador()) aceitas++; } let na2 = 0; for (let i = 0; i < 10; i++) { relogio = 1000 + i * 5; if (limitador()) na2++; } console.log(rotulo.padEnd(20), 'aceitas no fim da janela 1:', aceitas, '| aceitas no começo da janela 2:', na2, '| total em ~100 ms:', aceitas + na2); };
testa('janela fixa', () => fixa(10, 1000, agora)); testa('balde de fichas', () => balde(10, 10, agora));
console.log('\n== 3. limitação por chave: um cliente não consome a cota de outro');
{
  const app = express(); app.use(rateLimit({ windowMs: 5000, limit: 3, keyGenerator: (req) => req.get('x-api-key') ?? 'anon', standardHeaders: 'draft-7', legacyHeaders: false, validate: false })); app.get('/x', (req, res) => res.json({ ok: 1 }));
  const { s, b } = await sobe(app); const cod = async (k) => { const r = await fetch(b + '/x', { headers: { 'x-api-key': k } }); await r.text(); return r.status; };
  const a = []; for (let i = 0; i < 5; i++) a.push(await cod('A')); const bb = []; for (let i = 0; i < 2; i++) bb.push(await cod('B'));
  console.log('chave A (5 requisições):', a.join(' '), '| chave B (2 requisições):', bb.join(' ')); s.close();
}
