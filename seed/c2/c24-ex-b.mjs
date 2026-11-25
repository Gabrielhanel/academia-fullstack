// C2.4 — Gerenciamento de estado no frontend: exercícios das aulas 6 a 9, prova final e projeto integrador.
const R = String.raw;

export const exsetsB = {
'est-06': [
  { id: 'est-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é a diferença entre staleTime e gcTime no TanStack Query?', options: ['São o mesmo conceito com nomes diferentes', 'staleTime: por quanto tempo o dado é fresco (sem nova busca); gcTime: por quanto tempo uma query sem uso fica no cache antes de ser removida', 'staleTime: tempo de retry; gcTime: tempo de timeout da rede', 'staleTime vale para mutações; gcTime vale para queries'], answer: 1, explanation: 'Medido: com staleTime de 100 ms, remontar em 20 ms não refez a busca; com gcTime de 50 ms, a query sumiu do cache depois de desmontada.' },
  { id: 'est-06-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Dois componentes montados ao mesmo tempo com a mesma queryKey causam duas requisições ao servidor.', answer: false, explanation: 'Há deduplicação: medido 1 chamada ao queryFn para dois componentes com a mesma chave.' },
  { id: 'est-06-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que causa dado de outro filtro sendo exibido.', code: 'function usePedidos(status) {\n  return useQuery({\n    queryKey: ["pedidos"],\n    queryFn: () => fetch("/api/pedidos?status=" + status).then((r) => r.json())\n  });\n}', answer: 3, explanation: 'A chave precisa conter tudo que o queryFn usa. Com a chave fixa ["pedidos"], trocar o status reaproveita o cache do status anterior. Use ["pedidos", { status }].' },
  { id: 'est-06-e4', type: 'match', difficulty: 1, points: 10, prompt: 'Associe o estado da consulta ao seu significado.', pairs: [['isPending', 'Ainda não há dado para mostrar (carregamento inicial)'], ['isFetching', 'Há uma busca em andamento, inclusive em segundo plano'], ['isError', 'A consulta falhou depois das tentativas'], ['data', 'Último resultado bem-sucedido guardado no cache']], explanation: 'status descreve o dado; isFetching descreve a busca. Podem coexistir (success e isFetching).' },
  { id: 'est-06-e5', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a consulta.', code: 'useQuery({\n  [[0]]: ["pedidos", id],\n  queryFn: async () => {\n    const resp = await fetch("/api/pedidos/" + id);\n    if (!resp.[[1]]) throw new Error("falha");\n    return resp.json();\n  },\n  staleTime: 30_000\n});', answers: [['queryKey'], ['ok']], explanation: 'A chave identifica a consulta; fetch não lança em 4xx e 5xx, então é preciso verificar resp.ok.' },
  { id: 'est-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o cache do TanStack Query. Implemente §criarCache({ staleTime, gcTime, agora })§ (§agora()§ devolve o tempo em ms). Métodos: §consultar(chave, buscar)§ e §coletar()§ e §tamanho()§. A chave é um array e vira texto de forma **estável**: objetos têm as propriedades ordenadas (a ordem das propriedades não importa), mas a **ordem dos itens do array importa**. §consultar§ devolve §{ dado, buscou }§: se existe entrada **fresca** (§agora() - buscadoEm < staleTime§), devolve o dado com §buscou: false§; senão chama §buscar()§ (síncrona), guarda o resultado com o instante atual e devolve §buscou: true§. Toda consulta atualiza o §ultimoAcesso§ da entrada. §coletar()§ remove as entradas cujo §agora() - ultimoAcesso > gcTime§ e devolve **quantas** removeu.', lang: 'javascript', starter: 'function criarCache({ staleTime, gcTime, agora }) {\n  // seu código aqui\n}\n', hints: ['Escreva uma função que ordena as chaves de objetos recursivamente antes do JSON.stringify.', 'Guarde { dado, buscadoEm, ultimoAcesso } em um Map.', 'O dado é fresco só se a diferença for estritamente menor que staleTime.'], tests: [{ name: 'fresco, velho e hash estável', code: R`let t = 0; let n = 0;
const c = criarCache({ staleTime: 100, gcTime: 50, agora: () => t });
const f = () => ++n;
assert.deepEqual(c.consultar(['a', { x: 1, y: 2 }], f), { dado: 1, buscou: true });
t = 50;
assert.deepEqual(c.consultar(['a', { y: 2, x: 1 }], f), { dado: 1, buscou: false });
t = 100;
assert.deepEqual(c.consultar(['a', { x: 1, y: 2 }], f), { dado: 2, buscou: true });` }, { name: 'a ordem dos itens do array importa', code: R`const c = criarCache({ staleTime: 1000, gcTime: 1000, agora: () => 0 });
let n = 0;
c.consultar(['t', 1, 2], () => ++n);
const r = c.consultar(['t', 2, 1], () => ++n);
assert.deepEqual(r, { dado: 2, buscou: true });
assert.equal(c.tamanho(), 2);` }, { name: 'coleta de lixo por último acesso', code: R`let t = 0;
const c = criarCache({ staleTime: 10, gcTime: 50, agora: () => t });
c.consultar(['a'], () => 'A');
t = 100;
c.consultar(['b'], () => 'B');
t = 140;
assert.equal(c.coletar(), 1);
assert.equal(c.tamanho(), 1);
t = 300;
assert.equal(c.coletar(), 1);
assert.equal(c.tamanho(), 0);` }], solution: R`function criarCache({ staleTime, gcTime, agora }) {
  const ordenar = (v) => {
    if (Array.isArray(v)) return v.map(ordenar);
    if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordenar(v[k])]));
    return v;
  };
  const hash = (chave) => JSON.stringify(ordenar(chave));
  const mapa = new Map();
  return {
    consultar(chave, buscar) {
      const h = hash(chave);
      const agoraT = agora();
      const e = mapa.get(h);
      if (e && agoraT - e.buscadoEm < staleTime) { e.ultimoAcesso = agoraT; return { dado: e.dado, buscou: false }; }
      const dado = buscar();
      mapa.set(h, { dado, buscadoEm: agoraT, ultimoAcesso: agoraT });
      return { dado, buscou: true };
    },
    coletar() {
      let n = 0;
      for (const [h, e] of [...mapa]) if (agora() - e.ultimoAcesso > gcTime) { mapa.delete(h); n++; }
      return n;
    },
    tamanho: () => mapa.size
  };
}
`, explanation: 'O modelo reproduz o essencial: a chave estável identifica a entrada, staleTime decide quando buscar de novo e gcTime remove o que ninguém usa. No TanStack Query real, o gcTime só conta enquanto a query está inativa (sem componentes), e a busca é assíncrona.' }
],
'est-07': [
  { id: 'est-07-e1', type: 'trace', difficulty: 2, points: 10, prompt: 'Três queries ativas: ["todos","lista"], ["todos","item",1] e ["outra"], cada uma com um contador de buscas começando em 1. Você chama invalidateQueries({ queryKey: ["todos"] }).', code: 'queryClient.invalidateQueries({ queryKey: ["todos"] })\n// contadores: lista=?  item1=?  outra=?', lang: 'js', steps: [{ q: 'Quantas buscas teve a query "lista" no total?', answers: ['2'] }, { q: 'E a ["todos","item",1]?', answers: ['2'] }, { q: 'E a ["outra"]?', answers: ['1'] }], explanation: 'Medido: a invalidação por prefixo refez as duas queries ativas sob "todos" e não tocou em "outra".' },
  { id: 'est-07-e2', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual é o primeiro passo do onMutate em uma atualização otimista, e por quê?', options: ['Escrever o valor otimista, porque é o mais rápido', 'Chamar cancelQueries para que uma busca em andamento não sobrescreva o valor otimista com uma resposta atrasada', 'Chamar invalidateQueries', 'Limpar todo o cache'], answer: 1, explanation: 'Depois de cancelar, guarde o snapshot e escreva o valor otimista; no erro, restaure; no final, invalide.' },
  { id: 'est-07-e3', type: 'tf', difficulty: 2, points: 10, prompt: 'Na atualização otimista com falha forçada, o cache continuou mostrando o item otimista mesmo depois do erro, até o próximo refetch manual.', answer: false, explanation: 'Medido: o item apareceu durante a mutação e o onError restaurou o snapshot (a lista voltou a ["a","b"]).' },
  { id: 'est-07-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que corrompe o cache do TanStack Query.', code: 'onMutate: async (id) => {\n  await qc.cancelQueries({ queryKey: ["tarefas"] });\n  const lista = qc.getQueryData(["tarefas"]);\n  lista.find((t) => t.id === id).feita = true;\n  qc.setQueryData(["tarefas"], lista);\n  return { anterior: lista };\n}', answer: 4, explanation: 'O objeto do cache foi mutado diretamente (e o snapshot aponta para o mesmo objeto, então o rollback restauraria o dado já alterado). Crie um novo array com map e objetos novos.' },
  { id: 'est-07-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Descreva o roteiro completo de uma atualização otimista (onMutate, onError, onSettled) e dois riscos que exigem cuidado.', model: 'No onMutate: cancelar as buscas da chave (cancelQueries), guardar o snapshot do cache (getQueryData), escrever o valor otimista com setQueryData e devolver o snapshot como contexto. No onError: restaurar o snapshot a partir do contexto. No onSettled: invalidar a chave para sincronizar com o servidor, tendo dado certo ou errado. Riscos: respostas antigas sobrescrevendo o valor otimista (por isso o cancelQueries); várias mutações simultâneas em que o rollback de uma apaga a mutação otimista da outra; usar otimismo em operações críticas como pagamento; mutar o objeto do cache em vez de criar um novo.', rubric: ['Descreve onMutate com cancelamento, snapshot e escrita otimista', 'Descreve rollback no onError e invalidação no onSettled', 'Cita pelo menos dois riscos (corrida, mutações simultâneas, operações críticas, mutação do cache)', 'Usa a terminologia corretamente'], explanation: 'O roteiro é a base de interfaces que parecem instantâneas sem perder consistência.' },
  { id: 'est-07-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele atualizações otimistas **com várias mutações simultâneas**. Implemente §criarOtimista(base)§ com os métodos §aplicar(id, fn)§, §confirmar(id)§, §reverter(id)§, §estado()§ e §base()§. §estado()§ é a base com **todas as mutações pendentes reaplicadas na ordem** em que foram aplicadas (cada §fn§ recebe o estado anterior e devolve um novo, sem mutar). §confirmar(id)§ passa a mutação para a base (§base = fn(base)§) e a tira das pendentes. §reverter(id)§ apenas a descarta. Se o §id§ não existir (em confirmar ou reverter), lance §Error("mutação inexistente: ID")§ com o id.', lang: 'javascript', starter: 'function criarOtimista(base) {\n  // seu código aqui\n}\n', hints: ['Guarde uma lista de pendentes { id, fn }.', 'estado() reduz as pendentes a partir da base atual.', 'Reverter uma não apaga as outras, porque o estado é recalculado.'], tests: [{ name: 'reverter uma não apaga as outras', code: R`const o = criarOtimista(['a']);
o.aplicar('m1', (l) => [...l, 'b']);
o.aplicar('m2', (l) => [...l, 'c']);
assert.deepEqual(o.estado(), ['a', 'b', 'c']);
o.reverter('m1');
assert.deepEqual(o.estado(), ['a', 'c']);
o.confirmar('m2');
assert.deepEqual(o.estado(), ['a', 'c']);
assert.deepEqual(o.base(), ['a', 'c']);` }, { name: 'confirmar fora de ordem', code: R`const o = criarOtimista([1]);
o.aplicar('x', (l) => [...l, 2]);
o.aplicar('y', (l) => [...l, 3]);
o.confirmar('y');
assert.deepEqual(o.base(), [1, 3]);
assert.deepEqual(o.estado(), [1, 3, 2]);` }, { name: 'não muta a base e valida o id', code: R`const base = ['a'];
const o = criarOtimista(base);
o.aplicar('m', (l) => [...l, 'b']);
assert.deepEqual(base, ['a']);
assert.throws(() => o.confirmar('zzz'), 'mutação inexistente: zzz');
assert.throws(() => o.reverter('qqq'), 'mutação inexistente: qqq');` }], solution: R`function criarOtimista(base) {
  let b = base;
  let pendentes = [];
  const achar = (id) => {
    const i = pendentes.findIndex((p) => p.id === id);
    if (i < 0) throw new Error('mutação inexistente: ' + id);
    return i;
  };
  return {
    aplicar(id, fn) { pendentes.push({ id, fn }); },
    confirmar(id) { const i = achar(id); b = pendentes[i].fn(b); pendentes.splice(i, 1); },
    reverter(id) { const i = achar(id); pendentes.splice(i, 1); },
    estado: () => pendentes.reduce((s, p) => p.fn(s), b),
    base: () => b
  };
}
`, explanation: 'Recalcular o estado a partir da base e das pendentes evita o erro do snapshot único: reverter a mutação 1 não apaga a otimista da mutação 2. É o raciocínio por trás de bibliotecas que reaplicam mutações em andamento.' }
],
'est-08': [
  { id: 'est-08-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual é a vantagem principal de normalizar o estado?', options: ['Deixar o JSON menor para sempre', 'Guardar cada entidade uma só vez, atualizando-a em um único lugar e refletindo em toda a interface', 'Evitar o uso de ids', 'Eliminar a necessidade de seletores'], answer: 1, explanation: 'Normalizar elimina duplicação e dá busca por id; em contrapartida exige denormalizar com seletores.' },
  { id: 'est-08-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma lista de produtos somente de leitura, vinda do servidor e usada em uma tela, deve sempre ser normalizada em uma store.', answer: false, explanation: 'Para dados de leitura alimentados pelo servidor, o cache por chave com invalidação costuma bastar; normalize estado de cliente com muitas entidades relacionadas e atualizações parciais.' },
  { id: 'est-08-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Estado normalizado: clientes.entities = { 7: { id: 7, nome: "Ana" } } e pedidos.entities = { 1: { id: 1, clienteId: 7 }, 2: { id: 2, clienteId: 7 } }. Você renomeia o cliente 7 para "Ana Souza".', code: 'clientes.entities[7].nome = "Ana Souza" // (via reducer)', lang: 'js', steps: [{ q: 'Em quantos lugares do estado o nome foi alterado?', answers: ['1', 'um'] }, { q: 'O pedido 2, ao ser denormalizado, mostra qual nome de cliente?', answers: ['Ana Souza'] }], explanation: 'A fonte da verdade é uma só; os pedidos referenciam o cliente por id.' },
  { id: 'est-08-e4', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a função do createEntityAdapter ao seu uso.', pairs: [['setAll', 'Substituir todas as entidades pelas recebidas'], ['upsertMany', 'Inserir as novas e mesclar as existentes'], ['updateOne', 'Alterar campos de uma entidade identificada por id'], ['selectById', 'Ler uma entidade a partir do estado']], explanation: 'O adapter gera reducers e seletores prontos para o CRUD normalizado.' },
  { id: 'est-08-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Um quadro kanban tem colunas, cartões e usuários atribuídos, e os cartões mudam de coluna o tempo todo. Proponha o formato do estado, as relações e dois seletores, e explique por que normalizar ajuda aqui.', model: 'Estado normalizado com três tabelas: colunas { ids, entities } (cada coluna com cartaoIds ordenados), cartoes { ids, entities } (cada cartão com titulo e responsavelId) e usuarios { ids, entities }. Relações por id: a coluna guarda a ordem dos cartões; o cartão guarda o id do responsável. Seletores memoizados: selecionarCartoesDaColuna(id), que mapeia cartaoIds para os cartões, e selecionarQuadro, que denormaliza colunas com cartões e responsáveis. Normalizar ajuda porque mover um cartão altera só dois arrays de ids, renomear um usuário atualiza uma entidade e os componentes de cartão renderizam apenas quando seu cartão muda.', rubric: ['Define tabelas de colunas, cartões e usuários com ids e entities', 'Representa relações por ids e a ordem por listas de ids', 'Propõe seletores memoizados para denormalizar', 'Explica o ganho em atualizações parciais e renderizações'], explanation: 'O kanban é o caso típico em que normalizar compensa.' },
  { id: 'est-08-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §normalizar(pedidos)§ e §denormalizar(estado)§. Cada pedido tem a forma §{ id, total, cliente: { id, nome, ... } }§. §normalizar§ devolve §{ clientes: { ids, entities }, pedidos: { ids, entities } }§ (nessa ordem de chaves). Em §pedidos.entities§, cada pedido guarda os demais campos **seguidos de §clienteId§** (sem §cliente§). Clientes repetidos entram **uma única vez** em §ids§ e seus campos são **mesclados** (campos novos de ocorrências posteriores são acrescentados). §denormalizar§ devolve a lista de pedidos na ordem de §pedidos.ids§, com os campos do pedido (sem §clienteId§) **seguidos de §cliente§**.', lang: 'javascript', starter: 'function normalizar(pedidos) {\n  // seu código aqui\n}\n\nfunction denormalizar(estado) {\n  // seu código aqui\n}\n', hints: ['Separe o cliente com desestruturação: const { cliente, ...resto } = pedido.', 'Use "id in entities" para saber se o cliente já entrou em ids.', 'Mesclar: { ...entities[id], ...cliente }.'], tests: [{ name: 'normaliza sem duplicar', code: R`const bruto = [{ id: 1, total: 10, cliente: { id: 7, nome: 'Ana' } }, { id: 2, total: 20, cliente: { id: 7, nome: 'Ana' } }, { id: 3, total: 5, cliente: { id: 8, nome: 'Rui' } }];
assert.deepEqual(normalizar(bruto), {
  clientes: { ids: [7, 8], entities: { 7: { id: 7, nome: 'Ana' }, 8: { id: 8, nome: 'Rui' } } },
  pedidos: { ids: [1, 2, 3], entities: { 1: { id: 1, total: 10, clienteId: 7 }, 2: { id: 2, total: 20, clienteId: 7 }, 3: { id: 3, total: 5, clienteId: 8 } } }
});` }, { name: 'mescla campos e faz o caminho de volta', code: R`const bruto = [{ id: 1, total: 10, cliente: { id: 7, nome: 'Ana' } }, { id: 2, total: 20, cliente: { id: 7, email: 'a@x' } }];
const n = normalizar(bruto);
assert.deepEqual(n.clientes.entities[7], { id: 7, nome: 'Ana', email: 'a@x' });
assert.deepEqual(n.clientes.ids, [7]);
const volta = denormalizar(n);
assert.deepEqual(volta.map((p) => p.cliente.nome), ['Ana', 'Ana']);
assert.deepEqual(volta[1], { id: 2, total: 20, cliente: { id: 7, nome: 'Ana', email: 'a@x' } });` }, { name: 'uma alteração aparece em todos os pedidos', code: R`const n = normalizar([{ id: 1, total: 1, cliente: { id: 7, nome: 'Ana' } }, { id: 2, total: 2, cliente: { id: 7, nome: 'Ana' } }]);
const novo = { ...n, clientes: { ...n.clientes, entities: { 7: { id: 7, nome: 'Ana Souza' } } } };
assert.deepEqual(denormalizar(novo).map((p) => p.cliente.nome), ['Ana Souza', 'Ana Souza']);
assert.deepEqual(normalizar([]), { clientes: { ids: [], entities: {} }, pedidos: { ids: [], entities: {} } });` }], solution: R`function normalizar(pedidos) {
  const clientes = { ids: [], entities: {} };
  const ped = { ids: [], entities: {} };
  for (const p of pedidos) {
    const { cliente, ...resto } = p;
    if (!(cliente.id in clientes.entities)) clientes.ids.push(cliente.id);
    clientes.entities[cliente.id] = { ...clientes.entities[cliente.id], ...cliente };
    ped.ids.push(p.id);
    ped.entities[p.id] = { ...resto, clienteId: cliente.id };
  }
  return { clientes, pedidos: ped };
}

function denormalizar(estado) {
  return estado.pedidos.ids.map((id) => {
    const { clienteId, ...resto } = estado.pedidos.entities[id];
    return { ...resto, cliente: estado.clientes.entities[clienteId] };
  });
}
`, explanation: 'As duas funções são o miolo da normalização, independentes de biblioteca. Em uma store real, a normalização acontece na entrada (reducer fulfilled) e a denormalização em seletores memoizados.' }
],
'est-09': [
  { id: 'est-09-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é a primeira pergunta da árvore de decisão de estado?', options: ['Qual biblioteca a equipe prefere?', 'O dado pode ser derivado de outro? Se sim, não é estado', 'O dado cabe em localStorage?', 'O dado precisa de um reducer?'], answer: 1, explanation: 'Derivar é o degrau mais simples: nada a guardar, nada a sincronizar.' },
  { id: 'est-09-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Ao migrar de ferramenta de estado, o ideal é reescrever tudo de uma vez para não haver duas ferramentas no projeto.', answer: false, explanation: 'A migração gradual, por fatia de funcionalidade e atrás de uma camada de acesso, reduz risco; o que não pode haver é o mesmo dado duplicado em duas ferramentas.' },
  { id: 'est-09-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a situação à escolha mais simples.', pairs: [['Filtro e página de uma listagem que o usuário compartilha por link', 'Parâmetros de busca da URL'], ['Lista de pedidos do servidor usada em várias telas', 'Cache de servidor (TanStack Query)'], ['Tema escuro lido por toda a árvore e alterado raramente', 'Context com valor memoizado'], ['Carrinho com regras complexas, alterado em muitas telas', 'Store (Zustand ou Redux Toolkit)']], explanation: 'Cada tipo de estado tem uma casa natural; escolha o degrau mais simples que resolve.' },
  { id: 'est-09-e4', type: 'open', difficulty: 3, points: 10, prompt: 'Escreva um ADR resumido (contexto, decisão, alternativas descartadas e consequências) para o estado de um painel de pedidos de uma equipe de 4 pessoas, com listagem do servidor, filtros, painel lateral e formulário de edição.', model: 'Contexto: o painel lista pedidos do servidor, filtra por status, abre o pedido em painel lateral e permite editar; equipe de 4 pessoas, sem regras de negócio complexas no cliente. Decisão: pedidos em TanStack Query com chaves por filtro e staleTime de 30 s; filtro, página e pedido aberto na URL; tema e painel lateral em Zustand; formulário em estado local com mutação e invalidação. Alternativas descartadas: Redux Toolkit (estrutura pesada para o escopo) e Context para o painel (muitos consumidores e atualizações frequentes). Consequências: menos código de carregamento e erro; a equipe precisa dominar chaves e invalidação; reavaliar se surgirem regras de negócio no cliente.', rubric: ['Contexto com as forças relevantes (equipe, escopo)', 'Decisão por tipo de estado, com cada ferramenta justificada', 'Alternativas descartadas com motivo', 'Consequências positivas e negativas'], explanation: 'O ADR registra o porquê e evita rediscutir a mesma decisão sem fatos novos.' },
  { id: 'est-09-e5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que cria um vazamento de estado entre testes.', code: 'import { create } from "zustand";\nconst useStore = create((set) => ({ n: 0, inc: () => set((s) => ({ n: s.n + 1 })) }));\n\ntest("incrementa", () => {\n  useStore.getState().inc();\n  expect(useStore.getState().n).toBe(1);\n});\ntest("começa em zero", () => {\n  expect(useStore.getState().n).toBe(0);\n});', answer: 2, explanation: 'A store é um módulo compartilhado: o segundo teste herda o 1 do primeiro. Crie a store por teste (uma fábrica) ou restaure o estado inicial em um beforeEach.' },
  { id: 'est-09-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §escolherEstado(dado)§ que aplica a árvore de decisão. §dado§ tem os booleanos §derivavel§, §naUrl§, §doServidor§, §formulario§, §compartilhado§, §frequente§ e §regrasComplexas§ (campos ausentes valem §false§). Devolva, avaliando **nesta ordem**: §"derivado"§ se §derivavel§; §"url"§ se §naUrl§; §"cache de servidor"§ se §doServidor§; §"formulario"§ se §formulario§; §"local"§ se **não** §compartilhado§; §"context"§ se §compartilhado§ e **nem** §frequente§ **nem** §regrasComplexas§; senão §"store"§.', lang: 'javascript', starter: 'function escolherEstado(dado) {\n  // seu código aqui\n}\n', hints: ['Uma sequência de ifs com retorno antecipado resolve.', 'Campos ausentes são falsy; não precisa tratá-los à parte.'], tests: [{ name: 'ordem de prioridade', code: R`assert.equal(escolherEstado({ derivavel: true, doServidor: true }), 'derivado');
assert.equal(escolherEstado({ naUrl: true, doServidor: true }), 'url');
assert.equal(escolherEstado({ doServidor: true, compartilhado: true }), 'cache de servidor');
assert.equal(escolherEstado({ formulario: true, compartilhado: true }), 'formulario');` }, { name: 'local, context e store', code: R`assert.equal(escolherEstado({}), 'local');
assert.equal(escolherEstado({ compartilhado: true }), 'context');
assert.equal(escolherEstado({ compartilhado: true, frequente: true }), 'store');
assert.equal(escolherEstado({ compartilhado: true, regrasComplexas: true }), 'store');
assert.equal(escolherEstado({ compartilhado: false, frequente: true }), 'local');` }], solution: R`function escolherEstado(dado) {
  const d = dado || {};
  if (d.derivavel) return 'derivado';
  if (d.naUrl) return 'url';
  if (d.doServidor) return 'cache de servidor';
  if (d.formulario) return 'formulario';
  if (!d.compartilhado) return 'local';
  if (!d.frequente && !d.regrasComplexas) return 'context';
  return 'store';
}
`, explanation: 'A ordem codifica a regra de ouro: pare no primeiro degrau que resolve. O código é pequeno, mas obriga a equipe a explicitar as perguntas de classificação.' }
]
};

const P = 'estado-frontend-p';
export const assessment = {
  id: 'estado-frontend', title: 'Avaliação final — Gerenciamento de estado no frontend', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Um fato (por exemplo, o total do carrinho) pode ser calculado a partir de outro estado. Qual é a melhor prática?', options: ['Guardá-lo em estado e atualizá-lo com um efeito', 'Calculá-lo durante o render (ou em um seletor) sem guardá-lo', 'Guardá-lo no localStorage', 'Colocá-lo em uma store global'], answer: 1, explanation: 'Estado derivado não se guarda: evita duas fontes da verdade e renderizações extras.' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'Todo componente que chama useContext renderiza quando o valor do contexto muda, mesmo que use só parte dele e mesmo dentro de memo.', answer: true, explanation: 'Medido: dois consumidores em memo renderizaram quando mudou só uma parte do estado. Por isso se divide e se memoiza o valor.' },
    { id: P + '3', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual escolha de estado é a mais adequada para os filtros e a página de uma listagem que o usuário compartilha por link?', options: ['Zustand', 'Redux Toolkit', 'Parâmetros de busca da URL', 'useRef'], answer: 2, explanation: 'A URL como fonte da verdade mantém link, botão voltar e recarregar funcionando.' },
    { id: P + '4', type: 'trace', difficulty: 2, points: 10, prompt: 'Um thunk createAsyncThunk("usuarios/carregar") falha com rejectWithValue("inválido"). Estado inicial: { status: "ocioso", dados: null, erro: null }.', code: 'dispatch(carregar(0))\n// ações: ?  >  ?\n// estado final: status=?  erro=?', lang: 'text', steps: [{ q: 'Qual o tipo da segunda ação?', answers: ['usuarios/carregar/rejected'] }, { q: 'Qual o status final?', answers: ['erro'] }, { q: 'Qual o valor de erro?', answers: ['inválido', 'invalido'] }], explanation: 'Medido: pending e depois rejected; o payload do rejectWithValue vira o erro.' },
    { id: P + '5', type: 'mc', difficulty: 3, points: 10, prompt: 'Com Zustand v5, um componente usa useStore((s) => ({ n: s.n, nome: s.nome })) e a aplicação falha com "Maximum update depth exceeded". Qual a causa e a correção?', options: ['O seletor devolve um objeto novo a cada chamada; usar useShallow ou selecionar cada campo', 'O persist está desligado', 'A store precisa de um Provider', 'O estado deve ser movido para o Context'], answer: 0, explanation: 'Medido: sem useShallow o React entra em laço; useShallow mantém a referência quando os campos são iguais.' },
    { id: P + '6', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que impede o cache de funcionar corretamente quando o filtro muda.', code: 'function useVendas(regiao, ano) {\n  return useQuery({\n    queryKey: ["vendas", regiao],\n    queryFn: () => fetch("/api/vendas?regiao=" + regiao + "&ano=" + ano).then((r) => r.json())\n  });\n}', answer: 3, explanation: 'O ano é usado no queryFn mas não está na chave: trocar o ano mostra o cache de outro ano. A chave deve ser ["vendas", regiao, ano] (ou um objeto).' },
    { id: P + '7', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a atualização otimista.', code: 'onMutate: async (x) => {\n  await qc.[[0]]({ queryKey: chave });\n  const anterior = qc.getQueryData(chave);\n  qc.setQueryData(chave, (l) => [...l, x]);\n  return { anterior };\n},\nonError: (e, x, ctx) => qc.setQueryData(chave, ctx.[[1]]),\nonSettled: () => qc.invalidateQueries({ queryKey: chave })', answers: [['cancelQueries'], ['anterior']], explanation: 'Cancele buscas em andamento, guarde o snapshot, escreva o otimista, restaure no erro e invalide no final.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'Cenário: um aplicativo de reservas tem a lista de reservas do servidor, uma tela de edição com muitos campos e um carrinho de pré-reserva compartilhado por 12 telas, alterado com frequência e com regras de desconto. Qual combinação é a mais coerente?', options: ['Tudo em Redux Toolkit, inclusive a lista de reservas do servidor', 'TanStack Query para as reservas, estado local para o formulário e uma store (Zustand ou RTK) para o carrinho', 'Context único para tudo', 'useState na raiz com props até as folhas'], answer: 1, explanation: 'Cada tipo de estado recebe a ferramenta mais simples que o resolve; o carrinho tem alta frequência e regras, então justifica uma store.' },
    { id: P + '9', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a técnica ao problema que resolve.', pairs: [['createSelector', 'Evitar recalcular e re-renderizar derivações quando as entradas não mudaram'], ['Atualização otimista', 'Mostrar o resultado antes da confirmação do servidor, com rollback em caso de erro'], ['Normalização', 'Atualizar uma entidade em um só lugar'], ['Hidratação', 'Entregar ao cliente o cache já buscado no servidor']], explanation: 'Cada técnica trata um problema específico de estado.' },
    { id: P + '10', type: 'tf', difficulty: 3, points: 10, prompt: 'No servidor, é seguro reutilizar um único QueryClient entre as requisições de usuários diferentes.', answer: false, explanation: 'O cache compartilhado poderia vazar dados de um usuário para outro; crie um QueryClient por requisição.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Explique, com suas palavras, a diferença entre estado de cliente e estado de servidor e dê dois erros comuns de quem trata os dois do mesmo jeito.', model: 'Estado de cliente existe apenas no navegador e o app é a fonte da verdade (tema, painel aberto, rascunho). Estado de servidor é uma cópia de dados cuja fonte da verdade está no servidor: pode ficar velho, é assíncrono, tem carregamento e erro e é compartilhado entre telas. Erros comuns: copiar dados do servidor para uma store global e esquecer de atualizá-los (tela desatualizada, duas fontes da verdade); reimplementar à mão cache, deduplicação, retry e invalidação com efeitos e thunks, gerando corridas de resposta e dados velhos.', rubric: ['Define cada tipo com o critério da fonte da verdade', 'Cita que o estado de servidor envelhece e é assíncrono', 'Dá dois erros plausíveis (cópia para store, lógica manual de cache)', 'Aponta cache de servidor como solução'], explanation: 'É a distinção que organiza todo o curso.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Uma equipe quer trocar Redux por Zustand em todo o projeto de uma vez, sem testes. Qual abordagem é mais segura?', options: ['Trocar tudo no mesmo dia e corrigir os erros depois', 'Criar uma camada de acesso (hooks), migrar por fatia de funcionalidade com testes e registrar a decisão em um ADR', 'Manter as duas ferramentas indefinidamente com os mesmos dados nas duas', 'Cancelar a migração'], answer: 1, explanation: 'Migração gradual, atrás de uma camada de acesso, sem duplicar fontes da verdade, e com decisão registrada.' }
  ]
};

export const project = {
  id: 'painel-de-pedidos', name: 'Painel de pedidos com estado de servidor, estado de UI e documento de decisões (ADR)', lv: 'M', stack: 'React 19, TypeScript, TanStack Query, Zustand (ou Redux Toolkit), Vitest e Testing Library', ds: ['state'],
  desc: 'Construa um **painel de pedidos** em React que usa **cada tipo de estado no lugar certo**: a lista e o detalhe de pedidos em **TanStack Query** (consulta com chaves por filtro, §staleTime§, mutação com **atualização otimista** e rollback, e **paginação infinita**), filtros e página na **URL**, estado de UI global (tema e painel lateral) em **Zustand** (ou Redux Toolkit, à sua escolha justificada) e um formulário de edição com estado local. A API é **simulada localmente** (um módulo que devolve promises com atrasos e falhas controláveis, ou MSW). Entregue também um **documento de decisões (ADR)** que justifica as escolhas e as alternativas descartadas, e **testes** que cobrem reducers ou ações, seletores, o roteiro otimista e o comportamento da tela.',
  rf: ['Lista de pedidos com filtro de status e página lidos e escritos na URL (parâmetros de busca), com consulta TanStack Query cujas chaves incluem filtro e página', 'Detalhe do pedido em painel lateral, com pedido aberto guardado como id na URL', 'Ação de marcar o pedido como pago com atualização otimista (cancelar, snapshot, escrita, rollback e invalidação) e mensagem de erro quando a API simulada falha', 'Lista de histórico com paginação infinita (§useInfiniteQuery§) e botão "carregar mais"', 'Store de UI (Zustand ou RTK) com tema e painel lateral, persistência parcial do tema e seletores que evitam renderizações desnecessárias', 'Camada de acesso (hooks por funcionalidade) que esconde as ferramentas dos componentes', 'Documento ADR (Markdown) com contexto, decisão por tipo de estado, alternativas descartadas e consequências'],
  rnf: ['Nenhum dado de servidor copiado para a store de UI ou para useState', 'Estado derivado (totais, contagens) calculado e nunca armazenado', 'QueryClient novo por teste, com retry desligado, e stores criadas por teste', 'TypeScript estrito, com ações e respostas tipadas', 'Acessibilidade básica: estados de carregamento e erro anunciados (aria-busy, role="alert") e uso por teclado', 'README com instruções para executar, a árvore de decisão aplicada e as limitações'],
  ac: ['Testes de unidade provam as transições da store de UI (e do reducer, se usar RTK) e os seletores memoizados (sem recálculo quando a entrada não muda)', 'Um teste de integração prova a atualização otimista: o item aparece antes da resposta e volta ao estado anterior quando a API simulada falha', 'Um teste prova que dois componentes com a mesma chave geram uma única chamada à API simulada', 'Um teste prova que mudar filtro ou página na URL muda a chave e busca os dados corretos', 'O ADR cita pelo menos duas alternativas descartadas com o motivo e as consequências da decisão'],
  ch: ['Adicionar normalização de clientes e pedidos em uma store de cliente e comparar com o cache por chave', 'Implementar prefetch do detalhe ao passar o mouse na linha da lista', 'Adicionar hidratação de dados vindos de um servidor (SSR simulado) com QueryClient por requisição', 'Comparar a implementação da store de UI em Zustand e em Redux Toolkit e registrar um novo ADR com a conclusão', 'Persistir a fila de mutações pendentes para a conexão offline e retomá-la ao reconectar']
};
