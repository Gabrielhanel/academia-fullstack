// Curso C2.5 da C2: Next.js, aplicações full stack com React (disciplina: next).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c25-a.mjs';
import { REF2, lessonsB } from './c25-b.mjs';
import { REF3, lessonsC } from './c25-c.mjs';
import { exsetsA } from './c25-ex-a.mjs';
import { exsetsB, assessment, project } from './c25-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['App Router, rotas e layouts', 'Server Components', 'Client Components', 'Data fetching e cache', 'Server Actions', 'SSR, SSG, ISR e streaming', 'Middleware e autenticação', 'Route Handlers', 'Deploy e performance em produção'];
export const COVER = {
  'App Router, rotas e layouts': ['nxt-01', 'nxt-02'],
  'Server Components': ['nxt-03'],
  'Client Components': ['nxt-04'],
  'Data fetching e cache': ['nxt-05'],
  'Server Actions': ['nxt-06'],
  'SSR, SSG, ISR e streaming': ['nxt-07'],
  'Middleware e autenticação': ['nxt-09'],
  'Route Handlers': ['nxt-08'],
  'Deploy e performance em produção': ['nxt-10', 'nxt-11']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'RSC', def: 'React Server Components: componentes que executam no servidor e enviam ao navegador apenas o resultado.' },
  { term: 'CDN', def: 'Rede de distribuição de conteúdo que serve cópias de arquivos de locais próximos à pessoa usuária.' },
  { term: 'Core Web Vitals', def: 'Conjunto de métricas de experiência (LCP, INP, CLS) usadas para medir desempenho percebido.' },
  { term: 'Open Telemetry', def: 'Padrão aberto de traces, métricas e logs para observabilidade.' },
  { term: 'Stale-while-revalidate', def: 'Servir o conteúdo antigo enquanto o novo é gerado em segundo plano.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'nextjs', disciplineId: 'next', areaId: 'front', requires: ['javascript-fundamentos', 'typescript-fundamentos', 'html-css-a11y'],
  title: 'Next.js: aplicações full stack com React (App Router, Server Components, cache e produção)',
  description: 'Como construir aplicações full stack com o Next.js 16 e o App Router: estrutura de pastas, layouts, loading e error; rotas dinâmicas, grupos, rotas paralelas e interceptadas, metadados e SEO; Server Components (modelo, serialização, segurança) e Client Components (a fronteira use client, composição e provedores); busca de dados e Cache Components (use cache, cacheLife, cacheTag, revalidateTag e updateTag); Server Actions e formulários com ênfase em segurança; estratégias de renderização (SSG, SSR, ISR, streaming e pré-renderização parcial); Route Handlers e webhooks; Proxy (antigo middleware) e autenticação; imagens, fontes e scripts; deploy standalone, contêiner, variáveis de ambiente e observabilidade. Os exemplos foram executados com next build e next start na versão 16.4.6 (tabela de rotas, cabeçalhos de cache, tempo até o primeiro byte, proxy, Route Handlers, saída standalone), e os desafios do laboratório verificam a lógica pura (roteamento, serialização, fronteira cliente-servidor, cache com tags, Actions seguras, webhooks, autorização, matcher, imagens e variáveis de ambiente).',
  objectives: ['Estruturar uma aplicação com o App Router e ler a tabela de rotas do build', 'Escolher entre Server e Client Components e posicionar a fronteira use client', 'Buscar, cachear e invalidar dados com Cache Components', 'Mutar com Server Actions tratando-as como endpoints públicos', 'Escolher a estratégia de renderização de cada rota e validá-la com medições', 'Proteger rotas, ações e dados com camadas (proxy, camada de acesso a dados, cookies)', 'Publicar com segurança e observabilidade em contêiner'],
  level: 'A', prereqs: ['React essencial e avançado (cursos C2.1 e C2.3)', 'Gerenciamento de estado (curso C2.4), em especial a hidratação do cache de servidor', 'HTTP e APIs (curso C1.2)', 'Recomendado: Tailwind e design systems (curso C2.2)', 'Node.js 22 ou superior para executar os exemplos'], hours: 32,
  syllabus: 'App Router (layouts, loading, error, navegação); rotas dinâmicas, grupos, slots, interceptação, metadados; Server e Client Components e a fronteira; Cache Components (use cache, cacheLife, cacheTag, revalidação); Server Actions e segurança; SSG, SSR, ISR, streaming e pré-renderização parcial; Route Handlers e webhooks; Proxy e autenticação; imagens, fontes e scripts; deploy standalone, Docker, variáveis, cache e observabilidade.',
  versions: 'Next.js 16.4.6, React e React DOM 19.3.1, verificados com npm em 2026-11-25, Node.js 26. Os exemplos foram executados com next build e next start (servidor de produção) e consultados com curl: tabela de rotas, cabeçalhos Cache-Control, tempo até o primeiro byte, proxy, Route Handlers e a saída standalone (39 MB). Não foram executados: invocação de uma Server Action pelo navegador, updateTag, imagens, fontes e scripts otimizados, autenticação real, construção de imagem Docker, deploy em plataforma e instrumentação; esses pontos seguem a documentação que acompanha o pacote 16.4.6 (node_modules/next/dist/docs). O Next.js muda convenções com frequência (por exemplo, middleware virou proxy e o modelo de cache passou a ser explícito): consulte nextjs.org/docs para a versão em uso.',
  skills: ['Roteamento no App Router', 'Server e Client Components', 'Cache e revalidação', 'Server Actions seguras', 'Estratégias de renderização', 'APIs e webhooks', 'Autenticação e autorização', 'Otimização de imagens e fontes', 'Deploy e observabilidade'],
  modules: [
    { id: 'm1', title: 'Rotas e componentes', lessons: ['nxt-01', 'nxt-02', 'nxt-03', 'nxt-04'] },
    { id: 'm2', title: 'Dados e mutações', lessons: ['nxt-05', 'nxt-06', 'nxt-07'] },
    { id: 'm3', title: 'Back-end no Next', lessons: ['nxt-08', 'nxt-09'] },
    { id: 'm4', title: 'Produção', lessons: ['nxt-10', 'nxt-11'] }
  ],
  materials: [REF.layouts, REF.serverClient, REF2.caching, REF2.mutating, REF2.dataSecurity, REF3.proxy, REF3.deploying].map((r) => ({ ...r })),
  projectIds: ['loja-full-stack'],
  supplement: {
    glossary,
    cheatsheet: R`### Convenções do App Router
page (rota pública) · layout (preserva estado) · template (remonta) · loading (Suspense) · error (cliente) · not-found · route (API) · (grupo) · _privada · @slot · (.)interceptada · [x] · [...x] · [[...x]] · params e searchParams assíncronos

### Server x Client
Padrão: servidor (async, dados, segredos, sem estado/eventos) · "use client" nas folhas · Server dentro de Client por children · props serializáveis (sem funções, exceto Actions) · DTOs · server-only · NEXT_PUBLIC_ vai ao navegador

### Cache Components (16.x)
cacheComponents: true · dinâmico em Suspense · "use cache" + cacheLife + cacheTag · argumentos viram chave · sem cookies() dentro · updateTag (Actions, imediato) · revalidateTag(tag, 'max') (Actions e Handlers, SWR) · revalidatePath

### Renderização
○ estática · ● SSG (generateStaticParams, dynamicParams) · ◐ parcial (shell + Suspense) · ƒ dinâmica (cookies, headers, searchParams, connection) · TTFB x total

### Server Actions
"use server" · FormData · useActionState / useFormStatus · POST público: autenticar → autorizar recurso → validar → executar → invalidar → retornar/redirecionar · redirect fora do try

### Route Handlers e Proxy
GET/POST/... · Response.json · 400/401/403/404/201/429 · webhook: corpo bruto, HMAC, tempo constante, janela de tempo, idempotência · proxy.js + matcher: checagem otimista; DAL: verificação definitiva · cookie HttpOnly, Secure, SameSite

### Produção
next/image (width/height, sizes, preload/loading eager no LCP, remotePatterns) · next/font · next/script (afterInteractive, lazyOnload) · output: standalone (copiar public e .next/static) · Docker multiestágio, usuário não root · env validada · cache compartilhado com várias instâncias · logs, métricas, health check, rollback`,
    mistakes: ['Esquecer page.js e error.js sem use client.', 'Marcar layouts e páginas inteiras como use client.', 'Passar funções, classes ou o registro completo do banco ao cliente.', 'Ler cookies() no layout e tornar o site todo dinâmico.', 'Cachear dados de usuário sem o id na chave ou ler cookies() dentro de use cache.', 'Achar que Server Actions escondidas estão protegidas, sem autenticar e autorizar em cada uma.', 'Proteger só o proxy ou só o layout e deixar Actions e handlers abertos (IDOR).', 'Colocar segredos em NEXT_PUBLIC_ ou na imagem Docker; esquecer public e .next/static no standalone.'],
    prereqMap: R`**Antes deste curso:** React essencial e avançado (renderização, Suspense, composição), estado de servidor (C2.4) e HTTP (C1.2). Recomendado: Tailwind e design systems (C2.2).

| Este curso prepara para | Por quê |
|---|---|
| Testes de frontend | o que testar em Server Components, Actions e rotas |
| Performance frontend | imagens, fontes, streaming, Core Web Vitals e cache |
| Arquitetura frontend | organização por funcionalidade, monorepos e BFF |
| Back-end e bancos (C3, C4) | ORMs, APIs e autenticação aprofundadas |
| DevOps e segurança (C6, C7) | Docker, CI/CD, cabeçalhos e proteção de aplicações |

Ordem interna: aulas 1 a 4 (rotas e componentes) → 5 a 7 (dados, mutações e renderização) → 8 e 9 (back-end no Next) → 10 e 11 (produção).`,
    officialRefs: [REF.install, REF.structure, REF.layouts, REF.linking, REF.errors, REF.metadata, REF.serverClient, REF.boundary, REF.rscReact, REF.useClient, REF2.fetching, REF2.caching, REF2.revalidating, REF2.useCache, REF2.mutating, REF2.serverActions, REF2.forms, REF2.dataSecurity, REF2.streaming, REF2.isr, REF2.routeHandlers, REF2.mdnHmac, REF2.mdnCors, REF3.proxy, REF3.auth, REF3.authCache, REF3.redirecting, REF3.owaspSession, REF3.images, REF3.fonts, REF3.scripts, REF3.lazy, REF3.deploying, REF3.selfHosting, REF3.envVars, REF3.checklist, REF3.instrumentation],
    practice: ['Crie um app com layout, loading, error e uma rota dinâmica com generateStaticParams e leia a tabela de rotas do build.', 'Reproduza o 200 de uma rota fora da lista e o 404 com dynamicParams = false.', 'Passe uma função de um Server a um Client Component e corrija a fronteira.', 'Ative cacheComponents e meça o primeiro byte e o total de uma rota com Suspense.', 'Implemente uma Server Action com autenticação, autorização e validação e teste o POST direto.', 'Crie um webhook com verificação HMAC e janela de tempo.', 'Escreva um proxy com matcher e uma camada de acesso a dados server-only.', 'Gere a saída standalone, copie os estáticos e rode o servidor; faça o projeto integrador.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
