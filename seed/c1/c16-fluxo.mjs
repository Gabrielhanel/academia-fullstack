// Curso C1.6 da C1: Fluxo profissional e agilidade (disciplinas: workflow + agile).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c16-a.mjs';
import { REF2, lessonsB } from './c16-b.mjs';
import { exsets, assessment, project } from './c16-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Pull Requests', 'Code Review', 'Documentação técnica', 'Git Flow vs trunk-based development', 'Scrum', 'Kanban', 'Estimativas técnicas'];
export const COVER = {
  'Pull Requests': ['flx-01'],
  'Code Review': ['flx-02'],
  'Documentação técnica': ['flx-03'],
  'Git Flow vs trunk-based development': ['flx-04'],
  'Scrum': ['flx-05'],
  'Kanban': ['flx-06'],
  'Estimativas técnicas': ['flx-07']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Ágil', def: 'Abordagem de desenvolvimento iterativa, com entregas frequentes, colaboração e adaptação a mudanças.' },
  { term: 'Integração contínua (CI)', def: 'Prática de integrar o código com frequência e verificá-lo automaticamente a cada mudança.' },
  { term: 'Entrega contínua (CD)', def: 'Prática de manter o software sempre pronto para ser implantado, com implantação automatizada.' },
  { term: 'Dívida técnica', def: 'Custo futuro acumulado por atalhos e decisões de design que dificultam a evolução do código.' },
  { term: 'Impedimento', def: 'Obstáculo que bloqueia o progresso do trabalho e deve ser removido ou escalado.' },
  { term: 'Backlog refinement', def: 'Atividade contínua de detalhar, estimar e ordenar os itens do Product Backlog.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'fluxo-agilidade', disciplineId: 'workflow', disciplineIds: ['agile'], areaId: 'eng', requires: ['git-github'],
  title: 'Fluxo profissional e agilidade: PRs, revisão, documentação, Scrum, Kanban e estimativas',
  description: 'Como equipes profissionais entregam software juntas: Pull Requests pequenos e bem descritos (merge, squash e rebase com históricos reais), code review com critérios e comentários acionáveis, documentação técnica como código (README, ADRs, runbooks, changelog), estratégias de ramificação (Git Flow, GitHub Flow e trunk-based com feature flags) e as práticas ágeis de Scrum, Kanban e estimativas com dados (Lei de Little, percentis, PERT e Monte Carlo). Os exemplos de Git e os cálculos foram executados (Git 2.53, Node.js 26) e os desafios do laboratório verificam as lógicas puras.',
  objectives: ['Abrir PRs pequenos e descritos e escolher entre merge, squash e rebase prevendo o histórico', 'Revisar código em camadas e escrever comentários claros, respeitosos e acionáveis', 'Produzir documentação técnica útil e mantê-la como código (README, ADR, runbook, changelog)', 'Escolher e aplicar uma estratégia de ramificação (Git Flow, GitHub Flow, trunk-based) com feature flags', 'Aplicar Scrum e Kanban com seus eventos, artefatos, limites de WIP e métricas de fluxo', 'Estimar com honestidade: tamanho relativo, três pontos e previsões com dados históricos'],
  level: 'I', prereqs: ['Git básico: commit, branch, merge e remoto', 'Conta no GitHub (ou outra plataforma) para praticar PRs', 'Noções de testes automatizados e CI são úteis, mas não obrigatórias'], hours: 24,
  syllabus: 'Pull Requests (descrição, tamanho, merge, squash, rebase, Conventional Commits, SemVer, proteções); revisão de código (camadas, comentários, CODEOWNERS, automação); documentação técnica (Diátaxis, README, ADR, runbook, changelog, docs como código); Git Flow, GitHub Flow, trunk-based e feature flags; Scrum (Guia 2020), Kanban (WIP, métricas, Lei de Little, previsão); estimativas (relativa, PERT, velocidade, Monte Carlo).',
  versions: 'Git 2.53 (históricos demonstrados) e Node.js 26 (cálculos), Scrum Guide 2020, Kanban Guide, Conventional Commits 1.0.0, Semantic Versioning 2.0.0 e Keep a Changelog 1.1.0, consultados em 2026-11-18. As funções específicas de plataforma (GitHub: proteção de ramos, CODEOWNERS, modelos de PR, fila de merge) seguem a documentação oficial e não foram executadas, pois exigem conta e repositório remoto. Nomes de menus e recursos de plataformas mudam: consulte a documentação oficial.',
  skills: ['Pull Requests e histórico limpo', 'Code review', 'Documentação técnica', 'Estratégias de ramificação', 'Feature flags', 'Scrum', 'Kanban e métricas de fluxo', 'Estimativas e previsões'],
  modules: [
    { id: 'm1', title: 'Pull Requests, revisão e documentação', lessons: ['flx-01', 'flx-02', 'flx-03'] },
    { id: 'm2', title: 'Estratégias de ramificação', lessons: ['flx-04'] },
    { id: 'm3', title: 'Scrum, Kanban e estimativas', lessons: ['flx-05', 'flx-06', 'flx-07'] }
  ],
  materials: [REF.ghPr, REF.googleReview, REF.convCommits, REF.diataxis, REF2.trunk, REF2.scrum, REF2.kanbanGuide].map((r) => ({ ...r })),
  projectIds: ['guia-contribuicao-e-sprint'],
  supplement: {
    glossary,
    cheatsheet: R`### Pull Requests
Pequeno, focado, descrito (contexto, mudança, como testar), CI verde · §git diff --stat main...feat§ (o que o PR introduz) · §git log main..feat§ · merge (histórico fiel), squash (1 commit), rebase+ff (linear, hashes novos) · nunca reescreva histórico compartilhado · §--force-with-lease§ só no seu ramo

### Conventional Commits e SemVer
§tipo(escopo)!: descrição§ · §feat§ → minor · §fix§/§perf§ → patch · §!§ ou §BREAKING CHANGE:§ → major · demais tipos → sem versão

### Revisão
Contexto → design → correção → testes → segurança → desempenho → legibilidade · aprove quando melhora a saúde do código · prefixos: bloqueio, sugestão, nit, pergunta · CODEOWNERS: a última regra que combina vence · automatize o mecânico (lint, formatação, testes)

### Documentação
Diátaxis: tutorial (aprender), guia prático (resolver), referência (consultar), explicação (entender) · README roda em minutos · ADR: status, contexto, decisão, consequências (imutável) · runbook: passos, comandos, escalonamento · changelog por versão · docs como código (PR, CI, links, Mermaid)

### Ramificação
Git Flow: main, develop, feature, release, hotfix (hotfix → main e develop) · GitHub Flow: tronco + ramos curtos · trunk-based: integração diária, flags, CI rápido · flags: nome, dono, data de remoção, kill switch

### Scrum (Guia 2020)
Transparência, inspeção, adaptação · PO, Scrum Master, Desenvolvedores · Sprint ≤ 1 mês: Planejamento, Daily (15 min), Revisão, Retrospectiva · Product Backlog/Meta do Produto, Sprint Backlog/Meta da Sprint, Incremento/Definição de Pronto

### Kanban e estimativas
Visualizar, limitar WIP, gerenciar fluxo, políticas explícitas · lead time, cycle time, throughput, idade do item · Lei de Little: WIP = vazão × tempo · use percentis (p85) · Monte Carlo sobre a vazão histórica · PERT: (O + 4M + P)/6; desvio (P − O)/6; variâncias somam · intervalos com confiança, não datas únicas`,
    mistakes: ['PRs gigantes com formatação misturada à lógica e descrição vazia.', 'Rebase em ramo compartilhado seguido de force push.', 'Aprovar sem ler porque o CI está verde, ou bloquear por preferência de estilo.', 'Decisões de arquitetura só na cabeça das pessoas; README que não roda.', 'Git Flow por inércia em serviços com deploy contínuo; ramos de feature de semanas.', 'Daily como relatório de status; Sprint sem Meta; itens "quase prontos" contados como concluídos.', 'Quadro Kanban sem limite de WIP; olhar só a média do cycle time.', 'Dar uma data única e tratá-la como promessa; usar pontos para comparar pessoas.'],
    prereqMap: R`**Antes deste curso:** Git básico (curso Git e GitHub na prática) e familiaridade com o fluxo de ramos e commits. Testes automatizados e CI ajudam, mas são tratados no curso de CI/CD.

| Este curso prepara para | Por quê |
|---|---|
| CI/CD e GitHub Actions | PRs, proteções de ramo e estratégias de ramificação alimentam os pipelines |
| Testes e qualidade (Clean Code, SOLID) | revisão de código e Definição de Pronto exigem critérios de qualidade |
| Requisitos e modelagem de domínio | histórias, backlog e refinamento vêm dos requisitos |
| Arquitetura de software | ADRs e documentação técnica registram as decisões |
| Observabilidade e operações | runbooks e post-mortems fecham o ciclo de operação |

Ordem interna: aulas 1 a 3 (PR, revisão, documentação) → 4 (ramificação) → 5 a 7 (Scrum, Kanban, estimativas).`,
    officialRefs: [REF.ghPr, REF.ghMerge, REF.ghTemplate, REF.ghReview, REF.ghOwners, REF.googleReview, REF.convCommits, REF.semver, REF.keepChangelog, REF.adr, REF.diataxis, REF.writeTheDocs, REF.gitRequestPull, REF2.nvie, REF2.trunk, REF2.ghFlow, REF2.flags, REF2.dora, REF2.scrum, REF2.manifesto, REF2.kanbanGuide, REF2.fowlerEst],
    practice: ['Abra um PR pequeno em um repositório seu com descrição, como testar e lista de verificação.', 'Reproduza os três históricos (merge, squash, rebase) em um repositório de teste e compare os grafos.', 'Revise um PR de código aberto (sem comentar publicamente) e escreva cinco comentários classificados.', 'Escreva um README e rode seus comandos em uma máquina ou contêiner limpo.', 'Escreva um ADR para uma decisão real do seu projeto.', 'Monte um quadro Kanban com limites de WIP e registre as datas por duas semanas; calcule cycle time e p85.', 'Faça uma previsão de Monte Carlo com o seu histórico de entregas.', 'Faça o projeto integrador: o guia de contribuição e a simulação de uma Sprint.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
