// Curso C2.3 da C2: React avançado (disciplina: react; tópicos de nível A).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c23-a.mjs';
import { REF2, lessonsB } from './c23-b.mjs';
import { REF3, lessonsC } from './c23-c.mjs';
import { exsetsA } from './c23-ex-a.mjs';
import { exsetsB, assessment, project } from './c23-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Renderização e reconciliação', 'Padrões de composição', 'Suspense e recursos concorrentes'];
export const COVER = {
  'Renderização e reconciliação': ['rav-01', 'rav-02'],
  'Padrões de composição': ['rav-03', 'rav-04'],
  'Suspense e recursos concorrentes': ['rav-05', 'rav-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Fiber', def: 'Estrutura interna do React que representa a árvore de componentes e permite pausar e retomar o trabalho de renderização.' },
  { term: 'Headless UI', def: 'Biblioteca que fornece comportamento e acessibilidade de componentes sem impor estilos.' },
  { term: 'Hidratação', def: 'Processo em que o React anexa comportamento a um HTML gerado no servidor.' },
  { term: 'Waterfall de dados', def: 'Sequência de buscas em que cada uma só começa depois da anterior, aumentando o tempo total.' },
  { term: 'Chunk', def: 'Pedaço de código gerado pelo empacotador e carregado sob demanda.' },
  { term: 'INP', def: 'Interaction to Next Paint: métrica de responsividade das interações, parte dos Core Web Vitals.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'react-avancado', disciplineId: 'react', areaId: 'front', requires: ['javascript-fundamentos', 'typescript-fundamentos'],
  title: 'React avançado: renderização, identidade, composição, Suspense e concorrência',
  description: 'O modelo mental por trás do React: fases de render e commit, ordem dos efeitos, o que dispara uma renderização e o Strict Mode; reconciliação, chaves e identidade (por que o estado reseta); componentes compostos com contexto interno e acessibilidade (Tabs); render props, componentes headless, controlado e não controlado, state reducer e polimorfismo (as); Suspense, lazy, use e fronteiras de erro, com cascata x paralelo; e renderização concorrente com useTransition e useDeferredValue. Os exemplos foram medidos com React 19.3 (Vitest, jsdom e Testing Library) e os desafios do laboratório verificam a lógica pura (ordem de execução, quem renderiza, identidade, teclado de abas, estado controlável, mesclagem de props, cache de promises e agendador de prioridades).',
  objectives: ['Prever a ordem de render, commit e efeitos e identificar o que dispara uma renderização', 'Explicar a identidade de componentes (tipo, posição, chave) e corrigir bugs de estado perdido ou trocado', 'Projetar componentes compostos acessíveis com contexto interno e API controlada e não controlada', 'Aplicar render props, headless, state reducer e polimorfismo com critério', 'Usar Suspense, lazy, use e fronteiras de erro e evitar cascatas de carregamento', 'Aplicar transições e valores adiados para manter a interface responsiva'],
  level: 'A', prereqs: ['React essencial (curso C2.1): estado, efeitos, listas, Context e hooks customizados', 'TypeScript (genéricos e tipos utilitários)', 'Recomendado: Tailwind e design systems (curso C2.2) e Web Platform (eventos e Workers)', 'Node.js 22 ou superior para executar os exemplos'], hours: 26,
  syllabus: 'Fases de render e commit, ordem dos efeitos, gatilhos de re-render, Strict Mode e Profiler; reconciliação, identidade, chaves e componentes aninhados; componentes compostos, contexto interno e padrão ARIA de abas; controlado e não controlado, render props, headless, state reducer, as e asChild; Suspense, lazy, use, cascatas, fronteiras de erro e streaming; useTransition, useDeferredValue e prioridades.',
  versions: 'React 19.3.1 e React DOM 19.3.1, TypeScript 7.0.2, Vitest 5.1.1, jsdom 31.0.1 e @testing-library/react 16.3.3, verificados com npm em 2026-11-18. Os exemplos foram executados em jsdom (não em navegador real): a ordem de execução e as contagens de renderização foram medidas assim, mas tempos de pintura e throttling de Suspense podem variar. O componente Activity e o React Compiler foram citados da documentação oficial e não executados aqui. Recursos do React mudam entre versões: consulte react.dev.',
  skills: ['Modelo de renderização do React', 'Identidade e reconciliação', 'Componentes compostos', 'Padrões headless e controlados', 'Suspense e carregamento de dados', 'Fronteiras de erro', 'Concorrência e transições', 'Depuração com o Profiler'],
  modules: [
    { id: 'm1', title: 'Como o React renderiza', lessons: ['rav-01', 'rav-02'] },
    { id: 'm2', title: 'Composição', lessons: ['rav-03', 'rav-04'] },
    { id: 'm3', title: 'Suspense e concorrência', lessons: ['rav-05', 'rav-06'] }
  ],
  materials: [REF.renderCommit, REF.preserving, REF2.apgTabs, REF2.radixIntro, REF3.suspense, REF3.use, REF3.useTransition].map((r) => ({ ...r })),
  projectIds: ['biblioteca-componentes-compostos'],
  supplement: {
    glossary,
    cheatsheet: R`### Render, commit e efeitos
Gatilho → render (puro, de cima para baixo) → commit (DOM, refs, efeitos de layout) → pintura → efeitos · efeitos: filho antes do pai; layout antes dos normais; cleanup antes do próximo setup · Strict Mode (dev): render x2, efeitos setup-cleanup-setup · dispara: estado, props do pai, contexto

### O que renderiza
Pai renderiza → filhos comuns renderizam · memo com props iguais: não · elemento recebido por children (criado por outro pai): não · setState com o mesmo valor: não · reorganizar (estado perto de quem usa, children) antes de memoizar · Profiler: "por que renderizou"

### Identidade
Tipo + posição + chave · tipo diferente: desmonta · chave diferente: reseta (use key para resetar) · lista: id estável, nunca índice em listas dinâmicas · nunca defina componente dentro de componente · wrapper condicional muda o tipo da posição

### Composição
Componente composto: raiz (estado) + contexto interno + partes · hook que lança erro fora do pai · useId · Children/cloneElement: frágil · ARIA de Tabs: tablist/tab/tabpanel, aria-selected, aria-controls, aria-labelledby, roving tabindex, setas/Home/End

### Padrões
Controlado: value + onChange; não controlado: defaultValue; onChange nos dois · useControllableState · render prop · headless + prop getters (mescle manipuladores) · state reducer · as (genérico) e asChild

### Suspense
Suspense: fallback enquanto suspende · lazy no escopo do módulo · use(promise): promise estável (cache) · cascata: filho só busca depois do pai → inicie cedo e em paralelo · fronteira de erro (classe/react-error-boundary): não pega eventos nem async · testes: await act(async)

### Concorrência
Urgente (digitar) x transição · useTransition: [pendente, iniciar] · useDeferredValue + memo na parte lenta · campo controlado nunca em transição · transição + Suspense mantém a tela anterior · concorrência não reduz o custo: virtualize`,
    mistakes: ['Achar que renderizar atualiza o DOM e que o Strict Mode é um bug.', 'Definir componentes dentro de componentes e perder estado e foco.', 'Usar índice como chave em listas que mudam de ordem.', 'Injetar props com cloneElement e quebrar com itens embrulhados.', 'Criar a promise do use dentro do render (laço de suspensões) e deixar cascatas de busca.', 'Esquecer fronteiras de erro e testar Suspense sem act assíncrono.', 'Marcar a digitação como transição ou usar useDeferredValue sem memo.', 'Esperar que a concorrência reduza o custo total do render.'],
    prereqMap: R`**Antes deste curso:** React essencial (componentes, estado, efeitos, listas e chaves, Context e hooks customizados) e TypeScript. Recomendado: Tailwind e design systems (componentes reais) e noções de Web Platform.

| Este curso prepara para | Por quê |
|---|---|
| Next.js (Server Components, streaming e Server Actions) | Suspense, use, transições e a mentalidade de render puro |
| Performance frontend | re-renders, memoização, divisão de código e INP |
| Gerenciamento de estado | assinaturas, identidade e re-renders de bibliotecas de estado |
| Testes de frontend | testar componentes que suspendem, hooks e componentes compostos |
| Arquitetura frontend | bibliotecas de componentes e padrões de composição |

Ordem interna: aulas 1 e 2 (renderização e identidade) → 3 e 4 (composição e padrões) → 5 e 6 (Suspense e concorrência).`,
    officialRefs: [REF.renderCommit, REF.stateSnapshot, REF.pure, REF.strictMode, REF.useLayoutEffect, REF.devtools, REF.compiler, REF.preserving, REF.tree, REF.lists, REF.activity, REF2.context, REF2.children, REF2.cloneElement, REF2.apgTabs, REF2.apgCombobox, REF2.apgAccordion, REF2.radixComposition, REF2.reactAria, REF2.input, REF2.extractingLogic, REF3.suspense, REF3.lazy, REF3.use, REF3.errorBoundary, REF3.act, REF3.rsc, REF3.useTransition, REF3.useDeferredValue],
    practice: ['Registre a ordem de render, efeitos de layout e efeitos de um pai com filho e compare com e sem Strict Mode.', 'Reproduza o componente definido dentro de outro e corrija; reproduza a chave por índice e por id.', 'Implemente Tabs composto com contexto, teclado e testes de axe.', 'Torne um componente controlado e não controlado com useControllableState.', 'Crie uma promise em cache, use com use e meça a cascata e o paralelo.', 'Meça com o Profiler uma lista pesada e aplique useDeferredValue com memo.', 'Escreva um teste que prova que a falha de um widget não derruba a página (fronteira de erro).', 'Faça o projeto integrador: a biblioteca de componentes compostos e o painel de carregamento.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
