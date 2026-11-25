// C2.1 — React essencial: exercícios das aulas 7 a 11, prova final e projeto integrador.
const R = String.raw;

export const exsetsB = {
'rea-07': [
  { id: 'rea-07-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Você quer exibir §nomeCompleto§ a partir das props §nome§ e §sobrenome§. Qual é a abordagem recomendada?', options: ['Estado §nomeCompleto§ atualizado por um §useEffect§', 'Calcular na renderização: §const nomeCompleto = nome + " " + sobrenome§', 'Guardar em uma ref', 'Usar §useLayoutEffect§'], answer: 1, explanation: 'Valores derivados de props ou estado são calculados na renderização. Estado + efeito causa uma renderização extra e risco de inconsistência.' },
  { id: 'rea-07-e2', type: 'bug', difficulty: 2, points: 10, prompt: 'Depois que o componente desmonta, o ouvinte continua rodando e acumulam-se ouvintes a cada montagem. Clique na linha que falta corrigir (o que está faltando é a limpeza).', code: 'useEffect(() => {\n  const aoRedimensionar = () => setLargura(window.innerWidth);\n  window.addEventListener("resize", aoRedimensionar);\n}, []);', answer: 3, explanation: 'O efeito registra um ouvinte e **não devolve cleanup**. Acrescente §return () => window.removeEventListener("resize", aoRedimensionar);§ depois do §addEventListener§.' },
  { id: 'rea-07-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Um efeito com dependências §[id]§ é montado com §id=1§, re-renderizado com §id=2§, re-renderizado de novo com §id=2§ e, por fim, desmontado. **Sem** Strict Mode.', code: 'useEffect(() => {\n  log("conecta " + id);\n  return () => log("desconecta " + id);\n}, [id]);', lang: 'tsx', steps: [{ q: 'Quantas linhas "conecta" aparecem no total?', answers: ['2'] }, { q: 'Qual é a última linha do log?', answers: ['desconecta 2'] }], explanation: 'Montagem: conecta 1; id muda: desconecta 1, conecta 2; id igual: nada; desmonta: desconecta 2. Total de "conecta": 2.' },
  { id: 'rea-07-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'O efeito rodar duas vezes na montagem em desenvolvimento (Strict Mode) indica um defeito do React, que deve ser desligado.', answer: false, explanation: 'É intencional: o Strict Mode monta, desmonta e remonta para provar que o cleanup desfaz o setup. Se algo quebra, falta limpeza no efeito. Não ocorre em produção.' },
  { id: 'rea-07-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Uma tela de busca mostra às vezes os resultados da pesquisa anterior. Explique a causa provável e duas formas de corrigir.', model: 'É uma condição de corrida: o usuário digita "a" (resposta lenta) e depois "b" (resposta rápida); a resposta de "a" chega por último e sobrescreve o resultado de "b". Correções: (1) no efeito, usar uma flag de cancelamento no cleanup (let ignorar = false; ... if (!ignorar) setRes(r); return () => { ignorar = true; }), de modo que respostas de buscas antigas sejam descartadas; (2) cancelar a requisição com AbortController no cleanup; (3) usar uma biblioteca de dados (TanStack Query, SWR) que trata cache, cancelamento e estados de carregamento; (4) debounce na entrada para reduzir as requisições.', rubric: ['Identifica respostas fora de ordem que sobrescrevem o estado', 'Propõe cancelamento ou ignorar resultados antigos no cleanup', 'Cita AbortController ou biblioteca de dados', 'Relaciona a solução ao ciclo de vida do efeito'], explanation: 'O cleanup do efeito é o ponto natural para invalidar o trabalho assíncrono da renderização anterior.' },
  { id: 'rea-07-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o ciclo de vida do efeito. Implemente §cicloDeEfeitos(depsPorRender, opcoes)§, que devolve a lista (strings) de eventos. §depsPorRender§ tem, para cada renderização, a lista de dependências (ou §undefined§ = sem lista: roda a cada renderização). Formato dos eventos: §"setup:" + JSON.stringify(deps)§ e §"cleanup:" + JSON.stringify(deps)§ (o cleanup usa as dependências do setup que ele desfaz). Regras: na **primeira** renderização ocorre §setup§; com §opcoes.strict§ (padrão §false§) ocorre §setup§, §cleanup§, §setup§ (mesmas dependências); nas seguintes, se as dependências **mudaram** (tamanhos diferentes ou algum valor diferente por §Object.is§; §undefined§ sempre conta como mudança), ocorre §cleanup§ das anteriores e §setup§ das novas, senão nada; ao final, se §opcoes.desmontar§ (padrão §true§), ocorre o §cleanup§ do último setup. Lista vazia devolve §[]§ (nada foi montado).', lang: 'javascript', starter: 'function cicloDeEfeitos(depsPorRender, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Guarde as dependências do último setup em uma variável.', 'JSON.stringify(undefined) devolve undefined: use String(...) para formar "setup:undefined".'], tests: [{ name: 'sem Strict Mode', code: R`assert.deepEqual(cicloDeEfeitos([[1], [1], [2]]), ['setup:[1]', 'cleanup:[1]', 'setup:[2]', 'cleanup:[2]']);
assert.deepEqual(cicloDeEfeitos([[1], [1], [2]], { desmontar: false }), ['setup:[1]', 'cleanup:[1]', 'setup:[2]']);` }, { name: 'Strict Mode na montagem', code: R`assert.deepEqual(cicloDeEfeitos([[1]], { strict: true, desmontar: false }), ['setup:[1]', 'cleanup:[1]', 'setup:[1]']);
assert.deepEqual(cicloDeEfeitos([[1], [2]], { strict: true }), ['setup:[1]', 'cleanup:[1]', 'setup:[1]', 'cleanup:[1]', 'setup:[2]', 'cleanup:[2]']);` }, { name: 'vazio, sem lista e Object.is', code: R`assert.deepEqual(cicloDeEfeitos([[], [], []]), ['setup:[]', 'cleanup:[]']);
assert.deepEqual(cicloDeEfeitos([undefined, undefined]), ['setup:undefined', 'cleanup:undefined', 'setup:undefined', 'cleanup:undefined']);
assert.deepEqual(cicloDeEfeitos([[NaN], [NaN]]), ['setup:[null]', 'cleanup:[null]']);
assert.deepEqual(cicloDeEfeitos([[1], [1, 2]], { desmontar: false }), ['setup:[1]', 'cleanup:[1]', 'setup:[1,2]']);
assert.deepEqual(cicloDeEfeitos([]), []);` }], solution: R`function cicloDeEfeitos(depsPorRender, opcoes = {}) {
  const { strict = false, desmontar = true } = opcoes;
  const f = (d) => String(JSON.stringify(d));
  const mudou = (a, b) => a === undefined || b === undefined || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));
  const log = [];
  let atual, montado = false;
  depsPorRender.forEach((deps, i) => {
    if (i === 0) {
      log.push('setup:' + f(deps));
      if (strict) { log.push('cleanup:' + f(deps)); log.push('setup:' + f(deps)); }
      montado = true;
    } else if (mudou(atual, deps)) {
      log.push('cleanup:' + f(atual)); log.push('setup:' + f(deps));
    }
    atual = deps;
  });
  if (montado && desmontar) log.push('cleanup:' + f(atual));
  return log;
}
`, explanation: 'O modelo mostra por que dependências corretas importam: o efeito só é refeito quando algo muda, o cleanup sempre precede o próximo setup e o Strict Mode apenas insere um ciclo extra na montagem para provar que os dois são simétricos.' },
  { id: 'rea-07-e7', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarBuscaSegura(buscar)§: devolve uma função §consultar(q)§ que chama §buscar(q)§ (que devolve uma promise) e resolve com o resultado **somente se for a chamada mais recente**; chamadas antigas resolvem com §undefined§ (sem erro). Se a chamada **mais recente** rejeitar, a promise devolvida rejeita com o mesmo erro; rejeições de chamadas antigas são descartadas (resolvem com §undefined§). É o equivalente da flag §ignorar§ do efeito.', lang: 'javascript', starter: 'function criarBuscaSegura(buscar) {\n  // seu código aqui\n}\n', hints: ['Mantenha um contador da última chamada e compare com o identificador de cada chamada.', 'Trate sucesso e erro com os dois argumentos de then.'], tests: [{ name: 'só a última resposta vale', code: R`const atrasos = { a: 30, b: 5 };
const buscar = (q) => new Promise((r) => setTimeout(() => r('res ' + q), atrasos[q]));
const consultar = criarBuscaSegura(buscar);
const [ra, rb] = await Promise.all([consultar('a'), consultar('b')]);
assert.equal(ra, undefined); assert.equal(rb, 'res b');` }, { name: 'chamadas sequenciais funcionam', code: R`const consultar = criarBuscaSegura(async (q) => q.toUpperCase());
assert.equal(await consultar('x'), 'X'); assert.equal(await consultar('y'), 'Y');` }, { name: 'erros', code: R`const buscar = (q) => new Promise((_, rej) => setTimeout(() => rej(new Error('falhou ' + q)), q === 'velha' ? 5 : 20));
const consultar = criarBuscaSegura(buscar);
const p1 = consultar('velha'); const p2 = consultar('nova');
assert.equal(await p1, undefined);
await assert.rejects(p2, 'falhou nova');` }], solution: R`function criarBuscaSegura(buscar) {
  let ultimo = 0;
  return function consultar(q) {
    const id = ++ultimo;
    return Promise.resolve(buscar(q)).then(
      (r) => (id === ultimo ? r : undefined),
      (e) => { if (id === ultimo) throw e; return undefined; }
    );
  };
}
`, explanation: 'O identificador da chamada faz o papel da variável §ignorar§ capturada pelo efeito: respostas de buscas antigas são descartadas. Em produção, cancelar a requisição (§AbortController§) também economiza rede.' }
],
'rea-08': [
  { id: 'rea-08-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Para que serve o §useRef§ ligado a um §<input>§?', options: ['Guardar o valor digitado para exibir na tela', 'Acessar o elemento do DOM (por exemplo, para chamar §focus()§) sem causar nova renderização', 'Memoizar o componente', 'Substituir o §useState§'], answer: 1, explanation: 'A ref guarda o nó do DOM em §ref.current§ depois da montagem; mudar o §current§ não renderiza. Para valores exibidos na tela use estado.' },
  { id: 'rea-08-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Envolver uma função com §useCallback§ já impede o filho de re-renderizar, mesmo que o filho não use §memo§.', answer: false, explanation: 'O filho re-renderiza sempre que o pai re-renderiza, a menos que esteja envolvido em §memo§ (ou o compilador faça isso). O §useCallback§ só estabiliza a identidade da função.' },
  { id: 'rea-08-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'O filho está em §memo§, mas re-renderiza a cada clique no pai. Clique na linha que anula o §memo§.', code: 'const Filho = memo(({ aoSalvar }: { aoSalvar: () => void }) => <i onClick={aoSalvar} />);\n\nfunction Pai() {\n  const [n, setN] = useState(0);\n  const aoSalvar = () => console.log("salvo");\n  return <><button onClick={() => setN(n + 1)}>{n}</button><Filho aoSalvar={aoSalvar} /></>;\n}', answer: 5, explanation: '§aoSalvar§ é recriada em **toda renderização do pai** (identidade nova), então a prop muda e o §memo§ não ajuda. Estabilize com §useCallback§ (ou mova a função para fora do componente).' },
  { id: 'rea-08-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a ferramenta ao que ela guarda ou faz.', pairs: [['useRef', 'Uma caixa estável que não dispara renderização'], ['useMemo', 'Um valor calculado'], ['useCallback', 'A identidade de uma função'], ['memo', 'Pula a re-renderização de um componente com props iguais']], explanation: 'Memoização só faz sentido combinando as peças certas (por exemplo, §memo§ no filho + §useCallback§ no pai).' },
  { id: 'rea-08-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Um colega quer envolver todos os componentes em §memo§ e todas as funções em §useCallback§ "por desempenho". Como você responderia e que processo recomendaria?', model: 'Memoizar tudo tem custo (memória, comparações a cada render, código mais difícil de ler e bugs por dependências erradas) e muitas vezes a renderização evitada é mais barata que a memoização. Recomendo medir primeiro com o Profiler do React DevTools para achar o que realmente é lento; tentar reorganizar (mover o estado para perto de quem o usa, passar conteúdo pronto como children, virtualizar listas grandes); e só então memoizar os pontos comprovados (cálculos caros, props estáveis em componentes memo, dependências de hooks). Também considerar o React Compiler, que memoiza automaticamente seguindo as regras do React.', rubric: ['Cita o custo e a complexidade da memoização generalizada', 'Recomenda medir com o Profiler antes de otimizar', 'Propõe reorganizar componentes ou virtualizar antes de memoizar', 'Cita o React Compiler ou casos em que a memoização realmente ajuda'], explanation: 'O princípio é otimizar com evidência e começar pelas soluções estruturais, mais baratas e robustas.' },
  { id: 'rea-08-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o §memo§. Implemente §iguaisRasos(a, b)§ (comparação rasa: ambos objetos não nulos, mesmas chaves em mesmo número e valores iguais por §Object.is§; §Object.is(a, b)§ também vale como igual) e §criarMemoRaso(fn)§, que devolve uma função §memoizada(props)§ que **só chama §fn(props)§ quando as props mudam** (comparação rasa com a última chamada) e reutiliza o último resultado. A função devolvida tem a propriedade §chamadas§ (quantas vezes §fn§ rodou).', lang: 'javascript', starter: 'function iguaisRasos(a, b) {\n  // seu código aqui\n}\n\nfunction criarMemoRaso(fn) {\n  // seu código aqui\n}\n', hints: ['Compare Object.keys de cada objeto e use Object.is nos valores.', 'Guarde as últimas props e o último resultado em variáveis do closure.'], tests: [{ name: 'iguaisRasos', code: R`assert.equal(iguaisRasos({ a: 1, b: 'x' }, { a: 1, b: 'x' }), true);
assert.equal(iguaisRasos({ a: 1 }, { a: 2 }), false);
assert.equal(iguaisRasos({ a: 1 }, { a: 1, b: 2 }), false);
const f = () => {}; assert.equal(iguaisRasos({ f }, { f }), true); assert.equal(iguaisRasos({ f }, { f: () => {} }), false);
assert.equal(iguaisRasos({ o: {} }, { o: {} }), false);
assert.equal(iguaisRasos(NaN, NaN), true); assert.equal(iguaisRasos(null, {}), false);` }, { name: 'só recalcula quando as props mudam', code: R`const c = criarMemoRaso((p) => 'olá ' + p.nome);
assert.equal(c({ nome: 'Ana' }), 'olá Ana'); assert.equal(c({ nome: 'Ana' }), 'olá Ana');
assert.equal(c.chamadas, 1);
assert.equal(c({ nome: 'Bia' }), 'olá Bia'); assert.equal(c.chamadas, 2);
const f1 = () => 1; const g = criarMemoRaso((p) => p.f()); g({ f: f1 }); g({ f: f1 }); g({ f: () => 1 });
assert.equal(g.chamadas, 2);` }], solution: R`function iguaisRasos(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && Object.is(a[k], b[k]));
}

function criarMemoRaso(fn) {
  let ultimasProps, ultimoResultado, tem = false;
  function memoizada(props) {
    if (tem && iguaisRasos(props, ultimasProps)) return ultimoResultado;
    memoizada.chamadas++;
    ultimoResultado = fn(props); ultimasProps = props; tem = true;
    return ultimoResultado;
  }
  memoizada.chamadas = 0;
  return memoizada;
}
`, explanation: 'É o que o §memo§ faz: comparação rasa das props com a renderização anterior. Mostra por que objetos, arrays e funções criados no corpo do pai anulam o ganho: a identidade muda mesmo que o conteúdo seja igual.' }
],
'rea-09': [
  { id: 'rea-09-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual problema o Context resolve melhor?', options: ['Estado que muda a cada tecla em muitos componentes', 'Passar um dado de baixa frequência (tema, usuário) por muitos níveis sem prop drilling', 'Buscar dados do servidor', 'Substituir o §useState§'], answer: 1, explanation: 'Context transporta valores pela árvore; funciona melhor para dados que mudam pouco. Estado volátil e global pede uma biblioteca com assinaturas seletivas.' },
  { id: 'rea-09-e2', type: 'tf', difficulty: 2, points: 5, prompt: 'Um consumidor de contexto envolvido em §memo§ não re-renderiza quando o valor do contexto muda.', answer: false, explanation: '§memo§ evita re-renderizações por **props**. Quando o valor do contexto muda, todos os que o consomem com §useContext§ re-renderizam.' },
  { id: 'rea-09-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'Todos os consumidores re-renderizam a cada digitação no pai, mesmo sem mudar o tema. Clique na linha responsável.', code: 'function App() {\n  const [texto, setTexto] = useState("");\n  const [tema] = useState("claro");\n  return (\n    <Ctx value={{ tema }}>\n      <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      <Pagina />\n    </Ctx>\n  );\n}', answer: 5, explanation: '§{ tema }§ é um objeto **novo a cada renderização**: o valor do contexto muda de identidade e todos os consumidores re-renderizam. Estabilize com §useMemo§ ou passe o valor primitivo.' },
  { id: 'rea-09-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a técnica ao objetivo.', pairs: [['Separar estado e dispatch em dois contextos', 'Quem só dispara ações não re-renderiza com o estado'], ['useMemo no value do provedor', 'Estabilizar a identidade do valor'], ['Composição com children', 'Evitar prop drilling curto sem Context'], ['Hook que lança erro fora do provedor', 'Tipos precisos e falha clara']], explanation: 'Boas práticas de Context combinam divisão, estabilidade de identidade, composição e hooks de acesso.' },
  { id: 'rea-09-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Uma aplicação coloca usuário, tema, carrinho e filtros em um único Context, e digitar na busca re-renderiza a tela inteira. Proponha um plano de correção em passos.', model: '1) Medir com o Profiler e confirmar que a causa é a mudança do valor do contexto. 2) Dividir o contexto por frequência de mudança (tema e usuário separados de carrinho e filtros) e separar estado de dispatch. 3) Estabilizar os valores dos provedores com useMemo e usar dispatch estável. 4) Mover o estado dos filtros para o componente da lista (mais perto de quem usa), tirando-o do contexto global. 5) Se o estado do carrinho e outros dados continuarem voláteis e globais, avaliar uma biblioteca com assinaturas seletivas (Zustand, Redux Toolkit, Jotai) ou uma biblioteca de dados de servidor. 6) Medir de novo e documentar.', rubric: ['Propõe medir antes de mudar', 'Divide contextos e separa estado e dispatch', 'Estabiliza valores e aproxima o estado de quem usa', 'Cita biblioteca de estado com assinaturas seletivas quando necessário'], explanation: 'O plano combina medição, divisão e estabilidade; a biblioteca é a última etapa, não a primeira.' },
  { id: 'rea-09-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o mecanismo de assinatura que ferramentas como o §useSyncExternalStore§ usam. Implemente §criarStore(inicial)§, que devolve §{ get, set, update, subscribe }§. §get()§ devolve o valor atual. §set(novo)§ substitui o valor e **notifica** os assinantes chamando §ouvinte(novo, antigo)§ **somente se §!Object.is(novo, antigo)§**. §update(fn)§ faz §set(fn(get()))§. §subscribe(ouvinte)§ registra o ouvinte e devolve uma função que o remove (chamar duas vezes não causa erro). Ouvintes são chamados na ordem de assinatura; um ouvinte removido durante a notificação **não** deve ser chamado depois de removido.', lang: 'javascript', starter: 'function criarStore(inicial) {\n  // seu código aqui\n}\n', hints: ['Guarde os ouvintes em um Set e itere sobre uma cópia.', 'Antes de chamar cada ouvinte da cópia, confirme que ele ainda está no Set.'], tests: [{ name: 'valor, notificação e igualdade', code: R`const s = criarStore(0); const log = [];
s.subscribe((n, a) => log.push(a + '->' + n));
s.set(1); s.set(1); s.update((x) => x + 1);
assert.equal(s.get(), 2); assert.deepEqual(log, ['0->1', '1->2']);` }, { name: 'objetos novos sempre notificam', code: R`const s = criarStore({ a: 1 }); let n = 0; s.subscribe(() => n++);
s.set({ a: 1 }); s.set({ a: 1 }); assert.equal(n, 2);
const o = s.get(); s.set(o); assert.equal(n, 2);` }, { name: 'cancelar assinatura', code: R`const s = criarStore('x'); const a = []; const b = [];
const un1 = s.subscribe((n) => a.push(n)); s.subscribe((n) => b.push(n));
s.set('y'); un1(); un1(); s.set('z');
assert.deepEqual(a, ['y']); assert.deepEqual(b, ['y', 'z']);` }, { name: 'remover durante a notificação', code: R`const s = criarStore(0); const log = []; let un2;
s.subscribe(() => { log.push('1'); un2(); });
un2 = s.subscribe(() => log.push('2'));
s.set(1); s.set(2);
assert.deepEqual(log, ['1', '1']);` }], solution: R`function criarStore(inicial) {
  let valor = inicial;
  const ouvintes = new Set();
  const store = {
    get: () => valor,
    set(novo) {
      const antigo = valor;
      if (Object.is(novo, antigo)) return;
      valor = novo;
      for (const o of [...ouvintes]) if (ouvintes.has(o)) o(novo, antigo);
    },
    update(fn) { store.set(fn(valor)); },
    subscribe(ouvinte) {
      ouvintes.add(ouvinte);
      return () => { ouvintes.delete(ouvinte); };
    }
  };
  return store;
}
`, explanation: 'Este é o coração de bibliotecas de estado e do Context: quem assina recebe a notificação só quando o valor muda por identidade. Notificar apenas os interessados (assinaturas seletivas) é o que evita as renderizações em cascata do Context.' }
],
'rea-10': [
  { id: 'rea-10-e1', type: 'bug', difficulty: 2, points: 10, prompt: 'O React lança um erro quando §logado§ muda entre renderizações. Clique na linha que viola as regras dos hooks.', code: 'function Painel({ logado }: { logado: boolean }) {\n  const [aba, setAba] = useState("resumo");\n  if (logado) {\n    const [notificacoes, setNotificacoes] = useState([]);\n  }\n  return <p>{aba}</p>;\n}', answer: 4, explanation: 'Hooks não podem ser chamados dentro de condicionais, laços ou funções aninhadas: a ordem das chamadas muda entre renderizações. Chame o hook sempre e use a condição **depois** (ou separe em outro componente).' },
  { id: 'rea-10-e2', type: 'mc', difficulty: 1, points: 10, prompt: 'Dois componentes chamam §useLocalStorage("tema")§. O que eles compartilham?', options: ['O mesmo estado, em tempo real', 'A lógica; cada chamada tem estado próprio', 'Nada, pois hooks não podem ser reutilizados', 'Apenas o valor inicial'], answer: 1, explanation: 'Hooks customizados compartilham **lógica**, não estado. Para estado compartilhado ao vivo, use Context ou uma biblioteca.' },
  { id: 'rea-10-e3', type: 'tf', difficulty: 1, points: 5, prompt: 'O nome de um hook customizado deve começar com §use§ para que o linter e o React reconheçam as regras dos hooks.', answer: true, explanation: 'A convenção §use§ permite que o plugin de ESLint verifique as regras nessas funções.' },
  { id: 'rea-10-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o §useDebounce§: o efeito deve cancelar o temporizador anterior ao refazer.', code: 'useEffect(() => {\n  const t = setTimeout(() => setD(valor), ms);\n  return () => [[0]](t);\n}, [valor, [[1]]]);', answers: [['clearTimeout'], ['ms']], explanation: 'O cleanup cancela o temporizador anterior (é isso que faz o debounce) e §ms§ também é uma dependência, pois o efeito o lê.' },
  { id: 'rea-10-e5', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §criarDebounce(fn, ms)§: devolve uma função que **adia** a chamada de §fn§ por §ms§ milissegundos **após a última** invocação, chamando §fn§ com os **argumentos da última** invocação. A função devolvida tem o método §cancel()§, que descarta uma chamada pendente. Use §setTimeout§.', lang: 'javascript', starter: 'function criarDebounce(fn, ms) {\n  // seu código aqui\n}\n', hints: ['Guarde o identificador do temporizador e limpe-o a cada invocação.', 'cancel() limpa o temporizador e esquece os argumentos.'], tests: [{ name: 'só a última chamada vale', code: R`const calls = []; const d = criarDebounce((x) => calls.push(x), 30);
d('a'); d('b'); d('c');
assert.deepEqual(calls, []);
await new Promise((r) => setTimeout(r, 80));
assert.deepEqual(calls, ['c']);` }, { name: 'novas chamadas reiniciam a contagem', code: R`const calls = []; const d = criarDebounce((x) => calls.push(x), 40);
d(1); await new Promise((r) => setTimeout(r, 20)); d(2); await new Promise((r) => setTimeout(r, 20));
assert.deepEqual(calls, []);
await new Promise((r) => setTimeout(r, 60));
assert.deepEqual(calls, [2]);` }, { name: 'cancel', code: R`const calls = []; const d = criarDebounce(() => calls.push(1), 20);
d(); d.cancel(); await new Promise((r) => setTimeout(r, 60));
assert.deepEqual(calls, []);
d(); await new Promise((r) => setTimeout(r, 60));
assert.deepEqual(calls, [1]);` }], solution: R`function criarDebounce(fn, ms) {
  let t = null;
  function debounced(...args) {
    clearTimeout(t);
    t = setTimeout(() => { t = null; fn(...args); }, ms);
  }
  debounced.cancel = () => { clearTimeout(t); t = null; };
  return debounced;
}
`, explanation: 'Este é o mesmo mecanismo do §useDebounce§: cancelar o temporizador anterior a cada novo evento e só agir depois de um intervalo de silêncio.' },
  { id: 'rea-10-e6', type: 'code', difficulty: 2, points: 20, prompt: 'Implemente §criarArmazenamento(storage)§, a lógica do §useLocalStorage§ com o armazenamento **injetado** (qualquer objeto com §getItem§ e §setItem§). Devolva §{ ler(chave, inicial), gravar(chave, valor) }§. §ler§ devolve o valor decodificado com §JSON.parse§; devolve §inicial§ se a chave não existir (§null§), se o JSON for inválido ou se §getItem§ lançar exceção. §gravar§ grava §JSON.stringify(valor)§ e devolve §true§; se §setItem§ lançar exceção (cota excedida, modo privado), devolve §false§ sem propagar o erro.', lang: 'javascript', starter: 'function criarArmazenamento(storage) {\n  // seu código aqui\n}\n', hints: ['Envolva getItem/JSON.parse e setItem em try/catch.', 'Verifique null explicitamente (um valor gravado pode ser 0 ou false).'], tests: [{ name: 'ler e gravar', code: R`const mem = {}; const storage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = v; } };
const a = criarArmazenamento(storage);
assert.equal(a.ler('tema', 'claro'), 'claro');
assert.equal(a.gravar('tema', 'escuro'), true); assert.equal(mem.tema, '"escuro"');
assert.equal(a.ler('tema', 'claro'), 'escuro');
a.gravar('n', 0); a.gravar('ok', false);
assert.equal(a.ler('n', 9), 0); assert.equal(a.ler('ok', true), false);
assert.deepEqual(a.ler('x', { a: 1 }), { a: 1 });` }, { name: 'JSON inválido e erros do storage', code: R`const quebrado = criarArmazenamento({ getItem: () => '{ruim', setItem: () => {} });
assert.equal(quebrado.ler('k', 'padrão'), 'padrão');
const bloqueado = criarArmazenamento({ getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('cota'); } });
assert.equal(bloqueado.ler('k', 'padrão'), 'padrão');
assert.equal(bloqueado.gravar('k', 1), false);` }], solution: R`function criarArmazenamento(storage) {
  return {
    ler(chave, inicial) {
      try {
        const bruto = storage.getItem(chave);
        return bruto === null || bruto === undefined ? inicial : JSON.parse(bruto);
      } catch {
        return inicial;
      }
    },
    gravar(chave, valor) {
      try { storage.setItem(chave, JSON.stringify(valor)); return true; } catch { return false; }
    }
  };
}
`, explanation: 'Injetar o armazenamento torna a lógica testável sem navegador e permite simular cota excedida e modo privado. Em um hook, §ler§ vai na inicialização preguiçosa do estado e §gravar§ no efeito.' }
],
'rea-11': [
  { id: 'rea-11-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Por que a validação precisa existir também no servidor?', options: ['Porque o navegador não consegue validar', 'Porque o cliente pode ser contornado e só o servidor protege o sistema', 'Porque o React não suporta validação', 'Para deixar o formulário mais bonito'], answer: 1, explanation: 'Qualquer pessoa pode enviar dados arbitrários direto à API. A validação no cliente melhora a experiência; a do servidor garante a segurança.' },
  { id: 'rea-11-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o atributo ou hook ao papel em formulários acessíveis.', pairs: [['aria-invalid', 'Marca o campo como inválido'], ['aria-describedby', 'Liga o campo à mensagem de erro'], ['role="alert"', 'Faz o leitor de tela anunciar a mensagem'], ['useId', 'Gera ids estáveis para ligar rótulo, campo e mensagem']], explanation: 'Juntos, esses itens fazem a validação ser percebida por pessoas que usam leitores de tela e teclado.' },
  { id: 'rea-11-e3', type: 'bug', difficulty: 2, points: 10, prompt: 'A mensagem de erro aparece em vermelho, mas leitores de tela não a associam ao campo. Clique na linha que falta ligar ao campo.', code: 'function CampoEmail({ erro }: { erro?: string }) {\n  return (\n    <>\n      <label htmlFor="email">E-mail</label>\n      <input id="email" name="email" />\n      {erro && <p style={{ color: "red" }}>{erro}</p>}\n    </>\n  );\n}', answer: 5, explanation: 'O campo não tem §aria-invalid§ nem §aria-describedby§ apontando para a mensagem (que também deveria ter um id e §role="alert"§). Só a cor não comunica o erro.' },
  { id: 'rea-11-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'Com §useActionState§, o formulário só funciona se o JavaScript do navegador estiver carregado; o React 19 não permite ações de formulário que funcionem antes disso.', answer: false, explanation: 'Em frameworks com renderização no servidor (como o Next.js), ações do servidor podem funcionar como formulário nativo antes da hidratação (melhoria progressiva). Em uma SPA pura, depende do JavaScript.' },
  { id: 'rea-11-e5', type: 'open', difficulty: 2, points: 10, prompt: 'Descreva o fluxo completo de um formulário de cadastro bem projetado, do navegador ao servidor, citando validação, acessibilidade, estado de envio e o que fazer em caso de erro.', model: 'O formulário tem rótulos associados, tipos e autoComplete adequados. No envio, os dados (FormData) são validados com um esquema (campos, tipos e mensagens por campo); se houver erros, eles aparecem junto aos campos com aria-invalid, aria-describedby e role="alert", e o foco vai para o primeiro campo inválido. Se válido, a ação (useActionState) envia ao servidor e o botão fica desabilitado enquanto está pendente, evitando duplicidade (com chave de idempotência quando cabível). O servidor repete a validação com o mesmo esquema, aplica regras de negócio e devolve erros por campo ou sucesso, sem vazar detalhes sensíveis; o cliente mostra a mensagem de sucesso ou os erros e mantém os dados digitados.', rubric: ['Valida com esquema e mostra erros por campo', 'Garante acessibilidade (rótulos, aria, foco)', 'Controla estado de envio e evita duplicidade', 'Valida também no servidor e trata a resposta'], explanation: 'Um bom formulário é uma conversa clara entre cliente e servidor, com o mesmo contrato dos dois lados.' },
  { id: 'rea-11-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §validarCadastro(dados)§, o equivalente do esquema Zod da aula. §dados§ tem §nome§, §email§ e §idade§ (todos podem vir como texto). Regras: **nome**: texto aparado com **pelo menos 2** caracteres, senão §"Informe ao menos 2 letras"§; **email**: padrão §algo@algo.algo§ sem espaços (use §/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/§), senão §"E-mail inválido"§; **idade**: converter com §Number§; texto vazio, não inteiro ou §NaN§ → §"Informe uma idade válida"§; menor que 18 → §"Maior de 18 anos"§. Se tudo estiver certo devolva §{ ok: true, dados: { nome, email, idade } }§ (nome aparado, idade numérica, e-mail aparado). Senão §{ ok: false, erros }§ com **uma mensagem por campo** (a primeira falha do campo), chaves na ordem nome, email, idade.', lang: 'javascript', starter: 'function validarCadastro(dados) {\n  // seu código aqui\n}\n', hints: ['Valide cada campo separadamente e junte os erros em um objeto.', 'Trate undefined e null como texto vazio.'], tests: [{ name: 'dados válidos são convertidos', code: R`assert.deepEqual(validarCadastro({ nome: ' Ana ', email: 'a@b.co ', idade: '20' }), { ok: true, dados: { nome: 'Ana', email: 'a@b.co', idade: 20 } });
