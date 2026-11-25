const contador = () => { let n = 0; return { inc: () => ++n, valor: () => n }; };
const a = contador(), b = contador(); a.inc(); a.inc(); b.inc(); console.log(a.valor(), b.valor());
const compose = (...fs) => (x) => fs.reduceRight((acc, f) => f(acc), x);
const pipe = (...fs) => (x) => fs.reduce((acc, f) => f(acc), x);
const soma1 = (x)=>x+1, dobro=(x)=>x*2;
console.log(pipe(soma1,dobro)(3), compose(soma1,dobro)(3));
const curry = (f) => { const c = (...a) => a.length >= f.length ? f(...a) : (...b) => c(...a, ...b); return c; };
const soma3 = curry((x,y,z)=>x+y+z); console.log(soma3(1)(2)(3), soma3(1,2)(3));
const memo = (f) => { const m = new Map(); return (x) => m.has(x) ? m.get(x) : (m.set(x, f(x)), m.get(x)); };
let chamadas=0; const quad = memo((x)=>{chamadas++; return x*x;}); quad(4); quad(4); quad(5); console.log(chamadas);
const fib = memo((n)=> n<2?n:fib(n-1)+fib(n-2)); console.log(fib(50));
// recursão e pilha
const somaRec=(n)=>n===0?0:n+somaRec(n-1);
try{ somaRec(1e6);}catch(e){console.log(e.constructor.name);}
// Result / Option
const ok=(v)=>({ok:true,v}), err=(e)=>({ok:false,e});
const dividir=(a,b)=>b===0?err('div0'):ok(a/b);
const mapR=(r,f)=>r.ok?ok(f(r.v)):r;
console.log(mapR(dividir(10,2),x=>x+1), mapR(dividir(1,0),x=>x+1));
// var em loop
const fs=[]; for (var i=0;i<3;i++) fs.push(()=>i); console.log(fs.map(f=>f()));
const gs=[]; for (let j=0;j<3;j++) gs.push(()=>j); console.log(gs.map(f=>f()));
