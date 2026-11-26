var antigo = 1;
let nuncaMudo = 2;
const naoUsada = 3;
export function f(a, b) {
  if (a == b) return nuncaMudo;
  if (valorInexistente) return antigo;
  switch (a) { case 1: return 'um'; case 2: return 'dois'; case 3: return 'três'; case 4: return 'quatro'; }
  return b ? (a ? 1 : 2) : (a ? 3 : 4);
}
