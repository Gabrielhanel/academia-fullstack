// C2.6 — Testes de frontend: exercícios das aulas 5 a 8, prova final e projeto integrador.
const R = String.raw;

export const exsetsB = {
'tfe-05': [
  { id: 'tfe-05-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Um componente usa §useContext(Tema)§ e quebra no teste por falta do provedor. Qual é a solução adequada?', options: ['Mockar o React inteiro', 'Renderizar com a opção wrapper (ou uma função de render personalizada) que fornece o provedor com um valor de teste', 'Remover o contexto do componente', 'Ignorar o teste'], answer: 1, explanation: 'O wrapper envolve o componente nos provedores necessários com valores simples e previsíveis.' },
  { id: 'tfe-05-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas com §renderHook(() => useContagem(...))§ no laboratório.', code: 'useContagem(5) sem provedor:           n = ?, tema = ?\nwrapper Tema="escuro", após inc():      n = ?, tema = ?', lang: 'text', steps: [{ q: 'Valor de n sem provedor (inicial 5):', answers: ['5'] }, { q: 'Tema sem provedor (valor padrão do contexto):', answers: ['claro'] }, { q: 'Tema com o provedor escuro:', answers: ['escuro'] }], explanation: 'Sem provedor vale o padrão do contexto ("claro"); com o wrapper, o tema "escuro", e inc() leva n de 0 a 1.' },
  { id: 'tfe-05-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'O resultado dos testes depende da ordem de execução e um teste de erro "contamina" os seguintes. Clique na linha da causa.', code: 'const client = new QueryClient();\nfunction renderComProvedores(ui) {\n  return render(ui, { wrapper: ({ children }) => (\n    <QueryClientProvider client={client}>{children}</QueryClientProvider>\n  ) });\n}', answer: 1, explanation: 'O QueryClient é criado uma vez no módulo e compartilhado entre os testes (cache vaza). Crie um por teste, dentro da função de render, com retry: false.' },
  { id: 'tfe-05-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Todo hook customizado deve ter seu próprio teste isolado com renderHook, mesmo que seja usado por um único componente já testado.', answer: false, explanation: 'Teste hooks isolados quando são reutilizáveis e têm lógica própria; hooks de um único componente ficam cobertos pelo teste do comportamento visível.' },
  { id: 'tfe-05-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarHistoricoMemoria(entradas, indice)§ (modelo de um roteador em memória). §entradas§ (padrão §["/"]§) é a lista de caminhos e §indice§ (padrão: a última entrada) a posição atual. Métodos: §localizacao()§ (caminho atual), §push(p)§ (descarta as entradas **à frente** da atual, acrescenta §p§ e avança), §replace(p)§ (troca a entrada atual), §voltar()§ e §avancar()§ (devolvem §true§ se moveram, §false§ se estavam no limite), §podeVoltar()§, §podeAvancar()§ e §entradas()§ (cópia da lista). §push§ de um caminho **igual ao atual** não deve criar nova entrada. Caminhos devem começar com §/§, senão lance §Error("caminho inválido: P")§.', lang: 'javascript', starter: 'function criarHistoricoMemoria(entradas = ["/"], indice) {\n  // seu código aqui\n}\n', hints: ['Guarde a lista e o índice em variáveis.', 'No push, use lista.slice(0, indice + 1) antes de acrescentar.'], tests: [{ name: 'push, voltar e avançar', code: R`const h = criarHistoricoMemoria();
assert.equal(h.localizacao(), '/');
h.push('/produtos'); h.push('/produtos/42');
assert.equal(h.localizacao(), '/produtos/42');
assert.equal(h.voltar(), true); assert.equal(h.localizacao(), '/produtos');
assert.equal(h.avancar(), true); assert.equal(h.localizacao(), '/produtos/42');
assert.equal(h.avancar(), false); assert.equal(h.podeAvancar(), false); assert.equal(h.podeVoltar(), true);` }, { name: 'push descarta o futuro; replace; duplicado', code: R`const h = criarHistoricoMemoria(['/a', '/b', '/c'], 1);
assert.equal(h.localizacao(), '/b');
h.push('/d');
assert.deepEqual(h.entradas(), ['/a', '/b', '/d']);
h.replace('/e'); assert.deepEqual(h.entradas(), ['/a', '/b', '/e']);
h.push('/e'); assert.equal(h.entradas().length, 3);
const copia = h.entradas(); copia.push('/x'); assert.equal(h.entradas().length, 3);` }, { name: 'limites e validação', code: R`const h = criarHistoricoMemoria(['/'], 0);
assert.equal(h.voltar(), false);
assert.equal(h.podeVoltar(), false);
assert.throws(() => h.push('sem barra'), 'caminho inválido: sem barra');
assert.throws(() => criarHistoricoMemoria(['x']), 'caminho inválido: x');
assert.equal(criarHistoricoMemoria(['/a', '/b']).localizacao(), '/b');` }], solution: R`function criarHistoricoMemoria(entradas = ['/'], indice) {
  const valida = (p) => { if (typeof p !== 'string' || !p.startsWith('/')) throw new Error('caminho inválido: ' + p); return p; };
  let lista = entradas.map(valida);
  let i = indice === undefined ? lista.length - 1 : indice;
  return {
    localizacao: () => lista[i],
    push(p) { valida(p); if (p === lista[i]) return; lista = lista.slice(0, i + 1); lista.push(p); i = lista.length - 1; },
    replace(p) { valida(p); lista[i] = p; },
    voltar() { if (i <= 0) return false; i--; return true; },
    avancar() { if (i >= lista.length - 1) return false; i++; return true; },
    podeVoltar: () => i > 0,
    podeAvancar: () => i < lista.length - 1,
    entradas: () => lista.slice()
  };
}
`, explanation: 'Um roteador em memória guarda o histórico em uma lista e um índice, o que permite testar a navegação sem a barra de endereço.' }
],
'tfe-06': [
  { id: 'tfe-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual a principal vantagem do MSW sobre mockar a função §fetch§ em cada teste?', options: ['É mais rápido que qualquer mock', 'Exercita o código real de requisição e independe do cliente HTTP, e os handlers servem a testes, Storybook e desenvolvimento', 'Dispensa a interface', 'Evita o uso de async'], answer: 1, explanation: 'O MSW intercepta na fronteira da rede: a aplicação faz a requisição de verdade.' },
  { id: 'tfe-06-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o cenário à forma de simulá-lo com o MSW.', pairs: [['Erro 500 do servidor', 'new HttpResponse(null, { status: 500 })'], ['Falha de rede', 'HttpResponse.error()'], ['Resposta lenta', 'await delay(150) no handler'], ['Sucesso com dados', 'HttpResponse.json([...])'], ['Rota sem handler (deve falhar o teste)', 'onUnhandledRequest: "error"']], explanation: 'Cada cenário tem um recurso próprio do MSW; os de erro costumam ser sobrescritos por teste com server.use.' },
  { id: 'tfe-06-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Depois do teste de erro 500, os testes seguintes também recebem 500. Clique na linha que falta.', code: 'beforeAll(() => server.listen({ onUnhandledRequest: "error" }));\nafterAll(() => server.close());\ntest("erro 500", async () => {\n  server.use(http.get("/api/usuarios", () => new HttpResponse(null, { status: 500 })));\n});', answer: 2, explanation: 'Falta o afterEach(() => server.resetHandlers()), que remove as sobrescritas entre os testes.' },
  { id: 'tfe-06-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o handler que guarda o corpo enviado.', code: 'let corpo;\nserver.use(http.[[0]](\'/api/pedidos\', async ({ request }) => {\n  corpo = await request.[[1]]();\n  return HttpResponse.json({ id: 7 }, { status: 201 });\n}));', answers: [['post'], ['json']], explanation: 'Capturar o corpo no handler permite afirmar o contrato de envio sem mockar a função de requisição.' },
  { id: 'tfe-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Handlers MSW passam em todos os testes, mas a tela falha em produção porque a API real mudou um nome de campo. Explique o problema e como reduzir o risco.', model: 'O MSW devolve exatamente o que o handler declara; se o handler divergir do backend real, os testes dão falsa segurança, pois verificam o cliente contra um contrato desatualizado. Para reduzir o risco: derivar os handlers e os tipos de um esquema compartilhado (OpenAPI ou esquemas de validação usados nos dois lados), executar testes de contrato contra o backend (ou o esquema) para detectar divergências, validar a resposta real com o mesmo esquema na aplicação, manter alguns testes E2E contra um backend de teste nos fluxos críticos e revisar os handlers quando a API mudar. O MSW isola o frontend, mas não prova que o servidor responde assim.', rubric: ['Explica que o handler divergente dá falsa segurança', 'Propõe esquema ou contrato compartilhado', 'Propõe testes de contrato ou validação da resposta', 'Cita E2E com backend de teste para fluxos críticos'], explanation: 'O MSW exige disciplina de contrato para manter o valor dos testes.' },
  { id: 'tfe-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarServidorSimulado()§ (modelo do MSW). Métodos: §usar(metodo, caminho, resposta, opcoes)§ adiciona um handler **no início** da lista (sobrescreve os anteriores para a mesma rota); §fixarPadrao()§ marca todos os handlers atuais como padrão; §resetar()§ remove os handlers **não padrão**; §historico()§ devolve a lista de requisições feitas (§{ metodo, caminho }§); §requisitar(metodo, url, corpo)§ procura o primeiro handler que casa (método igual, ignorando maiúsculas, e caminho com parâmetros §:id§) e devolve §{ status, corpo }§. §resposta§ pode ser um objeto §{ status = 200, corpo }§ ou uma função §({ params, query, corpo }) => { status, corpo }§ (§query§ é um objeto com os parâmetros da query string). §opcoes.uma§ verdadeiro faz o handler valer **uma única vez** (depois é removido). Sem handler: lance §Error("requisição sem handler: METODO CAMINHO")§ (método em maiúsculas, caminho sem a query). Toda requisição, tratada ou não, entra no histórico.', lang: 'javascript', starter: 'function criarServidorSimulado() {\n  // seu código aqui\n}\n', hints: ['Separe a url em caminho e query com indexOf("?").', 'Compare segmentos: ":nome" captura o valor.'], tests: [{ name: 'parâmetros, query e função de resposta', code: R`const s = criarServidorSimulado();
s.usar('get', '/api/usuarios/:id', ({ params, query }) => ({ corpo: { id: params.id, filtro: query.f } }));
s.usar('POST', '/api/pedidos', ({ corpo }) => ({ status: 201, corpo: { recebido: corpo } }));
assert.deepEqual(s.requisitar('GET', '/api/usuarios/7?f=x'), { status: 200, corpo: { id: '7', filtro: 'x' } });
assert.deepEqual(s.requisitar('post', '/api/pedidos', { a: 1 }), { status: 201, corpo: { recebido: { a: 1 } } });
assert.deepEqual(s.historico(), [{ metodo: 'GET', caminho: '/api/usuarios/7' }, { metodo: 'POST', caminho: '/api/pedidos' }]);` }, { name: 'padrão, sobrescrita e reset', code: R`const s = criarServidorSimulado();
s.usar('GET', '/api/lista', { corpo: [1, 2] }); s.fixarPadrao();
s.usar('GET', '/api/lista', { status: 500, corpo: null });
assert.equal(s.requisitar('GET', '/api/lista').status, 500);
s.resetar();
assert.deepEqual(s.requisitar('GET', '/api/lista'), { status: 200, corpo: [1, 2] });` }, { name: 'uma vez e sem handler', code: R`const s = criarServidorSimulado();
s.usar('GET', '/api/x', { corpo: 'a' });
s.usar('GET', '/api/x', { corpo: 'unica' }, { uma: true });
assert.equal(s.requisitar('GET', '/api/x').corpo, 'unica');
assert.equal(s.requisitar('GET', '/api/x').corpo, 'a');
assert.throws(() => s.requisitar('delete', '/api/y?q=1'), 'requisição sem handler: DELETE /api/y');
assert.equal(s.historico().length, 3);` }], solution: R`function criarServidorSimulado() {
  let handlers = [];
  let historico = [];
  const casar = (padrao, caminho) => {
    const p = padrao.split('/').filter(Boolean), c = caminho.split('/').filter(Boolean);
    if (p.length !== c.length) return null;
    const params = {};
    for (let i = 0; i < p.length; i++) {
      if (p[i].startsWith(':')) params[p[i].slice(1)] = c[i];
      else if (p[i] !== c[i]) return null;
    }
    return params;
  };
  return {
    usar(metodo, caminho, resposta, opcoes = {}) { handlers.unshift({ metodo: metodo.toUpperCase(), caminho, resposta, uma: !!opcoes.uma, padrao: false }); },
    fixarPadrao() { handlers.forEach((h) => { h.padrao = true; }); },
    resetar() { handlers = handlers.filter((h) => h.padrao); },
    historico: () => historico.slice(),
    requisitar(metodo, url, corpo) {
      const m = metodo.toUpperCase();
      const i = url.indexOf('?');
      const caminho = i < 0 ? url : url.slice(0, i);
      const query = Object.fromEntries(new URLSearchParams(i < 0 ? '' : url.slice(i + 1)));
      historico.push({ metodo: m, caminho });
      for (const h of handlers) {
        if (h.metodo !== m) continue;
        const params = casar(h.caminho, caminho);
        if (!params) continue;
        if (h.uma) handlers = handlers.filter((x) => x !== h);
        const r = typeof h.resposta === 'function' ? h.resposta({ params, query, corpo }) : h.resposta;
        return { status: r.status ?? 200, corpo: r.corpo };
      }
      throw new Error('requisição sem handler: ' + m + ' ' + caminho);
    }
  };
}
`, explanation: 'O modelo reproduz a ideia do MSW: handlers por método e caminho, sobrescritas por teste, reset entre testes e falha para requisições não tratadas.' }
],
'tfe-07': [
  { id: 'tfe-07-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual destes problemas o jsdom NÃO consegue detectar?', options: ['Um botão sem rótulo acessível', 'Um botão com a cor errada e sobreposto a outro elemento', 'Um texto ausente na tela', 'Um evento de clique não tratado'], answer: 1, explanation: 'O jsdom não faz layout nem pinta: cores, sobreposições e responsividade exigem navegador real (testes visuais).' },
  { id: 'tfe-07-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas do pixelmatch em imagens sintéticas de 20x20 pixels.', code: 'duas imagens brancas iguais: ? pixels diferentes\nquadrado preto de 5x5 sobre branco: ? pixels diferentes\nruído leve 255 contra 250, threshold 0: ? pixels diferentes', lang: 'text', steps: [{ q: 'Pixels diferentes entre imagens iguais:', answers: ['0'] }, { q: 'Pixels diferentes com o quadrado 5x5:', answers: ['25'] }, { q: 'Pixels diferentes com o ruído e threshold 0:', answers: ['400'] }], explanation: 'Sem tolerância, até o ruído leve altera todos os 400 pixels; com threshold 0,1 foram 0.' },
  { id: 'tfe-07-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a fonte de ruído visual à medida de controle.', pairs: [['Animações e transições', 'Desativar animações no teste'], ['Datas e dados aleatórios na tela', 'Dados simulados fixos e máscara de regiões'], ['Fontes diferentes entre máquinas', 'Rodar no mesmo contêiner da linha de base'], ['Imagens que carregam depois', 'Esperar o carregamento antes de capturar']], explanation: 'Reduzir variáveis torna a comparação confiável.' },
  { id: 'tfe-07-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Para reduzir o custo, convém cobrir todos os fluxos do produto com testes E2E em vez de testes de componente com MSW.', answer: false, explanation: 'E2E é lento, caro e mais instável: use poucos, nos fluxos críticos, e cubra o restante com testes de componente.' },
  { id: 'tfe-07-e5', type: 'bug', difficulty: 3, points: 10, prompt: 'O teste E2E falha de vez em quando na CI. Clique na linha que usa uma espera fixa.', code: 'test("compra", async ({ page }) => {\n  await page.goto("/produtos/camiseta");\n  await page.getByRole("button", { name: "Comprar" }).click();\n  await page.waitForTimeout(2000);\n  await expect(page.getByText("Pedido confirmado")).toBeVisible();\n});', answer: 4, explanation: 'waitForTimeout é uma pausa fixa; as asserções do Playwright já esperam (com nova tentativa) até o texto ficar visível.' },
  { id: 'tfe-07-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §compararCapturas(a, b, opcoes)§ (modelo de uma regressão visual). §a§ e §b§ são §{ largura, altura, pixels }§, com §pixels§ uma lista de linhas, cada linha uma lista de §[r, g, b]§. §opcoes§: §limiar§ (0 a 1, padrão §0.1§), §maxProporcao§ (padrão §0§) e §mascaras§ (lista de §{ x, y, largura, altura }§ ignoradas). Um pixel é **diferente** se a maior diferença absoluta entre os canais, dividida por 255, for **maior que §limiar§**. Pixels dentro de uma máscara não contam (nem entram no total considerado). Devolva §{ diferentes, total, proporcao, passou }§ em que §total§ é o número de pixels considerados, §proporcao = diferentes / total§ (0 se total 0) e §passou = proporcao <= maxProporcao§. Tamanhos diferentes → §Error("tamanhos diferentes")§.', lang: 'javascript', starter: 'function compararCapturas(a, b, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Percorra y e x e verifique se (x,y) está em alguma máscara.', 'Calcule max(|r1-r2|, |g1-g2|, |b1-b2|) / 255.'], tests: [{ name: 'iguais, mudança e ruído', code: R`const img = (w, h, f) => ({ largura: w, altura: h, pixels: Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => f(x, y))) });
const branca = img(20, 20, () => [255, 255, 255]);
assert.deepEqual(compararCapturas(branca, img(20, 20, () => [255, 255, 255])), { diferentes: 0, total: 400, proporcao: 0, passou: true });
const quadrado = compararCapturas(branca, img(20, 20, (x, y) => (x < 5 && y < 5 ? [0, 0, 0] : [255, 255, 255])));
assert.equal(quadrado.diferentes, 25); assert.equal(quadrado.passou, false);
const ruido = img(20, 20, () => [250, 250, 250]);
assert.equal(compararCapturas(branca, ruido).diferentes, 0);
assert.equal(compararCapturas(branca, ruido, { limiar: 0 }).diferentes, 400);` }, { name: 'proporção máxima e máscaras', code: R`const img = (w, h, f) => ({ largura: w, altura: h, pixels: Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => f(x, y))) });
const a = img(10, 10, () => [255, 255, 255]);
const b = img(10, 10, (x, y) => (x === 0 && y === 0 ? [0, 0, 0] : [255, 255, 255]));
assert.equal(compararCapturas(a, b, { maxProporcao: 0.01 }).passou, true);
assert.equal(compararCapturas(a, b, { maxProporcao: 0.005 }).passou, false);
const m = compararCapturas(a, b, { mascaras: [{ x: 0, y: 0, largura: 2, altura: 2 }] });
assert.deepEqual(m, { diferentes: 0, total: 96, proporcao: 0, passou: true });` }, { name: 'tamanhos diferentes', code: R`const um = { largura: 1, altura: 1, pixels: [[[0, 0, 0]]] };
const dois = { largura: 2, altura: 1, pixels: [[[0, 0, 0], [0, 0, 0]]] };
assert.throws(() => compararCapturas(um, dois), 'tamanhos diferentes');` }], solution: R`function compararCapturas(a, b, opcoes = {}) {
  const { limiar = 0.1, maxProporcao = 0, mascaras = [] } = opcoes;
  if (a.largura !== b.largura || a.altura !== b.altura) throw new Error('tamanhos diferentes');
  let diferentes = 0, total = 0;
  for (let y = 0; y < a.altura; y++) {
    for (let x = 0; x < a.largura; x++) {
      if (mascaras.some((m) => x >= m.x && x < m.x + m.largura && y >= m.y && y < m.y + m.altura)) continue;
      total++;
      const p = a.pixels[y][x], q = b.pixels[y][x];
      const d = Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2])) / 255;
      if (d > limiar) diferentes++;
    }
  }
  const proporcao = total === 0 ? 0 : diferentes / total;
  return { diferentes, total, proporcao, passou: proporcao <= maxProporcao };
}
`, explanation: 'A comparação combina um limiar de cor por pixel e uma proporção máxima de pixels diferentes, com máscaras para regiões dinâmicas, que é a base de um teste de regressão visual.' }
],
'tfe-08': [
  { id: 'tfe-08-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Três testes E2E falham "às vezes" e a equipe repete a CI até ficar verde. Qual é a conduta correta?', options: ['Continuar repetindo', 'Medir o histórico, colocar em quarentena com prazo, reproduzir e corrigir a causa (espera, estado compartilhado, tempo)', 'Apagar os testes', 'Aumentar todos os timeouts'], answer: 1, explanation: 'Repetir esconde a instabilidade; é preciso medir e corrigir a causa, usando quarentena temporária.' },
  { id: 'tfe-08-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a causa de instabilidade à correção.', pairs: [['Pausa fixa antes da asserção', 'Esperar a condição (findBy, waitFor, asserções com nova tentativa)'], ['Cache ou store compartilhado entre testes', 'Criar o estado novo a cada teste'], ['Uso do relógio real', 'Temporizadores falsos ou tempo fixo'], ['Dados compartilhados no E2E', 'Dados criados por teste']], explanation: 'Quase toda instabilidade vem de espera, estado, tempo ou dados.' },
  { id: 'tfe-08-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Ordene a CI do mais barato ao mais caro: 1 testes E2E, 2 análise estática, 3 instalação das dependências, 4 testes unitários e de componentes.', code: 'ordem correta (números): ?, ?, ?, ?', lang: 'text', steps: [{ q: 'Primeira etapa:', answers: ['3'] }, { q: 'Segunda etapa:', answers: ['2'] }, { q: 'Última etapa:', answers: ['1'] }], explanation: 'Instalar (3), análise estática (2), testes de unidade e componentes (4) e, por último, E2E (1): falhar cedo e barato.' },
  { id: 'tfe-08-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Retries automáticos servem para detectar testes instáveis, não para escondê-los.', answer: true, explanation: 'Um teste que só passa na segunda tentativa deve ser contabilizado como instável e corrigido.' },
  { id: 'tfe-08-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Defina uma estratégia de testes para um app de e-commerce em React/Next.js: níveis, ferramentas, o que cobrir em cada um e as regras do pipeline.', model: 'Camada estática: TypeScript e ESLint (inclui regras de acessibilidade) em todo pull request. Unitários (Vitest) para lógica pura: validação, cálculo de preço e frete, reducers e seletores. Integração de componentes (Testing Library com MSW) para a maior parte da cobertura: catálogo, carrinho, formulários de cadastro e de endereço, estados de carregamento, vazio e erro, com consultas por papel, user-event e axe. Visual: histórias do Storybook para o design system e capturas dos estados principais em poucas larguras, no mesmo contêiner. E2E (Playwright) em poucos fluxos críticos: login, compra e pagamento, com dados isolados. Contratos da API validados por esquema compartilhado. Pipeline: instalar, estático, testes unitários e de componentes (paralelos), build, visuais, E2E em ramos principais; cobertura de ramos com limiar que impede queda; política de quarentena para testes instáveis com prazo; teste que reproduz cada bug corrigido; metas de tempo e de taxa de instabilidade.', rubric: ['Descreve os níveis com as ferramentas', 'Prioriza integração de componentes e poucos E2E', 'Descreve a ordem e as regras do pipeline', 'Inclui tratamento de instabilidade e uso adequado da cobertura'], explanation: 'A estratégia combina o teste mais barato que dá confiança para cada risco.' },
  { id: 'tfe-08-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §classificarTestes(historico)§. §historico§ é um objeto §{ nomeDoTeste: [{ commit, ok }, ...] }§ com várias execuções (cada uma com o commit em que rodou). Para cada teste devolva §{ nome, classe, taxaFalha }§ em que §taxaFalha§ é a fração de execuções com falha arredondada a 2 casas. §classe§: §"instável"§ se existir **algum commit com resultados mistos** (passou e falhou no **mesmo** código); senão §"quebrado"§ se **todas** as execuções falharam; senão §"estável"§ se todas passaram; senão §"mudou com o código"§ (resultados diferentes só entre commits distintos). Teste com lista vazia → §classe: "sem dados"§ e §taxaFalha: 0§. Devolva a lista ordenada por §taxaFalha§ decrescente e, em empate, por nome.', lang: 'javascript', starter: 'function classificarTestes(historico) {\n  // seu código aqui\n}\n', hints: ['Agrupe as execuções por commit e veja se algum grupo tem ok e !ok.', 'Arredonde com Math.round(x * 100) / 100.'], tests: [{ name: 'classes', code: R`const h = {
  estavel: [{ commit: 'a', ok: true }, { commit: 'b', ok: true }],
  quebrado: [{ commit: 'a', ok: false }, { commit: 'b', ok: false }],
  flaky: [{ commit: 'a', ok: true }, { commit: 'a', ok: false }, { commit: 'b', ok: true }],
  regrediu: [{ commit: 'a', ok: true }, { commit: 'b', ok: false }],
  vazio: []
};
const r = classificarTestes(h);
const por = Object.fromEntries(r.map((x) => [x.nome, x]));
assert.equal(por.estavel.classe, 'estável'); assert.equal(por.quebrado.classe, 'quebrado');
assert.equal(por.flaky.classe, 'instável'); assert.equal(por.regrediu.classe, 'mudou com o código');
assert.equal(por.vazio.classe, 'sem dados'); assert.equal(por.vazio.taxaFalha, 0);` }, { name: 'taxa de falha e ordenação', code: R`const h = { b: [{ commit: 'x', ok: true }, { commit: 'x', ok: false }, { commit: 'x', ok: true }], a: [{ commit: 'x', ok: false }, { commit: 'y', ok: false }], c: [{ commit: 'x', ok: true }] };
assert.deepEqual(classificarTestes(h), [{ nome: 'a', classe: 'quebrado', taxaFalha: 1 }, { nome: 'b', classe: 'instável', taxaFalha: 0.33 }, { nome: 'c', classe: 'estável', taxaFalha: 0 }]);` }, { name: 'empates por nome', code: R`const h = { z: [{ commit: '1', ok: true }, { commit: '1', ok: false }], m: [{ commit: '1', ok: true }, { commit: '1', ok: false }] };
assert.deepEqual(classificarTestes(h).map((x) => x.nome), ['m', 'z']);
assert.deepEqual(classificarTestes({}), []);` }], solution: R`function classificarTestes(historico) {
  const lista = Object.entries(historico).map(([nome, execs]) => {
    if (!execs.length) return { nome, classe: 'sem dados', taxaFalha: 0 };
    const falhas = execs.filter((e) => !e.ok).length;
    const porCommit = {};
    for (const e of execs) { (porCommit[e.commit] = porCommit[e.commit] || new Set()).add(e.ok); }
    const instavel = Object.values(porCommit).some((s) => s.size > 1);
    let classe;
    if (instavel) classe = 'instável';
    else if (falhas === execs.length) classe = 'quebrado';
    else if (falhas === 0) classe = 'estável';
    else classe = 'mudou com o código';
    return { nome, classe, taxaFalha: Math.round((falhas / execs.length) * 100) / 100 };
  });
  return lista.sort((a, b) => b.taxaFalha - a.taxaFalha || (a.nome < b.nome ? -1 : a.nome > b.nome ? 1 : 0));
}
`, explanation: 'Um teste é instável quando o mesmo código produz resultados diferentes; medir isso a partir do histórico transforma a "sensação" de flakiness em dado.' }
]
};

