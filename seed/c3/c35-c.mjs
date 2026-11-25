// C3.5 — Transações e concorrência. Aulas 6 e 7 (MVCC; padrões de aplicação e projeto).
import { REF } from './c35-a.mjs';
const R = String.raw;

export const REF3 = {
  mvccIntro: { title: 'PostgreSQL 17 — Introduction to MVCC', url: 'https://www.postgresql.org/docs/17/mvcc-intro.html', kind: 'doc' },
  mvccCaveats: { title: 'PostgreSQL 17 — Caveats of Concurrency Control', url: 'https://www.postgresql.org/docs/17/mvcc-caveats.html', kind: 'doc' },
  systemColumns: { title: 'PostgreSQL 17 — System Columns (xmin, xmax, ctid)', url: 'https://www.postgresql.org/docs/17/ddl-system-columns.html', kind: 'doc' },
  routineVacuum: { title: 'PostgreSQL 17 — Routine Vacuuming', url: 'https://www.postgresql.org/docs/17/routine-vacuuming.html', kind: 'doc' },
  idleTimeout: { title: 'PostgreSQL 17 — Client Connection Defaults (idle_in_transaction_session_timeout)', url: 'https://www.postgresql.org/docs/17/runtime-config-client.html', kind: 'doc' },
  mysqlMvcc: { title: 'MySQL 8.4 — InnoDB Multi-Versioning', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-multi-versioning.html', kind: 'doc' },
  mysqlUndo: { title: 'MySQL 8.4 — Undo Logs', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-undo-logs.html', kind: 'doc' },
  rangeTypes: { title: 'PostgreSQL 17 — Range Types e restrições de exclusão', url: 'https://www.postgresql.org/docs/17/rangetypes.html', kind: 'doc' },
  insert: { title: 'PostgreSQL 17 — INSERT (ON CONFLICT)', url: 'https://www.postgresql.org/docs/17/sql-insert.html', kind: 'doc' },
  outbox: { title: 'microservices.io — Transactional outbox', url: 'https://microservices.io/patterns/data/transactional-outbox.html', kind: 'doc' },
  stripeIdem: { title: 'Stripe — Idempotent requests', url: 'https://docs.stripe.com/api/idempotent_requests', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'trx-06', moduleId: 'm3', order: 6, minutes: 80, tags: ['MVCC', 'snapshot', 'xmin', 'xmax', 'versões de linha', 'VACUUM', 'transações longas', 'undo log'],
  title: 'MVCC: versões de linha, snapshots, visibilidade e o custo das transações longas',
  objectives: ['Explicar como o MVCC permite leitores e escritores não se bloquearem', 'Observar versões de linha no PostgreSQL (§xmin§, §xmax§, §ctid§) após um UPDATE', 'Descrever a regra de visibilidade de um snapshot e o isolamento por transação', 'Relacionar transações longas ao inchaço e à limpeza bloqueada do VACUUM', 'Comparar o MVCC do PostgreSQL com o do InnoDB (undo log)'],
  intro: R`O **MVCC** (*multi-version concurrency control*) é a ideia que torna os bancos modernos rápidos: **em vez de travar para ler, guarda várias versões** de cada linha e entrega a cada transação a versão **que ela deve enxergar**. Assim, **leitores não bloqueiam escritores e escritores não bloqueiam leitores**. Esta aula olha **por dentro** do PostgreSQL 17.12 (colunas de sistema e versões), mostra o **custo oculto** (versões antigas acumuladas por **transações longas**) e compara com o InnoDB.`,
  theory: R`### A ideia
Cada alteração **não sobrescreve** a linha: **cria uma nova versão**. Cada transação enxerga um **snapshot**: o conjunto de versões que eram **confirmadas** no instante do snapshot (e as próprias alterações da transação). Os leitores leem versões **antigas** sem esperar os escritores; os escritores só esperam **outros escritores da mesma linha**.

### Versões de linha no PostgreSQL
Cada versão (**tupla**) guarda duas colunas de sistema:
- **§xmin§**: o id da transação que **criou** a versão;
- **§xmax§**: o id da transação que **apagou ou substituiu** a versão (0 enquanto vigente).
E o **§ctid§**: a **posição física** (bloco, item). Medido: antes do UPDATE, a linha da Ana estava em **§ctid = (0,1)§** com **§xmin = 1505§** e §xmax = 0§. Depois de §UPDATE ... SET saldo = saldo + 1§, a linha vigente passou a **§(0,3)§**, com **§xmin = 1506§**: o UPDATE **criou outra tupla** (em outro lugar da página) e marcou a anterior como **substituída**. A tupla antiga continua no arquivo como **"morta"** até o **VACUUM** limpar (aula pgm-07).

### Visibilidade: regra resumida
Uma versão é **visível** para um snapshot quando: foi **criada** (§xmin§) por uma transação **confirmada antes** do snapshot (ou pela própria transação) **e** **não foi removida** (§xmax§ vazio, ou a transação que a removeu **não estava confirmada** no snapshot). O PostgreSQL consulta o estado de cada transação (*commit log*) e usa *hint bits* para acelerar.
**Quando o snapshot é tirado** define o isolamento:
- **READ COMMITTED**: **um snapshot por comando**: cada comando vê o que estava confirmado ao começar.
- **REPEATABLE READ** e **SERIALIZABLE**: **um snapshot por transação** (tirado no primeiro comando).
Medido (REPEATABLE READ): X abriu a transação e leu a Ana com **101,00**; Y aumentou o saldo em 1000 e confirmou; X **continuou vendo 101,00**, enquanto uma sessão nova viu **1.101,00**. **Duas sessões, duas realidades**, sem bloquear ninguém.

### O custo: acúmulo de versões
Versões antigas só podem ser **removidas** quando **nenhum snapshot ativo** pode precisar delas. Uma **transação longa** (ou esquecida em §idle in transaction§) **segura o "horizonte"** e **impede a limpeza**. Medido: tabela de **50.000 linhas**; uma sessão abriu uma transação REPEATABLE READ e fez uma leitura; outra sessão atualizou **todas** as linhas e rodou §VACUUM§. Resultado: **50.000 tuplas mortas ainda presentes** (o §VACUUM§ não pôde removê-las). Depois que a transação longa terminou, um novo §VACUUM§ deixou **0** tuplas mortas. Consequências de transações longas: **tabelas e índices incham**, consultas ficam mais lentas (varrem versões mortas) e o autovacuum "corre atrás". Defesas: **transações curtas**, **§idle_in_transaction_session_timeout§**, §statement_timeout§, monitorar a **idade da transação mais antiga** (§pg_stat_activity.xact_start§) e **réplicas** com consultas longas (§hot_standby_feedback§ pode segurar o horizonte do primário; documentação).

### UPDATEs e o inchaço
Cada UPDATE de uma linha cria uma versão; **atualizar muito** a mesma tabela gera **muitas tuplas mortas**. O **HOT update** (aula pgm-07) reaproveita espaço quando nenhuma coluna indexada muda. O **autovacuum** precisa **acompanhar**; em tabelas muito atualizadas, **ajuste seus parâmetros** (por tabela). Um **contador** que muda a cada requisição (aula mod-04) é um clássico gerador de inchaço.

### Outro limite: o "wraparound" de transações
Os ids de transação são números de 32 bits e **circulares**; o VACUUM "congela" versões antigas para evitar que a contagem dê a volta e **torne dados invisíveis**. O PostgreSQL **para de aceitar escritas** perto do limite se o autovacuum falhar por muito tempo (alarme crítico em bancos grandes; documentação, **não executado**).

### InnoDB: undo log
O InnoDB atualiza a linha **no lugar** (no índice agrupado) e guarda a **versão anterior no *undo log***, que forma uma **cadeia de versões** a ser percorrida por leituras consistentes que precisem de um snapshot antigo. Quando nenhuma transação precisa mais de uma versão, o ***purge*** a descarta. Uma **transação longa** impede o purge e **faz o undo crescer** (e as leituras percorrerem cadeias longas). (Descrição da documentação; **não executada** aqui.) Em resumo: **PostgreSQL** guarda **versões na própria tabela** (limpeza por VACUUM); **InnoDB** guarda **versões antigas no undo** (limpeza por purge).

### O que o MVCC não resolve
- **Escritas concorrentes na mesma linha** ainda se **serializam** (travas de linha).
- **Anomalias** como atualização perdida e write skew (aula trx-03) dependem do **nível de isolamento** e da **lógica**.
- Leituras **veem o passado**: em REPEATABLE READ, o dado que você leu pode **já estar velho** quando você decide (por isso o §FOR UPDATE§ e as falhas de serialização).

### Em resumo
MVCC = **várias versões + snapshots**. Ganha **concorrência de leitura**; paga com **armazenamento e limpeza**. O inimigo é a **transação longa**.`,
  concepts: [
    { term: 'MVCC', def: 'Controle de concorrência por múltiplas versões, em que leitores veem versões consistentes sem bloquear escritores.' },
    { term: 'Tupla', def: 'Versão física de uma linha no PostgreSQL.' },
    { term: 'xmin e xmax', def: 'Colunas de sistema com a transação que criou e a que removeu uma versão.' },
    { term: 'ctid', def: 'Posição física de uma versão (bloco, item) em uma tabela do PostgreSQL.' },
    { term: 'Snapshot', def: 'Conjunto de transações confirmadas visíveis a uma consulta ou transação.' },
    { term: 'Tupla morta', def: 'Versão que nenhuma transação ativa precisa mais, aguardando limpeza.' },
    { term: 'Horizonte de limpeza', def: 'Transação mais antiga que ainda pode precisar de versões antigas, limitando o VACUUM.' },
    { term: 'Undo log', def: 'Registro do InnoDB com as versões anteriores de linhas, usado em leituras consistentes e rollback.' },
    { term: 'Purge', def: 'Processo do InnoDB que descarta versões de undo não mais necessárias.' },
    { term: 'Wraparound de transações', def: 'Risco de os ids de transação de 32 bits darem a volta, evitado pelo congelamento de versões.' }
  ],
  examples: R`**Analogia:** o MVCC é como um **documento com histórico de versões**: cada pessoa abre o documento **como ele estava no momento em que começou a ler**, e quem edita cria uma **versão nova** sem apagar a antiga. Quem lê nunca espera quem edita. O custo é o **armazenamento do histórico**: se alguém deixa uma aba aberta com uma versão antiga **por horas**, **ninguém pode apagar** as versões intermediárias, e o arquivo cresce. O **VACUUM** é o **faxineiro** que apaga as versões que ninguém mais abriu; o **horizonte** é "a versão mais antiga que alguém ainda tem aberta".

**Exemplo 1: nova versão.** A linha da Ana foi de (0,1) para (0,3) com xmin diferente após um UPDATE.

**Exemplo 2: duas realidades.** Em REPEATABLE READ, X viu 101,00 enquanto uma sessão nova via 1.101,00.

**Exemplo 3: transação longa.** 50.000 tuplas mortas ficaram retidas até a transação terminar.`,
  code: [
    { title: 'Versões de linha e snapshot (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`SELECT ctid, xmin, xmax, saldo FROM contas WHERE id = 1;
-- (0,1) | 1505 | 0 | 100.00
UPDATE contas SET saldo = saldo + 1 WHERE id = 1;
SELECT ctid, xmin, xmax, saldo FROM contas WHERE id = 1;
-- (0,3) | 1506 | 0 | 101.00     (nova versão em outro lugar)

-- sessão X (REPEATABLE READ)
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT saldo FROM contas WHERE id = 1;     -- 101.00
-- sessão Y: UPDATE contas SET saldo = saldo + 1000 WHERE id = 1;  (confirma)
SELECT saldo FROM contas WHERE id = 1;     -- X continua vendo 101.00 (sessão nova: 1101.00)
COMMIT;`, notes: [{ l: '3', t: 'O UPDATE cria uma nova tupla.' }, { l: '5', t: 'O ctid e o xmin mudaram: é outra versão.' }, { l: '10', t: 'O snapshot de X não enxerga a confirmação de Y.' }] },
    { title: 'Transação longa impede a limpeza (SQL, saída medida)', lang: 'sql', code: R`CREATE TABLE v (id int PRIMARY KEY, x int);
INSERT INTO v SELECT g, 0 FROM generate_series(1, 50000) g;

-- sessão L (longa): abre e lê, e fica aberta
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT count(*) FROM v;

-- sessão A: atualiza tudo e tenta limpar
UPDATE v SET x = 1;
VACUUM v;
SELECT n_dead_tup FROM pg_stat_user_tables WHERE relname = 'v';     -- 50000 (retidas)

-- sessão L termina
COMMIT;
VACUUM v;
SELECT n_dead_tup FROM pg_stat_user_tables WHERE relname = 'v';     -- 0

-- defesa: idle_in_transaction_session_timeout = '5min'`, notes: [{ l: '5', t: 'O snapshot de L pode precisar das versões antigas.' }, { l: '10', t: 'O VACUUM não remove o que L ainda pode ver.' }, { l: '18', t: 'Um timeout para transações ociosas protege o horizonte de limpeza.' }] }
  ],
  bestPractices: ['Mantenha as transações curtas e nunca deixe uma aberta esperando usuário.', 'Defina idle_in_transaction_session_timeout e statement_timeout.', 'Monitore a idade da transação mais antiga e as tuplas mortas.', 'Ajuste o autovacuum em tabelas muito atualizadas.', 'Use REPEATABLE READ para leituras consistentes de relatórios, com cuidado ao durar muito.', 'Entenda que leitura consistente pode estar "no passado".'],
  mistakes: ['Deixar conexões "idle in transaction" por horas.', 'Rodar relatórios longos em transação sem necessidade e inchar o banco.', 'Achar que MVCC elimina toda espera (escritas na mesma linha ainda esperam).', 'Esperar que VACUUM reduza o tamanho do arquivo.', 'Ignorar o crescimento do undo no InnoDB com transações longas.', 'Desligar o autovacuum.'],
  market: R`Inchaço e autovacuum travado estão entre os incidentes mais citados em operações de PostgreSQL, quase sempre ligados a transações longas. Entender MVCC é o que permite explicar "por que a tabela cresceu e ficou lenta" e "por que essa consulta vê dados diferentes".`,
  summary: R`O MVCC guarda versões e entrega snapshots: leitores e escritores não se bloqueiam. No PostgreSQL, o UPDATE cria outra tupla (medido: §ctid§ de (0,1) para (0,3), §xmin§ 1505 para 1506). Em REPEATABLE READ, X viu 101,00 enquanto uma sessão nova via 1.101,00. Uma transação longa segura o horizonte de limpeza: após atualizar 50.000 linhas, o §VACUUM§ deixou 50.000 tuplas mortas até a transação terminar (depois, 0). O InnoDB guarda versões no undo log e limpa por purge. Transações curtas e timeouts são a defesa.`,
  refs: [REF3.mvccIntro, REF3.systemColumns, REF3.routineVacuum, REF3.mysqlMvcc, REF3.mysqlUndo, REF3.idleTimeout],
  cards: [
    { q: 'O que o MVCC garante?', a: 'Que leitores e escritores não se bloqueiam: cada transação vê um snapshot consistente de versões confirmadas.' },
    { q: 'O que mudou na linha após um UPDATE no PostgreSQL?', a: 'Criou-se uma nova tupla (novo ctid e xmin); a antiga ficou como morta até o VACUUM.' },
    { q: 'Por que uma transação longa é problema?', a: 'Segura o horizonte de limpeza: o VACUUM não remove versões que ela ainda pode precisar, e as tabelas incham.' },
    { q: 'Onde o InnoDB guarda as versões antigas?', a: 'No undo log, descartadas pelo purge quando nenhuma transação precisa delas.' },
    { q: 'O MVCC elimina as esperas por escrita?', a: 'Não: duas escritas na mesma linha ainda se serializam por travas de linha.' }
  ]
},
{
  id: 'trx-07', moduleId: 'm3', order: 7, minutes: 85, tags: ['idempotência', 'reservas', 'EXCLUDE', 'trava consultiva', 'outbox', 'padrões', 'projeto'],
  title: 'Padrões de aplicação: reservas sem corrida, idempotência, outbox e o projeto integrador',
  objectives: ['Resolver o problema "verificar e inserir" com restrições, travas ou serialização e comparar com números medidos', 'Projetar operações idempotentes com chaves de idempotência', 'Aplicar o padrão outbox para efeitos externos consistentes com a transação', 'Escolher a técnica de concorrência pelo tipo de invariante (linha, conjunto, intervalo)', 'Montar e testar o projeto integrador: um banco de reservas sem corrida'],
  intro: R`Aqui tudo se junta. A pergunta clássica é: **"como impedir que duas pessoas reservem a mesma sala no mesmo horário?"**. A solução ingênua ("verifico se está livre e, se estiver, reservo") **falha sob concorrência**, e **só aparece em carga**. Esta aula compara as soluções com um teste de **20 requisições simultâneas** (PostgreSQL 17.12), apresenta **idempotência** e **outbox** e define o **projeto integrador** do curso.`,
  theory: R`### O problema "verificar e inserir" (check-then-act)
Código típico:
§§§
BEGIN;
SELECT count(*) FROM reservas WHERE sala = 1 AND periodo && :periodo;   -- está livre?
-- (a aplicação decide)
INSERT INTO reservas (sala, quem, periodo) VALUES (1, :quem, :periodo);
COMMIT;
§§§
Entre o §SELECT§ e o §INSERT§, **outra transação** pode inserir. Em READ COMMITTED, cada transação **vê o banco sem a reserva da outra** e **ambas inserem**. Medido: **20 tentativas simultâneas** para a mesma sala e horário gravaram **20 reservas** (todas "livres" ao verificar): **overbooking total**.

### Soluções, medidas (20 tentativas simultâneas)
1. **Restrição no banco (§EXCLUDE§)**: §EXCLUDE USING gist (sala WITH =, periodo WITH &&)§ (com §btree_gist§). **Confirmadas: 1; recusadas: 19** (erro **23P01 conflicting key value violates exclusion constraint "reservas_sala_periodo_excl"**; no banco: **1** reserva). **A melhor solução**: declarativa, correta para **qualquer cliente**, sem lógica extra. A aplicação trata o erro como "horário ocupado".
2. **Trava consultiva por recurso**: abrir a transação, **§pg_advisory_xact_lock(chave_da_sala)§**, e só então verificar e inserir. Medido: **1** confirmada e **1** no banco (as demais viram "ocupado" **depois de esperar** a trava). Serializa **por sala** (a chave é, por exemplo, o id da sala), mantendo a verificação na aplicação. Exige **disciplina** (todos os caminhos de código devem pedir a trava).
3. **§SERIALIZABLE§ + repetição**: a verificação e a inserção em §SERIALIZABLE§ fazem o PostgreSQL **abortar** transações conflitantes (40001); repita e a verificação passará a ver a reserva. Correto, com **taxa de falhas** em contenção alta (aula trx-03).
4. **Linha de controle com §FOR UPDATE§**: travar a **linha da sala** (§SELECT ... FROM salas WHERE id = 1 FOR UPDATE§) antes de verificar e inserir. Serializa por sala sem travas consultivas, mas exige a linha-mãe.
5. **Restrição de unicidade** quando o recurso é **discreto** (horário fixo de 1 hora: §UNIQUE (sala, inicio)§): **simples e eficiente**; o §EXCLUDE§ é a generalização para **intervalos arbitrários**.
**Escolha:** (1) ou (5) sempre que a regra for **expressável** como restrição; (2) ou (4) quando a regra envolver **lógica complexa**; (3) quando a invariante for **ampla** e a contenção, baixa.

### Idempotência: repetir sem duplicar
Requisições **são repetidas** (cliques duplos, redes que falham, *retries* automáticos, mensagens entregues duas vezes). Uma operação **idempotente** produz o **mesmo efeito** quando repetida. Técnica: uma **chave de idempotência** gerada pelo cliente (por exemplo, "pedido-77-tentativa") guardada com **restrição única**; o primeiro §INSERT§ vence e os repetidos são **ignorados** (§ON CONFLICT DO NOTHING§) ou devolvem a **resposta original**. Medido: **20 requisições repetidas** de cobrança com a mesma chave → **1** gravada, **19** ignoradas, **1** linha na tabela. É o desenho de APIs de pagamento (cabeçalho §Idempotency-Key§).

### Efeitos externos: o padrão outbox
Problema: dentro de uma transação você grava o pedido **e** precisa **enviar um evento** (e-mail, mensagem a outro serviço). Se enviar **antes do commit** e a transação for desfeita, o mundo viu algo que **não aconteceu**; se enviar **depois** e o processo cair, o evento **se perde**. Solução, **outbox transacional**: na **mesma transação**, grave o pedido **e** uma linha na tabela §outbox§ (o evento a enviar). Um **processo separado** lê a outbox (com §FOR UPDATE SKIP LOCKED§, aula trx-04), **publica** o evento e marca como enviado, **com repetição**: a entrega é **pelo menos uma vez**, então o consumidor deve ser **idempotente**. Resultado: **a escrita e a intenção de enviar são atômicas**. (Descrito pelo padrão; **não executado** em broker neste curso.)

### Escolhendo a técnica pelo tipo de invariante
| Invariante | Técnica |
|---|---|
| Valor numérico não negativo, incremento | UPDATE atômico + CHECK |
| Unicidade (e-mail, chave natural) | UNIQUE |
| Não sobreposição de intervalos | EXCLUDE (gist) |
| "Pelo menos N" sobre um conjunto | SERIALIZABLE, travar o conjunto ou linha de controle |
| Mesmo trabalho por um único processo | Trava consultiva |
| Operação repetida | Chave de idempotência |
| Efeito externo + escrita | Outbox |

### Checklist de concorrência para revisão
1. **Quais são as invariantes?** Estão no banco?
2. Há algum **ler → decidir → escrever** na aplicação?
3. As transações são **curtas**?
4. **Ordem consistente** de travas?
5. **Tempos limites** configurados?
6. Falhas **40001/40P01** são **repetidas**?
7. Operações **idempotentes**?
8. Existe **teste de concorrência** (sessões controladas ou carga) para o caminho crítico?

### Projeto integrador: banco de reservas sem corrida
Construa o modelo e a camada de acesso de um **sistema de reservas** (salas ou assentos): tabelas, restrição de exclusão, API de reserva com **idempotência**, **laço de repetição**, **fila de notificações com outbox e SKIP LOCKED** e uma **suíte de testes de concorrência** com sessões controladas e carga (20 a 100 requisições simultâneas), mostrando **antes** (ingênuo) e **depois** (protegido).`,
  concepts: [
    { term: 'Verificar e inserir (check-then-act)', def: 'Padrão em que se checa uma condição e depois se age, vulnerável a corridas sob concorrência.' },
    { term: 'Overbooking', def: 'Aceitar mais reservas do que a capacidade, por falha de controle de concorrência.' },
    { term: 'Restrição de exclusão', def: 'Constraint que impede linhas conflitantes, como intervalos sobrepostos do mesmo recurso.' },
    { term: 'Chave de idempotência', def: 'Identificador de uma operação, garantido como único, para que repetições não dupliquem seus efeitos.' },
    { term: 'ON CONFLICT DO NOTHING', def: 'Cláusula que ignora uma inserção que viola unicidade.' },
    { term: 'Outbox transacional', def: 'Padrão em que o evento a publicar é gravado na mesma transação da mudança e enviado depois por outro processo.' },
    { term: 'Entrega pelo menos uma vez', def: 'Garantia de que uma mensagem chega uma ou mais vezes, exigindo consumidores idempotentes.' },
    { term: 'Linha de controle', def: 'Linha-mãe travada para serializar operações sobre um conjunto de filhos.' },
    { term: 'Teste de concorrência', def: 'Teste que executa operações simultâneas, de forma controlada ou em carga, para revelar corridas.' },
    { term: 'Idempotency-Key', def: 'Cabeçalho comum em APIs de pagamento para identificar uma operação repetida.' }
  ],
  examples: R`**Analogia:** a reserva ingênua é **olhar a agenda de papel, ver a sala livre e anotar o nome**: se duas pessoas olham **ao mesmo tempo**, ambas veem "livre" e anotam. A **restrição de exclusão** é **a própria agenda recusar a segunda anotação** que se sobrepõe à primeira, **sem depender de quem olhou o quê**. A **idempotência** é o **número do recibo**: se você apresenta o mesmo recibo duas vezes, o caixa percebe e **não cobra de novo**. O **outbox** é **deixar o recado na caixa de saída do próprio caixa**, junto com a venda: o mensageiro leva depois, e se levar duas vezes quem recebe confere pelo número.

**Exemplo 1: corrida.** 20 tentativas simultâneas: 20 reservas gravadas (overbooking).

**Exemplo 2: proteção.** Com EXCLUDE: 1 confirmada e 19 recusadas; com trava consultiva: 1 confirmada.

**Exemplo 3: idempotência.** 20 requisições repetidas: 1 cobrança.`,
  code: [
    { title: 'Reserva ingênua x restrição de exclusão (Node.js + pg, resultado medido)', lang: 'js', code: R`// 20 sessões tentam reservar a sala 1 das 10h às 11h ao mesmo tempo
// INGÊNUO: verificar e inserir
const { rows } = await c.query(
  "SELECT count(*)::int AS n FROM reservas_ingenua WHERE sala = 1 AND periodo && $1::tstzrange", [periodo]);
if (rows[0].n === 0) await c.query('INSERT INTO reservas_ingenua (sala, quem, periodo) VALUES (1, $1, $2::tstzrange)', [i, periodo]);
// → 20 reservas gravadas (overbooking)

// PROTEGIDO: restrição EXCLUDE no banco (sala WITH =, periodo WITH &&)
try {
  await c.query('INSERT INTO reservas (sala, quem, periodo) VALUES (1, $1, $2::tstzrange)', [i, periodo]);
} catch (e) {
  if (e.code === '23P01') return 'horário ocupado';      // violação de exclusão
  throw e;
}
// → 1 confirmada e 19 recusadas`, notes: [{ l: '3', t: 'Entre a verificação e a inserção, outras transações inserem.' }, { l: '6', t: 'O resultado medido foi 20 reservas na mesma sala e horário.' }, { l: '14', t: 'A regra no banco vale para qualquer cliente; o erro 23P01 vira uma resposta de negócio.' }] },
    { title: 'Idempotência e outbox (SQL)', lang: 'sql', code: R`-- idempotência: chave única + ON CONFLICT
CREATE TABLE pagamentos (
  chave_idempotencia text PRIMARY KEY,
  valor numeric(10,2) NOT NULL,
  criado timestamptz DEFAULT now()
);
INSERT INTO pagamentos (chave_idempotencia, valor) VALUES ('pedido-77-tentativa', 59.90)
ON CONFLICT (chave_idempotencia) DO NOTHING;     -- 20 repetições: 1 linha gravada, 19 ignoradas

-- outbox: o evento é gravado na MESMA transação da mudança
BEGIN;
INSERT INTO pedidos (id, cliente_id) VALUES (78, 5);
INSERT INTO outbox (tipo, payload) VALUES ('pedido_criado', '{"pedido": 78}');
COMMIT;

-- publicador (processo separado)
BEGIN;
SELECT id, payload FROM outbox WHERE enviado_em IS NULL ORDER BY id LIMIT 10 FOR UPDATE SKIP LOCKED;
-- publica no broker; depois: UPDATE outbox SET enviado_em = now() WHERE id = ANY(:ids);
COMMIT;`, notes: [{ l: '7', t: 'A restrição única torna a repetição inofensiva.' }, { l: '13', t: 'Escrever o pedido e o evento na mesma transação os torna atômicos.' }, { l: '18', t: 'SKIP LOCKED permite vários publicadores sem duplicar o trabalho (entrega pelo menos uma vez).' }] }
  ],
  bestPractices: ['Transforme invariantes em restrições do banco sempre que possível (UNIQUE, EXCLUDE, CHECK).', 'Evite verificar e inserir sem proteção: use restrições, travas ou serialização.', 'Use chaves de idempotência em operações repetíveis, principalmente pagamentos.', 'Use outbox para efeitos externos consistentes com a transação.', 'Teste o caminho crítico com concorrência controlada e com carga.', 'Trate erros de restrição (23P01, 23505) como respostas de negócio.'],
  mistakes: ['Confiar em verificações da aplicação sem proteção no banco.', 'Enviar e-mails ou eventos dentro da transação ou imediatamente após, sem estratégia.', 'Não definir chaves de idempotência em operações financeiras.', 'Usar travas consultivas em alguns caminhos de código e esquecer em outros.', 'Testar só com um usuário por vez.', 'Tratar o erro de restrição como falha técnica em vez de regra de negócio.'],
  market: R`Reservas, estoque e pagamentos são os domínios em que concorrência vira dinheiro. Sistemas de pagamento públicos exigem idempotência, e arquiteturas orientadas a eventos dependem do padrão outbox. Mostrar um teste de concorrência que prova a proteção é um diferencial em revisões técnicas.`,
  summary: R`Verificar e inserir falha sob concorrência: 20 tentativas simultâneas gravaram 20 reservas. Com a restrição §EXCLUDE§ houve 1 confirmada e 19 recusadas (23P01); com §pg_advisory_xact_lock§ por sala, 1 confirmada. Chaves de idempotência (§ON CONFLICT DO NOTHING§) tornaram 20 repetições uma só cobrança (1 gravada, 19 ignoradas). O outbox transacional torna atômicas a escrita e a intenção de enviar um evento. Escolha a técnica pelo tipo de invariante e teste a concorrência.`,
  refs: [REF3.rangeTypes, REF3.insert, REF3.outbox, REF3.stripeIdem, REF.pgIso],
  cards: [
    { q: 'Por que verificar e inserir falha sob concorrência?', a: 'Entre a verificação e a inserção outra transação pode inserir; ambas veem "livre" e gravam (medido: 20 reservas para o mesmo horário).' },
    { q: 'Qual a solução mais robusta para não sobrepor intervalos?', a: 'Uma restrição EXCLUDE (gist) no banco, que vale para qualquer cliente.' },
    { q: 'O que é uma chave de idempotência?', a: 'Um identificador único da operação, com restrição de unicidade, para que repetições não dupliquem efeitos.' },
    { q: 'O que o outbox transacional resolve?', a: 'Torna atômicas a mudança de dados e a intenção de enviar um evento, que um processo separado publica depois.' },
    { q: 'Por que consumidores de eventos precisam ser idempotentes?', a: 'Porque a entrega é pelo menos uma vez: a mesma mensagem pode chegar mais de uma vez.' }
  ]
}
];
