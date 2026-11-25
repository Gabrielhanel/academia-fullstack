// Medições dos padrões. Uso: node --expose-gc medicoes.mjs
import { EventEmitter } from 'node:events';
import { comCache, comValidacao } from './estruturais.mjs';
const med = (rotulo, fn, reps = 7) => { fn(); const t = []; for (let i = 0; i < reps; i++) { const t0 = performance.now(); fn(); t.push(performance.now() - t0); } t.sort((a, b) => a - b); console.log(rotulo.padEnd(58), 'mediana ms:', t[Math.floor(reps / 2)].toFixed(1)); };

console.log('== Observer: 11 ouvintes no mesmo evento');
const avisos = []; process.on('warning', (w) => avisos.push(w.name + ': ' + w.message.slice(0, 95)));
const em = new EventEmitter(); for (let i = 0; i < 11; i++) em.on('x', () => {});
await new Promise((r) => setTimeout(r, 50));
console.log('limite padrão listeners:', EventEmitter.defaultMaxListeners, '| avisos:', avisos.length ? avisos.join(' | ') : 'nenhum');

console.log('\n== Observer: vazamento de ouvintes (100.000 closures de ~1 KB) e coleta após remover');
const MB = (n) => (n / 1048576).toFixed(1);
global.gc(); const h0 = process.memoryUsage().heapUsed;
const e2 = new EventEmitter(); e2.setMaxListeners(0); const fns = [];
for (let i = 0; i < 100000; i++) { const dado = new Array(128).fill(i); const f = () => dado[0]; fns.push(f); e2.on('x', f); }
global.gc(); const h1 = process.memoryUsage().heapUsed;
for (const f of fns) e2.off('x', f); fns.length = 0; global.gc(); const h2 = process.memoryUsage().heapUsed;
console.log('heap inicial', MB(h0), 'MB | com 100.000 ouvintes', MB(h1), 'MB | após off + GC', MB(h2), 'MB | listenerCount', e2.listenerCount('x'));

console.log('\n== Proxy: custo de uma leitura de propriedade (10 milhões de leituras)');
const alvo = { x: 1 }; const prox = new Proxy({ x: 1 }, { get: (t, k) => t[k] }); const val = comValidacao({ x: 1 }, {});
med('objeto direto', () => { let s = 0; for (let i = 0; i < 1e7; i++) s += alvo.x; return s; });
med('Proxy com get repassando', () => { let s = 0; for (let i = 0; i < 1e7; i++) s += prox.x; return s; });
med('Proxy de validação (trap só de set; o get passa pelo Proxy)', () => { let s = 0; for (let i = 0; i < 1e7; i++) s += val.x; return s; });

console.log('\n== Decorator de cache: 100 leituras de 10 chaves com latência simulada de 5 ms');
const lento = async (k) => { await new Promise((r) => setTimeout(r, 5)); return k; };
for (const [rot, f] of [['sem cache', lento], ['com cache', comCache(lento)]]) { const t0 = performance.now(); for (let i = 0; i < 100; i++) await f(i % 10); console.log(rot.padEnd(12), (performance.now() - t0).toFixed(0), 'ms'); }
