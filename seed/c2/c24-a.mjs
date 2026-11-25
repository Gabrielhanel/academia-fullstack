// C2.4 — Gerenciamento de estado no frontend. Aulas 1 a 3 (taxonomia do estado; useReducer + Context; Redux Toolkit I).
const R = String.raw;

export const REF = {
  choosing: { title: 'React — Choosing the State Structure', url: 'https://react.dev/learn/choosing-the-state-structure', kind: 'doc' },
  sharing: { title: 'React — Sharing State Between Components', url: 'https://react.dev/learn/sharing-state-between-components', kind: 'doc' },
  scaling: { title: 'React — Scaling Up with Reducer and Context', url: 'https://react.dev/learn/scaling-up-with-reducer-and-context', kind: 'doc' },
  useReducer: { title: 'React — useReducer (referência)', url: 'https://react.dev/reference/react/useReducer', kind: 'doc' },
  useContext: { title: 'React — useContext (referência)', url: 'https://react.dev/reference/react/useContext', kind: 'doc' },
  rtkQuick: { title: 'Redux Toolkit — Quick Start', url: 'https://redux-toolkit.js.org/tutorials/quick-start', kind: 'doc' },
  createSlice: { title: 'Redux Toolkit — createSlice', url: 'https://redux-toolkit.js.org/api/createSlice', kind: 'doc' },
  configureStore: { title: 'Redux Toolkit — configureStore', url: 'https://redux-toolkit.js.org/api/configureStore', kind: 'doc' },
  reduxStyle: { title: 'Redux — Style Guide', url: 'https://redux.js.org/style-guide/', kind: 'doc' },
  reduxFundamentals: { title: 'Redux — Essentials (visão geral)', url: 'https://redux.js.org/tutorials/essentials/part-1-overview-concepts', kind: 'doc' },
  reselect: { title: 'Reselect — documentação', url: 'https://reselect.js.org/', kind: 'doc' },
  reactReduxHooks: { title: 'React Redux — Hooks', url: 'https://react-redux.js.org/api/hooks', kind: 'doc' },
  immer: { title: 'Immer — documentação', url: 'https://immerjs.github.io/immer/', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'est-01', moduleId: 'm1', order: 1, minutes: 65, tags: ['estado', 'taxonomia', 'fonte da verdade', 'estado derivado', 'estado de servidor'],
  title: 'Onde o estado vive: taxonomia do estado e fontes da verdade',
  objectives: ['Classificar o estado de uma interface em local de UI, compartilhado de cliente, de servidor, de URL, de formulário e derivado', 'Identificar a fonte da verdade de cada dado e evitar duplicação e sincronização manual', 'Aplicar a regra "derive, não armazene" e escolher a menor estrutura de estado correta', 'Decidir se um estado deve ficar local, ser elevado ou ir para uma ferramenta global', 'Reconhecer os sintomas de estado mal posicionado (prop drilling, efeitos que copiam estado, telas desatualizadas)'],
  intro: R`Quase todo bug de interface com "dados errados na tela" tem a mesma origem: **o mesmo fato guardado em dois lugares** ou **guardado no lugar errado**. Antes de escolher Redux, Zustand ou TanStack Query, é preciso saber **que tipo de estado** você tem. Esta aula dá um vocabulário simples: seis tipos de estado, a ideia de **fonte da verdade** e a regra de **derivar em vez de armazenar**. Quem domina isso escolhe a ferramenta certa em minutos e, muitas vezes, descobre que **não precisa de nenhuma biblioteca**.`,
  theory: R`### Estado é tudo que muda e a interface precisa lembrar
Estado é a **memória** da interface entre uma renderização e outra. Nem todo dado que aparece na tela é "estado": o que se pode **calcular** a partir de outro dado não precisa ser guardado. A pergunta útil é sempre: **quem é o dono deste dado e quem mais precisa dele?**

### Seis tipos de estado
1. **Estado local de UI**: pertence a **um** componente e some com ele (menu aberto, texto digitado num campo de busca, aba selecionada). Ferramenta: §useState§ ou §useReducer§.
2. **Estado compartilhado de cliente**: vários componentes distantes precisam do **mesmo** dado que só existe no navegador (tema, carrinho antes do pedido, painel lateral aberto, usuário "logado" já carregado). Ferramentas: elevação de estado, Context, Redux Toolkit, Zustand.
3. **Estado de servidor** (*server state*): é uma **cópia** de dados cuja **fonte da verdade está no servidor** (lista de pedidos, perfil). Ele pode ficar **desatualizado** a qualquer momento, é **assíncrono**, tem carregamento e erro, e pode ser compartilhado entre telas. Ferramenta: **TanStack Query** (ou RTK Query), não um "estado global" feito à mão.
4. **Estado de URL**: filtros, página, ordenação, id selecionado. A **URL é a fonte da verdade**: assim o link compartilhado, o botão voltar e o recarregar da página funcionam. Ferramenta: roteador (parâmetros de rota e de busca).
5. **Estado de formulário**: valores, erros, campos tocados, envio em andamento. Ferramenta: estado local ou biblioteca de formulários; só vai para o global em fluxos longos (assistente de várias etapas).
6. **Estado derivado**: pode ser **calculado** de outro estado (total do carrinho, lista filtrada, "está vazio?"). **Não** se guarda: calcula-se durante o render (ou com um **seletor**).

### Fonte da verdade
Cada fato deve ter **uma** fonte da verdade. Quando o mesmo fato existe em dois lugares, aparecem três problemas: **divergência** (um lado atualiza e o outro não), **código de sincronização** (efeitos que copiam um estado para outro) e **bugs intermitentes** (a tela mostra um valor de ontem). Exemplo clássico: guardar §itens§ e também §total§ no estado. Cada vez que um item muda é preciso lembrar de atualizar o total; se esquecer, a tela mente. A correção é guardar só §itens§ e **derivar** o total.

### Derive, não armazene
Regra prática: se o valor pode ser calculado a partir de props ou estado, **calcule no render**. Isso vale para listas filtradas, contagens, validações e rótulos. Se o cálculo for caro, memoize (§useMemo§ ou um seletor memoizado), mas **continue sem guardar a cópia**. Um sinal de alerta é o padrão "§useEffect§ que lê o estado A e chama §setB§": quase sempre B deveria ser derivado de A.

### Escolha a menor estrutura correta
Princípios do guia do React para estruturar estado:
- **agrupe** estados que mudam juntos (um objeto §{ x, y }§ em vez de duas variáveis que se atualizam sempre juntas);
- **evite contradições** (§carregando§ e §erro§ como dois booleanos permitem a combinação impossível "carregando e com erro"; prefira um **status** único: §"ocioso" | "carregando" | "erro" | "ok"§);
- **evite redundância** (não guarde o objeto selecionado, guarde o **id** e procure o objeto na lista: assim, se o item mudar, a seleção não fica velha);
- **evite duplicação** de objetos entre listas (guarde um por id; as listas guardam ids);
- **evite aninhamento profundo** (estruturas planas e **normalizadas** são mais simples de atualizar, tema da aula est-08).

### Onde colocar: a escada da elevação
1. Comece **local**.
2. Se dois irmãos precisam do mesmo dado, **eleve** o estado ao pai comum e passe por props.
3. Se passar por muitos níveis só para chegar ao destino (**prop drilling**), considere composição (passar o elemento por §children§) ou **Context**.
4. Se o dado é do **servidor**, não o copie para um estado global: use uma biblioteca de **cache de servidor**.
5. Se o estado de cliente é grande, muda com frequência por muitas telas, precisa de **depuração com histórico** ou de regras centralizadas, use uma **store** (Redux Toolkit, Zustand).
Subir a escada tem custo (indireção, mais código, mais re-renderizações). Só suba quando o degrau de baixo realmente doer.

### Um exemplo de classificação
Uma tela de pedidos tem: a lista de pedidos (**servidor**), o filtro de status e a página (**URL**), o pedido aberto no painel lateral (**URL** ou **local**), o texto digitado na busca antes de enviar (**local**), o tema escuro (**compartilhado de cliente**, com persistência), o formulário de edição (**formulário**) e o "total em aberto" (**derivado** da lista). Perceba que **nenhum** desses dados exige a mesma ferramenta.

### Sintomas de estado mal posicionado
- **Prop drilling** com props que só atravessam componentes.
- **Efeito que copia**: §useEffect(() => setNome(user.nome), [user])§ cria duas verdades.
- **Tela desatualizada** após uma mutação: o estado de servidor foi copiado e ninguém o invalidou (aulas est-06 e est-07).
- **Re-renderização em cascata**: um valor global muda e toda a árvore renderiza (aulas est-02, est-03 e est-05).
- **Estado que sobrevive demais**: um filtro que deveria resetar ao trocar de tela permanece.`,
  concepts: [
    { term: 'Estado local', def: 'Dado que pertence a um único componente e some com ele.' },
    { term: 'Estado compartilhado de cliente', def: 'Dado que só existe no navegador e é lido por vários componentes distantes.' },
    { term: 'Estado de servidor', def: 'Cópia local de dados cuja fonte da verdade está no servidor; pode ficar desatualizada.' },
    { term: 'Estado de URL', def: 'Estado guardado na URL (rota, parâmetros de busca), que torna a tela compartilhável e recarregável.' },
    { term: 'Estado derivado', def: 'Valor calculável a partir de outro estado e que, por isso, não deve ser armazenado.' },
    { term: 'Fonte da verdade', def: 'O único lugar onde um fato é guardado; os demais lugares apenas o leem ou o derivam.' },
    { term: 'Elevação de estado', def: 'Mover o estado para o ancestral comum dos componentes que precisam dele.' },
    { term: 'Prop drilling', def: 'Passar props por vários níveis intermediários que não as usam, só para alcançar o destino.' },
    { term: 'Status único', def: 'Um campo com valores exclusivos (ocioso, carregando, erro, ok) em vez de vários booleanos que permitem combinações impossíveis.' },
    { term: 'Estado impossível', def: 'Combinação de valores que o modelo permite, mas que não faz sentido (carregando e com erro).' }
  ],
  examples: R`**Analogia:** o estado é como a **agenda** de um consultório. A agenda (fonte da verdade) fica na recepção; cada médico pode ter um **bilhete** com a consulta de hoje (cópia). Se a recepção remarcar e o bilhete não for atualizado, o médico aparece na hora errada. Quanto menos bilhetes, menos remarcações perdidas. Já o "número de consultas do dia" é só uma **contagem** da agenda: ninguém o escreve em um papel separado.

**Exemplo 1: derivar em vez de armazenar.** Em vez de guardar §itens§ e §total§, guarde só os itens e calcule o total no render. Se um item mudar, o total acompanha sem nenhum código extra.

**Exemplo 2: id em vez de objeto.** Ao selecionar um pedido, guarde §selecionadoId§. Se a lista for atualizada (um refetch trouxe o novo status), o painel mostra o pedido **atual**; se você guardasse o objeto, o painel mostraria o objeto velho.

**Exemplo 3: status único.** Com §carregando: true§ e §erro: "falhou"§ ao mesmo tempo, a interface não sabe o que mostrar. Com §status: "erro"§ só existe uma situação por vez, e o TypeScript confere cada caso.`,
  code: [
    { title: 'Derivar, usar id e status único (TypeScript)', lang: 'tsx', code: R`type Pedido = { id: string; total: number; status: 'aberto' | 'pago' };
type Carga = { status: 'ocioso' } | { status: 'carregando' } | { status: 'erro'; mensagem: string } | { status: 'ok'; pedidos: Pedido[] };

function Painel({ carga, selecionadoId }: { carga: Carga; selecionadoId: string | null }) {
  if (carga.status !== 'ok') return <p>{carga.status === 'erro' ? carga.mensagem : 'Carregando...'}</p>;
  // derivado: não é estado
  const emAberto = carga.pedidos.filter((p) => p.status === 'aberto');
  const totalAberto = emAberto.reduce((soma, p) => soma + p.total, 0);
  // o id é o estado; o objeto é procurado na lista atual
  const selecionado = carga.pedidos.find((p) => p.id === selecionadoId) ?? null;
  return (
    <section>
      <h2>Em aberto: {emAberto.length} (R$ {totalAberto})</h2>
      {selecionado && <p>Pedido {selecionado.id}: {selecionado.status}</p>}
    </section>
  );
}`, notes: [{ l: '2', t: 'União discriminada: cada status carrega só os dados que fazem sentido; não existe "carregando com erro".' }, { l: '9', t: 'emAberto e totalAberto são calculados a cada render; nenhuma sincronização é necessária.' }, { l: '12', t: 'O estado guarda o id; o objeto é sempre o da lista mais recente.' }] },
    { title: 'O mesmo cálculo, com o erro típico de duplicação', lang: 'tsx', code: R`// RUIM: duas verdades que precisam ser mantidas em sincronia
const [itens, setItens] = useState<Item[]>([]);
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(itens.reduce((s, i) => s + i.preco, 0));
}, [itens]); // render extra, e um instante com total velho

// BOM: derivado durante o render
const [itens2, setItens2] = useState<Item[]>([]);
const total2 = itens2.reduce((s, i) => s + i.preco, 0);`, notes: [{ l: '4', t: 'O efeito só copia um valor derivável: gera uma renderização extra e um quadro com o total desatualizado.' }, { l: '10', t: 'Sem efeito, sem estado extra e sem possibilidade de divergir.' }] }
  ],
  bestPractices: ['Classifique cada dado (local, compartilhado, servidor, URL, formulário, derivado) antes de escolher uma ferramenta.', 'Dê a cada fato uma única fonte da verdade e derive o resto.', 'Guarde ids, não objetos, para seleções e referências.', 'Use um status único (união discriminada) em vez de vários booleanos.', 'Comece local e só suba a escada (elevação, Context, store) quando o degrau de baixo doer.', 'Coloque filtros, página e ordenação na URL quando o link precisar ser compartilhável.'],
  mistakes: ['Copiar dados do servidor para um estado global e esquecer de atualizá-los.', 'Guardar valores calculáveis (totais, listas filtradas) em estado.', 'Usar efeitos para sincronizar um estado com outro.', 'Criar booleanos que permitem estados impossíveis.', 'Colocar tudo em uma store global "por precaução".', 'Guardar o objeto selecionado em vez do id.'],
  market: R`Entrevistas e revisões de código em React giram em torno de uma pergunta: "onde esse estado deveria viver?". Equipes que classificam o estado cedo evitam migrações dolorosas (por exemplo, descobrir tarde que a lista de pedidos virou um segundo banco de dados no navegador). A divisão entre **estado de cliente** e **estado de servidor** virou uma prática de mercado: ela explica por que bibliotecas de cache de servidor reduziram muito a necessidade de stores globais em aplicações comuns.`,
  summary: R`Estado tem tipos: local, compartilhado de cliente, de servidor, de URL, de formulário e derivado. Cada fato precisa de **uma fonte da verdade**; o que pode ser calculado **não é guardado**. Prefira ids a objetos, status únicos a booleanos soltos e estruturas pequenas e planas. A escada é: local, elevação, composição ou Context, cache de servidor para dados remotos e store para estado de cliente grande. Suba só quando precisar.`,
  refs: [REF.choosing, REF.sharing, REF.scaling],
  cards: [
    { q: 'Quais são os seis tipos de estado da aula?', a: 'Local de UI, compartilhado de cliente, de servidor, de URL, de formulário e derivado.' },
    { q: 'O que é fonte da verdade?', a: 'O único lugar onde um fato é guardado; os outros apenas o leem ou o derivam.' },
    { q: 'Quando não guardar um valor em estado?', a: 'Quando ele pode ser calculado a partir de props ou de outro estado: derive durante o render.' },
    { q: 'Por que guardar o id selecionado e não o objeto?', a: 'Porque o objeto pode ficar velho quando a lista é atualizada; com o id, o item é sempre o atual.' },
    { q: 'Por que estado de servidor é diferente?', a: 'Ele é uma cópia que pode ficar desatualizada, é assíncrona e tem carregamento e erro; precisa de cache e invalidação.' }
  ]
},
{
  id: 'est-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['useReducer', 'Context', 're-renderização', 'reducer', 'ações'],
  title: 'useReducer e Context: um estado compartilhado simples e seus limites',
  objectives: ['Escrever um reducer puro e despachar ações com §useReducer§', 'Compartilhar estado com Context separando contexto de estado e de dispatch', 'Prever quais componentes renderizam quando o valor do contexto muda (e por que o objeto novo importa)', 'Memoizar o valor do contexto e dividir contextos para reduzir renderizações', 'Reconhecer quando Context + useReducer deixa de ser suficiente'],
  intro: R`Antes de instalar uma biblioteca, vale saber o que o próprio React oferece: §useReducer§ para organizar atualizações e **Context** para entregar o estado a qualquer profundidade. Para telas pequenas e médias isso basta. Esta aula mostra como usar a dupla bem e, com **medições reais** (React 19.3), onde ela começa a doer: **todo consumidor do contexto renderiza quando qualquer parte do valor muda**.`,
  theory: R`### O reducer: estado novo a partir de estado antigo e ação
Um **reducer** é uma função **pura** §(estado, ação) => novoEstado§. Ele não muda o estado antigo (devolve um novo), não faz chamadas de rede e não usa data ou aleatório. A **ação** é um objeto que descreve **o que aconteceu** (§{ type: "item_adicionado", item }§), não "o que fazer". Vantagens do padrão:
- **todas as regras de atualização** ficam em um lugar, fáceis de testar sem React (é uma função pura);
- o histórico de ações explica **como** o estado chegou ali;
- ele evita que várias partes do componente atualizem o estado de maneiras diferentes.

### useReducer
§const [estado, despachar] = useReducer(reducer, estadoInicial)§. Chamar §despachar(acao)§ agenda uma renderização com o estado calculado pelo reducer. Dica de tipagem: modele as ações como **união discriminada** (§type§ literal) para o TypeScript exigir o payload correto em cada caso e avisar sobre casos esquecidos (§never§ no §default§).
No **Strict Mode** o React chama o reducer duas vezes para detectar impureza: se o resultado diferir, há um bug (mutação ou aleatoriedade dentro do reducer).

### Context: entregar sem passar por props
O Context permite que qualquer descendente do §Provider§ leia um valor com §useContext§, sem passar por props. O valor vem do **Provider mais próximo acima**. Padrão recomendado (guia "Scaling Up with Reducer and Context"):
1. um contexto para o **estado** e **outro para o dispatch** (o §dispatch§ tem identidade estável, então quem só despacha não precisa renderizar quando o estado muda);
2. um componente §Provider§ que usa §useReducer§ e renderiza os dois Providers;
3. **hooks** de acesso (§useCarrinho()§, §useCarrinhoDispatch()§) que lançam erro se usados fora do Provider.

### O custo: quem renderiza quando o contexto muda
Regra: **todo componente que chama §useContext(X)§ renderiza quando o valor de X muda** (comparado com §Object.is§), mesmo que use apenas uma parte do valor e mesmo que esteja dentro de §memo§. Medições deste curso (React 19.3.1, jsdom):
- Um contexto com o estado §{ a, b }§ e dois consumidores (um lê §a§, outro lê §b§), ambos em §memo§. Ao despachar uma ação que muda **só §a§**, **os dois** renderizaram (contagem de 1 para 2 nos dois).
- Um Provider cujo §value={{ n: 1 }}§ cria um **objeto novo a cada render**: quando o Provider renderizou de novo por outro motivo, o consumidor renderizou **1 vez a mais**. Com o valor memoizado (§useMemo§), foram **0** renderizações extras.
Conclusões: (1) **memoize o valor** do Provider (ou garanta que ele só muda quando deve); (2) **divida** contextos por assunto e por frequência de mudança (tema muda raramente; contador de cliques muda muito); (3) separe estado e dispatch.

### Onde Context + useReducer funciona bem
- estado de baixa frequência de mudança (tema, idioma, usuário autenticado, configurações);
- árvores pequenas ou médias;
- lógica de atualização de uma **área** da tela (um assistente de várias etapas, um editor).

### Onde começa a doer
- **Muitos consumidores** e **muita frequência** de mudança: todos renderizam a cada atualização, mesmo sem usar o dado que mudou.
- **Sem seletores**: o Context não oferece "só me avise se a fatia X mudar". Contornar exige dividir em muitos contextos.
- **Sem ferramentas**: não há DevTools com histórico de ações, middlewares nem persistência prontas.
- **Dados assíncronos**: o reducer é puro e não faz buscas; o ciclo de carregar, tratar erro e invalidar precisa ser montado à mão.
Quando esses sinais aparecem, a escada sobe: **store com seletores** (Redux Toolkit, Zustand) para estado de cliente e **cache de servidor** (TanStack Query) para dados remotos.

### Reducer não é exclusivo do Redux
O Redux é o mesmo padrão (ação, reducer puro, estado imutável) com uma store **fora do React**, seletores e ferramentas. Aprender bem o reducer aqui facilita todo o resto do curso: o Redux Toolkit, o Zustand e até o estado otimista do TanStack Query usam a mesma ideia de **transição de estado previsível**.

### Testar sem React
Como o reducer é uma função pura, o teste é uma chamada: §expect(reducer(estado, acao)).toEqual(esperado)§. Teste as transições importantes, as ações desconhecidas (devolver o mesmo estado) e a imutabilidade (o estado de entrada não muda).`,
  concepts: [
    { term: 'Reducer', def: 'Função pura (estado, ação) => novo estado, que concentra as regras de atualização.' },
    { term: 'Ação', def: 'Objeto que descreve o que aconteceu, normalmente com um campo type e um payload.' },
    { term: 'Dispatch', def: 'Função que envia uma ação ao reducer; no useReducer, tem identidade estável.' },
    { term: 'Provider', def: 'Componente que fornece o valor de um contexto aos descendentes.' },
    { term: 'Consumidor de contexto', def: 'Componente que chama useContext; renderiza sempre que o valor do contexto muda.' },
    { term: 'União discriminada', def: 'Tipo TypeScript formado por variantes com um campo literal em comum (type), usado para modelar ações.' },
    { term: 'Valor memoizado do contexto', def: 'Valor do Provider criado com useMemo para manter a mesma identidade entre renderizações.' },
    { term: 'Divisão de contextos', def: 'Separar estado e dispatch, ou assuntos diferentes, em contextos distintos para reduzir renderizações.' }
  ],
  examples: R`**Analogia:** o reducer é o **balcão de atendimento** de uma lanchonete: o cliente (componente) entrega um **pedido** (ação) e o balcão devolve a **bandeja** (novo estado) seguindo sempre as mesmas regras. O Context é o **alto-falante** do salão: quando o balcão anuncia que algo mudou, **todos** que estão ouvindo (consumidores) levantam a cabeça, mesmo que só um assunto lhes interesse. Dividir contextos é ter alto-falantes por seção.

**Exemplo 1: carrinho simples.** Ações §item_adicionado§, §item_removido§ e §carrinho_limpo§; o total é derivado no render (aula est-01).

**Exemplo 2: o custo medido.** Dois consumidores em §memo§, um lendo §a§ e outro lendo §b§: despachar uma ação que muda só §a§ renderizou os dois. Esse é o limite do Context sem seletores.

**Exemplo 3: valor memoizado.** Envolver §value§ em §useMemo§ eliminou a renderização extra do consumidor quando o Provider renderizou por outro motivo (0 contra 1, medido).`,
  code: [
    { title: 'Reducer tipado e Provider com contexto dividido (TypeScript)', lang: 'tsx', code: R`import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';

type Item = { id: string; nome: string; preco: number };
type Estado = { itens: Item[] };
type Acao = { type: 'item_adicionado'; item: Item } | { type: 'item_removido'; id: string } | { type: 'carrinho_limpo' };

export function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.type) {
    case 'item_adicionado': return { itens: [...estado.itens, acao.item] };
    case 'item_removido': return { itens: estado.itens.filter((i) => i.id !== acao.id) };
    case 'carrinho_limpo': return { itens: [] };
    default: { const _: never = acao; return estado; }
  }
}

const EstadoCtx = createContext<Estado | null>(null);
const DispatchCtx = createContext<Dispatch<Acao> | null>(null);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, { itens: [] });
  const valor = useMemo(() => estado, [estado]);
  return (
    <EstadoCtx.Provider value={valor}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </EstadoCtx.Provider>
  );
}

export function useCarrinho() {
  const v = useContext(EstadoCtx);
  if (!v) throw new Error('useCarrinho fora do CarrinhoProvider');
  return v;
}
export function useCarrinhoDispatch() {
  const v = useContext(DispatchCtx);
  if (!v) throw new Error('useCarrinhoDispatch fora do CarrinhoProvider');
  return v;
}`, notes: [{ l: '5', t: 'Ações como união discriminada: o payload é obrigatório para cada tipo.' }, { l: '12', t: 'O default com never faz o compilador reclamar se uma ação nova não for tratada.' }, { l: '16', t: 'Dois contextos: quem só despacha (botões) não renderiza quando o estado muda.' }, { l: '21', t: 'O estado já é um objeto novo a cada ação; useMemo documenta a intenção de manter a identidade quando nada muda.' }, { l: '29', t: 'Hook de acesso que falha cedo e com mensagem clara se usado fora do Provider.' }] },
    { title: 'Testando o reducer sem React (Vitest)', lang: 'ts', code: R`import { expect, test } from 'vitest';
import { reducer } from './carrinho';

test('adiciona sem mutar o estado anterior', () => {
  const antes = { itens: [] };
  const depois = reducer(antes, { type: 'item_adicionado', item: { id: '1', nome: 'Café', preco: 8 } });
  expect(depois.itens).toHaveLength(1);
  expect(antes.itens).toHaveLength(0);
});`, notes: [{ l: '4', t: 'Um reducer é uma função pura: o teste não precisa de componente nem de DOM.' }] }
  ],
  bestPractices: ['Mantenha o reducer puro: sem rede, relógio, aleatório ou mutação.', 'Nomeie ações pelo que aconteceu (item_adicionado) e não pela ordem (setItens).', 'Separe contexto de estado e de dispatch.', 'Memoize o valor do Provider e divida contextos por frequência de mudança.', 'Crie hooks de acesso que lançam erro fora do Provider.', 'Teste o reducer isoladamente, incluindo ações desconhecidas e imutabilidade.'],
  mistakes: ['Mutar o estado dentro do reducer (§push§ direto).', 'Colocar chamadas de rede ou efeitos dentro do reducer.', 'Criar o objeto do value inline, sem memoização, em um Provider que renderiza com frequência.', 'Concentrar tudo em um único contexto gigante.', 'Esperar que memo em um consumidor evite renderizar quando o contexto muda.', 'Usar Context como substituto de um cache de dados do servidor.'],
  market: R`Context com useReducer é o primeiro recurso que equipes usam, e muitas aplicações nunca precisam de mais. Saber **medir** quando ele deixa de bastar (muitos consumidores, atualizações frequentes) é o que separa uma migração planejada para Zustand ou Redux Toolkit de uma reescrita apressada. Em entrevistas, a pergunta "por que o Context não é uma store" é comum.`,
  summary: R`useReducer organiza as atualizações em uma função pura de ações. O Context entrega o estado a qualquer profundidade, mas **todo consumidor renderiza quando o valor muda**, mesmo usando só parte dele e mesmo dentro de memo (medido). Dividir estado e dispatch, memoizar o valor e separar contextos reduz o custo. Quando há muitos consumidores e mudanças frequentes, ou quando se precisa de seletores e ferramentas, use uma store.`,
  refs: [REF.useReducer, REF.useContext, REF.scaling],
  cards: [
    { q: 'O que é um reducer?', a: 'Uma função pura (estado, ação) => novo estado, que não muta o estado antigo.' },
    { q: 'Quem renderiza quando o valor de um contexto muda?', a: 'Todo componente que chama useContext desse contexto, mesmo que use só parte do valor e mesmo dentro de memo.' },
    { q: 'Por que separar contexto de estado e de dispatch?', a: 'O dispatch tem identidade estável; quem só despacha não precisa renderizar quando o estado muda.' },
    { q: 'Por que memoizar o value do Provider?', a: 'Um objeto novo a cada render do Provider faz todos os consumidores renderizarem de novo (medido: 1 render extra contra 0).' },
    { q: 'Quando o Context + useReducer deixa de bastar?', a: 'Com muitos consumidores e mudanças frequentes, quando faltam seletores, DevTools ou middlewares, ou para dados assíncronos de servidor.' }
  ]
},
{
  id: 'est-03', moduleId: 'm2', order: 3, minutes: 75, tags: ['Redux Toolkit', 'slice', 'Immer', 'seletores', 'createSelector', 'react-redux'],
  title: 'Redux Toolkit I: store, slices, Immer e seletores',
  objectives: ['Criar uma store com §configureStore§ e slices com §createSlice§', 'Escrever reducers "mutáveis" com Immer entendendo que o resultado é imutável', 'Usar §useSelector§ e §useDispatch§ do react-redux e evitar seletores que devolvem objetos novos', 'Criar seletores memoizados com §createSelector§ e prever quando recalculam', 'Estruturar o estado Redux seguindo o guia de estilo (ações como eventos, pouco estado derivado)'],
  intro: R`O **Redux Toolkit** (RTK) é a forma oficialmente recomendada de usar Redux: menos código repetido, **Immer** embutido, DevTools ligadas por padrão e proteções contra erros comuns. Esta aula cobre a base: **store**, **slices**, **seletores**. Todos os comportamentos descritos foram **medidos** com @reduxjs/toolkit 2.15.0 e react-redux 9.3.1.`,
  theory: R`### Ideia central do Redux
Um **único objeto de estado** (a store) guarda o estado compartilhado de cliente. A única forma de mudá-lo é **despachar uma ação**; um **reducer** puro calcula o próximo estado. A interface lê o estado com **seletores**. Esse fluxo de mão única torna as mudanças **rastreáveis** (cada transição é uma ação com nome) e **testáveis**.

### configureStore
§configureStore({ reducer })§ cria a store com boas práticas: liga as **Redux DevTools**, adiciona o middleware **thunk** (para lógica assíncrona) e, em **desenvolvimento**, middlewares que detectam **mutações acidentais** e valores **não serializáveis** nas ações e no estado. Os reducers são combinados por um objeto: §{ reducer: { carrinho: carrinhoReducer, ui: uiReducer } }§, e cada chave vira uma **fatia** do estado (§state.carrinho§).

### createSlice
§createSlice({ name, initialState, reducers })§ gera, de uma vez, o **reducer** e os **criadores de ação**. O §name§ é o prefixo do tipo da ação: no teste, a ação §adicionado§ do slice §carrinho§ teve o tipo §"carrinho/adicionado"§ e, ao ser chamada com um payload, produziu §{ type: "carrinho/adicionado", payload: { id: 1, preco: 5 } }§.

### Immer: "mutar" sem mutar
Dentro de um reducer do §createSlice§, você pode escrever §state.itens.push(x)§ e §state.total += x.preco§. O RTK usa o **Immer**: o §state§ recebido é um **rascunho** (*draft*); ao final, o Immer produz um **novo objeto imutável**, copiando só o que mudou. Medido: o estado novo foi um objeto diferente (§e1 !== e0§), o array do estado antigo ficou **intacto** (0 itens) e o estado resultante ficou **congelado** (§Object.isFrozen§ verdadeiro em desenvolvimento), de modo que uma mutação fora do reducer lança §TypeError§.
Regras do Immer:
1. **ou** você muta o rascunho, **ou** devolve um novo valor (§return {...}§), **nunca os dois**;
2. só funciona dentro dos reducers do RTK (ou de §produce§); fora deles, continue imutável;
3. não ponha **efeitos colaterais** nem valores não determinísticos no reducer (Date, Math.random): use o *prepare callback* ou a camada que despacha.

### Ações como eventos
O guia de estilo do Redux recomenda modelar ações como **eventos** que aconteceram (§pedido/enviado§), e não como setters (§setPedido§). Assim, **vários reducers** podem reagir ao mesmo evento e a lógica de "o que muda" fica nos reducers, não espalhada nos componentes. Também recomenda: manter o estado **mínimo**, **não** armazenar o que se pode derivar, e **colocar o máximo de lógica nos reducers**.

### react-redux: Provider, useSelector, useDispatch
- §<Provider store={store}>§ na raiz;
- §const x = useSelector((state) => state.carrinho.total)§ lê um valor e **inscreve** o componente: ele renderiza de novo **somente quando o valor selecionado muda** (comparado com §===§);
- §const dispatch = useDispatch()§ envia ações. Em TypeScript, defina hooks tipados (§useAppSelector§, §useAppDispatch§).

### O erro mais comum com seletores
Um seletor que **devolve um objeto ou array novo a cada chamada** (por exemplo, §state.x.lista.filter(...)§) quebra a comparação por §===§: o valor "mudou" a cada chamada. No teste, o react-redux em desenvolvimento avisou "Selector ... returned a different result when called with the same parameter" e, ao despachar uma ação em **outra parte** do estado, o componente com esse seletor **renderizou +1 vez**, enquanto o componente com seletor memoizado renderizou **+0**.

### createSelector (Reselect): derivar com memoização
§createSelector([entrada1, entrada2], (a, b) => resultado)§ recalcula **somente quando as entradas mudam** (por referência). Medido: ao despachar uma ação que alterou **outra** parte do estado, o seletor **não recalculou** (0 recálculos); ao mudar o **filtro**, recalculou **1 vez**. Como o resultado mantém a **mesma referência** enquanto as entradas não mudam, o §useSelector§ não dispara re-renderização. Boas práticas: seletores **pequenos e nomeados** (§selecionarPedidosAbertos§), entradas **baratas** (acesso a campos) e o cálculo caro na função de resultado; se um seletor depende de um parâmetro (um id), use uma fábrica de seletores ou os seletores de §createEntityAdapter§ (aula est-08).

### Estrutura de pastas por funcionalidade
Convenção do RTK: uma pasta por **feature** com o slice, os seletores e os componentes. O arquivo da store importa os reducers das features. Tipos úteis: §RootState = ReturnType<typeof store.getState>§ e §AppDispatch = typeof store.dispatch§.

### Quando Redux Toolkit vale a pena
Muitos estados de cliente compartilhados, regras de negócio complexas no cliente, necessidade de **depurar com histórico** (DevTools com viagem no tempo), equipe grande que se beneficia de uma estrutura padronizada. Para estado de servidor, prefira o cache de servidor (aula est-04 e est-06); para estado simples e pequeno, o Zustand (aula est-05) costuma ter menos cerimônia.`,
  concepts: [
    { term: 'Store', def: 'Objeto que guarda o estado Redux, recebe ações e notifica os assinantes.' },
    { term: 'Slice', def: 'Fatia do estado com seu reducer e seus criadores de ação, criada com createSlice.' },
    { term: 'Immer', def: 'Biblioteca que permite escrever atualizações como mutações em um rascunho e produz um novo estado imutável.' },
    { term: 'Draft (rascunho)', def: 'Cópia mutável temporária do estado usada pelo Immer dentro dos reducers.' },
    { term: 'Seletor', def: 'Função que lê ou deriva um valor do estado da store.' },
    { term: 'createSelector', def: 'Cria um seletor memoizado que só recalcula quando suas entradas mudam por referência.' },
    { term: 'useSelector', def: 'Hook do react-redux que lê um valor da store e re-renderiza quando o valor selecionado muda.' },
    { term: 'Ação como evento', def: 'Ação que descreve o que aconteceu (pedido/enviado) e não o que atribuir (setPedido).' },
    { term: 'RootState', def: 'Tipo TypeScript do estado completo da store, inferido do getState.' },
    { term: 'Redux DevTools', def: 'Extensão que mostra ações, estados e permite navegar no histórico.' }
  ],
  examples: R`**Analogia:** a store é o **livro-razão** de uma empresa: ninguém apaga linhas, só **lança** novos registros (ações), e o contador (reducer) aplica regras fixas para chegar ao novo saldo. O Immer é a **caneta mágica** que deixa você escrever como se estivesse editando a página, mas por trás arquiva uma página nova e deixa a antiga intacta. O seletor é o **relatório** que o gerente pede: se os lançamentos relevantes não mudaram, o relatório anterior ainda vale (memoização).

**Exemplo 1: slice de carrinho.** Ação §adicionado§ empurra o item e soma ao total (no reducer, mutando o rascunho); o estado antigo continua intacto.

**Exemplo 2: seletor arriscado.** §useSelector(s => s.x.lista.filter(...))§ gera um array novo a cada chamada: re-renderiza a cada ação e dispara o aviso do modo de desenvolvimento.

**Exemplo 3: seletor memoizado.** Com §createSelector§, uma ação em outra fatia não recalcula nem re-renderiza (0 e 0, medido).`,
  code: [
    { title: 'Store, slice e hooks tipados (TypeScript)', lang: 'ts', code: R`import { configureStore, createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

type Item = { id: number; nome: string; preco: number };
type CarrinhoState = { itens: Item[]; cupom: string | null };

const carrinhoSlice = createSlice({
  name: 'carrinho',
  initialState: { itens: [], cupom: null } as CarrinhoState,
  reducers: {
    adicionado(state, action: PayloadAction<Item>) {
      state.itens.push(action.payload);
    },
    removido(state, action: PayloadAction<number>) {
      state.itens = state.itens.filter((i) => i.id !== action.payload);
    },
    cupomAplicado(state, action: PayloadAction<string>) {
      state.cupom = action.payload;
    },
    limpo: () => ({ itens: [], cupom: null })
  }
});

export const { adicionado, removido, cupomAplicado, limpo } = carrinhoSlice.actions;

export const store = configureStore({ reducer: { carrinho: carrinhoSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// seletores: entradas baratas, cálculo memoizado
const selecionarItens = (s: RootState) => s.carrinho.itens;
const selecionarCupom = (s: RootState) => s.carrinho.cupom;
export const selecionarTotal = createSelector([selecionarItens, selecionarCupom], (itens, cupom) => {
  const bruto = itens.reduce((soma, i) => soma + i.preco, 0);
  return cupom === 'DEZ' ? bruto * 0.9 : bruto;
});`, notes: [{ l: '8', t: 'O nome do slice vira o prefixo do tipo da ação: carrinho/adicionado.' }, { l: '12', t: 'Aqui o reducer "muta" o rascunho do Immer; o resultado é um novo estado imutável.' }, { l: '15', t: 'Reatribuir uma propriedade do rascunho também é válido; nunca misture com um return de novo valor.' }, { l: '21', t: 'Um reducer pode devolver um novo estado em vez de mutar (aqui, para limpar tudo).' }, { l: '31', t: 'Hooks tipados: o RootState e o AppDispatch evitam anotar tipos em cada componente.' }, { l: '37', t: 'createSelector recalcula só quando itens ou cupom mudam por referência.' }] },
    { title: 'Usando a store em componentes (TypeScript + JSX)', lang: 'tsx', code: R`import { Provider } from 'react-redux';
import { store, adicionado, selecionarTotal, useAppDispatch, useAppSelector } from './store';

function Total() {
  const total = useAppSelector(selecionarTotal);
  return <output>Total: R$ {total.toFixed(2)}</output>;
}

function Botao() {
  const dispatch = useAppDispatch();
  return <button onClick={() => dispatch(adicionado({ id: Date.now(), nome: 'Café', preco: 8 }))}>Adicionar café</button>;
}

export function App() {
  return (
    <Provider store={store}>
      <Botao />
      <Total />
    </Provider>
  );
}`, notes: [{ l: '5', t: 'O componente só renderiza de novo se o total mudar (seletor memoizado, resultado numérico).' }, { l: '11', t: 'Date.now() fica no componente (no evento), nunca dentro do reducer, para manter o reducer puro.' }] }
  ],
  bestPractices: ['Use configureStore e createSlice; evite montar a store à mão.', 'Nomeie ações como eventos e concentre a lógica nos reducers.', 'Mantenha o estado mínimo e derive o resto com seletores.', 'Selecione o menor valor possível em useSelector e use createSelector para derivações.', 'Defina hooks tipados (useAppSelector e useAppDispatch).', 'Mantenha reducers puros: datas, ids aleatórios e rede ficam fora (prepare callback ou camada de despacho).'],
  mistakes: ['Misturar mutação do rascunho com return de um novo valor no mesmo reducer.', 'Usar seletores que devolvem objetos ou arrays novos a cada chamada.', 'Guardar valores não serializáveis (classes, funções, Date) no estado.', 'Colocar chamadas de rede ou efeitos dentro de reducers.', 'Modelar ações como setters (setX) em vez de eventos.', 'Colocar todo o estado do aplicativo na store, inclusive dados do servidor e estado local de componentes.'],
  market: R`O Redux Toolkit segue muito presente em bases de código de médio e grande porte e em vagas de React. Saber explicar Immer, seletores memoizados e por que o estado de servidor não pertence à store distingue quem só copiou tutoriais de quem entende o fluxo. O mesmo modelo mental (ações, reducers, seletores) reaparece em outras ferramentas.`,
  summary: R`O RTK configura a store com DevTools, thunk e verificações de desenvolvimento. §createSlice§ gera reducer e criadores de ação; o Immer permite escrever "mutações" que produzem estado imutável (medido: estado novo, antigo intacto, congelado). §useSelector§ re-renderiza só quando o valor selecionado muda por §===§; seletores que devolvem objetos novos causam renderizações extras e aviso. §createSelector§ memoiza (0 recálculos em ações de outra fatia, 1 ao mudar a entrada). Siga o estilo: ações como eventos e estado mínimo.`,
  refs: [REF.rtkQuick, REF.createSlice, REF.configureStore, REF.reduxStyle, REF.reselect, REF.reactReduxHooks, REF.immer],
  cards: [
    { q: 'O que o createSlice gera?', a: 'O reducer e os criadores de ação; o nome do slice é o prefixo do tipo da ação (carrinho/adicionado).' },
    { q: 'Como o Immer funciona nos reducers?', a: 'O state é um rascunho mutável; no fim o Immer produz um novo estado imutável, deixando o antigo intacto.' },
    { q: 'Por que um seletor com filter dentro do useSelector é problema?', a: 'Devolve um array novo a cada chamada; o === sempre vê mudança e o componente renderiza a mais.' },
    { q: 'O que o createSelector garante?', a: 'Recalcula só quando as entradas mudam por referência e devolve a mesma referência quando não mudam.' },
    { q: 'Como o guia de estilo recomenda nomear ações?', a: 'Como eventos que aconteceram (pedido/enviado), com a lógica nos reducers e estado mínimo.' }
  ]
}
];
