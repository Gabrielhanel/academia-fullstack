// Gera seed.json: a base de conhecimento inicial da v2 (catálogo, trilhas, projetos, páginas, radar, curso piloto).
import { RAW, TRACKS, PROJECTS } from './v1data.mjs';
import { PILOT } from './pilot.mjs';
import { LOGICA } from './courses/logica.mjs';
import { GIT } from './courses/git.mjs';
import { HTMCSS } from './courses/htm.mjs';
import { JS } from './courses/js.mjs';
import { TS } from './courses/ts.mjs';
// Onda 1: cursos produzidos em ordem; cada um entra aqui só depois de validado.
const WAVE1 = [LOGICA, GIT, HTMCSS, JS, TS];
import { writeFileSync, readFileSync } from 'node:fs';

const NOW = '2026-11-17T22:00:00.000Z';
const parseMods = (s) => { const o = []; s.split('|').forEach((g) => { const lv = g.slice(0, 1); g.slice(2).split(';').forEach((t) => o.push({ lv, t: t.trim() })); }); return o; };

// 1) Catálogo v1 convertido
let areas = RAW.map(([id, name, desc, ds]) => ({ id, name, desc, disciplines: ds.map(([did, dn, ms]) => ({ id: did, name: dn, syllabus: parseMods(ms), courses: [] })) }));
const area = (id) => areas.find((a) => a.id === id);
const take = (fromId, ids) => { const a = area(fromId); const out = a.disciplines.filter((d) => ids.includes(d.id)); a.disciplines = a.disciplines.filter((d) => !ids.includes(d.id)); return out; };

// 2) Reorganização pedida: Flutter e Dart, Engenharia de software e System Design viram áreas próprias
const flutter = take('mobile', ['dart', 'flutter']);
const eng = take('career', ['workflow', 'agile']);
areas.splice(areas.findIndex((a) => a.id === 'mobile') + 1, 0, { id: 'flutter-dart', name: 'Flutter e Dart', desc: 'Apps multiplataforma com Flutter, do Dart básico à publicação.', disciplines: [...flutter,
  { id: 'flutter-arch', name: 'Arquitetura de apps Flutter', syllabus: parseMods('M:Organização por features;Separação entre UI, estado e dados|A:Clean Architecture com Flutter;Repositórios e casos de uso;Injeção de dependências|E:Modularização de apps grandes e monorepos com Melos'), courses: [] }] });
areas.push({ id: 'eng', name: 'Engenharia de software', desc: 'Processo, requisitos, qualidade e colaboração.', disciplines: [...eng,
  { id: 'requirements', name: 'Requisitos e modelagem de domínio', syllabus: parseMods('I:Requisitos funcionais e não funcionais;Histórias de usuário e critérios de aceitação|M:Event Storming;Especificação por exemplos (BDD)|A:Modelagem de domínio com DDD'), courses: [] },
  { id: 'quality', name: 'Qualidade e manutenção de software', syllabus: parseMods('I:O que é qualidade de software|M:Code review eficaz;Métricas de código|A:Refatoração contínua;Gestão de dívida técnica|E:Engenharia de confiabilidade (SRE) para desenvolvedores'), courses: [] },
  { id: 'devtools', name: 'Ferramentas do desenvolvedor', syllabus: parseMods('I:Editor, terminal e atalhos;Depuração no navegador|M:Depuração no Node.js;Linters e formatadores (ESLint, Prettier)|A:Automação com scripts e hooks de Git'), courses: [] }] });
areas.push({ id: 'sysdesign', name: 'System Design', desc: 'Projetar sistemas escaláveis, confiáveis e econômicos.', disciplines: [
  { id: 'sd-fund', name: 'Fundamentos de System Design', syllabus: parseMods('M:Requisitos e estimativas de capacidade;Latência, throughput e disponibilidade|A:Replicação e particionamento;Consistência, CAP e PACELC;Filas, cache e CDN em arquitetura|E:Trade-offs e documentação de decisões'), courses: [] },
  { id: 'sd-cases', name: 'Estudos de caso de System Design', syllabus: parseMods('A:Encurtador de URLs;Rate limiter distribuído;Sistema de notificações|E:Feed de notícias;Chat em tempo real;Sistema de pagamentos'), courses: [] }] });
