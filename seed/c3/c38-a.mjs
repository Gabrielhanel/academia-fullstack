// C3.8 — Estratégias de cache. Aulas 1 a 3 (por que cachear e cache-aside; stampede e cache negativo; write-through e write-behind).
const R = String.raw;

export const REF = {
  redisSet: { title: 'Redis — SET', url: 'https://redis.io/docs/latest/commands/set/', kind: 'doc' },
  redisEviction: { title: 'Redis — Key eviction', url: 'https://redis.io/docs/latest/develop/reference/eviction/', kind: 'doc' },
  redisLocks: { title: 'Redis — Distributed Locks', url: 'https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/', kind: 'doc' },
  redisClientCache: { title: 'Redis — Client-side caching', url: 'https://redis.io/docs/latest/develop/clients/client-side-caching/', kind: 'doc' },
  redisPubsub: { title: 'Redis — Pub/Sub', url: 'https://redis.io/docs/latest/develop/pubsub/', kind: 'doc' },
  redisCluster: { title: 'Redis — Cluster specification', url: 'https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/', kind: 'doc' },
  httpCaching: { title: 'MDN — HTTP caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching', kind: 'doc' },
  cacheControl: { title: 'MDN — Cache-Control', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control', kind: 'doc' },
  rfc9111: { title: 'RFC 9111 — HTTP Caching', url: 'https://www.rfc-editor.org/rfc/rfc9111', kind: 'especificação' },
  memcachePaper: { title: 'Scaling Memcache at Facebook (NSDI 2013)', url: 'https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf', kind: 'artigo' },
  pgStat: { title: 'PostgreSQL — Monitoring statistics', url: 'https://www.postgresql.org/docs/17/monitoring-stats.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'cch-01', moduleId: 'm1', order: 1, minutes: 75, tags: ['cache', 'cache-aside', 'taxa de acerto', 'TTL', 'latência', 'hierarquia de cache'],
  title: 'Por que e quando cachear: latência, taxa de acerto e o padrão cache-aside',
  objectives: ['Explicar o que um cache resolve e o que ele custa (obsolescência, complexidade, memória)', 'Medir o ganho antes de cachear, distinguindo consultas caras de consultas baratas', 'Implementar o padrão cache-aside com Redis e TTL', 'Calcular e interpretar a taxa de acerto (hit ratio)', 'Distinguir as camadas de cache: processo, Redis, navegador e CDN'],
  intro: R`**"Só existem duas coisas difíceis em ciência da computação: invalidação de cache e dar nomes às coisas."** A frase é velha e continua certa. Um cache **guarda uma cópia** de um resultado caro para devolvê-lo rápido na próxima vez; em troca, essa cópia **pode ficar desatualizada**. Esta aula usa **PostgreSQL 17.12 e Redis 8.12.0** com **500.000 produtos** para **medir** o ganho, e mostra o padrão mais usado do mundo: o **cache-aside**.`,
  theory: R`### O que é um cache e quando ele vale a pena
Um **cache** é uma **memória mais rápida e menos durável** na frente de uma fonte mais lenta (a **fonte da verdade**: o banco de dados). A cópia dá **latência menor**, **menos carga** na fonte e **mais capacidade** de leitura. Os **custos**: **dados possivelmente obsoletos**, **um componente a mais** que pode falhar, **memória** e **lógica de invalidação**.
Regra de ouro: **meça antes**. Cachear algo que já é rápido só adiciona complexidade. Nos testes do laboratório:
| Consulta | PostgreSQL | Redis | Map no processo |
|---|---|---|---|
| **Relatório agregado** (500.000 linhas, GROUP BY) | **~183 ms** | **~1,0 ms** | **~0,003 ms** |
| **Produto por chave primária** | **~1,8 ms** | **~0,97 ms** | n/a |
Para o **relatório caro**, o Redis foi **~183 vezes** mais rápido. Para a **consulta por chave primária**, só **~1,8 vezes**: o banco já respondia bem (a ida e volta de rede ao Redis custa quase o mesmo que a consulta). **Lição**: cachear **consultas caras e muito repetidas**, não tudo.

### Hierarquia de caches
- **No processo** (um §Map§, bibliotecas de LRU): **o mais rápido** (~0,003 ms, sem rede), mas **cada instância tem o seu**, ocupa a memória da aplicação e **não é compartilhado**.
- **Distribuído** (Redis, Memcached): **compartilhado** por todas as instâncias, ~1 ms por ida e volta; sobrevive ao reinício da aplicação.
- **Navegador e proxies** (cabeçalhos HTTP §Cache-Control§, §ETag§): **nenhuma requisição** chega ao servidor.
- **CDN**: cópias perto do usuário para conteúdo público e estático.
- **No banco**: *buffer cache* do PostgreSQL, que já guarda páginas quentes em memória.
Pense em **camadas**: cada nível reduz a carga do seguinte, e cada um tem sua **política de validade**.

### Cache-aside (lazy loading)
É o padrão em que **a aplicação** gerencia o cache:
1. **Ler** a chave no cache. **Acerto** (*hit*): devolver.
2. **Falha** (*miss*): consultar o banco, **gravar** o resultado no cache (com **TTL**) e devolver.
3. **Escrever**: gravar no banco e **invalidar** (ou atualizar) a chave (aula cch-04).
§§§
async function produto(id) {
  const c = await redis.get('p:' + id);
  if (c) return JSON.parse(c);                       // acerto
  const linha = await db.query('select ... where id = $1', [id]);
  await redis.set('p:' + id, JSON.stringify(linha), 'EX', 300);   // TTL de 5 minutos
  return linha;
}
§§§
**Vantagens**: simples; **só dados realmente pedidos** entram no cache; se o cache cair, o sistema **continua funcionando** (mais lento), pois a fonte da verdade é o banco. **Desvantagens**: a **primeira leitura é lenta**; há **janela de obsolescência**; a lógica fica **na aplicação** (e pode estar duplicada).

### Taxa de acerto
**Taxa de acerto = acertos ÷ leituras.** Medido: **10.000 leituras** de 1.000 produtos, com **80% das leituras nos 200 mais populares** (distribuição realista: poucos itens recebem a maioria dos acessos), TTL de 300 s:
- **Sem cache**: **10.000 consultas** ao banco; ~11,1 s no total.
- **Cache-aside**: **948 consultas** ao banco; **9.052 acertos** → **taxa de acerto de 90,5%**; ~8,2 s no total.
Dois efeitos: a **carga no banco caiu ~91%** (efeito principal) e o tempo caiu menos (**~26%**) porque a consulta por chave já era barata. Essa é a razão pela qual a **taxa de acerto** é a métrica central: ela **determina o ganho**. Uma taxa baixa significa **cache mal dimensionado, TTL curto demais, chaves demais (baixa repetição)** ou **dados muito variados**.
(Medido em **uma execução**; os números variam, a forma não.)

### TTL: a validade mínima
O **TTL** limita a **obsolescência máxima**: dados mudam, mas **o pior caso é o TTL**. Escolha pelo **custo do erro**: preço (segundos a minutos), perfil (minutos a horas), conteúdo estático (dias, com versão no nome). Sem TTL, uma falha de invalidação **vira obsolescência permanente** (e o cache só cresce). **Use TTL em tudo** (aula nsq-06).

### O que cachear
- **Boa candidata**: leitura **cara** (agregações, junções), **muito repetida**, que **tolera atraso** e é **igual para muitos usuários** (catálogo, rankings, configurações).
- **Má candidata**: dados **por usuário** de baixa repetição, **escritas** frequentes, dados que **não toleram atraso** (saldo, estoque no pagamento), consultas **já baratas** (como a por chave primária).

### Cuidados iniciais
- **Chaves**: padronize (§entidade:id§, §relatorio:vendas:2026-11§) e **inclua tudo que muda o resultado** (idioma, filtros, versão do esquema).
- **Serialização**: JSON é prático; custa CPU e bytes.
- **Nunca coloque segredos** ou dados pessoais sensíveis sem necessidade em um cache compartilhado.
- **Cache não é fonte da verdade**: tudo que está nele deve poder ser **reconstruído**.`,
  concepts: [
    { term: 'Cache', def: 'Memória mais rápida que guarda cópias de resultados da fonte da verdade para reduzir latência e carga.' },
    { term: 'Cache-aside', def: 'Padrão em que a aplicação lê o cache e, na falha, busca no banco e preenche o cache.' },
    { term: 'Acerto (hit)', def: 'Leitura atendida pelo cache.' },
    { term: 'Falha (miss)', def: 'Leitura que não encontrou a chave no cache e precisou ir à fonte.' },
    { term: 'Taxa de acerto', def: 'Proporção de leituras atendidas pelo cache.' },
    { term: 'TTL', def: 'Tempo de vida de uma entrada do cache, limitando a obsolescência.' },
    { term: 'Fonte da verdade', def: 'O armazenamento definitivo dos dados, do qual o cache é cópia.' },
    { term: 'Obsolescência (staleness)', def: 'Situação em que o cache guarda uma versão desatualizada do dado.' },
    { term: 'Buffer cache', def: 'Cache de páginas de disco mantido pelo próprio banco em memória.' },
    { term: 'Hierarquia de caches', def: 'Camadas de cache (processo, distribuído, navegador, CDN) que reduzem a carga em cascata.' }
  ],
  examples: R`**Analogia:** um cache é a **caderneta de telefones perto do telefone** (as pessoas mais ligadas), enquanto a **lista telefônica completa** está na estante (o banco). Procurar na caderneta é rápido; se o número mudou e você não anotou, **liga errado** (obsolescência). **Cache-aside** é **anotar na caderneta cada número que você teve de procurar na lista**; o **TTL** é **apagar a anotação depois de um mês** para forçar a conferência. Uma caderneta com **90%** dos números que você precisa tem taxa de acerto de 90%.

**Exemplo 1: relatório.** 183 ms no banco contra 1 ms no Redis.

**Exemplo 2: taxa de acerto.** 9.052 acertos em 10.000 leituras (90,5%) e 948 consultas ao banco.

**Exemplo 3: não cachear.** Consulta por chave primária de ~1,8 ms ganhou só 1,8x.`,
  code: [
    { title: 'Cache-aside com ioredis e pg (JavaScript, taxa de acerto medida)', lang: 'js', code: R`import Redis from 'ioredis';
import pg from 'pg';
const redis = new Redis({ host: '127.0.0.1', port: 56379 });
const pool = new pg.Pool({ host: '127.0.0.1', port: 55432, user: 'postgres', password: 'lab', database: 'cachelab' });

async function produto(id) {
  const c = await redis.get('p:' + id);
  if (c) return JSON.parse(c);                                              // acerto
  const { rows } = await pool.query('select id, nome, categoria, preco::float preco from produtos where id = $1', [id]);
  await redis.set('p:' + id, JSON.stringify(rows[0]), 'EX', 300);           // preenche com TTL
  return rows[0];
}

// 10.000 leituras (80% nos 200 mais populares): 948 consultas ao banco, 9.052 acertos = 90,5%`, notes: [{ l: '7', t: 'Acerto: devolve a cópia sem tocar o banco.' }, { l: '10', t: 'Falha: grava a cópia com TTL de 5 minutos.' }] },
    { title: 'Comparando as camadas (JavaScript, medianas medidas)', lang: 'js', code: R`// relatório agregado de 500.000 linhas
await pool.query('select categoria, count(*), avg(preco) from produtos group by categoria');   // ~183 ms
JSON.parse(await redis.get('rel'));                                                           // ~1,0 ms
local.get('rel');                                                                             // ~0,003 ms (Map no processo)`, notes: [{ l: '2', t: 'Consulta cara: o cache vale muito.' }, { l: '4', t: 'Sem rede, mas só dentro de cada instância.' }] }
  ],
  bestPractices: ['Meça antes de cachear e escolha consultas caras e repetidas.', 'Use cache-aside como ponto de partida.', 'Defina TTL em toda entrada.', 'Acompanhe a taxa de acerto como métrica principal.', 'Construa chaves que incluam tudo que altera o resultado.', 'Trate o cache como descartável: o banco é a fonte da verdade.'],
  mistakes: ['Cachear consultas que já são baratas.', 'Ignorar a obsolescência.', 'Esquecer o TTL.', 'Chaves que misturam resultados de contextos diferentes.', 'Tratar o cache como armazenamento definitivo.', 'Não medir a taxa de acerto.'],
  market: R`Cache é a alavanca mais usada para reduzir latência e custo. Saber quando não cachear, como medir a taxa de acerto e como evitar dados obsoletos distingue um engenheiro que ajuda de um que cria incidentes.`,
  summary: R`Cache é uma cópia rápida e descartável da fonte da verdade. Medido (PostgreSQL 17.12, Redis 8.12): o relatório de 500 mil linhas levou ~183 ms no banco, ~1,0 ms no Redis e ~0,003 ms em um Map; a consulta por chave primária só ganhou ~1,8x. No cache-aside, 10.000 leituras geraram 948 consultas ao banco (taxa de acerto de 90,5%). Use TTL, meça a taxa de acerto e cache o que é caro, repetido e tolera atraso.`,
  refs: [REF.httpCaching, REF.redisSet, REF.memcachePaper],
  cards: [
    { q: 'O que é cache-aside?', a: 'A aplicação lê o cache; na falha, busca no banco, grava no cache e devolve.' },
    { q: 'Como se calcula a taxa de acerto?', a: 'Acertos divididos pelo total de leituras (medido: 9.052 de 10.000 = 90,5%).' },
    { q: 'Qual consulta mais se beneficia de cache?', a: 'A cara e muito repetida (relatório: 183 ms para 1 ms), não a já barata.' },
    { q: 'Por que usar TTL?', a: 'Para limitar a obsolescência e evitar que falhas de invalidação virem erro permanente.' },
    { q: 'O cache é a fonte da verdade?', a: 'Não; é uma cópia descartável que pode ser reconstruída a partir do banco.' }
  ]
},
{
  id: 'cch-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['stampede', 'single-flight', 'trava', 'cache negativo', 'chaves', 'serialização', 'memória'],
  title: 'Cache-aside na prática: stampede, trava, cache negativo e custo de memória',
  objectives: ['Reproduzir e medir o cache stampede (estouro de manada) em uma chave fria', 'Aplicar single-flight no processo e trava distribuída com §SET NX EX§', 'Usar cache negativo para ids inexistentes', 'Escolher entre JSON e hash do Redis medindo a memória', 'Desenhar chaves e tratar falhas do próprio cache'],
  intro: R`O cache-aside parece simples até a **chave expirar sob carga**: 50 requisições simultâneas veem a falha, **todas** consultam o banco e **todas** recalculam o mesmo relatório caro. É o **cache stampede**. Esta aula **mede** o problema (50 execuções do relatório em ~6,9 s), as soluções (**1 execução**) e outros detalhes de produção: **cache negativo**, **memória** e **falha do cache**.`,
  theory: R`### O cache stampede
Quando uma **entrada quente** expira (ou o cache é esvaziado), **todas** as requisições que chegam **antes** do primeiro recálculo terminar veem **falha** e **vão ao banco**. Medido: **50 requisições simultâneas** sobre a chave fria do relatório: **50 execuções** do relatório no PostgreSQL, **~6,9 s** no total (o banco sobrecarregado). Em produção, isso **derruba o banco** justamente quando a carga é maior.

### Solução 1: single-flight (no processo)
Mantenha um **mapa de promessas em andamento**: a primeira requisição **inicia** o recálculo; as demais **aguardam a mesma promessa**.
§§§
const voando = new Map();
async function relatorioCache() {
  const c = await redis.get('rel');
  if (c) return JSON.parse(c);
  if (!voando.has('rel')) voando.set('rel', (async () => {
    const v = await calcularRelatorio();
    await redis.set('rel', JSON.stringify(v), 'EX', 60);
    voando.delete('rel');
    return v;
  })());
  return voando.get('rel');
}
§§§
Medido: **1 execução**, **~202 ms** no total. Limite: vale **dentro de um processo**. Com 10 instâncias, **10 recálculos** simultâneos (ainda melhor que 500).

### Solução 2: trava distribuída
Uma **trava** no Redis: §SET trava:rel 1 NX EX 10§. Quem consegue a trava **recalcula**; os outros **esperam um pouco** e **relêem o cache**. Medido: **1 execução**, **~237 ms** no total. Cuidados:
- **TTL na trava** (se o dono cair, a trava expira); escolha **maior que o recálculo**.
- **Liberar só se for o dono** (valor único e script de comparação; a aula nsq-06 mostra a limitação), e **liberar em §finally§**.
- **Limite de espera** e **plano B** (servir o dado antigo ou calcular mesmo assim) para não travar a requisição.
- **Travas não são garantia absoluta de exclusão mútua** (documentação oficial "Distributed Locks"): aqui o pior caso é um **recálculo duplicado**, o que é aceitável.

### Outras defesas
- **Renovação antecipada** (*refresh-ahead*): renovar a entrada **antes** de expirar, por um processo em segundo plano, para que **ninguém** veja a falha.
- **Servir dado antigo enquanto renova** (*stale-while-revalidate*): guardar o valor com um **TTL lógico** menor que o **TTL físico**; ao passar do lógico, devolver o antigo e disparar a renovação.
- **Aquecimento** (*warm-up*) das chaves quentes depois de reinícios.
- **Variação no TTL** (jitter) para evitar expirações simultâneas (aula cch-04).

### Cache negativo
Um id **inexistente** nunca preenche o cache e **toda** consulta vai ao banco (por engano ou por ataque). Medido: **1.000** consultas ao id inexistente: **1.000** idas ao banco; com **cache negativo** (guardar um marcador §__vazio__§ com **TTL curto**, 30 s), **1**. Cuidados: **TTL curto** (o item pode passar a existir), e **invalidar** o marcador ao criar o registro.

### JSON ou hash? Memória
Medido com 1.000 produtos: string JSON **88 B** em média; **hash** **82 B**. A diferença é **pequena** para objetos pequenos: escolha pelo **uso** (hash permite ler e atualizar **campos** isolados; JSON é mais simples e preserva tipos). Para objetos grandes, **comprima** (gzip) com cuidado: custa CPU. Dimensione: **número de chaves × tamanho médio + sobrecarga por chave** (aula nsq-06: 100 B viram 135 B).

### Falha do próprio cache
O cache **cai**, fica **lento** ou **perde dados**. Planeje:
- **Tempo limite curto** nas chamadas ao cache (melhor ir ao banco do que esperar);
- **Disjuntor** (*circuit breaker*): depois de falhas repetidas, **pular o cache** por um tempo;
- O **banco deve aguentar** a carga sem cache? Se não, o cache **virou dependência crítica** e precisa de **réplicas e capacidade** (e proteção contra stampede).
- **Degradação**: servir dado antigo ou resposta simplificada.

### Chaves bem desenhadas
- Prefixos e versão: §v2:produto:123§ (mudar o formato → mudar o prefixo, sem apagar tudo).
- Inclua **idioma, filtros e tenant** quando afetam o resultado (**evite vazar dados entre clientes**).
- Evite chaves **sem limite de variação** (cada busca livre cria uma chave: cache poluído de baixa repetição).`,
  concepts: [
    { term: 'Cache stampede', def: 'Estouro de manada: muitas requisições simultâneas recalculam o mesmo valor após uma falha de cache.' },
    { term: 'Single-flight', def: 'Técnica em que requisições iguais em andamento compartilham o resultado de uma única execução.' },
    { term: 'Trava distribuída', def: 'Exclusão aproximada entre processos, com SET NX EX no Redis.' },
    { term: 'Cache negativo', def: 'Guardar também a ausência de um registro, com TTL curto, para evitar consultas repetidas.' },
    { term: 'Refresh-ahead', def: 'Renovação da entrada antes de expirar.' },
    { term: 'Stale-while-revalidate', def: 'Devolver o dado antigo enquanto uma renovação ocorre em segundo plano.' },
    { term: 'Disjuntor', def: 'Mecanismo que interrompe chamadas a um componente com falhas repetidas por um tempo.' },
    { term: 'Aquecimento do cache', def: 'Preencher previamente as chaves quentes, por exemplo após um reinício.' },
    { term: 'Marcador de ausência', def: 'Valor especial guardado no cache para representar que o registro não existe.' },
    { term: 'Prefixo de versão', def: 'Parte da chave que identifica a versão do formato e permite invalidar tudo de uma vez.' }
  ],
  examples: R`**Analogia:** a loja abre e **todos os 50 clientes** perguntam ao mesmo tempo o preço de um item que **não está na etiqueta** (cache vazio). Sem organização, **cada um** vai ao estoque conferir (**50 idas**). No **single-flight**, **um funcionário** vai e os outros esperam no balcão; na **trava**, quem pegou a **chave do estoque** vai e os outros **olham a etiqueta novamente** quando ele voltar. O **cache negativo** é **um aviso na vitrine**: "não temos este item" por meia hora, para ninguém ir ao estoque conferir.

**Exemplo 1: stampede medido.** 50 execuções (~6,9 s) sem proteção; 1 com single-flight e 1 com trava.

**Exemplo 2: cache negativo.** 1.000 consultas viraram 1.

**Exemplo 3: memória.** JSON 88 B contra hash 82 B por produto.`,
  code: [
    { title: 'Stampede e a trava distribuída (JavaScript, execuções medidas)', lang: 'js', code: R`// sem proteção: 50 requisições simultâneas na chave fria => 50 execuções no banco (~6,9 s)
await Promise.all(Array.from({ length: 50 }, ingenuo));

// com trava distribuída: 1 execução
async function comTrava() {
  for (let i = 0; i < 200; i++) {
    const c = await redis.get('rel'); if (c) return JSON.parse(c);
    if (await redis.set('trava:rel', '1', 'EX', 10, 'NX')) {         // só um consegue
      try { const v = await relatorio(); await redis.set('rel', JSON.stringify(v), 'EX', 60); return v; }
      finally { await redis.del('trava:rel'); }
    }
    await sleep(20);                                                  // os outros esperam e relêem
  }
  throw new Error('tempo esgotado');
}`, notes: [{ l: '6', t: 'NX garante um único dono da trava.' }, { l: '8', t: 'finally libera a trava mesmo com erro.' }, { l: '11', t: 'Quem não conseguiu espera e tenta ler o cache de novo.' }] },
    { title: 'Cache negativo (JavaScript, consultas medidas)', lang: 'js', code: R`async function produtoOuNada(id) {
  const c = await redis.get('p:' + id);
  if (c === '__vazio__') return null;                                // ausência já conhecida
  if (c) return JSON.parse(c);
  const linha = await buscarNoBanco(id);
  await redis.set('p:' + id, linha ? JSON.stringify(linha) : '__vazio__', 'EX', linha ? 300 : 30);
  return linha ?? null;
}
// 1.000 consultas ao id -1: 1.000 idas ao banco sem cache negativo; 1 com ele`, notes: [{ l: '3', t: 'O marcador evita nova consulta.' }, { l: '6', t: 'A ausência fica só 30 s no cache.' }] }
  ],
  bestPractices: ['Proteja chaves quentes contra stampede (single-flight, trava ou renovação antecipada).', 'Dê TTL à trava e libere em finally, só se for o dono.', 'Use cache negativo com TTL curto e invalide ao criar o registro.', 'Defina limite de tempo e disjuntor nas chamadas ao cache.', 'Garanta que o banco aguenta a carga se o cache falhar, ou trate o cache como crítico.', 'Inclua versão e contexto nas chaves.'],
  mistakes: ['Deixar uma chave quente expirar sem proteção.', 'Trava sem TTL, travando o sistema se o dono cair.', 'Cache negativo sem TTL curto, escondendo registros recém-criados.', 'Chaves sem o tenant ou o idioma, vazando dados entre clientes.', 'Aguardar o cache indefinidamente quando ele está lento.', 'Cachear buscas livres e poluir a memória.'],
  market: R`O estouro de manada é uma das causas clássicas de incidentes em sistemas com cache. Saber reproduzir, medir e mitigar com single-flight, trava e renovação antecipada é cobrado em entrevistas de design e em plantões.`,
  summary: R`Medido: 50 requisições na chave fria executaram o relatório 50 vezes (~6,9 s); com single-flight e com trava SET NX EX foi 1 execução (~202 e ~237 ms). O cache negativo reduziu 1.000 consultas a 1 (TTL 30 s). JSON (88 B) e hash (82 B) ocupam quase o mesmo para objetos pequenos. Planeje a falha do cache (tempo limite, disjuntor, degradação) e desenhe chaves com versão e contexto.`,
  refs: [REF.redisLocks, REF.redisSet, REF.memcachePaper],
  cards: [
    { q: 'O que é cache stampede?', a: 'Muitas requisições recalculam o mesmo valor ao mesmo tempo após uma falha de cache (medido: 50 execuções).' },
    { q: 'Como o single-flight resolve?', a: 'Compartilha uma única execução em andamento entre as requisições do mesmo processo.' },
    { q: 'Para que serve SET NX EX no cache?', a: 'Para uma trava com expiração: só uma requisição recalcula; as outras releem o cache.' },
    { q: 'O que é cache negativo?', a: 'Guardar a ausência de um registro com TTL curto (medido: 1.000 consultas viraram 1).' },
    { q: 'O que fazer se o cache falhar?', a: 'Tempo limite, disjuntor, degradação e garantir que o banco aguenta ou que o cache é tratado como crítico.' }
  ]
},
{
  id: 'cch-03', moduleId: 'm2', order: 3, minutes: 80, tags: ['write-through', 'write-behind', 'write-back', 'read-through', 'durabilidade', 'lote'],
  title: 'Write-through, write-behind e read-through: quem escreve no cache e quando',
  objectives: ['Distinguir cache-aside, read-through, write-through e write-behind', 'Medir o custo de latência de cada estratégia de escrita', 'Explicar o risco de perda de dados do write-behind e como mitigá-lo', 'Usar lotes na descarga do write-behind e tratar a ordem de escritas', 'Escolher a estratégia por requisito de consistência e durabilidade'],
  intro: R`No cache-aside a **aplicação** coordena tudo. Existem outras estratégias em que o **cache** (ou uma camada) participa da **escrita**: **write-through** (escreve nos dois, de forma síncrona), **write-behind** (escreve no cache e **depois** no banco) e **read-through** (o cache sabe buscar). Cada uma troca **consistência**, **latência** e **durabilidade**. Medimos **1.000 atualizações** em cada estratégia, e **simulamos a perda** de dados do write-behind.`,
  theory: R`### As estratégias
| Estratégia | Leitura | Escrita | Característica |
|---|---|---|---|
| **Cache-aside** | app lê o cache; na falha, busca no banco e preenche | app grava no banco e invalida (ou atualiza) | simples; controle na aplicação |
| **Read-through** | o cache (camada) busca na fonte quando falha | — | a lógica de carga fica na camada de cache |
| **Write-through** | — | grava no **banco e no cache**, de forma **síncrona** | cache sempre atual após a escrita; escrita mais lenta |
| **Write-behind (write-back)** | — | grava **só no cache** e **descarrega no banco depois** (assíncrono, em lote) | escrita rápida; **risco de perda** |
| **Write-around** | — | grava no banco e **não** no cache | evita poluir o cache com dados pouco lidos |

### Write-through
Cada escrita vai ao **banco** e ao **cache** antes de responder: o cache **fica atualizado** (leituras seguintes acertam) e **o banco permanece a fonte da verdade** (durabilidade). Medido (**1.000 atualizações de preço**, uma execução): **só banco ~2.208 ms**; **write-through ~2.898 ms** (≈ **31%** mais lento): o preço é **uma gravação a mais** no caminho da escrita. Cuidados:
- **Ordem**: grave no banco primeiro; **só atualize o cache se o banco confirmou**; se a escrita no cache falhar, **invalide** a chave (ou registre o erro) para não deixar valor errado;
- **Duas escritas não são atômicas**: pode haver janela de inconsistência (aula cch-04);
- Cache **só com o que será lido**: write-through de tudo **enche** o cache com dados que ninguém lê.

### Write-behind (write-back)
A aplicação grava **no cache** (e em uma **fila**) e **responde na hora**; um **processo** descarrega as alterações no banco **em lote**, depois. Medido: **1.000 atualizações** em **~1.108 ms** (metade do tempo do banco), e a **descarga em lote** de **1.000 itens da fila (500 ids distintos)** como **um único UPDATE** com §unnest§ levou **~23 ms** (**a última escrita de cada id vence**). Vantagens: **latência baixa**, **absorção de picos**, **coalescência** (várias escritas do mesmo id viram uma) e **lotes**.
**O risco** é a **durabilidade**: enquanto a descarga não acontece, **o banco está desatualizado**, e se o cache/fila for perdido, **as escritas somem**. Medido (simulação com §FLUSHALL§ antes da descarga, **não** uma queda real): a atualização de preço do id 9 para **5555 foi perdida**; o banco manteve **708**. Mitigações:
- **Fila durável** (AOF do Redis, **Streams com confirmação**, ou um **broker** como Kafka/RabbitMQ) em vez de uma lista volátil (aula nsq-07);
- **Descarga idempotente** e com **reprocessamento**;
- **Monitorar o atraso** (idade da escrita mais antiga na fila);
- **Usar só onde perder alguns segundos é aceitável** (contadores, métricas, "visto por último"), **nunca** para saldo, pagamentos e estoque.
- Atenção à **ordem** e às **leituras** diretas no banco (veriam dados antigos) e a **conflitos** entre escritores.

### Read-through
Em vez de a aplicação fazer "ler o cache, na falha buscar e preencher", a **camada de cache** (uma biblioteca, um *loader*) **encapsula** a carga: a aplicação pede a chave e a camada resolve. Vantagens: **menos duplicação** da lógica de cache; **single-flight** embutido; **política única** de TTL. Exemplos: caches com função de carga (bibliotecas como *Caffeine* na JVM, *cachetools*, *lru-cache* com *fetchMethod* em Node), caches gerenciados com integrações. **Cache-aside e read-through** diferem em **quem** executa a carga, não no efeito.

### Como escolher
1. **Quanto custa um dado antigo?** (alto → invalide/write-through; baixo → TTL).
2. **Quanto custa perder uma escrita?** (alto → write-through; baixo → write-behind).
3. **A leitura é muito mais frequente que a escrita?** (cache-aside com invalidação é suficiente.)
4. **A escrita é um gargalo?** (write-behind com fila durável e lotes; ou **lotes diretos no banco**: aula orm-05 mostrou **217 ms** com createMany e **37 ms** com unnest contra **3,1 s** em laço.)
5. **Quem mais escreve no banco?** (outros sistemas fazem o cache ficar obsoleto: prefira TTL e invalidação por eventos.)

### Alternativas ao write-behind
Se o problema é a **escrita lenta**, considere **lotes** no banco, **filas** (processar depois, mas com **durabilidade** do broker), **ajuste do banco** (índices, *synchronous_commit*, no curso de PostgreSQL e MySQL), **particionamento**. O write-behind em Redis é uma ferramenta **estreita** e **perigosa** quando mal usada.`,
  concepts: [
    { term: 'Read-through', def: 'Estratégia em que a camada de cache carrega o dado da fonte quando há falha.' },
    { term: 'Write-through', def: 'Escrita síncrona no banco e no cache antes de responder.' },
    { term: 'Write-behind (write-back)', def: 'Escrita no cache e descarga assíncrona no banco, em lote.' },
    { term: 'Write-around', def: 'Escrita direta no banco sem passar pelo cache.' },
    { term: 'Coalescência', def: 'Combinar várias escritas do mesmo item em uma só na descarga.' },
    { term: 'Descarga (flush)', def: 'Gravar no banco as alterações acumuladas no cache ou na fila.' },
    { term: 'Fila durável', def: 'Fila que não perde mensagens em falhas (AOF, Streams com confirmação, broker).' },
    { term: 'Atraso de descarga', def: 'Tempo entre a escrita no cache e sua gravação no banco.' },
    { term: 'Idempotência', def: 'Propriedade que permite repetir uma operação sem efeitos duplicados.' },
    { term: 'Janela de inconsistência', def: 'Período em que o cache e o banco divergem.' }
  ],
  examples: R`**Analogia:** **write-through** é **anotar a venda no caderno do caixa e no livro-razão antes de entregar o troco**: mais lento, tudo confere. **Write-behind** é **anotar só no caderno do caixa e passar tudo ao livro-razão no fim do dia**: o atendimento é veloz e se junta tudo de uma vez, mas **se o caderno pegar fogo antes do fechamento, as vendas somem**. **Write-around** é **anotar só no livro-razão** (e o caderno do caixa só tem o que foi consultado).

**Exemplo 1: custos de escrita.** 2.208 ms (banco), 2.898 ms (write-through) e 1.108 ms (write-behind) para 1.000 atualizações.

**Exemplo 2: descarga em lote.** 1.000 itens da fila viraram 500 ids e um UPDATE de ~23 ms.

**Exemplo 3: perda.** A simulação com FLUSHALL descartou a atualização para 5555 do id 9.`,
  code: [
    { title: 'Write-through e write-behind (JavaScript, 1.000 atualizações medidas)', lang: 'js', code: R`// write-through: banco primeiro, depois cache (~2.898 ms)
await pool.query('update produtos set preco = $2 where id = $1', [id, preco]);
await redis.set('p:' + id, JSON.stringify({ id, preco }), 'EX', 300);

// write-behind: cache e fila, resposta imediata (~1.108 ms)
await redis.set('p:' + id, JSON.stringify({ id, preco }), 'EX', 300);
await redis.rpush('fila:preco', JSON.stringify([id, preco]));

// descarga em lote: a última escrita de cada id vence (1 UPDATE em ~23 ms para 500 ids)
const fila = (await redis.lrange('fila:preco', 0, -1)).map((x) => JSON.parse(x));
const ultimo = new Map(fila);
await pool.query('update produtos p set preco = v.preco from (select unnest($1::int[]) id, unnest($2::numeric[]) preco) v where p.id = v.id',
  [[...ultimo.keys()], [...ultimo.values()]]);`, notes: [{ l: '2', t: 'O banco confirma antes de o cache ser atualizado.' }, { l: '7', t: 'A fila é uma lista volátil: se for perdida, as escritas somem.' }, { l: '11', t: 'O Map mantém a última escrita por id.' }] },
    { title: 'Perda no write-behind (simulação, saída medida)', lang: 'js', code: R`await redis.del('fila:preco');
await redis.rpush('fila:preco', JSON.stringify([9, 5555]));      // escrita só na fila
await redis.flushall();                                          // simulação de perda do Redis
// preço do id 9 no banco: 708 (a atualização 5555 foi perdida)`, notes: [{ l: '3', t: 'Simulação: não houve queda real do Redis.' }, { l: '4', t: 'O banco nunca recebeu a escrita.' }] }
  ],
  bestPractices: ['Use write-through quando o cache deve ficar atual e o banco continuar durável.', 'Use write-behind só com fila durável, descarga idempotente e atraso monitorado.', 'Nunca use write-behind para saldo, pagamento ou estoque.', 'Grave no banco antes de atualizar o cache e invalide se a atualização falhar.', 'Agrupe escritas em lote na descarga e aproveite a coalescência.', 'Considere lotes diretos no banco antes de adotar write-behind.'],
  mistakes: ['Usar uma lista volátil como fila de write-behind em dados críticos.', 'Atualizar o cache antes de confirmar a escrita no banco.', 'Deixar de monitorar o atraso da descarga.', 'Ler diretamente do banco e esperar dados atuais em write-behind.', 'Encher o cache com tudo que é escrito.', 'Confundir cache-aside e read-through como estratégias de efeitos diferentes.'],
  market: R`Write-behind aparece em contadores, métricas e telemetria de alto volume; em sistemas financeiros, é evitado. Saber explicar o trade-off com números e o risco de perda é um diferencial em entrevistas de design de sistemas.`,
  summary: R`Cache-aside, read-through, write-through, write-behind e write-around diferem em quem escreve e quando. Medido em 1.000 atualizações: só o banco ~2.208 ms, write-through ~2.898 ms e write-behind ~1.108 ms; a descarga em lote com unnest levou ~23 ms para 500 ids. O write-behind perde dados se a fila volátil for perdida (simulação com FLUSHALL: 5555 perdido, banco com 708): use fila durável e só onde perder segundos é aceitável.`,
  refs: [REF.redisEviction, REF.redisSet, REF.memcachePaper],
  cards: [
    { q: 'Qual a diferença entre write-through e write-behind?', a: 'Write-through grava no banco e no cache antes de responder; write-behind grava no cache e descarrega no banco depois.' },
    { q: 'Qual o maior risco do write-behind?', a: 'Perder escritas se o cache ou a fila forem perdidos antes da descarga.' },
    { q: 'O que é coalescência?', a: 'Juntar várias escritas do mesmo item em uma só, mantendo a última.' },
    { q: 'Quando não usar write-behind?', a: 'Para dados críticos como saldo, pagamentos e estoque.' },
    { q: 'O que é write-around?', a: 'Gravar só no banco, sem atualizar o cache.' }
  ]
}
];
