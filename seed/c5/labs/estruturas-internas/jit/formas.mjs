// Acesso a propriedade monomórfico x polimórfico (formas/hidden classes diferentes). Uso: node jit/formas.mjs
const N = 5e6;
const med = (nome, fn) => { fn(); const t = []; for (let i = 0; i < 5; i++) { const t0 = performance.now(); fn(); t.push(performance.now() - t0); } t.sort((a, b) => a - b); console.log(nome.padEnd(46), t[2].toFixed(1).padStart(8), 'ms'); return t[2]; };
const mono = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: 1 }));
const poli = Array.from({ length: 1000 }, (_, i) => (i % 5 === 0 ? { x: i, y: 1 } : i % 5 === 1 ? { y: 1, x: i } : i % 5 === 2 ? { x: i, z: 0, y: 1 } : i % 5 === 3 ? { a: 0, x: i, y: 1 } : { x: i, y: 1, w: 9 }));
const soma = (arr) => { let s = 0; for (let k = 0; k < N / 1000; k++) for (let i = 0; i < arr.length; i++) s += arr[i].x; return s; };
const a = med('1 forma de objeto (monomórfico)', () => soma(mono));
const b = med('5 formas de objeto (polimórfico/megamórfico)', () => soma(poli));
console.log('razão polimórfico / monomórfico:', (b / a).toFixed(1) + 'x');
