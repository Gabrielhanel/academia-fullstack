// Kata da calculadora de strings: os mesmos 8 testes rodam contra cada passo da implementação (IMPL=v0..v7).
import test from 'node:test';
import assert from 'node:assert/strict';
const impl = await import('./impl-' + (process.env.IMPL || 'v7') + '.mjs');
const somar = impl.somar;
test('1. texto vazio vale 0', () => assert.equal(somar(''), 0));
test('2. um número devolve ele mesmo', () => assert.equal(somar('5'), 5));
test('3. dois números separados por vírgula', () => assert.equal(somar('1,2'), 3));
test('4. quantidade qualquer de números', () => assert.equal(somar('1,2,3,4'), 10));
test('5. nova linha também separa', () => assert.equal(somar('1\n2,3'), 6));
test('6. separador personalizado //;\\n', () => assert.equal(somar('//;\n1;2'), 3));
test('7. números negativos lançam erro listando-os', () => assert.throws(() => somar('1,-1,2,-3'), /negativos não permitidos: -1,-3/));
test('8. números acima de 1000 são ignorados', () => assert.equal(somar('2,1001,1000'), 1002));
