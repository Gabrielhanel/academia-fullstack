// C2.4 — Gerenciamento de estado no frontend. Aulas 4 a 6 (Redux Toolkit II; Zustand; TanStack Query I).
const R = String.raw;

export const REF2 = {
  createAsyncThunk: { title: 'Redux Toolkit — createAsyncThunk', url: 'https://redux-toolkit.js.org/api/createAsyncThunk', kind: 'doc' },
  listener: { title: 'Redux Toolkit — Listener Middleware', url: 'https://redux-toolkit.js.org/api/createListenerMiddleware', kind: 'doc' },
  rtkQuery: { title: 'Redux Toolkit — RTK Query Overview', url: 'https://redux-toolkit.js.org/rtk-query/overview', kind: 'doc' },
  devtools: { title: 'Redux DevTools', url: 'https://github.com/reduxjs/redux-devtools', kind: 'doc' },
  zustand: { title: 'Zustand — Introdução', url: 'https://zustand.docs.pmnd.rs/learn/getting-started/introduction', kind: 'doc' },
  zustandPersist: { title: 'Zustand — persist middleware', url: 'https://zustand.docs.pmnd.rs/reference/middlewares/persist', kind: 'doc' },
  zustandSlices: { title: 'Zustand — Slices Pattern', url: 'https://zustand.docs.pmnd.rs/learn/guides/slices-pattern', kind: 'doc' },
  zustandPrevent: { title: 'Zustand — Prevent rerenders with useShallow', url: 'https://zustand.docs.pmnd.rs/learn/guides/prevent-rerenders-with-use-shallow', kind: 'doc' },
  tqOverview: { title: 'TanStack Query — Overview', url: 'https://tanstack.com/query/latest/docs/framework/react/overview', kind: 'doc' },
  tqKeys: { title: 'TanStack Query — Query Keys', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-keys', kind: 'doc' },
  tqCaching: { title: 'TanStack Query — Caching', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/caching', kind: 'doc' },
  tqStale: { title: 'TanStack Query — Important Defaults', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults', kind: 'doc' },
  tqMutations: { title: 'TanStack Query — Mutations', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/mutations', kind: 'doc' },
  tqQueries: { title: 'TanStack Query — Queries', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/queries', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'est-04', moduleId: 'm2', order: 4, minutes: 70, tags: ['Redux Toolkit', 'createAsyncThunk', 'listener middleware', 'DevTools', 'RTK Query'],
  title: 'Redux Toolkit II: efeitos assíncronos, listeners, DevTools e visão geral do RTK Query',
  objectives: ['Escrever um §createAsyncThunk§ e tratar os estados pending, fulfilled e rejected', 'Usar §rejectWithValue§ para erros previsíveis e entender o formato das ações geradas', 'Reagir a ações com o listener middleware sem poluir os componentes', 'Usar as Redux DevTools para inspecionar ações e estados', 'Explicar o que o RTK Query resolve e quando preferi-lo a um thunk escrito à mão'],
  intro: R`Reducers são puros: não fazem rede. A lógica assíncrona vive **fora** deles, e o Redux Toolkit oferece três peças: **thunks** (funções que despacham ações em momentos diferentes), o **listener middleware** (efeitos que reagem a ações) e o **RTK Query** (cache de servidor integrado). Esta aula mostra cada uma, com o ciclo de ações **medido** em @reduxjs/toolkit 2.15.0.`,
  theory: R`### Por que a lógica assíncrona fica fora do reducer
Um reducer precisa ser **previsível**: mesma entrada, mesma saída, sem efeitos. Uma chamada de rede tem tempo, falhas e resultado variável. A solução é um **middleware**: código que intercepta o que você despacha e pode fazer trabalho extra antes de a ação chegar ao reducer. O RTK já inclui o **thunk**: em vez de um objeto de ação, você despacha uma **função** que recebe §dispatch§ e §getState§.

### createAsyncThunk: o ciclo em três ações
§createAsyncThunk("usuarios/carregar", async (id) => ...)§ gera um **thunk** e **três criadores de ação**: §.pending§, §.fulfilled§ e §.rejected§. Medido: no sucesso, as ações despachadas foram, nesta ordem, §usuarios/carregar/pending§ e §usuarios/carregar/fulfilled§; em uma rejeição, §usuarios/carregar/pending§ e §usuarios/carregar/rejected§. O slice trata cada uma em §extraReducers§ (builder callback):
§§§
extraReducers: (b) => b
  .addCase(carregar.pending, (st) => { st.status = 'carregando'; })
  .addCase(carregar.fulfilled, (st, a) => { st.status = 'ok'; st.dados = a.payload; })
  .addCase(carregar.rejected, (st, a) => { st.status = 'erro'; st.erro = a.payload ?? a.error.message; })
§§§
O resultado do thunk é a **promise** do §dispatch§; ela **nunca rejeita** por padrão (devolve a ação final). Para lançar, use §.unwrap()§.

### Erros previsíveis: rejectWithValue
Quando a falha é esperada (validação, "não encontrado"), use §rejectWithValue(valor)§: o §payload§ da ação §rejected§ é o seu valor. Medido: com o id inválido, o estado ficou §{ status: "erro", erro: "inválido" }§. Para erros inesperados (exceção), a ação §rejected§ traz §action.error§ serializado.
O segundo argumento do thunk (§thunkAPI§) fornece §dispatch§, §getState§, §signal§ (para cancelar) e §rejectWithValue§. A opção §condition§ permite **não executar** o thunk (por exemplo, se o dado já está carregado).

### Armadilhas do thunk escrito à mão
Para dados de servidor, um thunk por endpoint costuma exigir: guardar §status§ e §erro§ à mão, evitar buscas **duplicadas**, decidir quando **recarregar**, **invalidar** após mutações e **cancelar** buscas obsoletas. Cada uma dessas decisões é código seu, e é onde surgem bugs (corrida de respostas, dado velho). Por isso o RTK Query e o TanStack Query existem.

### Listener middleware: efeitos que reagem a ações
O **listener middleware** executa **efeitos** quando certas ações acontecem, sem colocar essa lógica nos componentes nem nos reducers. Medido: um listener registrado para a ação §inc§ rodou depois de cada despacho e leu o estado **já atualizado** (§n=1§, depois §n=2§). Usos típicos: persistir parte do estado, disparar uma busca quando um filtro muda, mostrar notificações, sincronizar com o localStorage, **debounce** de uma busca. O listener recebe a ação e uma API com §getState§, §dispatch§, §cancelActiveListeners§, §delay§ e §condition§. Registre-os com §startListening({ actionCreator, effect })§ e **prepare** o middleware com §.prepend(listener.middleware)§.

### Redux DevTools
Com §configureStore§, a extensão do navegador mostra a **lista de ações**, o **diff** do estado em cada uma, o estado completo e permite **voltar no tempo** (pular ações). Dicas: dê **nomes claros** às ações (eventos), evite colocar dados enormes ou não serializáveis no estado (a verificação de serialização avisa em desenvolvimento) e **desligue** o rastreamento verboso em produção se o estado tiver dados sensíveis (as DevTools expõem o estado a quem tem a extensão e acesso ao app).

### RTK Query em visão geral
É uma camada do próprio RTK para **buscar e cachear dados do servidor**. Você define uma **API** (§createApi§) com **endpoints** (queries e mutations), e ele gera **hooks** (§useGetPedidosQuery§), controla **cache por argumento**, **deduplicação**, estado de **carregamento e erro**, **invalidação por tags** e **refetch**. Os dados ficam **na store**, o que ajuda quando a equipe já usa Redux e quer DevTools para tudo. Comparado ao TanStack Query: o RTK Query é integrado ao Redux e orientado a **endpoints e tags**; o TanStack Query é independente de store e orientado a **chaves de consulta**. Ambos resolvem o mesmo problema; escolha pelo **ecossistema** que a equipe já tem. Neste curso, os exemplos executados de estado de servidor usam o **TanStack Query** (aulas est-06 e est-07); o RTK Query é apresentado como visão geral, a partir da documentação oficial, **sem execução** própria aqui.

### Quando usar cada peça
- estado de cliente com regras: **slice**;
- operação assíncrona pontual e fora do cache (um login, um upload): **thunk**;
- reação a eventos (persistir, debounce, encadear ações): **listener**;
- dados do servidor com cache: **RTK Query** (ou TanStack Query).`,
  concepts: [
    { term: 'Thunk', def: 'Função despachada em vez de um objeto de ação; recebe dispatch e getState e pode ser assíncrona.' },
    { term: 'createAsyncThunk', def: 'Utilitário do RTK que gera um thunk e as ações pending, fulfilled e rejected de uma operação assíncrona.' },
    { term: 'extraReducers', def: 'Parte do createSlice que trata ações definidas fora do slice, como as de um thunk.' },
    { term: 'rejectWithValue', def: 'Função do thunk que rejeita com um payload previsível, disponível em action.payload.' },
    { term: 'unwrap', def: 'Método da promise do thunk que devolve o payload ou lança o erro.' },
    { term: 'Listener middleware', def: 'Middleware do RTK que executa efeitos em resposta a ações específicas.' },
    { term: 'Middleware', def: 'Código que intercepta ações entre o dispatch e o reducer.' },
    { term: 'RTK Query', def: 'Camada do RTK para buscar e cachear dados do servidor com hooks gerados.' },
    { term: 'Tag (RTK Query)', def: 'Rótulo usado para invalidar consultas relacionadas após uma mutação.' },
    { term: 'DevTools', def: 'Extensão que exibe ações e estados do Redux e permite viajar no histórico.' }
  ],
  examples: R`**Analogia:** o thunk é uma **encomenda com acompanhamento**: você recebe um aviso quando ela sai (§pending§) e outro quando chega (§fulfilled§) ou quando se perde (§rejected§). O listener é o **porteiro**: sempre que chega uma carta de certo tipo (ação), ele executa uma tarefa combinada (por exemplo, guardar uma cópia no arquivo). O RTK Query é uma **transportadora completa**, que também lembra o que já entregou e evita entregar o mesmo pacote duas vezes.

**Exemplo 1: ciclo medido.** Carregar o usuário 7 despachou §pending§ e §fulfilled§, e o estado ficou §{ status: "ok", dados: { id: 7 } }§.

**Exemplo 2: erro previsível.** Com id §0§, o thunk usou §rejectWithValue("inválido")§; o estado ficou §status: "erro"§ com a mensagem do payload (o campo §dados§ manteve o valor anterior, o que o código precisa considerar).

**Exemplo 3: listener.** Dois §inc()§ seguidos geraram dois efeitos, lendo §n=1§ e §n=2§.`,
  code: [
    { title: 'Thunk com tratamento de erro previsível (TypeScript)', lang: 'ts', code: R`import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

type Usuario = { id: number; nome: string };

export const carregarUsuario = createAsyncThunk<Usuario, number, { rejectValue: string }>(
  'usuarios/carregar',
  async (id, { rejectWithValue, signal }) => {
    if (id <= 0) return rejectWithValue('id inválido');
    const resp = await fetch('/api/usuarios/' + id, { signal });
    if (!resp.ok) return rejectWithValue('falha ' + resp.status);
    return (await resp.json()) as Usuario;
  },
  { condition: (id, { getState }) => id > 0 }
);

type S = { status: 'ocioso' | 'carregando' | 'ok' | 'erro'; dados: Usuario | null; erro: string | null };

const slice = createSlice({
  name: 'usuarios',
  initialState: { status: 'ocioso', dados: null, erro: null } as S,
  reducers: {},
  extraReducers: (b) => b
    .addCase(carregarUsuario.pending, (st) => { st.status = 'carregando'; st.erro = null; })
    .addCase(carregarUsuario.fulfilled, (st, a) => { st.status = 'ok'; st.dados = a.payload; })
    .addCase(carregarUsuario.rejected, (st, a) => { st.status = 'erro'; st.erro = a.payload ?? a.error.message ?? 'erro'; })
});
export default slice.reducer;`, notes: [{ l: '5', t: 'Os genéricos informam o tipo do retorno, do argumento e do valor de rejeição.' }, { l: '8', t: 'Erro previsível: o payload da ação rejected será essa string.' }, { l: '13', t: 'A opção condition pode cancelar o thunk antes de executar (aqui, ids inválidos).' }, { l: '21', t: 'O builder tipa cada caso: a.payload é Usuario em fulfilled e string | undefined em rejected.' }] },
    { title: 'Listener: persistir ao mudar o carrinho (TypeScript)', lang: 'ts', code: R`import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { adicionado, removido, limpo, carrinhoReducer } from './carrinho';

const listener = createListenerMiddleware();

listener.startListening({
  matcher: isAnyOf(adicionado, removido, limpo),
  effect: async (_acao, api) => {
    api.cancelActiveListeners();          // debounce: cancela a execução anterior
    await api.delay(300);
    localStorage.setItem('carrinho', JSON.stringify(api.getState().carrinho));
  }
});

export const store = configureStore({
  reducer: { carrinho: carrinhoReducer },
  middleware: (getDefault) => getDefault().prepend(listener.middleware)
});`, notes: [{ l: '6', t: 'O matcher combina várias ações; o efeito roda depois que o reducer já atualizou o estado.' }, { l: '8', t: 'cancelActiveListeners + delay implementam um debounce sem timers soltos nos componentes.' }, { l: '16', t: 'O middleware do listener deve entrar com prepend para ver as ações antes dos demais.' }] }
  ],
  bestPractices: ['Mantenha reducers puros; coloque rede em thunks, listeners ou em uma biblioteca de cache de servidor.', 'Use rejectWithValue para erros esperados e trate os três casos no extraReducers.', 'Passe signal para cancelar buscas obsoletas.', 'Use listeners para reações a eventos, em vez de efeitos nos componentes.', 'Use RTK Query (ou TanStack Query) para dados de servidor em vez de thunks escritos à mão.', 'Revise o que as DevTools expõem em produção.'],
  mistakes: ['Esquecer o caso rejected e deixar a tela em "carregando" para sempre.', 'Achar que o dispatch do thunk rejeita a promise (use unwrap).', 'Guardar o objeto de erro (não serializável) no estado.', 'Fazer fetch dentro do reducer.', 'Duplicar buscas por falta de condition ou de cache.', 'Copiar os dados do RTK Query para outro slice e perder a fonte da verdade.'],
  market: R`Projetos Redux existentes quase sempre têm thunks e, cada vez mais, RTK Query. Saber trocar thunks de busca por um cache de servidor, e manter listeners para efeitos de cliente, é uma tarefa frequente de refatoração. A discussão "RTK Query ou TanStack Query" aparece em decisões de arquitetura; a resposta honesta depende do ecossistema da equipe.`,
  summary: R`Lógica assíncrona fica fora dos reducers. §createAsyncThunk§ gera §pending§, §fulfilled§ e §rejected§ (medido) e §rejectWithValue§ define o payload de erros previsíveis. O listener middleware executa efeitos depois do reducer (medido: lê o estado atualizado) e permite debounce. As DevTools mostram ações e estados. O RTK Query cuida de cache, deduplicação e invalidação por tags para dados de servidor (visão geral, sem execução própria nesta aula).`,
  refs: [REF2.createAsyncThunk, REF2.listener, REF2.rtkQuery, REF2.devtools],
  cards: [
    { q: 'Quais ações um createAsyncThunk gera?', a: 'pending, fulfilled e rejected, com o prefixo do tipo (ex.: usuarios/carregar/pending).' },
    { q: 'Para que serve rejectWithValue?', a: 'Para rejeitar com um payload previsível, disponível em action.payload no caso rejected.' },
    { q: 'O que o listener middleware faz?', a: 'Executa efeitos em resposta a ações específicas, depois do reducer, com acesso ao estado atualizado.' },
    { q: 'Por que não fazer busca dentro do reducer?', a: 'O reducer precisa ser puro e previsível; a rede é um efeito colateral.' },
    { q: 'O que o RTK Query resolve?', a: 'Cache, deduplicação, estado de carregamento e erro, e invalidação por tags para dados de servidor.' }
  ]
},
{
  id: 'est-05', moduleId: 'm2', order: 5, minutes: 65, tags: ['Zustand', 'store', 'seletores', 'useShallow', 'persist', 'slices'],
  title: 'Zustand: stores pequenas, seletores, middlewares e fatias',
  objectives: ['Criar uma store com §create§ e ler o estado com seletores', 'Explicar quando um componente re-renderiza e usar §useShallow§ para seletores que devolvem objetos', 'Usar a store fora do React (§getState§, §setState§ e §subscribe§)', 'Aplicar os middlewares §persist§ e §subscribeWithSelector§', 'Organizar uma store grande com o padrão de fatias (slices)'],
  intro: R`O **Zustand** é uma biblioteca de estado minimalista: uma **store** criada com uma função, lida por um **hook** com seletor, sem Provider, sem reducers obrigatórios e com pouco código. Esta aula mostra o essencial e o que muda para quem vem do Redux. Os comportamentos foram **medidos** com zustand 5.1.0 e React 19.3.1.`,
  theory: R`### A store
§const useStore = create((set, get) => ({ n: 0, inc: () => set((s) => ({ n: s.n + 1 })) }))§. O argumento é uma função que recebe §set§ (mescla um objeto parcial no estado, **raso**) e §get§ (lê o estado atual) e devolve o estado inicial **junto com as ações** (as funções que o modificam). Não há Provider: a store é um **módulo**; qualquer componente a importa.
Quanto a imutabilidade: o §set§ **não muta**: ele cria um novo objeto de estado mesclando o parcial. Para estruturas aninhadas, você copia o nível alterado (ou usa o middleware §immer§).

### Ler com seletores
§const n = useStore((s) => s.n)§ inscreve o componente **apenas nessa fatia**. Medido, com um componente que lê tudo (§useStore()§), outro que lê só §n§ e outro com §useShallow§ sobre §{ n, nome }§:
- ao mudar **só §nome§**: o componente que lia **tudo** renderizou +1; o que lia **só §n§** +0; o com §useShallow§ +1 (porque §nome§ faz parte do que ele seleciona);
- ao mudar **só §n§**: tudo +1, só-§n§ +1, shallow +1.
Regra: **selecione o mínimo**. Ler a store inteira equivale a "renderize a cada mudança".

### Seletores que devolvem objetos: useShallow
No Zustand v5, um seletor que **devolve um objeto novo a cada chamada** (§(s) => ({ n: s.n, nome: s.nome })§) provoca um **laço**: no teste, o React lançou "Maximum update depth exceeded". A solução é envolver o seletor em §useShallow§, que compara o resultado **campo a campo** (comparação rasa) e mantém a mesma referência quando os campos são iguais:
§§§
const { n, nome } = useStore(useShallow((s) => ({ n: s.n, nome: s.nome })));
§§§
Alternativa: selecionar cada campo separadamente com vários §useStore§.

### Fora do React
A store tem API própria: §useStore.getState()§ lê, §useStore.setState(parcial)§ escreve e §useStore.subscribe(ouvinte)§ observa. Medido: um ouvinte recebeu §(estado, anterior)§ e viu §1->2§; depois de cancelado (§unsubscribe()§), o próximo §inc§ não foi observado. Isso é útil para código fora de componentes (um cliente HTTP lendo o token) e para **testes**: basta chamar as ações e ler §getState()§.

### Middlewares
- **persist**: grava o estado em um armazenamento (localStorage por padrão) e o restaura ao iniciar. Opções importantes: §name§ (chave), §partialize§ (quais campos gravar), §version§ e §migrate§ (para evoluir o formato). Medido: com §partialize: (s) => ({ a: s.a })§ e §version: 2§, o armazenado foi §{"state":{"a":2},"version":2}§: as **funções não são gravadas** e só o campo escolhido foi persistido. Cuidado: dados sensíveis (tokens) em localStorage ficam acessíveis a scripts da página (risco de XSS).
- **subscribeWithSelector**: permite assinar uma fatia com comparação (§subscribe(seletor, ouvinte)§). Medido: com assinatura de §x§, a mudança em §y§ **não** disparou o ouvinte; mudar §x§ para 5 disparou §0->5§ e repetir 5 **não** disparou de novo.
- **devtools**: conecta às Redux DevTools; **immer**: escrever atualizações "mutáveis".

### Padrão de fatias (slices pattern)
Para stores grandes, divida em funções que recebem §(set, get)§ e devolvem um pedaço do estado, e combine: §create((...a) => ({ ...fatiaA(...a), ...fatiaB(...a) }))§. Medido: a ação §somaAB§ da fatia B leu §get().a§ da fatia A e devolveu §12§ (a=2, b=10). Cada fatia pode ficar em seu arquivo; o §get§ permite que uma fatia leia a outra sem import circular.

### Zustand x Redux Toolkit
- **Zustand**: menos cerimônia, sem Provider, API pequena, seletores nativos; sem convenção imposta, então a **disciplina** é da equipe; DevTools via middleware.
- **Redux Toolkit**: estrutura padronizada, ações nomeadas e rastreáveis por padrão, ecossistema (RTK Query, listeners), mais código.
Ambos são boas escolhas para **estado de cliente**. Nenhum substitui o cache de servidor.

### Cuidados
- Ações dentro da store (§inc§) têm identidade estável; selecione-as sem problema.
- Evite guardar **estado derivado**: derive no componente ou em um seletor.
- Com SSR (Next.js), uma store de módulo é **compartilhada entre requisições** no servidor: crie uma store por requisição (tópico da C2.5).`,
  concepts: [
    { term: 'create (Zustand)', def: 'Função que cria a store e devolve o hook para lê-la.' },
    { term: 'set e get', def: 'set mescla um parcial (raso) ao estado; get lê o estado atual dentro da store.' },
    { term: 'Seletor (Zustand)', def: 'Função passada ao hook para escolher a fatia que o componente lê e determinar quando renderiza.' },
    { term: 'useShallow', def: 'Envolve um seletor e compara o resultado campo a campo para evitar renderizações e laços.' },
    { term: 'persist', def: 'Middleware que grava o estado em um armazenamento e o restaura ao iniciar.' },
    { term: 'partialize', def: 'Opção do persist que escolhe quais campos serão gravados.' },
    { term: 'subscribeWithSelector', def: 'Middleware que permite assinar uma fatia do estado com comparação.' },
    { term: 'Padrão de fatias', def: 'Dividir uma store grande em funções que devolvem partes do estado e combiná-las.' },
    { term: 'getState e setState', def: 'API da store para ler e escrever fora de componentes React.' },
    { term: 'Estado de módulo', def: 'Estado criado no escopo do módulo, compartilhado por todo código que o importa.' }
  ],
  examples: R`**Analogia:** a store do Zustand é um **quadro de avisos** numa sala de equipe. Cada pessoa (componente) assina **apenas os avisos que lhe interessam** (seletor); quem pede "todos os avisos" é chamado a cada alteração. O §useShallow§ é como dizer "me chame se qualquer um destes dois avisos mudar, mas não se só trocarem a moldura".

**Exemplo 1: seletores.** Alterar o nome não renderizou o componente que só lia o contador (0 renderizações), mas renderizou o que lia a store inteira (+1).

**Exemplo 2: o laço do objeto novo.** Um seletor que cria um objeto a cada chamada falha com "Maximum update depth exceeded"; com useShallow funciona.

**Exemplo 3: persistência parcial.** Gravar apenas o campo §a§ e a versão, nunca as funções.`,
  code: [
    { title: 'Store com ações, seletores e persistência (TypeScript)', lang: 'ts', code: R`import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, createJSONStorage } from 'zustand/middleware';

type Tema = 'claro' | 'escuro';
type PreferenciasState = {
  tema: Tema;
  tamanhoFonte: number;
  alternarTema: () => void;
  aumentarFonte: () => void;
};

export const usePreferencias = create<PreferenciasState>()(
  persist(
    (set) => ({
      tema: 'claro',
      tamanhoFonte: 16,
      alternarTema: () => set((s) => ({ tema: s.tema === 'claro' ? 'escuro' : 'claro' })),
      aumentarFonte: () => set((s) => ({ tamanhoFonte: Math.min(s.tamanhoFonte + 2, 24) }))
    }),
    {
      name: 'preferencias',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (s) => ({ tema: s.tema, tamanhoFonte: s.tamanhoFonte })
    }
  )
);

// componente: seleciona só o que usa
export function BotaoTema() {
  const tema = usePreferencias((s) => s.tema);
  const alternar = usePreferencias((s) => s.alternarTema);
  return <button onClick={alternar}>Tema: {tema}</button>;
}

// vários campos em um objeto: use useShallow
export function Resumo() {
  const { tema, tamanhoFonte } = usePreferencias(useShallow((s) => ({ tema: s.tema, tamanhoFonte: s.tamanhoFonte })));
  return <p>{tema} / {tamanhoFonte}px</p>;
}`, notes: [{ l: '13', t: 'Em TypeScript, a forma create<T>()(...) é a recomendada para tipar a store com middlewares.' }, { l: '24', t: 'partialize escolhe os campos persistidos; as funções ficam de fora.' }, { l: '34', t: 'Selecionar uma função estável (a ação) não causa renderizações extras.' }, { l: '40', t: 'Sem useShallow, esse seletor devolveria um objeto novo a cada chamada e entraria em laço no Zustand v5.' }] },
    { title: 'Fatias e uso fora do React (TypeScript)', lang: 'ts', code: R`import { create, type StateCreator } from 'zustand';

type FatiaA = { a: number; incA: () => void };
type FatiaB = { b: number; somaAB: () => number };
type Tudo = FatiaA & FatiaB;

const criarA: StateCreator<Tudo, [], [], FatiaA> = (set) => ({ a: 1, incA: () => set((s) => ({ a: s.a + 1 })) });
const criarB: StateCreator<Tudo, [], [], FatiaB> = (_set, get) => ({ b: 10, somaAB: () => get().a + get().b });

export const useApp = create<Tudo>()((...args) => ({ ...criarA(...args), ...criarB(...args) }));

// fora de componentes (por exemplo, em testes):
useApp.getState().incA();
console.log(useApp.getState().somaAB()); // 12`, notes: [{ l: '7', t: 'Cada fatia recebe set e get da store completa, então pode ler campos das outras.' }, { l: '10', t: 'A store final junta as fatias por espalhamento.' }, { l: '14', t: 'getState funciona fora do React: ótimo para testes de lógica.' }] }
  ],
  bestPractices: ['Selecione o mínimo; evite ler a store inteira.', 'Use useShallow quando o seletor devolve objeto ou array.', 'Mantenha ações dentro da store e nomeie-as pelo evento.', 'Use partialize e version no persist; planeje migrações.', 'Não guarde tokens de acesso em localStorage sem avaliar o risco.', 'Em SSR, crie a store por requisição.'],
  mistakes: ['Ler a store inteira em todos os componentes.', 'Devolver objeto novo no seletor sem useShallow.', 'Mutar o estado diretamente em vez de usar set.', 'Persistir tudo, inclusive dados sensíveis ou derivados.', 'Guardar dados de servidor na store sem estratégia de atualização.', 'Criar uma store única gigante sem fatias.'],
  market: R`O Zustand é muito usado em aplicações React e React Native que querem estado global com pouco código. Em decisões de equipe, ele costuma ser escolhido quando o estado de cliente é modesto e o Redux seria cerimônia demais. Saber seletores e useShallow evita os problemas de desempenho que mais aparecem em revisões.`,
  summary: R`O Zustand cria a store com §create§ e a lê com seletores: quem seleciona só §n§ não renderiza ao mudar §nome§ (medido). Seletores que devolvem objetos novos exigem §useShallow§ (medido: laço "Maximum update depth exceeded" sem ele). A store funciona fora do React (§getState§, §setState§, §subscribe§). §persist§ com §partialize§ e §version§ grava só o escolhido; §subscribeWithSelector§ observa fatias; o padrão de fatias organiza stores grandes.`,
  refs: [REF2.zustand, REF2.zustandPersist, REF2.zustandSlices, REF2.zustandPrevent],
  cards: [
    { q: 'Quando um componente do Zustand renderiza?', a: 'Quando a fatia que o seletor devolve muda (comparação por referência); ler a store inteira renderiza a cada mudança.' },
    { q: 'Para que serve useShallow?', a: 'Para seletores que devolvem objetos ou arrays: compara campo a campo e evita renderizações extras e laços.' },
    { q: 'Como usar a store fora do React?', a: 'Com getState, setState e subscribe da própria store.' },
    { q: 'O que partialize faz no persist?', a: 'Escolhe quais campos do estado são gravados; funções e campos omitidos não vão para o armazenamento.' },
    { q: 'Como organizar uma store grande?', a: 'Com o padrão de fatias: funções que recebem set e get e devolvem partes do estado, combinadas por espalhamento.' }
  ]
},
{
  id: 'est-06', moduleId: 'm3', order: 6, minutes: 75, tags: ['TanStack Query', 'estado de servidor', 'queryKey', 'staleTime', 'gcTime', 'mutações'],
  title: 'TanStack Query I: consultas, chaves, cache, staleTime e gcTime',
  objectives: ['Explicar por que dados de servidor exigem uma ferramenta de cache e não um estado global manual', 'Escrever consultas com §useQuery§ e chaves de consulta bem projetadas', 'Distinguir §staleTime§ de §gcTime§ e prever quando há nova busca', 'Entender a deduplicação, o retry padrão e os estados (§status§, §isFetching§)', 'Escrever mutações com §useMutation§'],
  intro: R`**Estado de servidor** é uma cópia de algo que mora em outro lugar. Ele fica **velho**, precisa de **carregamento e erro**, é pedido por várias telas ao mesmo tempo e muda por ações do usuário. Fazer isso com §useEffect§ e §useState§ gera código longo e cheio de bugs de corrida. O **TanStack Query** (v5) assume esse trabalho: **cache por chave**, **deduplicação**, **atualização em segundo plano**, **retry** e **coleta de lixo**. Todos os comportamentos abaixo foram **medidos** com @tanstack/react-query 5.108.4.`,
  theory: R`### O problema que o TanStack Query resolve
Com um fetch dentro de efeito, cada componente cuida de §dados§, §carregando§ e §erro§ à mão. Faltam: **compartilhar** o resultado entre telas, **evitar** buscas repetidas, **atualizar** quando a janela volta ao foco, **tentar de novo** após falha, **cancelar** buscas obsoletas e **descartar** dados que ninguém usa. O TanStack Query chama de **query** cada "pergunta ao servidor" identificada por uma **chave**.

### Configuração mínima
§const client = new QueryClient()§ e §<QueryClientProvider client={client}>§ na raiz. Em seguida:
§§§
const q = useQuery({ queryKey: ['pedidos', { status }], queryFn: () => buscarPedidos(status) });
§§§
O §queryFn§ é uma função que devolve uma **promise** e deve **lançar** em caso de erro (com §fetch§, verifique §resp.ok§). O hook devolve §data§, §error§, §status§ (§pending§, §error§ ou §success§), §isPending§, §isError§, §isFetching§ (há busca em andamento, inclusive em segundo plano) e §refetch§.

### Chaves de consulta (query keys)
A **chave** é um array que identifica os dados: ela **é** o cache. Regras:
- inclua **tudo que o §queryFn§ usa** (ids, filtros, página): se mudar, a chave muda e a consulta é refeita para a nova chave;
- o hash da chave é **estrutural**: medido, §["t", { a: 1, b: 2 }]§ e §["t", { b: 2, a: 1 }]§ têm o **mesmo** hash (a ordem das propriedades de objetos não importa), enquanto em arrays a **ordem importa** (§["t", 1, 2]§ difere de §["t", 2, 1]§);
- organize do **geral para o específico** (§["pedidos"]§, §["pedidos", "lista", filtros]§, §["pedidos", "item", id]§): invalidar um prefixo atinge tudo abaixo dele (aula est-07);
- centralize as chaves em **fábricas** (§pedidosKeys.item(id)§) para evitar erros de digitação.

### Deduplicação
Se vários componentes usam a **mesma chave** ao mesmo tempo, só **uma** busca acontece. Medido: dois componentes montados com a mesma chave resultaram em **1** chamada ao §queryFn§.

### Dado "fresco" e dado "velho": staleTime
Um dado é **fresco** por §staleTime§ milissegundos depois de buscado; depois, é **velho** (*stale*). Dado fresco é servido do cache **sem nova busca**; dado velho ainda é **mostrado** imediatamente e é **atualizado em segundo plano** quando há um gatilho (um componente monta, a janela volta ao foco, a rede reconecta). O padrão é §staleTime: 0§: todo dado já nasce velho, então remontar o componente sempre dispara uma busca de fundo. Medido, com §staleTime: 100§: remontar após 20 ms **não** refez a busca (1 busca no total); após 120 ms, refez (2 buscas).
Escolha o §staleTime§ pela **natureza do dado**: uma lista de países (horas), um perfil (minutos), um preço de ação (zero).

### Coleta de lixo: gcTime
Quando **nenhum componente usa** uma query (ela está **inativa**), o cache a guarda por §gcTime§ (padrão de **5 minutos**, segundo a documentação) e então a **remove**. Medido, com §gcTime: 50§: a query estava no cache enquanto montada e **não estava mais** 100 ms depois de desmontar. Não confunda: §staleTime§ decide **quando buscar de novo**; §gcTime§ decide **por quanto tempo guardar** o que ninguém usa. Se §gcTime§ for menor que §staleTime§, o dado pode ser descartado antes de envelhecer.

### Retry e estados de erro
Por padrão, uma query que falha é **repetida 3 vezes** com espera crescente. Medido: com o padrão do cliente e um §queryFn§ que sempre lançava, foram **4 tentativas** (1 + 3 repetições) antes de o §status§ virar §error§. Em **testes**, desligue com §retry: false§ (como fizemos nos demais experimentos). Para erros que não adiantam repetir (404, 401), configure §retry§ como função.

### Estados: pending, fetching e erro
§status§ descreve o **dado** (existe? falhou?) e §fetchStatus§/§isFetching§ descreve a **busca** (em andamento?). Uma consulta pode ter §success§ **e** §isFetching§ ao mesmo tempo (atualização em segundo plano). Na interface: use §isPending§ para o esqueleto de carregamento inicial e §isFetching§ para um indicador discreto de atualização.

### Mutações
Para **escrever** no servidor: §useMutation({ mutationFn })§, que devolve §mutate§, §mutateAsync§, §isPending§, §error§. Mutações **não** são cacheadas por chave nem refeitas automaticamente. Callbacks: §onMutate§, §onSuccess§, §onError§, §onSettled§. Depois de uma mutação, o estado de servidor da tela fica **desatualizado**: invalidar as consultas afetadas é o assunto da próxima aula.

### Opções que merecem atenção
- §enabled§: só busca quando a condição é verdadeira (depende de outro dado);
- §select§: transforma o dado e evita renderizações se o resultado for igual;
- §placeholderData§ e §initialData§: valores provisórios;
- §refetchOnWindowFocus§: padrão ligado, ótimo para dados que envelhecem; desligue se atrapalhar;
- §queryFn§ recebe o contexto com §signal§ para **cancelar** a requisição quando a query for abandonada.

### O que não colocar no TanStack Query
Estado de cliente puro (tema, painel aberto, valor de campo): continua em §useState§, Context ou Zustand. Misturar os dois tipos é o erro mais comum de arquitetura de estado.`,
  concepts: [
    { term: 'Query', def: 'Pergunta ao servidor identificada por uma chave, com seu resultado guardado no cache.' },
    { term: 'queryKey', def: 'Array que identifica uma consulta no cache; deve conter tudo que a função de busca usa.' },
    { term: 'queryFn', def: 'Função que devolve uma promise com os dados e lança em caso de erro.' },
    { term: 'staleTime', def: 'Tempo em que um dado buscado é considerado fresco e servido sem nova busca.' },
    { term: 'gcTime', def: 'Tempo que uma query inativa permanece no cache antes de ser removida.' },
    { term: 'Deduplicação', def: 'Compartilhar uma única busca entre vários componentes que usam a mesma chave.' },
    { term: 'isFetching', def: 'Indica que há uma busca em andamento, inclusive uma atualização em segundo plano.' },
    { term: 'Mutação', def: 'Operação de escrita no servidor, executada com useMutation e sem cache por chave.' },
    { term: 'QueryClient', def: 'Objeto que guarda o cache e as configurações padrão das queries e mutações.' },
    { term: 'Atualização em segundo plano', def: 'Nova busca de um dado velho enquanto o dado antigo continua visível.' }
  ],
  examples: R`**Analogia:** o cache do TanStack Query é a **geladeira** de uma casa. O §staleTime§ é o prazo em que a comida é considerada **boa para comer sem checar** (comida fresca vai direto ao prato); passou o prazo, você ainda a serve, mas manda alguém **comprar nova em segundo plano**. O §gcTime§ é quanto tempo você deixa um pote **esquecido** na geladeira antes de jogar fora. A **chave** é a etiqueta do pote: duas pessoas pedindo o mesmo pote não mandam comprar duas vezes (deduplicação).

**Exemplo 1: chaves.** Filtros em objeto: a ordem das propriedades não muda o cache; em arrays, a ordem importa.

**Exemplo 2: staleTime 100 ms.** Remontar em 20 ms: 1 busca; remontar após 120 ms: 2 buscas.

**Exemplo 3: retry.** Um servidor que sempre falha produziu 4 tentativas antes do erro (medido, com o padrão do cliente).`,
  code: [
    { title: 'Consulta tipada com fábrica de chaves (TypeScript)', lang: 'tsx', code: R`import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

type Pedido = { id: string; cliente: string; total: number; status: 'aberto' | 'pago' };

export const pedidosKeys = {
  todos: ['pedidos'] as const,
  lista: (status: string) => ['pedidos', 'lista', { status }] as const,
  item: (id: string) => ['pedidos', 'item', id] as const
};

async function buscarPedidos(status: string, signal?: AbortSignal): Promise<Pedido[]> {
  const resp = await fetch('/api/pedidos?status=' + encodeURIComponent(status), { signal });
  if (!resp.ok) throw new Error('Falha ' + resp.status);
  return resp.json();
}

export function usePedidos(status: string) {
  return useQuery({
    queryKey: pedidosKeys.lista(status),
    queryFn: ({ signal }) => buscarPedidos(status, signal),
    staleTime: 30_000
  });
}

const client = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

export function App() {
  return (
    <QueryClientProvider client={client}>
      <Lista status="aberto" />
    </QueryClientProvider>
  );
}

function Lista({ status }: { status: string }) {
  const { data, isPending, isError, error, isFetching } = usePedidos(status);
  if (isPending) return <p>Carregando...</p>;
  if (isError) return <p role="alert">{error.message}</p>;
  return (
    <section aria-busy={isFetching}>
      <ul>{data.map((p) => <li key={p.id}>{p.cliente}: R$ {p.total}</li>)}</ul>
    </section>
  );
}`, notes: [{ l: '5', t: 'Fábrica de chaves: do geral (todos) ao específico (item). Invalidar ["pedidos"] atinge todas.' }, { l: '11', t: 'fetch não lança em 4xx e 5xx: é preciso verificar resp.ok e lançar.' }, { l: '19', t: 'O signal permite cancelar a requisição se a consulta for abandonada.' }, { l: '21', t: 'staleTime de 30 s: remontar dentro desse prazo não busca de novo.' }, { l: '38', t: 'isPending é o carregamento inicial; isFetching indica atualização, inclusive em segundo plano.' }] },
    { title: 'Mutação simples (TypeScript)', lang: 'tsx', code: R`import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosKeys } from './pedidos';

export function useMarcarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const resp = await fetch('/api/pedidos/' + id + '/pagar', { method: 'POST' });
      if (!resp.ok) throw new Error('Falha ' + resp.status);
      return resp.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: pedidosKeys.todos })
  });
}`, notes: [{ l: '12', t: 'Depois da escrita, as consultas de pedidos ficam desatualizadas: a invalidação refaz as ativas (aula est-07).' }] }
  ],
  bestPractices: ['Inclua na chave tudo que o queryFn usa e centralize as chaves em fábricas.', 'Defina staleTime pela natureza do dado em vez de aceitar sempre o padrão zero.', 'Lance erros no queryFn (verifique resp.ok).', 'Desligue o retry em testes e ajuste-o para erros definitivos.', 'Use isPending para o carregamento inicial e isFetching para atualizações.', 'Mantenha estado de cliente fora do TanStack Query.'],
  mistakes: ['Copiar os dados da query para useState ou para uma store.', 'Esquecer variáveis na chave e servir dado de outro filtro.', 'Confundir staleTime com gcTime.', 'Não lançar erro com fetch e deixar a query "ter sucesso" com uma resposta 500.', 'Misturar chaves strings e arrays ao acaso.', 'Esperar que mutações sejam cacheadas ou refeitas sozinhas.'],
  market: R`O TanStack Query tornou-se o padrão de fato para dados de servidor em React (e em outros frameworks). Equipes que o adotam removem milhares de linhas de efeitos e de estados de carregamento. Saber explicar staleTime, gcTime, chaves e invalidação é parte comum das entrevistas e das revisões de arquitetura.`,
  summary: R`Dados de servidor pedem cache, deduplicação e atualização em segundo plano. No TanStack Query, a **chave** identifica a consulta (hash estrutural: ordem de propriedades de objetos não importa, ordem de itens de array importa). Vários componentes com a mesma chave geram 1 busca. §staleTime§ decide quando buscar de novo (medido: 1 busca remontando em 20 ms e 2 após 120 ms, com 100 ms); §gcTime§ decide quando remover queries inativas (medido: removida após desmontar). O retry padrão fez 4 tentativas. Mutações usam §useMutation§ e exigem invalidação depois.`,
  refs: [REF2.tqOverview, REF2.tqKeys, REF2.tqCaching, REF2.tqStale, REF2.tqQueries, REF2.tqMutations],
  cards: [
    { q: 'O que identifica uma query no cache?', a: 'A queryKey: um array com tudo que a função de busca usa.' },
    { q: 'Qual a diferença entre staleTime e gcTime?', a: 'staleTime: por quanto tempo o dado é fresco (sem nova busca). gcTime: por quanto tempo uma query inativa fica no cache antes de ser removida.' },
    { q: 'O que acontece com dois componentes usando a mesma chave?', a: 'Apenas uma busca é feita (deduplicação) e ambos compartilham o resultado.' },
    { q: 'Qual o retry padrão de uma query que falha?', a: 'Três repetições com espera crescente (medido: 4 tentativas no total antes de status error).' },
    { q: 'Qual a diferença entre isPending e isFetching?', a: 'isPending: ainda não há dado; isFetching: há uma busca em andamento, inclusive em segundo plano com dado já mostrado.' }
  ]
}
];