area('front').disciplines.push({ id: 'browser', name: 'APIs do navegador e Web Platform', syllabus: parseMods('I:DOM e eventos|M:Storage, IndexedDB e Cache API;Web Workers|A:Service Workers e PWA;WebSockets e Server-Sent Events'), courses: [] });
area('back').disciplines.push({ id: 'python', name: 'Python para desenvolvedores', syllabus: parseMods('I:Sintaxe e tipos;Funções e módulos|M:Scripts e automação;APIs com FastAPI|A:Tipagem com type hints;Programação assíncrona com asyncio'), courses: [] });
area('cs').disciplines.push({ id: 'regex', name: 'Expressões regulares', syllabus: parseMods('I:Literais, classes e quantificadores|M:Grupos, âncoras e lookarounds|A:Performance e backtracking catastrófico'), courses: [] });
area('career').name = 'Carreira e preparação profissional';

// 3) Vincula o curso piloto
areas.forEach((a) => a.disciplines.forEach((d) => { if (d.id === 'js') d.courses = ['js-async']; }));
WAVE1.forEach((W) => [W.course.disciplineId, ...(W.course.disciplineIds || [])].forEach((did) => areas.forEach((a) => a.disciplines.forEach((d) => { if (d.id === did && !d.courses.includes(W.course.id)) d.courses.push(W.course.id); }))));

const tracks = [...TRACKS, { id: 'sd', name: 'System Design', desc: 'Fundamentos e estudos de caso para entrevistas e arquitetura real.', ds: ['net', 'sql', 'cache', 'brokers', 'scale', 'sd-fund', 'sd-cases'] }];
const catalog = { version: 2, seedRev: 3, updatedAt: NOW, areas, tracks };

// 4) Projetos: os 12 da v1 + o projeto do curso piloto
const projects = [...PROJECTS.map((p) => ({ ...p, status: 'published', version: 1, updatedAt: NOW })), { ...PILOT.project, status: 'published', version: 1, updatedAt: NOW }, ...WAVE1.map((W) => W.project)];

// 5) Páginas de referência (conteúdo que antes estava fixo no código)
const pages = {
  'comparar-mobile': { id: 'comparar-mobile', title: 'Flutter, React Native ou Kotlin nativo?', status: 'published', version: 1, updatedAt: NOW, tags: ['flutter', 'react-native', 'kotlin'], md: `Não existe vencedor absoluto. A escolha depende do time, do produto e das plataformas-alvo. Use a tabela como ponto de partida e valide com uma prova de conceito.

| Critério | Flutter | React Native | Kotlin nativo (Android) |
|---|---|---|---|
| Linguagem | Dart | JavaScript / TypeScript | Kotlin |
| Como desenha a UI | Motor de renderização próprio (Impeller); desenha os próprios widgets | Mapeia componentes React para views nativas | Views nativas; UI moderna com Jetpack Compose |
| Plataformas | Android, iOS, web e desktop | Android e iOS (web e desktop via comunidade) | Android. iOS exige Swift ou Kotlin Multiplatform para lógica compartilhada |
| APIs nativas | Plugins ou platform channels | Bibliotecas e Turbo Modules | Acesso direto |
| Consistência visual | Mesmo visual em todas as plataformas | Segue os componentes de cada plataforma | Total aderência ao Android |
| Reuso de conhecimento | Dart é usado principalmente com Flutter | Reaproveita React e o ecossistema web | Reaproveita Kotlin no backend (Spring, Ktor) |
| Atualizações sem loja | Sem solução oficial do Google; há serviços de terceiros | EAS Update (Expo), respeitando as regras das lojas | Não |
| Principais desvantagens | Binário maior; dependência de plugins | Dependência de bibliotecas de terceiros; upgrades trabalhosos | Duas bases de código se também houver iOS |

Desempenho: os três atendem a maioria dos apps de negócio. Diferenças aparecem em casos extremos. Meça no seu caso, em build de release.

## Quando escolher cada um
- **Flutter:** UI muito customizada e idêntica nas plataformas; time pequeno entregando nas duas lojas.
- **React Native:** time que já domina React e TypeScript; necessidade de atualizações OTA.
- **Kotlin nativo:** uso intenso de hardware ou APIs recém-lançadas; app Android-first; performance crítica.

## Conceitos equivalentes
| Conceito | Flutter | React Native | Kotlin/Android |
|---|---|---|---|
| Componente de UI | Widget | Componente React | Composable |
| Estado | Provider, Riverpod, Bloc/Cubit | useState, Zustand, Redux Toolkit, TanStack Query | ViewModel + StateFlow |
| Navegação | Navigator, go_router | React Navigation, Expo Router | Navigation Compose |
| Injeção de dependências | get_it, Riverpod | Context, injeção manual | Hilt, Koin |
| Persistência local | shared_preferences, sqflite, drift | AsyncStorage, expo-sqlite, SecureStore | DataStore, Room |
| Assincronia | Future, Stream, Isolates | Promise, async/await | Coroutines, Flow |
| Testes | flutter_test, integration_test | Jest, Testing Library, Detox ou Maestro | JUnit, Compose UI Test, Espresso |
| CI/CD | GitHub Actions, Codemagic, fastlane | EAS Build/Submit, GitHub Actions | Gradle + GitHub Actions, fastlane |

## Como decidir
1. Liste plataformas-alvo, recursos nativos obrigatórios e prazo.
2. Avalie o conhecimento do time e a contratação na sua região.
3. Construa a mesma tela crítica nas opções finalistas e meça.
4. Registre a decisão em um ADR.

Referências oficiais: https://docs.flutter.dev · https://reactnative.dev · https://docs.expo.dev · https://developer.android.com · https://kotlinlang.org/docs/multiplatform.html` }
};

