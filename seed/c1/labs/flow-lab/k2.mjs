const cards = [
  { id: 'A', inicio: 0, fim: 3 }, { id: 'B', inicio: 1, fim: 6 }, { id: 'C', inicio: 2, fim: 4 }, { id: 'D', inicio: 4, fim: 9 }, { id: 'E', inicio: 6, fim: 8 },
  { id: 'F', inicio: 7, fim: 14 }, { id: 'G', inicio: 9, fim: 12 }, { id: 'H', inicio: 12, fim: 16 }, { id: 'I', inicio: 13, fim: 17 }, { id: 'J', inicio: 16, fim: 20 }
];
const T = 20;
const tempos = cards.map((c) => c.fim - c.inicio);
const W = tempos.reduce((a, b) => a + b, 0) / cards.length;          // cycle time médio
const lambda = cards.length / T;                                       // vazão (itens/dia)
let wipDia = []; for (let d = 0; d < T; d++) wipDia.push(cards.filter((c) => c.inicio <= d && d < c.fim).length);
const L = wipDia.reduce((a, b) => a + b, 0) / T;                       // WIP médio
console.log({ W, lambda, L, 'lambda*W': lambda * W, wipMax: Math.max(...wipDia) });
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]; };
console.log('p50', pct(tempos, 0.5), 'p85', pct(tempos, 0.85), 'p95', pct(tempos, 0.95));
// Monte Carlo
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function semanasParaConcluir(historico, restante, aleatorio) { let s = 0, feito = 0; while (feito < restante) { feito += historico[Math.floor(aleatorio() * historico.length)]; s++; } return s; }
const hist = [3, 5, 2, 4, 6, 3, 4, 5]; const r = rng(42); const res = Array.from({ length: 10000 }, () => semanasParaConcluir(hist, 30, r));
console.log('Monte Carlo 30 itens: p50', pct(res, 0.5), 'p85', pct(res, 0.85), 'p95', pct(res, 0.95), 'média hist', hist.reduce((a, b) => a + b) / hist.length);
const pert = (o, m, p) => ({ esperado: +((o + 4 * m + p) / 6).toFixed(2), desvio: +((p - o) / 6).toFixed(2) });
console.log(pert(2, 4, 12), pert(3, 5, 7));
// velocidade e burndown
const v = [21, 18, 24, 20, 17]; console.log('velocidade média', v.reduce((a, b) => a + b) / v.length, 'últimas 3', (v.slice(-3).reduce((a, b) => a + b) / 3).toFixed(1));
