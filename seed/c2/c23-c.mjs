// C2.3 — React avançado. Aulas 5 e 6 (Suspense, lazy, use e fronteiras de erro; renderização concorrente).
const R = String.raw;

export const REF3 = {
  suspense: { title: 'React — Suspense (referência)', url: 'https://react.dev/reference/react/Suspense', kind: 'doc' },
  lazy: { title: 'React — lazy (referência)', url: 'https://react.dev/reference/react/lazy', kind: 'doc' },
  use: { title: 'React — use (referência)', url: 'https://react.dev/reference/react/use', kind: 'doc' },
  errorBoundary: { title: 'React — Component (Error Boundaries)', url: 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary', kind: 'doc' },
  useTransition: { title: 'React — useTransition (referência)', url: 'https://react.dev/reference/react/useTransition', kind: 'doc' },
  startTransition: { title: 'React — startTransition (referência)', url: 'https://react.dev/reference/react/startTransition', kind: 'doc' },
  useDeferredValue: { title: 'React — useDeferredValue (referência)', url: 'https://react.dev/reference/react/useDeferredValue', kind: 'doc' },
  act: { title: 'React — act (referência para testes)', url: 'https://react.dev/reference/react/act', kind: 'doc' },
  rsc: { title: 'React — Server Components', url: 'https://react.dev/reference/rsc/server-components', kind: 'doc' },
  releaseBlog: { title: 'React — Blog: React 18 (renderização concorrente)', url: 'https://react.dev/blog/2022/03/29/react-v18', kind: 'article' },
  webdevCodeSplit: { title: 'web.dev — Code splitting', url: 'https://web.dev/articles/code-splitting-suspense', kind: 'doc' },
  mdnDynamicImport: { title: 'MDN — import() dinâmico', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'rav-05', moduleId: 'm3', order: 5, minutes: 70, tags: ['Suspense', 'lazy', 'use', 'error boundary', 'code splitting'],
  title: 'Suspense, lazy, use e fronteiras de erro: carregamento declarativo',
  objectives: ['Explicar o que Suspense faz (mostrar um fallback enquanto algo "suspende") e o que ativa uma fronteira', 'Dividir código com §lazy§ e §import()§ e posicionar fronteiras de forma útil', 'Usar §use(promise)§ com promises estáveis (em cache) e entender a diferença entre cascata e carregamento em paralelo', 'Tratar falhas com fronteiras de erro (§getDerivedStateFromError§) e combinar Suspense e erro', 'Testar componentes que suspendem com §act§ assíncrono e relacionar o padrão com Server Components e streaming'],
  intro: `Tradicionalmente, cada componente que busca dados controla seus próprios estados de "carregando" e "erro", espalhando §if (carregando) ...§ pela interface. O **Suspense** inverte isso: o componente **declara que depende de algo** (código, dados) e o React exibe um **fallback** definido por um **ancestral** enquanto a dependência não chega. Combinado com **fronteiras de erro**, forma um modelo **declarativo** de carregamento e falha. Esta aula mostra §lazy§ (código), §use§ (promises) e fronteiras de erro com **testes executados** (React 19.3), incluindo a diferença entre **cascata** e **paralelo**.`,
  theory: `### O que é Suspense
§<Suspense fallback={<Carregando />}>...</Suspense>§ define uma **fronteira**: se algum componente **dentro** dela **suspende** (ainda não tem o que precisa para renderizar), o React **mostra o fallback** no lugar de **toda** a subárvore até que a dependência esteja pronta, e então renderiza o conteúdo. Fontes que **ativam** uma fronteira: **§lazy§** (código ainda não carregado), **§use(promise)§** (promise pendente), e dados lidos por **bibliotecas e frameworks compatíveis** (TanStack Query com suspense, Relay, Next.js). **Efeitos** e §fetch§ em §useEffect§ **não** ativam o Suspense.
Dois momentos: no **carregamento inicial**, o fallback aparece; em **atualizações** (por exemplo, trocar o dado de uma tela já visível), o React por padrão **mostra o fallback de novo** a menos que a atualização seja uma **transição** (aula 6), que **mantém o conteúdo anterior** enquanto o novo carrega.

### lazy: dividir o código
§§§tsx
const Grafico = lazy(() => import('./Grafico'));      // o módulo só é baixado quando for renderizado
<Suspense fallback={<p>carregando…</p>}><Grafico /></Suspense>
§§§
§lazy§ recebe uma função que devolve uma **promise de um módulo com export default**. O código vira um **pedaço (chunk)** separado pelo empacotador (via **§import()§ dinâmico**). O React chama a função **uma vez** e **guarda** o resultado; se a promise **rejeitar**, o erro vai à **fronteira de erro** mais próxima. No teste: imediatamente após a renderização o texto era §carregando…§ e, depois da promise resolver, §carregado§. **Onde dividir:** por **rota** (o melhor ponto de partida), por **componentes pesados e raros** (editor de texto, gráficos, mapas, diálogos), e por **funcionalidades condicionais**. Evite dividir componentes minúsculos (o custo de uma requisição extra supera o ganho). Declare **§lazy§ no escopo do módulo**, não dentro de um componente (senão cria um tipo novo a cada render, aula 2).

### use: ler promises durante o render
No React 19, **§use(promise)§** lê o valor de uma promise **dentro do render**: se estiver pendente, o componente **suspende**; se resolver, devolve o valor; se **rejeitar**, o erro vai à fronteira de erro. **Regra essencial**: a promise precisa ser **estável (em cache)**: **a mesma instância** em todas as renderizações. Criar uma promise nova no corpo do componente (§use(fetch(...))§) gera loop infinito de suspensões; a documentação alerta ("uma promise não cacheada"). Fontes seguras: promises criadas **fora do render** (em um cache, em um loader de rota, em um Server Component e passadas por props), ou bibliotecas que **mantêm o cache** por você. §use§ também lê **contexto** (§use(Contexto)§) e, diferentemente dos hooks, pode ser chamado **dentro de condicionais e laços**.

### Cascata (waterfall) × paralelo
Se o pai usa §use(promiseA)§ e **só então** renderiza o filho, que usa §use(promiseB)§, a busca B **só começa depois** que A termina: uma **cascata**. Medimos o **momento em que cada busca começa** (arredondado a 50 ms):
- **cascata** (a busca do filho só é disparada quando o filho renderiza): §{"pai1":0,"filho1":100}§ — o filho começou **depois** do pai terminar;
- **em paralelo** (as duas buscas são iniciadas **antes** de renderizar): §{"pai2":0,"filho2":0}§.
Em produção, cascatas em série são uma causa comum de telas lentas. Soluções: **iniciar as buscas o mais cedo possível** (no roteador, em um evento, no servidor), **buscar em paralelo** (§Promise.all§ ou várias promises) e **pré-carregar** (prefetch) ao passar o mouse sobre um link. Frameworks (Next.js, Remix/React Router) resolvem com **loaders** e **streaming**.
**Granularidade das fronteiras:** uma fronteira externa mostra **um** fallback até tudo estar pronto ("revelar junto"); fronteiras **aninhadas** revelam **partes** conforme chegam (cada parte com seu esqueleto). Escolha pelo **layout**: o que faz sentido aparecer de uma vez, e o que pode aparecer depois. Evite fallbacks "piscando" (muito pequenos) e fronteiras em tudo.

### Fallbacks bons
- **esqueletos** (skeletons) com o mesmo tamanho do conteúdo, para evitar saltos de layout;
- **acessíveis**: §aria-busy§, mensagem para leitores de tela (§role="status"§), sem trap de foco;
- **sem texto de "carregando" para tudo**: use o fallback onde faz sentido.
O React também **limita** a frequência com que revela conteúdo suspenso, evitando mudanças bruscas: em um teste nosso, dados que levavam 100 ms só apareceram cerca de 300 ms depois do início (não houve medição de causa, apenas a observação); **não dependa de tempos exatos** de revelação em testes.

### Fronteiras de erro
Quando uma renderização **lança** (inclusive por promise rejeitada em §use§ ou §lazy§), o erro **sobe** até a **fronteira de erro** mais próxima. Hoje elas são **componentes de classe** com §static getDerivedStateFromError§ (e §componentDidCatch§ para registrar):
§§§tsx
class Fronteira extends Component<{ children: ReactNode }, { erro: string | null }> {
  state = { erro: null as string | null };
  static getDerivedStateFromError(e: Error) { return { erro: e.message }; }
  render() { return this.state.erro ? <p role="alert">falhou: {this.state.erro}</p> : this.props.children; }
}
§§§
No teste, uma promise **rejeitada** lida com §use§ dentro de §<Fronteira><Suspense>§ resultou em §falhou: rede caiu§ (§role="alert"§). Na prática, use a biblioteca **react-error-boundary** (§<ErrorBoundary fallbackRender>§, botão de "tentar de novo" com §resetErrorBoundary§) e frameworks que oferecem arquivos de erro por rota. **Fronteiras de erro não capturam** erros em **manipuladores de evento**, **código assíncrono** fora do render, **renderização no servidor** e erros na própria fronteira: trate-os com §try/catch§ e estado.
**Padrão:** erro **fora** do Suspense (§<ErrorBoundary><Suspense>...</Suspense></ErrorBoundary>§): o erro de qualquer filho que suspende e falha chega ao fallback de erro; adicione fronteiras de erro **por região** (um widget quebrado não derruba a página).

### Testando componentes que suspendem
No Testing Library, renderize dentro de **§await act(async () => { render(...) })§**; sem isso o React avisa ("um componente suspendeu dentro de um §act§ não aguardado"). Use §findBy*§ para aguardar o conteúdo. Mocke o módulo dinâmico (§vi.mock§) ou use promises controladas; para erros, silencie o §console.error§ esperado.

### Relação com Server Components e streaming
Em frameworks com **Server Components** (Next.js, aula do C2.5), um componente de servidor pode ser **assíncrono** e §await§ seus dados; o **Suspense** delimita o que pode ser **enviado depois** ("streaming"): o servidor manda primeiro a casca com o fallback e depois, na mesma resposta, os pedaços prontos. O modelo mental é o mesmo desta aula: **quem depende de algo declara; o ancestral decide o fallback**.

### Armadilhas
- criar a promise no render (loop de suspensões);
- fronteira Suspense **muito alta** (a página inteira vira esqueleto) ou **muito baixa** (esqueletos por toda parte);
- **cascatas** por componentes aninhados que buscam dados em sequência;
- ignorar **erros**: Suspense **não** trata falhas;
- esquecer o fallback acessível e o layout estável;
- depender do Suspense para buscar dados em efeitos (não funciona).`,
  concepts: [
    { term: 'Suspense', def: 'Componente que exibe um fallback enquanto componentes dentro dele suspendem por dependerem de código ou dados ainda não prontos.' },
    { term: 'Fronteira de Suspense', def: 'Ponto da árvore, delimitado por <Suspense>, que decide qual fallback mostrar e que parte revelar de uma vez.' },
    { term: 'lazy', def: 'Função que carrega um componente sob demanda por um import() dinâmico, criando um chunk separado.' },
    { term: 'use', def: 'API do React 19 que lê uma promise (ou contexto) durante o render, suspendendo se a promise estiver pendente.' },
    { term: 'Promise estável', def: 'Promise criada fora do render e reutilizada (em cache), para que use(promise) não suspenda sem fim.' },
    { term: 'Cascata (waterfall)', def: 'Sequência de carregamentos em que cada um só começa depois que o anterior termina.' },
    { term: 'Fronteira de erro', def: 'Componente de classe com getDerivedStateFromError que captura erros de renderização de seus descendentes e mostra um fallback.' },
    { term: 'Code splitting', def: 'Divisão do código da aplicação em pedaços carregados sob demanda.' },
    { term: 'Streaming', def: 'Envio progressivo de partes da página pelo servidor, com Suspense definindo o que pode chegar depois.' }
  ],
  examples: R`**Analogia:** o Suspense é o **cartaz "volto em 5 minutos" que o gerente pendura na porta de uma seção da loja** enquanto o estoque chega; a seção inteira vira o cartaz e, quando o estoque chega, é reaberta. A fronteira de erro é o **cartaz "seção fechada para reparos"** quando a entrega falha. A cascata é pedir a segunda caixa só depois de abrir a primeira; o paralelo é **pedir as duas ao mesmo tempo**.

**Resultados medidos (React 19.3, Testing Library):**
§§§
lazy:  imediato = "carregando…"   depois = "carregado"
início das buscas (cascata):   {"pai1":0,"filho1":100}      (o filho só começa depois do pai)
início das buscas (paralelo):  {"pai2":0,"filho2":0}
promise rejeitada lida com use dentro de <Fronteira><Suspense>:  "falhou: rede caiu"
§§§

**Caso real:** uma página de painel tinha cinco widgets que buscavam dados em efeitos (cinco spinners, com layout saltando). Migrada para um loader que inicia as cinco buscas em paralelo e para fronteiras de Suspense por widget com esqueletos do tamanho certo, o tempo até o conteúdo útil caiu, o layout parou de saltar e o widget que falhava passou a mostrar um erro local sem derrubar os demais.`,
  code: [
    { title: 'lazy, Suspense e fronteira de erro (executado com React 19.3 e Testing Library)', lang: 'tsx', code: R`import { Component, Suspense, lazy, use, type ReactNode } from 'react';

const Grafico = lazy(() => import('./Grafico'));            // chunk separado, carregado sob demanda

class Fronteira extends Component<{ children: ReactNode }, { erro: string | null }> {
  state = { erro: null as string | null };
  static getDerivedStateFromError(e: Error) { return { erro: e.message }; }
  render() { return this.state.erro ? <p role="alert">falhou: {this.state.erro}</p> : this.props.children; }
}

export function Painel() {
  return (
    <Fronteira>
      <Suspense fallback={<p>carregando…</p>}>
        <Grafico />
      </Suspense>
    </Fronteira>
  );
}
// teste: await act(async () => { render(<Painel />); });  ->  "carregando…" e depois o gráfico`, notes: [{ l: '3', t: 'lazy no escopo do módulo: um único tipo, carregado uma vez.' }, { l: '6', t: 'getDerivedStateFromError transforma o erro em estado exibido.' }, { l: '13', t: 'A fronteira de erro fica por fora do Suspense; um erro do import() ou de uma promise chega a ela.' }, { l: '19', t: 'Em testes, render dentro de act assíncrono para evitar o aviso de suspensão.' }] },
    { title: 'use(promise): cascata x paralelo, medindo quando cada busca começa (executado)', lang: 'tsx', code: R`const cache = new Map<string, Promise<string>>();
const inicios: Record<string, number> = {};
let t0 = 0;
const buscar = (k: string, ms: number) => {
  if (!cache.has(k)) {
    inicios[k] = Math.round((performance.now() - t0) / 50) * 50;      // quando a busca realmente começou
    cache.set(k, new Promise<string>((r) => setTimeout(() => r('dado ' + k), ms)));
  }
  return cache.get(k)!;                                                // sempre a MESMA promise
};

function Item({ k, ms, filho }: { k: string; ms: number; filho?: ReactNode }) {
  const v = use(buscar(k, ms));
  return <div><span>{v}</span>{filho}</div>;
}

// Cascata: o filho só chama buscar() quando o pai termina e renderiza o filho
//   <Suspense fallback="…"><Item k="pai1" ms={100} filho={<Suspense fallback="…"><Item k="filho1" ms={100} /></Suspense>} /></Suspense>
//   inicios = { pai1: 0, filho1: 100 }
// Paralelo: inicie as duas buscas antes de renderizar (loader, evento, servidor)
//   buscar('pai2', 100); buscar('filho2', 100);   ->  inicios = { pai2: 0, filho2: 0 }`, notes: [{ l: '9', t: 'O cache devolve sempre a mesma promise: requisito para use(promise).' }, { l: '15', t: 'A busca do filho só é disparada quando o filho renderiza, depois do pai resolver.' }, { l: '21', t: 'Iniciar antes de renderizar elimina a cascata.' }] }
  ],
  bestPractices: ['Divida o código por rota e por componentes pesados e raros, com §lazy§ no escopo do módulo.', 'Use §use§ só com promises estáveis (em cache, criadas fora do render).', 'Inicie as buscas o mais cedo possível e em paralelo para evitar cascatas.', 'Posicione as fronteiras de Suspense conforme o layout, com esqueletos do tamanho do conteúdo.', 'Combine Suspense com fronteiras de erro por região e ofereça "tentar de novo".', 'Teste com §await act(async ...)§ e §findBy*§.'],
  mistakes: ['Criar a promise dentro do componente (§use(fetch(...))§).', 'Esperar que §useEffect§ com §fetch§ ative o Suspense.', 'Uma única fronteira para a página inteira ou uma para cada widget minúsculo.', 'Cascatas de componentes que buscam dados em sequência.', 'Esquecer fronteiras de erro e deixar o app em branco quando uma promise falha.', 'Definir §lazy§ dentro de um componente.'],
  market: `Suspense, §lazy§ e §use§ estão no centro da arquitetura de dados do React moderno (Next.js, Remix, TanStack Router). Pessoas que entendem cascatas, fronteiras e streaming melhoram o desempenho percebido de aplicações e são requisitadas em vagas que lidam com Core Web Vitals.`,
  summary: `Suspense mostra um fallback enquanto algo dentro dele suspende; §lazy§ divide o código por §import()§ dinâmico e §use(promise)§ lê promises estáveis durante o render. Cascatas surgem quando a busca do filho só começa depois do pai: inicie as buscas antes e em paralelo. Falhas vão para fronteiras de erro (componentes de classe ou react-error-boundary), que não capturam eventos nem código assíncrono. Teste com act assíncrono; em Server Components, o Suspense delimita o streaming.`,
  refs: [REF3.suspense, REF3.lazy, REF3.use, REF3.errorBoundary, REF3.act, REF3.rsc, REF3.mdnDynamicImport],
  cards: [
    { q: 'Qual o requisito para usar use(promise) com segurança?', a: 'A promise precisa ser estável (a mesma instância entre renderizações), criada fora do render ou em cache.' },
    { q: 'O que causa uma cascata de carregamento?', a: 'Um filho só começa a buscar seus dados depois que o pai terminou e renderizou o filho; a solução é iniciar as buscas antes e em paralelo.' },
    { q: 'O Suspense trata erros?', a: 'Não: apenas mostra o fallback de carregamento; falhas vão para uma fronteira de erro.' },
    { q: 'Quais erros uma fronteira de erro não captura?', a: 'Erros em manipuladores de evento, em código assíncrono fora do render e na renderização no servidor.' }
  ]
},
{
  id: 'rav-06', moduleId: 'm3', order: 6, minutes: 65, tags: ['concorrência', 'useTransition', 'useDeferredValue', 'prioridades', 'responsividade'],
  title: 'Renderização concorrente: useTransition, useDeferredValue e prioridades de atualização',
  objectives: ['Explicar o que é renderização concorrente (interromper e priorizar renderizações) e por que depende de renderização pura', 'Marcar atualizações como transição com §useTransition§ e §startTransition§ e usar §isPending§', 'Adiar valores com §useDeferredValue§ e interpretar a sequência de renderizações urgente e adiada', 'Combinar transições com Suspense para manter o conteúdo anterior na tela', 'Escolher entre transição, valor adiado, debounce e memoização, e evitar usos incorretos'],
  intro: `A digitação travada porque uma lista pesada renderiza é o problema clássico de interface. Antes do React 18, qualquer atualização era tratada com a mesma urgência e, uma vez iniciada, uma renderização **não podia ser interrompida**. Com a **renderização concorrente**, o React separa atualizações **urgentes** (digitar, clicar) de **transições** (trocar de tela, filtrar uma lista grande) e pode **começar uma renderização, interrompê-la** para tratar algo urgente e **retomá-la** depois. Isso **não** deixa o código mais rápido por si só; deixa a interface **mais responsiva**. As sequências abaixo foram **medidas** (React 19.3).`,
  theory: `### Ideia central
- Atualização **urgente**: precisa de resposta imediata (digitar em um campo, clicar). Deve acontecer **na hora**;
- **Transição**: pode demorar um pouco; é aceitável mostrar o resultado **depois**, e ela deve **ceder** a uma atualização urgente que chegue no meio.
O React 18 e 19 permitem **rotular** a atualização como transição. As renderizações de transição são **interruptíveis**: por isso o render precisa ser **puro** (aula 1), já que pode ser descartado e refeito.
**Cuidado:** concorrência não acelera a CPU. Uma renderização de 300 ms continua custando 300 ms; a diferença é que a interface **continua respondendo** durante ela.

### useTransition
§§§tsx
const [pendente, iniciar] = useTransition();
<button onClick={() => iniciar(() => setAba('b'))}>Ir para B</button>
§§§
Tudo que é atualizado de estado **dentro** do callback vira transição. §pendente§ é §true§ enquanto a transição está em andamento. A sequência medida de renderizações do componente foi: §aba=a pend=true§ (a atualização urgente: **marca como pendente**, mostrando a aba antiga) seguida de §aba=b pend=false§ (a transição concluída). Use §pendente§ para um indicador discreto (opacidade, spinner pequeno) **sem esconder o conteúdo atual**. Há também a função §startTransition§ (sem §isPending§), útil fora de componentes.
**Combinada com Suspense**: se a nova tela **suspende** (aguardando dados), uma **transição não mostra o fallback**; o React **mantém a interface anterior** e só troca quando a nova estiver pronta. Já uma atualização urgente que suspende **mostra o fallback**. Por isso, **navegação** e **troca de aba** devem ser transições.
**Limites:** o callback de §iniciar§ deve ser **síncrono** (em versões recentes ações assíncronas são suportadas e o React 19 chama isso de "ações"; consulte a documentação de §useTransition§); **entradas de texto controladas não devem ser transições** (a digitação precisa ser urgente, senão o campo "engasga").

### useDeferredValue
§const adiado = useDeferredValue(q)§ devolve, a princípio, o **valor antigo** enquanto o React renderiza **em segundo plano** com o novo; quando termina, atualiza. Serve quando você **não controla** o código que atualiza o estado (um valor vindo de props) ou para adiar **parte** da tela que depende do valor:
§§§tsx
const [q, setQ] = useState('');
const adiado = useDeferredValue(q);
return <><input value={q} onChange={(e) => setQ(e.target.value)} /><ListaLenta q={adiado} /></>;   // ListaLenta em memo
§§§
Registrando as renderizações do componente ao digitar "ab", obtivemos a sequência §q=a adiado=''§ → §q=a adiado=a§ → §q=ab adiado=a§ → §q=ab adiado=ab§: a **primeira renderização é urgente** (o campo já tem "a", a lista ainda recebe o valor anterior, §''§) e **uma segunda renderização de baixa prioridade** atualiza o valor adiado. A lista lenta deve estar em **§memo§** (ou ser filha de um componente §memo§): sem isso ela re-renderiza na renderização urgente, anulando o ganho (o valor adiado é igual, mas o componente sem §memo§ renderiza de qualquer forma quando o pai renderiza).
Nos testes, como cada tecla foi **concluída** antes da próxima (§userEvent§ aguarda), os valores intermediários foram renderizados todos; em uma digitação **mais rápida que a renderização**, o React **pula valores intermediários** do adiado e renderiza só o mais recente. Indicador de "desatualizado": §q !== adiado§ (por exemplo, opacidade reduzida).

### Transição × valor adiado × debounce
| Técnica | Quando | Observação |
|---|---|---|
| **useTransition** | você controla o §setState§ que causa o trabalho pesado (troca de aba, filtro) | tem §pendente§; boa com Suspense |
| **useDeferredValue** | você recebe o valor (props) ou quer adiar uma parte da tela | não tem §pendente§ (compare com o valor atual) |
| **Debounce** | evitar **trabalho externo** (requisições) a cada tecla | adia o início; o tempo é fixo e não depende do dispositivo |
| **memo**/estrutura | **reduzir** o trabalho de render | é a primeira coisa a tentar (aulas 1 e C2.1) |
Eles se **complementam**: use o debounce para reduzir requisições e o valor adiado para a renderização pesada. O adiado/transição se **adapta** ao hardware (em máquinas rápidas, quase não se nota), ao contrário de um atraso fixo.

### Regras e armadilhas
- Nada **fora** do estado do React (variáveis externas, §ref§) é tratado como transição;
- **não** marque como transição atualizações que **precisam** ser imediatas (campos de texto, feedback de clique);
- renderização **pura**: efeitos colaterais no render quebram sob interrupção e repetição;
- um valor adiado **dentro de efeitos** ou de buscas: o efeito roda com o **valor adiado**, o que é bom para evitar requisições a cada tecla (mas combine com cancelamento);
- **Strict Mode** em desenvolvimento ajuda a encontrar impurezas;
- transição que **nunca termina** (lista infinita sem virtualização) continua sendo problema: reduza o trabalho.

### Em testes
Como a prioridade e o agendamento dependem do React, os testes devem observar **o resultado final** e, quando necessário, o **estado pendente** (§isPending§) com §act§; evite depender de **tempos** exatos. Use sequências de renderização (como as medidas aqui) apenas para **ensinar** o modelo, não como contrato de teste de produção.

### Onde isso aparece no ecossistema
Roteadores (React Router, TanStack Router, Next.js) usam **transições** na navegação; bibliotecas de dados (TanStack Query) integram com Suspense e transições; o **React Compiler** e as **Server Actions** (C2.5) também se apoiam em transições (ações).

### Quando não usar
Se o trabalho pesado é **evitável** (renderizar 10 mil linhas), **reduza-o** (virtualização, paginação, memo, mover estado); a concorrência apenas **distribui** o custo no tempo e pode ainda deixar a tela "atrasada" por segundos em dispositivos lentos.`,
  concepts: [
    { term: 'Renderização concorrente', def: 'Capacidade do React de interromper, pausar e retomar renderizações para priorizar atualizações urgentes.' },
    { term: 'Atualização urgente', def: 'Atualização que precisa de resposta imediata, como digitar ou clicar.' },
    { term: 'Transição', def: 'Atualização marcada como não urgente, que pode ser interrompida e exibida depois.' },
    { term: 'useTransition', def: 'Hook que devolve [pendente, iniciar] para marcar atualizações de estado como transição.' },
    { term: 'isPending', def: 'Indicador de que uma transição está em andamento.' },
    { term: 'useDeferredValue', def: 'Hook que devolve uma versão adiada de um valor, atualizada por uma renderização de baixa prioridade.' },
    { term: 'Debounce', def: 'Técnica que adia uma ação até que uma sequência de eventos pare por um intervalo fixo.' },
    { term: 'Interrupção', def: 'Abandono de uma renderização em andamento para tratar uma atualização mais urgente.' },
    { term: 'Virtualização', def: 'Técnica que renderiza apenas os itens visíveis de uma lista longa.' }
  ],
  examples: R`**Analogia:** é um **atendente de balcão** que está montando um pedido grande (renderização de transição) e, quando um cliente pergunta "que horas são?" (atualização urgente), **para, responde na hora e volta** ao pedido. O atendente não ficou mais rápido; o balcão ficou mais responsivo. O §useDeferredValue§ é entregar ao cliente o **comprovante do pedido anterior** enquanto o novo é montado.

**Resultados medidos (React 19.3, Testing Library):**
§§§
useDeferredValue, digitando "ab" (lista lenta em memo):
  q=a adiado=''  |  q=a adiado=a  |  q=ab adiado=a  |  q=ab adiado=ab
useTransition (botão que muda de aba):
  aba=a pend=true  |  aba=b pend=false
§§§

**Caso real:** um filtro de uma tabela de 8 mil linhas travava a digitação por cerca de meio segundo. Colocar o texto digitado como estado urgente e passar §useDeferredValue(busca)§ para a tabela (agora em §memo§, com a lista filtrada em §useMemo§) manteve o campo fluido em dispositivos fracos, e a tabela passou a ser atualizada logo depois da última tecla. A solução definitiva envolveu também virtualização, pois o custo de renderizar 8 mil linhas continuava alto.`,
  code: [
    { title: 'useDeferredValue com lista lenta em memo: sequência de renderizações (executado com React 19.3)', lang: 'tsx', code: R`const Lista = memo(function Lista({ q }: { q: string }) {
  return <ul>{Array.from({ length: 6 }, (_, i) => <Lento key={i} texto={q + i} />)}</ul>;   // cada item custa ~15 ms
});

function App() {
  const [q, setQ] = useState('');
  const adiado = useDeferredValue(q);
  log.push('q=' + (q || "''") + ' adiado=' + (adiado || "''"));
  return (
    <>
      <input aria-label="q" value={q} onChange={(e) => setQ(e.target.value)} />   {/* urgente */}
      <Lista q={adiado} />                                                       {/* adiada */}
    </>
  );
}
// digitando "ab":  q=a adiado='' | q=a adiado=a | q=ab adiado=a | q=ab adiado=ab`, notes: [{ l: '1', t: 'memo evita que a lista renderize na renderização urgente, quando o valor adiado ainda é o antigo.' }, { l: '7', t: 'O valor adiado primeiro repete o valor anterior e depois alcança o atual.' }, { l: '11', t: 'O campo controlado fica fora da transição: a digitação continua urgente.' }, { l: '15', t: 'Sequência medida: primeiro a renderização urgente, depois a de baixa prioridade.' }] },
    { title: 'useTransition: troca de aba sem esconder o conteúdo atual (executado)', lang: 'tsx', code: R`function Abas() {
  const [aba, setAba] = useState('a');
  const [pendente, iniciar] = useTransition();
  return (
    <>
      <button onClick={() => iniciar(() => setAba('b'))}>ir</button>
      <div style={{ opacity: pendente ? 0.6 : 1 }}>   {/* indicador discreto; o conteúdo atual continua visível */}
        <Suspense fallback={<p>carregando…</p>}>
          <Conteudo aba={aba} />
        </Suspense>
      </div>
    </>
  );
}
// renderizações do componente ao clicar: aba=a pend=true | aba=b pend=false
// Se <Conteudo aba="b"> suspender, a transição mantém a aba "a" na tela (sem mostrar o fallback).`, notes: [{ l: '3', t: 'iniciar marca as atualizações feitas dentro do callback como transição.' }, { l: '7', t: 'pendente permite indicar o andamento sem esconder o conteúdo.' }, { l: '16', t: 'Sequência medida no teste; o comportamento com Suspense segue a documentação e não foi executado com dados reais.' }] }
  ],
  bestPractices: ['Deixe digitação e cliques urgentes e marque como transição só o trabalho que pode esperar.', 'Use §useTransition§ quando controla o §setState§ e §useDeferredValue§ quando recebe o valor ou adia parte da tela.', 'Coloque a parte lenta em §memo§ para o valor adiado fazer efeito.', 'Combine transições com Suspense para manter o conteúdo anterior durante navegações.', 'Reduza o trabalho de render (virtualização, estrutura) antes de depender da concorrência.', 'Mantenha o render puro e use Strict Mode para detectar impurezas.'],
  mistakes: ['Marcar a atualização do campo de texto como transição.', 'Usar §useDeferredValue§ sem §memo§ no componente lento.', 'Esperar que a concorrência diminua o custo total do render.', 'Esconder o conteúdo atual por completo enquanto a transição está pendente.', 'Depender de tempos exatos de renderização em testes.', 'Misturar efeitos colaterais no render, que se tornam inseguros com interrupções.'],
  market: `Responsividade de interface é critério de qualidade (e do Core Web Vitals, INP). §useTransition§ e §useDeferredValue§ são perguntas frequentes em entrevistas de nível sênior, e roteadores e frameworks modernos dependem de transições. Quem entende o que a concorrência faz (e não faz) evita otimizações falsas.`,
  summary: `A renderização concorrente permite ao React interromper e priorizar. Atualizações urgentes (digitar, clicar) passam à frente de transições, que podem ser interrompidas: por isso o render deve ser puro. §useTransition§ marca atualizações de estado como transição e entrega §pendente§; §useDeferredValue§ devolve uma versão adiada de um valor (a renderização urgente usa o antigo; a adiada, o novo), com a parte lenta em §memo§. Transições com Suspense mantêm o conteúdo anterior. Concorrência melhora a responsividade, não o custo: reduza o trabalho primeiro.`,
  refs: [REF3.useTransition, REF3.startTransition, REF3.useDeferredValue, REF3.releaseBlog, REF3.suspense],
  cards: [
    { q: 'O que a renderização concorrente muda na prática?', a: 'O React pode interromper uma renderização de baixa prioridade para tratar uma atualização urgente, mantendo a interface responsiva.' },
    { q: 'Qual a diferença entre useTransition e useDeferredValue?', a: 'useTransition marca o setState que você controla e fornece pendente; useDeferredValue adia um valor que você recebe ou uma parte da tela.' },
    { q: 'Por que a lista lenta deve estar em memo ao usar useDeferredValue?', a: 'Sem memo ela renderiza na renderização urgente (quando o pai renderiza), anulando o adiamento.' },
    { q: 'Digitar em um campo controlado deve ser uma transição?', a: 'Não: a digitação precisa ser urgente, senão o campo engasga; só o trabalho pesado derivado dela deve ser adiado.' }
  ]
}
];
