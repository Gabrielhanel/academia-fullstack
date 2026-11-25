// C3.4 — Modelagem de dados. Aulas 5 e 6 (modelagem para escala; padrões de modelagem e projeto).
const R = String.raw;

export const REF3 = {
  uuid: { title: 'PostgreSQL 17 — UUID Type', url: 'https://www.postgresql.org/docs/17/datatype-uuid.html', kind: 'doc' },
  altertable: { title: 'PostgreSQL 17 — ALTER TABLE', url: 'https://www.postgresql.org/docs/17/sql-altertable.html', kind: 'doc' },
  createIndex: { title: 'PostgreSQL 17 — CREATE INDEX (CONCURRENTLY)', url: 'https://www.postgresql.org/docs/17/sql-createindex.html', kind: 'doc' },
  partitioning: { title: 'PostgreSQL 17 — Table Partitioning', url: 'https://www.postgresql.org/docs/17/ddl-partitioning.html', kind: 'doc' },
  rls: { title: 'PostgreSQL 17 — Row Security Policies', url: 'https://www.postgresql.org/docs/17/ddl-rowsecurity.html', kind: 'doc' },
  ltree: { title: 'PostgreSQL 17 — ltree', url: 'https://www.postgresql.org/docs/17/ltree.html', kind: 'doc' },
  rangeTypes: { title: 'PostgreSQL 17 — Range Types', url: 'https://www.postgresql.org/docs/17/rangetypes.html', kind: 'doc' },
  expandContract: { title: 'Martin Fowler — Parallel Change (expand and contract)', url: 'https://martinfowler.com/bliki/ParallelChange.html', kind: 'artigo' },
  evolutionary: { title: 'Martin Fowler — Evolutionary Database Design', url: 'https://martinfowler.com/articles/evodb.html', kind: 'artigo' }
};

