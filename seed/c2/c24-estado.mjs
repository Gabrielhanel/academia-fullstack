// Curso C2.4 da C2: Gerenciamento de estado no frontend (disciplina: state).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c24-a.mjs';
import { REF2, lessonsB } from './c24-b.mjs';
import { REF3, lessonsC } from './c24-c.mjs';
import { exsetsA } from './c24-ex-a.mjs';
import { exsetsB, assessment, project } from './c24-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Estado local vs global', 'Redux Toolkit', 'Zustand', 'TanStack Query (estado de servidor)', 'Cache, invalidação e optimistic updates', 'Normalização de estado', 'Escolha de estratégia de estado em escala'];
export const COVER = {
  'Estado local vs global': ['est-01', 'est-02'],
  'Redux Toolkit': ['est-03', 'est-04'],
  'Zustand': ['est-05'],
  'TanStack Query (estado de servidor)': ['est-06'],
  'Cache, invalidação e optimistic updates': ['est-07'],
  'Normalização de estado': ['est-08'],
  'Escolha de estratégia de estado em escala': ['est-09']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Selector memoizado', def: 'Seletor que guarda o último resultado e só recalcula quando suas entradas mudam.' },
  { term: 'Fonte da verdade', def: 'Local único onde um fato é mantido; as demais ocorrências são derivadas ou cópias controladas.' },
  { term: 'Stale-while-revalidate', def: 'Estratégia de mostrar o dado velho imediatamente e atualizá-lo em segundo plano.' },
  { term: 'Cache de servidor', def: 'Camada que guarda respostas do servidor por chave, com regras de frescor, invalidação e coleta.' },
  { term: 'Serializável', def: 'Valor que pode ser convertido em texto (JSON) e restaurado, requisito comum de estado persistido ou hidratado.' },
  { term: 'Imutabilidade', def: 'Prática de nunca alterar um valor existente, criando um novo valor a cada mudança.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'estado-frontend', disciplineId: 'state', areaId: 'front', requires: ['javascript-fundamentos', 'typescript-fundamentos'],
  title: 'Gerenciamento de estado no frontend: Context, Redux Toolkit, Zustand e TanStack Query',
  description: 'Como decidir onde cada dado vive em uma aplicação React: taxonomia do estado (local, compartilhado, de servidor, de URL, de formulário e derivado) e fonte da verdade; useReducer e Context com seus custos medidos; Redux Toolkit (slices, Immer, seletores, thunks, listeners, DevTools e visão do RTK Query); Zustand (seletores, useShallow, persist e fatias); TanStack Query (chaves, staleTime, gcTime, mutações, invalidação, atualizações otimistas, paginação infinita, prefetch e hidratação); normalização com createEntityAdapter; e a estratégia em escala com árvore de decisão, ADRs, migração gradual e testes. Os comportamentos foram medidos com Redux Toolkit 2.15, React Redux 9.3, Zustand 5.1 e TanStack Query 5.108 em React 19.3 (Vitest e jsdom); os desafios do laboratório verificam a lógica pura (store, seletores memoizados, corrida de respostas, cache com staleTime e gcTime, mutações otimistas, normalização e árvore de decisão).',
  objectives: ['Classificar o estado e escolher a ferramenta mais simples para cada tipo', 'Usar useReducer, Context, Redux Toolkit e Zustand com seletores e sem renderizações desnecessárias', 'Tratar estado de servidor com TanStack Query: chaves, frescor, invalidação, otimismo, paginação e hidratação', 'Normalizar estado de cliente e derivar com seletores memoizados', 'Documentar decisões em ADRs, migrar gradualmente e testar a camada de estado'],
  level: 'M', prereqs: ['React essencial (curso C2.1): estado, efeitos, listas, Context e hooks customizados', 'TypeScript (genéricos e tipos utilitários)', 'HTTP e APIs (conceitos de requisição, resposta, status e cache)', 'Recomendado: React avançado (curso C2.3): renderização e identidade', 'Node.js 22 ou superior para executar os exemplos'], hours: 24,
  syllabus: 'Taxonomia do estado e fonte da verdade; useReducer e Context e seus limites; Redux Toolkit (store, slices, Immer, seletores, thunks, listeners, DevTools, RTK Query em visão geral); Zustand (seletores, middlewares e fatias); TanStack Query (chaves, staleTime e gcTime, mutações, invalidação, otimismo, paginação infinita, prefetch e hidratação); normalização e createEntityAdapter; estratégia de estado em escala, ADRs, migração gradual e testes.',
  versions: 'React 19.3.1, @reduxjs/toolkit 2.15.0, react-redux 9.3.1, zustand 5.1.0, @tanstack/react-query 5.108.4, Vitest 5.1.1, jsdom 31.0.1 e @testing-library/react 16.3.3, verificados com npm em 2026-11-25. Os exemplos foram executados em jsdom (não em navegador real) e os tempos de espera usados nos testes são de relógio real. O RTK Query, a hidratação com HydrationBoundary no Next.js e as Redux DevTools (extensão de navegador) foram descritos a partir da documentação oficial e não foram executados aqui. Bibliotecas de estado mudam entre versões: consulte a documentação de cada uma.',
  skills: ['Classificação de estado', 'Fonte da verdade e estado derivado', 'Redux Toolkit', 'Zustand', 'TanStack Query', 'Atualizações otimistas', 'Normalização de estado', 'Decisões de arquitetura (ADR)'],
  modules: [
    { id: 'm1', title: 'Onde o estado vive', lessons: ['est-01', 'est-02'] },
    { id: 'm2', title: 'Estado de cliente', lessons: ['est-03', 'est-04', 'est-05'] },
    { id: 'm3', title: 'Estado de servidor', lessons: ['est-06', 'est-07'] },
    { id: 'm4', title: 'Dados e decisões', lessons: ['est-08', 'est-09'] }
  ],
  materials: [REF.choosing, REF.scaling, REF.rtkQuick, REF2.zustand, REF2.tqOverview, REF3.tqOptimistic, REF3.adr].map((r) => ({ ...r })),
  projectIds: ['painel-de-pedidos'],
  supplement: {
    glossary,
    cheatsheet: R`### Classificação
Derivado: calcule · URL: filtros, página, id · Servidor: cache (TanStack Query) · Formulário: local · Local: useState/useReducer · Compartilhado raro: Context (value memoizado) · Compartilhado frequente ou com regras: store (Zustand ou RTK)

### useReducer e Context
Reducer puro (estado, ação) => novo estado · ações como eventos · estado e dispatch em contextos separados · useMemo no value · todo consumidor renderiza quando o valor muda

### Redux Toolkit
configureStore · createSlice (nome/ação) · Immer: mute o rascunho OU devolva novo valor · useSelector (=== no valor) · createSelector memoiza · createAsyncThunk: pending/fulfilled/rejected · rejectWithValue · listener middleware · createEntityAdapter: ids e entities

### Zustand
create((set, get) => ...) · seletor mínimo · useShallow para objeto · getState/setState/subscribe · persist (partialize, version) · subscribeWithSelector · fatias

### TanStack Query
queryKey com tudo que o queryFn usa · staleTime: fresco · gcTime: coleta de inativas · isPending x isFetching · queryFn lança erro (resp.ok) · mutação: invalidateQueries (prefixo, exact) · otimista: cancelQueries, snapshot, setQueryData, rollback, invalidar · useInfiniteQuery: initialPageParam e getNextPageParam · QueryClient por requisição e por teste

### Decisão
Pare no primeiro degrau que resolve · ADR: contexto, decisão, alternativas, consequências · migração por fatia atrás de hooks`,
    mistakes: ['Guardar em estado o que pode ser calculado e sincronizar com efeitos.', 'Copiar dados do servidor para uma store e deixá-los velhos.', 'Colocar um único contexto gigante e deixar todos os consumidores renderizando.', 'Usar seletores que devolvem objetos novos (Redux e Zustand).', 'Esquecer variáveis do queryFn na queryKey.', 'Atualização otimista sem cancelar buscas, sem rollback ou mutando o cache.', 'Normalizar tudo por reflexo (ou nada, quando há muitas relações).', 'Trocar de biblioteca sem medir e sem registrar a decisão.'],
    prereqMap: R`**Antes deste curso:** React essencial (estado, efeitos, Context e hooks customizados), TypeScript e noções de HTTP. Recomendado: React avançado (renderização e identidade).

| Este curso prepara para | Por quê |
|---|---|
| Next.js | hidratação de cache, estado no servidor e Server Actions |
| Testes de frontend | testar reducers, stores e consultas com QueryClient por teste |
| Performance frontend | renderizações causadas por estado mal posicionado |
| Arquitetura frontend | decisões de estado em escala e ADRs |
| Mobile (React Native) | os mesmos padrões de estado e cache |

Ordem interna: aulas 1 e 2 (onde o estado vive) → 3 a 5 (estado de cliente) → 6 e 7 (estado de servidor) → 8 e 9 (dados e decisões).`,
    officialRefs: [REF.choosing, REF.sharing, REF.scaling, REF.useReducer, REF.useContext, REF.rtkQuick, REF.createSlice, REF.configureStore, REF.reduxStyle, REF.reselect, REF.reactReduxHooks, REF.immer, REF2.createAsyncThunk, REF2.listener, REF2.rtkQuery, REF2.zustand, REF2.zustandPersist, REF2.zustandSlices, REF2.zustandPrevent, REF2.tqOverview, REF2.tqKeys, REF2.tqCaching, REF2.tqStale, REF2.tqQueries, REF2.tqMutations, REF3.tqInvalidation, REF3.tqOptimistic, REF3.tqInfinite, REF3.tqPrefetch, REF3.tqSsr, REF3.tqTesting, REF3.normalizing, REF3.entityAdapter, REF3.adr, REF3.nygard],
    practice: ['Classifique os dados de uma tela real (lista, filtros, tema, formulário, totais) e escreva a escolha de cada um.', 'Meça com o Profiler quantos consumidores renderizam ao mudar uma parte de um contexto e corrija com divisão e useMemo.', 'Implemente um slice com Immer, um seletor com createSelector e um thunk com rejectWithValue.', 'Crie uma store Zustand com persist parcial e seletores com useShallow.', 'Escreva consultas TanStack Query com fábrica de chaves e teste staleTime e gcTime com um QueryClient por teste.', 'Implemente uma atualização otimista com rollback e teste o caminho de falha.', 'Normalize pedidos e clientes e compare com o cache por chave.', 'Faça o projeto integrador: o painel de pedidos com ADR.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
