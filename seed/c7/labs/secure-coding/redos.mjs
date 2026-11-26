// Mede o tempo de uma regex vulnerável (backtracking exponencial) x segura. Entradas até n=32 para não travar a máquina.
import { emailVulneravel, emailSeguro } from './seguro.mjs';
const t = (f) => { const a = performance.now(); f(); return performance.now() - a; };
console.log('n   | vulnerável (ms) | segura (ms) | razão vs n-2');
let ant = null;
for (const n of [20, 22, 24, 26, 28, 30, 32]) {
  const s = 'a'.repeat(n) + '!';
  const v = t(() => emailVulneravel(s)), g = t(() => emailSeguro(s));
  console.log(`${String(n).padEnd(3)} | ${v.toFixed(2).padStart(15)} | ${g.toFixed(4).padStart(11)} | ${ant ? (v / ant).toFixed(1) + 'x' : '—'}`);
  ant = v;
}
console.log('entrada de 100.000 caracteres na regex segura:', t(() => emailSeguro('a'.repeat(100000) + '!')).toFixed(4), 'ms (limite de tamanho evita trabalho)');
