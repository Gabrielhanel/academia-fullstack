import express from 'express';
import { Queue, Worker } from 'bullmq';
const conn = { host: '127.0.0.1', port: 57379 };
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
const sobe = (app) => new Promise((ok) => { const s = app.listen(0, '127.0.0.1', () => ok({ s, b: 'http://127.0.0.1:' + s.address().port })); });
console.log('Node', process.version, '| Express 5.3.0 | BullMQ 6.7.10 | Redis 8.12.0');

console.log('== 1. amplificação de retentativas em cadeia: A → B → C, cada camada tenta até 3 vezes quando recebe 5xx; C sempre falha');
let chamadasC = 0, chamadasB = 0;
const C = express(); C.get('/x', (req, res) => { chamadasC++; res.status(503).end(); });
const Cs = await sobe(C);
const comRetry = async (fn, tentativas) => { let r; for (let i = 0; i < tentativas; i++) { r = await fn(); if (r.status < 500) return r; } return r; };
const B = express(); B.get('/x', async (req, res) => { chamadasB++; const r = await comRetry(() => fetch(Cs.b + '/x'), 3); res.status(r.status).end(); });
const Bs = await sobe(B);
const A = express(); let chamadasA = 0; A.get('/x', async (req, res) => { chamadasA++; const r = await comRetry(() => fetch(Bs.b + '/x'), 3); res.status(r.status).end(); });
const As = await sobe(A);
await fetch(As.b + '/x');
console.log('uma requisição ao A (C sempre falha): chamadas a A =', chamadasA, '| a B =', chamadasB, '| a C =', chamadasC, '→ amplificação de', chamadasC, 'x no serviço que já está doente (3 × 3)');
chamadasA = chamadasB = chamadasC = 0;
const B2 = express(); B2.get('/x', async (req, res) => { chamadasB++; const r = await fetch(Cs.b + '/x'); res.status(r.status).end(); });
const B2s = await sobe(B2);
const A2 = express(); A2.get('/x', async (req, res) => { chamadasA++; const r = await comRetry(() => fetch(B2s.b + '/x'), 3); res.status(r.status).end(); });
const A2s = await sobe(A2); await fetch(A2s.b + '/x');
console.log('retry só na borda (A); B e C sem retry: chamadas a A =', chamadasA, '| a B =', chamadasB, '| a C =', chamadasC, '(3x em vez de 9x)');
for (const s of [Cs, Bs, As, B2s, A2s]) s.s.close();

console.log('\n== 2. acoplamento temporal: pedidos chegando enquanto o serviço de e-mail está FORA do ar');
let emailOnline = false; const enviados = [];
const email = express(); email.get('/enviar/:id', (req, res) => { if (!emailOnline) return res.status(503).end(); enviados.push(req.params.id); res.json({ ok: true }); });
let emailSrv = await sobe(email); const porta = emailSrv.s.address().port;
const urlEmail = 'http://127.0.0.1:' + porta;
const NPED = 50; let falhasSinc = 0;
for (let i = 1; i <= NPED; i++) { const r = await fetch(urlEmail + '/enviar/' + i).catch(() => ({ status: 599 })); if (r.status >= 500) falhasSinc++; }
console.log('modelo síncrono: dos', NPED, 'pedidos,', falhasSinc, 'falharam porque o e-mail estava fora (o pedido inteiro falha ou fica sem aviso)');
enviados.length = 0;
const fila = new Queue('emails', { connection: conn }); await fila.obliterate({ force: true });
let aceitos = 0; for (let i = 1; i <= NPED; i++) { await fila.add('enviar', { id: i }, { attempts: 20, backoff: { type: 'fixed', delay: 100 }, removeOnComplete: true }); aceitos++; }
const w = new Worker('emails', async (job) => { const r = await fetch(urlEmail + '/enviar/' + job.data.id); if (r.status >= 500) throw new Error('e-mail indisponível'); }, { connection: conn, concurrency: 5 });
await sleep(600); const antes = enviados.length;
emailOnline = true; const t0 = performance.now();
while (enviados.length < NPED && performance.now() - t0 < 15000) await sleep(50);
console.log('modelo assíncrono (fila): pedidos aceitos =', aceitos, '(todos) | e-mails enviados enquanto o serviço estava fora:', antes, '| depois que voltou:', enviados.length, 'de', NPED, 'em', ((performance.now() - t0) / 1000).toFixed(1), 's');
await w.close(); await fila.obliterate({ force: true }); await fila.close(); emailSrv.s.close();
process.exit(0);
