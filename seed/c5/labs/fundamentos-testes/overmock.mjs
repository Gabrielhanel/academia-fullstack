// Mostra o acoplamento à implementação: teste com mocks de interação x teste de estado, antes e depois de uma refatoração interna.
import { mock } from 'node:test';
import assert from 'node:assert/strict';
const total = (itens) => itens.reduce((s, i) => s + i.preco * i.qtd, 0);
// V1: grava e depois cobra. V2 (refatoração interna): grava o pedido já com o status e cobra via um método novo do repositório.
const v1 = ({ repo, pagamento }) => async (itens) => { const t = total(itens); const id = repo.salvar({ itens, total: t }); await pagamento.cobrar({ id, valor: t }); return { id, total: t }; };
const v2 = ({ repo, pagamento }) => async (itens) => { const t = total(itens); const id = repo.inserir({ itens, total: t, status: 'novo' }); await pagamento.cobrar({ id, valor: t }); return { id, total: t }; };
function repoFake() { const dados = []; const guardar = (p) => { dados.push(p); return dados.length; }; return { dados, salvar: guardar, inserir: guardar }; }
const testeComMock = async (impl) => { const repo = { salvar: mock.fn(() => 1) }; const pagamento = { cobrar: mock.fn(async () => ({})) }; await impl({ repo, pagamento })([{ preco: 5, qtd: 2 }]); assert.equal(repo.salvar.mock.callCount(), 1); assert.deepEqual(repo.salvar.mock.calls[0].arguments[0].total, 10); };
const testeDeEstado = async (impl) => { const repo = repoFake(); const pagamento = { cobrar: async () => ({}) }; const r = await impl({ repo, pagamento })([{ preco: 5, qtd: 2 }]); assert.equal(r.total, 10); assert.equal(repo.dados[0].total, 10); };
const roda = async (f, impl) => { try { await f(impl); return 'passa'; } catch (e) { return 'FALHA'; } };
console.log('teste'.padEnd(26), 'V1 (original)', 'V2 (refatorada: salvar -> inserir)');
for (const [nome, f] of [['mock de interação', testeComMock], ['estado (fake)', testeDeEstado]]) console.log(nome.padEnd(26), (await roda(f, v1)).padEnd(13), await roda(f, v2));
