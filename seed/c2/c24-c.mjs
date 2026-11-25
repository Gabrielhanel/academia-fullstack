// C2.4 — Gerenciamento de estado no frontend. Aulas 7 a 9 (TanStack Query II; normalização; estratégia em escala).
const R = String.raw;

export const REF3 = {
  tqInvalidation: { title: 'TanStack Query — Query Invalidation', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation', kind: 'doc' },
  tqOptimistic: { title: 'TanStack Query — Optimistic Updates', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates', kind: 'doc' },
  tqInfinite: { title: 'TanStack Query — Infinite Queries', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries', kind: 'doc' },
  tqPrefetch: { title: 'TanStack Query — Prefetching', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/prefetching', kind: 'doc' },
  tqSsr: { title: 'TanStack Query — Server Rendering & Hydration', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/ssr', kind: 'doc' },
  tqTesting: { title: 'TanStack Query — Testing', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/testing', kind: 'doc' },
  normalizing: { title: 'Redux — Normalizing State Shape', url: 'https://redux.js.org/usage/structuring-reducers/normalizing-state-shape', kind: 'doc' },
  entityAdapter: { title: 'Redux Toolkit — createEntityAdapter', url: 'https://redux-toolkit.js.org/api/createEntityAdapter', kind: 'doc' },
  adr: { title: 'ADR — Architectural Decision Records', url: 'https://adr.github.io/', kind: 'doc' },
  nygard: { title: 'Documenting Architecture Decisions (Michael Nygard)', url: 'https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions', kind: 'artigo' },
  reduxWhy: { title: 'Redux — Why Redux Toolkit is how to use Redux today', url: 'https://redux.js.org/introduction/why-rtk-is-redux-today', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'est-07', moduleId: 'm3', order: 7, minutes: 75, tags: ['TanStack Query', 'invalidação', 'optimistic update', 'paginação infinita', 'prefetch', 'hidratação'],
  title: 'TanStack Query II: invalidação, atualizações otimistas, paginação infinita, prefetch e hidratação',
  objectives: ['Invalidar consultas por prefixo e por chave exata e prever quais são refeitas', 'Implementar uma atualização otimista com cancelamento, snapshot, rollback e invalidação final', 'Montar uma lista com §useInfiniteQuery§ e §getNextPageParam§', 'Pré-carregar dados e hidratar o cache vindo do servidor', 'Testar componentes com TanStack Query de forma determinística'],
  intro: R`Na aula anterior vimos como **ler** dados. Agora, como mantê-los **corretos depois de escrever**: **invalidar** o que ficou velho, mostrar o resultado **antes** de o servidor responder (**atualização otimista**) e voltar atrás se falhar; como carregar **mais páginas**; e como **antecipar** dados (prefetch) e **entregá-los já prontos** do servidor (hidratação). Cada comportamento foi medido com @tanstack/react-query 5.108.4.`,
  theory: R`### Invalidação: "este dado está velho"
§queryClient.invalidateQueries({ queryKey })§ marca como **velhas** as queries que casam com a chave e **refaz imediatamente** as que estão **ativas** (usadas por algum componente montado); as inativas só serão refeitas quando alguém as usar. O casamento é por **prefixo**: §["todos"]§ atinge §["todos", "lista"]§ e §["todos", "item", 1]§. Medido: com três queries ativas (§["todos","lista"]§, §["todos","item",1]§ e §["outra"]§), invalidar §["todos"]§ refez as **duas** primeiras (contadores 2 e 2) e **não** a terceira (1). Depois, invalidar §["todos","lista"]§ com §exact: true§ refez **só** a lista (3). A função §invalidateQueries§ devolve uma promise que resolve quando as buscas terminam: retorne-a em §onSuccess§ para a mutação ficar "pendente" até os dados atualizarem.
Alternativas: §setQueryData§ **escreve** direto no cache (útil quando a resposta da mutação já traz o dado novo) e §refetchQueries§ refaz sem marcar.

### Atualização otimista
Mostra o efeito da ação **antes** do servidor confirmar, para a interface parecer instantânea. O roteiro oficial com **cache**:
1. §onMutate§: **cancele** buscas em andamento da chave (§cancelQueries§), senão uma resposta velha pode sobrescrever o dado otimista; guarde um **snapshot** (§getQueryData§); escreva o valor otimista com §setQueryData§; devolva o snapshot como **contexto**;
2. §onError§: **restaure** o snapshot (rollback) usando o contexto;
3. §onSettled§: **invalide** a chave para sincronizar com a verdade do servidor, tendo dado certo ou errado.
Medido: a lista começou com §["a"]§; ao mutar §"b"§, **durante** a mutação o cache mostrou §["a","b"]§ (otimista) e **depois do sucesso** continuou §["a","b"]§, igual ao servidor. Ao mutar §"c"§ com falha forçada, o cache mostrou §["a","b","c"]§ durante a mutação e **voltou** a §["a","b"]§ após o erro (rollback).
Cuidados: o otimismo vale para ações **muito prováveis de dar certo** (curtir, marcar); para operações críticas (pagamento) **espere** a confirmação; trate **várias mutações simultâneas** (o snapshot de uma pode apagar a otimista de outra: invalide só quando a última terminar ou use as variáveis da mutação em andamento); e mostre ao usuário que falhou.
Alternativa mais simples: usar o estado §variables§ da mutação (§useMutation§) para renderizar o item "pendente" na própria tela, sem mexer no cache.

### Paginação infinita
§useInfiniteQuery§ guarda **uma lista de páginas**. Você informa §initialPageParam§, o §queryFn§ recebe §pageParam§ e §getNextPageParam(últimaPágina)§ devolve o parâmetro da próxima (ou §undefined§ quando acabou). Medido: com 3 páginas simuladas, a primeira carga trouxe §[[1,2]]§ com §hasNextPage§ verdadeiro e §pageParams§ §[0]§; cada §fetchNextPage()§ acrescenta uma página. Para renderizar, percorra §data.pages§ (e achate: §data.pages.flatMap((p) => p.itens)§). Padrão de interface: botão "carregar mais" ou **observador de interseção** no fim da lista. Para listas enormes, combine com **virtualização**. Em paginação por cursor, o parâmetro é o cursor devolvido pelo servidor; em paginação por página numerada, cuidado com itens que entram e saem entre as buscas (duplicatas e pulos).

### Prefetch
§queryClient.prefetchQuery({ queryKey, queryFn })§ carrega dados **antes** de o componente existir, para a tela abrir sem espera: por exemplo, ao passar o mouse sobre um link, ou ao carregar a página 2 enquanto o usuário vê a 1. O dado fica no cache segundo o §staleTime§ configurado; sem §staleTime§, o prefetch ainda é útil para mostrar o dado velho **instantaneamente** enquanto atualiza.

### Hidratação: do servidor para o cliente
Em renderização no servidor (SSR, Next.js), o servidor busca os dados e os **entrega ao navegador** para o cliente **não buscar de novo**. O fluxo: o servidor cria um §QueryClient§ **por requisição**, faz §prefetchQuery§, serializa com §dehydrate(client)§ e envia; o cliente cria o seu §QueryClient§ e chama §hydrate§ (em React, o componente §HydrationBoundary§). Medido: o resumo do estado desidratado foi §[{ key: ["u",1], data: { nome: "Ana" }, status: "success" }]§; após hidratar um cliente novo com §staleTime: 60000§, o componente leu §{ nome: "Ana" }§ e o §queryFn§ do cliente foi chamado **0 vezes**. Se o §staleTime§ fosse 0, o cliente mostraria o dado hidratado e **atualizaria em segundo plano** logo em seguida. Detalhes de integração com o Next.js ficam para o curso C2.5.
Cuidados: nunca compartilhe um §QueryClient§ entre requisições de usuários diferentes no servidor (vazaria dados); os dados desidratados precisam ser **serializáveis**; e só desidrate o que o usuário pode ver.

### Testar componentes com TanStack Query
Boas práticas da documentação: crie um **QueryClient novo por teste** (sem cache compartilhado), com §retry: false§; envolva o componente no Provider; simule a rede (MSW ou um mock do §fetch§, aula da C2.6); aguarde o resultado com §findBy...§ ou §waitFor§. No laboratório, as consultas assíncronas foram aguardadas com §await act(async ...)§ e esperas curtas de tempo real; em seus testes, prefira esperar **o efeito visível** a esperar milissegundos fixos.

### Problemas comuns
- **Invalidar demais** (§invalidateQueries()§ sem chave) refaz tudo e gera tráfego.
- **Esquecer o cancelQueries** na atualização otimista: a resposta atrasada de uma busca sobrescreve o valor otimista.
- **Mutar o objeto do cache** em vez de criar um novo em §setQueryData§ (o cache espera dados imutáveis).
- **Hidratar com um cliente compartilhado** no servidor.
- **Chaves diferentes** entre servidor e cliente: o dado hidratado não é encontrado.`,
  concepts: [
    { term: 'Invalidação', def: 'Marcar queries como velhas e refazer as ativas, normalmente por prefixo de chave.' },
    { term: 'Atualização otimista', def: 'Mostrar o resultado esperado de uma mutação antes da confirmação do servidor, com rollback em caso de erro.' },
    { term: 'Rollback', def: 'Restauração do snapshot do cache quando uma mutação otimista falha.' },
    { term: 'setQueryData', def: 'Escreve diretamente no cache de uma query.' },
    { term: 'cancelQueries', def: 'Cancela buscas em andamento para que não sobrescrevam um dado otimista.' },
    { term: 'useInfiniteQuery', def: 'Hook que mantém uma lista de páginas e busca a próxima com fetchNextPage.' },
    { term: 'Prefetch', def: 'Carregar dados no cache antes de serem necessários.' },
    { term: 'Hidratação', def: 'Preencher o cache do cliente com os dados que o servidor já buscou.' },
    { term: 'dehydrate', def: 'Serializa o estado do cache para enviar do servidor ao cliente.' },
    { term: 'Contexto da mutação', def: 'Valor devolvido por onMutate e entregue a onError e onSettled (por exemplo, o snapshot).' }
  ],
  examples: R`**Analogia:** a atualização otimista é um **garçom que anota seu pedido na comanda e já responde "saindo!"** antes de confirmar com a cozinha. Se a cozinha avisar que acabou o ingrediente (erro), ele **risca** o item (rollback) e conta ao cliente. O cancelQueries é pedir à cozinha que **ignore a versão antiga da comanda** que ainda estava a caminho. A hidratação é a cozinha enviar o prato **já montado** na mesa, em vez de o cliente pedir de novo.

**Exemplo 1: invalidar por prefixo.** Três consultas ativas; invalidar o prefixo comum refez as duas que o compartilham e deixou a terceira intacta.

**Exemplo 2: otimista com falha.** O item "c" apareceu na hora e sumiu quando o servidor recusou.

**Exemplo 3: hidratação.** O cliente iniciou com o dado do servidor e fez 0 buscas enquanto o dado estava fresco.`,
  code: [
    { title: 'Atualização otimista completa (TypeScript)', lang: 'tsx', code: R`import { useMutation, useQueryClient } from '@tanstack/react-query';

type Tarefa = { id: string; titulo: string; feita: boolean };
const chave = ['tarefas'] as const;

export function useAlternarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const resp = await fetch('/api/tarefas/' + id + '/alternar', { method: 'POST' });
      if (!resp.ok) throw new Error('Falha ' + resp.status);
      return resp.json() as Promise<Tarefa>;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: chave });
      const anterior = qc.getQueryData<Tarefa[]>(chave);
      qc.setQueryData<Tarefa[]>(chave, (lista = []) => lista.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)));
      return { anterior };
    },
    onError: (_erro, _id, contexto) => {
      if (contexto?.anterior) qc.setQueryData(chave, contexto.anterior);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: chave })
  });
}`, notes: [{ l: '14', t: 'Primeiro cancele buscas pendentes: senão uma resposta velha sobrescreve o valor otimista.' }, { l: '15', t: 'O snapshot é devolvido como contexto e usado no rollback.' }, { l: '16', t: 'setQueryData recebe um novo array (imutável); nunca altere o objeto do cache.' }, { l: '20', t: 'Em erro, restaura o snapshot.' }, { l: '23', t: 'Dando certo ou errado, sincroniza com o servidor ao final.' }] },
    { title: 'Lista infinita (TypeScript)', lang: 'tsx', code: R`import { useInfiniteQuery } from '@tanstack/react-query';

type Pagina = { itens: { id: number; nome: string }[]; proximo: number | null };

export function ListaInfinita() {
  const q = useInfiniteQuery({
    queryKey: ['catalogo'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<Pagina> => {
      const resp = await fetch('/api/catalogo?cursor=' + pageParam);
      if (!resp.ok) throw new Error('Falha ' + resp.status);
      return resp.json();
    },
    getNextPageParam: (ultima) => ultima.proximo ?? undefined
  });
  if (q.isPending) return <p>Carregando...</p>;
  if (q.isError) return <p role="alert">Erro ao carregar</p>;
  const itens = q.data.pages.flatMap((p) => p.itens);
  return (
    <>
      <ul>{itens.map((i) => <li key={i.id}>{i.nome}</li>)}</ul>
      <button disabled={!q.hasNextPage || q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
        {q.isFetchingNextPage ? 'Carregando...' : q.hasNextPage ? 'Carregar mais' : 'Fim da lista'}
      </button>
    </>
  );
}`, notes: [{ l: '8', t: 'initialPageParam é obrigatório na v5.' }, { l: '13', t: 'Devolver undefined indica que não há próxima página (hasNextPage fica falso).' }, { l: '18', t: 'flatMap junta as páginas em uma lista para renderizar.' }] }
  ],
  bestPractices: ['Invalide por prefixo, o mais específico possível, e retorne a promise da invalidação em onSuccess.', 'Em atualizações otimistas: cancelar, snapshot, escrever, rollback e invalidar ao final.', 'Use otimismo só para ações prováveis de dar certo e mostre falhas ao usuário.', 'Crie um QueryClient por requisição no servidor e por teste.', 'Mantenha as mesmas chaves no servidor e no cliente para a hidratação.', 'Combine paginação infinita com virtualização em listas grandes.'],
  mistakes: ['Chamar invalidateQueries() sem chave e refazer tudo.', 'Esquecer cancelQueries e perder o valor otimista para uma resposta atrasada.', 'Alterar diretamente o array do cache.', 'Compartilhar um QueryClient entre usuários no servidor.', 'Esperar que o prefetch funcione sem staleTime e depois estranhar a busca de fundo.', 'Fazer atualização otimista em operações críticas (pagamento).'],
  market: R`Atualizações otimistas, invalidação e paginação infinita são o que separa interfaces que parecem rápidas das que parecem lentas, e aparecem em quase todo produto de consumo. Saber o roteiro completo (e seus riscos de concorrência) é uma pergunta frequente de entrevistas sobre dados no frontend.`,
  summary: R`Invalidar por prefixo refaz as queries ativas casadas (medido: duas de três; com §exact§ só a lista). A atualização otimista segue cancelar, snapshot, escrever, rollback e invalidar (medido: sucesso mantém o valor, falha volta ao estado anterior). §useInfiniteQuery§ acumula páginas e usa §getNextPageParam§. Prefetch antecipa dados; §dehydrate§ e §hydrate§ entregam o cache do servidor ao cliente (medido: 0 buscas no cliente com dado fresco). Teste com um cliente novo por teste e sem retry.`,
  refs: [REF3.tqInvalidation, REF3.tqOptimistic, REF3.tqInfinite, REF3.tqPrefetch, REF3.tqSsr, REF3.tqTesting],
  cards: [
    { q: 'O que invalidateQueries faz com queries inativas?', a: 'Marca como velhas; só serão refeitas quando alguém as usar. As ativas são refeitas na hora.' },
    { q: 'Qual o roteiro de uma atualização otimista?', a: 'onMutate: cancelar, snapshot e escrever; onError: rollback; onSettled: invalidar.' },
    { q: 'Por que usar cancelQueries antes de escrever o valor otimista?', a: 'Para que uma resposta atrasada de uma busca em andamento não sobrescreva o valor otimista.' },
    { q: 'Como o useInfiniteQuery sabe quando acabou?', a: 'getNextPageParam devolve undefined; hasNextPage fica falso.' },
    { q: 'Por que criar um QueryClient por requisição no servidor?', a: 'Para não vazar dados de um usuário para outro através de um cache compartilhado.' }
  ]
},
{
  id: 'est-08', moduleId: 'm4', order: 8, minutes: 65, tags: ['normalização', 'entidades', 'createEntityAdapter', 'seletores', 'relações'],
  title: 'Normalização de estado: entidades, relações e seletores memoizados',
  objectives: ['Reconhecer os problemas de dados aninhados e duplicados no estado', 'Normalizar uma lista em §ids§ e §entities§ e denormalizar para exibir', 'Atualizar uma entidade em um único lugar e ver a mudança refletida em toda a interface', 'Usar §createEntityAdapter§ e seus seletores', 'Escolher entre normalizar ou manter o cache do servidor como veio'],
  intro: R`Dados vindos de uma API costumam ser **aninhados e repetidos**: um pedido contém o cliente, que também aparece em outros pedidos. Se cada cópia vive em um lugar, atualizar o nome do cliente exige **encontrar todas**. **Normalizar** é guardar cada entidade **uma vez**, em uma tabela por id, e fazer as outras referirem-se a ela por id. Esta aula mostra a técnica, os seletores que a acompanham e quando ela **não** compensa.`,
  theory: R`### O problema dos dados aninhados
Imagine pedidos com o cliente embutido:
§§§
[{ id: 1, cliente: { id: 7, nome: "Ana" }, itens: [...] }, { id: 2, cliente: { id: 7, nome: "Ana" }, itens: [...] }]
§§§
Problemas: (1) **duplicação** (Ana aparece várias vezes); (2) **atualizar** o nome exige varrer todos os pedidos; (3) **encontrar** um pedido por id exige procurar no array; (4) aninhar mais fundo piora tudo (a atualização imutável de um campo profundo precisa copiar cada nível).

### A forma normalizada
Cada tipo de entidade vira um par §{ ids, entities }§: §ids§ guarda a **ordem** (um array de ids) e §entities§ é um **objeto indexado por id**. As relações viram **ids**:
§§§
{
  clientes: { ids: [7], entities: { 7: { id: 7, nome: "Ana" } } },
  pedidos:  { ids: [1, 2], entities: { 1: { id: 1, clienteId: 7 }, 2: { id: 2, clienteId: 7 } } }
}
§§§
Vantagens: **uma** fonte da verdade por entidade (atualizar Ana em um lugar atualiza toda a interface), **busca por id em tempo constante**, atualizações **rasas** (um objeto por entidade) e menos re-renderizações (só quem usa a entidade que mudou).

### Normalizar e denormalizar
- **Normalizar**: percorrer o dado aninhado, guardar cada entidade em sua tabela e substituir o objeto embutido pelo id. Faz-se na **entrada** (na resposta da API ou no reducer §fulfilled§).
- **Denormalizar**: reconstruir a forma "bonita" para exibir, **com seletores**: §pedido.cliente = clientes.entities[pedido.clienteId]§. Os componentes recebem dados prontos; o estado fica plano.
O laboratório de desafios desta aula implementa as duas funções puras (§normalizar§ e §denormalizar§), que valem para qualquer biblioteca.

### createEntityAdapter (Redux Toolkit)
Para o caso comum, o RTK traz o §createEntityAdapter§: ele gera a estrutura §{ ids, entities }§, **reducers prontos** (§setAll§, §addOne§, §updateOne§, §upsertMany§, §removeOne§...) e **seletores** (§selectAll§, §selectById§, §selectIds§, §selectTotal§). Medido: com §sortComparer§ por nome, §setAll§ de §[{id:2,nome:"Bia"},{id:1,nome:"Ana"}]§ produziu §{"ids":[1,2],"entities":{"1":{...Ana},"2":{...Bia}}}§ (ordenado pelo comparador); depois de §updateOne({ id: 2, changes: { nome: "Zé" } })§, §selectAll§ devolveu Ana e Zé e §selectById(2)§ devolveu Zé. Com §sortComparer§, a ordem de §ids§ é recalculada quando o campo de ordenação muda. Sem comparador, a ordem é a de inserção.

### Seletores memoizados e derivação
Denormalizar a cada render cria objetos novos: use **seletores memoizados** (§createSelector§ da aula est-03) que combinam as tabelas e só recalculam quando as entradas mudam. Para seletores com **parâmetro** (um id de cliente), crie uma **fábrica** ou use §selectById§ do adapter. Evite seletores que devolvem uma lista nova a cada chamada sem memoização (re-renderizações infinitas ou desnecessárias).

### Relações e índices
- **Um para muitos**: o lado "muitos" guarda o id do lado "um" (§clienteId§) e o seletor filtra: §pedidosDoCliente(id)§. Para acessos frequentes, guarde também um **índice** (lista de ids por cliente), mas isso é **dado derivado**: derive, a menos que a medição prove a necessidade.
- **Muitos para muitos**: uma tabela de ligação (§matriculas: { alunoId, cursoId }§).
- **Remoção**: remover uma entidade exige tratar as **referências** (órfãs) em outras tabelas.

### E o cache de servidor? (TanStack Query e RTK Query)
Bibliotecas de cache de servidor guardam a **resposta por chave**, **sem normalizar** (a lista de pedidos e o pedido individual podem ter cópias do mesmo dado). Isso é mais simples e, na maioria dos casos, suficiente; o preço é que, após uma mutação, é preciso **invalidar** ou **atualizar** as várias chaves afetadas (aula est-07). Bibliotecas de **cache normalizado** (como clientes GraphQL) resolvem isso automaticamente por identificadores de entidade, ao custo de mais complexidade. A regra prática: **não normalize por reflexo**. Normalize o **estado de cliente** que tem muitas entidades relacionadas e muitas atualizações parciais (um editor, um quadro kanban, um chat); para telas de leitura alimentadas pelo servidor, invalide.

### Ordem e estabilidade
- Mantenha a **ordem** em §ids§ (ou ordene com seletor); objetos não garantem ordem por inteiros em algumas operações (chaves numéricas são ordenadas numericamente em JavaScript).
- Ao receber atualizações do servidor, use **upsert** (inserir ou mesclar) para não duplicar.
- **Imutabilidade**: o Immer do RTK cuida; fora dele, copie o caminho alterado.

### Quando não normalizar
Dados pequenos, somente leitura, ou usados em um único lugar; ou quando o servidor já envia o dado na forma que a tela usa. Normalizar custa código de entrada e de saída.`,
  concepts: [
    { term: 'Normalização', def: 'Guardar cada entidade uma única vez, indexada por id, e representar relações por ids.' },
    { term: 'Denormalização', def: 'Reconstruir a forma aninhada a partir das tabelas normalizadas, normalmente com seletores.' },
    { term: 'ids e entities', def: 'Estrutura com a lista ordenada de ids e o objeto das entidades indexado por id.' },
    { term: 'Entidade', def: 'Objeto com identidade própria (um id) cujo estado é mantido em uma única tabela.' },
    { term: 'createEntityAdapter', def: 'Utilitário do RTK que gera a estrutura normalizada, reducers e seletores para uma entidade.' },
    { term: 'Upsert', def: 'Inserir a entidade se não existir ou mesclar com a existente.' },
    { term: 'Referência órfã', def: 'Id que aponta para uma entidade removida.' },
    { term: 'Cache normalizado', def: 'Cache que guarda objetos por identificador e os compartilha entre consultas.' },
    { term: 'Seletor com parâmetro', def: 'Seletor que depende de um argumento (um id), criado por fábrica ou por selectById.' },
    { term: 'Índice derivado', def: 'Estrutura auxiliar (lista de ids por critério) calculada a partir das tabelas.' }
  ],
  examples: R`**Analogia:** um **banco de dados relacional** em miniatura. Em vez de escrever o endereço do cliente em cada nota fiscal, você guarda o cliente **uma vez** em um cadastro e as notas apontam para o **código do cliente**. Quando o cliente muda de endereço, você corrige em **um** lugar e todas as notas, ao serem impressas (denormalização), mostram o endereço novo.

**Exemplo 1: atualizar uma entidade.** Mudar o nome de Ana (id 7) em §clientes.entities[7]§ atualiza todos os pedidos que a referenciam, sem tocar nos pedidos.

**Exemplo 2: createEntityAdapter.** setAll com ordenação por nome, depois updateOne trocando "Bia" por "Zé": selectAll refletiu a mudança e selectById(2) devolveu o novo nome (medido).

**Exemplo 3: quando não compensa.** Uma lista de produtos de leitura, alimentada pelo TanStack Query, não precisa de normalização: invalide a chave quando mudar.`,
  code: [
    { title: 'normalizar e denormalizar (JavaScript puro)', lang: 'js', code: R`function normalizar(pedidos) {
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

const bruto = [
  { id: 1, cliente: { id: 7, nome: 'Ana' }, total: 10 },
  { id: 2, cliente: { id: 7, nome: 'Ana' }, total: 20 }
];
const n = normalizar(bruto);
n.clientes.entities[7].nome = 'Ana Souza'; // um só lugar
console.log(denormalizar(n).map((p) => p.cliente.nome)); // ['Ana Souza', 'Ana Souza']`, notes: [{ l: '5', t: 'O cliente embutido é separado do pedido; o pedido guarda só o clienteId.' }, { l: '6', t: 'Insere o id uma única vez, mesmo que o cliente apareça em vários pedidos.' }, { l: '15', t: 'A denormalização reconstrói a forma aninhada para exibição.' }, { l: '27', t: 'Uma única alteração aparece nos dois pedidos.' }] },
    { title: 'createEntityAdapter e seletores (TypeScript)', lang: 'ts', code: R`import { createEntityAdapter, createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';

type Cliente = { id: number; nome: string };
type Pedido = { id: number; clienteId: number; total: number };

const clientes = createEntityAdapter<Cliente>({ sortComparer: (a, b) => a.nome.localeCompare(b.nome) });
const pedidos = createEntityAdapter<Pedido>();

const slice = createSlice({
  name: 'dados',
  initialState: { clientes: clientes.getInitialState(), pedidos: pedidos.getInitialState() },
  reducers: {
    carregado(state, a: PayloadAction<{ clientes: Cliente[]; pedidos: Pedido[] }>) {
      clientes.setAll(state.clientes, a.payload.clientes);
      pedidos.setAll(state.pedidos, a.payload.pedidos);
    },
    clienteRenomeado(state, a: PayloadAction<{ id: number; nome: string }>) {
      clientes.updateOne(state.clientes, { id: a.payload.id, changes: { nome: a.payload.nome } });
    }
  }
});

type Root = { dados: ReturnType<typeof slice.reducer> };
const selClientes = clientes.getSelectors((s: Root) => s.dados.clientes);
const selPedidos = pedidos.getSelectors((s: Root) => s.dados.pedidos);

export const selecionarPedidosComCliente = createSelector(
  [selPedidos.selectAll, selClientes.selectEntities],
  (lista, porId) => lista.map((p) => ({ ...p, cliente: porId[p.clienteId] }))
);`, notes: [{ l: '6', t: 'sortComparer mantém ids ordenados por nome.' }, { l: '14', t: 'Os reducers do adapter recebem o pedaço do estado (rascunho do Immer).' }, { l: '23', t: 'getSelectors liga os seletores do adapter ao caminho da fatia dentro do estado raiz.' }, { l: '26', t: 'Seletor memoizado: só recalcula se a lista de pedidos ou as entidades de clientes mudarem.' }] }
  ],
  bestPractices: ['Normalize estado de cliente com muitas entidades relacionadas e atualizações parciais.', 'Guarde ids para relações e denormalize com seletores memoizados.', 'Use upsert ao receber dados repetidos do servidor.', 'Trate referências ao remover entidades.', 'Prefira invalidar a normalizar quando o dado é só de leitura vindo do servidor.', 'Use createEntityAdapter em vez de reescrever reducers de CRUD.'],
  mistakes: ['Normalizar por reflexo dados pequenos e de leitura.', 'Denormalizar dentro do componente a cada render, criando objetos novos.', 'Duplicar a entidade em duas tabelas.', 'Esquecer referências órfãs depois de remover.', 'Criar seletores com parâmetro sem memoização.', 'Confiar na ordem das chaves do objeto em vez de usar ids.'],
  market: R`Quadros, editores e chats exigem estado com muitas entidades que mudam parcialmente; normalizar é o que mantém esses aplicativos consistentes e rápidos. Saber quando **não** normalizar (e preferir invalidação) mostra maturidade e é um bom tema de revisão de arquitetura.`,
  summary: R`Normalizar é guardar cada entidade uma vez em §{ ids, entities }§ e relacionar por id, denormalizando com seletores memoizados. Atualizar Ana em um lugar atualiza todos os pedidos. O §createEntityAdapter§ gera reducers e seletores (medido: ordenação por comparador, §updateOne§ e §selectById§). Para dados de servidor somente de leitura, o cache por chave com invalidação costuma bastar; normalize o estado de cliente com muitas relações.`,
  refs: [REF3.normalizing, REF3.entityAdapter],
  cards: [
    { q: 'O que significa normalizar o estado?', a: 'Guardar cada entidade uma só vez, indexada por id, e representar as relações por ids.' },
    { q: 'Qual a estrutura do createEntityAdapter?', a: 'Um objeto com ids (lista ordenada) e entities (objeto indexado por id).' },
    { q: 'Onde se denormaliza?', a: 'Em seletores memoizados, que combinam as tabelas para exibição.' },
    { q: 'Quando não normalizar?', a: 'Dados pequenos, só de leitura ou já na forma que a tela usa; prefira invalidação do cache de servidor.' },
    { q: 'O que fazer ao remover uma entidade referenciada?', a: 'Tratar as referências órfãs nas outras tabelas.' }
  ]
},
{
  id: 'est-09', moduleId: 'm4', order: 9, minutes: 70, tags: ['arquitetura', 'ADR', 'decisão', 'migração', 'testes de estado', 'escala'],
  title: 'Estratégia de estado em escala: árvore de decisão, ADRs, migração gradual e testes',
  objectives: ['Aplicar uma árvore de decisão para escolher onde cada estado vive', 'Escrever um registro de decisão de arquitetura (ADR) justificando as escolhas', 'Planejar uma migração gradual entre ferramentas de estado', 'Testar a lógica de estado (reducers, seletores, stores e cache de servidor) em níveis diferentes', 'Evitar os erros típicos de arquitetura de estado em equipes grandes'],
  intro: R`Em um produto real, não se escolhe "uma biblioteca de estado" para tudo. Escolhe-se, para **cada tipo de estado**, a ferramenta mais simples que resolve, **documenta-se o porquê** e deixa-se o caminho de **mudança** aberto. Esta aula junta o curso inteiro em uma **árvore de decisão**, mostra como registrar decisões em **ADRs**, como **migrar** sem reescrever tudo e como **testar** a camada de estado.`,
  theory: R`### Uma árvore de decisão (do mais simples ao mais complexo)
Para cada dado, pergunte na ordem:
1. **Pode ser derivado** de outro dado? Então **não é estado**: calcule (aula est-01).
2. **Pertence à URL** (filtro, página, id selecionado compartilhável)? Use **parâmetros de rota ou de busca**.
3. **Vem do servidor**? Use um **cache de servidor** (TanStack Query ou RTK Query), com chaves e invalidação (aulas est-06 e est-07). Não copie para outra store.
4. É **estado de formulário**? Estado local ou biblioteca de formulários; envie ao servidor por mutação.
5. É usado por **um só componente** (ou um pequeno ramo)? §useState§ ou §useReducer§ local; **eleve** apenas até o ancestral comum.
6. É **compartilhado** por uma região da árvore, de **baixa frequência** (tema, idioma, sessão)? **Context** (valor memoizado, aula est-02).
7. É **estado de cliente compartilhado**, de **alta frequência** ou com **regras complexas**? Uma **store**: **Zustand** (menos cerimônia) ou **Redux Toolkit** (convenções, ações rastreáveis, ecossistema).
Regra de ouro: pare no **primeiro** degrau que resolve. Cada degrau a mais custa código, aprendizado e re-renderizações.

### Critérios para escolher entre Zustand e Redux Toolkit
- **Tamanho e rotatividade da equipe**: estrutura imposta ajuda times grandes; Zustand pede mais disciplina.
- **Rastreabilidade**: Redux dá ações nomeadas e DevTools por padrão; no Zustand é opcional (middleware).
- **Regras de negócio no cliente**: muitos eventos e reações favorecem reducers e listeners.
- **Ecossistema já presente**: se o projeto já usa Redux, não troque sem motivo mensurável.
- **Servidor**: se há RTK Query, os dados de servidor já estão resolvidos dentro do Redux.
Nenhum critério é "o melhor": a decisão deve ser **registrada** e **revisitável**.

### ADR: registro de decisão de arquitetura
Um **ADR** é um documento curto, versionado junto ao código, que registra **uma decisão**. Formato clássico (Michael Nygard): **Título**, **Status** (proposta, aceita, substituída), **Contexto** (as forças em jogo), **Decisão**, **Consequências** (boas e ruins). Boas práticas: um ADR por decisão; escreva **quando** a decisão é tomada; registre as **alternativas descartadas e por quê**; **não apague** ADRs antigos: marque-os como substituídos e aponte o novo. Exemplo de decisão: "Estado de servidor usa TanStack Query; estado de UI global usa Zustand; filtros ficam na URL; o Context é só para tema e sessão".

### Migração gradual
Reescrever tudo de uma vez é arriscado. Estratégia incremental:
1. **Estabeleça a fronteira**: uma camada de acesso (hooks como §usePedidos()§, §useCarrinho()§) que **esconde** a ferramenta. Os componentes só conhecem os hooks.
2. **Migre por fatia de funcionalidade**, não por camada: um fluxo (por exemplo, a lista de pedidos) de cada vez, com testes cobrindo o comportamento.
3. **Convivência temporária**: duas ferramentas coexistem; **proibida** a duplicação do mesmo dado.
4. **Retire o antigo** quando a última fatia migrar; registre em ADR.
Exemplo comum: migrar buscas feitas com §useEffect§ (ou thunks) para o TanStack Query, fatia por fatia, e **apagar** os reducers de dados de servidor que sobraram.

### Testes de estado, por nível
- **Reducers, seletores e fábricas de chaves**: funções puras; teste direto, sem React (rápido e preciso).
- **Stores**: chame as ações e leia §getState()§ (Zustand) ou despache na store de teste (Redux); a store deve ser **criada por teste** para não vazar estado entre testes.
- **Componentes com Provider**: use um **wrapper** que cria uma store ou um §QueryClient§ novo (com §retry: false§) para cada teste; verifique o **comportamento visível**, não os detalhes internos.
- **Rede**: simule as respostas (MSW, aula da C2.6) e teste os estados de carregamento, sucesso, erro e atualização otimista com rollback.
- **Contrato com o servidor**: testes de integração e de contrato ficam em outra camada (cursos de back-end).
Evite testar a biblioteca (que ela já faz) e evite testar **estado interno** em vez do efeito na tela.

### Riscos recorrentes em escala
- **Global demais**: tudo na store, inclusive o que é local; sintoma: a store cresce e ninguém sabe quem a usa.
- **Duas fontes da verdade**: dados de servidor copiados em store e cache.
- **Seletores ausentes**: componentes lendo a store inteira.
- **Efeitos para sincronizar**: o sinal de alerta mais claro de estado duplicado.
- **Persistência sem versão**: o formato muda e o armazenamento antigo quebra o app (use §version§ e §migrate§).
- **Ferramenta como religião**: trocar de biblioteca sem problema mensurável.

### Medir antes de otimizar
Se a interface está lenta, **meça** (Profiler do React, aula do C2.3) e identifique **qual** estado causa renderizações. Muitas vezes a correção é **mover o estado para perto de quem usa**, **dividir** um contexto ou **selecionar menos**, e não trocar de biblioteca.`,
  concepts: [
    { term: 'Árvore de decisão de estado', def: 'Sequência de perguntas que leva cada dado ao lugar mais simples que o resolve.' },
    { term: 'ADR', def: 'Registro curto e versionado de uma decisão de arquitetura, com contexto, decisão e consequências.' },
    { term: 'Status de um ADR', def: 'Situação da decisão: proposta, aceita ou substituída.' },
    { term: 'Camada de acesso', def: 'Hooks que escondem a ferramenta de estado dos componentes e facilitam a migração.' },
    { term: 'Migração gradual', def: 'Troca de ferramenta fatia por fatia, com convivência temporária e sem duplicar dados.' },
    { term: 'Store de teste', def: 'Store ou QueryClient criado do zero para cada teste, evitando vazamento de estado.' },
    { term: 'Estado global excessivo', def: 'Colocar na store dados que deveriam ser locais, de URL ou de servidor.' },
    { term: 'Versão de persistência', def: 'Número que identifica o formato gravado e permite migrar dados antigos.' },
    { term: 'Teste de comportamento', def: 'Teste que verifica o resultado visível para o usuário, e não detalhes internos.' },
    { term: 'Fronteira de estado', def: 'Ponto onde se separa o estado de cliente do estado de servidor e de URL.' }
  ],
  examples: R`**Analogia:** a árvore de decisão é uma **triagem hospitalar**: nem todo paciente vai para a UTI (a store global). A maioria resolve no balcão (estado local ou derivado). O ADR é o **prontuário**: explica por que se escolheu aquele tratamento, para o próximo plantonista não desfazer a decisão por desconhecimento. A migração gradual é uma **reforma com a casa habitada**: um cômodo de cada vez, sem quebrar a água.

**Exemplo 1: painel de pedidos.** Lista de pedidos: TanStack Query; filtro e página: URL; pedido aberto no painel: URL; tema e painel lateral: Zustand; formulário de edição: estado local; total em aberto: derivado.

**Exemplo 2: ADR.** "Decisão: Zustand para estado de UI global. Alternativas: Redux Toolkit (descartado: sem regras de negócio complexas no cliente), Context (descartado: muitos consumidores com atualizações frequentes). Consequência: a equipe precisa seguir o padrão de fatias."

**Exemplo 3: migração.** A lista de usuários passou de thunks para §useUsuarios()§ com TanStack Query; o reducer de usuários foi apagado.`,
  code: [
    { title: 'Camada de acesso que esconde a ferramenta (TypeScript)', lang: 'tsx', code: R`// features/pedidos/hooks.ts: os componentes só importam daqui
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';

export const pedidosKeys = { lista: (status: string) => ['pedidos', 'lista', { status }] as const };

export function usePedidos(status: string) {
  return useQuery({ queryKey: pedidosKeys.lista(status), queryFn: () => fetch('/api/pedidos?status=' + status).then((r) => r.json()), staleTime: 30_000 });
}

type UiState = { painelAberto: boolean; alternarPainel: () => void };
const useUi = create<UiState>((set) => ({ painelAberto: false, alternarPainel: () => set((s) => ({ painelAberto: !s.painelAberto })) }));

export function usePainel() {
  const aberto = useUi((s) => s.painelAberto);
  const alternar = useUi((s) => s.alternarPainel);
  return { aberto, alternar };
}`, notes: [{ l: '1', t: 'A camada de acesso é a fronteira: trocar Zustand por Redux altera só este arquivo.' }, { l: '7', t: 'Estado de servidor com cache: nunca é copiado para a store de UI.' }, { l: '13', t: 'A store de UI guarda só estado de cliente.' }] },
    { title: 'Modelo de um ADR (Markdown)', lang: 'md', code: R`# ADR 007: Estado do painel de pedidos

Status: aceita (2026-11-25)

## Contexto
A tela lista pedidos do servidor, permite filtrar, abrir um pedido em painel lateral e editar. A equipe tem 4 pessoas e já usa React Router. Não há regras de negócio complexas no cliente.

## Decisão
- Pedidos (servidor): TanStack Query, chaves por filtro, staleTime de 30 s.
- Filtro, página e pedido aberto: parâmetros de busca da URL.
- Tema e painel lateral: Zustand (store de UI).
- Formulário de edição: estado local, enviado por mutação com invalidação.

## Alternativas descartadas
- Redux Toolkit: estrutura pesada para o escopo.
- Context para o painel: muitos consumidores e atualizações frequentes.

## Consequências
- Menos código de carregamento e erro.
- A equipe precisa dominar chaves e invalidação.
- Reavaliar se surgirem regras de negócio complexas no cliente.`, notes: [{ l: '3', t: 'O status e a data situam a decisão no tempo.' }, { l: '12', t: 'As alternativas descartadas evitam rediscutir a mesma ideia sem fatos novos.' }] }
  ],
  bestPractices: ['Aplique a árvore de decisão e pare no primeiro degrau que resolve.', 'Registre decisões em ADRs com alternativas e consequências.', 'Esconda a ferramenta de estado atrás de hooks por funcionalidade.', 'Migre por fatia, sem duplicar a mesma fonte da verdade.', 'Crie stores e QueryClients novos em cada teste.', 'Meça antes de trocar de biblioteca.'],
  mistakes: ['Escolher a ferramenta antes de classificar o estado.', 'Colocar tudo em uma store global.', 'Manter duas cópias do mesmo dado de servidor.', 'Reescrever tudo de uma vez.', 'Apagar ADRs antigos em vez de marcá-los como substituídos.', 'Testar detalhes internos da biblioteca em vez do comportamento.'],
  market: R`Em empresas, a pergunta raramente é "qual biblioteca é melhor", e sim "qual combinação resolve com o menor custo e como documentar". Saber conduzir essa decisão, escrever um ADR e planejar uma migração gradual é uma competência de nível pleno e sênior e aparece em entrevistas de arquitetura de frontend.`,
  summary: R`Classifique cada dado e escolha o degrau mais simples: derivado, URL, cache de servidor, formulário, local, Context, store (Zustand ou Redux Toolkit). Registre a decisão em um ADR com contexto, alternativas e consequências. Migre de forma gradual, por fatia de funcionalidade, atrás de uma camada de acesso, sem duplicar fontes da verdade. Teste reducers e seletores como funções puras e use stores e QueryClients novos por teste. Meça antes de trocar de ferramenta.`,
  refs: [REF3.adr, REF3.nygard, REF3.reduxWhy],
  cards: [
    { q: 'Qual é a primeira pergunta da árvore de decisão?', a: 'O dado pode ser derivado de outro? Se sim, não é estado.' },
    { q: 'O que um ADR registra?', a: 'Uma decisão: título, status, contexto, decisão, alternativas descartadas e consequências.' },
    { q: 'Como migrar de ferramenta sem reescrever tudo?', a: 'Criar uma camada de acesso (hooks), migrar por fatia de funcionalidade e remover o antigo no final.' },
    { q: 'Por que criar stores e QueryClients novos em cada teste?', a: 'Para evitar vazamento de estado e de cache entre testes.' },
    { q: 'Qual o primeiro passo se a interface está lenta?', a: 'Medir com o Profiler e identificar qual estado causa as renderizações, antes de trocar de biblioteca.' }
  ]
}
];
