// Curso C3.3 da C3: PostgreSQL e MySQL, operação e desempenho (disciplina: pg).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c33-a.mjs';
import { REF2, lessonsB } from './c33-b.mjs';
import { REF3, lessonsC } from './c33-c.mjs';
import { exsetsA } from './c33-ex-a.mjs';
import { exsetsB, assessment, project } from './c33-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Instalação e psql', 'Tipos de dados', 'PostgreSQL vs MySQL', 'Índices (B-tree, GIN, GiST)', 'EXPLAIN ANALYZE', 'Query optimization', 'Replicação, particionamento e backup'];
export const COVER = {
  'Instalação e psql': ['pgm-01'],
  'Tipos de dados': ['pgm-02'],
  'PostgreSQL vs MySQL': ['pgm-03'],
  'Índices (B-tree, GIN, GiST)': ['pgm-04', 'pgm-05'],
  'EXPLAIN ANALYZE': ['pgm-06'],
  'Query optimization': ['pgm-07'],
  'Replicação, particionamento e backup': ['pgm-08', 'pgm-09']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Cluster (PostgreSQL)', def: 'Instância de servidor com seus bancos, arquivos de dados e configuração.' },
  { term: 'Autovacuum', def: 'Processo automático de limpeza e coleta de estatísticas do PostgreSQL.' },
  { term: 'Checkpoint', def: 'Ponto em que o banco grava em disco as páginas alteradas, limitando a recuperação.' },
  { term: 'Contêiner', def: 'Unidade isolada de execução de software, usada aqui para reproduzir os bancos.' },
  { term: 'Alta disponibilidade', def: 'Capacidade de continuar operando apesar de falhas de componentes.' },
  { term: 'Observabilidade', def: 'Capacidade de entender o comportamento do sistema por métricas, logs e planos.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'postgres-mysql', disciplineId: 'pg', areaId: 'data', requires: [],
  title: 'PostgreSQL e MySQL: instalação, tipos, índices, planos, otimização, replicação e backup',
  description: 'Operação e desempenho dos dois bancos relacionais mais usados: instalação reproduzível em contêineres, clientes psql e mysql, papéis e autenticação; tipos de dados e suas armadilhas (dinheiro, fusos, texto, faixas); comparação medida entre PostgreSQL 17 e MySQL 8.4 (isolamento, divisão, NULL, DDL em transação, modo estrito); índices B-tree, compostos, parciais, de cobertura, GIN, GiST, trigramas e restrições de exclusão; leitura de planos com EXPLAIN ANALYZE; método de otimização (estatísticas, VACUUM, paginação por chave, custo de escrita); particionamento com poda; replicação por streaming real; e backup e restauração (pg_dump, mysqldump, PITR, RPO e RTO). Tudo foi executado em PostgreSQL 17.12 e MySQL 8.4.13 (contêineres oficiais), com 500 mil linhas nas medições de índices; os desafios do laboratório modelam a lógica em JavaScript.',
  objectives: ['Subir, conectar e auditar bancos com segurança básica', 'Escolher tipos de dados e prever diferenças entre PostgreSQL e MySQL', 'Criar índices adequados e provar o ganho e o custo com EXPLAIN ANALYZE', 'Diagnosticar e otimizar consultas com método e medição', 'Particionar tabelas e configurar replicação', 'Planejar, executar e testar backups e restaurações'],
  level: 'M', prereqs: ['SQL essencial (curso C3.1)', 'Noções de linha de comando e de Docker', 'Recomendado: SQL avançado (curso C3.2)', 'Docker e cerca de 4 GB de memória livre para repetir os experimentos'], hours: 26,
  syllabus: 'Instalação com contêineres e clientes de linha de comando; papéis, esquemas e autenticação; tipos de dados no PostgreSQL e no MySQL; diferenças de comportamento e dialeto; índices B-tree, compostos, parciais, de cobertura, GIN, GiST, BRIN e trigramas; EXPLAIN e EXPLAIN ANALYZE; método de otimização, estatísticas, VACUUM e paginação; particionamento; replicação por streaming; backup lógico e físico, PITR, RPO e RTO.',
  versions: 'PostgreSQL 17.12 (imagem oficial postgres:17) e MySQL 8.4.13 (imagem oficial mysql:8.4), Docker, em 2026-11-25. Todos os planos e resultados citados foram medidos nesses contêineres (ambiente de laboratório: tempos não se transferem para outras máquinas; vale a forma do plano e a ordem de grandeza). A réplica por streaming foi executada em dois contêineres do PostgreSQL. Não foram executados: replicação do MySQL, particionamento do MySQL, PITR (arquivamento de WAL e binlog), pg_stat_statements, PgBouncer, failover/promoção, BRIN, hash, MariaDB e demais bancos; as menções vêm da documentação e estão sinalizadas.',
  skills: ['Operação de PostgreSQL e MySQL', 'Tipos de dados', 'Índices', 'Leitura de planos', 'Otimização de consultas', 'Particionamento', 'Replicação', 'Backup e restauração'],
  modules: [
    { id: 'm1', title: 'Ambiente, tipos e diferenças', lessons: ['pgm-01', 'pgm-02', 'pgm-03'] },
    { id: 'm2', title: 'Índices e planos de execução', lessons: ['pgm-04', 'pgm-05', 'pgm-06'] },
    { id: 'm3', title: 'Otimização e operação', lessons: ['pgm-07', 'pgm-08', 'pgm-09'] }
  ],
  materials: [REF.pgDocker, REF.psql, REF2.indexes, REF2.usingExplain, REF3.perfTips, REF3.partitioning, REF3.backup].map((r) => ({ ...r })),
  projectIds: ['tuning-banco'],
  supplement: {
    glossary,
    cheatsheet: R`### Ambiente
docker run (versão fixa; porta em 127.0.0.1) · psql: \conninfo \l \dn \dt \d \timing \x \i · mysql --default-character-set=utf8mb4 · pg_hba.conf (scram-sha-256; nunca trust) · menor privilégio

### Tipos
dinheiro: numeric/DECIMAL · integer até 2.147.483.647 (bigint acima) · instante: timestamptz · MySQL TIMESTAMP muda com time_zone, DATETIME não · utf8mb4 · modo estrito ligado

### PostgreSQL x MySQL (medido)
isolamento: READ COMMITTED x REPEATABLE READ · 5/2: 2 x 2,5 · '||': concatena x OR · texto: caixa x sem caixa · NULL em ASC: último x primeiro · FULL JOIN: sim x não · DDL em transação: desfeito x commit implícito

### Índices
B-tree (=, <, >, BETWEEN, ORDER BY, prefixo) · sargable: sem função na coluna, sem % inicial · composto: igualdade → intervalo (prefixos) · INCLUDE → Index Only Scan · parcial (WHERE) · expressão · GIN (jsonb, arrays, trgm) · GiST (ranges, EXCLUDE; btree_gist) · BRIN (tabelas enormes ordenadas) · custo de escrita

### Planos
EXPLAIN (ANALYZE, BUFFERS) · custo ≠ ms · rows real × loops · Seq/Index/Bitmap/Index Only · Nested Loop (poucas) / Hash (grandes) / Merge (ordenados) · estimado ≠ real → ANALYZE · MySQL: type ALL/ref, key, rows

### Otimização e operação
medir → mudar uma coisa → medir · keyset em vez de OFFSET · VACUUM/ANALYZE/autovacuum · pool de conexões · partição por faixa + poda; DETACH para retenção · réplica por streaming (-R, -c fast): somente leitura; assíncrona pode perder o final; replicação ≠ backup · RPO/RTO, 3-2-1, PITR, testar a restauração (extensões no mesmo esquema)`,
    mistakes: ['Expor a porta do banco a toda a rede ou usar senhas e contas padrão.', 'Guardar dinheiro em ponto flutuante e instantes sem fuso.', 'Assumir que o SQL é igual em PostgreSQL e MySQL.', 'Aplicar função à coluna e esperar que o índice seja usado.', 'Criar índices sem medir o ganho e o custo de escrita.', 'Usar OFFSET grande para paginar listas enormes.', 'Tratar a réplica como backup.', 'Nunca testar a restauração de um backup.'],
    prereqMap: R`**Antes deste curso:** SQL essencial (C3.1). Recomendado: SQL avançado (C3.2).

| Este curso prepara para | Por quê |
|---|---|
| Transações e concorrência (C3.5) | MVCC, isolamento e bloqueios usam o ambiente e os planos |
| ORMs (C3.6) | ler o SQL gerado, índices e N+1 |
| Cache (C3.8) | decidir o que cachear a partir de planos e custos |
| Infra e entrega (C6) | backups, réplicas e contêineres em produção |
| Arquitetura (C8) | replicação, particionamento e escalabilidade |

Ordem interna: aulas 1 a 3 (ambiente, tipos e diferenças) → 4 a 6 (índices e planos) → 7 a 9 (otimização e operação).`,
    officialRefs: [REF.pgDocker, REF.mysqlDocker, REF.psql, REF.pgHba, REF.pgRoles, REF.mysqlClient, REF.pgTypes, REF.pgNumeric, REF.pgDatetime, REF.mysqlTypes, REF.mysqlSqlMode, REF.mysqlInnodb, REF.mysqlIsolation, REF.pgMvcc, REF2.indexes, REF2.indexTypes, REF2.multicolumn, REF2.partial, REF2.indexOnly, REF2.expressional, REF2.mysqlIndexes, REF2.gin, REF2.gist, REF2.brin, REF2.pgTrgm, REF2.btreeGist, REF2.rangeTypes, REF2.usingExplain, REF2.explain, REF2.mysqlExplain, REF3.planStats, REF3.vacuuming, REF3.perfTips, REF3.pgStatStatements, REF3.partitioning, REF3.mysqlPartitioning, REF3.highAvail, REF3.standby, REF3.mysqlReplication, REF3.pgBasebackup, REF3.pgDump, REF3.pgRestore, REF3.backup, REF3.continuous, REF3.mysqldump],
    practice: ['Suba PostgreSQL e MySQL em contêineres com versão fixa e porta em 127.0.0.1.', 'Reproduza as diferenças de dialeto da aula 3 e anote cada resultado.', 'Gere 500 mil linhas e meça uma consulta com e sem índice usando EXPLAIN (ANALYZE, BUFFERS).', 'Teste uma condição não sargable e reescreva-a como intervalo.', 'Crie um índice composto, um parcial, um de cobertura e um GIN e compare os planos.', 'Compare OFFSET e paginação por chave.', 'Crie uma tabela particionada por mês e prove a poda no plano.', 'Monte uma réplica por streaming, teste a escrita recusada e o atraso.', 'Faça um pg_dump, restaure em um banco novo e confira contagens e índices.', 'Faça o projeto integrador: o relatório de tuning.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
