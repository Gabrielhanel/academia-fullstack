// C3.7 — NoSQL: MongoDB e Redis. Aulas 7 a 9 (Redis II; consistência e CAP; operação, segurança e backup + projeto).
import { REF } from './c37-a.mjs';
const R = String.raw;

export const REF3 = {
  redisTx: { title: 'Redis — Transactions (MULTI/EXEC/WATCH)', url: 'https://redis.io/docs/latest/develop/using-commands/transactions/', kind: 'doc' },
  redisStreams: { title: 'Redis — Streams', url: 'https://redis.io/docs/latest/develop/data-types/streams/', kind: 'doc' },
  redisPubsub: { title: 'Redis — Pub/Sub', url: 'https://redis.io/docs/latest/develop/pubsub/', kind: 'doc' },
  redisPersistence: { title: 'Redis — Persistence', url: 'https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/', kind: 'doc' },
  redisEviction: { title: 'Redis — Key eviction', url: 'https://redis.io/docs/latest/develop/reference/eviction/', kind: 'doc' },
  redisSecurity: { title: 'Redis — Security', url: 'https://redis.io/docs/latest/operate/oss_and_stack/management/security/', kind: 'doc' },
  mongoConcerns: { title: 'MongoDB — Read Concern', url: 'https://www.mongodb.com/docs/manual/reference/read-concern/', kind: 'doc' },
  mongoWriteConcern: { title: 'MongoDB — Write Concern', url: 'https://www.mongodb.com/docs/manual/reference/write-concern/', kind: 'doc' },
  mongoReplication: { title: 'MongoDB — Replication', url: 'https://www.mongodb.com/docs/manual/replication/', kind: 'doc' },
  mongoBackup: { title: 'MongoDB — Backup Methods', url: 'https://www.mongodb.com/docs/manual/core/backups/', kind: 'doc' },
  mongoSecurity: { title: 'MongoDB — Security Checklist', url: 'https://www.mongodb.com/docs/manual/administration/security-checklist/', kind: 'doc' },
  cap: { title: 'Brewer — CAP Twelve Years Later', url: 'https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/', kind: 'artigo' }
};

