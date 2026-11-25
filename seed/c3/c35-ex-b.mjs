// C3.5 — Transações e concorrência: exercícios das aulas 5 a 7, prova final e projeto integrador.
const R = String.raw;

export const exsetsB = {
'trx-05': [
  { id: 'trx-05-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Duas transações atualizam as contas 1 e 2 em ordens opostas e cada uma espera a trava da outra. Como se chama a situação?', options: ['Leitura suja', 'Deadlock (espera circular)', 'Atualização perdida', 'Snapshot antigo'], answer: 1, explanation: 'O banco detecta o ciclo e aborta uma das transações.' },
  { id: 'trx-05-e2', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o banco ao comportamento medido no deadlock.', pairs: [['PostgreSQL 17', 'Verifica ciclos após deadlock_timeout (1 s) e devolve 40P01'], ['MySQL 8.4 (InnoDB)', 'Detecta na hora e devolve 1213'], ['Ambos', 'A aplicação deve repetir a transação inteira'], ['Ordem consistente de travas', 'Previne o ciclo e transforma a espera em fila']], explanation: 'Medido: ~1.003 ms no PostgreSQL e ~206 ms no MySQL (com pausa de 200 ms no cenário).' },
  { id: 'trx-05-e3', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma sessão que espera uma trava por 2 minutos está necessariamente em deadlock.', answer: false, explanation: 'Deadlock exige espera circular; uma espera longa pode ser só uma transação lenta (use timeouts).' },
  { id: 'trx-05-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que pode causar deadlock entre transferências opostas (A→B e B→A).', code: 'async function transferir(c, de, para, valor) {\n  await c.query("BEGIN");\n  await c.query("UPDATE contas SET saldo = saldo - $1 WHERE id = $2", [valor, de]);\n  await c.query("UPDATE contas SET saldo = saldo + $1 WHERE id = $2", [valor, para]);\n  await c.query("COMMIT");\n}', answer: 3, explanation: 'Atualizar a conta de origem primeiro trava as contas na ordem dos parâmetros. Duas transferências opostas travam em ordens opostas. Trave sempre por id crescente.' },
  { id: 'trx-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Seu serviço registra 40 deadlocks por hora em um fluxo de transferências. Descreva como investigaria e corrigiria.', model: 'Primeiro, localizar os comandos envolvidos nos logs do banco (PostgreSQL: detalhes do erro 40P01 e log_lock_waits; MySQL: SHOW ENGINE INNODB STATUS e innodb_print_all_deadlocks), identificando as tabelas, as linhas e a ordem em que cada transação trava. Em seguida, corrigir a causa: impor uma ordem consistente de travas (por exemplo, ordenar os ids e usar SELECT ... ORDER BY id FOR UPDATE antes de atualizar), encurtar as transações, usar UPDATE atômico, revisar índices e, no MySQL, avaliar READ COMMITTED para reduzir gap locks. Enquanto isso, garantir que a aplicação repete a transação inteira com limite e backoff. Medir a taxa antes e depois e criar um teste de concorrência que reproduza o ciclo.', rubric: ['Usa logs e diagnóstico do banco para achar os comandos', 'Propõe ordem consistente de travas', 'Cita encurtar transações, índices ou UPDATE atômico', 'Cita repetição e medição'], explanation: 'Diagnóstico e prevenção andam juntos.' },
  { id: 'trx-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §detectarCiclo(esperas)§: §esperas§ é uma lista de §{ de, para }§ (a transação §de§ **espera** a transação §para§). Devolva o **ciclo** (lista de transações na ordem da espera) **iniciado pela menor transação** (comparação de texto) do ciclo, ou §null§ se não houver ciclo. Se houver mais de um ciclo, devolva o que começa pela **menor** transação. E §travasEmOrdem(ids)§: devolve os ids **sem repetição**, **ordenados** (números em ordem numérica; textos em ordem alfabética), a ordem em que um código deve travar para evitar deadlocks.', lang: 'javascript', starter: 'function detectarCiclo(esperas) {\n  // seu código aqui\n}\nfunction travasEmOrdem(ids) {\n}\n', hints: ['Construa um mapa de adjacência e faça uma busca em profundidade com a pilha do caminho.', 'Para o ciclo mais "baixo", teste os nós em ordem crescente e comece o caminho por cada um.', 'Para números use um comparador numérico.'], tests: [{ name: 'ciclos', code: R`assert.deepEqual(detectarCiclo([{ de: 'A', para: 'B' }, { de: 'B', para: 'A' }]), ['A', 'B']);
assert.deepEqual(detectarCiclo([{ de: 'B', para: 'C' }, { de: 'C', para: 'A' }, { de: 'A', para: 'B' }]), ['A', 'B', 'C']);
assert.deepEqual(detectarCiclo([{ de: 'D', para: 'A' }, { de: 'A', para: 'B' }, { de: 'B', para: 'A' }]), ['A', 'B']);` }, { name: 'sem ciclo', code: R`assert.equal(detectarCiclo([{ de: 'A', para: 'B' }, { de: 'B', para: 'C' }]), null);
assert.equal(detectarCiclo([]), null);` }, { name: 'ordem de travas', code: R`assert.deepEqual(travasEmOrdem([2, 1, 2, 10]), [1, 2, 10]);
assert.deepEqual(travasEmOrdem(['conta2', 'conta1', 'conta2']), ['conta1', 'conta2']);
assert.deepEqual(travasEmOrdem([]), []);` }], solution: R`function detectarCiclo(esperas) {
  const adj = new Map();
  for (const { de, para } of esperas) {
    if (!adj.has(de)) adj.set(de, []);
    adj.get(de).push(para);
  }
  const nos = [...new Set(esperas.flatMap((e) => [e.de, e.para]))].sort();
  for (const inicio of nos) {
    const caminho = [inicio];
    const visitado = new Set([inicio]);
    const dfs = (n) => {
      for (const prox of adj.get(n) || []) {
        if (prox === inicio) return true;
        if (!visitado.has(prox) && prox > inicio) {
          visitado.add(prox); caminho.push(prox);
          if (dfs(prox)) return true;
          caminho.pop();
        }
      }
      return false;
    };
    if (dfs(inicio)) return caminho;
  }
  return null;
}
function travasEmOrdem(ids) {
  const unicos = [...new Set(ids)];
  return unicos.sort((a, b) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0));
}
`, explanation: 'O deadlock é um ciclo no grafo "quem espera quem". A prevenção por ordem consistente garante que o grafo nunca tenha ciclos: todas as transações pedem as travas na mesma sequência.' }
],
'trx-06': [
  { id: 'trx-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'No PostgreSQL, o que acontece fisicamente quando uma linha é atualizada?', options: ['A linha é alterada no mesmo lugar e a antiga é perdida', 'Uma nova versão (tupla) é criada e a antiga fica como morta até o VACUUM', 'A tabela inteira é reescrita', 'A linha é movida para outra tabela'], answer: 1, explanation: 'Medido: o ctid mudou de (0,1) para (0,3) e o xmin de 1505 para 1506.' },
  { id: 'trx-06-e2', type: 'trace', difficulty: 3, points: 10, prompt: 'Sessão X (REPEATABLE READ) lê a Ana: 101,00. Sessão Y soma 1000 e confirma.', code: 'X: BEGIN ISOLATION LEVEL REPEATABLE READ; SELECT saldo -- 101.00\nY: UPDATE saldo = saldo + 1000; COMMIT\nX: SELECT saldo -- ?\nNova sessão: SELECT saldo -- ?', lang: 'sql', steps: [{ q: 'O que X lê na segunda vez?', answers: ['101', '101,00', '101.00'] }, { q: 'O que a nova sessão lê?', answers: ['1101', '1101,00', '1101.00', '1.101,00'] }], explanation: 'Medido: X usa seu snapshot; a sessão nova vê o valor confirmado.' },
  { id: 'trx-06-e3', type: 'tf', difficulty: 3, points: 10, prompt: 'Uma transação longa aberta impede o VACUUM de remover versões antigas que ela ainda pode enxergar.', answer: true, explanation: 'Medido: com uma transação longa aberta, 50.000 tuplas mortas ficaram retidas após o VACUUM; depois que ela terminou, 0.' },
  { id: 'trx-06-e4', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o termo ao banco ou à ideia.', pairs: [['xmin e xmax', 'Colunas de sistema do PostgreSQL com quem criou e removeu a versão'], ['Undo log', 'Onde o InnoDB guarda versões antigas de linhas'], ['VACUUM', 'Limpeza de tuplas mortas no PostgreSQL'], ['Purge', 'Descarte de versões de undo não mais necessárias no InnoDB']], explanation: 'Mesma ideia (MVCC), implementações diferentes.' },
  { id: 'trx-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'O banco cresceu 3 vezes em uma semana sem aumento de dados úteis, e o autovacuum "não dá conta". Que hipóteses ligadas ao MVCC você investigaria?', model: 'Investigar transações longas ou "idle in transaction" que seguram o horizonte de limpeza (pg_stat_activity, xact_start, backend_xmin), consultas longas em réplicas com hot_standby_feedback, slots de replicação lógica parados, e atualizações em massa que criam muitas tuplas mortas; verificar n_dead_tup, a configuração do autovacuum por tabela e a existência de gargalos de I/O. Medidas: encerrar ou corrigir as transações longas, definir idle_in_transaction_session_timeout e statement_timeout, ajustar o autovacuum das tabelas quentes e, se preciso, reorganizar com ferramentas de baixo bloqueio.', rubric: ['Cita transações longas ou ociosas segurando o horizonte', 'Cita réplicas ou slots de replicação', 'Cita monitorar tuplas mortas e autovacuum', 'Cita timeouts como defesa'], explanation: 'O inchaço quase sempre tem uma transação antiga por trás.' },
  { id: 'trx-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele a **visibilidade MVCC**. §versoes§ é uma lista de versões §{ xmin, xmax, valor }§ de **uma linha** (§xmax§ é §null§ na versão vigente). Implemente §versaoVisivel(versoes, snapshot)§ com §snapshot§ = §{ confirmadas, propria }§ (§confirmadas§ é a lista de ids de transações **confirmadas** visíveis; §propria§ é o id da transação do leitor, opcional): uma versão é **visível** se §xmin§ está em §confirmadas§ **ou** é §propria§, **e** (§xmax§ é §null§ **ou** §xmax§ **não** está em §confirmadas§ e **não** é §propria§). Devolva o §valor§ da versão visível (ou §undefined§). E §removiveis(versoes, confirmadas, horizonte)§: conta as versões **removíveis** pelo VACUUM: com §xmax§ não nulo, §xmax§ em §confirmadas§ e §xmax < horizonte§ (§horizonte§ é o id da transação ativa mais antiga).', lang: 'javascript', starter: 'function versaoVisivel(versoes, snapshot) {\n  // seu código aqui\n}\nfunction removiveis(versoes, confirmadas, horizonte) {\n}\n', hints: ['Use um Set para as confirmadas.', 'Só uma versão deve ser visível por snapshot; devolva a primeira que satisfaça.', 'removiveis é uma contagem com filter.'], tests: [{ name: 'dois snapshots', code: R`const v = [{ xmin: 1505, xmax: 1506, valor: 100 }, { xmin: 1506, xmax: null, valor: 101 }];
assert.equal(versaoVisivel(v, { confirmadas: [1505] }), 100);
assert.equal(versaoVisivel(v, { confirmadas: [1505, 1506] }), 101);
assert.equal(versaoVisivel(v, { confirmadas: [] }), undefined);` }, { name: 'a própria transação', code: R`const v = [{ xmin: 10, xmax: 20, valor: 'velho' }, { xmin: 20, xmax: null, valor: 'meu' }];
assert.equal(versaoVisivel(v, { confirmadas: [10], propria: 20 }), 'meu');
assert.equal(versaoVisivel(v, { confirmadas: [10] }), 'velho');` }, { name: 'limpeza e horizonte', code: R`const v = [{ xmin: 1, xmax: 5, valor: 'a' }, { xmin: 5, xmax: 9, valor: 'b' }, { xmin: 9, xmax: null, valor: 'c' }];
assert.equal(removiveis(v, [1, 5, 9], 100), 2);
assert.equal(removiveis(v, [1, 5, 9], 6), 1);
assert.equal(removiveis(v, [1, 5, 9], 3), 0);
assert.equal(removiveis(v, [1, 5], 100), 1);` }], solution: R`function versaoVisivel(versoes, snapshot) {
  const conf = new Set(snapshot.confirmadas);
  const eu = snapshot.propria;
  const v = versoes.find((x) => {
    const criada = conf.has(x.xmin) || x.xmin === eu;
    const removida = x.xmax !== null && (conf.has(x.xmax) || x.xmax === eu);
    return criada && !removida;
  });
  return v ? v.valor : undefined;
}
function removiveis(versoes, confirmadas, horizonte) {
  const conf = new Set(confirmadas);
  return versoes.filter((x) => x.xmax !== null && conf.has(x.xmax) && x.xmax < horizonte).length;
}
`, explanation: 'A regra de visibilidade explica as "duas realidades" do MVCC. O horizonte de limpeza mostra por que uma transação longa (horizonte baixo) impede a remoção de versões antigas.' }
],
'trx-07': [
  { id: 'trx-07-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Medido com 20 tentativas simultâneas de reservar a mesma sala e horário: qual abordagem gravou 20 reservas?', options: ['Restrição EXCLUDE', 'Trava consultiva com verificação', 'Verificar e inserir sem proteção em READ COMMITTED', 'SERIALIZABLE com repetição'], answer: 2, explanation: 'O verificar-e-inserir ingênuo causou overbooking total; EXCLUDE e a trava consultiva deixaram 1 reserva.' },
  { id: 'trx-07-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Com uma chave de idempotência única e ON CONFLICT DO NOTHING, 20 requisições repetidas da mesma cobrança geram 20 cobranças.', answer: false, explanation: 'Medido: 1 cobrança gravada e 19 ignoradas.' },
  { id: 'trx-07-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a invariante à técnica.', pairs: [['Não sobrepor reservas da mesma sala', 'EXCLUDE (gist) com intervalos'], ['E-mail único', 'UNIQUE'], ['Repetições de uma requisição de pagamento', 'Chave de idempotência'], ['Gravar o pedido e garantir o envio do evento', 'Outbox transacional']], explanation: 'Escolha pela forma da regra.' },
  { id: 'trx-07-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que pode enviar o e-mail de um pedido que acabou sendo desfeito.', code: 'await db.query("BEGIN");\nawait db.query("INSERT INTO pedidos ...");\nawait enviarEmailConfirmacao(pedido);\nawait db.query("COMMIT");', answer: 3, explanation: 'O envio ocorre antes do COMMIT: se o commit falhar, o e-mail sai de um pedido inexistente. Use outbox: grave o evento na mesma transação e envie depois.' },
  { id: 'trx-07-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que a entrega "pelo menos uma vez" do outbox exige consumidores idempotentes e como implementar essa idempotência.', model: 'O publicador lê a outbox, publica e só então marca como enviado; se cair entre publicar e marcar, a mensagem será publicada de novo. Logo, o mesmo evento pode chegar mais de uma vez. O consumidor deve produzir o mesmo efeito ao receber uma duplicata: guarda o identificador do evento (ou uma chave de idempotência) em uma tabela com restrição única e ignora os já processados (INSERT ... ON CONFLICT DO NOTHING), ou usa operações naturalmente idempotentes (definir um estado, em vez de incrementar). O registro do evento e o efeito devem ser gravados na mesma transação.', rubric: ['Explica a janela entre publicar e marcar como enviado', 'Conclui que duplicatas ocorrem', 'Descreve identificador do evento com restrição única', 'Cita operações idempotentes por natureza ou a mesma transação'], explanation: 'Exactly-once na prática é pelo menos uma vez mais idempotência.' },
  { id: 'trx-07-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §comRepeticao(operacao, opcoes)§ com §opcoes§ = §{ max, base, teto }§. Chame §operacao(tentativa)§ (a tentativa começa em **1**); se retornar, devolva §{ resultado, tentativas, esperas }§. Se lançar um erro cujo §code§ esteja em §["40001", "40P01", "1213"]§, **repita** (até §max§ tentativas no total); entre as tentativas, registre a espera §Math.min(base * 2 ** (tentativa - 1), teto)§ em §esperas§ (não espere de verdade). Erros de outro código são **relançados imediatamente**; esgotadas as tentativas, relance o **último** erro. E §criarCobrancas()§ com idempotência: devolve §{ cobrar, total, quantidade }§; §cobrar(chave, valor)§ devolve §{ criada: true }§ na **primeira** vez que vê a chave (e registra o valor) e §{ criada: false }§ nas repetições; §total()§ soma os valores registrados e §quantidade()§ conta as cobranças.', lang: 'javascript', starter: 'function comRepeticao(operacao, opcoes) {\n  // seu código aqui\n}\nfunction criarCobrancas() {\n}\n', hints: ['Um laço for com contador de tentativas e try/catch.', 'Use um Map de chave para valor nas cobranças.'], tests: [{ name: 'repete erros de concorrência', code: R`let n = 0;
const r = comRepeticao((t) => { n++; if (t < 3) { const e = new Error('x'); e.code = '40001'; throw e; } return 'ok'; }, { max: 5, base: 10, teto: 25 });
assert.deepEqual(r, { resultado: 'ok', tentativas: 3, esperas: [10, 20] });
assert.equal(n, 3);` }, { name: 'limites e erros não repetíveis', code: R`const falha = (c) => { const e = new Error('f'); e.code = c; throw e; };
assert.throws(() => comRepeticao(() => falha('23505'), { max: 5, base: 1, teto: 10 }), 'f');
let n = 0;
assert.throws(() => comRepeticao(() => { n++; falha('40P01'); }, { max: 3, base: 1, teto: 10 }), 'f');
assert.equal(n, 3);
const r = comRepeticao((t) => { if (t < 5) falha('1213'); return t; }, { max: 6, base: 5, teto: 12 });
assert.deepEqual(r.esperas, [5, 10, 12, 12]);
assert.equal(r.resultado, 5);` }, { name: 'idempotência', code: R`const c = criarCobrancas();
const resultados = Array.from({ length: 20 }, () => c.cobrar('pedido-77', 59.9));
assert.equal(resultados.filter((x) => x.criada).length, 1);
assert.equal(c.quantidade(), 1);
assert.equal(c.total(), 59.9);
assert.deepEqual(c.cobrar('pedido-78', 10), { criada: true });
assert.equal(c.quantidade(), 2);
assert.equal(Math.round(c.total() * 100) / 100, 69.9);` }], solution: R`function comRepeticao(operacao, opcoes) {
  const { max, base, teto } = opcoes;
  const repetiveis = ['40001', '40P01', '1213'];
  const esperas = [];
  for (let tentativa = 1; ; tentativa++) {
    try {
      const resultado = operacao(tentativa);
      return { resultado, tentativas: tentativa, esperas };
    } catch (e) {
      if (!repetiveis.includes(e.code) || tentativa >= max) throw e;
      esperas.push(Math.min(base * 2 ** (tentativa - 1), teto));
    }
  }
}
function criarCobrancas() {
  const m = new Map();
  return {
    cobrar(chave, valor) {
      if (m.has(chave)) return { criada: false };
      m.set(chave, valor);
      return { criada: true };
    },
    total: () => [...m.values()].reduce((s, v) => s + v, 0),
    quantidade: () => m.size
  };
}
`, explanation: 'O laço repete só erros de concorrência, com espera exponencial limitada; a chave de idempotência (como a restrição única do banco) faz repetições inofensivas.' }
]
};

const P = 'transacoes-concorrencia-p';
export const assessment = {
  id: 'transacoes-concorrencia', title: 'Avaliação final — Transações e concorrência', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual propriedade ACID garante que uma transferência entre contas não deixe o dinheiro "pela metade" em caso de erro?', options: ['Durabilidade', 'Atomicidade', 'Isolamento', 'Escalabilidade'], answer: 1, explanation: 'Atomicidade: tudo ou nada.' },
    { id: P + '2', type: 'trace', difficulty: 3, points: 10, prompt: 'Duas sessões em READ COMMITTED leem saldo 100, cada uma grava saldo lido + 10.', code: 'X: SELECT saldo -- 100; UPDATE saldo = 110\nY: SELECT saldo -- 100; UPDATE saldo = 110 (espera X confirmar)', lang: 'sql', steps: [{ q: 'Qual o saldo final?', answers: ['110', '110,00', '110.00'] }, { q: 'Qual deveria ser o saldo correto?', answers: ['120', '120,00', '120.00'] }], explanation: 'Medido: atualização perdida (110 em vez de 120).' },
    { id: P + '3', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual abordagem evita a atualização perdida do saldo da forma mais simples?', options: ['SELECT sem trava e UPDATE com valor calculado na aplicação', 'UPDATE contas SET saldo = saldo + 10 WHERE id = 1', 'Aumentar o pool de conexões', 'Usar READ UNCOMMITTED'], answer: 1, explanation: 'O cálculo no próprio UPDATE usa a trava da linha (medido: 120,00).' },
    { id: P + '4', type: 'tf', difficulty: 3, points: 10, prompt: 'O erro 40001 em uma transação REPEATABLE READ indica um bug do banco e a requisição deve ser abandonada.', answer: false, explanation: '40001 pede nova tentativa: repita a transação inteira, com limite e espera.' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que torna a fila vulnerável a trabalhadores processando a mesma tarefa.', code: 'BEGIN;\nSELECT id FROM fila WHERE NOT feita ORDER BY id LIMIT 1;\n-- processa...\nUPDATE fila SET feita = true WHERE id = :id;\nCOMMIT;', answer: 2, explanation: 'Falta FOR UPDATE SKIP LOCKED na seleção: vários trabalhadores escolhem a mesma linha livre.' },
    { id: P + '6', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o recurso ao propósito.', pairs: [['NOWAIT', 'Falhar imediatamente se a linha estiver travada'], ['lock_timeout', 'Limitar o tempo de espera por uma trava'], ['pg_advisory_xact_lock', 'Serializar uma operação por chave de negócio'], ['SERIALIZABLE (PostgreSQL)', 'Detectar write skew e abortar uma transação com 40001']], explanation: 'Cada recurso resolve um problema de concorrência.' },
    { id: P + '7', type: 'mc', difficulty: 3, points: 10, prompt: 'Duas transferências opostas (1→2 e 2→1) causaram deadlock. Qual correção resolve a causa?', options: ['Aumentar o deadlock_timeout', 'Travar as contas sempre em ordem crescente de id antes de atualizar', 'Trocar READ COMMITTED por READ UNCOMMITTED', 'Remover o COMMIT'], answer: 1, explanation: 'Medido: com ordem consistente as duas concluíram sem erro (95,00 e 105,00).' },
    { id: P + '8', type: 'tf', difficulty: 2, points: 10, prompt: 'No MySQL com InnoDB em REPEATABLE READ, um SELECT ... FOR UPDATE em um intervalo sem linhas pode bloquear inserções nesse intervalo.', answer: true, explanation: 'Gap lock: medido, o INSERT do id 7 esperou até o tempo limite.' },
    { id: P + '9', type: 'mc', difficulty: 3, points: 10, prompt: 'Uma sessão deixa uma transação REPEATABLE READ aberta por horas. O que acontece com o banco PostgreSQL?', options: ['Nada', 'O VACUUM não consegue remover versões antigas que a transação ainda pode ver, e as tabelas incham', 'O banco desliga', 'O isolamento é rebaixado automaticamente'], answer: 1, explanation: 'Medido: 50.000 tuplas mortas retidas até a transação terminar.' },
    { id: P + '10', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a inserção idempotente da cobrança.', code: 'INSERT INTO pagamentos (chave_idempotencia, valor) VALUES (\'pedido-77\', 59.90)\n[[0]] (chave_idempotencia) DO [[1]];', answers: [['ON CONFLICT'], ['NOTHING']], explanation: 'Medido: 20 repetições geraram 1 linha.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Explique, com suas palavras, por que "verificar se a sala está livre e depois inserir a reserva" falha sob concorrência e dê duas soluções, citando o resultado medido.', model: 'Entre o SELECT que verifica e o INSERT que grava, outra transação pode inserir; em READ COMMITTED cada transação enxerga o banco sem a reserva da outra, então todas veem "livre" e inserem. No experimento com 20 tentativas simultâneas, 20 reservas foram gravadas. Soluções: uma restrição EXCLUDE USING gist (sala WITH =, periodo WITH &&), que deixou 1 reserva confirmada e recusou 19 com o erro 23P01, e uma trava consultiva por sala antes de verificar e inserir (1 reserva); também são possíveis SERIALIZABLE com repetição e uma linha de controle travada com FOR UPDATE.', rubric: ['Explica a janela entre verificar e inserir', 'Cita o resultado medido (20 reservas)', 'Dá ao menos duas soluções', 'Cita EXCLUDE ou trava consultiva com o resultado'], explanation: 'O caso central do curso.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Cenário: um serviço grava o pedido e precisa publicar um evento em um broker, sem perder o evento e sem publicar eventos de pedidos desfeitos. Qual padrão usar?', options: ['Publicar no broker antes do COMMIT', 'Publicar depois do COMMIT sem nenhum registro', 'Outbox transacional: gravar o evento na mesma transação e publicar depois com repetição e consumidores idempotentes', 'Gravar o evento só no broker'], answer: 2, explanation: 'A mudança e a intenção de publicar viram atômicas; a entrega é pelo menos uma vez.' }
  ]
};

export const project = {
  id: 'reservas-sem-corrida', name: 'Banco de reservas sem corrida: restrições, repetição, idempotência, outbox e testes de concorrência', lv: 'A', stack: 'PostgreSQL 17 (e MySQL 8.4 opcional), Node.js com pg, Vitest', ds: ['tx'],
  desc: 'Construa o **núcleo de um sistema de reservas** (salas ou assentos) que **não permite overbooking** sob concorrência. Entregue: o **modelo** (salas, reservas com intervalo, pagamentos com chave de idempotência, tabela outbox), a **restrição de exclusão** que impede sobreposição, uma **API de reserva** com **repetição** de 40001/40P01 e **idempotência**, uma **fila de notificações** baseada em **outbox com SKIP LOCKED**, e uma **suíte de testes de concorrência** (sessões controladas e carga de 20 a 100 requisições simultâneas) que mostra **antes** (verificar e inserir) e **depois** (protegido), com **números medidos** e a análise das **esperas, deadlocks e repetições**.',
  rf: ['Esquema com salas, reservas (intervalo tstzrange), pagamentos (chave de idempotência única) e outbox (evento, enviado_em)', 'Restrição EXCLUDE USING gist (sala WITH =, periodo WITH &&) e teste que prova 1 confirmada e N-1 recusadas', 'API de reserva em Node.js que traduz 23P01 em "horário ocupado", repete 40001/40P01 com limite e backoff e é idempotente por chave', 'Gravação do evento de notificação na mesma transação da reserva e um publicador com FOR UPDATE SKIP LOCKED e consumidor idempotente', 'Versão ingênua (verificar e inserir) para comparação e relatório dos resultados antes e depois', 'Teste de deadlock reproduzido e corrigido por ordem consistente de travas', 'Configuração de lock_timeout, statement_timeout e idle_in_transaction_session_timeout e demonstração do efeito', 'README com instruções, números medidos e limitações'],
  rnf: ['Transações curtas e sem chamadas externas dentro delas', 'Todos os erros de concorrência classificados (retentável ou de negócio)', 'Testes determinísticos com duas sessões e testes de carga reprodutíveis', 'Versões e parâmetros do ambiente registrados', 'Nenhuma senha em código; portas locais apenas em 127.0.0.1'],
  ac: ['O teste ingênuo mostra overbooking e o protegido mostra exatamente uma reserva confirmada por horário', 'A repetição de uma requisição com a mesma chave de idempotência não duplica a cobrança nem a reserva', 'O publicador entrega cada evento ao menos uma vez e o consumidor processa duplicatas sem duplicar efeitos', 'O deadlock é reproduzido em teste, o erro 40P01 é tratado com repetição e a ordem consistente o elimina', 'O relatório compara com os números do curso (por exemplo, 1 confirmada e 19 recusadas em 20 tentativas) e discute diferenças'],
  ch: ['Implementar a mesma regra no MySQL com uma tabela de slots discretos e UNIQUE e comparar', 'Adicionar uma lista de espera com SKIP LOCKED e promoção automática', 'Medir o efeito de SERIALIZABLE com repetição sob 100 requisições simultâneas', 'Particionar a tabela de eventos de outbox por dia e descartar partições antigas', 'Adicionar métricas de esperas por trava e de repetições e um alerta']
};
