// Fase 1: análise léxica (texto → tokens).
const PALAVRAS = new Set(['let', 'while', 'if', 'else', 'print']);
export function tokenizar(src) {
  const tokens = []; let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9]/.test(c)) { let j = i; while (/[0-9.]/.test(src[j] || '')) j++; tokens.push({ tipo: 'num', valor: Number(src.slice(i, j)), pos: i }); i = j; continue; }
    if (/[A-Za-z_]/.test(c)) { let j = i; while (/[A-Za-z0-9_]/.test(src[j] || '')) j++; const t = src.slice(i, j); tokens.push({ tipo: PALAVRAS.has(t) ? t : 'id', valor: t, pos: i }); i = j; continue; }
    const dois = src.slice(i, i + 2);
    if (['<=', '>=', '==', '!='].includes(dois)) { tokens.push({ tipo: 'op', valor: dois, pos: i }); i += 2; continue; }
    if ('+-*/%<>=(){};'.includes(c)) { tokens.push({ tipo: 'op', valor: c, pos: i }); i++; continue; }
    throw new SyntaxError('caractere inesperado "' + c + '" na posição ' + i);
  }
  tokens.push({ tipo: 'fim', valor: null, pos: src.length });
  return tokens;
}
