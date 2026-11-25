import { setTimeout as sleep } from 'node:timers/promises';
// corrida lógica mesmo com 1 thread: await entre ler e escrever
let saldo = 100;
const sacar = async (v) => { const atual = saldo; await sleep(10); if (atual >= v) { saldo = atual - v; return true; } return false; };
let aprov = await Promise.all([sacar(80), sacar(80)]); console.log('sem mutex: aprovados', aprov.filter(Boolean).length, 'saldo', saldo);
// mutex assíncrono
class Mutex { #fila = Promise.resolve(); run(fn) { const p = this.#fila.then(fn); this.#fila = p.catch(() => {}); return p; } }
saldo = 100; const m = new Mutex();
const sacarSeguro = (v) => m.run(() => sacar(v));
aprov = await Promise.all([sacarSeguro(80), sacarSeguro(80)]); console.log('com mutex: aprovados', aprov.filter(Boolean).length, 'saldo', saldo);
// pool com limite de concorrência
async function pool(tarefas, limite) {
  const out = new Array(tarefas.length); let prox = 0, ativos = 0, max = 0;
  const worker = async () => { while (prox < tarefas.length) { const i = prox++; ativos++; max = Math.max(max, ativos); out[i] = await tarefas[i](); ativos--; } };
  await Promise.all(Array.from({ length: limite }, worker)); return { out, max };
}
const tarefas = Array.from({ length: 10 }, (_, i) => async () => { await sleep(20); return i * 2; });
const r = await pool(tarefas, 3); console.log(r.out.join(','), 'máx simultâneas:', r.max);
// Promise.all x allSettled
const falha = Promise.reject(new Error('x'));
console.log((await Promise.allSettled([sleep(1, 'a'), falha])).map((s) => s.status));
try { await Promise.all([sleep(1), Promise.reject(new Error('falhou'))]); } catch (e) { console.log(e.message); }
// timeout com AbortSignal
try { await sleep(500, null, { signal: AbortSignal.timeout(50) }); } catch (e) { console.log(e.name); }
// deadlock lógico: dois recursos em ordem oposta
const lock = () => new Mutex();
const A = lock(), B = lock();
const t1 = A.run(async () => { await sleep(10); return B.run(async () => 't1'); });
const t2 = B.run(async () => { await sleep(10); return A.run(async () => 't2'); });
const res = await Promise.race([Promise.all([t1, t2]), sleep(200, 'travou (deadlock)')]); console.log(res);
