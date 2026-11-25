// C3.5 — Transações e concorrência. Aulas 3 a 5 (atualização perdida e write skew; travas; deadlocks).
import { REF } from './c35-a.mjs';
const R = String.raw;

export const REF2 = {
  explicitLocking: { title: 'PostgreSQL 17 — Explicit Locking', url: 'https://www.postgresql.org/docs/17/explicit-locking.html', kind: 'doc' },
  forUpdate: { title: 'PostgreSQL 17 — The Locking Clause (SELECT ... FOR UPDATE)', url: 'https://www.postgresql.org/docs/17/sql-select.html#SQL-FOR-UPDATE-SHARE', kind: 'doc' },
  appConsistency: { title: 'PostgreSQL 17 — Data Consistency Checks at the Application Level', url: 'https://www.postgresql.org/docs/17/applevel-consistency.html', kind: 'doc' },
  errcodes: { title: 'PostgreSQL 17 — Error Codes', url: 'https://www.postgresql.org/docs/17/errcodes-appendix.html', kind: 'doc' },
  runtimeLocks: { title: 'PostgreSQL 17 — Lock Management (deadlock_timeout)', url: 'https://www.postgresql.org/docs/17/runtime-config-locks.html', kind: 'doc' },
  advisory: { title: 'PostgreSQL 17 — Advisory Locks', url: 'https://www.postgresql.org/docs/17/explicit-locking.html#ADVISORY-LOCKS', kind: 'doc' },
  mysqlLocking: { title: 'MySQL 8.4 — InnoDB Locking', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html', kind: 'doc' },
  mysqlLockingReads: { title: 'MySQL 8.4 — Locking Reads', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html', kind: 'doc' },
  mysqlDeadlocks: { title: 'MySQL 8.4 — Deadlocks in InnoDB', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks.html', kind: 'doc' },
  mysqlDeadlockDetect: { title: 'MySQL 8.4 — Deadlock Detection', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlock-detection.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'trx-03', moduleId: 'm2', order: 3, minutes: 85, tags: ['atualização perdida', 'write skew', 'REPEATABLE READ', 'SERIALIZABLE', 'bloqueio otimista', 'FOR UPDATE'],
  title: 'Anomalias de escrita: atualização perdida, write skew e como preveni-las',
  objectives: ['Reproduzir e explicar a atualização perdida em ciclos "ler, calcular na aplicação, gravar"', 'Aplicar quatro correções (UPDATE atômico, FOR UPDATE, REPEATABLE READ com nova tentativa, bloqueio otimista)', 'Explicar o write skew e por que só o SERIALIZABLE (ou travas explícitas) o evita', 'Interpretar os erros de serialização (40001) e implementar o laço de nova tentativa', 'Comparar o comportamento de PostgreSQL e MySQL nesses cenários'],
  intro: R`As anomalias de **escrita** são as que causam **dinheiro errado, estoque negativo e reservas duplicadas**, e **passam em testes simples**, porque exigem duas transações simultâneas. Esta aula reproduz, com **sessões controladas por código** (PostgreSQL 17.12 e MySQL 8.4.13), a **atualização perdida** e o **write skew**, mostra as correções e o tratamento de **falhas de serialização** com nova tentativa.`,
  theory: R`### Atualização perdida (lost update)
O padrão **ler → calcular na aplicação → gravar** é o culpado. Duas sessões leem o saldo 100, cada uma soma 10 e grava 110: **a segunda sobrescreve a primeira**. Medido, nos **dois** bancos (padrões: READ COMMITTED no PostgreSQL e REPEATABLE READ no MySQL): "Ana deveria ter **120**; ficou com **110,00**". Um **depósito foi perdido**, sem erro algum.

### Correções, uma a uma (PostgreSQL, medidas)
1. **UPDATE atômico**: §UPDATE contas SET saldo = saldo + 10 WHERE id = 1§. O banco faz a leitura e a escrita **no mesmo comando**, com a trava da linha; a segunda sessão **espera a primeira confirmar** e então soma sobre o valor novo. Medido: **120,00**. É a **melhor solução quando é possível** (incremento, decremento, "marcar como pago se ainda aberto").
2. **Trava pessimista: §SELECT ... FOR UPDATE§**: trava a linha na leitura. Medido: a sessão Y **esperou** a X confirmar e leu **110** (o valor já atualizado), gravando 120. A leitura com §FOR UPDATE§ vê a **versão mais recente**.
3. **REPEATABLE READ + nova tentativa**: nesse nível, ao tentar atualizar uma linha **alterada depois do snapshot**, a segunda transação **falha**: medido: **40001 could not serialize access due to concurrent update**; Ana ficou com 110 (só a primeira valeu) e a segunda **precisa repetir** a transação inteira. Veja o laço adiante.
4. **Bloqueio otimista (coluna de versão)**: a linha tem §versao§; a gravação é §UPDATE ... SET texto = ..., versao = versao + 1 WHERE id = 1 AND versao = :lida§. Se **outra pessoa gravou antes**, **0 linhas** são afetadas e a aplicação trata o **conflito**. Medido: X (versão 1) afetou **1** linha; Y (também com a versão 1) afetou **0**. Estado final: "edição do X", versão 2. **Sem travas longas**: ideal para **edições de formulário** em que o usuário demora.
**Qual escolher?** Atômico, sempre que possível; **pessimista** quando a lógica é complexa e os conflitos são **frequentes**; **otimista** quando os conflitos são **raros** e o tempo entre ler e gravar é **longo** (UI).

### Write skew: o conflito que não atualiza a mesma linha
Duas pessoas de plantão (Ana e Bia). **Regra**: sempre pelo menos **uma** de plantão. Cada transação lê "há 2 de plantão", então tira **a si mesma** (cada uma atualiza **uma linha diferente**). Medido:
- **PostgreSQL REPEATABLE READ**: as duas leram **2**, as duas confirmaram, restaram **0** de plantão (**regra violada**; nenhum erro).
- **PostgreSQL SERIALIZABLE**: a primeira confirmou; a segunda falhou no commit com **40001 could not serialize access due to read/write dependencies among transactions**; restou **1** de plantão (regra preservada).
- **MySQL REPEATABLE READ**: **0** de plantão (mesma violação).
- **MySQL SERIALIZABLE**: os §SELECT§ viram leituras com trava compartilhada; no experimento, uma das atualizações **esperou até o tempo limite** (**1205 Lock wait timeout exceeded**, 3 s configurados) e **1** pessoa ficou de plantão. Em outras execuções, o resultado pode ser um **deadlock (1213)**: é a forma do InnoDB evitar a anomalia, **com bloqueios e falhas**.
O write skew acontece porque as transações **leem um conjunto** (a contagem), **decidem** com base nele e **escrevem em linhas distintas**: a escrita de uma **invalida a premissa** da outra. REPEATABLE READ (snapshot) **não detecta**, pois não há conflito de escrita na **mesma linha**.
**Prevenções:** (a) §SERIALIZABLE§ (o PostgreSQL usa **SSI** e **detecta** o conflito sem bloquear leituras); (b) **travar o conjunto lido** (§SELECT ... FOR UPDATE§ sobre todas as linhas de plantão); (c) uma **restrição no banco** quando possível (um §CHECK§ não alcança várias linhas; use **restrição de exclusão**, **linha de controle** a ser travada ou um **contador** atualizado atomicamente); (d) **trava consultiva** (aula trx-07).

### Falhas de serialização e nova tentativa
Os erros **§40001§** (falha de serialização) e **§40P01§** (deadlock) **não são bugs**: são o banco dizendo "tente a transação de novo". A aplicação **deve** repetir a **transação inteira** (releitura incluída). Medido, com **10 trabalhadores** somando 10 cada, em REPEATABLE READ:
- **com laço de nova tentativa**: saldo final **200,00** (correto), com **49 tentativas** no total, das quais **39 falharam e foram repetidas**;
- **sem nova tentativa** (falhas descartadas): **só 1** confirmou, **9** falharam e o saldo ficou **110,00** (9 operações perdidas).
Boas práticas do laço: repita **apenas** 40001 e 40P01 (e equivalentes: 1213 e, com cuidado, 1205 no MySQL); **limite** o número de tentativas; use **espera aleatória crescente** (*backoff* com *jitter*); torne a transação **idempotente** e **curta**; **registre** a taxa de repetições (muitas repetições indicam **contenção** a resolver, como uma linha quente).

### Resumo de decisão
| Problema | Solução preferida |
|---|---|
| Incrementar, decrementar, trocar estado condicional | UPDATE atômico (§SET x = x + n WHERE ...§) |
| Ler, decidir e gravar o mesmo registro (conflito frequente) | §SELECT FOR UPDATE§ |
| Edição longa de formulário (conflito raro) | Bloqueio otimista (versão) |
| Invariante sobre vários registros | §SERIALIZABLE§ + repetição, ou travar o conjunto |
| Qualquer isolamento acima de READ COMMITTED | Laço de repetição em 40001/40P01 |`,
  concepts: [
    { term: 'Atualização perdida', def: 'Anomalia em que a gravação de uma transação sobrescreve a de outra feita a partir de um valor lido antes.' },
    { term: 'UPDATE atômico', def: 'Atualização que calcula o novo valor no próprio comando, usando a trava da linha.' },
    { term: 'Bloqueio pessimista', def: 'Estratégia que trava os dados na leitura (FOR UPDATE) para impedir conflitos.' },
    { term: 'Bloqueio otimista', def: 'Estratégia que não trava e detecta conflitos na gravação por uma coluna de versão.' },
    { term: 'Write skew', def: 'Anomalia em que transações leem o mesmo conjunto e escrevem em linhas diferentes, violando uma invariante conjunta.' },
    { term: 'Falha de serialização (40001)', def: 'Erro que indica que a transação precisa ser repetida por causa de um conflito de concorrência.' },
    { term: 'SSI', def: 'Serializable Snapshot Isolation: técnica do PostgreSQL que detecta dependências perigosas e aborta transações.' },
    { term: 'Backoff com jitter', def: 'Espera crescente e aleatória entre tentativas para reduzir colisões.' },
    { term: 'Linha quente', def: 'Linha disputada por muitas transações, que causa contenção e repetições.' },
    { term: 'Invariante', def: 'Regra que deve valer sempre sobre os dados.' }
  ],
  examples: R`**Analogia:** a **atualização perdida** é duas pessoas **copiando o saldo de um papel**, somando 10 e **escrevendo de volta**: a segunda apaga o que a primeira escreveu. O **UPDATE atômico** é **passar o papel de mão em mão** (cada um soma sobre o valor atual). O **bloqueio otimista** é **anotar a edição do papel** ("versão 1"); se ao devolver o papel a versão já for 2, **alguém editou antes** e é preciso reconciliar. O **write skew** é duas pessoas de plantão que **olham o quadro**, veem "somos dois" e **cada uma sai**, deixando o plantão vazio, sem nunca terem mexido na linha da outra.

**Exemplo 1: depósitos.** Dois depósitos de 10 sobre 100 resultaram em 110 em vez de 120, sem erro.

**Exemplo 2: plantão.** Em REPEATABLE READ saíram os dois; em SERIALIZABLE o segundo falhou e ficou um de plantão.

**Exemplo 3: repetição.** Dez trabalhadores concorrentes chegaram a 200 só com o laço de nova tentativa.`,
  code: [
    { title: 'Atualização perdida e três correções (Node.js + pg, saída medida no PostgreSQL 17)', lang: 'js', code: R`// sessões X e Y concorrentes sobre contas(id=1, saldo=100)

// 1) ERRADO: ler, somar na aplicação, gravar
const sx = Number((await x.query('SELECT saldo FROM tx.contas WHERE id = 1')).rows[0].saldo);
const sy = Number((await y.query('SELECT saldo FROM tx.contas WHERE id = 1')).rows[0].saldo);
await x.query('UPDATE tx.contas SET saldo = $1 WHERE id = 1', [sx + 10]);
await y.query('UPDATE tx.contas SET saldo = $1 WHERE id = 1', [sy + 10]);   // sobrescreve: 110.00

// 2) UPDATE atômico: 120.00
await x.query('UPDATE tx.contas SET saldo = saldo + 10 WHERE id = 1');
await y.query('UPDATE tx.contas SET saldo = saldo + 10 WHERE id = 1');      // espera X confirmar

// 3) bloqueio otimista: 1 linha afetada para X e 0 para Y
const r = await c.query(
  'UPDATE tx.docs SET texto = $1, versao = versao + 1 WHERE id = 1 AND versao = $2', [texto, versaoLida]);
if (r.rowCount === 0) throw new Error('conflito: o documento foi alterado por outra pessoa');`, notes: [{ l: '6', t: 'Sem erro, um depósito é perdido.' }, { l: '10', t: 'O cálculo no próprio UPDATE usa a trava da linha.' }, { l: '14', t: 'A versão na cláusula WHERE detecta a edição concorrente.' }] },
    { title: 'Laço de nova tentativa para 40001 e 40P01 (Node.js)', lang: 'js', code: R`async function comRepeticao(pool, tentativasMax, fn) {
  for (let tentativa = 1; ; tentativa++) {
    const c = await pool.connect();
    try {
      await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
      const resultado = await fn(c);              // toda a transação é refeita, incluindo as leituras
      await c.query('COMMIT');
      return resultado;
    } catch (e) {
      await c.query('ROLLBACK').catch(() => {});
      const repetivel = e.code === '40001' || e.code === '40P01';
      if (!repetivel || tentativa >= tentativasMax) throw e;
      await new Promise((r) => setTimeout(r, Math.random() * 20 * tentativa));   // backoff com jitter
    } finally {
      c.release();
    }
  }
}`, notes: [{ l: '6', t: 'A função recebida lê e escreve de novo a cada tentativa.' }, { l: '11', t: 'Só erros de concorrência são repetidos; os demais sobem.' }, { l: '12', t: 'A espera aleatória reduz novas colisões.' }] }
  ],
  bestPractices: ['Prefira UPDATE atômico a ler, calcular e gravar na aplicação.', 'Use FOR UPDATE quando a lógica exigir ler antes de decidir, com conflitos frequentes.', 'Use bloqueio otimista (versão) em edições longas com conflitos raros.', 'Proteja invariantes sobre conjuntos com SERIALIZABLE (e repetição) ou travando o conjunto.', 'Implemente laço de nova tentativa para 40001 e 40P01, com limite e backoff.', 'Teste os cenários de concorrência com sessões controladas.'],
  mistakes: ['Ler o saldo, somar em código e gravar.', 'Achar que REPEATABLE READ evita todas as anomalias.', 'Tratar 40001 como erro fatal para o usuário em vez de repetir.', 'Repetir só o último comando em vez da transação inteira.', 'Repetir indefinidamente, sem limite nem espera.', 'Deixar de modelar a regra "pelo menos um" com algum mecanismo de proteção.'],
  market: R`Atualização perdida e write skew estão por trás de estoques negativos, saldos errados e overbooking, e escapam de testes unitários. Entrevistas sobre sistemas financeiros e de reservas exploram essas anomalias; equipes maduras têm testes de concorrência e laços de repetição padronizados.`,
  summary: R`Ler, calcular e gravar na aplicação perde atualizações (medido nos dois bancos: 110 em vez de 120). Correções: UPDATE atômico (120), §FOR UPDATE§ (a segunda sessão esperou e leu 110), REPEATABLE READ com nova tentativa (a segunda recebeu 40001) e bloqueio otimista (1 linha afetada para X e 0 para Y). O write skew deixou 0 de plantão em REPEATABLE READ nos dois bancos; no SERIALIZABLE do PostgreSQL a segunda confirmação falhou (40001) e restou 1. Com laço de repetição, 10 trabalhadores chegaram a 200 (49 tentativas, 39 repetidas); sem ele, só 1 confirmou (110).`,
  refs: [REF2.appConsistency, REF2.forUpdate, REF2.errcodes, REF.pgIso, REF.mysqlIso],
  cards: [
    { q: 'Por que o UPDATE atômico evita a atualização perdida?', a: 'Calcula o novo valor no próprio comando, sob a trava da linha, sobre o valor mais recente.' },
    { q: 'O que significa o erro 40001?', a: 'Falha de serialização: a transação precisa ser repetida inteira.' },
    { q: 'O que é write skew?', a: 'Transações leem um conjunto, decidem e escrevem em linhas diferentes, violando uma invariante conjunta (por exemplo, "pelo menos uma pessoa de plantão").' },
    { q: 'Quando preferir o bloqueio otimista?', a: 'Quando os conflitos são raros e o intervalo entre ler e gravar é longo (edições de formulário).' },
    { q: 'O que um bom laço de nova tentativa deve ter?', a: 'Repetir só 40001/40P01, limitar tentativas, esperar com backoff e jitter, e refazer a transação inteira.' }
  ]
},
{
  id: 'trx-04', moduleId: 'm2', order: 4, minutes: 80, tags: ['locks', 'FOR UPDATE', 'NOWAIT', 'SKIP LOCKED', 'lock_timeout', 'gap lock', 'advisory lock'],
  title: 'Travas (locks): linha, tabela, esperas, filas com SKIP LOCKED e travas consultivas',
  objectives: ['Distinguir travas de linha, de tabela e consultivas e saber o que cada comando trava', 'Usar §FOR UPDATE§, §NOWAIT§, §SKIP LOCKED§ e §lock_timeout§ para controlar esperas', 'Montar uma fila de tarefas concorrente com §SKIP LOCKED§', 'Explicar as travas de intervalo (gap locks) do InnoDB e o efeito sobre inserções', 'Observar quem bloqueia quem com as visões do catálogo'],
  intro: R`**Travas** são o mecanismo que o banco usa para **serializar o acesso a recursos** compartilhados (linhas, tabelas). Elas protegem os dados, mas também **fazem sessões esperar**, e esperas longas viram **lentidão e falhas**. Esta aula mostra, com experimentos de duas sessões (PostgreSQL 17.12 e MySQL 8.4.13), o que é travado, como **evitar esperar** (§NOWAIT§, §SKIP LOCKED§, tempos limites), como construir uma **fila de tarefas** e como **enxergar** quem está bloqueando.`,
  theory: R`### O que o banco trava
- **Linha**: §UPDATE§, §DELETE§ e §SELECT ... FOR UPDATE§ travam **as linhas atingidas**. Outras transações podem **ler** a linha (MVCC, sem trava) mas **não escrevê-la** até o §COMMIT§/§ROLLBACK§ de quem a travou.
- **Tabela**: comandos de estrutura (§ALTER TABLE§, §DROP§, §TRUNCATE§) e o explícito §LOCK TABLE§ travam a **tabela inteira**, em **modos** que variam (do compartilhamento leve ao **exclusivo**, que bloqueia até leituras). Mudanças de esquema em horário de pico podem **enfileirar** todo o tráfego atrás de uma trava (use §lock_timeout§ nas migrações).
- **Consultiva (*advisory*)**: travas **por convenção da aplicação**, identificadas por um número, que o banco gerencia mas **não associa a nenhum dado** (útil para "só um processo roda esta tarefa").
Travas de linha são **mantidas até o fim da transação**: transações longas = **travas longas**.

### Leituras com trava
§SELECT ... FOR UPDATE§ trava as linhas lidas para atualização (modo mais forte); §FOR NO KEY UPDATE§, §FOR SHARE§ e §FOR KEY SHARE§ são modos mais fracos (PostgreSQL). Medido: X executou §SELECT id FROM fila ORDER BY id LIMIT 2 FOR UPDATE§ e travou as linhas **1 e 2**. Quando uma sessão encontra linha travada, ela **espera** (padrão) a menos que se peça outro comportamento:
- **§NOWAIT§**: **erro imediato**. Medido no PostgreSQL: **55P03 could not obtain lock on row in relation "fila"**; no MySQL: **3572 Statement aborted because lock(s) could not be acquired immediately and NOWAIT is set**.
- **§SKIP LOCKED§**: **pula** as linhas travadas e devolve as demais. Medido nos dois bancos: Y pediu as 2 primeiras linhas e recebeu **[3, 4]** (as linhas 1 e 2 estavam travadas por X).
- **Tempo limite**: no PostgreSQL, §SET lock_timeout = '300ms'§: Y falhou com **55P03 canceling statement due to lock timeout**; no MySQL, §innodb_lock_wait_timeout§ (padrão **50 s**; usamos 3 s na sessão): medido **1205 Lock wait timeout exceeded**, após **~3.003 ms**. **Sempre defina tempos limites** para que esperas não se acumulem silenciosamente.

### Filas de tarefas com SKIP LOCKED
Vários trabalhadores precisam pegar tarefas **sem pegar a mesma**. O padrão:
§§§
BEGIN;
SELECT id, tarefa FROM fila WHERE NOT feita ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;
-- processa...
UPDATE fila SET feita = true WHERE id = :id;
COMMIT;
§§§
Cada trabalhador **trava a primeira linha livre**, e os outros **passam para a próxima**, sem esperar. Funciona no PostgreSQL (9.5 e superior) e no MySQL 8.0 e superior. Cuidados: se o trabalhador **cair**, a transação é desfeita e a tarefa **volta à fila** (vantagem); o processamento **dentro** da transação deve ser curto (ou use um estado "em andamento" com **prazo** para retomar); tarefas **repetidas** exigem idempotência. Para **cargas altas**, filas dedicadas (brokers, curso C8) são mais adequadas.

### Travas de intervalo (gap locks) no InnoDB
Em REPEATABLE READ, o InnoDB trava **não só as linhas encontradas, mas os intervalos entre elas** (*gap locks* e *next-key locks*) para evitar fantasmas em leituras com trava. Medido: X executou §SELECT * FROM fila WHERE id BETWEEN 5 AND 9 FOR UPDATE§ (nenhuma linha existe nesse intervalo: há linhas 1 a 4 e 10) e Y tentou **inserir o id 7**: ficou **esperando até o tempo limite (1205, ~3 s)**. **Uma consulta que não encontra nada pode bloquear inserções.** Consequências: mais **bloqueios e deadlocks** em cargas concorrentes; em READ COMMITTED o InnoDB **não usa** gap locks na maioria dos casos (documentação). O PostgreSQL **não** tem travas de intervalo: usa o snapshot e, no SERIALIZABLE, a detecção de conflitos (SSI).

### Travas consultivas
§pg_try_advisory_lock(42)§ tenta obter a trava **42** sem esperar. Medido: X obteve (**true**), Y tentou e recebeu **false**; depois que X liberou (§pg_advisory_unlock§), Y obteve **true**. Existem versões por **sessão** (liberadas ao desconectar ou explicitamente) e por **transação** (§pg_advisory_xact_lock§, liberadas no fim da transação). Usos: **garantir que só uma instância** execute um trabalho agendado, **serializar** uma operação por chave de negócio (por exemplo, "uma reserva por vez por sala"). No MySQL, §GET_LOCK()§ cumpre papel semelhante (documentação; não executado).

### Observando travas e esperas
No PostgreSQL:
- §pg_stat_activity§: coluna §wait_event_type = 'Lock'§ mostra sessões **esperando por trava**. Medido: uma sessão esperando.
- §pg_blocking_pids(pid)§ devolve **quem está bloqueando** a sessão. Medido: **1 bloqueador**.
- §pg_locks§ lista as travas mantidas e pedidas.
- Parâmetros: §log_lock_waits§ registra esperas acima de §deadlock_timeout§.
No MySQL: §performance_schema.data_locks§ e §data_lock_waits§, §sys.innodb_lock_waits§ e §SHOW ENGINE INNODB STATUS§ (documentação; não executado).
Quando alguém reclama de lentidão, **procure a sessão que segura a trava** (muitas vezes uma transação **esquecida aberta**, "idle in transaction").

### Regras práticas
1. **Travas por pouco tempo**: faça o trabalho lento **fora** da transação.
2. **Ordem consistente** de aquisição (aula trx-05).
3. **Tempos limites** em tudo (§lock_timeout§, §statement_timeout§, §idle_in_transaction_session_timeout§ no PostgreSQL).
4. Prefira **SKIP LOCKED** para filas e **NOWAIT** quando a espera é inaceitável.
5. **Meça** esperas em produção (métricas de trava).`,
  concepts: [
    { term: 'Trava de linha', def: 'Bloqueio de uma linha para escrita, mantido até o fim da transação.' },
    { term: 'Trava de tabela', def: 'Bloqueio da tabela inteira em um modo (compartilhado até exclusivo).' },
    { term: 'FOR UPDATE', def: 'Cláusula que trava as linhas lidas para atualização.' },
    { term: 'NOWAIT', def: 'Opção que faz a consulta falhar imediatamente se a linha estiver travada.' },
    { term: 'SKIP LOCKED', def: 'Opção que ignora as linhas travadas, devolvendo as demais.' },
    { term: 'lock_timeout', def: 'Tempo máximo de espera por uma trava antes de abortar o comando.' },
    { term: 'Gap lock', def: 'Trava do InnoDB sobre o intervalo entre registros de um índice, que bloqueia inserções.' },
    { term: 'Trava consultiva', def: 'Trava identificada por um número, definida pela aplicação e gerenciada pelo banco.' },
    { term: 'idle in transaction', def: 'Sessão com transação aberta e sem executar comandos, que mantém travas.' },
    { term: 'Fila de tarefas', def: 'Tabela ou estrutura em que trabalhadores concorrentes retiram tarefas, sem repetição.' }
  ],
  examples: R`**Analogia:** a **trava de linha** é uma **etiqueta de "reservado" numa linha de uma planilha** compartilhada: outros podem **ler**, mas não **editar** até a etiqueta sair. NOWAIT é **desistir na hora** se estiver reservado; SKIP LOCKED é **pular para a próxima linha livre**, como numa **fila de caixa** em que você escolhe o caixa livre. O **gap lock** é **reservar também o espaço vazio** entre duas linhas, para ninguém inserir uma nova no meio. A trava consultiva é a **placa "reunião em andamento"** na porta de uma sala: não impede o uso físico da sala, mas todo mundo concordou em respeitá-la.

**Exemplo 1: fila.** X travou as tarefas 1 e 2; Y, com SKIP LOCKED, pegou 3 e 4 sem esperar.

**Exemplo 2: espera limitada.** Sem tempo limite, Y esperaria; com ele, falhou em 300 ms (PostgreSQL) ou 3 s (MySQL).

**Exemplo 3: gap lock.** Uma busca sem resultados travou o intervalo e bloqueou o INSERT do id 7.`,
  code: [
    { title: 'NOWAIT, SKIP LOCKED e lock_timeout (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`-- sessão X
BEGIN;
SELECT id FROM fila ORDER BY id LIMIT 2 FOR UPDATE;           -- trava 1 e 2

-- sessão Y
SELECT id FROM fila WHERE id = 1 FOR UPDATE NOWAIT;
-- ERROR 55P03: could not obtain lock on row in relation "fila"

SELECT id FROM fila ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED;  -- 3 e 4 (pula 1 e 2)

SET lock_timeout = '300ms';
UPDATE fila SET feita = true WHERE id = 1;
-- ERROR 55P03: canceling statement due to lock timeout`, notes: [{ l: '6', t: 'NOWAIT falha imediatamente.' }, { l: '9', t: 'SKIP LOCKED passa pelas linhas travadas.' }, { l: '11', t: 'O tempo limite impede esperas longas.' }] },
    { title: 'Gap lock no InnoDB e trava consultiva (SQL, saída medida)', lang: 'sql', code: R`-- MySQL 8.4, REPEATABLE READ; fila tem os ids 1, 2, 3, 4 e 10
-- sessão X
START TRANSACTION;
SELECT * FROM fila WHERE id BETWEEN 5 AND 9 FOR UPDATE;     -- nenhuma linha, mas trava o intervalo

-- sessão Y
INSERT INTO fila VALUES (7, 'novo');
-- ERROR 1205: Lock wait timeout exceeded (depois de ~3 s com innodb_lock_wait_timeout = 3)

-- PostgreSQL: trava consultiva
SELECT pg_try_advisory_lock(42);     -- X: true
SELECT pg_try_advisory_lock(42);     -- Y: false
SELECT pg_advisory_unlock(42);       -- X libera; depois Y obtém: true`, notes: [{ l: '5', t: 'A leitura com trava protege o intervalo contra fantasmas.' }, { l: '9', t: 'A inserção no intervalo fica esperando.' }, { l: '12', t: 'A trava consultiva não está ligada a nenhum dado.' }] }
  ],
  bestPractices: ['Mantenha as travas por pouco tempo: faça o trabalho lento fora da transação.', 'Defina tempos limites (lock_timeout, innodb_lock_wait_timeout, statement_timeout).', 'Use SKIP LOCKED para filas e NOWAIT quando a espera não for aceitável.', 'Prefira tarefas idempotentes em filas baseadas em banco.', 'Monitore sessões esperando por travas e transações "idle in transaction".', 'Use travas consultivas para garantias por chave de negócio.'],
  mistakes: ['Deixar transações abertas esperando resposta do usuário.', 'Rodar migrações pesadas sem lock_timeout e travar o tráfego.', 'Criar uma fila no banco com SELECT e UPDATE separados, sem travas, e processar tarefas duplicadas.', 'Ignorar os gap locks e se surpreender com bloqueios em inserções no InnoDB.', 'Não ter tempos limites e acumular conexões esperando.', 'Usar travas de tabela quando uma de linha bastaria.'],
  market: R`Esperas por travas são uma das principais causas de lentidão e de "travamentos" em produção, e filas em banco com SKIP LOCKED são um padrão comum em sistemas que ainda não justificam um broker. Saber diagnosticar quem bloqueia quem é parte do plantão de qualquer equipe de backend.`,
  summary: R`Travas de linha duram até o fim da transação; as de tabela e as consultivas têm outros usos. Medido: com §FOR UPDATE§ travando as linhas 1 e 2, §NOWAIT§ falhou na hora (55P03 no PostgreSQL; 3572 no MySQL), §SKIP LOCKED§ devolveu [3, 4] nos dois, o tempo limite abortou a espera (300 ms no PostgreSQL; 1205 após ~3 s no MySQL) e uma consulta vazia com §FOR UPDATE§ travou o intervalo 5..9 no InnoDB e bloqueou o INSERT do id 7. Travas consultivas funcionam por convenção. Observe esperas com §pg_stat_activity§ e §pg_blocking_pids§.`,
  refs: [REF2.explicitLocking, REF2.forUpdate, REF2.advisory, REF2.runtimeLocks, REF2.mysqlLocking, REF2.mysqlLockingReads],
  cards: [
    { q: 'O que o SKIP LOCKED faz?', a: 'Ignora as linhas travadas e devolve as demais, permitindo filas concorrentes sem espera.' },
    { q: 'Qual a diferença entre NOWAIT e lock_timeout?', a: 'NOWAIT falha imediatamente; lock_timeout espera até um limite e depois falha.' },
    { q: 'O que é um gap lock?', a: 'Uma trava do InnoDB sobre o intervalo entre registros, que bloqueia inserções nesse intervalo.' },
    { q: 'Como ver quem bloqueia uma sessão no PostgreSQL?', a: 'Com pg_blocking_pids(pid) e pg_stat_activity (wait_event_type = Lock).' },
    { q: 'Por que travas de linha duram até o fim da transação?', a: 'Para garantir que ninguém veja ou sobrescreva mudanças que ainda podem ser desfeitas; por isso transações longas são perigosas.' }
  ]
},
{
  id: 'trx-05', moduleId: 'm2', order: 5, minutes: 75, tags: ['deadlock', '40P01', '1213', 'ordem de travas', 'detecção', 'nova tentativa'],
  title: 'Deadlocks: como surgem, como cada banco os detecta e como preveni-los',
  objectives: ['Explicar a condição de deadlock (espera circular) com um exemplo', 'Reproduzir um deadlock e interpretar os erros 40P01 (PostgreSQL) e 1213 (MySQL)', 'Comparar a detecção nos dois bancos (§deadlock_timeout§ de 1 s no PostgreSQL; detecção imediata no InnoDB)', 'Aplicar a prevenção por ordem consistente de travas e verificar o efeito', 'Tratar deadlocks na aplicação com repetição da transação'],
  intro: R`Um **deadlock** acontece quando duas (ou mais) transações **esperam uma pela outra**, cada uma segurando uma trava de que a outra precisa: **ninguém avança**. O banco **detecta** o ciclo e **aborta uma** das transações para liberar as demais. Deadlocks **não são raros** em sistemas concorrentes: o que importa é **preveni-los** (ordem consistente) e **tratá-los** (repetir). Esta aula reproduz o cenário nos dois bancos e mostra a prevenção com números.`,
  theory: R`### A condição
Uma transação **A** trava a linha 1 e quer a linha 2; a **B** trava a linha 2 e quer a linha 1. A espera é **circular**: A espera B e B espera A. Sem intervenção, **esperariam para sempre**. As quatro condições clássicas: **exclusão mútua**, **posse e espera**, **sem preempção** e **espera circular**; prevenir qualquer uma evita o deadlock (na prática, a **espera circular**, impondo **ordem**).

### O experimento (nos dois bancos)
Duas sessões: X atualiza a conta 1; Y atualiza a conta 2; depois X tenta atualizar a conta 2 (**espera Y**) e Y tenta a conta 1 (**espera X**).
- **PostgreSQL 17.12**: depois de esperar, uma das sessões recebeu **40P01 deadlock detected** (a X), e a outra (Y) **completou**. O tempo até a detecção foi de **~1.003 ms**, coerente com **§deadlock_timeout = 1s§**: o PostgreSQL **só procura ciclos depois que uma sessão esperou esse tempo** (a verificação é custosa, e a maioria das esperas termina sozinha).
- **MySQL 8.4.13 (InnoDB)**: a sessão Y recebeu **1213 Deadlock found when trying to get lock; try restarting transaction** em **~206 ms** (o experimento incluiu uma pausa de 200 ms): o InnoDB **detecta o ciclo na hora** em que a espera é criada (parâmetro §innodb_deadlock_detect§, ligado por padrão), escolhe uma **vítima** (normalmente a transação que **fez menos alterações**) e a **desfaz inteira**.
**Qual a vítima?** Em ambos, o banco decide; **não conte** com uma ordem previsível. O erro vai para **uma** sessão; a outra segue.

### O que fazer ao receber um deadlock
O erro é **recuperável**: **repita a transação inteira** (aula trx-03: laço de repetição para §40P01§ e §1213§). Registre a **taxa** de deadlocks: se for frequente, **corrija a causa**.

### Causas comuns
1. **Ordem inconsistente**: transferências A→B e B→A que atualizam as contas **na ordem dos parâmetros**, como no experimento.
2. **Operações em lote** que atualizam muitas linhas em ordens diferentes (um §UPDATE§ que percorre o índice A e outro que percorre o índice B).
3. **Chaves estrangeiras**: inserir um filho trava o pai (modo compartilhado); atualizações do pai e inserções de filhos concorrentes podem se cruzar.
4. **Índices únicos** com inserções concorrentes de chaves iguais.
5. **Gap locks** do InnoDB em inserções concorrentes (aula trx-04).
6. **Transações longas** que seguram muitas travas por muito tempo.

### Prevenção: ordem consistente
**Sempre trave os recursos na mesma ordem.** Medido (PostgreSQL): a função de transferência **ordena os ids** e executa §SELECT ... WHERE id IN (a, b) ORDER BY id FOR UPDATE§ **antes** de atualizar. Duas transferências opostas (1→2 de 10 e 2→1 de 5), cada uma com uma pausa de 300 ms **dentro** da transação, foram executadas **sem deadlock**: ambas **concluíram** (as duas "fulfilled"), em **~633 ms** (as duas se **serializaram**, pois a segunda esperou a primeira), e os saldos finais foram **95,00 e 105,00** (soma preservada: 200). A espera vira **fila**, não **ciclo**.
Outras medidas:
- **Reduzir o tempo** das transações (menos tempo segurando travas).
- **Travar tudo de uma vez** no começo (§SELECT ... FOR UPDATE§ de todas as linhas necessárias, ordenadas).
- Usar **UPDATE atômico** em vez de ler e depois atualizar.
- **Índices adequados** (um §UPDATE§ sem índice varre e trava **mais** linhas).
- Em MySQL, avaliar **READ COMMITTED** (menos gap locks).
- Evitar **atualizar o mesmo conjunto** em ordens diferentes em lotes (use §ORDER BY§ também em §UPDATE§ por lotes via subconsulta).

### Diagnóstico
- **PostgreSQL**: o erro e o **detalhe** vão para o log do servidor (§log_lock_waits§ ajuda a registrar esperas); o log mostra as sessões, as linhas e os comandos envolvidos.
- **MySQL**: §SHOW ENGINE INNODB STATUS§ mostra o **último deadlock** com os comandos e as travas; §innodb_print_all_deadlocks§ registra todos no log de erros.
Use o diagnóstico para **achar os dois comandos** e **reordenar** o código.

### Deadlock x espera longa
Uma sessão esperando muito tempo **não é** deadlock (a outra só **demora**): o banco não aborta nada, e você precisa de **tempos limites** (aula trx-04). Deadlock exige **ciclo**.

### Resumo
Deadlock = espera circular. O banco detecta e aborta uma vítima (PostgreSQL após §deadlock_timeout§, InnoDB na hora). A aplicação **repete**. A **prevenção** é **ordem consistente** de travas e transações **curtas**.`,
  concepts: [
    { term: 'Deadlock', def: 'Situação em que transações esperam umas pelas outras em ciclo, sem progresso possível.' },
    { term: 'Espera circular', def: 'Condição em que cada transação do ciclo espera um recurso mantido pela próxima.' },
    { term: 'deadlock_timeout', def: 'Tempo de espera após o qual o PostgreSQL verifica a existência de deadlock (padrão 1 s).' },
    { term: 'Vítima', def: 'Transação escolhida pelo banco para ser abortada e desfeita ao resolver um deadlock.' },
    { term: '40P01', def: 'Código do PostgreSQL para deadlock detectado.' },
    { term: '1213', def: 'Código de erro do MySQL para deadlock encontrado.' },
    { term: 'Ordem consistente de travas', def: 'Regra de adquirir travas sempre na mesma sequência para eliminar ciclos.' },
    { term: 'innodb_deadlock_detect', def: 'Parâmetro do InnoDB que liga a detecção imediata de deadlocks.' },
    { term: 'Posse e espera', def: 'Condição em que uma transação mantém travas enquanto espera por outras.' },
    { term: 'Contenção', def: 'Disputa de várias transações pelos mesmos recursos.' }
  ],
  examples: R`**Analogia:** dois carros chegam a um **cruzamento estreito** vindos de lados opostos, cada um **bloqueando a passagem do outro**: nenhum recua. O **semáforo do PostgreSQL** só chama o guarda de trânsito **depois de esperar um segundo**; o **InnoDB** tem um guarda que **enxerga o impasse imediatamente** e manda um dos carros recuar (a vítima). A **ordem consistente** é a regra "**sempre dê a preferência à rua de número menor**": os dois carros passam um de cada vez, sem impasse.

**Exemplo 1: o impasse.** Duas transferências opostas travaram uma conta cada e pediram a outra.

**Exemplo 2: detecção.** ~1.003 ms no PostgreSQL (deadlock_timeout 1 s) e ~206 ms no MySQL.

**Exemplo 3: prevenção.** Com travas em ordem de id, as transferências opostas concluíram em ~633 ms sem erro e com soma preservada.`,
  code: [
    { title: 'Reproduzindo o deadlock (Node.js + pg, saída medida no PostgreSQL 17)', lang: 'js', code: R`await x.query('BEGIN'); await y.query('BEGIN');
await x.query('UPDATE tx.contas SET saldo = saldo + 1 WHERE id = 1');   // X trava a conta 1
await y.query('UPDATE tx.contas SET saldo = saldo + 1 WHERE id = 2');   // Y trava a conta 2

const px = x.query('UPDATE tx.contas SET saldo = saldo + 1 WHERE id = 2'); // X espera Y
await sleep(200);
const py = y.query('UPDATE tx.contas SET saldo = saldo + 1 WHERE id = 1'); // Y espera X: ciclo!
const [rx, ry] = await Promise.allSettled([px, py]);
// X: erro 40P01 deadlock detected (após ~1003 ms, deadlock_timeout = 1s) | Y: completou
// (no MySQL: Y recebe 1213 Deadlock found... em ~206 ms)`, notes: [{ l: '5', t: 'X pede a conta que Y já travou.' }, { l: '7', t: 'Y pede a conta que X já travou: espera circular.' }, { l: '9', t: 'O banco escolhe uma vítima e a desfaz.' }] },
    { title: 'Prevenção por ordem consistente (Node.js + pg, resultado medido)', lang: 'js', code: R`async function transferir(c, de, para, valor) {
  await c.query('BEGIN');
  const [a, b] = [de, para].sort((m, n) => m - n);          // sempre na ordem dos ids
  await c.query('SELECT id FROM tx.contas WHERE id IN ($1, $2) ORDER BY id FOR UPDATE', [a, b]);
  await c.query('UPDATE tx.contas SET saldo = saldo - $1 WHERE id = $2', [valor, de]);
  await c.query('UPDATE tx.contas SET saldo = saldo + $1 WHERE id = $2', [valor, para]);
  await c.query('COMMIT');
}
// transferir(x, 1, 2, 10) e transferir(y, 2, 1, 5) ao mesmo tempo:
// ambas concluem (~633 ms com pausas de 300 ms); saldos 95.00 e 105.00; soma 200`, notes: [{ l: '3', t: 'A ordenação elimina a espera circular.' }, { l: '4', t: 'Todas as linhas necessárias são travadas de uma vez.' }, { l: '9', t: 'As duas transações se serializam: sem erro e sem perda.' }] }
  ],
  bestPractices: ['Trave sempre os recursos na mesma ordem (por exemplo, por id crescente).', 'Mantenha as transações curtas e trave tudo de que precisa no começo.', 'Trate 40P01 e 1213 repetindo a transação inteira, com limite e espera.', 'Registre e monitore a taxa de deadlocks.', 'Use índices adequados para que as escritas travem menos linhas.', 'Diagnostique com os logs do banco (SHOW ENGINE INNODB STATUS no MySQL; log do servidor no PostgreSQL).'],
  mistakes: ['Atualizar as contas na ordem dos parâmetros recebidos.', 'Tratar deadlock como erro fatal para o usuário.', 'Repetir apenas o último comando em vez da transação inteira.', 'Confundir espera longa com deadlock.', 'Aumentar tempos limites em vez de corrigir a ordem.', 'Ignorar a repetição de deadlocks no monitoramento.'],
  market: R`Deadlocks aparecem em sistemas financeiros, de estoque e de reservas sob carga. Equipes que adotam ordem consistente de travas e repetição padronizada quase não os sentem; as demais convivem com "erros aleatórios" que só ocorrem em horário de pico.`,
  summary: R`Deadlock é espera circular. Medido: no PostgreSQL uma sessão recebeu 40P01 após ~1.003 ms (§deadlock_timeout§ de 1 s) e a outra concluiu; no MySQL, a vítima recebeu 1213 em ~206 ms (detecção imediata). O banco escolhe a vítima e a aplicação deve repetir a transação inteira. A prevenção é a ordem consistente de travas: duas transferências opostas, travando por id, concluíram em ~633 ms sem erro e com soma preservada (95,00 e 105,00). Transações curtas e índices adequados reduzem a chance.`,
  refs: [REF2.runtimeLocks, REF2.explicitLocking, REF2.mysqlDeadlocks, REF2.mysqlDeadlockDetect, REF2.errcodes],
  cards: [
    { q: 'O que caracteriza um deadlock?', a: 'Uma espera circular: cada transação segura uma trava de que a outra precisa.' },
    { q: 'Como o PostgreSQL detecta deadlocks?', a: 'Verifica ciclos depois que uma sessão espera deadlock_timeout (padrão 1 s) e aborta uma das transações (40P01).' },
    { q: 'Como o InnoDB trata deadlocks?', a: 'Detecta o ciclo imediatamente, desfaz uma vítima e devolve o erro 1213.' },
    { q: 'Qual a principal prevenção?', a: 'Travar sempre na mesma ordem (por exemplo, por id) e manter as transações curtas.' },
    { q: 'O que a aplicação deve fazer ao receber um deadlock?', a: 'Repetir a transação inteira, com limite de tentativas e espera.' }
  ]
}
];
