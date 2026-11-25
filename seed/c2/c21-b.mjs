// C2.1 — React essencial. Aulas 4 a 6 (estado, listas e renderização condicional, eventos e formulários).
const R = String.raw;

export const REF2 = {
  state: { title: 'React — State: A Component\'s Memory', url: 'https://react.dev/learn/state-a-components-memory', kind: 'doc' },
  snapshot: { title: 'React — State as a Snapshot', url: 'https://react.dev/learn/state-as-a-snapshot', kind: 'doc' },
  queue: { title: 'React — Queueing a Series of State Updates', url: 'https://react.dev/learn/queueing-a-series-of-state-updates', kind: 'doc' },
  updatingObjects: { title: 'React — Updating Objects in State', url: 'https://react.dev/learn/updating-objects-in-state', kind: 'doc' },
  sharing: { title: 'React — Sharing State Between Components', url: 'https://react.dev/learn/sharing-state-between-components', kind: 'doc' },
  conditional: { title: 'React — Conditional Rendering', url: 'https://react.dev/learn/conditional-rendering', kind: 'doc' },
  lists: { title: 'React — Rendering Lists', url: 'https://react.dev/learn/rendering-lists', kind: 'doc' },
  preserving: { title: 'React — Preserving and Resetting State', url: 'https://react.dev/learn/preserving-and-resetting-state', kind: 'doc' },
  events: { title: 'React — Responding to Events', url: 'https://react.dev/learn/responding-to-events', kind: 'doc' },
  input: { title: 'React DOM — <input> (controlado e não controlado)', url: 'https://react.dev/reference/react-dom/components/input', kind: 'doc' },
  form: { title: 'React DOM — <form>', url: 'https://react.dev/reference/react-dom/components/form', kind: 'doc' },
  mdnFormData: { title: 'MDN — FormData', url: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'rea-04', moduleId: 'm2', order: 4, minutes: 65, tags: ['useState', 'estado', 'snapshot', 'batching', 'elevação de estado'],
  title: 'Estado com useState: snapshots, atualização funcional e elevação de estado',
  objectives: ['Usar §useState§ e explicar que o estado é um snapshot da renderização', 'Escolher entre atualização direta e funcional (§setN(x => x + 1)§) e explicar o batching', 'Atualizar objetos e arrays de estado sem mutá-los', 'Decidir o que é estado e o que é valor derivado, e elevar o estado ao pai comum', 'Reconhecer estado duplicado, estado desnecessário e mutações que o React não percebe'],
  intro: `O **estado** é a memória de um componente entre renderizações. Todo mundo aprende §useState§ em cinco minutos e erra por meses: a maioria dos bugs de React vem de **não entender que o estado é um snapshot** e de **mutar** o que deveria ser substituído. Esta aula explica o modelo e mostra, com medições em React 19.3, por que §setN(n + 1)§ três vezes dá **1** e §setN(x => x + 1)§ três vezes dá **3**.`,
  theory: `### O que useState faz
§const [valor, setValor] = useState(inicial)§ devolve o valor atual do estado e uma **função de atualização**. Ao chamar §setValor§, o React **agenda uma nova renderização** do componente com o valor novo. O estado vive **no React** (associado à posição do componente na árvore), não em variáveis do componente: uma variável comum é recriada em cada chamada da função e perde o valor.
- O valor inicial é usado **só na primeira renderização**; para um valor caro de calcular, passe uma **função** (§useState(() => lerDoStorage())§, inicialização preguiçosa).
- Podem existir **vários** estados no mesmo componente (um §useState§ por informação independente).
- Hooks só podem ser chamados **no nível superior** do componente ou de outro hook (aula 10).

### O estado é um snapshot
Durante uma renderização, o valor do estado é **fixo**: o JSX e os manipuladores criados naquela renderização "enxergam" aquele valor, mesmo que você chame §setValor§ depois. Chamar §setN(n + 1)§ **não muda §n§ agora**: pede uma renderização futura em que §n§ será outro. No teste, um botão que fazia §setN(n + 1)§ **três vezes** em um clique terminou com **1** (as três chamadas usam o mesmo §n§ = 0); o botão que fazia §setN(x => x + 1)§ três vezes terminou com **3**.

### Atualização funcional e batching
- **Atualização funcional** (§setN(x => x + 1)§): o React passa o **valor mais recente da fila** para sua função. Use sempre que o novo valor **depende do anterior** (contadores, alternar booleanos, adicionar a listas).
- **Batching**: várias atualizações dentro do mesmo evento são **agrupadas** em **uma** renderização (no teste: 1 renderização por clique, apesar de três chamadas). No React 18 e 19, isso vale também para promises, temporizadores e eventos nativos.
- O React só re-renderiza se o novo valor for **diferente** (comparação com §Object.is§). Chamar §setN(0)§ quando já é 0 pode nem renderizar.

### Imutabilidade: nunca mute o estado
Objetos e arrays no estado são tratados como **somente leitura**: para mudar, crie uma **cópia** com a alteração.
| Operação | Em vez de (muta) | Use (cópia) |
|---|---|---|
| adicionar | §itens.push(x)§ | §[...itens, x]§ |
| remover | §itens.splice(i, 1)§ | §itens.filter((_, j) => j !== i)§ |
| alterar um item | §itens[i].feito = true§ | §itens.map((it, j) => j === i ? { ...it, feito: true } : it)§ |
| alterar objeto | §obj.nome = 'x'§ | §{ ...obj, nome: 'x' }§ |
| ordenar | §itens.sort()§ | §itens.toSorted()§ ou §[...itens].sort()§ |
No teste, um componente que **mutava** §o.n = 5§ e chamava §setO(o)§ (mesma referência) **não mudou** a tela (continuou §0§): o React compara referências e concluiu "nada mudou". Para objetos aninhados profundos, considere a biblioteca **Immer** (§useImmer§) ou reestruturar o estado.

### O que deve ser estado (e o que não deve)
Um valor **não** é estado se: (1) vem das **props**; (2) **não muda** com o tempo; (3) pode ser **calculado** de outros valores (derivado). Exemplo: não guarde §itens§ e §total§: guarde §itens§ e calcule §const total = itens.reduce(...)§ em cada render. **Duplicar** estado cria inconsistências. Também evite guardar em estado o **objeto selecionado** quando basta o **id**.

### Elevar o estado
Quando dois componentes precisam do **mesmo dado**, mova o estado para o **pai comum mais próximo** e passe-o por props, junto com a função de atualização. No exemplo, o campo de nome e a saudação irmã compartilham o estado do pai: ao digitar "Bia", o irmão exibiu "Olá, Bia". Também é possível **resetar** estado com §key§ (aula 5) e **preservar** estado quando o componente permanece na mesma posição.

### Reducers (prévia)
Para estados com **várias ações** relacionadas, §useReducer§ centraliza as transições em uma função pura (§(estado, ação) => novoEstado§), que também é fácil de testar (exercício da aula). É a base de bibliotecas como Redux.

### Armadilhas frequentes
- **Ler o estado logo após o set** esperando o valor novo;
- **Mutar** e depois chamar o set com a mesma referência;
- **Estado em excesso** e duplicado; **estado profundamente aninhado**;
- **Criar objetos novos todo render** passados a memoizações (aula 8);
- **Usar índice** para identificar itens que mudam de ordem (aula 5).`,
  concepts: [
    { term: 'Estado', def: 'Memória de um componente entre renderizações, guardada pelo React e atualizada por funções de set.' },
    { term: 'Snapshot', def: 'Valor fixo do estado durante uma renderização; atualizações só aparecem na renderização seguinte.' },
    { term: 'Atualização funcional', def: 'Chamar o set com uma função que recebe o valor mais recente e devolve o novo.' },
    { term: 'Batching', def: 'Agrupamento de várias atualizações de estado em uma única renderização.' },
    { term: 'Imutabilidade', def: 'Prática de nunca alterar o valor de estado, criando cópias com as mudanças.' },
    { term: 'Estado derivado', def: 'Valor que pode ser calculado de props ou outro estado e, por isso, não deve ser guardado.' },
    { term: 'Elevação de estado', def: 'Mover o estado para o pai comum para compartilhá-lo entre componentes irmãos.' },
    { term: 'Inicialização preguiçosa', def: 'Passar uma função ao useState para calcular o valor inicial só na primeira renderização.' },
    { term: 'useReducer', def: 'Hook que centraliza transições de estado em uma função pura (estado, ação) => novo estado.' }
  ],
  examples: R`**Analogia:** cada renderização é uma **fotografia** da tela com os valores daquele momento. Dizer "some 1" três vezes olhando a mesma fotografia (n = 0) leva sempre a 1. Dizer "some 1 ao resultado anterior" três vezes encadeia as correções e chega a 3. O estado mutado em silêncio é como **riscar a fotografia**: ninguém tirou outra, então a tela não muda.

**Resultados medidos (React 19.3, Vitest, jsdom):**
§§§
A (setN(n + 1) x3):        1
B (setN(x => x + 1) x3):   3
renderizações de A por clique: 1  (batching)
mutar o objeto e reaplicar a mesma referência: 0  (a tela não mudou)
irmão após digitar "Bia": Olá, Bia
§§§

**Caso real:** um carrinho guardava §itens§, §total§ e §quantidade§ em três estados. Ao remover um item, às vezes o total ficava desatualizado (alguém esquecia de atualizar um dos três). Mantendo só §itens§ e derivando total e quantidade em cada renderização, a classe inteira de bugs desapareceu.`,
  code: [
    { title: 'Snapshot, atualização funcional e mutação silenciosa (executado com React 19.3)', lang: 'tsx', code: R`function A() {
  const [n, setN] = useState(0);
  return <button onClick={() => { setN(n + 1); setN(n + 1); setN(n + 1); }}>{n}</button>;
}
function B() {
  const [n, setN] = useState(0);
  return <button onClick={() => { setN((x) => x + 1); setN((x) => x + 1); setN((x) => x + 1); }}>{n}</button>;
}
function C() {
  const [o, setO] = useState({ n: 0 });
  return <button onClick={() => { o.n = 5; setO(o); }}>{o.n}</button>;   // muta e reaplica a mesma referência
}
// Após um clique em cada um: A mostra 1, B mostra 3, C continua em 0`, notes: [{ l: '3', t: 'As três chamadas usam o mesmo n do snapshot (0): resultado 1.' }, { l: '7', t: 'Cada função recebe o valor mais recente da fila: resultado 3.' }, { l: '11', t: 'A mesma referência: o React não detecta mudança e não renderiza.' }] },
    { title: 'Atualizando listas sem mutar e derivando valores (padrão em TypeScript)', lang: 'tsx', code: R`type Tarefa = { id: number; titulo: string; feita: boolean };

function Lista() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const adicionar = (titulo: string) => setTarefas((ts) => [...ts, { id: Date.now(), titulo, feita: false }]);
  const alternar = (id: number) => setTarefas((ts) => ts.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)));
  const remover = (id: number) => setTarefas((ts) => ts.filter((t) => t.id !== id));

  const pendentes = tarefas.filter((t) => !t.feita).length;   // derivado: não é estado
  return <p>{pendentes} pendente(s) de {tarefas.length}</p>;
}`, notes: [{ l: '5', t: 'Spread cria uma nova lista; a função de atualização evita ler um snapshot velho.' }, { l: '6', t: 'map devolve um novo item só para o elemento alterado.' }, { l: '9', t: 'pendentes é calculado em cada render: nada para sincronizar.' }, { l: '5', t: 'Date.now() como id serve para o exemplo; prefira crypto.randomUUID() ou o id do servidor.' }] }
  ],
  bestPractices: ['Use a forma funcional do set quando o novo valor depende do anterior.', 'Nunca mute objetos e arrays do estado: crie cópias.', 'Guarde o mínimo de estado e derive o resto em cada renderização.', 'Eleve o estado ao pai comum quando irmãos precisarem do mesmo dado.', 'Use §useReducer§ quando as transições do estado crescerem.', 'Para valor inicial caro, passe uma função ao §useState§.'],
  mistakes: ['Esperar ler o valor novo logo depois de chamar o set.', 'Mutar o estado e chamar o set com a mesma referência.', 'Guardar o mesmo dado em dois estados.', 'Guardar o objeto selecionado em vez do id.', 'Chamar o set no corpo do componente (laço infinito de renderização).', 'Usar §Date.now()§ ou §Math.random()§ durante a renderização para gerar ids.'],
  market: `Estado é o assunto mais cobrado em entrevistas de React: "por que setCount(count + 1) duas vezes soma só um?", "como atualizar um item de uma lista?", "o que é estado derivado?". Bugs de estado (stale closure, mutação, duplicação) são a maior fonte de defeitos em interfaces React em produção.`,
  summary: `§useState§ guarda memória entre renderizações; o valor é um snapshot da renderização. Atualizações são agrupadas (batching) e a forma funcional usa o valor mais recente da fila. Estado é imutável: crie cópias em vez de mutar. Guarde o mínimo e derive o resto; eleve o estado ao pai comum quando necessário e use §useReducer§ para transições complexas.`,
  refs: [REF2.state, REF2.snapshot, REF2.queue, REF2.updatingObjects, REF2.sharing],
  cards: [
    { q: 'Por que setN(n + 1) três vezes resulta em 1?', a: 'Porque n é um snapshot fixo da renderização: as três chamadas usam o mesmo valor (por exemplo, 0).' },
    { q: 'Quando usar a atualização funcional?', a: 'Quando o novo valor depende do anterior (contadores, alternar booleanos, adicionar a listas).' },
    { q: 'Por que mutar o estado e chamar o set com a mesma referência não atualiza a tela?', a: 'O React compara referências com Object.is; a referência é a mesma, então concluiu que nada mudou.' },
    { q: 'O que é estado derivado?', a: 'Valor que pode ser calculado de props ou de outro estado; não deve ser guardado, mas calculado na renderização.' }
  ]
},
{
  id: 'rea-05', moduleId: 'm2', order: 5, minutes: 55, tags: ['listas', 'key', 'renderização condicional', 'identidade'],
  title: 'Listas, chaves e renderização condicional',
  objectives: ['Renderizar listas com §map§ e escolher chaves estáveis e únicas', 'Explicar como as chaves definem a identidade e o que acontece com o estado ao reordenar listas', 'Usar condicionais em JSX (§&&§, ternário, retorno antecipado) sem as armadilhas do §0§', 'Usar §key§ para resetar o estado de um componente', 'Filtrar e ordenar listas derivadas sem alterar o estado original'],
  intro: `Quase toda interface mostra **listas** e **escolhe o que exibir**. Duas peças pequenas, a **chave (§key§)** e a **renderização condicional**, causam bugs sutis: estado "trocado" entre itens, campos que perdem o texto digitado e zeros que aparecem na tela. Os resultados abaixo foram obtidos com React 19.3: o **mesmo código**, com chaves diferentes, produz comportamentos diferentes ao reordenar.`,
  theory: `### Renderizando listas
Use §map§ para transformar dados em elementos, e dê a cada um uma **chave**:
§§§tsx
<ul>{produtos.map((p) => <li key={p.id}>{p.nome}</li>)}</ul>
§§§
Sem chave, o React avisa no console de desenvolvimento: no teste, a mensagem foi *"Each child in a list should have a unique "key" prop."*. A chave é a **identidade** do item entre renderizações; **não** é uma prop acessível ao componente.

### Como escolher a chave
- **Única entre irmãos** (não precisa ser global) e **estável** (o mesmo item, a mesma chave, sempre);
- **ideal:** um **id dos dados** (do banco ou gerado quando o item é criado, §crypto.randomUUID()§);
- **evite o índice** quando a lista pode ser **reordenada, filtrada ou ter itens inseridos/removidos** (o índice identifica a **posição**, não o item);
- **nunca** gere a chave na renderização (§key={Math.random()}§): o item parece novo em todo render e o React **destrói e recria** o componente (perde estado e foco, e custa mais).
Índice como chave só é aceitável para listas **estáticas**, sem estado interno e que nunca mudam de ordem.

### O que a chave faz com o estado (medido)
O estado de um componente pertence à **posição na árvore** associada à **chave**. Teste: uma lista com dois campos de texto (A e B); digitamos "digitado" no primeiro (A) e **invertemos** a ordem para B, A:
- com **§key={índice}§**: o texto ficou no **primeiro campo**, que agora era o B: resultado §B=digitado A=§ (o estado seguiu a **posição**);
- com **§key={id}§**: o texto acompanhou o item: §B= A=digitado§.
O resultado errado do primeiro caso é um bug clássico: a edição "pula" de item ao reordenar.

### Resetar estado com key
Como mudar a chave **recria** o componente, §key§ serve para **resetar** o estado: §<Formulario key={usuarioId} />§ reinicia os campos quando o usuário muda, sem efeitos nem lógica de reset. É a solução recomendada pelo React para "limpar" um componente.

### Renderização condicional
Opções, da mais simples à mais explícita:
1. **Ternário**: §{logado ? <Painel /> : <Entrar />}§;
2. **§&&§**: §{temErro && <Erro />}§ (só quando o lado esquerdo é **booleano**!);
3. **Retorno antecipado**: §if (!usuario) return <Entrar />;§ no início do componente;
4. **Variável de JSX**: calcular o elemento antes do §return§ (útil quando há várias ramificações);
5. **Mapas** de componente: §const telas = { lista: <Lista />, detalhe: <Detalhe /> }; return telas[modo];§.
**Armadilha do zero:** §{0 && <span>x</span>}§ avalia para §0§ e o React **renderiza o "0"**. No teste, §{0 && ...}§ e §{[].length && ...}§ deixaram um "0" na saída, enquanto §{!!0 && ...}§ não mostrou nada. Converta para booleano (§!!n§, §n > 0§) ou use ternário (§n > 0 ? <X /> : null§).

### Alternar x desmontar
Renderizar condicionalmente **desmonta** o componente: o estado interno é **perdido**. Se for preciso **manter** o estado e só esconder, use CSS (§hidden§, §display: none§) ou eleve o estado. A mesma ideia vale ao trocar de tipo: mudar de §<A />§ para §<B />§ na mesma posição descarta o estado; manter o **mesmo tipo** na **mesma posição** o preserva.

### Filtrar, ordenar, paginar
Mantenha no estado os **critérios** (texto da busca, ordem), não a lista filtrada; calcule a lista visível em cada render:
§§§tsx
const visiveis = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())).toSorted(porNome);
§§§
Use §toSorted§ (ou copie) para **não mutar** o array original. Listas grandes (milhares) pedem **virtualização** (curso de performance).

### Acessibilidade em listas
Use as tags semânticas (§ul§/§li§, §table§) e atualize **foco** e **anúncios** quando itens são adicionados ou removidos (§aria-live§ para mensagens, foco no próximo item).`,
  concepts: [
    { term: 'key', def: 'Identificador estável e único entre irmãos que o React usa para associar itens entre renderizações.' },
    { term: 'Identidade de componente', def: 'Combinação de posição na árvore, tipo e chave que define qual instância e qual estado são preservados.' },
    { term: 'Renderização condicional', def: 'Exibir elementos diferentes conforme uma condição (ternário, &&, retorno antecipado).' },
    { term: 'Retorno antecipado', def: 'Instrução return no início do componente que devolve outro JSX para um caso especial.' },
    { term: 'Desmontar', def: 'Remover um componente da árvore, descartando seu estado.' },
    { term: 'Lista derivada', def: 'Lista calculada (filtrada ou ordenada) na renderização a partir do estado e dos critérios.' },
    { term: 'Virtualização', def: 'Técnica de renderizar só os itens visíveis de listas muito grandes.' },
    { term: 'aria-live', def: 'Atributo que faz leitores de tela anunciarem mudanças em uma região.' }
  ],
  examples: R`**Analogia:** a chave é o **crachá** de cada participante em uma fila. Se o crachá for a **posição na fila** (índice), quando duas pessoas trocam de lugar as pertences (o estado) ficam com a **posição**, não com a pessoa. Com um crachá com o **nome** (id), as pertences seguem a pessoa.

**Resultados medidos (React 19.3, Testing Library):**
§§§
aviso sem key:        Each child in a list should have a unique "key" prop.
key = índice, após inverter A,B -> B,A:  B=digitado A=
key = id,     após inverter A,B -> B,A:  B= A=digitado
{0 && <span/>}|{[].length && <span/>}|{!!0 && <span/>}  ->  <div>0|0|</div>
§§§

**Caso real:** uma tabela editável de itens de pedido usava o índice como chave. Ao ordenar por preço, o campo de quantidade que o usuário estava editando "trocava" de linha. Trocar para §key={item.id}§ resolveu; o QA tinha classificado o bug como "intermitente" porque só aparecia depois de ordenar.`,
  code: [
    { title: 'Chave por índice x por id ao reordenar (executado com React 19.3 e Testing Library)', lang: 'tsx', code: R`function Lista({ itens, porIndice }: { itens: string[]; porIndice: boolean }) {
  return (
    <ul>
      {itens.map((t, i) => (
        <li key={porIndice ? i : t}>
          <input defaultValue="" aria-label={t} />
        </li>
      ))}
    </ul>
  );
}
// 1) renderiza ['A', 'B'] e digita "digitado" no primeiro campo (A)
// 2) re-renderiza com ['B', 'A']
// porIndice = true  -> B=digitado A=      (o estado seguiu a posição)
// porIndice = false -> B= A=digitado      (o estado seguiu o item)`, notes: [{ l: '5', t: 'O índice identifica a posição; o id identifica o item.' }, { l: '6', t: 'defaultValue deixa o campo não controlado, guardando o texto no DOM, o que torna o efeito visível.' }, { l: '14', t: 'Resultados observados no teste.' }] },
    { title: 'Condicionais: a armadilha do zero e retorno antecipado (executado)', lang: 'tsx', code: R`import { renderToString } from 'react-dom/server';

console.log(renderToString(
  <div>{0 && <span>x</span>}|{[].length && <span>y</span>}|{!!0 && <span>z</span>}</div>
));
// <div>0|0|</div>  (os dois primeiros mostram o número 0)

function Perfil({ usuario }: { usuario: { nome: string } | null }) {
  if (!usuario) return <p>Entre para ver seu perfil.</p>;   // retorno antecipado
  return <h1>{usuario.nome}</h1>;
}
function Notificacoes({ qtd }: { qtd: number }) {
  return <>{qtd > 0 && <span className="selo">{qtd}</span>}</>;   // comparação booleana: sem zero perdido
}`, notes: [{ l: '4', t: '0 && ... avalia para 0, que o React renderiza.' }, { l: '9', t: 'Retornar cedo evita aninhar o JSX principal em um else.' }, { l: '13', t: 'qtd > 0 é booleano: nada é renderizado quando for falso.' }] }
  ],
  bestPractices: ['Use ids estáveis dos dados como chave; gere o id na criação do item.', 'Evite índice como chave quando a lista pode mudar de ordem ou tamanho.', 'Use §key§ para resetar o estado de um componente quando uma identidade muda.', 'Converta a condição para booleano antes do §&&§ ou use ternário.', 'Calcule listas filtradas e ordenadas na renderização e use §toSorted§ para não mutar.', 'Preserve o foco e anuncie mudanças em listas dinâmicas para tecnologias assistivas.'],
  mistakes: ['Esquecer a chave e ignorar o aviso do console.', 'Usar §Math.random()§ ou o índice como chave de listas dinâmicas.', 'Colocar §{n && <X />}§ com §n§ numérico.', 'Guardar a lista filtrada no estado.', 'Ordenar com §sort()§ sobre a lista do estado (mutação).', 'Desmontar um formulário e perder o estado digitado sem perceber.'],
  market: `Chaves e renderização condicional são perguntas clássicas de entrevista ("por que o React pede key?", "o que acontece se usar o índice?") e fonte frequente de bugs sutis em produção. Entender identidade de componentes é pré-requisito para otimizar desempenho e animar listas.`,
  summary: `Renderize listas com §map§ e uma chave única, estável e vinda dos dados; a chave define a identidade e, com ela, qual estado acompanha cada item. Índice como chave quebra o estado ao reordenar. §key§ também reseta componentes. Condicionais: ternário, §&&§ (com booleano!), retorno antecipado ou mapas de componentes; cuidado com o 0. Derive listas filtradas e ordenadas sem mutar o estado.`,
  refs: [REF2.lists, REF2.conditional, REF2.preserving, REF2.state],
  cards: [
    { q: 'Por que o índice é uma chave ruim em listas dinâmicas?', a: 'Identifica a posição, não o item; ao reordenar, o estado interno fica com a posição e "troca" de item.' },
    { q: 'Como resetar o estado de um componente?', a: 'Mudando sua key: o React desmonta o antigo e monta um novo.' },
    { q: 'Por que {0 && <X />} mostra um 0?', a: 'O && devolve o 0 (falso), e o React renderiza números, incluindo o zero.' },
    { q: 'Onde deve ficar a lista filtrada?', a: 'Calculada na renderização; no estado ficam só os critérios (busca, ordem).' }
  ]
},
{
  id: 'rea-06', moduleId: 'm2', order: 6, minutes: 60, tags: ['eventos', 'formulários', 'controlado', 'não controlado', 'FormData'],
  title: 'Eventos e formulários: componentes controlados e não controlados',
  objectives: ['Tratar eventos do React (SyntheticEvent) e usar §preventDefault§ e propagação corretamente', 'Escrever manipuladores com a assinatura certa e evitar chamar a função durante a renderização', 'Construir campos controlados (estado como fonte da verdade) e não controlados (o DOM guarda o valor)', 'Ler formulários com §FormData§ e decidir entre as duas abordagens', 'Reconhecer o aviso de §value§ sem §onChange§ e tratar vários campos com um único manipulador'],
  intro: `Formulários são o ponto onde o modelo declarativo do React encontra o DOM: um campo de texto **já guarda** seu valor no navegador. Quem é a **fonte da verdade**: o DOM ou o estado do React? Duas respostas, **componentes controlados** e **não controlados**, e a escolha afeta validação, máscaras, desempenho e testes. Esta aula também cobre a assinatura dos **eventos** e os erros típicos ao ligá-los. Os resultados vêm de testes com React 19.3 e Testing Library.`,
  theory: `### Eventos em React
Você anexa manipuladores com atributos em camelCase: §onClick§, §onChange§, §onSubmit§, §onKeyDown§. O valor deve ser uma **função**, não o resultado de chamá-la:
§§§tsx
<button onClick={salvar}>   {/* certo: passa a função */}
<button onClick={salvar()}> {/* errado: chama durante a renderização */}
<button onClick={() => remover(id)}> {/* certo: função que chama com argumento */}
§§§
O manipulador recebe um **evento sintético** (§SyntheticEvent§), com a mesma interface dos eventos do DOM (§target§, §currentTarget§, §preventDefault()§, §stopPropagation()§). Em React 17 ou superior, os eventos são anexados à **raiz** (§root§) da aplicação, e eventos como §onChange§ de campos de texto disparam a **cada tecla** (diferente do evento nativo §change§). A propagação e a delegação funcionam como no DOM (curso de Web Platform). Em formulários, §onSubmit§ + §e.preventDefault()§ impede o envio nativo (recarregar a página).

### Componentes controlados
O **valor** do campo vem do **estado**; cada alteração chama um manipulador que atualiza o estado:
§§§tsx
const [v, setV] = useState('');
<input value={v} onChange={(e) => setV(e.target.value)} />
§§§
Vantagens: o estado é a **única fonte da verdade**; é fácil **validar, formatar e transformar** em tempo real (no teste, um campo que converte para maiúsculas mostrou §ABC§ ao digitar "abc", e outro componente exibiu o tamanho §3§), **habilitar/desabilitar** botões conforme os valores e **reiniciar** o formulário. Custos: um re-render por tecla (aceitável na maioria dos casos). Regras: §value§ **exige** §onChange§ (ou §readOnly§); sem isso o React avisa (*"You provided a \`value\` prop to a form field without an \`onChange\` handler..."*, medido no teste) e o campo fica travado. §value§ nunca deve ser §undefined§ ou §null§ ao longo do tempo (o campo alterna entre não controlado e controlado): use §''§ como valor inicial. Para §checkbox§ use §checked§; para §select§, §value§ no próprio §<select>§.

### Componentes não controlados
O **DOM** guarda o valor; o React o lê quando precisa (com §ref§ ou na submissão). Use §defaultValue§ / §defaultChecked§ para o valor inicial:
§§§tsx
<form onSubmit={(e) => { e.preventDefault(); const dados = Object.fromEntries(new FormData(e.currentTarget)); }}>
  <input name="email" defaultValue="a@b.c" /><input type="checkbox" name="aceito" defaultChecked />
§§§
No teste, a leitura com §FormData§ devolveu §{"email":"a@b.c","aceito":"on"}§ (checkbox marcado vale "on", e desmarcado **não aparece**). Vantagens: **menos código**, menos renderizações, bom para formulários simples e para integrar com bibliotecas (como o React Hook Form, que usa campos não controlados por padrão). Limites: validação e transformação em tempo real exigem ler o DOM; resetar é §form.reset()§.

### Qual escolher?
| Necessidade | Escolha |
|---|---|
| Validar ou formatar a cada tecla, habilitar botão pelo conteúdo, campos dependentes | controlado |
| Formulário grande, validar no envio, poucos efeitos | não controlado (§FormData§, React Hook Form) |
| Arquivo (§type="file"§) | sempre não controlado |
| Campo que precisa de foco ou seleção programática | não controlado + §ref§ |

### Vários campos, um manipulador
Dê um §name§ a cada campo e use um objeto de estado com **nomes computados**:
§§§tsx
const [form, setForm] = useState({ nome: '', email: '' });
const mudar = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
§§§
Atualização **funcional** (§f => ...§) evita ler um snapshot antigo.

### Tipos de evento em TypeScript
§React.ChangeEvent<HTMLInputElement>§, §React.FormEvent<HTMLFormElement>§, §React.MouseEvent<HTMLButtonElement>§, §React.KeyboardEvent§. Para funções soltas, §React.ChangeEventHandler<HTMLInputElement>§.

### Acessibilidade mínima
Todo campo precisa de **rótulo** (§<label htmlFor>§ ou §aria-label§), tipos corretos (§type="email"§, §inputMode§, §autoComplete§), botões do tipo certo (§type="button"§ para não enviar o formulário sem querer) e **mensagens de erro associadas** (aula 11).`,
  concepts: [
    { term: 'SyntheticEvent', def: 'Evento do React que envolve o evento nativo e expõe a mesma interface em todos os navegadores.' },
    { term: 'Componente controlado', def: 'Campo cujo valor vem do estado do React e muda por onChange.' },
    { term: 'Componente não controlado', def: 'Campo cujo valor é guardado pelo DOM e lido por ref ou FormData.' },
    { term: 'defaultValue', def: 'Valor inicial de um campo não controlado.' },
    { term: 'FormData', def: 'API que lê os campos nomeados de um formulário como pares nome/valor.' },
    { term: 'preventDefault', def: 'Método que cancela o comportamento padrão do navegador, como enviar o formulário.' },
    { term: 'Nome computado', def: 'Sintaxe [chave]: valor que permite usar uma variável como nome da propriedade.' },
    { term: 'Fonte da verdade', def: 'Local único em que um dado é guardado; os demais apenas o refletem.' }
  ],
  examples: R`**Analogia:** campo **controlado** é um **ditado com ata**: cada palavra que alguém diz é escrita imediatamente na ata (estado) e lida de volta ao falante. O **não controlado** é um **caderno do próprio aluno**: ninguém olha enquanto escreve, e o professor só **recolhe** o caderno no fim (envio).

**Resultados medidos (React 19.3, Testing Library):**
§§§
controlado (transforma em maiúsculas): ABC  tamanho 3
FormData: {"email":"a@b.c","aceito":"on"}
aviso: You provided a §value§ prop to a form field without an §onChange§ handler...
§§§

**Caso real:** um cadastro com 30 campos usava campos controlados e, em aparelhos modestos, cada tecla re-renderizava a tela inteira. Migrado para campos não controlados lidos com §FormData§ no envio e validação por campo no §onBlur§, a digitação ficou fluida; os poucos campos que precisavam de máscara (CPF, telefone) continuaram controlados.`,
  code: [
    { title: 'Campo controlado e formulário não controlado (executado com React 19.3)', lang: 'tsx', code: R`function Controlado() {
  const [v, setV] = useState('');
  return (
    <>
      <input aria-label="c" value={v} onChange={(e) => setV(e.target.value.toUpperCase())} />
      <output>{v.length}</output>
    </>
  );
}

function NaoControlado() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const dados = Object.fromEntries(new FormData(e.currentTarget));
        console.log(JSON.stringify(dados));          // {"email":"a@b.c","aceito":"on"}
      }}
    >
      <input name="email" defaultValue="a@b.c" />
      <input type="checkbox" name="aceito" defaultChecked />
      <button>Enviar</button>
    </form>
  );
}`, notes: [{ l: '5', t: 'O valor exibido é o do estado, transformado a cada tecla.' }, { l: '16', t: 'FormData lê os campos pelo atributo name; checkbox desmarcado não aparece.' }, { l: '19', t: 'defaultValue define só o valor inicial; depois o DOM guarda o texto.' }] },
    { title: 'Vários campos controlados com um manipulador (padrão em TypeScript)', lang: 'tsx', code: R`function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '' });

  const mudar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));   // nome computado + atualização funcional
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); salvar(form); }}>
      <label>Nome <input name="nome" value={form.nome} onChange={mudar} /></label>
      <label>E-mail <input name="email" type="email" value={form.email} onChange={mudar} /></label>
      <button type="submit" disabled={!form.nome || !form.email}>Salvar</button>
    </form>
  );
}`, notes: [{ l: '6', t: 'Um único manipulador atende todos os campos pelo atributo name.' }, { l: '11', t: 'Os rótulos envolvem o campo, associando-os para tecnologias assistivas.' }, { l: '13', t: 'O botão depende do estado: vantagem típica do campo controlado.' }] }
  ],
  bestPractices: ['Passe funções aos eventos (§onClick={fn}§), nunca o resultado de chamá-las.', 'Use campos controlados quando precisar validar ou transformar em tempo real.', 'Use §FormData§ e campos não controlados para formulários grandes ou simples.', 'Sempre associe um rótulo e use o §type§ e o §autoComplete§ adequados.', 'Chame §preventDefault()§ em §onSubmit§ e valide também no servidor.', 'Use um manipulador com §name§ e atualização funcional para vários campos.'],
  mistakes: ['Escrever §onClick={salvar()}§ e disparar a função na renderização.', 'Usar §value§ sem §onChange§ (campo travado e aviso).', 'Alternar §value§ entre §undefined§ e string.', 'Esquecer o §type="button"§ em botões que não enviam.', 'Esperar que checkbox desmarcado apareça no §FormData§.', 'Controlar todos os campos de um formulário enorme sem necessidade.'],
  market: `Formulários estão em praticamente todo produto web, e a escolha controlado versus não controlado aparece em revisões e em bibliotecas (React Hook Form, Formik, TanStack Form). Entender o modelo evita bugs de campos travados e problemas de desempenho, e é pré-prova de como o React 19 traz ações de formulário (aula 11).`,
  summary: `Eventos recebem funções e um SyntheticEvent; §onChange§ dispara a cada tecla e §preventDefault§ evita o envio nativo. Campos controlados guardam o valor no estado (validação e formatação em tempo real; exigem §onChange§); os não controlados deixam o DOM guardá-lo e são lidos com §FormData§ ou §ref§ (§defaultValue§ define o inicial). Escolha pelo caso de uso; use rótulos, tipos e botões corretos.`,
  refs: [REF2.events, REF2.input, REF2.form, REF2.mdnFormData],
  cards: [
    { q: 'Qual a diferença entre campo controlado e não controlado?', a: 'No controlado o estado do React é a fonte da verdade (value + onChange); no não controlado o DOM guarda o valor, lido por ref ou FormData.' },
    { q: 'Por que onClick={salvar()} é um erro?', a: 'Chama a função durante a renderização; deve-se passar a função (onClick={salvar}) ou uma seta.' },
    { q: 'O que o FormData devolve para um checkbox marcado?', a: 'O valor do campo (por padrão "on"); se estiver desmarcado, o campo não aparece.' },
    { q: 'Por que o React avisa sobre value sem onChange?', a: 'O campo ficaria travado: o valor vem do estado e nada o atualiza.' }
  ]
}
];
