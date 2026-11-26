// Mesmo laço numérico com e sem compilação JIT. Uso: node [--jitless] jit/laco.mjs
const N = 1000000;
function laco() { let s = 0; for (let i = 1; i <= N; i++) s = s + i * i % 7; return s; }
laco();
const t = []; for (let k = 0; k < 5; k++) { const t0 = performance.now(); laco(); t.push(performance.now() - t0); }
t.sort((a, b) => a - b);
console.log((process.execArgv.join(' ') || '(padrão, com JIT)').padEnd(22), 'mediana', t[2].toFixed(1), 'ms');
