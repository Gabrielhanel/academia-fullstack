// Curso C3.5 da C3: Transações e concorrência (disciplina: tx).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c35-a.mjs';
import { REF2, lessonsB } from './c35-b.mjs';
import { REF3, lessonsC } from './c35-c.mjs';
import { exsetsA } from './c35-ex-a.mjs';
import { exsetsB, assessment, project } from './c35-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['ACID', 'Níveis de isolamento', 'Locks e deadlocks', 'MVCC'];
export const COVER = {
  'ACID': ['trx-01'],
  'Níveis de isolamento': ['trx-02', 'trx-03'],
  'Locks e deadlocks': ['trx-04', 'trx-05', 'trx-07'],
  'MVCC': ['trx-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Concorrência', def: 'Execução simultânea de operações que acessam os mesmos dados.' },
  { term: 'Condição de corrida', def: 'Defeito em que o resultado depende da ordem imprevisível de operações concorrentes.' },
  { term: 'Contenção', def: 'Disputa por recursos compartilhados que serializa operações e reduz a vazão.' },
  { term: 'Serialização', def: 'Execução equivalente a rodar as transações uma após a outra.' },
  { term: 'Consistência eventual', def: 'Garantia de que cópias convergem com o tempo, sem exigir atualização imediata.' },
  { term: 'Pool de conexões', def: 'Conjunto reutilizável de conexões ao banco, que limita sessões simultâneas.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'transacoes-concorrencia', disciplineId: 'tx', areaId: 'data', requires: [],
  title: 'Transações e concorrência: ACID, isolamento, travas, deadlocks, MVCC e padrões de aplicação',
  description: 'Como bancos relacionais mantêm os dados corretos quando muitas pessoas e processos os alteram ao mesmo tempo: transações e ACID (atomicidade medida, transação abortada, savepoints, WAL e durabilidade); níveis de isolamento e anomalias de leitura (leitura suja, não repetível e fantasma) com experimentos de duas sessões em PostgreSQL 17 e MySQL 8.4; anomalias de escrita (atualização perdida e write skew) e correções (UPDATE atômico, FOR UPDATE, REPEATABLE READ com nova tentativa, bloqueio otimista, SERIALIZABLE); travas (FOR UPDATE, NOWAIT, SKIP LOCKED, tempos limites, gap locks, travas consultivas) e filas; deadlocks (detecção nos dois bancos e prevenção por ordem de travas); MVCC (versões de linha, snapshots e transações longas); e padrões de aplicação (reservas sem corrida com EXCLUDE, idempotência, outbox e laços de repetição). Os cenários de concorrência foram executados com sessões controladas por código em PostgreSQL 17.12 e MySQL 8.4.13; os desafios do laboratório modelam a lógica em JavaScript.',
  objectives: ['Explicar e aplicar as propriedades ACID e delimitar transações corretas e curtas', 'Prever anomalias de leitura e de escrita em cada nível de isolamento de PostgreSQL e MySQL', 'Corrigir atualização perdida e write skew com as técnicas adequadas', 'Usar travas, tempos limites e SKIP LOCKED e diagnosticar esperas e deadlocks', 'Explicar o MVCC e o custo das transações longas', 'Projetar operações idempotentes e consistentes com efeitos externos e testá-las sob concorrência'],
  level: 'A', prereqs: ['SQL essencial (curso C3.1)', 'PostgreSQL e MySQL (curso C3.3), recomendado', 'JavaScript e Node.js básicos para os experimentos de duas sessões', 'Docker (ou instalações de PostgreSQL 15+ e MySQL 8) para repetir os experimentos'], hours: 28,
  syllabus: 'ACID, transações, savepoints e durabilidade; níveis de isolamento e anomalias; atualização perdida, write skew e correções; travas, FOR UPDATE, NOWAIT, SKIP LOCKED e travas consultivas; deadlocks; MVCC e transações longas; reservas sem corrida, idempotência e outbox.',
  versions: 'PostgreSQL 17.12 e MySQL 8.4.13 (imagens oficiais em Docker), driver pg 8.23.1 e mysql2 3.24.6 para Node.js, em 2026-11-25. Os cenários de concorrência (laboratório em seed/c3/labs/transacoes-concorrencia/) foram executados com sessões controladas por código; os tempos são de uma máquina e um contêiner e os resultados de contagem (por exemplo, repetições de nova tentativa) podem variar em outras execuções. Não foram executados: Group Replication e demais bancos, hot_standby_feedback e slots de replicação, wraparound de transações, SHOW ENGINE INNODB STATUS, performance_schema, GET_LOCK, publicação em brokers reais (o outbox foi descrito, não executado com broker). O comportamento dos erros de comando do InnoDB dentro de transações vem da documentação.',
  skills: ['Transações e ACID', 'Níveis de isolamento', 'Anomalias de concorrência', 'Travas e filas', 'Deadlocks', 'MVCC', 'Idempotência e outbox', 'Testes de concorrência'],
  modules: [
    { id: 'm1', title: 'Transações e isolamento', lessons: ['trx-01', 'trx-02'] },
    { id: 'm2', title: 'Escritas, travas e deadlocks', lessons: ['trx-03', 'trx-04', 'trx-05'] },
    { id: 'm3', title: 'MVCC e padrões de aplicação', lessons: ['trx-06', 'trx-07'] }
  ],
  materials: [REF.pgTx, REF.pgIso, REF2.explicitLocking, REF3.mvccIntro, REF.mysqlIso, REF3.outbox].map((r) => ({ ...r })),
  projectIds: ['reservas-sem-corrida'],
  supplement: {
    glossary,
    cheatsheet: R`### ACID
Atomicidade (tudo ou nada) · Consistência (restrições) · Isolamento (nível) · Durabilidade (WAL + fsync) · BEGIN/COMMIT/ROLLBACK · PostgreSQL: erro → transação abortada (25P02) · SAVEPOINT · autocommit = 1 comando, 1 transação · transações curtas, sem espera de usuário nem efeitos externos

### Isolamento
dirty / não repetível / fantasma · PostgreSQL: padrão READ COMMITTED; RU = RC; RR = snapshot (sem fantasma); SERIALIZABLE = SSI (40001) · MySQL InnoDB: padrão REPEATABLE READ; RU permite leitura suja; SELECT comum (snapshot) ≠ FOR UPDATE (leitura atual); gap locks

### Escrita
lost update: UPDATE atômico · FOR UPDATE · otimista (versão no WHERE; 0 linhas = conflito) · RR + repetir 40001 · write skew: SERIALIZABLE, travar o conjunto, linha de controle · laço de repetição: só 40001/40P01/1213, limite, backoff com jitter, transação inteira

### Travas
FOR UPDATE / NOWAIT / SKIP LOCKED · lock_timeout, statement_timeout, idle_in_transaction_session_timeout · fila: SELECT ... FOR UPDATE SKIP LOCKED · advisory lock · pg_blocking_pids, wait_event_type = Lock

### Deadlock
espera circular · PostgreSQL: após deadlock_timeout (1 s), 40P01 · InnoDB: imediato, 1213 · prevenir: ordem consistente de travas (ORDER BY id FOR UPDATE), transações curtas · repetir

### MVCC
versões (xmin, xmax, ctid) · snapshot por comando (RC) ou por transação (RR/SER) · transação longa segura o horizonte do VACUUM (50.000 mortas) · InnoDB: undo log + purge

### Padrões
EXCLUDE para sobreposição · UNIQUE · chave de idempotência (ON CONFLICT DO NOTHING) · outbox transacional + SKIP LOCKED · testes de concorrência (antes x depois)`,
    mistakes: ['Ler, calcular na aplicação e gravar o saldo.', 'Verificar e inserir sem proteção no banco.', 'Deixar transações abertas esperando usuário ou chamadas externas.', 'Tratar 40001, 40P01 ou 1213 como erro fatal em vez de repetir.', 'Travar recursos em ordens diferentes.', 'Enviar e-mails ou eventos dentro da transação sem outbox.', 'Assumir que o nível de isolamento padrão é o mesmo em todos os bancos.', 'Não testar a concorrência.'],
    prereqMap: R`**Antes deste curso:** SQL essencial (C3.1). Recomendado: PostgreSQL e MySQL (C3.3).

| Este curso prepara para | Por quê |
|---|---|
| ORMs (C3.6) | transações e repetição em ORMs, N+1 e travas |
| NoSQL (C3.7) | comparar com consistência eventual e CAP |
| Cache (C3.8) | invalidação e consistência entre cache e banco |
| Backend (C4) e filas (C4) | idempotência, outbox e processamento concorrente |
| Arquitetura (C8) | sagas, consistência distribuída e CAP |

Ordem interna: aulas 1 e 2 (transações e isolamento) → 3 a 5 (escritas, travas e deadlocks) → 6 e 7 (MVCC e padrões de aplicação).`,
    officialRefs: [REF.pgTx, REF.pgIso, REF.pgMvccIntro, REF.savepoint, REF.setTransaction, REF.wal, REF.asyncCommit, REF.mysqlIso, REF.mysqlAcid, REF.mysqlConsistent, REF.jepsen, REF2.explicitLocking, REF2.forUpdate, REF2.appConsistency, REF2.errcodes, REF2.runtimeLocks, REF2.advisory, REF2.mysqlLocking, REF2.mysqlLockingReads, REF2.mysqlDeadlocks, REF2.mysqlDeadlockDetect, REF3.mvccCaveats, REF3.systemColumns, REF3.routineVacuum, REF3.idleTimeout, REF3.mysqlMvcc, REF3.mysqlUndo, REF3.insert, REF3.outbox, REF3.stripeIdem],
    practice: ['Reproduza a transferência com erro e confirme o rollback e a transação abortada.', 'Reproduza leitura suja, não repetível e fantasma nos dois bancos com duas sessões.', 'Provoque a atualização perdida e aplique as quatro correções.', 'Reproduza o write skew em REPEATABLE READ e em SERIALIZABLE.', 'Monte uma fila com SKIP LOCKED e observe NOWAIT e lock_timeout.', 'Reproduza um deadlock e corrija com ordem consistente de travas.', 'Observe xmin, xmax e ctid e prove o efeito da transação longa sobre o VACUUM.', 'Faça o projeto integrador: o banco de reservas sem corrida com testes de concorrência.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
