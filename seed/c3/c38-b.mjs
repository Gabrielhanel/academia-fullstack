// C3.8 — Estratégias de cache. Aulas 4 a 6 (invalidação; cache distribuído; HTTP, observabilidade e projeto).
import { REF } from './c38-a.mjs';
const R = String.raw;

export const lessonsB = [
{
  id: 'cch-04', moduleId: 'm2', order: 4, minutes: 85, tags: ['invalidação', 'obsolescência', 'corrida', 'avalanche', 'jitter', 'versionamento de chave', 'eventos'],
  title: 'Invalidação de cache: TTL, invalidar na escrita, corridas e avalanches',
  objectives: ['Comparar as estratégias de invalidação (TTL, na escrita, por eventos, por versão de chave)', 'Reproduzir a corrida leitor x escritor que deixa um valor obsoleto no cache', 'Medir a avalanche de expiração e mitigá-la com variação (jitter) no TTL', 'Escolher a janela de obsolescência aceitável por tipo de dado', 'Projetar invalidação por eventos e por versionamento de chaves'],
  intro: R`Cachear é fácil; **saber quando uma cópia deixou de valer** é difícil. Esta aula mostra as estratégias de invalidação e **mede** três armadilhas reais: o **valor obsoleto** que o cache mostra depois de um UPDATE (7,5 contra 999), a **corrida leitor x escritor** que re-obsolesce o cache **mesmo invalidando** (10 contra 20) e a **avalanche** de expirações simultâneas (**1.000** chaves em ~100 ms contra **130** com variação).`,
  theory: R`### O problema
Há **duas fontes** (banco e cache) e qualquer escrita pode **divergir** entre elas. Medido: depois de §UPDATE produtos SET preco = 999 WHERE id = 7§, o cache **ainda mostrava 7,5**. Toda estratégia define **quando** a cópia é corrigida.

### Estratégias
1. **Expiração por TTL**: simples e **limita** a obsolescência ao TTL. Combine com qualquer outra como **rede de segurança**.
2. **Invalidar na escrita** (*delete on write*): depois de gravar no banco, **§DEL§ a chave**; a próxima leitura repreenche. Medido: depois do §DEL§, a releitura trouxe **999**.
3. **Atualizar na escrita** (*write-through*, aula cch-03): grava o valor novo no cache.
4. **Invalidação por eventos**: a mudança publica um **evento** (fila, Kafka, **CDC** do banco como Debezium/replicação lógica do PostgreSQL) e **consumidores** invalidam as chaves. Útil quando **vários serviços** escrevem no banco, **sem passar pela aplicação que cacheia**.
5. **Chave com versão** (*versioned keys*): a chave inclui um **número de versão** (§produto:7:v12§ ou §catalogo:v34:lista§); ao mudar, **incrementa-se a versão** e as chaves antigas **ficam órfãs** e expiram sozinhas. Evita corridas de invalidação e facilita invalidar **grupos** (todo o catálogo) com **uma** escrita.
6. **Tags/grupos**: associar chaves a um conjunto (§SADD tag:cat:5 chave§) para apagar **todas** de uma vez.

### Invalidar ou atualizar?
**Invalidar** (§DEL§) é **mais seguro**: o cache só guarda o que a leitura buscar **depois** da escrita. **Atualizar** (§SET§ do valor novo) deixa o cache **pronto**, mas um **atraso entre as duas escritas** pode gravar o **valor antigo por cima** do novo (corrida). A regra comum: **escrever no banco, depois invalidar** a chave.

### A corrida leitor x escritor
Mesmo invalidando, existe uma sequência em que o cache **fica errado**:
1. o **leitor** lê o banco (**preço 10**) e demora;
2. o **escritor** atualiza o banco (**preço 20**) e **invalida** o cache;
3. o **leitor** grava no cache o valor que leu (**10**).
Reproduzido de forma determinística: **banco = 20; cache = 10**, obsoleto **até o TTL** (60 s). Mitigações:
- **TTL curto** como rede de segurança (limita o dano);
- **"Dupla exclusão com atraso"** (*delayed double delete*): invalidar de novo **após um breve intervalo** (maior que o tempo de uma leitura);
- **Versão ou carimbo**: gravar no cache **só se a versão do que foi lido** ainda é a atual (comparação atômica com script Lua ou §WATCH§ — aula nsq-07);
- **Leases** (arrendamentos), como no artigo do *Memcache* do Facebook: a falha entrega um **token**, e só quem tem o token **válido** preenche; uma invalidação **cancela** os tokens;
- **Chaves versionadas**: a leitura atrasada grava na **chave antiga**, que ninguém mais lê.
Não existe invalidação **perfeita** em duas fontes: **escolha a janela aceitável** e documente.

### A avalanche de expiração
Se **muitas chaves** são criadas juntas com **o mesmo TTL** (um aquecimento, um pico), **expiram juntas**: o banco recebe **todas as falhas** ao mesmo tempo. Medido: **1.000** chaves com **PX 1000**: o **máximo** que expirou em uma janela de ~100 ms foi **1.000** (tudo de uma vez); com **TTL entre 1.000 e 2.000 ms** (variação aleatória, *jitter*), o máximo por janela caiu para **130**. Regra: **TTL base + aleatório** (por exemplo, 300 s ± 10%). Some a isso a proteção contra stampede (aula cch-02).

### Quanto de obsolescência aceitar
| Dado | Janela | Estratégia |
|---|---|---|
| Saldo e estoque no pagamento | nenhuma | **não cachear**, ou ler do banco |
| Preço exibido no catálogo | segundos | invalidar na escrita + TTL curto |
| Perfil do usuário | minutos | invalidar na escrita + TTL |
| Ranking, contagens | minutos a horas | TTL |
| Conteúdo estático | dias | versão no nome do arquivo |
Defina o **limite** com o negócio (**SLA de frescor**) e **teste** com o cenário de corrida.

### Invalidação por eventos: cuidados
- Eventos podem **chegar fora de ordem** ou **duplicados**: invalidar é **idempotente**, o que ajuda;
- **Perda de evento** → obsolescência até o TTL: mantenha o **TTL**;
- Evite **acoplar** todos os serviços ao esquema de chaves do cache (publique **eventos de domínio**, e cada dono do cache decide as chaves).

### O que NÃO fazer
- **Apagar o cache inteiro** (§FLUSHALL§) a cada mudança: provoca **stampede** e **perde o ganho**.
- **Cachear dados com regras de autorização** sem incluir o usuário/papel na chave.
- **Confiar** que "ninguém mais escreve no banco": rotinas, scripts e outros serviços escrevem.`,
  concepts: [
    { term: 'Invalidação', def: 'Remoção ou correção de uma entrada do cache quando o dado de origem muda.' },
    { term: 'Delete on write', def: 'Estratégia de remover a chave do cache após gravar no banco.' },
    { term: 'Corrida leitor x escritor', def: 'Sequência em que uma leitura antiga preenche o cache depois da invalidação.' },
    { term: 'Dupla exclusão com atraso', def: 'Invalidar de novo após um intervalo para remover uma entrada obsoleta criada por uma corrida.' },
    { term: 'Chave versionada', def: 'Chave que inclui um número de versão, de modo que mudar a versão invalida o grupo.' },
    { term: 'Lease', def: 'Token entregue na falha que autoriza apenas um preenchimento válido do cache.' },
    { term: 'Avalanche de expiração', def: 'Expiração simultânea de muitas chaves, gerando pico de falhas no banco.' },
    { term: 'Jitter', def: 'Variação aleatória aplicada ao TTL para espalhar as expirações.' },
    { term: 'CDC', def: 'Captura de mudanças do banco (change data capture) para alimentar eventos de invalidação.' },
    { term: 'SLA de frescor', def: 'Tempo máximo que um dado pode ficar desatualizado, acordado com o negócio.' }
  ],
  examples: R`**Analogia:** o cardápio impresso é o cache; o cozinheiro mudou o preço do prato (banco). **Trocar o cardápio** assim que muda (invalidar) é o certo, mas se **um garçom já tinha fotografado o preço antigo** e cola a foto depois da troca, **o cardápio volta ao preço velho** (corrida). Todos os cardápios com **validade igual** vencendo ao meio-dia **lotam a cozinha** de pedidos de conferência (avalanche); **validades espalhadas** distribuem o movimento.

**Exemplo 1: sem invalidar.** Cache 7,5 e banco 999.

**Exemplo 2: corrida.** Banco 20 e cache 10 por 60 s.

**Exemplo 3: avalanche.** 1.000 expirações em ~100 ms contra 130 por janela com jitter.`,
  code: [
    { title: 'Invalidar na escrita e a corrida (JavaScript, resultado medido)', lang: 'js', code: R`// invalidar na escrita: banco primeiro, depois DEL
await pool.query('update produtos set preco = 999 where id = 7');
await redis.del('p:7');                                      // a próxima leitura traz 999

// corrida determinística
const leu = (await porId(8)).preco;                          // leitor lê 10
await pool.query('update produtos set preco = 20 where id = 8'); await redis.del('p:8');   // escritor
await redis.set('p:8', JSON.stringify({ id: 8, preco: leu }), 'EX', 60);                   // leitor grava 10
// banco = 20; cache = 10 (obsoleto até o TTL de 60 s)`, notes: [{ l: '3', t: 'Invalidar depois de gravar.' }, { l: '8', t: 'O leitor atrasado reintroduz o valor antigo.' }] },
    { title: 'TTL com variação (JavaScript, avalanche medida)', lang: 'js', code: R`const ttl = (baseMs) => baseMs + Math.floor(Math.random() * baseMs * 0.1);   // base + até 10%
await redis.set('p:' + id, valor, 'PX', ttl(300000));
// 1.000 chaves com PX 1000: 1.000 expiraram em uma janela de ~100 ms
// 1.000 chaves com PX 1000 + aleatório(0..1000): no máximo 130 por janela`, notes: [{ l: '1', t: 'O jitter espalha as expirações.' }] },
    { title: 'Chave versionada (JavaScript)', lang: 'js', code: R`async function versaoCatalogo() { return (await redis.get('catalogo:versao')) ?? '1'; }
async function listaCatalogo(pagina) {
  const v = await versaoCatalogo();
  const chave = 'catalogo:v' + v + ':p' + pagina;
  const c = await redis.get(chave); if (c) return JSON.parse(c);
  const dados = await carregarDoBanco(pagina);
  await redis.set(chave, JSON.stringify(dados), 'EX', 600);
  return dados;
}
// ao mudar o catálogo: await redis.incr('catalogo:versao')  -> todas as páginas antigas ficam órfãs e expiram`, notes: [{ l: '4', t: 'A versão faz parte da chave.' }, { l: '10', t: 'Um único INCR invalida o grupo inteiro.' }] }
  ],
  bestPractices: ['Combine invalidação na escrita com TTL como rede de segurança.', 'Grave no banco antes de invalidar.', 'Adicione variação ao TTL para evitar avalanches.', 'Use chaves versionadas para invalidar grupos.', 'Defina o SLA de frescor por tipo de dado.', 'Teste a corrida leitor x escritor e documente a janela residual.'],
  mistakes: ['Esquecer de invalidar uma das rotas de escrita.', 'Atualizar o cache antes de confirmar o banco.', 'Apagar o cache inteiro a cada mudança.', 'Usar TTL igual para milhares de chaves criadas juntas.', 'Cachear dados sensíveis a permissões sem incluir o usuário na chave.', 'Supor que a invalidação é perfeita.'],
  market: R`"Como você invalida o cache?" é uma pergunta clássica de entrevistas de sistemas. A resposta madura admite as corridas, cita TTL, eventos e versionamento, e fala em janelas de frescor com o negócio.`,
  summary: R`A invalidação define quando a cópia é corrigida: TTL, delete on write, write-through, eventos (CDC) e chaves versionadas. Medido: sem invalidar, cache 7,5 e banco 999; após DEL, 999. A corrida leitor x escritor deixou cache 10 contra banco 20 por até 60 s. A avalanche expirou 1.000 chaves em ~100 ms com TTL fixo e no máximo 130 por janela com jitter. Documente a janela de obsolescência e mantenha o TTL como rede de segurança.`,
  refs: [REF.memcachePaper, REF.redisSet, REF.httpCaching],
  cards: [
    { q: 'Qual a ordem segura em invalidar na escrita?', a: 'Gravar no banco e depois remover a chave do cache.' },
    { q: 'O que é a corrida leitor x escritor?', a: 'Um leitor atrasado grava o valor antigo no cache depois da invalidação (banco 20, cache 10).' },
    { q: 'Como mitigar a avalanche de expiração?', a: 'Aplicar variação aleatória (jitter) ao TTL (medido: de 1.000 para 130 por janela).' },
    { q: 'Para que servem chaves versionadas?', a: 'Para invalidar um grupo de chaves incrementando um número de versão.' },
    { q: 'Por que manter o TTL junto da invalidação?', a: 'Porque ele limita o dano de uma invalidação perdida ou de uma corrida.' }
  ]
},
{
  id: 'cch-05', moduleId: 'm3', order: 5, minutes: 85, tags: ['cache distribuído', 'cache local', 'pub/sub', 'client-side caching', 'sharding', 'hot key', 'cluster'],
  title: 'Cache distribuído: caches locais, invalidação entre instâncias, particionamento e chaves quentes',
  objectives: ['Comparar cache local (no processo) e cache distribuído (Redis) em latência e consistência', 'Reproduzir a obsolescência entre duas instâncias e corrigi-la com invalidação por pub/sub', 'Explicar particionamento por chave (hash, slots do Redis Cluster) e suas restrições', 'Reconhecer e tratar chaves quentes (hot keys)', 'Dimensionar memória e escolher a política de eviction'],
  intro: R`Quando a aplicação roda em **várias instâncias**, o cache passa a ser um problema **distribuído**: cada instância pode ter um **cache local** (rápido, ~0,003 ms), todas compartilham um **Redis** (~1 ms), e uma mudança precisa chegar a **todos**. Esta aula **mede** a obsolescência entre duas instâncias, a correção por **pub/sub** (**~3,6 ms** de propagação) e explica **particionamento**, **chaves quentes** e **dimensionamento**.`,
  theory: R`### Dois níveis: local e distribuído
- **Cache local (L1)**: um §Map§/LRU **por instância**. **Latência quase zero** (medido ~0,003 ms), **sem rede**, mas **cada instância tem sua cópia** (obsolescência diferente), **memória duplicada** e frio a cada reinício.
- **Cache distribuído (L2)**: Redis/Memcached **compartilhado**: **uma cópia** para todas as instâncias; ~1 ms por ida e volta; sobrevive ao reinício da aplicação.
Combinação comum: **L1 com TTL curto** (segundos) **na frente** do **L2**, que fica na frente do **banco**. O L1 absorve a **repetição quente** (a mesma chave milhares de vezes por segundo) e o L2 compartilha o restante.

### Obsolescência entre instâncias (medido)
Duas instâncias (**A** e **B**, objetos no mesmo processo: **simulação**) com caches locais do mesmo produto (preço 1). O preço mudou para **2** e a instância **A** invalidou **apenas a sua cópia**: **A leu 2; B leu 1** (obsoleto). A invalidação **precisa chegar a todas**.

### Invalidação por pub/sub
Publique a **chave invalidada** em um canal do Redis; **cada instância assina** e **apaga** a cópia local. Medido: depois de um novo UPDATE (preço 3) e um §PUBLISH invalida 11§, **B leu 3**, e a **propagação levou ~3,6 ms**. Limites (aula nsq-07): o pub/sub **não guarda histórico**: uma instância **desconectada** (ou que subiu depois) **perde** a mensagem; por isso mantenha **TTL curto no L1** e, ao **reconectar**, **limpe o cache local**. Para entrega confiável, use **Streams** ou um **broker**.

### Client-side caching do Redis
O Redis tem um mecanismo oficial de **cache no cliente** com **rastreamento** (*tracking*): o servidor **lembra** quais chaves cada cliente leu e **avisa** (mensagem de invalidação) quando mudam, no protocolo RESP3. Isso **automatiza** o que fizemos manualmente (**analisado a partir da documentação "Client-side caching"; não executado**). Bibliotecas de cliente recentes oferecem o recurso.

### Particionar o cache (sharding)
Quando **um nó não cabe**: distribua as chaves entre **vários**.
- **Hash da chave mod N** é ingênuo: **mudar N** reorganiza quase tudo (**tempestade de falhas**).
- **Hash consistente** (ou **slots**) move **só uma fração** das chaves ao adicionar/remover nós. O **Redis Cluster** usa **16.384 slots** e atribui faixas de slots aos nós (**analisado a partir da especificação; não executado**).
- Restrições: operações de **várias chaves** (MULTI, scripts, interseções) exigem chaves no **mesmo slot** (*hash tags*: §{usuario:42}:carrinho§ e §{usuario:42}:sessao§).
- **Réplicas** dão disponibilidade e leitura extra, mas **assíncronas**: leitura em réplica pode estar **atrasada**.

### Chaves quentes (hot keys)
Uma chave muito acessada (a home page, um produto viral) **concentra** o tráfego em **um nó**, mesmo com cluster. Defesas:
- **L1** na aplicação com TTL de segundos;
- **Réplicas de leitura** da chave (várias cópias: §home:0§…§home:7§, sorteando na leitura);
- **Dividir** o valor (um contador em **fragmentos** somados na leitura);
- **Evitar valores enormes** (uma chave de 1 MB lida 1.000 vezes por segundo satura a rede).

### Dimensionamento
- **Capacidade**: chaves × (tamanho médio + sobrecarga). Medido: **88 B** por objeto JSON de produto (e 100 B → 135 B de uma string no Redis, aula nsq-06).
- **Política de eviction** (aula nsq-07): para cache puro, **allkeys-lru** ou **lfu** e **maxmemory**; **monitore** §evicted_keys§ (evicções frequentes indicam **cache pequeno** demais ou chaves demais).
- **Conjunto de trabalho** (*working set*): o cache precisa caber **o que é lido repetidamente**, não **tudo**: uma taxa de acerto de **90%** com **20% dos itens** (como medido) é típica.
- **Largura de banda e conexões**: use **pool** e **pipeline** (aula nsq-06).

### Consistência no cache distribuído
- **Réplicas assíncronas** e **failover** podem **perder** escritas recentes do cache: **tudo no cache deve ser reconstruível**.
- **Partições de rede**: um cliente pode **não alcançar** o Redis: **tempo limite e disjuntor** (aula cch-02), e o banco aguenta?
- Em sistemas multi-região, **cada região tem seu cache** e a invalidação **cruza regiões** (atraso maior): defina o SLA de frescor por região (**não executado aqui**).`,
  concepts: [
    { term: 'Cache local (L1)', def: 'Cache dentro do processo da aplicação, rápido e específico de cada instância.' },
    { term: 'Cache distribuído (L2)', def: 'Cache compartilhado por várias instâncias, em um serviço como o Redis.' },
    { term: 'Invalidação por pub/sub', def: 'Publicar a chave alterada para que cada instância apague a sua cópia local.' },
    { term: 'Client-side caching', def: 'Mecanismo do Redis em que o servidor avisa o cliente quando uma chave que ele guardou muda.' },
    { term: 'Hash consistente', def: 'Esquema de distribuição que move poucas chaves ao mudar o número de nós.' },
    { term: 'Slot do Redis Cluster', def: 'Uma das 16.384 partições do espaço de chaves atribuídas aos nós.' },
    { term: 'Hash tag', def: 'Trecho entre chaves na chave que força a mesma partição para chaves relacionadas.' },
    { term: 'Hot key', def: 'Chave com tráfego desproporcional que sobrecarrega um nó.' },
    { term: 'Working set', def: 'Conjunto de dados acessados repetidamente que o cache precisa conter.' },
    { term: 'Réplica de leitura', def: 'Cópia assíncrona usada para distribuir leituras, possivelmente atrasada.' }
  ],
  examples: R`**Analogia:** cada **filial da loja** (instância) tem **um quadro de preços na parede** (cache local) e a **matriz** tem a **tabela oficial** (Redis). Se a matriz muda o preço e **só avisa uma filial**, as outras **vendem pelo preço antigo**. O **alto-falante da loja** (pub/sub) avisa todas as filiais conectadas **na hora** (3,6 ms); a filial que **estava fechada** perde o aviso, por isso o quadro tem **validade curta**. Uma **vitrine muito disputada** (hot key) forma **fila no mesmo caixa**; a solução é **abrir vários caixas com cópias da vitrine**.

**Exemplo 1: obsoleto.** A leu 2; B leu 1.

**Exemplo 2: corrigido.** Com PUBLISH, B leu 3 em ~3,6 ms.

**Exemplo 3: capacidade.** 90,5% de acerto com os 200 itens mais populares nos 1.000.`,
  code: [
    { title: 'Duas instâncias e invalidação por pub/sub (JavaScript, simulação medida)', lang: 'js', code: R`const mk = (nome) => ({ nome, c: new Map(), async ler(id) {
  if (this.c.has(id)) return this.c.get(id);
  const v = (await porId(id)).preco; this.c.set(id, v); return v; } });
const A = mk('A'), B = mk('B');

await sub.subscribe('invalida');
sub.on('message', (_, id) => B.c.delete(Number(id)));          // cada instância apaga a sua cópia

await pool.query('update produtos set preco = 3 where id = 11');
A.c.delete(11);
await pub.publish('invalida', '11');                            // propagação medida: ~3,6 ms
// B.ler(11) agora devolve 3`, notes: [{ l: '7', t: 'Cada instância assina o canal e invalida sua cópia.' }, { l: '12', t: 'Sem a publicação, B continuaria lendo 1 (obsoleto).' }] },
    { title: 'Hash tags e réplicas de uma chave quente (JavaScript, esboço)', lang: 'js', code: R`// chaves que precisam do mesmo slot (analisado; Redis Cluster não executado)
const carrinho = (u) => '{usuario:' + u + '}:carrinho';
const sessao = (u) => '{usuario:' + u + '}:sessao';

// chave quente: 8 cópias, escolhidas ao acaso na leitura
const lerHome = () => redis.get('home:' + Math.floor(Math.random() * 8));`, notes: [{ l: '2', t: 'O trecho entre chaves define o slot.' }, { l: '6', t: 'Distribui a leitura de uma chave muito acessada.' }] }
  ],
  bestPractices: ['Use L1 com TTL curto na frente do L2 para chaves quentes.', 'Propague invalidações por pub/sub (ou client-side caching) e limpe o L1 ao reconectar.', 'Mantenha o TTL mesmo com invalidação por mensagens.', 'Planeje particionamento com hash consistente ou slots e hash tags.', 'Trate chaves quentes com cópias ou fragmentos.', 'Monitore evicted_keys e a taxa de acerto.'],
  mistakes: ['Invalidar só a instância que recebeu a escrita.', 'Confiar no pub/sub como entrega garantida.', 'Usar hash mod N em um cluster que cresce.', 'Ignorar chaves quentes até saturar um nó.', 'Dimensionar o cache pelo total de dados e não pelo working set.', 'Esquecer que réplicas de cache são assíncronas.'],
  market: R`Em sistemas com várias instâncias, a combinação de L1 e L2 e a invalidação entre instâncias aparece em quase toda arquitetura de alta escala. Entender as limitações do pub/sub e das réplicas evita bugs de consistência sutis.`,
  summary: R`Com várias instâncias, o cache local (~0,003 ms) acelera mas diverge: na simulação A leu 2 e B leu 1. A invalidação por pub/sub corrigiu (B leu 3, ~3,6 ms), mas o pub/sub não guarda histórico, então mantenha TTL curto. O Redis oferece client-side caching e Cluster com 16.384 slots (analisados, não executados). Trate hot keys com L1 e cópias; dimensione pelo working set e monitore evicted_keys.`,
  refs: [REF.redisClientCache, REF.redisPubsub, REF.redisCluster, REF.redisEviction, REF.memcachePaper],
  cards: [
    { q: 'Qual a vantagem do cache local?', a: 'Latência quase nula (~0,003 ms), sem rede; a desvantagem é divergir entre instâncias.' },
    { q: 'Como propagar invalidações entre instâncias?', a: 'Por pub/sub (cada instância apaga a cópia local), com TTL curto como rede de segurança.' },
    { q: 'Por que hash mod N é ruim ao crescer?', a: 'Mudar N reorganiza quase todas as chaves; hash consistente ou slots movem só uma fração.' },
    { q: 'O que é uma hot key?', a: 'Chave com tráfego desproporcional; use L1, cópias ou fragmentos.' },
    { q: 'Quantos slots tem o Redis Cluster?', a: '16.384.' }
  ]
},
{
  id: 'cch-06', moduleId: 'm3', order: 6, minutes: 85, tags: ['HTTP', 'ETag', 'Cache-Control', 'CDN', 'observabilidade', 'taxa de acerto', 'segurança', 'projeto'],
  title: 'Cache HTTP e CDN, observabilidade, segurança e o projeto: camada de cache para uma API',
  objectives: ['Usar Cache-Control e ETag para revalidação condicional (304) e entender CDN e navegador', 'Medir a taxa de acerto do Redis com keyspace_hits e keyspace_misses', 'Definir métricas, alertas e testes para uma camada de cache', 'Evitar vazamentos de dados e outros riscos de segurança do cache', 'Planejar o projeto "Camada de cache para uma API" com decisões justificadas (ADR)'],
  intro: R`O cache mais barato é o que **nem chega ao servidor**: o do **navegador e da CDN**, controlado por **cabeçalhos HTTP**. Esta aula **executa** uma revalidação com **ETag** (200 com **8.884 bytes** e depois **304 sem corpo**), mede a **taxa de acerto** pelo próprio Redis (**75%** em 12 leituras), discute **segurança** e **testes** e apresenta o **projeto integrador**.`,
  theory: R`### Cache HTTP: quem cacheia o quê
A resposta HTTP carrega **instruções de cache** (RFC 9111; MDN "HTTP caching"):
- §Cache-Control: max-age=N§: **fresca** por N segundos, sem consultar o servidor;
- §public§ (CDN e proxies podem guardar) x §private§ (só o navegador do usuário);
- §no-store§: **não guardar** (dados sensíveis); §no-cache§: **guardar, mas revalidar** sempre;
- §s-maxage§: validade para caches compartilhados (CDN); §stale-while-revalidate§: servir antigo enquanto renova;
- §immutable§ com **nome de arquivo versionado** (§app.3f9c1.js§): cache longo e seguro.
- **Validadores**: §ETag§ (identificador da versão) e §Last-Modified§; o cliente envia §If-None-Match§/§If-Modified-Since§ e o servidor responde **304 Not Modified** (**sem corpo**) se nada mudou.
- §Vary§: indica que a resposta **varia** por cabeçalhos (§Accept-Encoding§, §Accept-Language§, **§Authorization§/cookies**): chave de cache **incorreta** vaza dados.

### Medido: revalidação condicional (servidor Node local)
- **1ª requisição**: **200**, **8.884 bytes** de corpo e §ETag: "6c550e085a363c7b"§;
- **2ª com §If-None-Match§** do mesmo valor: **304** e **0 bytes** de corpo (o servidor **ainda** processou a requisição, mas **não reenviou** o conteúdo);
- **3ª com outro ETag**: **200** (conteúdo enviado).
Isso economiza **banda e tempo de transferência**, **não** o processamento do servidor, a menos que o cálculo do ETag seja barato. Para **evitar até a requisição**, use §max-age§ (frescor).
(Medido contra um servidor local, **sem** navegador, **sem** CDN: o comportamento real do navegador e da CDN **não foi executado**.)

### CDN
Uma **CDN** guarda cópias em **pontos de presença** próximos ao usuário. Boa para **conteúdo público e estático** (arquivos, imagens, páginas) e, com cuidado, para **APIs públicas** de leitura (§s-maxage§). **Invalidação**: por **URL** (purge), por **tag** (*surrogate keys*, em vários provedores) ou por **versão no nome**. **Riscos**: cachear **resposta personalizada** como se fosse pública, ignorar §Vary§ e **cookies**, e **vazar** dados de um usuário para outro.

### Observabilidade: o que medir
- **Taxa de acerto**: o Redis fornece §keyspace_hits§ e §keyspace_misses§ (§INFO stats§). Medido: **9 acertos e 3 falhas** em 12 leituras = **75%** (os contadores são do **servidor**, de **todos os clientes**; use §CONFIG RESETSTAT§ em testes). Meça também **por chave/rota** na aplicação (contadores por tipo de entrada).
- §evicted_keys§ e §expired_keys§ (evicções frequentes = cache pequeno), §used_memory§ e **tamanho médio** dos valores;
- **Latência** do cache (p50/p95/p99) e **erros/timeouts**;
- **Carga no banco** (consultas por segundo) e **tempo de carregamento** nas falhas;
- **Idade** dos dados servidos (frescor) em dados críticos.
**Alertas**: queda brusca da taxa de acerto (deploy mudou a chave?), alta de evicções, latência alta, aumento de erros.

### Testes de uma camada de cache
- **Unitários** com um cache em memória (falso): acerto, falha, TTL, invalidação, cache negativo;
- **Integração** com Redis real (contêiner): stampede (**contar as execuções** da carga: 1 e não 50), corrida de invalidação, expiração;
- **Carga**: taxa de acerto sob uma distribuição realista de chaves;
- **Falha**: Redis fora do ar (a aplicação responde pelo banco, com tempo limite e disjuntor);
- **Segurança**: chaves por tenant/usuário (**um usuário não lê o cache de outro**).

### Segurança do cache
- **Chaves e contexto**: inclua **tenant**, **usuário** ou **papel** quando a resposta depende deles; **nunca** cachear respostas com **dados pessoais** em caches **públicos** (§private§/§no-store§).
- **Autenticação e rede** do Redis (aula nsq-09: o padrão da imagem **não tem senha**); **TLS**; **ACLs**.
- **Envenenamento de cache** (*cache poisoning*): se a **chave** ignora entradas que mudam a resposta (cabeçalhos, parâmetros), um atacante pode **gravar uma resposta ruim** que outros usuários recebem; **normalize** e valide as entradas que formam a chave.
- **Dados em memória**: o cache pode conter **dados sensíveis**; **TTL curto** e criptografia quando necessário.
- **Negação de serviço por cardinalidade**: parâmetros livres criam **chaves ilimitadas** e esvaziam o cache útil.

### Projeto integrador: camada de cache para uma API
**Cenário**: uma API de catálogo (Node.js + PostgreSQL) com **leituras de produto**, **ranking por categoria** (agregado caro) e **atualizações de preço**.
**Entregáveis**:
1. **Cache-aside** de produtos e do ranking, com **TTL com jitter**, **chaves versionadas/por tenant** e **cache negativo**;
2. **Proteção contra stampede** (single-flight e trava) com **teste que conta as execuções**;
3. **Invalidação na escrita** e teste da **corrida** leitor x escritor com a mitigação escolhida;
4. **Cache local L1 + Redis L2** com invalidação por pub/sub;
5. **Cabeçalhos HTTP** (§ETag§, §Cache-Control§) nas listagens públicas, com teste de **304**;
6. **Métricas** (taxa de acerto, evicções, latência, carga no banco) e **alertas** definidos;
7. **ADR** com as decisões (o que cachear, por que, janela de frescor, escritas) e **medições** antes e depois.
**Critérios**: números medidos (latência e consultas ao banco antes e depois), testes de falha do Redis, nenhum vazamento entre usuários e documentação das limitações.`,
  concepts: [
    { term: 'Cache-Control', def: 'Cabeçalho HTTP que define se e por quanto tempo uma resposta pode ser guardada.' },
    { term: 'ETag', def: 'Identificador de versão de um recurso, usado na revalidação condicional.' },
    { term: '304 Not Modified', def: 'Resposta sem corpo indicando que a cópia do cliente continua válida.' },
    { term: 'Vary', def: 'Cabeçalho que indica por quais cabeçalhos de requisição a resposta varia.' },
    { term: 'CDN', def: 'Rede de servidores que guarda cópias de conteúdo perto dos usuários.' },
    { term: 'Taxa de acerto do Redis', def: 'keyspace_hits dividido pela soma de hits e misses no INFO stats.' },
    { term: 'Envenenamento de cache', def: 'Ataque que grava no cache uma resposta alterada por entradas não consideradas na chave.' },
    { term: 'Surrogate key', def: 'Etiqueta usada para invalidar grupos de objetos em uma CDN.' },
    { term: 'ADR', def: 'Registro de decisão de arquitetura com contexto, alternativas e consequências.' },
    { term: 'Disjuntor', def: 'Mecanismo que evita chamar um componente com falhas repetidas.' }
  ],
  examples: R`**Analogia:** o **ETag** é o **número da edição da revista**: você ligou para a banca e perguntou "a edição 6c55... ainda é a mais recente?"; a banca respondeu "sim" (304) sem mandar a revista de novo. A **CDN** é uma **banca em cada bairro**; **Cache-Control: private** é "esta revista tem seu nome, não deixe na banca". A **taxa de acerto** é a **proporção de clientes atendidos sem ir ao depósito**.

**Exemplo 1: revalidação.** 200 com 8.884 bytes; depois 304 com 0 bytes.

**Exemplo 2: métrica.** 9 hits e 3 misses = 75%.

**Exemplo 3: projeto.** O ranking cacheado com stampede protegido e invalidação testada.`,
  code: [
    { title: 'ETag e revalidação condicional (JavaScript com servidor Node, saída medida)', lang: 'js', code: R`import http from 'node:http';
import crypto from 'node:crypto';
const corpo = JSON.stringify({ produtos: Array.from({ length: 200 }, (_, i) => ({ id: i, nome: 'produto ' + i, preco: i + 0.5 })) });
const etag = '"' + crypto.createHash('sha1').update(corpo).digest('hex').slice(0, 16) + '"';
const srv = http.createServer((req, res) => {
  if (req.headers['if-none-match'] === etag) { res.writeHead(304, { etag, 'cache-control': 'max-age=0, must-revalidate' }); return res.end(); }
  res.writeHead(200, { 'content-type': 'application/json', etag, 'cache-control': 'max-age=0, must-revalidate' }); res.end(corpo);
});
// 1ª: 200, 8.884 bytes | 2ª com If-None-Match: 304, 0 bytes | 3ª com outro ETag: 200`, notes: [{ l: '5', t: 'Mesmo validador: responde 304 sem corpo.' }, { l: '6', t: 'must-revalidate obriga a conferir quando vencer.' }] },
    { title: 'Taxa de acerto pelo próprio Redis (JavaScript, saída medida)', lang: 'js', code: R`await redis.config('RESETSTAT');
await redis.set('a', '1');
for (let i = 0; i < 9; i++) await redis.get('a');                // 9 acertos
for (let i = 0; i < 3; i++) await redis.get('nao-existe');       // 3 falhas
const st = await redis.info('stats');
// keyspace_hits = 9, keyspace_misses = 3 -> 75,0%`, notes: [{ l: '1', t: 'Zera as estatísticas (apenas em testes).' }, { l: '5', t: 'Os contadores são do servidor, de todos os clientes.' }] }
  ],
  bestPractices: ['Use Cache-Control e ETag para o que pode ser cacheado fora do servidor.', 'Use no-store ou private para dados pessoais.', 'Inclua tenant e usuário nas chaves quando a resposta depende deles.', 'Meça taxa de acerto, evicções, latência e carga no banco, com alertas.', 'Teste stampede, corrida, falha do Redis e isolamento entre usuários.', 'Registre as decisões em um ADR com números.'],
  mistakes: ['Cachear respostas personalizadas em cache público.', 'Ignorar o Vary.', 'Não medir a taxa de acerto.', 'Não testar o comportamento com o Redis indisponível.', 'Chaves que aceitam parâmetros livres sem limite.', 'Usar Redis sem senha e sem rede restrita para o cache.'],
  market: R`Cache HTTP e CDN são parte do dia a dia do desenvolvimento web e de plataformas de conteúdo. Observar a taxa de acerto, testar o isolamento entre usuários e documentar as decisões diferencia uma camada de cache confiável de uma fonte de incidentes.`,
  summary: R`O cache HTTP usa Cache-Control, ETag e Vary; medido: 200 com 8.884 bytes, depois 304 sem corpo com If-None-Match (servidor local, sem navegador nem CDN). O Redis mede a taxa de acerto (9 hits e 3 misses = 75%). Defina métricas e alertas, teste stampede, corrida e falha do Redis, proteja contra vazamento e envenenamento por chaves e registre decisões em um ADR no projeto da camada de cache para uma API.`,
  refs: [REF.httpCaching, REF.cacheControl, REF.rfc9111, REF.pgStat, REF.redisEviction],
  cards: [
    { q: 'O que significa um 304?', a: 'A cópia do cliente continua válida; a resposta não tem corpo (medido: 0 bytes).' },
    { q: 'Qual a diferença entre no-store e no-cache?', a: 'no-store não guarda; no-cache guarda, mas exige revalidação.' },
    { q: 'Como medir a taxa de acerto do Redis?', a: 'keyspace_hits / (keyspace_hits + keyspace_misses) em INFO stats (medido: 75%).' },
    { q: 'Para que serve o Vary?', a: 'Indica que a resposta varia por certos cabeçalhos; ignorá-lo pode vazar dados.' },
    { q: 'O que testar em uma camada de cache?', a: 'Acerto e falha, stampede, corrida de invalidação, falha do Redis e isolamento entre usuários.' }
  ]
}
];
