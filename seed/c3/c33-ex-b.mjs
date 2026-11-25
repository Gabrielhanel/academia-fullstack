// C3.3 — PostgreSQL e MySQL: exercícios das aulas 6 a 9, prova final e projeto integrador.
const R = String.raw;

export const exsetsB = {
'pgm-06': [
  { id: 'pgm-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual a diferença entre EXPLAIN e EXPLAIN ANALYZE no PostgreSQL?', options: ['Nenhuma', 'EXPLAIN mostra o plano estimado sem executar; EXPLAIN ANALYZE executa a consulta e mostra valores reais', 'EXPLAIN ANALYZE só funciona em SELECT', 'EXPLAIN executa e ANALYZE não'], answer: 1, explanation: 'Por executar de fato, use EXPLAIN ANALYZE de escritas dentro de BEGIN ... ROLLBACK.' },
  { id: 'pgm-06-e2', type: 'trace', difficulty: 3, points: 10, prompt: 'Nó de um plano: Parallel Seq Scan on pedidos (actual rows=55668 loops=3).', code: 'Parallel Seq Scan on pedidos p\n  (cost=0.00..11116.17 rows=70292 width=4) (actual rows=55668 loops=3)\n  Filter: (status = \'pago\')', lang: 'text', steps: [{ q: 'Quantas linhas, aproximadamente, passaram pelo filtro no total (55668 x loops)?', answers: ['167004', '167004 linhas', '167.004'] }, { q: 'O número 11116.17 é em milissegundos? (sim/não)', answers: ['não', 'nao'] }], explanation: 'O valor real de rows é por loop: 55.668 × 3 ≈ 167.004 (a contagem exata por status foi 167.005). O custo é uma unidade arbitrária do planejador.' },
  { id: 'pgm-06-e3', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma estimativa de 1 linha com 50.000 linhas reais costuma indicar estatísticas desatualizadas.', answer: true, explanation: 'Medido: após inserir 50.000 linhas novas sem ANALYZE o plano estimou rows=1; depois do ANALYZE, rows=50000.' },
  { id: 'pgm-06-e4', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o nó do plano à situação em que costuma ser escolhido.', pairs: [['Nested Loop com Index Scan', 'Poucas linhas na tabela externa e índice na interna'], ['Hash Join', 'Conjuntos grandes, sem ordem, com igualdade'], ['Merge Join', 'Dois lados já ordenados (por exemplo, por índice)'], ['Seq Scan', 'Tabela pequena ou condição que retorna grande fração']], explanation: 'O planejador compara custos estimados para escolher o algoritmo.' },
  { id: 'pgm-06-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Descreva o roteiro que você seguiria ao receber um plano de uma consulta lenta.', model: 'Ver o tempo total e achar o nó que mais consome (tempo real multiplicado por loops); comparar linhas estimadas e reais em cada nó, pois diferenças de ordem de grandeza indicam estatísticas ruins; procurar Seq Scan em tabelas grandes com filtro seletivo, Rows Removed by Filter altos, Sort ou Hash em disco, Nested Loop com muitas repetições e Heap Fetches altos; propor uma única mudança (índice, reescrita, ANALYZE), aplicá-la e medir de novo com EXPLAIN (ANALYZE, BUFFERS), registrando antes e depois.', rubric: ['Menciona achar o nó mais caro considerando loops', 'Compara estimado e real', 'Lista sinais de problema (seq scan, rows removed, sort em disco)', 'Propõe mudar uma coisa e medir de novo'], explanation: 'Diagnóstico é um processo, não um palpite.' },
  { id: 'pgm-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Compare algoritmos de junção. Implemente §nestedLoop(esq, dir, chaveEsq, chaveDir)§ e §hashJoin(esq, dir, chaveEsq, chaveDir)§. Ambos devolvem §{ linhas, ... }§ com as linhas combinadas §{ ...l, ...r }§ para cada par com §l[chaveEsq] === r[chaveDir]§, **na ordem das linhas da esquerda** e, para cada uma, na ordem da direita. §nestedLoop§ devolve também §comparacoes§ (o número de pares comparados: **todas as combinações**). §hashJoin§ monta uma tabela hash com as linhas da **direita** e devolve §construcoes§ (linhas da direita inseridas na hash) e §sondagens§ (uma por linha da esquerda).', lang: 'javascript', starter: 'function nestedLoop(esq, dir, chaveEsq, chaveDir) {\n  // seu código aqui\n}\nfunction hashJoin(esq, dir, chaveEsq, chaveDir) {\n}\n', hints: ['No nested loop, dois laços e um contador de comparações.', 'No hash join, use um Map de chave para lista de linhas da direita.', 'A ordem do resultado é a mesma nos dois.'], tests: [{ name: 'mesmo resultado e contagens', code: R`const c = [{ cid: 1, nome: 'Ana' }, { cid: 2, nome: 'Bruno' }, { cid: 3, nome: 'Carla' }];
const p = [{ pid: 10, cid: 1 }, { pid: 11, cid: 1 }, { pid: 12, cid: 2 }, { pid: 13, cid: 9 }];
const a = nestedLoop(c, p, 'cid', 'cid');
const b = hashJoin(c, p, 'cid', 'cid');
assert.deepEqual(a.linhas, b.linhas);
assert.deepEqual(a.linhas.map((x) => x.nome + x.pid), ['Ana10', 'Ana11', 'Bruno12']);
assert.equal(a.comparacoes, 12);
assert.equal(b.construcoes, 4);
assert.equal(b.sondagens, 3);` }, { name: 'sem correspondência', code: R`const a = nestedLoop([{ k: 1 }], [{ k: 2 }], 'k', 'k');
assert.deepEqual(a.linhas, []);
assert.equal(a.comparacoes, 1);
const b = hashJoin([{ k: 1 }], [{ k: 2 }], 'k', 'k');
assert.deepEqual(b.linhas, []);
assert.deepEqual([b.construcoes, b.sondagens], [1, 1]);` }, { name: 'crescimento do custo', code: R`const esq = Array.from({ length: 100 }, (_, i) => ({ a: i }));
const dir = Array.from({ length: 200 }, (_, i) => ({ a: i % 100, v: i }));
const n = nestedLoop(esq, dir, 'a', 'a');
const h = hashJoin(esq, dir, 'a', 'a');
assert.equal(n.comparacoes, 20000);
assert.equal(h.construcoes + h.sondagens, 300);
assert.equal(n.linhas.length, 200);
assert.deepEqual(n.linhas, h.linhas);` }], solution: R`function nestedLoop(esq, dir, chaveEsq, chaveDir) {
  const linhas = [];
  let comparacoes = 0;
  for (const l of esq) {
    for (const r of dir) {
      comparacoes++;
      if (l[chaveEsq] === r[chaveDir]) linhas.push({ ...l, ...r });
    }
  }
  return { linhas, comparacoes };
}
function hashJoin(esq, dir, chaveEsq, chaveDir) {
  const hash = new Map();
  let construcoes = 0, sondagens = 0;
  for (const r of dir) {
    construcoes++;
    if (!hash.has(r[chaveDir])) hash.set(r[chaveDir], []);
    hash.get(r[chaveDir]).push(r);
  }
  const linhas = [];
  for (const l of esq) {
    sondagens++;
    for (const r of hash.get(l[chaveEsq]) || []) linhas.push({ ...l, ...r });
  }
  return { linhas, construcoes, sondagens };
}
`, explanation: 'O nested loop faz n × m comparações; o hash join faz n + m operações. É por isso que o planejador escolhe hash para conjuntos grandes e nested loop (com índice) para poucas linhas.' }
],
'pgm-07': [
  { id: 'pgm-07-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Medido em 500.000 linhas: ORDER BY id LIMIT 20 OFFSET 400000 levou ~155 ms e WHERE id > 400000 ORDER BY id LIMIT 20 levou ~0,16 ms. Qual a explicação?', options: ['O segundo comando usa cache', 'O OFFSET lê e descarta 400.000 entradas; a paginação por chave vai direto ao ponto', 'O segundo comando devolve menos colunas', 'O índice foi recriado'], answer: 1, explanation: 'O plano mostrou 400.020 linhas lidas contra 20.' },
  { id: 'pgm-07-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Depois de VACUUM comum, o arquivo da tabela diminui e devolve espaço ao sistema operacional.', answer: false, explanation: 'Medido: o tamanho continuou em 7.080 kB; o espaço é reutilizado pela própria tabela. VACUUM FULL devolve espaço, com bloqueio exclusivo.' },
  { id: 'pgm-07-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que degrada com o crescimento da tabela.', code: 'SELECT id, nome\nFROM produtos\nORDER BY id\nLIMIT 20\nOFFSET :pagina * 20;', answer: 5, explanation: 'OFFSET proporcional ao número da página obriga o banco a ler e descartar todas as linhas anteriores; prefira paginação por chave.' },
  { id: 'pgm-07-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a atualização de estatísticas depois de uma carga em massa.', code: 'INSERT INTO evt SELECT ... FROM generate_series(1, 50000);\n[[0]] evt;', answers: [['ANALYZE']], explanation: 'Sem estatísticas novas, o plano estimou 1 linha contra 50.000 reais (medido).' },
  { id: 'pgm-07-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Por que "otimizar a consulta mais lenta" nem sempre é o melhor ponto de partida? Que métrica você usaria para priorizar?', model: 'Uma consulta lenta que roda raramente pode custar menos ao sistema do que uma consulta rápida que roda milhares de vezes por segundo. O melhor ponto de partida é o tempo total (chamadas multiplicadas pelo tempo médio), obtido de pg_stat_statements ou do slow query log, combinado com o impacto no usuário (percentis altos de latência) e em recursos (CPU, I/O, bloqueios). Priorizar pelo maior tempo total e pelo impacto em operações críticas, medir antes e depois e verificar efeitos colaterais.', rubric: ['Distingue consulta lenta rara de consulta frequente', 'Cita tempo total (chamadas x tempo médio)', 'Cita pg_stat_statements ou slow log', 'Considera impacto em usuários e recursos'], explanation: 'Otimização guiada por impacto.' },
  { id: 'pgm-07-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele **paginação**. Implemente §paginar(ids, opcoes)§: §ids§ é uma lista **ordenada crescente** de chaves. §opcoes§ = §{ modo, limite, deslocamento, depoisDe }§. No modo §"offset"§, devolva §{ itens, linhasLidas }§ com os itens de §ids.slice(deslocamento, deslocamento + limite)§ e §linhasLidas§ = **deslocamento + quantidade de itens devolvidos** (o banco lê e descarta as puladas). No modo §"chave"§, devolva os primeiros §limite§ ids **maiores que** §depoisDe§ e §linhasLidas§ = **quantidade de itens devolvidos** (o índice vai direto ao ponto). Modo inválido lança §Error("modo inválido: M")§.', lang: 'javascript', starter: 'function paginar(ids, opcoes) {\n  // seu código aqui\n}\n', hints: ['No modo offset, linhasLidas conta também as linhas puladas.', 'No modo chave, filtre ids > depoisDe e pegue limite itens.'], tests: [{ name: 'offset lê as linhas puladas', code: R`const ids = Array.from({ length: 1000 }, (_, i) => i + 1);
const r = paginar(ids, { modo: 'offset', limite: 20, deslocamento: 400 });
assert.equal(r.itens[0], 401);
assert.equal(r.itens.length, 20);
assert.equal(r.linhasLidas, 420);` }, { name: 'chave lê só os devolvidos', code: R`const ids = Array.from({ length: 1000 }, (_, i) => i + 1);
const r = paginar(ids, { modo: 'chave', limite: 20, depoisDe: 400 });
assert.equal(r.itens[0], 401);
assert.equal(r.itens.length, 20);
assert.equal(r.linhasLidas, 20);` }, { name: 'fim da lista e modo inválido', code: R`const ids = [1, 2, 3, 4, 5];
assert.deepEqual(paginar(ids, { modo: 'chave', limite: 10, depoisDe: 3 }), { itens: [4, 5], linhasLidas: 2 });
assert.deepEqual(paginar(ids, { modo: 'offset', limite: 10, deslocamento: 3 }), { itens: [4, 5], linhasLidas: 5 });
assert.deepEqual(paginar(ids, { modo: 'chave', limite: 3, depoisDe: 0 }).itens, [1, 2, 3]);
assert.throws(() => paginar(ids, { modo: 'pagina', limite: 1 }), 'modo inválido: pagina');` }], solution: R`function paginar(ids, opcoes) {
  const { modo, limite, deslocamento = 0, depoisDe } = opcoes;
  if (modo === 'offset') {
    const itens = ids.slice(deslocamento, deslocamento + limite);
    return { itens, linhasLidas: deslocamento + itens.length };
  }
  if (modo === 'chave') {
    const itens = ids.filter((id) => id > depoisDe).slice(0, limite);
    return { itens, linhasLidas: itens.length };
  }
  throw new Error('modo inválido: ' + modo);
}
`, explanation: 'O contador mostra o custo: o OFFSET cresce com o deslocamento; a chave lê só o que devolve (supondo índice na chave). Foi o que o plano mediu: 400.020 contra 20 linhas.' }
],
'pgm-08': [
  { id: 'pgm-08-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Uma consulta WHERE criado >= \'2026-02-10\' AND criado < \'2026-02-20\' em uma tabela particionada por mês fez Seq Scan em apenas uma partição. Como se chama isso?', options: ['Replicação', 'Poda de partições (partition pruning)', 'Sharding', 'Vacuum'], answer: 1, explanation: 'O planejador ignora partições que não podem conter resultados quando o filtro usa a chave de partição.' },
  { id: 'pgm-08-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma réplica por streaming serve como backup contra o DROP TABLE acidental no primário.', answer: false, explanation: 'O DROP TABLE também é replicado; backup e replicação resolvem problemas diferentes.' },
  { id: 'pgm-08-e3', type: 'trace', difficulty: 3, points: 10, prompt: 'Réplica em um laboratório PostgreSQL 17.', code: 'SELECT pg_is_in_recovery();            -- na réplica\nINSERT INTO tuning.repl_teste VALUES (1);   -- na réplica\nSELECT state, sync_state FROM pg_stat_replication;  -- no primário', lang: 'sql', steps: [{ q: 'O que devolve pg_is_in_recovery() na réplica (t/f)?', answers: ['t'] }, { q: 'O INSERT na réplica funciona? (sim/não)', answers: ['não', 'nao'] }, { q: 'Qual o sync_state do primário?', answers: ['async'] }], explanation: 'Medido: a réplica está em recuperação, é somente leitura e a replicação padrão é assíncrona.' },
  { id: 'pgm-08-e4', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a necessidade ao mecanismo.', pairs: [['Descartar rapidamente dados de um mês antigo', 'DETACH PARTITION ou DROP da partição'], ['Escalar consultas de leitura pesadas', 'Réplicas de leitura'], ['Não perder transações confirmadas se o primário cair', 'Replicação síncrona'], ['Voltar o banco a um instante antes de um erro humano', 'Backup base com WAL arquivado (PITR)']], explanation: 'Cada mecanismo atende a uma necessidade diferente.' },
  { id: 'pgm-08-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Uma equipe quer particionar uma tabela de 20 milhões de linhas "para ficar mais rápida". Que perguntas você faria e que riscos apontaria?', model: 'Perguntar quais consultas são lentas e se filtram pela coluna candidata a chave de partição; se há ciclo de vida dos dados (retenção) que justifique remover partições; se índices e consultas já resolvem o problema; qual o tamanho em relação à memória; e como serão criadas as partições futuras. Riscos: o particionamento não acelera automaticamente e pode piorar consultas que não usam a chave (varrem todas as partições), aumenta a complexidade e o tempo de planejamento com muitas partições, restringe chaves primárias e únicas (devem incluir a chave de partição) e exige automação para criar partições, senão as inserções falham (medido: no partition found for row). Com 20 milhões de linhas, índices bem escolhidos costumam bastar.', rubric: ['Pergunta sobre as consultas e a chave de partição', 'Cita retenção como motivo válido', 'Cita o risco de consultas sem a chave', 'Cita manutenção e restrições de chaves'], explanation: 'Particionamento é para tabelas grandes com padrão de acesso e ciclo de vida compatíveis.' },
  { id: 'pgm-08-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o **particionamento por faixa**. §particoes§ é uma lista de §{ nome, inicio, fim }§ com intervalos **semiabertos** §[inicio, fim)§ (valores comparáveis com §<§, como datas §"AAAA-MM-DD"§ ou números). Implemente §particaoDe(particoes, valor)§, que devolve o §nome§ da partição que contém o valor ou lança §Error("no partition of relation found for row")§; e §podar(particoes, { de, ate })§, que devolve os nomes (na ordem da lista) das partições que **podem conter** valores do intervalo semiaberto §[de, ate)§ (uma partição interessa se §inicio < ate§ e §de < fim§).', lang: 'javascript', starter: 'function particaoDe(particoes, valor) {\n  // seu código aqui\n}\nfunction podar(particoes, filtro) {\n}\n', hints: ['particaoDe: find com inicio <= valor < fim.', 'podar: filter com inicio < ate e de < fim.'], tests: [{ name: 'particaoDe', code: R`const p = [{ nome: 'jan', inicio: '2026-01-01', fim: '2026-02-01' }, { nome: 'fev', inicio: '2026-02-01', fim: '2026-03-01' }, { nome: 'mar', inicio: '2026-03-01', fim: '2026-04-01' }];
assert.equal(particaoDe(p, '2026-02-15'), 'fev');
assert.equal(particaoDe(p, '2026-02-01'), 'fev');
assert.equal(particaoDe(p, '2026-01-31'), 'jan');
assert.throws(() => particaoDe(p, '2027-01-01'), 'no partition of relation found for row');` }, { name: 'poda', code: R`const p = [{ nome: 'jan', inicio: '2026-01-01', fim: '2026-02-01' }, { nome: 'fev', inicio: '2026-02-01', fim: '2026-03-01' }, { nome: 'mar', inicio: '2026-03-01', fim: '2026-04-01' }];
assert.deepEqual(podar(p, { de: '2026-02-10', ate: '2026-02-20' }), ['fev']);
assert.deepEqual(podar(p, { de: '2026-01-20', ate: '2026-03-05' }), ['jan', 'fev', 'mar']);
assert.deepEqual(podar(p, { de: '2026-02-01', ate: '2026-03-01' }), ['fev']);
assert.deepEqual(podar(p, { de: '2027-01-01', ate: '2027-02-01' }), []);` }, { name: 'números', code: R`const p = [{ nome: 'a', inicio: 0, fim: 100 }, { nome: 'b', inicio: 100, fim: 200 }];
assert.equal(particaoDe(p, 100), 'b');
assert.deepEqual(podar(p, { de: 99, ate: 101 }), ['a', 'b']);
assert.deepEqual(podar(p, { de: 100, ate: 150 }), ['b']);` }], solution: R`function particaoDe(particoes, valor) {
  const p = particoes.find((x) => x.inicio <= valor && valor < x.fim);
  if (!p) throw new Error('no partition of relation found for row');
  return p.nome;
}
function podar(particoes, filtro) {
  const { de, ate } = filtro;
  return particoes.filter((x) => x.inicio < ate && de < x.fim).map((x) => x.nome);
}
`, explanation: 'A poda é exatamente o teste de sobreposição entre o intervalo do filtro e o de cada partição; a inserção fora das faixas falha como mediu o PostgreSQL (no partition of relation found for row).' }
],
'pgm-09': [
  { id: 'pgm-09-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'O que significa RPO de 5 minutos?', options: ['O banco deve voltar em 5 minutos', 'O negócio aceita perder no máximo 5 minutos de dados', 'O backup demora 5 minutos', 'A réplica atrasa 5 minutos'], answer: 1, explanation: 'RPO mede a perda de dados aceitável; RTO mede o tempo de restauração aceitável.' },
  { id: 'pgm-09-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Um pg_dump -n tuning inclui os comandos CREATE EXTENSION das extensões usadas pelo esquema.', answer: false, explanation: 'Medido: sem recriar btree_gist e pg_trgm (no esquema tuning) a restauração falhou em dois índices.' },
  { id: 'pgm-09-e3', type: 'trace', difficulty: 3, points: 10, prompt: 'Restauração do dump -n tuning em bancos novos (500.000 linhas).', code: 'tentativa 1: sem extensões\ntentativa 2: pg_trgm em public\ntentativa 3: btree_gist e pg_trgm SCHEMA tuning', lang: 'text', steps: [{ q: 'Quantos índices existem depois da tentativa 1 (de 20)?', answers: ['18'] }, { q: 'E depois da tentativa 3?', answers: ['20'] }], explanation: 'Medido: 18 índices e 2 erros na primeira; 20 índices na terceira (só o aviso de que o esquema já existia).' },
  { id: 'pgm-09-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o backup lógico consistente no MySQL com tabelas InnoDB.', code: 'mysqldump -uroot -p [[0]] lab produtos > produtos.sql', answers: [['--single-transaction']], explanation: '--single-transaction obtém um snapshot consistente sem bloquear tabelas InnoDB.' },
  { id: 'pgm-09-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Monte um plano de backup para um banco com RPO de 5 minutos e RTO de 1 hora. Quais componentes você incluiria e como validaria?', model: 'Backup base periódico (por exemplo, diário) combinado com arquivamento contínuo de WAL (ou binlog) para permitir PITR com perda de poucos minutos; cópias em pelo menos dois tipos de mídia e uma fora do local, de preferência imutável (regra 3-2-1); criptografia em repouso e em trânsito, retenção definida e acesso separado; monitoramento do sucesso e da idade dos backups e do arquivamento. Para o RTO de 1 hora, ensaiar a restauração periodicamente em ambiente isolado e medir o tempo real (download, restore, índices), validar contagens e testes de fumaça, e documentar o procedimento. Uma réplica melhora a disponibilidade, mas não substitui o backup.', rubric: ['Combina backup base com WAL ou binlog para o RPO', 'Cita regra 3-2-1, criptografia e retenção', 'Cita teste de restauração e medição do RTO real', 'Diferencia réplica de backup'], explanation: 'RPO e RTO guiam a arquitetura; testes provam.' },
  { id: 'pgm-09-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente §verificarPlano(plano)§, que devolve a **lista de problemas** (nesta ordem) de um plano de backup com os campos §rpoMinutos§, §intervaloBackupMinutos§, §arquivamentoDeLogs§ (booleano), §copias§, §midias§, §copiaForaDoLocal§ (booleano), §criptografado§ (booleano), §diasDesdeUltimoTesteRestauracao§ (número ou §null§), §rtoMinutos§ e §rtoMedidoMinutos§. Códigos: §"rpo-incompativel"§ se **não** há arquivamento de logs e §intervaloBackupMinutos > rpoMinutos§; §"regra-3-2-1"§ se §copias < 3§ ou §midias < 2§ ou não há cópia fora do local; §"sem-criptografia"§ se não estiver criptografado; §"restauracao-nao-testada"§ se §diasDesdeUltimoTesteRestauracao§ for §null§ ou maior que **90**; §"rto-estourado"§ se §rtoMedidoMinutos > rtoMinutos§. Sem problemas devolve §[]§.', lang: 'javascript', starter: 'function verificarPlano(plano) {\n  // seu código aqui\n}\n', hints: ['Acrescente os códigos em uma lista na ordem pedida.', 'Cuidado com null em diasDesdeUltimoTesteRestauracao.'], tests: [{ name: 'plano ruim', code: R`const plano = { rpoMinutos: 5, intervaloBackupMinutos: 1440, arquivamentoDeLogs: false, copias: 1, midias: 1, copiaForaDoLocal: false, criptografado: false, diasDesdeUltimoTesteRestauracao: null, rtoMinutos: 60, rtoMedidoMinutos: 240 };
assert.deepEqual(verificarPlano(plano), ['rpo-incompativel', 'regra-3-2-1', 'sem-criptografia', 'restauracao-nao-testada', 'rto-estourado']);` }, { name: 'plano bom', code: R`const plano = { rpoMinutos: 5, intervaloBackupMinutos: 1440, arquivamentoDeLogs: true, copias: 3, midias: 2, copiaForaDoLocal: true, criptografado: true, diasDesdeUltimoTesteRestauracao: 30, rtoMinutos: 60, rtoMedidoMinutos: 45 };
assert.deepEqual(verificarPlano(plano), []);` }, { name: 'limites', code: R`const base = { rpoMinutos: 60, intervaloBackupMinutos: 60, arquivamentoDeLogs: false, copias: 3, midias: 2, copiaForaDoLocal: true, criptografado: true, diasDesdeUltimoTesteRestauracao: 90, rtoMinutos: 30, rtoMedidoMinutos: 30 };
assert.deepEqual(verificarPlano(base), []);
assert.deepEqual(verificarPlano({ ...base, diasDesdeUltimoTesteRestauracao: 91 }), ['restauracao-nao-testada']);
assert.deepEqual(verificarPlano({ ...base, intervaloBackupMinutos: 61 }), ['rpo-incompativel']);
assert.deepEqual(verificarPlano({ ...base, copias: 2 }), ['regra-3-2-1']);` }], solution: R`function verificarPlano(p) {
  const r = [];
  if (!p.arquivamentoDeLogs && p.intervaloBackupMinutos > p.rpoMinutos) r.push('rpo-incompativel');
  if (p.copias < 3 || p.midias < 2 || !p.copiaForaDoLocal) r.push('regra-3-2-1');
  if (!p.criptografado) r.push('sem-criptografia');
  if (p.diasDesdeUltimoTesteRestauracao === null || p.diasDesdeUltimoTesteRestauracao > 90) r.push('restauracao-nao-testada');
  if (p.rtoMedidoMinutos > p.rtoMinutos) r.push('rto-estourado');
  return r;
}
`, explanation: 'O verificador transforma metas (RPO, RTO) e a regra 3-2-1 em checagens testáveis. Na prática, o dado mais importante é o RTO medido em um teste real de restauração.' }
]
};

const P = 'postgres-mysql-p';
export const assessment = {
  id: 'postgres-mysql', title: 'Avaliação final — PostgreSQL e MySQL: operação e desempenho', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual das condições abaixo NÃO consegue usar um índice B-tree comum em data?', options: ['data = DATE \'2026-03-01\'', 'data >= DATE \'2026-03-01\' AND data < DATE \'2026-03-02\'', 'date_trunc(\'day\', data::timestamp) = TIMESTAMP \'2026-03-01\'', 'data BETWEEN \'2026-03-01\' AND \'2026-03-31\''], answer: 2, explanation: 'Função aplicada à coluna impede o índice (medido).' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'No PostgreSQL, uma tabela criada dentro de uma transação desfeita com ROLLBACK deixa de existir; no MySQL, o DDL faz commit implícito.', answer: true, explanation: 'Medido nos dois bancos.' },
    { id: P + '3', type: 'trace', difficulty: 3, points: 10, prompt: 'Índice composto em (status, data).', code: 'A: WHERE status = \'pago\' AND data >= \'2026-01-01\'\nB: WHERE data >= \'2026-12-01\' AND data < \'2026-12-05\'\nC: WHERE status = \'pago\' ORDER BY data LIMIT 5', lang: 'sql', steps: [{ q: 'A usa o composto? (sim/não)', answers: ['sim'] }, { q: 'B usa o composto? (sim/não)', answers: ['não', 'nao'] }, { q: 'C precisa de etapa de ordenação extra? (sim/não)', answers: ['não', 'nao'] }], explanation: 'O composto atende prefixos: A e C sim; B usa outro índice (em data).' },
    { id: P + '4', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual índice resolve WHERE meta @> \'{"canal":"loja"}\' em uma coluna jsonb?', options: ['B-tree em meta', 'GIN em meta', 'Hash em meta', 'BRIN em meta'], answer: 1, explanation: 'O GIN indexa o conteúdo de valores compostos (medido: Bitmap Index Scan).' },
    { id: P + '5', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que causa o problema de desempenho crescente nas páginas finais.', code: 'SELECT id, titulo\nFROM artigos\nORDER BY id\nLIMIT 20 OFFSET 400000;', answer: 4, explanation: 'O OFFSET grande lê e descarta todas as linhas puladas; use paginação por chave.' },
    { id: P + '6', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a criação da réplica a partir do primário.', code: 'pg_basebackup -h primario -U postgres -D /dados/replica [[0]] -X stream -c fast', answers: [['-R']], explanation: '-R grava a configuração de standby (standby.signal e primary_conninfo).' },
    { id: P + '7', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o conceito à definição.', pairs: [['RPO', 'Quanto dado se aceita perder'], ['RTO', 'Quanto tempo se aceita ficar fora'], ['PITR', 'Restaurar a um instante com backup base e logs'], ['VACUUM', 'Remove tuplas mortas e libera espaço para reutilização']], explanation: 'São os conceitos centrais de operação.' },
    { id: P + '8', type: 'mc', difficulty: 3, points: 10, prompt: 'A restauração de um dump com pg_dump -n esquema falhou em um índice GiST e em um índice de trigramas. Qual a causa mais provável?', options: ['O dump estava corrompido', 'As extensões (btree_gist e pg_trgm) não fazem parte do dump parcial e precisam ser recriadas, no mesmo esquema', 'O disco estava cheio', 'A versão do psql é antiga'], answer: 1, explanation: 'Medido: 18 de 20 índices na primeira tentativa e 20 depois de recriar as extensões no esquema.' },
    { id: P + '9', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma réplica assíncrona garante que nenhuma transação confirmada será perdida se o primário falhar.', answer: false, explanation: 'Na assíncrona o commit não espera a réplica; as últimas transações podem não ter chegado. A síncrona evita isso, com custo de latência.' },
    { id: P + '10', type: 'mc', difficulty: 3, points: 10, prompt: 'Cenário: MySQL 8.4 com a collation padrão e uma chave única em e-mail. Ao migrar para PostgreSQL, "Ana@x.com" e "ana@x.com" passam a ser distintos. O que isso exige?', options: ['Nada, pois o comportamento é idêntico', 'Definir a normalização desejada (por exemplo, lower() em índice único de expressão ou citext) e revisar os dados duplicados por caixa', 'Trocar o tipo para integer', 'Desligar o modo estrito'], answer: 1, explanation: 'Medido: o MySQL compara sem distinguir caixa; o PostgreSQL distingue. Decida e imponha a regra de unicidade desejada.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que a réplica não substitui o backup e descreva o que fazer para garantir que um backup funciona.', model: 'A replicação copia todas as mudanças do primário para as réplicas, inclusive erros: um DROP TABLE, um UPDATE sem WHERE ou dados corrompidos se replicam e o erro aparece também nas cópias. O backup guarda estados anteriores (e, com WAL ou binlog arquivados, permite voltar a um instante antes do erro). Para garantir que um backup funciona, é preciso restaurá-lo regularmente em ambiente isolado, medir o tempo real (RTO), validar contagens, índices, restrições e consultas de verificação e registrar os resultados; também monitorar a idade e o sucesso dos backups, criptografar e manter cópia fora do local. O experimento do curso mostrou um erro que só apareceu na restauração.', rubric: ['Explica que a réplica copia erros', 'Descreve a função do backup e do PITR', 'Descreve o teste de restauração e a validação', 'Cita monitoramento, criptografia ou cópia fora do local'], explanation: 'Resposta central do curso.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Uma consulta que rodava em 2 ms passou a rodar em 900 ms depois de uma carga de 5 milhões de linhas, e o plano estima 3 linhas onde há 2 milhões. Qual o primeiro passo?', options: ['Aumentar max_connections', 'Rodar ANALYZE e comparar o plano novo; investigar autovacuum', 'Criar índices em todas as colunas', 'Reiniciar o servidor'], answer: 1, explanation: 'Estimativas muito diferentes do real apontam estatísticas desatualizadas; atualize-as antes de mudar o esquema.' }
  ]
};

export const project = {
  id: 'tuning-banco', name: 'Tuning de um banco: índices, planos, particionamento, réplica e plano de backup testado', lv: 'A', stack: 'PostgreSQL 17, MySQL 8.4, Docker e psql', ds: ['pg'],
  desc: 'A partir de um esquema de pedidos com **500 mil linhas** (gerado por script), faça um **tuning documentado**: identifique consultas lentas, leia os **planos** (§EXPLAIN (ANALYZE, BUFFERS)§), proponha e meça **índices** (B-tree, composto, parcial, cobertura, GIN), substitua **OFFSET** por **paginação por chave**, particione uma tabela de logs por mês, configure uma **réplica por streaming** e escreva um **plano de backup com RPO e RTO**, **testando a restauração** (incluindo extensões). Compare o comportamento de **PostgreSQL e MySQL** em pelo menos cinco diferenças medidas. Entregue scripts, saídas dos planos antes e depois e um relatório com as decisões.',
  rf: ['Script de carga reprodutível (500 mil pedidos, clientes e itens) e ANALYZE', 'Pelo menos quatro consultas lentas com plano antes e depois (índice simples, composto, parcial ou de cobertura, e um caso de condição não sargable reescrita)', 'Um caso com GIN (jsonb ou trigramas) e um com GiST ou restrição de exclusão', 'Paginação por chave comparada com OFFSET, com os números medidos', 'Tabela de logs particionada por mês com prova de poda no plano e rotina de criação/retirada de partições', 'Réplica por streaming funcionando, com verificação de somente leitura e de atraso', 'Plano de backup com RPO e RTO, backup lógico e restauração testada em banco novo, com contagens validadas', 'Comparação PostgreSQL x MySQL com pelo menos cinco diferenças medidas'],
  rnf: ['Versões e parâmetros registrados (PostgreSQL, MySQL, imagem, configuração)', 'Cada otimização com antes, depois e custo (espaço e escrita)', 'Resultados de tempo com a ressalva do ambiente e execuções repetidas', 'Senhas e portas seguras (127.0.0.1) no laboratório', 'README com comandos de reprodução e limitações'],
  ac: ['Cada índice proposto tem um plano que prova o uso e a medição do ganho', 'O relatório mostra o custo de escrita de pelo menos um índice', 'A consulta particionada mostra poda de partições no plano', 'A restauração é feita em banco novo e as contagens e índices conferem; qualquer erro encontrado é documentado e corrigido', 'A réplica recusa escritas e mostra atraso medido', 'O plano de backup traz RPO e RTO e evidência de um teste de restauração'],
  ch: ['Habilitar pg_stat_statements e priorizar as consultas por tempo total', 'Configurar PITR com arquivamento de WAL e restaurar a um instante', 'Testar a promoção da réplica (failover) e reconfigurar a aplicação', 'Migrar um subconjunto das tabelas para o MySQL e comparar planos', 'Automatizar um teste mensal de restauração em CI']
};
