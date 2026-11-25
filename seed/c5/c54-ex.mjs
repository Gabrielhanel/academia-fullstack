// C5.4 — Fundamentos de testes: exercícios, avaliação final e projeto.
// Medições reais do laboratório (Node 26.13.1, fast-check 4.11.0, Cucumber 13.3.0, Chrome headless); os desafios "code" são em JavaScript e modelam a lógica.
const R = String.raw;

export const exsets = {
'tst-01': [
  { id: 'tst-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Segundo a pirâmide de testes, qual proporção é recomendada?', options: ['Muitos testes E2E e poucos unitários', 'Muitos testes unitários, alguns de integração e poucos E2E', 'Apenas testes manuais', 'A mesma quantidade em todas as camadas'], answer: 1, explanation: 'Quanto mais alto o nível, mais lento, caro e frágil: poucos testes no topo.' },
  { id: 'tst-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Medido: o fast-check, ao falhar uma propriedade, reduz o contraexemplo e permite reproduzi-lo com a semente.', answer: true, explanation: 'A propriedade falsa da soma de floats falhou com "Property failed after N tests"; a semente 7 a reproduz.' },
  { id: 'tst-01-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a letra de F.I.R.S.T. ao significado.', pairs: [['F', 'Rápido (fast)'], ['I', 'Independente'], ['R', 'Repetível'], ['S', 'Autoverificável (self-validating)']], explanation: 'O T é "Timely" (oportuno).' },
  { id: 'tst-01-e4', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §rodarCasos(fn, casos)§ (teste parametrizado): cada caso é §{ nome, entrada, esperado }§ (§entrada§ é a lista de argumentos). Devolva a lista de nomes dos casos que falham, na ordem. Compare §JSON.stringify(resultado)§ com §JSON.stringify(esperado)§; se §fn§ lançar uma exceção, o resultado é §{ erro: mensagem }§.', lang: 'javascript', starter: 'function rodarCasos(fn, casos) {\n  // seu código aqui\n}\n', hints: ['Use try/catch dentro do laço.', 'O resultado de uma exceção é um objeto com a chave erro.'], tests: [{ name: 'valores', code: R`const soma = (a, b) => a + b;
const falhas = rodarCasos(soma, [{ nome: 'ok', entrada: [1, 2], esperado: 3 }, { nome: 'errado', entrada: [1, 1], esperado: 3 }, { nome: 'texto', entrada: ['a', 'b'], esperado: 'ab' }]);
assert.equal(JSON.stringify(falhas), '["errado"]');` }, { name: 'erros', code: R`const dividir = (a, b) => { if (b === 0) throw new Error('divisão por zero'); return a / b; };
const falhas = rodarCasos(dividir, [{ nome: 'erro esperado', entrada: [1, 0], esperado: { erro: 'divisão por zero' } }, { nome: 'erro não esperado', entrada: [1, 0], esperado: 0 }, { nome: 'normal', entrada: [6, 3], esperado: 2 }]);
assert.equal(JSON.stringify(falhas), '["erro não esperado"]');
assert.equal(JSON.stringify(rodarCasos(dividir, [])), '[]');` }], solution: R`function rodarCasos(fn, casos) {
  const falhas = [];
  for (const c of casos) {
    let r;
    try { r = fn(...c.entrada); } catch (e) { r = { erro: e.message }; }
    if (JSON.stringify(r) !== JSON.stringify(c.esperado)) falhas.push(c.nome);
  }
  return falhas;
}`, explanation: 'É a ideia dos testes parametrizados do laboratório: uma tabela de casos e um único teste.' },
  { id: 'tst-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique a pirâmide de testes, uma variação (troféu ou favo) e por que o cone de sorvete é um antipadrão. Use os números do laboratório.', model: 'A pirâmide recomenda base larga de testes unitários (rápidos e baratos), meio de integração e topo estreito de E2E (lentos e frágeis); regra: empurrar a verificação para o nível mais baixo que dá confiança. Variações: o troféu (ênfase em integração, útil em front-ends) e o favo (microsserviços: muita integração por serviço). O cone de sorvete tem muitos testes E2E e poucos unitários: lento, frágil e caro. No laboratório, 12 testes unitários levaram 613 ms, a integração 321 a 661 ms e 3 testes E2E 2.983 ms (≈ 994 ms cada), com a ressalva de que são medidas de uma máquina e incluem a inicialização do processo.', rubric: ['Base larga e topo estreito', 'Troféu ou favo', 'Cone de sorvete como antipadrão', 'Uso dos números medidos'], explanation: 'Resumo da aula.' },
  { id: 'tst-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §reduzirLista(lista, falha)§ (shrinking simplificado): §falha(l)§ devolve §true§ se a lista ainda reproduz o defeito. Percorra o índice §i§ a partir de 0: se remover o elemento §i§ mantém §falha§ verdadeira, remova-o (sem avançar §i§); senão avance. Devolva a lista reduzida (sem alterar a original).', lang: 'javascript', starter: 'function reduzirLista(lista, falha) {\n  // seu código aqui\n}\n', hints: ['Trabalhe em uma cópia.', 'Teste a candidata sem o elemento i antes de removê-lo.'], tests: [{ name: 'reduz', code: R`const orig = [1, 200, 3, 300];
const r = reduzirLista(orig, (l) => l.some((x) => x > 100));
assert.equal(JSON.stringify(r), '[300]');
assert.equal(JSON.stringify(orig), '[1,200,3,300]');` }, { name: 'bordas', code: R`assert.equal(JSON.stringify(reduzirLista([5, 7, 5], (l) => l.length >= 2 && l[0] === l[l.length - 1])), '[5,5]');
assert.equal(JSON.stringify(reduzirLista([], () => true)), '[]');
assert.equal(JSON.stringify(reduzirLista([1, 2], () => false)), '[1,2]');` }], solution: R`function reduzirLista(lista, falha) {
  const l = [...lista];
  let i = 0;
  while (i < l.length) {
    const candidata = [...l.slice(0, i), ...l.slice(i + 1)];
    if (falha(candidata)) l.splice(i, 1); else i++;
  }
  return l;
}`, explanation: 'Bibliotecas como o fast-check aplicam estratégias de redução mais sofisticadas, com a mesma finalidade.' }
],
'tst-02': [
  { id: 'tst-02-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual defeito um teste de integração com banco real pega e um teste com o repositório mockado não pega?', options: ['Erro de digitação em um nome de variável', 'Violação de uma restrição CHECK ou falha de rollback', 'Nome de função mal escolhido', 'Comentário desatualizado'], answer: 1, explanation: 'Restrições e transações só existem no banco de verdade.' },
  { id: 'tst-02-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'No laboratório, o teste que tentava um UPDATE de status inválido em uma tabela vazia passou a verificar a restrição depois de inserir uma linha, porque sem linhas o banco não reclama.', answer: true, explanation: 'Um teste de restrição precisa de dados que possam violá-la.' },
  { id: 'tst-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a opção de banco para testes ao ponto forte.', pairs: [['SQLite em memória', 'Zero instalação e rápido'], ['Postgres em contêiner', 'Mesmo motor da produção'], ['Banco compartilhado de teste', 'Simples, porém testes interferem entre si'], ['Mock do repositório', 'Rápido, porém não testa o SQL']], explanation: 'Escolha conforme o risco de dialeto.' },
  { id: 'tst-02-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarRepositorioFake()§ (fake em memória): §salvar({ cliente, itens })§ valida que todo item tem §qtd >= 1§ (senão lança §Error("CHECK constraint failed: qtd")§ e NÃO grava nada), atribui ids a partir de 1 e devolve o id; §buscar(id)§ devolve uma cópia do pedido §{ id, cliente, itens, status: "novo" }§ ou §null§; §marcarPago(id)§ muda para §"pago"§ e devolve §1§ só se estava §"novo"§ (senão §0§); §contarPorStatus()§ devolve um objeto status → quantidade (chaves em ordem alfabética).', lang: 'javascript', starter: 'function criarRepositorioFake() {\n  // seu código aqui\n}\n', hints: ['Valide os itens antes de alterar qualquer estado.', 'Devolva cópias em buscar.'], tests: [{ name: 'salvar e buscar', code: R`const r = criarRepositorioFake();
const id = r.salvar({ cliente: 'ana', itens: [{ sku: 'A', qtd: 2 }] });
assert.equal(id, 1);
assert.equal(JSON.stringify(r.buscar(1)), '{"id":1,"cliente":"ana","itens":[{"sku":"A","qtd":2}],"status":"novo"}');
assert.equal(r.buscar(9), null);
r.buscar(1).itens.push({ sku: 'X', qtd: 1 });
assert.equal(r.buscar(1).itens.length, 1);` }, { name: 'restrição e status', code: R`const r = criarRepositorioFake();
assert.throws(() => r.salvar({ cliente: 'x', itens: [{ sku: 'A', qtd: 1 }, { sku: 'B', qtd: 0 }] }), 'CHECK constraint failed: qtd');
assert.equal(JSON.stringify(r.contarPorStatus()), '{}');
const a = r.salvar({ cliente: 'a', itens: [{ sku: 'A', qtd: 1 }] }); r.salvar({ cliente: 'b', itens: [{ sku: 'A', qtd: 1 }] });
assert.equal(a, 1);
assert.equal(r.marcarPago(a), 1); assert.equal(r.marcarPago(a), 0);
assert.equal(JSON.stringify(r.contarPorStatus()), '{"novo":1,"pago":1}');` }], solution: R`function criarRepositorioFake() {
  const pedidos = new Map(); let proximo = 1;
  const copia = (p) => JSON.parse(JSON.stringify(p));
  return {
    salvar({ cliente, itens }) {
      if (itens.some((i) => !(i.qtd >= 1))) throw new Error('CHECK constraint failed: qtd');
      const id = proximo++;
      pedidos.set(id, { id, cliente, itens: copia(itens), status: 'novo' });
      return id;
    },
    buscar(id) { return pedidos.has(id) ? copia(pedidos.get(id)) : null; },
    marcarPago(id) { const p = pedidos.get(id); if (!p || p.status !== 'novo') return 0; p.status = 'pago'; return 1; },
    contarPorStatus() {
      const c = {};
      for (const p of pedidos.values()) c[p.status] = (c[p.status] || 0) + 1;
      return Object.fromEntries(Object.entries(c).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
    }
  };
}`, explanation: 'Um fake bem testado pode ser reutilizado em muitos testes de serviço (verificação de estado).' },
  { id: 'tst-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Você precisa decidir como testar o acesso a dados de um serviço. Compare mock do repositório, SQLite em memória e Postgres em contêiner e diga o que cada um deixa passar.', model: 'O mock do repositório é o mais rápido, mas não executa SQL: deixa passar SQL inválido, restrições, rollback, mapeamento e diferenças de dialeto. O SQLite em memória (como no laboratório, node:sqlite) é rápido, sem instalação, e um banco novo por teste dá isolamento; testa o SQL simples, as restrições CHECK e a transação (o rollback foi comprovado), mas deixa passar diferenças de dialeto, tipos, índices e locks do motor de produção. O Postgres em contêiner (Testcontainers) usa o mesmo motor da produção e pega essas diferenças, ao custo de segundos para subir e da dependência do Docker no CI. A escolha depende do risco de dialeto; migrações reais devem rodar nos testes.', rubric: ['Limites do mock', 'SQLite: ganhos e riscos de dialeto', 'Postgres em contêiner: ganhos e custo', 'Isolamento e migrações'], explanation: 'Resumo da aula.' },
  { id: 'tst-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §emTransacao(estado, fn)§ (modelo de transação): §estado§ é um array; chama §fn(copia)§ com uma cópia (§[...estado]§). Se §fn§ lançar, o §estado§ original permanece inalterado (rollback) e o erro é relançado; se não lançar, o conteúdo de §estado§ passa a ser o da cópia (commit, alterando o array original no lugar) e devolve o valor de §fn§.', lang: 'javascript', starter: 'function emTransacao(estado, fn) {\n  // seu código aqui\n}\n', hints: ['Para o commit, esvazie e preencha o array original (splice).', 'Não altere o estado se fn lançar.'], tests: [{ name: 'commit', code: R`const s = [1, 2];
const r = emTransacao(s, (c) => { c.push(3); c[0] = 9; return 'ok'; });
assert.equal(r, 'ok');
assert.equal(JSON.stringify(s), '[9,2,3]');` }, { name: 'rollback', code: R`const s = [1, 2];
assert.throws(() => emTransacao(s, (c) => { c.push(3); throw new Error('falhou'); }), 'falhou');
assert.equal(JSON.stringify(s), '[1,2]');
const t = [];
emTransacao(t, () => {});
assert.equal(t.length, 0);` }], solution: R`function emTransacao(estado, fn) {
  const copia = [...estado];
  const r = fn(copia);
  estado.splice(0, estado.length, ...copia);
  return r;
}`, explanation: 'No banco real, BEGIN, COMMIT e ROLLBACK fazem isso com garantias ACID.' }
],
'tst-03': [
  { id: 'tst-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a melhor forma de esperar um resultado assíncrono em um teste E2E?', options: ['sleep de 5 segundos', 'Esperar por uma condição observável (texto, elemento) com timeout', 'Repetir o teste até passar', 'Desligar a espera'], answer: 1, explanation: 'A espera por condição falhou em 0 de 14 execuções; a fixa falhou em 8 de 14.' },
  { id: 'tst-03-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: com resposta atrasada de 0 a 300 ms, a espera fixa de 120 ms falhou em 8 de 14 execuções e a espera por condição em 0 de 14.', answer: true, explanation: 'A espera fixa falha quando a página demora mais que o chute e desperdiça tempo quando é rápida.' },
  { id: 'tst-03-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o seletor à sua robustez.', pairs: [['getByRole("button", { name: "Comprar" })', 'Estável (papel e nome acessíveis)'], ['div > div:nth-child(3) > span', 'Frágil (depende da estrutura)'], ['.btn-primary-lg', 'Frágil (classe de estilo)'], ['[data-testid="comprar"]', 'Estável quando não há alternativa semântica']], explanation: 'Prefira seletores que se parecem com o usuário.' },
  { id: 'tst-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §esperarPor(condicao, timeoutMs, passoMs, relogio)§ (assíncrona): §relogio§ tem §agora()§ e §dormir(ms)§ (assíncrona). Verifica §condicao()§ imediatamente; se verdadeira, devolve §true§. Se não, enquanto §relogio.agora() - inicio < timeoutMs§, chama §await relogio.dormir(passoMs)§ e verifica de novo. Ao esgotar o prazo sem sucesso, lança §Error("timeout")§.', lang: 'javascript', starter: 'async function esperarPor(condicao, timeoutMs, passoMs, relogio) {\n  // seu código aqui\n}\n', hints: ['Guarde o início com relogio.agora().', 'Verifique a condição também depois do último sono.'], tests: [{ name: 'sucesso', code: R`let t = 0; const relogio = { agora: () => t, dormir: async (ms) => { t += ms; } };
let chamadas = 0;
const ok = await esperarPor(() => { chamadas++; return t >= 150; }, 1000, 50, relogio);
assert.equal(ok, true);
assert.equal(t, 150);
assert.equal(await esperarPor(() => true, 10, 1, relogio), true);` }, { name: 'timeout', code: R`let t = 0; const relogio = { agora: () => t, dormir: async (ms) => { t += ms; } };
let msg = '';
try { await esperarPor(() => false, 200, 50, relogio); } catch (e) { msg = e.message; }
assert.equal(msg, 'timeout');
assert.equal(t, 200);` }], solution: R`async function esperarPor(condicao, timeoutMs, passoMs, relogio) {
  const inicio = relogio.agora();
  if (condicao()) return true;
  while (relogio.agora() - inicio < timeoutMs) {
    await relogio.dormir(passoMs);
    if (condicao()) return true;
  }
  throw new Error('timeout');
}`, explanation: 'É a ideia do waitForFunction e da auto-espera do Playwright, com relógio injetado para testar sem esperar.' },
  { id: 'tst-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Um conjunto de testes E2E está lento e intermitente. Que diagnóstico e plano de correção você faria?', model: 'Medir a duração e a taxa de falhas por teste e identificar os intermitentes; trocar esperas fixas por esperas por condição (a espera fixa falhou em 8 de 14 execuções no laboratório), usar seletores por papel e rótulo, criar os dados de cada teste e falsificar terceiros, reutilizar sessão em vez de logar pela UI e isolar dados para paralelizar. Reduzir a quantidade: manter só as jornadas críticas e empurrar o resto para testes de integração, de componente e de contrato (pirâmide). Guardar captura, vídeo, trace e logs nas falhas do CI, colocar os flaky em quarentena com tíquete e prazo e perseguir flakiness próxima de zero.', rubric: ['Medir e identificar flaky', 'Espera por condição e seletores estáveis', 'Reduzir o número de E2E', 'Evidências e quarentena'], explanation: 'Resumo da aula.' },
  { id: 'tst-03-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §testesInstaveis(execucoes)§: §execucoes§ é uma lista de §{ teste, ok }§ (vários resultados por teste). Devolva, em ordem alfabética, os nomes dos testes que têm pelo menos uma execução bem-sucedida E pelo menos uma falha.', lang: 'javascript', starter: 'function testesInstaveis(execucoes) {\n  // seu código aqui\n}\n', hints: ['Agrupe por teste com um Map.', 'Guarde se viu ok e se viu falha.'], tests: [{ name: 'instáveis', code: R`const ex = [{ teste: 'a', ok: true }, { teste: 'a', ok: false }, { teste: 'b', ok: true }, { teste: 'b', ok: true }, { teste: 'c', ok: false }, { teste: 'c', ok: false }, { teste: 'd', ok: false }, { teste: 'd', ok: true }];
assert.equal(JSON.stringify(testesInstaveis(ex)), '["a","d"]');` }, { name: 'vazio', code: R`assert.equal(JSON.stringify(testesInstaveis([])), '[]');
assert.equal(JSON.stringify(testesInstaveis([{ teste: 'x', ok: true }])), '[]');` }], solution: R`function testesInstaveis(execucoes) {
  const m = new Map();
  for (const e of execucoes) {
    const v = m.get(e.teste) || { ok: false, falha: false };
    if (e.ok) v.ok = true; else v.falha = true;
    m.set(e.teste, v);
  }
  return [...m].filter(([, v]) => v.ok && v.falha).map(([n]) => n).sort();
}`, explanation: 'Um teste que sempre falha é um defeito; o que alterna entre passar e falhar é o intermitente.' }
],
'tst-04': [
  { id: 'tst-04-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Que dublê devolve respostas fixas?', options: ['Spy', 'Stub', 'Fake', 'Dummy'], answer: 1, explanation: 'O stub devolve respostas pré-definidas; o spy registra chamadas.' },
  { id: 'tst-04-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: depois de renomear internamente salvar para inserir, o teste de interação com mock falhou e o teste de estado com fake continuou passando.', answer: true, explanation: 'O teste de estado sobrevive à refatoração; o de interação conhece o nome interno.' },
  { id: 'tst-04-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o dublê ao exemplo.', pairs: [['Fake', 'Repositório em memória com SQLite'], ['Stub', 'cobrar devolve { aprovado: false }'], ['Spy', 'Ler cobrar.mock.calls para ver os argumentos'], ['Dummy', 'Objeto vazio passado só para preencher um parâmetro']], explanation: 'Taxonomia de Meszaros e Fowler.' },
  { id: 'tst-04-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarEspiao(fn)§: devolve uma função que chama §fn(...args)§ (se §fn§ não foi passada, devolve §undefined§), registra os argumentos e tem as propriedades/métodos: §chamadas§ (lista de listas de argumentos), §contagem()§ e §trocar(novaFn)§ (passa a usar §novaFn§). Os erros lançados por §fn§ propagam, mas a chamada é registrada.', lang: 'javascript', starter: 'function criarEspiao(fn) {\n  // seu código aqui\n}\n', hints: ['Registre antes de chamar a função.', 'Use uma variável atual que trocar altera.'], tests: [{ name: 'registro', code: R`const e = criarEspiao((a, b) => a + b);
assert.equal(e(1, 2), 3);
assert.equal(e(5, 5), 10);
assert.equal(JSON.stringify(e.chamadas), '[[1,2],[5,5]]');
assert.equal(e.contagem(), 2);
assert.equal(criarEspiao()(1), undefined);` }, { name: 'trocar e erro', code: R`const e = criarEspiao(() => 'a');
e.trocar(() => 'b');
assert.equal(e(), 'b');
const f = criarEspiao(() => { throw new Error('boom'); });
assert.throws(() => f(7), 'boom');
assert.equal(f.contagem(), 1);
assert.equal(JSON.stringify(f.chamadas), '[[7]]');` }], solution: R`function criarEspiao(fn) {
  let atual = fn;
  const espiao = (...args) => { espiao.chamadas.push(args); return atual ? atual(...args) : undefined; };
  espiao.chamadas = [];
  espiao.contagem = () => espiao.chamadas.length;
  espiao.trocar = (nova) => { atual = nova; };
  return espiao;
}`, explanation: 'É a essência do mock.fn do node:test: stub e spy ao mesmo tempo.' },
  { id: 'tst-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Quando verificar interações com mocks e quando verificar estado? O que significa "não mocke o que você não possui"? Dê um exemplo.', model: 'Prefere-se verificar o estado final (o resultado observável), que sobrevive a refatorações; verificam-se interações nas fronteiras, quando o efeito não é observável pelo estado (e-mail enviado, cobrança no gateway, auditoria), e apenas o que importa (o quê, não a ordem interna). "Não mocke o que você não possui" significa não simular diretamente tipos de terceiros (cliente HTTP, ORM, SDK) espalhados pelos testes: cria-se um adaptador próprio, simula-se o adaptador nos testes de serviço e testa-se o adaptador com integração ou contrato. Exemplo: um PagamentoGateway nosso com cobrar(), simulado nos testes do serviço, e um teste do gateway contra o sandbox ou um contrato.', rubric: ['Estado como padrão', 'Interação nas fronteiras', 'Adaptador próprio', 'Exemplo coerente'], explanation: 'Resumo da aula.' },
  { id: 'tst-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarRelogioFalso(inicio)§ (fake de timers): devolve §{ agora(), agendar(fn, ms), cancelar(id), avancar(ms) }§. §agora()§ começa em §inicio§; §agendar§ devolve um id (1, 2, 3...) e programa §fn§ para §agora() + ms§; §avancar(ms)§ executa, em ordem de horário (empate: ordem de agendamento), todas as tarefas com horário ≤ §agora() + ms§, ajustando §agora()§ ao horário de cada tarefa e, ao final, para §agora() + ms§ original; tarefas agendadas dentro das tarefas também são executadas se dentro do prazo.', lang: 'javascript', starter: 'function criarRelogioFalso(inicio) {\n  // seu código aqui\n}\n', hints: ['Mantenha uma lista de tarefas { id, quando, fn }.', 'Repita: pegue a próxima tarefa com quando <= limite, ordene por quando e id.'], tests: [{ name: 'ordem e tempo', code: R`const r = criarRelogioFalso(1000);
const log = [];
r.agendar(() => log.push('b@' + r.agora()), 200);
r.agendar(() => log.push('a@' + r.agora()), 100);
r.agendar(() => log.push('c@' + r.agora()), 200);
r.avancar(150);
assert.equal(JSON.stringify(log), '["a@1100"]');
assert.equal(r.agora(), 1150);
r.avancar(100);
assert.equal(JSON.stringify(log), '["a@1100","b@1200","c@1200"]');
assert.equal(r.agora(), 1250);` }, { name: 'cancelar e encadear', code: R`const r = criarRelogioFalso(0);
const log = [];
const id = r.agendar(() => log.push('x'), 10);
r.agendar(() => { log.push('1'); r.agendar(() => log.push('2'), 5); }, 5);
r.cancelar(id);
r.avancar(9);
assert.equal(JSON.stringify(log), '["1"]');
r.avancar(1);
assert.equal(JSON.stringify(log), '["1","2"]');
assert.equal(r.agora(), 10);` }], solution: R`function criarRelogioFalso(inicio) {
  let agora = inicio; let proximoId = 1; let tarefas = [];
  return {
    agora: () => agora,
    agendar(fn, ms) { const id = proximoId++; tarefas.push({ id, quando: agora + ms, fn }); return id; },
    cancelar(id) { tarefas = tarefas.filter((t) => t.id !== id); },
    avancar(ms) {
      const limite = agora + ms;
      for (;;) {
        const prontas = tarefas.filter((t) => t.quando <= limite).sort((a, b) => a.quando - b.quando || a.id - b.id);
        if (!prontas.length) break;
        const t = prontas[0];
        tarefas = tarefas.filter((x) => x.id !== t.id);
        agora = t.quando;
        t.fn();
      }
      agora = limite;
    }
  };
}`, explanation: 'É o princípio do mock.timers: o tempo só avança quando o teste manda.' }
],
'tst-05': [
  { id: 'tst-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a ordem do ciclo do TDD?', options: ['Green, red, refactor', 'Red, green, refactor', 'Refactor, red, green', 'Red, refactor, green'], answer: 1, explanation: 'Teste falhando, implementação mínima e melhoria com testes verdes.' },
  { id: 'tst-05-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'No kata do laboratório, a versão v7 (refatoração) manteve os 8 testes passando sem mudar o comportamento.', answer: true, explanation: 'v6 e v7 passaram 8/8; v7 só reorganizou o código.' },
  { id: 'tst-05-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a versão do kata ao número de testes verdes.', pairs: [['v0', '0 de 8'], ['v2', '4 de 8'], ['v4', '6 de 8'], ['v6', '8 de 8']], explanation: 'Evolução medida no laboratório.' },
  { id: 'tst-05-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §somar(texto)§ (calculadora de strings): vazio → 0; separadores §,§ e nova linha; cabeçalho §//<sep>\\n§ define um separador extra (um único caractere); números negativos lançam §Error("negativos não permitidos: -1,-3")§ (lista dos negativos); números acima de 1000 são ignorados.', lang: 'javascript', starter: 'function somar(texto) {\n  // seu código aqui\n}\n', hints: ['Trate o cabeçalho primeiro, depois separe e converta.', 'Valide negativos antes de filtrar os grandes.'], tests: [{ name: 'básicos', code: R`assert.equal(somar(''), 0);
assert.equal(somar('5'), 5);
assert.equal(somar('1,2,3,4'), 10);
assert.equal(somar('1\n2,3'), 6);` }, { name: 'extras', code: R`assert.equal(somar('//;\n1;2'), 3);
assert.equal(somar('2,1001,1000'), 1002);
assert.throws(() => somar('1,-1,2,-3'), 'negativos não permitidos: -1,-3');
assert.equal(somar('//.\n1.2\n3'), 6);` }], solution: R`function somar(texto) {
  if (texto === '') return 0;
  let separadores = ',\n';
  if (texto.startsWith('//')) { const fim = texto.indexOf('\n'); separadores += texto.slice(2, fim); texto = texto.slice(fim + 1); }
  const partes = [];
  let atual = '';
  for (const c of texto) { if (separadores.includes(c)) { partes.push(atual); atual = ''; } else atual += c; }
  partes.push(atual);
  const nums = partes.map(Number);
  const neg = nums.filter((n) => n < 0);
  if (neg.length) throw new Error('negativos não permitidos: ' + neg.join(','));
  return nums.filter((n) => n <= 1000).reduce((s, n) => s + n, 0);
}`, explanation: 'O kata do laboratório, em um único passo; o TDD o constrói em 8 ciclos.' },
  { id: 'tst-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Descreva como aplicaria TDD para corrigir um bug em produção e quando você NÃO usaria TDD.', model: 'Primeiro escrevo um teste que reproduz o bug e vejo-o falhar pelo motivo certo (se passar de primeira, não reproduz); depois faço a menor mudança que o faz passar, rodo toda a suíte e refatoro com testes verdes, mantendo o teste como regressão e commitando por passos. Não uso TDD de forma dogmática em exploração e protótipos (faço um spike descartável e refaço com testes), em UI visual, em integrações instáveis ou em código dominado por frameworks, onde testes de integração ou de componente costumam ser mais adequados. TDD é ferramenta: avalio defeitos, tempo de ciclo e confiança.', rubric: ['Teste que reproduz o bug e falha primeiro', 'Menor mudança e refatoração com testes verdes', 'Casos em que TDD ajuda menos', 'Pragmatismo e spike'], explanation: 'Resumo da aula.' },
  { id: 'tst-05-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §romano(n)§ (kata dos números romanos) para 1 ≤ n ≤ 3999 inteiro; fora disso (ou não inteiro) lance §Error("fora do intervalo")§. Use I, V, X, L, C, D, M com subtração (IV, IX, XL, XC, CD, CM).', lang: 'javascript', starter: 'function romano(n) {\n  // seu código aqui\n}\n', hints: ['Use uma tabela de pares valor-símbolo em ordem decrescente.', 'Subtraia o maior valor possível repetidamente.'], tests: [{ name: 'tabela', code: R`const casos = { 1: 'I', 4: 'IV', 9: 'IX', 14: 'XIV', 40: 'XL', 90: 'XC', 400: 'CD', 944: 'CMXLIV', 1994: 'MCMXCIV', 3999: 'MMMCMXCIX' };
for (const [n, r] of Object.entries(casos)) assert.equal(romano(Number(n)), r);` }, { name: 'erros', code: R`assert.throws(() => romano(0), 'fora do intervalo');
assert.throws(() => romano(4000), 'fora do intervalo');
assert.throws(() => romano(2.5), 'fora do intervalo');
assert.equal(romano(3), 'III');` }], solution: R`function romano(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new Error('fora do intervalo');
  const tabela = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let r = '';
  for (const [v, s] of tabela) while (n >= v) { r += s; n -= v; }
  return r;
}`, explanation: 'Um kata clássico: cada linha da tabela de testes pode ser um ciclo red-green.' }
],
'tst-06': [
  { id: 'tst-06-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é o maior valor do BDD?', options: ['Gerar testes automáticos sem esforço', 'O entendimento compartilhado obtido na conversa com exemplos', 'Eliminar o QA', 'Aumentar a cobertura'], answer: 1, explanation: 'A automação é um bônus; sem conversa, vira testes em inglês.' },
  { id: 'tst-06-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Medido: com 100% de cobertura de linhas, 2 de 7 mutantes sobreviveram (cupom no último dia e quantidade 0).', answer: true, explanation: 'Cobertura mede execução, não verificação; com 2 testes de fronteira os 7 mutantes morreram.' },
  { id: 'tst-06-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o momento ao conjunto de testes.', pairs: [['Salvar/commit', 'Unitários e análise estática'], ['Pull request', 'Integração e BDD'], ['Antes do deploy', 'E2E, carga, contrato e segurança'], ['Pós-deploy', 'Testes de fumaça']], explanation: 'Feedback rápido primeiro, testes caros depois.' },
  { id: 'tst-06-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §lerFeature(texto)§ para um Gherkin em português. Devolva §{ funcionalidade, cenarios }§: §funcionalidade§ é o texto após §Funcionalidade:§; cada §Cenário:§ vira §{ nome, passos }§ com §passos§ = lista de §{ tipo, texto }§, onde §tipo§ é §"dado"§, §"quando"§ ou §"entao"§ (para §Dado§, §Quando§, §Então§; §E§ e §Mas§ herdam o tipo do passo anterior). Ignore linhas vazias e comentários (§#§) e o §Contexto:§ (e seus passos).', lang: 'javascript', starter: 'function lerFeature(texto) {\n  // seu código aqui\n}\n', hints: ['Processe linha a linha com trim().', 'Mantenha o estado "dentro de contexto" e o último tipo.'], tests: [{ name: 'feature', code: R`const t = ['# language: pt', 'Funcionalidade: Finalizar pedido', '', '  Contexto:', '    Dado que hoje é "2026-11-25"', '', '  Cenário: Compra simples', '    Dado o gateway aprova', '    E o estoque tem 5 unidades', '    Quando a cliente compra 2 unidades', '    Então o pedido fica "pago"', '    E nenhuma cobrança extra', '', '  Cenário: Recusa', '    Quando a cliente compra 1 unidade', '    Mas o gateway recusa'].join('\n');
const f = lerFeature(t);
assert.equal(f.funcionalidade, 'Finalizar pedido');
assert.equal(f.cenarios.length, 2);
assert.equal(f.cenarios[0].nome, 'Compra simples');
assert.equal(JSON.stringify(f.cenarios[0].passos.map((p) => p.tipo)), '["dado","dado","quando","entao","entao"]');
assert.equal(f.cenarios[0].passos[1].texto, 'o estoque tem 5 unidades');` }, { name: 'herança e vazio', code: R`const f = lerFeature('Funcionalidade: X\nCenário: A\nQuando algo\nMas outro\nE mais um');
assert.equal(JSON.stringify(f.cenarios[0].passos.map((p) => p.tipo)), '["quando","quando","quando"]');
const g = lerFeature('Funcionalidade: Só título');
assert.equal(g.funcionalidade, 'Só título'); assert.equal(g.cenarios.length, 0);` }], solution: R`function lerFeature(texto) {
  const f = { funcionalidade: '', cenarios: [] };
  let emContexto = false; let atual = null; let ultimo = null;
  const tipos = { Dado: 'dado', Quando: 'quando', 'Então': 'entao' };
  for (const bruta of texto.split('\n')) {
    const l = bruta.trim();
    if (!l || l.startsWith('#')) continue;
    let m;
    if ((m = /^Funcionalidade:\s*(.*)$/.exec(l))) { f.funcionalidade = m[1]; continue; }
    if (/^Contexto:/.test(l)) { emContexto = true; atual = null; continue; }
    if ((m = /^Cenário:\s*(.*)$/.exec(l))) { emContexto = false; atual = { nome: m[1], passos: [] }; f.cenarios.push(atual); ultimo = null; continue; }
    if (emContexto || !atual) continue;
    if ((m = /^(Dado|Quando|Então)\s+(.*)$/.exec(l))) { ultimo = tipos[m[1]]; atual.passos.push({ tipo: ultimo, texto: m[2] }); continue; }
    if ((m = /^(E|Mas)\s+(.*)$/.exec(l)) && ultimo) atual.passos.push({ tipo: ultimo, texto: m[2] });
  }
  return f;
}`, explanation: 'O Cucumber faz isso com muito mais recursos (esquemas, tabelas, idiomas).' },
  { id: 'tst-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Monte uma estratégia de testes para um sistema de pedidos: camadas, o que roda em cada momento, métricas e como usar cobertura e mutação. Use os números do laboratório.', model: 'Mapear o risco: pagamento, cupons e cálculos financeiros ganham várias camadas. Regras puras com testes unitários e de propriedade; integração com banco real e HTTP em processo (SQLite ou Postgres em contêiner); BDD para regras de negócio com o time de produto; poucos E2E nas jornadas críticas; contratos com terceiros. No commit: unitários e análise estática; na PR: integração e BDD; antes do deploy ou à noite: E2E, carga, contrato e segurança; depois: fumaça. Orçamentos de tempo e flakiness próxima de zero (quarentena). Cobertura é alarme, não meta: no laboratório 100% das linhas e ainda 2 de 7 mutantes vivos (fronteiras), que foram fechados com 2 testes e deram 7/7; usar mutação nos módulos críticos. Métricas úteis: tempo de feedback, taxa de intermitentes, defeitos escapados e pontuação de mutação.', rubric: ['Estratégia por risco e camadas', 'O que roda e quando', 'Cobertura x mutação com números', 'Métricas úteis e flakiness'], explanation: 'Resumo da aula.' },
  { id: 'tst-06-e6', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §pontuacaoDeMutacao(resultados)§: §resultados§ é uma lista de §{ id, morto }§. Devolva §{ total, mortos, sobreviventes, pct }§ onde §sobreviventes§ é a lista dos ids que não foram mortos (na ordem) e §pct§ é a porcentagem de mortos arredondada a 1 casa decimal (§100§ se não há mutantes).', lang: 'javascript', starter: 'function pontuacaoDeMutacao(resultados) {\n  // seu código aqui\n}\n', hints: ['Filtre mortos e sobreviventes.', 'Cuide da divisão por zero.'], tests: [{ name: 'laboratório', code: R`const r = [{ id: 'clamp', morto: true }, { id: 'cupom-ultimo-dia', morto: false }, { id: 'qtd-zero', morto: false }, { id: 'preco', morto: true }, { id: 'acrescimo', morto: true }, { id: 'pagamento', morto: true }, { id: 'status', morto: true }];
assert.equal(JSON.stringify(pontuacaoDeMutacao(r)), '{"total":7,"mortos":5,"sobreviventes":["cupom-ultimo-dia","qtd-zero"],"pct":71.4}');` }, { name: 'bordas', code: R`assert.equal(JSON.stringify(pontuacaoDeMutacao([])), '{"total":0,"mortos":0,"sobreviventes":[],"pct":100}');
assert.equal(pontuacaoDeMutacao([{ id: 'a', morto: true }]).pct, 100);
assert.equal(pontuacaoDeMutacao([{ id: 'a', morto: false }]).pct, 0);` }], solution: R`function pontuacaoDeMutacao(resultados) {
  const total = resultados.length;
  const mortos = resultados.filter((r) => r.morto).length;
  const sobreviventes = resultados.filter((r) => !r.morto).map((r) => r.id);
  const pct = total === 0 ? 100 : Math.round((mortos / total) * 1000) / 10;
  return { total, mortos, sobreviventes, pct };
}`, explanation: 'Ferramentas como o Stryker calculam esse mesmo indicador, módulo a módulo.' }
]
};

const P = 'fundamentos-testes-p';
export const assessment = {
  id: 'fundamentos-testes', title: 'Avaliação final — Fundamentos de testes', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual camada da pirâmide deve ter mais testes?', options: ['E2E', 'Integração', 'Unitários', 'Manuais'], answer: 2, explanation: 'Os unitários são rápidos, baratos e estáveis.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Um teste que nunca foi visto falhando pode não estar verificando o comportamento novo.', answer: true, explanation: 'Por isso o TDD pede ver o vermelho pelo motivo certo.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Resultado medido do experimento de flakiness (14 execuções por modo).', code: 'espera fixa de 120 ms : falhas 8/14 | tempo médio 224 ms\nespera por condição  : falhas 0/14 | tempo médio 269 ms', lang: 'text', steps: [{ q: 'Quantas falhas teve a espera fixa (use um número)?', answers: ['8'] }, { q: 'Qual estratégia é mais robusta? (fixa ou condição)', answers: ['condição', 'condicao', 'por condição', 'por condicao'] }], explanation: 'A espera por condição não depende de um chute sobre o tempo.' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual verificação sobrevive melhor a uma refatoração interna?', options: ['Contar as chamadas de um método interno com mock', 'Verificar o estado final com um fake', 'Verificar a ordem das chamadas internas', 'Verificar o nome de um método privado'], answer: 1, explanation: 'Medido: o teste de mock falhou ao renomear salvar para inserir; o de estado passou.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que deixa este teste de restrição sem testar nada.', code: "const repo = new RepositorioPedidos();\nassert.throws(() => repo.db.exec(\"UPDATE pedidos SET status = 'xyz'\"), /CHECK constraint failed/);", answer: 2, explanation: 'Sem linhas na tabela o UPDATE não viola a restrição: insira um pedido antes.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete as três letras do ciclo do TDD.', code: 'Ciclo: [[0]] (teste falha) → [[1]] (mínimo para passar) → refactor (melhorar com testes verdes)', answers: [['red', 'Red'], ['green', 'Green']], explanation: 'Red, green, refactor.' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a técnica ao que ela mede ou verifica.', pairs: [['Cobertura de código', 'O que foi executado'], ['Teste de mutação', 'Se os testes detectam alterações no código'], ['Teste de propriedade', 'Invariantes sobre muitas entradas geradas'], ['Teste de fumaça', 'Que o sistema implantado está de pé']], explanation: 'Cada técnica responde a uma pergunta diferente.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Medido: com 100% de cobertura de linhas, quantos mutantes de 7 sobreviveram antes de adicionar os testes de fronteira?', options: ['0', '2', '5', '7'], answer: 1, explanation: 'Cupom no último dia e quantidade 0 (5 de 7 mortos).' },
    { id: P + '9', type: 'tf', difficulty: 3, points: 10, prompt: 'Cenários de BDD devem descrever cliques e comandos SQL passo a passo para serem precisos.', answer: false, explanation: 'Devem ser declarativos, na linguagem do domínio; os detalhes ficam nas definições dos passos.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Que testes rodar a cada pull request?', options: ['Apenas manuais', 'Unitários, integração e BDD (feedback em poucos minutos)', 'Somente E2E completos', 'Nenhum'], answer: 1, explanation: 'E2E, carga e contrato ficam para antes do deploy ou à noite, conforme o orçamento.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Projete a estratégia de testes de uma API de pedidos com pagamento e cupons (camadas, dublês, TDD/BDD, CI, métricas e riscos).', model: 'Regras de domínio (total, cupom, desconto) com testes unitários e de propriedade, desenvolvidas com TDD; serviço de aplicação com fakes (repositório em memória) e dublês apenas nas fronteiras (pagamento, e-mail) com relógio e ids injetados; integração com banco real (SQLite ou Postgres em contêiner, mesmas migrações) para transações, restrições e SQL, e API HTTP em processo; BDD para as regras de cupom e pagamento com produto e QA; poucos E2E nas jornadas críticas com esperas por condição, seletores por papel, dados isolados e terceiros falsificados; contratos com o gateway. No CI: unitários no commit; integração e BDD na PR; E2E, contrato e carga antes do deploy; fumaça depois. Métricas: tempo de feedback, flakiness próxima de zero, defeitos escapados, mutação nos módulos críticos (cobertura como alarme).', rubric: ['Camadas e dublês corretos', 'TDD e BDD onde fazem sentido', 'O que roda em cada momento', 'Métricas (mutação, flakiness, feedback)'], explanation: 'Resumo do projeto integrador.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual destas é uma métrica de vaidade?', options: ['Tempo de feedback da PR', 'Taxa de testes intermitentes', 'Número total de testes como meta', 'Defeitos escapados para produção'], answer: 2, explanation: 'Metas numéricas sem relação com o risco levam a testes inúteis (lei de Goodhart).' }
  ]
};

export const project = {
  id: 'suite-de-testes-do-zero', name: 'Suíte de testes do zero: unitários, integração, E2E, TDD, BDD, mutação e estratégia', lv: 'M', stack: 'JavaScript, Node.js test runner, SQLite (node:sqlite), fast-check, Cucumber, Puppeteer', ds: ['testing'],
  desc: 'Receba um **serviço de pedidos** sem testes e construa a **suíte completa**: **testes unitários** com tabelas e **propriedades**, **integração** com **banco real** e **API em processo**, **um E2E** das jornadas críticas com **esperas por condição**, **dublês** só nas fronteiras, uma funcionalidade nova desenvolvida com **TDD**, **cenários BDD** com o time de produto, **cobertura e mutação** e uma **estratégia de testes por risco** com **orçamentos** e **métricas**.',
  rf: ['Pelo menos 15 testes unitários (tabelas, fronteiras, erros) e 2 testes de propriedade com semente fixa', 'Testes de integração do repositório com banco real (transação, restrições, cascata) e da API HTTP em porta efêmera', 'Um E2E em navegador headless das jornadas críticas, sem sleep, com seletores estáveis e dados isolados', 'Dublês apenas nas fronteiras (pagamento, notificação, relógio) e pelo menos um teste de estado com fake', 'Uma funcionalidade nova construída com TDD, com o registro do ciclo (testes verdes por passo)', 'Pelo menos 5 cenários BDD em Gherkin, em português, declarativos, executados', 'Relatório de cobertura e pontuação de mutação (manual ou Stryker) com os mutantes sobreviventes tratados', 'Estratégia de testes escrita: camadas, o que roda no commit, na PR e antes do deploy, orçamentos e métricas'],
  rnf: ['Testes independentes da ordem e determinísticos (relógio e ids injetados)', 'Nenhum sleep fixo e flakiness medida (0 falhas em 10 execuções consecutivas)', 'Tempo total da PR (sem E2E) abaixo de 2 minutos, medido', 'README com comandos, resultados e limitações'],
  ac: ['Os testes passam em qualquer ordem e em 10 execuções seguidas', 'Mutantes de fronteira são mortos por testes explícitos', 'A cobertura não é usada como meta: o relatório explica o que ela não garante', 'O E2E falha de forma diagnosticável (captura e logs guardados)', 'A estratégia diz o que roda em cada momento e por quê'],
  ch: ['Executar o Stryker e comparar com a mutação manual', 'Rodar a integração contra Postgres em contêiner com Testcontainers', 'Adicionar testes de contrato do gateway (C5.6)', 'Medir e reduzir o tempo da suíte com paralelismo e reaproveitamento de sessão']
};
