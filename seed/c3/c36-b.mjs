// C3.6 — ORMs: Prisma e TypeORM. Aulas 3 e 4 (Prisma: consultas, erros, transações e SQL cru; TypeORM).
import { REF } from './c36-a.mjs';
const R = String.raw;

export const REF2 = {
  prismaCrud: { title: 'Prisma — CRUD', url: 'https://www.prisma.io/docs/orm/prisma-client/queries/crud', kind: 'doc' },
  prismaRelationQueries: { title: 'Prisma — Relation queries', url: 'https://www.prisma.io/docs/orm/prisma-client/queries/relation-queries', kind: 'doc' },
  prismaPagination: { title: 'Prisma — Pagination', url: 'https://www.prisma.io/docs/orm/prisma-client/queries/pagination', kind: 'doc' },
  prismaTransactions: { title: 'Prisma — Transactions', url: 'https://www.prisma.io/docs/orm/prisma-client/queries/transactions', kind: 'doc' },
  prismaRaw: { title: 'Prisma — Raw queries', url: 'https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries', kind: 'doc' },
  prismaErrors: { title: 'Prisma — Error reference', url: 'https://www.prisma.io/docs/orm/reference/error-reference', kind: 'doc' },
  typeormGetting: { title: 'TypeORM — Getting started', url: 'https://typeorm.io/docs/getting-started', kind: 'doc' },
  typeormEntity: { title: 'TypeORM — Entities', url: 'https://typeorm.io/docs/entity/entities', kind: 'doc' },
  typeormRelations: { title: 'TypeORM — Relations', url: 'https://typeorm.io/docs/relations/relations', kind: 'doc' },
  typeormMigrations: { title: 'TypeORM — Migrations', url: 'https://typeorm.io/docs/migrations/why', kind: 'doc' },
  typeormTransactions: { title: 'TypeORM — Transactions', url: 'https://typeorm.io/docs/advanced-topics/transactions', kind: 'doc' },
  typeormQueryBuilder: { title: 'TypeORM — Select Query Builder', url: 'https://typeorm.io/docs/query-builder/select-query-builder', kind: 'doc' },
  owaspSqli: { title: 'OWASP — SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'orm-03', moduleId: 'm2', order: 3, minutes: 80, tags: ['Prisma Client', 'select', 'include', 'paginação', 'transações', 'erros P2002', '$queryRaw', 'Decimal'],
  title: 'Prisma II: consultas, relações, paginação, erros, transações e SQL cru',
  objectives: ['Escrever consultas com §findMany§, §select§, §include§, §where§, §orderBy§ e agregações', 'Paginar com §skip§/§take§ e com cursor e entender o SQL de cada um', 'Tratar os erros tipados (§P2002§, §P2003§, §P2025§)', 'Usar transações em lote e interativas e confirmar o rollback', 'Usar SQL cru com segurança (§$queryRaw§ parametrizado x §$queryRawUnsafe§) e trabalhar com §Decimal§'],
  intro: R`Com o esquema e o cliente prontos (aula orm-02), o dia a dia está nas **consultas**. Esta aula percorre as operações do Prisma Client com **resultados medidos** (Prisma 7.10.1, PostgreSQL 17.12): como escolher campos, carregar relações, paginar, tratar erros, usar transações e, principalmente, **quando e como** recorrer ao SQL cru **sem abrir uma brecha de injeção**.`,
  theory: R`### Leitura: escolher campos e filtrar
§prisma.cliente.findMany({ where, select, orderBy, take, skip })§. Dois estilos **mutuamente exclusivos** para os campos: §select§ (**só** os campos pedidos) e §include§ (**todos** os campos do modelo **mais** as relações indicadas). Medido: §select: { id: true, nome: true }§ gerou **§SELECT "t0"."id", "t0"."nome" FROM "public"."Cliente" AS "t0"§** (só duas colunas), em ~2,7 ms contra ~15 a 18 ms de um §include§ de relação. **Selecionar só o necessário** reduz tráfego e memória. Filtros: §where: { email: { contains: 'ex.com' }, id: { lte: 10 }, OR: [...] }§; ordenação: §orderBy: { id: 'asc' }§. §findUnique§ (por campo único) e §findFirst§ (primeiro que casa) devolvem §null§ se não houver; §findUniqueOrThrow§ lança.

### Escrita
§create§, §createMany§ (um comando, medido ~217 ms para 1.000 linhas contra ~3,1 s em laço de §create§), §update§, §updateMany§, §upsert§, §delete§, §deleteMany§. Relações aninhadas em uma chamada: §create: { nome, pedidos: { create: [{ status: 'aberto' }] } }§ (executa em **transação**). §updateMany§ e §deleteMany§ devolvem só a **contagem** (§{ count }§).

### Relações: include e a estratégia de carga
§include: { pedidos: true }§ carrega os pedidos de cada cliente. Com a funcionalidade §relationJoins§ habilitada no gerador (usada no laboratório), o Prisma pode carregar relações com **uma só consulta SQL** (§LEFT JOIN LATERAL§ e agregação em JSON) ou com **consultas separadas por relação** (§relationLoadStrategy: 'query'§). Medido: §include: { pedidos: true }§ gerou **1** consulta com §join§ e **2** com §'query'§; um §include§ de **quatro níveis** (clientes, pedidos, itens, produto) gerou **1** consulta com §join§ (mediana **~142 ms**) e **4** com §'query'§ (**~61 ms**): **uma consulta nem sempre é mais rápida** (aula orm-05). Sem a funcionalidade §relationJoins§ habilitada, o argumento §relationLoadStrategy§ **não existe** (medido: "Unknown argument") e as relações vêm por consultas separadas.

### Agregações e agrupamentos
§count§, §aggregate§ (§_sum§, §_avg§, §_min§, §_max§) e §groupBy§ rodam **no banco**: §prisma.pedido.groupBy({ by: ['clienteId'], _count: { _all: true } })§ (medido: **1** consulta, ~3,6 ms). **Não traga todas as linhas para somar no JavaScript**: medido, calcular os totais com §include§ aninhado e soma no JavaScript levou **~94 ms** contra **~7 ms** de §_count§ e SQL agregado (aula orm-06).

### Paginação
- §skip§/§take§: SQL medido §ORDER BY "t0"."id" ASC LIMIT $1 OFFSET $2§. Simples; **custo proporcional ao deslocamento** (aula pgm-07).
- **Cursor**: §cursor: { id: 401 }, take: 20§ gera uma condição do tipo §id >= (SELECT id FROM ... WHERE id = 401)§ com §ORDER BY§ e §LIMIT§ (SQL medido). Com **índice** na chave, o custo é estável. Use **sempre** um §orderBy§ determinístico (com desempate pela chave) em paginação.

### Erros tipados
O cliente lança §PrismaClientKnownRequestError§ com um **§code§**. Medido:
- **§P2002§** violação de unicidade (criar cliente com e-mail existente; o §meta§ traz o erro do driver com a restrição §Cliente_email_key§);
- **§P2003§** violação de chave estrangeira (pedido para o cliente 9999);
- **§P2025§** registro não encontrado (§update§ do id 9999).
Trate-os como **regras de negócio** ("e-mail já cadastrado"), sem devolver a mensagem bruta ao usuário. A lista de códigos está na documentação.

### Transações
- **Em lote (sequencial)**: §prisma.$transaction([op1, op2])§ executa as operações **em uma transação**; confirma todas ou nenhuma (medido: contagens de clientes e pedidos obtidas na mesma transação: 100 e 500).
- **Interativa**: §prisma.$transaction(async (tx) => { ... })§: você usa §tx§ (**não** o §prisma§ global) dentro da função; se a função **lançar**, há **rollback**. Medido: criamos um cliente dentro da transação e lançamos um erro: o erro se propagou e o cliente **não existia** depois. Opções: §isolationLevel§, §timeout§, §maxWait§. Em transações interativas, **mantenha-as curtas** (aula trx-01) e **não faça chamadas externas** dentro delas.
- Operações **aninhadas** (create com relações) já são transacionais.
Para as anomalias de concorrência (aula trx-03), use §isolationLevel: 'Serializable'§ com repetição, §SELECT ... FOR UPDATE§ via SQL cru, **UPDATE atômico** (§data: { saldo: { increment: 10 } }§) ou **bloqueio otimista** (coluna de versão no §where§ do §update§).

### SQL cru: o que é seguro
- §prisma.$queryRaw§ com **template literal marcado** (o valor entra como §DOLAR{entrada}§ dentro do texto do template): os valores interpolados viram **parâmetros** ($1...), **nunca texto SQL**. Medido: com a entrada §' OR '1'='1§, a consulta devolveu **0** linhas.
- §prisma.$queryRawUnsafe§ com o texto montado por **concatenação ou interpolação comum** (§'DOLAR{entrada}'§ dentro de aspas): o texto é **concatenado**: medido, a mesma entrada devolveu **100** linhas (todas): **injeção de SQL**. Use o §Unsafe§ **só** com texto **fixo** (sem entrada de usuário) ou com **parâmetros posicionais** (§$queryRawUnsafe('... WHERE nome = $1', entrada)§).
- §$executeRaw§ / §$executeRawUnsafe§: para comandos que não devolvem linhas (devolvem o número de linhas afetadas).
- Nomes de tabelas e colunas **não** podem ser parâmetros: use uma **lista de permissão** (aula sqe-09) ou §Prisma.raw§/§Prisma.sql§ com cuidado.
- Os nomes no banco são **citados** (§"Cliente"§, §"clienteId"§) a menos que mapeados.
- Em SQL cru, os resultados são **objetos simples** (§bigint§, §Decimal§ e datas têm tratamento próprio).

### Decimal e outros tipos
Colunas §Decimal§ voltam como **objetos §Decimal§** (§Prisma.Decimal§), **não** como §number§: medido, o tipo do preço foi §Decimal§ e §0.1 + 0.2§ em Decimal deu **0.3**, contra **0.30000000000000004** em §number§. Use §.plus()§, §.times()§ etc. e converta com §toString()§ ao serializar. §BigInt§ e §Json§ também têm tipos próprios.

### Registro (log) de consultas
§new PrismaClient({ adapter, log: [{ emit: 'event', level: 'query' }] })§ e §prisma.$on('query', e => ...)§ mostram **cada SQL** e a duração: a base para contar consultas e achar N+1 (aula orm-05).`,
  concepts: [
    { term: 'select', def: 'Opção do Prisma Client para escolher apenas os campos desejados.' },
    { term: 'include', def: 'Opção do Prisma Client para carregar relações junto com os campos do modelo.' },
    { term: 'relationLoadStrategy', def: 'Opção que escolhe entre carregar relações em uma consulta com join ou em consultas separadas.' },
    { term: 'Paginação por cursor', def: 'Paginação que continua a partir de um registro de referência, com custo estável.' },
    { term: 'P2002', def: 'Código de erro do Prisma para violação de unicidade.' },
    { term: 'P2025', def: 'Código de erro do Prisma para registro não encontrado.' },
    { term: 'Transação interativa', def: 'Transação em que uma função recebe o cliente transacional e faz rollback se lançar erro.' },
    { term: '$queryRaw', def: 'Método do Prisma para SQL cru com valores interpolados enviados como parâmetros.' },
    { term: '$queryRawUnsafe', def: 'Método que executa texto SQL concatenado, vulnerável a injeção com entrada não confiável.' },
    { term: 'Prisma.Decimal', def: 'Tipo decimal exato usado pelo Prisma para colunas Decimal.' }
  ],
  examples: R`**Analogia:** o select é pedir **só as peças que você vai usar**, e o include é pedir **a caixa inteira mais as caixas relacionadas**. A transação interativa é **abrir o caixa para uma venda completa**: se algo falha no meio, **anula-se tudo**. O $queryRaw com template é **entregar ao cozinheiro uma receita com campos em branco preenchidos à parte**; o $queryRawUnsafe com concatenação é **ditar a receita pronta, incluindo o que o cliente escreveu no bilhete**: se ele escrever uma instrução, o cozinheiro a obedece.

**Exemplo 1: erros.** Três códigos para três falhas: unicidade (P2002), FK (P2003) e não encontrado (P2025).

**Exemplo 2: segurança.** A mesma entrada maliciosa devolveu 0 linhas com o template e 100 com concatenação.

**Exemplo 3: paginação.** skip usa LIMIT/OFFSET; cursor usa uma condição por chave.`,
  code: [
    { title: 'Consultas, erros e transação interativa (TypeScript, saída medida com Prisma 7.10.1)', lang: 'ts', code: R`import { Prisma } from './generated/client.ts';

// só o necessário: SELECT "t0"."id", "t0"."nome" FROM "public"."Cliente"
const nomes = await prisma.cliente.findMany({ select: { id: true, nome: true }, orderBy: { id: 'asc' }, take: 20 });

// relações em uma consulta (join) ou em várias ('query')
const comPedidos = await prisma.cliente.findMany({ relationLoadStrategy: 'join', include: { pedidos: true } });

// erros tipados
try {
  await prisma.cliente.create({ data: { nome: 'x', email: 'c1@ex.com' } });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw new Error('e-mail já cadastrado');   // P2003: FK, P2025: não encontrado
  throw e;
}

// transação interativa: rollback se lançar
await prisma.$transaction(async (tx) => {
  await tx.cliente.create({ data: { nome: 'Dentro da tx', email: 'tx@ex.com' } });
  throw new Error('falha de negócio');           // o cliente NÃO é gravado
});`, notes: [{ l: '4', t: 'select reduz as colunas do SQL gerado.' }, { l: '13', t: 'O código P2002 vira uma regra de negócio, sem expor a mensagem do banco.' }, { l: '20', t: 'Dentro da transação use tx, não o cliente global.' }] },
    { title: 'SQL cru: parametrizado x concatenado (TypeScript, saída medida)', lang: 'ts', code: R`const entrada = "' OR '1'='1";

// SEGURO: tagged template; a entrada vira parâmetro ($1)
const seguro = await prisma.$queryRaw§SELECT count(*)::int AS n FROM "Cliente" WHERE nome = DOLAR{entrada}§;
// → [{ n: 0 }]

// INSEGURO: concatenação em texto SQL
const inseguro = await prisma.$queryRawUnsafe(§SELECT count(*)::int AS n FROM "Cliente" WHERE nome = 'DOLAR{entrada}'§);
// → [{ n: 100 }]   (todas as linhas: injeção de SQL)

// Unsafe só com parâmetros posicionais:
await prisma.$queryRawUnsafe('SELECT count(*)::int AS n FROM "Cliente" WHERE nome = $1', entrada);   // 0

// paginação por cursor e agregação no banco
const pagina = await prisma.pedido.findMany({ orderBy: { id: 'asc' }, cursor: { id: 401 }, take: 20 });
const porCliente = await prisma.pedido.groupBy({ by: ['clienteId'], _count: { _all: true } });`, notes: [{ l: '4', t: 'No template, DOLAR{entrada} é enviado como parâmetro.' }, { l: '8', t: 'Concatenar a entrada em texto SQL é injeção.' }, { l: '12', t: 'Parâmetro posicional resolve também no modo Unsafe.' }] }
  ],
  bestPractices: ['Use select para trazer só os campos necessários.', 'Agregue no banco (count, groupBy, aggregate) em vez de somar no JavaScript.', 'Trate P2002, P2003 e P2025 como regras de negócio.', 'Use transações interativas curtas e use tx dentro delas.', 'Use $queryRaw com template ou parâmetros posicionais; nunca concatene entrada do usuário.', 'Ative o log de consultas em desenvolvimento e revise o SQL gerado.'],
  mistakes: ['Usar include em tudo e trazer dados desnecessários.', 'Usar o cliente global dentro de uma transação interativa.', 'Concatenar entrada do usuário em $queryRawUnsafe.', 'Tratar Decimal como number.', 'Paginar com skip enorme em tabelas grandes.', 'Mostrar a mensagem do erro do banco ao usuário.'],
  market: R`Saber ler o SQL gerado pelo Prisma, tratar os erros por código e evitar a injeção em SQL cru distingue quem usa o Prisma de forma profissional. Revisões de código costumam apontar $queryRawUnsafe com interpolação como falha de segurança crítica.`,
  summary: R`O Prisma Client usa §select§ (só campos) ou §include§ (relações), com SQL visível pelo log. Medido: §select§ gerou um SELECT de duas colunas; §include§ de quatro níveis fez 1 consulta (join, ~142 ms) ou 4 (query, ~61 ms). Erros: §P2002§, §P2003§, §P2025§. A transação interativa desfez o cliente criado. §$queryRaw§ com template (parâmetro) devolveu 0 linhas para a entrada maliciosa; §$queryRawUnsafe§ concatenado devolveu 100. Decimal exato (0.3) contra number (0.30000000000000004). Paginação por cursor tem custo estável.`,
  refs: [REF2.prismaCrud, REF2.prismaRelationQueries, REF2.prismaPagination, REF2.prismaTransactions, REF2.prismaRaw, REF2.prismaErrors, REF2.owaspSqli],
  cards: [
    { q: 'Qual a diferença entre select e include?', a: 'select traz só os campos indicados; include traz todos os campos do modelo mais as relações pedidas.' },
    { q: 'O que significa o erro P2002?', a: 'Violação de unicidade (valor duplicado em um campo ou índice único).' },
    { q: 'Como o $queryRaw com template evita injeção?', a: 'Os valores interpolados são enviados como parâmetros do banco, nunca como parte do texto SQL.' },
    { q: 'O que acontece em uma transação interativa se a função lança erro?', a: 'Há rollback: nada do que foi feito com tx é gravado.' },
    { q: 'Por que usar cursor em vez de skip para paginar?', a: 'O skip lê e descarta as linhas puladas; o cursor usa uma condição pela chave, com custo estável.' }
  ]
},
{
  id: 'orm-04', moduleId: 'm2', order: 4, minutes: 80, tags: ['TypeORM', 'EntitySchema', 'DataSource', 'repositório', 'QueryBuilder', 'synchronize', 'migrações'],
  title: 'TypeORM: entidades, repositórios, relações, QueryBuilder e o perigo do synchronize',
  objectives: ['Definir entidades e relações com §EntitySchema§ (e reconhecer a forma com decoradores)', 'Configurar um §DataSource§ e usar repositórios, §find§ com relações e o §QueryBuilder§', 'Contar as consultas geradas com um logger e comparar as estratégias de carga de relações', 'Tratar erros do driver (§QueryFailedError§) e usar transações', 'Explicar por que o §synchronize§ é perigoso em produção e como as migrações o substituem'],
  intro: R`O **TypeORM** segue a tradição dos ORMs de objetos: **entidades** (classes ou esquemas), **repositórios** (Data Mapper) ou Active Record, um **QueryBuilder** e migrações próprias. É flexível, tem recursos para consultas complexas e uma comunidade grande, mas **exige mais cuidado**. Esta aula usa o **TypeORM 1.1.3** com PostgreSQL 17.12 (executado com §EntitySchema§, sem decoradores) e mostra um risco real do modo de **sincronização automática** do esquema.`,
  theory: R`### Entidades: EntitySchema e decoradores
Uma **entidade** descreve a tabela. Duas formas equivalentes:
- **Decoradores** (TypeScript, requer configuração do compilador para decoradores): §@Entity() class Cliente { @PrimaryGeneratedColumn() id: number; @Column() nome: string; @OneToMany(() => Pedido, p => p.cliente) pedidos: Pedido[]; }§ (forma mais comum; **não executada** neste laboratório).
- **§EntitySchema§** (objeto de configuração, sem decoradores; **executada** no laboratório):
§§§
const Cliente = new EntitySchema({
  name: 'Cliente', tableName: 'tor_cliente',
  columns: { id: { type: Number, primary: true, generated: 'increment' }, nome: { type: String }, email: { type: String, unique: true } },
  relations: { pedidos: { type: 'one-to-many', target: 'Pedido', inverseSide: 'cliente' } }
});
const Pedido = new EntitySchema({
  name: 'Pedido', tableName: 'tor_pedido',
  columns: { id: { type: Number, primary: true, generated: 'increment' }, status: { type: String, default: 'aberto' } },
  relations: { cliente: { type: 'many-to-one', target: 'Cliente', inverseSide: 'pedidos', joinColumn: { name: 'cliente_id' }, onDelete: 'RESTRICT' } },
  indices: [{ columns: ['cliente'] }]
});
§§§
Relações: §one-to-many§ / §many-to-one§ (a chave estrangeira fica no lado "muitos", declarada com §joinColumn§), §many-to-many§ (com §joinTable§) e §one-to-one§. A **ação referencial** (§onDelete§) e os **índices** devem ser declarados (aula mod-03); o TypeORM **não** cria índice automático em chave estrangeira para PostgreSQL.

### DataSource e repositórios
§new DataSource({ type: 'postgres', host, port, username, password, database, entities: [...], logger, logging: ['query'] })§ e §await ds.initialize()§. Cada entidade tem um **repositório** (§ds.getRepository('Cliente')§) com §find§, §findOne§, §save§, §insert§, §update§, §delete§, §count§. §insert§ envia **um comando** (medido: 100 clientes em uma instrução); §save§ **lê e decide** entre inserir e atualizar (mais comandos). Em PostgreSQL, §insert§ aceita **lotes**.

### Carregando relações e contando consultas
Com um **logger** que conta as consultas (§logQuery§), medido (100 clientes, 500 pedidos):
- **N+1** (um §find§ dos clientes e, em laço, um §find§ dos pedidos de cada um): **101 consultas**, mediana **~241 ms**.
- §find({ relations: { pedidos: true } })§ (estratégia §join§, **padrão**): **1** consulta com §LEFT JOIN§, **~12 ms**. O SQL repete os dados do cliente em **cada linha de pedido** (a resposta tem 500 linhas para 100 clientes).
- §relationLoadStrategy: 'query'§: **3** consultas e **~261 ms**: mais lenta que o N+1 neste ambiente, por motivo **não investigado**; **meça sempre** (documentação diz que a estratégia é útil para evitar a explosão de linhas dos joins).
- **§take§/§skip§ com §relations§**: o TypeORM precisa de **duas** consultas (uma §SELECT DISTINCT§ com os ids da página e outra com os dados), pois paginar sobre um join com linhas repetidas daria **contagens erradas**. Medido: **2** consultas.
- **QueryBuilder**: §pr.createQueryBuilder('p').select('p.cliente_id','cliente').addSelect('count(*)','n').groupBy('p.cliente_id').getRawMany()§: **1** consulta, **~2,4 ms** (agregação no banco).

### QueryBuilder
Constrói SQL por encadeamento, com **parâmetros nomeados** (§where('p.status = :s', { s: 'aberto' })§), §leftJoinAndSelect§, §groupBy§, §orderBy§, §getMany§/§getRawMany§/§getOne§. É a forma de expressar **consultas que o §find§ não alcança**. **Nunca** concatene entrada do usuário: use sempre parâmetros. Medido com SQL cru: §ds.query('... WHERE nome = $1', [entrada])§ devolveu **0** linhas para a entrada maliciosa; a versão com **concatenação** de texto devolveu **100**.

### Erros do driver
Falhas de banco viram **§QueryFailedError§**, com o erro do driver em §.driverError§ (§code§ do PostgreSQL). Medido: unicidade → §code§ **23505** (com o nome da restrição, aqui §UQ_34fc...§, **gerado automaticamente**: dê nomes explícitos às restrições se for referenciá-las); chave estrangeira → **23503**. Mapeie-os para **regras de negócio**, como no Prisma (aula orm-03).

### Transações
§await ds.transaction(async (manager) => { ... })§: use §manager§ (ou repositórios obtidos dele) dentro da função; se lançar, há **rollback**. Medido: um cliente criado dentro da função que lançou erro **não existia** depois. Também há §QueryRunner§ para controle manual (§startTransaction§, §commitTransaction§, §rollbackTransaction§) e decoradores/ferramentas de unidade de trabalho. Aplicam-se as regras da aula trx-01 e trx-03 (transações curtas; repetição de 40001/40P01).

### synchronize: conveniente e perigoso
§synchronize: true§ (ou §await ds.synchronize()§) **faz o banco ficar igual às entidades** a cada inicialização: cria tabelas, colunas e **remove o que não está nas entidades**. Em um banco vazio é ótimo (medido: as duas tabelas foram criadas). Mas medido o **risco**: com uma versão da entidade §Cliente§ **sem a coluna §email§**, o plano de sincronização (§createSchemaBuilder().log()§) seria:
§§§
ALTER TABLE "tor_cliente" DROP CONSTRAINT "UQ_34fcfb8b24557c5c8ffdf6b1172"
ALTER TABLE "tor_cliente" DROP COLUMN "email"
§§§
Ou seja: **apagaria a coluna e os dados dos 100 e-mails** na próxima inicialização. Por isso: **nunca use §synchronize§ em produção**; use **migrações** (§migration:generate§ compara entidades e banco e gera um arquivo TypeScript com os comandos; §migration:run§ aplica; documentação, **CLI não executada** aqui), **revise o SQL** e aplique no deploy (§migrationsRun§ ou comando). Em testes automatizados, §synchronize§ ou §dropSchema§ em um banco **descartável** é aceitável.

### TypeORM ou Prisma?
- **TypeORM**: flexível (Active Record ou Data Mapper), QueryBuilder poderoso, suporte a muitos bancos e padrões de entidades conhecidos de Java e C#; exige **disciplina** (relações, carga, migrações) e tem **mais armadilhas**.
- **Prisma**: **esquema único**, cliente **tipado** muito consistente, migrações declarativas e **API enxuta**; menos flexível em consultas muito complexas (use SQL cru).
Em ambos: **leia o SQL, meça, migre com revisão e proteja contra injeção**.`,
  concepts: [
    { term: 'Entidade', def: 'Classe ou esquema que descreve uma tabela e seus relacionamentos no TypeORM.' },
    { term: 'EntitySchema', def: 'Forma de declarar entidades do TypeORM por objeto de configuração, sem decoradores.' },
    { term: 'DataSource', def: 'Objeto do TypeORM que configura e gerencia a conexão com o banco e as entidades.' },
    { term: 'Repositório', def: 'Objeto que oferece operações de persistência sobre uma entidade.' },
    { term: 'QueryBuilder', def: 'API do TypeORM para montar consultas SQL por encadeamento com parâmetros.' },
    { term: 'QueryFailedError', def: 'Erro do TypeORM que encapsula uma falha reportada pelo banco, com o código do driver.' },
    { term: 'synchronize', def: 'Opção que ajusta o esquema do banco às entidades automaticamente, podendo apagar dados.' },
    { term: 'Migração (TypeORM)', def: 'Arquivo versionado com os comandos de mudança de esquema, gerado ou escrito à mão.' },
    { term: 'relationLoadStrategy', def: 'Opção que escolhe carregar relações por join ou por consultas separadas.' },
    { term: 'QueryRunner', def: 'Objeto do TypeORM para controle manual de conexão e transação.' }
  ],
  examples: R`**Analogia:** o synchronize é um **robô de arrumação que deixa a casa igualzinha à planta**: se você tirar um cômodo da planta, **ele demole o cômodo na próxima visita, com tudo dentro**. Em uma casa vazia (banco novo) é ótimo; em uma casa habitada (produção), é perigoso. As migrações são o **projeto de reforma revisado**: cada obra é um documento datado, que você lê antes de autorizar. O N+1 é o **entregador que faz uma viagem para cada casa** em vez de uma rota única.

**Exemplo 1: contagem de consultas.** 101 no N+1; 1 com relations em join; 3 com 'query'; 2 com take/skip sobre relations.

**Exemplo 2: o que o synchronize faria.** DROP CONSTRAINT e DROP COLUMN "email" (dados perdidos) ao remover o campo da entidade.

**Exemplo 3: erros.** 23505 para duplicidade e 23503 para chave estrangeira.`,
  code: [
    { title: 'DataSource, repositórios e contagem de consultas (JavaScript, saída medida no TypeORM 1.1.3)', lang: 'js', code: R`import 'reflect-metadata';
import { DataSource } from 'typeorm';

const consultas = [];
const logger = { logQuery: (q) => consultas.push(q), logQueryError() {}, logQuerySlow() {}, logSchemaBuild() {}, logMigration() {}, log() {} };
const ds = new DataSource({
  type: 'postgres', host: '127.0.0.1', port: 55432, username: 'postgres', password: 'lab', database: 'ormlab',
  entities: [Cliente, Pedido], synchronize: false, logger, logging: ['query']
});
await ds.initialize();
const clientes = ds.getRepository('Cliente');

// N+1: 101 consultas
const todos = await clientes.find();
for (const c of todos) await ds.getRepository('Pedido').find({ where: { cliente: { id: c.id } } });

// relação por join: 1 consulta
await clientes.find({ relations: { pedidos: true } });

// agregação no banco: 1 consulta
await ds.getRepository('Pedido').createQueryBuilder('p')
  .select('p.cliente_id', 'cliente').addSelect('count(*)', 'n').groupBy('p.cliente_id').getRawMany();`, notes: [{ l: '4', t: 'O logger permite contar e inspecionar cada SQL.' }, { l: '15', t: 'Uma consulta por cliente: o problema N+1.' }, { l: '18', t: 'O join traz tudo em uma consulta (repete os dados do cliente por pedido).' }, { l: '21', t: 'O agrupamento é feito no banco.' }] },
    { title: 'O que o synchronize faria e como tratar erros (JavaScript, saída medida)', lang: 'js', code: R`// entidade V2 sem a coluna email
const plano = await ds2.driver.createSchemaBuilder().log();
plano.upQueries.forEach((q) => console.log(q.query));
// ALTER TABLE "tor_cliente" DROP CONSTRAINT "UQ_34fcfb8b24557c5c8ffdf6b1172"
// ALTER TABLE "tor_cliente" DROP COLUMN "email"      <-- dados apagados na próxima sincronização

// erros do driver
try { await clientes.insert({ nome: 'x', email: 't1@ex.com' }); }
catch (e) { if (e.driverError?.code === '23505') throw new Error('e-mail já cadastrado'); throw e; }   // 23503: chave estrangeira

// transação: rollback se lançar
await ds.transaction(async (manager) => {
  await manager.getRepository('Cliente').insert({ nome: 'tx', email: 'tx@ex.com' });
  throw new Error('falha de negócio');      // o cliente não é gravado
});`, notes: [{ l: '2', t: 'O log do schema builder mostra o que seria executado, sem executar.' }, { l: '5', t: 'Remover um campo da entidade apagaria os dados.' }, { l: '9', t: 'O código 23505 é o da violação de unicidade do PostgreSQL.' }, { l: '13', t: 'Use o manager dentro da transação.' }] }
  ],
  bestPractices: ['Nunca use synchronize em produção: use migrações revisadas.', 'Ative o logger e conte as consultas ao carregar relações.', 'Meça as estratégias de carga (join x query) com seus dados.', 'Use o QueryBuilder com parâmetros nomeados e nunca concatene entrada do usuário.', 'Dê nomes explícitos às restrições e declare índices nas chaves estrangeiras.', 'Mapeie QueryFailedError para regras de negócio e use transações curtas.'],
  mistakes: ['Deixar synchronize: true em produção.', 'Navegar relações em laço e gerar N+1.', 'Usar save quando insert em lote basta.', 'Concatenar valores no QueryBuilder ou em ds.query.', 'Achar que relationLoadStrategy query é sempre mais rápido.', 'Esquecer o manager dentro de ds.transaction.'],
  market: R`TypeORM é muito presente em bases NestJS e Node.js existentes, e a manutenção dessas bases pede conhecer relações, estratégias de carga e migrações. Incidentes por synchronize em produção são um clássico.`,
  summary: R`O TypeORM descreve entidades (decoradores ou §EntitySchema§), usa §DataSource§ e repositórios e oferece §QueryBuilder§. Medido: N+1 = 101 consultas (~241 ms); relações em join = 1 (~12 ms); estratégia query = 3 (~261 ms; causa não investigada); take/skip com relations = 2; agrupamento no banco = 1 (~2,4 ms). Erros: §23505§ e §23503§. O §synchronize§ faria §DROP COLUMN "email"§ ao remover o campo da entidade: use migrações revisadas. SQL com parâmetro devolveu 0 linhas; concatenado, 100.`,
  refs: [REF2.typeormGetting, REF2.typeormEntity, REF2.typeormRelations, REF2.typeormMigrations, REF2.typeormTransactions, REF2.typeormQueryBuilder],
  cards: [
    { q: 'O que é uma EntitySchema?', a: 'Uma forma de declarar entidades do TypeORM por objeto de configuração, sem decoradores.' },
    { q: 'Por que o synchronize é perigoso em produção?', a: 'Ajusta o banco às entidades e pode remover colunas e dados (medido: DROP COLUMN "email").' },
    { q: 'Como contar as consultas que o TypeORM executa?', a: 'Com um logger personalizado (logQuery) ou logging: ["query"].' },
    { q: 'Por que take/skip com relations gera duas consultas?', a: 'Para paginar corretamente sobre um join com linhas repetidas: uma busca os ids da página e outra, os dados.' },
    { q: 'Qual o código do PostgreSQL para violação de unicidade em QueryFailedError?', a: '23505 (e 23503 para chave estrangeira).' }
  ]
}
];