assert.deepEqual(validarCadastro({ nome: 'Bia', email: 'b@c.de', idade: 18 }), { ok: true, dados: { nome: 'Bia', email: 'b@c.de', idade: 18 } });` }, { name: 'erros por campo', code: R`assert.deepEqual(validarCadastro({ nome: 'A', email: 'x', idade: '7' }), { ok: false, erros: { nome: 'Informe ao menos 2 letras', email: 'E-mail inválido', idade: 'Maior de 18 anos' } });
assert.deepEqual(validarCadastro({ nome: 'Ana', email: 'a@b.co', idade: '' }), { ok: false, erros: { idade: 'Informe uma idade válida' } });` }, { name: 'idade inválida e campos ausentes', code: R`assert.deepEqual(validarCadastro({ nome: 'Ana', email: 'a@b.co', idade: '20.5' }).erros, { idade: 'Informe uma idade válida' });
assert.deepEqual(validarCadastro({ nome: 'Ana', email: 'a@b.co', idade: 'abc' }).erros, { idade: 'Informe uma idade válida' });
assert.deepEqual(validarCadastro({}), { ok: false, erros: { nome: 'Informe ao menos 2 letras', email: 'E-mail inválido', idade: 'Informe uma idade válida' } });` }], solution: R`function validarCadastro(dados) {
  const t = (v) => (v === undefined || v === null ? '' : String(v)).trim();
  const nome = t(dados.nome), email = t(dados.email), idadeTxt = t(dados.idade);
  const erros = {};
  if (nome.length < 2) erros.nome = 'Informe ao menos 2 letras';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = 'E-mail inválido';
  const idade = Number(idadeTxt);
  if (idadeTxt === '' || !Number.isInteger(idade)) erros.idade = 'Informe uma idade válida';
  else if (idade < 18) erros.idade = 'Maior de 18 anos';
  if (Object.keys(erros).length) return { ok: false, erros };
  return { ok: true, dados: { nome, email, idade } };
}
`, explanation: 'Bibliotecas como o Zod fazem isto de forma declarativa e geram os tipos. Entender as etapas (aparar, converter, validar, uma mensagem por campo) mostra o que o esquema faz e por que o mesmo código deve rodar no servidor.' }
]
};

const P = 'react-essencial-p';
export const assessment = {
  id: 'react-essencial', title: 'Avaliação final — React essencial', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Em React, o que acontece quando o estado de um componente muda?', options: ['O desenvolvedor precisa atualizar o DOM manualmente', 'O React chama o componente de novo, compara a descrição nova com a anterior e atualiza só o necessário no DOM', 'A página inteira é recarregada', 'Nada, até o usuário recarregar'], answer: 1, explanation: 'UI = f(estado): o React renderiza de novo e reconcilia com o DOM, aplicando apenas as diferenças.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Texto de usuário colocado entre chaves no JSX é escapado pelo React, o que protege contra XSS; o risco aparece com §dangerouslySetInnerHTML§ e URLs não validadas.', answer: true, explanation: 'O escape é a defesa padrão; HTML bruto e URLs como §javascript:§ desligam essa proteção.' },
    { id: P + '3', type: 'trace', difficulty: 2, points: 10, prompt: 'Um botão com §n = 0§ é clicado uma vez.', code: 'const [n, setN] = useState(0);\n<button onClick={() => {\n  setN(x => x + 1);\n  setN(x => x + 1);\n  setN(x => x + 1);\n}}>{n}</button>', lang: 'tsx', steps: [{ q: 'Valor exibido após o clique:', answers: ['3'] }, { q: 'Com setN(n + 1) três vezes, o valor seria:', answers: ['1'] }], explanation: 'A forma funcional encadeia as atualizações sobre o valor mais recente (3); com §n + 1§ as três usam o mesmo snapshot (resultado 1).' },
    { id: P + '4', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual chave é adequada para uma lista de tarefas que pode ser reordenada e filtrada?', options: ['O índice no array', '§Math.random()§', 'O id estável da tarefa', 'Todas as anteriores funcionam igualmente'], answer: 2, explanation: 'O id estável preserva a identidade (e o estado) de cada item ao reordenar; índice e valor aleatório quebram a identidade.' },
    { id: P + '5', type: 'bug', difficulty: 2, points: 10, prompt: 'A busca às vezes exibe resultados antigos. Clique na linha que deixa de tratar a condição de corrida.', code: 'useEffect(() => {\n  buscar(q).then((r) => setResultado(r));\n}, [q]);', answer: 2, explanation: 'Respostas antigas podem chegar depois das novas e sobrescrevê-las. Use uma flag de cancelamento no cleanup (ou §AbortController§) para ignorar respostas obsoletas.' },
    { id: P + '6', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o hook de debounce.', code: 'useEffect(() => {\n  const t = setTimeout(() => setD(valor), ms);\n  return () => [[0]](t);\n}, [valor, ms]);', answers: [['clearTimeout']], explanation: 'O cleanup cancela o temporizador anterior, de modo que só o último valor chega ao estado após o intervalo.' },
    { id: P + '7', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é o efeito de colocar §value={{ tema }}§ (objeto novo a cada render) em um provedor de Context?', options: ['Nenhum', 'Todos os consumidores re-renderizam a cada renderização do provedor, mesmo dentro de §memo§', 'O Context deixa de funcionar', 'Apenas o primeiro consumidor re-renderiza'], answer: 1, explanation: 'O valor muda de identidade em toda renderização, e todos os consumidores são notificados. Estabilize com §useMemo§.' },
    { id: P + '8', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a situação à ferramenta mais adequada.', pairs: [['Focar um campo ao clicar em um botão', 'useRef'], ['Evitar recalcular uma ordenação cara', 'useMemo'], ['Estabilizar uma função passada a um filho memo', 'useCallback'], ['Compartilhar o tema pela árvore', 'Context']], explanation: 'Cada ferramenta resolve um problema específico; usar a errada gera complexidade sem ganho.' },
    { id: P + '9', type: 'tf', difficulty: 2, points: 10, prompt: 'Dois componentes que usam o mesmo hook customizado compartilham o mesmo estado.', answer: false, explanation: 'Hooks compartilham lógica; cada chamada cria estado próprio. Para estado compartilhado use Context ou uma biblioteca.' },
    { id: P + '10', type: 'trace', difficulty: 2, points: 10, prompt: 'Considere um efeito com dependências vazias e Strict Mode, em desenvolvimento.', code: 'useEffect(() => {\n  log("conecta");\n  return () => log("desconecta");\n}, []);\n// montagem em <StrictMode>', lang: 'tsx', steps: [{ q: 'Quantas linhas "conecta" aparecem na montagem?', answers: ['2'] }, { q: 'Quantas linhas "desconecta" aparecem na montagem?', answers: ['1'] }], explanation: 'O Strict Mode monta, desmonta e remonta: conecta, desconecta, conecta. Isso só ocorre em desenvolvimento.' },
    { id: P + '11', type: 'open', difficulty: 2, points: 10, prompt: 'Explique a diferença entre campos controlados e não controlados e dê um critério para escolher entre eles.', model: 'No campo controlado, o valor vem do estado do React (value + onChange): o estado é a fonte da verdade, o que facilita validar e formatar a cada tecla, habilitar botões e reiniciar o formulário, ao custo de uma renderização por tecla. No não controlado, o DOM guarda o valor (defaultValue) e o React o lê quando necessário (ref ou FormData no envio): menos código e menos renderizações, bom para formulários grandes ou simples e para campos de arquivo. Critério: use controlado quando precisar reagir ao valor enquanto o usuário digita (máscaras, validação em tempo real, campos dependentes) e não controlado quando bastar ler os dados no envio.', rubric: ['Define o controlado (estado como fonte da verdade)', 'Define o não controlado (DOM guarda o valor, lido por ref ou FormData)', 'Cita vantagens e custos de cada um', 'Dá um critério prático de escolha'], explanation: 'A escolha depende de quem deve ser a fonte da verdade e de quando o valor é necessário.' },
    { id: P + '12', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual prática torna a mensagem de erro de um campo perceptível por leitores de tela?', options: ['Pintá-la de vermelho', 'Ligá-la ao campo com §aria-describedby§, marcar §aria-invalid§ e usar §role="alert"§', 'Mostrar só um ícone', 'Exibi-la por 1 segundo e escondê-la'], answer: 1, explanation: 'A cor não é perceptível para todos; os atributos ARIA associam e anunciam a mensagem.' }
  ]
};

export const project = {
  id: 'quadro-tarefas-acessivel', name: 'Quadro de tarefas (kanban) acessível', lv: 'M', stack: 'React 19, TypeScript, Vite, Context + useReducer, Vitest e Testing Library', ds: ['react'],
  desc: 'Construa um **quadro de tarefas estilo kanban** (colunas "A fazer", "Fazendo" e "Feito") com React, TypeScript e Vite. O estado das tarefas vive em um **reducer** exposto por **Context** (estado e ações separados) e **persiste no navegador** com um **hook customizado** (§useLocalStorage§ com tratamento de erros). O formulário de nova tarefa é **validado por esquema**, **acessível** e usa uma **ação de formulário**. O quadro deve funcionar **só com o teclado**, anunciar mudanças a leitores de tela e ter **testes** que cobrem o reducer, o hook e os fluxos principais.',
  rf: ['Projeto criado com Vite (modelo react-ts), TypeScript em modo estrito e ESLint com as regras dos hooks', 'Três colunas com tarefas; é possível criar, editar o título, mover entre colunas e excluir tarefas', 'Estado em §useReducer§ com ações tipadas (reducer puro e testado), exposto por dois contextos (estado e dispatch) e hooks §useTarefas§ e §useDispatchTarefas§ que lançam erro fora do provedor', 'Persistência no §localStorage§ por um hook customizado que trata JSON inválido e falha de acesso, com valor padrão', 'Lista renderizada com chaves por id estável; nenhum estado derivado guardado (contagens por coluna calculadas)', 'Formulário de nova tarefa com validação por esquema (título de 3 a 80 caracteres e coluna válida), mensagens por campo e estado pendente', 'Acessibilidade: rótulos associados, §aria-invalid§, §aria-describedby§, §role="alert"§, foco devolvido ao campo com erro, botões de mover por teclado (sem exigir arrastar e soltar) e uma região §aria-live§ que anuncia "Tarefa movida para Feito"', 'Efeitos usados apenas para sincronizar com sistemas externos (storage) e com cleanup; sem efeitos para derivar estado'],
  rnf: ['Sem avisos do React no console (chaves, §value§ sem §onChange§, hooks) e funcionamento correto em Strict Mode', 'Sem §dangerouslySetInnerHTML§; títulos exibidos como texto', 'Cobertura de testes dos fluxos: reducer, hook de persistência (com storage simulado) e criação/movimentação de tarefas com Testing Library', 'Layout responsivo e contraste adequado (WCAG AA)', 'README com decisões (por que Context e reducer, o que é estado e o que é derivado) e instruções de execução'],
  ac: ['§npm test§ passa e §npx tsc --noEmit§ não aponta erros', 'O reducer tem testes para todas as ações, para imutabilidade (estado congelado) e para a ação desconhecida', 'O hook de persistência é testado com JSON inválido, storage bloqueado e remontagem', 'Um teste de interface cria uma tarefa inválida (erro anunciado com §role="alert"§ e §aria-invalid§) e depois uma válida', 'É possível criar, mover e excluir tarefas usando apenas o teclado (checklist manual registrada)', 'O Profiler (React DevTools) mostra que digitar no formulário não re-renderiza as colunas (registre a captura ou a contagem)', 'O app não tem avisos no console em desenvolvimento com Strict Mode'],
  ch: ['Adicionar arrastar e soltar com alternativa por teclado e anúncios para leitores de tela', 'Sincronizar o estado entre abas com o evento §storage§ e §useSyncExternalStore§', 'Trocar a validação manual por Zod e compartilhar o esquema com um servidor de exemplo', 'Medir e documentar o efeito de §memo§ nas colunas com 500 tarefas', 'Extensão: migrar o estado para uma biblioteca (Zustand) e comparar re-renderizações com a versão em Context']
};
