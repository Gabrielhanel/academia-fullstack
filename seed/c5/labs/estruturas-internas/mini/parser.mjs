// Fase 2: análise sintática (tokens → AST) por descida recursiva com precedência.
import { tokenizar } from './lexer.mjs';
export function analisar(src) {
  const t = tokenizar(src); let p = 0;
  const olhar = () => t[p]; const prox = () => t[p++];
  const ehOp = (v) => olhar().tipo === 'op' && olhar().valor === v;
  const exigir = (v) => { if (!ehOp(v)) throw new SyntaxError('esperava "' + v + '" na posição ' + olhar().pos + ' mas veio "' + (olhar().valor ?? 'fim') + '"'); return prox(); };
  function primario() {
    const k = prox();
    if (k.tipo === 'num') return { tipo: 'Num', valor: k.valor };
    if (k.tipo === 'id') return { tipo: 'Var', nome: k.valor };
    if (k.tipo === 'op' && k.valor === '(') { const e = expressao(); exigir(')'); return e; }
    if (k.tipo === 'op' && k.valor === '-') return { tipo: 'Bin', op: '-', esq: { tipo: 'Num', valor: 0 }, dir: primario() };
    throw new SyntaxError('expressão inesperada na posição ' + k.pos);
  }
  const nivel = (ops, abaixo) => () => { let e = abaixo(); while (olhar().tipo === 'op' && ops.includes(olhar().valor)) { const op = prox().valor; e = { tipo: 'Bin', op, esq: e, dir: abaixo() }; } return e; };
  const multiplicativo = nivel(['*', '/', '%'], primario);
  const aditivo = nivel(['+', '-'], multiplicativo);
  const comparacao = nivel(['<', '>', '<=', '>=', '==', '!='], aditivo);
  function expressao() { return comparacao(); }
  function bloco() { exigir('{'); const s = []; while (!ehOp('}')) s.push(comando()); exigir('}'); return s; }
  function comando() {
    const k = olhar();
    if (k.tipo === 'let') { prox(); const nome = prox().valor; exigir('='); const e = expressao(); exigir(';'); return { tipo: 'Let', nome, expr: e }; }
    if (k.tipo === 'print') { prox(); const e = expressao(); exigir(';'); return { tipo: 'Print', expr: e }; }
    if (k.tipo === 'while') { prox(); exigir('('); const c = expressao(); exigir(')'); return { tipo: 'While', cond: c, corpo: bloco() }; }
    if (k.tipo === 'if') { prox(); exigir('('); const c = expressao(); exigir(')'); const a = bloco(); let b = []; if (olhar().tipo === 'else') { prox(); b = bloco(); } return { tipo: 'If', cond: c, entao: a, senao: b }; }
    if (k.tipo === 'id') { const nome = prox().valor; exigir('='); const e = expressao(); exigir(';'); return { tipo: 'Atrib', nome, expr: e }; }
    throw new SyntaxError('comando inesperado na posição ' + k.pos);
  }
  const prog = []; while (olhar().tipo !== 'fim') prog.push(comando());
  return { tipo: 'Programa', corpo: prog };
}
