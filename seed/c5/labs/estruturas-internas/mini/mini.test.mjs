import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenizar } from './lexer.mjs';
import { analisar } from './parser.mjs';
import { executarArvore } from './interpretador.mjs';
import { compilar, executarVM } from './vm.mjs';

const PROG = 'let s = 0; let i = 1; while (i <= 10) { if (i % 2 == 0) { s = s + i * i; } i = i + 1; } print s;';
const rodar = (src) => [executarArvore(analisar(src)), executarVM(compilar(analisar(src)))];

test('lexer: tokens e erro léxico', () => {
  assert.deepEqual(tokenizar('let x = 3.5;').map((t) => t.tipo), ['let', 'id', 'op', 'num', 'op', 'fim']);
  assert.throws(() => tokenizar('let x = 3 @ 4;'), /caractere inesperado "@"/);
});
test('parser: precedência e associatividade na AST', () => {
  const ast = analisar('print 1 + 2 * 3 - 4;');
  assert.equal(JSON.stringify(ast.corpo[0].expr), '{"tipo":"Bin","op":"-","esq":{"tipo":"Bin","op":"+","esq":{"tipo":"Num","valor":1},"dir":{"tipo":"Bin","op":"*","esq":{"tipo":"Num","valor":2},"dir":{"tipo":"Num","valor":3}}},"dir":{"tipo":"Num","valor":4}}');
  assert.throws(() => analisar('print (1 + 2;'), /esperava "\)"/);
});
test('as duas estratégias dão o mesmo resultado', () => {
  assert.deepEqual(rodar(PROG), [[220], [220]]);
  assert.deepEqual(rodar('print 7 % 4; print -3 + 5; print 2 < 3; print (1 + 2) * 3;'), [[3, 2, 1, 9], [3, 2, 1, 9]]);
  assert.deepEqual(rodar('let a = 5; if (a > 9) { print 1; } else { print 2; }'), [[2], [2]]);
});
test('erros semânticos: variável não definida', () => {
  assert.throws(() => executarArvore(analisar('print x;')), /variável não definida: x/);
  assert.throws(() => compilar(analisar('x = 1;')), /variável não definida: x/);
});
test('bytecode gerado para uma expressão simples', () => {
  const { codigo } = compilar(analisar('let a = 2 + 3 * 4;'));
  assert.equal(JSON.stringify(codigo), '[["PUSH",2],["PUSH",3],["PUSH",4],["*"],["+"],["STORE",0],["HALT"]]');
});
