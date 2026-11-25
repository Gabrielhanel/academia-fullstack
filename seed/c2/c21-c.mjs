// C2.1 — React essencial. Aulas 7 a 9 (useEffect, refs e memoização, Context).
const R = String.raw;

export const REF3 = {
  sync: { title: 'React — Synchronizing with Effects', url: 'https://react.dev/learn/synchronizing-with-effects', kind: 'doc' },
  notEffect: { title: 'React — You Might Not Need an Effect', url: 'https://react.dev/learn/you-might-not-need-an-effect', kind: 'doc' },
  lifecycle: { title: 'React — Lifecycle of Reactive Effects', url: 'https://react.dev/learn/lifecycle-of-reactive-effects', kind: 'doc' },
  useEffect: { title: 'React — useEffect (referência)', url: 'https://react.dev/reference/react/useEffect', kind: 'doc' },
  refs: { title: 'React — Referencing Values with Refs', url: 'https://react.dev/learn/referencing-values-with-refs', kind: 'doc' },
  manipulatingDom: { title: 'React — Manipulating the DOM with Refs', url: 'https://react.dev/learn/manipulating-the-dom-with-refs', kind: 'doc' },
  useMemo: { title: 'React — useMemo (referência)', url: 'https://react.dev/reference/react/useMemo', kind: 'doc' },
  useCallback: { title: 'React — useCallback (referência)', url: 'https://react.dev/reference/react/useCallback', kind: 'doc' },
  memo: { title: 'React — memo (referência)', url: 'https://react.dev/reference/react/memo', kind: 'doc' },
  compiler: { title: 'React Compiler — Introdução', url: 'https://react.dev/learn/react-compiler/introduction', kind: 'doc' },
  context: { title: 'React — Passing Data Deeply with Context', url: 'https://react.dev/learn/passing-data-deeply-with-context', kind: 'doc' },
  useContext: { title: 'React — useContext (referência)', url: 'https://react.dev/reference/react/useContext', kind: 'doc' },
  scaling: { title: 'React — Scaling Up with Reducer and Context', url: 'https://react.dev/learn/scaling-up-with-reducer-and-context', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'rea-07', moduleId: 'm3', order: 7, minutes: 70, tags: ['useEffect', 'efeitos', 'dependências', 'cleanup', 'Strict Mode'],
  title: 'useEffect: sincronizar com o mundo externo, dependências e limpeza',
  objectives: ['Explicar o que é um efeito (sincronizar com algo externo) e o que não é (reagir a eventos ou calcular valores)', 'Escrever a lista de dependências corretamente e limpar efeitos (§cleanup§)', 'Explicar o comportamento do Strict Mode (montar, desmontar e montar de novo) e por que ele ajuda', 'Evitar closures desatualizadas e corridas de requisições', 'Identificar efeitos desnecessários e substituí-los por cálculo na renderização, eventos ou chaves'],
  intro: `**§useEffect§** é a ferramenta mais usada e mais mal usada do React. Ele existe para uma coisa: **sincronizar o componente com algo que está fora do React** (um servidor, um temporizador, um evento do navegador, um widget de terceiros). Quase todo "bug de efeito" nasce de usá-lo para outra coisa (calcular valores, reagir a cliques) ou de dependências mal declaradas. Esta aula mostra, com medições em React 19.3, **quando o efeito roda, quando é limpo** e por que o **Strict Mode** o executa duas vezes na montagem.`,
  theory: `### O que é um efeito
Um **efeito** é código que roda **depois da renderização** (e depois de o React atualizar o DOM) para **sincronizar** o componente com um sistema externo: conectar a um servidor de chat, assinar um evento do navegador, buscar dados, iniciar um temporizador. A forma geral:
§§§tsx
useEffect(() => {
  const conexao = conectar(salaId);          // sincroniza
  return () => conexao.desconectar();        // limpeza (cleanup)
}, [salaId]);                                // dependências
§§§
- **Setup** (a função): liga a sincronização;
- **Cleanup** (a função devolvida): desfaz o setup; roda **antes de o efeito rodar de novo** e **ao desmontar**;
- **Dependências**: valores reativos (props, estado, variáveis do componente) lidos dentro do efeito.

### Quando ele roda (medido)
No teste, o efeito §[id]§ de um componente produziu: com §id=1§ → **conecta 1**; ao mudar para §id=2§ → **desconecta 1, conecta 2**; ao re-renderizar com o **mesmo** §id=2§ → **nada**; ao desmontar → **desconecta 2**. Ou seja: o efeito roda **na montagem** e **sempre que uma dependência muda** (comparação com §Object.is§).
- §[]§ (vazio): roda **uma vez** (na montagem) e limpa ao desmontar. Só correto se o efeito **não usa** valores reativos;
- **sem lista**: roda **a cada renderização** (raramente é o que se quer).

### Regra das dependências
**Declare tudo o que o efeito lê.** O linter §react-hooks/exhaustive-deps§ aponta o que falta; **não suprima o aviso**. Se uma dependência muda a cada render (objeto ou função criados no corpo), mova-a para **dentro do efeito**, para **fora do componente** ou memoize (aula 8). Se você não quer reagir a uma mudança, o problema costuma estar no desenho do efeito, não na lista.

### Strict Mode: montar, desmontar, montar
Em **desenvolvimento**, o Strict Mode simula que o componente é **desmontado e remontado** logo após o primeiro mount, para verificar se o **cleanup** desfaz o **setup**. No teste: sem Strict Mode: **conecta 1**; com Strict Mode: **conecta 1 | desconecta 1 | conecta 1**. Em produção isso **não acontece**. Se o efeito quebra com esse ciclo extra, falta um cleanup (conexão duplicada, ouvinte acumulado, requisição não cancelada).

### Closures desatualizadas
O efeito "captura" os valores da renderização em que foi criado. Um temporizador criado com §[]§ que faz §setN(n + 1)§ lê sempre o §n§ inicial (0): no teste, após ~120 ms, o contador ficou em **1**, enquanto a versão com atualização funcional (§setN(x => x + 1)§) passou de **3**. Soluções: **atualização funcional**, incluir a dependência (e recriar o temporizador) ou, em casos específicos, guardar o valor em uma **ref**.

### Buscar dados: corridas e cancelamento
Sem cuidado, respostas chegam **fora de ordem**: o usuário busca "a" (lenta) e depois "b" (rápida); se "a" chega por último, **sobrescreve** "b". Padrão com **flag de cancelamento**:
§§§tsx
useEffect(() => {
  let ignorar = false;
  buscar(q).then((r) => { if (!ignorar) setRes(r); });
  return () => { ignorar = true; };
}, [q]);
§§§
Com isso, o teste terminou em **"resultado b"**. Alternativas: §AbortController§ (cancela a requisição) e **bibliotecas de dados** (TanStack Query, SWR, e as fontes de dados dos frameworks) que tratam cache, corridas, repetição e estados de carregamento. Em aplicações novas, **evite escrever buscas à mão** em efeitos quando houver uma biblioteca.

### Você talvez não precise de um efeito
A documentação oficial lista usos que **não** pedem efeito:
- **Valor calculado** de props/estado: calcule na renderização (§const nomeCompleto = nome + ' ' + sobrenome§), sem estado + efeito;
- **Reagir a um evento** do usuário (envio, clique): faça no **manipulador de evento**;
- **Resetar estado** quando uma prop muda: use **§key§** (aula 5);
- **Ajustar estado** a partir de props: calcule, ou use a chave, ou eleve;
- **Notificar o pai** depois de um estado mudar: chame o §onChange§ do pai **no mesmo evento**;
- **Inicialização** que roda uma vez na aplicação: coloque fora do componente (módulo).
Efeitos extras causam **renderizações em cascata** e bugs de sincronização.

### Efeitos com dados externos: useSyncExternalStore
Para assinar fontes externas mutáveis (por exemplo, §navigator.onLine§, o tamanho da janela, bibliotecas de estado), existe o hook §useSyncExternalStore§, que evita inconsistências na renderização concorrente.

### Resumo prático (checklist)
1. Existe um **sistema externo** para sincronizar? Se não, provavelmente não é efeito.
2. O efeito **limpa** o que cria?
3. Todas as **dependências** estão declaradas (e o linter está feliz)?
4. Funciona com o **Strict Mode** (montar, desmontar, montar)?
5. Há **corrida** possível? Cancele ou ignore respostas antigas.`,
  concepts: [
    { term: 'Efeito', def: 'Código que roda depois da renderização para sincronizar o componente com um sistema externo.' },
    { term: 'Cleanup', def: 'Função devolvida pelo efeito que desfaz o setup antes de nova execução e na desmontagem.' },
    { term: 'Dependências', def: 'Valores reativos lidos pelo efeito; quando mudam, o efeito é limpo e executado de novo.' },
    { term: 'Strict Mode', def: 'Modo de desenvolvimento que monta, desmonta e remonta componentes para testar a limpeza dos efeitos.' },
    { term: 'Closure desatualizada', def: 'Função que captura valores de uma renderização antiga e continua usando-os.' },
    { term: 'Corrida de requisições', def: 'Respostas que chegam fora de ordem e sobrescrevem o resultado mais recente.' },
    { term: 'AbortController', def: 'API que cancela requisições e outras operações assíncronas.' },
    { term: 'useSyncExternalStore', def: 'Hook para assinar fontes de dados externas de forma consistente com a renderização concorrente.' },
    { term: 'exhaustive-deps', def: 'Regra do linter que verifica se todas as dependências do efeito foram declaradas.' }
  ],
  examples: R`**Analogia:** o efeito é o **assinante de uma revista**: quando você muda de endereço (dependência), cancela a assinatura antiga (cleanup) e faz outra no endereço novo (setup). Se você esquece de cancelar, passa a receber duas revistas. O Strict Mode é o **treino de mudança**: simula uma mudança logo no início para provar que o cancelamento funciona.

**Resultados medidos (React 19.3, Testing Library):**
§§§
sem Strict Mode:    conecta 1 | desconecta 1 | conecta 2 | desconecta 2
Strict (montagem):  conecta 1 | desconecta 1 | conecta 1
closure velha:      1   (o contador parou em 1)
atualização funcional: >3
corrida de busca com flag "ignorar": resultado b
§§§

**Caso real:** uma tela de resultados de busca mostrava, de vez em quando, resultados da pesquisa anterior. O efeito não cancelava as respostas antigas. Com a flag §ignorar§ (e depois com uma biblioteca de dados que cancela e faz cache), o defeito "intermitente" sumiu. Outro bug: ouvintes de §resize§ acumulados por falta de cleanup só apareciam em desenvolvimento, graças ao Strict Mode.`,
  code: [
    { title: 'Sincronização, limpeza e Strict Mode (executado com React 19.3)', lang: 'tsx', code: R`function Rel({ id }: { id: number }) {
  useEffect(() => {
    log.push('conecta ' + id);
    return () => { log.push('desconecta ' + id); };   // cleanup
  }, [id]);
  return <p>{id}</p>;
}
// render <Rel id={1} />, depois id=2, depois id=2 de novo, depois desmontar:
//   conecta 1 | desconecta 1 | conecta 2 | desconecta 2
// com <StrictMode><Rel id={1} /></StrictMode> na montagem:
//   conecta 1 | desconecta 1 | conecta 1`, notes: [{ l: '4', t: 'O cleanup roda antes da próxima execução e ao desmontar.' }, { l: '5', t: 'A dependência id controla quando o efeito é refeito.' }, { l: '9', t: 'Strict Mode só em desenvolvimento: confirma que setup e cleanup são simétricos.' }] },
    { title: 'Closure velha x atualização funcional, e corrida de busca (executado)', lang: 'tsx', code: R`function Velho() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN(n + 1), 10);        // n sempre 0 aqui (closure velha)
    return () => clearInterval(t);
  }, []);
  return <p>{n}</p>;                                      // fica em 1
}
function Novo() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((x) => x + 1), 10);  // lê o valor mais recente
    return () => clearInterval(t);
  }, []);
  return <p>{n}</p>;                                      // continua contando
}

function Busca({ q }: { q: string }) {
  const [res, setRes] = useState('');
  useEffect(() => {
    let ignorar = false;
    buscar(q).then((r) => { if (!ignorar) setRes(r); });  // ignora respostas de buscas antigas
    return () => { ignorar = true; };
  }, [q]);
  return <p>{res}</p>;
}`, notes: [{ l: '4', t: 'Com [] o efeito vê só o snapshot inicial; o linter pediria n nas dependências.' }, { l: '12', t: 'A forma funcional dispensa a dependência.' }, { l: '23', t: 'O cleanup marca a resposta antiga como descartável; no teste, a busca "b" prevaleceu.' }] }
  ],
  bestPractices: ['Use efeitos só para sincronizar com sistemas externos; calcule o resto na renderização.', 'Sempre devolva um cleanup que desfaça o que o setup fez.', 'Declare todas as dependências e não suprima o linter.', 'Teste com Strict Mode ligado em desenvolvimento.', 'Trate corridas (flag de cancelamento ou §AbortController§) e prefira bibliotecas de dados para buscas.', 'Prefira manipuladores de evento a efeitos para ações do usuário.'],
  mistakes: ['Usar efeito para derivar estado de props.', 'Omitir dependências ou desligar o linter.', 'Esquecer o cleanup (ouvintes e temporizadores acumulados).', 'Efeito sem lista de dependências que atualiza estado (laço infinito).', 'Ignorar o duplo disparo do Strict Mode em vez de corrigir a limpeza.', 'Buscar dados sem tratar corridas e estados de erro e de carregamento.'],
  market: `§useEffect§ é o hook mais cobrado em entrevistas ("quando o efeito roda?", "por que dispara duas vezes?", "como evitar condição de corrida?") e a maior fonte de bugs e de problemas de desempenho em bases React. Equipes maduras limitam efeitos a sincronização com sistemas externos e delegam dados a bibliotecas.`,
  summary: `Efeitos sincronizam o componente com algo externo: setup, cleanup e dependências. Rodam na montagem e quando as dependências mudam; o cleanup roda antes da próxima execução e ao desmontar. O Strict Mode remonta uma vez em desenvolvimento para provar a limpeza. Evite closures velhas (atualização funcional), corridas (cancelar ou ignorar) e efeitos desnecessários (cálculo na renderização, eventos, §key§).`,
  refs: [REF3.sync, REF3.lifecycle, REF3.notEffect, REF3.useEffect],
  cards: [
    { q: 'Quando um useEffect com [id] roda de novo?', a: 'Quando id muda entre renderizações (comparação com Object.is); antes dele, o cleanup anterior roda.' },
    { q: 'Por que o efeito roda duas vezes em desenvolvimento?', a: 'O Strict Mode monta, desmonta e remonta para verificar se o cleanup desfaz o setup; não ocorre em produção.' },
    { q: 'Como evitar condição de corrida em buscas?', a: 'Cancelando a requisição (AbortController) ou ignorando respostas antigas por uma flag no cleanup.' },
    { q: 'Quando não usar efeito?', a: 'Para valores derivados de props/estado, reações a eventos do usuário e resets de estado (use cálculo, manipuladores e key).' }
  ]
},
{
  id: 'rea-08', moduleId: 'm3', order: 8, minutes: 60, tags: ['useRef', 'useMemo', 'useCallback', 'memo', 'desempenho'],
  title: 'useRef, useMemo e useCallback: referências, memoização e quando não usar',
  objectives: ['Usar §useRef§ para acessar o DOM e guardar valores que não disparam renderização', 'Explicar o que §useMemo§, §useCallback§ e §memo§ memoizam e quando a memoização ajuda', 'Medir o efeito de §memo§ com callbacks estáveis e instáveis e de §useMemo§ com dependências', 'Reconhecer o custo e os falsos ganhos da memoização prematura', 'Saber o que o React Compiler faz e como isso muda a prática'],
  intro: `Três ferramentas parecidas e confundidas: **§useRef§** (uma caixa que o React guarda e não observa), **§useMemo§** (guarda um **valor calculado**) e **§useCallback§** (guarda uma **função**). Com **§memo§** (para componentes), formam o kit de **otimização de renderização**. A regra mais importante desta aula é uma frase: **meça antes de memoizar**. Os números abaixo, de React 19.3, mostram quando cada peça faz diferença e quando é só ruído.`,
  theory: `### useRef: uma caixa que o React não observa
§const r = useRef(inicial)§ devolve um objeto **estável** §{ current }§ que **persiste entre renderizações**, e **alterar §r.current§ não causa nova renderização**. Dois usos:
1. **Acessar um nó do DOM**: §<input ref={r} />§ → depois da montagem, §r.current§ é o elemento: §r.current.focus()§, medir, rolar, tocar vídeo. No teste, um botão que chamava §r.current?.focus()§ deixou o foco no campo (§document.activeElement§ era o input);
2. **Guardar valores "de bastidor"** que **não** aparecem na tela: id de temporizador, valor anterior, contador de tentativas.
**Regras:** não leia nem escreva §r.current§ **durante a renderização** (exceto na inicialização preguiçosa); faça isso em **eventos** e **efeitos**. Para o que a tela mostra, use **estado**. Em React 19, §ref§ pode ser passada como **prop comum** a componentes de função (sem §forwardRef§).

### Memoização: o que é e para que serve
**Memoizar** é guardar um resultado e reutilizá-lo se as entradas não mudaram. Em React:
- **§useMemo(() => calcular(a, b), [a, b])§**: guarda um **valor** entre renderizações;
- **§useCallback(fn, deps)§**: guarda a **identidade de uma função** (equivale a §useMemo(() => fn, deps)§);
- **§memo(Componente)§**: pula a re-renderização do componente **se as props forem iguais** (comparação rasa com §Object.is§).
Memoizar **não** é "para a renderização ficar mais rápida" em geral; serve a **três** casos:
1. **Cálculo realmente caro** (milhares de itens, ordenações pesadas): §useMemo§;
2. **Passar valor/função estável a um componente §memo§** (senão a prop muda em todo render e o §memo§ não ajuda): §useCallback§/§useMemo§;
3. **Dependência de outro hook** (um objeto/função usado na lista de dependências de um efeito).

### Medindo o efeito (React 19.3)
Em um pai com um botão que incrementa um contador e três filhos:
- filho **sem §memo§**: **re-renderizou nos 2 cliques** (extras = 2), mesmo com a mesma prop;
- filho com **§memo§ + §useCallback§ estável**: **0** re-renderizações extras;
- filho com **§memo§, mas função nova a cada render**: **2** (o §memo§ foi inútil);
- §useMemo(() => soma, [xs])§ com §xs§ estável: calculou **1 vez** em 3 renderizações.
Moral: §memo§ só funciona se **todas as props** são estáveis; um único objeto/função novo anula o ganho.

### O custo da memoização
Memoizar tem custo: **memória**, **comparação** de dependências a cada render, **código mais difícil de ler** e **bugs** por dependências erradas (valor "preso"). Em muitos casos a renderização que você evita é **mais barata que a própria memoização**. O que fazer antes:
1. **Meça** (React DevTools Profiler, §console.time§, painel Performance);
2. **Reorganize**: mova o estado para **baixo** (para o componente que o usa) ou passe o conteúdo como §children§ (o React reutiliza elementos que não mudam);
3. **Reduza o trabalho**: listas virtualizadas, paginação, cálculo derivado simples;
4. Só então memoize onde o Profiler mostrou ganho.

### React Compiler
O **React Compiler** (ferramenta de build; o pacote §babel-plugin-react-compiler§ está na versão 1.0.0 no npm em 2026-11-18) **memoiza automaticamente** componentes e valores seguindo as regras do React, o que reduz a necessidade de escrever §useMemo§, §useCallback§ e §memo§ à mão. Ele **depende de componentes puros** e das regras dos hooks; código que as viola é pulado. Entender a memoização continua importante: para depurar, para código que o compilador não otimiza e para bibliotecas.

### Identidade de objetos e funções
Em JavaScript, §{} !== {}§ e §() => {} !== () => {}§: **criar um objeto/função no corpo do componente gera uma identidade nova em toda renderização**. Isso só importa quando essa identidade é **comparada**: props de componentes §memo§, dependências de efeitos e de §useMemo§/§useCallback§, valores de Context (aula 9). Constantes fixas podem ficar **fora do componente** (sem memoização).

### Armadilhas
- §useCallback§ sem §memo§ no filho (**sem efeito**);
- Dependências omitidas (valor/função "congelados");
- §useMemo§ para **garantir** semântica: o React pode descartar o cache; use-o só como otimização;
- ler ou escrever §ref.current§ no render;
- usar ref para dados que a tela exibe (não atualiza).`,
  concepts: [
    { term: 'useRef', def: 'Hook que devolve um objeto estável { current } cuja alteração não provoca nova renderização.' },
    { term: 'Ref de DOM', def: 'Ref ligada a um elemento (prop ref) cujo nó fica em current após a montagem.' },
    { term: 'Memoização', def: 'Guardar um resultado para reutilizá-lo enquanto as entradas não mudarem.' },
    { term: 'useMemo', def: 'Hook que guarda um valor calculado, recalculando só quando as dependências mudam.' },
    { term: 'useCallback', def: 'Hook que guarda a identidade de uma função entre renderizações.' },
    { term: 'memo', def: 'Função que faz um componente pular a re-renderização quando as props são iguais (comparação rasa).' },
    { term: 'Identidade (referência)', def: 'Endereço de um objeto ou função; dois objetos iguais em conteúdo têm identidades diferentes.' },
    { term: 'Profiler', def: 'Ferramenta do React DevTools que mede o tempo e a causa das renderizações.' },
    { term: 'React Compiler', def: 'Compilador que aplica memoização automática em componentes e hooks que seguem as regras do React.' }
  ],
  examples: R`**Analogia:** o §useRef§ é uma **gaveta**: o React a mantém no mesmo lugar, mas **não olha** o que você guarda nela (por isso mexer nela não redesenha nada). A memoização é um **caderno de respostas prontas**: ótimo para contas longas, inútil (e atrapalha) para "2 + 2". O §memo§ é um **porteiro** que só deixa o filho trabalhar de novo se algum documento (prop) for diferente; se você entrega **um papel novo toda vez**, ele não consegue reconhecer.

**Resultados medidos (React 19.3, dois cliques no botão do pai):**
§§§
foco no input depois do clique: true
filho SEM memo:                       2 re-renderizações extras
filho memo + callback estável:        0
filho memo + função nova a cada render: 2   (memo inútil)
useMemo com xs estável:               1 cálculo em 3 renderizações
§§§

**Caso real:** uma equipe envolveu 200 componentes com §memo§ e §useCallback§ "por desempenho". O Profiler mostrou que a lentidão vinha de uma lista de 5 mil linhas sem virtualização; a memoização não ajudou e aumentou o custo de manutenção. A correção foi virtualizar a lista; os §memo§ desnecessários foram removidos.`,
  code: [
    { title: 'useRef para foco e memo com callback estável x instável (executado com React 19.3)', lang: 'tsx', code: R`function Foco() {
  const r = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={r} aria-label="f" />
      <button onClick={() => r.current?.focus()}>foco</button>   {/* acessa o DOM em um evento */}
    </>
  );
}

const Com = memo(({ f }: { f: () => void }) => <i onClick={f} />);
function Pai() {
  const [n, setN] = useState(0);
  const estavel = useCallback(() => {}, []);   // mesma identidade em todas as renderizações
  const instavel = () => {};                    // nova identidade em toda renderização
  return (
    <>
      <button onClick={() => setN(n + 1)}>{n}</button>
      <Com f={estavel} />      {/* não re-renderiza ao clicar */}
      <Com f={instavel} />     {/* re-renderiza: a prop mudou */}
    </>
  );
}`, notes: [{ l: '6', t: 'O DOM só é lido em evento ou efeito, nunca durante a renderização.' }, { l: '10', t: 'memo compara as props de forma rasa.' }, { l: '13', t: 'useCallback preserva a identidade; sem memo no filho, não traria ganho.' }, { l: '19', t: 'Resultados medidos: estável 0, instável 2 re-renderizações em dois cliques.' }] },
    { title: 'useMemo para cálculo caro e a alternativa de mover o estado (padrão em TypeScript)', lang: 'tsx', code: R`function Tabela({ linhas }: { linhas: Linha[] }) {
  const [busca, setBusca] = useState('');
  // só recalcula quando linhas ou busca mudam
  const visiveis = useMemo(
    () => linhas.filter((l) => l.nome.toLowerCase().includes(busca.toLowerCase())).toSorted(porNome),
    [linhas, busca]
  );
  return (
    <>
      <input value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="busca" />
      <ul>{visiveis.map((l) => <li key={l.id}>{l.nome}</li>)}</ul>
    </>
  );
}
// Alternativa antes de memoizar: tirar o que muda de estado de dentro do componente pesado
// (ex.: o campo de busca em um componente irmão) ou passar o conteúdo pronto como children.`, notes: [{ l: '4', t: 'useMemo vale quando o cálculo é realmente caro; meça antes.' }, { l: '6', t: 'linhas precisa ter identidade estável no pai, senão o cache é invalidado a cada render.' }, { l: '16', t: 'Reorganizar componentes costuma render mais que memoizar.' }] }
  ],
  bestPractices: ['Meça antes de memoizar: use o Profiler e o painel Performance.', 'Tente reorganizar (estado mais perto de quem usa, §children§) antes de usar §memo§.', 'Use §useCallback§ e §useMemo§ para estabilizar valores passados a componentes §memo§ ou a dependências de hooks.', 'Declare todas as dependências e deixe o linter ajudar.', 'Leia e escreva §ref.current§ só em eventos e efeitos.', 'Avalie o React Compiler em vez de escrever memoização manual em toda parte.'],
  mistakes: ['Memoizar tudo "por via das dúvidas".', 'Usar §useCallback§ sem §memo§ no filho.', 'Passar objetos e arrays literais a componentes §memo§.', 'Mudar §ref.current§ esperando atualizar a tela.', 'Ler §ref.current§ durante a renderização.', 'Confiar no cache de §useMemo§ para garantir comportamento.'],
  market: `Desempenho de renderização é tema recorrente em entrevistas e revisões ("quando usar useMemo?", "por que o memo não funcionou?"). A resposta madura, "medir primeiro, reorganizar depois e memoizar por último", diferencia pessoas sêniores. O React Compiler muda a prática, mas o modelo mental de identidade e de dependências continua necessário.`,
  summary: `§useRef§ guarda uma caixa estável sem disparar renderização: usada para o DOM e valores de bastidor, acessada só em eventos e efeitos. Memoização (§useMemo§, §useCallback§, §memo§) guarda valores, funções e resultados de componentes, mas só ajuda com cálculos caros, props estáveis em componentes §memo§ ou dependências de hooks. Meça antes, reorganize componentes primeiro e conheça o React Compiler.`,
  refs: [REF3.refs, REF3.manipulatingDom, REF3.useMemo, REF3.useCallback, REF3.memo, REF3.compiler],
  cards: [
    { q: 'Mudar ref.current causa nova renderização?', a: 'Não; a ref é uma caixa que o React não observa.' },
    { q: 'Por que memo não funcionou com uma função criada no corpo do pai?', a: 'A função tem identidade nova a cada render, então a prop muda e a comparação rasa falha; é preciso estabilizá-la.' },
    { q: 'Quando useMemo vale a pena?', a: 'Em cálculos realmente caros, para estabilizar valores passados a componentes memo ou dependências de hooks.' },
    { q: 'O que fazer antes de memoizar?', a: 'Medir e reorganizar: mover o estado para perto de quem o usa e passar conteúdo pronto como children.' }
  ]
},
{
  id: 'rea-09', moduleId: 'm4', order: 9, minutes: 55, tags: ['context', 'prop drilling', 'provider', 'useContext', 're-renderização'],
  title: 'Context API: dados compartilhados sem prop drilling (e o seu custo)',
  objectives: ['Criar um contexto, fornecer um valor com Provider e consumir com §useContext§', 'Decidir quando usar Context, composição ou uma biblioteca de estado', 'Explicar por que mudar o valor do contexto re-renderiza todos os consumidores e como reduzir o impacto', 'Dividir contextos (estado e ações) e combinar com §useReducer§', 'Tipar o contexto em TypeScript sem valores padrão enganosos'],
  intro: `**Context** resolve um problema específico: passar um dado por **muitos níveis** de componentes (tema, idioma, usuário logado) sem repassá-lo manualmente em cada um (**prop drilling**). Funciona bem para **valores que mudam pouco** e são lidos em muitos lugares; usado como "estado global para tudo", causa **re-renderizações em cascata** e código difícil de seguir. Esta aula mostra o funcionamento e **mede o custo** em React 19.3.`,
  theory: `### Criar, fornecer e consumir
§§§tsx
const Tema = createContext<'claro' | 'escuro'>('claro');   // 1. criar (valor padrão)

function App() {
  const [t, setT] = useState<'claro' | 'escuro'>('claro');
  return <Tema value={t}>{/* 2. fornecer: qualquer descendente enxerga t */}
    <Pagina />
  </Tema>;
}

function Botao() {
  const t = useContext(Tema);                              // 3. consumir (em qualquer profundidade)
  return <button className={t}>OK</button>;
}
§§§
No **React 19**, o próprio contexto é o provedor (§<Tema value={...}>§); em versões anteriores usava-se §<Tema.Provider>§. O consumidor **mais próximo** acima na árvore fornece o valor; sem provedor, vale o **valor padrão** de §createContext§ (use §undefined§ e um hook que **lança erro** quando o provedor falta, para não esconder esquecimentos).

### Context não é gerenciamento de estado
Context apenas **transporta** um valor pela árvore. O **estado** continua sendo §useState§ ou §useReducer§ no provedor; Context o distribui. A combinação clássica: §useReducer§ + dois contextos (um para o **estado**, outro para o **dispatch**), padrão descrito na documentação ("Scaling up with Reducer and Context").

### O custo: quem re-renderiza
Quando o **valor** do provedor muda (comparação com §Object.is§), **todos os componentes que chamam §useContext§ daquele contexto** re-renderizam, **mesmo que usem só uma parte do valor** e **mesmo que estejam dentro de §memo§**. No teste:
- um consumidor dentro de §memo§, com **outro estado** do pai mudando: **0** re-renderizações (o §memo§ bloqueou, pois o valor do contexto não mudou);
- ao **mudar o valor** do contexto (tema): o consumidor re-renderizou **1 vez** e exibiu §escuro§;
- com o provedor recebendo um **objeto novo a cada renderização** (§value={{ a: 1 }}§), o consumidor re-renderizou **2 vezes em 2 cliques** do pai, **mesmo dentro de §memo§**, porque o valor mudava de identidade a cada render.
Por isso: **estabilize o valor** (§useMemo§ para objetos, funções com §useCallback§ ou §dispatch§ do reducer, que é estável) e **divida contextos** por frequência de mudança.

### Estratégias para reduzir re-renderizações
1. **Divida**: tema (muda raramente) separado de usuário e de dados voláteis;
2. **Separe estado e ações** em dois contextos: quem só dispara ações (§dispatch§ estável) **não** re-renderiza quando o estado muda;
3. **Estabilize o valor** com §useMemo§;
4. **Mantenha o estado perto** de quem o usa (não coloque tudo no topo);
5. Para estado **volátil e global** (carrinho, filtros, dados de servidor), prefira uma **biblioteca com assinaturas seletivas** (Zustand, Redux Toolkit, Jotai, TanStack Query), que re-renderiza só quem usa a fatia alterada (curso de Estado).

### Quando usar Context
**Bom para:** tema, idioma, usuário autenticado, configurações, injeção de dependências (cliente de API), **dados de um componente composto** (Tabs, Accordion). **Evite** para: estado que muda a cada tecla ou a cada poucos milissegundos, grandes listas de dados de servidor e "tudo que é compartilhado por conveniência".

### Alternativa: composição
Antes de Context, tente a composição: passar o elemento já pronto (§<Layout><Perfil usuario={u} /></Layout>§) em vez de passar §usuario§ por camadas. Reduz o drilling sem um contexto.

### TypeScript
Evite um valor padrão falso para satisfazer o tipo:
§§§tsx
const Ctx = createContext<Valor | undefined>(undefined);
export function useCtx() { const v = useContext(Ctx); if (!v) throw new Error('useCtx fora do provedor'); return v; }
§§§
O hook customizado dá ao consumidor um tipo **não opcional** e uma mensagem de erro clara (aula 10).`,
  concepts: [
    { term: 'Context', def: 'Mecanismo para fornecer um valor a toda uma subárvore sem passá-lo por props.' },
    { term: 'Provider', def: 'Componente que fornece o valor do contexto aos descendentes (em React 19, o próprio contexto).' },
    { term: 'useContext', def: 'Hook que lê o valor do contexto mais próximo acima na árvore.' },
    { term: 'Prop drilling', def: 'Repassar uma prop por vários níveis que não a usam.' },
    { term: 'Valor do contexto', def: 'Dado fornecido; quando sua identidade muda, todos os consumidores re-renderizam.' },
    { term: 'Contexto dividido', def: 'Uso de vários contextos (por exemplo, estado e dispatch) para limitar re-renderizações.' },
    { term: 'dispatch', def: 'Função do useReducer, de identidade estável, que envia ações ao reducer.' },
    { term: 'Biblioteca de estado', def: 'Solução externa (Zustand, Redux Toolkit etc.) com assinaturas seletivas para estado global.' }
  ],
  examples: R`**Analogia:** o Context é um **sistema de som do prédio**: o provedor fala em um microfone e **todos os andares** (consumidores) ouvem, sem que o recado passe de andar em andar. O custo: quando o locutor muda a mensagem, **todos** são interrompidos, mesmo quem só queria ouvir parte. Se ele troca o microfone a cada frase (objeto novo a cada render), todos são interrompidos o tempo todo.

**Resultados medidos (React 19.3, consumidor dentro de memo):**
§§§
outro estado do pai muda (valor do contexto igual):  consumidor re-renderiza 0 vez
valor do contexto muda (claro -> escuro):             1 vez, exibe "escuro"
value={{ a: 1 }} novo a cada render, 2 cliques:       2 re-renderizações (memo não protegeu)
§§§

**Caso real:** um aplicativo colocou carrinho, usuário, tema e filtros em **um único contexto** com um objeto novo a cada renderização. Digitar no campo de busca re-renderizava a tela inteira. Dividir em quatro contextos, estabilizar o valor com §useMemo§ e mover os filtros para o componente da lista reduziu as renderizações a uma fração, sem trocar de biblioteca.`,
  code: [
    { title: 'Contexto de tema: re-renderizações medidas (executado com React 19.3)', lang: 'tsx', code: R`const Tema = createContext('claro');

function Cons() {
  const t = useContext(Tema);
  return <b>{t}</b>;
}
const Ignora = memo(function Ignora() { return <Cons />; });   // memo bloqueia re-render por props

function App() {
  const [t, setT] = useState('claro');
  const [n, setN] = useState(0);
  return (
    <Tema value={t}>
      <button onClick={() => setT(t === 'claro' ? 'escuro' : 'claro')}>tema</button>
      <button onClick={() => setN(n + 1)}>n{n}</button>
      <Ignora />
    </Tema>
  );
}
// clicar em "n": Cons não re-renderiza (0). Clicar em "tema": Cons re-renderiza (1) e mostra "escuro".`, notes: [{ l: '2', t: 'O valor padrão vale apenas sem provedor acima.' }, { l: '7', t: 'memo evita re-render por props, mas não por mudança do contexto consumido.' }, { l: '13', t: 'No React 19, <Tema value=...> funciona como provedor.' }] },
    { title: 'Estado e ações em contextos separados com useReducer (padrão em TypeScript)', lang: 'tsx', code: R`type Tarefa = { id: string; titulo: string; feita: boolean };
type Acao = { tipo: 'adicionar'; titulo: string } | { tipo: 'alternar'; id: string };

function reducer(estado: Tarefa[], acao: Acao): Tarefa[] {
  switch (acao.tipo) {
    case 'adicionar': return [...estado, { id: crypto.randomUUID(), titulo: acao.titulo, feita: false }];
    case 'alternar': return estado.map((t) => (t.id === acao.id ? { ...t, feita: !t.feita } : t));
  }
}

const EstadoCtx = createContext<Tarefa[] | undefined>(undefined);
const DispatchCtx = createContext<React.Dispatch<Acao> | undefined>(undefined);

export function TarefasProvider({ children }: { children: React.ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, []);
  return (
    <DispatchCtx value={dispatch}>       {/* dispatch é estável: quem só dispara não re-renderiza */}
      <EstadoCtx value={estado}>{children}</EstadoCtx>
    </DispatchCtx>
  );
}
export function useTarefas() { const v = useContext(EstadoCtx); if (!v) throw new Error('fora do provedor'); return v; }
export function useDispatchTarefas() { const v = useContext(DispatchCtx); if (!v) throw new Error('fora do provedor'); return v; }`, notes: [{ l: '4', t: 'O reducer é uma função pura e fácil de testar.' }, { l: '17', t: 'dispatch tem identidade estável: consumidores só de ações não re-renderizam com o estado.' }, { l: '22', t: 'Hooks que lançam erro dão tipos precisos e mensagens claras.' }] }
  ],
  bestPractices: ['Use Context para valores de baixa frequência (tema, idioma, usuário, configuração).', 'Estabilize o valor do provedor (§useMemo§) e separe estado e ações.', 'Crie hooks (§useTema§, §useUsuario§) que lançam erro fora do provedor.', 'Prefira composição para evitar prop drilling curto.', 'Mantenha o estado o mais perto possível de quem o usa.', 'Para estado global volátil, avalie uma biblioteca com assinaturas seletivas.'],
  mistakes: ['Um único contexto gigante para todo o estado da aplicação.', 'Passar um objeto novo em §value§ a cada renderização.', 'Usar Context para estado que muda a cada tecla.', 'Valor padrão falso para "calar" o TypeScript.', 'Achar que §memo§ protege consumidores de contexto.', 'Esquecer o provedor e receber o valor padrão em silêncio.'],
  market: `Context aparece em praticamente todo código React (temas, autenticação, bibliotecas de componentes), e a pergunta "por que tudo re-renderiza?" costuma ter Context como resposta. Saber dividir contextos e decidir entre Context e uma biblioteca de estado é tema recorrente em entrevistas sênior.`,
  summary: `Context fornece um valor a uma subárvore sem prop drilling: §createContext§, provedor com §value§ e §useContext§. Não gerencia estado (use §useState§/§useReducer§ no provedor). Quando o valor muda, todos os consumidores re-renderizam, mesmo dentro de §memo§: estabilize o valor, divida contextos (estado e ações) e use Context só para dados de baixa frequência; prefira bibliotecas para estado global volátil.`,
  refs: [REF3.context, REF3.useContext, REF3.scaling],
  cards: [
    { q: 'O que re-renderiza quando o valor de um contexto muda?', a: 'Todos os componentes que consomem esse contexto com useContext, mesmo dentro de memo.' },
    { q: 'Por que separar estado e dispatch em dois contextos?', a: 'O dispatch é estável; consumidores que só disparam ações não re-renderizam quando o estado muda.' },
    { q: 'Context é uma biblioteca de gerenciamento de estado?', a: 'Não: só transporta valores; o estado continua em useState ou useReducer.' },
    { q: 'Como evitar um valor padrão enganoso no TypeScript?', a: 'Criar o contexto com undefined e um hook que lança erro quando o provedor está ausente.' }
  ]
}
];
