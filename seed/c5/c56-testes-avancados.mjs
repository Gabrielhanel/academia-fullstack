// Curso C5.6 da C5: Contrato, carga e análise estática (disciplina: test-adv).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c56-a.mjs';
import { REF2, lessonsB } from './c56-b.mjs';
import { exsets, assessment, project } from './c56-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['Testes de contrato (Pact)', 'Testes de carga (k6)', 'Testes de estresse', 'Code coverage e análise estática'];
export const COVER = {
  'Testes de contrato (Pact)': ['tav-01'],
  'Testes de carga (k6)': ['tav-02'],
  'Testes de estresse': ['tav-03'],
  'Code coverage e análise estática': ['tav-04']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'SLO', def: 'Service Level Objective: meta de nível de serviço (por exemplo, p95 abaixo de 300 ms).' },
  { term: 'SAST', def: 'Static Application Security Testing: análise estática de código para encontrar vulnerabilidades.' },
  { term: 'DAST', def: 'Dynamic Application Security Testing: teste de segurança sobre a aplicação em execução.' },
  { term: 'Event loop lag', def: 'Atraso do laço de eventos do Node, indicador de bloqueio por trabalho síncrono.' },
  { term: 'Think time', def: 'Pausa simulada entre ações de um usuário virtual para refletir o comportamento real.' },
  { term: 'Soak test', def: 'Teste de resistência com carga moderada por horas para achar vazamentos.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'testes-avancados', disciplineId: 'test-adv', areaId: 'test', requires: [],
  title: 'Contrato, carga e análise estática: Pact, k6, estresse, cobertura, mutação e portões de qualidade',
  description: 'Testes que vão além dos funcionais, todos executados em Node.js 26.13.1: contratos orientados ao consumidor com Pact 17.1.4 (2 interações geradas; verificação do provedor correta e falha ao renomear nome para name; campo extra não quebra), carga com k6 em Docker (smoke p95 2,8 ms; 50 it/s em modelo aberto, 750 requisições, p95 13,0 ms), estresse (vazão estagnada em 35,5 req/s, p95 4,59 s, 119 iterações descartadas, 0% de erros HTTP, saída 99), cobertura com c8 (100% linhas, 92,85% ramos, 75% funções), mutação com Stryker 10.1.1 (69,44% → 97,22%, com um mutante equivalente), tipos com TypeScript 7.0.2 (6 erros em JSDoc), ESLint (7 problemas) e dependency-cruiser (2 violações). Projeto: qualidade automatizada. Pact Broker, can-i-deploy, contratos de mensagens, k6 distribuído, SonarQube, SAST e DAST não foram executados.',
  objectives: ['Escrever e verificar contratos entre consumidor e provedor', 'Desenhar e interpretar testes de carga e de estresse com k6', 'Reconhecer saturação, filas e proteções (backpressure, rate limit)', 'Avaliar a qualidade dos testes com cobertura e mutação', 'Montar portões de qualidade com tipos, lint e regras de arquitetura'],
  level: 'A', prereqs: ['Fundamentos de testes (C5.4) e ferramentas de teste JS (C5.5)', 'Node.js e Express (C4.1)', 'Docker instalado para o k6 (opcional)'], hours: 10,
  syllabus: 'Testes de contrato; testes de carga; estresse; cobertura, mutação e análise estática; projeto.',
  versions: 'Node.js 26.13.1, @pact-foundation/pact 17.1.4 (pact-core 20.2.0), Express 5.3.0, Vitest 5.1.2, k6 (imagem Docker grafana/k6:latest), c8 12.0.0, @stryker-mutator/core e vitest-runner 10.1.1, TypeScript 7.0.2, dependency-cruiser 18.9.0 e ESLint 10.15.0, em 2026-11-25 (laboratório em seed/c5/labs/testes-avancados/). Os números de carga vêm de uma execução com gerador e serviço no mesmo host e servidor de thread única: não representam produção. Achados: o k6 exigiu --user para exportar o resumo; o mutante restante do Stryker é equivalente; a verificação do Pact aceita campos extras. Os desafios de código são em JavaScript e modelam a lógica. Não executados: Pact Broker e can-i-deploy, contratos de mensageria, k6 distribuído ou com navegador, Gatling, JMeter, SonarQube, SAST e DAST.',
  skills: ['Testes de contrato', 'Testes de carga e estresse', 'Análise de saturação', 'Cobertura e mutação', 'Análise estática', 'Portões de qualidade'],
  modules: [
    { id: 'm1', title: 'Contratos e carga', lessons: ['tav-01', 'tav-02'] },
    { id: 'm2', title: 'Estresse e análise estática', lessons: ['tav-03', 'tav-04'] }
  ],
  materials: [REF.pactDocs, REF.k6Docs, REF.k6TestTypes, REF2.stryker, REF2.depCruiser, REF2.sloWorkbook].map((r) => ({ ...r })),
  projectIds: ['qualidade-automatizada'],
  supplement: {
    glossary,
    cheatsheet: R`### Contratos (Pact)
Consumidor define o que usa (matchers de tipo, estados, erros) → arquivo de contrato → provedor verifica no CI · adicionar campo = compatível; renomear/remover/mudar tipo = quebra · broker + can-i-deploy · não substitui integração/E2E · não vale com 1 consumidor no mesmo time

### Carga (k6)
Smoke primeiro · modelo aberto (constant-arrival-rate) x fechado (VUs) · omissão coordenada · thresholds → código de saída (99) · percentis, não média · gerador separado, aquecimento, dados variados, repetição · lei de Little: concorrência = taxa × latência

### Estresse
Escada de taxa → joelho da curva · saturação: vazão estagnada, latência explode, descartes · fila esconde erros (0% de falhas, p95 4,59 s) · respostas: otimizar, escalar, backpressure (503 + Retry-After), rate limit, load shedding · meta de utilização ~60% · testar recuperação, pico e resistência

### Análise de qualidade
c8: linhas, ramos, funções (alarme) · Stryker: mutantes mortos/sobreviventes/sem cobertura, equivalentes · tsc --checkJs --strict (JSDoc) · ESLint (erros, avisos, complexity) · dependency-cruiser (camadas, ciclos, baseline) · portões: rápidos primeiro, baseline no legado, justificar supressões · não pegam desempenho, lógica bem tipada nem integração`,
    mistakes: ['Contratos com valores fixos ou o consumidor mockando o cliente HTTP.', 'Modelo fechado escondendo a degradação.', 'Reportar só a média de latência.', 'Concluir "sem erros, tudo bem" quando a fila escondeu a latência.', 'Aumentar maxVUs para esconder descartes.', 'Perseguir 100% de cobertura ou de mutação como meta.', 'Confiar nos tipos para dados externos.', 'Bloquear o CI por violações antigas sem baseline.'],
    prereqMap: R`**Antes deste curso:** Fundamentos de testes (C5.4) e Ferramentas de teste JS (C5.5); Node/Express (C4.1) para a aula de estresse.

| Este curso prepara para | Por quê |
|---|---|
| Qualidade e manutenção (C5.8) | métricas, SRE e dívida técnica |
| Observabilidade e SLOs (C4.6) | os SLOs que os testes de carga verificam |
| CI/CD e monitoramento (C6) | pipelines e alertas por latência e saturação |
| Microsserviços e arquitetura (C4.7, C8) | contratos, resiliência e proteção contra cascatas |

Ordem interna: aulas 1 e 2 (contratos e carga) → 3 e 4 (estresse e análise estática).`,
    officialRefs: [REF.pactDocs, REF.pactHow, REF.pactJs, REF.pactCanIDeploy, REF.cdc, REF.contractTest, REF.k6Docs, REF.k6Scenarios, REF.k6Thresholds, REF.k6TestTypes, REF.k6OpenClosed, REF2.c8, REF2.stryker, REF2.tsJs, REF2.depCruiser, REF2.eslint, REF2.sloWorkbook],
    practice: ['Escreva um contrato Pact para um endpoint e verifique-o contra o provedor real.', 'Renomeie um campo no provedor e observe a falha; adicione um campo e observe que passa.', 'Escreva um smoke e um teste de carga em modelo aberto com thresholds.', 'Suba a taxa até saturar e interprete vazão, p95 e descartes.', 'Implemente um limite de concorrência com 503 e repita o estresse.', 'Rode c8 e Stryker e escreva testes de fronteira para os sobreviventes.', 'Configure checkJs, ESLint e uma regra de arquitetura no dependency-cruiser.', 'Faça o projeto integrador: qualidade automatizada.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