export const lessonsC = [
{
  id: 'nsq-07', moduleId: 'm3', order: 7, minutes: 85, tags: ['Redis', 'MULTI', 'WATCH', 'streams', 'pub/sub', 'RDB', 'AOF', 'eviction'],
  title: 'Redis II: transações, streams, pub/sub, persistência e política de eviction',
  objectives: ['Usar §MULTI/EXEC§ e §WATCH§ para atualizações condicionais', 'Construir filas confiáveis com Streams e grupos de consumidores', 'Distinguir pub/sub (sem histórico) de streams (com histórico)', 'Comparar RDB e AOF e ler a configuração de persistência', 'Escolher a política de eviction conforme o papel do Redis (cache ou armazenamento)'],
  intro: R`Na aula anterior vimos estruturas e comandos atômicos. Agora vamos às perguntas de **produção**: como fazer **atualizações condicionais** (§WATCH§), como montar **filas que não perdem mensagens** (Streams), por que o **pub/sub perde mensagens**, **o que acontece com os dados quando o Redis reinicia** (persistência) e **o que acontece quando a memória acaba** (eviction). Tudo medido no Redis 8.12.0 do laboratório.`,
  theory: R`### MULTI/EXEC e WATCH
§MULTI§ inicia uma fila de comandos e §EXEC§ os executa **em sequência, sem que outro cliente intervenha**. Não há *rollback*: se um comando falha em tempo de execução, os demais continuam. Para **atualização condicional** (otimista), use §WATCH chave§ antes de ler: se a chave **mudar** entre o §WATCH§ e o §EXEC§, o §EXEC§ **devolve null** e nada é executado. Medido: um cliente fez §WATCH saldo§, leu, outro cliente alterou §saldo§, e o §EXEC§ do primeiro devolveu **null**; o cliente deve **reler e tentar de novo**. É o **bloqueio otimista** (compare com a coluna de versão da aula trx-04). Para lógica composta maior, **scripts Lua** (§EVAL§) rodam **atomicamente** no servidor (não executado aqui).

### Streams: filas com histórico e confirmação
Um **stream** é um **log de entradas** (§XADD stream * campo valor§) com ids ordenados. **Grupos de consumidores** (§XGROUP CREATE§, §XREADGROUP§) distribuem entradas entre consumidores; cada entrada lida fica **pendente** até o consumidor confirmá-la com §XACK§. Medido: após ler 3 entradas, §XPENDING§ mostrava **3 pendentes**; depois de §XACK§ em uma, **2**. Se o consumidor morrer, as pendentes podem ser **reivindicadas** por outro (§XAUTOCLAIM§). Isso dá **entrega pelo menos uma vez** (*at-least-once*): o consumidor deve ser **idempotente** (aula mod/trx: chave de idempotência). Streams são o substituto correto de listas para **filas confiáveis**.

### Pub/Sub: mensagens sem memória
§PUBLISH canal msg§ entrega aos **assinantes conectados naquele instante**; **não guarda** nada. Medido: uma mensagem publicada **antes** de o cliente assinar **nunca chegou**; as publicadas depois chegaram. Use pub/sub para **notificações efêmeras** (invalidar caches locais, avisos em tempo real) e **streams** quando perder uma mensagem não for aceitável.

### Persistência: RDB e AOF
- **RDB** (instantâneo): grava um *snapshot* periódico (regras §save§). Compacto e rápido de restaurar, mas **perde** o que veio após o último snapshot. Medido o padrão da imagem: §save "3600 1 300 100 60 10000"§ (snapshot após 1 mudança em 1 h, 100 em 5 min, 10.000 em 1 min).
- **AOF** (*append-only file*): registra **cada escrita**; com §appendfsync everysec§ perde **até ~1 s**. Medido: no contêiner de teste, §appendonly§ estava **no** (desligado).
- Podem ser **combinados**. Sem nenhum, o Redis é **só memória** (um reinício apaga tudo).
**Decisão**: se o Redis é **cache**, a persistência pode ser desnecessária; se guarda **dados que não existem em outro lugar** (filas, sessões que não podem cair), ligue AOF e planeje **réplicas** e **backups** (aula nsq-09). Persistência **não é backup** (um erro humano é replicado).

### Memória cheia: maxmemory e eviction
Com §maxmemory§ definido, o Redis aplica a política §maxmemory-policy§ quando o limite chega:
- **noeviction**: **recusa** novas escritas (erro **OOM**) e continua lendo;
- **allkeys-lru**: remove chaves **menos usadas recentemente** (ideal para **cache**);
- **volatile-lru/ttl**: só remove chaves **com TTL**; **allkeys-lfu** e outras variantes.
Medido com §maxmemory 12mb§ e escrita contínua:
- **allkeys-lru**: sobraram **103.923** chaves e **96.077** foram removidas; a chave **mais nova existia**, a **mais antiga não**.
- **noeviction**: **93.648 escritas foram recusadas** com **OOM**, e as **leituras continuaram**.
(Um primeiro teste com §3mb§ esvaziou o banco: limites muito pequenos competem com a memória do próprio servidor; o experimento foi refeito com 12 MB.)
**Regra**: **cache → allkeys-lru/lfu**; **dados que não podem sumir → noeviction + monitoramento + capacidade** (e tratar o OOM na aplicação).

### Outras decisões
- **Réplicas** (assíncronas) dão leitura e *failover*, mas podem **perder escritas** no último instante.
- **Cluster** particiona chaves em 16.384 *slots* (não executado aqui); transações e scripts exigem chaves no **mesmo slot** (*hash tags*).
- **Observabilidade**: §INFO§ (memória, clientes, §evicted_keys§), §SLOWLOG§, latência.`,
  concepts: [
    { term: 'MULTI/EXEC', def: 'Agrupa comandos para execução sequencial sem intervenção de outros clientes, sem rollback.' },
    { term: 'WATCH', def: 'Vigia chaves; se mudarem antes do EXEC, a transação é cancelada (EXEC devolve null).' },
    { term: 'Stream', def: 'Estrutura de log de entradas ordenadas, com grupos de consumidores e confirmações.' },
    { term: 'Grupo de consumidores', def: 'Conjunto de consumidores que dividem as entradas de um stream.' },
    { term: 'XACK', def: 'Confirma o processamento de uma entrada pendente de um stream.' },
    { term: 'Pub/Sub', def: 'Troca de mensagens efêmeras: quem não está assinando no momento perde a mensagem.' },
    { term: 'RDB', def: 'Persistência por instantâneos periódicos.' },
    { term: 'AOF', def: 'Persistência por registro de todas as escritas.' },
    { term: 'maxmemory-policy', def: 'Política aplicada quando a memória máxima é atingida (noeviction, allkeys-lru, etc.).' },
    { term: 'At-least-once', def: 'Garantia de entrega que pode repetir mensagens, exigindo consumidores idempotentes.' }
  ],
  examples: R`**Analogia:** o **WATCH** é **olhar o preço na etiqueta antes de passar no caixa**: se a etiqueta mudou, o caixa recusa e você refaz a conta. O **stream** é um **caderno de pedidos da cozinha** onde cada pedido fica **pendente até o cozinheiro riscar** (XACK); o **pub/sub** é **gritar um aviso no salão**: quem saiu para o corredor não ouviu. O **RDB** é **fotografar o quadro de hora em hora**; o **AOF** é **anotar cada mudança num diário**. A **eviction** é o **quadro cheio**: apagar o que ninguém usa (cache) ou **proibir novas anotações** (noeviction).

**Exemplo 1: WATCH.** O EXEC devolveu null porque outro cliente mexeu na chave.

**Exemplo 2: stream.** 3 pendentes → 2 após um XACK.

**Exemplo 3: eviction.** allkeys-lru removeu 96.077 chaves; noeviction recusou 93.648 escritas.`,
  code: [
    { title: 'WATCH e streams (JavaScript com ioredis, saída medida)', lang: 'js', code: R`// transação otimista
await a.watch('saldo');
const atual = Number(await a.get('saldo'));
await b.set('saldo', 999);                               // outro cliente altera
const r = await a.multi().set('saldo', atual + 10).exec();
console.log(r);                                          // null: nada foi executado

// stream com grupo de consumidores
await r.xgroup('CREATE', 'pedidos', 'g1', '$', 'MKSTREAM');
for (let i = 0; i < 3; i++) await r.xadd('pedidos', '*', 'n', i);
const lidas = await r.xreadgroup('GROUP', 'g1', 'c1', 'COUNT', 3, 'STREAMS', 'pedidos', '>');
await r.xpending('pedidos', 'g1');                       // 3 pendentes
await r.xack('pedidos', 'g1', lidas[0][1][0][0]);
await r.xpending('pedidos', 'g1');                       // 2 pendentes`, notes: [{ l: '1', t: 'WATCH marca a chave para detectar alterações.' }, { l: '5', t: 'EXEC devolve null se a chave mudou.' }, { l: '9', t: 'O grupo começa no fim do stream ($).' }, { l: '13', t: 'XACK remove a entrada da lista de pendentes.' }] },
    { title: 'Persistência e eviction (comandos redis-cli, saída medida)', lang: 'bash', code: R`redis-cli CONFIG GET save                       # "3600 1 300 100 60 10000"
redis-cli CONFIG GET appendonly                 # no
redis-cli CONFIG SET maxmemory 12mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru   # cache: sobraram 103.923 chaves, 96.077 removidas
redis-cli CONFIG SET maxmemory-policy noeviction    # dados: 93.648 escritas recusadas (OOM), leituras ok
redis-cli INFO stats | grep evicted_keys`, notes: [{ l: '1', t: 'Snapshots do padrão da imagem.' }, { l: '4', t: 'LRU remove as chaves menos usadas.' }, { l: '5', t: 'noeviction recusa escritas e preserva os dados.' }] }
  ],
  bestPractices: ['Use WATCH ou scripts Lua para atualizações condicionais.', 'Use streams com grupos para filas que não podem perder mensagens.', 'Torne os consumidores idempotentes.', 'Escolha a política de eviction pelo papel do Redis.', 'Não confunda persistência com backup.', 'Monitore memória e evicted_keys.'],
  mistakes: ['Esperar rollback em MULTI/EXEC.', 'Usar pub/sub quando a perda de mensagens é inaceitável.', 'Usar listas como filas sem confirmação.', 'Deixar noeviction em um cache e receber erros OOM.', 'Usar allkeys-lru em dados que não existem em outro lugar.', 'Achar que o Redis sem persistência sobrevive a reinícios.'],
  market: R`Filas, sessões e limites de taxa em Redis estão em produção em quase toda empresa; perder dados por eviction ou por pub/sub mal escolhido é um incidente clássico. Saber a política de memória e a durabilidade evita surpresas.`,
  summary: R`§WATCH§ + §MULTI/EXEC§ dão atualização otimista (medido: EXEC devolveu null após alteração concorrente). Streams com grupos mantêm entradas pendentes até o §XACK§ (3 → 2); pub/sub perde mensagens enviadas antes da assinatura. Persistência: RDB (padrão "3600 1 300 100 60 10000") e AOF (desligado no teste). Com maxmemory de 12 MB, allkeys-lru removeu 96.077 chaves e manteve a mais nova; noeviction recusou 93.648 escritas com OOM, mantendo as leituras.`,
  refs: [REF3.redisTx, REF3.redisStreams, REF3.redisPubsub, REF3.redisPersistence, REF3.redisEviction],
  cards: [
    { q: 'O que significa EXEC devolver null depois de WATCH?', a: 'Uma chave vigiada mudou; nada foi executado e a aplicação deve reler e tentar de novo.' },
    { q: 'Qual a diferença entre stream e pub/sub?', a: 'Stream guarda entradas e exige confirmação; pub/sub não guarda e perde mensagens de quem não está assinando.' },
    { q: 'RDB ou AOF?', a: 'RDB é snapshot periódico (pode perder o intervalo); AOF registra as escritas (perde ~1 s com everysec).' },
    { q: 'Qual política de eviction para cache?', a: 'allkeys-lru (ou lfu), que remove as chaves menos usadas.' },
    { q: 'O que faz noeviction?', a: 'Recusa novas escritas com OOM e mantém as leituras.' }
  ]
},
{
  id: 'nsq-08', moduleId: 'm4', order: 8, minutes: 75, tags: ['CAP', 'PACELC', 'consistência', 'replicação', 'write concern', 'read concern', 'transações'],
  title: 'Consistência, replicação e o teorema CAP: o que cada banco promete',
  objectives: ['Enunciar o teorema CAP e o PACELC sem os clichês', 'Explicar consistência forte, eventual e causal em termos de leituras', 'Configurar write concern e read concern no MongoDB e entender o custo', 'Relacionar Redis, MongoDB e PostgreSQL às suas garantias', 'Escolher uma estratégia por requisito do caso de uso'],
  intro: R`"**Escolha dois: consistência, disponibilidade, tolerância a partição**" é a frase mais repetida e mais mal usada sobre bancos distribuídos. Esta aula a reescreve com precisão: o que o **CAP** realmente diz, o que o **PACELC** acrescenta, e **como configurar** (write/read concern) o que o MongoDB oferece. Os fatos de transação e réplicas vêm do laboratório (replica set de nó único); **partições de rede reais não foram simuladas**.`,
  theory: R`### O teorema CAP, sem clichê
Numa **partição de rede** (nós que não conseguem se comunicar), um sistema replicado precisa escolher entre:
- **Consistência (C)**: toda leitura vê a escrita mais recente (linearizabilidade) — **recusa** responder (ou responde erro) em algum lado;
- **Disponibilidade (A)**: todo nó que está de pé responde — **possivelmente com dado antigo**.
**P não é opcional**: redes falham. Então o CAP só diz: **durante uma partição, ou C ou A**. **Sem partição**, dá para ter os dois. O que realmente importa no dia a dia é o **PACELC**: se há **P**artição, escolha **A** ou **C**; **E**lse (senão), escolha **L**atência ou **C**onsistência — porque **replicar de forma síncrona custa tempo**.

### Níveis de consistência (do ponto de vista de quem lê)
- **Forte/linearizável**: a leitura vê a última escrita confirmada.
- **Eventual**: se as escritas pararem, as réplicas **convergem**; leituras podem ver **dados antigos**.
- **Causal / ler suas próprias escritas**: você sempre vê o que **você** escreveu.
- **Monotônica**: você nunca "volta no tempo".

### O que cada sistema do curso promete (por padrão)
| Sistema | Modelo | Ponto de atenção |
|---|---|---|
| PostgreSQL (nó único) | ACID, serializável opcional | replicação **assíncrona** pode atrasar (aula pgm-09: réplica real medida) |
| MongoDB (replica set) | escrita no **primário**; leitura no primário por padrão | leituras em **secundários** podem estar **atrasadas** |
| Redis (réplicas) | replicação **assíncrona** | no *failover* pode **perder escritas** confirmadas |
| Redis único | atômico por comando | sem persistência, reinício apaga |

### Write concern e read concern (MongoDB)
- **Write concern** diz **quantos nós** devem confirmar a escrita: §w: 1§ (só o primário), §w: "majority"§ (a **maioria**: a escrita **sobrevive a um failover**), §j: true§ (no diário em disco).
- **Read concern**: §"local"§ (o que o nó tem, pode ser revertido), §"majority"§ (só dado confirmado pela maioria), §"linearizable"§ (o mais forte e mais caro).
- **Preferência de leitura** (§readPreference§): §primary§ (padrão), §secondaryPreferred§ (alivia o primário, aceita atraso).
**Custo**: maior garantia = **mais latência** e menos disponibilidade em falhas. **Regra**: **dinheiro e estoque** → majority (e transação quando for multidocumento); **feeds, contadores de visualização** → configurações baratas.
(A semântica está documentada; **não** medimos a diferença de latência entre concerns no replica set de nó único, que não tem maioria significativa.)

### Transações e consistência (resumo medido)
- MongoDB em **nó único sem replica set**: transação **recusada** ("does not support retryable writes"); com replica set de nó único: **transferência commit** (ana 30, bruno 120) e **abort** desfez a operação (aula nsq-04).
- Redis: **MULTI/EXEC** sem rollback; **WATCH** dá otimismo (aula nsq-07).
- PostgreSQL: ACID completo (aulas trx-01..07).

### Idempotência e reprocessamento
Em sistemas distribuídos a mensagem pode chegar **duas vezes** ou **nenhuma**; projete **operações idempotentes** (chave de idempotência, §upsert§, "se ainda não processado") e **reconciliação**. Consistência eventual **exige** isso.

### Como decidir
1. **O que não pode estar errado?** (saldo, estoque, pagamento) → **consistência forte**, banco transacional.
2. **O que tolera atraso?** (feeds, contagens, recomendações) → **eventual**, réplicas, cache.
3. **Qual a latência alvo e a geografia?** (multi-região torna C mais caro).
4. **Como o usuário percebe o erro?** (ler a própria escrita costuma bastar).
5. **Qual o plano de falha?** (failover, perda aceitável: RPO/RTO — aula nsq-09).

### Mitos
- "NoSQL é eventual e SQL é consistente": **falso**; depende da **configuração** e da **arquitetura** (MongoDB com majority é forte; Postgres com réplica assíncrona lê dado antigo).
- "CAP significa escolher 2 de 3 permanentemente": **falso**; só **durante partições**.
- "Consistência eventual é bagunça": é um **contrato** com convergência e tratamento (idempotência).`,
  concepts: [
    { term: 'Teorema CAP', def: 'Em uma partição de rede, um sistema replicado precisa escolher entre consistência e disponibilidade.' },
    { term: 'PACELC', def: 'Extensão do CAP: com partição, A ou C; senão (Else), latência ou consistência.' },
    { term: 'Linearizabilidade', def: 'Consistência forte: toda leitura vê a escrita mais recente confirmada.' },
    { term: 'Consistência eventual', def: 'Réplicas convergem se as escritas pararem; leituras podem ser antigas.' },
    { term: 'Write concern', def: 'Número de nós que devem confirmar uma escrita (w:1, w:"majority", j:true).' },
    { term: 'Read concern', def: 'Nível de garantia dos dados lidos (local, majority, linearizable).' },
    { term: 'Read preference', def: 'Escolha do nó (primário ou secundário) onde ler.' },
    { term: 'Failover', def: 'Troca automática do primário quando ele falha.' },
    { term: 'Idempotência', def: 'Propriedade de uma operação que pode ser repetida sem mudar o resultado além da primeira vez.' },
    { term: 'RPO e RTO', def: 'Perda máxima de dados aceitável e tempo máximo para restabelecer o serviço.' }
  ],
  examples: R`**Analogia:** duas filiais de uma loja com o **telefone cortado**. Para **não vender o mesmo item duas vezes** (consistência), uma filial para de vender (perde disponibilidade). Para **continuar vendendo** (disponibilidade), cada uma vende do estoque que acha que tem e **reconcilia depois** (eventual). O **write concern majority** é **só confirmar a venda quando a maioria das filiais anotou**: mais seguro, mais lento.

**Exemplo 1: dinheiro.** Majority e transação.

**Exemplo 2: contador de visualizações.** Redis com INCR e persistência frouxa, aceitando perder alguns segundos.

**Exemplo 3: réplica de leitura.** Painel aceita atraso: readPreference secundário.`,
  code: [
    { title: 'Write concern e read concern (JavaScript com o driver mongodb)', lang: 'js', code: R`import { MongoClient, ReadPreference } from 'mongodb';
const cli = new MongoClient('mongodb://127.0.0.1:57018/?directConnection=true');
const contas = cli.db('lab').collection('contas', { writeConcern: { w: 'majority', j: true }, readConcern: { level: 'majority' } });
await contas.updateOne({ _id: 'ana' }, { $inc: { saldo: -70 } });   // só confirma quando a maioria gravou

// painel: tolera atraso
const painel = cli.db('lab').collection('eventos', { readPreference: ReadPreference.SECONDARY_PREFERRED });`, notes: [{ l: '3', t: 'Garantia forte: w majority e j true.' }, { l: '7', t: 'Leitura em secundário pode ser antiga.' }] }
  ],
  bestPractices: ['Classifique os dados por tolerância a erro antes de escolher o banco.', 'Use write concern majority para dados críticos.', 'Aceite leituras em secundários apenas para dados que toleram atraso.', 'Projete operações idempotentes.', 'Documente RPO e RTO.', 'Teste o failover antes da produção.'],
  mistakes: ['Repetir "escolha 2 de 3" sem entender a partição.', 'Achar que todo NoSQL é eventual.', 'Ler de réplica após escrever e estranhar o dado antigo.', 'Usar w:1 para dinheiro.', 'Não tratar mensagens duplicadas.', 'Supor que a réplica assíncrona nunca perde escritas.'],
  market: R`Perguntas de CAP e consistência são clássicas em entrevistas de backend sênior; a resposta madura fala de partições, PACELC, concerns e idempotência, e não decora "2 de 3".`,
  summary: R`O CAP diz que, durante uma partição, escolhe-se consistência ou disponibilidade; o PACELC acrescenta latência contra consistência no funcionamento normal. No MongoDB, §w: "majority"§ e read concern majority dão garantias fortes ao custo de latência; no Redis e no PostgreSQL a replicação é assíncrona por padrão. Medido: transações precisam de replica set (commit ana 30/bruno 120; abort preservou 120). Partições reais não foram simuladas.`,
  refs: [REF3.cap, REF3.mongoConcerns, REF3.mongoWriteConcern, REF3.mongoReplication],
  cards: [
    { q: 'O que o CAP realmente diz?', a: 'Durante uma partição de rede, é preciso escolher entre consistência e disponibilidade.' },
    { q: 'O que o PACELC acrescenta?', a: 'Sem partição, ainda há escolha entre latência e consistência.' },
    { q: 'O que w: "majority" garante?', a: 'Que a maioria dos nós confirmou a escrita, sobrevivendo a um failover.' },
    { q: 'NoSQL é sempre eventual?', a: 'Não; depende da configuração (concerns, replicação).' },
    { q: 'Por que idempotência?', a: 'Porque mensagens podem ser repetidas; a operação deve produzir o mesmo resultado.' }
  ]
},
{
  id: 'nsq-09', moduleId: 'm4', order: 9, minutes: 90, tags: ['operação', 'segurança', 'backup', 'mongodump', 'autenticação', 'monitoramento', 'projeto'],
  title: 'Operação, segurança e backup de MongoDB e Redis, e projeto: feed de eventos',
  objectives: ['Fazer e restaurar backup do MongoDB com §mongodump§/§mongorestore§ e validar a restauração', 'Reconhecer que MongoDB e Redis, nas imagens padrão, **não têm autenticação** e como habilitá-la', 'Aplicar menor privilégio, rede restrita e TLS como requisitos de produção', 'Monitorar o essencial (memória, conexões, lentidão)', 'Planejar o projeto integrador "Feed de eventos"'],
  intro: R`Um banco NoSQL "que funciona na máquina do desenvolvedor" costuma estar **aberto**: sem senha, escutando em todas as interfaces. Esta aula fecha o módulo com **operação**: **backup que se testa**, **segurança** (o que as imagens padrão **não** fazem) e **monitoramento**, e introduz o **projeto integrador** que reúne MongoDB e Redis em um **feed de eventos**.`,
  theory: R`### Backup do MongoDB
- **§mongodump§ / §mongorestore§**: exportam e importam dados (e índices) em BSON; bons para bancos **pequenos e médios** e migrações. Medido: o dump compactado (§--gzip --archive§) de **100.000 documentos** gerou **2.614.192 bytes**; a restauração em outro servidor recuperou **100.000 documentos**; a verificação de índices registrou os valores **3** e **2** (saída §[100000, 3, 2]§ do laboratório, cuja interpretação por índice não foi detalhada: **sempre compare** os índices da origem e do destino na sua verificação).
- **Instantâneo do sistema de arquivos / volumes** e serviços gerenciados (Atlas): para bancos grandes; exigem consistência (parar escritas ou usar suporte do sistema).
- **Oplog**: em replica sets, permite recuperação **até um ponto no tempo** (não executado aqui).
**Regra de ouro**: **backup que nunca foi restaurado não é backup**. Restaure em um ambiente de teste, **conte documentos e índices**, e rode uma consulta de verificação. Defina **RPO** e **RTO** (aula nsq-08).

### Backup do Redis
Os arquivos **RDB/AOF** (aula nsq-07) são a base: copie o RDB (ou use §BGSAVE§) para fora do servidor e teste a restauração. Para cache, o "backup" pode ser **reconstruir** a partir da fonte de verdade.

### Segurança: o que as imagens padrão NÃO fazem
Medido nas imagens oficiais do laboratório: o **MongoDB** aceitou conexões **sem autenticação**, e o **Redis** tinha o usuário §default§ com **§nopass§** (qualquer cliente executa qualquer comando). Isso é aceitável para um laboratório ligado a §127.0.0.1§ e **perigoso** em qualquer outra situação: bancos NoSQL expostos sem senha estão entre os incidentes mais comuns da história recente.
Lista mínima de produção:
1. **Autenticação**: MongoDB com §--auth§ e usuários por **papel** (§readWrite§ no banco do app, **nunca** root para a aplicação); Redis com **ACLs** (§ACL SETUSER app on >senha ~cache:* +get +set§) e o usuário §default§ desativado.
2. **Rede**: escutar só em interfaces privadas, **firewall** e *security groups*; nada de portas 27017/6379 na internet.
3. **TLS** entre cliente e servidor e entre nós.
4. **Menor privilégio**: comandos perigosos restritos (§FLUSHALL§, §CONFIG§, §KEYS§ no Redis).
5. **Segredos** fora do código (variáveis de ambiente, cofre de segredos).
6. **Atualizações** e imagens oficiais fixadas por versão.
7. **Auditoria** e logs.
(O procedimento está na documentação oficial "Security"; **não** habilitamos a autenticação nos contêineres do laboratório: o item é **analisado**, não executado.)

### Monitoramento essencial
- **MongoDB**: §db.serverStatus()§, §db.currentOp()§, **profiler** de consultas lentas, **tamanho do working set** versus RAM, lag de replicação, conexões.
- **Redis**: §INFO memory§ (§used_memory§, fragmentação), §evicted_keys§, §connected_clients§, §SLOWLOG GET§, latência.
- **Alertas**: espaço em disco, memória, lag, taxa de erros, §OOM§.

### Capacidade e custos
Meça **tamanho de documento** e **memória por chave** (medido: 100 B de string = 135 B), projete **crescimento** e aplique **TTL**/arquivamento. Em MongoDB, índices consomem memória: **remova os não usados** (aula nsq-03).

### Projeto integrador: Feed de eventos
**Cenário**: uma plataforma de cursos registra **eventos** (aula concluída, exercício feito, comentário) e exibe um **feed** por usuário e um **placar semanal**.
**Entregáveis**:
1. **Modelo de documentos** (MongoDB): coleção §eventos§ (um documento por evento, com §userId§, §tipo§, §criadoEm§, §payload§), com **validação** e **índice composto** §(userId, criadoEm desc)§ e **TTL** de 90 dias; justifique **referenciar** (não embutir eventos no usuário).
2. **Feed paginado** por cursor (§criadoEm§ + §_id§), com **explain** mostrando IXSCAN sem SORT.
3. **Agregação** de eventos por tipo e dia.
4. **Redis**: **cache** do feed recente (TTL curto), **sorted set** do placar semanal e **INCR** de contadores; **stream** com grupo de consumidores para processar eventos pesados com **idempotência**.
5. **Política de eviction** e **persistência** justificadas, **consistência** (o que pode estar atrasado).
6. **Segurança** (autenticação, ACL, rede) e **backup** com restauração testada.
**Critérios**: planos de execução anexados, contagens verificadas, riscos e decisões registrados. Os experimentos do laboratório servem de modelo.`,
  concepts: [
    { term: 'mongodump', def: 'Utilitário que exporta dados e índices do MongoDB em BSON.' },
    { term: 'mongorestore', def: 'Utilitário que importa um dump para um servidor MongoDB.' },
    { term: 'Autenticação', def: 'Verificação da identidade do cliente antes de aceitar comandos.' },
    { term: 'ACL (Redis)', def: 'Lista de controle de acesso que define usuários, chaves e comandos permitidos.' },
    { term: 'Menor privilégio', def: 'Conceder apenas as permissões estritamente necessárias.' },
    { term: 'TLS', def: 'Protocolo que cifra a comunicação entre cliente e servidor.' },
    { term: 'Oplog', def: 'Registro de operações de um replica set, usado em replicação e recuperação por ponto no tempo.' },
    { term: 'SLOWLOG', def: 'Registro de comandos lentos do Redis.' },
    { term: 'RPO', def: 'Quantidade máxima de dados que se aceita perder.' },
    { term: 'Restauração testada', def: 'Verificação periódica de que um backup restaura dados íntegros.' }
  ],
  examples: R`**Analogia:** o banco sem senha é **uma loja com a porta aberta e o caixa destravado**: nada acontece até alguém passar. O backup é **o seguro**, mas **só vale se você já testou acioná-lo**: restaurar é o simulado de incêndio. O monitoramento é o **painel do carro**: avisa antes de o motor fundir.

**Exemplo 1: backup.** 2.614.192 bytes comprimidos; 100.000 documentos restaurados.

**Exemplo 2: segurança.** Redis com o usuário default sem senha, ok em 127.0.0.1, inaceitável exposto.

**Exemplo 3: projeto.** O feed combina Mongo (histórico), Redis (cache e placar) e stream (processamento).`,
  code: [
    { title: 'Backup e restauração do MongoDB (bash, saída medida)', lang: 'bash', code: R`mongodump --uri="mongodb://127.0.0.1:57017" --db lab --gzip --archive=lab.gz     # 2.614.192 bytes
mongorestore --uri="mongodb://127.0.0.1:57019" --gzip --archive=lab.gz
mongosh "mongodb://127.0.0.1:57019/lab" --eval "db.pedidos.countDocuments()"        # 100000
mongosh "mongodb://127.0.0.1:57019/lab" --eval "db.pedidos.getIndexes().length"     # compare com a origem`, notes: [{ l: '1', t: 'Dump compactado em um único arquivo.' }, { l: '3', t: 'Contar documentos é a verificação mínima.' }] },
    { title: 'Esboço de segurança (não executado; configuração documentada)', lang: 'bash', code: R`# MongoDB: iniciar com autenticação e criar usuário de aplicação
mongod --auth --bind_ip 127.0.0.1
# db.createUser({ user: 'app', pwd: passwordPrompt(), roles: [{ role: 'readWrite', db: 'feed' }] })

# Redis: ACL com menor privilégio
# ACL SETUSER app on >SENHA ~feed:* +get +set +incr +zadd +xadd
# ACL SETUSER default off`, notes: [{ l: '2', t: 'Autenticação ligada e escuta em interface restrita.' }, { l: '7', t: 'Desativa o usuário padrão sem senha.' }] }
  ],
  bestPractices: ['Teste a restauração de todo backup.', 'Ative autenticação e use papéis de menor privilégio.', 'Não exponha 27017 ou 6379 à internet.', 'Use TLS e segredos fora do código.', 'Monitore memória, lag e lentidão com alertas.', 'Registre RPO e RTO.'],
  mistakes: ['Confiar que o backup funciona sem restaurá-lo.', 'Deixar o banco sem senha em redes alcançáveis.', 'Usar o usuário root na aplicação.', 'Habilitar KEYS e FLUSHALL para todos.', 'Não monitorar a memória do Redis.', 'Confundir persistência com backup.'],
  market: R`Bancos NoSQL abertos na internet geram incidentes recorrentes. Profissionais que sabem restaurar backups, aplicar autenticação e monitorar são valorizados em plantões e auditorias.`,
  summary: R`Backup: §mongodump --gzip --archive§ (2.614.192 bytes) restaurou 100.000 documentos (a conferência de índices registrou 3 e 2; compare origem e destino); sempre teste a restauração. Segurança: as imagens padrão de MongoDB e Redis não exigem autenticação (medido), então produção exige auth, ACLs, rede restrita, TLS e menor privilégio (analisado, não executado). Monitore memória, lag e lentidão. O projeto Feed de eventos reúne documentos, agregações, cache, placar, stream e decisões de consistência.`,
  refs: [REF3.mongoBackup, REF3.mongoSecurity, REF3.redisSecurity, REF3.redisPersistence],
  cards: [
    { q: 'Como validar um backup?', a: 'Restaurando em outro ambiente e conferindo contagens, índices e uma consulta de verificação.' },
    { q: 'As imagens padrão exigem senha?', a: 'Não: o MongoDB aceitou conexão sem autenticação e o Redis tinha o usuário default nopass.' },
    { q: 'Como restringir o Redis?', a: 'Com ACLs por usuário, chaves e comandos, desativando o usuário default.' },
    { q: 'O que o mongodump exporta?', a: 'Dados e definições de índices em BSON.' },
    { q: 'Persistência substitui backup?', a: 'Não: um erro humano ou corrupção é replicado.' }
  ]
}
];
