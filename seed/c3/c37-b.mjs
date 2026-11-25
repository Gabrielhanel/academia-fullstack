// C3.7 — NoSQL: MongoDB e Redis. Aulas 4 a 6 (modelagem de documentos; agregações; Redis: estruturas de dados).
const R = String.raw;
import { REF } from './c37-a.mjs';

export const REF2 = {
  mongoModeling: { title: 'MongoDB — Data Modeling', url: 'https://www.mongodb.com/docs/manual/data-modeling/', kind: 'doc' },
  mongoEmbed: { title: 'MongoDB — Embedded Data Versus References', url: 'https://www.mongodb.com/docs/manual/data-modeling/concepts/embedding-vs-references/', kind: 'doc' },
  mongoPatterns: { title: 'MongoDB — Building with Patterns', url: 'https://www.mongodb.com/blog/post/building-with-patterns-a-summary', kind: 'artigo' },
  mongoAggregation: { title: 'MongoDB — Aggregation', url: 'https://www.mongodb.com/docs/manual/aggregation/', kind: 'doc' },
  mongoPipeline: { title: 'MongoDB — Aggregation Pipeline Stages', url: 'https://www.mongodb.com/docs/manual/reference/mql/aggregation-stages/', kind: 'doc' },
  mongoLookup: { title: 'MongoDB — $lookup', url: 'https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/', kind: 'doc' },
  mongoOptimization: { title: 'MongoDB — Aggregation Pipeline Optimization', url: 'https://www.mongodb.com/docs/manual/core/aggregation-pipeline-optimization/', kind: 'doc' },
  redisTypes: { title: 'Redis — Data types', url: 'https://redis.io/docs/latest/develop/data-types/', kind: 'doc' },
  redisCommands: { title: 'Redis — Commands', url: 'https://redis.io/docs/latest/commands/', kind: 'doc' },
  redisExpire: { title: 'Redis — Key expiration (EXPIRE)', url: 'https://redis.io/docs/latest/commands/expire/', kind: 'doc' },
  redisPipelining: { title: 'Redis — Pipelining', url: 'https://redis.io/docs/latest/develop/using-commands/pipelining/', kind: 'doc' },
  redisScan: { title: 'Redis — SCAN', url: 'https://redis.io/docs/latest/commands/scan/', kind: 'doc' },
  redisHll: { title: 'Redis — HyperLogLog', url: 'https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/', kind: 'doc' },
  redisKeys: { title: 'Redis — Keyspace', url: 'https://redis.io/docs/latest/develop/using-commands/keyspace/', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'nsq-04', moduleId: 'm2', order: 4, minutes: 85, tags: ['modelagem de documentos', 'embutir', 'referenciar', 'padrões', 'limite de 16 MiB', 'array ilimitado', 'transações'],
  title: 'Modelagem orientada a documentos: embutir ou referenciar, padrões e limites',
  objectives: ['Aplicar o princípio "modele para o padrão de acesso" em documentos', 'Escolher entre embutir e referenciar com base em cardinalidade, crescimento e consistência', 'Medir o efeito de cada escolha em leituras e atualizações', 'Reconhecer os limites (documento de 16 MiB, arrays ilimitados) e os padrões de modelagem (subconjunto, balde, referência estendida, versão do esquema)', 'Usar transações multidocumento quando a consistência entre documentos for essencial'],
  intro: R`No modelo relacional, você **normaliza** e junta. Em bancos de documentos, a pergunta muda: **"o que eu leio junto?"**. Documentos aninhados permitem trazer um cliente **com seus pedidos** em **uma** leitura, mas **embutir tudo** cria documentos gigantes, duplicação e atualizações difíceis. Esta aula mede as alternativas (MongoDB 8.3.17, **10.000 clientes com 5 pedidos cada**) e mostra os **padrões** e os **limites** que decidem a modelagem.`,
  theory: R`### O princípio
**Modele para o padrão de acesso**, não para a "verdade lógica" dos dados. Liste as **consultas e atualizações mais frequentes** e desenhe os documentos para que elas sejam **simples e atômicas**. (Compare com a aula mod-04: desnormalizar conscientemente.)

### Embutir x referenciar
- **Embutir** (*embedding*): guardar dados relacionados **dentro** do documento (pedidos dentro do cliente).
  - **Vantagens**: **uma leitura** traz tudo; **atualização atômica** de tudo no documento; sem junções.
  - **Custos**: documentos **maiores**; **duplicação** se o mesmo dado aparece em vários documentos; **crescimento** sem limite pode estourar o tamanho máximo; difícil consultar o filho **sem** o pai.
- **Referenciar**: guardar o **id** do relacionado e buscá-lo separadamente (§clienteId§ no pedido).
  - **Vantagens**: sem duplicação; filhos **independentes** e crescendo sem limite; consulta direta dos filhos.
  - **Custos**: **duas consultas** ou um §$lookup§; consistência entre documentos exige cuidado.
Regras de decisão: **um para poucos**, filhos **lidos com o pai** e que **não crescem sem limite** → **embutir**; **um para muitos** (centenas ou mais), filhos **consultados sozinhos** ou **compartilhados** → **referenciar**; **muitos para muitos** → **referências** (e, às vezes, embutir uma cópia pequena do que é exibido).

### O experimento (10.000 clientes × 5 pedidos)
Três modelagens do mesmo conteúdo (medianas de 7 execuções após aquecimento):
| Consulta | Embutido | Referenciado (2 consultas) | Referenciado ($lookup) |
|---|---|---|---|
| Um cliente **com** seus pedidos | **~2,9 ms** (1 §findOne§) | **~5,6 ms** | **~4,2 ms** |
| **100 clientes** com pedidos | **~6,0 ms** | n/a | **~13,7 ms** |
- Tamanho médio: documento embutido **230 bytes**; cliente referenciado **36** + pedido **65** bytes cada (5 pedidos = 325): o embutido é **mais compacto** neste caso (menos cabeçalhos).
- **Atualizar** um pedido dentro do array (§updateOne({ _id }, { $set: { "pedidos.$[p].status": "enviado" } }, { arrayFilters: [{ "p.valor": 5 }] })§): **~2,5 ms**, em **uma operação atômica**.
**Leitura:** para o padrão "cliente com pedidos", **embutir** foi mais rápido (cerca de **2 vezes**) e mais simples. Mas isso vale porque **cada cliente tem poucos pedidos**: o resultado **muda** se os pedidos crescerem sem limite ou se você consultar **pedidos de todos os clientes** (por status, por data).

### O limite de 16 MiB e o array ilimitado
Um documento MongoDB tem **no máximo 16 MiB (16.777.216 bytes)**. Medido: um documento com **15.000 comentários** de ~1,1 KB (~16,56 MB) foi **inserido**; com **15.500** (~17,1 MB), o servidor recusou com o código **10334**: **"object to insert too large. size in bytes: 17291320, max size: 16777216"**. Um **array que cresce sem limite** (comentários de um post popular, eventos de um sensor, pedidos de um cliente corporativo) **vai estourar** em algum momento, e **antes** disso fica **lento** (cada atualização reescreve um documento grande). Regra: **nunca embutir um array sem teto**; use **referência** (um documento por comentário) ou o padrão do **balde** (abaixo).

### Padrões de modelagem
- **Subconjunto** (*subset*): embuta só os **N mais recentes** (os 10 últimos comentários) e deixe o resto em outra coleção.
- **Balde** (*bucket*): agrupe séries em documentos por período (uma hora de leituras de um sensor em um documento com um array de até N itens): reduz documentos e índices.
- **Referência estendida** (*extended reference*): no pedido, guarde o **id** do cliente **e** uma cópia do **nome** (o que a tela exibe), evitando junções; atualize a cópia quando o nome mudar (ou aceite o desatualizado, se for retrato histórico).
- **Computado** (*computed*): guarde totais e contagens calculados (aula mod-04: risco de divergência).
- **Versão do esquema** (*schema versioning*): um campo §versaoEsquema§ para **migrar documentos aos poucos** (aplicações leem as duas formas durante a migração).
- **Polimórfico**: documentos de **tipos diferentes** na mesma coleção, com um campo §tipo§ (úteis para consultar vários tipos juntos).
- **Árvore**: pais e caminhos (como na aula mod-06).
(Descritos na documentação e na série "Building with Patterns", **não executados** aqui, exceto o que foi medido acima.)

### Consistência entre documentos
- **Um documento**: atômico (aula nsq-02): o motivo clássico para **embutir** o que precisa mudar junto.
- **Vários documentos**: **transações multidocumento** em **replica set** (ou sharded cluster). Medido: em um **nó único sem replica set**, a tentativa falhou com **"This MongoDB deployment does not support retryable writes"**; em um **replica set de nó único**, a transação transferiu 70 entre duas contas (**ana 30, bruno 120**), e uma transação que lançou erro **foi abortada** (**saldo do bruno continuou 120**). Transações custam: **evite-as** como padrão; **modele** para que uma operação toque **um documento** quando possível; use transações para os casos que **realmente** exigem atomicidade entre documentos (aula nsq-08).

### Atualizar dados duplicados
Se o nome do cliente está copiado em 10.000 pedidos, mudar o nome exige §updateMany§ em muitos documentos (**não atômico entre documentos**), com **janela de inconsistência**. Decida **quais cópias precisam ser atuais** (o nome na tela) e quais são **retrato histórico** (o endereço de entrega no momento do pedido, que **não deve mudar**).

### Esquema evolutivo com disciplina
- Defina **validação** (aula nsq-02) com §validationLevel: "moderate"§ para evoluir.
- Use §versaoEsquema§ e migre em **lotes** (aula mod-05: expandir e contrair).
- Documente os **tipos** e **nomes** de campos em um lugar único (esquemas no código, como Zod ou Mongoose, **não executados** aqui).

### Quando documentos são a escolha errada
Dados **muito relacionais**, com consultas por **muitas combinações** (relatórios ad hoc) e **transações entre várias entidades**: o relacional (PostgreSQL) costuma ser melhor, com **JSONB** onde houver partes flexíveis.`,
  concepts: [
    { term: 'Embutir (embedding)', def: 'Guardar dados relacionados dentro do mesmo documento, permitindo uma leitura e atualização atômica.' },
    { term: 'Referenciar', def: 'Guardar o id de um registro relacionado em outro documento e buscá-lo separadamente.' },
    { term: '$lookup', def: 'Estágio de agregação que junta documentos de outra coleção.' },
    { term: 'Limite de 16 MiB', def: 'Tamanho máximo de um documento no MongoDB (16.777.216 bytes).' },
    { term: 'Array ilimitado', def: 'Anti-padrão em que um array embutido cresce sem teto e acaba estourando o limite.' },
    { term: 'Padrão do balde', def: 'Agrupar itens de uma série em documentos por período para reduzir a quantidade de documentos.' },
    { term: 'Referência estendida', def: 'Guardar o id e uma cópia dos campos mais usados do documento referenciado.' },
    { term: 'Versão do esquema', def: 'Campo que identifica a forma do documento e permite migrações graduais.' },
    { term: 'Transação multidocumento', def: 'Transação ACID que abrange vários documentos, disponível em replica sets e clusters.' },
    { term: 'arrayFilters', def: 'Opção de atualização que seleciona elementos de um array por condição.' }
  ],
  examples: R`**Analogia:** embutir é **guardar o cliente e suas notas fiscais na mesma pasta**: pegou a pasta, tem tudo; se a pasta virar uma caixa de arquivos de mil notas, **não cabe mais** na gaveta (16 MiB). Referenciar é **guardar as notas em uma estante à parte** e anotar na pasta do cliente os números delas: mais viagens para juntar tudo, mas a estante cresce à vontade. O padrão do balde é **uma pasta por hora de registros do sensor**; o do subconjunto é **deixar na pasta só as cinco notas mais recentes**.

**Exemplo 1: leitura medida.** Cliente com pedidos: ~2,9 ms embutido contra ~5,6 ms com duas consultas e ~4,2 ms com $lookup.

**Exemplo 2: limite.** 15.000 comentários cabem; 15.500 (~17,1 MB) foram recusados com 10334.

**Exemplo 3: transação.** Sem replica set, a transação não existe; com o replica set de nó único, funcionou e o aborto desfez.`,
  code: [
    { title: 'As três modelagens (JavaScript com o driver mongodb, saída medida)', lang: 'js', code: R`// EMBUTIDO: cliente com pedidos em um documento
{ _id: 4321, nome: 'Cliente 4321', pedidos: [{ valor: 5, status: 'pago' }, { valor: 15, status: 'pago' } /* ... */] }
await cli_emb.findOne({ _id: 4321 });                                              // ~2,9 ms (1 consulta)

// REFERENCIADO: pedidos em outra coleção com clienteId (e índice)
await cli_ref.findOne({ _id: 4321 });
await ped_ref.find({ clienteId: 4321 }).toArray();                                 // ~5,6 ms (2 consultas)

// REFERENCIADO com $lookup (1 consulta, junção no servidor)
await cli_ref.aggregate([{ $match: { _id: 4321 } },
  { $lookup: { from: 'ped_ref', localField: '_id', foreignField: 'clienteId', as: 'pedidos' } }]).toArray();   // ~4,2 ms

// atualizar um pedido dentro do array, em uma operação atômica
await cli_emb.updateOne({ _id: 4321 }, { $set: { 'pedidos.$[p].status': 'enviado' } }, { arrayFilters: [{ 'p.valor': 5 }] });   // ~2,5 ms`, notes: [{ l: '3', t: 'Uma leitura traz o cliente e seus pedidos.' }, { l: '7', t: 'Duas idas ao banco, mas cada coleção cresce de forma independente.' }, { l: '11', t: '$lookup junta no servidor.' }, { l: '14', t: 'arrayFilters atualiza apenas os elementos que satisfazem a condição.' }] },
    { title: 'Limite de 16 MiB e transação multidocumento (JavaScript, saída medida)', lang: 'js', code: R`// documento com array ilimitado: 15.500 comentários de ~1,1 KB
try {
  await db.collection('grande').insertOne({ comentarios: Array.from({ length: 15500 }, (_, i) => 'x'.repeat(1100) + i) });
} catch (e) { console.log(e.code, e.message); }
// 10334: object to insert too large. size in bytes: 17291320, max size: 16777216

// transação entre dois documentos (replica set)
const s = cli.startSession();
await s.withTransaction(async () => {
  await contas.updateOne({ _id: 'bruno' }, { $inc: { saldo: 70 } }, { session: s });
  await contas.updateOne({ _id: 'ana' }, { $inc: { saldo: -70 } }, { session: s });
});
// ana 30, bruno 120 (em nó único sem replica set: erro "does not support retryable writes")`, notes: [{ l: '5', t: 'O servidor recusa documentos acima de 16 MiB.' }, { l: '8', t: 'A sessão agrupa as operações na mesma transação.' }, { l: '13', t: 'Sem replica set a transação não é aceita.' }] }
  ],
  bestPractices: ['Modele para as consultas e atualizações mais frequentes.', 'Embuta dados lidos juntos, poucos e de crescimento limitado.', 'Referencie dados que crescem sem limite, que são consultados sozinhos ou compartilhados.', 'Nunca use arrays embutidos sem teto: aplique subconjunto, balde ou referência.', 'Diferencie cópias que devem ser atuais de retratos históricos.', 'Use transações multidocumento só quando necessário e em replica set.'],
  mistakes: ['Normalizar tudo como no relacional e fazer junções na aplicação.', 'Embutir tudo e estourar o limite de 16 MiB.', 'Copiar dados em muitos documentos sem plano de atualização.', 'Achar que $lookup é equivalente a uma junção barata em qualquer volume.', 'Usar transações em tudo, perdendo o benefício do modelo.', 'Evoluir o esquema sem versão nem validação.'],
  market: R`Má modelagem de documentos é a principal causa de projetos MongoDB que "não escalam" ou ficam lentos. Entrevistas costumam pedir "embutir ou referenciar?" com um cenário; a resposta madura cita cardinalidade, crescimento, padrão de acesso e consistência.`,
  summary: R`Em documentos, modele para o padrão de acesso: embutir (leitura única, atomicidade) ou referenciar (crescimento livre, filhos independentes). Medido com 10.000 clientes e 5 pedidos cada: cliente com pedidos ~2,9 ms embutido, ~5,6 ms com duas consultas, ~4,2 ms com §$lookup§; 100 clientes, ~6,0 ms contra ~13,7 ms. O limite de 16 MiB recusou o documento de ~17,1 MB (código 10334); arrays ilimitados exigem subconjunto, balde ou referência. Transações multidocumento exigem replica set (nó único falhou; no replica set a transferência funcionou e o aborto desfez).`,
  refs: [REF2.mongoModeling, REF2.mongoEmbed, REF2.mongoPatterns, REF.mongoLimits, REF.mongoAtomicity],
  cards: [
    { q: 'Quando embutir?', a: 'Quando os dados são lidos juntos, são poucos e não crescem sem limite, e precisam mudar atomicamente.' },
    { q: 'Qual o tamanho máximo de um documento?', a: '16 MiB (16.777.216 bytes); acima disso o servidor recusa (código 10334).' },
    { q: 'O que é o anti-padrão do array ilimitado?', a: 'Embutir um array que cresce sem teto, até estourar o limite e degradar as atualizações.' },
    { q: 'O que é a referência estendida?', a: 'Guardar o id e uma cópia dos campos mais usados do documento referenciado, evitando junções.' },
    { q: 'Onde funcionam transações multidocumento?', a: 'Em replica sets e clusters (medido: nó único sem replica set recusou).' }
  ]
},
{
  id: 'nsq-05', moduleId: 'm2', order: 5, minutes: 80, tags: ['agregação', 'pipeline', '$group', '$match', '$unwind', '$lookup', '$facet', 'desempenho'],
  title: 'Agregações no MongoDB: o pipeline, $lookup, $facet e desempenho',
  objectives: ['Escrever pipelines com §$match§, §$group§, §$sort§, §$project§, §$unwind§, §$limit§ e §$count§', 'Usar §$lookup§ e §$facet§ e entender seus custos', 'Comparar agregar no servidor com trazer os documentos para o cliente', 'Aplicar as regras de ordem do pipeline e uso de índices', 'Traduzir uma consulta SQL com GROUP BY para um pipeline'],
  intro: R`Quando precisamos **resumir** documentos (totais por status, produtos mais vendidos, funil de conversão), usamos o **pipeline de agregação**: uma **sequência de estágios**, cada um transformando o fluxo de documentos do anterior. É o **GROUP BY, JOIN e window do MongoDB**. Esta aula usa os **100.000 pedidos** do laboratório e **mede** o ganho de agregar **no servidor** (~147 ms) contra trazer tudo para o cliente (~1.159 ms).`,
  theory: R`### O pipeline
§collection.aggregate([ estágio1, estágio2, ... ])§. Os principais estágios:
| Estágio | Função | Equivalente SQL |
|---|---|---|
| §$match§ | filtra documentos | WHERE (e HAVING, se após $group) |
| §$group§ | agrupa e calcula acumuladores (§$sum§, §$avg§, §$min§, §$max§, §$push§, §$addToSet§, §$first§) | GROUP BY |
| §$sort§ | ordena | ORDER BY |
| §$project§ / §$addFields§ / §$set§ | seleciona e calcula campos | SELECT expressões |
| §$unwind§ | **desmembra um array** em um documento por elemento | unnest / JOIN com tabela filha |
| §$lookup§ | junta documentos de outra coleção | LEFT JOIN |
| §$limit§ / §$skip§ | limita | LIMIT / OFFSET |
| §$count§ | conta | COUNT(*) |
| §$facet§ | executa **vários sub-pipelines** sobre a mesma entrada | várias consultas em uma |
| §$bucket§ / §$bucketAuto§ | faixas | CASE / width_bucket |
| §$setWindowFields§ | funções de janela | OVER (...) |
| §$merge§ / §$out§ | grava o resultado | INSERT ... SELECT |

### Exemplos medidos (100.000 pedidos)
**Por status** (§$group§ com §$sum§):
§§§
db.pedidos.aggregate([{ $group: { _id: '$status', pedidos: { $sum: 1 }, total: { $sum: '$valor' } } }, { $sort: { _id: 1 } }])
§§§
Resultado: aberto 25.000 pedidos (total 12.462.500), cancelado 25.000 (12.512.500), enviado 25.000 (12.537.500) e pago 25.000 (12.487.500).
**Top 3 SKUs dos pedidos pagos** (§$match§, §$unwind§, §$group§, §$sort§, §$limit§): as três primeiras posições, A15, A17 e A27, com **2.001** unidades cada (empate; a ordem de desempate foi pelo id). O §$unwind§ **multiplica** o fluxo: cada pedido com dois itens vira dois documentos, **antes** do agrupamento.
**§$facet§**: devolveu, em **uma consulta**, a contagem por status **e** o valor máximo (§999,5§) sobre a mesma entrada, útil para **telas com vários painéis** (cuidado: cada sub-pipeline processa **toda** a entrada).

### Agregar no servidor ou no cliente?
Medido (100.000 documentos, medianas):
- **§aggregate§ com §$group§ no servidor**: **~147 ms**, devolvendo **4** linhas;
- **§find§ de todos os documentos** (só dois campos) e soma em JavaScript: **~1.159 ms** (**~8 vezes** mais lento), trafegando **100.000** documentos.
**Regra**: **calcule onde os dados estão**. Mover dados para somar fora é caro em **rede**, **memória** e **CPU** (a mesma lição do ORM, aula orm-05).

### Ordem dos estágios e índices
- **Filtre cedo** (§$match§ no começo) para reduzir o fluxo; só o **primeiro** §$match§ e o §$sort§ (antes de estágios que alteram os documentos) podem usar **índices**.
- O otimizador do MongoDB **reordena** estágios quando é seguro (por exemplo, move um §$match§ que só depende de campos não alterados para antes do §$group§ ou §$project§; documentação "Aggregation Pipeline Optimization"). Medido: um §$match§ por §status§ **antes** do §$group§ por cliente levou **~108 ms**, e o §$group§ por (cliente, status) com o §$match§ **depois** levou **~114 ms**: **sem diferença relevante**, pois o otimizador antecipou o filtro. **Não conte com isso**: escreva o §$match§ **primeiro**.
- §$project§ cedo reduz o tamanho dos documentos; §$limit§ após §$sort§ permite ordenação **top-N** eficiente.
- **Memória**: cada estágio bloqueante (§$group§, §$sort§) tem limite de **100 MB**; use §allowDiskUse: true§ para estouros (mais lento) ou reformule.
- §explain§ também funciona em agregações (§db.command({ explain: { aggregate, pipeline, cursor: {} }, verbosity: 'executionStats' })§).

### $lookup: a junção do MongoDB
§{ $lookup: { from: 'ped_ref', localField: '_id', foreignField: 'clienteId', as: 'pedidos' } }§ junta cada cliente aos pedidos. Medido: **100 clientes com pedidos** levaram **~13,7 ms** com §$lookup§ contra **~6,0 ms** com pedidos **embutidos** (aula nsq-04). Dicas: **indexe** o campo §foreignField§ (medido: o índice em §clienteId§ existia); filtre **antes** de juntar; evite §$lookup§ sobre **muitos** documentos de entrada; se você junta **o tempo todo**, repense a modelagem (embutir) ou use o relacional.

### Agregação x SQL
- Um **GROUP BY status** do SQL = §$group: { _id: '$status' }§.
- Um **HAVING** = §$match§ **após** o §$group§.
- Um **JOIN** = §$lookup§ (+ §$unwind§).
- **Janelas** = §$setWindowFields§.
- **CTEs e recursão**: §$graphLookup§ (recursão em coleções).
O SQL tem **otimizador** e **linguagem** mais ricos para análises ad hoc; o MongoDB brilha em **transformações de documentos**. Para **relatórios analíticos pesados**, considere um **armazém** (colunar) ou o relacional.

### Boas práticas
1. **Filtre primeiro**, projete cedo.
2. **Indexe** o que o primeiro §$match§ e o §$sort§ usam.
3. **Meça** com §explain§ e com dados reais.
4. **Evite** §$unwind§ de arrays gigantes sem filtrar.
5. **Materialize** resultados caros com §$merge§ (tabelas de resumo) quando a frescura permitir.
6. **Teste** o pipeline com dados pequenos e verifique a **contagem**.`,
  concepts: [
    { term: 'Pipeline de agregação', def: 'Sequência de estágios que transformam o fluxo de documentos de uma coleção.' },
    { term: '$group', def: 'Estágio que agrupa documentos por uma chave e calcula acumuladores.' },
    { term: '$unwind', def: 'Estágio que desmembra um array em um documento por elemento.' },
    { term: '$lookup', def: 'Estágio que junta documentos de outra coleção, como um LEFT JOIN.' },
    { term: '$facet', def: 'Estágio que executa vários sub-pipelines sobre a mesma entrada em uma só consulta.' },
    { term: 'Acumulador', def: 'Operador que combina valores de um grupo ($sum, $avg, $max, $push).' },
    { term: 'allowDiskUse', def: 'Opção que permite aos estágios bloqueantes gravar em disco quando excedem a memória.' },
    { term: 'Otimizador de pipeline', def: 'Componente que reordena e combina estágios quando isso preserva o resultado.' },
    { term: '$merge', def: 'Estágio que grava o resultado em uma coleção, permitindo materializar agregações.' },
    { term: 'Agregação no servidor', def: 'Cálculo de resumos no banco, trafegando apenas o resultado.' }
  ],
  examples: R`**Analogia:** o pipeline é uma **linha de montagem**: cada estágio recebe as peças do anterior, faz uma operação e passa adiante. **Filtrar cedo** é descartar peças defeituosas **no começo** da linha, em vez de montar tudo para jogar fora no fim. O **$unwind** é **desmontar um kit em peças soltas**; o **$group** é **reunir as peças por tipo e contar**. Trazer tudo para o cliente é **levar a fábrica inteira para casa** para fazer a contagem.

**Exemplo 1: resumo.** Quatro grupos de 25.000 pedidos com seus totais.

**Exemplo 2: servidor x cliente.** ~147 ms contra ~1.159 ms para o mesmo total por status.

**Exemplo 3: $lookup.** 100 clientes com pedidos: ~13,7 ms contra ~6,0 ms com pedidos embutidos.`,
  code: [
    { title: 'Pipelines de resumo (JavaScript, resultado medido)', lang: 'js', code: R`// por status
await ped.aggregate([
  { $group: { _id: '$status', pedidos: { $sum: 1 }, total: { $sum: '$valor' } } },
  { $sort: { _id: 1 } }
]).toArray();
// [{ _id: 'aberto', pedidos: 25000, total: 12462500 }, ...]

// top 3 SKUs vendidos entre os pedidos pagos
await ped.aggregate([
  { $match: { status: 'pago' } },                 // filtra primeiro
  { $unwind: '$itens' },                          // um documento por item
  { $group: { _id: '$itens.sku', qtd: { $sum: '$itens.qtd' } } },
  { $sort: { qtd: -1, _id: 1 } },
  { $limit: 3 }
]).toArray();
// [{ _id: 'A15', qtd: 2001 }, { _id: 'A17', qtd: 2001 }, { _id: 'A27', qtd: 2001 }]

// vários painéis em uma consulta
await ped.aggregate([{ $facet: {
  porStatus: [{ $group: { _id: '$status', n: { $sum: 1 } } }, { $sort: { _id: 1 } }],
  valorMax: [{ $group: { _id: null, max: { $max: '$valor' } } }]
} }]).toArray();`, notes: [{ l: '9', t: 'O $match no início reduz o fluxo e pode usar índice.' }, { l: '10', t: '$unwind multiplica os documentos pelo tamanho do array.' }, { l: '18', t: '$facet reaproveita a mesma entrada para vários resultados.' }] },
    { title: 'Servidor x cliente (JavaScript, mediana medida)', lang: 'js', code: R`// no servidor: 4 linhas trafegam (~147 ms)
await ped.aggregate([{ $group: { _id: '$status', total: { $sum: '$valor' } } }]).toArray();

// no cliente: 100.000 documentos trafegam (~1.159 ms)
const docs = await ped.find({}, { projection: { status: 1, valor: 1 } }).toArray();
const m = {};
for (const d of docs) m[d.status] = (m[d.status] || 0) + d.valor;`, notes: [{ l: '2', t: 'O servidor devolve só o resultado.' }, { l: '5', t: 'O cliente traz todos os documentos para somar.' }] }
  ],
  bestPractices: ['Agregue no servidor e trafegue só o resultado.', 'Coloque o $match no início e projete cedo.', 'Indexe os campos do primeiro $match e do $sort.', 'Indexe o foreignField de um $lookup e evite $lookup em volumes grandes.', 'Use allowDiskUse com consciência e $merge para materializar resumos.', 'Valide o pipeline com dados pequenos e confira as contagens.'],
  mistakes: ['Trazer todos os documentos para somar em JavaScript.', 'Esquecer o $match inicial e processar a coleção toda.', 'Usar $unwind em arrays enormes sem filtrar.', 'Fazer $lookup sem índice no campo estrangeiro.', 'Contar com o otimizador em vez de escrever o filtro primeiro.', 'Usar pipelines gigantes para análises que um armazém ou o relacional fariam melhor.'],
  market: R`Agregações são o dia a dia de quem constrói relatórios e APIs sobre MongoDB. Saber a ordem dos estágios, o papel dos índices e o custo do $lookup distingue consultas de milissegundos de consultas de minutos.`,
  summary: R`O pipeline encadeia estágios (§$match§, §$group§, §$sort§, §$unwind§, §$lookup§, §$facet§). Medido em 100.000 pedidos: o resumo por status (4 grupos de 25.000) levou ~147 ms no servidor contra ~1.159 ms trazendo os documentos para o cliente; o top 3 de SKUs (A15, A17, A27 com 2.001) usou §$unwind§; o §$lookup§ de 100 clientes custou ~13,7 ms contra ~6,0 ms embutido. O otimizador antecipou o §$match§ (~108 e ~114 ms), mas escreva-o primeiro. Indexe o primeiro §$match§, o §$sort§ e o campo do §$lookup§.`,
  refs: [REF2.mongoAggregation, REF2.mongoPipeline, REF2.mongoLookup, REF2.mongoOptimization],
  cards: [
    { q: 'O que o $unwind faz?', a: 'Desmembra um array em um documento por elemento, multiplicando o fluxo.' },
    { q: 'Por que agregar no servidor?', a: 'Para trafegar só o resultado: medido ~147 ms contra ~1.159 ms trazendo 100.000 documentos.' },
    { q: 'Quais estágios podem usar índices?', a: 'O primeiro $match e o $sort (antes de estágios que alteram os documentos).' },
    { q: 'Qual o equivalente SQL do $lookup?', a: 'Um LEFT JOIN (com $unwind quando se quer uma linha por item).' },
    { q: 'Para que serve $facet?', a: 'Para executar vários sub-pipelines sobre a mesma entrada em uma só consulta.' }
  ]
},
{
  id: 'nsq-06', moduleId: 'm3', order: 6, minutes: 85, tags: ['Redis', 'strings', 'hashes', 'listas', 'conjuntos', 'sorted sets', 'TTL', 'pipeline'],
  title: 'Redis I: modelo em memória, estruturas de dados, TTL, atomicidade e pipelines',
  objectives: ['Explicar o modelo do Redis (memória, comandos atômicos, estruturas de dados) e seus usos', 'Usar strings, hashes, listas, conjuntos, conjuntos ordenados e HyperLogLog em problemas reais', 'Aplicar TTL e §SET NX EX§ para expiração e travas simples', 'Usar §INCR§ e comandos atômicos em vez de ler e gravar, com a medição de 1.000 operações concorrentes', 'Usar pipelines, §SCAN§ e desenhar chaves com prefixos'],
  intro: R`O **Redis** é um **servidor de estruturas de dados em memória**: você manda **comandos** que operam sobre **strings, hashes, listas, conjuntos, conjuntos ordenados, streams** e mais, com **latência de microssegundos**. É o cinto de utilidades do backend: **cache, sessões, contadores, filas, placares, limites de taxa**. Esta aula usa o **Redis 8.12.0** (imagem oficial) e **mede**: atomicidade com 1.000 operações simultâneas, TTL, estruturas, **pipeline** (10.000 comandos em **165 ms** contra **5,6 s**) e §KEYS§ contra §SCAN§.`,
  theory: R`### O modelo
- **Em memória**: os dados vivem na RAM (o acesso é rápido; a capacidade é limitada pela memória); a **persistência** em disco é opcional (aula nsq-07).
- **Comandos atômicos**: o Redis executa **um comando por vez** (execução de comandos em uma única thread lógica), então cada comando é **atômico**. Isso vale para §INCR§, §LPUSH§, §SADD§, §ZADD§...
- **Estruturas** com operações próprias (em vez de apenas "bytes").
- **Chaves** são strings binárias; o **espaço de chaves** é plano, e a convenção usa **prefixos com dois-pontos** (§cliente:1§, §pedido:10:itens§).
- **Clientes** conversam por um protocolo simples (RESP), em TCP; **pipelines** reduzem as idas e vindas.
Medido: §redis_version:8.12.0§, §redis_mode:standalone§.

### Strings e atomicidade
§SET chave valor§, §GET§, §INCR§/§DECR§/§INCRBY§, §APPEND§, §GETSET§... Medido com **1.000 operações simultâneas** sobre dois contadores:
- **§INCR a§** (atômico) mil vezes → **1000**;
- **§GET b§ + §SET b (valor + 1)§** (ler e gravar) mil vezes → **1** (**999 atualizações perdidas**).
A mesma lição de concorrência do curso (trx-03, nsq-02): **use o comando atômico**, nunca "ler, calcular e gravar". Para operações compostas, use §MULTI/EXEC§, §WATCH§ ou scripts Lua (aula nsq-07).

### Expiração (TTL)
§EXPIRE chave segundos§, §PEXPIRE§, ou na criação: §SET chave valor EX 100§ / §PX 300§. §TTL§ devolve os segundos restantes. Medido: §TTL sessao:1§ = **100**; chave **sem TTL** = **-1**; chave **inexistente** = **-2**; uma chave com **PX 300** já **não existia** após 450 ms (§GET§ devolveu §null§). O Redis remove chaves expiradas **de forma passiva** (ao acessá-las) e **ativa** (varreduras periódicas). Use TTL em **caches, sessões, códigos de verificação** e **trava**.

### Trava simples: SET NX EX
§SET trava:job w1 NX EX 30§ só grava **se a chave não existir** (§NX§) e já define a **expiração** (§EX§): atomicamente. Medido: a **1ª** tentativa devolveu **OK**; a **2ª**, **null**; o dono permaneceu **w1**. É a base de **travas distribuídas** simples (para garantias fortes, estude os limites do algoritmo e prefira o banco de dados ou um serviço de coordenação; a trava com expiração **pode** ser perdida se o dono demorar mais que o TTL: **use um valor único** e **libere só se for o dono**, com script).

### Hashes
§HSET cliente:1 nome Ana cidade POA pontos 10§; §HGETALL§; §HINCRBY cliente:1 pontos 5§ (medido: 10 → **15**). Hashes guardam **objetos pequenos** com **campos** atualizáveis individualmente, e são **compactos** em memória (para hashes pequenos, o Redis usa uma codificação compacta).

### Listas
§RPUSH fila t1 t2 t3§, §LPOP§ (medido: devolveu **t1**; sobraram **t2, t3**), §LRANGE§, §BLPOP§ (**bloqueante**, bom para **filas**). Lista como **fila** simples (produtor §RPUSH§, consumidor §BLPOP§); para filas **confiáveis** (reprocessar se o consumidor cair) use **Streams** (aula nsq-07).

### Conjuntos
§SADD§, §SISMEMBER§, §SINTER§, §SUNION§, §SDIFF§: **membros únicos** e operações de conjuntos. Medido: com §tags:a = {x,y,z}§ e §tags:b = {y,z,w}§, §SINTER§ = **{y, z}** e §SUNION§ = **{w, x, y, z}**. Usos: **tags, seguidores, "quem já viu"**.

### Conjuntos ordenados (sorted sets)
§ZADD placar 120 ana 300 bia 210 caio 90 dani§; §ZREVRANGE placar 0 2 WITHSCORES§ (medido: **bia 300, caio 210, ana 120**); §ZREVRANK§ (a Ana está na posição **2**, a contar de zero). Cada membro tem uma **pontuação**; as operações de **posição e faixa** são **logarítmicas**. Usos: **placares, ranking, filas com prioridade, janelas de tempo** (pontuação = carimbo de tempo).

### HyperLogLog: contar distintos com pouca memória
§PFADD visitas u1 u2 ...§ e §PFCOUNT visitas§ estimam a **cardinalidade** com erro pequeno (≈ 0,81%). Medido: **10.000** elementos distintos → estimativa **9.977** (erro de **0,23%**), em **14.362 bytes** de memória: um conjunto exato com 10.000 membros ocuparia **muito mais**. Ideal para **visitantes únicos**, quando a **estimativa** basta.

### Pipelines
Cada comando enviado e aguardado custa **uma ida e volta** de rede. Medido (10.000 §SET§, **mediana**): **sequencial** (§await§ em cada) **~5.601 ms**; em **pipeline** (envia todos e lê as respostas juntas): **~165 ms**, cerca de **34 vezes** mais rápido. Como no ORM (aula orm-05), **agrupar** muda tudo. §pipeline§ **não é atômico** (para atomicidade, §MULTI§).

### KEYS x SCAN
§KEYS chave:99*§ percorre **todo o espaço de chaves em um comando**: **bloqueia o servidor** durante a execução. Medido (110.011 chaves): §KEYS§ levou **~42,5 ms** (bloqueando); o §SCAN§ iterativo com §MATCH§ e §COUNT 1000§ levou **~193,7 ms** no total, porém **em pequenas etapas**, **sem travar** o servidor entre elas. Em **produção**, **nunca use §KEYS§**; use §SCAN§ (que pode devolver **duplicatas** e **não garante** consistência com chaves alteradas durante a varredura) e **organize as chaves** para não precisar varrer (conjuntos com os ids, por exemplo).

### Desenho de chaves
- Prefixo por tipo e id: §cliente:1§, §sessao:abc§, §rank:semanal:2026-47§.
- **Chaves curtas** economizam memória (com milhões de chaves, cada byte conta).
- **Índices manuais**: um conjunto §clientes:cidade:POA§ com os ids.
- **TTL** em tudo que for temporário.
- Memória: uma string de **100 bytes** ocupou **135 bytes** medidos (§MEMORY USAGE§): há **sobrecarga** por chave.

### Quando usar o Redis
**Cache**, **sessões**, **contadores e limites de taxa**, **placares**, **filas leves**, **trava simples**, **deduplicação**, **dados quentes** de leitura. **Não** o use como **banco principal** de dados críticos sem entender a **persistência** e a **replicação** (aula nsq-07), nem para **consultas complexas** (ele não tem consulta por campo geral).`,
  concepts: [
    { term: 'Redis', def: 'Servidor de estruturas de dados em memória, com comandos atômicos e latência muito baixa.' },
    { term: 'Comando atômico', def: 'Comando executado por inteiro sem interferência de outros, como INCR.' },
    { term: 'TTL', def: 'Tempo de vida de uma chave; ao expirar, ela é removida.' },
    { term: 'SET NX EX', def: 'Grava uma chave só se não existir e já define a expiração, atomicamente.' },
    { term: 'Hash (Redis)', def: 'Estrutura de campos e valores sob uma chave, adequada a objetos pequenos.' },
    { term: 'Sorted set', def: 'Conjunto de membros únicos ordenados por uma pontuação.' },
    { term: 'HyperLogLog', def: 'Estrutura probabilística que estima a quantidade de elementos distintos com memória fixa.' },
    { term: 'Pipeline', def: 'Envio de vários comandos sem esperar cada resposta, reduzindo as idas e voltas.' },
    { term: 'SCAN', def: 'Comando que percorre o espaço de chaves de forma incremental, sem bloquear o servidor.' },
    { term: 'Prefixo de chave', def: 'Convenção de nomes (tipo:id) que organiza o espaço de chaves.' }
  ],
  examples: R`**Analogia:** o Redis é um **quadro branco gigante na parede do escritório**: tudo fica à vista (memória), qualquer pessoa **escreve ou lê em um segundo**, e cada ação no quadro acontece **uma de cada vez** (atomicidade). O **TTL** é **tinta que some sozinha**. O **pipeline** é **entregar uma lista de tarefas inteira ao contínuo** em vez de pedir uma por vez e esperar. O **KEYS** é **mandar o contínuo ler todas as anotações do quadro** parando o escritório; o **SCAN** é ler **um pedaço por vez**, deixando o escritório funcionar.

**Exemplo 1: concorrência.** 1.000 INCR atômicos somaram 1.000; 1.000 GET+SET somaram 1.

**Exemplo 2: placar.** ZADD com quatro jogadores; ZREVRANGE devolveu bia 300, caio 210 e ana 120.

**Exemplo 3: pipeline.** 10.000 SET: ~5,6 s sequenciais e ~165 ms em pipeline.`,
  code: [
    { title: 'Estruturas e atomicidade (JavaScript com ioredis, saída medida no Redis 8.12)', lang: 'js', code: R`import Redis from 'ioredis';
const r = new Redis({ host: '127.0.0.1', port: 56379 });

// atômico x ler-gravar com 1.000 operações simultâneas
await Promise.all(Array.from({ length: 1000 }, () => r.incr('a')));                                   // a = 1000
await Promise.all(Array.from({ length: 1000 }, async () => { await r.set('b', Number(await r.get('b')) + 1); }));   // b = 1

// TTL e trava
await r.set('sessao:1', 'ana', 'EX', 100);                                  // ttl 100
await r.set('trava:job', 'w1', 'EX', 30, 'NX');                             // 'OK'
await r.set('trava:job', 'w2', 'EX', 30, 'NX');                             // null (já existe)

// hash, conjunto ordenado e HyperLogLog
await r.hset('cliente:1', { nome: 'Ana', pontos: 10 }); await r.hincrby('cliente:1', 'pontos', 5);   // 15
await r.zadd('placar', 120, 'ana', 300, 'bia', 210, 'caio', 90, 'dani');
await r.zrevrange('placar', 0, 2, 'WITHSCORES');                            // bia 300, caio 210, ana 120
await r.pfadd('visitas', ...Array.from({ length: 10000 }, (_, i) => 'u' + i)); await r.pfcount('visitas');   // 9977`, notes: [{ l: '5', t: 'INCR é um comando só: o servidor serializa.' }, { l: '6', t: 'Ler e gravar na aplicação perde atualizações.' }, { l: '11', t: 'NX garante um único dono da trava.' }, { l: '17', t: 'O HyperLogLog estima distintos com ~14 KB.' }] },
    { title: 'Pipeline e SCAN (JavaScript, mediana medida)', lang: 'js', code: R`// 10.000 comandos
for (let i = 0; i < 10000; i++) await r.set('k' + i, i);                    // ~5.601 ms (uma ida e volta por comando)

const p = r.pipeline();
for (let i = 0; i < 10000; i++) p.set('k' + i, i);
await p.exec();                                                              // ~165 ms

// varredura de chaves sem bloquear o servidor
let cursor = '0'; const achadas = [];
do {
  const [prox, chaves] = await r.scan(cursor, 'MATCH', 'chave:99*', 'COUNT', 1000);
  cursor = prox; achadas.push(...chaves);
} while (cursor !== '0');                                                    // ~194 ms no total, em pedaços
// r.keys('chave:99*') levou ~42,5 ms, mas BLOQUEIA o servidor (não use em produção)`, notes: [{ l: '2', t: 'Cada await espera a rede.' }, { l: '6', t: 'O pipeline envia tudo e lê as respostas juntas.' }, { l: '10', t: 'SCAN devolve um cursor e um pedaço das chaves.' }, { l: '15', t: 'KEYS é rápido aqui, mas trava o servidor durante a execução.' }] }
  ],
  bestPractices: ['Use comandos atômicos (INCR, HINCRBY, ZADD) em vez de ler e gravar.', 'Defina TTL em tudo que for temporário.', 'Use SET NX EX para travas simples e libere só se for o dono.', 'Use pipelines para muitos comandos e SCAN em vez de KEYS.', 'Desenhe prefixos de chave claros e curtos.', 'Escolha a estrutura certa (sorted set para ranking, HyperLogLog para distintos aproximados).'],
  mistakes: ['Ler, somar e gravar um contador.', 'Usar KEYS em produção.', 'Esquecer TTL e deixar o cache crescer sem limite.', 'Tratar o Redis como banco principal sem avaliar a persistência.', 'Enviar milhares de comandos sem pipeline.', 'Usar uma trava sem expiração e travar o sistema se o dono cair.'],
  market: R`O Redis aparece em quase toda arquitetura de backend (cache, sessões, filas, limites de taxa). Dominar as estruturas e a atomicidade, e evitar erros como o KEYS em produção, são habilidades de entrevistas e de plantões.`,
  summary: R`O Redis 8.12 mantém dados em memória e executa comandos atômicos. Medido: 1.000 §INCR§ simultâneos somaram 1.000, enquanto 1.000 §GET§+§SET§ somaram 1. TTL: 100, -1 e -2; §SET NX EX§ deu OK e depois null. Estruturas: hash (§HINCRBY§ 10→15), lista, conjuntos (§SINTER§ {y,z}), sorted set (bia 300, caio 210, ana 120) e HyperLogLog (9.977 para 10.000, 14.362 bytes). Pipeline: ~165 ms contra ~5.601 ms para 10.000 comandos. §KEYS§ (~42,5 ms) bloqueia; §SCAN§ (~194 ms) não.`,
  refs: [REF2.redisTypes, REF2.redisCommands, REF2.redisExpire, REF2.redisPipelining, REF2.redisScan, REF2.redisHll, REF2.redisKeys],
  cards: [
    { q: 'Por que INCR é melhor que GET e SET?', a: 'É atômico no servidor; GET + SET perde atualizações concorrentes (medido: 1.000 contra 1).' },
    { q: 'O que faz SET chave valor NX EX 30?', a: 'Grava só se a chave não existir e define expiração de 30 segundos, atomicamente (base de travas simples).' },
    { q: 'Quando usar um sorted set?', a: 'Para rankings, placares e filas com prioridade, com operações por posição e faixa.' },
    { q: 'Por que evitar KEYS em produção?', a: 'Percorre todo o espaço de chaves em um comando e bloqueia o servidor; use SCAN.' },
    { q: 'Qual o ganho do pipeline?', a: 'Reduz as idas e voltas de rede: medido ~165 ms contra ~5.601 ms para 10.000 comandos.' }
  ]
}
];
