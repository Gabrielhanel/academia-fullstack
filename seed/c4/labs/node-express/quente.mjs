function lento(n) { let s = 0; for (let i = 0; i < n; i++) s += Math.sqrt(i) % 7; return s; }
function ordenaTudo(a) { return [...a].sort((x, y) => x - y); }
function barato() { return 1 + 1; }
let acc = 0;
for (let i = 0; i < 40; i++) { acc += lento(2_000_000); acc += ordenaTudo(Array.from({ length: 20000 }, (_, k) => (k * 7919) % 10007)).length; acc += barato(); }
console.log('acc', acc > 0);