const P = 'testes-frontend-p';
export const assessment = {
  id: 'testes-frontend', title: 'Avaliação final — Testes de frontend', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o tipo de teste ao que ele cobre melhor.', pairs: [['Unitário', 'Lógica pura como validações e cálculos'], ['Integração de componentes com Testing Library', 'Fluxos de UI como a pessoa usuária os realiza'], ['Teste visual', 'Aparência: cores, espaçamentos, temas e larguras'], ['E2E', 'Poucos fluxos críticos no sistema integrado']], explanation: 'Cada nível dá um tipo de confiança a um custo diferente.' },
    { id: P + '2', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual consulta da Testing Library tem a maior prioridade para encontrar um botão?', options: ['getByTestId', 'getByText', 'getByRole com name', 'container.querySelector'], answer: 2, explanation: 'getByRole valida papel e nome acessível ao mesmo tempo.' },
    { id: P + '3', type: 'tf', difficulty: 2, points: 10, prompt: 'Para afirmar que um elemento não existe na tela, usa-se queryBy (que devolve null) e não getBy.', answer: true, explanation: 'getBy lança erro ao não encontrar (medido); queryBy devolve null.' },
    { id: P + '4', type: 'bug', difficulty: 2, points: 10, prompt: 'O teste às vezes passa e às vezes falha. Clique na linha da causa.', code: 'test("salva", async () => {\n  const user = userEvent.setup();\n  render(<Formulario />);\n  user.click(screen.getByRole("button", { name: "Salvar" }));\n  expect(await screen.findByText("Salvo")).toBeInTheDocument();\n});', answer: 4, explanation: 'Falta o await em user.click, e o clique acontece sem a espera da interação.' },
    { id: P + '5', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas com MSW no laboratório.', code: 'GET /api/usuarios responde 500 (server.use): a tela mostra ?\nresposta lenta (delay 150 ms): "Carregando..." dura >= 140 ms? ?', lang: 'text', steps: [{ q: 'Texto do alerta exibido no erro 500:', answers: ['Falha ao carregar', 'falha ao carregar'] }, { q: 'O carregamento durou pelo menos 140 ms (sim/não)?', answers: ['sim'] }], explanation: 'O handler sobrescrito produziu o alerta e o atraso foi respeitado.' },
    { id: P + '6', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a limpeza dos handlers e a espera pelo resultado.', code: 'afterEach(() => server.[[0]]());\nexpect(await screen.[[1]]("Salvo")).toBeInTheDocument();', answers: [['resetHandlers'], ['findByText']], explanation: 'resetHandlers remove as sobrescritas; findByText espera o aparecimento.' },
    { id: P + '7', type: 'mc', difficulty: 3, points: 10, prompt: 'Cobertura de 100% das linhas foi atingida. O que se pode concluir?', options: ['Não há bugs', 'Todas as linhas foram executadas durante os testes, mas isso não prova que o comportamento foi verificado', 'Os testes são de alta qualidade', 'Não é preciso mais testes de componente'], answer: 1, explanation: 'Cobertura mede execução, não verificação.' },
    { id: P + '8', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o problema à correção.', pairs: [['Cache de dados vazando entre testes', 'QueryClient novo por teste, com retry desligado'], ['Teste espera 2 segundos reais', 'Temporizadores falsos'], ['Teste que quebra ao refatorar sem mudar o comportamento', 'Testar comportamento visível, não implementação'], ['Alarmes visuais falsos por ruído de renderização', 'Limiar de comparação e ambiente idêntico']], explanation: 'Cada correção ataca a causa do problema.' },
    { id: P + '9', type: 'tf', difficulty: 2, points: 10, prompt: 'Handlers do MSW que divergem do backend real podem fazer a suíte passar enquanto a tela falha em produção.', answer: true, explanation: 'O MSW devolve o que o handler declara; sem contrato compartilhado, a segurança é falsa.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'DECISÃO — Uma equipe tem 400 testes E2E lentos e instáveis e poucos testes de componente. Qual é o primeiro passo mais adequado?', options: ['Adicionar mais E2E', 'Mover a maior parte dos cenários para testes de componente com MSW, manter E2E só para os fluxos críticos e tratar a instabilidade medindo o histórico', 'Desligar a CI', 'Aumentar os timeouts de todos os testes'], answer: 1, explanation: 'O troféu valoriza integração de componentes; E2E ficam poucos e isolados, com instabilidade medida e corrigida.' },
    { id: P + '11', type: 'mc', difficulty: 3, points: 10, prompt: 'DECISÃO — Qual teste cobre melhor o risco "o botão primário ficou ilegível no tema escuro depois de uma mudança de CSS"?', options: ['Teste de componente com getByRole', 'Teste visual (captura) do componente no tema escuro', 'Teste unitário da função de cor', 'Nenhum teste detecta isso'], answer: 1, explanation: 'O jsdom não calcula estilos aplicados; a regressão visual compara a aparência.' },
    { id: P + '12', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que testes de implementação são prejudiciais e como reescrever um teste que verifica o estado interno de um componente de contador.', model: 'Testes de implementação (estado interno, chamadas de funções internas, classes CSS) quebram em refatorações que preservam o comportamento e podem passar mesmo com a interface errada, o que gera falsos alarmes, desconfiança e medo de refatorar. Um teste que verifica que o estado n vale 1 deve ser reescrito para o comportamento visível: renderizar o contador, clicar com user-event no botão encontrado por getByRole com o nome "Incrementar" e afirmar que o texto "Contagem: 1" aparece (getByText ou toHaveTextContent). Assim o teste só falha se a promessa ao usuário quebrar e continua válido se o estado virar useReducer ou o HTML for reorganizado.', rubric: ['Explica a fragilidade e os falsos alarmes', 'Cita que podem passar com a interface errada', 'Reescreve com getByRole e user-event', 'Verifica o texto visível'], explanation: 'Testar o que a pessoa vê e faz é o princípio da Testing Library.' }
  ]
};

export const project = {
  id: 'suite-de-testes-app', name: 'Suíte de testes de um app existente (React) com componentes, MSW, visual, um fluxo E2E e relatório de estratégia', lv: 'A', stack: 'Vitest, Testing Library, user-event, MSW, jest-axe, Storybook e Playwright', ds: ['fe-test'],
  desc: 'Escolha um **app existente** (o projeto da C2.1, o painel de pedidos da C2.4 ou a loja da C2.5) e construa a **suíte de testes**: **unitários** da lógica pura, **testes de componentes** com Testing Library e user-event (consultas por papel, formulários, teclado, assincronia e acessibilidade com axe), **MSW** para a rede (sucesso, vazio, carregando, erro 500, 422 e falha de rede), **histórias com interação e testes visuais** dos componentes principais, **um fluxo E2E** crítico e um **relatório de estratégia** com métricas (tempo, cobertura de ramos, instabilidade).',
  rf: ['Configuração do Vitest com jsdom, setup com jest-dom e limpeza, e uma função de render personalizada com provedores (QueryClient novo por teste, tema, rota)', 'Testes unitários das funções puras (validação, formatação, reducers e seletores) com tabelas de casos', 'Testes de componentes com getByRole e getByLabelText, user-event com await, esperas por findBy e waitFor, e matchers do jest-dom', 'Teste de formulário completo (validação, erro acessível, envio, estado pendente) e de teclado (ordem do foco, Enter e Esc)', 'MSW com handlers padrão e sobrescritas por teste (500, 422, rede, lentidão), onUnhandledRequest: error e resetHandlers; teste do corpo enviado', 'jest-axe nos componentes principais e um teste que prova que um campo sem rótulo é acusado', 'Histórias do Storybook para os estados principais (padrão, carregando, erro, vazio, tema escuro) com função play em ao menos uma, e capturas visuais em duas larguras', 'Um fluxo E2E em Playwright (por exemplo, login e compra) com localizadores acessíveis e dados isolados', 'Pipeline de CI (esboço executável) com instalação, estático, testes, build e E2E, e relatório de cobertura de ramos com limiar que impede queda'],
  rnf: ['Nenhum teste usa pausas fixas, classes CSS, posições no DOM ou estado interno', 'Cada teste é independente e roda em qualquer ordem', 'Dublês só nas fronteiras (rede, relógio, callbacks)', 'Cada bug encontrado durante o projeto ganha um teste que o reproduz', 'Relatório com a estratégia (níveis, motivos), métricas (tempo, cobertura, instabilidade) e o que não foi testado, sem afirmar o que não foi executado', 'README com os comandos para rodar cada nível'],
  ac: ['A suíte passa de forma determinística em cinco execuções seguidas e em ordem aleatória', 'Um teste prova que o handler sobrescrito de 500 mostra o alerta e outro prova a falha de rede', 'Um teste de acessibilidade falha quando o rótulo de um campo é removido', 'Uma alteração proposital de CSS no botão primário é detectada pelo teste visual', 'O relatório lista os testes por nível com a justificativa e identifica ao menos três lacunas de cobertura de ramos e o plano para tratá-las', 'O pipeline falha quando um teste, o lint ou o limiar de cobertura falham', 'Um histórico de execuções é analisado e nenhum teste fica sem classificação (estável, instável, quebrado)'],
  ch: ['Adicionar testes de mutação em uma função de regra de negócio e analisar os mutantes sobreviventes', 'Executar a suíte com Jest e comparar tempo e configuração com o Vitest', 'Adicionar testes de contrato com um esquema OpenAPI compartilhado com os handlers do MSW', 'Medir e reduzir o tempo da CI com cache e fragmentação', 'Extensão: testes de acessibilidade E2E com axe em páginas reais e em três larguras de tela']
};
