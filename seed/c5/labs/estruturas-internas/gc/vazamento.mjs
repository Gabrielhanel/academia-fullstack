// Vazamento por cache sem limite x cache limitado. Uso: node --max-old-space-size=64 gc/vazamento.mjs [vaza|limitado]
const modo = process.argv[2] || 'limitado';
const MB = (n) => (n / 1048576).toFixed(0);
const cache = new Map();
const LIMITE = 5000;
let i = 0;
try {
  for (; i < 2e6; i++) {
    const chave = 'req-' + i;                                  // chave sempre nova: nunca há acerto
    cache.set(chave, { corpo: 'x'.repeat(200), i });
    if (modo === 'limitado' && cache.size > LIMITE) cache.delete(cache.keys().next().value);   // descarta a mais antiga
    if (i % 200000 === 0) console.log('i =', i, '| entradas', cache.size, '| heap usado', MB(process.memoryUsage().heapUsed), 'MB');
  }
  console.log('fim sem falha | entradas', cache.size, '| heap usado', MB(process.memoryUsage().heapUsed), 'MB');
} catch (e) { console.log('erro:', e.message); }
