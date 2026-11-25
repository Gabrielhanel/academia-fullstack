// C2.5 — Next.js. Aulas 1 a 4 (App Router; rotas e metadados; Server Components; Client Components).
const R = String.raw;
const D = 'https://nextjs.org/docs/app/';

export const REF = {
  install: { title: 'Next.js — Installation', url: D + 'getting-started/installation', kind: 'doc' },
  structure: { title: 'Next.js — Project structure', url: D + 'getting-started/project-structure', kind: 'doc' },
  layouts: { title: 'Next.js — Layouts and Pages', url: D + 'getting-started/layouts-and-pages', kind: 'doc' },
  linking: { title: 'Next.js — Linking and Navigating', url: D + 'getting-started/linking-and-navigating', kind: 'doc' },
  errors: { title: 'Next.js — Error Handling', url: D + 'getting-started/error-handling', kind: 'doc' },
  metadata: { title: 'Next.js — Metadata and OG images', url: D + 'getting-started/metadata-and-og-images', kind: 'doc' },
  serverClient: { title: 'Next.js — Server and Client Components', url: D + 'getting-started/server-and-client-components', kind: 'doc' },
  boundary: { title: 'Next.js — Server and client boundary (guia)', url: D + 'guides/server-and-client-boundary', kind: 'doc' },
  rscReact: { title: 'React — Server Components', url: 'https://react.dev/reference/rsc/server-components', kind: 'doc' },
  useClient: { title: 'React — directiva "use client"', url: 'https://react.dev/reference/rsc/use-client', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'nxt-01', moduleId: 'm1', order: 1, minutes: 65, tags: ['App Router', 'layout', 'page', 'loading', 'error', 'navegação'],
  title: 'App Router: estrutura de pastas, layouts, páginas, loading, error e navegação',
  objectives: ['Mapear pastas do diretório app em rotas e reconhecer as convenções de arquivos (page, layout, loading, error, not-found, route)', 'Explicar como os layouts aninhados preservam estado e não renderizam de novo na navegação', 'Usar loading e error como fronteiras de Suspense e de erro por segmento', 'Navegar com Link e entender o prefetch e a navegação no cliente', 'Ler a tabela de rotas do next build (estática, SSG, dinâmica)'],
  intro: `O **Next.js** é um framework full stack sobre o React: roteamento, renderização no servidor, busca de dados, cache, API e otimizações já integrados. O **App Router** (diretório §app§) define as **rotas pela estrutura de pastas** e usa as convenções do React moderno (Server Components, Suspense, ações). Esta aula constrói o mapa mental: quais arquivos existem, o que cada um faz e como o framework os combina em uma árvore de layouts, fronteiras de carregamento e de erro. Os resultados foram medidos com o **Next 16.4.6** (build e servidor de produção reais), e todas as convenções foram conferidas na documentação que acompanha o pacote da mesma versão.`,
  theory: `### Pastas viram rotas
Uma pasta dentro de §app/§ é um **segmento de URL**; a rota só fica pública quando a pasta tem um **§page.js§** (ou §route.js§). Exemplo: §app/blog/[slug]/page.js§ atende §/blog/a§. O arquivo de uma rota **só é servido** se for um destes nomes especiais; os demais (componentes, utilitários) podem morar na mesma pasta sem virar rota (colocation).

### Convenções de arquivos
- **§page§**: a interface única de uma rota;
- **§layout§**: interface **compartilhada** por um segmento e seus filhos; recebe §children§. O **layout raiz** (§app/layout§) é obrigatório e define §<html>§ e §<body>§;
- **§template§**: como o layout, mas **remonta** a cada navegação (reinicia estado e efeitos);
- **§loading§**: interface de carregamento do segmento (vira um §<Suspense>§ automático ao redor da página);
- **§error§**: fronteira de erro do segmento, **precisa ser Client Component** (§'use client'§) e recebe §error§ e uma função para tentar de novo; **§global-error§** cobre o layout raiz;
- **§not-found§**: interface para §notFound()§ e rotas inexistentes;
- **§route§**: endpoint HTTP (aula 8) no lugar de uma página.
Pastas **privadas** (§_pasta§) ficam fora do roteamento; **grupos** (§(grupo)§) organizam sem afetar a URL (aula 2).

### Layouts aninhados e preservação de estado
Os layouts formam uma **árvore**: o raiz envolve o layout de §/dashboard§, que envolve a página. Na navegação entre páginas **irmãs** que compartilham um layout, o layout **não renderiza de novo e mantém o estado** (menus abertos, campos digitados na barra lateral); só a parte que muda é trocada. Por isso é bom colocar navegação persistente e provedores no layout e **dados específicos da página** na página. Layouts **não recebem** os parâmetros da rota filha nem o §pathname§ (use hooks no cliente para o caminho atual).

### loading e error como fronteiras
Em um segmento, a hierarquia que o framework monta é: **layout → template → error (fronteira de erro) → loading (Suspense) → not-found → page**. Assim:
- uma página lenta mostra o §loading§ **sem** esconder o layout (a navegação responde na hora);
- um erro lançado na página é capturado pelo §error§ do **segmento mais próximo**, e o layout acima continua utilizável;
- o §error§ **não** captura erros do layout do **mesmo** segmento (suba a fronteira para o pai ou use §global-error§).
Erros **esperados** (validação, "não encontrado") não devem ser exceções: devolva um estado (aula 6) ou use §notFound()§.

### Navegação
O componente §Link§ (§next/link§) navega **no cliente** (sem recarregar a página), faz **prefetch** das rotas visíveis em produção e atualiza só o que mudou. Alternativas: §useRouter§ (cliente, para navegação programática), §redirect§ (servidor) e §usePathname§/§useSearchParams§ (cliente). Use âncoras §<a>§ para links externos e §Link§ para internos.

### O que foi medido no build
Com um app de teste (home, rota dinâmica com §generateStaticParams§, página que lê cookies, rota API e um formulário), o §next build§ mostrou a tabela de rotas:
§§§
○ /                 (Static)    prerenderizada como conteúdo estático
● /blog/[slug]      (SSG)       /blog/a e /blog/b gerados no build
ƒ /painel           (Dynamic)   renderizada sob demanda
ƒ /api/ola          (Dynamic)   endpoint
ƒ Proxy (Middleware)
§§§
A tabela é a primeira ferramenta de diagnóstico: mostra o que foi **pré-renderizado** e o que depende de requisição. Em um app com §cacheComponents§ (aula 5) aparece ainda o símbolo §◐§ (Partial Prerender): um **shell estático** com partes dinâmicas transmitidas depois.

### Fluxo de uma navegação
1. clique em §Link§; 2. o cliente pede ao servidor o **payload RSC** da rota (já pode estar em prefetch); 3. o React troca somente os segmentos diferentes; 4. o §loading§ aparece se a página suspender; 5. o histórico do navegador é atualizado. A primeira visita (carregamento total) recebe HTML; as seguintes recebem o payload.

### Estrutura de projeto
Com §src/§ ou sem, mantenha: §app/§ (rotas), §components/§ (UI reutilizável), §lib/§ (acesso a dados, utilitários), §public/§ (estáticos) e §proxy.js§ na raiz. Organize **por funcionalidade** quando o projeto crescer (aula de arquitetura, C2.8).

### Versões e mudanças
Nas versões recentes, §params§ e §searchParams§ são **promises** (use §await§ ou §use§), as APIs de requisição (§cookies()§, §headers()§) são **assíncronas** e o antigo *middleware* chama-se **Proxy** (aula 9). Consulte sempre a documentação da versão instalada.`,
  concepts: [
    { term: 'App Router', def: 'Sistema de rotas do Next.js baseado no diretório app, com layouts e Server Components.' },
    { term: 'Segmento', def: 'Parte de uma URL correspondente a uma pasta da rota.' },
    { term: 'page', def: 'Arquivo que torna uma rota pública e define sua interface.' },
    { term: 'layout', def: 'Interface compartilhada por um segmento e seus filhos, que preserva o estado na navegação.' },
    { term: 'template', def: 'Layout que remonta a cada navegação, reiniciando o estado.' },
    { term: 'loading', def: 'Arquivo que define a interface de carregamento, convertida em uma fronteira de Suspense.' },
    { term: 'error', def: 'Fronteira de erro de um segmento; deve ser um Client Component.' },
    { term: 'Link', def: 'Componente de navegação no cliente com prefetch.' },
    { term: 'Colocation', def: 'Guardar arquivos relacionados na mesma pasta sem que virem rotas.' },
    { term: 'Payload RSC', def: 'Representação serializada da árvore de componentes enviada pelo servidor ao navegar.' }
  ],
  examples: R`**Analogia:** o App Router é um **prédio de escritórios**: o layout raiz é a fachada e a recepção (sempre ali), cada layout aninhado é o andar com seu corredor, a page é a sala. Ao ir de uma sala a outra do mesmo andar, o corredor não é refeito; o §loading§ é a placa "sala em preparo" e o §error§ é o aviso de que a sala está interditada, sem fechar o prédio.

**Estrutura mínima do laboratório (Next 16.4.6):**
§§§
app/
  layout.js            <html><body>...</body></html> e metadata
  page.js              /
  loading.js           carregamento do segmento raiz
  blog/[slug]/page.js  /blog/a, /blog/b (generateStaticParams)
  painel/page.js       dinâmica (cookies())
  api/ola/route.js     GET e POST
  acoes/page.js        formulário com Server Action
proxy.js               matcher: /painel/:path*, /blog/:path*
§§§

**Cenário ilustrativo (não medido):** uma página de relatório demorava 4 s e a tela inteira ficava branca ao navegar. Adicionar um §loading.js§ (esqueleto) ao segmento e um §error.js§ com botão "tentar de novo" manteve o menu e o cabeçalho visíveis, e a navegação passou a parecer instantânea sem mudar a velocidade do servidor.`,
  code: [
    { title: 'Layout raiz, loading e error (convenções)', lang: 'jsx', code: R`// app/layout.js
export const metadata = { title: { default: 'Loja', template: '%s | Loja' } };
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body><nav>menu</nav>{children}</body>
    </html>
  );
}

// app/relatorios/loading.js  (vira um Suspense ao redor da página)
export default function Loading() { return <p aria-busy="true">Carregando relatório...</p>; }

// app/relatorios/error.js  (fronteira de erro: precisa ser Client Component)
'use client';
export default function Error({ error, reset }) {
  return <div role="alert"><p>Algo deu errado.</p><button onClick={() => reset()}>Tentar de novo</button></div>;
}`, notes: [{ l: '1', t: 'metadata no layout raiz: o template acrescenta o nome do site aos títulos filhos (medido: "Post a | Lab").' }, { l: '4', t: 'O layout raiz define html e body e é obrigatório.' }, { l: '12', t: 'error.js só funciona como Client Component porque fronteiras de erro dependem de estado do cliente.' }] },
    { title: 'Navegação com Link e hooks de cliente', lang: 'jsx', code: R`import Link from 'next/link';
'use client';  // (em arquivo próprio) — hooks de navegação só funcionam em Client Components
import { usePathname } from 'next/navigation';

export function Menu() {
  const caminho = usePathname();
  return (
    <nav>
      <Link href="/" aria-current={caminho === '/' ? 'page' : undefined}>Início</Link>
      <Link href="/blog/a" prefetch>Post A</Link>
      <a href="https://nextjs.org">Docs (externo)</a>
    </nav>
  );
}`, notes: [{ l: '1', t: 'Em um arquivo real, a diretiva "use client" deve ser a primeira linha do arquivo.' }, { l: '8', t: 'aria-current indica a página atual para tecnologias assistivas.' }, { l: '10', t: 'Links externos usam âncora comum.' }] }
  ],
  bestPractices: ['Coloque navegação persistente e provedores no layout e dados da página na página.', 'Adicione loading e error por segmento relevante, não só na raiz.', 'Use Link para rotas internas e âncoras para externas.', 'Leia a tabela de rotas do build a cada mudança de renderização.', 'Use pastas privadas e grupos para organizar sem alterar a URL.', 'Confira a documentação da versão instalada: as convenções mudam.'],
  mistakes: ['Esquecer o page.js e achar que a rota "sumiu".', 'Escrever error.js sem a diretiva use client.', 'Esperar que o error do mesmo segmento capture erros do layout dele.', 'Guardar dados de uma página no layout e vê-los desatualizados na navegação.', 'Usar §<a>§ para links internos e perder a navegação no cliente.', 'Esquecer que params e cookies() são assíncronos nas versões recentes.'],
  market: `Next.js é o framework React dominante em vagas full stack. Entender o mapeamento pasta-rota, os layouts e as fronteiras de loading e erro é a base de qualquer tarefa no App Router e a primeira coisa avaliada em desafios técnicos e em revisões de código.`,
  summary: `No App Router, pastas viram segmentos de URL e arquivos especiais definem a interface: page, layout (preserva estado), template (remonta), loading (Suspense), error (fronteira de erro cliente) e not-found, além de route para APIs. A navegação com Link é no cliente, com prefetch. A tabela de rotas do next build mostra o que é estático, SSG ou dinâmico. Nas versões recentes params e as APIs de requisição são assíncronas.`,
  refs: [REF.install, REF.structure, REF.layouts, REF.linking, REF.errors],
  cards: [
    { q: 'O que torna uma pasta de app uma rota pública?', a: 'A presença de um page (ou route) dentro dela.' },
    { q: 'Qual a diferença entre layout e template?', a: 'O layout preserva o estado entre navegações; o template remonta a cada navegação.' },
    { q: 'Por que o error.js precisa de use client?', a: 'Porque fronteiras de erro dependem de estado e de recarregar no cliente.' },
    { q: 'O que mostra a tabela de rotas do next build?', a: 'Para cada rota, se é estática, SSG (generateStaticParams), parcialmente prerenderizada ou dinâmica.' }
  ]
},
{
  id: 'nxt-02', moduleId: 'm1', order: 2, minutes: 65, tags: ['rotas dinâmicas', 'grupos', 'rotas paralelas', 'rotas interceptadas', 'metadata', 'SEO'],
  title: 'Rotas dinâmicas, grupos, rotas paralelas e interceptadas, metadados e SEO',
  objectives: ['Criar segmentos dinâmicos, catch-all e opcionais e ler params e searchParams (assíncronos)', 'Pré-gerar rotas com generateStaticParams e entender dynamicParams', 'Organizar o código com grupos de rotas e pastas privadas', 'Reconhecer rotas paralelas (@slot) e interceptadas ((.)pasta) em modais com URL própria', 'Definir metadados estáticos e dinâmicos e boas práticas de SEO'],
  intro: `Aplicações reais precisam de URLs com parâmetros (§/produtos/42§), áreas com layouts diferentes na mesma aplicação, **modais que têm endereço** e páginas que se descrevem bem para buscadores e redes sociais. O App Router resolve cada uma com uma **convenção de nome de pasta** ou uma **função exportada**. A aula traz as convenções e os resultados medidos no laboratório: como o §generateStaticParams§ gera páginas no build, o que acontece com um parâmetro **fora** da lista e como o título dinâmico chega ao HTML.`,
  theory: `### Segmentos dinâmicos
- §[slug]§: um segmento (§/blog/a§ → §{ slug: 'a' }§);
- §[...partes]§ (**catch-all**): um ou mais segmentos (§/docs/a/b/c§ → §{ partes: ['a','b','c'] }§);
- §[[...partes]]§ (**opcional**): também casa a rota sem segmentos.
Nas versões recentes §params§ é uma **promise**:
§§§
export default async function Post({ params }) { const { slug } = await params; ... }
§§§
§searchParams§ (a query string) também é assíncrono e torna a página **dinâmica**, pois depende da requisição. **Valide** sempre o parâmetro: ele vem da URL, é texto e pode ser qualquer coisa (§/produtos/abc§ para um id numérico deve virar §notFound()§).

### generateStaticParams e dynamicParams
§generateStaticParams§ devolve a lista de combinações a **gerar no build**. Medido: com §[{slug:'a'},{slug:'b'}]§ o build gerou §/blog/a§ e §/blog/b§ (símbolo ●, SSG). Um parâmetro **fora da lista** (§/blog/c§) respondeu **200**: por padrão **§dynamicParams§ é verdadeiro**, e a página é gerada **sob demanda** na primeira requisição (e guardada). Com §export const dynamicParams = false§, parâmetros fora da lista resultam em **404**. Use a lista para os conteúdos mais acessados e deixe o resto sob demanda quando o conjunto for grande.

### Grupos e pastas privadas
- §(marketing)/sobre/page.js§ → §/sobre§: o **grupo** não entra na URL; serve para organizar e para ter **layouts diferentes** (§(loja)§ e §(admin)§ com layouts raiz próprios);
- §_componentes/§: pasta **privada**, excluída do roteamento.
Cuidado com duas páginas em grupos distintos que resolvem para a **mesma URL** (erro de build).

### Rotas paralelas e interceptadas
- **Rotas paralelas** (§@modal§, §@equipe§): **slots** nomeados que o layout recebe como props (§{ children, modal }§) e renderiza **ao mesmo tempo**, cada um com seu próprio carregamento e erro. Um §default.js§ define o que aparecer quando o slot não casa com a URL atual;
- **Rotas interceptadas** (§(.)foto/[id]§, §(..)§, §(...)§): "interceptam" uma navegação **no cliente** para mostrar outra rota em outro contexto; o padrão clássico é o **modal de foto**: ao clicar, a foto abre em um modal por cima da lista (URL §/foto/3§); ao **recarregar** ou abrir o link, a página completa aparece. Resultado: modais com **URL compartilhável** e botão voltar funcionando. Exigem cuidado de acessibilidade (foco, Esc, rótulo).

### Metadados e SEO
- **Estáticos**: §export const metadata = { title, description, openGraph, ... }§ no layout ou na página;
- **Dinâmicos**: §export async function generateMetadata({ params })§ devolve o objeto a partir dos dados; medido no laboratório: §<title>Post a | Lab</title>§, combinando o título da página com o §template§ do layout;
- arquivos de convenção: §sitemap.js§, §robots.js§, §opengraph-image§, ícones; JSON-LD pode ser inserido em um §<script type="application/ld+json">§;
- os metadados são resolvidos no **servidor** e entram no HTML inicial, o que beneficia rastreadores e pré-visualizações em redes sociais.
Dados repetidos em §generateMetadata§ e na página não custam duas buscas quando a busca está em uma função com cache (aula 5).

### Boas práticas de SEO
URL legível e estável; um §<h1>§ por página; título e descrição únicos; §lang§ no §<html>§; canônicas para conteúdo duplicado; §notFound()§ para páginas inexistentes (status 404, não 200 com mensagem); sitemap; imagens com §alt§; desempenho (Core Web Vitals, C2.7); conteúdo principal **renderizado no servidor**.

### Redirecionamentos e reescritas
Redirecionamentos simples e permanentes ficam em §next.config§ (§redirects§); lógica dependente da requisição, no Proxy (aula 9); dentro de componentes e ações use §redirect()§ e §permanentRedirect()§.

### Testes e validação
Teste funções puras de roteamento e validação de parâmetros (é o desafio de código da aula); verifique a tabela de rotas do build e o HTML com §curl§ (título, descrição, status).`,
  concepts: [
    { term: 'Segmento dinâmico', def: 'Parte da URL entre colchetes que captura um valor como parâmetro.' },
    { term: 'Catch-all', def: 'Segmento [...nome] que casa vários segmentos de URL.' },
    { term: 'generateStaticParams', def: 'Função que lista os parâmetros a pré-gerar no build.' },
    { term: 'dynamicParams', def: 'Opção que decide se parâmetros fora da lista são gerados sob demanda (padrão) ou resultam em 404.' },
    { term: 'Grupo de rotas', def: 'Pasta entre parênteses que organiza as rotas sem alterar a URL.' },
    { term: 'Rota paralela', def: 'Slot @nome renderizado ao mesmo tempo que o conteúdo principal.' },
    { term: 'Rota interceptada', def: 'Rota exibida em outro contexto (por exemplo, um modal) durante a navegação no cliente.' },
    { term: 'generateMetadata', def: 'Função que produz os metadados da página a partir dos parâmetros e dos dados.' },
    { term: 'Open Graph', def: 'Metadados que controlam a pré-visualização do link em redes sociais.' }
  ],
  examples: R`**Analogia:** os segmentos dinâmicos são **formulários com espaços em branco** (a URL preenche o espaço); o generateStaticParams é **imprimir antes** os formulários mais usados; o dynamicParams é a **gráfica que imprime na hora** os que faltarem. A rota interceptada é a **janela da recepção**: você vê a foto sem sair do corredor, mas se anotar o endereço e for direto, entra na sala inteira.

**Resultados medidos (Next 16.4.6):**
§§§
generateStaticParams [{slug:'a'},{slug:'b'}]  -> build gera /blog/a e /blog/b (●)
GET /blog/a  -> <title>Post a | Lab</title>   (generateMetadata + template do layout)
GET /blog/c  -> HTTP 200 (dynamicParams padrão: gerada sob demanda)
§§§

**Cenário ilustrativo (não medido):** um catálogo com 80 mil produtos pré-gerava só os 500 mais vistos com §generateStaticParams§ e deixava o restante sob demanda: o build fica muito mais curto e os produtos raros foram gerados na primeira visita e guardados. Uma rota com id inexistente passou a responder 404 de verdade com §notFound()§, o que corrigiu páginas "fantasma" no índice de busca.`,
  code: [
    { title: 'Rota dinâmica com validação, static params e metadados (executado)', lang: 'jsx', code: R`import { notFound } from 'next/navigation';

export async function generateStaticParams() { return [{ slug: 'a' }, { slug: 'b' }]; }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: 'Post ' + slug, description: 'Conteúdo do post ' + slug };
}

export default async function Post({ params }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) notFound();      // valida o parâmetro vindo da URL
  return <h1>Post {slug}</h1>;
}`, notes: [{ l: '3', t: 'Com esta lista o build gerou /blog/a e /blog/b (medido).' }, { l: '6', t: 'params é uma promise nas versões recentes.' }, { l: '12', t: 'notFound() devolve 404 de verdade.' }] },
    { title: 'Layout com slot paralelo para modal', lang: 'jsx', code: R`// app/galeria/layout.js — recebe o slot @modal como prop
export default function Layout({ children, modal }) {
  return <>{children}{modal}</>;
}
// app/galeria/@modal/(.)foto/[id]/page.js   intercepta /galeria/foto/[id] ao navegar no cliente (modal)
// app/galeria/@modal/default.js              export default function Default() { return null; }
// app/galeria/foto/[id]/page.js              página completa (recarga ou link direto)`, notes: [{ l: '2', t: 'O slot é renderizado ao lado do conteúdo principal.' }, { l: '5', t: 'O default.js evita 404 quando o slot não casa com a URL.' }] }
  ],
  bestPractices: ['Valide e converta os parâmetros da URL; use notFound() para valores inválidos.', 'Pré-gere o que é mais acessado e deixe o resto sob demanda.', 'Use grupos para layouts distintos e pastas privadas para código auxiliar.', 'Dê a modais uma URL própria com rotas interceptadas e cuide do foco.', 'Defina título e descrição únicos por página.', 'Gere sitemap e robots.'],
  mistakes: ['Confiar no parâmetro sem validar.', 'Esquecer o await de params nas versões recentes.', 'Responder 200 com "não encontrado" no corpo em vez de 404.', 'Esquecer o default.js dos slots e receber 404 em recarregamentos.', 'Colidir duas rotas de grupos diferentes na mesma URL.', 'Duplicar a busca em generateMetadata e na página sem cache.'],
  market: `Rotas dinâmicas, metadados e SEO são requisitos de quase todo produto web público. Saber explicar generateStaticParams, dynamicParams e modais por rotas interceptadas é pergunta comum e diferencia quem só leu o tutorial de quem usou o recurso em produção.`,
  summary: `Segmentos dinâmicos ([x], [...x], [[...x]]) entregam params assíncronos que devem ser validados. generateStaticParams pré-gera rotas no build, e dynamicParams (verdadeiro por padrão) gera as demais sob demanda (medido: 200). Grupos organizam sem afetar a URL; rotas paralelas e interceptadas dão URL a modais. Metadados estáticos ou por generateMetadata entram no HTML do servidor e sustentam o SEO.`,
  refs: [REF.layouts, REF.metadata, REF.linking],
  cards: [
    { q: 'O que acontece com /blog/c se generateStaticParams lista só a e b?', a: 'Por padrão (dynamicParams verdadeiro) a página é gerada sob demanda e responde 200; com dynamicParams falso, 404.' },
    { q: 'Para que serve um grupo de rotas?', a: 'Organizar e ter layouts diferentes sem alterar a URL.' },
    { q: 'Qual a vantagem de um modal feito com rota interceptada?', a: 'O modal tem URL compartilhável e o botão voltar funciona; ao recarregar, aparece a página completa.' },
    { q: 'Onde são resolvidos os metadados?', a: 'No servidor, entrando no HTML inicial (por isso ajudam rastreadores e pré-visualizações).' }
  ]
},
{
  id: 'nxt-03', moduleId: 'm1', order: 3, minutes: 70, tags: ['Server Components', 'RSC', 'serialização', 'async components', 'server-only'],
  title: 'Server Components: modelo, serialização, componentes assíncronos e segurança',
  objectives: ['Explicar o que é um Server Component, onde executa e o que ele não pode usar', 'Escrever componentes assíncronos que buscam dados diretamente e descrever o que vai ao navegador', 'Reconhecer o que pode ser passado do servidor para o cliente (valores serializáveis) e o que não pode', 'Impedir que código e segredos do servidor vazem para o cliente (server-only, variáveis de ambiente)', 'Evitar cascatas de busca e distinguir pré-renderização estática de renderização por requisição'],
  intro: `No App Router, **todo componente é um Server Component por padrão**: ele roda **somente no servidor**, pode ser **assíncrono** (usar §await§ no corpo), acessar banco de dados e segredos, e **não envia seu código JavaScript ao navegador**. O que chega ao cliente é o resultado da renderização (o **payload RSC** e o HTML). Isso reduz o JavaScript entregue e simplifica a busca de dados, mas impõe regras: sem estado, sem efeitos, sem eventos do navegador, e apenas **valores serializáveis** atravessando para o cliente. A aula descreve o modelo, os limites e as armadilhas de segurança.`,
  theory: `### O que é e onde executa
Um Server Component é uma função que o React executa **no servidor** (no build, para conteúdo estático, ou a cada requisição, para conteúdo dinâmico). O resultado é uma árvore de elementos serializada. Vantagens:
- **menos JavaScript** no navegador (o código do componente e de suas dependências, como uma biblioteca de Markdown, não vai ao cliente);
- **acesso direto** a dados (banco, sistema de arquivos, serviços internos), sem criar uma API só para a tela;
- **segredos** (chaves, tokens) ficam no servidor;
- **busca perto dos dados**, com latência menor e sem cascata cliente-servidor.

### O que não pode ser usado em Server Components
§useState§, §useEffect§, §useReducer§, §useContext§ (para consumir), eventos (§onClick§), APIs do navegador (§window§, §localStorage§) e hooks que dependem do cliente. Se precisar, extraia a parte interativa para um **Client Component** (aula 4). Bibliotecas que usam esses recursos precisam de §'use client'§ ou de um componente-casca.

### Componentes assíncronos
§§§
export default async function Pedidos() {
  const pedidos = await db.pedidos.listar();       // direto, no servidor
  return <ul>{pedidos.map((p) => <li key={p.id}>{p.cliente}</li>)}</ul>;
}
§§§
O §await§ suspende o componente; envolva em §<Suspense>§ (ou use §loading.js§) para **transmitir** o restante da página enquanto isso (streaming, aula 7). **Cascata**: se um componente pai espera uma busca e só depois renderiza o filho, que faz a própria busca, as buscas ocorrem em **sequência**. Evite iniciando buscas **em paralelo** (§Promise.all§) ou colocando cada busca em um componente irmão dentro de seu próprio Suspense.

### Serialização: o que atravessa a fronteira
Props passadas de um Server Component a um Client Component precisam ser **serializáveis**: strings, números, booleanos, null, arrays, objetos simples, Date, Map/Set, promises e (com a diretiva adequada) Server Actions. **Não** atravessam: **funções comuns** (exceto Server Actions), instâncias de classe, símbolos e objetos com métodos. Medido no laboratório: o objeto simples §{ a: 1 }§ passou a um Client Component sem problemas. Em caso de dúvida, pergunte-se "isto cabe em JSON?". Importante: tudo o que for passado vai **no HTML e no payload**, e portanto fica **visível** ao navegador: **nunca** passe segredos nem o objeto completo do banco (use um **DTO**, só com os campos necessários).

### Estático ou dinâmico
Um Server Component que não usa dados da requisição é **pré-renderizado no build** (rota estática). Ele passa a ser renderizado **por requisição** quando usa **APIs de requisição** (§cookies()§, §headers()§, §searchParams§, §connection()§) ou busca sem cache em um contexto dinâmico. Medido: a rota que lê §cookies()§ apareceu como §ƒ (Dynamic)§ e respondeu com §Cache-Control: private, no-cache, no-store§; a rota sem esses acessos foi §○ (Static)§ e respondeu com §s-maxage=31536000§ e §x-nextjs-prerender: 1§. A aula 5 mostra como misturar os dois com Suspense e cache.

### Segurança: o que não deve vazar
- **Variáveis de ambiente**: só as com prefixo §NEXT_PUBLIC_§ vão ao navegador (são **inlined no build**); as demais viram string vazia no cliente. Nunca coloque segredo em uma variável §NEXT_PUBLIC_§;
- **§server-only§**: ao importar §'server-only'§ em um módulo (acesso a dados, segredos), importá-lo por engano em um Client Component causa **erro de build** em vez de vazamento silencioso;
- **DTOs**: converta registros do banco em objetos mínimos antes de enviar ao cliente (sem hash de senha, sem campos internos);
- **Autorização na camada de dados**: o fato de um componente rodar no servidor não significa que o usuário pode ver o dado: verifique a permissão onde o dado é lido (aula 9);
- **Entrada**: parâmetros e cabeçalhos continuam sendo entrada não confiável.

### Composição: Server dentro de Client
Um Client Component **não pode importar** um Server Component, mas pode **receber um como §children§** (ou prop), pois o elemento foi criado no servidor. Isso permite, por exemplo, um provedor de tema no cliente envolvendo páginas renderizadas no servidor (aula 4).

### Depurando
No servidor veja o terminal; no cliente, a aba Rede mostra as requisições RSC (cabeçalho §RSC: 1§) e o React DevTools identifica o que é Server e Client Component. Para verificar o que foi ao cliente, inspecione o HTML e os arquivos JS carregados.

### Quando preferir Server Components
Conteúdo, listas, páginas de leitura e qualquer coisa sem interação. Reserve Client Components para **folhas interativas**: botões, formulários dinâmicos, mapas, gráficos, qualquer uso de estado ou eventos.`,
  concepts: [
    { term: 'Server Component', def: 'Componente que executa apenas no servidor e não envia seu código ao navegador.' },
    { term: 'Componente assíncrono', def: 'Server Component declarado com async que usa await no corpo.' },
    { term: 'Payload RSC', def: 'Fluxo serializado que descreve o resultado da renderização do servidor.' },
    { term: 'Serialização', def: 'Conversão de valores em um formato transmissível; só valores serializáveis cruzam a fronteira servidor-cliente.' },
    { term: 'DTO', def: 'Objeto com apenas os campos necessários, usado para não expor dados internos.' },
    { term: 'server-only', def: 'Pacote que gera erro de build se um módulo do servidor for importado no cliente.' },
    { term: 'NEXT_PUBLIC_', def: 'Prefixo de variáveis de ambiente incluídas no código do cliente no build.' },
    { term: 'Cascata de busca', def: 'Sequência de buscas em que cada uma só começa depois da anterior.' },
    { term: 'API de requisição', def: 'Função como cookies() ou headers() que depende da requisição e torna a rota dinâmica.' }
  ],
  examples: R`**Analogia:** o Server Component é o **cozinheiro**: prepara o prato na cozinha (servidor), com ingredientes e receitas secretas (segredos, banco), e entrega só o prato pronto. O Client Component é o **garçom** que interage com o cliente na mesa. A receita não vai à mesa; e o que sai da cozinha (props) precisa caber em uma **bandeja** (ser serializável).

**Resultados medidos (Next 16.4.6, build e servidor de produção):**
§§§
rota sem API de requisição (/):  ○ Static | Cache-Control: s-maxage=31536000 | x-nextjs-prerender: 1
rota que lê cookies() (/painel): ƒ Dynamic | Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
objeto simples { a: 1 } como prop de um Client Component: renderizou normalmente
7 arquivos JS de cliente na página com o formulário e o Client Component
§§§

**Cenário ilustrativo (não medido):** uma tela de relatórios importava uma biblioteca de Markdown e uma de datas pesadas no componente de página. Ao manter a página como Server Component, as duas saíram do pacote do cliente (o JS da rota diminui; meça com o analisador de bundle) e a busca no banco passou a ser feita em uma só viagem dentro do servidor.`,
  code: [
    { title: 'Componente assíncrono com DTO e busca em paralelo', lang: 'jsx', code: R`import 'server-only';
import { Suspense } from 'react';

async function getPedidos() { return db.pedidos.listar(); }
async function getResumo() { return db.pedidos.resumo(); }

export default async function Pagina() {
  const [pedidos, resumo] = await Promise.all([getPedidos(), getResumo()]);   // paralelo, sem cascata
  const publico = pedidos.map((p) => ({ id: p.id, cliente: p.cliente, total: p.total }));  // DTO: sem campos internos
  return (
    <>
      <h1>Pedidos ({resumo.total})</h1>
      <Suspense fallback={<p>Carregando filtros...</p>}><Filtros dados={publico} /></Suspense>
    </>
  );
}`, notes: [{ l: '1', t: 'Importado por engano em um Client Component, causa erro de build em vez de vazamento.' }, { l: '8', t: 'Promise.all inicia as duas buscas juntas: tempo total é o da mais lenta.' }, { l: '9', t: 'O DTO evita enviar ao navegador campos que a tela não usa.' }] },
    { title: 'O que atravessa a fronteira: serializável x não serializável', lang: 'jsx', code: R`// Server Component
import { Grafico } from './grafico';        // Client Component ('use client')

export default function Page() {
  const dados = { a: 1, rotulos: ['x', 'y'], criado: new Date() };   // serializável
  // <Grafico formatar={(n) => n + '%'} />   ERRADO: função comum não atravessa
  return <Grafico dados={dados} />;
}`, notes: [{ l: '5', t: 'Objetos simples, arrays e Date são serializáveis.' }, { l: '6', t: 'Passar uma função comum gera erro; use um valor (o formato como string) ou defina a função no cliente.' }] }
  ],
  bestPractices: ['Mantenha o componente como Server Component até precisar de interação.', 'Envie ao cliente apenas DTOs mínimos e serializáveis.', 'Use server-only nos módulos de acesso a dados e segredos.', 'Inicie buscas independentes em paralelo ou em Suspense separados.', 'Verifique a autorização onde o dado é lido, não só na rota.', 'Nunca coloque segredos em variáveis NEXT_PUBLIC_.'],
  mistakes: ['Usar useState ou onClick em um Server Component.', 'Passar funções ou instâncias de classe a Client Components.', 'Enviar o registro inteiro do banco ao cliente.', 'Criar cascatas de busca entre pai e filho.', 'Achar que "roda no servidor" significa "usuário autorizado".', 'Importar módulo com segredo em um Client Component.'],
  market: `Server Components mudaram o modelo mental de React e são o centro das vagas de Next.js: explicar o que roda onde, o que atravessa a fronteira e como evitar vazamentos é pergunta recorrente. Também é a base para entender por que o JavaScript do cliente diminui e a busca de dados simplifica.`,
  summary: `No App Router todo componente é de servidor por padrão: executa só no servidor, pode ser assíncrono, acessa dados e segredos e não envia seu código ao navegador, mas não usa estado, efeitos nem eventos. Só valores serializáveis cruzam para o cliente (funções comuns não), e tudo o que cruza fica visível: use DTOs, server-only e NEXT_PUBLIC_ com cuidado. APIs de requisição tornam a rota dinâmica (medido: Cache-Control no-store). Evite cascatas com paralelismo e Suspense.`,
  refs: [REF.serverClient, REF.boundary, REF.rscReact],
  cards: [
    { q: 'Quais hooks e recursos não podem ser usados em Server Components?', a: 'useState, useEffect, useReducer, eventos (onClick) e APIs do navegador, entre outros que dependem do cliente.' },
    { q: 'O que pode ser passado como prop de um Server a um Client Component?', a: 'Valores serializáveis (strings, números, objetos simples, arrays, Date...), não funções comuns nem instâncias de classe.' },
    { q: 'O que faz a importação de server-only?', a: 'Gera erro de build se o módulo for importado por código do cliente.' },
    { q: 'O que torna uma rota dinâmica em um Server Component?', a: 'Usar APIs de requisição como cookies(), headers(), searchParams ou connection().' }
  ]
},
{
  id: 'nxt-04', moduleId: 'm1', order: 4, minutes: 65, tags: ['Client Components', 'use client', 'fronteira', 'provedores', 'composição'],
  title: 'Client Components: a fronteira "use client", composição e provedores',
  objectives: ['Aplicar a diretiva use client no ponto mais baixo possível da árvore', 'Explicar que a diretiva marca uma fronteira de módulos e inclui os imports no pacote do cliente', 'Compor Server Components dentro de Client Components via children', 'Criar provedores de cliente (tema, estado, consulta) sem tornar a aplicação inteira cliente', 'Reconhecer a hidratação e evitar divergências entre servidor e cliente'],
  intro: `Interação precisa de JavaScript no navegador: estado, eventos, efeitos, APIs como §localStorage§. Em Next.js isso vive em **Client Components**, marcados com §'use client'§ no topo do arquivo. Mas a diretiva não é uma etiqueta de componente: é uma **fronteira entre dois "mundos" de módulos**. Tudo o que um arquivo cliente importa vai para o pacote do navegador. Dominar essa fronteira (onde colocá-la, como compor através dela e como criar provedores) é o que mantém a aplicação rápida e correta. Medimos no laboratório quantos arquivos de cliente uma página com um Client Component carregou.`,
  theory: `### O que a diretiva faz
§'use client'§ na **primeira linha** de um arquivo declara que ele e **tudo que ele importa** pertencem ao **pacote do cliente**. Os componentes exportados passam a ser renderizados **também no navegador** (hidratados) e podem usar §useState§, efeitos, eventos e APIs do navegador. Note:
- os Client Components **também são pré-renderizados no servidor** (HTML inicial) e depois **hidratados**: "cliente" não significa "só no navegador";
- **não é preciso** repetir a diretiva em cada arquivo importado por um arquivo cliente: ele já está no mundo do cliente;
- a diretiva vale para **módulos**, não para uma função isolada.

### Colocar a fronteira o mais baixo possível
Marcar uma página inteira como cliente envia todo o seu código ao navegador. Em vez disso, extraia a **folha interativa**:
§§§
// Página (servidor): conteúdo estático e dados
export default async function Produto({ params }) {
  const p = await getProduto((await params).id);
  return <article><h1>{p.nome}</h1><p>{p.descricao}</p><BotaoComprar id={p.id} /></article>;
}
// botao-comprar.js: 'use client' só aqui (estado, onClick)
§§§
O texto, a descrição e as imagens continuam no servidor; só o botão tem JavaScript no cliente.

### Server Components dentro de Client Components
Um arquivo cliente **não pode importar** um Server Component (ele entraria no pacote do cliente). Mas pode **receber um como §children§ ou prop**, porque o elemento foi **criado no servidor**:
§§§
// servidor
<Abas><ConteudoPesadoDoServidor /></Abas>     // Abas é 'use client'; o conteúdo continua renderizado no servidor
§§§
É o mesmo princípio de §children§ da aula de renderização (C2.3): o elemento já existe, o cliente só o posiciona.

### Provedores
Provedores de Context (tema, sessão, QueryClient do TanStack Query, store do Zustand) usam estado e precisam ser Client Components. Padrão:
§§§
// app/provedores.js
'use client';
export function Provedores({ children }) { const [qc] = useState(() => new QueryClient()); return <QueryClientProvider client={qc}>{children}</QueryClientProvider>; }
// app/layout.js (servidor) <body><Provedores>{children}</Provedores></body>
§§§
Como §children§ chega pronto do servidor, **envolver a aplicação em um provedor de cliente não transforma as páginas em Client Components**. Coloque o provedor **o mais profundo** que atender a quem o usa. Cuidados com stores de cliente em SSR: crie a store **por requisição** (ou por árvore), nunca em escopo de módulo compartilhado (C2.4).

### Hidratação e divergências
O React reaproveita o HTML do servidor e **anexa** os eventos (hidratação). Se o HTML do servidor e a primeira renderização do cliente **divergem**, há um erro de hidratação. Causas comuns: usar §Date.now()§, §Math.random()§, §window§ ou §localStorage§ **durante o render**; HTML inválido (um §<div>§ dentro de §<p>§); extensões do navegador. Soluções: gerar o valor em um **efeito** (só no cliente), usar §useId§ para ids, ou §suppressHydrationWarning§ **somente** para diferenças inevitáveis e pontuais (como hora local).

### Carregamento sob demanda
Componentes de cliente grandes e raros (editor, mapa, gráfico) podem ser carregados sob demanda com §next/dynamic§ ou §React.lazy§ (C2.7), mantendo o bundle inicial pequeno.

### Dados no cliente
Quando o dado depende de interação contínua (busca instantânea, atualização em tempo real), use uma biblioteca de cache de cliente (TanStack Query, SWR; C2.4) dentro de Client Components. Para o conteúdo inicial, prefira buscar no servidor e **passar como prop** (ou hidratar o cache, aula 7 da C2.4).

### Compartilhar código entre os mundos
Funções puras e constantes podem ser importadas por ambos. Módulos com segredo ou acesso a dados devem ter §server-only§ (aula 3); módulos que dependem do navegador podem ter §client-only§. Variáveis de ambiente do servidor aparecem vazias no cliente.

### Regras práticas
1) comece tudo como Server Component; 2) extraia folhas interativas; 3) passe dados mínimos e serializáveis; 4) use children para compor; 5) coloque provedores no ponto mais profundo; 6) meça o JavaScript da rota (analisador de bundle, C2.7).`,
  concepts: [
    { term: 'use client', def: 'Diretiva que marca um módulo e seus imports como parte do pacote do cliente.' },
    { term: 'Fronteira cliente-servidor', def: 'Ponto da árvore de módulos em que o código passa do servidor para o cliente.' },
    { term: 'Hidratação', def: 'Anexar eventos e estado do React ao HTML gerado no servidor.' },
    { term: 'Provedor de cliente', def: 'Componente de cliente que fornece um contexto ou serviço (tema, cache de dados) à árvore.' },
    { term: 'Folha interativa', def: 'Componente pequeno e profundo na árvore que concentra a interação e o JavaScript do cliente.' },
    { term: 'Divergência de hidratação', def: 'Diferença entre o HTML do servidor e a primeira renderização do cliente.' },
    { term: 'next/dynamic', def: 'Função do Next.js para carregar componentes sob demanda.' },
    { term: 'suppressHydrationWarning', def: 'Atributo que silencia o aviso de divergência em um elemento específico.' }
  ],
  examples: R`**Analogia:** a fronteira "use client" é a **porta da cozinha para o salão**. Tudo o que atravessa a porta (imports) passa a ficar à vista dos clientes, e o que fica na cozinha nunca aparece. Para servir um prato em uma bandeja interativa (a Aba), o garçom recebe o prato **já pronto** (children) em vez de levar a panela para o salão.

**Medido (Next 16.4.6):** a página do formulário com um Client Component (§useState§, §onClick§) e um objeto simples como prop carregou **7 arquivos JS** de cliente (framework, runtime e o componente); o formulário com a Server Action foi renderizado como §<form action="" encType="multipart/form-data" method="POST">§, funcionando mesmo antes da hidratação.

**Cenário ilustrativo (não medido):** uma loja marcou todo o layout como §'use client'§ "para usar o tema". O JavaScript inicial cresceu muito e o LCP piorou. A correção moveu o estado do tema para um pequeno provedor de cliente que recebe §children§ do servidor: as páginas voltaram a ser renderizadas no servidor e o pacote do cliente encolheu.`,
  code: [
    { title: 'Folha interativa e composição com children (executado como parte do laboratório)', lang: 'jsx', code: R`// app/acoes/cliente.js
'use client';
import { useState } from 'react';
export function Cliente({ dado }) {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n} {dado.a}</button>;
}

// Client Component que recebe um Server Component por children
'use client';
export function Abas({ children }) { const [aberta, setAberta] = useState(true); return <div><button onClick={() => setAberta(!aberta)}>alternar</button>{aberta && children}</div>; }`, notes: [{ l: '2', t: 'Diretiva na primeira linha do arquivo.' }, { l: '11', t: 'O conteúdo passado por children continua renderizado no servidor.' }] },
    { title: 'Provedor de cliente no layout do servidor', lang: 'jsx', code: R`// app/provedores.js
'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Provedores({ children }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

// app/layout.js (Server Component)
// <body><Provedores>{children}</Provedores></body>`, notes: [{ l: '7', t: 'Um QueryClient por árvore, criado com useState para manter a identidade (C2.4).' }, { l: '12', t: 'As páginas dentro de children continuam sendo Server Components.' }] }
  ],
  bestPractices: ['Mova a fronteira use client para o ponto mais profundo possível.', 'Receba Server Components por children dentro de componentes de cliente.', 'Mantenha provedores profundos e pequenos.', 'Evite valores não determinísticos no render de Client Components.', 'Carregue componentes grandes e raros sob demanda.', 'Meça o JavaScript de cada rota.'],
  mistakes: ['Marcar a página ou o layout inteiro como use client.', 'Tentar importar um Server Component em um Client Component.', 'Achar que Client Component não é renderizado no servidor.', 'Usar Date.now ou window no render e causar divergência de hidratação.', 'Criar store ou QueryClient em escopo de módulo no servidor.', 'Passar funções comuns de servidor a cliente.'],
  market: `Saber onde colocar a fronteira use client é o que mais influencia o desempenho de uma aplicação Next.js e aparece em revisões e entrevistas ("por que o bundle está grande?"). Quem domina a composição por children evita reescritas custosas.`,
  summary: `use client marca um módulo e seus imports como cliente: coloque-o nas folhas interativas. Client Components também são pré-renderizados no servidor e hidratados. Server Components entram em Client Components por children, e provedores de cliente no layout não tornam as páginas clientes. Divergências de hidratação vêm de valores não determinísticos no render. Componentes pesados e raros podem ser carregados sob demanda.`,
  refs: [REF.serverClient, REF.boundary, REF.useClient],
  cards: [
    { q: 'O que a diretiva use client realmente marca?', a: 'Uma fronteira de módulos: o arquivo e tudo que ele importa vão para o pacote do cliente.' },
    { q: 'Como usar um Server Component dentro de um Client Component?', a: 'Passando-o como children ou prop a partir de um componente de servidor.' },
    { q: 'Client Components são renderizados no servidor?', a: 'Sim, geram HTML inicial no servidor e depois são hidratados no navegador.' },
    { q: 'Causas comuns de erro de hidratação?', a: 'Date.now, Math.random, window ou localStorage no render e HTML inválido.' }
  ]
}
];
