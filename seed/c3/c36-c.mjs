// C3.6 — ORMs: Prisma e TypeORM. Aulas 5 e 6 (N+1 e desempenho; ORM x SQL puro e projeto).
import { REF } from './c36-a.mjs';
const R = String.raw;

export const REF3 = {
  prismaPerf: { title: 'Prisma — Query optimization and performance', url: 'https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance', kind: 'doc' },
  prismaLogging: { title: 'Prisma — Logging', url: 'https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging', kind: 'doc' },
  pgExplain: { title: 'PostgreSQL 17 — Using EXPLAIN', url: 'https://www.postgresql.org/docs/17/using-explain.html', kind: 'doc' },
  pgCopy: { title: 'PostgreSQL 17 — COPY', url: 'https://www.postgresql.org/docs/17/sql-copy.html', kind: 'doc' },
  pgUnnest: { title: 'PostgreSQL 17 — Array Functions (unnest)', url: 'https://www.postgresql.org/docs/17/functions-array.html', kind: 'doc' },
  nodePg: { title: 'node-postgres — documentação', url: 'https://node-postgres.com/', kind: 'doc' },
  kysely: { title: 'Kysely — query builder tipado', url: 'https://kysely.dev/', kind: 'doc' },
  typeormLogging: { title: 'TypeORM — Logging', url: 'https://typeorm.io/docs/advanced-topics/logging', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'orm-05', moduleId: 'm3', order: 5, minutes: 85, tags: ['N+1', 'carga de relações', 'join', 'select', 'lote', 'índices', 'desempenho'],
  title: 'O problema N+1 e o desempenho com ORMs: medir, entender e corrigir',
  objectives: ['Reconhecer e contar o problema N+1 em Prisma e TypeORM', 'Comparar estratégias de carga de relações (join, consultas separadas, agregação no banco) com medições', 'Escolher entre uma consulta grande e várias pequenas conforme o volume e os índices', 'Aplicar correções (carregar relações, select enxuto, lotes, índices) e medir o efeito', 'Montar uma rotina de detecção (log de consultas, contagem por requisição, testes)'],
  intro: R`O **N+1** é o defeito de desempenho mais famoso dos ORMs: para listar **N** itens e suas relações, o código executa **1** consulta para a lista e **N** para as relações. Funciona com poucos dados e **desaba** com muitos. Esta aula **mede** o problema no Prisma 7.10.1 e no TypeORM 1.1.3 (PostgreSQL 17.12), mostra as correções e uma **surpresa honesta**: **mais consultas nem sempre é pior**, e **uma consulta só nem sempre é melhor**. A regra é: **conte, meça e entenda**.`,
  theory: R`### Como o N+1 nasce
§§§
const clientes = await prisma.cliente.findMany();            // 1 consulta
for (const c of clientes) {
  const pedidos = await prisma.pedido.findMany({ where: { clienteId: c.id } });   // N consultas
}
§§§
Em ORMs com **carga preguiçosa** (*lazy loading*), basta **acessar** §cliente.pedidos§ dentro do laço para que a consulta seja disparada **sem aparecer no código**. Em templates e serializadores, isso fica ainda mais escondido.
Medido (100 clientes, 500 pedidos, 1.500 itens):
| Prisma | consultas | mediana |
|---|---|---|
| N+1 em laço | **101** | **~225 ms** |
| §include§, estratégia §'query'§ | **2** | **~14 ms** |
| §include§ com §relationLoadStrategy: 'join'§ (e padrão com §relationJoins§) | **1** | **~17 ms** |
| §groupBy§ (contagem por cliente, no banco) | **1** | **~4 ms** |
| §select§ só de §id§ e §nome§ | **1** | **~3 ms** |
| TypeORM | consultas | mediana |
|---|---|---|
| N+1 em laço | **101** | **~241 ms** |
| §relations§ (join, padrão) | **1** | **~12 ms** |
| §relationLoadStrategy: 'query'§ | **3** | **~261 ms** |
| QueryBuilder com §groupBy§ | **1** | **~2,4 ms** |
O custo do N+1 vem de **cada ida ao banco** (rede, análise, planejamento): mesmo consultas rápidas somam. Com a rede de **outro servidor** (milissegundos por consulta), o efeito é **muito maior** do que no laboratório local (onde cada ida custa ~2 ms).

### Corrigindo: carregar as relações em lote
- **Prisma**: §include§ ou §select§ aninhado. As relações são buscadas **de uma vez** (join ou §IN (...)§).
- **TypeORM**: §relations§/§leftJoinAndSelect§, ou §find§ com §where: { id: In(ids) }§.
- **Em qualquer ORM**: busque os filhos de todos os pais com **uma consulta** (§WHERE pai_id IN (...)§) e **agrupe em memória** (padrão *DataLoader*).
- **Agregações**: se você só precisa de **contagens ou somas**, peça **ao banco** (§_count§, §groupBy§, §aggregate§, QueryBuilder), em vez de carregar linhas.

### A surpresa: mais consultas nem sempre é pior
Medido no Prisma com **quatro níveis** (clientes → pedidos → itens → produto):
- estratégia §'join'§ (**1** consulta): mediana **~142 a 145 ms**;
- estratégia §'query'§ (**4** consultas): mediana **~61 a 65 ms**.
Por quê? Um join de vários níveis **multiplica linhas** (cada cliente × pedidos × itens) e ainda faz **agregações JSON** no banco e **desserialização** no cliente; quatro consultas pequenas e indexadas, **sem repetição de dados**, podem ser **mais baratas**. E no TypeORM, a mesma ideia ao contrário: a estratégia **'query'** deu **3 consultas** e **~261 ms** (por motivo **não investigado**). **Conclusão: não adivinhe; meça com seus dados e índices** (plano de execução: aula pgm-06).

### Paginar relações
No TypeORM, §take§/§skip§ com §relations§ geram **2 consultas** (uma §DISTINCT§ de ids e outra de dados) para paginar corretamente. No Prisma, §take§ no modelo raiz é simples; limitar **relações** (§pedidos: { take: 5 }§) pode gerar consultas mais complexas. Para listas grandes, **pagine a raiz** e carregue as relações **só para a página**.

### Outras fontes de lentidão em ORMs
1. **§SELECT *§ implícito**: traga **só os campos necessários** (§select§). Medido: §select§ de duas colunas ~3 ms contra ~15 a 18 ms de §include§.
2. **Agregar no JavaScript**: medido, calcular os totais por cliente com §include§ aninhado e soma em JS levou **~94 ms**; com §_count§ ou SQL agregado, **~7 a 8 ms** (cerca de **12 vezes** mais rápido).
3. **Escritas em laço**: medido, **1.000 §create§ em laço**: **~3,1 s**; **§createMany§**: **~217 ms** (~14 vezes); **SQL com §unnest§**: **~37 ms** (~85 vezes mais rápido que o laço). Para cargas grandes, use §COPY§ ou lotes.
4. **Falta de índice** na chave estrangeira (aula pgm-04): os ORMs **não** criam em PostgreSQL; sem ele, o join e o §DELETE§ do pai varrem a tabela.
5. **Pool de conexões** pequeno ou grande demais; conexões demais derrubam o PostgreSQL (aula pgm-07). Reaproveite o cliente.
6. **Transações longas** abertas por laços de ORM (aula trx-06).
7. **Serialização**: carregar objetos enormes e serializá-los para JSON custa CPU; devolva **DTOs enxutos**.

### Como detectar
- **Log de consultas**: Prisma (§log: [{ emit: 'event', level: 'query' }]§ e §$on('query', ...)§), TypeORM (§logging: ['query']§ ou um §logger§ próprio, como nos experimentos).
- **Contagem por requisição**: um contador no *middleware* que registra "esta requisição executou X consultas"; **alerte** acima de um limite (por exemplo, 20).
- **Testes**: um teste que executa o caso de uso e **afirma o número de consultas** (§expect(consultas).toBeLessThan(5)§) com dados de **tamanho realista** (o N+1 só aparece com N grande); o teste de integração do projeto faz isso.
- **APM e §pg_stat_statements§** (aula pgm-07): consultas **repetidas milhares de vezes** com parâmetros diferentes são o rastro do N+1.
- **EXPLAIN** das consultas geradas (aula pgm-06).

### Roteiro de otimização em ORMs
1. Meça (contagem de consultas e tempo) o caso de uso.
2. Veja o SQL gerado.
3. Corrija o N+1 (carga de relações em lote, agregação).
4. Reduza as colunas (§select§).
5. Verifique **índices** nas chaves estrangeiras e filtros.
6. Compare **estratégias de carga** com medição.
7. Para o que continuar caro, use **SQL cru** (aula orm-06).
8. Registre o resultado (um teste de contagem de consultas protege contra regressões).`,
  concepts: [
    { term: 'Problema N+1', def: 'Padrão em que uma consulta para a lista é seguida de uma consulta por item para suas relações.' },
    { term: 'Carga preguiçosa (lazy loading)', def: 'Carregamento de uma relação apenas quando é acessada, podendo disparar consultas escondidas.' },
    { term: 'Carga antecipada (eager loading)', def: 'Carregamento das relações junto com a consulta principal.' },
    { term: 'DataLoader', def: 'Padrão que agrupa várias buscas por id em uma única consulta em lote.' },
    { term: 'Estratégia de join', def: 'Carregar relações com uma só consulta que une as tabelas.' },
    { term: 'Estratégia de consultas separadas', def: 'Carregar cada relação com uma consulta própria e juntar em memória.' },
    { term: 'Explosão de linhas', def: 'Crescimento do número de linhas de um join com várias relações um-para-muitos.' },
    { term: 'createMany', def: 'Operação que insere várias linhas em um único comando.' },
    { term: 'DTO', def: 'Objeto de transferência de dados, com apenas os campos necessários para uma resposta.' },
    { term: 'Contagem de consultas por requisição', def: 'Métrica que registra quantas consultas uma requisição executou, para detectar N+1.' }
  ],
  examples: R`**Analogia:** o N+1 é **ir ao supermercado uma vez para cada item da lista**: cada viagem é rápida, mas 101 viagens somam horas. O **include** é **fazer uma lista única e comprar tudo em uma ida**. A surpresa é que **uma única viagem com um carrinho gigante** (um join de quatro níveis) pode ser **mais lenta** que **quatro viagens curtas**, porque o carrinho precisa ser organizado e carregado: o que vale é **cronometrar**. O agrupamento no banco é **pedir ao mercado que só diga quantos itens há**, sem trazer os itens.

**Exemplo 1: contagem.** 101 consultas e ~225 ms contra 1 a 2 consultas e ~15 ms.

**Exemplo 2: join profundo.** 1 consulta de ~142 ms contra 4 consultas de ~61 ms.

**Exemplo 3: lote.** 1.000 inserções: ~3,1 s em laço, ~217 ms em lote e ~37 ms com unnest.`,
  code: [
    { title: 'Detectando e corrigindo N+1 no Prisma (TypeScript, resultado medido)', lang: 'ts', code: R`const consultas: string[] = [];
const prisma = new PrismaClient({ adapter, log: [{ emit: 'event', level: 'query' }] });
(prisma as any).$on('query', (e: any) => consultas.push(e.query));

// N+1: 101 consultas (~225 ms)
const clientes = await prisma.cliente.findMany();
for (const c of clientes) await prisma.pedido.findMany({ where: { clienteId: c.id } });
console.log('consultas:', consultas.length);

// corrigido: relação carregada junto (1 a 2 consultas, ~15 ms)
consultas.length = 0;
await prisma.cliente.findMany({ include: { pedidos: true } });

// só contagens: agregue no banco (1 consulta, ~4 ms)
await prisma.pedido.groupBy({ by: ['clienteId'], _count: { _all: true } });

// só o necessário (1 consulta, ~3 ms)
await prisma.cliente.findMany({ select: { id: true, nome: true } });`, notes: [{ l: '2', t: 'O log em evento permite contar cada SQL.' }, { l: '6', t: 'Uma consulta por cliente: o N+1.' }, { l: '14', t: 'A agregação roda no banco, sem trazer as linhas.' }] },
    { title: 'Teste que protege contra N+1 (TypeScript, Vitest)', lang: 'ts', code: R`import { test, expect } from 'vitest';

test('listagem de clientes com pedidos faz poucas consultas', async () => {
  await semearDados({ clientes: 100, pedidosPorCliente: 5 });     // volume realista: o N+1 só aparece com N grande
  const consultas: string[] = [];
  const prisma = criarClienteComLog((q) => consultas.push(q));
  const resultado = await casoDeUsoListarClientesComPedidos(prisma);
  expect(resultado).toHaveLength(100);
  expect(consultas.length).toBeLessThanOrEqual(3);                // 1 a 2 consultas esperadas; 101 seria N+1
});`, notes: [{ l: '4', t: 'Sem dados em volume, o N+1 passa despercebido.' }, { l: '9', t: 'Afirmar o número de consultas transforma o desempenho em critério de aceitação.' }] }
  ],
  bestPractices: ['Conte as consultas de cada caso de uso e alerte acima de um limite.', 'Carregue relações em lote e agregue no banco.', 'Use select para trazer só os campos necessários e DTOs enxutos.', 'Meça estratégias de carga com seus dados em vez de supor.', 'Prefira createMany, lotes ou SQL com unnest a laços de inserção.', 'Escreva testes de contagem de consultas com volume realista.'],
  mistakes: ['Acessar relações em laços sem saber que isso dispara consultas.', 'Assumir que uma consulta única é sempre mais rápida.', 'Somar e contar no JavaScript o que o banco faz melhor.', 'Inserir milhares de linhas com create em laço.', 'Testar só com poucos dados e não ver o N+1.', 'Esquecer o índice na chave estrangeira.'],
  market: R`O N+1 é o problema de desempenho que mais derruba APIs com ORM em produção e é pergunta certa em entrevistas de backend. Saber medir (contagem e tempo), corrigir e escrever um teste que o impede de voltar é uma prática de nível pleno.`,
  summary: R`O N+1 executa 1 consulta para a lista e N para as relações. Medido (100 clientes, 500 pedidos): Prisma em laço = 101 consultas (~225 ms); com relação carregada, 1 a 2 (~15 ms); §groupBy§, 1 (~4 ms). TypeORM em laço = 101 (~241 ms); relations em join, 1 (~12 ms); estratégia query, 3 (~261 ms). Surpresa: um include de 4 níveis em 1 consulta (~142 ms) foi mais lento que 4 consultas (~61 ms): meça. Escritas em lote (217 ms e 37 ms) superam o laço (3,1 s). Detecte com logs, contadores e testes.`,
  refs: [REF3.prismaPerf, REF3.prismaLogging, REF3.typeormLogging, REF3.pgExplain, REF3.pgUnnest],
  cards: [
    { q: 'O que é o problema N+1?', a: '1 consulta para a lista e N consultas, uma por item, para suas relações.' },
    { q: 'Como corrigir o N+1?', a: 'Carregar as relações em lote (include/relations/IN), agregar no banco e carregar só o necessário.' },
    { q: 'Uma consulta única com join é sempre mais rápida que várias consultas?', a: 'Não: joins de vários níveis multiplicam linhas; medido, 4 consultas (~61 ms) venceram 1 join profundo (~142 ms).' },
    { q: 'Como detectar N+1 antes da produção?', a: 'Com log de consultas, contagem por requisição e testes que afirmam o número de consultas com dados realistas.' },
    { q: 'Por que inserções em laço são lentas?', a: 'Cada comando é uma ida ao banco; lotes (createMany, unnest) reduzem o custo drasticamente.' }
  ]
},
{
  id: 'orm-06', moduleId: 'm3', order: 6, minutes: 80, tags: ['ORM vs SQL', 'SQL cru', 'query builder', 'portabilidade', 'testes', 'decisão', 'projeto'],
  title: 'ORM ou SQL puro: critérios de decisão, abordagem híbrida e o projeto integrador',
  objectives: ['Comparar ORM, construtor de consultas e SQL puro com medições de leitura e escrita', 'Aplicar critérios de decisão (complexidade, desempenho, tipos, equipe, portabilidade)', 'Adotar uma abordagem híbrida com camadas de acesso e testes', 'Manter migrações, segurança e testes consistentes nos dois estilos', 'Executar o projeto integrador: uma API de catálogo com o ORM e o SQL cru, com medições'],
  intro: R`"ORM ou SQL?" não tem resposta única: tem **critérios**. Esta aula compara as abordagens com **medições** (Prisma 7.10.1, TypeORM 1.1.3 e o driver §pg§ 8.23.1, PostgreSQL 17.12), discute **portabilidade, testes e equipe** e encerra com a **abordagem híbrida** que a maioria dos sistemas maduros adota: **ORM para o comum, SQL para o crítico**, sempre **medido**.`,
  theory: R`### Medições: leitura
Tarefa: para cada cliente, **contagem de pedidos e total de itens** (100 clientes, 500 pedidos, 1.500 itens). Medianas (7 repetições após aquecimento):
| Abordagem | mediana |
|---|---|
| Prisma: §include§ aninhado e **soma no JavaScript** | **~94 ms** |
| Prisma: §_count§ de pedidos (sem itens) | **~7 ms** |
| Prisma: §$queryRaw§ com §GROUP BY§ | **~8 ms** |
| §pg§ (driver puro) com o mesmo SQL | **~7 ms** |
**Leitura dos números**: a diferença **não é "ORM x SQL"**: é **onde o trabalho acontece**. O ORM com §_count§ ou o SQL cru, que **agregam no banco**, são **12 vezes mais rápidos** que carregar objetos e somar em JavaScript. O custo extra do cliente do ORM sobre o driver puro, quando a consulta é a mesma, foi **pequeno** (~7 a 8 ms), neste volume.

### Medições: escrita
Inserir **1.000 clientes**:
| Abordagem | mediana |
|---|---|
| Prisma: §create§ em **laço** (1.000 comandos) | **~3.141 ms** |
| Prisma: §createMany§ (1 comando) | **~217 ms** |
| §pg§: §INSERT ... SELECT * FROM unnest($1::text[], $2::text[])§ | **~37 ms** |
O **ORM em lote** já resolve a maior parte; o **SQL com §unnest§** (ou §COPY§) é a ferramenta para **cargas grandes**. **Padrão profissional:** operações em lote **sempre**.

### Critérios de decisão
| Critério | Favorece o ORM | Favorece SQL (puro ou construtor) |
|---|---|---|
| Operações | CRUD, relações simples, validação | Janelas, CTEs, agregações complexas, relatórios, JSON, recursão |
| Desempenho | Casos comuns, sem pressão | Caminhos críticos, cargas em massa, consultas pesadas |
| Tipos e segurança | Tipos gerados, menos erros de coluna | Tipagem por ferramentas (Kysely, PgTyped) ou testes |
| Equipe | Mistura de níveis, rotatividade | Equipe forte em SQL |
| Portabilidade | Trocar de banco com poucas mudanças | Uso de recursos específicos (aulas sqa e pgm) |
| Migrações | Versionadas pelo ORM | Ferramentas dedicadas (Flyway, Liquibase, dbmate...) |
| Teste | Fixtures e fábricas | Consultas testadas em banco real |

### A abordagem híbrida
1. **Camada de acesso a dados** (repositórios): a aplicação chama §pedidos.listarPorCliente(id)§; **dentro** da função, use o **ORM** ou **SQL cru**. A escolha fica **escondida e substituível**.
2. **ORM para o CRUD e relações simples**; **SQL cru parametrizado** para relatórios, agregações e caminhos críticos; **views** (aula sqa-03) e **funções** podem esconder complexidade no banco.
3. **Testes de integração** contra um banco real (contêiner), cobrindo **ambas** as formas.
4. **Migrações** em **uma só ferramenta** (a do ORM ou uma dedicada), **uma fonte da verdade** do esquema; evite alterar o banco por fora.
5. **Segurança**: parâmetros **sempre** (aula orm-03), listas de permissão para identificadores (aula sqe-09).
6. **Observabilidade**: log e **contagem de consultas**, tempo por consulta, **§pg_stat_statements§**.

### Construtores de consultas e SQL tipado
Entre o ORM e o SQL puro: **Kysely** e **Knex** (construtores), **Drizzle** (esquema e consultas em TypeScript próximas do SQL) e ferramentas de **SQL tipado**, que **verificam o SQL escrito à mão** contra o esquema. São boas opções quando a equipe **quer SQL, com tipos** (Kysely, Drizzle e demais **não foram executados** neste curso).

### Portabilidade: a promessa e a realidade
ORMs reduzem diferenças **de sintaxe**, mas **não escondem** as de **comportamento** (aula pgm-03): isolamento padrão, comparação de texto, tipos, ordenação de NULL. Trocar de banco com um ORM **ainda exige testes** e, muitas vezes, SQL cru específico. Planeje a portabilidade **só se for requisito real**.

### Testes
- **Unidade** da lógica de negócio **sem** banco (repositórios simulados).
- **Integração** do repositório com um **banco real** descartável (contêiner, banco por teste ou transação desfeita).
- **Contagem de consultas** (aula orm-05).
- **Migrações**: aplique todas em um banco vazio e compare com o esquema esperado.
- **Dados de teste** realistas (volume) para os casos de desempenho.

### Quando abandonar o ORM em um ponto específico
Sinais: o SQL gerado é **grotesco**; você escreve **gambiarras** para forçar um JOIN; os **tempos** não atendem mesmo após as correções; o recurso do banco que você precisa (janela, CTE, JSONB, FTS) **não existe** no ORM; o código fica **mais difícil** de ler do que o SQL. Nesse ponto, **escreva o SQL**, **teste-o**, **documente-o** e **encapsule-o**.

### Projeto integrador: API de catálogo com ORM e SQL cru
Construa uma **API de catálogo** (produtos, categorias, pedidos) em Node.js e PostgreSQL com: **esquema e migrações** (Prisma, com um módulo equivalente em TypeORM como exercício opcional), **CRUD** com o ORM, **três relatórios** em SQL cru parametrizado (janela, CTE, agregação), **paginação por cursor**, **tratamento de erros** (P2002/P2003/P2025) como respostas HTTP, **transações** nos pedidos (com repetição para 40001/40P01), **teste de contagem de consultas**, **medições** de leitura e escrita (laço x lote) e um **ADR** com a decisão "ORM x SQL" para cada caso de uso.`,
  concepts: [
    { term: 'Abordagem híbrida', def: 'Uso do ORM para o comum e de SQL para os casos complexos ou críticos, atrás de uma camada de acesso.' },
    { term: 'Camada de acesso a dados', def: 'Módulo (repositórios) que isola a aplicação da forma como os dados são lidos e gravados.' },
    { term: 'Repositório', def: 'Objeto que oferece operações de persistência de um conceito de domínio.' },
    { term: 'Kysely e Knex', def: 'Construtores de consultas que montam SQL por encadeamento de funções.' },
    { term: 'SQL tipado', def: 'Abordagem em que o SQL escrito à mão é verificado contra o esquema e gera tipos.' },
    { term: 'Teste de integração de repositório', def: 'Teste que exercita o acesso a dados contra um banco real.' },
    { term: 'COPY', def: 'Comando do PostgreSQL para carga em massa muito rápida.' },
    { term: 'unnest', def: 'Função que transforma arrays em linhas, útil para inserções em lote com parâmetros.' },
    { term: 'ADR', def: 'Registro de decisão de arquitetura.' },
    { term: 'Portabilidade de banco', def: 'Capacidade de trocar de banco com poucas mudanças no código.' }
  ],
  examples: R`**Analogia:** o ORM é um **carro automático**: ótimo na cidade (CRUD do dia a dia). O SQL puro é o **câmbio manual**: mais controle na serra (relatórios e cargas pesadas), mas exige habilidade. O motorista experiente **usa os dois**: automático no trânsito, manual na estrada. O erro é **recusar um dos dois por princípio**. A camada de acesso é o **painel**: o passageiro (a regra de negócio) não precisa saber qual câmbio está engatado.

**Exemplo 1: leitura.** ~94 ms (include e soma em JavaScript) contra ~7 ms (_count) e ~8 ms (SQL cru).

**Exemplo 2: escrita.** ~3,1 s (laço), ~217 ms (createMany) e ~37 ms (unnest).

**Exemplo 3: híbrido.** CRUD com o ORM; relatório de janela em SQL cru, dentro do mesmo repositório.`,
  code: [
    { title: 'Repositório híbrido: ORM e SQL cru parametrizado (TypeScript)', lang: 'ts', code: R`export class PedidosRepositorio {
  constructor(private prisma: PrismaClient) {}

  // CRUD: ORM
  criar(clienteId: number) {
    return this.prisma.pedido.create({ data: { clienteId } });
  }

  // relatório com janela e CTE: SQL cru parametrizado
  async rankingDeClientes(limite: number) {
    return this.prisma.$queryRaw<{ id: number; pedidos: number; posicao: number }[]>§
      WITH totais AS (
        SELECT c.id, count(p.id)::int AS pedidos
        FROM "Cliente" c LEFT JOIN "Pedido" p ON p."clienteId" = c.id
        GROUP BY c.id
      )
      SELECT id, pedidos, rank() OVER (ORDER BY pedidos DESC)::int AS posicao
      FROM totais
      ORDER BY posicao, id
      LIMIT DOLAR{limite}§;
  }

  // carga em massa: SQL com unnest (1 comando, parâmetros)
  async importarClientes(lista: { nome: string; email: string }[]) {
    await this.prisma.$executeRaw§
      INSERT INTO "Cliente" (nome, email)
      SELECT * FROM unnest(DOLAR{lista.map((c) => c.nome)}::text[], DOLAR{lista.map((c) => c.email)}::text[])§;
  }
}`, notes: [{ l: '5', t: 'O CRUD simples fica com o ORM.' }, { l: '12', t: 'A janela e a CTE ficam em SQL, com tipos de retorno declarados.' }, { l: '21', t: 'O limite entra como parâmetro, não como texto.' }, { l: '26', t: 'unnest insere em lote com arrays como parâmetros.' }] },
    { title: 'Medição de leitura e escrita (TypeScript, saída medida)', lang: 'ts', code: R`// mediana de 7 execuções após aquecimento
await mediana('Prisma: include pedidos+itens, soma no JavaScript', () => prisma.cliente.findMany({ include: { pedidos: { include: { itens: true } } } }));   // ~94 ms
await mediana('Prisma: _count de pedidos', () => prisma.cliente.findMany({ select: { id: true, _count: { select: { pedidos: true } } } }));              // ~7 ms
await mediana('pg: GROUP BY em SQL', () => pool.query('SELECT c.id, count(DISTINCT p.id)::int ... GROUP BY c.id'));                                     // ~7 ms

await mediana('Prisma: create em laço (1.000)', async () => { for (const d of dados) await prisma.cliente.create({ data: d }); }, 3);                  // ~3141 ms
await mediana('Prisma: createMany', () => prisma.cliente.createMany({ data: dados }), 3);                                                               // ~217 ms
await mediana('pg: INSERT ... unnest', () => pool.query('INSERT INTO "Cliente" (nome, email) SELECT * FROM unnest($1::text[], $2::text[])', [nomes, emails]), 3);   // ~37 ms`, notes: [{ l: '1', t: 'Aquecimento e várias repetições reduzem o ruído de primeira execução.' }, { l: '2', t: 'O ganho vem de agregar no banco, não do SQL em si.' }, { l: '5', t: 'O lote reduz o número de idas ao banco.' }] }
  ],
  bestPractices: ['Agregue no banco, seja com ORM ou com SQL.', 'Isole o acesso a dados em repositórios para poder trocar a implementação.', 'Use SQL cru parametrizado para relatórios e caminhos críticos, com tipos declarados e testes.', 'Faça cargas em lote (createMany, unnest, COPY).', 'Teste os repositórios contra um banco real e proteja a contagem de consultas.', 'Registre em ADRs as decisões ORM x SQL por caso de uso.'],
  mistakes: ['Escolher "só ORM" ou "só SQL" por dogma.', 'Espalhar SQL cru pela aplicação sem camada de acesso nem testes.', 'Esperar portabilidade total entre bancos só por usar um ORM.', 'Comparar ORM e SQL sem medir o que está sendo comparado (onde o trabalho acontece).', 'Gerar o esquema por duas ferramentas diferentes.', 'Usar $queryRawUnsafe com entrada do usuário.'],
  market: R`Equipes maduras descrevem sua política como "ORM por padrão, SQL quando faz diferença, tudo medido". Mostrar um repositório híbrido, testado, com números de leitura e escrita é um forte sinal de senioridade em backend.`,
  summary: R`A comparação medida mostra que o que pesa é onde o trabalho acontece: incluir tudo e somar em JavaScript (~94 ms) foi ~12 vezes mais lento que §_count§ (~7 ms) ou SQL agregado (~8 ms), e o driver puro (~7 ms) quase não superou o ORM com a mesma consulta. Em escrita, create em laço (~3,1 s) contra createMany (~217 ms) e unnest (~37 ms). Decida por complexidade, desempenho, tipos, equipe e portabilidade; use uma abordagem híbrida com repositórios, migrações únicas, testes de integração e contagem de consultas.`,
  refs: [REF3.prismaPerf, REF3.nodePg, REF3.pgCopy, REF3.kysely, REF.ormHate],
  cards: [
    { q: 'O que explica a diferença de ~94 ms para ~7 ms na leitura medida?', a: 'Onde o trabalho acontece: carregar objetos e somar em JavaScript contra agregar no banco.' },
    { q: 'Qual o ganho de createMany e unnest sobre create em laço?', a: 'Medido para 1.000 linhas: ~3,1 s (laço), ~217 ms (createMany) e ~37 ms (unnest).' },
    { q: 'O que é a abordagem híbrida?', a: 'ORM para o comum e SQL cru parametrizado para o complexo ou crítico, atrás de uma camada de acesso testada.' },
    { q: 'Um ORM garante portabilidade entre bancos?', a: 'Só em parte: reduz diferenças de sintaxe, mas não as de comportamento (isolamento, comparação de texto, tipos).' },
    { q: 'Quando abandonar o ORM em um ponto específico?', a: 'Quando o SQL gerado é inadequado, o recurso do banco não existe no ORM ou o desempenho não atende mesmo após as correções.' }
  ]
}
];