export const lessonsC = [
{
  id: 'mod-05', moduleId: 'm3', order: 5, minutes: 80, tags: ['escala', 'chaves', 'UUID', 'evolução do esquema', 'multi-tenant', 'particionamento', 'sharding'],
  title: 'Modelagem para escala: chaves, evolução do esquema, multi-tenant e distribuição de dados',
  objectives: ['Escolher a estratégia de chave primária (sequência, UUID) considerando índice, localidade e distribuição', 'Evoluir o esquema de uma tabela grande sem parar o sistema (adicionar colunas, índices, backfill)', 'Comparar estratégias de multi-tenancy (coluna de tenant, esquema e banco por tenant)', 'Reconhecer quando particionar, replicar para leitura ou dividir (sharding) e as consequências no modelo', 'Antecipar o crescimento (tamanho, hot spots, chaves e consultas) ao modelar'],
  intro: R`Um modelo que funciona com mil linhas pode **se arrastar** com mil milhões, e um esquema fácil de alterar hoje pode ser **impossível de mudar sem parar o sistema** daqui a um ano. Modelar para escala não é adivinhar o futuro: é fazer escolhas que **não fecham portas**. Esta aula usa medições no PostgreSQL 17.12 (300 mil linhas de chaves, 500 mil linhas de evolução de esquema) para mostrar **o custo real** de decisões de chave e de mudanças de estrutura.`,
  theory: R`### Chave primária: sequência x UUID
Medido, com **300.000 linhas** e uma chave primária em cada tabela:
| Chave | Inserção | Tabela | Índice da chave primária | Bytes da chave |
|---|---|---|---|---|
| §bigint§ identidade (sequencial) | **~2,8 s** | 13 MB | **6.600 kB** | 8 |
| §uuid§ aleatório v4 | **~5,1 s** | 15 MB | **11 MB** | 16 |
**Por quê?** A sequência insere sempre no **fim** do índice B-tree (localidade perfeita, páginas cheias). O UUID aleatório insere em **posições arbitrárias**: divide páginas, mexe em muitas páginas do índice e **pressiona o cache**; o índice fica maior (a chave tem o dobro do tamanho e as páginas ficam menos cheias). O efeito cresce com tabelas que não cabem na memória.
Mesmo assim, UUIDs têm vantagens: podem ser **gerados no cliente** ou em vários nós sem coordenação, **não revelam** a ordem ou o volume de registros e não colidem ao **mesclar** bancos. Opções: **UUIDs ordenados no tempo** (como o **UUIDv7**), que combinam unicidade distribuída com localidade de inserção (o PostgreSQL 17 **não** traz função nativa para o v7; versões novas e extensões trazem; **não executado** aqui). No MySQL/InnoDB o problema é ainda mais sensível, pois a tabela é **agrupada pela chave primária** (aula pgm-03).
**Decisão prática:** sequência (§bigint§) para tabelas internas de alto volume; UUID (preferencialmente ordenado) quando houver **geração distribuída**, **exposição pública** de ids ou **fusão** de bases. Nunca exponha **ids sequenciais** em URLs públicas se a **enumeração** for um risco (use um identificador público separado).
**Tamanho da chave importa em todos os lugares**: a chave primária é copiada nas **chaves estrangeiras** e em **cada índice secundário** (no InnoDB). Uma chave de 16 bytes aumenta tudo.

### Evolução do esquema sem parar o sistema
O esquema **vai mudar**. Medido, em uma tabela de **500.000 linhas**:
- §ALTER TABLE evol ADD COLUMN novo_a int DEFAULT 0§: **~2,5 ms** (no PostgreSQL 11 ou superior, adicionar coluna com valor padrão constante é uma **operação de metadados**, sem reescrever a tabela);
- §ADD COLUMN novo_b text§ (sem padrão): **~1,7 ms**;
- §UPDATE evol SET novo_b = 'x'§ (preencher a coluna em **uma única transação** para todas as linhas): **~3,6 s**, gerando uma nova versão de **cada** linha (tuplas mortas, aula pgm-07) e bloqueando linhas durante a operação; a tabela ficou em **70 MB** depois (o tamanho anterior não foi medido).
- §CREATE INDEX CONCURRENTLY§: construiu o índice **sem bloquear escritas** (executou sem erro; o tempo não foi medido).
**Padrão "expandir e contrair"** (*expand/contract*, ou **mudança paralela**), para alterações **compatíveis** com versões antigas do código:
1. **Expandir**: adicione a nova coluna/tabela (**nula ou com padrão**), sem remover nada.
2. **Migrar**: a aplicação passa a **gravar nos dois** lugares; faça o **backfill** dos dados antigos em **lotes pequenos** (milhares por vez, com pausas), não em um único §UPDATE§ gigante.
3. **Trocar a leitura** para o novo lugar e validar.
4. **Contrair**: remova a coluna antiga **só depois** de nenhuma versão do código a usar.
Cuidados: §NOT NULL§ e **chaves estrangeiras** novas exigem **validação** (use §NOT VALID§ + §VALIDATE CONSTRAINT§ para evitar bloqueios longos; documentação); **renomear colunas** quebra versões antigas (prefira acrescentar e migrar); defina **timeouts de bloqueio** (§lock_timeout§) em migrações para não travar a aplicação; teste a migração em uma **cópia dos dados** com volume real. Ferramentas de migração (curso C3.6) versionam essas mudanças.

### Multi-tenancy: vários clientes no mesmo sistema
Em um SaaS, cada cliente (tenant) tem seus dados. Estratégias:
1. **Coluna de tenant** (§tenant_id§) em todas as tabelas: um esquema só, **mais barato e simples de operar**, risco de **vazamento entre tenants** se uma consulta esquecer o filtro. Reforce com **chaves compostas** (§PRIMARY KEY (tenant_id, id)§, chaves estrangeiras também com §tenant_id§) e **segurança por linha** (§ROW LEVEL SECURITY§ do PostgreSQL; documentação, **não executada**) que aplica o filtro **no banco**.
2. **Esquema por tenant**: isolamento melhor, migrações multiplicadas (centenas de esquemas), limites de objetos.
3. **Banco por tenant**: **isolamento máximo** (backup e restauração por cliente), custo operacional alto.
Escolha pelo **número de tenants**, **exigências de isolamento** (regulatórias), custo e **heterogeneidade** (tenants gigantes ao lado de pequenos: "vizinho barulhento"). Muitos sistemas começam com coluna de tenant e **movem os gigantes** para infraestrutura própria.

### Particionar, replicar, dividir
- **Particionamento** (aula pgm-08): divide **uma** tabela em partições no **mesmo** servidor (retenção, manutenção). A chave de partição entra nas **chaves primárias e únicas**.
- **Réplicas de leitura**: escalam **leituras**; exigem tolerar **atraso**.
- **Sharding**: divide os **dados entre servidores** por uma chave (por exemplo, o tenant ou o usuário). Escala **escritas** e volume, mas traz **complexidade**: consultas e transações **entre shards** são difíceis ou impossíveis; **JOINs** só dentro do shard; **rebalanceamento** é trabalhoso; ids e unicidade global precisam de cuidado. Modele **já** pensando em uma **chave de distribuição** natural (por exemplo, o tenant) e em **evitar transações entre entidades de shards diferentes**. (Conceito; sharding **não executado** neste curso; ver C8.)
**Regra:** escale na ordem do mais simples ao mais complexo: **índices e consultas**, **hardware/cache**, **réplicas**, **particionamento**, e só então **sharding**.

### Hot spots e linhas quentes
Uma linha atualizada por todos (contador global, "último id") vira **gargalo de bloqueio**. Evite contadores únicos de alta concorrência: **divida** o contador em várias linhas e some, ou use **filas/eventos**. Chaves **monotônicas** concentram inserções no último bloco do índice (em alguns bancos distribuídos isso é um hot spot; em bancos de nó único, geralmente é o melhor caso).

### Planeje o crescimento
Estime **linhas por ano**, **tamanho médio**, **crescimento dos índices**, **retenção** (quanto tempo guardar) e **consultas dominantes**. **Dados frios** podem ir para **tabelas/partições arquivadas** ou armazenamento mais barato. Tabelas **de eventos** (logs, auditoria) crescem sem parar: **particione por tempo** desde o início.

### Tipos e tamanhos
Colunas **estreitas** economizam memória e I/O em escala: §smallint§ onde cabe, §boolean§ no lugar de texto, **ordem das colunas** que reduz *padding* (colunas de 8 bytes primeiro, no PostgreSQL), **não guardar** blobs grandes na linha principal (arquivos vão para armazenamento de objetos, com referência no banco).`,
  concepts: [
    { term: 'Chave sequencial', def: 'Chave gerada em ordem crescente, que insere sempre no fim do índice.' },
    { term: 'UUID', def: 'Identificador de 128 bits gerável sem coordenação central.' },
    { term: 'UUID ordenado no tempo', def: 'UUID cujo prefixo é um carimbo de tempo, combinando unicidade distribuída com localidade de inserção.' },
    { term: 'Expandir e contrair', def: 'Padrão de migração em etapas: acrescentar, migrar, trocar a leitura e só depois remover o antigo.' },
    { term: 'Backfill', def: 'Preenchimento de dados antigos em uma coluna nova, idealmente em lotes.' },
    { term: 'Multi-tenancy', def: 'Arquitetura em que um sistema atende vários clientes isolados.' },
    { term: 'Segurança por linha (RLS)', def: 'Políticas do banco que filtram as linhas visíveis por usuário ou tenant.' },
    { term: 'Sharding', def: 'Divisão dos dados entre servidores por uma chave de distribuição.' },
    { term: 'Linha quente (hot spot)', def: 'Linha ou bloco disputado por muitas transações, que serializa as escritas.' },
    { term: 'Dados frios', def: 'Dados antigos raramente acessados, candidatos a arquivamento.' }
  ],
  examples: R`**Analogia:** a chave sequencial é **numerar as páginas de um caderno em ordem**: sempre se escreve na última. O UUID aleatório é **escrever cada página em uma posição qualquer de um fichário**: é preciso abrir espaço no meio o tempo todo. A evolução do esquema é **reformar uma casa habitada**: acrescente o cômodo novo, mude a família aos poucos e só então derrube a parede velha. O sharding é **dividir o arquivo em várias salas por inicial do sobrenome**: cada sala é rápida, mas quem precisa de documentos de duas salas anda muito.

**Exemplo 1: chaves medidas.** 300 mil linhas: 2,8 s e 6.600 kB com bigint; 5,1 s e 11 MB com UUID v4.

**Exemplo 2: coluna nova.** Adicionar com DEFAULT em 500 mil linhas levou ~2,5 ms; preencher todas em um UPDATE levou ~3,6 s.

**Exemplo 3: multi-tenant.** Chave composta (tenant_id, id) mais RLS evita vazamento entre clientes.`,
  code: [
    { title: 'Chaves bigint x UUID (SQL, medido no PostgreSQL 17)', lang: 'sql', code: R`CREATE TABLE k_bigint (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, v int);
CREATE TABLE k_uuid   (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, v int);

\timing on
INSERT INTO k_bigint (v) SELECT g FROM generate_series(1, 300000) g;   -- ~2,8 s
INSERT INTO k_uuid   (v) SELECT g FROM generate_series(1, 300000) g;   -- ~5,1 s
\timing off

SELECT pg_size_pretty(pg_relation_size('k_bigint_pkey')) AS idx_bigint,   -- 6600 kB
       pg_size_pretty(pg_relation_size('k_uuid_pkey'))   AS idx_uuid;     -- 11 MB
SELECT pg_column_size(1::bigint) AS bytes_bigint, pg_column_size(gen_random_uuid()) AS bytes_uuid;   -- 8 | 16`, notes: [{ l: '5', t: 'A sequência insere sempre no fim do índice.' }, { l: '6', t: 'O UUID aleatório insere em posições arbitrárias e o índice fica maior.' }] },
    { title: 'Evolução do esquema em tabela grande (SQL, medido)', lang: 'sql', code: R`CREATE TABLE evol AS SELECT g AS id, md5(g::text) AS txt FROM generate_series(1, 500000) g;
\timing on
ALTER TABLE evol ADD COLUMN novo_a int DEFAULT 0;    -- ~2,5 ms (só metadados)
ALTER TABLE evol ADD COLUMN novo_b text;             -- ~1,7 ms
UPDATE evol SET novo_b = 'x';                        -- ~3,6 s (500 mil linhas, uma transação)
\timing off
CREATE INDEX CONCURRENTLY idx_evol_txt ON evol (txt);   -- sem bloquear escritas

-- backfill em lotes (esboço)
-- UPDATE evol SET novo_b = 'x' WHERE id BETWEEN 1 AND 10000 AND novo_b IS NULL;  -- repetir por faixas`, notes: [{ l: '3', t: 'Coluna com padrão constante não reescreve a tabela no PostgreSQL 11 ou superior.' }, { l: '5', t: 'Um UPDATE gigante cria uma versão nova de cada linha.' }, { l: '7', t: 'CONCURRENTLY evita bloquear as escritas durante a construção.' }, { l: '10', t: 'Faça o backfill por faixas, com pausas.' }] }
  ],
  bestPractices: ['Escolha a chave pela necessidade: sequência para volume interno, UUID (ordenado) para geração distribuída ou ids públicos.', 'Mantenha as chaves estreitas: elas se repetem em chaves estrangeiras e índices.', 'Evolua o esquema com expandir e contrair, backfill em lotes e timeouts de bloqueio.', 'Teste migrações em cópias com volume real.', 'Reforce o isolamento de tenants com chaves compostas e segurança por linha.', 'Escale na ordem: índices e consultas, cache, réplicas, particionamento, e só então sharding.'],
  mistakes: ['Usar UUID aleatório como chave de tabelas gigantes sem medir.', 'Expor ids sequenciais quando a enumeração é um risco.', 'Fazer um UPDATE gigante em uma única transação para preencher uma coluna.', 'Renomear ou remover colunas ainda usadas por versões antigas do código.', 'Esquecer o tenant_id em uma consulta e vazar dados.', 'Adotar sharding cedo demais.'],
  market: R`Em sistemas que crescem, as decisões de chave, de migração e de isolamento de clientes são as que mais custam para desfazer. Quem as discute com números e conhece o padrão de expandir e contrair é percebido como alguém que já "passou por isso".`,
  summary: R`Chaves: com 300 mil linhas, §bigint§ sequencial inseriu em ~2,8 s com índice de 6.600 kB; UUID v4 levou ~5,1 s e 11 MB (chave de 16 bytes, inserção em posições aleatórias). Evolução do esquema: coluna com padrão levou ~2,5 ms (metadados), um §UPDATE§ de backfill em 500 mil linhas ~3,6 s; use expandir e contrair e lotes. Multi-tenancy: coluna de tenant com chaves compostas e RLS, esquema ou banco por tenant. Escale em ordem; sharding só no fim.`,
  refs: [REF3.uuid, REF3.altertable, REF3.createIndex, REF3.partitioning, REF3.rls, REF3.expandContract],
  cards: [
    { q: 'Por que o UUID aleatório custa mais que uma sequência como chave primária?', a: 'Insere em posições arbitrárias do B-tree, dividindo páginas, ocupando mais espaço e pressionando o cache (medido: 2,8 s e 6.600 kB contra 5,1 s e 11 MB).' },
    { q: 'O que é expandir e contrair?', a: 'Acrescentar o novo, migrar dados e leitura em etapas e só depois remover o antigo, mantendo compatibilidade.' },
    { q: 'Por que fazer backfill em lotes?', a: 'Um UPDATE gigante cria versões de todas as linhas, bloqueia e gera inchaço; lotes pequenos reduzem o impacto.' },
    { q: 'Como reduzir o risco de vazamento entre tenants?', a: 'Chaves compostas com tenant_id, chaves estrangeiras com tenant_id e segurança por linha no banco.' },
    { q: 'Qual a ordem de escalabilidade recomendada?', a: 'Índices e consultas, cache, réplicas, particionamento e, por último, sharding.' }
  ]
},
{
  id: 'mod-06', moduleId: 'm3', order: 6, minutes: 80, tags: ['padrões', 'soft delete', 'histórico', 'hierarquias', 'EAV', 'JSONB', 'projeto'],
  title: 'Padrões de modelagem: exclusão lógica, histórico, hierarquias, atributos flexíveis e o projeto',
  objectives: ['Aplicar exclusão lógica com índice único parcial e entender seus custos', 'Modelar histórico e validade temporal sem sobreposição', 'Escolher uma estratégia para hierarquias (adjacência, caminho materializado, ltree)', 'Comparar EAV, colunas, JSONB e tabelas por tipo para atributos flexíveis', 'Montar e defender um modelo completo em um projeto integrador'],
  intro: R`Alguns problemas de modelagem aparecem em quase todo sistema: **apagar sem perder histórico**, **guardar valores que mudam no tempo**, **representar árvores**, **aceitar atributos que variam por produto**. Cada um tem **padrões conhecidos**, com vantagens e armadilhas. Esta aula apresenta os padrões, com experimentos no PostgreSQL 17.12, e fecha com o **projeto integrador** do curso.`,
  theory: R`### Exclusão lógica (soft delete)
Em vez de apagar, marca-se a linha (§removido_em timestamptz§). Vantagens: **recuperação**, **auditoria**, histórico referencial. Custos: **toda consulta precisa filtrar** (use **views** ou camadas de acesso), índices e tabelas **crescem**, e a **unicidade** quebra.
O problema da unicidade, **medido**: com §email UNIQUE§ comum, depois de "remover" a conta (§removido_em = now()§), criar **nova conta com o mesmo e-mail falhou** (**duplicate key value violates unique constraint "contas_ingenua_email_key"**). A solução é um **índice único parcial**: §CREATE UNIQUE INDEX contas_email_ativo ON contas (email) WHERE removido_em IS NULL§. Medido: com ele, dois e-mails **ativos** iguais foram recusados e, depois de remover, a recriação **funcionou** (a consulta mostrou a conta 1 removida e a conta 3 ativa).
Alternativas: **tabela de arquivo** (mover a linha para §contas_arquivo§ em uma transação), preferível quando a exclusão é a exceção e o histórico não precisa estar nas consultas normais. Atenção a **privacidade**: dados pessoais "removidos" logicamente **continuam guardados**; a legislação (como a LGPD) pode exigir **eliminação efetiva** ou **anonimização**.

### Histórico e validade temporal
Há dois tempos: **tempo de validade** (quando o fato vale no mundo) e **tempo de registro** (quando o banco soube). O padrão mais simples: tabela com **intervalo de validade** e **restrição de exclusão** para impedir períodos sobrepostos do mesmo produto. Medido:
§§§
CREATE TABLE preco_hist (produto_id int, preco numeric(10,2) NOT NULL, validade tstzrange NOT NULL,
  EXCLUDE USING gist (produto_id WITH =, validade WITH &&));
INSERT INTO preco_hist VALUES (1, 10, '[2026-01-01,2026-06-01)'), (1, 12, '[2026-06-01,)');
INSERT INTO preco_hist VALUES (1, 11, '[2026-03-01,2026-04-01)');   -- recusado: sobrepõe
§§§
O terceiro insert falhou com **conflicting key value violates exclusion constraint**. A consulta "preço em 15/03" (§validade @> timestamptz '2026-03-15'§) devolveu **10,00**; em 15/09, **12,00**. Variações: **tabela de histórico por trigger** (cada alteração grava a versão antiga com quem e quando mudou; **auditoria**), **tabelas de eventos** (guarda os fatos e **deriva** o estado, ideal para auditoria forte e sistemas financeiros) e **dimensões lentamente mutáveis** (tipo 2) em armazéns de dados.

### Hierarquias (árvores)
1. **Lista de adjacência** (§pai_id§ na própria tabela): simples e integra; consultar **descendentes** exige **CTE recursiva** (aula sqe-08).
2. **Caminho materializado** (§caminho = 'a/b/c'§): descendentes por prefixo (§LIKE 'a/b/%'§), mas mover subárvores exige reescrever caminhos.
3. **ltree** (extensão do PostgreSQL): tipo de caminho com **operadores e índice GiST**. Medido: §caminho <@ 'eletronicos'§ devolveu os três níveis (eletronicos, eletronicos.celulares, eletronicos.celulares.smartphones) e §nlevel(caminho)§ deu os níveis 1, 2, 3 e 1.
4. **Conjuntos aninhados** e **tabela de fechamento** (todos os pares ancestral-descendente): leituras muito rápidas, **escritas complexas**.
Escolha pelo uso: **muitas leituras de subárvores** e poucas mudanças → ltree ou fechamento; **muitas mudanças** → adjacência. Cuidado com **ciclos** (aula mod-03).

### Atributos flexíveis: EAV, colunas, JSONB
Produtos têm atributos diferentes (um livro tem autor; uma camiseta, tamanho). Opções:
- **Colunas opcionais**: muitas colunas NULL; simples e tipadas, ruim se os tipos de atributo são centenas.
- **EAV** (*entity-attribute-value*): tabela (§entidade, atributo, valor§). Flexível e **péssima para integridade e consultas**. Medido: um valor inválido ("pesado" no atributo peso) **entrou sem problema** e a consulta que converte para inteiro **falhou** com **invalid input syntax for type integer: "pesado"**; reconstruir uma "linha" exige pivotar com §FILTER§. Todos os valores são **texto**, sem tipos nem restrições.
- **JSONB** (aula sqa-06): atributos variáveis com índice GIN; sem integridade de esquema (valide com **JSON Schema** na aplicação ou com restrições §CHECK§ sobre o JSONB).
- **Tabela por tipo** (herança): integridade máxima, mais tabelas.
Regra: **dados estruturados e consultados** → **colunas**; **atributos variáveis** → **JSONB** em complemento; **EAV** só quando o domínio **exige** metadados dinâmicos e você aceita as consequências.

### Outros padrões úteis
- **Tabela de domínio e de tradução** (§produto_traducoes(produto_id, idioma, nome)§) para textos em vários idiomas.
- **Auditoria** (§criado_por§, §atualizado_em§, tabela de log).
- **Máquinas de estado** (tabela de transições permitidas: de, para).
- **Endereços e contatos** como entidades próprias (1:N), pois mudam e se repetem.
- **Dinheiro**: §numeric§ e **moeda** (§valor§ + §moeda§); **saldos** como soma de **lançamentos** (partida dobrada), não como número editável.

### O projeto integrador: modelo de uma plataforma de cursos
Entregue um modelo **completo e defendido**: (1) requisitos em linguagem natural e **lista de regras**; (2) **DER** (Mermaid) com cardinalidades; (3) **DDL** em PostgreSQL com chaves, restrições, índices e comentários; (4) **normalização** justificada até a 3FN e **uma desnormalização medida**; (5) **dados de exemplo** e **consultas de verificação** (anomalias, integridade, reconstrução); (6) um plano de **evolução** (expandir e contrair) para uma nova funcionalidade; (7) decisões de **escala** (chaves, particionamento de eventos, multi-tenant) em um **ADR**.`,
  concepts: [
    { term: 'Exclusão lógica', def: 'Marcar o registro como removido em vez de apagá-lo fisicamente.' },
    { term: 'Índice único parcial', def: 'Índice único que vale só para as linhas que satisfazem uma condição, como as ativas.' },
    { term: 'Tempo de validade', def: 'Período em que um fato vale no mundo real.' },
    { term: 'Tabela de histórico', def: 'Tabela que guarda versões anteriores de registros, normalmente com intervalo de validade.' },
    { term: 'Lista de adjacência', def: 'Modelo de árvore em que cada linha guarda o id do pai.' },
    { term: 'Caminho materializado', def: 'Modelo de árvore em que cada linha guarda o caminho completo da raiz.' },
    { term: 'ltree', def: 'Tipo do PostgreSQL para caminhos hierárquicos, com operadores e índices.' },
    { term: 'EAV', def: 'Modelo entidade-atributo-valor, com atributos como linhas de texto.' },
    { term: 'Tabela de eventos (event sourcing)', def: 'Modelo em que se guardam fatos imutáveis e o estado é derivado deles.' },
    { term: 'Lançamento', def: 'Registro imutável de uma movimentação, cuja soma produz o saldo.' }
  ],
  examples: R`**Analogia:** a **exclusão lógica** é **riscar o nome da lista em vez de rasgar a página**; a regra "e-mail único" precisa passar a valer **só para os nomes não riscados** (índice parcial). O **histórico com validade** é **uma agenda de preços por período** em que o sistema recusa dois preços para o mesmo dia. A **árvore** pode ser guardada como "quem é seu pai" (barato de mudar, caro de percorrer) ou "o caminho completo" (barato de percorrer, caro de mudar). O **EAV** é uma **gaveta de papeizinhos soltos**: cabe qualquer coisa, mas ninguém confere se "peso: pesado" faz sentido.

**Exemplo 1: soft delete.** Com UNIQUE comum, recriar o e-mail depois de remover falhou; com índice único parcial, funcionou.

**Exemplo 2: preços no tempo.** O preço em março foi 10 e em setembro 12, com sobreposição recusada.

**Exemplo 3: EAV.** O valor "pesado" entrou e quebrou a consulta numérica.`,
  code: [
    { title: 'Exclusão lógica com índice único parcial (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`CREATE TABLE contas (id serial PRIMARY KEY, email text NOT NULL, removido_em timestamptz);
CREATE UNIQUE INDEX contas_email_ativo ON contas (email) WHERE removido_em IS NULL;

INSERT INTO contas (email) VALUES ('a@x');
INSERT INTO contas (email) VALUES ('a@x');
-- ERROR: duplicate key value violates unique constraint "contas_email_ativo"

UPDATE contas SET removido_em = now() WHERE id = 1;
INSERT INTO contas (email) VALUES ('a@x');      -- ok: a conta 1 está removida
SELECT id, email, removido_em IS NOT NULL AS removida FROM contas ORDER BY id;
-- 1 | a@x | t     ;     3 | a@x | f

-- com UNIQUE comum, o último INSERT falharia: duplicate key ... "contas_ingenua_email_key"`, notes: [{ l: '2', t: 'O índice só considera as contas ativas.' }, { l: '9', t: 'Depois de remover, o mesmo e-mail pode ser reutilizado.' }, { l: '13', t: 'A versão ingênua impediria recriar o e-mail.' }] },
    { title: 'Validade sem sobreposição e ltree (SQL, saída medida)', lang: 'sql', code: R`CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE preco_hist (
  produto_id int, preco numeric(10,2) NOT NULL, validade tstzrange NOT NULL,
  EXCLUDE USING gist (produto_id WITH =, validade WITH &&));
INSERT INTO preco_hist VALUES (1, 10, '[2026-01-01,2026-06-01)'), (1, 12, '[2026-06-01,)');
INSERT INTO preco_hist VALUES (1, 11, '[2026-03-01,2026-04-01)');
-- ERROR: conflicting key value violates exclusion constraint "preco_hist_produto_id_validade_excl"
SELECT preco FROM preco_hist WHERE produto_id = 1 AND validade @> timestamptz '2026-03-15';  -- 10.00
SELECT preco FROM preco_hist WHERE produto_id = 1 AND validade @> timestamptz '2026-09-15';  -- 12.00

CREATE EXTENSION IF NOT EXISTS ltree;
CREATE TABLE cat (id serial PRIMARY KEY, caminho ltree NOT NULL);
CREATE INDEX ON cat USING gist (caminho);
INSERT INTO cat (caminho) VALUES ('eletronicos'), ('eletronicos.celulares'), ('eletronicos.celulares.smartphones'), ('livros');
SELECT caminho FROM cat WHERE caminho <@ 'eletronicos' ORDER BY caminho;     -- 3 linhas`, notes: [{ l: '4', t: 'A restrição de exclusão impede validades sobrepostas do mesmo produto.' }, { l: '6', t: 'O intervalo semiaberto permite que um preço comece quando o outro termina.' }, { l: '16', t: '<@ (é descendente de) usa o índice GiST de ltree.' }] }
  ],
  bestPractices: ['Combine exclusão lógica com índice único parcial e filtre por padrão em views.', 'Use intervalos de validade com restrição de exclusão para históricos.', 'Escolha o modelo de árvore pelo padrão de leitura e escrita.', 'Prefira colunas para dados estruturados e JSONB para atributos variáveis; evite EAV.', 'Modele saldos como somas de lançamentos imutáveis.', 'Considere privacidade e eliminação efetiva além da exclusão lógica.'],
  mistakes: ['Usar UNIQUE comum com exclusão lógica.', 'Esquecer o filtro de removidos em consultas e relatórios.', 'Guardar histórico sobrescrevendo valores.', 'Aplicar EAV como solução geral e perder tipos e integridade.', 'Manter dados pessoais "removidos" por tempo indeterminado.', 'Armazenar o saldo como um número editável sem lançamentos.'],
  market: R`Exclusão lógica, histórico e hierarquias aparecem em todo sistema de negócio, e a forma como são modeladas determina a facilidade de auditoria, relatórios e conformidade. Entrevistas costumam pedir "como você guardaria o histórico de preços?" ou "como modelaria categorias aninhadas?".`,
  summary: R`Exclusão lógica pede índice único parcial (medido: o UNIQUE comum impediu recriar o e-mail; o parcial permitiu). Histórico temporal usa intervalos com §EXCLUDE§ (o preço em março foi 10, em setembro 12, e a sobreposição foi recusada). Árvores: adjacência, caminho, ltree (§<@§ devolveu 3 níveis) ou fechamento. Atributos flexíveis: colunas, JSONB e, com cuidado, EAV (o valor "pesado" entrou e quebrou a conversão). O projeto integrador exige DER, DDL, normalização, uma desnormalização medida e um ADR de escala.`,
  refs: [REF3.ltree, REF3.rangeTypes, REF3.evolutionary, REF3.rls],
  cards: [
    { q: 'Por que UNIQUE comum não combina com exclusão lógica?', a: 'A linha removida continua ocupando a chave; use índice único parcial WHERE removido_em IS NULL.' },
    { q: 'Como impedir dois preços para o mesmo produto no mesmo período?', a: 'Com um intervalo de validade e EXCLUDE USING gist (produto_id WITH =, validade WITH &&).' },
    { q: 'Quando usar caminho materializado ou ltree em vez de adjacência?', a: 'Quando as leituras de subárvores dominam e as mudanças são raras.' },
    { q: 'Qual o principal problema do EAV?', a: 'Valores como texto, sem tipos ou restrições, e consultas complexas.' },
    { q: 'Como modelar um saldo com segurança?', a: 'Como a soma de lançamentos imutáveis, e não como um número editável.' }
  ]
}
];
