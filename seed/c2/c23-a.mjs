// C2.3 — React avançado. Aulas 1 e 2 (como o React renderiza; reconciliação, chaves e identidade).
const R = String.raw;

export const REF = {
  renderCommit: { title: 'React — Render and Commit', url: 'https://react.dev/learn/render-and-commit', kind: 'doc' },
  stateSnapshot: { title: 'React — State as a Snapshot', url: 'https://react.dev/learn/state-as-a-snapshot', kind: 'doc' },
  pure: { title: 'React — Keeping Components Pure', url: 'https://react.dev/learn/keeping-components-pure', kind: 'doc' },
  strictMode: { title: 'React — StrictMode (referência)', url: 'https://react.dev/reference/react/StrictMode', kind: 'doc' },
  useLayoutEffect: { title: 'React — useLayoutEffect (referência)', url: 'https://react.dev/reference/react/useLayoutEffect', kind: 'doc' },
  memo: { title: 'React — memo (referência)', url: 'https://react.dev/reference/react/memo', kind: 'doc' },
  compiler: { title: 'React Compiler — Introdução', url: 'https://react.dev/learn/react-compiler/introduction', kind: 'doc' },
  preserving: { title: 'React — Preserving and Resetting State', url: 'https://react.dev/learn/preserving-and-resetting-state', kind: 'doc' },
  tree: { title: 'React — Your UI as a Tree', url: 'https://react.dev/learn/understanding-your-ui-as-a-tree', kind: 'doc' },
  lists: { title: 'React — Rendering Lists (chaves)', url: 'https://react.dev/learn/rendering-lists', kind: 'doc' },
  devtools: { title: 'React Developer Tools (Profiler)', url: 'https://react.dev/learn/react-developer-tools', kind: 'doc' },
  activity: { title: 'React — Activity (referência)', url: 'https://react.dev/reference/react/Activity', kind: 'doc' },
  legacyRecon: { title: 'React (legado) — Reconciliation', url: 'https://legacy.reactjs.org/docs/reconciliation.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'rav-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['renderização', 'commit', 'efeitos', 'Strict Mode', 're-render'],
  title: 'Como o React renderiza: fases de render e commit, ordem dos efeitos e o que dispara um re-render',
  objectives: ['Distinguir as fases de render (cálculo puro), commit (aplicação ao DOM) e efeitos, e prever a ordem em que cada etapa executa', 'Explicar o que dispara uma nova renderização (estado, props do pai, contexto) e o que não dispara', 'Aplicar o princípio "o mesmo elemento não renderiza de novo" (children e elementos estáveis) e a comparação por §Object.is§ no estado', 'Entender o Strict Mode (dupla renderização e efeitos extras) como ferramenta de detecção de impurezas', 'Usar o Profiler para investigar renderizações e entender o papel do React Compiler'],
  intro: `Quem aprende React costuma saber **usar** hooks sem saber **quando** o código roda. Esta aula abre o capô. O React trabalha em **fases**: calcula o que a tela deve ser (**render**), aplica as diferenças ao DOM (**commit**) e só depois roda os **efeitos**. Entender a ordem exata e o que dispara uma nova renderização é o que permite prever comportamentos, achar a causa de lentidão e escrever código que o React pode **pausar, repetir ou descartar** com segurança. Todos os resultados abaixo foram **medidos** (React 19.3, Vitest, jsdom, Testing Library) com registros da ordem de execução.`,
  theory: `### As três etapas
1. **Gatilho**: algo pede uma renderização: a montagem inicial (§root.render§) ou uma atualização de **estado** (§setState§), das **props** (o pai renderizou de novo) ou de um **contexto** consumido;
2. **Render**: o React **chama os componentes** (as funções) e obtém a descrição da interface (elementos). Esta fase deve ser **pura**: sem alterar nada fora do componente, sem acessar o DOM. Como pode ser **interrompida, repetida ou descartada**, o React exige pureza;
3. **Commit**: o React compara a descrição nova com a anterior (**reconciliação**) e **aplica ao DOM** só o que mudou; define as **refs**; roda os **efeitos de layout**; o navegador pinta; então rodam os **efeitos** (§useEffect§).
A renderização do React não é o mesmo que "atualizar o DOM": um componente pode **renderizar** (a função ser chamada) sem que o DOM mude nada.

### Ordem de execução (medida)
Registrando mensagens em um pai com um filho, a montagem produziu:
§§§
render pai > render filho > layout filho ref=DOM > layout pai > efeito filho > efeito pai
§§§
- o **render é de cima para baixo** (pai antes do filho);
- os **efeitos de layout** (§useLayoutEffect§) e os **efeitos** rodam **de baixo para cima** (filho antes do pai) e os de layout **antes** dos normais;
- no efeito de layout, a **ref já aponta para o DOM** (§ref=DOM§), porque o commit já aconteceu; durante o render a ref ainda é §null§ na primeira vez;
- numa **atualização**, a ordem foi §render pai > render filho > layout filho > layout pai > cleanup filho > efeito filho > efeito pai§: os **cleanups** dos efeitos antigos rodam logo antes dos novos efeitos.
§useLayoutEffect§ roda **antes da pintura** e **bloqueia** o desenho: use só para **medir e ajustar o layout** (tooltips, posicionamento) e evite trabalho pesado. §useEffect§ roda **depois** da pintura (na maioria dos casos).

### O que dispara um re-render (e o que não dispara)
Medido em um pai com filhos de tipos diferentes, ao mudar o **estado do pai**:
- o **próprio pai**: renderizou (1);
- um **filho comum** que recebe a mesma prop: **renderizou** (1). Renderizar o pai renderiza **todos os filhos**, mesmo com props iguais;
- um filho envolvido em **§memo§** com props iguais: **não** renderizou (0);
- um filho passado como **elemento já criado**: se o **pai que o criou** renderiza de novo, o elemento é **novo** e o filho renderiza (1);
- ao mudar o estado de um componente que recebe o filho por **§children§** (o elemento foi criado por **outro** pai), o filho **não** renderizou (0), pois o React reutiliza o mesmo elemento: este é o motivo do truque "mover o estado para um componente que recebe children";
- um consumidor de **contexto** re-renderiza quando o **valor do contexto** muda (ou quando seu pai renderiza, como qualquer filho).
- **§setState§ com o mesmo valor** (§Object.is§ igual): **0** renderizações extras no teste (o React pode ainda chamar o componente uma vez antes de descartar o resultado, sem commit; não conte com isso).
Regra: **renderizar é barato; renderizar demais** é o que pesa. Prefira reorganizar (estado perto de quem o usa, §children§) antes de memoizar.

### Strict Mode
Em **desenvolvimento**, §<StrictMode>§ ajuda a achar impurezas:
- **renderiza duas vezes** cada componente: no teste, a função foi chamada **1 vez** sem Strict Mode e **2 vezes** com ele (o resultado do segundo render é descartado; mensagens de log duplicadas são esperadas);
- **executa os efeitos extras na montagem** (setup, cleanup e setup de novo, aula do C2.1): a montagem ficou §... efeito filho > efeito pai > cleanup filho > layout filho > layout pai > efeito filho > efeito pai§;
- (React 19) também reexecuta **callbacks de ref**.
Em **produção** nada disso acontece. Se algo "quebra" apenas no Strict Mode, é um **bug real** (impureza ou cleanup ausente).

### Pureza, na prática
Dentro do render **não** faça: alterar variáveis externas, mexer no DOM, ler §Date.now()§/§Math.random()§ para decidir a interface, fazer requisições. Pode fazer: calcular, criar JSX, ler props/estado/contexto, **criar objetos locais** (variáveis "locais" criadas e descartadas no render são puras, mesmo se você as muta). O que o React supõe: **mesmas entradas, mesma saída**.

### Atualizações em lote e prioridade
Várias atualizações dentro de um evento são **agrupadas** (batching, C2.1) e processadas em **uma** renderização. Desde o React 18, atualizações podem ter **prioridades** (urgente: digitar, clicar; transição: troca de tela, filtro pesado): o React pode **interromper** uma renderização de transição para tratar uma urgente (aula 6). Essa capacidade só é segura porque o render é puro.

### Investigando: o Profiler
O **React Developer Tools** tem o **Profiler**: registra renderizações e mostra **quem renderizou**, **quanto levou** e **por quê** ("Props changed", "Hooks changed", "Parent rendered"). Procedimento: (1) grave uma interação; (2) ordene por tempo; (3) veja **por que** o componente caro renderizou; (4) escolha a correção (mover estado, §children§, §memo§, virtualizar). **Meça antes de otimizar**; evite supor.

### React Compiler (visão geral)
O **React Compiler** é uma ferramenta de build que **memoiza automaticamente** componentes e valores seguindo as regras do React (pureza, regras dos hooks). Ele reduz a necessidade de §useMemo§, §useCallback§ e §memo§ **manuais**, mas **não** substitui o entendimento: componentes que violam as regras são **pulados**, a arquitetura (onde vive o estado) ainda importa e a depuração exige saber o que o compilador fez. Detalhes de uso e de desempenho ficam para o curso de performance; aqui basta saber que o modelo mental desta aula continua valendo.

### Erros de modelo mental comuns
- "O componente renderiza quando o DOM muda" (é o contrário);
- "Renderizar = lento" (renderizar uma função é barato; o custo vem de muito trabalho por render ou de muitos nós);
- "O estado muda na hora" (é um snapshot, C2.1);
- "Efeito é um evento de ciclo de vida" (é sincronização, C2.1);
- "Strict Mode duplicando é bug do React" (é detecção de impureza).`,
  concepts: [
    { term: 'Render', def: 'Fase em que o React chama os componentes para calcular a descrição da interface; deve ser pura.' },
    { term: 'Commit', def: 'Fase em que o React aplica as diferenças ao DOM, define refs e roda efeitos de layout.' },
    { term: 'Reconciliação', def: 'Comparação entre a descrição nova e a anterior para decidir o que alterar no DOM.' },
    { term: 'useLayoutEffect', def: 'Efeito que roda depois do commit e antes da pintura, usado para medir e ajustar o layout.' },
    { term: 'Re-render', def: 'Nova chamada de um componente causada por estado, props do pai ou contexto.' },
    { term: 'Strict Mode', def: 'Modo de desenvolvimento que renderiza duas vezes e repete efeitos para expor impurezas.' },
    { term: 'Pureza', def: 'Propriedade de devolver o mesmo resultado para as mesmas entradas, sem efeitos externos, durante o render.' },
    { term: 'Profiler', def: 'Ferramenta do React DevTools que registra renderizações e as causas.' },
    { term: 'React Compiler', def: 'Ferramenta de build que memoiza automaticamente componentes e valores que seguem as regras do React.' },
    { term: 'Prioridade de atualização', def: 'Distinção entre atualizações urgentes e transições, que o React pode interromper e retomar.' }
  ],
  examples: R`**Analogia:** o render é o **rascunho de uma planta** (barato, pode ser refeito ou jogado fora); o commit é a **obra** (cara e visível); os efeitos são as **inspeções depois da obra**. Como o rascunho pode ser descartado, ninguém pode, durante o rascunho, mexer na obra real ("não pinte a parede enquanto desenha a planta").

**Resultados medidos (React 19.3, Testing Library):**
§§§
montagem:    render pai > render filho > layout filho ref=DOM > layout pai > efeito filho > efeito pai
atualização: render pai > render filho > layout filho ref=DOM > layout pai > cleanup filho > efeito filho > efeito pai
Strict:      render pai > render pai > render filho > render filho > ... > efeito pai > cleanup filho > layout filho > layout pai > efeito filho > efeito pai
estado do pai muda: pai 1 | filho comum 1 | memo 0 | elemento criado pelo pai 1 | consumidor de contexto 1
estado de um componente que recebe children: o filho passado por children renderiza 0 vez
setState com o mesmo valor: 0 renderizações extras
chamadas do componente: sem Strict 1 | com Strict 2
§§§

**Caso real:** uma tela de cadastro re-renderizava uma tabela de 2 mil linhas a cada tecla digitada em um campo de busca vizinho. O Profiler mostrou "Parent rendered". Em vez de §memo§ na tabela, o estado do campo foi movido para um componente próprio (que recebe a tabela como §children§): a tabela deixou de renderizar a cada tecla, sem nenhuma memoização.`,
  code: [
    { title: 'Registrando a ordem de render, commit e efeitos (executado com React 19.3)', lang: 'tsx', code: R`const log: string[] = [];

function Filho({ n }: { n: number }) {
  log.push('render filho');
  const r = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => { log.push('layout filho ref=' + (r.current ? 'DOM' : 'null')); });
  useEffect(() => { log.push('efeito filho'); return () => log.push('cleanup filho'); });
  return <span ref={r}>{n}</span>;
}

function Pai() {
  log.push('render pai');
  const [n, setN] = useState(0);
  useLayoutEffect(() => { log.push('layout pai'); });
  useEffect(() => { log.push('efeito pai'); });
  return <><button onClick={() => setN(n + 1)}>+</button><Filho n={n} /></>;
}
// montagem: render pai > render filho > layout filho ref=DOM > layout pai > efeito filho > efeito pai`, notes: [{ l: '4', t: 'O render é de cima para baixo: o pai registra antes do filho.' }, { l: '6', t: 'No efeito de layout a ref já aponta para o DOM (o commit aconteceu).' }, { l: '7', t: 'Efeitos rodam do filho para o pai; o cleanup roda antes do próximo efeito.' }, { l: '17', t: 'Resultado observado no teste de montagem.' }] },
    { title: 'Estado perto de quem usa e children: evitando re-renders (executado)', lang: 'tsx', code: R`// Ruim: o estado do campo vive no pai da tabela; a cada tecla, <Tabela /> renderiza de novo
function TelaRuim() {
  const [busca, setBusca] = useState('');
  return <><input value={busca} onChange={(e) => setBusca(e.target.value)} /><Tabela /></>;
}

// Melhor: o estado vive em um componente que recebe a tabela já criada por quem o usa
function CampoComEstado({ children }: { children: React.ReactNode }) {
  const [busca, setBusca] = useState('');
  return <><input value={busca} onChange={(e) => setBusca(e.target.value)} />{children}</>;
}
function TelaBoa() {
  return <CampoComEstado><Tabela /></CampoComEstado>;   // o elemento <Tabela /> é criado aqui, não muda quando o campo muda
}
// Medido: o elemento recebido por children não renderizou quando o estado do componente que o recebe mudou (0).`, notes: [{ l: '1', t: 'Aqui o pai que renderiza a cada tecla também cria o elemento <Tabela />, que é novo a cada render.' }, { l: '14', t: 'TelaBoa não renderiza quando CampoComEstado muda; o elemento é o mesmo e o React o reaproveita.' }, { l: '14', t: 'Atenção: se TelaBoa tiver estado próprio e renderizar, o elemento volta a ser recriado.' }] }
  ],
  bestPractices: ['Mantenha o render puro: sem efeitos, sem acesso ao DOM, sem dados não determinísticos.', 'Use o Profiler para descobrir por que um componente renderizou antes de otimizar.', 'Aproxime o estado de quem o usa e passe conteúdo por §children§ para evitar renderizações em cascata.', 'Mantenha o Strict Mode ligado em desenvolvimento e trate qualquer quebra como bug real.', 'Use §useLayoutEffect§ só para medir e ajustar layout, com trabalho mínimo.', 'Avalie o React Compiler, sem abandonar o entendimento do modelo.'],
  mistakes: ['Achar que renderizar atualiza o DOM necessariamente.', 'Ler ou mutar o DOM, refs ou variáveis externas durante o render.', 'Desligar o Strict Mode para "sumir com o duplo log".', 'Memoizar tudo em vez de reorganizar o estado.', 'Usar §useLayoutEffect§ para tudo, bloqueando a pintura.', 'Assumir uma ordem de efeitos entre irmãos ou entre pai e filho diferente da real.'],
  market: `Entender fases e ordem de execução é o que distingue pessoas que "usam React" das que depuram problemas de renderização, efeitos duplicados e lentidão. Perguntas como "em que ordem rodam os efeitos do pai e do filho?", "por que o filho renderiza se a prop é a mesma?" e "o que o Strict Mode faz?" aparecem em entrevistas de nível pleno e sênior.`,
  summary: `O React renderiza em fases: o render (puro) calcula a interface, o commit aplica as diferenças ao DOM e define refs, e os efeitos rodam depois (de baixo para cima; efeitos de layout antes dos normais). Re-renders vêm de estado, de props do pai e de contexto; renderizar o pai renderiza os filhos, a menos que sejam §memo§ ou o mesmo elemento recebido por §children§. O Strict Mode duplica renders e efeitos para expor impurezas. Use o Profiler e reorganize antes de memoizar; o React Compiler automatiza parte do trabalho.`,
  refs: [REF.renderCommit, REF.stateSnapshot, REF.pure, REF.strictMode, REF.useLayoutEffect, REF.devtools, REF.compiler],
  cards: [
    { q: 'Qual a ordem de execução dos efeitos entre pai e filho?', a: 'De baixo para cima: o efeito do filho roda antes do efeito do pai; efeitos de layout rodam antes dos efeitos normais.' },
    { q: 'Por que o render precisa ser puro?', a: 'Porque o React pode interromper, repetir ou descartar renderizações (Strict Mode, transições) e não deve haver efeitos externos nelas.' },
    { q: 'Quando um filho recebido por children não re-renderiza?', a: 'Quando o componente que o recebe muda o próprio estado: o elemento foi criado por outro pai e continua o mesmo.' },
    { q: 'O que o Strict Mode faz em desenvolvimento?', a: 'Renderiza os componentes duas vezes e executa efeitos extras (setup, cleanup, setup) para expor impurezas e limpezas ausentes.' }
  ]
},
{
  id: 'rav-02', moduleId: 'm1', order: 2, minutes: 65, tags: ['reconciliação', 'identidade', 'key', 'estado', 'posição na árvore'],
  title: 'Reconciliação, chaves e identidade: por que o estado "reseta" (ou não)',
  objectives: ['Explicar como o React decide se um componente é "o mesmo" entre renderizações (tipo, posição e chave)', 'Prever quando o estado é preservado e quando é descartado ao trocar tipos, posições e chaves', 'Reconhecer e corrigir o erro de definir componentes dentro de outros componentes', 'Usar §key§ para resetar estado de forma intencional e para identificar itens em listas dinâmicas', 'Descrever em alto nível o algoritmo de comparação e suas suposições (heurística O(n))'],
  intro: `"Por que meu campo perdeu o texto que eu digitei?" e "por que o estado ficou no item errado depois de reordenar a lista?" são o mesmo problema: **identidade**. O React guarda o estado **associado à posição de um componente na árvore** e decide, a cada renderização, se aquele componente é **o mesmo** (preserva o estado) ou **outro** (descarta e cria de novo). Dominar as três regras (tipo, posição, chave) transforma esses "mistérios" em consequências previsíveis. Todos os resultados abaixo foram **medidos** com React 19.3.`,
  theory: `### A árvore e o estado
O React mantém uma **árvore de componentes**. O estado de um §useState§ não vive "no componente" como variável da função, e sim **no React, ligado ao nó da árvore** em uma posição específica. Quando você renderiza de novo, o React **compara** a árvore nova com a anterior, nó a nó (**reconciliação**).

### As regras de identidade
Em cada posição, entre a renderização anterior e a nova:
1. **Mesmo tipo e mesma posição (e mesma chave)** → é **o mesmo** componente: o **estado é preservado** e as props são atualizadas;
2. **Tipo diferente** na mesma posição (ex.: §<Contador>§ vira §<p>§ ou §<Outro>§) → o React **desmonta** o antigo (estado perdido) e **monta** um novo;
3. **Chave diferente** → também é outro componente: desmonta e monta.
No teste: um §Contador§ foi clicado duas vezes (§x:2§). (a) Trocando a condição para renderizar **o mesmo tipo na mesma posição**, o estado seguiu em §x:2§. (b) Trocando por um §<p>§ e voltando, o contador **reiniciou** (§x:0§). (c) Mudando só a **chave** (§key="b"§), reiniciou também (§x:0§). A **posição** é na árvore (a ordem dos filhos no mesmo pai), não no código-fonte nem na tela.

### key para resetar de propósito
Como mudar a chave recria o componente, §key§ é a forma recomendada de **reiniciar o estado** quando uma identidade muda: §<Formulario key={usuarioId} />§ limpa os campos ao trocar de usuário, sem efeitos de reset. Evite o oposto (efeito que "ajusta o estado quando a prop muda"), pois renderiza uma vez com o estado velho.

### Listas: a chave é a identidade do item
(Aula do C2.1 sobre chaves.) Medimos o que acontece ao mover o item "a" (clicado duas vezes) para o meio de §['a','b','c']§ → §['c','a','b']§:
- **§key={id}§**: §c:0 a:2 b:0§ — o estado **acompanhou o item**;
- **§key={índice}§**: §c:2 a:0 b:0§ — o estado ficou na **posição** (o primeiro item agora é o "c" com a contagem do "a").
Por isso, em listas que **mudam de ordem, filtram ou inserem no meio**, a chave deve ser um **id estável dos dados**. Gerar a chave no render (§Math.random()§) faz o item parecer novo em todo render, recriando o componente.

### O erro clássico: componente definido dentro de outro
Declarar um componente **dentro** da função de outro cria um **novo tipo a cada renderização** (a função §Interno§ é recriada). O React compara tipos por **identidade da função**: como é sempre uma função nova, o filho é **desmontado e remontado** em todo render do pai, perdendo estado, foco e causando custo. Medido: um contador interno tinha §i:2§; depois que o **pai re-renderizou** (clicando em um botão do pai), voltou a §i:0§. O mesmo componente **definido fora** do pai manteve o estado (§j:1§).
Regra: **nunca defina componentes dentro de componentes**. Se precisar de um componente que depende de variáveis do pai, passe-as por **props** ou use composição.

### O que o algoritmo supõe (heurística)
Comparar duas árvores arbitrárias de forma ótima é caro. O React usa uma **heurística de complexidade linear**, baseada em duas suposições: (1) elementos de **tipos diferentes** produzem árvores diferentes (não tenta aproveitar filhos); (2) as **chaves** indicam quais filhos são estáveis entre renderizações. Consequências práticas: **não** alterne entre dois tipos que renderizam subárvores quase iguais (ex.: §<div>§ e §<section>§ no topo de um bloco grande) esperando preservar estado; mantenha **estruturas estáveis** e use chaves em listas.

### Fragmentos, null e posições
- Renderizar §null§ ou §false§ em uma posição **ocupa a posição** (para as regras de identidade); alternar entre §{cond && <A />}§ e §{<A />}§ no meio de outros irmãos **não** desloca a posição dos demais, porque o JSX preserva "buracos";
- um **fragmento** na mesma posição preserva os filhos;
- mover um componente para **outro pai** (outra posição) **recria**.

### Preservar estado ao ocultar
Quando você **quer** preservar o estado de algo que sai da tela (abas, painéis), em vez de desmontar: (1) **ocultar com CSS** (§hidden§), (2) **elevar** o estado para um pai que permanece, (3) manter em um **store externo** ou em §sessionStorage§; a documentação do React 19.3 descreve o componente **§<Activity>§** (§mode="hidden"§), que oculta uma parte da interface **preservando o estado** dos descendentes (não executado neste laboratório; consulte a página oficial para o comportamento e as limitações).

### Depuração de identidade
Sintomas: campo perde o texto ao digitar; foco some; animações reiniciam; efeitos rodam de novo. Verifique: (1) há **componente definido dentro de outro**? (2) a **chave** está estável (não é aleatória nem muda)? (3) o **tipo** alterna na mesma posição? (4) a estrutura do JSX **muda de forma** (um wrapper condicional ao redor)? No React DevTools, a aba Components mostra a árvore e as chaves.

### Wrappers condicionais
§cond ? <div><Campo /></div> : <Campo />§ muda o **tipo** na posição (§div§ → §Campo§) e recria §Campo§. Prefira manter o mesmo wrapper e alterar atributos (§className§), ou mover a condição para dentro.`,
  concepts: [
    { term: 'Identidade de componente', def: 'Combinação de tipo, posição na árvore e chave que decide se o React preserva ou descarta o estado.' },
    { term: 'Desmontar', def: 'Remover um componente da árvore, descartando seu estado e executando os cleanups dos efeitos.' },
    { term: 'Posição na árvore', def: 'Lugar do componente entre os filhos de seu pai, usado para associar estado entre renderizações.' },
    { term: 'key', def: 'Atributo que define a identidade de um elemento entre renderizações; mudá-la recria o componente.' },
    { term: 'Heurística de reconciliação', def: 'Regras do React (tipo diferente = árvore diferente; chaves indicam estabilidade) para comparar árvores em tempo linear.' },
    { term: 'Componente aninhado', def: 'Componente definido dentro de outro; cria um tipo novo a cada render e é remontado sempre.' },
    { term: 'Reset por chave', def: 'Uso de key para reiniciar o estado de um componente quando uma identidade mudou.' },
    { term: 'Wrapper condicional', def: 'Elemento que envolve um componente só em certas condições, mudando o tipo na posição e recriando o filho.' }
  ],
  examples: R`**Analogia:** o estado é a **mala** de cada hóspede de um hotel, guardada no **quarto** (posição) com o **nome** na reserva (chave). Se o hóspede muda de quarto mas a reserva é a mesma, a gerência leva a mala junto (chave estável, id). Se o hotel só olha o número do quarto (índice), a mala fica no quarto e é entregue a **outra pessoa** que ocupa aquele quarto. Se o hotel demole e reconstrói o quarto toda manhã (componente definido dentro de outro), a mala é perdida todo dia.

**Resultados medidos (React 19.3):**
§§§
mesmo tipo e posição:                  x:2   (estado mantido)
tipo diferente no meio, e volta:       x:0   (desmontou)
chave diferente:                       x:0   (reset)
componente definido DENTRO do pai, depois que o pai renderiza:  i:2 -> i:0
componente definido FORA do pai:       j:1   (estado mantido)
lista [a,b,c] -> [c,a,b] com key=id:      c:0 a:2 b:0
lista [a,b,c] -> [c,a,b] com key=índice:  c:2 a:0 b:0
§§§

**Caso real:** um formulário perdia o foco a cada tecla. A causa: um componente §Campo§ estava definido dentro do componente da página para "aproveitar" variáveis do escopo; cada tecla re-renderizava a página, criava um novo tipo §Campo§ e o React remontava o input. Mover §Campo§ para fora e passar as variáveis por props resolveu.`,
  code: [
    { title: 'Identidade: tipo, posição e chave (executado com React 19.3)', lang: 'tsx', code: R`function Contador({ nome }: { nome: string }) {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{nome}:{n}</button>;
}

function A({ trocar, mesmoTipo, chave }: { trocar: boolean; mesmoTipo: boolean; chave?: string }) {
  return (
    <div>
      {trocar
        ? (mesmoTipo ? <Contador key={chave} nome="x" /> : <p>outro</p>)
        : <Contador key={chave} nome="x" />}
    </div>
  );
}
// clique 2 vezes em <A trocar={false} mesmoTipo />             -> x:2
// rerender <A trocar mesmoTipo />                               -> x:2  (mesmo tipo e posição)
// rerender <A trocar mesmoTipo={false} /> e voltar              -> x:0  (desmontou)
// rerender com chave="b"                                        -> x:0  (chave diferente)`, notes: [{ l: '10', t: 'Na mesma posição, o mesmo tipo preserva o estado; o <p> desmonta o Contador.' }, { l: '9', t: 'A chave diferente força a criação de um novo Contador.' }, { l: '16', t: 'Resultados observados no teste.' }] },
    { title: 'Componente definido dentro de outro x fora (executado)', lang: 'tsx', code: R`// ERRADO: Interno é uma função nova a cada render de Pai -> novo tipo -> remonta
function Pai() {
  const [t, setT] = useState(0);
  function Interno() {
    const [n, setN] = useState(0);
    return <button onClick={() => setN(n + 1)}>i:{n}</button>;
  }
  return <><button onClick={() => setT(t + 1)}>pai{t}</button><Interno /></>;
}
// clicar em i:  i:2   -> clicar no botão do pai -> i:0   (estado perdido)

// CERTO: definido fora; recebe o que precisa por props
function Interno2() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>j:{n}</button>;
}
function Pai2() {
  const [t, setT] = useState(0);
  return <><button onClick={() => setT(t + 1)}>pai2-{t}</button><Interno2 /></>;
}
// clicar em j: j:1 -> clicar no botão do pai2 -> j:1   (estado mantido)`, notes: [{ l: '4', t: 'A declaração dentro do corpo cria uma função diferente em cada chamada de Pai.' }, { l: '11', t: 'O React compara tipos por identidade; um tipo novo desmonta o antigo.' }, { l: '15', t: 'Definido no escopo do módulo, o tipo é único e o estado é preservado.' }] }
  ],
  bestPractices: ['Use ids estáveis dos dados como chave em listas que mudam de ordem.', 'Use §key§ para resetar o estado quando uma identidade muda, em vez de efeitos de reset.', 'Nunca defina componentes dentro de outros componentes.', 'Mantenha a estrutura do JSX estável: evite wrappers condicionais que mudam o tipo na posição.', 'Eleve o estado (ou use um store) quando precisar preservá-lo ao ocultar partes da interface.', 'Verifique a árvore e as chaves no React DevTools quando o estado "sumir".'],
  mistakes: ['Usar o índice como chave em listas dinâmicas.', 'Definir um componente dentro do corpo de outro.', 'Alternar o tipo do elemento na mesma posição esperando preservar o estado.', 'Gerar a chave no render com valores aleatórios.', 'Usar efeitos para "limpar" estado em vez de §key§.', 'Mover um componente para outro pai e esperar que o estado o siga.'],
  market: `Bugs de identidade (campo que perde o foco, estado no item errado, animação que reinicia) são clássicos em produção e em entrevistas ("por que o estado resetou?", "o que acontece se eu definir um componente dentro de outro?"). Quem entende identidade resolve esses problemas em minutos e projeta listas e formulários mais robustos.`,
  summary: `O estado de um componente é guardado pelo React na sua posição na árvore. Entre renderizações, mesmo tipo, mesma posição e mesma chave significam o mesmo componente (estado preservado); tipo ou chave diferentes desmontam e montam um novo (estado perdido). Em listas, use ids estáveis: com índice, o estado fica na posição. Use §key§ para resetar de propósito e nunca defina componentes dentro de outros: o tipo novo a cada render causa remontagem. A heurística linear do React pressupõe estruturas estáveis.`,
  refs: [REF.preserving, REF.tree, REF.lists, REF.activity, REF.legacyRecon],
  cards: [
    { q: 'Quando o React preserva o estado de um componente entre renderizações?', a: 'Quando ele aparece com o mesmo tipo, na mesma posição da árvore e com a mesma chave.' },
    { q: 'Por que definir um componente dentro de outro é um erro?', a: 'Cria uma função (tipo) nova a cada render do pai, e o React desmonta e remonta o filho, perdendo estado e foco.' },
    { q: 'Como resetar o estado de um formulário ao trocar de usuário?', a: 'Usando key={usuarioId} no componente: a mudança de chave recria o componente.' },
    { q: 'Qual a consequência de usar o índice como chave ao reordenar uma lista?', a: 'O estado fica na posição e "troca de item": o item novo que ocupa a posição herda o estado do anterior.' }
  ]
}
];
