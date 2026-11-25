// C2.5 — Next.js: exercícios das aulas 1 a 6.
// Next.js não roda no laboratório (só JavaScript puro): os desafios "code" modelam a lógica (rotas, serialização, fronteira, cache, Actions).
const R = String.raw;

export const exsetsA = {
'nxt-01': [
  { id: 'nxt-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual arquivo torna uma pasta de §app/§ uma rota pública?', options: ['layout.js', 'page.js (ou route.js)', 'index.js', 'loading.js'], answer: 1, explanation: 'Só pastas com page (ou route) respondem a URLs; os demais arquivos de convenção compõem a interface.' },
  { id: 'nxt-01-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o arquivo de convenção ao seu papel.', pairs: [['layout', 'Interface compartilhada que preserva estado na navegação'], ['template', 'Como o layout, mas remonta a cada navegação'], ['loading', 'Fronteira de Suspense do segmento'], ['error', 'Fronteira de erro (Client Component)'], ['not-found', 'Interface para notFound() e rotas inexistentes']], explanation: 'Cada convenção monta uma parte da árvore de interface do segmento.' },
  { id: 'nxt-01-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O botão "Tentar de novo" do §error.js§ não funciona e o build reclama. Clique na linha que falta.', code: 'export default function Error({ error, reset }) {\n  return <div role="alert">\n    <button onClick={() => reset()}>Tentar de novo</button>\n  </div>;\n}', answer: 1, explanation: 'Fronteiras de erro precisam ser Client Components: falta a diretiva "use client" no topo do arquivo.' },
  { id: 'nxt-01-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Na navegação entre duas páginas irmãs que compartilham um layout, o layout é renderizado de novo e perde o estado.', answer: false, explanation: 'Layouts preservam o estado e não renderizam de novo; só a parte que muda é trocada. Quem remonta é o template.' },
  { id: 'nxt-01-e5', type: 'code', difficulty: 2, points: 25, prompt: 'Implemente §mapearRotas(arquivos)§: recebe caminhos de arquivos dentro de §app/§ (por exemplo §"blog/[slug]/page.js"§) e devolve a lista **ordenada alfabeticamente** das URLs públicas. Só arquivos §page.js§ ou §route.js§ (também .ts/.tsx/.jsx) geram URL. Regras: o segmento raiz vira §"/"§; grupos §(nome)§ saem da URL; pastas privadas §_nome§ (e tudo dentro) não geram rotas; slots §@nome§ não geram rota própria (ignore o arquivo); URLs duplicadas devem lançar §Error("rota duplicada: URL")§.', lang: 'javascript', starter: 'function mapearRotas(arquivos) {\n  // seu código aqui\n}\n', hints: ['Separe o caminho por "/" e remova o último segmento (o arquivo).', 'Filtre os segmentos que começam com ( e terminam com ).'], tests: [{ name: 'convenções básicas', code: R`assert.deepEqual(mapearRotas(['page.js', 'blog/[slug]/page.js', 'api/ola/route.js', 'blog/layout.js', 'blog/loading.js']), ['/', '/api/ola', '/blog/[slug]']);` }, { name: 'grupos, privadas e slots', code: R`assert.deepEqual(mapearRotas(['(marketing)/sobre/page.tsx', '_componentes/botao/page.js', 'galeria/@modal/(.)foto/[id]/page.js', 'galeria/page.js']), ['/galeria', '/sobre']);` }, { name: 'duplicadas', code: R`assert.throws(() => mapearRotas(['(a)/x/page.js', '(b)/x/page.js']), 'rota duplicada: /x');` }], solution: R`function mapearRotas(arquivos) {
  const urls = new Set();
  for (const arq of arquivos) {
    const partes = arq.split('/');
    const nome = partes.pop();
    if (!/^(page|route)\.(js|jsx|ts|tsx)$/.test(nome)) continue;
    if (partes.some((p) => p.startsWith('_') || p.startsWith('@'))) continue;
    const url = '/' + partes.filter((p) => !(p.startsWith('(') && p.endsWith(')'))).join('/');
    if (urls.has(url)) throw new Error('rota duplicada: ' + url);
    urls.add(url);
  }
  return [...urls].sort();
}
`, explanation: 'O mapeamento reproduz as regras do App Router: só page e route geram URL, grupos saem da URL e pastas privadas e slots não geram rota.' }
],
'nxt-02': [
  { id: 'nxt-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Com §generateStaticParams§ listando só §a§ e §b§ e §dynamicParams§ no padrão, o que respondeu a requisição de §/blog/c§ no laboratório?', options: ['404', 'HTTP 200: a página foi gerada sob demanda', '500', 'Um redirecionamento para /blog/a'], answer: 1, explanation: 'Por padrão dynamicParams é verdadeiro: parâmetros fora da lista são gerados na primeira requisição. Com dynamicParams = false seria 404.' },
  { id: 'nxt-02-e2', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete a página dinâmica das versões recentes.', code: 'export default async function Post({ params }) {\n  const { slug } = [[0]] params;\n  if (!/^[a-z0-9-]+$/.test(slug)) [[1]]();\n  return <h1>{slug}</h1>;\n}', answers: [['await'], ['notFound']], explanation: 'params é uma promise e notFound() devolve 404 de verdade para parâmetros inválidos.' },
  { id: 'nxt-02-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a convenção de pasta ao efeito.', pairs: [['(grupo)', 'Organiza sem alterar a URL'], ['_pasta', 'Privada: fora do roteamento'], ['@slot', 'Rota paralela renderizada ao lado do conteúdo'], ['(.)pasta', 'Rota interceptada (por exemplo, modal)'], ['[[...partes]]', 'Catch-all opcional']], explanation: 'Cada convenção de nome muda como a pasta participa do roteamento.' },
  { id: 'nxt-02-e4', type: 'open', difficulty: 3, points: 10, prompt: 'Explique como implementar um modal de foto com URL compartilhável usando rotas paralelas e interceptadas e que cuidados de acessibilidade são necessários.', model: 'Cria-se um slot paralelo @modal no layout da galeria, recebido como prop e renderizado junto de children, com um default.js que devolve null. Dentro do slot, uma rota interceptada (.)foto/[id] captura a navegação no cliente para /galeria/foto/[id] e renderiza a foto em um modal por cima da lista; a página completa em galeria/foto/[id]/page.js atende o link direto e o recarregamento. Assim o modal tem URL, o botão voltar o fecha e o link pode ser compartilhado. Acessibilidade: usar um elemento de diálogo (role dialog com aria-modal e rótulo), mover o foco para o modal ao abrir e devolvê-lo ao elemento de origem ao fechar, fechar com Esc, prender o foco enquanto aberto e impedir a rolagem do fundo.', rubric: ['Descreve o slot @modal e o default.js', 'Descreve a rota interceptada e a página completa para link direto', 'Explica o benefício da URL e do botão voltar', 'Cita foco, Esc e papel de diálogo'], explanation: 'A rota interceptada dá endereço ao modal, mas a acessibilidade do diálogo continua sendo responsabilidade do código.' },
  { id: 'nxt-02-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §casarRota(padrao, url)§: devolve o objeto de parâmetros ou §null§ se não casar. Segmentos: §[x]§ casa um segmento (texto); §[...x]§ (catch-all) casa **um ou mais** segmentos e devolve um array; §[[...x]]§ casa **zero ou mais** (array, possivelmente vazio); segmentos literais casam exatamente. Ignore barras repetidas no início e no fim. Um catch-all só pode ser o **último** segmento do padrão; caso contrário lance §Error("catch-all deve ser o último")§. Os valores devem ser decodificados com §decodeURIComponent§.', lang: 'javascript', starter: 'function casarRota(padrao, url) {\n  // seu código aqui\n}\n', hints: ['Divida o padrão e a URL em segmentos e percorra o padrão.', 'Trate o catch-all consumindo o resto dos segmentos da URL.'], tests: [{ name: 'segmentos simples e literais', code: R`assert.deepEqual(casarRota('/blog/[slug]', '/blog/ola-mundo'), { slug: 'ola-mundo' });
assert.deepEqual(casarRota('/produtos/[id]/avaliacoes', '/produtos/42/avaliacoes/'), { id: '42' });
assert.equal(casarRota('/blog/[slug]', '/blog'), null);
assert.equal(casarRota('/blog/[slug]', '/blog/a/b'), null);
assert.equal(casarRota('/blog/[slug]', '/loja/a'), null);
assert.deepEqual(casarRota('/blog/[slug]', '/blog/caf%C3%A9'), { slug: 'café' });` }, { name: 'catch-all e opcional', code: R`assert.deepEqual(casarRota('/docs/[...partes]', '/docs/a/b/c'), { partes: ['a', 'b', 'c'] });
assert.equal(casarRota('/docs/[...partes]', '/docs'), null);
assert.deepEqual(casarRota('/docs/[[...partes]]', '/docs'), { partes: [] });
assert.deepEqual(casarRota('/docs/[[...partes]]', '/docs/x'), { partes: ['x'] });` }, { name: 'catch-all fora do fim', code: R`assert.throws(() => casarRota('/a/[...x]/b', '/a/1/b'), 'catch-all deve ser o último');` }], solution: R`function casarRota(padrao, url) {
  const seg = (s) => s.split('/').filter(Boolean);
  const p = seg(padrao), u = seg(url), params = {};
  p.forEach((s, i) => { if ((/^\[\[?\.\.\./.test(s)) && i !== p.length - 1) throw new Error('catch-all deve ser o último'); });
  for (let i = 0; i < p.length; i++) {
    const s = p[i];
    const m = /^\[\[\.\.\.(\w+)\]\]$/.exec(s), c = /^\[\.\.\.(\w+)\]$/.exec(s), d = /^\[(\w+)\]$/.exec(s);
    if (m) { params[m[1]] = u.slice(i).map(decodeURIComponent); return params; }
    if (c) { const resto = u.slice(i); if (!resto.length) return null; params[c[1]] = resto.map(decodeURIComponent); return params; }
    if (u[i] === undefined) return null;
    if (d) params[d[1]] = decodeURIComponent(u[i]);
    else if (s !== u[i]) return null;
  }
  return u.length === p.length ? params : null;
}
`, explanation: 'O casamento percorre o padrão: segmentos dinâmicos capturam um valor, catch-alls consomem o restante (um ou mais; ou zero ou mais no opcional) e literais precisam ser iguais.' }
],
'nxt-03': [
  { id: 'nxt-03-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual destes recursos NÃO pode ser usado em um Server Component?', options: ['await dentro do componente', 'Acessar um banco de dados', 'useState', 'Ler variáveis de ambiente do servidor'], answer: 2, explanation: 'Estado, efeitos e eventos pertencem a Client Components; Server Components podem ser assíncronos e acessar dados e segredos.' },
  { id: 'nxt-03-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'O build falha ao passar uma prop do servidor para o cliente. Clique na linha que passa algo não serializável.', code: 'import { Grafico } from "./grafico";\nexport default function Page() {\n  const dados = { a: 1, rotulos: ["x", "y"] };\n  return <Grafico dados={dados} formatar={(n) => n + "%"} />;\n}', answer: 4, explanation: 'Funções comuns não atravessam a fronteira servidor-cliente (só Server Actions). Passe um valor (como o sufixo "%") ou defina a função no componente de cliente.' },
  { id: 'nxt-03-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'Variáveis de ambiente sem o prefixo §NEXT_PUBLIC_§ viram texto vazio no código do cliente.', answer: true, explanation: 'Só as com prefixo NEXT_PUBLIC_ são incluídas no pacote do cliente (no build); as demais ficam no servidor.' },
  { id: 'nxt-03-e4', type: 'trace', difficulty: 2, points: 10, prompt: 'Cada busca leva 100 ms. O componente §Pai§ busca A e só então renderiza §Filho§, que busca B. No segundo cenário as duas buscas começam juntas com §Promise.all§.', code: 'cascata:  Pai(100 ms) -> Filho(100 ms)\nparalelo: Promise.all([A, B])', lang: 'text', steps: [{ q: 'Tempo total na cascata (ms):', answers: ['200'] }, { q: 'Tempo total em paralelo (ms):', answers: ['100'] }], explanation: 'A cascata soma as buscas; o paralelo custa o tempo da mais lenta.' },
  { id: 'nxt-03-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §verificarSerializavel(valor)§: percorre o valor (objetos e arrays aninhados) e devolve a lista de **caminhos** dos itens que não atravessam a fronteira servidor-cliente. São permitidos: §null§, §undefined§, strings, números, booleanos, §bigint§, §Date§, arrays e objetos simples (protótipo §Object.prototype§ ou §null§). **Não** são permitidos: funções (a menos que tenham a propriedade §$$ehAction === true§, representando uma Server Action), símbolos e instâncias de classes (protótipo diferente de Object e Date). Caminhos no formato §"dados.itens[1].fn"§ (a raiz é §"raiz"§ quando o próprio valor é inválido). A ordem é a de percorrer as chaves. Referências circulares devem ser relatadas **uma vez** com o sufixo §" (circular)"§ no caminho em que a repetição ocorre, sem laço infinito.', lang: 'javascript', starter: 'function verificarSerializavel(valor) {\n  // seu código aqui\n}\n', hints: ['Use uma pilha (Set) dos objetos em visita para detectar ciclos.', 'Monte o caminho com "." para propriedades e [i] para índices.'], tests: [{ name: 'valores aceitos', code: R`const ok = { a: 1, b: 's', c: [1, { d: null }], e: new Date(0), f: undefined, g: 10n, act: Object.assign(() => {}, { $$ehAction: true }) };
assert.deepEqual(verificarSerializavel(ok), []);
assert.deepEqual(verificarSerializavel(Object.create(null)), []);` }, { name: 'funções, símbolos e classes', code: R`class Usuario { constructor() { this.n = 1; } }
const v = { dados: { itens: [1, () => 1], u: new Usuario(), s: Symbol('x') } };
assert.deepEqual(verificarSerializavel(v), ['dados.itens[1]', 'dados.u', 'dados.s']);
assert.deepEqual(verificarSerializavel(() => 1), ['raiz']);` }, { name: 'circular', code: R`const a = { nome: 'a' }; a.eu = a;
assert.deepEqual(verificarSerializavel({ a }), ['a.eu (circular)']);` }], solution: R`function verificarSerializavel(valor) {
  const erros = [];
  const pilha = new Set();
  const visitar = (v, caminho) => {
    if (v === null || v === undefined) return;
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean' || t === 'bigint') return;
    if (t === 'symbol') { erros.push(caminho); return; }
    if (t === 'function') { if (v.$$ehAction !== true) erros.push(caminho); return; }
    if (v instanceof Date) return;
    if (pilha.has(v)) { erros.push(caminho + ' (circular)'); return; }
    const proto = Object.getPrototypeOf(v);
    if (!Array.isArray(v) && proto !== Object.prototype && proto !== null) { erros.push(caminho); return; }
    pilha.add(v);
    if (Array.isArray(v)) v.forEach((x, i) => visitar(x, caminho + '[' + i + ']'));
    else for (const k of Object.keys(v)) visitar(v[k], caminho === 'raiz' ? k : caminho + '.' + k);
    pilha.delete(v);
  };
  visitar(valor, 'raiz');
  return erros;
}
`, explanation: 'O verificador aplica a regra "isto cabe em JSON?" ampliada pelo React (Date, bigint, Server Actions) e acusa funções, símbolos, instâncias de classe e ciclos.' }
],
'nxt-04': [
  { id: 'nxt-04-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é a forma correta de usar um Server Component dentro de um Client Component?', options: ['Importá-lo diretamente dentro do Client Component', 'Recebê-lo como children (ou prop) de um componente de servidor que o criou', 'Marcar o Server Component com use client', 'Não é possível'], answer: 1, explanation: 'O elemento foi criado no servidor; o componente de cliente apenas o posiciona. Importar o módulo o colocaria no pacote do cliente.' },
  { id: 'nxt-04-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Client Components são renderizados apenas no navegador, nunca no servidor.', answer: false, explanation: 'Eles também são pré-renderizados no servidor (HTML inicial) e depois hidratados no navegador.' },
  { id: 'nxt-04-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Depois de envolver o app em um provedor, o JavaScript inicial triplicou. Clique na linha que causa isso.', code: '// app/layout.js\n"use client";\nimport { Provedores } from "./provedores";\nexport default function Layout({ children }) {\n  return <html><body><Provedores>{children}</Provedores></body></html>;\n}', answer: 2, explanation: 'Marcar o layout inteiro como cliente puxa tudo para o pacote do cliente. Deixe o layout como Server Component e marque só o arquivo do provedor, que recebe children.' },
  { id: 'nxt-04-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o provedor de cliente com uma única instância por árvore.', code: '[[0]]\nexport function Provedores({ children }) {\n  const [client] = useState(() => new QueryClient());\n  return <QueryClientProvider client={client}>{[[1]]}</QueryClientProvider>;\n}', answers: [['"use client"', '\'use client\'', 'use client'], ['children']], explanation: 'A diretiva marca o módulo como cliente e children chega pronto do servidor, mantendo as páginas como Server Components.' },
  { id: 'nxt-04-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §analisarFronteira(modulos)§. §modulos§ é um objeto §{ nome: { cliente?: true, somenteServidor?: true, imports: [nomes] } }§. Os **pontos de entrada do cliente** são os módulos com §cliente: true§. O pacote do cliente contém esses módulos e **tudo o que importam, transitivamente** (mesmo sem a diretiva). Devolva §{ pacote: [...], erros: [...] }§: §pacote§ ordenado alfabeticamente; §erros§ lista, ordenada, strings §"NOME importa módulo somenteServidor: ALVO"§ para cada módulo do pacote que importa (diretamente) um módulo com §somenteServidor: true§ (esse módulo não entra no pacote). Imports de módulos inexistentes devem lançar §Error("módulo inexistente: ALVO")§. Ciclos de importação devem ser tratados sem laço infinito.', lang: 'javascript', starter: 'function analisarFronteira(modulos) {\n  // seu código aqui\n}\n', hints: ['Faça uma busca em profundidade a partir de cada módulo cliente.', 'Quando encontrar um import somenteServidor, registre o erro e não entre nele.'], tests: [{ name: 'pacote transitivo e módulos de servidor fora', code: R`const m = { 'botao': { cliente: true, imports: ['util', 'icone'] }, 'util': { imports: [] }, 'icone': { imports: ['util'] }, 'pagina': { imports: ['botao', 'dados'] }, 'dados': { somenteServidor: true, imports: [] } };
assert.deepEqual(analisarFronteira(m), { pacote: ['botao', 'icone', 'util'], erros: [] });` }, { name: 'erro ao importar módulo somente servidor', code: R`const m = { 'form': { cliente: true, imports: ['db', 'fmt'] }, 'db': { somenteServidor: true, imports: [] }, 'fmt': { imports: ['db'] } };
assert.deepEqual(analisarFronteira(m), { pacote: ['fmt', 'form'], erros: ['fmt importa módulo somenteServidor: db', 'form importa módulo somenteServidor: db'] });` }, { name: 'ciclos e inexistentes', code: R`const c = { 'a': { cliente: true, imports: ['b'] }, 'b': { imports: ['a'] } };
assert.deepEqual(analisarFronteira(c), { pacote: ['a', 'b'], erros: [] });
assert.throws(() => analisarFronteira({ 'x': { cliente: true, imports: ['y'] } }), 'módulo inexistente: y');` }], solution: R`function analisarFronteira(modulos) {
  const pacote = new Set(), erros = new Set();
  const visitar = (nome) => {
    if (pacote.has(nome)) return;
    pacote.add(nome);
    for (const alvo of modulos[nome].imports || []) {
      const m = modulos[alvo];
      if (!m) throw new Error('módulo inexistente: ' + alvo);
      if (m.somenteServidor) { erros.add(nome + ' importa módulo somenteServidor: ' + alvo); continue; }
      visitar(alvo);
    }
  };
  for (const [nome, m] of Object.entries(modulos)) if (m.cliente) visitar(nome);
  return { pacote: [...pacote].sort(), erros: [...erros].sort() };
}
`, explanation: 'A diretiva use client marca uma fronteira de módulos: tudo que o módulo cliente importa vai ao pacote, e importar um módulo exclusivo de servidor é erro.' }
],
'nxt-05': [
  { id: 'nxt-05-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Com Cache Components, como se trata um componente que precisa de dados atualizados a cada requisição?', options: ['Coloca-se use cache nele com cacheLife("seconds")', 'Envolve-se em Suspense com um fallback, sem cache, para ser transmitido depois do shell', 'Marca-se o layout inteiro como dinâmico', 'Move-se para o cliente'], answer: 1, explanation: 'O conteúdo dinâmico fica dentro de Suspense: o fallback faz parte do shell estático e a parte dinâmica chega por streaming (medido: primeiro byte em 17 ms, total 1,53 s).' },
  { id: 'nxt-05-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a função ao efeito.', pairs: [['cacheLife', 'Define stale, revalidate e expire da entrada'], ['cacheTag', 'Etiqueta a entrada para invalidação sob demanda'], ['updateTag', 'Expira a tag imediatamente (só em Server Actions)'], ['revalidateTag', 'Stale-while-revalidate (Actions e Route Handlers)'], ['revalidatePath', 'Invalida o que está associado a uma rota']], explanation: 'Prefira tags a caminhos para invalidar com precisão.' },
  { id: 'nxt-05-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Cada pessoa vê o carrinho de quem acessou a página primeiro. Clique na linha da causa.', code: 'async function getCarrinho() {\n  "use cache";\n  cacheLife("minutes");\n  const id = (await cookies()).get("usuario")?.value;\n  return db.carrinhos.buscar(id);\n}', answer: 4, explanation: 'Dentro do escopo cacheado não se lê cookies(); além disso, o cache é compartilhado e a chave não incluiria o usuário. Leia o id fora e passe-o como argumento (ele entra na chave) ou não cacheie dados pessoais.' },
  { id: 'nxt-05-e4', type: 'tf', difficulty: 2, points: 5, prompt: '§updateTag§ pode ser usado em Route Handlers; §revalidateTag§ só em Server Actions.', answer: false, explanation: 'É o contrário: updateTag só em Server Actions; revalidateTag em Actions e Route Handlers.' },
  { id: 'nxt-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Um blog usa um CMS. Desenhe a estratégia de cache e de atualização das páginas de posts, indicando as funções usadas, o tempo de vida e como o autor vê a publicação.', model: 'A função que lista e busca os posts usa use cache com cacheLife longo (por exemplo, max ou hours) e cacheTag("posts") (e uma tag por post, como post-ID, se for útil). Assim as páginas entram no shell estático e são servidas do cache. Quando o autor publica no CMS, um webhook chama um Route Handler protegido por assinatura que executa revalidateTag("posts", "max"): o conteúdo antigo é servido enquanto o novo é gerado em segundo plano. Se a publicação ocorrer por uma Server Action do próprio app (editor interno), usa-se updateTag para que quem publicou veja o resultado imediatamente. A parte realmente dinâmica (comentários, contagem de visitas) fica em Suspense, sem cache. Não se cacheia nada específico do usuário.', rubric: ['Usa use cache com cacheLife e cacheTag', 'Usa revalidateTag em webhook e updateTag em Server Action', 'Protege o webhook', 'Isola o conteúdo dinâmico em Suspense'], explanation: 'Cache longo com invalidação por evento dá velocidade e frescor sem recomputar.' },
  { id: 'nxt-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarCacheNext(agora)§, um modelo do cache com tempo de vida e tags. §agora()§ devolve ms. O objeto tem §obter(chave, gerar, { revalidate, expire, tags })§ (assíncrona; tempos em segundos; §tags§ lista) e §invalidarTag(tag)§, §execucoes()§. Regras: (1) sem entrada, chama §gerar()§, guarda com o instante e as tags e devolve; (2) entrada **fresca** (§idade < revalidate§) devolve o valor sem gerar; (3) entrada **entre revalidate e expire**: devolve o valor **antigo** imediatamente e **regenera em segundo plano** (a próxima chamada, depois de a regeneração terminar, vê o novo); só uma regeneração por vez; (4) entrada com **idade ≥ expire**: espera a regeneração e devolve o valor novo; (5) §invalidarTag(tag)§ marca como **estagnadas** (tratadas como entre revalidate e expire, isto é, serve o antigo e regenera) todas as entradas com a tag. §execucoes()§ conta as chamadas a §gerar§. O valor de §revalidate§ e §expire§ padrão são §60§ e §3600§.', lang: 'javascript', starter: 'function criarCacheNext(agora) {\n  // seu código aqui\n}\n', hints: ['Guarde por chave: valor, instante, tags, estagnada e a promise da regeneração.', 'Na regeneração em segundo plano, atualize a entrada quando a promise resolver.'], tests: [{ name: 'fresco, revalidate e expire', code: R`let t = 0; const c = criarCacheNext(() => t * 1000); let n = 0; const gerar = async () => ++n;
const op = { revalidate: 10, expire: 100 };
assert.equal(await c.obter('k', gerar, op), 1);
t = 5; assert.equal(await c.obter('k', gerar, op), 1);
assert.equal(c.execucoes(), 1);
t = 20; assert.equal(await c.obter('k', gerar, op), 1, 'serve o antigo');
await Promise.resolve(); await new Promise((r) => setTimeout(r, 0));
assert.equal(c.execucoes(), 2);
assert.equal(await c.obter('k', gerar, op), 2, 'depois da regeneração vê o novo');
t = 500; assert.equal(await c.obter('k', gerar, op), 3, 'expirado: espera o novo');` }, { name: 'só uma regeneração por vez', code: R`let t = 0; const c = criarCacheNext(() => t * 1000); let n = 0; const gerar = () => new Promise((r) => setTimeout(() => r(++n), 5));
const op = { revalidate: 1, expire: 100 };
assert.equal(await c.obter('k', gerar, op), 1);
t = 10;
const [a, b, d] = await Promise.all([c.obter('k', gerar, op), c.obter('k', gerar, op), c.obter('k', gerar, op)]);
assert.deepEqual([a, b, d], [1, 1, 1]);
await new Promise((r) => setTimeout(r, 20));
assert.equal(c.execucoes(), 2);` }, { name: 'invalidar por tag', code: R`let t = 0; const c = criarCacheNext(() => t * 1000); let n = 0; const gerar = async () => ++n;
const op = { revalidate: 60, expire: 3600, tags: ['posts'] };
await c.obter('a', gerar, op); await c.obter('b', gerar, { ...op, tags: ['outra'] });
c.invalidarTag('posts');
assert.equal(await c.obter('a', gerar, op), 1, 'serve o antigo');
await new Promise((r) => setTimeout(r, 0));
assert.equal(await c.obter('a', gerar, op), 3);
assert.equal(await c.obter('b', gerar, { ...op, tags: ['outra'] }), 2, 'tag diferente não é afetada');
assert.equal(c.execucoes(), 3);` }], solution: R`function criarCacheNext(agora) {
  const mapa = new Map(); let n = 0;
  const gerarEGuardar = (chave, gerar, op, e) => {
    n++;
    const p = Promise.resolve().then(gerar).then((valor) => {
      mapa.set(chave, { valor, em: agora(), tags: op.tags || [], estagnada: false, regen: null, op });
      return valor;
    });
    if (e) e.regen = p;
    return p;
  };
  return {
    async obter(chave, gerar, op = {}) {
      const revalidate = (op.revalidate ?? 60) * 1000, expire = (op.expire ?? 3600) * 1000;
      const e = mapa.get(chave);
      if (!e) return gerarEGuardar(chave, gerar, op, null);
      const idade = agora() - e.em;
      if (idade >= expire) return e.regen || gerarEGuardar(chave, gerar, op, e);
      if (!e.estagnada && idade < revalidate) return e.valor;
      if (!e.regen) gerarEGuardar(chave, gerar, op, e).catch(() => { e.regen = null; });
      return e.valor;
    },
    invalidarTag(tag) { for (const e of mapa.values()) if (e.tags.includes(tag)) e.estagnada = true; },
    execucoes: () => n
  };
}
`, explanation: 'O modelo reproduz stale-while-revalidate: fresco serve direto, entre revalidate e expire serve o antigo e regenera uma vez em segundo plano, expirado espera, e tags marcam entradas como estagnadas.' }
],
'nxt-06': [
  { id: 'nxt-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Uma Server Action é chamada apenas por um botão visível a administradores. O que está correto?', options: ['Basta esconder o botão dos demais', 'A Action deve verificar autenticação e autorização por conta própria, pois é alcançável por POST direto', 'O Next.js bloqueia automaticamente quem não vê o botão', 'Só o proxy precisa verificar'], answer: 1, explanation: 'Server Actions são endpoints públicos; a interface não é uma barreira de segurança. Cada Action autentica, autoriza o recurso e valida.' },
  { id: 'nxt-06-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Ordene as etapas de uma Action segura: 1 validar entrada, 2 autenticar, 3 invalidar cache, 4 autorizar o recurso, 5 executar.', code: 'ordem correta (números): ?, ?, ?, ?, ?', lang: 'text', steps: [{ q: 'Primeira etapa:', answers: ['2'] }, { q: 'Segunda etapa:', answers: ['4'] }, { q: 'Última etapa:', answers: ['3'] }], explanation: 'Autenticar (2), autorizar o recurso (4), validar (1), executar (5), invalidar o cache (3).' },
  { id: 'nxt-06-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Depois de salvar, o usuário não é redirecionado e vê a tela antiga. Clique na linha que engole o redirecionamento.', code: 'export async function salvar(fd) {\n  try {\n    await db.salvar(fd.get("nome"));\n    redirect("/lista");\n  } catch (e) {\n    return { erro: "falhou" };\n  }\n}', answer: 4, explanation: 'redirect() funciona lançando uma exceção interna; dentro do try/catch ela é capturada. Chame redirect fora do try ou relance a exceção.' },
  { id: 'nxt-06-e4', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o formulário com estado e pendência.', code: 'const [estado, acao, pendente] = [[0]](salvar, { ok: false });\n<form action={acao}> ... <button [[1]]={pendente}>Salvar</button></form>', answers: [['useActionState'], ['disabled']], explanation: 'useActionState liga a Action ao estado e informa a pendência; desabilitar o botão evita envio duplo.' },
  { id: 'nxt-06-e5', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §executarAcao({ sessao, entrada, recurso })§ que modela a ordem de uma Action segura e devolve um objeto: (1) sem §sessao§ (nula) → §{ ok: false, status: 401, erro: "não autenticado" }§; (2) se §recurso§ for §null§ ou §recurso.donoId !== sessao.usuarioId§ e a sessão não for §papel: "admin"§ → §{ ok: false, status: 404, erro: "não encontrado" }§ (não revela a existência); (3) valida §entrada§ (objeto com §nome§ string de 2 a 80 caracteres após §trim()§ e §email§ no formato §x@y.z§ sem espaços): se houver erros devolva §{ ok: false, status: 422, erros: { campo: mensagem } }§ com os campos §nome§ ("Nome deve ter de 2 a 80 caracteres") e §email§ ("E-mail inválido") e §valores§ com as strings digitadas (trim); (4) sucesso: §{ ok: true, status: 200, dados: { nome, email } }§ com os valores normalizados (§nome§ com trim e §email§ em minúsculas).', lang: 'javascript', starter: 'function executarAcao({ sessao, entrada, recurso }) {\n  // seu código aqui\n}\n', hints: ['Siga a ordem: autenticar, autorizar, validar, normalizar.', 'Entrada que não é objeto deve gerar erros em ambos os campos.'], tests: [{ name: 'autenticação e autorização', code: R`const e = { nome: 'Ana', email: 'a@x.com' };
assert.deepEqual(executarAcao({ sessao: null, entrada: e, recurso: { donoId: 1 } }), { ok: false, status: 401, erro: 'não autenticado' });
assert.deepEqual(executarAcao({ sessao: { usuarioId: 2, papel: 'user' }, entrada: e, recurso: { donoId: 1 } }), { ok: false, status: 404, erro: 'não encontrado' });
assert.deepEqual(executarAcao({ sessao: { usuarioId: 2, papel: 'user' }, entrada: e, recurso: null }), { ok: false, status: 404, erro: 'não encontrado' });
assert.equal(executarAcao({ sessao: { usuarioId: 9, papel: 'admin' }, entrada: e, recurso: { donoId: 1 } }).ok, true);` }, { name: 'validação com valores', code: R`const s = { usuarioId: 1, papel: 'user' };
const r = executarAcao({ sessao: s, entrada: { nome: ' A ', email: 'sem arroba' }, recurso: { donoId: 1 } });
assert.deepEqual(r, { ok: false, status: 422, erros: { nome: 'Nome deve ter de 2 a 80 caracteres', email: 'E-mail inválido' }, valores: { nome: 'A', email: 'sem arroba' } });
const r2 = executarAcao({ sessao: s, entrada: null, recurso: { donoId: 1 } });
assert.equal(r2.status, 422); assert.deepEqual(Object.keys(r2.erros), ['nome', 'email']);` }, { name: 'sucesso normalizado', code: R`const r = executarAcao({ sessao: { usuarioId: 1, papel: 'user' }, entrada: { nome: '  Ana Maria ', email: 'ANA@Exemplo.COM' }, recurso: { donoId: 1 } });
assert.deepEqual(r, { ok: true, status: 200, dados: { nome: 'Ana Maria', email: 'ana@exemplo.com' } });` }], solution: R`function executarAcao({ sessao, entrada, recurso }) {
  if (!sessao) return { ok: false, status: 401, erro: 'não autenticado' };
  if (sessao.papel !== 'admin' && (!recurso || recurso.donoId !== sessao.usuarioId)) return { ok: false, status: 404, erro: 'não encontrado' };
  const e = entrada && typeof entrada === 'object' ? entrada : {};
  const nome = typeof e.nome === 'string' ? e.nome.trim() : '';
  const email = typeof e.email === 'string' ? e.email.trim() : '';
  const erros = {};
  if (nome.length < 2 || nome.length > 80) erros.nome = 'Nome deve ter de 2 a 80 caracteres';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) erros.email = 'E-mail inválido';
  if (Object.keys(erros).length) return { ok: false, status: 422, erros, valores: { nome, email } };
  return { ok: true, status: 200, dados: { nome, email: email.toLowerCase() } };
}
`, explanation: 'A ordem autenticar, autorizar (sem revelar existência), validar e normalizar é o esqueleto de qualquer Server Action segura.' }
]
};
