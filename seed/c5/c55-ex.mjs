// C5.5 — Ferramentas de teste para JavaScript: exercícios, avaliação final e projeto.
// Medições reais do laboratório (Jest 30.5.2, Vitest 5.1.2, Supertest 7.3.2, Playwright 1.65.1, Cypress 16.3.0, actionlint 1.7.12); os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'ftj-01': [
  { id: 'ftj-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Em um projeto ESM, de onde se importa o objeto jest no Jest 30?', options: ['É global, sem import', 'Do pacote @jest/globals', 'De node:test', 'De vitest'], answer: 1, explanation: 'Em ESM o global jest não é injetado: importe jest, describe, test e expect de @jest/globals.' },
  { id: 'ftj-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Esquecer o await em expect(promessa).rejects.toThrow(...) pode fazer o teste passar sem verificar nada.', answer: true, explanation: 'O teste termina antes de a asserção assíncrona ser avaliada; use await ou retorne a promessa.' },
  { id: 'ftj-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o matcher ao comportamento.', pairs: [['toBe', 'Object.is (primitivos e referência)'], ['toEqual', 'Igualdade profunda do objeto inteiro'], ['toMatchObject', 'Subconjunto: ignora campos extras'], ['toHaveBeenCalledWith', 'Argumentos de uma chamada de um mock']], explanation: 'Escolha o mais específico que expresse a intenção.' },
  { id: 'ftj-01-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §igualAoEstiloJest(a, b)§ (como o §toEqual§): igualdade profunda em que objetos ignoram chaves cujo valor é §undefined§, arrays comparam a ordem e o tamanho, §NaN§ é igual a §NaN§ e valores primitivos usam §Object.is§ (então §0§ e §-0§ são diferentes).', lang: 'javascript', starter: 'function igualAoEstiloJest(a, b) {\n  // seu código aqui\n}\n', hints: ['Trate arrays antes de objetos.', 'Filtre as chaves com valor undefined antes de comparar.'], tests: [{ name: 'primitivos e arrays', code: R`assert.equal(igualAoEstiloJest(1, 1), true);
assert.equal(igualAoEstiloJest(NaN, NaN), true);
assert.equal(igualAoEstiloJest(0, -0), false);
assert.equal(igualAoEstiloJest([1, [2]], [1, [2]]), true);
assert.equal(igualAoEstiloJest([1, 2], [2, 1]), false);
assert.equal(igualAoEstiloJest([1], [1, 2]), false);` }, { name: 'objetos', code: R`assert.equal(igualAoEstiloJest({ a: 1, b: undefined }, { a: 1 }), true);
assert.equal(igualAoEstiloJest({ a: { x: [1] } }, { a: { x: [1] } }), true);
assert.equal(igualAoEstiloJest({ a: 1 }, { a: 2 }), false);
assert.equal(igualAoEstiloJest({ a: 1 }, [1]), false);
assert.equal(igualAoEstiloJest(null, {}), false);
assert.equal(igualAoEstiloJest(null, null), true);` }], solution: R`function igualAoEstiloJest(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => igualAoEstiloJest(x, b[i]));
  const ka = Object.keys(a).filter((k) => a[k] !== undefined);
  const kb = Object.keys(b).filter((k) => b[k] !== undefined);
  return ka.length === kb.length && ka.every((k) => Object.hasOwn(b, k) && igualAoEstiloJest(a[k], b[k]));
}`, explanation: 'O toEqual ignora propriedades undefined; o toStrictEqual não.' },
  { id: 'ftj-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Quando você usaria snapshots no Jest e que cuidados tomaria? Quando preferiria asserções explícitas?', model: 'Snapshots servem para saídas grandes e estáveis (relatórios, mensagens, serialização): prefere-se o inline, pequeno, determinístico (relógio e ids fixos) e revisado em PR; evita-se atualizar com -u sem ler o diff. Para regras de negócio prefere-se asserções explícitas, que dizem a intenção, enquanto um snapshot grande esconde o que importa e vira ruído. No laboratório o objeto do cupom foi gravado em um snapshot inline de 3 linhas e passou.', rubric: ['Quando snapshots ajudam', 'Cuidados: pequeno, determinístico, revisado', 'Evitar -u por reflexo', 'Asserções explícitas para regras de negócio'], explanation: 'Resumo da aula.' },
  { id: 'ftj-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarFnMock(impl)§ (mock simplificado do Jest): devolve uma função §f§ que chama a implementação atual (ou devolve §undefined§) e registra em §f.mock.calls§ a lista de argumentos e em §f.mock.results§ objetos §{ type: "return", value }§ ou §{ type: "throw", value: erro }§ (relançando o erro). Métodos: §mockReturnValueOnce(v)§ (enfileira valores usados antes da implementação), §mockImplementation(fn)§ e §mockClear()§ (zera calls e results, mantém a implementação).', lang: 'javascript', starter: 'function criarFnMock(impl) {\n  // seu código aqui\n}\n', hints: ['Mantenha uma fila de valores únicos.', 'Registre o resultado também quando a implementação lançar.'], tests: [{ name: 'registro', code: R`const f = criarFnMock((a, b) => a + b);
assert.equal(f(1, 2), 3);
assert.equal(f(5, 5), 10);
assert.equal(JSON.stringify(f.mock.calls), '[[1,2],[5,5]]');
assert.equal(JSON.stringify(f.mock.results), '[{"type":"return","value":3},{"type":"return","value":10}]');
f.mockClear();
assert.equal(f.mock.calls.length, 0);
assert.equal(f(2, 2), 4);` }, { name: 'once, troca e erro', code: R`const f = criarFnMock();
assert.equal(f(), undefined);
f.mockReturnValueOnce('a').mockReturnValueOnce('b');
assert.equal(f(), 'a'); assert.equal(f(), 'b'); assert.equal(f(), undefined);
f.mockImplementation(() => { throw new Error('boom'); });
assert.throws(() => f(9), 'boom');
const ult = f.mock.results[f.mock.results.length - 1];
assert.equal(ult.type, 'throw');
assert.equal(ult.value.message, 'boom');` }], solution: R`function criarFnMock(impl) {
  let atual = impl; const fila = [];
  const f = (...args) => {
    f.mock.calls.push(args);
    try {
      const v = fila.length ? fila.shift() : (atual ? atual(...args) : undefined);
      f.mock.results.push({ type: 'return', value: v });
      return v;
    } catch (e) {
      f.mock.results.push({ type: 'throw', value: e });
      throw e;
    }
  };
  f.mock = { calls: [], results: [] };
  f.mockReturnValueOnce = (v) => { fila.push(v); return f; };
  f.mockImplementation = (fn) => { atual = fn; return f; };
  f.mockClear = () => { f.mock.calls = []; f.mock.results = []; return f; };
  return f;
}`, explanation: 'O jest.fn real registra também instances, contexts e muito mais; este é o núcleo.' }
],
'ftj-02': [
  { id: 'ftj-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Que mudanças básicas portam um teste do Jest para o Vitest?', options: ['Reescrever todos os testes', 'Importar de vitest e trocar jest. por vi.', 'Trocar o Node por Deno', 'Nenhuma mudança'], answer: 1, explanation: 'No laboratório, dois replace e os 13 testes passaram.' },
  { id: 'ftj-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: o Vitest foi mais rápido que o Jest nas suítes minúsculas do laboratório.', answer: false, explanation: 'Jest 1,54 s e Vitest 2,07 s (mediana de 5, parede); o tempo é de inicialização e o ganho do Vitest aparece em suítes grandes e no watch.' },
  { id: 'ftj-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o recurso do Vitest ao uso.', pairs: [['expect.soft', 'Acumular falhas sem interromper o teste'], ['test.concurrent', 'Rodar testes do mesmo arquivo em paralelo'], ['vi.stubEnv', 'Definir variáveis de ambiente temporárias'], ['vi.mock hoisted', 'Substituir um módulo inteiro antes dos imports']], explanation: 'Recursos próprios ou comuns com o Jest.' },
  { id: 'ftj-02-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §criarSoft()§ (modelo do §expect.soft§): devolve §{ verificar(condicao, mensagem), falhas(), encerrar() }§. §verificar§ registra §mensagem§ se §condicao§ for falsa (e não lança); §falhas()§ devolve a lista de mensagens; §encerrar()§ lança §Error§ com o texto §N falha(s): m1; m2§ se houver falhas (N = quantidade; mensagens unidas por §"; "§); sem falhas não faz nada.', lang: 'javascript', starter: 'function criarSoft() {\n  // seu código aqui\n}\n', hints: ['Guarde as mensagens em um array.', 'Monte a mensagem final com join("; ").'], tests: [{ name: 'acumula', code: R`const s = criarSoft();
s.verificar(1 + 1 === 2, 'soma');
s.verificar(false, 'primeira');
s.verificar(0, 'segunda');
assert.equal(JSON.stringify(s.falhas()), '["primeira","segunda"]');` }, { name: 'encerrar', code: R`const s = criarSoft();
s.verificar(true, 'ok');
s.encerrar();
const t = criarSoft(); t.verificar(false, 'a'); t.verificar(false, 'b');
assert.throws(() => t.encerrar(), '2 falha(s): a; b');` }], solution: R`function criarSoft() {
  const msgs = [];
  return {
    verificar(cond, msg) { if (!cond) msgs.push(msg); },
    falhas: () => [...msgs],
    encerrar() { if (msgs.length) throw new Error(msgs.length + ' falha(s): ' + msgs.join('; ')); }
  };
}`, explanation: 'Com asserções soft, todas as falhas independentes aparecem em uma execução.' },
  { id: 'ftj-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Sua equipe quer migrar do Jest para o Vitest. Que motivos, que riscos e que plano de migração você apresentaria, usando os dados medidos?', model: 'Motivos: ESM e TypeScript nativos sem Babel nem flags experimentais, configuração compartilhada com o Vite, watch rápido e API compatível. Riscos: mocks de módulo (hoisting), snapshots com formatação diferente, ambientes e matchers customizados, e a expectativa errada de velocidade (no laboratório Jest 1,54 s x Vitest 2,07 s em suítes minúsculas). Plano: instalar vitest e o provedor de cobertura, criar a config, trocar imports e jest. por vi. (ou globals: true), revisar vi.mock, timers e snapshots (atualizar uma vez, revisando o diff), rodar as duas ferramentas em paralelo por um tempo comparando resultados e medir no projeto real antes de decidir.', rubric: ['Motivos reais (ESM, TS, config)', 'Riscos (mocks, snapshots, expectativa de velocidade)', 'Plano em etapas e execução em paralelo', 'Uso dos números medidos'], explanation: 'Resumo da aula.' },
  { id: 'ftj-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §executarComLimite(tarefas, limite)§ (assíncrona), semelhante ao controle de concorrência: §tarefas§ é uma lista de funções assíncronas; execute-as com no máximo §limite§ ao mesmo tempo e devolva a lista de resultados NA ORDEM das tarefas. Se uma tarefa rejeitar, a função rejeita com o mesmo erro.', lang: 'javascript', starter: 'async function executarComLimite(tarefas, limite) {\n  // seu código aqui\n}\n', hints: ['Use um índice compartilhado e `limite` trabalhadores.', 'Guarde cada resultado em resultados[i].'], tests: [{ name: 'ordem e limite', code: R`let ativas = 0, maxAtivas = 0;
const tarefa = (v, ms) => async () => { ativas++; maxAtivas = Math.max(maxAtivas, ativas); await new Promise((r) => setTimeout(r, ms)); ativas--; return v; };
const r = await executarComLimite([tarefa('a', 30), tarefa('b', 5), tarefa('c', 10), tarefa('d', 1), tarefa('e', 1)], 2);
assert.equal(JSON.stringify(r), '["a","b","c","d","e"]');
assert.equal(maxAtivas, 2);` }, { name: 'erro e vazio', code: R`assert.equal(JSON.stringify(await executarComLimite([], 3)), '[]');
let msg = '';
try { await executarComLimite([async () => 1, async () => { throw new Error('falhou'); }], 2); } catch (e) { msg = e.message; }
assert.equal(msg, 'falhou');
assert.equal(JSON.stringify(await executarComLimite([async () => 1], 10)), '[1]');` }], solution: R`async function executarComLimite(tarefas, limite) {
  const resultados = new Array(tarefas.length);
  let proximo = 0;
  async function trabalhador() {
    while (proximo < tarefas.length) {
      const i = proximo++;
      resultados[i] = await tarefas[i]();
    }
  }
  const n = Math.max(1, Math.min(limite, tarefas.length));
  await Promise.all(Array.from({ length: n }, trabalhador));
  return resultados;
}`, explanation: 'Os runners usam esse padrão para limitar workers e testes concorrentes.' }
],
'ftj-03': [
  { id: 'ftj-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Por que exportar o app Express sem chamar listen?', options: ['Porque o Express proíbe listen', 'Para que cada teste crie um app isolado e o Supertest use portas efêmeras', 'Para acelerar o npm', 'Para esconder as rotas'], answer: 1, explanation: 'Evita portas presas e conflitos e permite injetar dependências.' },
  { id: 'ftj-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: um corpo JSON de 20.000 caracteres enviado a um app com express.json({ limit: "10kb" }) devolveu 413.', answer: true, explanation: 'O JSON truncado devolveu 400 e o corpo grande devolveu 413.' },
  { id: 'ftj-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a situação ao status HTTP medido no laboratório.', pairs: [['Pedido criado', '201'], ['Lista de itens vazia', '422'], ['JSON truncado', '400'], ['Pedido inexistente', '404']], explanation: 'Casos testados com Supertest.' },
  { id: 'ftj-03-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §lerCorpoJson(texto, limiteBytes)§: se o tamanho em bytes UTF-8 do texto (dica: §encodeURIComponent(texto).replace(/%[0-9A-F]{2}/g, "x").length§) for maior que §limiteBytes§, devolva §{ status: 413, corpo: { erro: "corpo grande demais" } }§; se não for JSON válido, §{ status: 400, corpo: { erro: "JSON inválido" } }§; senão §{ status: 200, corpo: <objeto> }§.', lang: 'javascript', starter: 'function lerCorpoJson(texto, limiteBytes) {\n  // seu código aqui\n}\n', hints: ['Confira o limite antes de fazer o parse.', 'Use try/catch no JSON.parse.'], tests: [{ name: 'válido e inválido', code: R`assert.equal(JSON.stringify(lerCorpoJson('{"a":1}', 100)), '{"status":200,"corpo":{"a":1}}');
assert.equal(JSON.stringify(lerCorpoJson('{"cliente": ', 100)), '{"status":400,"corpo":{"erro":"JSON inválido"}}');` }, { name: 'limite em bytes', code: R`assert.equal(lerCorpoJson('x'.repeat(20000), 10240).status, 413);
assert.equal(lerCorpoJson('"ç"', 3).status, 413);
assert.equal(lerCorpoJson('"ç"', 4).status, 200);
assert.equal(lerCorpoJson('{"a":1}', 7).status, 200);` }], solution: R`function lerCorpoJson(texto, limiteBytes) {
  if (encodeURIComponent(texto).replace(/%[0-9A-F]{2}/g, 'x').length > limiteBytes) return { status: 413, corpo: { erro: 'corpo grande demais' } };
  try { return { status: 200, corpo: JSON.parse(texto) }; }
  catch { return { status: 400, corpo: { erro: 'JSON inválido' } }; }
}`, explanation: 'O express.json faz essas verificações antes de chamar sua rota.' },
  { id: 'ftj-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'O que um teste de API com Supertest deve verificar além do código de status? O que ele não cobre?', model: 'Deve verificar o corpo (forma e valores), cabeçalhos relevantes (Content-Type), os efeitos persistidos (o pedido gravado, o gateway chamado com o valor certo) e os caminhos de erro (422, 404, 400, 413), com um app e um banco novos por teste e dependências injetadas. Não cobre rede real, TLS, proxy reverso, HTTP/2, limites do ambiente nem o front-end; para isso usam-se E2E, testes de contrato e verificações em ambientes reais.', rubric: ['Corpo, cabeçalhos e efeitos', 'Caminhos de erro', 'Isolamento e injeção', 'Limites do Supertest'], explanation: 'Resumo da aula.' },
  { id: 'ftj-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §mapearErro(e)§ (modelo do error handler): devolve §{ status, corpo }§. Se §e.type === "entity.parse.failed"§ → §400§ e §{ erro: "JSON inválido" }§; se §e.name === "ErroDeDominio"§ → §422§ com §{ erro: e.message }§; se §e.status§ for um inteiro entre 400 e 499 → esse status com §{ erro: e.message }§; qualquer outro → §500§ com §{ erro: "erro interno" }§ (sem vazar a mensagem real).', lang: 'javascript', starter: 'function mapearErro(e) {\n  // seu código aqui\n}\n', hints: ['A ordem das verificações importa.', 'Para 5xx e erros desconhecidos não exponha e.message.'], tests: [{ name: 'mapeamentos', code: R`assert.equal(JSON.stringify(mapearErro({ type: 'entity.parse.failed', message: 'x' })), '{"status":400,"corpo":{"erro":"JSON inválido"}}');
assert.equal(JSON.stringify(mapearErro({ name: 'ErroDeDominio', message: 'pedido sem itens' })), '{"status":422,"corpo":{"erro":"pedido sem itens"}}');
assert.equal(JSON.stringify(mapearErro({ status: 413, message: 'payload too large' })), '{"status":413,"corpo":{"erro":"payload too large"}}');` }, { name: 'sem vazar detalhes', code: R`assert.equal(JSON.stringify(mapearErro(new Error('senha do banco: 1234'))), '{"status":500,"corpo":{"erro":"erro interno"}}');
assert.equal(JSON.stringify(mapearErro({ status: 503, message: 'detalhe interno' })), '{"status":500,"corpo":{"erro":"erro interno"}}');
assert.equal(mapearErro({ status: 404, message: 'não achou' }).status, 404);` }], solution: R`function mapearErro(e) {
  if (e.type === 'entity.parse.failed') return { status: 400, corpo: { erro: 'JSON inválido' } };
  if (e.name === 'ErroDeDominio') return { status: 422, corpo: { erro: e.message } };
  if (Number.isInteger(e.status) && e.status >= 400 && e.status <= 499) return { status: e.status, corpo: { erro: e.message } };
  return { status: 500, corpo: { erro: 'erro interno' } };
}`, explanation: 'Nunca vaze mensagens internas em erros 5xx; teste esse comportamento.' }
],
'ftj-04': [
  { id: 'ftj-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Por que não se usa async/await com os comandos cy do Cypress?', options: ['Porque o JavaScript não permite', 'Porque os comandos entram em uma fila e não devolvem promessas reais', 'Porque é mais lento', 'Porque o Cypress só roda em Node'], answer: 1, explanation: 'Use encadeamento, aliases e then.' },
  { id: 'ftj-04-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'No laboratório, should("match", regex) aplicado ao elemento falhou porque comparava o seletor e não o texto; a correção foi invoke("text").', answer: true, explanation: 'A mensagem mostrava o elemento (<p#resultado>) e não o texto.' },
  { id: 'ftj-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o comando do Cypress à finalidade.', pairs: [['cy.intercept', 'Simular ou espiar requisições de rede'], ['cy.wait("@alias")', 'Sincronizar com uma requisição'], ['cy.session', 'Reaproveitar a sessão entre testes'], ['invoke("text")', 'Obter o texto do elemento para a asserção']], explanation: 'Comandos usados nas aulas.' },
  { id: 'ftj-04-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §retentar(consulta, asserir, opcoes)§ (retentativa do Cypress), com §opcoes = { timeoutMs, passoMs, relogio }§ e §relogio = { agora(), avancar(ms) }§. Em um laço: §valor = consulta()§; §asserir(valor)§; se não lançar, devolva §valor§. Se lançar, e o tempo decorrido (§relogio.agora() - inicio§) for >= §timeoutMs§, lance §Error("Timed out retrying after " + timeoutMs + "ms: " + erro.message)§; senão §relogio.avancar(passoMs)§ e tente de novo.', lang: 'javascript', starter: 'function retentar(consulta, asserir, opcoes) {\n  // seu código aqui\n}\n', hints: ['Guarde o início antes do laço.', 'Verifique o tempo depois de uma falha.'], tests: [{ name: 'passa depois de algumas tentativas', code: R`let t = 0; const relogio = { agora: () => t, avancar: (ms) => { t += ms; } };
let chamadas = 0;
const v = retentar(() => { chamadas++; return t; }, (x) => { if (x < 300) throw new Error('ainda não'); }, { timeoutMs: 4000, passoMs: 100, relogio });
assert.equal(v, 300);
assert.equal(chamadas, 4);` }, { name: 'timeout', code: R`let t = 0; const relogio = { agora: () => t, avancar: (ms) => { t += ms; } };
assert.throws(() => retentar(() => 'a', (x) => { if (x !== 'b') throw new Error('esperado b'); }, { timeoutMs: 400, passoMs: 100, relogio }), 'Timed out retrying after 400ms: esperado b');
assert.equal(t, 400);
t = 0;
assert.equal(retentar(() => 1, () => {}, { timeoutMs: 10, passoMs: 1, relogio }), 1);` }], solution: R`function retentar(consulta, asserir, opcoes) {
  const { timeoutMs, passoMs, relogio } = opcoes;
  const inicio = relogio.agora();
  for (;;) {
    const valor = consulta();
    try { asserir(valor); return valor; }
    catch (erro) {
      if (relogio.agora() - inicio >= timeoutMs) throw new Error('Timed out retrying after ' + timeoutMs + 'ms: ' + erro.message);
      relogio.avancar(passoMs);
    }
  }
}`, explanation: 'É a ideia da retentativa de asserções do Cypress, com relógio injetado para testar sem esperar.' },
  { id: 'ftj-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Por que cy.wait(1000) é um antipadrão no Cypress e que alternativas você usaria? Cite um erro real do laboratório.', model: 'O wait numérico é um chute: falha quando a página demora mais e desperdiça tempo quando é rápida (no experimento do C5.4 a espera fixa falhou em 8 de 14). No Cypress usa-se a retentativa: asserções como should("have.text", ...) repetem até passar (os testes com atraso de 0 a 300 ms passaram sem wait) e cy.wait("@alias") sincroniza com requisições. Erro real: should("match", regex) aplicado ao elemento comparava o seletor, não o texto, e expirou após 4000 ms; a correção foi invoke("text").should("match", ...), lembrando de ler a mensagem inteira do erro.', rubric: ['Espera numérica como chute', 'Retentativa e cy.wait no alias', 'Dado do laboratório', 'Erro do should("match") e correção'], explanation: 'Resumo da aula.' },
  { id: 'ftj-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarCadeia()§ (fila de comandos estilo Cypress): devolve um objeto com §comando(nome, fn)§ (enfileira SEM executar e devolve o próprio objeto) e §executar()§ (executa os comandos em ordem, uma vez cada, e devolve a lista de §nome§ executados). §fn§ recebe o contexto §{ valores }§ compartilhado, onde §fn§ pode guardar dados. Se um comando lançar, §executar§ lança o mesmo erro e não executa os seguintes. Chamar §executar§ esvazia a fila.', lang: 'javascript', starter: 'function criarCadeia() {\n  // seu código aqui\n}\n', hints: ['Guarde os comandos em um array.', 'Copie e esvazie a fila antes de executar.'], tests: [{ name: 'não executa até pedir', code: R`const log = [];
const c = criarCadeia().comando('visitar', (ctx) => { log.push('v'); ctx.valores.pagina = '/'; }).comando('clicar', (ctx) => { log.push('c:' + ctx.valores.pagina); });
assert.equal(log.length, 0);
assert.equal(JSON.stringify(c.executar()), '["visitar","clicar"]');
assert.equal(JSON.stringify(log), '["v","c:/"]');
assert.equal(JSON.stringify(c.executar()), '[]');` }, { name: 'erro interrompe', code: R`const log = [];
const c = criarCadeia().comando('a', () => log.push('a')).comando('b', () => { throw new Error('quebrou'); }).comando('c', () => log.push('c'));
assert.throws(() => c.executar(), 'quebrou');
assert.equal(JSON.stringify(log), '["a"]');
assert.equal(JSON.stringify(c.executar()), '[]');` }], solution: R`function criarCadeia() {
  let fila = [];
  const obj = {
    comando(nome, fn) { fila.push({ nome, fn }); return obj; },
    executar() {
      const atual = fila; fila = [];
      const ctx = { valores: {} }; const feitos = [];
      for (const c of atual) { c.fn(ctx); feitos.push(c.nome); }
      return feitos;
    }
  };
  return obj;
}`, explanation: 'A fila explica por que cy.* não devolve valores como funções comuns.' }
],
'ftj-05': [
  { id: 'ftj-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'O que a auto-espera do Playwright garante antes de clicar?', options: ['Nada: o teste deve dormir', 'Que o elemento existe, está visível, estável, habilitado e recebe eventos', 'Que o servidor está desligado', 'Que a página tem 3 abas'], answer: 1, explanation: 'Verificações de actionability antes de cada ação.' },
  { id: 'ftj-05-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: 11 testes levaram 12,3 s com 4 workers e 13,1 s com 1 worker, ou seja, o ganho de paralelismo foi pequeno naquela suíte curta.', answer: true, explanation: 'O tempo foi dominado pela abertura de contextos e pela concorrência de navegadores na mesma máquina.' },
  { id: 'ftj-05-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o recurso ao uso.', pairs: [['page.route', 'Simular respostas de rede'], ['trace viewer', 'Depuração post-mortem (46.310 bytes em 1 teste)'], ['--shard=1/2', 'Dividir a suíte entre máquinas'], ['storageState', 'Reaproveitar o login']], explanation: 'Recursos vistos na aula.' },
  { id: 'ftj-05-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §dividirEmShards(testes, n)§: devolve uma lista com §n§ listas, distribuindo os testes em ordem em blocos contíguos; os primeiros §total % n§ shards recebem um teste a mais (11 testes em 2 shards → tamanhos 6 e 5; 3 testes em 5 shards → 1, 1, 1, 0, 0).', lang: 'javascript', starter: 'function dividirEmShards(testes, n) {\n  // seu código aqui\n}\n', hints: ['tamanho base = Math.floor(total / n), resto = total % n.', 'Use um índice acumulado.'], tests: [{ name: 'tamanhos', code: R`const t = Array.from({ length: 11 }, (_, i) => 't' + (i + 1));
const s = dividirEmShards(t, 2);
assert.equal(JSON.stringify(s.map((x) => x.length)), '[6,5]');
assert.equal(s[1][0], 't7');
assert.equal(JSON.stringify(dividirEmShards(['a', 'b', 'c'], 5).map((x) => x.length)), '[1,1,1,0,0]');` }, { name: 'conteúdo', code: R`assert.equal(JSON.stringify(dividirEmShards(['a', 'b', 'c', 'd'], 2)), '[["a","b"],["c","d"]]');
assert.equal(JSON.stringify(dividirEmShards([], 3)), '[[],[],[]]');
assert.equal(JSON.stringify(dividirEmShards(['a', 'b', 'c'], 1)), '[["a","b","c"]]');` }], solution: R`function dividirEmShards(testes, n) {
  const base = Math.floor(testes.length / n); const resto = testes.length % n;
  const shards = []; let i = 0;
  for (let k = 0; k < n; k++) {
    const tam = base + (k < resto ? 1 : 0);
    shards.push(testes.slice(i, i + tam)); i += tam;
  }
  return shards;
}`, explanation: 'No Playwright os shards são calculados sobre os grupos de testes; a ideia é a mesma.' },
  { id: 'ftj-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare Playwright e Cypress para um time que precisa testar um app em Chrome e Safari, com login e várias abas. Que critérios usaria?', model: 'Para Safari (WebKit), várias abas e origens e shards embutidos, o Playwright é a opção mais adequada: roda Chromium, Firefox e WebKit por protocolo, de fora do navegador, com auto-espera, storageState para o login, workers e shards gratuitos e trace viewer. O Cypress executa dentro do navegador, com ótima depuração interativa (time travel), mas tem limites de uma aba e uma origem por teste (cy.origin), não oferece WebKit completo e depende do Cypress Cloud ou de divisão manual para paralelismo, além de um binário de 811 MB medido. Em ambos mantêm-se poucos E2E, dados isolados, seletores estáveis e flakiness monitorada.', rubric: ['Cobertura de navegadores (WebKit)', 'Abas e origens', 'Paralelismo e shards', 'Custos e boas práticas comuns'], explanation: 'Resumo da aula.' },
  { id: 'ftj-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §tempoEstimado(duracoes, workers)§: simula o escalonamento em ordem: cada teste vai para o worker que ficar livre primeiro (empate: o de menor índice). Devolva o instante em que o último teste termina (tempo total). §workers§ ≥ 1; lista vazia → §0§.', lang: 'javascript', starter: 'function tempoEstimado(duracoes, workers) {\n  // seu código aqui\n}\n', hints: ['Mantenha um array com o instante livre de cada worker.', 'A cada teste, escolha o menor instante e some a duração.'], tests: [{ name: 'exemplos', code: R`assert.equal(tempoEstimado([3, 3, 3, 3], 2), 6);
assert.equal(tempoEstimado([5, 1, 1, 1, 1, 1], 2), 5);
assert.equal(tempoEstimado([4, 4, 4], 1), 12);
assert.equal(tempoEstimado([2, 2], 5), 2);` }, { name: 'bordas', code: R`assert.equal(tempoEstimado([], 3), 0);
assert.equal(tempoEstimado([7], 1), 7);
assert.equal(tempoEstimado([1, 2, 3, 4, 5, 6], 3), 9);` }], solution: R`function tempoEstimado(duracoes, workers) {
  const livres = new Array(workers).fill(0);
  for (const d of duracoes) {
    let k = 0;
    for (let i = 1; i < livres.length; i++) if (livres[i] < livres[k]) k = i;
    livres[k] += d;
  }
  return Math.max(0, ...livres);
}`, explanation: 'Mostra por que testes longos e desbalanceados limitam o ganho de paralelismo.' }
],
'ftj-06': [
  { id: 'ftj-06-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Para que serve a chave needs em um job do GitHub Actions?', options: ['Instalar pacotes', 'Fazer o job esperar outros jobs e falhar cedo se eles falharem', 'Definir a versão do Node', 'Guardar artefatos'], answer: 1, explanation: 'Permite ordenar as camadas por custo e economizar tempo.' },
  { id: 'ftj-06-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: o actionlint apontou 4 erros (exit 1) no workflow defeituoso e nenhum (exit 0) no workflow correto.', answer: true, explanation: 'Erros: job inexistente em needs, matrix.nodee, github.evnt e runs-on ausente.' },
  { id: 'ftj-06-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a prática de CI ao objetivo.', pairs: [['concurrency com cancel-in-progress', 'Cancelar execuções antigas da mesma PR'], ['permissions: contents: read', 'Menor privilégio'], ['timeout-minutes', 'Evitar jobs presos'], ['upload-artifact if: failure()', 'Guardar evidências das falhas']], explanation: 'Práticas do workflow do laboratório.' },
  { id: 'ftj-06-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarWorkflow(wf)§ (mini actionlint): §wf = { jobs: { nome: { needs?, "runs-on"?, steps? } } }§ (§needs§ é texto ou lista). Percorra os jobs na ordem e devolva as mensagens: §job "a" needs job "b" which does not exist in this workflow§ (uma por dependência inexistente) e §"runs-on" section is missing in job "b"§ (quando não houver §runs-on§). Para cada job, primeiro as mensagens de §needs§ e depois a de §runs-on§.', lang: 'javascript', starter: 'function validarWorkflow(wf) {\n  // seu código aqui\n}\n', hints: ['Normalize needs para lista.', 'Use Object.entries(wf.jobs).'], tests: [{ name: 'erros do laboratório', code: R`const wf = { jobs: { a: { 'runs-on': 'ubuntu-latest', needs: 'inexistente' }, b: { steps: [] } } };
assert.equal(JSON.stringify(validarWorkflow(wf)), JSON.stringify(['job "a" needs job "inexistente" which does not exist in this workflow', '"runs-on" section is missing in job "b"']));` }, { name: 'válido e lista', code: R`const ok = { jobs: { unitarios: { 'runs-on': 'x' }, api: { 'runs-on': 'x', needs: 'unitarios' }, e2e: { 'runs-on': 'x', needs: ['api', 'unitarios'] } } };
assert.equal(JSON.stringify(validarWorkflow(ok)), '[]');
const ruim = { jobs: { x: { 'runs-on': 'x', needs: ['y', 'z'] } } };
assert.equal(validarWorkflow(ruim).length, 2);
assert.equal(JSON.stringify(validarWorkflow({ jobs: {} })), '[]');` }], solution: R`function validarWorkflow(wf) {
  const msgs = []; const nomes = new Set(Object.keys(wf.jobs));
  for (const [nome, job] of Object.entries(wf.jobs)) {
    const needs = job.needs === undefined ? [] : Array.isArray(job.needs) ? job.needs : [job.needs];
    for (const n of needs) if (!nomes.has(n)) msgs.push('job "' + nome + '" needs job "' + n + '" which does not exist in this workflow');
    if (!job['runs-on']) msgs.push('"runs-on" section is missing in job "' + nome + '"');
  }
  return msgs;
}`, explanation: 'O actionlint real faz centenas de verificações, incluindo tipos de expressões.' },
  { id: 'ftj-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Projete o pipeline de testes de uma API com front-end: camadas, matriz, shards, cache, artefatos, segurança e política de flakiness. O que você mediria antes de otimizar?', model: 'Estático e unitários em toda PR (matriz de versões do Node, fail-fast desligado), integração com Supertest e banco real em seguida (needs), E2E com Playwright em shards apenas nas jornadas críticas e testes pesados (carga, contrato, segurança) à noite ou antes do deploy, mais fumaça pós-deploy. Cache de npm e dos navegadores, npm ci com lockfile, artefatos (traces, relatórios, cobertura) só nas falhas com retenção curta, permissions mínimas, timeouts e concurrency com cancelamento, ações fixadas por versão e dados não confiáveis passados por variáveis de ambiente; actionlint no CI. Flakiness: medir testes que só passam na retentativa, quarentena com tíquete e prazo. Antes de otimizar mediria o tempo por job, a sobrecarga de instalação e o ganho real de shards (no laboratório 8,3 s e 7,9 s contra 13,1 s em um worker).', rubric: ['Camadas por custo e needs', 'Matriz, shards e cache', 'Artefatos e segurança', 'Política de flakiness e medição'], explanation: 'Resumo da aula.' },
  { id: 'ftj-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §etapasDoPipeline(jobs)§: §jobs§ é um objeto nome → { needs?: lista }. Devolva a lista de etapas (listas de nomes) em que cada job aparece na etapa seguinte à maior etapa de suas dependências (sem dependências: etapa 0), cada etapa em ordem alfabética. Se houver ciclo, lance §Error("ciclo de dependências")§.', lang: 'javascript', starter: 'function etapasDoPipeline(jobs) {\n  // seu código aqui\n}\n', hints: ['Calcule o nível de cada job de forma recursiva com memória.', 'Detecte o ciclo marcando os jobs em visita.'], tests: [{ name: 'camadas', code: R`const jobs = { e2e: { needs: ['api', 'unitarios'] }, api: { needs: ['unitarios'] }, unitarios: {}, lint: {} };
assert.equal(JSON.stringify(etapasDoPipeline(jobs)), '[["lint","unitarios"],["api"],["e2e"]]');
assert.equal(JSON.stringify(etapasDoPipeline({})), '[]');` }, { name: 'ciclo e dependência externa', code: R`assert.throws(() => etapasDoPipeline({ a: { needs: ['b'] }, b: { needs: ['a'] } }), 'ciclo de dependências');
assert.throws(() => etapasDoPipeline({ a: { needs: ['a'] } }), 'ciclo de dependências');
assert.equal(JSON.stringify(etapasDoPipeline({ b: {}, a: {}, c: { needs: ['a', 'b'] } })), '[["a","b"],["c"]]');` }], solution: R`function etapasDoPipeline(jobs) {
  const nivel = {}; const visitando = new Set();
  const calc = (n) => {
    if (n in nivel) return nivel[n];
    if (visitando.has(n)) throw new Error('ciclo de dependências');
    visitando.add(n);
    const deps = (jobs[n] && jobs[n].needs) || [];
    const v = deps.length ? Math.max(...deps.map(calc)) + 1 : 0;
    visitando.delete(n); nivel[n] = v; return v;
  };
  const etapas = [];
  for (const n of Object.keys(jobs)) { const k = calc(n); (etapas[k] = etapas[k] || []).push(n); }
  return etapas.map((e) => e.sort());
}`, explanation: 'É a ordem em que o GitHub Actions executa os jobs com needs: camadas independentes rodam em paralelo.' }
]
};

const P = 'ferramentas-testes-js-p';
export const assessment = {
  id: 'ferramentas-testes-js', title: 'Avaliação final — Ferramentas de teste para JavaScript', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual ferramenta é a mais indicada para testar rotas de um app Express em processo, sem abrir portas manualmente?', options: ['Supertest', 'Cypress component testing', 'actionlint', 'Prettier'], answer: 0, explanation: 'O Supertest abre portas efêmeras e dá asserções fluentes.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: Jest 1,54 s, Vitest 2,07 s e node:test 0,38 s em suítes minúsculas (parede, mediana de 5): o resultado reflete sobretudo a inicialização.', answer: true, explanation: 'Os números não generalizam para suítes grandes.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Resultados do Playwright medidos no laboratório.', code: '4 workers: 12,3 s (11 testes)\n1 worker : 13,1 s\nshard 1/2: 6 testes em 8,3 s\nshard 2/2: 5 testes em 7,9 s', lang: 'text', steps: [{ q: 'Quantos testes foram para o shard 1 (use um número)?', answers: ['6'] }, { q: 'Quantos testes tem a suíte no total (use um número)?', answers: ['11'] }], explanation: '6 + 5 = 11 testes.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Por que cy.wait(1000) é um antipadrão?', options: ['Porque o Cypress não permite', 'Porque é um chute de tempo: falha quando demora mais e desperdiça tempo quando é rápido', 'Porque aumenta a cobertura', 'Porque quebra o Jest'], answer: 1, explanation: 'Use asserções com retentativa e cy.wait("@alias").' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que faz a asserção do Cypress comparar o seletor e não o texto.', code: "it('compra', () => {\n  cy.visit('/');\n  cy.contains('button', 'Comprar').click();\n  cy.get('[role=status]').should('match', /Pedido \\d+ pago/);\n});", answer: 4, explanation: 'Use invoke("text").should("match", ...) ou have.text.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o essencial da segurança do workflow.', code: 'permissions:\n  contents: [[0]]\n# valores não confiáveis (título de PR) devem passar por variável de [[1]], não interpolados no run', answers: [['read'], ['ambiente', 'env']], explanation: 'Menor privilégio e proteção contra injeção de script.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a ferramenta ao uso.', pairs: [['Vitest', 'Runner nativo em ESM e TypeScript com API parecida com a do Jest'], ['Playwright', 'E2E com auto-espera, shards e trace viewer'], ['Cypress', 'E2E dentro do navegador com retentativa de comandos'], ['actionlint', 'Verificação estática de workflows do GitHub Actions']], explanation: 'Papéis de cada ferramenta.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Medido: qual o tamanho do binário do Cypress extraído no cache?', options: ['≈ 50 MB', '≈ 811 MB', '≈ 4 GB', '≈ 2 MB'], answer: 1, explanation: 'Um custo prático: guarde o cache no CI.' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'O workflow do laboratório foi executado em um runner real do GitHub Actions.', answer: false, explanation: 'Foi apenas validado estaticamente com o actionlint (exit 0 no correto e 4 erros no defeituoso).' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual status o laboratório obteve ao enviar JSON truncado a um app Express 5 com handler de erro tratando entity.parse.failed?', options: ['200', '400', '413', '500'], answer: 1, explanation: '413 foi o caso do corpo acima de 10 kb.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Monte a suíte de testes de uma API de pedidos com front-end usando as ferramentas do curso: o que cada ferramenta cobre, como roda no CI e que cuidados evitam flakiness.', model: 'Unitários e de domínio com Vitest (ou Jest/node:test), com cobertura como alarme; API com Supertest e Express 5 em fábrica sem listen, banco em memória por teste, erros 422/404/400/413 e dependências injetadas; E2E com Playwright (locators por papel e rótulo, auto-espera, page.route para falhas raras, storageState, trace nas retentativas) nas jornadas críticas, e Cypress apenas se o time já o adotar. CI: needs entre camadas, matriz de Node, shards no E2E, cache de dependências e navegadores, artefatos nas falhas, permissions mínimas, timeouts, concurrency e actionlint. Flakiness: nenhuma espera fixa, dados isolados, seletores estáveis, quarentena com prazo e medição dos testes que só passam na retentativa.', rubric: ['Ferramentas por camada', 'Supertest e Playwright bem aplicados', 'Pipeline (needs, matriz, shards, cache, artefatos)', 'Flakiness e segurança'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'No Jest com ESM nativo, qual configuração é necessária?', options: ['Nenhuma', 'NODE_OPTIONS=--experimental-vm-modules, transform vazio e importar de @jest/globals', 'Instalar o Cypress', 'Usar apenas CommonJS'], answer: 1, explanation: 'O suporte a ESM ainda é experimental no Jest.' }
  ]
};

export const project = {
  id: 'testes-api-e-e2e', name: 'Testes de API e E2E com Vitest, Supertest, Playwright e um pipeline validado', lv: 'M', stack: 'Node.js, Express 5, Vitest, Supertest, Playwright, GitHub Actions, actionlint', ds: ['test-js'],
  desc: 'Para uma **API de pedidos** com uma página simples, monte a **suíte completa de ferramentas JavaScript**: **testes de domínio** (Vitest), **testes de API** (Supertest sobre um app Express 5 sem listen), **E2E** (Playwright com locators acessíveis, auto-espera, mock de rede e trace), um **pipeline de CI** com matriz, shards, cache e artefatos **validado com o actionlint**, e um **relatório de medições** (tempos, cobertura, flakiness).',
  rf: ['Suíte de domínio em Vitest com tabelas, snapshot inline e dublês, e cobertura v8', 'Testes de API com Supertest cobrindo 201, 400, 404, 413 e 422 e o efeito persistido', 'Pelo menos 5 testes E2E em Playwright (locators por papel e rótulo, auto-espera, um com page.route e um com atraso simulado) sem nenhum sleep', 'Configuração do Playwright com webServer, workers e trace nas retentativas', 'Workflow de CI com needs, matriz de versões, shards do E2E, cache, artefatos nas falhas, permissions mínimas, timeouts e concurrency', 'actionlint executado sobre o workflow, com um workflow defeituoso de prova', 'Relatório com tempos por ferramenta, cobertura e a taxa de testes que passam só na retentativa', 'README com comandos, versões exatas e limitações (o que não foi executado)'],
  rnf: ['Versões exatas fixadas e lockfile commitado', 'Testes independentes da ordem, com relógio e ids injetados', 'Nenhum segredo no repositório (senhas de teste por variável de ambiente)', 'Tempo da PR sem E2E abaixo de 2 minutos, medido'],
  ac: ['Nenhum teste usa sleep ou waitForTimeout', 'O app de API é criado por fábrica e cada teste usa um banco novo', 'O actionlint passa no workflow e falha no defeituoso', 'Existe ao menos um E2E sem simulação de rede', 'O relatório diz o que foi executado e o que não foi'],
  ch: ['Executar os mesmos E2E em Firefox e WebKit com o Playwright', 'Portar um subconjunto para Cypress e comparar tempo e custo do binário', 'Executar o workflow em um repositório real e medir o cache', 'Adicionar relatório JUnit e publicar a cobertura como anotação da PR']
};
