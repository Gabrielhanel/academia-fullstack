// Curso C2.1 da C2: React essencial (disciplina: react; tópicos nível I e M).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c21-a.mjs';
import { REF2, lessonsB } from './c21-b.mjs';
import { REF3, lessonsC } from './c21-c.mjs';
import { REF4, lessonsD } from './c21-d.mjs';
import { exsetsA } from './c21-ex-a.mjs';
import { exsetsB, assessment, project } from './c21-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC, ...lessonsD]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Componentes e JSX', 'Props e estado', 'Listas e renderização condicional', 'Hooks essenciais (useState, useEffect, useRef, useMemo)', 'Context API', 'Hooks customizados', 'Formulários'];
export const COVER = {
  'Componentes e JSX': ['rea-01', 'rea-02', 'rea-03'],
  'Props e estado': ['rea-03', 'rea-04'],
  'Listas e renderização condicional': ['rea-05'],
  'Hooks essenciais (useState, useEffect, useRef, useMemo)': ['rea-07', 'rea-08'],
  'Context API': ['rea-09'],
  'Hooks customizados': ['rea-10'],
  'Formulários': ['rea-06', 'rea-11']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Hook', def: 'Função especial do React (useState, useEffect, ...) que dá estado e efeitos a componentes de função.' },
  { term: 'Renderização', def: 'Chamada do componente para calcular a descrição da interface a partir de props, estado e contexto.' },
  { term: 'Commit', def: 'Fase em que o React aplica ao DOM as diferenças calculadas na renderização.' },
  { term: 'Re-renderização', def: 'Nova chamada de um componente porque seu estado, suas props ou um contexto consumido mudaram.' },
  { term: 'SPA', def: 'Aplicação de página única, em que o JavaScript atualiza a interface sem recarregar a página.' },
  { term: 'Hidratação', def: 'Processo em que o React anexa comportamento a um HTML gerado no servidor.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'react-essencial', disciplineId: 'react', areaId: 'front', requires: ['javascript-fundamentos', 'typescript-fundamentos', 'html-css-a11y'],
  title: 'React essencial: componentes, estado, efeitos, Context e formulários',
  description: 'O núcleo do React moderno (React 19) com TypeScript: pensar a interface como função do estado, JSX e segurança contra XSS, componentes e props, estado e snapshots, listas e chaves, eventos e formulários controlados e não controlados, efeitos e Strict Mode, refs e memoização, Context e seu custo, hooks customizados e formulários acessíveis com validação por esquema e ações do React 19. Os exemplos foram executados com React 19.3, Vitest, jsdom e Testing Library, e os desafios do laboratório verificam a lógica pura (elementos, reducers, reconciliação por chave, ciclo de efeitos, stores, debounce e validação).',
  objectives: ['Explicar UI = f(estado) e a reconciliação, e criar um projeto com Vite e TypeScript', 'Escrever JSX seguro (escape, URLs, dangerouslySetInnerHTML) e componentes com props tipadas e composição', 'Gerenciar estado sem mutações, derivar valores e elevar o estado ao pai comum', 'Renderizar listas com chaves estáveis e condicionais sem armadilhas; construir formulários controlados e não controlados', 'Usar useEffect só para sincronização, com dependências e cleanup corretos, e entender o Strict Mode', 'Aplicar refs e memoização com critério, usar Context ciente do custo e extrair hooks customizados testados', 'Construir formulários acessíveis, validados por esquema e com ações do React 19'],
  level: 'I', prereqs: ['JavaScript moderno (módulos, funções, arrays, promises) e TypeScript básico', 'HTML, CSS e noções de acessibilidade', 'Git e linha de comando; recomendado: Ferramentas do desenvolvedor (depuração e ESLint)', 'Node.js 22 ou superior para executar os exemplos'], hours: 32,
  syllabus: 'UI declarativa, componentes, elementos e reconciliação; JSX, expressões, atributos, fragmentos e segurança; props, children e composição; useState, snapshots, batching e imutabilidade; listas, chaves e renderização condicional; eventos e formulários controlados e não controlados; useEffect, dependências, cleanup e Strict Mode; useRef, useMemo, useCallback, memo e React Compiler; Context e re-renderizações; hooks customizados e regras dos hooks; validação por esquema, acessibilidade e useActionState.',
  versions: 'React 19.3.1 e React DOM 19.3.1, TypeScript 7.0.2, Vite 8.3.8, Vitest 5.1.1, jsdom 31.0.1, @testing-library/react 16.3.3 e Zod 4.6.7, verificados com npm em 2026-11-18; o pacote babel-plugin-react-compiler está na versão 1.0.0. A documentação oficial (react.dev) corresponde à versão 19.3. APIs e recomendações mudam entre versões do React e do ecossistema: consulte react.dev. Os exemplos foram executados em jsdom, não em navegador real (comportamentos de layout e foco visual podem variar).',
  skills: ['Modelo declarativo do React', 'JSX e segurança contra XSS', 'Componentes e composição', 'Estado imutável', 'Listas, chaves e condicionais', 'Formulários', 'Efeitos e ciclo de vida', 'Memoização e refs', 'Context', 'Hooks customizados', 'Validação e acessibilidade em formulários'],
  modules: [
    { id: 'm1', title: 'Pensar em React', lessons: ['rea-01', 'rea-02', 'rea-03'] },
    { id: 'm2', title: 'Estado e renderização', lessons: ['rea-04', 'rea-05', 'rea-06'] },
    { id: 'm3', title: 'Efeitos, referências e memória', lessons: ['rea-07', 'rea-08'] },
    { id: 'm4', title: 'Compartilhando lógica', lessons: ['rea-09', 'rea-10', 'rea-11'] }
  ],
  materials: [REF.learn, REF.thinking, REF2.state, REF3.sync, REF3.context, REF4.customHooks, REF4.rulesOfHooks].map((r) => ({ ...r })),
  projectIds: ['quadro-tarefas-acessivel'],
  supplement: {
    glossary,
    cheatsheet: R`### Modelo mental
UI = f(estado) · componente = função em maiúscula que devolve JSX · elemento = objeto leve · renderização pura · efeitos em eventos ou §useEffect§ · React reconcilia e atualiza o DOM

### JSX
§className§ §htmlFor§ camelCase · §style={{ a: 1 }}§ · expressões entre chaves · fragmentos §<>§ · não renderizam: null undefined true false '' · renderiza 0 · texto é escapado · cuidado: §dangerouslySetInnerHTML§, URLs §javascript:§

### Props e estado
Props somente leitura · children e slots · dados descem, eventos sobem · §useState§: snapshot, §setN(x => x + 1)§, batching · nunca mute: spread, map, filter, toSorted · estado derivado não se guarda · elevar estado · §useReducer§ para transições

### Listas e eventos
§key§ estável e único (id), não índice nem aleatório · §key§ muda → reseta o estado · §{n > 0 && ...}§ (não §{n && ...}§) · §onClick={fn}§ (não §fn()§) · controlado: value + onChange · não controlado: defaultValue + FormData · §preventDefault§ no submit

### Efeitos
Sincronizar com algo externo · setup, cleanup, dependências · Strict Mode: monta, desmonta, monta · closure velha → atualização funcional · corrida → ignorar ou AbortController · "você talvez não precise de um efeito"

### Refs e memoização
§useRef§ não renderiza · DOM só em evento/efeito · §useMemo§ valor · §useCallback§ função · §memo§ props iguais (comparação rasa) · meça antes · reorganize antes · React Compiler

### Context e hooks
§createContext§ + §<Ctx value>§ + §useContext§ · valor novo → todos os consumidores re-renderizam · estabilize e divida · estado e dispatch separados · hooks: nível superior, nome §use§, estado por chamada, §renderHook§ para testar

### Formulários
Esquema (Zod): coerção + erros por campo · mesmo esquema no servidor · §aria-invalid§ + §aria-describedby§ + §role="alert"§ · §useId§ · §<form action>§ + §useActionState§ + pendente · foco no primeiro erro`,
    mistakes: ['Alterar o estado ou as props em vez de criar cópias.', 'Esperar o valor novo logo depois de chamar o set; ignorar o snapshot.', 'Usar o índice ou valores aleatórios como key em listas dinâmicas.', 'Escrever {n && <X />} com n numérico e deixar um 0 na tela.', 'Usar useEffect para derivar valores ou reagir a cliques; esquecer cleanup e dependências.', 'Memoizar tudo sem medir; passar objetos e funções novos a componentes memo.', 'Colocar muito estado volátil em um único Context com valor novo a cada render.', 'Validar formulários só no navegador e esconder erros dos leitores de tela.'],
    prereqMap: R`**Antes deste curso:** JavaScript (curso JavaScript: fundamentos, DOM e módulos), TypeScript (curso TypeScript: fundamentos e recursos avançados) e HTML/CSS com acessibilidade. Recomendado: Ferramentas do desenvolvedor (depuração no navegador e ESLint) e Web Platform (eventos e armazenamento).

| Este curso prepara para | Por quê |
|---|---|
| Tailwind e design systems | componentes reutilizáveis e composição |
| React avançado | renderização, reconciliação, composição e Suspense partem do modelo daqui |
| Gerenciamento de estado | reducers, Context e seus limites |
| Next.js | componentes, efeitos e formulários com ações do servidor |
| Testes de frontend | componentes, hooks e formulários testáveis |
| Performance frontend | memoização, listas e renderização |
| React Native (curso futuro) | o mesmo modelo de componentes e hooks |

Ordem interna: aulas 1 a 3 (pensar em React) → 4 a 6 (estado e renderização) → 7 e 8 (efeitos, refs e memória) → 9 a 11 (compartilhar lógica e formulários).`,
    officialRefs: [REF.learn, REF.thinking, REF.describing, REF.startProject, REF.vite, REF.jsx, REF.props, REF.pure, REF.tsReact, REF.xss, REF.rtl, REF2.state, REF2.snapshot, REF2.queue, REF2.updatingObjects, REF2.sharing, REF2.lists, REF2.conditional, REF2.preserving, REF2.events, REF2.input, REF3.sync, REF3.lifecycle, REF3.notEffect, REF3.refs, REF3.useMemo, REF3.useCallback, REF3.memo, REF3.compiler, REF3.context, REF3.scaling, REF4.customHooks, REF4.rulesOfHooks, REF4.eslintHooks, REF4.useActionState, REF4.useFormStatus, REF4.zod, REF4.waiForms],
    practice: ['Crie um projeto com Vite (react-ts) e converta uma página HTML sua em componentes.', 'Reproduza o contador com setN(n + 1) três vezes e com a forma funcional, e explique a diferença.', 'Faça uma lista reordenável com chaves por índice e por id e observe o estado dos campos.', 'Escreva um efeito com cleanup e teste-o em Strict Mode; corrija uma corrida de busca.', 'Meça com o Profiler o efeito de memo com callbacks estáveis e instáveis.', 'Divida um Context grande em estado e dispatch e compare as re-renderizações.', 'Extraia useLocalStorage e useDebounce e teste-os com renderHook.', 'Faça o projeto integrador: o quadro de tarefas acessível.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
