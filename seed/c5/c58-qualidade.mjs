// Curso C5.8 da C5: Qualidade e manutenção de software (disciplina: quality).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c58-a.mjs';
import { REF2, lessonsB } from './c58-b.mjs';
import { exsets, assessment, project } from './c58-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB]);
const ex = dolar(exsets);

export const TOPICS = ['O que é qualidade de software', 'Code review eficaz', 'Métricas de código', 'Refatoração contínua', 'Gestão de dívida técnica', 'Engenharia de confiabilidade (SRE) para desenvolvedores'];
export const COVER = {
  'O que é qualidade de software': ['qual-01'],
  'Code review eficaz': ['qual-02'],
  'Métricas de código': ['qual-03'],
  'Refatoração contínua': ['qual-04'],
  'Gestão de dívida técnica': ['qual-04'],
  'Engenharia de confiabilidade (SRE) para desenvolvedores': ['qual-05']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Golden signals', def: 'Quatro sinais de monitoramento de serviços: latência, tráfego, erros e saturação.' },
  { term: 'Runbook', def: 'Guia passo a passo para diagnosticar e mitigar um problema operacional conhecido.' },
  { term: 'Canário', def: 'Implantação gradual para uma pequena parcela do tráfego, observada antes da liberação total.' },
  { term: 'Game day', def: 'Simulação planejada de falha para treinar a resposta e testar a resiliência.' },
  { term: 'On-call', def: 'Plantão em que uma pessoa fica responsável por responder a incidentes do serviço.' },
  { term: 'WIP', def: 'Work in progress: quantidade de trabalho em andamento ao mesmo tempo.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'qualidade-manutencao', disciplineId: 'quality', areaId: 'eng', requires: [],
  title: 'Qualidade e manutenção de software: atributos, revisão de código, métricas, dívida técnica e SRE para desenvolvedores',
  description: 'Como definir, medir e sustentar a qualidade ao longo do tempo: atributos da ISO/IEC 25010 e cenários mensuráveis; code review eficaz (tamanho de PR XS a XL, checklist, comentários com intenção); métricas de código e de entrega (complexidade, hotspots churn × complexidade, fator de ônibus e as quatro DORA, com mediana e cuidado com Goodhart); refatoração contínua e gestão da dívida técnica (priorização por hotspot, juros e risco, capacidade fixa e Strangler); e SRE para desenvolvedores (SLIs, SLOs, orçamento de erro de 43,2 min a 99,9%, alertas por taxa de queima em múltiplas janelas, resposta a incidentes e postmortems sem culpados). Os cálculos foram executados (5 testes, incluindo um erro de ponto flutuante na taxa de queima), mas os dados de histórico Git, entregas e incidentes são SINTÉTICOS e declarados. SonarQube, CodeScene, Prometheus/Alertmanager, plataformas de incidentes e medições em equipes reais não foram executados. Projeto: programa de qualidade e manutenção.',
  objectives: ['Definir qualidade por atributos e cenários mensuráveis', 'Conduzir e melhorar a revisão de código', 'Usar métricas de código e de entrega sem transformá-las em metas', 'Planejar a manutenção contínua e a dívida técnica com dados', 'Definir SLOs, orçamento de erro, alertas e postmortems'],
  level: 'A', prereqs: ['Clean Code (C5.1), Testes (C5.4 a C5.6) e Documentação arquitetural (C5.3) recomendados', 'Git básico', 'Node.js (para os cálculos do laboratório)'], hours: 10,
  syllabus: 'Qualidade de software; code review; métricas de código e de entrega; refatoração contínua e dívida técnica; SRE para desenvolvedores; projeto.',
  versions: 'Node.js 26.13.1 e Git, sem dependências externas, em 2026-11-25 (laboratório em seed/c5/labs/qualidade-manutencao/). IMPORTANTE: histórico Git (43 commits, 3 autores), dados de implantações e incidentes são SINTÉTICOS, gerados por script para ilustrar os cálculos; não representam nenhuma equipe real. Os limites de tamanho de PR (10, 50, 200 e 500 linhas) e as janelas de alerta (14,4x e 6x do Workbook de SRE) são convenções. A complexidade do laboratório é uma contagem simples de palavras-chave. Achado: 1 − 0.999 em ponto flutuante deixa a taxa de queima em 0,9999999999999991; a função arredonda a 6 casas. Os desafios de código são em JavaScript. Não executados: SonarQube, CodeScene, Prometheus e Alertmanager, PagerDuty/Opsgenie, canário, caos e medições em equipes reais.',
  skills: ['Atributos e cenários de qualidade', 'Code review', 'Métricas de código e DORA', 'Hotspots e fator de ônibus', 'Gestão da dívida técnica', 'SLOs, orçamento de erro e postmortems'],
  modules: [
    { id: 'm1', title: 'Qualidade e revisão', lessons: ['qual-01', 'qual-02'] },
    { id: 'm2', title: 'Métricas e dívida', lessons: ['qual-03', 'qual-04'] },
    { id: 'm3', title: 'Confiabilidade', lessons: ['qual-05'] }
  ],
  materials: [REF.iso25010, REF.googleReview, REF.dora, REF.hotspots, REF2.fowlerDebt, REF2.sloChapter].map((r) => ({ ...r })),
  projectIds: ['programa-de-qualidade'],
  supplement: {
    glossary,
    cheatsheet: R`### Qualidade
Atributos (ISO/IEC 25010): adequação funcional, desempenho, compatibilidade, usabilidade, confiabilidade, segurança, manutenibilidade, portabilidade · cenário = estímulo + ambiente + medida · trade-offs → ADR · interna → externa → em uso

### Code review
PR pequeno (XS ≤ 10, S ≤ 50, M ≤ 200, L ≤ 500, XL > 500 linhas: heurística) · descrição com contexto/motivo/teste/riscos · automatizar o mecânico · prefixos nit/sugestão/pergunta/bloqueante/elogio · aprovar se melhora a saúde do código · primeira resposta em 1 dia útil

### Métricas
Complexidade ciclomática (decisões + 1) e cognitiva (aninhamento) · hotspot = churn × complexidade · fator de ônibus = concentração de autoria · DORA: frequência, lead time, taxa de falha, tempo de restauração (mediana!) · Goodhart · dados do laboratório SINTÉTICOS

### Dívida e manutenção
Refatoração contínua (escoteiro, preparatória, na revisão) · priorizar: hotspot × juros/payback × risco · adiar código feio e estável · capacidade fixa ~15% · Strangler · marcador DÍVIDA(tíquete, gatilho) · definição de pronto com portões

### SRE
SLI (eventos bons ÷ válidos) · SLO (99,9% em 30 dias = 43,2 min; 99% = 432; 99,99% = 4,32) · orçamento = 1 − SLO · queima = erro ÷ orçamento · 14,4x/1 h = 2% (pagina), 6x/6 h = 5% (chamado) em duas janelas · mitigar primeiro · postmortem sem culpados com ações · toil · cuidado com ponto flutuante`,
    mistakes: ['Reduzir qualidade a "zero bugs".', 'Requisitos de qualidade em adjetivos.', 'PRs gigantes e comentários vagos ou pessoais.', 'Transformar métricas em metas ou usá-las para julgar pessoas.', 'Usar média em vez de mediana e tirar conclusões de amostras pequenas.', 'Pagar o código mais feio em vez do mais caro.', 'SLO de 100% e alertas por causa isolada.', 'Postmortem que procura culpados.'],
    prereqMap: R`**Antes deste curso:** Clean Code (C5.1), Fundamentos de testes (C5.4) e ferramentas e testes avançados (C5.5 e C5.6) ajudam a interpretar as métricas; ADRs (C5.3) para registrar trade-offs.

| Este curso prepara para | Por quê |
|---|---|
| Arquitetura e resiliência (C8) | requisitos de qualidade, SLOs e fitness functions |
| CI/CD, monitoramento e cloud (C6) | pipelines, alertas e rollouts seguros |
| Segurança (C7) | qualidade como requisito de segurança e resposta a incidentes |
| Liderança técnica (C11) | métricas, comunicação e priorização com o negócio |

Ordem interna: aulas 1 e 2 (qualidade e revisão) → 3 e 4 (métricas e dívida) → 5 (SRE).`,
    officialRefs: [REF.iso25010, REF.googleReview, REF.reviewStandard, REF.smallCls, REF.conventionalComments, REF.pullRequest, REF.cyclomatic, REF.cognitive, REF.hotspots, REF.busFactor, REF.dora, REF2.fowlerDebt, REF2.opportunistic, REF2.fowlerRefactoringCatalog, REF2.sloChapter, REF2.embracingRisk, REF2.alertingSlos, REF2.postmortem, REF2.toil],
    practice: ['Reescreva três requisitos "adjetivos" do seu projeto como cenários mensuráveis.', 'Classifique os últimos PRs do seu repositório por tamanho e discuta os maiores.', 'Rode a análise de hotspots no seu repositório e discuta o resultado criticamente.', 'Calcule as quatro métricas DORA de um período (com mediana) e anote as limitações.', 'Priorize três itens de dívida com hotspot, juros e risco e proponha um plano para um trimestre.', 'Defina um SLI e um SLO de uma jornada crítica e calcule o orçamento de erro.', 'Escreva as duas regras de alerta por taxa de queima e teste as janelas.', 'Faça o projeto integrador: programa de qualidade e manutenção.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
