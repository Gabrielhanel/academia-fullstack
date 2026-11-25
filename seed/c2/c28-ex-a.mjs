// C2.8 — Arquitetura frontend: exercícios das aulas 1 a 4.
// Monorepos, bundlers e navegadores não rodam no laboratório (só JavaScript puro): os desafios "code" modelam a lógica (camadas, redação de logs, grafo de pacotes, resolução de remotos).
const R = String.raw;

export const exsetsA = {
'arq-01': [
  { id: 'arq-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a principal vantagem de organizar um frontend grande por funcionalidade (feature) e não por tipo de arquivo?', options: ['Menos arquivos no total', 'O que muda junto fica junto: coesão, propriedade clara por equipe e remoção fácil de uma funcionalidade', 'Dispensa testes', 'Elimina a necessidade de TypeScript'], answer: 1, explanation: 'Uma feature concentra componentes, estado, API e testes, o que reduz o espalhamento de mudanças.' },
  { id: 'arq-01-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a violação à regra que ela quebra.', pairs: [['shared/formatar.js importa features/pedidos', 'Camadas baixas não conhecem as altas'], ['features/pedidos importa features/clientes/internal.js', 'Só se usa a API pública de outro módulo'], ['A importa B e B importa A', 'Sem dependências circulares'], ['Um index.js que reexporta tudo com export *', 'Barrels devem ser enxutos e explícitos']], explanation: 'Regras explícitas de dependência mantêm a arquitetura sob controle.' },
  { id: 'arq-01-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'Uma regra de arquitetura documentada em um README, sem verificação automática, tende a ser mantida pela equipe ao longo do tempo.', answer: false, explanation: 'Regras que não são verificadas pela CI ou pelo lint apodrecem; automatize (por exemplo, com dependency-cruiser).' },
  { id: 'arq-01-e4', type: 'open', difficulty: 3, points: 10, prompt: 'Uma base grande tem violações de fronteira por toda parte. Descreva como introduzir as regras sem parar o produto.', model: 'Aplica-se uma estratégia gradual: primeiro definir as regras (camadas, API pública, sem ciclos) e documentá-las em um ADR. Em seguida, configurar a ferramenta de verificação (dependency-cruiser, lint de fronteiras) e gerar a lista de violações existentes, registrando-a como dívida em uma lista de exceções. A CI passa a falhar para qualquer violação nova, e a lista de exceções só pode diminuir. Corrige-se por etapas, começando pelos módulos mais acoplados ou mais alterados, movendo código comum para camadas inferiores e criando as APIs públicas. Define-se CODEOWNERS por feature para exigir revisão de quem mantém a API. Acompanha-se o número de violações ao longo do tempo.', rubric: ['Define regras e as registra em um ADR', 'Automatiza a verificação e registra as violações existentes como exceções', 'Impede novas violações pela CI', 'Reduz a dívida por etapas com responsáveis e acompanha a evolução'], explanation: 'A arquitetura melhora quando a regra é executável e a dívida só diminui.' },
  { id: 'arq-01-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §verificarCamadas(modulos, camadas)§. §camadas§ é a lista de nomes **do topo para a base** (por exemplo §["app", "pages", "features", "shared"]§). §modulos§ é §{ nome: { camada, feature?, publico?, imports } }§ (§imports§: nomes de módulos). Para cada import: (1) se a camada do alvo estiver **acima** da camada do módulo (índice menor) → violação §"ORIGEM -> ALVO: camada acima"§; (2) senão, se ambos têm §feature§, as features são **diferentes** e o alvo **não** é §publico: true§ → §"ORIGEM -> ALVO: interno de outra feature"§. Devolva a lista de violações **ordenada**. Alvo inexistente → §Error("módulo inexistente: ALVO")§; camada desconhecida em um módulo → §Error("camada desconhecida: C")§.', lang: 'javascript', starter: 'function verificarCamadas(modulos, camadas) {\n  // seu código aqui\n}\n', hints: ['Use camadas.indexOf para comparar as posições.', 'A regra 2 só vale se a regra 1 não se aplicou àquele import.'], tests: [{ name: 'camadas e API pública', code: R`const camadas = ['app', 'pages', 'features', 'shared'];
const m = { 'app/main': { camada: 'app', imports: ['pages/home'] }, 'pages/home': { camada: 'pages', imports: ['features/pedidos/index'] }, 'features/pedidos/index': { camada: 'features', feature: 'pedidos', publico: true, imports: ['features/pedidos/ui', 'shared/fmt'] }, 'features/pedidos/ui': { camada: 'features', feature: 'pedidos', imports: ['shared/fmt'] }, 'shared/fmt': { camada: 'shared', imports: [] } };
assert.deepEqual(verificarCamadas(m, camadas), []);` }, { name: 'violações', code: R`const camadas = ['app', 'pages', 'features', 'shared'];
const m = { 'shared/ruim': { camada: 'shared', imports: ['features/pedidos/index'] }, 'features/pedidos/index': { camada: 'features', feature: 'pedidos', publico: true, imports: ['features/clientes/internal', 'features/clientes/index'] }, 'features/clientes/internal': { camada: 'features', feature: 'clientes', imports: [] }, 'features/clientes/index': { camada: 'features', feature: 'clientes', publico: true, imports: [] } };
assert.deepEqual(verificarCamadas(m, camadas), ['features/pedidos/index -> features/clientes/internal: interno de outra feature', 'shared/ruim -> features/pedidos/index: camada acima']);` }, { name: 'erros', code: R`assert.throws(() => verificarCamadas({ a: { camada: 'app', imports: ['x'] } }, ['app']), 'módulo inexistente: x');
assert.throws(() => verificarCamadas({ a: { camada: 'zzz', imports: [] } }, ['app']), 'camada desconhecida: zzz');` }], solution: R`function verificarCamadas(modulos, camadas) {
  const idx = (c) => { const i = camadas.indexOf(c); if (i < 0) throw new Error('camada desconhecida: ' + c); return i; };
  const out = [];
  for (const [nome, m] of Object.entries(modulos)) {
    const im = idx(m.camada);
    for (const alvo of m.imports || []) {
      const t = modulos[alvo];
      if (!t) throw new Error('módulo inexistente: ' + alvo);
      if (idx(t.camada) < im) out.push(nome + ' -> ' + alvo + ': camada acima');
      else if (m.feature && t.feature && m.feature !== t.feature && !t.publico) out.push(nome + ' -> ' + alvo + ': interno de outra feature');
    }
  }
  return out.sort();
}
`, explanation: 'O verificador codifica as duas regras da aula: dependências sempre para baixo e uso de outra feature apenas pela API pública.' }
],
'arq-02': [
  { id: 'arq-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Por que validar em tempo de execução a resposta de uma API se o projeto usa TypeScript?', options: ['TypeScript é lento', 'Os tipos não existem em execução e o servidor pode devolver outro formato', 'Para evitar usar fetch', 'Porque o React exige'], answer: 1, explanation: 'Tipos são apagados na compilação; um esquema valida os dados reais nas fronteiras.' },
  { id: 'arq-02-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o erro à categoria e ao tratamento.', pairs: [['Sem conexão (offline, timeout)', 'Erro de rede: recuperável, oferecer tentar de novo'], ['422 com campos inválidos', 'Erro de validação: mostrar por campo, não é exceção'], ['404 de um recurso', 'Não encontrado: estado esperado, tela própria'], ['TypeError em um componente', 'Erro inesperado: fronteira de erro, registro e correção']], explanation: 'Um modelo de erros padronizado define categoria, código estável e recuperabilidade.' },
  { id: 'arq-02-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Clique na linha que viola a política de logs seguros.', code: 'try {\n  await login(usuario, senha);\n} catch (e) {\n  logger.error("falha no login", { usuario, senha, erro: e.message });\n}', answer: 4, explanation: 'A senha não deve ser registrada em logs. Redija ou omita campos sensíveis antes de registrar.' },
  { id: 'arq-02-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a validação não lançadora de um esquema Zod.', code: 'const r = Pedido.[[0]](await resposta.json());\nif (!r.[[1]]) throw new ErroDeApp("CONTRATO_INVALIDO", "Resposta inesperada.");', answers: [['safeParse'], ['success']], explanation: 'safeParse devolve um resultado com success em vez de lançar, permitindo registrar os detalhes.' },
  { id: 'arq-02-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §redigir(valor, opcoes)§ para registrar logs sem dados sensíveis. Devolva uma **cópia** (não altere a entrada) em que o valor de qualquer propriedade cujo **nome** case com a expressão §opcoes.padrao§ (padrão §/senha|token|authorization|cartao|cpf|secret/i§) seja substituído por §"[REDIGIDO]"§, em objetos e arrays aninhados. Profundidade acima de §opcoes.max§ (padrão 6) vira §"[PROFUNDO]"§. Referências **circulares** viram §"[CIRCULAR]"§. Valores primitivos, §null§ e §undefined§ passam sem mudança; §Date§ é preservada (nova instância com o mesmo tempo). Strings maiores que §opcoes.tamanho§ (padrão 200) são cortadas e recebem §"…"§ no final.', lang: 'javascript', starter: 'function redigir(valor, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Use um conjunto (Set) de objetos em visita para detectar ciclos.', 'Chame recursivamente com profundidade + 1.'], tests: [{ name: 'campos sensíveis em objetos aninhados', code: R`const entrada = { usuario: 'ana', senha: 'x', cabecalhos: { Authorization: 'Bearer abc', accept: 'json' }, itens: [{ nome: 'a', cartao: '4111' }] };
const copia = JSON.stringify(entrada);
const r = redigir(entrada);
assert.deepEqual(r, { usuario: 'ana', senha: '[REDIGIDO]', cabecalhos: { Authorization: '[REDIGIDO]', accept: 'json' }, itens: [{ nome: 'a', cartao: '[REDIGIDO]' }] });
assert.equal(JSON.stringify(entrada), copia, 'não altera a entrada');
assert.equal(redigir(null), null); assert.equal(redigir(5), 5); assert.equal(redigir('texto'), 'texto');` }, { name: 'profundidade, ciclos, datas e tamanho', code: R`const a = { nome: 'a' }; a.eu = a;
assert.deepEqual(redigir(a), { nome: 'a', eu: '[CIRCULAR]' });
const fundo = { n1: { n2: { n3: { n4: 'x' } } } };
assert.deepEqual(redigir(fundo, { max: 2 }), { n1: { n2: '[PROFUNDO]' } });
const d = redigir({ quando: new Date(1000) });
assert.ok(d.quando instanceof Date); assert.equal(d.quando.getTime(), 1000);
assert.equal(redigir({ t: 'abcdefghij' }, { tamanho: 5 }).t, 'abcde…');` }, { name: 'padrão personalizado', code: R`assert.deepEqual(redigir({ email: 'a@x', senha: 'y' }, { padrao: /email/i }), { email: '[REDIGIDO]', senha: 'y' });` }], solution: R`function redigir(valor, opcoes = {}) {
  const padrao = opcoes.padrao || /senha|token|authorization|cartao|cpf|secret/i;
  const max = opcoes.max ?? 6, tamanho = opcoes.tamanho ?? 200;
  const pilha = new Set();
  const ir = (v, prof) => {
    if (v === null || v === undefined) return v;
    if (typeof v === 'string') return v.length > tamanho ? v.slice(0, tamanho) + '…' : v;
    if (typeof v !== 'object') return v;
    if (v instanceof Date) return new Date(v.getTime());
    if (pilha.has(v)) return '[CIRCULAR]';
    if (prof >= max) return '[PROFUNDO]';
    pilha.add(v);
    const r = Array.isArray(v) ? v.map((x) => ir(x, prof + 1)) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, padrao.test(k) ? '[REDIGIDO]' : ir(x, prof + 1)]));
    pilha.delete(v);
    return r;
  };
  return ir(valor, 0);
}
`, explanation: 'Redigir campos sensíveis (com limites de profundidade, ciclos e tamanho) impede vazamentos em logs e mensagens de erro.' }
],
'arq-03': [
  { id: 'arq-03-e1', type: 'trace', difficulty: 2, points: 10, prompt: 'Medidas do Turborepo 2.11.13 no laboratório (4 pacotes; grafo: utils <- ui <- web; utils <- admin; cada build leva ~1,5 s).', code: '1) build frio: ? em cache\n2) mesmo código de novo: ? em cache\n3) mudou packages/utils: ? em cache\n4) mudou só packages/ui: ? em cache', lang: 'text', steps: [{ q: 'Pacotes em cache no build frio:', answers: ['0'] }, { q: 'Pacotes em cache sem nenhuma mudança:', answers: ['4'] }, { q: 'Pacotes em cache depois de mudar utils:', answers: ['0'] }, { q: 'Pacotes em cache depois de mudar só ui:', answers: ['2'] }], explanation: 'Mudar o pacote base invalida todos os dependentes; mudar uma folha invalida pouco (utils e admin continuaram em cache).' },
  { id: 'arq-03-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o campo do turbo.json ao significado.', pairs: [['dependsOn: ["^build"]', 'Executar antes o build das dependências do pacote'], ['inputs', 'Arquivos que, se mudarem, invalidam o cache'], ['outputs', 'Arquivos a guardar e restaurar do cache'], ['--filter="...[HEAD^1]"', 'Projetos alterados desde o commit anterior e seus dependentes']], explanation: 'A configuração das tarefas define a ordem e o hash de cache.' },
  { id: 'arq-03-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'Um monorepo compensa para qualquer projeto, inclusive um único app pequeno de uma só equipe.', answer: false, explanation: 'O monorepo compensa quando há código compartilhado, várias aplicações relacionadas e equipes que colaboram; senão acrescenta ferramentas sem ganho.' },
  { id: 'arq-03-e4', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §projetosAfetados(grafo, mudados)§. §grafo§ é §{ projeto: [dependências] }§ (cada projeto lista os projetos de que **depende**). Devolva a lista **ordenada** dos projetos **afetados**: os §mudados§ e todos os projetos que **dependem deles**, direta ou transitivamente. Projeto mudado inexistente → §Error("projeto inexistente: P")§; dependência que não é chave do grafo → §Error("dependência inexistente: D")§. Ciclos devem ser tolerados (sem laço infinito).', lang: 'javascript', starter: 'function projetosAfetados(grafo, mudados) {\n  // seu código aqui\n}\n', hints: ['Inverta o grafo (quem depende de quem).', 'Faça uma busca a partir dos mudados no grafo invertido.'], tests: [{ name: 'medido no laboratório', code: R`const g = { utils: [], ui: ['utils'], web: ['ui', 'utils'], admin: ['utils'] };
assert.deepEqual(projetosAfetados(g, ['ui']), ['ui', 'web']);
assert.deepEqual(projetosAfetados(g, ['utils']), ['admin', 'ui', 'utils', 'web']);
assert.deepEqual(projetosAfetados(g, ['admin']), ['admin']);
assert.deepEqual(projetosAfetados(g, []), []);` }, { name: 'erros e ciclos', code: R`assert.throws(() => projetosAfetados({ a: [] }, ['z']), 'projeto inexistente: z');
assert.throws(() => projetosAfetados({ a: ['b'] }, ['a']), 'dependência inexistente: b');
assert.deepEqual(projetosAfetados({ a: ['b'], b: ['a'], c: ['b'] }, ['a']), ['a', 'b', 'c']);` }], solution: R`function projetosAfetados(grafo, mudados) {
  const dependentes = {};
  for (const p of Object.keys(grafo)) dependentes[p] = [];
  for (const [p, deps] of Object.entries(grafo)) for (const d of deps) { if (!(d in grafo)) throw new Error('dependência inexistente: ' + d); dependentes[d].push(p); }
  const afetados = new Set();
  const pilha = [];
  for (const m of mudados) { if (!(m in grafo)) throw new Error('projeto inexistente: ' + m); pilha.push(m); }
  while (pilha.length) {
    const p = pilha.pop();
    if (afetados.has(p)) continue;
    afetados.add(p);
    for (const d of dependentes[p]) pilha.push(d);
  }
  return [...afetados].sort();
}
`, explanation: 'Os projetos afetados são os mudados e seus dependentes transitivos: um percurso no grafo invertido, como no turbo run --filter e no nx affected.' },
  { id: 'arq-03-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §ordemDeBuild(grafo)§. §grafo§ é §{ projeto: [dependências] }§. Devolva uma lista de **níveis** (cada nível uma lista **ordenada** de projetos): o nível de um projeto é §0§ se não tem dependências, senão §1 + maior nível entre suas dependências§. Projetos do mesmo nível podem ser construídos **em paralelo**. Dependência inexistente → §Error("dependência inexistente: D")§; ciclo → §Error("ciclo detectado")§.', lang: 'javascript', starter: 'function ordemDeBuild(grafo) {\n  // seu código aqui\n}\n', hints: ['Calcule o nível com recursão e memória (memoização).', 'Marque os projetos em visita para detectar ciclos.'], tests: [{ name: 'níveis do laboratório', code: R`const g = { utils: [], ui: ['utils'], web: ['ui', 'utils'], admin: ['utils'] };
assert.deepEqual(ordemDeBuild(g), [['utils'], ['admin', 'ui'], ['web']]);
assert.deepEqual(ordemDeBuild({ a: [], b: [], c: [] }), [['a', 'b', 'c']]);
assert.deepEqual(ordemDeBuild({}), []);` }, { name: 'ciclo e dependência inexistente', code: R`assert.throws(() => ordemDeBuild({ a: ['b'], b: ['a'] }), 'ciclo detectado');
assert.throws(() => ordemDeBuild({ a: ['x'] }), 'dependência inexistente: x');
assert.throws(() => ordemDeBuild({ a: ['a'] }), 'ciclo detectado');` }], solution: R`function ordemDeBuild(grafo) {
  const nivel = {}, visita = new Set();
  const calc = (p) => {
    if (p in nivel) return nivel[p];
    if (visita.has(p)) throw new Error('ciclo detectado');
    visita.add(p);
    let n = 0;
    for (const d of grafo[p]) { if (!(d in grafo)) throw new Error('dependência inexistente: ' + d); n = Math.max(n, calc(d) + 1); }
    visita.delete(p);
    nivel[p] = n;
    return n;
  };
  const niveis = [];
  for (const p of Object.keys(grafo)) { const n = calc(p); (niveis[n] = niveis[n] || []).push(p); }
  return niveis.map((l) => l.sort());
}
`, explanation: 'A ordem de build é uma ordenação topológica por níveis; pacotes do mesmo nível rodam em paralelo e ciclos impedem a ordenação.' }
],
'arq-04': [
  { id: 'arq-04-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é o principal problema que os microfrontends tentam resolver?', options: ['Deixar o JavaScript menor', 'A coordenação entre muitas equipes: autonomia para desenvolver e implantar partes independentes', 'Eliminar o uso de React', 'Melhorar a nota do Lighthouse'], answer: 1, explanation: 'O ganho é organizacional; tecnicamente costumam aumentar a complexidade e o custo de desempenho.' },
  { id: 'arq-04-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a abordagem de integração à característica.', pairs: [['Pacotes npm no build', 'Simples e eficiente, mas sem implantação independente'], ['Carregamento em execução (Module Federation)', 'Implantação independente com compartilhamento de dependências'], ['iframe', 'Isolamento forte, mas custos de acessibilidade, URL e comunicação'], ['Web Component', 'Elemento independente de framework, com Shadow DOM'], ['Composição no servidor/edge', 'Bom desempenho inicial e SEO, com mais infraestrutura']], explanation: 'Cada abordagem troca isolamento, desempenho, independência e complexidade.' },
  { id: 'arq-04-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'Dividir os microfrontends por camada técnica (um para o cabeçalho, outro para a lista) reduz a coordenação entre as equipes mais do que dividir por domínio de negócio.', answer: false, explanation: 'Fatias horizontais criam dependências constantes; fatias verticais por domínio reduzem a coordenação.' },
  { id: 'arq-04-e4', type: 'open', difficulty: 3, points: 10, prompt: 'Liste cinco preocupações transversais de uma arquitetura de microfrontends e como tratar cada uma.', model: 'Consistência visual: design system compartilhado como pacote versionado e tokens de design. Estilos: isolamento por CSS Modules, prefixos ou Shadow DOM para um CSS não vazar para outro. Roteamento: o shell roteia por prefixo de domínio e a URL é o contrato mais estável entre partes. Autenticação: o shell autentica e fornece a sessão ou o token; os microfrontends não implementam login. Desempenho: compartilhar dependências pesadas (React) como singletons, medir o JavaScript total e orçar o peso por parte. Versões e contratos: contratos versionados com testes de contrato e deploys compatíveis. Observabilidade: logs e traces com identificador do microfrontend e da versão. Testes: cada parte isolada e E2E dos fluxos que cruzam partes.', rubric: ['Lista cinco preocupações pertinentes', 'Propõe um tratamento para cada uma', 'Inclui consistência visual ou design system', 'Inclui desempenho ou dependências compartilhadas'], explanation: 'As preocupações transversais são onde os microfrontends costumam falhar.' },
  { id: 'arq-04-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §resolverRemoto(config, ambiente, saude)§. §config§ é §{ nome, urls, anterior?, fallbackLocal? }§ (§urls§: objeto com a URL por ambiente; §anterior§: URL da versão anterior; §fallbackLocal§: booleano). §saude(url)§ é uma função que devolve §true§ se a URL responde. Regras: (1) ambiente sem URL em §urls§ → §Error("ambiente desconhecido: AMB")§; (2) se §saude(urls[ambiente])§ → §{ url, origem: "principal" }§; (3) senão, se houver §anterior§ e §saude(anterior)§ → §{ url: anterior, origem: "versao-anterior" }§; (4) senão, se §fallbackLocal§ → §{ url: null, origem: "fallback-local" }§; (5) senão §Error("remoto indisponível: NOME")§. Não chame §saude§ mais do que o necessário (curto-circuito).', lang: 'javascript', starter: 'function resolverRemoto(config, ambiente, saude) {\n  // seu código aqui\n}\n', hints: ['Teste primeiro a existência da URL do ambiente.', 'Chame saude apenas quando a etapa anterior falhou.'], tests: [{ name: 'principal, anterior e fallback', code: R`const cfg = { nome: 'catalogo', urls: { producao: 'https://c.exemplo/v5/remoteEntry.js', homologacao: 'https://h.exemplo/remoteEntry.js' }, anterior: 'https://c.exemplo/v4/remoteEntry.js', fallbackLocal: true };
assert.deepEqual(resolverRemoto(cfg, 'producao', () => true), { url: 'https://c.exemplo/v5/remoteEntry.js', origem: 'principal' });
assert.deepEqual(resolverRemoto(cfg, 'producao', (u) => u.includes('/v4/')), { url: 'https://c.exemplo/v4/remoteEntry.js', origem: 'versao-anterior' });
assert.deepEqual(resolverRemoto(cfg, 'producao', () => false), { url: null, origem: 'fallback-local' });` }, { name: 'erros e curto-circuito', code: R`const cfg = { nome: 'conta', urls: { producao: 'https://x/remoteEntry.js' } };
assert.throws(() => resolverRemoto(cfg, 'staging', () => true), 'ambiente desconhecido: staging');
assert.throws(() => resolverRemoto(cfg, 'producao', () => false), 'remoto indisponível: conta');
let chamadas = 0; resolverRemoto(cfg, 'producao', () => { chamadas++; return true; });
assert.equal(chamadas, 1);
let c2 = 0; assert.throws(() => resolverRemoto({ nome: 'z', urls: { producao: 'u' }, anterior: 'v' }, 'producao', () => { c2++; return false; }), 'remoto indisponível');
assert.equal(c2, 2);` }], solution: R`function resolverRemoto(config, ambiente, saude) {
  const url = config.urls && config.urls[ambiente];
  if (!url) throw new Error('ambiente desconhecido: ' + ambiente);
  if (saude(url)) return { url, origem: 'principal' };
  if (config.anterior && saude(config.anterior)) return { url: config.anterior, origem: 'versao-anterior' };
  if (config.fallbackLocal) return { url: null, origem: 'fallback-local' };
  throw new Error('remoto indisponível: ' + config.nome);
}
`, explanation: 'A resolução por ambiente com versão anterior e alternativa local evita que a falha de um remoto derrube a página e permite voltar versões.' }
]
};