pages['arquitetura'] = { id: 'arquitetura', title: 'Arquitetura da plataforma (v2)', status: 'published', version: 1, updatedAt: NOW, tags: ['arquitetura'], md: readFileSync(new URL('./arch.md', import.meta.url), 'utf8') };

// 6) Radar: entradas reais, verificadas em endoflife.date em 17/11/2026 (fonte comunitária; confirmar no repositório oficial)
const rad = (o) => ({ status: 'publicado', createdAt: NOW, sourceKind: 'comunitaria', verifiedAt: '2026-11-17', ...o });
const radar = [
  rad({ id: 'nodejs-eol-20', key: 'endoflife:nodejs:20:eol', tech: 'nodejs', type: 'depreciacao', relevance: 'alta', title: 'Node.js 20 sem suporte de segurança desde 30/04/2026', version: '20.20.2', date: '2026-04-30', url: 'https://endoflife.date/nodejs', summary: 'A linha 20 (LTS) não recebe mais correções de segurança. Projetos em Node.js 20 devem migrar para 24 ou 26 (LTS).', lessonIds: ['jsa-07'] }),
  rad({ id: 'nodejs-26-13-1', key: 'endoflife:nodejs:26:26.13.1', tech: 'nodejs', type: 'versao', relevance: 'media', title: 'Node.js 26.13.1 (LTS)', version: '26.13.1', date: '2026-11-11', url: 'https://endoflife.date/nodejs', summary: 'Última versão da linha 26 (LTS), com suporte ativo até 27/10/2027 e de segurança até 30/04/2029, segundo endoflife.date.', lessonIds: [] }),
  rad({ id: 'nodejs-22-eol-soon', key: 'endoflife:nodejs:22:eol-2027-04-30', tech: 'nodejs', type: 'depreciacao', relevance: 'alta', title: 'Node.js 22 perde suporte de segurança em 30/04/2027', version: '22.23.5', date: '2026-11-11', url: 'https://endoflife.date/nodejs', summary: 'A linha 22 está em manutenção e deixa de receber correções de segurança em 30/04/2027. Planeje a migração.', lessonIds: [] }),
  rad({ id: 'react-19-3-1', key: 'endoflife:react:19:19.3.1', tech: 'react', type: 'versao', relevance: 'informativa', title: 'React 19.3.1', version: '19.3.1', date: '2026-10-14', url: 'https://endoflife.date/react', summary: 'Última versão da linha 19, segundo endoflife.date. Confira as notas no repositório facebook/react.', lessonIds: [] }),
  rad({ id: 'nextjs-16-4-6', key: 'endoflife:nextjs:16:16.4.6', tech: 'nextjs', type: 'versao', relevance: 'media', title: 'Next.js 16.4.6', version: '16.4.6', date: '2026-11-09', url: 'https://endoflife.date/nextjs', summary: 'Última versão da linha 16, segundo endoflife.date.', lessonIds: [] }),
  rad({ id: 'nextjs-15-eol', key: 'endoflife:nextjs:15:eol-2027-01-31', tech: 'nextjs', type: 'depreciacao', relevance: 'alta', title: 'Next.js 15 perde suporte de segurança em 31/01/2027', version: '15.5.29', date: '2026-11-03', url: 'https://endoflife.date/nextjs', summary: 'Projetos em Next.js 15 devem planejar a migração para a linha 16.', lessonIds: [] })
];
const radarCfg = { id: 'main', updatedAt: NOW, techs: [
  ['react', 'React', 'facebook/react'], ['nextjs', 'Next.js', 'vercel/next.js'], ['typescript', 'TypeScript', 'microsoft/TypeScript'], ['react-native', 'React Native', 'facebook/react-native'], ['flutter', 'Flutter', 'flutter/flutter'], ['dart', 'Dart', 'dart-lang/sdk'], ['kotlin', 'Kotlin', 'JetBrains/kotlin'], ['java', 'Java (OpenJDK)', 'openjdk/jdk'], ['nodejs', 'Node.js', 'nodejs/node'], ['nestjs', 'NestJS', 'nestjs/nest'], ['postgresql', 'PostgreSQL', 'postgres/postgres'], ['redis', 'Redis', 'redis/redis'], ['docker', 'Docker', 'moby/moby'], ['kubernetes', 'Kubernetes', 'kubernetes/kubernetes'], ['rabbitmq', 'RabbitMQ', 'rabbitmq/rabbitmq-server'], ['kafka', 'Apache Kafka', 'apache/kafka'], ['aws', 'AWS', ''], ['azure', 'Azure', ''], ['gcp', 'Google Cloud', ''], ['jest', 'Jest', 'jestjs/jest'], ['vitest', 'Vitest', 'vitest-dev/vitest'], ['playwright', 'Playwright', 'microsoft/playwright'], ['cypress', 'Cypress', 'cypress-io/cypress']
].map(([id, name, repo]) => ({ id, name, repo })) };

