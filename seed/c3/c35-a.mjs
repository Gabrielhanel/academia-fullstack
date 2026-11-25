// C3.5 — Transações e concorrência. Aulas 1 e 2 (ACID e transações; níveis de isolamento e anomalias de leitura).
const R = String.raw;

export const REF = {
  pgTx: { title: 'PostgreSQL 17 — Transactions (tutorial)', url: 'https://www.postgresql.org/docs/17/tutorial-transactions.html', kind: 'doc' },
  pgIso: { title: 'PostgreSQL 17 — Transaction Isolation', url: 'https://www.postgresql.org/docs/17/transaction-iso.html', kind: 'doc' },
  pgMvccIntro: { title: 'PostgreSQL 17 — Concurrency Control (MVCC)', url: 'https://www.postgresql.org/docs/17/mvcc-intro.html', kind: 'doc' },
  savepoint: { title: 'PostgreSQL 17 — SAVEPOINT', url: 'https://www.postgresql.org/docs/17/sql-savepoint.html', kind: 'doc' },
  setTransaction: { title: 'PostgreSQL 17 — SET TRANSACTION', url: 'https://www.postgresql.org/docs/17/sql-set-transaction.html', kind: 'doc' },
  wal: { title: 'PostgreSQL 17 — Reliability and the Write-Ahead Log', url: 'https://www.postgresql.org/docs/17/wal.html', kind: 'doc' },
  asyncCommit: { title: 'PostgreSQL 17 — Asynchronous Commit', url: 'https://www.postgresql.org/docs/17/wal-async-commit.html', kind: 'doc' },
  mysqlIso: { title: 'MySQL 8.4 — InnoDB Transaction Isolation Levels', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html', kind: 'doc' },
  mysqlAcid: { title: 'MySQL 8.4 — InnoDB and the ACID Model', url: 'https://dev.mysql.com/doc/refman/8.4/en/mysql-acid.html', kind: 'doc' },
  mysqlConsistent: { title: 'MySQL 8.4 — Consistent Nonlocking Reads', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html', kind: 'doc' },
  jepsen: { title: 'Jepsen — Consistency Models', url: 'https://jepsen.io/consistency', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'trx-01', moduleId: 'm1', order: 1, minutes: 70, tags: ['transação', 'ACID', 'atomicidade', 'durabilidade', 'savepoint', 'autocommit'],
  title: 'Transações e ACID: atomicidade, consistência, isolamento e durabilidade na prática',
  objectives: ['Explicar o que é uma transação e as quatro propriedades ACID', 'Usar §BEGIN§, §COMMIT§, §ROLLBACK§ e §SAVEPOINT§ e prever o comportamento após um erro', 'Distinguir o modo de transação automática (autocommit) do modo explícito', 'Explicar como o registro de escrita antecipada (WAL) sustenta a durabilidade', 'Aplicar a regra de transações curtas e atômicas por regra de negócio'],
  intro: R`Transferir R$ 70 da conta da Ana para a do Bruno é **duas escritas** (debitar e creditar). Se o sistema cair no meio, o dinheiro **some ou duplica**. Uma **transação** agrupa operações para que valham **por inteiro ou nada**. Esta aula apresenta as propriedades **ACID**, mostra o que o PostgreSQL 17.12 faz quando uma transação falha (inclusive o estado "abortada") e explica, de forma prática, a **durabilidade**. As concorrências entre transações vêm nas próximas aulas.`,
  theory: R`### O que é uma transação
Uma **transação** é uma **unidade lógica de trabalho**: um conjunto de comandos que o banco trata como **um só**. Termina com **§COMMIT§** (confirma: tudo vale e passa a ser visível) ou **§ROLLBACK§** (descarta: nada do que a transação fez vale). Os comandos fora de um bloco explícito rodam em **modo automático** (*autocommit*): **cada comando é uma transação própria**. Para agrupar vários, abra com **§BEGIN§** (no MySQL, §START TRANSACTION§ ou §BEGIN§).

### ACID
- **A: Atomicidade**: **tudo ou nada**. Medido (PostgreSQL 17.12): em uma transação, creditamos 70 ao Bruno (ele passou a ter **120,00** *dentro* da transação), depois tentamos debitar 130 da Ana (saldo 100), o que violou a restrição §CHECK (saldo >= 0)§ e falhou com **new row ... violates check constraint "contas_saldo_check"**. Após o §ROLLBACK§: **Ana = 100,00 e Bruno = 50,00**: a transferência incompleta **não deixou rastro**.
- **C: Consistência**: a transação leva o banco de um estado **válido** a outro **válido**, respeitando **restrições** (chaves, §CHECK§, chaves estrangeiras) e as regras de negócio que você declarou no banco. O banco garante **o que foi declarado**; regras não declaradas dependem da aplicação.
- **I: Isolamento**: transações **simultâneas** não devem **interferir** de forma indevida. Quanto interferem depende do **nível de isolamento** (aulas trx-02 e trx-03).
- **D: Durabilidade**: depois do §COMMIT§ confirmado, o resultado **sobrevive** a quedas (energia, processo). Garantida pelo **WAL**.

### Transação abortada no PostgreSQL
Medido: depois do erro da restrição **dentro** de um bloco §BEGIN§, o comando seguinte (§SELECT 1§) retornou **current transaction is aborted, commands ignored until end of transaction block** (código **25P02**). No PostgreSQL, **qualquer erro** em uma transação a deixa **abortada**: só resta §ROLLBACK§ (ou §ROLLBACK TO SAVEPOINT§). No MySQL/InnoDB, **um erro de comando** costuma desfazer **apenas aquele comando** e a transação **continua aberta** (exceto deadlocks, que desfazem a transação toda; comportamento descrito na documentação, **não executado** aqui): o **driver e a aplicação precisam tratar** cada caso. Em ambos: **sempre feche** a transação, mesmo no erro (§finally§).

### Savepoints: desfazer só uma parte
§SAVEPOINT sp1§ marca um ponto; §ROLLBACK TO SAVEPOINT sp1§ desfaz **só o que veio depois**, mantendo a transação viva. Medido: somamos 10, criamos o savepoint, a operação seguinte falhou (check), voltamos ao savepoint, somamos 5 e demos §COMMIT§: saldo final **115,00** (100 + 10 + 5), sem o débito que falhou. Úteis para "tentar" uma operação opcional dentro de uma transação maior. Cuidado: muitos savepoints custam recursos.

### Durabilidade na prática: o WAL
Antes de uma alteração chegar aos arquivos de dados, o banco grava **o registro dela no WAL** (*write-ahead log*) e **força a gravação em disco** no §COMMIT§ (§fsync§). Se o servidor cair, na reinicialização o banco **reaplica o WAL** (recuperação) e restaura tudo que foi confirmado. Medido: §synchronous_commit = on§, §fsync = on§ e §wal_level = replica§ (padrões do PostgreSQL 17). Desligar §fsync§ ou usar §synchronous_commit = off§ **acelera**, mas pode **perder as últimas transações confirmadas** numa queda (o banco continua **consistente**, mas pode "esquecer" as mais recentes): decisão consciente para dados descartáveis. No MySQL, o equivalente é o **redo log** e o parâmetro §innodb_flush_log_at_trx_commit§.
Importante: **durabilidade local não é backup nem replicação** (aula pgm-08 e pgm-09).

### Transações e a regra de negócio
Uma transação deve corresponder a **uma operação de negócio** ("registrar o pedido com seus itens e baixar o estoque"). Princípios:
1. **Curta**: abra tarde, feche cedo. Transações longas **seguram travas e versões antigas** (aulas trx-04 e trx-06).
2. **Sem espera de usuário dentro**: nunca deixe uma transação aberta enquanto aguarda um clique ou uma chamada de rede lenta.
3. **Sem efeitos externos** que não possam ser desfeitos (enviar e-mail, cobrar cartão) **dentro** do bloco: use padrões como **outbox** (aula trx-07).
4. **Idempotência**: se a aplicação repetir a operação (nova tentativa), o resultado não deve duplicar.
5. **Escopo claro**: uma transação **por requisição** (ou por mensagem) costuma ser um bom padrão.

### Autocommit e o perigo de esquecer o BEGIN
Sem §BEGIN§, a transferência é **dois commits independentes**: se o segundo falhar, o primeiro **já foi confirmado**. Em drivers e ORMs, procure o **modo de transação** padrão e use as APIs de **transação** (§tx.begin()§, "unit of work") em vez de comandos soltos.

### O que o MySQL faz de diferente (aula pgm-03)
**DDL** (§CREATE TABLE§, §ALTER§) causa **commit implícito** no MySQL (medido anteriormente) e é transacional no PostgreSQL. Tabelas **MyISAM** (legado) **não** têm transações: use **InnoDB**.`,
  concepts: [
    { term: 'Transação', def: 'Unidade lógica de trabalho que é confirmada por inteiro ou desfeita por inteiro.' },
    { term: 'ACID', def: 'Atomicidade, consistência, isolamento e durabilidade: propriedades esperadas de transações.' },
    { term: 'COMMIT', def: 'Comando que confirma a transação e torna suas mudanças permanentes e visíveis.' },
    { term: 'ROLLBACK', def: 'Comando que descarta todas as mudanças da transação.' },
    { term: 'Autocommit', def: 'Modo em que cada comando é uma transação própria, confirmada automaticamente.' },
    { term: 'Savepoint', def: 'Ponto intermediário de uma transação ao qual se pode voltar sem descartá-la inteira.' },
    { term: 'Transação abortada', def: 'Estado do PostgreSQL após um erro, em que só ROLLBACK é aceito.' },
    { term: 'WAL', def: 'Registro de escrita antecipada: alterações são gravadas no log antes dos arquivos de dados.' },
    { term: 'Durabilidade', def: 'Garantia de que o que foi confirmado sobrevive a falhas.' },
    { term: 'Idempotência', def: 'Propriedade de uma operação que pode ser repetida sem mudar o resultado além da primeira vez.' }
  ],
  examples: R`**Analogia:** uma transação é **fechar uma venda no caixa**: a nota só vale se **todos** os itens forem passados e o pagamento aprovado; se algo falha no meio, **anula-se a nota inteira**. O WAL é o **diário do caixa** em que cada movimentação é anotada **antes** de ir para o cofre: se faltar luz, o gerente lê o diário e refaz o que foi confirmado. O savepoint é **cancelar apenas o último item** sem anular a venda.

**Exemplo 1: atomicidade medida.** Bruno chegou a 120 dentro da transação, mas voltou a 50 depois do rollback; Ana permaneceu em 100.

**Exemplo 2: aborto.** Depois do erro, até um SELECT 1 foi recusado (25P02).

**Exemplo 3: savepoint.** O débito inválido foi desfeito, e o saldo final foi 115.`,
  code: [
    { title: 'Atomicidade e transação abortada (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`CREATE TABLE contas (id int PRIMARY KEY, dono text, saldo numeric(10,2) NOT NULL CHECK (saldo >= 0));
INSERT INTO contas VALUES (1, 'Ana', 100), (2, 'Bruno', 50);

BEGIN;
UPDATE contas SET saldo = saldo + 70 WHERE id = 2;          -- Bruno: 120.00 (dentro da transação)
UPDATE contas SET saldo = saldo - 130 WHERE id = 1;
-- ERROR: new row for relation "contas" violates check constraint "contas_saldo_check"
SELECT 1;
-- ERROR: current transaction is aborted, commands ignored until end of transaction block
ROLLBACK;

SELECT dono, saldo FROM contas ORDER BY id;                  -- Ana 100.00 | Bruno 50.00`, notes: [{ l: '5', t: 'O crédito é visível só dentro da transação.' }, { l: '6', t: 'O débito viola a restrição de consistência.' }, { l: '8', t: 'No PostgreSQL, depois do erro só ROLLBACK é aceito.' }, { l: '12', t: 'Tudo foi desfeito: nada vazou.' }] },
    { title: 'Savepoint (SQL, saída medida)', lang: 'sql', code: R`BEGIN;
UPDATE contas SET saldo = saldo + 10 WHERE id = 1;
SAVEPOINT sp1;
UPDATE contas SET saldo = saldo - 500 WHERE id = 1;     -- ERROR: violates check constraint
ROLLBACK TO SAVEPOINT sp1;                               -- volta só até aqui
UPDATE contas SET saldo = saldo + 5 WHERE id = 1;
COMMIT;
SELECT saldo FROM contas WHERE id = 1;                   -- 115.00 (100 + 10 + 5)`, notes: [{ l: '3', t: 'O savepoint marca um ponto de retorno dentro da transação.' }, { l: '5', t: 'O rollback parcial restaura a transação ao estado utilizável.' }] }
  ],
  bestPractices: ['Agrupe em uma transação todas as escritas de uma operação de negócio.', 'Declare as regras de consistência no banco (CHECK, chaves, UNIQUE).', 'Mantenha as transações curtas e sem espera de usuário ou chamadas externas lentas.', 'Sempre feche a transação (finally) e trate o estado abortado do PostgreSQL.', 'Use savepoints para tentativas opcionais dentro de uma transação maior.', 'Projete operações idempotentes para suportar novas tentativas.'],
  mistakes: ['Executar várias escritas relacionadas em modo autocommit.', 'Manter transações abertas durante espera de usuário.', 'Ignorar o erro e continuar usando uma transação abortada.', 'Enviar e-mails ou cobranças dentro da transação sem estratégia de compensação.', 'Desligar fsync ou synchronous_commit sem avaliar a perda aceitável.', 'Assumir que ACID impede qualquer anomalia de concorrência em qualquer nível.'],
  market: R`Perguntas sobre ACID e transações são frequentes em entrevistas e determinam a confiabilidade de sistemas financeiros e de pedidos. Bugs de dinheiro que "some" quase sempre vêm de escritas fora de transação ou de transações mal delimitadas.`,
  summary: R`Uma transação agrupa comandos que valem por inteiro ou nada (ACID). Medido: depois de um erro de restrição, o rollback devolveu Ana 100,00 e Bruno 50,00; o PostgreSQL deixa a transação abortada (25P02) até o rollback; um savepoint permitiu desfazer só a parte inválida (saldo final 115,00). A durabilidade vem do WAL com §fsync§ e §synchronous_commit = on§. Mantenha as transações curtas, sem espera de usuário nem efeitos externos irreversíveis, e idempotentes.`,
  refs: [REF.pgTx, REF.savepoint, REF.wal, REF.asyncCommit, REF.mysqlAcid],
  cards: [
    { q: 'O que significa cada letra de ACID?', a: 'Atomicidade (tudo ou nada), Consistência (estado válido), Isolamento (transações simultâneas não interferem indevidamente) e Durabilidade (o confirmado sobrevive a falhas).' },
    { q: 'O que acontece no PostgreSQL depois de um erro dentro de uma transação?', a: 'A transação fica abortada (25P02): só ROLLBACK ou ROLLBACK TO SAVEPOINT são aceitos.' },
    { q: 'Qual a função do WAL?', a: 'Registrar as mudanças antes dos arquivos de dados para recuperar o confirmado após uma queda.' },
    { q: 'O que é autocommit?', a: 'Modo em que cada comando é uma transação própria confirmada automaticamente.' },
    { q: 'Por que manter transações curtas?', a: 'Transações longas seguram travas e versões antigas, prejudicando a concorrência e a limpeza.' }
  ]
},
{
  id: 'trx-02', moduleId: 'm1', order: 2, minutes: 80, tags: ['isolamento', 'dirty read', 'leitura não repetível', 'fantasma', 'snapshot', 'READ COMMITTED', 'REPEATABLE READ'],
  title: 'Níveis de isolamento I: leitura suja, leitura não repetível e fantasmas',
  objectives: ['Definir as anomalias de leitura (leitura suja, leitura não repetível e fantasma)', 'Relacionar os quatro níveis do padrão SQL às anomalias que previnem', 'Prever o comportamento do PostgreSQL e do MySQL/InnoDB em cada nível com base em experimentos', 'Escolher o nível de isolamento por requisito e entender o custo', 'Configurar o nível por transação e como padrão'],
  intro: R`Quando duas transações rodam ao mesmo tempo, o resultado depende do **nível de isolamento**. Níveis fracos são **mais rápidos** e permitem **anomalias**; níveis fortes evitam anomalias e podem **falhar ou esperar mais**. Esta aula mostra as **anomalias de leitura** com **duas sessões reais** (PostgreSQL 17.12 e MySQL 8.4.13) e as diferenças entre os dois bancos, que surpreendem quem migra.`,
  theory: R`### Por que existe isolamento
O ideal seria que as transações simultâneas se comportassem **como se rodassem uma depois da outra** (*serializável*). Isso tem custo (espera, falhas, menor vazão). O padrão SQL define **quatro níveis**, de mais fraco a mais forte, e cada um **proíbe** certas anomalias.

### As anomalias de leitura
1. **Leitura suja (*dirty read*)**: ler dados **não confirmados** de outra transação, que podem ser **desfeitos**.
2. **Leitura não repetível (*non-repeatable read*)**: ler **a mesma linha duas vezes** na mesma transação e obter **valores diferentes**, porque outra transação **confirmou** uma alteração entre as leituras.
3. **Leitura fantasma (*phantom read*)**: repetir uma **consulta por condição** e obter **linhas a mais (ou a menos)**, porque outra transação **inseriu (ou apagou)** linhas que satisfazem a condição.

### Os níveis do padrão
| Nível | Leitura suja | Não repetível | Fantasma |
|---|---|---|---|
| READ UNCOMMITTED | permitida | permitida | permitida |
| READ COMMITTED | **proibida** | permitida | permitida |
| REPEATABLE READ | proibida | **proibida** | permitida (pelo padrão) |
| SERIALIZABLE | proibida | proibida | **proibida** |
O padrão apenas diz o que **pode** ocorrer; cada banco implementa de seu jeito (com **snapshots**, **travas** ou ambos).

### O experimento: duas sessões, X lê e Y altera
**1. Leitura suja.** X abre uma transação em §READ UNCOMMITTED§; Y inicia uma transação e altera a Ana para 999 **sem confirmar**. X lê a Ana:
- **PostgreSQL**: X leu **100,00**. O PostgreSQL **aceita** o nome §READ UNCOMMITTED§, mas o trata como §READ COMMITTED§: **nunca há leitura suja**.
- **MySQL/InnoDB**: X leu **999,00**: **leitura suja de verdade**, depois que Y deu §ROLLBACK§ esse valor nunca existiu.
**2. Leitura não repetível.** X lê a Ana; Y altera a Ana para 500 e **confirma**; X lê de novo:
- §READ COMMITTED§ (os dois bancos): **100,00 e depois 500,00** (a leitura não é repetível, pois cada comando vê o que foi confirmado até aquele momento).
- §REPEATABLE READ§ (os dois bancos): **100,00 e depois 100,00** (a transação enxerga um **snapshot** do início).
**3. Fantasma.** X conta as contas com saldo > 40; Y insere uma conta de 80 e confirma; X conta de novo:
- PostgreSQL §READ COMMITTED§: **2 e depois 3** (fantasma); §REPEATABLE READ§: **2 e 2**. **O §REPEATABLE READ§ do PostgreSQL também evita fantasmas** (é um snapshot completo, mais forte que o padrão exige).
- MySQL §REPEATABLE READ§: o §SELECT§ comum viu **2 e 2** (leitura consistente), mas um **§SELECT ... FOR UPDATE§** (leitura **atual**, com trava) viu **3**. No InnoDB, **leituras com trava veem os dados mais recentes**, e misturar os dois tipos na mesma transação causa surpresas.

### Como cada banco implementa o isolamento
- **PostgreSQL**: **MVCC puro** com **snapshots** por comando (§READ COMMITTED§) ou por transação (§REPEATABLE READ§ e §SERIALIZABLE§). Leitores **não bloqueiam** escritores e vice-versa. O §SERIALIZABLE§ usa **SSI** (*serializable snapshot isolation*), que **detecta** conflitos e **aborta** transações (aula trx-03).
- **MySQL/InnoDB**: MVCC para **leituras consistentes** (§SELECT§ comum) + **travas** (de linha e de **intervalo**, *gap locks*) para leituras com trava e escritas. Em §SERIALIZABLE§, os §SELECT§ comuns viram leituras com trava compartilhada: mais **bloqueios**.

### Padrões de cada banco
- **PostgreSQL**: §READ COMMITTED§ (medido: padrão). **MySQL**: §REPEATABLE READ§ (medido: REPEATABLE-READ). Isso afeta o comportamento de código portado de um banco ao outro.

### Como configurar
- Por transação: §BEGIN ISOLATION LEVEL REPEATABLE READ§ (PostgreSQL) ou §SET TRANSACTION ISOLATION LEVEL ...§ antes de §START TRANSACTION§ (MySQL).
- Padrão da sessão: §SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL ...§ (PostgreSQL), §SET SESSION TRANSACTION ISOLATION LEVEL ...§ (MySQL).
- Padrão global: §default_transaction_isolation§ (PostgreSQL) e §transaction_isolation§ (MySQL).
No PostgreSQL, o nível **só pode ser definido antes da primeira consulta** da transação.

### Como escolher o nível
- **READ COMMITTED**: bom padrão para a maioria das operações (consultas curtas, cada comando vê dados atuais). Cuidado com **leituras duplas** da mesma informação na mesma transação.
- **REPEATABLE READ**: relatórios e operações que **precisam de uma visão consistente** durante vários comandos; em escritas, prepare-se para **falhas de serialização** (aula trx-03).
- **SERIALIZABLE**: quando as invariantes são **complexas** e difíceis de proteger com travas; **exige tratamento de falhas e nova tentativa**.
- **READ UNCOMMITTED**: quase nunca; no MySQL, só para **estimativas** tolerantes a leituras sujas.
**Regra:** use o **menor nível** que garanta suas invariantes **com técnicas explícitas** (UPDATE atômico, travas, restrições) e **teste** a concorrência; o nível sozinho raramente basta.

### Testando concorrência
Escreva testes com **duas sessões** controladas por código (como os desta aula): abra as transações, **intercale** os comandos de forma determinística e verifique o resultado. Testes de carga com muitos clientes revelam o que os cenários manuais não mostram.`,
  concepts: [
    { term: 'Nível de isolamento', def: 'Configuração que define quais anomalias de concorrência uma transação pode observar.' },
    { term: 'Leitura suja', def: 'Leitura de dados não confirmados por outra transação.' },
    { term: 'Leitura não repetível', def: 'Leitura da mesma linha com valores diferentes na mesma transação, por mudanças confirmadas entre as leituras.' },
    { term: 'Leitura fantasma', def: 'Aparecimento ou desaparecimento de linhas entre duas execuções da mesma consulta.' },
    { term: 'Snapshot', def: 'Visão consistente dos dados confirmados em um instante, usada pelo MVCC.' },
    { term: 'READ COMMITTED', def: 'Nível em que cada comando vê os dados confirmados até o seu início.' },
    { term: 'REPEATABLE READ', def: 'Nível em que a transação enxerga o mesmo snapshot do início ao fim.' },
    { term: 'SERIALIZABLE', def: 'Nível mais forte, em que o resultado equivale a uma execução em série.' },
    { term: 'Leitura consistente (InnoDB)', def: 'SELECT comum que usa o snapshot da transação sem travar linhas.' },
    { term: 'Leitura atual (InnoDB)', def: 'Leitura com trava (FOR UPDATE, FOR SHARE) que vê as versões mais recentes.' }
  ],
  examples: R`**Analogia:** duas pessoas editam a **mesma planilha compartilhada**. **Leitura suja** é ver a célula que a colega está digitando e ainda pode apagar. **Não repetível** é olhar a célula, a colega salvar uma mudança, e olhar de novo: valor diferente. **Fantasma** é contar as linhas de uma tabela, a colega inserir uma linha nova e salvar, e contar de novo: apareceu mais uma. O **snapshot** é tirar uma **foto da planilha** no início do seu trabalho e só consultar a foto.

**Exemplo 1: leitura suja.** No MySQL com READ UNCOMMITTED a leitura viu 999,00, valor que depois foi desfeito; no PostgreSQL leu 100,00.

**Exemplo 2: não repetível.** Em READ COMMITTED a Ana foi de 100 para 500 dentro da mesma transação; em REPEATABLE READ ficou em 100.

**Exemplo 3: fantasma.** No PostgreSQL READ COMMITTED a contagem foi de 2 para 3; em REPEATABLE READ continuou 2.`,
  code: [
    { title: 'Leitura não repetível com duas sessões (Node.js + pg, saída medida)', lang: 'js', code: R`import pg from 'pg';
const cfg = { host: '127.0.0.1', port: 55432, user: 'postgres', password: 'lab', database: 'postgres' };
const novo = async () => { const c = new pg.Client(cfg); await c.connect(); return c; };
const saldo = async (c) => (await c.query('SELECT saldo FROM tx.contas WHERE id = 1')).rows[0].saldo;

for (const nivel of ['READ COMMITTED', 'REPEATABLE READ']) {
  const x = await novo(), y = await novo();
  await x.query('BEGIN ISOLATION LEVEL ' + nivel);
  const antes = await saldo(x);
  await y.query('UPDATE tx.contas SET saldo = 500 WHERE id = 1');   // Y confirma sozinho (autocommit)
  const depois = await saldo(x);
  console.log(nivel + ': X lê', antes, 'e depois', depois);
  // READ COMMITTED: 100.00 e depois 500.00 | REPEATABLE READ: 100.00 e depois 100.00
  await x.query('COMMIT'); await x.end(); await y.end();
}`, notes: [{ l: '8', t: 'O nível é definido no BEGIN, antes da primeira consulta.' }, { l: '10', t: 'A sessão Y altera e confirma enquanto X ainda está aberta.' }, { l: '13', t: 'Cada comando de READ COMMITTED vê um snapshot novo; REPEATABLE READ reaproveita o do início.' }] },
    { title: 'Leitura suja no MySQL e no PostgreSQL (SQL, saída medida)', lang: 'sql', code: R`-- sessão X
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;   -- (MySQL)
START TRANSACTION;

-- sessão Y
START TRANSACTION;
UPDATE contas SET saldo = 999 WHERE id = 1;   -- ainda sem COMMIT

-- sessão X
SELECT saldo FROM contas WHERE id = 1;        -- MySQL: 999.00 (leitura suja)  |  PostgreSQL: 100.00

-- sessão Y
ROLLBACK;                                      -- o 999.00 nunca "existiu"`, notes: [{ l: '8', t: 'MySQL permite a leitura suja neste nível.' }, { l: '8', t: 'O PostgreSQL trata READ UNCOMMITTED como READ COMMITTED.' }, { l: '11', t: 'Quem leu 999 tomou decisões com um dado que desapareceu.' }] }
  ],
  bestPractices: ['Conheça o nível de isolamento padrão do seu banco (READ COMMITTED no PostgreSQL, REPEATABLE READ no MySQL).', 'Use o menor nível que garanta as invariantes, combinado com técnicas explícitas.', 'Use REPEATABLE READ para relatórios que leem várias vezes os mesmos dados.', 'Evite misturar leituras consistentes e com trava na mesma transação InnoDB sem entender o efeito.', 'Teste concorrência com duas sessões e cenários determinísticos.', 'Evite READ UNCOMMITTED, salvo estimativas conscientes no MySQL.'],
  mistakes: ['Achar que o nível padrão é o mesmo em todos os bancos.', 'Ler a mesma informação duas vezes em READ COMMITTED e esperar o mesmo valor.', 'Assumir que REPEATABLE READ protege contra qualquer anomalia (ver atualização perdida e write skew).', 'Usar READ UNCOMMITTED por "desempenho" e produzir relatórios errados.', 'Definir o nível depois da primeira consulta da transação.', 'Não testar a concorrência.'],
  market: R`Isolamento é um tema clássico de entrevistas ("quais anomalias o REPEATABLE READ evita?") e uma causa recorrente de bugs financeiros e de inventário. Saber que PostgreSQL e MySQL se comportam de maneira diferente evita surpresas em migrações.`,
  summary: R`As anomalias de leitura são leitura suja, não repetível e fantasma; os níveis do padrão proíbem mais anomalias à medida que sobem. Medido: o PostgreSQL trata READ UNCOMMITTED como READ COMMITTED (leu 100,00) e o MySQL permite a leitura suja (999,00). Em READ COMMITTED a Ana foi de 100 a 500 na mesma transação; em REPEATABLE READ ficou em 100. No PostgreSQL o REPEATABLE READ evitou o fantasma (2 e 2); no MySQL o SELECT comum viu 2 e o FOR UPDATE viu 3. O padrão é READ COMMITTED no PostgreSQL e REPEATABLE READ no MySQL.`,
  refs: [REF.pgIso, REF.setTransaction, REF.mysqlIso, REF.mysqlConsistent, REF.jepsen],
  cards: [
    { q: 'O que é uma leitura não repetível?', a: 'Ler a mesma linha duas vezes na mesma transação e obter valores diferentes porque outra transação confirmou uma mudança no intervalo.' },
    { q: 'O PostgreSQL permite leitura suja?', a: 'Não: READ UNCOMMITTED se comporta como READ COMMITTED.' },
    { q: 'Qual o nível padrão do PostgreSQL e do MySQL InnoDB?', a: 'PostgreSQL: READ COMMITTED. MySQL InnoDB: REPEATABLE READ.' },
    { q: 'O REPEATABLE READ do PostgreSQL permite fantasmas?', a: 'Não: ele usa um snapshot completo da transação (mais forte que o padrão exige).' },
    { q: 'Por que SELECT comum e SELECT FOR UPDATE podem dar resultados diferentes no InnoDB?', a: 'O primeiro usa o snapshot da transação; o segundo é uma leitura atual, com trava, que vê as versões mais recentes.' }
  ]
}
];
