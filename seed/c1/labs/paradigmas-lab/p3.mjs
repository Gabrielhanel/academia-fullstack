const pedido = { id: 1, itens: [{ n: 'a', p: 10, q: 2 }, { n: 'b', p: 5, q: 1 }] };
const total = (it) => it.reduce((s, i) => s + i.p * i.q, 0);
console.log(total(pedido.itens));
const novo = { ...pedido, itens: [...pedido.itens, { n: 'c', p: 1, q: 3 }] };
console.log(pedido.itens.length, novo.itens.length, total(novo.itens));
const congelado = Object.freeze({ a: 1, aninhado: { b: 2 } });
try { congelado.a = 9; } catch (e) { console.log(e.constructor.name); } congelado.aninhado.b = 99; console.log(congelado.a, congelado.aninhado.b);
console.log(structuredClone(pedido) !== pedido);
const nums = [1,2,3,4,5,6];
console.log(nums.filter(n=>n%2===0).map(n=>n*n).reduce((a,b)=>a+b,0));
console.log(nums.toSorted((a,b)=>b-a), nums, nums.with(0,100));
const agrupar = (xs,f)=>xs.reduce((m,x)=>{const k=f(x);(m[k] ??= []).push(x);return m;},{});
console.log(agrupar(nums,n=>n%3));
console.log(Object.groupBy(nums, n=>n%2?'impar':'par'));
// impura vs pura
let c=0; const imp=()=>++c; console.log(imp(),imp());
const pura=(n)=>n+1; console.log(pura(1),pura(1));