// 7) Biblioteca de referências curadas (a partir das referências do curso piloto)
const refs = []; const seen = new Set();
[...PILOT.lessons, ...WAVE1.flatMap((W) => W.lessons)].forEach((l) => l.refs.forEach((r) => { if (r.url && !seen.has(r.url)) { seen.add(r.url); refs.push({ id: 'ref-' + refs.length, ...r, tech: /developer\.mozilla\.org\/.*(Web\/CSS|Structuring_content|CSS_layout|Styling_basics|Accessibility)/.test(r.url) ? 'html-css' : /mozilla|tc39|nodejs/.test(r.url) ? 'javascript' : /typescriptlang\.org/.test(r.url) ? 'typescript' : /git-scm|github|conventionalcommits|semver|trunkbased/.test(r.url) ? 'git' : /w3\.org|WCAG|Accessibility/.test(r.url) ? 'acessibilidade' : /developer\.mozilla/.test(r.url) ? 'html-css' : 'computacao', category: r.kind === 'spec' ? 'especificacao' : r.kind === 'book' ? 'livro' : r.kind === 'course' ? 'curso' : 'documentacao', reliability: r.kind === 'article' ? 'media' : 'alta', addedAt: NOW, lessonIds: [...PILOT.lessons, ...WAVE1.flatMap((W) => W.lessons)].filter((x) => x.refs.some((y) => y.url === r.url)).map((x) => x.id), status: 'published' }); } }));

const seed = { catalog, courses: [PILOT.course, ...WAVE1.map((W) => W.course)], lessons: [...PILOT.lessons, ...WAVE1.flatMap((W) => W.lessons)], exsets: Object.assign({}, PILOT.exsets, ...WAVE1.map((W) => W.exsets)), assessments: [PILOT.assessment, ...WAVE1.map((W) => W.assessment)], projects, pages, radar, radarCfg, refs };
writeFileSync(new URL('./seed.json', import.meta.url), JSON.stringify(seed, null, 1));
const nd = areas.reduce((s, a) => s + a.disciplines.length, 0);
console.log('áreas', areas.length, 'disciplinas', nd, 'cursos', seed.courses.length, 'aulas', seed.lessons.length, 'exercícios', Object.values(seed.exsets).reduce((s, e) => s + e.items.length, 0), 'avaliações', seed.assessments.length, 'projetos', projects.length, 'radar', radar.length, 'refs', refs.length, 'bytes', JSON.stringify(seed).length);
