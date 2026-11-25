// C3.7 — NoSQL: MongoDB e Redis. Aulas 1 a 3 (tipos de NoSQL; MongoDB: documentos, CRUD e validação; índices e explain).
const R = String.raw;

export const REF = {
  nosqlWiki: { title: 'Wikipedia — NoSQL', url: 'https://en.wikipedia.org/wiki/NoSQL', kind: 'doc' },
  mongoIntro: { title: 'MongoDB — Introduction', url: 'https://www.mongodb.com/docs/manual/introduction/', kind: 'doc' },
  mongoCrud: { title: 'MongoDB — CRUD Operations', url: 'https://www.mongodb.com/docs/manual/crud/', kind: 'doc' },
  mongoBson: { title: 'MongoDB — BSON Types', url: 'https://www.mongodb.com/docs/manual/reference/bson-types/', kind: 'doc' },
  mongoValidation: { title: 'MongoDB — Schema Validation', url: 'https://www.mongodb.com/docs/manual/core/schema-validation/', kind: 'doc' },
  mongoAtomicity: { title: 'MongoDB — Atomicity and Transactions', url: 'https://www.mongodb.com/docs/manual/core/write-operations-atomicity/', kind: 'doc' },
  mongoIndexes: { title: 'MongoDB — Indexes', url: 'https://www.mongodb.com/docs/manual/indexes/', kind: 'doc' },
  mongoExplain: { title: 'MongoDB — Explain Results', url: 'https://www.mongodb.com/docs/manual/reference/explain-results/', kind: 'doc' },
  mongoTtl: { title: 'MongoDB — TTL Indexes', url: 'https://www.mongodb.com/docs/manual/core/index-ttl/', kind: 'doc' },
  mongoLimits: { title: 'MongoDB — Limits and Thresholds', url: 'https://www.mongodb.com/docs/manual/reference/limits/', kind: 'doc' },
  mongoDocker: { title: 'Docker Hub — imagem oficial mongo', url: 'https://hub.docker.com/_/mongo', kind: 'doc' },
  redisDocker: { title: 'Docker Hub — imagem oficial redis', url: 'https://hub.docker.com/_/redis', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'nsq-01', moduleId: 'm1', order: 1, minutes: 65, tags: ['NoSQL', 'documentos', 'chave-valor', 'colunar', 'grafo', 'persistência poliglota'],
  title: 'Tipos de bancos NoSQL: o que são, por que existem e como escolher',
  objectives: ['Explicar o que significa "NoSQL" e por que surgiram os bancos não relacionais', 'Distinguir os principais modelos (chave-valor, documentos, colunar amplo, grafo, séries temporais, busca)', 'Relacionar cada modelo ao padrão de acesso que ele atende bem', 'Comparar o modelo relacional com o de documentos e o de chave-valor em termos de consultas, esquema, consistência e escala', 'Aplicar a ideia de persistência poliglota com critério'],
  intro: R`**NoSQL** não é "contra o SQL": é uma família de bancos que **abre mão de partes do modelo relacional** (esquema rígido, junções, às vezes transações amplas) para ganhar **flexibilidade de modelo**, **latência muito baixa**, **escala horizontal** ou **modelos de dados especializados**. Esta aula faz o mapa: os **tipos**, os **motivos de escolha** e os **trade-offs**, antes de entrarmos em dois bancos reais, **MongoDB** (documentos) e **Redis** (estruturas em memória), ambos executados neste curso.`,
  theory: R`### De onde vem o NoSQL
O modelo relacional resolve muito bem **dados estruturados com relações e transações**. Mas algumas cargas pediam outra coisa:
- **volume e vazão** que um único servidor não aguenta (escalar **horizontalmente**);
- **latência de microssegundos** para cache, sessões e filas;
- **dados com forma variável** (catálogos, eventos, perfis), difíceis de encaixar em colunas fixas;
- **relações complexas** (redes sociais, recomendação) ou **séries de tempo** enormes.
O nome "NoSQL" (2009) virou guarda-chuva para **bancos que não são relacionais**; hoje se lê como **"Not only SQL"**: muitos oferecem linguagens de consulta (SQL-like) e **alguns têm transações**. **Nenhum modelo é melhor em tudo**: cada um otimiza **certos padrões de acesso**.

### Os principais modelos
1. **Chave-valor** (Redis, Valkey, DynamoDB em um de seus modos): mapa de **chave → valor**; **acesso por chave** extremamente rápido; consultas por outros campos são limitadas. Usos: **cache, sessões, contadores, filas, limites de taxa, placares**.
2. **Documentos** (MongoDB, CouchDB, Firestore): guarda **documentos JSON/BSON** com estrutura **aninhada** e variável; consulta por **campos do documento**, com índices e agregações. Usos: **catálogos, perfis, conteúdo, eventos**, quando o dado é lido **como um todo** (o documento é a unidade).
3. **Colunar amplo / família de colunas** (Cassandra, HBase, ScyllaDB, Bigtable): tabelas **particionadas por chave** com **escrita muito rápida** e escala massiva; **consultas pré-planejadas** pelo modelo; poucas junções. Usos: **telemetria, mensagens, históricos** em larga escala.
4. **Grafo** (Neo4j, Amazon Neptune): **nós e arestas** como cidadãos de primeira classe; consultas de **vizinhança e caminhos**. Usos: **redes sociais, fraude, recomendação, conhecimento**.
5. **Séries temporais** (InfluxDB, TimescaleDB, Prometheus): **dados com carimbo de tempo**, compressão, janelas e retenção. Usos: **métricas, sensores, finanças**.
6. **Busca** (Elasticsearch, OpenSearch): **índice invertido** para **texto**, relevância e agregações. Usos: **busca em produtos e logs**.
7. **Colunar analítico** (ClickHouse, BigQuery): armazenamento por colunas para **análise** em grandes volumes (não é o mesmo que "colunar amplo").
Neste curso, executamos **documentos (MongoDB 8.3.17)** e **chave-valor com estruturas (Redis 8.12.0)**; os demais são **apresentados conceitualmente** (não executados).

### Relacional x documentos x chave-valor
| Aspecto | Relacional (PostgreSQL) | Documentos (MongoDB) | Chave-valor/estruturas (Redis) |
|---|---|---|---|
| Unidade | linha | documento aninhado | chave → valor/estrutura |
| Esquema | rígido, declarado | flexível (com validação opcional) | nenhum (valor opaco ou estrutura) |
| Relações | JOIN, chaves estrangeiras | embutir ou referenciar | convenções de chave |
| Consulta | SQL geral | consulta por campos, agregação | por chave e estruturas |
| Transações | completas (ACID) | atômicas por documento; multidocumento em replica set | MULTI/EXEC e Lua |
| Escala | vertical, réplicas, particionamento | replica sets e sharding | memória, réplicas, cluster |
| Pontos fortes | integridade, consultas ad hoc | flexibilidade, leitura por documento | velocidade, estruturas |

### Esquema flexível não é "sem esquema"
Em bancos de documentos, o **esquema existe**: está **no código** da aplicação. A flexibilidade é útil para **evoluir** e para dados heterogêneos, mas **sem disciplina** vira bagunça (campos com nomes e tipos diferentes). Medido no MongoDB: uma **coleção sem validação aceitou três documentos com formas totalmente diferentes** (aula nsq-02); com **validação** declarada, um documento inválido foi recusado (erro **121**).

### Padrões de acesso decidem
Escolher NoSQL **sem conhecer o padrão de acesso** é o erro mais comum. Pergunte: **como os dados serão lidos?** (por chave? por vários campos? agregações? relações profundas?), **quanto?** (consultas por segundo, volume), **com qual consistência?** (pode ser ligeiramente desatualizado?), **com quais transações?** (várias entidades de uma vez?). Em geral:
- leitura por **chave** e latência mínima → **chave-valor**;
- documento lido e gravado **inteiro**, com formas variáveis → **documentos**;
- **escrita massiva** com consultas previsíveis → **colunar amplo**;
- **relacionamentos** como núcleo da consulta → **grafo**;
- **tempo** como eixo → **séries temporais**.
Se o que você precisa é **integridade relacional**, **consultas ad hoc** e **transações entre muitas tabelas**, o banco **relacional** continua a melhor escolha, e o PostgreSQL com **JSONB** cobre muita flexibilidade (aula sqa-06).

### Persistência poliglota
Sistemas reais **combinam** bancos: relacional para o **núcleo transacional**, Redis para **cache e sessões**, busca para **pesquisa**, documentos para **catálogo ou conteúdo**, séries temporais para **métricas**. O custo é **operacional** (mais sistemas para operar, monitorar, proteger e manter **consistentes entre si**). Regra: **adicione um banco só quando o ganho justificar o custo**; comece pelo **mais simples** (muitas vezes, o PostgreSQL basta) e mantenha **uma fonte da verdade** por dado.

### Mitos
- "NoSQL escala, SQL não escala": o PostgreSQL escala muito com réplicas, particionamento e índices; o NoSQL **escala de outro jeito** e cobra em consistência e consulta.
- "NoSQL não tem esquema": o esquema só mudou de lugar.
- "NoSQL não tem transações": o MongoDB tem transações multidocumento em replica sets (medido na aula nsq-08); o Redis tem MULTI/EXEC.
- "NoSQL é mais rápido": depende do padrão de acesso; o Redis é, de fato, mais rápido que um banco em disco para chaves em memória, mas **não** substitui um banco durável para dados críticos sem cuidados.
- "Dá para trocar de relacional para NoSQL sem mudar nada": **o modelo muda** (embutir x normalizar, sem junções).`,
  concepts: [
    { term: 'NoSQL', def: 'Família de bancos não relacionais, que trocam parte do modelo relacional por flexibilidade, latência ou escala.' },
    { term: 'Banco de documentos', def: 'Banco que guarda documentos JSON ou BSON aninhados e os consulta por seus campos.' },
    { term: 'Chave-valor', def: 'Modelo em que cada valor é acessado por uma chave única.' },
    { term: 'Colunar amplo', def: 'Modelo de tabelas particionadas por chave com escrita rápida e consultas pré-planejadas (Cassandra).' },
    { term: 'Banco de grafos', def: 'Banco que guarda nós e arestas e consulta caminhos e vizinhanças.' },
    { term: 'Séries temporais', def: 'Dados indexados pelo tempo, otimizados para janelas, compressão e retenção.' },
    { term: 'Persistência poliglota', def: 'Uso de vários tipos de bancos em um sistema, cada um para o que faz melhor.' },
    { term: 'Escala horizontal', def: 'Aumentar a capacidade acrescentando servidores, em vez de aumentar um servidor.' },
    { term: 'Esquema flexível', def: 'Modelo em que documentos de uma coleção podem ter formas diferentes, com validação opcional.' },
    { term: 'Padrão de acesso', def: 'Forma como os dados serão lidos e gravados, que guia a escolha e a modelagem.' }
  ],
  examples: R`**Analogia:** os bancos são **ferramentas de uma oficina**: o relacional é a **bancada completa** (serve para quase tudo, com precisão); o chave-valor é um **gancho na parede** (pegar e guardar algo pelo nome, instantaneamente); o de documentos é uma **pasta com tudo de um cliente** (você tira a pasta inteira); o de grafos é um **mural de barbante** ligando fotos; o de séries temporais é um **registro de ponto**. Comprar um novo equipamento sem saber o trabalho que precisa fazer é o erro; ter **muitas ferramentas** sem necessidade complica a oficina.

**Exemplo 1: o mesmo dado em três modelos.** Um cliente com pedidos: duas tabelas no relacional; um documento com pedidos embutidos no MongoDB; uma chave §cliente:1§ com hash e uma lista no Redis.

**Exemplo 2: flexibilidade medida.** Uma coleção sem validação aceitou três formas diferentes; com validação, o documento sem e-mail foi recusado (121).

**Exemplo 3: poliglota.** Pedidos no PostgreSQL, sessões e placar no Redis, catálogo no MongoDB.`,
  code: [
    { title: 'O mesmo cliente em três modelos (texto)', lang: 'text', code: R`-- Relacional (PostgreSQL): duas tabelas ligadas por chave estrangeira
clientes(id=1, nome='Ana')
pedidos(id=10, cliente_id=1, valor=50) ; pedidos(id=11, cliente_id=1, valor=70)

// Documentos (MongoDB): um documento com pedidos embutidos
{ _id: 1, nome: "Ana", pedidos: [ { id: 10, valor: 50 }, { id: 11, valor: 70 } ] }

// Chave-valor com estruturas (Redis)
HSET cliente:1 nome Ana
RPUSH cliente:1:pedidos 10 11
SET pedido:10:valor 50`, notes: [{ l: '2', t: 'O relacional separa as entidades e junta por consulta.' }, { l: '6', t: 'O documento guarda o que é lido junto no mesmo lugar.' }, { l: '9', t: 'No Redis, o desenho de chaves é parte do modelo.' }] },
    { title: 'Perguntas para escolher o modelo (texto)', lang: 'text', code: R`1. Como os dados serão lidos? por chave | por vários campos | agregações | relações profundas | texto | tempo
2. Qual o volume e a taxa (leituras e escritas por segundo)? cabe em um servidor com réplicas?
3. Qual a consistência necessária? sempre atual | pode atrasar | transações entre entidades
4. O esquema muda com frequência? há formas heterogêneas?
5. Quanto custa operar mais um sistema? equipe, backup, segurança, monitoramento
=> Se nenhuma resposta aponta claramente para um modelo especializado, comece com o relacional (PostgreSQL, com JSONB se precisar).`, notes: [{ l: '1', t: 'O padrão de acesso é a primeira pergunta.' }, { l: '5', t: 'O custo operacional faz parte da decisão.' }, { l: '6', t: 'O padrão seguro: o relacional resolve a maioria dos casos.' }] }
  ],
  bestPractices: ['Decida pelo padrão de acesso, pela consistência e pelo volume, não pela moda.', 'Comece pelo banco mais simples que atende e adicione outros só com justificativa.', 'Mantenha uma fonte da verdade por dado quando usar vários bancos.', 'Declare validação de esquema onde a consistência importa.', 'Considere o custo operacional (backup, segurança, monitoramento) de cada banco.', 'Lembre que migrar de modelo exige redesenhar, não só trocar o driver.'],
  mistakes: ['Escolher NoSQL por "escala" sem ter o problema de escala.', 'Achar que "sem esquema" dispensa modelagem.', 'Usar documentos para dados altamente relacionais e fazer junções na aplicação.', 'Tratar o Redis como banco principal sem avaliar persistência.', 'Duplicar dados em vários bancos sem plano de consistência.', 'Ignorar a segurança de bancos NoSQL com configuração padrão aberta.'],
  market: R`MongoDB e Redis aparecem em grande parte das vagas de backend, e a pergunta "SQL ou NoSQL?" é clássica em entrevistas e decisões de arquitetura. A boa resposta cita padrão de acesso, consistência, volume e custo operacional, e reconhece que o PostgreSQL cobre muitos casos.`,
  summary: R`NoSQL é uma família de bancos não relacionais: chave-valor, documentos, colunar amplo, grafo, séries temporais e busca, cada um otimizado para certos padrões de acesso. Esquema flexível não é ausência de esquema (uma coleção sem validação aceitou três formas diferentes; com validação, o inválido foi recusado). A decisão depende do padrão de acesso, da consistência, do volume e do custo operacional; a persistência poliglota combina bancos com uma fonte da verdade por dado. Neste curso: MongoDB 8.3.17 e Redis 8.12.0, executados.`,
  refs: [REF.nosqlWiki, REF.mongoIntro, REF.mongoDocker, REF.redisDocker],
  cards: [
    { q: 'O que significa NoSQL hoje?', a: 'Not only SQL: bancos não relacionais que trocam parte do modelo relacional por flexibilidade, latência ou escala.' },
    { q: 'Quando um banco chave-valor é apropriado?', a: 'Quando o acesso é por chave com latência mínima: cache, sessões, contadores, filas e placares.' },
    { q: 'O esquema deixa de existir em bancos de documentos?', a: 'Não: ele passa a viver no código (ou em regras de validação do banco).' },
    { q: 'O que é persistência poliglota?', a: 'Usar vários tipos de bancos em um sistema, cada um para o padrão de acesso que atende melhor.' },
    { q: 'Qual a primeira pergunta para escolher um banco?', a: 'Qual o padrão de acesso: como os dados serão lidos e gravados.' }
  ]
},
{
  id: 'nsq-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['MongoDB', 'documentos', 'BSON', 'CRUD', 'operadores', 'validação', 'atomicidade'],
  title: 'MongoDB I: documentos, coleções, CRUD, validação de esquema e atomicidade',
  objectives: ['Explicar o modelo de documentos (BSON, coleções, §_id§) e instalar o MongoDB em contêiner', 'Executar CRUD com os operadores de consulta e atualização (§$gt§, §$in§, §$set§, §$inc§, §$push§)', 'Usar projeção, ordenação e paginação', 'Declarar validação com §$jsonSchema§ e índices únicos e interpretar os erros 121 e 11000', 'Distinguir atualizações atômicas de operações de ler, modificar e gravar'],
  intro: R`O **MongoDB** guarda **documentos** (objetos parecidos com JSON) em **coleções**, sem esquema obrigatório, com **consultas por campos**, **índices** e **agregações**. Esta aula usa o **MongoDB 8.3.17** (imagem oficial em contêiner, **100.000 documentos de pedidos**) para mostrar o CRUD, a validação e uma lição de concorrência: **atualizações atômicas** contra **ler-modificar-gravar**.`,
  theory: R`### O modelo de documentos
- **Documento**: um objeto de **pares campo-valor**, em **BSON** (JSON binário, com mais tipos: §ObjectId§, §Date§, §Decimal128§, inteiros de 32/64 bits, binários). Pode ter **objetos e arrays aninhados**.
- **Coleção**: um grupo de documentos (≈ tabela, sem esquema fixo).
- **Banco**: um conjunto de coleções.
- **§_id§**: toda coleção exige uma chave primária única; se você não informar, o MongoDB gera um **§ObjectId§** (12 bytes: tempo, valor aleatório e contador). Medido: §_id§ do tipo §ObjectId§ gerado automaticamente.
Documento medido (um pedido do laboratório): §{ numero: 7, clienteId: 7, status: "cancelado", valor: 6.5, itens: [{ sku: "A6", qtd: 1 }, { sku: "B6", qtd: 1 }], criado: ISODate("2026-01-07") }§. **100.000** documentos, **~170 bytes** em média (§collStats.avgObjSize§).

### Subindo o MongoDB
§docker run -d --name c3-mongo -p 127.0.0.1:57017:27017 mongo:8§ e o shell §mongosh§ (§docker exec c3-mongo mongosh§). A imagem oficial **não ativa autenticação** por padrão: qualquer cliente que alcance a porta **tem acesso total** (medido: listamos os bancos sem credenciais). Mantenha a porta em §127.0.0.1§ e **ative a autenticação** fora do laboratório (aula nsq-09).

### CRUD
- **Criar**: §insertOne§, §insertMany§ (medido: 100.000 documentos inseridos em lotes de 10.000).
- **Ler**: §find(filtro, projeção)§, §findOne§, com §.sort()§, §.limit()§, §.skip()§. Filtros: igualdade (§{ status: "pago" }§), comparação (§$gt§, §$gte§, §$lt§, §$lte§, §$ne§), conjuntos (§$in§, §$nin§), lógicos (§$and§, §$or§, §$not§), existência (§$exists§), **aninhados** (§{ "itens.sku": "A6" }§) e de array (§$elemMatch§, §$size§, §$all§). Projeção: §{ numero: 1, valor: 1, _id: 0 }§.
- **Atualizar**: §updateOne§, §updateMany§, §replaceOne§, §findOneAndUpdate§, com **operadores**: §$set§, §$unset§, §$inc§, §$mul§, §$min§/§$max§, §$push§, §$addToSet§, §$pull§, §$rename§. Opção §upsert: true§ (inserir se não existir).
- **Apagar**: §deleteOne§, §deleteMany§.
Parâmetros comuns: §ordered§ em §insertMany§; §writeConcern§ (aula nsq-08).
No MongoDB, os **operadores são parte da consulta** (objetos): evite montar filtros com **entrada do usuário sem validar**: um objeto como §{ "$ne": null }§ vindo de JSON pode **mudar o significado** do filtro (**injeção de operadores**, o "NoSQL injection"): **valide tipos** (por exemplo, exija que o campo seja texto) e use bibliotecas de validação.

### Validação de esquema
Um banco de documentos aceita qualquer forma, **a menos que você valide**: §db.createCollection("clientes", { validator: { $jsonSchema: { bsonType: "object", required: ["nome", "email"], properties: { nome: { bsonType: "string" }, email: { bsonType: "string", pattern: "^.+@.+$" }, idade: { bsonType: "int", minimum: 0 } } } } })§. Medido:
- inserir um cliente **sem e-mail** falhou com o código **121** (§DocumentValidationFailed§);
- uma **coleção sem validador** (§livre§) aceitou **três documentos de formas diferentes** (§{ a: 1 }§, §{ a: "texto", b: [1, 2] }§, §{ c: { d: true } }§).
Opções: §validationLevel§ (§strict§ ou §moderate§) e §validationAction§ (§error§ ou §warn§), úteis para **introduzir validação em coleções existentes**.
**Índices únicos**: §createIndex({ email: 1 }, { unique: true })§. Medido: o segundo cliente com o mesmo e-mail falhou com o código **11000** (chave duplicada).

### Atomicidade: um documento é a unidade
**Toda operação em um único documento é atômica**, mesmo que atualize vários campos e arrays aninhados: §updateOne({ _id: "ana" }, { $inc: { saldo: -10 }, $set: { atualizado: true } })§ acontece **por inteiro ou nada**. Medido: o saldo foi de 100 para 90 e o campo §atualizado§ apareceu no mesmo passo.
**Ler, modificar e gravar** na aplicação **não é atômico**. Medido com **100 operações concorrentes**: §$inc: { n: 1 }§ resultou em **100**; o padrão **§findOne§ + §updateOne($set: { n: n + 1 })§** resultou em **1** (**99 atualizações perdidas**, a mesma atualização perdida da aula trx-03). Regra: **use operadores de atualização** (§$inc§, §$push§, §$set§ com filtro) e **filtros condicionais** (§updateOne({ _id, saldo: { $gte: 10 } }, { $inc: { saldo: -10 } })§, que só atualiza se a condição ainda for verdadeira) em vez de ler e regravar.

### Paginação
§find().sort({ _id: 1 }).limit(20)§ com §skip§ tem o **mesmo problema** do OFFSET (lê e descarta); prefira **paginação por chave**: §find({ _id: { $gt: ultimo } }).sort({ _id: 1 }).limit(20)§ (com índice em §_id§, sempre existente).

### Tipos e armadilhas
- **Números**: o shell e alguns drivers tratam números como **ponto flutuante** por padrão; para **dinheiro** use **§Decimal128§** ou inteiros em centavos (como no relacional, aula pgm-02). A validação §bsonType: "int"§ **recusa** um número do JavaScript tratado como double: use §NumberInt§ ou o tipo certo do driver.
- **Datas**: §Date§ em UTC; mantenha a convenção de fuso na apresentação.
- **Comparação de tipos**: o MongoDB compara **valores de tipos diferentes** por uma ordem de tipos (campo "idade" como texto e como número em documentos diferentes quebra consultas e índices).
- **Nomes**: campos com §$§ ou §.§ têm restrições.

### Quando o MongoDB faz sentido
**Documentos lidos e gravados inteiros**, formas variáveis, iteração rápida do esquema, dados aninhados (catálogos, perfis, conteúdo, eventos), e necessidade de **escala horizontal** (sharding). **Não** é a melhor escolha para dados **muito relacionais** com consultas **ad hoc** por muitas combinações e **transações entre muitas entidades** (o relacional é melhor).`,
  concepts: [
    { term: 'Documento', def: 'Objeto de pares campo-valor, em BSON, com valores aninhados e arrays, unidade de armazenamento do MongoDB.' },
    { term: 'Coleção', def: 'Grupo de documentos, análogo a uma tabela, sem esquema fixo.' },
    { term: 'BSON', def: 'Formato binário do MongoDB, semelhante ao JSON, com tipos adicionais.' },
    { term: 'ObjectId', def: 'Identificador de 12 bytes gerado automaticamente como _id.' },
    { term: 'Operador de atualização', def: 'Construção como $set, $inc ou $push que modifica campos atomicamente no servidor.' },
    { term: '$jsonSchema', def: 'Operador de validação que descreve a estrutura esperada dos documentos de uma coleção.' },
    { term: 'Índice único', def: 'Índice que impede dois documentos com o mesmo valor no campo (erro 11000).' },
    { term: 'Atomicidade de documento', def: 'Garantia de que uma operação em um único documento é aplicada por inteiro ou nada.' },
    { term: 'Injeção de operadores', def: 'Ataque em que a entrada do usuário inclui operadores ($ne, $gt) que alteram o sentido do filtro.' },
    { term: 'Decimal128', def: 'Tipo BSON decimal exato, adequado para valores monetários.' }
  ],
  examples: R`**Analogia:** uma coleção é uma **gaveta de fichas** em que cada ficha pode ter campos diferentes; o **validador** é o **carimbo de conferência** que recusa fichas sem os campos obrigatórios. A **atualização atômica** é **trocar o conteúdo de uma ficha em um só gesto**; ler-modificar-gravar é **tirar a ficha, copiar para o papel, alterar e devolver**, o que dá errado se outra pessoa mexeu na ficha enquanto você escrevia.

**Exemplo 1: documentos.** 100.000 pedidos de ~170 bytes com itens aninhados.

**Exemplo 2: validação.** O cliente sem e-mail foi recusado (121) e o e-mail repetido também (11000).

**Exemplo 3: atomicidade.** 100 $inc somaram 100; 100 leituras e gravações concorrentes somaram 1.`,
  code: [
    { title: 'CRUD, validação e unicidade (JavaScript com o driver mongodb, saída medida)', lang: 'js', code: R`import { MongoClient } from 'mongodb';
const cli = new MongoClient('mongodb://127.0.0.1:57017', { directConnection: true });
await cli.connect();
const db = cli.db('lab');

const pedidos = db.collection('pedidos');
await pedidos.insertMany([{ numero: 1, status: 'pago', valor: 10.5, itens: [{ sku: 'A1', qtd: 2 }] }]);
const achados = await pedidos.find({ status: 'pago', 'itens.sku': 'A1' }, { projection: { numero: 1, valor: 1, _id: 0 } }).sort({ valor: -1 }).limit(10).toArray();
await pedidos.updateOne({ numero: 1 }, { $inc: { valor: 5 }, $push: { itens: { sku: 'B2', qtd: 1 } } });

await db.createCollection('clientes', { validator: { $jsonSchema: { bsonType: 'object', required: ['nome', 'email'], properties: { nome: { bsonType: 'string' }, email: { bsonType: 'string' } } } } });
await db.collection('clientes').createIndex({ email: 1 }, { unique: true });
try { await db.collection('clientes').insertOne({ nome: 'Sem email' }); } catch (e) { console.log(e.code); }   // 121: validação
await db.collection('clientes').insertOne({ nome: 'Ana', email: 'ana@ex.com' });
try { await db.collection('clientes').insertOne({ nome: 'Bia', email: 'ana@ex.com' }); } catch (e) { console.log(e.code); } // 11000: duplicidade`, notes: [{ l: '8', t: 'Filtro em campo aninhado de array, com projeção, ordenação e limite.' }, { l: '9', t: '$inc e $push em uma só operação atômica.' }, { l: '12', t: 'O validador exige campos e tipos.' }, { l: '14', t: 'O código 121 é DocumentValidationFailed.' }] },
    { title: 'Atômico x ler-modificar-gravar com 100 concorrentes (JavaScript, saída medida)', lang: 'js', code: R`await cont.insertOne({ _id: 'a', n: 0 });
await cont.insertOne({ _id: 'b', n: 0 });

// atômico: o servidor aplica cada $inc
await Promise.all(Array.from({ length: 100 }, () => cont.updateOne({ _id: 'a' }, { $inc: { n: 1 } })));

// ler, modificar, gravar: atualizações perdidas
await Promise.all(Array.from({ length: 100 }, async () => {
  const d = await cont.findOne({ _id: 'b' });
  await cont.updateOne({ _id: 'b' }, { $set: { n: d.n + 1 } });
}));

console.log((await cont.findOne({ _id: 'a' })).n, (await cont.findOne({ _id: 'b' })).n);   // 100 e 1

// condicional: só debita se houver saldo
await contas.updateOne({ _id: 'ana', saldo: { $gte: 10 } }, { $inc: { saldo: -10 } });`, notes: [{ l: '5', t: '100 incrementos atômicos somam 100.' }, { l: '8', t: 'O mesmo padrão ler e gravar perdeu 99 atualizações.' }, { l: '17', t: 'O filtro condicional torna a verificação e a escrita uma só operação.' }] }
  ],
  bestPractices: ['Use operadores de atualização ($inc, $set, $push) e filtros condicionais em vez de ler e regravar.', 'Declare validação ($jsonSchema) e índices únicos nas coleções importantes.', 'Valide os tipos da entrada para evitar injeção de operadores.', 'Use Decimal128 ou centavos inteiros para dinheiro.', 'Pagine por chave em listas grandes.', 'Mantenha o banco em rede restrita e ative a autenticação fora do laboratório.'],
  mistakes: ['Ler, modificar e gravar sem proteção em contadores e saldos.', 'Aceitar objetos JSON do usuário como filtros sem validar.', 'Deixar coleções sem nenhuma validação e com tipos misturados.', 'Usar double para dinheiro.', 'Confiar que o contêiner padrão tem autenticação.', 'Usar skip grande em coleções enormes.'],
  market: R`O MongoDB é um dos bancos mais usados em aplicações Node.js, e as perguntas sobre atomicidade por documento, validação de esquema e injeção de operadores aparecem em entrevistas e revisões de segurança.`,
  summary: R`O MongoDB guarda documentos BSON (100.000 pedidos de ~170 bytes, com itens aninhados e §_id§ do tipo ObjectId) em coleções. O CRUD usa operadores de consulta e de atualização. A validação §$jsonSchema§ recusou o cliente sem e-mail (121) e o índice único recusou o duplicado (11000); uma coleção sem validador aceitou três formas diferentes. Operações em um documento são atômicas: 100 §$inc§ concorrentes somaram 100, e 100 leituras e gravações somaram 1. Valide os tipos de entrada (injeção de operadores) e proteja o banco, que não tem autenticação por padrão.`,
  refs: [REF.mongoCrud, REF.mongoBson, REF.mongoValidation, REF.mongoAtomicity, REF.mongoLimits],
  cards: [
    { q: 'O que é o _id no MongoDB?', a: 'A chave primária única de cada documento; se omitida, é gerado um ObjectId.' },
    { q: 'Por que $inc é melhor que ler, somar e gravar?', a: 'Porque a atualização é atômica no servidor; o padrão ler e gravar perde atualizações concorrentes (medido: 100 contra 1).' },
    { q: 'O que significa o erro 121?', a: 'Falha de validação do documento contra o $jsonSchema da coleção.' },
    { q: 'O que significa o erro 11000?', a: 'Violação de índice único (chave duplicada).' },
    { q: 'O que é injeção de operadores?', a: 'Entrada que contém operadores (como $ne) e altera o sentido de um filtro; evite validando os tipos.' }
  ]
},
{
  id: 'nsq-03', moduleId: 'm1', order: 3, minutes: 75, tags: ['índices', 'explain', 'COLLSCAN', 'IXSCAN', 'índice composto', 'TTL', 'regra ESR'],
  title: 'MongoDB II: índices, explain, índices compostos e documentos que expiram (TTL)',
  objectives: ['Ler o resultado de §explain("executionStats")§ e distinguir COLLSCAN de IXSCAN', 'Criar índices simples, compostos, únicos e TTL e prever quando serão usados', 'Aplicar a regra de composição ESR (igualdade, ordenação, intervalo)', 'Medir o efeito de um índice e o custo de escrita', 'Reconhecer os limites de memória e de tamanho que afetam consultas e ordenações'],
  intro: R`Como em qualquer banco, **índices** são o que faz o MongoDB responder em milissegundos em vez de **varrer a coleção inteira**. Esta aula mede o efeito em **100.000 pedidos** (MongoDB 8.3.17), ensina a ler o **plano de execução** (§explain§), mostra **índices compostos** e **TTL** (documentos que expiram sozinhos, medido com **75 segundos** de espera) e dá as regras para escolher bem.`,
  theory: R`### Sem índice: COLLSCAN
Sem índice no campo filtrado, o MongoDB lê **todos os documentos**: o plano é **§COLLSCAN§**. Medido: §find({ clienteId: 123 })§ em 100.000 pedidos examinou **100.000** documentos para devolver **20** (mediana **~154 ms**).

### Com índice: IXSCAN
§createIndex({ clienteId: 1 })§ cria uma **árvore B** sobre o campo (1 = crescente). Medido: o plano passou a **§IXSCAN§**, examinando **20 chaves** e **20 documentos** para devolver os **20**, em **~3,9 ms** (cerca de **40 vezes** mais rápido, **mesma resposta**).

### Lendo o explain
§cursor.explain("executionStats")§ devolve o plano **vencedor** e as **estatísticas reais**:
- §queryPlanner.winningPlan§: os **estágios** (§COLLSCAN§, §IXSCAN§, §FETCH§, §SORT§, §PROJECTION_COVERED§...);
- §executionStats.nReturned§: documentos devolvidos;
- §totalKeysExamined§ e §totalDocsExamined§: **trabalho feito**; o ideal é **keys ≈ docs ≈ nReturned** (índice seletivo e sem desperdício);
- §executionTimeMillis§.
**Sinais de problema**: §totalDocsExamined§ muito maior que §nReturned§; §COLLSCAN§ em coleção grande; estágio **§SORT§** em memória (ordenação sem índice); §rejectedPlans§ numerosos.
Uma consulta é **coberta** (*covered*) quando o índice contém todos os campos pedidos (e a projeção os usa): nenhum documento é lido (§totalDocsExamined: 0§).

### Índices compostos
§createIndex({ status: 1, criado: -1 })§ ordena por §status§ e, **dentro de cada status**, por §criado§ decrescente. Serve a consultas por **prefixos** da lista (§status§; §status§ + §criado§). Medido: §find({ status: "pago" }).sort({ criado: -1 })§ usou **§IXSCAN§** (25.000 chaves e 25.000 documentos examinados, todos devolvidos: o plano foi **§FETCH > IXSCAN§**, sem etapa de ordenação, pois o índice já entrega a ordem). Para comparar: com a mesma filtragem por §status§ mas ordenando por §valor§ (campo sem índice para a ordem), o plano ganhou o estágio **§SORT§** (**§SORT > FETCH > IXSCAN§**, medido). Já o filtro **apenas por §criado§** (§$gte: 2026-06-01§, que seleciona **~50%** dos documentos) fez **§COLLSCAN§** (100.000 examinados para 49.617 devolvidos): sem o prefixo §status§ o índice composto **não** atende bem, e a seletividade era baixa de qualquer forma.
**Regra ESR** para ordenar as chaves de um índice composto: **E**quality (igualdades primeiro), **S**ort (depois a ordenação) e **R**ange (por último os intervalos). Assim o índice serve ao filtro, à ordenação e ao intervalo.

### Outros tipos de índice
- **Único** (§unique: true§): impede duplicatas (medido: 11000 na aula nsq-02).
- **Multikey**: índice sobre **campo array** (um item por elemento): §{ "itens.sku": 1 }§.
- **Parcial** (§partialFilterExpression§): indexa só os documentos que atendem a um filtro (menor e mais barato).
- **TTL**: remove documentos **expirados** (abaixo).
- **Texto** e **geoespacial** (§2dsphere§): busca textual básica e consultas por localização (documentação; **não executados** aqui).
- **Curinga** (§$**§): para campos de nomes variáveis (documentação).
- **Ocultos** e **de coleção temporal**: ferramentas de operação.
Listagem medida: §_id_§ (automático), §clienteId_1§ e §status_1_criado_-1§.

### Índices TTL: expiração automática
§createIndex({ expiraEm: 1 }, { expireAfterSeconds: 0 })§ remove, em segundo plano, os documentos **cujo campo de data passou** (mais os segundos indicados). Medido: inserimos dois eventos (um com §expiraEm§ no passado e outro daqui a uma hora): **imediatamente** havia **2** documentos; **depois de 75 segundos**, **1**. A remoção **não é instantânea**: o monitor de TTL roda **cerca de uma vez por minuto**. Usos: **sessões, tokens, caches, logs temporários, convites**. O campo precisa ser do tipo **§Date§** (ou array de datas).

### Custos dos índices
Como nos bancos relacionais (aula pgm-04): cada índice **ocupa memória e disco** e **torna as escritas mais lentas** (todo insert/update atualiza os índices). **Crie índices para as consultas reais**, remova os não usados (§$indexStats§ mostra o uso) e **mantenha o conjunto de trabalho** (índices usados) **na memória**. Criar um índice em coleção grande é uma operação cara: no MongoDB moderno ela **não bloqueia** tudo, mas consome recursos; **planeje**.

### Limites que importam
- Uma **ordenação em memória** sem índice tem **limite de 100 MB** por estágio (use índice ou §allowDiskUse§).
- **Documento** máximo: **16 MiB** (aula nsq-04).
- Um **índice composto** pode ter até **32 campos**; o valor indexado tem limites de tamanho.
Consulte a página de **Limits and Thresholds**.

### Roteiro de otimização
1. Veja as consultas mais lentas (**profiler**, **§currentOp§**, logs de consulta lenta).
2. Rode §explain("executionStats")§.
3. Crie o índice **composto** adequado (ESR).
4. Confirme **IXSCAN** e a relação **docs examinados ≈ docs devolvidos**.
5. Meça o **custo de escrita** e o tamanho do índice.
6. Remova índices redundantes (um índice em §{ a: 1, b: 1 }§ atende consultas só por §a§).`,
  concepts: [
    { term: 'COLLSCAN', def: 'Estágio do plano que varre a coleção inteira, sem usar índice.' },
    { term: 'IXSCAN', def: 'Estágio do plano que percorre um índice para localizar documentos.' },
    { term: 'explain', def: 'Comando que mostra o plano de execução e as estatísticas de uma consulta.' },
    { term: 'Consulta coberta', def: 'Consulta respondida só pelo índice, sem ler documentos.' },
    { term: 'Índice composto', def: 'Índice sobre vários campos, com ordem importante, que atende prefixos da lista.' },
    { term: 'Regra ESR', def: 'Orientação para ordenar chaves de índice composto: igualdade, ordenação e intervalo.' },
    { term: 'Índice multikey', def: 'Índice sobre um campo array, com uma entrada por elemento.' },
    { term: 'Índice parcial', def: 'Índice que cobre apenas os documentos que satisfazem um filtro.' },
    { term: 'Índice TTL', def: 'Índice que remove automaticamente documentos expirados com base em um campo de data.' },
    { term: 'Conjunto de trabalho', def: 'Dados e índices acessados com frequência, que idealmente cabem na memória.' }
  ],
  examples: R`**Analogia:** o COLLSCAN é **folhear o livro inteiro** atrás de um nome; o IXSCAN é **ir ao índice remissivo**. O índice composto é um **remissivo por sobrenome e, dentro de cada sobrenome, por data**: ótimo para "sobrenome Silva, mais recentes primeiro", inútil para "todos de junho" sem o sobrenome. O TTL é uma **etiqueta de validade** nos itens do mercado: o fiscal passa **uma vez por minuto** recolhendo os vencidos, então um item vencido pode ficar na prateleira por alguns instantes.

**Exemplo 1: antes e depois.** 100.000 documentos examinados e ~154 ms contra 20 e ~3,9 ms.

**Exemplo 2: composto.** O filtro por status com ordenação por data usou o índice sem etapa de ordenação; o filtro só por data fez COLLSCAN.

**Exemplo 3: TTL.** 2 documentos no início e 1 depois de 75 s.`,
  code: [
    { title: 'Medindo o efeito do índice com explain (JavaScript, saída medida no MongoDB 8.3.17)', lang: 'js', code: R`const explicar = async (filtro, ordem) => {
  const c = pedidos.find(filtro); if (ordem) c.sort(ordem);
  const e = await c.explain('executionStats');
  const plano = JSON.stringify(e.queryPlanner.winningPlan);
  return { estagio: /IXSCAN/.test(plano) ? 'IXSCAN' : 'COLLSCAN', examinados: e.executionStats.totalDocsExamined,
           chaves: e.executionStats.totalKeysExamined, retornados: e.executionStats.nReturned };
};

await explicar({ clienteId: 123 });
// { estagio: 'COLLSCAN', examinados: 100000, chaves: 0, retornados: 20 }   (~154 ms)

await pedidos.createIndex({ clienteId: 1 });
await explicar({ clienteId: 123 });
// { estagio: 'IXSCAN', examinados: 20, chaves: 20, retornados: 20 }        (~3,9 ms)

await pedidos.createIndex({ status: 1, criado: -1 });
await explicar({ status: 'pago' }, { criado: -1 });       // IXSCAN, sem etapa de ordenação`, notes: [{ l: '3', t: 'O plano vencedor mostra se o índice foi usado.' }, { l: '10', t: 'Examinar só o que se devolve é o objetivo.' }, { l: '17', t: 'O índice composto entrega os documentos já ordenados.' }] },
    { title: 'Índice TTL (JavaScript, saída medida)', lang: 'js', code: R`const ev = db.collection('eventos');
await ev.createIndex({ expiraEm: 1 }, { expireAfterSeconds: 0 });
await ev.insertMany([
  { n: 1, expiraEm: new Date(Date.now() - 1000) },          // já expirou
  { n: 2, expiraEm: new Date(Date.now() + 3600000) }        // expira em 1 hora
]);
console.log(await ev.countDocuments());                      // 2 (imediatamente)
await new Promise((r) => setTimeout(r, 75000));
console.log(await ev.countDocuments());                      // 1 (o monitor de TTL roda ~1 vez por minuto)`, notes: [{ l: '2', t: 'expireAfterSeconds: 0 remove no instante do campo de data.' }, { l: '7', t: 'A remoção não é imediata.' }] }
  ],
  bestPractices: ['Rode explain("executionStats") e confira IXSCAN e a razão entre documentos examinados e devolvidos.', 'Ordene as chaves do índice composto pela regra ESR.', 'Crie índices para as consultas reais e remova os não usados.', 'Use TTL para dados temporários e saiba que a remoção não é instantânea.', 'Mantenha o conjunto de trabalho em memória e meça o custo de escrita.', 'Planeje a criação de índices em coleções grandes.'],
  mistakes: ['Deixar consultas frequentes em COLLSCAN.', 'Criar índices em todos os campos "por precaução".', 'Esperar que o índice composto sirva a consultas pelo segundo campo isolado.', 'Contar com a remoção TTL imediata.', 'Ordenar sem índice em coleções grandes.', 'Ignorar os limites de memória das ordenações.'],
  market: R`Ler um explain e escolher o índice composto certo é a habilidade de desempenho mais cobrada em equipes que usam MongoDB. Sem ela, "o banco está lento" vira troca de hardware em vez de uma correção de minutos.`,
  summary: R`Sem índice, o MongoDB faz §COLLSCAN§: 100.000 documentos examinados para devolver 20 (~154 ms). Com §createIndex({ clienteId: 1 })§, §IXSCAN§ examinou 20 e levou ~3,9 ms. O índice composto (§status§, §criado§) atendeu o filtro com ordenação sem etapa de ordenação; o filtro só por data fez COLLSCAN. Regra ESR: igualdade, ordenação, intervalo. Índices TTL removem documentos expirados com atraso de até ~1 minuto (2 documentos viraram 1 em 75 s). Índices custam escrita e memória.`,
  refs: [REF.mongoIndexes, REF.mongoExplain, REF.mongoTtl, REF.mongoLimits],
  cards: [
    { q: 'O que indica um problema em um explain?', a: 'COLLSCAN em coleção grande, documentos examinados muito maiores que os devolvidos e ordenação em memória.' },
    { q: 'O que a regra ESR orienta?', a: 'A ordem das chaves em um índice composto: igualdade, depois ordenação, depois intervalo.' },
    { q: 'Quando uma consulta é coberta?', a: 'Quando o índice contém todos os campos usados, sem ler documentos (totalDocsExamined 0).' },
    { q: 'Quando um documento com índice TTL é removido?', a: 'Depois que a data do campo passa, em uma varredura periódica (cerca de uma vez por minuto), não instantaneamente.' },
    { q: 'Qual o custo de um índice?', a: 'Memória e disco, e escritas mais lentas, pois cada escrita atualiza os índices.' }
  ]
}
];
