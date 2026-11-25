// C3.3 — PostgreSQL e MySQL. Aulas 7 a 9 (otimização de consultas; particionamento e replicação; backup, restauração e projeto).
const R = String.raw;

export const REF3 = {
  planStats: { title: 'PostgreSQL 17 — Statistics Used by the Planner', url: 'https://www.postgresql.org/docs/17/planner-stats.html', kind: 'doc' },
  vacuuming: { title: 'PostgreSQL 17 — Routine Vacuuming', url: 'https://www.postgresql.org/docs/17/routine-vacuuming.html', kind: 'doc' },
  perfTips: { title: 'PostgreSQL 17 — Performance Tips', url: 'https://www.postgresql.org/docs/17/performance-tips.html', kind: 'doc' },
  pgStatStatements: { title: 'PostgreSQL 17 — pg_stat_statements', url: 'https://www.postgresql.org/docs/17/pgstatstatements.html', kind: 'doc' },
  partitioning: { title: 'PostgreSQL 17 — Table Partitioning', url: 'https://www.postgresql.org/docs/17/ddl-partitioning.html', kind: 'doc' },
  mysqlPartitioning: { title: 'MySQL 8.4 — Partitioning', url: 'https://dev.mysql.com/doc/refman/8.4/en/partitioning.html', kind: 'doc' },
  highAvail: { title: 'PostgreSQL 17 — High Availability, Load Balancing, and Replication', url: 'https://www.postgresql.org/docs/17/high-availability.html', kind: 'doc' },
  standby: { title: 'PostgreSQL 17 — Log-Shipping Standby Servers', url: 'https://www.postgresql.org/docs/17/warm-standby.html', kind: 'doc' },
  mysqlReplication: { title: 'MySQL 8.4 — Replication', url: 'https://dev.mysql.com/doc/refman/8.4/en/replication.html', kind: 'doc' },
  pgBasebackup: { title: 'PostgreSQL 17 — pg_basebackup', url: 'https://www.postgresql.org/docs/17/app-pgbasebackup.html', kind: 'doc' },
  pgDump: { title: 'PostgreSQL 17 — pg_dump', url: 'https://www.postgresql.org/docs/17/app-pgdump.html', kind: 'doc' },
  pgRestore: { title: 'PostgreSQL 17 — pg_restore', url: 'https://www.postgresql.org/docs/17/app-pgrestore.html', kind: 'doc' },
  backup: { title: 'PostgreSQL 17 — Backup and Restore', url: 'https://www.postgresql.org/docs/17/backup.html', kind: 'doc' },
  continuous: { title: 'PostgreSQL 17 — Continuous Archiving and PITR', url: 'https://www.postgresql.org/docs/17/continuous-archiving.html', kind: 'doc' },
  mysqldump: { title: 'MySQL 8.4 — mysqldump', url: 'https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'pgm-07', moduleId: 'm3', order: 7, minutes: 80, tags: ['otimização', 'estatísticas', 'VACUUM', 'paginação', 'escrita', 'pg_stat_statements'],
  title: 'Otimização de consultas: estatísticas, VACUUM, paginação e o custo das escritas',
  objectives: ['Aplicar um método de otimização: medir, diagnosticar, mudar uma coisa e medir de novo', 'Reconhecer reescritas que ajudam (sargable, paginação por chave, evitar §SELECT *§)', 'Explicar o papel das estatísticas (§ANALYZE§) e do §VACUUM§ no PostgreSQL', 'Prever o custo de escrita de índices e o efeito de atualizações em massa', 'Identificar consultas problemáticas com ferramentas de observação (§pg_stat_statements§, logs de consultas lentas)'],
  intro: R`Otimizar é um **processo**, não um truque: **medir** o que está lento, **entender** por quê, **mudar uma coisa** e **medir de novo**. Esta aula reúne as intervenções mais frequentes, todas com números medidos no PostgreSQL 17.12 (500.000 pedidos): reescrever condições, trocar **OFFSET** por **paginação por chave**, manter **estatísticas** e **VACUUM** saudáveis e **pesar o custo das escritas**. Tempos são desta máquina e deste contêiner: o que se transfere é a **proporção** e o **método**.`,
  theory: R`### O método
1. **Defina "lento"**: a consulta tem um orçamento (por exemplo, 200 ms no p95)? Quantas vezes por segundo roda?
2. **Encontre os culpados**: logs de consultas lentas (§log_min_duration_statement§), a visão §pg_stat_statements§ (extensão **disponível** na imagem; medido na lista de extensões; não habilitada neste laboratório) que mostra **tempo total, chamadas e média** por consulta; no MySQL, o *slow query log* e o §performance_schema§. **Otimize o que consome mais tempo total** (uma consulta de 5 ms chamada 10.000 vezes por segundo pesa mais do que uma de 2 s chamada uma vez por dia).
3. **Entenda o plano** (aula pgm-06).
4. **Mude uma coisa** (índice, reescrita, estatísticas, configuração).
5. **Meça de novo** e compare com o anterior; verifique também o **efeito colateral** em outras consultas e na escrita.

### Reescritas que costumam ajudar
- **Condições sargable** (aula pgm-04): sem função na coluna; intervalos em vez de §date_trunc§ e §YEAR()§.
- **Selecione só o necessário**: §SELECT *§ traz colunas que impedem *Index Only Scan* e aumentam rede e memória.
- **Evite §OFFSET§ grande**. Medido, em 500.000 linhas: §ORDER BY id LIMIT 20 OFFSET 400000§ leu **400.020 linhas do índice** e levou **~155 ms**; a **paginação por chave** (§WHERE id > 400000 ORDER BY id LIMIT 20§) leu **20 linhas** e levou **~0,16 ms** (**~1.000 vezes** mais rápida). O custo do OFFSET cresce com o deslocamento; a paginação por chave tem custo **estável** (exige ordenação por coluna única e indexada e a "última chave vista"; não permite "pular para a página 500").
- **EXISTS em vez de contagem**: para saber "há algum?", §EXISTS§ para ao primeiro; §count(*)§ conta tudo.
- **Junte e filtre cedo**: reduza o volume antes de joins caros; agregue antes de juntar (aula sqe-05).
- **Lotes**: um §INSERT§ com várias linhas ou §COPY§ (PostgreSQL) é muito mais rápido do que milhares de comandos; **menos idas ao banco** (N+1 será tema da aula de ORMs, C3.6).
- **Evite SELECT dentro de laços** na aplicação.

### Estatísticas e o planejador
O planejador estima linhas com **estatísticas por coluna** (valores frequentes, histograma, número de valores distintos), coletadas por §ANALYZE§ (o **autovacuum** o executa automaticamente depois de muitas mudanças). Medido: logo depois de acrescentar 50.000 linhas de um valor novo, **sem** §ANALYZE§, o plano estimou **1 linha** e encontrou **50.000**; após §ANALYZE§, a estimativa foi **50.000**. Sintomas de estatísticas ruins: planos que mudam de repente, estimativas muito diferentes do real, consultas lentas **depois de cargas em massa** (rode §ANALYZE§ após cargas). Para colunas correlacionadas, há **estatísticas estendidas** (§CREATE STATISTICS§; documentação, não executado).

### MVCC, VACUUM e inchaço (PostgreSQL)
Cada §UPDATE§/§DELETE§ deixa versões antigas ("tuplas mortas") até o §VACUUM§ limpar. Medido: tabela de 100.000 linhas, §UPDATE v SET x = 1§ (todas as linhas) gerou **100.000 tuplas mortas** (§n_dead_tup§); após §VACUUM v§, **0**; o tamanho no disco **permaneceu 7.080 kB**, pois o §VACUUM§ comum **reutiliza** o espaço dentro da tabela, mas **não o devolve** ao sistema (§VACUUM FULL§ reescreve a tabela e devolve, com **bloqueio exclusivo**: evite em horário de uso). Consequências: **atualizações em massa** dobram temporariamente a tabela; **transações longas** impedem a limpeza (as versões antigas ainda podem ser vistas); o **autovacuum** precisa estar ligado e bem ajustado em tabelas muito escritas. O mapa de visibilidade mantido pelo VACUUM é o que permite *Index Only Scans*.
No MySQL/InnoDB, atualizações são **no lugar**, com versões antigas no **undo**; o cuidado é com **transações longas**, que seguram o undo e podem inchar o espaço de undo.

### Custo de escrita
Cada índice é mantido a cada escrita. Medido: **300.000 inserções**: **~1,1 s** sem índices e **~7,4 s** com quatro índices (**~6,8 vezes**). Estratégias: **menos índices** em tabelas de alta escrita; **cargas em massa** (§COPY§, lotes) com índices criados **depois** da carga; evitar atualizar colunas indexadas sem necessidade; **HOT updates** (o PostgreSQL atualiza sem tocar índices quando nenhuma coluna indexada muda e há espaço na página; ajuda o **fillfactor** menor em tabelas muito atualizadas; documentação).

### Configuração: o mínimo que importa
Os padrões são conservadores (medido: §shared_buffers§ 128 MB, §work_mem§ 4 MB, §max_connections§ 100). Em servidor real, ajuste conforme a memória e a carga: §shared_buffers§ (memória de cache do banco, tipicamente uma fração da RAM), §work_mem§ (por operação, multiplicada pelo número de operações e conexões!), §effective_cache_size§ (informação para o planejador), §maintenance_work_mem§, parâmetros do autovacuum e §max_connections§ (use um **pool de conexões**; muitas conexões custam memória). **Mudanças de configuração** exigem medição e plano de reversão; ferramentas de sugestão ajudam, mas não substituem testes.

### Conexões
Cada conexão do PostgreSQL é um **processo** com memória própria: milhares de conexões diretas **derrubam o desempenho**. Use um **pool** na aplicação e/ou um *pooler* externo (PgBouncer, documentação; não executado). Em MySQL, as conexões são **threads**, com custo menor, mas o pool continua recomendado.

### Cache da aplicação e do banco
O banco já usa memória (cache de blocos). Resultados medidos mostram **hits e reads** (§Buffers§): a primeira execução costuma ler do disco; as seguintes, da memória. Por isso, **compare execuções repetidas** e distinga "frio" de "quente". Para dados que mudam pouco e são lidos muito, avalie um **cache externo** (curso C3.8).`,
  concepts: [
    { term: 'pg_stat_statements', def: 'Extensão que acumula estatísticas de execução (chamadas, tempo) por consulta normalizada.' },
    { term: 'Consulta lenta (slow query)', def: 'Consulta cujo tempo excede um limite configurado e é registrada em log.' },
    { term: 'Paginação por chave (keyset)', def: 'Paginar com WHERE sobre a última chave vista, evitando o custo de OFFSET.' },
    { term: 'ANALYZE', def: 'Comando que coleta estatísticas das colunas para o planejador.' },
    { term: 'Autovacuum', def: 'Processo automático do PostgreSQL que executa VACUUM e ANALYZE.' },
    { term: 'VACUUM', def: 'Limpeza que remove tuplas mortas e marca o espaço para reutilização.' },
    { term: 'VACUUM FULL', def: 'Reescreve a tabela devolvendo espaço ao sistema, com bloqueio exclusivo.' },
    { term: 'Inchaço (bloat)', def: 'Espaço ocupado por versões mortas ou vazias em tabelas e índices.' },
    { term: 'HOT update', def: 'Atualização do PostgreSQL que evita tocar índices quando nenhuma coluna indexada muda.' },
    { term: 'Pool de conexões', def: 'Conjunto reutilizável de conexões ao banco, que limita o número de processos simultâneos.' }
  ],
  examples: R`**Analogia:** otimizar é como **emagrecer com acompanhamento médico**: primeiro você mede (balança e exames), identifica o que mais pesa (consultas que consomem mais tempo total), muda **uma** coisa por vez e mede de novo. Paginar com OFFSET é "contar de novo, a partir da primeira página, até chegar à página 20.000" a cada visita; a paginação por chave é **marcar a página** e continuar de lá. O VACUUM é a **faxina** que libera as prateleiras ocupadas por produtos antigos: as prateleiras ficam disponíveis para novos produtos, mas o armazém **não encolhe** sozinho.

**Exemplo 1: OFFSET x chave.** ~155 ms contra ~0,16 ms para chegar às mesmas 20 linhas.

**Exemplo 2: estatística velha.** Estimativa 1, realidade 50.000.

**Exemplo 3: custo de escrita.** 1,1 s sem índices e 7,4 s com quatro.`,
  code: [
    { title: 'OFFSET x paginação por chave (SQL, plano medido no PostgreSQL 17)', lang: 'sql', code: R`EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, BUFFERS OFF)
SELECT id FROM pedidos ORDER BY id LIMIT 20 OFFSET 400000;
-- Index Only Scan ... actual rows=400020 ... Execution Time: ~155 ms

EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, BUFFERS OFF)
SELECT id FROM pedidos WHERE id > 400000 ORDER BY id LIMIT 20;
-- Index Only Scan ... actual rows=20 ... Execution Time: ~0,16 ms`, notes: [{ l: '3', t: 'O OFFSET lê e descarta 400.000 entradas do índice.' }, { l: '7', t: 'Com a chave, o índice vai direto ao ponto e lê só 20 linhas.' }] },
    { title: 'VACUUM, tuplas mortas e custo de escrita (SQL, saída medida)', lang: 'sql', code: R`CREATE TABLE v (id int PRIMARY KEY, x int);
INSERT INTO v SELECT g, 0 FROM generate_series(1, 100000) g;
UPDATE v SET x = 1;
SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'v';   -- 100000 | 100000
VACUUM v;
SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'v';   -- 100000 | 0
SELECT pg_size_pretty(pg_relation_size('v'));                                 -- 7080 kB (antes e depois)

-- 300.000 linhas: sem índices x com 4 índices
\timing on
INSERT INTO w1 SELECT g, g % 100, g % 1000, g % 7 FROM generate_series(1, 300000) g;  -- ~1,1 s
INSERT INTO w2 SELECT g, g % 100, g % 1000, g % 7 FROM generate_series(1, 300000) g;  -- ~7,4 s`, notes: [{ l: '3', t: 'Atualizar todas as linhas cria uma versão nova de cada uma.' }, { l: '5', t: 'O VACUUM limpa as mortas, mas o tamanho não diminui.' }, { l: '11', t: 'A mesma carga com quatro índices levou cerca de 6,8 vezes mais.' }] }
  ],
  bestPractices: ['Meça antes e depois de cada mudança e mude uma coisa por vez.', 'Otimize o que consome mais tempo total, não só o mais lento isolado.', 'Prefira paginação por chave a OFFSET em listas grandes.', 'Rode ANALYZE depois de cargas em massa e mantenha o autovacuum saudável.', 'Evite transações longas e atualizações em massa em horário de pico.', 'Use pool de conexões e limite max_connections.'],
  mistakes: ['Criar índices "no escuro" sem medir.', 'Usar OFFSET grande em telas de listagem.', 'Desligar o autovacuum para "ganhar desempenho".', 'Esperar que o VACUUM devolva espaço ao sistema operacional.', 'Ajustar work_mem muito alto sem considerar o número de conexões.', 'Comparar execução fria com execução quente como se fossem iguais.'],
  market: R`Quase todo time de backend enfrenta, mais cedo ou mais tarde, uma consulta que degrada com o crescimento dos dados. Saber seguir um método, ler planos, escolher paginação por chave e manter o banco saudável (VACUUM, estatísticas, conexões) é o que diferencia respostas de plantão de soluções duradouras.`,
  summary: R`Otimizar é medir, diagnosticar, mudar uma coisa e medir de novo, começando pelo que consome mais tempo total. Medido em 500.000 linhas: OFFSET de 400.000 levou ~155 ms (400.020 linhas lidas) e a paginação por chave ~0,16 ms (20 linhas). Estatísticas velhas estimaram 1 linha contra 50.000 reais. O §UPDATE§ em massa gerou 100.000 tuplas mortas que o §VACUUM§ limpou sem reduzir o arquivo (7.080 kB). Quatro índices tornaram 300 mil inserções ~6,8 vezes mais lentas. Use pool de conexões e observe com §pg_stat_statements§.`,
  refs: [REF3.perfTips, REF3.planStats, REF3.vacuuming, REF3.pgStatStatements],
  cards: [
    { q: 'Qual o método de otimização?', a: 'Medir, diagnosticar, mudar uma coisa e medir de novo, começando pelo que mais consome tempo total.' },
    { q: 'Por que a paginação por chave supera o OFFSET grande?', a: 'O OFFSET lê e descarta todas as linhas puladas; a chave vai direto ao ponto (medido: ~155 ms contra ~0,16 ms).' },
    { q: 'O que o VACUUM faz e não faz?', a: 'Remove tuplas mortas e libera espaço para reutilização, mas não devolve espaço ao sistema operacional (isso é o VACUUM FULL).' },
    { q: 'Quando rodar ANALYZE manualmente?', a: 'Depois de cargas em massa ou grandes mudanças de distribuição, para o planejador ter estatísticas corretas.' },
    { q: 'Por que usar pool de conexões?', a: 'Cada conexão do PostgreSQL é um processo com memória própria; o pool limita e reutiliza conexões.' }
  ]
},
{
  id: 'pgm-08', moduleId: 'm3', order: 8, minutes: 80, tags: ['particionamento', 'replicação', 'streaming', 'réplica de leitura', 'alta disponibilidade'],
  title: 'Particionamento e replicação: dividir tabelas e copiar dados entre servidores',
  objectives: ['Particionar uma tabela por faixa e verificar a poda de partições no plano', 'Explicar vantagens, custos e limites do particionamento', 'Configurar e verificar uma réplica física por streaming no PostgreSQL', 'Diferenciar replicação síncrona e assíncrona, atraso (lag) e réplica de leitura', 'Comparar replicação, alta disponibilidade e backup'],
  intro: R`Quando uma tabela cresce muito, ou quando um servidor só não basta (por **disponibilidade** ou por **leituras**), entram duas técnicas: **particionamento** (dividir uma tabela grande em pedaços menores, no mesmo servidor) e **replicação** (copiar dados para outros servidores). Esta aula **executa** as duas no PostgreSQL 17.12: três partições por mês com poda comprovada em plano, e uma **réplica por streaming** real, em contêiner, com verificação de leitura somente e atraso de 0 bytes.`,
  theory: R`### Particionamento declarativo
Uma tabela **particionada** é uma tabela "lógica" cujas linhas ficam fisicamente em **partições** (tabelas filhas). O PostgreSQL oferece partição por **faixa** (§RANGE§, típico para datas), por **lista** (§LIST§) e por **hash** (§HASH§).
§§§
CREATE TABLE log_p (id bigserial, criado date NOT NULL, msg text) PARTITION BY RANGE (criado);
CREATE TABLE log_p_2026_01 PARTITION OF log_p FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE log_p_2026_02 PARTITION OF log_p FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE log_p_2026_03 PARTITION OF log_p FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
§§§
Medido, com 90.000 linhas distribuídas por data: janeiro **31.362**, fevereiro **28.308** e março **30.330** (§tableoid::regclass§ mostra a partição de cada linha).

### Poda de partições (partition pruning)
Quando o §WHERE§ filtra pela **chave de partição**, o planejador **ignora** as partições que não podem conter resultados. Medido: §WHERE criado >= '2026-02-10' AND criado < '2026-02-20'§ fez **Seq Scan apenas em §log_p_2026_02§**; uma consulta **sem** a chave (§WHERE msg = 'x'§) tocou **as três** partições (Append sobre as três). Lição: **inclua a chave de partição** nas consultas importantes.

### Inserções fora das faixas e manutenção
- Medido: inserir uma linha com §criado = '2027-01-01'§ falhou com **no partition of relation "log_p" found for row** (não havia partição). Crie as partições **antes** (automatize: rotina mensal) ou use uma partição §DEFAULT§.
- **Remover dados antigos** vira uma operação **barata**: §ALTER TABLE log_p DETACH PARTITION log_p_2026_01§ separa a partição (que pode ser arquivada ou descartada com §DROP TABLE§) **sem varrer milhões de linhas**. Medido: depois do §DETACH§ de janeiro, o total caiu de 90.000 para **58.638** (90.000 − 31.362). Compare com um §DELETE§ gigante, que gera tuplas mortas e trabalho de VACUUM.
- **Índices** em tabelas particionadas são criados **por partição** (a definição no pai propaga). **Chaves primárias e únicas** em tabelas particionadas **precisam incluir a chave de partição**.

### Quando particionar (e quando não)
**Vale a pena** quando: a tabela é **muito grande** (centenas de milhões de linhas ou bem maior que a memória), os dados têm **ciclo de vida** por tempo (retenção), consultas filtram quase sempre pela chave de partição, e manutenção (VACUUM, índices) fica pesada demais em uma tabela só. **Não vale** se as consultas não usam a chave, se a tabela cabe confortavelmente na memória, ou como substituto de índices bem escolhidos. Particionar **não acelera** automaticamente: acrescenta **complexidade** (planejamento mais lento com muitas partições, restrições nas chaves). No MySQL, o particionamento existe (§PARTITION BY RANGE§, etc.), com **restrições** (todas as chaves únicas devem incluir as colunas de partição; não executado aqui).

### Replicação: para quê
- **Alta disponibilidade (HA)**: se o primário cair, uma réplica **assume**.
- **Escala de leitura**: consultas pesadas ou relatórios vão para réplicas.
- **Recuperação e manutenção**: testar migrações, backups em réplicas.
- **Distribuição geográfica**.
**Replicação não é backup**: um §DROP TABLE§ ou um dado corrompido **se replica** para as cópias. Backup (aula pgm-09) protege contra erro humano; replicação protege contra falha de servidor.

### Replicação física por streaming (PostgreSQL)
O primário grava no **WAL** (registro de escrita antecipada); réplicas **recebem e reaplicam** o WAL. A réplica é uma **cópia byte a byte** do cluster. O experimento deste curso (todos medidos):
1. **Primário** (§c3-pg17§): §wal_level§ = §replica§ e §max_wal_senders§ = **10** (padrões do 17).
2. Liberar a replicação no §pg_hba.conf§ (linha §host replication ...§) e recarregar a configuração.
3. A cópia base: §pg_basebackup -h c3-pg17 -U postgres -D /tmp/rep -R -X stream -c fast§. A opção **§-R§** cria os arquivos de configuração de **standby** (§standby.signal§ e §primary_conninfo§); §-X stream§ transmite o WAL durante a cópia; **§-c fast§** força um checkpoint imediato. **Observação do laboratório:** a primeira tentativa **sem** §-c fast§ ficou parada por mais de 5 minutos e foi interrompida (a causa provável é a espera do checkpoint "distribuído", não confirmada); com §-c fast§, **concluiu**.
4. Subir a réplica (porta 5433, em outro contêiner da mesma rede).
Verificações medidas: na réplica, §pg_is_in_recovery()§ = **t**; uma linha inserida no primário (§42§) apareceu na réplica **segundos depois**; §INSERT§ na réplica falhou com **cannot execute INSERT in a read-only transaction**; no primário, §pg_stat_replication§ mostrou **state = streaming**, **sync_state = async** e atraso de **0 bytes** (§pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn)§).

### Síncrona x assíncrona e atraso (lag)
- **Assíncrona** (padrão): o primário confirma o commit **sem esperar** a réplica: **mais rápida**, mas se o primário falhar, **as últimas transações podem não estar na réplica** (perda de dados pequena).
- **Síncrona** (§synchronous_standby_names§): o commit **espera** a réplica confirmar: **sem perda**, mas **mais lenta** e **dependente** da disponibilidade da réplica.
- **Lag**: a diferença entre o primário e a réplica. **Leituras em réplica podem ser antigas** (consistência eventual): evite ler da réplica logo depois de escrever no primário se precisar do dado novo (use o primário nesses casos).

### Failover e promoção
Para promover uma réplica a primário: §pg_ctl promote§ ou §SELECT pg_promote()§ (documentação; **não executado** aqui). Automação de HA (Patroni, repmgr, serviços gerenciados) cuida de **detecção de falha, eleição e reconfiguração das aplicações**; o risco é o **split-brain** (dois primários ao mesmo tempo). Este curso apresenta o conceito; a prática de HA aparece em infraestrutura e arquitetura (ondas C6 e C8).

### Replicação lógica e MySQL
- **Lógica (PostgreSQL)**: publica **mudanças em tabelas** específicas (publicações e assinaturas), entre versões ou bancos diferentes; útil em migrações e integrações (documentação; não executado).
- **MySQL**: replicação baseada em **binlog** (assíncrona, semissíncrona, **Group Replication**, **InnoDB Cluster**); a configuração usa §CHANGE REPLICATION SOURCE TO§ e usuários de replicação (documentação do 8.4; **não executado** neste laboratório).

### Leitura em réplicas na aplicação
Divida as conexões em **escrita (primário)** e **leitura (réplicas)** e use as réplicas apenas para consultas que **toleram atraso** (relatórios, listagens). Em frameworks e ORMs, isso costuma ser configurável por "roteamento de leitura". Monitore o **lag** e tenha um plano para a réplica **atrasada demais**.`,
  concepts: [
    { term: 'Particionamento', def: 'Divisão de uma tabela grande em partições menores, no mesmo servidor.' },
    { term: 'Poda de partições', def: 'Otimização em que o planejador ignora as partições que não podem conter resultados.' },
    { term: 'Chave de partição', def: 'Coluna que define em qual partição cada linha é armazenada.' },
    { term: 'DETACH PARTITION', def: 'Comando que separa uma partição da tabela pai, permitindo arquivá-la ou descartá-la rapidamente.' },
    { term: 'WAL', def: 'Registro de escrita antecipada do PostgreSQL, base de recuperação e replicação.' },
    { term: 'Réplica por streaming', def: 'Servidor que recebe e reaplica o WAL do primário continuamente.' },
    { term: 'Replicação assíncrona', def: 'Modo em que o primário confirma o commit sem esperar a réplica.' },
    { term: 'Replicação síncrona', def: 'Modo em que o commit só é confirmado depois de a réplica confirmar o recebimento.' },
    { term: 'Lag de replicação', def: 'Atraso entre as mudanças do primário e sua aplicação na réplica.' },
    { term: 'Failover', def: 'Promoção de uma réplica a primário quando o primário falha.' }
  ],
  examples: R`**Analogia:** o particionamento é **dividir um arquivo gigante em pastas por mês**: para consultar fevereiro, você abre só a pasta de fevereiro, e arquivar janeiro é **levar a pasta inteira** para o arquivo morto. A replicação é ter **cópias do livro-razão em outras filiais**, atualizadas por mensageiros: ajudam se a matriz pegar fogo, mas **se alguém rabiscar o livro-razão, o rabisco também é copiado**: por isso a cópia **não** substitui o backup.

**Exemplo 1: poda.** A consulta por fevereiro varreu só a partição de fevereiro; a consulta sem a chave varreu as três.

**Exemplo 2: réplica.** O dado inserido no primário apareceu na réplica; o INSERT na réplica foi recusado (somente leitura); atraso de 0 bytes.

**Exemplo 3: arquivar.** DETACH PARTITION de janeiro tirou 31.362 linhas da tabela principal sem varrê-las.`,
  code: [
    { title: 'Particionamento por faixa e poda (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`CREATE TABLE log_p (id bigserial, criado date NOT NULL, msg text) PARTITION BY RANGE (criado);
CREATE TABLE log_p_2026_01 PARTITION OF log_p FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE log_p_2026_02 PARTITION OF log_p FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE log_p_2026_03 PARTITION OF log_p FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

EXPLAIN (COSTS OFF) SELECT count(*) FROM log_p WHERE criado >= '2026-02-10' AND criado < '2026-02-20';
-- Seq Scan on log_p_2026_02   (só uma partição)
EXPLAIN (COSTS OFF) SELECT count(*) FROM log_p WHERE msg = 'x';
-- Append: Seq Scan nas três partições

INSERT INTO log_p (criado, msg) VALUES ('2027-01-01', 'fora');
-- ERROR: no partition of relation "log_p" found for row
ALTER TABLE log_p DETACH PARTITION log_p_2026_01;   -- 90000 -> 58638 linhas na tabela pai`, notes: [{ l: '6', t: 'A condição na chave de partição permite podar duas das três partições.' }, { l: '8', t: 'Sem a chave, nenhuma partição pode ser descartada.' }, { l: '12', t: 'Remover dados antigos vira um comando barato de metadados.' }] },
    { title: 'Réplica por streaming (bash e SQL, saída medida)', lang: 'bash', code: R`# primário: liberar a replicação e recarregar
echo "host replication all 0.0.0.0/0 scram-sha-256" >> $PGDATA/pg_hba.conf
psql -U postgres -c "SELECT pg_reload_conf()"

# réplica (outro contêiner na mesma rede): cópia base com standby configurado (-R)
PGPASSWORD=lab pg_basebackup -h c3-pg17 -U postgres -D /tmp/rep -R -X stream -c fast
pg_ctl -D /tmp/rep -o "-p 5433" start

# verificações
psql -p 5433 -U postgres -tAc "SELECT pg_is_in_recovery()"        # t
psql -p 5433 -U postgres -tAc "SELECT x FROM tuning.repl_teste"   # 42 (inserido no primário)
psql -p 5433 -U postgres -c "INSERT INTO tuning.repl_teste VALUES (1)"
# ERROR: cannot execute INSERT in a read-only transaction
psql -U postgres -tAc "SELECT state, sync_state FROM pg_stat_replication"   # streaming | async`, notes: [{ l: '2', t: 'Restrinja o endereço em produção; 0.0.0.0/0 é só de laboratório.' }, { l: '6', t: '-R cria a configuração de standby; -c fast evita esperar o checkpoint distribuído.' }, { l: '13', t: 'A réplica é somente leitura.' }] }
  ],
  bestPractices: ['Particione apenas quando houver necessidade real (tamanho, retenção, manutenção).', 'Inclua a chave de partição nas consultas importantes e automatize a criação de partições.', 'Use DETACH/DROP de partições para retenção de dados em vez de DELETE grande.', 'Trate a réplica como somente leitura e tolerante a atraso e monitore o lag.', 'Nunca confunda replicação com backup.', 'Restrinja o acesso de replicação por endereço e use TLS e senhas fortes.'],
  mistakes: ['Particionar tabelas pequenas ou sem usar a chave nas consultas.', 'Esquecer de criar a partição do próximo período e perder escritas.', 'Esperar que a réplica sirva como backup.', 'Ler da réplica logo depois de escrever e estranhar o dado antigo.', 'Usar replicação síncrona sem planejar a indisponibilidade da réplica.', 'Promover uma réplica sem plano de reconfiguração (split-brain).'],
  market: R`Particionamento por tempo e réplicas de leitura são recursos usuais de qualquer banco em produção que cresce. Entender o que a replicação garante (e o que não garante) é pergunta clássica de entrevistas de arquitetura e causa raiz de incidentes envolvendo "o backup também tinha o erro".`,
  summary: R`Particionar por faixa divide a tabela (31.362, 28.308 e 30.330 linhas) e permite podar partições quando a consulta usa a chave (medido: uma partição varrida contra três). Fora das faixas, o INSERT falha; §DETACH PARTITION§ remove dados antigos de forma barata (90.000 para 58.638). A replicação por streaming foi executada: réplica em recuperação, dado replicado, escrita recusada (somente leitura), §streaming/async§ e atraso de 0 bytes. Assíncrona é rápida e pode perder o final; síncrona não perde, mas é mais lenta. Replicação não é backup.`,
  refs: [REF3.partitioning, REF3.highAvail, REF3.standby, REF3.pgBasebackup, REF3.mysqlPartitioning, REF3.mysqlReplication],
  cards: [
    { q: 'O que é poda de partições?', a: 'O planejador ignora as partições que não podem conter resultados quando o filtro usa a chave de partição.' },
    { q: 'Por que DETACH PARTITION é melhor que DELETE para retenção?', a: 'Separa a partição por metadados, sem varrer nem gerar tuplas mortas.' },
    { q: 'Qual a diferença entre replicação assíncrona e síncrona?', a: 'Assíncrona confirma sem esperar a réplica (pode perder o final); síncrona espera a réplica (sem perda, mais lenta).' },
    { q: 'Replicação substitui backup?', a: 'Não: erros e exclusões também são replicados; o backup protege contra erro humano.' },
    { q: 'O que significa pg_is_in_recovery() = true?', a: 'O servidor é uma réplica (standby), somente leitura, reaplicando o WAL do primário.' }
  ]
},
{
  id: 'pgm-09', moduleId: 'm3', order: 9, minutes: 80, tags: ['backup', 'restauração', 'pg_dump', 'mysqldump', 'PITR', 'RPO', 'RTO'],
  title: 'Backup e restauração: pg_dump, mysqldump, WAL e o teste que importa (restaurar)',
  objectives: ['Escolher a estratégia de backup por RPO e RTO (lógico, físico e recuperação pontual)', 'Executar e testar §pg_dump§/§pg_restore§ e §mysqldump§', 'Identificar o que um dump parcial não inclui (extensões) e corrigir', 'Explicar WAL, arquivamento e recuperação pontual (PITR)', 'Montar um plano de backup verificado, com retenção, criptografia e testes de restauração'],
  intro: R`**Um backup que nunca foi restaurado é uma esperança, não um backup.** Esta aula fecha o curso com a disciplina que protege o negócio: definir **quanto de dado você aceita perder (RPO)** e **quanto tempo aceita ficar fora (RTO)**, escolher a técnica, executar e, principalmente, **testar a restauração**. Os experimentos foram feitos no PostgreSQL 17.12 (dump e restauração de 500.000 linhas com 20 índices) e no MySQL 8.4.13, e **revelaram um erro real** de restauração que ensina muito.`,
  theory: R`### RPO e RTO
- **RPO** (*Recovery Point Objective*): **quanto dado** o negócio aceita perder, medido em tempo ("até 5 minutos de transações").
- **RTO** (*Recovery Time Objective*): **quanto tempo** o negócio aceita ficar fora ("restaurar em até 1 hora").
Essas duas metas **definem a estratégia e o custo**. RPO de segundos exige WAL arquivado ou réplica síncrona; RPO de 24 h aceita um backup noturno.

### Tipos de backup
1. **Lógico**: exporta **o conteúdo em forma de comandos ou formato próprio** (§pg_dump§, §mysqldump§). Vantagens: **portável entre versões** e arquiteturas, permite restaurar **um objeto**; desvantagens: **lento** para bancos grandes, restauração reconstrói índices.
2. **Físico**: cópia dos **arquivos do cluster** (§pg_basebackup§ no PostgreSQL; ferramentas como Percona XtraBackup e MySQL Enterprise Backup). Vantagens: **rápido**, restauração direta; desvantagens: **mesma versão/arquitetura** e geralmente cluster **inteiro**.
3. **Recuperação pontual (PITR)**: backup físico **mais o WAL arquivado** (PostgreSQL) ou **binlogs** (MySQL) permite restaurar o banco **em qualquer instante** entre o backup e o último log (exemplo: "um minuto antes do DROP"). Configuração: §archive_mode§, §archive_command§ e §restore_command§ (documentação; **não executado** aqui).
4. **Snapshots** de disco/nuvem: rápidos, mas exigem **consistência** (quiesce ou integração com o banco).

### pg_dump e pg_restore
Medido (esquema §tuning§ com 500.000 pedidos e 20 índices):
§§§
pg_dump -U postgres -Fc -n tuning -f /tmp/tuning.dump postgres     # formato "custom": 20.724.384 bytes
createdb restaurado
pg_restore -U postgres -d restaurado /tmp/tuning.dump
§§§
Formatos: §-Fp§ (texto SQL), §-Fc§ (custom, comprimido, **permite restauração seletiva e paralela com §pg_restore -j§**), §-Fd§ (diretório, paralelo) e §-Ft§ (tar). Opções úteis: §-n§ (esquema), §-t§ (tabela), §--schema-only§, §--data-only§, §--clean§. O §pg_dump§ obtém uma **cópia consistente** (snapshot) **sem bloquear** leituras e escritas.
**Resultado medido da restauração (3 tentativas):**
1. **Sem as extensões**: **500.000 linhas** e **18 dos 20 índices** foram restaurados, e o §pg_restore§ relatou **2 erros ignorados**: a restrição de exclusão (**data type integer has no default operator class for access method "gist"**) e o índice de trigramas (a classe de operadores não existia). Causa: o dump foi feito **só do esquema §tuning§ (§-n tuning§)** e **não inclui §CREATE EXTENSION§**; no laboratório, as extensões §btree_gist§ e §pg_trgm§ tinham sido criadas **dentro** do esquema §tuning§ (porque o §search_path§ apontava para ele).
2. **Extensão no esquema errado**: criar §pg_trgm§ no esquema §public§ **não resolveu**: o dump referencia §tuning.gin_trgm_ops§, e o erro foi **operator class "tuning.gin_trgm_ops" does not exist** (1 erro; as 500.000 linhas e a restrição de exclusão ficaram corretas, 19 índices).
3. **Extensões no mesmo esquema**: com §CREATE SCHEMA tuning§ e §CREATE EXTENSION btree_gist SCHEMA tuning§ e §pg_trgm SCHEMA tuning§ **antes** do restore, o resultado foi **500.000 linhas e 20 índices**; o único aviso foi "**schema "tuning" already exists**" (inofensivo, pois nós o criamos antes).
**Lição:** dumps parciais **não levam extensões** nem objetos de outros esquemas, e a restauração precisa **recriar as extensões no mesmo esquema** em que o dump as referencia. **Só se descobre isso restaurando.**
Outros cuidados: **papéis (roles)** e **permissões globais** não vão em um dump de banco (use §pg_dumpall --globals-only§); o **banco de destino** deve existir; dados de **sequências** e **ordem de dependências** são tratados pelo restore.

### mysqldump e restauração no MySQL
Medido: §mysqldump -uroot -plab --single-transaction lab produtos§ gerou um arquivo de **2.307 bytes** (comandos §CREATE TABLE§ e §INSERT§); restaurado em outro banco (§lab2§), a tabela voltou com **4 linhas**. §--single-transaction§ obtém um snapshot consistente de tabelas **InnoDB** sem bloquear. Opções: §--routines§, §--triggers§, §--events§, §--all-databases§, §--set-gtid-purged§. **Não passe senha na linha de comando** em ambientes reais (use arquivo de opções protegido). Para bancos grandes, prefira backup físico e binlogs.

### WAL, binlog e o que cada um garante
O PostgreSQL grava toda mudança no **WAL** antes de gravar nos arquivos de dados; é a base da recuperação após queda, da replicação e do PITR. O MySQL/InnoDB tem o **redo log** (recuperação após queda) e o **binlog** (replicação e PITR). **Arquivar** esses logs e **guardá-los fora do servidor** é o que torna possível o PITR.

### Estratégia: a regra 3-2-1
- **3** cópias dos dados (produção + 2 backups),
- em **2** tipos de mídia ou sistemas diferentes,
- com **1** cópia **fora do local** (outra região/conta, de preferência **imutável** para resistir a ransomware).
Acrescente: **criptografia** (em repouso e em trânsito), **retenção** definida (diários por 7 a 30 dias, semanais, mensais...), **controle de acesso** separado do ambiente de produção, **monitoramento** (alerta se o backup falhar ou ficar velho) e **documentação** do procedimento.

### O teste que importa: restaurar
1. **Teste a restauração periodicamente** (automatize: restaurar em um ambiente isolado, validar contagens e consultas de verificação).
2. **Meça o RTO real** (quanto tempo levou, incluindo download, restore e criação de índices).
3. **Verifique a integridade** (checksums, comparação de contagens, aplicação de smoke tests).
4. **Ensaie o desastre** (simule a perda do primário, a restauração PITR e a troca das aplicações).
5. **Registre os resultados** e corrija o plano.

### Backup, replicação e alta disponibilidade, em resumo
| Mecanismo | Protege contra | Não protege contra |
|---|---|---|
| Réplica / HA | falha de servidor ou datacenter | DROP acidental, corrupção lógica, ransomware (replicam) |
| Backup lógico/físico | erro humano, corrupção (até o ponto do backup) | perdas depois do último backup |
| PITR | erro humano com granularidade de tempo | falta de logs arquivados |

### Segurança dos backups
Backups contêm **todos os dados**: **criptografe**, restrinja o acesso, **não os deixe em pastas públicas** e **apague os que expiraram**. Dados pessoais em backup também estão sujeitos às regras de **privacidade** e retenção.`,
  concepts: [
    { term: 'RPO', def: 'Recovery Point Objective: quantidade máxima de dados, em tempo, que se aceita perder.' },
    { term: 'RTO', def: 'Recovery Time Objective: tempo máximo aceitável para restaurar o serviço.' },
    { term: 'Backup lógico', def: 'Exportação do conteúdo do banco em comandos ou formato próprio (pg_dump, mysqldump).' },
    { term: 'Backup físico', def: 'Cópia dos arquivos do cluster, rápida e dependente da versão.' },
    { term: 'PITR', def: 'Recuperação pontual: restaurar o banco a um instante específico usando backup e logs.' },
    { term: 'pg_restore', def: 'Ferramenta que restaura dumps nos formatos custom, diretório e tar do PostgreSQL.' },
    { term: 'Regra 3-2-1', def: 'Três cópias, em dois tipos de mídia, com uma fora do local.' },
    { term: 'Binlog', def: 'Registro binário de alterações do MySQL, usado em replicação e PITR.' },
    { term: 'Dump parcial', def: 'Backup de apenas um esquema ou tabela, que pode omitir extensões e objetos globais.' },
    { term: 'Teste de restauração', def: 'Restaurar o backup em ambiente isolado para validar integridade e medir o RTO real.' }
  ],
  examples: R`**Analogia:** um backup sem teste de restauração é um **extintor que nunca foi conferido**: você só descobre que está vazio no incêndio. RPO é "quanto das últimas anotações eu aceito perder"; RTO é "em quanto tempo preciso voltar a funcionar". O dump parcial é como **mudar de casa levando só os móveis do quarto**: a cama chega, mas **a instalação elétrica (a extensão) ficou para trás**, e o abajur (a restrição) não funciona.

**Exemplo 1: dump e restore.** 500.000 linhas restauradas a partir de um arquivo de 20,7 MB; 20 índices só depois de recriar as extensões.

**Exemplo 2: o erro que só aparece restaurando.** A restrição de exclusão e o índice de trigramas falharam por falta das extensões btree_gist e pg_trgm.

**Exemplo 3: MySQL.** Um dump de 2.307 bytes restaurou 4 linhas em outro banco.`,
  code: [
    { title: 'pg_dump, pg_restore e a extensão esquecida (bash, saída medida)', lang: 'bash', code: R`# backup lógico do esquema "tuning" (formato custom)
pg_dump -U postgres -Fc -n tuning -f /tmp/tuning.dump postgres    # 20.724.384 bytes

# restauração em um banco novo, SEM as extensões
createdb -U postgres restaurado2
pg_restore -U postgres -d restaurado2 /tmp/tuning.dump
# pg_restore: error: could not execute query: ERROR: data type integer has no default operator class
#             for access method "gist"   (constraint EXCLUDE; extensão btree_gist ausente)
# + o índice de trigramas (pg_trgm ausente): "errors ignored on restore: 2"

# correção: recriar as extensões NO MESMO ESQUEMA do dump, antes de restaurar
createdb -U postgres restaurado4
psql -U postgres -d restaurado4 -c "CREATE SCHEMA tuning" \
  -c "CREATE EXTENSION btree_gist SCHEMA tuning" -c "CREATE EXTENSION pg_trgm SCHEMA tuning"
pg_restore -U postgres -d restaurado4 /tmp/tuning.dump      # único aviso: schema "tuning" already exists

# verificação
psql -U postgres -d restaurado4 -tAc "SELECT count(*) FROM tuning.pedidos"                        # 500000
psql -U postgres -d restaurado4 -tAc "SELECT count(*) FROM pg_indexes WHERE schemaname='tuning'"  # 20`, notes: [{ l: '2', t: '-Fc: formato custom (comprimido e restaurável de forma seletiva).' }, { l: '7', t: 'O erro só aparece na restauração: testar é obrigatório.' }, { l: '10', t: 'As extensões precisam existir, e no mesmo esquema que o dump referencia.' }, { l: '16', t: 'Sempre verifique contagens e índices depois de restaurar.' }] },
    { title: 'mysqldump e restauração (bash, saída medida no MySQL 8.4)', lang: 'bash', code: R`mysqldump -uroot -p --single-transaction lab produtos > produtos.sql    # 2.307 bytes
mysql -uroot -p -e "CREATE DATABASE lab2"
mysql -uroot -p lab2 < produtos.sql
mysql -uroot -p -N -e "SELECT COUNT(*) FROM lab2.produtos"             # 4`, notes: [{ l: '1', t: '--single-transaction dá um snapshot consistente de tabelas InnoDB sem bloquear.' }, { l: '4', t: 'Confirme a contagem depois de restaurar.' }] }
  ],
  bestPractices: ['Defina RPO e RTO com o negócio e escolha a técnica a partir deles.', 'Teste a restauração com frequência e meça o RTO real.', 'Combine backup base e arquivamento de logs para PITR quando o RPO for pequeno.', 'Aplique a regra 3-2-1, criptografe e guarde uma cópia imutável fora do ambiente.', 'Inclua extensões e papéis no plano de restauração.', 'Monitore o sucesso e a idade dos backups.'],
  mistakes: ['Nunca testar a restauração.', 'Achar que a réplica é o backup.', 'Esquecer extensões, papéis e permissões em dumps parciais.', 'Guardar backups no mesmo servidor e disco do banco.', 'Deixar backups sem criptografia ou acessíveis a todos.', 'Não monitorar falhas silenciosas de backup.'],
  market: R`Incidentes de perda de dados quase sempre revelam backups nunca testados. Profissionais que definem RPO e RTO, automatizam testes de restauração e sabem fazer PITR são valiosos em operações e em empresas reguladas. A pergunta "quando foi a última vez que você restaurou?" é um clássico.`,
  summary: R`Defina RPO e RTO e escolha entre backup lógico, físico e PITR (backup base mais WAL ou binlog). Medido: §pg_dump -Fc§ do esquema (20.724.384 bytes) restaurou 500.000 linhas, mas só 18 dos 20 índices (2 erros) porque o dump parcial **não inclui as extensões** §btree_gist§ e §pg_trgm§; recriá-las **no mesmo esquema** antes do restore produziu 20 índices. Só a restauração revela isso. O §mysqldump --single-transaction§ gerou 2.307 bytes e restaurou 4 linhas. Aplique a regra 3-2-1, criptografe, monitore e **teste restaurações** regularmente. Réplica não é backup.`,
  refs: [REF3.backup, REF3.pgDump, REF3.pgRestore, REF3.continuous, REF3.mysqldump],
  cards: [
    { q: 'O que são RPO e RTO?', a: 'RPO: quanto dado se aceita perder (em tempo). RTO: quanto tempo se aceita ficar fora do ar.' },
    { q: 'Qual a vantagem do formato custom do pg_dump?', a: 'É comprimido e permite restauração seletiva e paralela com pg_restore.' },
    { q: 'O que o pg_dump -n não leva?', a: 'Extensões, objetos fora do esquema e papéis globais, que precisam ser recriados antes (as extensões, no mesmo esquema referenciado pelo dump).' },
    { q: 'O que é PITR?', a: 'Recuperação pontual: restaurar o banco a um instante usando backup base mais logs (WAL ou binlog).' },
    { q: 'O que diz a regra 3-2-1?', a: 'Três cópias, em dois tipos de mídia, com uma fora do local.' }
  ]
}
];
