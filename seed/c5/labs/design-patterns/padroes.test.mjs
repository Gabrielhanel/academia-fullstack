import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from './criacionais.mjs';
import * as E from './estruturais.mjs';
import * as P from './comportamentais.mjs';
import * as D from './di.mjs';

test('Factory: cria pelo tipo e rejeita desconhecidos', () => {
  assert.equal(C.criarDocumento('pdf', 'x').render(), 'PDF:x');
  assert.equal(C.criarDocumento('html', 'x').render(), '<p>x</p>');
  assert.throws(() => C.criarDocumento('doc', 'x'), /tipo desconhecido/);
});
test('Builder: encadeia e valida', () => {
  const q = C.ConsultaBuilder.de('pedidos').onde('status', 'pago').onde('uf', 'SP').ordenarPor('criado').limitar(10).construir();
  assert.equal(q.sql, 'SELECT * FROM pedidos WHERE status = ? AND uf = ? ORDER BY criado LIMIT 10');
  assert.deepEqual(q.params, ['pago', 'SP']);
  assert.throws(() => new C.ConsultaBuilder().construir(), /tabela obrigatória/);
});
test('Singleton de módulo: a mesma instância e o estado vaza entre testes', () => {
  const a = C.configuracaoGlobal.incrementar();
  const b = C.configuracaoGlobal.incrementar();
  assert.deepEqual([a, b], [1, 2]);
});
test('Singleton de módulo: este teste herda o estado do anterior (acoplamento por ordem)', () => {
  assert.equal(C.configuracaoGlobal.incrementar(), 3);
});
test('Instância por teste não vaza', () => { assert.equal(C.criarContador().inc(), 1); assert.equal(C.criarContador().inc(), 1); });

test('Adapter: a aplicação usa reais, o legado usa centavos', () => {
  const r = new E.AdaptadorPagamento(new E.GatewayAntigo()).pagar({ valor: 19.9, cartao: '4111111111111234' });
  assert.deepEqual(r, { aprovado: true, id: 'ANT-1234' });
});
test('Decorator: retry, cache e log compõem sem alterar a função original', async () => {
  let chamadas = 0;
  const instavel = async (k) => { chamadas++; if (chamadas < 3) throw new Error('falha'); return k * 2; };
  const comTudo = E.comCache(E.comRetry(instavel, 5));
  assert.equal(await comTudo(21), 42);
  assert.equal(chamadas, 3);
  assert.equal(await comTudo(21), 42);
  assert.equal(chamadas, 3);
  const log = []; await E.comLog(async (x) => x + 1, log)(1);
  assert.deepEqual(log, ['chamou [1]', 'retornou 2']);
});
test('Decorator: cache reduz chamadas (1000 leituras, 10 chaves)', async () => {
  let backend = 0; const f = E.comCache(async (k) => { backend++; return k; });
  for (let i = 0; i < 1000; i++) await f(i % 10);
  assert.equal(backend, 10); assert.equal(f.tamanho(), 10);
});
test('Facade: uma operação coordena três subsistemas e desfaz a reserva ao recusar', () => {
  const eventos = [];
  const estoque = { reservar: (i, q) => { eventos.push('reservar'); return q <= 2; }, liberar: () => eventos.push('liberar') };
  const f = new E.FachadaPedido({ estoque, pagamento: { pagar: ({ valor }) => ({ aprovado: valor > 0, id: 'P1' }) }, notificacao: { enviar: (m) => eventos.push(m) } });
  assert.deepEqual(f.comprar('a', 1, 10, 'x'), { ok: true, id: 'P1' });
  assert.deepEqual(f.comprar('a', 5, 10, 'x'), { ok: false, motivo: 'sem estoque' });
  assert.deepEqual(f.comprar('a', 1, 0, 'x'), { ok: false, motivo: 'recusado' });
  assert.deepEqual(eventos, ['reservar', 'pedido P1', 'reservar', 'reservar', 'liberar']);
});
test('Proxy: validação e carregamento preguiçoso', () => {
  const u = E.comValidacao({}, { idade: (v) => Number.isInteger(v) && v >= 0 });
  u.idade = 30; assert.equal(u.idade, 30);
  assert.throws(() => { u.idade = -1; }, /valor inválido para idade/);
  let criou = 0; const p = E.carregamentoPreguicoso(() => { criou++; return { x: 7 }; });
  assert.equal(criou, 0); assert.equal(p.x, 7); assert.equal(p.x, 7); assert.equal(criou, 1);
});
test('Composite: total recursivo', () => {
  const raiz = new E.Pasta('raiz', [new E.Arquivo('a', 10), new E.Pasta('sub', [new E.Arquivo('b', 5), new E.Arquivo('c', 1)])]);
  assert.equal(raiz.total(), 16);
});

