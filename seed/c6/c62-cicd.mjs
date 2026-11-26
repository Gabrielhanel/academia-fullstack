// Curso C6.2 da C6: CI/CD e GitHub Actions (disciplina: cicd).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c62-a.mjs';
import { REF2, lessonsB } from './c62-b.mjs';
import { exsets, assessment, project } from './c62-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Conceitos de CI/CD', 'GitHub Actions', 'Pipelines de deploy', 'Blue-green e canary'];
export const COVER = {
  'Conceitos de CI/CD': ['cicd-01'],
  'GitHub Actions': ['cicd-02'],
  'Pipelines de deploy': ['cicd-03'],
  'Blue-green e canary': ['cicd-04']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Lead time', def: 'Tempo entre o commit e a mudança estar em produção.' },
  { term: 'Flaky test', def: 'Teste instável que passa e falha sem mudança no código.' },
  { term: 'Runner hospedado', def: 'Máquina virtual efêmera fornecida pelo GitHub para executar jobs.' },
  { term: 'workflow_dispatch', def: 'Evento que permite disparar um workflow manualmente, com entradas opcionais.' },
  { term: 'Dependabot', def: 'Serviço que abre pull requests para atualizar dependências e ações.' },
  { term: 'Pin por SHA', def: 'Referenciar uma ação pelo hash completo do commit, que é imutável.' },
  { term: 'Smoke test', def: 'Conjunto mínimo de verificações para saber se um deploy subiu.' },
  { term: 'Argo Rollouts', def: 'Controlador do Kubernetes que automatiza canary e blue-green com análise de métricas.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'cicd', disciplineId: 'cicd', areaId: 'ops', requires: [],
  title: 'CI/CD e GitHub Actions: pipelines de entrega, deploy seguro, blue-green e canary',
  description: 'Automatizar o caminho do commit à produção com segurança, com experimentos executados: conceitos (integração, entrega e implantação contínuas, pipeline, artefato imutável, métricas DORA); GitHub Actions (workflows, jobs, matriz, cache, concorrência, permissões mínimas, injeção de script e ações fixadas por SHA), verificados com o actionlint 1.7.12 (ci.yml aprovado; arquivo defeituoso com 4 achados); pipelines de deploy (ambientes, aprovações, OIDC, verificação e rollback, migrações em expandir e contrair; o actionlint achou um erro real de needs no primeiro rascunho do deploy.yml); e liberação progressiva com nginx 1.31.10 (canary 9:1 → 180 x 20 em 200 requisições; troca blue-green sob 300 requisições com 300 respostas 200; rollback; weight=0 recusado e reload falho que mantém a configuração antiga). Projeto: pipeline de entrega. Os workflows não rodaram em um GitHub real; OIDC, ambientes, GitLab CI, Jenkins e Argo Rollouts não foram executados.',
  objectives: ['Diferenciar CI, entrega contínua e implantação contínua e desenhar um pipeline', 'Escrever workflows do GitHub Actions seguros e verificá-los com o actionlint', 'Projetar deploys com ambientes, credenciais efêmeras, verificação e rollback', 'Aplicar blue-green e canary e medir a distribuição e a troca de tráfego', 'Usar as métricas DORA para melhorar o sistema de entrega'],
  level: 'M', prereqs: ['Git e testes automatizados (Ondas anteriores e C5)', 'Docker básico (C6.1)', 'Docker 29 ou superior (o curso usa 29.9.3)'], hours: 8,
  syllabus: 'Conceitos de CI/CD; GitHub Actions; pipelines de deploy; blue-green e canary; projeto de pipeline de entrega.',
  versions: 'Docker 29.9.3, actionlint 1.7.12 (imagem rhysd/actionlint) e nginx 1.31.10 (imagem nginx:alpine), em 2026-11-25 (laboratório em seed/c6/labs/cicd/). Medidas de uma execução, com tráfego sintético de curl. Achados: o actionlint pegou um erro de needs no primeiro rascunho do deploy.yml; o nginx recusou weight=0 e manteve a configuração antiga no reload. Os desafios de código são em JavaScript e modelam a lógica. Não executados: GitHub Actions real (nenhum job, cache, ambiente ou segredo), OIDC com nuvem, GitLab CI, Jenkins, Argo Rollouts, canary com métricas e automação, migrações de banco.',
  skills: ['Pipelines de CI/CD', 'GitHub Actions', 'Segurança de workflows', 'Estratégias de deploy', 'Blue-green e canary', 'Métricas DORA'],
  modules: [
    { id: 'm1', title: 'Conceitos e GitHub Actions', lessons: ['cicd-01', 'cicd-02'] },
    { id: 'm2', title: 'Deploy e liberação progressiva', lessons: ['cicd-03', 'cicd-04'] }
  ],
  materials: [REF.fowlerCI, REF.dora, REF.ghaDocs, REF2.fowlerBlueGreen, REF2.fowlerCanary].map((r) => ({ ...r })),
  projectIds: ['pipeline-de-entrega'],
  supplement: {
    glossary,
    cheatsheet: R`### Conceitos
CI = integrar e verificar com frequência · entrega contínua = pronto para publicar (humano decide) · implantação contínua = publica sozinho · construa uma vez, promova o mesmo artefato · feedback rápido · DORA: frequência, lead time, taxa de falha, recuperação

### GitHub Actions
on (push, pull_request, schedule, workflow_dispatch, workflow_call) · jobs em paralelo, needs para ordem · matriz · cache · concurrency · timeout-minutes · permissions mínimas · npm ci · actionlint no CI e pre-commit

### Segurança
Menor privilégio · segredos em secrets · valor não confiável → env, nunca na expressão do run · ações por SHA · cuidado com pull_request_target · OIDC em vez de chaves longas

### Deploy
publicar → homologação → produção · ambientes com revisores · concurrency sem cancelar · smoke test + métricas · rollback ensaiado · expandir e contrair · needs lista todos os jobs cujas saídas usa

### Liberação progressiva
Rolling · blue-green (troca instantânea, capacidade dobrada) · canary (fração + métricas) · feature flag · nginx: down (nunca weight=0), nginx -t, reload, conferir o tráfego`,
    mistakes: ['Ramos longos com ferramenta de CI.', 'GITHUB_TOKEN com permissões amplas.', 'Interpolar título de issue ou nome de ramo no run.', 'Reconstruir o artefato por ambiente.', 'cancel-in-progress em deploys.', 'Usar weight=0 e não conferir o resultado do reload.', 'Canary sem métricas.', 'Migração de banco sem caminho de volta.'],
    prereqMap: R`**Antes deste curso:** Git, testes automatizados (C5) e Docker (C6.1).

| Este curso prepara para | Por quê |
|---|---|
| Nginx (C6.3) | a borda que divide e troca tráfego |
| Cloud (C6.4) | OIDC, ambientes e serviços de implantação gerenciados |
| IaC (C6.5) | infraestrutura também entra no pipeline |
| Monitoramento (C6.6) | métricas que decidem promoções e rollbacks |

Ordem interna: conceitos → GitHub Actions → deploy → blue-green e canary → projeto.`,
    officialRefs: [REF.fowlerCI, REF.fowlerPipeline, REF.dora, REF.trunk, REF.ghaDocs, REF.ghaSyntax, REF.ghaSecurity, REF.ghaCache, REF.ghaOidc, REF.actionlint, REF2.ghaEnv, REF2.ghaOidcAws, REF2.fowlerBlueGreen, REF2.fowlerCanary, REF2.fowlerParallel, REF2.nginxUpstream, REF2.nginxControl, REF2.argoRollouts],
    practice: ['Rode o actionlint em um workflow seu e corrija os achados.', 'Reescreva um run vulnerável usando env.', 'Monte um deploy com dois ambientes e confira os needs.', 'Meça a distribuição de um canary com nginx.', 'Faça uma troca blue-green sob carga e meça os códigos HTTP.', 'Provoque um reload inválido e confira que a configuração antiga permanece.', 'Faça o projeto integrador: pipeline de entrega.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
