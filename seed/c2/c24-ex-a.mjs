// C2.4 — Gerenciamento de estado no frontend: exercícios das aulas 1 a 5.
// Os componentes React não rodam no laboratório (só JavaScript puro): os desafios "code" modelam a lógica (store, seletores, ciclo assíncrono).
const R = String.raw;

export const exsetsA = {
'est-01': [
  { id: 'est-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Uma lista de pedidos carregada de uma API e usada por três telas é, principalmente, que tipo de estado?', options: ['Estado local de UI', 'Estado de servidor (cópia de dados cuja fonte da verdade está no servidor)', 'Estado derivado', 'Estado de formulário'], answer: 1, explanation: 'Os dados moram no servidor e a tela guarda uma cópia que pode ficar velha; isso pede cache, invalidação e atualização, não um estado global manual.' },
  { id: 'est-01-e2', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o dado ao tipo de estado mais adequado.', pairs: [['Página atual e filtro de status de uma listagem compartilhável', 'Estado de URL'], ['Total do carrinho calculado a partir dos itens', 'Estado derivado (não se guarda)'], ['Menu aberto ou fechado em um único componente', 'Estado local de UI'], ['Perfil do usuário vindo da API', 'Estado de servidor']], explanation: 'A classificação precede a ferramenta: URL para o que deve ser compartilhável e recarregável, derivado para o que se calcula, local para o que é de um só componente, servidor para cópias de dados remotos.' },
  { id: 'est-01-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'É boa prática guardar em estado tanto a lista de itens quanto o total, e atualizar o total com um efeito sempre que a lista mudar.', answer: false, explanation: 'O total é derivado: calcule-o no render. O efeito cria duas fontes da verdade, uma renderização extra e um instante com o total velho.' },
  { id: 'est-01-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'Clique na linha que cria uma segunda fonte da verdade sem necessidade.', code: 'function Lista({ itens }) {\n  const [filtro, setFiltro] = useState("");\n  const [visiveis, setVisiveis] = useState(itens);\n  useEffect(() => {\n    setVisiveis(itens.filter((i) => i.nome.includes(filtro)));\n  }, [itens, filtro]);\n  return <ul>{visiveis.map((i) => <li key={i.id}>{i.nome}</li>)}</ul>;\n}', answer: 3, explanation: 'A lista visível é derivada de itens e filtro. Guardá-la em estado (linha 3) e sincronizá-la com um efeito cria duplicação; use const visiveis = itens.filter(...) durante o render.' },
  { id: 'est-01-e5', type: 'fill', difficulty: 1, points: 10, prompt: 'Complete o modelo que evita estados impossíveis.', code: 'type Carga = { status: "ocioso" } | { status: "carregando" } | { status: "[[0]]"; mensagem: string } | { status: "ok"; pedidos: Pedido[] };\n// guarde o [[1]] selecionado, não o objeto inteiro, para ele acompanhar a lista atualizada', answers: [['erro'], ['id', 'identificador']], explanation: 'Um status único (união discriminada) impede "carregando e com erro" ao mesmo tempo, e guardar o id evita um objeto velho.' },
  { id: 'est-01-e6', type: 'open', difficulty: 2, points: 10, prompt: 'Uma tela de pedidos tem: lista de pedidos, filtro de status, página, tema escuro, texto digitado na busca e total em aberto. Classifique cada dado e diga onde ele deve viver.', model: 'Lista de pedidos: estado de servidor, em um cache de servidor (TanStack Query). Filtro de status e página: estado de URL (parâmetros de busca), para compartilhar o link e recarregar. Tema escuro: estado compartilhado de cliente, em Context ou Zustand com persistência. Texto digitado na busca: estado local do componente (ou da URL depois de enviar). Total em aberto: estado derivado, calculado da lista no render ou em um seletor, sem guardar.', rubric: ['Classifica a lista de pedidos como estado de servidor com cache', 'Coloca filtro e página na URL e explica o benefício (link, voltar, recarregar)', 'Trata o total como derivado e não o guarda', 'Escolhe o nível mais simples para tema e texto de busca'], explanation: 'O objetivo é treinar a classificação antes da escolha da ferramenta: cada tipo de estado pede uma solução diferente.' }
],
'est-02': [
  { id: 'est-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Dois consumidores de um mesmo contexto (cada um dentro de memo) leem partes diferentes do valor. Uma ação muda só uma das partes. O que acontece?', options: ['Só o consumidor da parte alterada renderiza', 'Os dois renderizam, porque ambos chamam useContext e o valor do contexto mudou', 'Nenhum renderiza por causa do memo', 'Só o Provider renderiza'], answer: 1, explanation: 'Medido: os dois consumidores passaram de 1 para 2 renderizações. O Context não tem seletores; todo consumidor renderiza quando o valor muda.' },
  { id: 'est-02-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Criar o objeto do value inline no Provider (value={{ n: 1 }}) não tem efeito sobre os consumidores quando o Provider renderiza por outro motivo.', answer: false, explanation: 'Um objeto novo a cada render do Provider muda o valor por referência e faz os consumidores renderizarem de novo (medido: 1 render extra, contra 0 com useMemo).' },
  { id: 'est-02-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Rastreie o reducer. Estado inicial {n: 0}. Ações: inc, inc, reset, inc.', code: 'function reducer(s, a) {\n  switch (a.type) {\n    case "inc": return { n: s.n + 1 };\n    case "reset": return { n: 0 };\n    default: return s;\n  }\n}', lang: 'js', steps: [{ q: 'Qual o valor de n depois das duas primeiras ações?', answers: ['2'] }, { q: 'E depois de reset?', answers: ['0'] }, { q: 'Valor final depois da última inc?', answers: ['1'] }], explanation: 'Cada ação produz um novo estado: 1, 2, 0 e por fim 1.' },
  { id: 'est-02-e4', type: 'bug', difficulty: 2, points: 10, prompt: 'Clique na linha que viola a regra do reducer.', code: 'function reducer(estado, acao) {\n  switch (acao.type) {\n    case "item_adicionado":\n      estado.itens.push(acao.item);\n      return estado;\n    default:\n      return estado;\n  }\n}', answer: 4, explanation: 'O reducer deve ser puro: mutar estado.itens e devolver a mesma referência impede o React de perceber a mudança e quebra o Strict Mode. Devolva { itens: [...estado.itens, acao.item] }.' },
  { id: 'est-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Uma aplicação tem um contexto único com tema, usuário e um contador de notificações que muda a cada poucos segundos. Muitos componentes lentos consomem só o tema. Explique o problema e proponha duas correções.', model: 'Todo componente que usa useContext renderiza quando o valor do contexto muda, então o contador de notificações faz renderizar também os consumidores do tema. Correções: dividir em contextos por assunto e frequência (tema, usuário e notificações separados), memoizar o value de cada Provider com useMemo, separar estado e dispatch em contextos distintos e, se os consumidores forem muitos e a atualização frequente, migrar o contador para uma store com seletores (Zustand ou Redux Toolkit).', rubric: ['Explica que todos os consumidores renderizam quando o valor muda', 'Propõe dividir contextos por frequência de mudança', 'Cita memoização do value ou separação de estado e dispatch', 'Cita a migração para uma store com seletores como alternativa'], explanation: 'O problema é a granularidade: o Context entrega tudo ou nada.' },
  { id: 'est-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarStore(reducer, estadoInicial)§ que devolve §{ getState, dispatch, subscribe }§. §dispatch(acao)§ calcula o novo estado com o reducer, **notifica os ouvintes somente se o estado mudou** (compare com §Object.is§) e devolve a própria ação. §subscribe(ouvinte)§ registra o ouvinte e devolve uma função que cancela o registro. Ações sem §type§ lançam §Error("ação sem type")§.', lang: 'javascript', starter: 'function criarStore(reducer, estadoInicial) {\n  // seu código aqui\n}\n', hints: ['Guarde o estado e a lista de ouvintes em variáveis do closure.', 'Compare o estado novo com o anterior antes de notificar.', 'Valide a ação no começo do dispatch.'], tests: [{ name: 'notifica só quando o estado muda', code: R`const r = (s, a) => (a.type === 'inc' ? s + 1 : s);
const st = criarStore(r, 0);
const vistos = [];
const un = st.subscribe(() => vistos.push(st.getState()));
st.dispatch({ type: 'inc' });
st.dispatch({ type: 'nada' });
un();
st.dispatch({ type: 'inc' });
assert.deepEqual(vistos, [1]);
assert.equal(st.getState(), 2);` }, { name: 'dispatch devolve a ação e vários ouvintes são chamados na ordem', code: R`const st = criarStore((s, a) => ({ n: s.n + 1 }), { n: 0 });
const ordem = [];
st.subscribe(() => ordem.push('a'));
st.subscribe(() => ordem.push('b'));
const acao = { type: 'x' };
assert.ok(st.dispatch(acao) === acao);
assert.deepEqual(ordem, ['a', 'b']);
assert.deepEqual(st.getState(), { n: 1 });` }, { name: 'ação sem type', code: R`const st = criarStore((s) => s, 1);
assert.throws(() => st.dispatch({}), 'ação sem type');
assert.throws(() => st.dispatch(), 'ação sem type');` }], solution: R`function criarStore(reducer, estadoInicial) {
  let estado = estadoInicial;
  let ouvintes = [];
  return {
    getState: () => estado,
    dispatch(acao) {
      if (!acao || typeof acao.type === 'undefined') throw new Error('ação sem type');
      const anterior = estado;
      estado = reducer(estado, acao);
      if (!Object.is(anterior, estado)) ouvintes.slice().forEach((o) => o());
      return acao;
    },
    subscribe(ouvinte) {
      ouvintes.push(ouvinte);
      return () => { ouvintes = ouvintes.filter((o) => o !== ouvinte); };
    }
  };
}
`, explanation: 'É o núcleo do Redux: estado guardado fora do React, reducer puro e assinantes notificados só quando a referência muda. O mesmo princípio explica por que reducers devem devolver a mesma referência quando nada muda.' }
],
'est-03': [
  { id: 'est-03-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'No Redux Toolkit, o que o Immer permite dentro de um reducer do createSlice?', options: ['Alterar o estado global de qualquer lugar', 'Escrever atualizações como mutações do rascunho (state.itens.push(x)) e obter um novo estado imutável', 'Fazer chamadas de rede dentro do reducer', 'Evitar o uso de ações'], answer: 1, explanation: 'O state recebido é um rascunho; ao final o Immer produz um novo objeto imutável. O estado antigo continua intacto (medido) e o resultado fica congelado em desenvolvimento.' },
  { id: 'est-03-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'No mesmo reducer do createSlice é válido mutar o rascunho e, ao final, também devolver um novo objeto.', answer: false, explanation: 'Ou se muta o rascunho, ou se devolve um novo valor; fazer os dois lança erro no Immer.' },
  { id: 'est-03-e3', type: 'mc', difficulty: 3, points: 10, prompt: 'O componente usa useSelector((s) => s.pedidos.lista.filter((p) => p.aberto)) e renderiza a cada ação, mesmo de outras partes do estado. Qual a causa e a correção?', options: ['O Provider está errado; troque a store', 'O seletor devolve um array novo a cada chamada; use createSelector para memoizar a derivação', 'O Immer não funciona com filter', 'Falta usar useDispatch'], answer: 1, explanation: 'O useSelector compara por ===; um array novo a cada chamada sempre parece mudança (medido: +1 render e aviso em desenvolvimento). Com createSelector o resultado mantém a mesma referência (+0).' },
  { id: 'est-03-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a peça do Redux Toolkit à sua função.', pairs: [['configureStore', 'Cria a store com DevTools, thunk e verificações de desenvolvimento'], ['createSlice', 'Gera o reducer e os criadores de ação a partir de reducers e do nome'], ['createSelector', 'Cria um seletor memoizado que só recalcula quando as entradas mudam'], ['useSelector', 'Lê um valor da store e re-renderiza quando ele muda']], explanation: 'São as quatro peças da base do RTK com react-redux.' },
  { id: 'est-03-e5', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o slice.', code: 'const slice = createSlice({\n  name: "contador",\n  initialState: { n: 0 },\n  reducers: {\n    incrementado(state) { state.n [[0]] 1; }\n  }\n});\n// tipo da ação gerada: "[[1]]"', answers: [['+='], ['contador/incrementado']], explanation: 'Com o Immer, mutar o rascunho é válido; o tipo da ação é nome/reducer.' },
  { id: 'est-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarSeletor(entradas, combinar)§: §entradas§ é uma lista de funções §(estado) => valor§ e §combinar§ recebe os valores. Devolva uma função seletor §(estado) => resultado§ que **só chama §combinar§ de novo quando algum valor de entrada mudar** (§Object.is§ contra a chamada anterior); caso contrário devolve o **mesmo resultado** da última vez. O seletor deve ter o método §recalculos()§ que devolve quantas vezes §combinar§ foi executado.', lang: 'javascript', starter: 'function criarSeletor(entradas, combinar) {\n  // seu código aqui\n}\n', hints: ['Guarde os últimos valores de entrada e o último resultado.', 'Na primeira chamada sempre calcule.', 'Atribua recalculos como propriedade da função devolvida.'], tests: [{ name: 'memoiza por referência', code: R`const s = { lista: [1, 2, 3, 4], filtro: 'par', outro: 0 };
const sel = criarSeletor([(x) => x.lista, (x) => x.filtro], (l, f) => l.filter((n) => (f === 'par' ? n % 2 === 0 : n % 2 === 1)));
const a = sel(s);
const b = sel({ ...s, outro: 1 });
assert.deepEqual(a, [2, 4]);
assert.ok(a === b, 'deveria devolver a mesma referência');
assert.equal(sel.recalculos(), 1);` }, { name: 'recalcula quando a entrada muda', code: R`const sel = criarSeletor([(x) => x.a, (x) => x.b], (a, b) => a + b);
assert.equal(sel({ a: 1, b: 2 }), 3);
assert.equal(sel({ a: 1, b: 2 }), 3);
assert.equal(sel.recalculos(), 1);
assert.equal(sel({ a: 5, b: 2 }), 7);
assert.equal(sel.recalculos(), 2);
assert.equal(sel({ a: 5, b: 3 }), 8);
assert.equal(sel.recalculos(), 3);` }, { name: 'entrada nova com mesmo conteúdo conta como mudança', code: R`const sel = criarSeletor([(x) => x.lista], (l) => l.length);
sel({ lista: [1] });
sel({ lista: [1] });
assert.equal(sel.recalculos(), 2, 'arrays diferentes por referência devem recalcular');` }], solution: R`function criarSeletor(entradas, combinar) {
  let ultimas = null;
  let resultado;
  let n = 0;
  function seletor(estado) {
    const atuais = entradas.map((f) => f(estado));
    const mudou = ultimas === null || atuais.some((v, i) => !Object.is(v, ultimas[i]));
    if (mudou) { resultado = combinar(...atuais); ultimas = atuais; n++; }
    return resultado;
  }
  seletor.recalculos = () => n;
  return seletor;
}
`, explanation: 'É o princípio do createSelector: comparar as entradas por referência e reaproveitar o resultado. Por isso entradas devem ser baratas (acesso a campos) e a derivação cara fica na função de combinação.' }
],
'est-04': [
  { id: 'est-04-e1', type: 'trace', difficulty: 2, points: 10, prompt: 'Um createAsyncThunk de prefixo "usuarios/carregar" é despachado com sucesso. O middleware de log registra o tipo de cada ação.', code: 'dispatch(carregar(7))\n// log: ?  >  ?', lang: 'js', steps: [{ q: 'Qual o tipo da primeira ação registrada?', answers: ['usuarios/carregar/pending'] }, { q: 'Qual o tipo da segunda ação?', answers: ['usuarios/carregar/fulfilled'] }], explanation: 'Medido: pending e depois fulfilled; na falha, a segunda é usuarios/carregar/rejected.' },
  { id: 'est-04-e2', type: 'mc', difficulty: 2, points: 10, prompt: 'Para que serve rejectWithValue em um thunk?', options: ['Para repetir a requisição automaticamente', 'Para rejeitar com um payload previsível, disponível em action.payload no caso rejected', 'Para cancelar o reducer', 'Para guardar o erro em localStorage'], answer: 1, explanation: 'Erros esperados (validação, não encontrado) viram payload; exceções inesperadas chegam em action.error.' },
  { id: 'est-04-e3', type: 'tf', difficulty: 2, points: 5, prompt: 'A promise devolvida por dispatch(thunk) rejeita por padrão quando a operação falha.', answer: false, explanation: 'Ela resolve com a ação rejected; use .unwrap() para obter o payload ou lançar o erro.' },
  { id: 'est-04-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que torna o reducer impuro.', code: 'const slice = createSlice({\n  name: "usuarios",\n  initialState: { dados: null },\n  reducers: {\n    carregado(state, action) {\n      state.dados = await fetch("/api/usuarios/" + action.payload).then((r) => r.json());\n    }\n  }\n});', answer: 6, explanation: 'Reducers são puros e síncronos: a rede deve ficar em um thunk, em um listener ou em uma biblioteca de cache de servidor.' },
  { id: 'est-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare escrever thunks à mão para buscar dados com usar RTK Query ou TanStack Query. Cite três responsabilidades que a biblioteca assume e diga quando um thunk ainda faz sentido.', model: 'Com thunks à mão é preciso guardar status e erro, evitar buscas duplicadas, decidir quando recarregar, invalidar após mutações e cancelar buscas obsoletas. RTK Query e TanStack Query assumem cache por chave, deduplicação, estados de carregamento e erro, atualização em segundo plano, retry e invalidação. Um thunk ainda faz sentido para operações pontuais que não são dados cacheáveis, como um login, um upload ou um fluxo que combina várias ações do cliente.', rubric: ['Cita pelo menos três responsabilidades assumidas (cache, deduplicação, invalidação, retry, atualização em segundo plano)', 'Explica o risco dos thunks à mão (corridas, dado velho)', 'Dá um caso legítimo para thunk (login, upload, orquestração)', 'Não confunde estado de cliente com de servidor'], explanation: 'A pergunta treina a decisão entre escrever a lógica de servidor e adotar uma biblioteca.' },
  { id: 'est-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele a **corrida de respostas** de um thunk. Implemente §reduzirCiclo(eventos)§. Cada evento é §{ tipo, id, payload? }§ com §tipo§ §"pending"§, §"fulfilled"§ ou §"rejected"§. O estado inicial é §{ status: "ocioso", dados: null, erro: null }§. §pending§ marca o pedido §id§ como o **mais recente**, põe §status: "carregando"§ e §erro: null§ (mantém §dados§). §fulfilled§ e §rejected§ só valem se o §id§ for o do **último pending**; respostas de pedidos antigos são **ignoradas**. §fulfilled§ define §status: "ok"§ e §dados: payload§; §rejected§ define §status: "erro"§ e §erro: payload§. Devolva o estado final, com as chaves nesta ordem: §status§, §dados§, §erro§.', lang: 'javascript', starter: 'function reduzirCiclo(eventos) {\n  // seu código aqui\n}\n', hints: ['Mantenha uma variável com o id do último pending.', 'Ignore fulfilled e rejected cujo id seja diferente.', 'Crie sempre um objeto novo com as três chaves na ordem pedida.'], tests: [{ name: 'a última resposta vence', code: R`const ev = [{ tipo: 'pending', id: 1 }, { tipo: 'pending', id: 2 }, { tipo: 'fulfilled', id: 2, payload: 'B' }, { tipo: 'fulfilled', id: 1, payload: 'A' }];
assert.deepEqual(reduzirCiclo(ev), { status: 'ok', dados: 'B', erro: null });` }, { name: 'erro do pedido mais recente', code: R`assert.deepEqual(reduzirCiclo([{ tipo: 'pending', id: 1 }, { tipo: 'rejected', id: 1, payload: 'falhou' }]), { status: 'erro', dados: null, erro: 'falhou' });
assert.deepEqual(reduzirCiclo([]), { status: 'ocioso', dados: null, erro: null });` }, { name: 'resposta antiga ignorada e dados mantidos', code: R`const ev = [{ tipo: 'pending', id: 1 }, { tipo: 'fulfilled', id: 1, payload: 'A' }, { tipo: 'pending', id: 2 }, { tipo: 'rejected', id: 1, payload: 'x' }];
assert.deepEqual(reduzirCiclo(ev), { status: 'carregando', dados: 'A', erro: null });` }], solution: R`function reduzirCiclo(eventos) {
  let estado = { status: 'ocioso', dados: null, erro: null };
  let ultimo = null;
  for (const e of eventos) {
    if (e.tipo === 'pending') {
      ultimo = e.id;
      estado = { status: 'carregando', dados: estado.dados, erro: null };
    } else if (e.id === ultimo) {
      if (e.tipo === 'fulfilled') estado = { status: 'ok', dados: e.payload, erro: null };
      else if (e.tipo === 'rejected') estado = { status: 'erro', dados: estado.dados, erro: e.payload };
    }
  }
  return estado;
}
`, explanation: 'Sem esse cuidado, uma resposta lenta de um pedido antigo sobrescreve o dado mais novo. Bibliotecas de cache de servidor cuidam disso por você (e o signal do thunk permite cancelar).' }
],
'est-05': [
  { id: 'est-05-e1', type: 'trace', difficulty: 2, points: 10, prompt: 'Uma store Zustand tem {n, nome}. O componente A lê useStore(), o B lê useStore((s) => s.n). Você chama setNome("b").', code: 'A: useStore()\nB: useStore((s) => s.n)\nsetNome("b")', lang: 'js', steps: [{ q: 'O componente A renderiza de novo? (sim/não)', answers: ['sim'] }, { q: 'O componente B renderiza de novo? (sim/não)', answers: ['não', 'nao'] }], explanation: 'Medido: A renderizou +1 e B +0. O seletor define a assinatura; ler a store inteira renderiza a cada mudança.' },
  { id: 'est-05-e2', type: 'mc', difficulty: 3, points: 10, prompt: 'Com Zustand v5, o seletor (s) => ({ n: s.n, nome: s.nome }) lança "Maximum update depth exceeded". Qual é a correção?', options: ['Trocar create por createStore', 'Envolver o seletor em useShallow ou selecionar cada campo separadamente', 'Usar setState em vez de set', 'Adicionar um useEffect'], answer: 1, explanation: 'O seletor devolve um objeto novo a cada chamada; useShallow compara campo a campo e mantém a referência quando os campos são iguais.' },
  { id: 'est-05-e3', type: 'tf', difficulty: 1, points: 5, prompt: 'A store do Zustand pode ser lida e alterada fora de componentes React com getState e setState.', answer: true, explanation: 'Isso facilita testes e permite que código fora do React (um cliente HTTP) leia o token.' },
  { id: 'est-05-e4', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o recurso do Zustand ao objetivo.', pairs: [['persist com partialize', 'Gravar só alguns campos em armazenamento e restaurá-los ao iniciar'], ['useShallow', 'Evitar renderizações e laços com seletores que devolvem objetos'], ['subscribeWithSelector', 'Observar uma fatia do estado com comparação'], ['Padrão de fatias', 'Dividir uma store grande em funções que recebem set e get']], explanation: 'Cada recurso resolve um problema específico de stores maiores.' },
  { id: 'est-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Uma equipe precisa de estado global de UI (tema, painel lateral, preferências) em uma aplicação React de médio porte, sem regras de negócio complexas no cliente. Compare Zustand e Redux Toolkit para essa situação e recomende uma.', model: 'Para estado de UI simples, o Zustand costuma bastar: pouco código, sem Provider, seletores nativos e persist para preferências. O Redux Toolkit oferece ações nomeadas e rastreáveis, DevTools por padrão, listeners e RTK Query, vantagens que importam quando há muitas regras de negócio no cliente, equipe grande que precisa de convenções, ou projeto que já usa Redux. Recomendação: Zustand, com seletores e fatias, documentando a decisão em um ADR e reavaliando se as regras de negócio no cliente crescerem. Em qualquer caso, os dados de servidor ficam em um cache de servidor.', rubric: ['Compara custo de cerimônia e estrutura imposta', 'Cita rastreabilidade e ecossistema do Redux Toolkit', 'Faz uma recomendação justificada pelo contexto', 'Mantém dados de servidor fora da store de UI'], explanation: 'Não há resposta única: a justificativa pelo contexto é o que se avalia.' },
  { id: 'est-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §criarStore(estadoInicial)§ no estilo do Zustand com §subscribeWithSelector§. Deve devolver §{ getState, setState, subscribe }§. §setState(parcial)§ aceita um objeto ou uma função §(estado) => parcial§ e **mescla de forma rasa** em um **novo** objeto de estado. §subscribe(seletor, ouvinte)§ chama §ouvinte(novo, antigo)§ (os valores selecionados) **somente quando o valor selecionado mudar** (§Object.is§) e devolve uma função que cancela a assinatura.', lang: 'javascript', starter: 'function criarStore(estadoInicial) {\n  // seu código aqui\n}\n', hints: ['Para cada assinatura, guarde o último valor selecionado.', 'Depois de cada setState, rode todas as assinaturas.', 'Crie o novo estado com {...estado, ...parcial}.'], tests: [{ name: 'só notifica quando a fatia muda', code: R`const s = criarStore({ x: 0, y: 0 });
const v = [];
s.subscribe((st) => st.x, (n, a) => v.push(a + '->' + n));
s.setState({ y: 1 });
s.setState({ x: 5 });
s.setState({ x: 5 });
s.setState((st) => ({ x: st.x + 1 }));
assert.deepEqual(v, ['0->5', '5->6']);` }, { name: 'novo objeto a cada mudança e cancelamento', code: R`const s = criarStore({ a: 1, b: 2 });
const antes = s.getState();
s.setState({ b: 3 });
assert.ok(antes !== s.getState(), 'deve criar um novo objeto');
assert.deepEqual(antes, { a: 1, b: 2 });
assert.deepEqual(s.getState(), { a: 1, b: 3 });
const v = [];
const un = s.subscribe((st) => st.a, (n) => v.push(n));
s.setState({ a: 9 });
un();
s.setState({ a: 10 });
assert.deepEqual(v, [9]);` }], solution: R`function criarStore(estadoInicial) {
  let estado = estadoInicial;
  let assinaturas = [];
  return {
    getState: () => estado,
    setState(parcial) {
      const p = typeof parcial === 'function' ? parcial(estado) : parcial;
      estado = { ...estado, ...p };
      assinaturas.slice().forEach((a) => {
        const novo = a.seletor(estado);
        if (!Object.is(novo, a.ultimo)) { const antigo = a.ultimo; a.ultimo = novo; a.ouvinte(novo, antigo); }
      });
    },
    subscribe(seletor, ouvinte) {
      const a = { seletor, ouvinte, ultimo: seletor(estado) };
      assinaturas.push(a);
      return () => { assinaturas = assinaturas.filter((x) => x !== a); };
    }
  };
}
`, explanation: 'É a ideia dos seletores do Zustand: cada assinante guarda o último valor selecionado e só é avisado quando ele muda. Mesclar de forma rasa explica por que alterações aninhadas exigem copiar o nível alterado.' }
]
};