test('Strategy: nova estratégia sem alterar a função', () => {
  assert.equal(P.calcularFrete('normal', 3), 16);
  assert.equal(P.calcularFrete('expresso', 3), 37);
  assert.equal(P.calcularFrete('drone', 3, { ...P.estrategiasFrete, drone: (kg) => 50 + kg }), 53);
  assert.throws(() => P.calcularFrete('drone', 3), /estratégia desconhecida/);
});
test('Observer: assinantes independentes e cancelamento', () => {
  const l = new P.Loja(); const a = []; const b = [];
  const ouvinteA = (i) => a.push(i); l.on('venda', ouvinteA); l.on('venda', (i) => b.push(i.toUpperCase()));
  l.vender('x'); l.off('venda', ouvinteA); l.vender('y');
  assert.deepEqual(a, ['x']); assert.deepEqual(b, ['X', 'Y']);
});
test('Command: desfazer', () => {
  const e = new P.Editor(); e.executar(P.inserir('Olá')); e.executar(P.inserir(', mundo'));
  assert.equal(e.texto, 'Olá, mundo'); e.voltar(); assert.equal(e.texto, 'Olá'); e.voltar(); e.voltar(); assert.equal(e.texto, '');
});
test('State: transições válidas e inválidas', () => {
  const p = new P.PedidoEstado().ir('pago').ir('enviado').ir('entregue');
  assert.equal(p.estado, 'entregue');
  assert.throws(() => new P.PedidoEstado().ir('enviado'), /transição inválida: novo → enviado/);
  assert.throws(() => p.ir('cancelado'), /entregue → cancelado/);
});
test('Chain of Responsibility: middlewares em ordem e curto-circuito', () => {
  const ordem = [];
  const exec = P.cadeia((c, n) => { ordem.push('auth'); if (!c.user) { c.status = 401; return c; } return n(); }, (c, n) => { ordem.push('log'); return n(); }, (c) => { c.status = 200; return c; });
  assert.equal(exec({ user: 'a' }).status, 200); assert.deepEqual(ordem, ['auth', 'log']);
  ordem.length = 0; assert.equal(exec({}).status, 401); assert.deepEqual(ordem, ['auth']);
});
test('Template Method e Iterator/gerador', () => {
  class Vendas extends P.Relatorio { titulo() { return 'Vendas'; } linhas() { return ['a: 1', 'b: 2']; } }
  assert.equal(new Vendas().gerar(), '== Vendas ==\na: 1\nb: 2\n-- fim --');
  assert.deepEqual([...P.tomar(P.naturais(), 5)], [1, 2, 3, 4, 5]);
});

test('DI manual: raiz de composição e dublês', () => {
  const s = D.raizDeComposicao(); assert.equal(s.cadastrar('Ana').id, 1); assert.equal(s.cadastrar('Bia').id, 2);
  const repo = new D.RepositorioMemoria(); const t = new D.ServicoCadastro({ repo, relogio: () => new Date('2026-11-25T10:00:00Z'), id: () => 'X' });
  assert.deepEqual(t.cadastrar('Ana'), { id: 'X', nome: 'Ana', em: '2026-11-25T10:00:00.000Z' });
});
test('Contêiner: ciclos de vida e dependência circular', () => {
  const c = new D.Container().registrar('repo', () => new D.RepositorioMemoria()).registrar('log', () => ({}), { ciclo: 'transiente' }).registrar('servico', (r) => ({ repo: r('repo'), log: r('log') }), { ciclo: 'transiente' });
  const s1 = c.resolver('servico'); const s2 = c.resolver('servico');
  assert.equal(s1.repo, s2.repo); assert.notEqual(s1.log, s2.log);
  assert.deepEqual(c.criacoes, { servico: 2, repo: 1, log: 2 });
  const circ = new D.Container().registrar('a', (r) => r('b')).registrar('b', (r) => r('a'));
  assert.throws(() => circ.resolver('a'), /dependência circular: a → b → a/);
  assert.throws(() => c.resolver('x'), /não registrado: x/);
});
test('Service locator: a dependência escondida só falha em execução', () => {
  D.registroGlobal.servicos = {};
  assert.throws(() => new D.ServicoComLocator().cadastrar('Ana'), TypeError);
  D.registroGlobal.servicos.repo = new D.RepositorioMemoria();
  assert.equal(new D.ServicoComLocator().cadastrar('Ana').nome, 'Ana');
});

import * as A from './antipatterns.mjs';
test('God Object: testar um desconto exige montar todas as dependências; a função pura não exige nenhuma', () => {
  const faltando = () => { throw new Error('não deveria ser usado'); };
  const god = new A.PedidoGod({ repo: {}, estoque: {}, pagamento: {}, email: {}, relogio: faltando, logger: {} });
  assert.equal(god.dependenciasExigidas, 6);
  assert.equal(god.descontoDoCliente({ vip: true }, 200), 20);
  assert.equal(A.descontoDoCliente({ vip: true }, 200), 20);
  assert.equal(A.descontoDoCliente({ vip: false }, 200), 0);
  assert.equal(A.descontoDoCliente.length, 2);
});
test('Callback hell x async/await: mesmo resultado, estrutura diferente', async () => {
  const ler = (nome, cb) => (cb ? setImmediate(() => cb(null, nome.toUpperCase())) : Promise.resolve(nome.toUpperCase()));
  assert.deepEqual(await new Promise((res, rej) => A.lerEmCadeia(ler, (e, r) => (e ? rej(e) : res(r)))), ['A', 'B', 'C']);
  assert.deepEqual(await A.lerComAwait(ler), ['A', 'B', 'C']);
  await assert.rejects(new Promise((res, rej) => A.lerEmCadeia((n, cb) => cb(new Error('falhou ' + n)), (e, r) => (e ? rej(e) : res(r)))), /falhou a/);
});
