// C3.5 — Transações e concorrência: exercícios das aulas 1 a 4.
// Os experimentos reais rodaram no PostgreSQL 17 e no MySQL 8.4 (laboratório); os desafios "code" (JavaScript) modelam a lógica.
const R = String.raw;

export const exsetsA = {
'trx-01': [
  { id: 'trx-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual propriedade ACID garante que, após um COMMIT confirmado, os dados sobrevivem a uma queda de energia?', options: ['Atomicidade', 'Consistência', 'Isolamento', 'Durabilidade'], answer: 3, explanation: 'A durabilidade é garantida pelo WAL gravado em disco no commit.' },
  { id: 'trx-01-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Transferência: Ana (saldo 100), Bruno (saldo 50), com CHECK (saldo >= 0).', code: 'BEGIN;\nUPDATE contas SET saldo = saldo + 70 WHERE id = 2;   -- Bruno\nUPDATE contas SET saldo = saldo - 130 WHERE id = 1;  -- Ana\nROLLBACK;', lang: 'sql', steps: [{ q: 'O segundo UPDATE falha? (sim/não)', answers: ['sim'] }, { q: 'Qual o saldo do Bruno depois do ROLLBACK?', answers: ['50', '50,00', '50.00'] }], explanation: 'O débito viola o CHECK; o ROLLBACK desfaz também o crédito (medido: Ana 100,00 e Bruno 50,00).' },
  { id: 'trx-01-e3', type: 'tf', difficulty: 2, points: 10, prompt: 'No PostgreSQL, depois de um erro dentro de uma transação, é possível continuar executando comandos normalmente até o COMMIT.', answer: false, explanation: 'A transação fica abortada (25P02): só ROLLBACK ou ROLLBACK TO SAVEPOINT são aceitos.' },
  { id: 'trx-01-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que torna a transferência não atômica.', code: 'await db.query("UPDATE contas SET saldo = saldo - 70 WHERE id = 1");\nawait db.query("UPDATE contas SET saldo = saldo + 70 WHERE id = 2");', answer: 1, explanation: 'Sem BEGIN/COMMIT, cada UPDATE é uma transação (autocommit): se o segundo falhar, o primeiro já está confirmado.' },
  { id: 'trx-01-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Por que não se deve enviar um e-mail de confirmação dentro da transação que grava o pedido? Que alternativa você usaria?', model: 'Se o e-mail sai antes do commit e a transação é desfeita, o cliente recebe a confirmação de um pedido que não existe; se a transação demora ou espera, ela segura travas enquanto aguarda um serviço externo lento; e o envio não pode ser desfeito. A alternativa é o padrão outbox: gravar o pedido e uma linha de evento na mesma transação e deixar um processo separado enviar o e-mail depois do commit, com repetição, mantendo o envio idempotente.', rubric: ['Explica o risco de enviar antes do commit', 'Cita o efeito de segurar travas', 'Propõe outbox ou processamento após o commit', 'Menciona idempotência'], explanation: 'Efeitos externos não são desfeitos por rollback.' },
  { id: 'trx-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele uma transação **estilo PostgreSQL**. Implemente §criarBanco(saldos)§ (objeto id → saldo) que devolve §{ begin, set, get, savepoint, rollbackTo, commit, rollback, saldos }§. §begin()§ abre a transação (copiando os saldos). §set(id, valor)§ altera o saldo dentro da transação; se §valor < 0§, lança §Error("violates check constraint")§ **e marca a transação como abortada** (o saldo **não** muda). Qualquer §set§/§get§/§savepoint§ numa transação **abortada** lança §Error("current transaction is aborted")§. §savepoint(nome)§ guarda uma cópia; §rollbackTo(nome)§ restaura essa cópia e **tira a transação do estado abortado**. §commit()§ grava os saldos da transação e devolve §"COMMIT"§; se estiver abortada, descarta e devolve §"ROLLBACK"§. §rollback()§ descarta. §saldos()§ devolve uma **cópia** dos saldos confirmados. Sem transação aberta, §set§ lança §Error("sem transação")§.', lang: 'javascript', starter: 'function criarBanco(saldos) {\n  // seu código aqui\n}\n', hints: ['Guarde os saldos confirmados e uma cópia de trabalho (a transação).', 'Mantenha um mapa de savepoints e um sinalizador de aborto.', 'Cuidado: o set inválido não deve alterar a cópia de trabalho.'], tests: [{ name: 'atomicidade e aborto', code: R`const b = criarBanco({ ana: 100, bruno: 50 });
b.begin();
b.set('bruno', 120);
assert.throws(() => b.set('ana', -30), 'violates check constraint');
assert.throws(() => b.get('bruno'), 'current transaction is aborted');
b.rollback();
assert.deepEqual(b.saldos(), { ana: 100, bruno: 50 });` }, { name: 'commit e commit de transação abortada', code: R`const b = criarBanco({ x: 10 });
b.begin(); b.set('x', 15);
assert.equal(b.commit(), 'COMMIT');
assert.deepEqual(b.saldos(), { x: 15 });
b.begin();
assert.throws(() => b.set('x', -1), 'violates check constraint');
assert.equal(b.commit(), 'ROLLBACK');
assert.deepEqual(b.saldos(), { x: 15 });` }, { name: 'savepoint', code: R`const b = criarBanco({ ana: 100 });
b.begin();
b.set('ana', 110);
b.savepoint('sp1');
assert.throws(() => b.set('ana', -500), 'violates check constraint');
b.rollbackTo('sp1');
b.set('ana', b.get('ana') + 5);
assert.equal(b.commit(), 'COMMIT');
assert.deepEqual(b.saldos(), { ana: 115 });
assert.throws(() => b.set('ana', 1), 'sem transação');` }], solution: R`function criarBanco(saldos) {
  let confirmados = { ...saldos };
  let tx = null;
  let abortada = false;
  let sps = {};
  const checar = () => {
    if (!tx) throw new Error('sem transação');
    if (abortada) throw new Error('current transaction is aborted');
  };
  return {
    begin() { tx = { ...confirmados }; abortada = false; sps = {}; },
    set(id, valor) {
      checar();
      if (valor < 0) { abortada = true; throw new Error('violates check constraint'); }
      tx[id] = valor;
    },
    get(id) { checar(); return tx[id]; },
    savepoint(nome) { checar(); sps[nome] = { ...tx }; },
    rollbackTo(nome) {
      if (!tx) throw new Error('sem transação');
      tx = { ...sps[nome] }; abortada = false;
    },
    commit() {
      if (!tx) throw new Error('sem transação');
      const r = abortada ? 'ROLLBACK' : 'COMMIT';
      if (!abortada) confirmados = { ...tx };
      tx = null; abortada = false; sps = {};
      return r;
    },
    rollback() { tx = null; abortada = false; sps = {}; },
    saldos: () => ({ ...confirmados })
  };
}
`, explanation: 'O modelo reproduz o que o PostgreSQL mediu: o erro aborta a transação, só o rollback (ou o rollback ao savepoint) a recupera, e o commit de uma transação abortada vira rollback.' }
],
'trx-02': [
  { id: 'trx-02-e1', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a anomalia à definição.', pairs: [['Leitura suja', 'Ler dados que outra transação ainda não confirmou'], ['Leitura não repetível', 'Ler a mesma linha duas vezes e obter valores diferentes por mudança confirmada'], ['Fantasma', 'Repetir uma consulta e obter linhas a mais ou a menos'], ['Atualização perdida', 'Uma gravação sobrescreve outra feita a partir de um valor lido antes']], explanation: 'As três primeiras são anomalias de leitura; a última, de escrita (aula trx-03).' },
  { id: 'trx-02-e2', type: 'trace', difficulty: 3, points: 10, prompt: 'Sessões X e Y. X abre a transação e lê a Ana (100). Y altera a Ana para 500 e confirma. X lê de novo.', code: 'X: BEGIN ISOLATION LEVEL <nível>; SELECT saldo ... -- 100\nY: UPDATE saldo = 500; COMMIT\nX: SELECT saldo ...                                  -- ?', lang: 'sql', steps: [{ q: 'Em READ COMMITTED, o que X lê na segunda vez?', answers: ['500'] }, { q: 'Em REPEATABLE READ, o que X lê na segunda vez?', answers: ['100'] }], explanation: 'Medido nos dois bancos: 100 e 500 em READ COMMITTED; 100 e 100 em REPEATABLE READ.' },
  { id: 'trx-02-e3', type: 'mc', difficulty: 2, points: 10, prompt: 'No PostgreSQL, uma transação em READ UNCOMMITTED que lê dados alterados e não confirmados por outra:', options: ['Lê os dados não confirmados (leitura suja)', 'Não vê os dados não confirmados, pois o PostgreSQL trata READ UNCOMMITTED como READ COMMITTED', 'Espera a outra transação terminar', 'Falha com erro'], answer: 1, explanation: 'Medido: X leu 100,00 enquanto Y tinha alterado para 999 sem confirmar.' },
  { id: 'trx-02-e4', type: 'tf', difficulty: 3, points: 10, prompt: 'No MySQL/InnoDB em REPEATABLE READ, um SELECT comum e um SELECT ... FOR UPDATE na mesma transação sempre devolvem o mesmo conjunto de linhas.', answer: false, explanation: 'Medido: o SELECT comum contou 2 linhas (snapshot) e o FOR UPDATE (leitura atual) contou 3.' },
  { id: 'trx-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Você vai portar uma aplicação de MySQL para PostgreSQL. Que diferenças de isolamento podem alterar o comportamento e o que você testaria?', model: 'O nível padrão muda (MySQL InnoDB: REPEATABLE READ; PostgreSQL: READ COMMITTED), então leituras repetidas na mesma transação podem passar a ver valores diferentes. O READ UNCOMMITTED do MySQL permite leitura suja e o do PostgreSQL não. O REPEATABLE READ do PostgreSQL evita fantasmas com snapshot, enquanto o InnoDB mistura leituras consistentes e leituras atuais (FOR UPDATE), e usa gap locks. Testar: transações que leem a mesma informação mais de uma vez, relatórios em múltiplos comandos, filas com FOR UPDATE, atualizações concorrentes (lost update) e o tratamento de erros de serialização (40001) e deadlock (40P01 x 1213).', rubric: ['Cita a diferença de nível padrão', 'Cita leitura suja e fantasmas', 'Cita travas de intervalo ou FOR UPDATE', 'Propõe testes de concorrência'], explanation: 'Migração exige testar a concorrência, não só as consultas.' },
  { id: 'trx-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele **snapshots**. Implemente §ler(nivel, versoes, contexto)§. §versoes§ é a lista de versões de um valor, em ordem de gravação, cada uma §{ valor, confirmadaEm }§ (§confirmadaEm§ é um tempo numérico, ou §null§ se **não confirmada**). §contexto§ = §{ inicio, agora }§ (tempos da abertura da transação e do comando atual). Regras: §"READ UNCOMMITTED"§ devolve o valor da **última** versão, **mesmo não confirmada** (comportamento do MySQL); §"READ COMMITTED"§ devolve a última versão confirmada com §confirmadaEm <= agora§; §"REPEATABLE READ"§ devolve a última versão confirmada com §confirmadaEm <= inicio§. Se não houver versão visível, devolva §undefined§. Nível inválido lança §Error("nível inválido: N")§.', lang: 'javascript', starter: 'function ler(nivel, versoes, contexto) {\n  // seu código aqui\n}\n', hints: ['Para os níveis confirmados, filtre as versões confirmadas até o instante certo e pegue a última.', 'READ UNCOMMITTED ignora a confirmação.'], tests: [{ name: 'não repetível', code: R`const v = [{ valor: 100, confirmadaEm: 1 }, { valor: 500, confirmadaEm: 5 }];
assert.equal(ler('READ COMMITTED', v, { inicio: 3, agora: 6 }), 500);
assert.equal(ler('REPEATABLE READ', v, { inicio: 3, agora: 6 }), 100);
assert.equal(ler('READ COMMITTED', v, { inicio: 3, agora: 4 }), 100);` }, { name: 'leitura suja', code: R`const v = [{ valor: 100, confirmadaEm: 1 }, { valor: 999, confirmadaEm: null }];
assert.equal(ler('READ UNCOMMITTED', v, { inicio: 2, agora: 3 }), 999);
assert.equal(ler('READ COMMITTED', v, { inicio: 2, agora: 3 }), 100);
assert.equal(ler('REPEATABLE READ', v, { inicio: 2, agora: 3 }), 100);` }, { name: 'sem versão visível e nível inválido', code: R`const v = [{ valor: 7, confirmadaEm: 10 }];
assert.equal(ler('REPEATABLE READ', v, { inicio: 5, agora: 20 }), undefined);
assert.equal(ler('READ COMMITTED', [], { inicio: 0, agora: 1 }), undefined);
assert.throws(() => ler('SNAPSHOT', v, { inicio: 0, agora: 0 }), 'nível inválido: SNAPSHOT');` }], solution: R`function ler(nivel, versoes, contexto) {
  const { inicio, agora } = contexto;
  const ultima = (lista) => (lista.length ? lista[lista.length - 1].valor : undefined);
  if (nivel === 'READ UNCOMMITTED') return ultima(versoes);
  if (nivel === 'READ COMMITTED') return ultima(versoes.filter((v) => v.confirmadaEm !== null && v.confirmadaEm <= agora));
  if (nivel === 'REPEATABLE READ') return ultima(versoes.filter((v) => v.confirmadaEm !== null && v.confirmadaEm <= inicio));
  throw new Error('nível inválido: ' + nivel);
}
`, explanation: 'A diferença entre READ COMMITTED e REPEATABLE READ é o instante do snapshot: o do comando atual ou o do início da transação. READ UNCOMMITTED (no MySQL) ignora a confirmação.' }
],
'trx-03': [
  { id: 'trx-03-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Duas sessões leem saldo 100, cada uma grava 110 (100 + 10). O saldo final deveria ser 120. Qual a causa?', options: ['Falta de índice', 'Atualização perdida: ler, calcular na aplicação e gravar', 'Deadlock', 'Leitura suja'], answer: 1, explanation: 'Medido nos dois bancos: 110,00 em vez de 120,00, sem erro.' },
  { id: 'trx-03-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a correção ao seu mecanismo.', pairs: [['UPDATE saldo = saldo + 10', 'O cálculo acontece sob a trava da linha, no próprio comando'], ['SELECT ... FOR UPDATE', 'Trava pessimista: a segunda sessão espera e lê o valor atual'], ['Coluna de versão no WHERE', 'Bloqueio otimista: 0 linhas afetadas indicam conflito'], ['REPEATABLE READ + nova tentativa', 'A segunda gravação falha com 40001 e a transação é repetida']], explanation: 'Todas foram medidas no PostgreSQL.' },
  { id: 'trx-03-e3', type: 'tf', difficulty: 3, points: 10, prompt: 'Em REPEATABLE READ, dois plantonistas que leem "há 2 de plantão" e saem cada um (atualizando linhas diferentes) nunca deixam o plantão vazio.', answer: false, explanation: 'Medido nos dois bancos: restaram 0 de plantão (write skew). No SERIALIZABLE do PostgreSQL a segunda confirmação falhou (40001).' },
  { id: 'trx-03-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que impede o laço de repetição de funcionar corretamente.', code: 'for (let t = 0; t < 5; t++) {\n  try {\n    await tx.query("UPDATE saldo SET v = $1 WHERE id = 1", [valorCalculadoAntes]);\n    return;\n  } catch (e) { if (e.code !== "40001") throw e; }\n}', answer: 3, explanation: 'O valor foi calculado antes do laço e a leitura não é refeita: a repetição reenvia o mesmo dado velho. A transação inteira (BEGIN, leitura, cálculo, gravação, COMMIT) precisa ser refeita.' },
  { id: 'trx-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare o bloqueio pessimista (FOR UPDATE) e o otimista (coluna de versão) para editar um cadastro em uma tela que o usuário demora minutos para preencher.', model: 'Com FOR UPDATE, a linha ficaria travada enquanto o usuário edita, o que bloquearia outras pessoas por minutos e seguraria uma conexão e uma transação aberta: inaceitável. O bloqueio otimista não trava: lê o registro com sua versão, o usuário edita e, ao salvar, a aplicação executa UPDATE ... WHERE id = ? AND versao = ?; se 0 linhas forem afetadas, alguém salvou antes e a aplicação mostra o conflito para o usuário reconciliar. Funciona bem quando conflitos são raros. O pessimista serve para operações curtas, com conflitos frequentes e lógica de ler-decidir-gravar.', rubric: ['Explica que FOR UPDATE seguraria a trava durante a edição', 'Descreve a versão no WHERE e as 0 linhas afetadas', 'Cita conflito raro como condição', 'Cita o uso do pessimista em operações curtas'], explanation: 'O tempo entre ler e gravar decide a técnica.' },
  { id: 'trx-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente duas peças. §depositosConcorrentes(inicial, valores, modo)§: simula várias sessões que **começam ao mesmo tempo**. §modo === "ingenuo"§: cada sessão **lê** o saldo inicial, soma o seu valor e **grava** (as gravações ocorrem na ordem da lista; a última prevalece): devolve o saldo final. §modo === "atomico"§: cada sessão faz §saldo = saldo + valor§: devolve a soma total. Modo inválido lança §Error("modo inválido: M")§. E §criarDocumento(texto)§ com **bloqueio otimista**: devolve §{ ler, gravar }§; §ler()§ devolve §{ texto, versao }§ (versão inicial **1**); §gravar(novoTexto, versaoLida)§ grava e incrementa a versão **somente se** §versaoLida§ for a versão atual (devolve a nova versão); senão lança §Error("conflito")§.', lang: 'javascript', starter: 'function depositosConcorrentes(inicial, valores, modo) {\n  // seu código aqui\n}\nfunction criarDocumento(texto) {\n}\n', hints: ['No modo ingênuo, todas leem o mesmo valor inicial: o resultado é inicial + último valor.', 'Guarde texto e versão em variáveis do closure.'], tests: [{ name: 'atualização perdida', code: R`assert.equal(depositosConcorrentes(100, [10, 10], 'ingenuo'), 110);
assert.equal(depositosConcorrentes(100, [10, 10], 'atomico'), 120);
assert.equal(depositosConcorrentes(100, [5, 20, 7], 'ingenuo'), 107);
assert.equal(depositosConcorrentes(100, [5, 20, 7], 'atomico'), 132);
assert.equal(depositosConcorrentes(100, [], 'ingenuo'), 100);
assert.throws(() => depositosConcorrentes(1, [1], 'x'), 'modo inválido: x');` }, { name: 'bloqueio otimista', code: R`const d = criarDocumento('original');
const x = d.ler(); const y = d.ler();
assert.deepEqual(x, { texto: 'original', versao: 1 });
assert.equal(d.gravar('edição do X', x.versao), 2);
assert.throws(() => d.gravar('edição do Y', y.versao), 'conflito');
assert.deepEqual(d.ler(), { texto: 'edição do X', versao: 2 });` }, { name: 'nova leitura permite gravar', code: R`const d = criarDocumento('a');
d.gravar('b', 1);
const novo = d.ler();
assert.equal(d.gravar('c', novo.versao), 3);
assert.deepEqual(d.ler(), { texto: 'c', versao: 3 });` }], solution: R`function depositosConcorrentes(inicial, valores, modo) {
  if (modo === 'ingenuo') {
    let saldo = inicial;
    for (const v of valores) saldo = inicial + v;
    return saldo;
  }
  if (modo === 'atomico') return valores.reduce((s, v) => s + v, inicial);
  throw new Error('modo inválido: ' + modo);
}
function criarDocumento(texto) {
  let atual = texto;
  let versao = 1;
  return {
    ler: () => ({ texto: atual, versao }),
    gravar(novoTexto, versaoLida) {
      if (versaoLida !== versao) throw new Error('conflito');
      atual = novoTexto;
      versao++;
      return versao;
    }
  };
}
`, explanation: 'No modo ingênuo cada sessão sobrescreve com inicial + o próprio valor (só o último sobra); no atômico as somas se acumulam. A versão no WHERE do SQL equivale à comparação de versaoLida.' }
],
'trx-04': [
  { id: 'trx-04-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Uma sessão X travou as linhas 1 e 2 com FOR UPDATE. A sessão Y executa SELECT ... ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED. O que Y recebe?', options: ['As linhas 1 e 2 depois de esperar', 'Um erro imediato', 'As linhas 3 e 4', 'Nenhuma linha'], answer: 2, explanation: 'Medido nos dois bancos: [3, 4].' },
  { id: 'trx-04-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a opção ao comportamento diante de uma linha travada.', pairs: [['FOR UPDATE (padrão)', 'Espera a trava ser liberada'], ['NOWAIT', 'Falha imediatamente'], ['SKIP LOCKED', 'Ignora a linha e segue'], ['lock_timeout', 'Espera até um limite e depois falha']], explanation: 'Escolha conforme a tolerância a esperas.' },
  { id: 'trx-04-e3', type: 'tf', difficulty: 3, points: 10, prompt: 'No InnoDB em REPEATABLE READ, um SELECT ... FOR UPDATE que não encontra nenhuma linha em um intervalo pode bloquear inserções nesse intervalo.', answer: true, explanation: 'Medido: o INSERT do id 7 esperou até o tempo limite (1205) por causa da trava de intervalo (gap lock).' },
  { id: 'trx-04-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que permite dois trabalhadores processarem a mesma tarefa.', code: 'const { rows } = await c.query("SELECT id FROM fila WHERE NOT feita ORDER BY id LIMIT 1");\nconst id = rows[0].id;\nawait processar(id);\nawait c.query("UPDATE fila SET feita = true WHERE id = $1", [id]);', answer: 1, explanation: 'Sem FOR UPDATE SKIP LOCKED dentro de uma transação, vários trabalhadores selecionam a mesma linha livre.' },
  { id: 'trx-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Sessões "idle in transaction" estão deixando o banco lento. Explique por quê e liste três medidas.', model: 'Uma transação aberta e ociosa mantém suas travas de linha (outras sessões esperam), segura o horizonte de limpeza do MVCC (o VACUUM não remove versões antigas e as tabelas incham) e ocupa uma conexão. Medidas: definir idle_in_transaction_session_timeout (e lock_timeout e statement_timeout), corrigir o código para fechar a transação sempre (finally) e não esperar usuário ou chamadas externas dentro dela, monitorar pg_stat_activity para achar as sessões e a idade da transação mais antiga, e usar um pool configurado corretamente.', rubric: ['Cita travas mantidas e esperas', 'Cita o efeito sobre o VACUUM e o inchaço', 'Cita timeouts como medida', 'Cita fechar a transação em finally e monitorar'], explanation: 'Transações ociosas são uma das causas mais comuns de incidentes.' },
  { id: 'trx-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele uma **fila com travas de linha**. Implemente §criarFila(ids)§ (lista de ids de tarefas, em ordem) que devolve §{ pegar, liberar, concluir, emTrava }§. §pegar(trabalhador, n, modo)§ devolve os **primeiros §n§ ids não concluídos e não travados por outro trabalhador**, em ordem, e **trava** esses ids para o trabalhador. §modo§: §"skip"§ (padrão) pula os travados por outros; §"nowait"§ lança §Error("could not obtain lock on row")§ se **algum** dos primeiros §n§ ids não concluídos estiver travado por outro (e não trava nada); §"espera"§ lança §Error("esperaria")§ nesse mesmo caso (simula a espera). §liberar(trabalhador)§ solta todas as travas dele (rollback). §concluir(trabalhador)§ marca como concluídos os ids que ele travou e solta as travas. §emTrava()§ devolve um objeto §{ id: trabalhador }§ das travas atuais.', lang: 'javascript', starter: 'function criarFila(ids) {\n  // seu código aqui\n}\n', hints: ['Mantenha um Map de id para trabalhador e um Set de concluídos.', 'Em nowait/espera, olhe os primeiros n ids não concluídos.', 'O próprio trabalhador pode repetir os ids que já travou? Trate-os como livres para ele.'], tests: [{ name: 'SKIP LOCKED', code: R`const f = criarFila([1, 2, 3, 4, 5]);
assert.deepEqual(f.pegar('X', 2), [1, 2]);
assert.deepEqual(f.pegar('Y', 2), [3, 4]);
assert.deepEqual(f.emTrava(), { 1: 'X', 2: 'X', 3: 'Y', 4: 'Y' });
f.liberar('X');
assert.deepEqual(f.pegar('Y', 2), [1, 2]);` }, { name: 'NOWAIT e espera', code: R`const f = criarFila([1, 2, 3]);
f.pegar('X', 2);
assert.throws(() => f.pegar('Y', 2, 'nowait'), 'could not obtain lock on row');
assert.throws(() => f.pegar('Y', 1, 'espera'), 'esperaria');
assert.deepEqual(f.emTrava(), { 1: 'X', 2: 'X' });` }, { name: 'concluir', code: R`const f = criarFila([1, 2, 3]);
f.pegar('X', 1);
f.concluir('X');
assert.deepEqual(f.pegar('Y', 3), [2, 3]);
assert.deepEqual(f.emTrava(), { 2: 'Y', 3: 'Y' });` }], solution: R`function criarFila(ids) {
  const travas = new Map();
  const concluidos = new Set();
  return {
    pegar(trabalhador, n, modo = 'skip') {
      const pendentes = ids.filter((id) => !concluidos.has(id));
      const doOutro = (id) => travas.has(id) && travas.get(id) !== trabalhador;
      if (modo === 'nowait' || modo === 'espera') {
        const primeiros = pendentes.slice(0, n);
        if (primeiros.some(doOutro)) throw new Error(modo === 'nowait' ? 'could not obtain lock on row' : 'esperaria');
      }
      const escolhidos = (modo === 'skip' ? pendentes.filter((id) => !doOutro(id)) : pendentes).slice(0, n);
      escolhidos.forEach((id) => travas.set(id, trabalhador));
      return escolhidos;
    },
    liberar(trabalhador) { for (const [id, t] of [...travas]) if (t === trabalhador) travas.delete(id); },
    concluir(trabalhador) {
      for (const [id, t] of [...travas]) if (t === trabalhador) { concluidos.add(id); travas.delete(id); }
    },
    emTrava: () => Object.fromEntries([...travas].map(([id, t]) => [id, t]))
  };
}
`, explanation: 'O modelo reproduz o experimento: com SKIP LOCKED, o segundo trabalhador recebe [3, 4] sem esperar; NOWAIT falha na hora; ao liberar (rollback), as tarefas voltam à fila.' }
]
};
