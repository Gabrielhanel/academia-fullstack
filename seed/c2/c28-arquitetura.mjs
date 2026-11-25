// Curso C2.8 da C2: Arquitetura frontend, monorepos e microfrontends (disciplinas: fe-arch e react).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c28-a.mjs';
import { REF2, lessonsB } from './c28-b.mjs';
import { exsetsA } from './c28-ex-a.mjs';
import { exsetsB, assessment, project } from './c28-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Arquitetura de aplicações React grandes', 'Monorepos (Turborepo, Nx)', 'Microfrontends e Module Federation', 'Comunicação entre microfrontends', 'Quando usar e quando evitar microfrontends'];
export const COVER = {
  'Arquitetura de aplicações React grandes': ['arq-01', 'arq-02'],
  'Monorepos (Turborepo, Nx)': ['arq-03'],
  'Microfrontends e Module Federation': ['arq-04', 'arq-05'],
  'Comunicação entre microfrontends': ['arq-06'],
  'Quando usar e quando evitar microfrontends': ['arq-07']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'ADR', def: 'Architectural Decision Record: registro curto e versionado de uma decisão de arquitetura.' },
  { term: 'BFF', def: 'Backend for Frontend: serviço de servidor feito sob medida para uma interface.' },
  { term: 'Design system', def: 'Conjunto de componentes, tokens e diretrizes compartilhados entre produtos.' },
  { term: 'Feature flag', def: 'Chave que liga ou desliga uma funcionalidade sem novo deploy.' },
  { term: 'Hoisting', def: 'Elevação de dependências para a raiz do repositório pelos gerenciadores de pacotes.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'arquitetura-frontend', disciplineId: 'fe-arch', disciplineIds: ['react'], areaId: 'front', requires: ['javascript-fundamentos', 'typescript-fundamentos', 'html-css-a11y'],
  title: 'Arquitetura frontend: aplicações grandes, monorepos e microfrontends',
  description: 'Como organizar e evoluir um frontend grande: organização por funcionalidade, camadas, API pública e regras de dependência automatizadas (dependency-cruiser); contratos validados em tempo de execução, modelo de erros, observabilidade com redação de dados sensíveis, convenções e ADRs; monorepos com workspaces, Turborepo e Nx (grafo, cache de tarefas, projetos afetados, versionamento); microfrontends (abordagens de integração, shell, preocupações transversais), Module Federation (host, remote, shared, singleton, versões, tipos, segurança), comunicação entre microfrontends (props, URL, eventos com contrato, versionamento) e a decisão sobre quando usar ou evitar microfrontends (lei de Conway, custos, alternativas, migração gradual com strangler fig). Os exemplos foram executados com Turborepo 2.11.13 (cache e afetados), dependency-cruiser 18.9, semver 7.8 e Module Federation com Vite 8.3.8 no Chrome 157, e os desafios do laboratório verificam a lógica pura (camadas, redação de logs, projetos afetados, ordem de build, resolução de remotos, versões de dependências compartilhadas, barramento de eventos e recomendação ponderada).',
  objectives: ['Organizar uma aplicação React grande por funcionalidade, camadas e API pública, com regras verificadas por ferramenta', 'Validar contratos nas fronteiras, padronizar erros e instrumentar a aplicação sem expor dados sensíveis', 'Estruturar um monorepo com workspaces, Turborepo ou Nx e usar cache e tarefas afetadas', 'Explicar e comparar as abordagens de microfrontends e configurar Module Federation com dependências compartilhadas', 'Projetar a comunicação entre microfrontends com contratos versionados e baixo acoplamento', 'Decidir, com critérios e dados, quando usar ou evitar microfrontends e planejar uma migração gradual'],
  level: 'E', prereqs: ['React essencial e avançado (cursos C2.1 e C2.3) e estado (curso C2.4)', 'Next.js (curso C2.5); recomendado testes (C2.6) e performance (C2.7)', 'Ferramentas (C1.3) e Git (Onda 1)', 'Node.js 22 ou superior e Google Chrome para repetir os exemplos'], hours: 22,
  syllabus: 'Organização por funcionalidade, camadas e fronteiras; contratos, erros, observabilidade, convenções e ADRs; workspaces, Turborepo, Nx, cache e afetados; microfrontends e abordagens; Module Federation, shared e versões; comunicação e contratos de eventos; decisão, custos, alternativas e migração gradual.',
  versions: 'Turborepo 2.11.13, dependency-cruiser 18.9.0, semver 7.8.6, @module-federation/vite 1.25.0, Vite 8.3.8, React 19.3.1, verificados com npm em 2026-11-25 (Node.js 26, Chrome 157). Executados: monorepo com npm workspaces e Turborepo (build frio 6,9 s, repetido 90 ms, mudança de pacote base e de folha, filtro de afetados), regras de dependência com dependency-cruiser (3 violações em um mini projeto), faixas de versão com semver e um host e um remote com Module Federation abertos no Chrome (o botão do remote renderizou e reagiu ao clique). Não foram executados: Nx, cache remoto do Turborepo, pnpm, Changesets, conflito de versões em shared, tipos entre host e remote, iframes, Web Components, single-spa, CI e deploy. Essas ferramentas mudam rapidamente: consulte a documentação das versões em uso.',
  skills: ['Arquitetura de módulos e fronteiras', 'Contratos e validação', 'Erros e observabilidade', 'Monorepos e cache de tarefas', 'Microfrontends e Module Federation', 'Comunicação e versionamento de contratos', 'Decisão arquitetural com ADR', 'Migração gradual'],
  modules: [
    { id: 'm1', title: 'Aplicações grandes', lessons: ['arq-01', 'arq-02'] },
    { id: 'm2', title: 'Monorepos', lessons: ['arq-03'] },
    { id: 'm3', title: 'Microfrontends', lessons: ['arq-04', 'arq-05', 'arq-06'] },
    { id: 'm4', title: 'Decisão', lessons: ['arq-07'] }
  ],
  materials: [REF.fsd, REF.depcruise, REF.turboCaching, REF.nxRunTasks, REF2.fowlerMfe, REF2.mfDocs, REF2.conway].map((r) => ({ ...r })),
  projectIds: ['monorepo-dois-apps'],
  supplement: {
    glossary,
    cheatsheet: R`### Aplicações grandes
Por funcionalidade (app, pages, features, entities, shared) · dependências só para baixo · API pública (index) e internals privados · sem ciclos · barrels enxutos · regras automatizadas (dependency-cruiser / lint / Nx boundaries) · dívida em lista que só diminui · CODEOWNERS

### Contratos, erros e observabilidade
Validar dados externos em execução (esquema) · tipos gerados de OpenAPI · erros: categoria, código estável, mensagem clara, recuperável · fronteiras de erro por widget · logs estruturados com correlação, versão e rota · redigir dados sensíveis · ADRs curtos e imutáveis

### Monorepo
Workspaces (npm/pnpm/yarn) · apps/ e packages/ · turbo.json: dependsOn ^build, inputs, outputs · cache por hash (frio 6,9 s -> 90 ms medidos) · pacote base muda = tudo reconstrói · --filter='...[HEAD^1]' / nx affected · ordem = ordenação topológica por níveis · Changesets para bibliotecas publicadas · cache remoto

### Microfrontends
Fatias verticais por domínio · shell fino (rotas, sessão, layout, erros) · abordagens: pacotes (sem deploy independente), execução (Module Federation/single-spa), iframe, Web Component, servidor/edge · design system, estilos isolados, URL como contrato, desempenho (dependências compartilhadas), observabilidade, testes

### Module Federation
remote: name, filename remoteEntry.js, exposes · host: remotes (entry) + import('remoto/Modulo') com lazy/Suspense · shared: singleton, requiredVersion, strictVersion · semver: ^ (0.x especial), ~, >=; ^18 e ^19 não intersectam · fallback, manifesto, CSP, origens confiáveis · tipos por .d.ts gerado ou pacote de contratos

### Comunicação
Props do shell · URL · eventos (CustomEvent/barramento) com nome, esquema, versão e dono · BroadcastChannel entre abas · evitar estado global · validar payload · isolar falhas de ouvintes · limpar assinaturas · v1 e v2 em paralelo com depreciação · testes de contrato

### Decisão
Conway: arquitetura segue a comunicação das equipes · custos (plataforma, desempenho, UX, contratos, depuração) · alternativas: monólito modular, monorepo com pacotes, multi-zonas, flags · critérios ponderados · ADR com critérios de sucesso e revisão · strangler fig com reversibilidade`,
    mistakes: ['Organizar por tipo de arquivo e importar o interior de outras features.', 'Regras de arquitetura só em documentos, sem verificação automática.', 'Confiar nos tipos para dados externos e registrar dados sensíveis em logs.', 'Monorepo sem fronteiras ou com um pacote base enorme que reconstrói tudo.', 'Duas instâncias de React por falta de singleton em shared.', 'Estado global compartilhado e eventos sem contrato entre microfrontends.', 'Adotar microfrontends sem equipes, plataforma e critérios (por moda).', 'Migração sem reversibilidade e decisão sem ADR e revisão.'],
    prereqMap: R`**Antes deste curso:** React essencial e avançado, estado (C2.4) e Next.js (C2.5). Recomendado: testes (C2.6) e performance (C2.7).

| Este curso prepara para | Por quê |
|---|---|
| CI/CD e DevOps (C6) | pipelines de monorepos, cache remoto, deploy independente |
| Arquiteturas e sistemas distribuídos (C8) | contratos, versionamento, consistência e Conway |
| APIs e BFF (C4) | cada microfrontend com sua API e contratos de dados |
| Segurança (C7) | carregamento de código de várias origens, CSP e cadeia de suprimentos |

Ordem interna: aulas 1 e 2 (aplicações grandes) → 3 (monorepos) → 4 a 6 (microfrontends) → 7 (decisão).`,
    officialRefs: [REF.fsd, REF.depcruise, REF.adr, REF.nxBoundaries, REF.reactStructure, REF.zodDocs, REF.errorBoundary, REF.otel, REF.owaspLogging, REF.turboCaching, REF.turboTasks, REF.turboStructure, REF.turboCI, REF.nxRunTasks, REF.npmWorkspaces, REF.pnpmWorkspaces, REF.changesets, REF2.fowlerMfe, REF2.mfeOrg, REF2.singleSpa, REF2.webComponents, REF2.mfDocs, REF2.mfStart, REF2.semver, REF2.customEvent, REF2.broadcast, REF2.conway, REF2.strangler],
    practice: ['Reorganize um app por funcionalidade e configure o dependency-cruiser com as três regras.', 'Valide uma resposta de API com um esquema e padronize o erro; registre um log redigindo campos sensíveis.', 'Crie um monorepo com Turborepo e meça o build frio, o repetido e depois de mudar um pacote base e uma folha.', 'Calcule os projetos afetados e a ordem de build de um grafo.', 'Configure um host e um remote com Module Federation e abra no navegador.', 'Teste o conflito de versões de React em shared e registre o comportamento.', 'Implemente um barramento de eventos com contrato e versione um evento (v1 e v2).', 'Faça o projeto integrador: o monorepo, as regras e o ADR de decisão.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
