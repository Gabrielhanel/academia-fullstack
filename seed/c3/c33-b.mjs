// C3.3 — PostgreSQL e MySQL. Aulas 4 a 6 (índices B-tree; índices especializados; EXPLAIN ANALYZE).
const R = String.raw;

export const REF2 = {
  indexes: { title: 'PostgreSQL 17 — Indexes', url: 'https://www.postgresql.org/docs/17/indexes.html', kind: 'doc' },
  indexTypes: { title: 'PostgreSQL 17 — Index Types', url: 'https://www.postgresql.org/docs/17/indexes-types.html', kind: 'doc' },
  multicolumn: { title: 'PostgreSQL 17 — Multicolumn Indexes', url: 'https://www.postgresql.org/docs/17/indexes-multicolumn.html', kind: 'doc' },
  partial: { title: 'PostgreSQL 17 — Partial Indexes', url: 'https://www.postgresql.org/docs/17/indexes-partial.html', kind: 'doc' },
  indexOnly: { title: 'PostgreSQL 17 — Index-Only Scans and Covering Indexes', url: 'https://www.postgresql.org/docs/17/indexes-index-only-scans.html', kind: 'doc' },
  expressional: { title: 'PostgreSQL 17 — Indexes on Expressions', url: 'https://www.postgresql.org/docs/17/indexes-expressional.html', kind: 'doc' },
  mysqlIndexes: { title: 'MySQL 8.4 — Optimization and Indexes', url: 'https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html', kind: 'doc' },
  gin: { title: 'PostgreSQL 17 — GIN Indexes', url: 'https://www.postgresql.org/docs/17/gin.html', kind: 'doc' },
  gist: { title: 'PostgreSQL 17 — GiST Indexes', url: 'https://www.postgresql.org/docs/17/gist.html', kind: 'doc' },
  brin: { title: 'PostgreSQL 17 — BRIN Indexes', url: 'https://www.postgresql.org/docs/17/brin.html', kind: 'doc' },
  pgTrgm: { title: 'PostgreSQL 17 — pg_trgm', url: 'https://www.postgresql.org/docs/17/pgtrgm.html', kind: 'doc' },
  btreeGist: { title: 'PostgreSQL 17 — btree_gist', url: 'https://www.postgresql.org/docs/17/btree-gist.html', kind: 'doc' },
  rangeTypes: { title: 'PostgreSQL 17 — Range Types', url: 'https://www.postgresql.org/docs/17/rangetypes.html', kind: 'doc' },
  usingExplain: { title: 'PostgreSQL 17 — Using EXPLAIN', url: 'https://www.postgresql.org/docs/17/using-explain.html', kind: 'doc' },
  explain: { title: 'PostgreSQL 17 — EXPLAIN', url: 'https://www.postgresql.org/docs/17/sql-explain.html', kind: 'doc' },
  mysqlExplain: { title: 'MySQL 8.4 — Optimizing Queries with EXPLAIN', url: 'https://dev.mysql.com/doc/refman/8.4/en/using-explain.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'pgm-04', moduleId: 'm2', order: 4, minutes: 80, tags: ['índices', 'B-tree', 'índice composto', 'cobertura', 'índice parcial', 'seletividade'],
  title: 'Índices B-tree: como funcionam, quando ajudam e quando atrapalham',
  objectives: ['Explicar o que um índice B-tree acelera e o que ele custa (espaço e escrita)', 'Criar índices simples, compostos, de cobertura (§INCLUDE§), parciais e de expressão', 'Prever quando o otimizador **não** usa um índice (função na coluna, curinga inicial, baixa seletividade)', 'Definir a ordem das colunas de um índice composto', 'Medir o efeito de um índice com §EXPLAIN (ANALYZE, BUFFERS)§'],
  intro: R`**Índices** são a ferramenta mais importante de desempenho em bancos relacionais: transformam uma busca que **lê a tabela inteira** em uma busca que **vai direto às linhas certas**. Mas índices **custam** espaço e atrasam escritas, e muitas vezes o banco **não os usa**, por motivos que dá para prever. Esta aula usa uma tabela de **500.000 linhas** (77 MB) no PostgreSQL 17.12 e, no final, a mesma ideia em MySQL 8.4. Tempos são **desta máquina e deste contêiner**: o que vale é a forma do plano e a ordem de grandeza.`,
  theory: R`### O problema: ler tudo
Sem índice, procurar o cliente 123 em §pedidos§ obriga o banco a **ler todas as linhas** (varredura sequencial, *seq scan*). Medido: um **Parallel Seq Scan** com 3 processos leu **8.512 blocos** (2.496 em cache e 6.016 do disco), descartou **~166 mil linhas por processo** e achou **37** linhas, em **~70 ms**. Para 500 mil linhas é tolerável; para 500 milhões, não.

### O índice B-tree
Um índice **B-tree** é uma estrutura de árvore balanceada, **ordenada** pelas colunas indexadas, em que cada folha aponta para a linha na tabela. Buscar um valor percorre poucos níveis (a altura cresce de forma logarítmica: milhões de linhas cabem em 3 ou 4 níveis). É o tipo padrão (§CREATE INDEX§) e atende: §=§, §<§, §<=§, §>§, §>=§, §BETWEEN§, §IN§, **prefixo** de texto (§LIKE 'abc%'§ em condições adequadas) e **ordenação** (§ORDER BY§).
Medido: depois de §CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id)§, a mesma consulta usou **Bitmap Index Scan + Bitmap Heap Scan**, leu **40 blocos** (em vez de 8.512) e levou **~0,87 ms**, com **a mesma resposta (37 linhas)**. O índice ocupou **3.496 kB** (contra 77 MB da tabela). Em MySQL/InnoDB o resultado é análogo: o plano mudou de §type: ALL§ (varredura, **~199.798 linhas estimadas**) para §type: ref§ com **20 linhas** (e §EXPLAIN ANALYZE§ mostrou 0,69 a 0,70 ms, medido).

### O custo dos índices
- **Espaço**: cada índice é uma estrutura a mais em disco e em memória.
- **Escrita**: cada §INSERT§, §UPDATE§ de coluna indexada e §DELETE§ mantém **todos** os índices. Medido: inserir **300.000 linhas** em uma tabela **sem índices** levou **~1,1 s**; na mesma tabela com **4 índices**, **~7,4 s** (cerca de **6,8 vezes** mais). Em tabelas muito escritas, **menos índices** é melhor.
- **Manutenção**: índices incham com o tempo (§REINDEX§ quando necessário).
Regra: **crie índices para as consultas que importam**, meça e remova os que ninguém usa (§pg_stat_user_indexes§ mostra o uso).

### Quando o banco NÃO usa o índice
1. **Função aplicada à coluna**: medido, §WHERE data = date '2026-03-01'§ usou o índice, mas §WHERE date_trunc('day', data::timestamp) = ...§ fez **Parallel Seq Scan** (o índice está em §data§, não em §date_trunc(...)§). Reescreva como **intervalo**: §data >= '2026-03-01' AND data < '2026-03-02'§ (medido: voltou ao índice). Condições que o índice consegue usar são chamadas **sargable**. No MySQL, medido: §WHERE YEAR(data) = 2026§ **não** usou o índice em §data§ (§possible_keys: NULL§); alternativa: índice **funcional** ou condição por intervalo.
2. **Curinga no início**: medido, com um índice §text_pattern_ops§ (necessário para §LIKE§ em locales que não são "C"), §codigo LIKE 'abc%'§ usou **Index Scan** (com limites §'abc'§ e §'abd'§); §codigo LIKE '%abc'§ fez **Seq Scan**. Para buscas "contém", use **trigramas** (aula pgm-05).
3. **Baixa seletividade**: se a condição retorna uma **grande fração** das linhas, ler pelo índice (pulando pela tabela) é mais caro do que ler tudo em sequência. Medido: §status IN ('pago','cancelado','enviado')§ (~83% das linhas) fez **Seq Scan**, enquanto §cliente_id = 5§ (poucas linhas) usou **Bitmap Index Scan**. O planejador compara **custos estimados** com base em **estatísticas** (aula pgm-07).
4. **Tipo ou collation incompatível**, estatísticas **desatualizadas** e **tabelas muito pequenas** (o seq scan é mais barato).

### Índices compostos: a ordem importa
Um índice em §(status, data)§ é ordenado primeiro por §status§ e, **dentro de cada status**, por §data§. Ele atende bem: §status = x§, §status = x AND data >= y§ e §status = x ORDER BY data§. **Não atende bem** §data = y§ sozinha (a ordem começa por status). Medido: §status = 'pago' AND data >= '2026-01-01'§ usou o composto; §data >= '2026-12-01' AND data < '2026-12-05'§ usou o índice **separado** em §data§; e §status = 'pago' ORDER BY data LIMIT 5§ usou **Index Scan** no composto **sem etapa de ordenação**.
Regras práticas: colunas com **igualdade** primeiro, depois a de **intervalo/ordenação**; a coluna **mais seletiva** nem sempre vai primeiro; o índice composto cobre **prefixos** da lista (§(a, b, c)§ atende §a§, §a,b§ e §a,b,c§).

### Índice de cobertura (INCLUDE) e Index Only Scan
§CREATE INDEX idx_cob ON pedidos (cliente_id) INCLUDE (valor)§ guarda também §valor§ **na folha** do índice. A consulta §SELECT cliente_id, valor ... WHERE cliente_id = 777§ pode ser respondida **só pelo índice** (medido: **Index Only Scan**), sem tocar a tabela. Para o PostgreSQL usar o *index only*, as páginas precisam estar marcadas como "visíveis" (o §VACUUM§ mantém o **mapa de visibilidade**; medido: §Heap Fetches: 0§ após §VACUUM (ANALYZE)§). No MySQL/InnoDB, índices secundários já incluem a chave primária, e um **índice de cobertura** é um índice que contém todas as colunas da consulta (§Using index§ no §EXPLAIN§).

### Índice parcial
Indexa **só as linhas que satisfazem uma condição**: §CREATE INDEX idx_abertos ON pedidos (data) WHERE status = 'aberto'§. Medido: o índice parcial ocupou **592 kB**, contra **3.536 kB** do índice completo em §data§; e a consulta §WHERE status = 'aberto' AND data = ...§ o usou (Index Only Scan). Ideal quando as consultas miram um **subconjunto pequeno** (pedidos abertos, registros ativos, linhas não processadas) e para **unicidade condicional** (§CREATE UNIQUE INDEX ... WHERE removido_em IS NULL§). O MySQL **não** tem índices parciais.

### Índice de expressão
§CREATE INDEX idx_lower ON clientes (lower(nome))§ permite §WHERE lower(nome) = 'cliente 77'§ usar índice (medido: **Bitmap Index Scan em idx_lower**). A função precisa ser §IMMUTABLE§. No MySQL 8, **índices funcionais** existem com sintaxe parecida (§CREATE INDEX ... ((LOWER(nome)))§; não executado aqui).

### Unicidade e chaves primárias
§PRIMARY KEY§ e §UNIQUE§ criam índices automaticamente. As chaves estrangeiras **não** criam índice na coluna referenciadora no PostgreSQL: **crie-o** se você junta ou apaga pela chave (senão o §DELETE§ na tabela pai varre a filha).

### Processo recomendado
1. Identifique as consultas **lentas e frequentes** (logs, §pg_stat_statements§, métricas de aplicação).
2. Rode §EXPLAIN (ANALYZE, BUFFERS)§ e entenda o plano (aula pgm-06).
3. Crie **um** índice candidato, rode §ANALYZE§ e **meça de novo**.
4. Verifique o **custo de escrita** e remova índices redundantes (um índice em §(a, b)§ torna redundante um em §(a)§).`,
  concepts: [
    { term: 'Índice B-tree', def: 'Estrutura de árvore ordenada que acelera igualdade, intervalos e ordenação.' },
    { term: 'Seq Scan', def: 'Varredura sequencial que lê todas as linhas da tabela.' },
    { term: 'Sargable', def: 'Condição que o banco consegue resolver usando um índice.' },
    { term: 'Seletividade', def: 'Fração de linhas que uma condição seleciona; quanto menor, mais útil o índice.' },
    { term: 'Índice composto', def: 'Índice sobre várias colunas, ordenado pela primeira, depois pela segunda e assim por diante.' },
    { term: 'Índice de cobertura (INCLUDE)', def: 'Índice que guarda colunas extras para responder a consulta sem acessar a tabela.' },
    { term: 'Index Only Scan', def: 'Leitura que obtém todos os dados pelo índice, sem consultar a tabela.' },
    { term: 'Índice parcial', def: 'Índice que cobre só as linhas que satisfazem uma condição.' },
    { term: 'Índice de expressão', def: 'Índice sobre o resultado de uma expressão ou função aplicada à coluna.' },
    { term: 'Mapa de visibilidade', def: 'Estrutura mantida pelo VACUUM que permite Index Only Scans no PostgreSQL.' }
  ],
  examples: R`**Analogia:** o índice é o **índice remissivo de um livro**. Sem ele, para achar "cliente 123" você **folheia o livro todo**. Com ele, vai direto às páginas. Mas o índice **ocupa páginas** e, a cada edição do livro, **precisa ser atualizado**. Se você procura a palavra que aparece em **quase todas as páginas**, o índice não ajuda (é mais rápido ler o livro). Se procura "tudo que **termina** com abc", o índice remissivo, organizado pelo começo das palavras, não serve. O índice composto é um remissivo "por sobrenome e, dentro de cada sobrenome, por nome": ótimo para buscar por sobrenome, inútil para buscar só por nome.

**Exemplo 1: antes e depois.** 8.512 blocos e ~70 ms sem índice; 40 blocos e ~0,87 ms com índice, para as mesmas 37 linhas.

**Exemplo 2: função na coluna.** date_trunc na coluna impediu o índice; reescrever como intervalo o devolveu.

**Exemplo 3: custo de escrita.** 300 mil inserções: 1,1 s sem índices e 7,4 s com quatro.`,
  code: [
    { title: 'Efeito de um índice (SQL, plano medido no PostgreSQL 17)', lang: 'sql', code: R`-- 500.000 linhas, 77 MB
EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF)
SELECT * FROM pedidos WHERE cliente_id = 123;
-- Parallel Seq Scan, 8512 blocos, 37 linhas, ~70 ms

CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);
ANALYZE pedidos;

EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF)
SELECT * FROM pedidos WHERE cliente_id = 123;
-- Bitmap Index Scan + Bitmap Heap Scan, 40 blocos, 37 linhas, ~0,87 ms`, notes: [{ l: '2', t: 'ANALYZE e BUFFERS mostram a execução real e os blocos lidos.' }, { l: '7', t: 'Atualize as estatísticas depois de criar o índice.' }, { l: '12', t: 'Mesma resposta, muito menos trabalho.' }] },
    { title: 'Sargable, composto, cobertura e parcial (SQL, planos medidos)', lang: 'sql', code: R`-- função na coluna: Seq Scan; intervalo: usa o índice
SELECT count(*) FROM pedidos WHERE date_trunc('day', data::timestamp) = timestamp '2026-03-01';
SELECT count(*) FROM pedidos WHERE data >= date '2026-03-01' AND data < date '2026-03-02';

-- índice composto: igualdade primeiro, depois ordenação
CREATE INDEX idx_status_data ON pedidos (status, data);
SELECT id FROM pedidos WHERE status = 'pago' ORDER BY data LIMIT 5;   -- Index Scan sem sort

-- cobertura e índice parcial
CREATE INDEX idx_cob ON pedidos (cliente_id) INCLUDE (valor);
CREATE INDEX idx_abertos ON pedidos (data) WHERE status = 'aberto';   -- 592 kB x 3.536 kB`, notes: [{ l: '2', t: 'O índice está em data, não em date_trunc(data).' }, { l: '7', t: 'status fixo + ORDER BY data: o índice já entrega a ordem.' }, { l: '11', t: 'O parcial indexa só ~1/6 das linhas.' }] }
  ],
  bestPractices: ['Indexe pelas consultas reais, medidas com EXPLAIN (ANALYZE, BUFFERS).', 'Escreva condições sargable: sem funções na coluna e sem curinga inicial.', 'Coloque igualdades antes de intervalos em índices compostos.', 'Use INCLUDE e índices parciais para consultas frequentes e específicas.', 'Crie índices nas colunas de chave estrangeira usadas em junções.', 'Remova índices não usados ou redundantes.'],
  mistakes: ['Indexar tudo "por precaução" e pagar o custo de escrita.', 'Aplicar função à coluna e esperar o índice.', 'Esperar que um índice composto sirva para a segunda coluna isolada.', 'Medir sem rodar ANALYZE ou com tabela pequena demais.', 'Esquecer o índice na chave estrangeira.', 'Ignorar a baixa seletividade: índice em coluna com 3 valores quase nunca ajuda.'],
  market: R`"A consulta ficou lenta" é um dos chamados mais comuns de backend. Saber ler o plano, criar o índice certo e **provar** o ganho (e o custo) é uma habilidade de nível pleno. Entrevistas costumam perguntar sobre ordem de colunas em índices compostos e por que o índice não foi usado.`,
  summary: R`Um B-tree acelera igualdade, intervalo, prefixo e ordenação: a consulta passou de 8.512 blocos e ~70 ms (Seq Scan) para 40 blocos e ~0,87 ms, com a mesma resposta. Custa espaço e escrita (1,1 s contra 7,4 s para 300 mil inserções com quatro índices). Função na coluna, curinga inicial e baixa seletividade impedem o uso. Compostos obedecem à ordem das colunas; §INCLUDE§ permite Index Only Scan; índices parciais (592 kB contra 3.536 kB) e de expressão atendem casos específicos.`,
  refs: [REF2.indexes, REF2.indexTypes, REF2.multicolumn, REF2.partial, REF2.indexOnly, REF2.expressional, REF2.mysqlIndexes],
  cards: [
    { q: 'Quando um índice B-tree não é usado?', a: 'Com função na coluna, curinga no início do LIKE, baixa seletividade, estatísticas desatualizadas ou tabela muito pequena.' },
    { q: 'Por que a ordem das colunas importa em um índice composto?', a: 'O índice é ordenado pela primeira coluna e depois pelas seguintes; ele atende prefixos (a; a,b), não a segunda coluna isolada.' },
    { q: 'Qual o custo de ter vários índices?', a: 'Espaço e escritas mais lentas, pois cada INSERT/UPDATE/DELETE mantém todos (medido: ~6,8 vezes).' },
    { q: 'O que é um índice parcial?', a: 'Um índice que cobre só as linhas que satisfazem uma condição, ficando menor.' },
    { q: 'O que permite um Index Only Scan?', a: 'Um índice que contém todas as colunas da consulta (INCLUDE) e páginas marcadas como visíveis pelo VACUUM.' }
  ]
},
{
  id: 'pgm-05', moduleId: 'm2', order: 5, minutes: 75, tags: ['GIN', 'GiST', 'BRIN', 'pg_trgm', 'JSONB', 'exclusão', 'range'],
  title: 'Índices especializados: GIN, GiST, BRIN, trigramas e restrições de exclusão',
  objectives: ['Escolher o tipo de índice (B-tree, GIN, GiST, BRIN, hash) pelo tipo de consulta', 'Indexar JSONB, arrays e busca por trechos de texto com GIN e §pg_trgm§', 'Indexar intervalos com GiST e impedir sobreposições com §EXCLUDE§', 'Explicar o que a extensão §btree_gist§ resolve', 'Comparar o custo em tamanho e escrita dos diferentes índices'],
  intro: R`O B-tree resolve igualdade e intervalos de valores simples, mas há consultas que ele **não atende**: "o JSON contém esta chave?", "o texto **contém** este trecho?", "este intervalo de horário **se sobrepõe** a outro?". O PostgreSQL oferece **tipos de índice especializados** para esses casos (GIN, GiST, BRIN, SP-GiST, hash). Esta aula mostra os principais, com planos medidos, e uma **restrição de exclusão** que impede reservas sobrepostas, algo que o MySQL não consegue declarar.`,
  theory: R`### Quando o B-tree não basta
O B-tree entende "menor, igual, maior". Operadores como **contém** (§@>§), **existe** (§?§), **sobrepõe** (§&&§) e "**contém este trecho de texto**" (§LIKE '%x%'§) pedem estruturas que indexem **o conteúdo** dos valores. Cada tipo de índice trabalha com uma **classe de operadores**; o planejador só usa o índice se o **operador da consulta** pertencer à classe.

### GIN (Generalized Inverted Index)
Índice **invertido**: para cada "elemento" (uma chave de JSON, um item de array, um trigrama de texto) guarda a lista de linhas em que ele aparece. Excelente para **valores compostos**: §jsonb§, arrays, busca de texto completo (§tsvector§) e trigramas. Medido, com 500.000 linhas e uma coluna §meta jsonb§:
- §CREATE INDEX idx_meta_gin ON pedidos USING gin (meta)§; a consulta §meta @> '{"canal":"loja"}'§ usou **Bitmap Index Scan em idx_meta_gin**;
- o GIN ocupou **2.304 kB** (a coluna tem poucos valores distintos, o que torna o índice compacto); o B-tree em §cliente_id§ ocupou 3.496 kB. O tamanho depende muito da **distribuição** dos dados.
Características: leituras rápidas; **escritas mais lentas** (cada linha toca vários elementos); o GIN usa uma "pending list" para amortizar as escritas (§fastupdate§).
Para JSONB, a classe padrão (§jsonb_ops§) atende §@>§, §?§, §?|§ e §?&§; §jsonb_path_ops§ é **menor e mais rápida** para §@>§, mas não atende §?§.

### Trigramas (pg_trgm) para LIKE '%trecho%'
O B-tree não ajuda em §LIKE '%abc12%'§ (curinga no início). A extensão **§pg_trgm§** decompõe o texto em trechos de 3 caracteres e o índice GIN os encontra: §CREATE EXTENSION pg_trgm; CREATE INDEX idx_codigo_trgm ON pedidos USING gin (codigo gin_trgm_ops)§. Medido: §codigo LIKE '%abc12%'§ passou a usar **Bitmap Index Scan em idx_codigo_trgm**; antes do índice, as buscas com curinga inicial faziam Seq Scan (aula pgm-04). O índice trigrama também serve para **busca aproximada** (§similarity§, operador §%§) e §ILIKE§. Limitações: padrões muito curtos (menos de 3 caracteres) ajudam pouco. Para **busca de texto por palavras e relevância** (idioma, radicais), use a **busca de texto completo** do PostgreSQL (§tsvector§/§tsquery§ com GIN; não executada neste curso) ou um mecanismo de busca dedicado.

### GiST (Generalized Search Tree)
Árvore **balanceada genérica** para dados com noção de **"proximidade" ou "sobreposição"**: **intervalos** (§tstzrange§), **geometrias** (PostGIS), vizinho mais próximo e trigramas. Medido, com 20.000 reservas de salas:
§§§
CREATE TABLE reservas (id serial, sala int, periodo tstzrange);
CREATE INDEX idx_per_gist ON reservas USING gist (periodo);
SELECT count(*) FROM reservas WHERE periodo && tstzrange('2026-02-01', '2026-02-02');   -- 25
§§§
O plano usou **Bitmap Index Scan em idx_per_gist** e a resposta foi **25** reservas sobrepostas ao intervalo. O operador §&&§ (sobrepõe) é a base de agendas e reservas.

### Restrição de exclusão (EXCLUDE)
Uma **constraint de exclusão** impede que duas linhas "conflitem" segundo operadores: "a mesma sala **não** pode ter dois períodos que se **sobreponham**".
§§§
CREATE EXTENSION btree_gist;
CREATE TABLE reservas2 (id serial, sala int, periodo tstzrange,
  EXCLUDE USING gist (sala WITH =, periodo WITH &&));
§§§
Medido: sem §btree_gist§, a criação falhou com **data type integer has no default operator class for access method "gist"** (o GiST não sabe indexar inteiros sozinho); a extensão §btree_gist§ fornece as classes. Com a restrição: reservar a sala 1 das 10h às 12h funcionou; reservar a sala 1 das 11h às 13h falhou com **conflicting key value violates exclusion constraint "reservas2_sala_periodo_excl"**; reservar a sala 2 no mesmo horário funcionou. Isso garante a regra **no banco**, mesmo com várias aplicações e concorrência (sem a corrida de "verificar e depois inserir"). **O MySQL não tem restrições de exclusão**; a alternativa é lógica na aplicação com bloqueios ou tabelas auxiliares.

### BRIN (Block Range Index) e hash
- **BRIN** guarda só o **mínimo e máximo por faixa de blocos**: é minúsculo e serve para tabelas **enormes e naturalmente ordenadas** (logs e séries temporais inseridas em ordem de data). Não ajuda se os valores forem espalhados. (Descrito a partir da documentação; **não executado** aqui.)
- **Hash** atende só igualdade; raramente supera o B-tree. (Documentação; não executado.)
- **SP-GiST**: estruturas particionadas (árvores de prefixos, quadtrees); casos específicos.

### Como escolher
| Consulta | Índice |
|---|---|
| =, <, >, BETWEEN, ORDER BY | B-tree |
| §jsonb @>§, §?§, arrays §@>§/§&&§, texto completo | GIN |
| LIKE '%x%', similaridade | GIN com §gin_trgm_ops§ |
| Intervalos §&&§, geometria, vizinho mais próximo, exclusão | GiST |
| Tabela enorme, valores correlacionados com a ordem física | BRIN |

### O custo continua valendo
Índices especializados também **custam escrita e espaço**: meça o ganho contra o custo e crie só os necessários. Um índice GIN em uma coluna JSONB de alta rotatividade pode pesar mais do que o ganho.`,
  concepts: [
    { term: 'GIN', def: 'Índice invertido que mapeia elementos (chaves JSON, itens de array, trigramas) às linhas que os contêm.' },
    { term: 'GiST', def: 'Índice em árvore genérico para intervalos, geometrias e buscas por proximidade ou sobreposição.' },
    { term: 'BRIN', def: 'Índice compacto que guarda mínimo e máximo por faixa de blocos, para tabelas enormes e ordenadas.' },
    { term: 'pg_trgm', def: 'Extensão que decompõe textos em trigramas, permitindo LIKE com curinga inicial e busca aproximada.' },
    { term: 'btree_gist', def: 'Extensão que permite usar tipos comuns (inteiros, textos) em índices GiST e restrições de exclusão.' },
    { term: 'Restrição de exclusão', def: 'Constraint que impede linhas conflitantes segundo operadores, como períodos sobrepostos.' },
    { term: 'Classe de operadores', def: 'Conjunto de operadores que um índice sabe atender para um tipo de dado.' },
    { term: 'Range type', def: 'Tipo que representa um intervalo (por exemplo, tstzrange) com operadores como && e @>.' },
    { term: 'tsvector', def: 'Tipo do PostgreSQL para busca de texto completo.' },
    { term: 'jsonb_path_ops', def: 'Classe de operadores GIN para JSONB, menor e mais rápida para @>.' }
  ],
  examples: R`**Analogia:** o B-tree é um **catálogo alfabético**. O GIN é um **índice de palavras-chave** ("quais livros mencionam 'loja'?"). O trigrama é um **índice de todos os pedaços de 3 letras** de cada palavra, o que permite achar "abc12" no meio de um texto. O GiST é um **mapa de territórios**: pergunta "quais territórios se sobrepõem a este?". A restrição de exclusão é a **regra da sala de reuniões**: duas reuniões na mesma sala não podem se sobrepor, e quem tenta é recusado na porta, **mesmo que dois recepcionistas** tentem ao mesmo tempo.

**Exemplo 1: JSONB.** Procurar linhas cujo meta contém o canal "loja" usou o índice GIN.

**Exemplo 2: texto.** LIKE '%abc12%' passou a usar o índice de trigramas.

**Exemplo 3: reservas.** Reservar a sala 1 de 11h às 13h foi recusado porque se sobrepõe à reserva de 10h às 12h.`,
  code: [
    { title: 'GIN para JSONB e trigramas (SQL, plano medido no PostgreSQL 17)', lang: 'sql', code: R`CREATE INDEX idx_meta_gin ON pedidos USING gin (meta);
SELECT count(*) FROM pedidos WHERE meta @> '{"canal":"loja"}';
-- Bitmap Index Scan on idx_meta_gin (2304 kB)

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_codigo_trgm ON pedidos USING gin (codigo gin_trgm_ops);
SELECT id FROM pedidos WHERE codigo LIKE '%abc12%';
-- Bitmap Index Scan on idx_codigo_trgm`, notes: [{ l: '2', t: '@> (contém) pertence à classe de operadores do GIN para jsonb.' }, { l: '6', t: 'gin_trgm_ops habilita LIKE e ILIKE com curinga no início.' }] },
    { title: 'GiST e restrição de exclusão (SQL, saída medida)', lang: 'sql', code: R`CREATE INDEX idx_per_gist ON reservas USING gist (periodo);
SELECT count(*) FROM reservas WHERE periodo && tstzrange('2026-02-01', '2026-02-02');  -- 25

CREATE EXTENSION btree_gist;
CREATE TABLE reservas2 (
  id serial, sala int, periodo tstzrange,
  EXCLUDE USING gist (sala WITH =, periodo WITH &&)
);
INSERT INTO reservas2 (sala, periodo) VALUES (1, '[2026-01-01 10:00,2026-01-01 12:00)');  -- ok
INSERT INTO reservas2 (sala, periodo) VALUES (1, '[2026-01-01 11:00,2026-01-01 13:00)');
-- ERROR: conflicting key value violates exclusion constraint "reservas2_sala_periodo_excl"
INSERT INTO reservas2 (sala, periodo) VALUES (2, '[2026-01-01 11:00,2026-01-01 13:00)');  -- ok`, notes: [{ l: '4', t: 'Sem btree_gist, o GiST não indexa inteiros: "no default operator class".' }, { l: '7', t: 'Mesma sala E períodos sobrepostos são proibidos.' }, { l: '12', t: 'Outra sala no mesmo horário é permitida.' }] }
  ],
  bestPractices: ['Escolha o tipo de índice pelo operador da consulta.', 'Use GIN para JSONB, arrays e trigramas; GiST para intervalos e geometrias.', 'Use restrições de exclusão para regras de sobreposição, declaradas no banco.', 'Considere jsonb_path_ops quando só usa @>.', 'Use BRIN em tabelas enormes ordenadas pelo tempo, depois de testar.', 'Meça tamanho e custo de escrita dos índices especializados.'],
  mistakes: ['Esperar que um B-tree sirva para @>, && ou LIKE com curinga inicial.', 'Esquecer btree_gist ao combinar colunas comuns e intervalos em GiST ou EXCLUDE.', 'Validar sobreposição só na aplicação (corridas).', 'Criar GIN em colunas de alta taxa de escrita sem medir.', 'Usar trigramas para padrões de 1 ou 2 caracteres.', 'Confundir busca por trechos com busca de texto completo.'],
  market: R`Buscas em JSON, filtros de texto e agendas sem sobreposição são requisitos comuns de produtos reais. Conhecer GIN, GiST e restrições de exclusão resolve no banco problemas que muitas equipes tentam resolver com código frágil ou serviços extras.`,
  summary: R`Para operadores que o B-tree não atende, o PostgreSQL oferece índices especializados. GIN indexa conteúdo (medido: §meta @> ...§ usou o GIN de 2.304 kB), com §pg_trgm§ atende §LIKE '%abc12%'§; GiST indexa intervalos (§&&§ devolveu 25 reservas) e, com §btree_gist§, permite a restrição §EXCLUDE§ que recusou a sobreposição na mesma sala (e aceitou outra sala). BRIN e hash têm nichos. O MySQL não tem esses recursos. Sempre meça o custo.`,
  refs: [REF2.indexTypes, REF2.gin, REF2.gist, REF2.brin, REF2.pgTrgm, REF2.btreeGist, REF2.rangeTypes],
  cards: [
    { q: 'Quando usar GIN?', a: 'Para jsonb, arrays e busca de texto completo ou trigramas, em que se consulta o conteúdo dos valores.' },
    { q: 'Como indexar LIKE com curinga no início?', a: 'Com pg_trgm e um índice GIN (gin_trgm_ops).' },
    { q: 'O que impede uma reserva sobreposta na mesma sala?', a: 'Uma restrição EXCLUDE USING gist (sala WITH =, periodo WITH &&), com btree_gist.' },
    { q: 'Quando o BRIN é adequado?', a: 'Em tabelas enormes cujos valores seguem a ordem física, como logs inseridos em ordem de data.' },
    { q: 'O MySQL tem restrições de exclusão?', a: 'Não; a regra precisa ser garantida por lógica na aplicação ou estruturas auxiliares.' }
  ]
},
{
  id: 'pgm-06', moduleId: 'm2', order: 6, minutes: 80, tags: ['EXPLAIN', 'EXPLAIN ANALYZE', 'plano de execução', 'nested loop', 'hash join', 'merge join', 'estimativas'],
  title: 'EXPLAIN ANALYZE: lendo planos de execução, custos, estimativas e junções',
  objectives: ['Distinguir §EXPLAIN§ (plano estimado) de §EXPLAIN ANALYZE§ (execução real) e seus riscos', 'Ler um plano de dentro para fora: nós, custos, linhas estimadas e reais, laços e blocos', 'Reconhecer Seq Scan, Index Scan, Bitmap Scan, Nested Loop, Hash Join e Merge Join e saber quando cada um é escolhido', 'Comparar estimativa e realidade para diagnosticar estatísticas ruins', 'Ler o §EXPLAIN§ do MySQL (tabela e formato em árvore)'],
  intro: R`O **plano de execução** é o "como" que o banco escolheu para responder à sua consulta. Ler planos é a habilidade que separa "adivinhar" de "diagnosticar". Esta aula ensina a ler a saída de §EXPLAIN (ANALYZE, BUFFERS)§ no PostgreSQL, com planos **reais** medidos (500.000 pedidos juntos a 10.000 clientes) e a mostrar o equivalente no MySQL.`,
  theory: R`### EXPLAIN e EXPLAIN ANALYZE
- §EXPLAIN consulta§: mostra o plano **estimado**, **sem executar**. Seguro, mas só mostra estimativas.
- §EXPLAIN ANALYZE consulta§: **executa** a consulta e mostra o plano com **valores reais** (tempo, linhas, repetições). **Cuidado:** executa mesmo; para §INSERT§, §UPDATE§ e §DELETE§, use dentro de §BEGIN ... ROLLBACK§.
- Opções úteis: §BUFFERS§ (blocos lidos do cache e do disco), §VERBOSE§, §SETTINGS§, §TIMING OFF§ (reduz a sobrecarga de medir tempo), §COSTS OFF§ (limpa a saída) e §FORMAT JSON§ (para ferramentas).
No MySQL: §EXPLAIN§ (tabela com colunas §type§, §key§, §rows§, §filtered§, §Extra§), §EXPLAIN FORMAT=TREE§ (árvore) e §EXPLAIN ANALYZE§ (executa e mostra tempos reais).

### Anatomia de um plano (PostgreSQL)
O plano é uma **árvore**: cada **nó** é uma operação e passa linhas ao nó **pai**. Leia **de dentro para fora** (as folhas executam primeiro). Cada nó mostra §(cost=inicial..total rows=N width=W)§ (**estimado**) e, com §ANALYZE§, §(actual time=... rows=N loops=L)§ (**real**).
- **cost**: unidade arbitrária do planejador (não são milissegundos). Compare **planos entre si**, não com o relógio.
- **rows**: estimativa de linhas (e linhas reais); **loops**: quantas vezes o nó executou (o valor real de §rows§ é **por loop**: multiplique por §loops§ para o total).
- **Buffers**: §shared hit§ (cache) e §read§ (disco).
Medido (junção de pedidos 'pago' com clientes do RS, agrupando por nome):
§§§
Limit
  -> Sort (top-N heapsort, 25 kB)
     -> Finalize HashAggregate (rows=2500)
        -> Gather (Workers Launched: 2)
           -> Partial HashAggregate
              -> Hash Join (Hash Cond: p.cliente_id = c.id)  (rows estimadas=17532, reais=13959 x 3 loops)
                 -> Parallel Seq Scan on pedidos p  (Filter: status = 'pago'; Rows Removed by Filter: 110998)
                 -> Hash -> Seq Scan on clientes c  (Filter: uf = 'RS'; rows=2500)
§§§
**Leitura**: o PostgreSQL leu §clientes§ filtrando RS (2.500 linhas), montou uma **tabela hash** com elas e varreu §pedidos§ em paralelo (3 processos), filtrando §status§ e consultando a hash para cada linha; agregou parcialmente em cada processo, juntou no §Gather§, agregou de novo, ordenou e pegou 3. Tempo de execução medido: **~129 ms**; planejamento: **~1,4 ms**.

### Nós de varredura (como as linhas saem das tabelas)
- **Seq Scan**: lê a tabela inteira; bom para tabelas pequenas ou consultas que retornam grande fração.
- **Index Scan**: percorre o índice e busca cada linha na tabela; bom para poucas linhas ou ordenação pelo índice.
- **Bitmap Index Scan + Bitmap Heap Scan**: o índice monta um **mapa de blocos**, que a tabela lê em ordem física; bom para quantidades **médias** de linhas ou combinação de vários índices (medido na aula pgm-04).
- **Index Only Scan**: tudo pelo índice (aula pgm-04); observe §Heap Fetches§ (**0** é o ideal; medido).
- **Parallel**: vários processos trabalham em fatias da tabela (Gather junta os resultados).

### Algoritmos de junção
| Algoritmo | Como funciona | Quando é bom |
|---|---|---|
| **Nested Loop** | para cada linha da tabela externa, busca as correspondentes na interna (idealmente por índice) | **poucas linhas** externas e índice na interna |
| **Hash Join** | monta tabela hash do lado menor e consulta com o maior | conjuntos **grandes, sem ordem**, igualdade |
| **Merge Join** | ordena (ou lê ordenados por índice) os dois lados e percorre juntos | conjuntos grandes **já ordenados** por índice |
Medido: a junção de **uma linha** de cliente (id = 42) com seus pedidos usou **Nested Loop** com **Index Scan** em §clientes_pkey§ e **Index Only Scan** em §idx_cob§: **0,212 ms**, 40 linhas. Com §SET enable_nestloop = off§ (para **experimentar**), o planejador escolheu **Merge Join** com leituras ordenadas pelos índices. Desabilitar algoritmos é só para **diagnóstico**; nunca como solução permanente em produção.

### Estimativa x realidade
O planejador decide com **estatísticas** (§ANALYZE§). Compare §rows§ estimado com real em cada nó: diferenças de **ordem de grandeza** indicam problema (estatísticas velhas, correlação entre colunas, funções opacas). Medido: depois de inserir 50.000 linhas com valor novo ('b') sem rodar §ANALYZE§, o plano estimou §rows=1§ e encontrou **50.000**; após §ANALYZE§, estimou **50.000**. Estimativas ruins levam a **planos ruins** (por exemplo, um Nested Loop escolhido por achar que havia 1 linha).

### Sort, Aggregate e memória
- **Sort Method: quicksort** (em memória), **top-N heapsort** (para §LIMIT§, medido 25 kB) ou **external merge** (em disco, quando excede §work_mem§ de 4 MB no padrão): Disk indica ajuste de §work_mem§ ou índice.
- **HashAggregate** x **GroupAggregate** (precisa de entrada ordenada); **Batches > 1** em hash significa que a memória não bastou.

### Um roteiro de leitura
1. Veja o **tempo total** e o nó **mais caro** (tempo real × loops).
2. Compare **estimado x real** em cada nó.
3. Procure **Seq Scan** em tabelas grandes com filtros seletivos, **Rows Removed by Filter** altos, **Sort/Hash em disco**, **Nested Loop** com muitas repetições, **Heap Fetches** altos.
4. Proponha **uma** mudança (índice, reescrita, estatística), aplique e **meça de novo**.
Ferramentas para colar planos e visualizar: sites e ferramentas de visualização de planos existem (não usadas aqui); **nunca cole planos com dados sensíveis em serviços externos**.

### MySQL: lendo o EXPLAIN
- Coluna **§type§**: do melhor ao pior: §const§, §eq_ref§, §ref§, §range§, §index§, **§ALL§** (varredura total). Medido: sem índice, §type: ALL§ com **199.798** linhas estimadas; com índice, §type: ref§ com **20**.
- **§key§**: índice escolhido; **§rows§**: estimativa; **§filtered§**: % que passa pelo filtro; **§Extra§**: §Using where§, §Using index§ (cobertura), §Using temporary§, §Using filesort§.
- §EXPLAIN ANALYZE§ (formato em árvore) mostrou §Index lookup on pedidos using idx_cliente (cliente_id=123) (cost=7 rows=20) (actual time=0.692..0.702 rows=20 loops=1)§.`,
  concepts: [
    { term: 'Plano de execução', def: 'Árvore de operações escolhida pelo otimizador para executar a consulta.' },
    { term: 'EXPLAIN ANALYZE', def: 'Comando que executa a consulta e mostra o plano com tempos e linhas reais.' },
    { term: 'Custo (cost)', def: 'Unidade arbitrária do planejador para comparar planos; não é tempo.' },
    { term: 'Nested Loop', def: 'Junção que, para cada linha externa, busca as correspondentes na tabela interna.' },
    { term: 'Hash Join', def: 'Junção que monta uma tabela hash de um lado e consulta com o outro.' },
    { term: 'Merge Join', def: 'Junção que percorre dois conjuntos ordenados em paralelo.' },
    { term: 'Bitmap Scan', def: 'Varredura em duas etapas: o índice monta um mapa de blocos e a tabela é lida em ordem física.' },
    { term: 'Estatísticas do planejador', def: 'Amostras e contagens sobre os dados, mantidas pelo ANALYZE.' },
    { term: 'work_mem', def: 'Memória por operação (ordenação, hash) antes de usar disco.' },
    { term: 'Rows Removed by Filter', def: 'Linhas lidas e descartadas por um filtro, sinal de trabalho desperdiçado.' }
  ],
  examples: R`**Analogia:** o plano é o **roteiro de entregas** que o aplicativo montou. O EXPLAIN mostra o roteiro previsto; o EXPLAIN ANALYZE mostra o **roteiro realmente percorrido**, com o tempo de cada parada. Se o aplicativo achava que "só havia 1 casa" na rua e havia 50.000, o roteiro foi montado errado: o problema está no **mapa desatualizado** (estatísticas), não no motorista.

**Exemplo 1: ler a junção.** Hash Join com tabela de clientes do RS e varredura paralela de pedidos pagos, 129 ms.

**Exemplo 2: poucas linhas.** Um cliente específico: Nested Loop com índices, 0,2 ms.

**Exemplo 3: estatísticas velhas.** Estimativa de 1 linha contra 50.000 reais, corrigida pelo ANALYZE.`,
  code: [
    { title: 'Ler um plano com EXPLAIN (ANALYZE, BUFFERS) (SQL, plano medido)', lang: 'sql', code: R`EXPLAIN (ANALYZE, BUFFERS, COSTS ON, TIMING OFF)
SELECT c.nome, count(*)
FROM pedidos p JOIN clientes c ON c.id = p.cliente_id
WHERE c.uf = 'RS' AND p.status = 'pago'
GROUP BY c.nome ORDER BY 2 DESC LIMIT 3;
-- Hash Join (rows=17532 estimado; 13959 reais x 3 loops)
--   -> Parallel Seq Scan on pedidos p  (Rows Removed by Filter: 110998)
--   -> Hash -> Seq Scan on clientes c  (Filter: uf = 'RS')
-- Execution Time: ~129 ms ; Planning Time: ~1,4 ms`, notes: [{ l: '1', t: 'ANALYZE executa de verdade; BUFFERS mostra blocos de cache e disco.' }, { l: '6', t: 'Compare o rows estimado com o real e multiplique o real por loops.' }, { l: '7', t: 'A tabela hash é montada do lado menor, já filtrado.' }] },
    { title: 'Estatísticas desatualizadas e EXPLAIN no MySQL (SQL, saída medida)', lang: 'sql', code: R`CREATE TABLE evt (id serial PRIMARY KEY, tipo text);
CREATE INDEX ON evt (tipo);
INSERT INTO evt (tipo) SELECT 'a' FROM generate_series(1, 100000);
ANALYZE evt;
INSERT INTO evt (tipo) SELECT 'b' FROM generate_series(1, 50000);

EXPLAIN (ANALYZE, COSTS ON, TIMING OFF) SELECT * FROM evt WHERE tipo = 'b';
-- Index Scan ... (cost=0.29..4.31 rows=1)   (actual rows=50000)   <- estimativa 1 contra 50.000
ANALYZE evt;
EXPLAIN (ANALYZE, COSTS ON, TIMING OFF) SELECT * FROM evt WHERE tipo = 'b';
-- Index Scan ... (cost=0.29..1264.30 rows=50000) (actual rows=50000)

-- MySQL 8.4
EXPLAIN SELECT * FROM pedidos WHERE cliente_id = 123;
-- type=ALL rows=199798 (sem índice)  ->  type=ref key=idx_cliente rows=20 (com índice)`, notes: [{ l: '5', t: 'Linhas novas com um valor que o ANALYZE não conhecia.' }, { l: '8', t: 'Estimativa 1, realidade 50.000: o plano foi escolhido às cegas.' }, { l: '15', t: 'No MySQL, type=ALL é a varredura total; ref é a busca por índice.' }] }
  ],
  bestPractices: ['Use EXPLAIN (ANALYZE, BUFFERS) e leia de dentro para fora.', 'Compare linhas estimadas e reais em cada nó.', 'Rode EXPLAIN ANALYZE de comandos de escrita dentro de BEGIN ... ROLLBACK.', 'Use enable_* só para diagnóstico, nunca como correção permanente.', 'Mantenha as estatísticas atualizadas (autovacuum e ANALYZE).', 'Registre o plano antes e depois de cada mudança.'],
  mistakes: ['Tratar o custo como milissegundos.', 'Esquecer de multiplicar as linhas reais por loops.', 'Rodar EXPLAIN ANALYZE de DELETE em produção sem transação.', 'Concluir "faltou índice" sem olhar a seletividade e as estimativas.', 'Desligar nestloop ou seqscan para "consertar" em produção.', 'Colar planos com dados sensíveis em serviços externos.'],
  market: R`Ler planos é a habilidade central de quem faz tuning de banco; é cobrada em vagas de backend sênior, dados e SRE. Equipes valorizam quem propõe uma mudança, prova com o plano e mede o resultado, em vez de "adivinhar" índices.`,
  summary: R`§EXPLAIN§ estima; §EXPLAIN ANALYZE§ executa e mostra o real (use transação em escritas). Leia o plano de dentro para fora e compare estimado e real (multiplique por §loops§). Medido: Hash Join com varredura paralela (129 ms), Nested Loop para poucas linhas (0,2 ms), Merge Join ao desabilitar o nested loop para teste, e estimativa 1 contra 50.000 reais até o §ANALYZE§. No MySQL, §type: ALL§ (199.798 linhas) virou §type: ref§ (20) com índice.`,
  refs: [REF2.usingExplain, REF2.explain, REF2.mysqlExplain],
  cards: [
    { q: 'Qual a diferença entre EXPLAIN e EXPLAIN ANALYZE?', a: 'EXPLAIN mostra o plano estimado sem executar; EXPLAIN ANALYZE executa e mostra tempos e linhas reais.' },
    { q: 'O cost é em milissegundos?', a: 'Não: é uma unidade arbitrária do planejador, útil para comparar planos.' },
    { q: 'Quando o Nested Loop é bom?', a: 'Quando a tabela externa tem poucas linhas e a interna tem índice para a busca.' },
    { q: 'O que indica um problema de estatísticas?', a: 'Grande diferença entre linhas estimadas e reais em um nó do plano.' },
    { q: 'O que significa type: ALL no EXPLAIN do MySQL?', a: 'Varredura completa da tabela, sem usar índice.' }
  ]
}
];
