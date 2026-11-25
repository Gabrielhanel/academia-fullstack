// C3.6 — ORMs: Prisma e TypeORM. Aulas 1 e 2 (o que é um ORM; Prisma: schema, migrações e cliente).
const R = String.raw;

export const REF = {
  ormHate: { title: 'Martin Fowler — OrmHate', url: 'https://martinfowler.com/bliki/OrmHate.html', kind: 'artigo' },
  activeRecord: { title: 'Martin Fowler — Active Record (PoEAA)', url: 'https://martinfowler.com/eaaCatalog/activeRecord.html', kind: 'artigo' },
  dataMapper: { title: 'Martin Fowler — Data Mapper (PoEAA)', url: 'https://martinfowler.com/eaaCatalog/dataMapper.html', kind: 'artigo' },
  prismaSchema: { title: 'Prisma — Prisma Schema overview', url: 'https://www.prisma.io/docs/orm/prisma-schema/overview', kind: 'doc' },
  prismaMigrate: { title: 'Prisma — Prisma Migrate', url: 'https://www.prisma.io/docs/orm/prisma-migrate', kind: 'doc' },
  prismaRelations: { title: 'Prisma — Relations', url: 'https://www.prisma.io/docs/orm/prisma-schema/data-model/relations', kind: 'doc' },
  prismaClient: { title: 'Prisma — Prisma Client', url: 'https://www.prisma.io/docs/orm/prisma-client', kind: 'doc' },
  prismaConfig: { title: 'Prisma — Configuration (prisma.config.ts)', url: 'https://www.prisma.io/docs/orm/reference/prisma-config-reference', kind: 'doc' },
  typeormSite: { title: 'TypeORM — documentação', url: 'https://typeorm.io/', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'orm-01', moduleId: 'm1', order: 1, minutes: 65, tags: ['ORM', 'mapeamento objeto-relacional', 'Active Record', 'Data Mapper', 'query builder'],
  title: 'O que é um ORM: o problema, os padrões e o mapa das ferramentas',
  objectives: ['Explicar o problema do descompasso objeto-relacional que os ORMs tentam resolver', 'Distinguir Active Record, Data Mapper, query builders e clientes gerados a partir do esquema', 'Relacionar Prisma e TypeORM a esses padrões', 'Listar benefícios e custos de um ORM', 'Decidir quando um ORM ajuda e quando atrapalha'],
  intro: R`Quem programa em linguagens de objetos e guarda dados em tabelas precisa **traduzir** entre os dois mundos o tempo todo: objetos com referências e herança de um lado, linhas, chaves e junções do outro. Os **ORMs** (*object-relational mappers*) automatizam essa tradução. Esta aula apresenta o problema, os **padrões de projeto** por trás das ferramentas e o **mapa** do que vem a seguir (Prisma e TypeORM, executados em PostgreSQL 17.12), com o realismo de quem já viu ORMs ajudarem muito e atrapalharem bastante.`,
  theory: R`### O descompasso objeto-relacional
Alguns pontos em que objetos e tabelas **não se encaixam**:
- **Identidade**: dois objetos com os mesmos dados são distintos na memória; no banco, a identidade é a **chave**.
- **Relacionamentos**: objetos se ligam por **referências** (navegáveis); tabelas, por **chaves estrangeiras** (juntadas por consultas).
- **Herança e polimorfismo**: o banco relacional não tem herança nativa.
- **Granularidade**: um objeto "Endereço" pode ser um grupo de colunas.
- **Tipos**: tipos da linguagem e do banco não coincidem (decimais, datas, JSON, enums).
- **Navegação**: percorrer relações em código (§pedido.cliente.nome§) **parece grátis**, mas pode disparar consultas (aula orm-05).
Escrever e manter essa tradução à mão em cada consulta é repetitivo e sujeito a erros; daí os ORMs.

### O que um ORM faz
1. **Mapeia** classes/modelos a tabelas e atributos a colunas.
2. **Gera SQL** para criar, ler, atualizar e apagar (CRUD) e para relações.
3. **Converte tipos** e hidrata resultados em objetos.
4. Gerencia **conexões**, **transações** e, em muitos casos, **migrações** do esquema.
5. Oferece **segurança de tipos** (TypeScript) e **parâmetros** nas consultas (proteção contra injeção, aula sqe-09).

### Padrões clássicos (Fowler, PoEAA)
- **Active Record**: o objeto **sabe** se salvar e se carregar (§usuario.save()§). Simples; mistura **regra de negócio e persistência** (Rails ActiveRecord, Sequelize em um estilo).
- **Data Mapper**: um **mapeador** separado move dados entre objetos e o banco; os objetos **não conhecem** o banco (Hibernate, TypeORM no modo repositório). Mais código, **melhor separação**.
- **Query builder**: monta SQL por **encadeamento de funções**, sem mapear classes (Knex, Kysely).
- **Cliente gerado a partir do esquema** (Prisma): você descreve o **esquema** em um arquivo e o **cliente tipado** é **gerado**; os resultados são **objetos simples**, sem métodos de persistência.
- **SQL tipado** (SQL escrito, tipos inferidos): ferramentas que verificam o SQL contra o esquema.

### Onde ficam Prisma e TypeORM
- **Prisma 7** (versão do curso): esquema em §schema.prisma§, **cliente gerado e tipado**, **migrações** a partir do esquema, resultados como objetos simples, **adaptadores de driver** (§@prisma/adapter-pg§). Não é Active Record nem Data Mapper no sentido clássico: o cliente é uma **API de consulta tipada**.
- **TypeORM 1.1** (versão do curso): **entidades** (classes com decoradores ou §EntitySchema§), **repositórios** (Data Mapper) ou **Active Record** (herdando de uma classe base), **QueryBuilder**, migrações próprias e **sincronização automática** do esquema (perigosa, aula orm-04).
Ambos têm lugar; a escolha depende de **segurança de tipos**, **estilo de equipe**, **necessidade de SQL complexo** e **maturidade**.

### Benefícios (e quando aparecem)
- **Produtividade** em CRUD e relações simples.
- **Segurança de tipos** de ponta a ponta (especialmente com o cliente tipado).
- **Parametrização** por padrão (menos risco de injeção).
- **Migrações** versionadas junto ao código.
- **Portabilidade** parcial entre bancos (limitada; aula orm-06).

### Custos (e quando aparecem)
- **Abstração que vaza**: sem entender o SQL gerado, surgem **N+1**, junções enormes, consultas lentas (aula orm-05). Medido neste curso: listar 100 clientes e seus pedidos **em laço** gerou **101 consultas** (~225 ms); com uma relação carregada junto, **1 ou 2** (~15 ms).
- **Curva de aprendizado** da ferramenta, além do SQL.
- **Consultas complexas** (janelas, CTEs, agregações) exigem **SQL cru** (aula orm-06).
- **Inserções em massa** ingênuas são muito lentas (medido: 1.000 inserções em laço levaram ~3,1 s; em lote, ~217 ms; em SQL com §unnest§, ~37 ms).
- **Acoplamento** à ferramenta e riscos de **migrações automáticas** (aula orm-04).

### Regra prática
**Use o ORM para o que ele faz bem** (CRUD, relações simples, tipos, migrações) e **SQL (ou um construtor próximo do SQL) para o que importa em desempenho e complexidade**. **Leia o SQL gerado** (ative o log de consultas) e **meça**. O ORM não dispensa conhecer SQL, o banco e os índices (aulas C3.1 a C3.5).

### O roteiro do curso
Aula 2 e 3: **Prisma** (esquema, migrações, cliente, consultas, erros, transações). Aula 4: **TypeORM**. Aula 5: **N+1 e desempenho**. Aula 6: **ORM x SQL puro** e o projeto.`,
  concepts: [
    { term: 'ORM', def: 'Ferramenta que mapeia objetos da linguagem a tabelas relacionais e gera o SQL correspondente.' },
    { term: 'Descompasso objeto-relacional', def: 'Diferenças de modelo entre objetos (referências, herança) e tabelas (chaves, junções).' },
    { term: 'Active Record', def: 'Padrão em que o objeto conhece a própria persistência (save, find).' },
    { term: 'Data Mapper', def: 'Padrão em que um mapeador separado move dados entre objetos e o banco.' },
    { term: 'Query builder', def: 'Biblioteca que monta SQL por encadeamento de funções, sem mapear classes.' },
    { term: 'Cliente gerado', def: 'Biblioteca de acesso tipada gerada a partir de um esquema declarativo.' },
    { term: 'Hidratação', def: 'Construção de objetos a partir das linhas retornadas pelo banco.' },
    { term: 'Abstração que vaza', def: 'Situação em que detalhes escondidos (SQL gerado) afetam o comportamento visível e exigem conhecimento.' },
    { term: 'Adaptador de driver', def: 'Camada que liga o cliente do ORM a um driver específico do banco.' },
    { term: 'Migração', def: 'Mudança versionada do esquema aplicada em ordem.' }
  ],
  examples: R`**Analogia:** um ORM é um **tradutor simultâneo** entre duas línguas (objetos e tabelas). Ele acelera conversas simples (CRUD) e evita erros de vocabulário (tipos). Mas, se você não entende a língua do outro lado (SQL), não percebe quando o tradutor faz **cem perguntas** onde bastava **uma** (N+1), nem sabe pedir a frase difícil que ele não traduz bem (consulta analítica). O Active Record é o tradutor que **mora dentro do objeto**; o Data Mapper é o tradutor **em uma sala separada**.

**Exemplo 1: N+1.** 101 consultas contra 1 ou 2 para os mesmos dados (medido).

**Exemplo 2: inserção em massa.** 1.000 linhas: ~3,1 s em laço, ~217 ms em lote e ~37 ms em SQL com unnest.

**Exemplo 3: tipos.** Decimais exatos exigem tipos próprios (Decimal): 0,1 + 0,2 dá 0,3 em Decimal e 0,30000000000000004 em number.`,
  code: [
    { title: 'O mesmo CRUD em três estilos (TypeScript, ilustrativo)', lang: 'ts', code: R`// 1) Active Record (o objeto se salva)
const u = new Usuario(); u.nome = 'Ana'; await u.save(); const achado = await Usuario.findOneBy({ id: 1 });

// 2) Data Mapper (repositório separado; entidade sem lógica de persistência)
const repo = dataSource.getRepository(Usuario);
await repo.save({ nome: 'Ana' }); const achado2 = await repo.findOneBy({ id: 1 });

// 3) Cliente gerado e tipado (Prisma): objetos simples
const criado = await prisma.usuario.create({ data: { nome: 'Ana' } });
const achado3 = await prisma.usuario.findUnique({ where: { id: criado.id } });   // tipo inferido do schema.prisma

// 4) SQL puro parametrizado (driver pg)
const { rows } = await pool.query('SELECT id, nome FROM usuarios WHERE id = $1', [1]);`, notes: [{ l: '2', t: 'No Active Record, a entidade carrega métodos de persistência.' }, { l: '6', t: 'No Data Mapper, o repositório faz a persistência e a entidade fica limpa.' }, { l: '9', t: 'No cliente gerado, o tipo de retorno vem do esquema.' }, { l: '13', t: 'SQL puro: controle total e responsabilidade total.' }] },
    { title: 'Descompasso e custo: o mesmo dado de duas formas (saída medida)', lang: 'text', code: R`N+1 (laço):                    101 consultas | mediana ~225 ms   (100 clientes, 500 pedidos)
include/relação carregada:       1 a 2 consultas | mediana ~15 ms
1.000 inserções em laço (Prisma):    ~3.141 ms
createMany (1 comando):                ~217 ms
INSERT ... unnest (driver pg):          ~37 ms
Decimal: 0.1 + 0.2 = 0.3  |  number: 0.1 + 0.2 = 0.30000000000000004`, notes: [{ l: '1', t: 'Cada acesso a uma relação dentro de um laço pode disparar uma consulta.' }, { l: '3', t: 'O custo por comando domina: agrupar em lote muda tudo.' }, { l: '6', t: 'Tipos exatos importam para dinheiro.' }] }
  ],
  bestPractices: ['Ative o log de consultas e leia o SQL gerado.', 'Use o ORM para CRUD e relações simples e SQL para consultas complexas e de desempenho crítico.', 'Prefira operações em lote a laços de comandos.', 'Use tipos exatos (Decimal) para dinheiro.', 'Versione as migrações junto ao código.', 'Conheça o SQL, o modelo e os índices do banco por trás do ORM.'],
  mistakes: ['Achar que o ORM dispensa saber SQL.', 'Navegar relações em laços sem medir as consultas geradas.', 'Usar sincronização automática de esquema em produção.', 'Forçar o ORM em consultas analíticas complexas.', 'Ignorar tipos (number para dinheiro).', 'Escolher o ORM pela moda, sem avaliar o estilo da equipe e as necessidades.'],
  market: R`Quase todo backend moderno usa algum ORM ou construtor de consultas, e a diferença entre pessoas juniores e plenas está em ler o SQL gerado, achar o N+1 e saber quando abandonar o ORM. Entrevistas frequentemente perguntam sobre o problema N+1 e sobre Active Record x Data Mapper.`,
  summary: R`Os ORMs traduzem entre objetos e tabelas e oferecem produtividade, tipos, parâmetros e migrações; seus custos são a abstração que vaza (N+1: 101 consultas medidas), consultas complexas e inserções ingênuas lentas (1.000 em laço ~3,1 s). Padrões: Active Record, Data Mapper, query builder e cliente gerado (Prisma). Use o ORM para o que ele faz bem, leia o SQL, meça e use SQL quando preciso.`,
  refs: [REF.ormHate, REF.activeRecord, REF.dataMapper, REF.prismaClient, REF.typeormSite],
  cards: [
    { q: 'O que é o descompasso objeto-relacional?', a: 'As diferenças entre o modelo de objetos (referências, herança) e o relacional (chaves, junções, tipos) que a tradução precisa resolver.' },
    { q: 'Qual a diferença entre Active Record e Data Mapper?', a: 'No Active Record o objeto se persiste; no Data Mapper um mapeador separado faz a persistência e o objeto fica sem conhecer o banco.' },
    { q: 'O que caracteriza o Prisma?', a: 'Um esquema declarativo, um cliente tipado gerado a partir dele, migrações e resultados como objetos simples.' },
    { q: 'Qual o principal risco de usar ORM sem entender o SQL?', a: 'Consultas ineficientes escondidas, como o N+1, e a incapacidade de diagnosticá-las.' },
    { q: 'Quando preferir SQL a um ORM?', a: 'Em consultas analíticas ou de desempenho crítico, que o ORM expressa mal.' }
  ]
},
{
  id: 'orm-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['Prisma', 'schema.prisma', 'migrações', 'prisma generate', 'adapter-pg', 'prisma.config.ts'],
  title: 'Prisma I: o schema, as migrações e o cliente gerado',
  objectives: ['Escrever um §schema.prisma§ com modelos, relações, índices, restrições e valores padrão', 'Configurar o Prisma 7 (§prisma.config.ts§, gerador §prisma-client§ e adaptador §@prisma/adapter-pg§)', 'Gerar e aplicar migrações (§migrate dev§) e ler o SQL produzido', 'Gerar o cliente tipado e instanciá-lo com um adaptador', 'Entender o fluxo de migrações em desenvolvimento e em produção'],
  intro: R`O **Prisma** parte de uma ideia: **o esquema é a fonte da verdade**. Você descreve os modelos em um arquivo, e a ferramenta **gera as migrações SQL**, **aplica** no banco e **gera o cliente tipado**. Esta aula usa o **Prisma 7.10.1** com PostgreSQL 17.12 (tudo executado) e mostra o **formato novo** do Prisma 7 (arquivo de configuração, gerador novo e adaptadores de driver), que difere das versões anteriores.`,
  theory: R`### O esquema (§schema.prisma§)
Três blocos: §generator§ (o que gerar), §datasource§ (o banco) e os **modelos**. O esquema do laboratório:
§§§
generator client {
  provider        = "prisma-client"
  output          = "../generated"
  previewFeatures = ["relationJoins"]
}
datasource db { provider = "postgresql" }

model Cliente {
  id      Int      @id @default(autoincrement())
  nome    String
  email   String   @unique
  pedidos Pedido[]
}
model Pedido {
  id        Int          @id @default(autoincrement())
  cliente   Cliente      @relation(fields: [clienteId], references: [id])
  clienteId Int
  status    String       @default("aberto")
  criadoEm  DateTime     @default(now())
  itens     ItemPedido[]
  @@index([clienteId])
}
model ItemPedido {
  pedido     Pedido  @relation(fields: [pedidoId], references: [id], onDelete: Cascade)
  pedidoId   Int
  produto    Produto @relation(fields: [produtoId], references: [id])
  produtoId  Int
  quantidade Int
  @@id([pedidoId, produtoId])
}
§§§
Elementos: **atributos de campo** (§@id§, §@unique§, §@default(...)§, §@db.Decimal(10, 2)§), **atributos de modelo** (§@@id([...])§ para chave composta, §@@index§, §@@unique§), **tipos** (§Int§, §String§, §DateTime§, §Decimal§, §Json§, §Boolean§, enums) e **relações** (§@relation(fields, references, onDelete)§). Relações **1:N**: o lado "muitos" tem o campo da chave estrangeira (§clienteId§) e o lado "um" tem a lista (§pedidos Pedido[]§). **N:N** pode ser explícita (um modelo de ligação, como §ItemPedido§, com atributos) ou implícita. §prisma validate§ confere o esquema (medido: "valid").

### Prisma 7: o que mudou
- A **URL do banco** sai do esquema e vai para o **§prisma.config.ts§**: §defineConfig({ schema: 'prisma/schema.prisma', datasource: { url: env('DATABASE_URL') }, migrations: { path: 'prisma/migrations' } })§ (medido: "Loaded Prisma config from prisma.config.ts").
- O gerador é **§prisma-client§** (novo) com §output§ **obrigatório**: o cliente é gerado **como código TypeScript no seu projeto** (medido: pasta §generated/§ com §client.ts§, §models/§...), e não mais em §node_modules§.
- O cliente usa **adaptador de driver**: §new PrismaClient({ adapter: new PrismaPg({ connectionString }) })§; sem o motor de consulta em Rust, a ferramenta usa um compilador em WebAssembly.
- O comando §prisma generate§ **precisa ser executado** depois de mudar o esquema (medido: a pasta §generated§ **não existia** após a primeira migração e foi criada por §prisma generate§).
- O pacote com a tag §latest§ do §prisma§ apontava, na data deste curso (2026-11-25), para uma **versão candidata** da série 8 (§8.0.0-rc.35§), com a versão estável do cliente em 7.10.1; **fixe as versões** (§prisma@7.10.1§ e §@prisma/client@7.10.1§) e leia as notas de versão antes de atualizar.

### Migrações: o fluxo
1. Edite o §schema.prisma§.
2. **§prisma migrate dev --name nome§** (desenvolvimento): compara o esquema com o histórico de migrações e o banco, **gera um arquivo SQL** em §prisma/migrations/AAAAMMDDHHMMSS_nome/migration.sql§, **aplica** no banco de desenvolvimento e registra em uma tabela interna (§_prisma_migrations§). Medido: gerou §20261125123154_inicial§ com os comandos abaixo.
3. **Revise o SQL** gerado (**sempre**) antes de confirmar no controle de versão.
4. **§prisma migrate deploy§** (produção/CI): **apenas aplica** as migrações pendentes, sem gerar nem apagar nada (documentação; **não executado** aqui).
5. Outros: §migrate status§ (situação), §migrate reset§ (**apaga e recria** o banco de desenvolvimento), §db push§ (sincroniza **sem** migração: só para protótipos), §migrate diff§ (compara).
O SQL medido da migração inicial (trechos): §CREATE TABLE "Cliente" ("id" SERIAL NOT NULL, "nome" TEXT NOT NULL, "email" TEXT NOT NULL, CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id"))§; §CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email")§; §CREATE INDEX "Pedido_clienteId_idx" ON "Pedido"("clienteId")§; §ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ... ON DELETE RESTRICT ON UPDATE CASCADE§; §ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" ... ON DELETE CASCADE ...§.
**Observações do SQL:** as chaves estrangeiras usam §RESTRICT§ por padrão (aula mod-03); os nomes são **sensíveis a maiúsculas** e com **aspas** ("Cliente"): em SQL cru você precisa citar assim (ou usar §@@map§/§@map§ para nomes minúsculos). A coluna §Decimal§ vira §DECIMAL(10,2)§. O índice na chave estrangeira (§Pedido_clienteId_idx§) veio do §@@index§ **que declaramos**: **o Prisma não cria esse índice sozinho** em PostgreSQL.

### Alterações de esquema e perda de dados
A migração gerada para uma mudança destrutiva (remover coluna, trocar tipo) pode **apagar dados**: o Prisma **avisa**, mas **a revisão é sua**. Para renomear sem perder dados, edite o SQL gerado (§ALTER TABLE ... RENAME COLUMN§) antes de aplicar, ou use o padrão **expandir e contrair** (aula mod-05). Migrações são **imutáveis depois de aplicadas** em outros ambientes: crie uma nova para corrigir.

### O cliente
§const prisma = new PrismaClient({ adapter })§ (uma **única instância** por processo; em ambientes de recarga a quente, reaproveite a instância). §await prisma.$disconnect()§ ao encerrar. As operações têm **tipos inferidos** do esquema: um campo que não existe é **erro de compilação**. Aula orm-03 detalha as consultas.

### Boas práticas de esquema
- Declare **índices** nas colunas de filtro e nas chaves estrangeiras (§@@index§).
- Use **§onDelete§** explícito (aula mod-03).
- Prefira **enums** do Prisma ou tabelas de domínio para valores controlados.
- Use §@map§ e §@@map§ para nomes de colunas e tabelas **no padrão do banco** (minúsculas com sublinhado) se o time escrever SQL.
- Mantenha **migrações pequenas** e **revisadas**.`,
  concepts: [
    { term: 'schema.prisma', def: 'Arquivo declarativo com o gerador, a fonte de dados e os modelos do Prisma.' },
    { term: 'prisma.config.ts', def: 'Arquivo do Prisma 7 que configura o esquema, a URL do banco e o caminho das migrações.' },
    { term: 'Cliente gerado', def: 'Código TypeScript tipado criado por prisma generate a partir do esquema.' },
    { term: 'Adaptador de driver', def: 'Camada (como @prisma/adapter-pg) que liga o cliente do Prisma ao driver do banco.' },
    { term: 'prisma migrate dev', def: 'Comando que gera e aplica migrações no banco de desenvolvimento a partir do esquema.' },
    { term: 'prisma migrate deploy', def: 'Comando que apenas aplica as migrações pendentes, usado em produção e CI.' },
    { term: 'Tabela _prisma_migrations', def: 'Tabela interna que registra as migrações aplicadas.' },
    { term: '@relation', def: 'Atributo que declara uma relação entre modelos e a ação referencial.' },
    { term: '@@index', def: 'Atributo de modelo que cria um índice sobre colunas.' },
    { term: 'db push', def: 'Comando que sincroniza o banco com o esquema sem gerar migrações, indicado só para protótipos.' }
  ],
  examples: R`**Analogia:** o schema.prisma é a **planta** da casa; a migração é o **registro de obras** (cada alteração datada e imutável, com a lista exata de comandos); o cliente gerado é o **manual de uso** da casa, escrito automaticamente a partir da planta (se você tentar usar um cômodo que não existe, o manual já avisa). O prisma migrate deploy é o **pedreiro de produção**: só executa as obras já aprovadas.

**Exemplo 1: do esquema ao SQL.** Quatro modelos viram quatro tabelas, um índice único, um índice de chave estrangeira e três chaves estrangeiras com RESTRICT/CASCADE.

**Exemplo 2: Prisma 7.** A pasta generated/ só apareceu depois do prisma generate.

**Exemplo 3: nomes.** As tabelas se chamam "Cliente" e "Pedido" (com aspas); em SQL cru é preciso citá-las.`,
  code: [
    { title: 'Configuração do Prisma 7 e do cliente (TypeScript)', lang: 'ts', code: R`// prisma.config.ts
import { defineConfig, env } from 'prisma/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: env('DATABASE_URL') },
  migrations: { path: 'prisma/migrations' }
});

// uso do cliente gerado (generated/client.ts)
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client.ts';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });   // uma única instância por processo

// comandos (shell)
//   npx prisma validate
//   npx prisma migrate dev --name inicial     # gera e aplica prisma/migrations/<timestamp>_inicial/migration.sql
//   npx prisma generate                       # gera ./generated (obrigatório após mudar o schema)`, notes: [{ l: '4', t: 'No Prisma 7 a URL do banco fica no arquivo de configuração.' }, { l: '12', t: 'O adaptador liga o cliente ao driver pg.' }, { l: '13', t: 'Reutilize a instância: cada uma abre seu pool de conexões.' }] },
    { title: 'SQL da migração inicial (trechos, gerado pelo Prisma 7.10.1)', lang: 'sql', code: R`CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ItemPedido" (
    "pedidoId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("pedidoId","produtoId")
);
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");
CREATE INDEX "Pedido_clienteId_idx" ON "Pedido"("clienteId");
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;`, notes: [{ l: '5', t: 'O padrão do Prisma para @id é SERIAL com chave primária nomeada.' }, { l: '11', t: 'A chave composta do @@id vira PRIMARY KEY de duas colunas.' }, { l: '14', t: 'O índice na chave estrangeira existe porque o declaramos com @@index.' }, { l: '15', t: 'RESTRICT é o padrão para a relação obrigatória; CASCADE foi pedido no esquema.' }] }
  ],
  bestPractices: ['Fixe as versões de prisma e @prisma/client e leia as notas antes de atualizar.', 'Revise sempre o SQL de cada migração antes de versioná-la.', 'Use migrate dev em desenvolvimento e migrate deploy em produção e CI.', 'Declare @@index nas chaves estrangeiras e colunas de filtro.', 'Use uma única instância do cliente por processo.', 'Prefira nomes mapeados (@map) se houver SQL escrito à mão.'],
  mistakes: ['Esquecer de rodar prisma generate depois de alterar o esquema.', 'Usar db push ou migrate reset em produção.', 'Editar uma migração já aplicada em outro ambiente.', 'Confiar que o Prisma cria índices nas chaves estrangeiras.', 'Criar várias instâncias do cliente e esgotar conexões.', 'Aplicar uma migração destrutiva sem revisar o SQL.'],
  market: R`O Prisma é muito usado em projetos Node.js e TypeScript, e dominar o fluxo schema, migração e cliente gerado é requisito de muitas vagas. Atenção às mudanças de versão (como o formato do Prisma 7): saber ler as notas e fixar versões evita quebras.`,
  summary: R`O §schema.prisma§ declara modelos, relações e índices; no Prisma 7, a URL fica em §prisma.config.ts§, o gerador §prisma-client§ exige §output§ e o cliente usa um adaptador (§@prisma/adapter-pg§). §migrate dev§ gerou a migração §inicial§ (quatro tabelas, um índice único, um índice de chave estrangeira e três FKs) e §prisma generate§ criou o cliente. Em produção use §migrate deploy§. Revise o SQL, fixe as versões (a tag latest do prisma apontava para um candidato 8.0.0-rc.35) e declare os índices.`,
  refs: [REF.prismaSchema, REF.prismaMigrate, REF.prismaRelations, REF.prismaConfig, REF.prismaClient],
  cards: [
    { q: 'Onde fica a URL do banco no Prisma 7?', a: 'No arquivo prisma.config.ts (datasource.url), e não mais no schema.prisma.' },
    { q: 'Para que serve prisma generate?', a: 'Gerar o cliente tipado (código TypeScript) a partir do esquema; deve ser rodado depois de mudar o schema.' },
    { q: 'Qual a diferença entre migrate dev e migrate deploy?', a: 'migrate dev gera e aplica migrações em desenvolvimento; migrate deploy só aplica as pendentes em produção e CI.' },
    { q: 'O Prisma cria índice nas chaves estrangeiras?', a: 'No PostgreSQL, não: declare @@index nas colunas de chave estrangeira.' },
    { q: 'Por que revisar o SQL das migrações?', a: 'Para evitar perda de dados e comandos inesperados antes de versionar e aplicar.' }
  ]
}
];
