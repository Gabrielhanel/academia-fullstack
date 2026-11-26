// Função "quente" que o V8 otimiza e depois desotimiza quando os tipos mudam. Uso: node --trace-opt --trace-deopt jit/quente.mjs
function somar(a, b) { return a + b; }
let acc = 0;
for (let i = 0; i < 200000; i++) acc = somar(acc, i % 10);          // sempre números: monomórfico
console.log('fase 1 (números):', acc);
let txt = '';
for (let i = 0; i < 2000; i++) txt = somar(txt, 'x');                // muda para strings: o código otimizado para números é descartado
console.log('fase 2 (strings):', txt.length);
