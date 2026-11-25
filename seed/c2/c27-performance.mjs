// Curso C2.7 da C2: Performance frontend (disciplina: fe-perf).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c27-a.mjs';
import { REF2, lessonsB } from './c27-b.mjs';
import { REF3, lessonsC } from './c27-c.mjs';
import { exsetsA } from './c27-ex-a.mjs';
import { exsetsB, assessment, project } from './c27-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Core Web Vitals', 'Lazy loading e code splitting', 'Otimização de imagens e fontes', 'Profiling com DevTools', 'Memoização no React', 'Orçamento de performance e RUM'];
export const COVER = {
  'Core Web Vitals': ['pfe-01', 'pfe-02'],
  'Lazy loading e code splitting': ['pfe-03', 'pfe-04'],
  'Otimização de imagens e fontes': ['pfe-05'],
  'Profiling com DevTools': ['pfe-06'],
  'Memoização no React': ['pfe-07'],
  'Orçamento de performance e RUM': ['pfe-08']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'FCP', def: 'First Contentful Paint: tempo até o primeiro conteúdo ser desenhado.' },
  { term: 'TTI', def: 'Time to Interactive: tempo até a página ficar de forma confiável interativa.' },
  { term: 'Brotli', def: 'Algoritmo de compressão usado em respostas HTTP, em geral mais eficiente que o gzip para texto.' },
  { term: 'CDN', def: 'Rede de distribuição de conteúdo que serve arquivos de locais próximos à pessoa usuária.' },
  { term: 'Cache-Control', def: 'Cabeçalho HTTP que define por quanto tempo e como uma resposta pode ser guardada em cache.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'performance-frontend', disciplineId: 'fe-perf', areaId: 'front', requires: ['javascript-fundamentos', 'typescript-fundamentos', 'html-css-a11y'],
  title: 'Performance frontend: Core Web Vitals, carregamento, execução, imagens, memoização e monitoramento',
  description: 'Como medir e melhorar a velocidade e a estabilidade de uma aplicação web: Core Web Vitals (LCP, INP e CLS) e a diferença entre dados de laboratório e de campo; ferramentas de medição (Lighthouse, CrUX, web-vitals, DevTools) e a variação das medições; caminho crítico de renderização, prioridades (preload, preconnect, fetchpriority, defer e async); lazy loading, code splitting, tree shaking e análise do pacote; imagens (formatos, srcset, sizes, dimensões) e fontes (font-display, subsetting); profiling com o painel Performance, tarefas longas e depuração de INP; memoização no React (memo, useMemo, useCallback, React Compiler) e quando não usar; orçamentos de performance na CI, Lighthouse CI, RUM, SLOs e alertas. Os exemplos foram medidos com Lighthouse 13.6, Chrome 157, PerformanceObserver, Vite 8.3.8 e React 19.3.1, e os desafios do laboratório verificam a lógica pura (limiares, percentis, caminho crítico, análise de pacote, CLS por janelas de sessão, TBT, INP, cache LRU e orçamentos).',
  objectives: ['Definir e interpretar LCP, INP e CLS, no laboratório e no campo (p75)', 'Medir com Lighthouse, DevTools, CrUX e web-vitals e distinguir variação de melhoria real', 'Reduzir o caminho crítico e priorizar o recurso do LCP', 'Dividir o código, remover código morto e analisar o pacote', 'Otimizar imagens e fontes e evitar mudanças de layout', 'Diagnosticar interações lentas, dividir tarefas longas e aplicar memoização com critério', 'Manter a performance com orçamentos na CI, RUM, SLOs e alertas'],
  level: 'A', prereqs: ['React essencial e avançado (cursos C2.1 e C2.3)', 'Next.js (curso C2.5), em especial imagens, fontes e streaming', 'HTTP e APIs (curso C1.2) e depuração com DevTools (curso C1.3)', 'Recomendado: Web Platform (curso C1.5)', 'Node.js 22 ou superior e Google Chrome para repetir as medições'], hours: 24,
  syllabus: 'Core Web Vitals, laboratório e campo; Lighthouse, CrUX, web-vitals e DevTools; caminho crítico e dicas de recurso; code splitting, tree shaking e análise do pacote; imagens e fontes; profiling, tarefas longas e INP; memoização e React Compiler; orçamentos, Lighthouse CI, RUM, SLOs e alertas.',
  versions: 'Lighthouse 13.6.0, Google Chrome 157, web-vitals 6.2.3, Vite 8.3.8, rollup-plugin-visualizer 7.3.0, sharp 0.35.5, React e React DOM 19.3.1, Vitest 5.1.1, verificados com npm em 2026-11-25 (Node.js 26). Medições de laboratório: Lighthouse com perfil móvel padrão (4 execuções), PerformanceObserver no Chrome (CLS, LCP e eventos de interação), builds do Vite com e sem lazy e contagens de renderizações e cálculos no React em jsdom. As medições variam entre execuções (o TBT da mesma página variou de 0 a 90 ms); o gradiente sintético usado nos formatos de imagem não representa fotos reais. Não foram executados: CrUX e RUM reais, Lighthouse CI, size-limit, o painel Performance e o Memory do DevTools, fontes web e srcset em navegador, React Compiler e Long Animation Frames; esses pontos seguem a documentação oficial e estão marcados nas aulas.',
  skills: ['Medição de performance', 'Core Web Vitals', 'Otimização do caminho crítico', 'Code splitting e análise de pacote', 'Imagens e fontes', 'Profiling e depuração de INP', 'Memoização no React', 'Orçamentos, RUM e SLOs'],
  modules: [
    { id: 'm1', title: 'Medir', lessons: ['pfe-01', 'pfe-02'] },
    { id: 'm2', title: 'Carregar menos e mais cedo', lessons: ['pfe-03', 'pfe-04', 'pfe-05'] },
    { id: 'm3', title: 'Executar melhor', lessons: ['pfe-06', 'pfe-07'] },
    { id: 'm4', title: 'Manter', lessons: ['pfe-08'] }
  ],
  materials: [REF.vitals, REF.lighthouse, REF.devtoolsPerf, REF2.codeSplitting, REF2.responsiveImages, REF3.compiler, REF3.budgets].map((r) => ({ ...r })),
  projectIds: ['auditoria-otimizacao-app'],
  supplement: {
    glossary,
    cheatsheet: R`### Core Web Vitals (p75 de campo)
LCP ≤ 2,5 s (ruim > 4 s) · INP ≤ 200 ms (ruim > 500 ms) · CLS ≤ 0,1 (ruim > 0,25) · laboratório diagnostica; campo mede o resultado · TBT é proxy de laboratório do INP

### Medir
Lighthouse (várias execuções, mediana, leia as métricas e não só a nota) · CrUX / PageSpeed Insights (campo, 28 dias) · web-vitals + sendBeacon (RUM) · DevTools Performance e Network · throttling de CPU e rede · variação ≠ melhoria

### Caminho crítico
CSS bloqueia a renderização; script síncrono bloqueia o HTML · CSS crítico inline · defer (ordem) / async (independente) · preload (recurso do LCP) · preconnect (poucas origens) · fetchpriority=high no LCP · lazy só abaixo da dobra · img no HTML, não background-image

### Pacote
import() / React.lazy por rota e componente grande e raro · pré-carregar no hover · tree shaking: ESM, sem efeitos, importação pontual · analisador/treemap · Coverage · dividir o minúsculo piora

### Imagens e fontes
WebP/AVIF (com fallback), SVG · srcset + sizes · width e height (ou aspect-ratio) · lazy fora da dobra · font-display (swap/optional), WOFF2, subsetting, ajuste de métricas, preload só das críticas · CLS = pior janela de sessão (gap 1 s, máx. 5 s; ignora após interação)

### Execução
Tarefa longa > 50 ms · INP = entrada + processamento + apresentação · feedback imediato, fatias com cessão da thread (setTimeout, scheduler.yield), Worker, virtualização, useDeferredValue · TBT = soma de (duração − 50 ms) · heap snapshots para vazamentos

### Memoização
memo (comparação rasa) + props estáveis · useCallback só com consumidor memoizado · useMemo para cálculo caro ou identidade · antes: reorganizar estado, children, virtualizar · React Compiler automatiza · cache LRU limitado

### Manter
Orçamento (tamanho, contagem, métricas) · CI: tamanho + Lighthouse CI (5 execuções, mediana, margem; métricas ruidosas como aviso) · RUM: rota normalizada, dispositivo, versão, atribuição · p75 por segmento, mínimo de amostras · SLOs e alertas acionáveis · inventário de terceiros`,
    mistakes: ['Perseguir a nota do Lighthouse e tirar conclusões de uma única execução.', 'Medir só no notebook e ignorar o p75 de campo.', 'loading="lazy" na imagem do LCP e imagens sem dimensões.', 'Scripts e CSS bloqueantes no caminho crítico; imagem de destaque em background-image.', 'Dividir componentes minúsculos ou importar bibliotecas inteiras.', 'Trabalho pesado síncrono em manipuladores de evento.', 'Memoizar tudo (ou memo com funções inline) sem medir.', 'Não ter orçamento, RUM por versão nem controle de scripts de terceiros.'],
    prereqMap: R`**Antes deste curso:** React (renderização e Suspense), Next.js (imagens, fontes, streaming), HTTP e DevTools. Recomendado: Web Platform.

| Este curso prepara para | Por quê |
|---|---|
| Arquitetura frontend (C2.8) | orçamentos por pacote, microfrontends e custo de compartilhamento |
| DevOps e CDN (C6) | cache, compressão, HTTP/2 e 3, CI e observabilidade |
| Escalabilidade (C8) | latência, caches e dimensionamento |
| Segurança (C7) | scripts de terceiros e política de conteúdo |

Ordem interna: aulas 1 e 2 (medir) → 3 a 5 (carregar menos e mais cedo) → 6 e 7 (executar melhor) → 8 (manter).`,
    officialRefs: [REF.vitals, REF.lcp, REF.inp, REF.cls, REF.lighthouse, REF.crux, REF.webVitalsLib, REF.devtoolsPerf, REF.fieldLab, REF.critical, REF.fetchPriority, REF.preload, REF.preconnect, REF.renderBlocking, REF2.viteBuild, REF2.dynamicImport, REF2.treeShaking, REF2.reactLazy, REF2.codeSplitting, REF2.responsiveImages, REF2.imageFormats, REF2.fontBest, REF2.optimizeCls, REF2.fontDisplay, REF2.longTasks, REF2.optimizeInp, REF2.devtoolsMemory, REF2.scheduler, REF3.memo, REF3.useMemo, REF3.useCallback, REF3.compiler, REF3.profiler, REF3.virtualization, REF3.budgets, REF3.lhci, REF3.lhBudgets, REF3.sendBeacon, REF3.slo],
    practice: ['Meça uma página em 5 execuções do Lighthouse e registre a mediana e a variação.', 'Descubra o elemento e a fase do LCP de uma página e antecipe seu recurso.', 'Crie uma página com imagem sem dimensões e meça o CLS antes e depois de corrigir.', 'Divida um componente grande com lazy e compare o pacote inicial; teste também um componente minúsculo.', 'Grave uma interação lenta no DevTools, decomponha em fases e divida o trabalho em fatias.', 'Conte renderizações com e sem memo, useCallback e useMemo.', 'Configure um orçamento na CI (Lighthouse CI e tamanho do pacote).', 'Faça o projeto integrador: auditoria, otimização e RUM com relatório antes e depois.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
