// C3.1 — SQL essencial: exercícios das aulas 1 a 5.
// O SQL real foi executado no PostgreSQL 17 (laboratório); os desafios "code" (JavaScript) modelam a lógica do SQL.
const R = String.raw;

export const exsetsA = {
'sqe-01': [
  { id: 'sqe-01-e1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual consulta devolve os clientes sem e-mail?', options: ['SELECT nome FROM clientes WHERE email = NULL', 'SELECT nome FROM clientes WHERE email IS NULL', 'SELECT nome FROM clientes WHERE email = \'\'', 'SELECT nome FROM clientes WHERE email <> NULL'], answer: 1, explanation: 'Comparações com NULL são desconhecidas; só IS NULL testa a ausência (medido: = NULL devolveu 0 linhas).' },
  { id: 'sqe-01-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Em uma tabela de 4 clientes em que 3 têm e-mail, count(*) é 4 e count(email) é 3.', answer: true, explanation: 'count(*) conta linhas; count(coluna) ignora NULL (medido: 4 e 3).' },
  { id: 'sqe-01-e3', type: 'match', difficulty: 1, points: 10, prompt: 'Associe a restrição à regra que impõe.', pairs: [['PRIMARY KEY', 'Identifica a linha de forma única e não nula'], ['FOREIGN KEY', 'Só aceita valores que existem na tabela referenciada'], ['UNIQUE', 'Não permite valores repetidos (NULL aceito)'], ['CHECK', 'Exige que uma condição seja verdadeira, como preco >= 0']], explanation: 'Cada restrição protege uma regra que deve valer sempre, no próprio banco.' },
  { id: 'sqe-01-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete para incluir também os clientes sem cidade na lista de quem não mora em Porto Alegre.', code: 'SELECT nome FROM clientes\nWHERE cidade [[0]] [[1]] \'Porto Alegre\';', answers: [['IS'], ['DISTINCT FROM']], explanation: 'IS DISTINCT FROM trata NULL como um valor comparável (medido: devolveu Bruno e Diego, enquanto <> devolveu só Bruno).' },
  { id: 'sqe-01-e5', type: 'bug', difficulty: 2, points: 10, prompt: 'Clique na linha que guarda dinheiro de forma imprecisa.', code: 'CREATE TABLE produtos (\n  id integer PRIMARY KEY,\n  nome text NOT NULL,\n  preco double precision NOT NULL\n);', answer: 4, explanation: 'double precision é ponto flutuante aproximado; para dinheiro use numeric(10,2), que guarda o valor exato.' },
  { id: 'sqe-01-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele a **lógica de três valores** do SQL (§true§, §false§ e §null§ para desconhecido). Implemente §e3(a, b)§ (AND), §ou3(a, b)§ (OR), §nao3(a)§ e §igual3(a, b)§ (comparação §=§, que devolve §null§ se algum lado for §null§), além de §onde(linhas, predicado)§, que devolve só as linhas para as quais o predicado é **exatamente §true§** (como o WHERE). Regras: AND é §false§ se algum lado for §false§, senão §null§ se algum for §null§, senão §true§; OR é §true§ se algum lado for §true§, senão §null§ se algum for §null§, senão §false§; NOT de §null§ é §null§.', lang: 'javascript', starter: 'function e3(a, b) {\n  // seu código aqui\n}\nfunction ou3(a, b) {\n}\nfunction nao3(a) {\n}\nfunction igual3(a, b) {\n}\nfunction onde(linhas, predicado) {\n}\n', hints: ['Trate primeiro o caso decisivo (false para AND, true para OR).', 'Depois verifique null; só então devolva o valor "limpo".', 'onde filtra com predicado(linha) === true.'], tests: [{ name: 'tabelas-verdade', code: R`assert.equal(e3(true, null), null);
assert.equal(e3(false, null), false);
assert.equal(e3(true, true), true);
assert.equal(ou3(true, null), true);
assert.equal(ou3(false, null), null);
assert.equal(ou3(false, false), false);
assert.equal(nao3(null), null);
assert.equal(nao3(true), false);` }, { name: 'igualdade com NULL', code: R`assert.equal(igual3(1, 1), true);
assert.equal(igual3(1, 2), false);
assert.equal(igual3(null, null), null);
assert.equal(igual3('a', null), null);` }, { name: 'WHERE só mantém true', code: R`const clientes = [{ nome: 'Ana', email: 'a@x' }, { nome: 'Bruno', email: null }];
assert.deepEqual(onde(clientes, (c) => igual3(c.email, null)), []);
assert.deepEqual(onde(clientes, (c) => nao3(igual3(c.email, 'a@x'))), []);
assert.deepEqual(onde(clientes, (c) => ou3(igual3(c.email, 'a@x'), igual3(c.nome, 'Bruno'))).map((c) => c.nome), ['Ana', 'Bruno']);` }], solution: R`function e3(a, b) {
  if (a === false || b === false) return false;
  if (a === null || b === null) return null;
  return true;
}
function ou3(a, b) {
  if (a === true || b === true) return true;
  if (a === null || b === null) return null;
  return false;
}
function nao3(a) {
  return a === null ? null : !a;
}
function igual3(a, b) {
  if (a === null || b === null) return null;
  return a === b;
}
function onde(linhas, predicado) {
  return linhas.filter((l) => predicado(l) === true);
}
`, explanation: 'O WHERE do SQL só deixa passar o verdadeiro; falso e desconhecido são descartados. É por isso que "email = NULL" nunca devolve linhas e que NOT (email = x) também não devolve as linhas com email nulo.' }
],
'sqe-02': [
  { id: 'sqe-02-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Por que SELECT nome AS n FROM produtos WHERE n = \'Caneta\' falha com "column n does not exist"?', options: ['O alias n é uma palavra reservada', 'O WHERE é avaliado antes de o SELECT criar o alias', 'AS só funciona com ORDER BY', 'A tabela não tem a coluna nome'], answer: 1, explanation: 'Ordem lógica: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. No ORDER BY o alias já existe (medido: ORDER BY n funcionou).' },
  { id: 'sqe-02-e2', type: 'trace', difficulty: 2, points: 10, prompt: 'Produtos (nome, preço): Caneta 3,50; Caderno 18,90; Mochila 120,00; Garrafa 45,00; Lápis 2,00. Rastreie a consulta.', code: 'SELECT nome FROM produtos\nORDER BY preco DESC\nLIMIT 2 OFFSET 1;', lang: 'sql', steps: [{ q: 'Qual produto é pulado pelo OFFSET 1?', answers: ['Mochila'] }, { q: 'Qual o primeiro produto devolvido?', answers: ['Garrafa'] }, { q: 'Qual o segundo produto devolvido?', answers: ['Caderno'] }], explanation: 'Ordenado por preço decrescente: Mochila, Garrafa, Caderno, Caneta, Lápis. Pula 1 e leva 2 (medido).' },
  { id: 'sqe-02-e3', type: 'tf', difficulty: 2, points: 10, prompt: 'preco BETWEEN 3.5 AND 45 inclui os produtos de preço 3,50 e 45,00.', answer: true, explanation: 'BETWEEN é inclusivo nos dois extremos (medido: Caneta, Caderno e Garrafa).' },
  { id: 'sqe-02-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'A intenção é "papelaria barata OU qualquer acessório". Clique na linha com o problema de precedência.', code: 'SELECT nome\nFROM produtos\nWHERE categoria = \'papelaria\' AND preco < 10\n   OR categoria = \'acessorios\' AND preco > 100\n   OR preco = 45;', answer: 3, explanation: 'AND tem precedência sobre OR, então a condição não significa "qualquer acessório": só acessórios acima de 100. Use parênteses e escreva a condição desejada.' },
  { id: 'sqe-02-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique por que LIMIT sem ORDER BY é arriscado e por que OFFSET grande é lento. Proponha a alternativa para paginar uma lista longa.', model: 'Sem ORDER BY o banco não garante nenhuma ordem, então "as primeiras n linhas" pode mudar entre execuções e a paginação pode repetir ou pular itens. OFFSET grande obriga o banco a ler e descartar todas as linhas puladas, e o custo cresce com o deslocamento. A alternativa é a paginação por chave (keyset): ordenar por uma coluna única e indexada e pedir WHERE id > último_id ORDER BY id LIMIT n, que usa o índice e tem custo estável.', rubric: ['Explica que sem ORDER BY a ordem é indefinida', 'Explica que o OFFSET lê e descarta as linhas puladas', 'Descreve a paginação por chave com WHERE e ORDER BY', 'Cita a necessidade de uma coluna única e ordenável'], explanation: 'Paginação confiável exige ordenação determinística; paginação eficiente usa a chave.' },
  { id: 'sqe-02-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele um §SELECT§ sobre uma lista de objetos. Implemente §consultar(linhas, opcoes)§ com §opcoes§ = §{ onde, ordenarPor, limite, deslocamento }§. §onde§ é uma função (linha → boolean) opcional. §ordenarPor§ é uma lista de §{ coluna, desc }§: ordene por cada coluna em sequência; **NULL é o maior valor** (como no PostgreSQL: vem por último em ordem crescente e primeiro em decrescente). §deslocamento§ (padrão 0) e §limite§ (sem limite se ausente) funcionam como OFFSET e LIMIT, **depois** de filtrar e ordenar. Não altere o array original; devolva as linhas (os mesmos objetos).', lang: 'javascript', starter: 'function consultar(linhas, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Filtre, depois ordene uma cópia, depois aplique slice.', 'Escreva uma função de comparação que trate null como maior que qualquer valor.', 'Em ordem decrescente, inverta o sinal da comparação (inclusive para null).'], tests: [{ name: 'filtra, ordena e pagina', code: R`const p = [{ nome: 'Caneta', preco: 3.5 }, { nome: 'Caderno', preco: 18.9 }, { nome: 'Mochila', preco: 120 }, { nome: 'Garrafa', preco: 45 }, { nome: 'Lápis', preco: 2 }];
const r = consultar(p, { ordenarPor: [{ coluna: 'preco', desc: true }], limite: 2, deslocamento: 1 });
assert.deepEqual(r.map((x) => x.nome), ['Garrafa', 'Caderno']);
const r2 = consultar(p, { onde: (x) => x.preco < 10, ordenarPor: [{ coluna: 'preco', desc: true }] });
assert.deepEqual(r2.map((x) => x.nome), ['Caneta', 'Lápis']);` }, { name: 'NULL é o maior valor', code: R`const c = [{ nome: 'Ana', cidade: 'POA' }, { nome: 'Diego', cidade: null }, { nome: 'Bruno', cidade: 'Caxias' }];
assert.deepEqual(consultar(c, { ordenarPor: [{ coluna: 'cidade' }] }).map((x) => x.nome), ['Bruno', 'Ana', 'Diego']);
assert.deepEqual(consultar(c, { ordenarPor: [{ coluna: 'cidade', desc: true }] }).map((x) => x.nome), ['Diego', 'Ana', 'Bruno']);` }, { name: 'várias colunas e imutabilidade', code: R`const d = [{ a: 2, b: 'x' }, { a: 1, b: 'z' }, { a: 2, b: 'a' }];
const copia = JSON.stringify(d);
const r = consultar(d, { ordenarPor: [{ coluna: 'a' }, { coluna: 'b', desc: true }] });
assert.deepEqual(r.map((x) => x.a + x.b), ['1z', '2x', '2a']);
assert.equal(JSON.stringify(d), copia);
assert.deepEqual(consultar(d).length, 3);` }], solution: R`function consultar(linhas, opcoes = {}) {
  const { onde, ordenarPor = [], limite, deslocamento = 0 } = opcoes;
  let r = onde ? linhas.filter(onde) : linhas.slice();
  const cmp = (x, y) => {
    if (x === null && y === null) return 0;
    if (x === null) return 1;
    if (y === null) return -1;
    return x < y ? -1 : x > y ? 1 : 0;
  };
  if (ordenarPor.length) {
    r = r.slice().sort((a, b) => {
      for (const { coluna, desc } of ordenarPor) {
        const c = cmp(a[coluna], b[coluna]);
        if (c !== 0) return desc ? -c : c;
      }
      return 0;
    });
  }
  return limite === undefined ? r.slice(deslocamento) : r.slice(deslocamento, deslocamento + limite);
}
`, explanation: 'A ordem de aplicação é a do SQL: filtrar (WHERE), ordenar (ORDER BY) e só então paginar (OFFSET e LIMIT). Tratar NULL como o maior valor reproduz o comportamento do PostgreSQL (NULLS LAST em ordem crescente).' }
],
'sqe-03': [
  { id: 'sqe-03-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual hábito evita o acidente "UPDATE sem WHERE"?', options: ['Confiar na revisão visual do comando', 'Rodar o comando dentro de BEGIN, conferir com RETURNING ou SELECT e só então COMMIT', 'Usar apenas DELETE', 'Executar sempre em produção primeiro'], answer: 1, explanation: 'A transação permite desfazer; o RETURNING mostra o que mudou (medido: após ROLLBACK a contagem voltou a 4).' },
  { id: 'sqe-03-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Apagar um cliente que ainda tem pedidos, com chave estrangeira padrão (sem CASCADE), é recusado pelo banco.', answer: true, explanation: 'Medido: violates foreign key constraint "pedidos_cliente_id_fkey". CASCADE apagaria os pedidos em cadeia.' },
  { id: 'sqe-03-e3', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete o upsert: se o e-mail já existir, atualize o nome com o valor que tentou entrar.', code: 'INSERT INTO clientes (id, nome, email) VALUES (8, \'Gil2\', \'gil@ex.com\')\nON [[0]] (email) DO [[1]] SET nome = EXCLUDED.nome;', answers: [['CONFLICT'], ['UPDATE']], explanation: 'ON CONFLICT exige a restrição única como alvo; EXCLUDED é a linha que tentou entrar (medido: o id 7 foi atualizado para Gil2).' },
  { id: 'sqe-03-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que pode apagar a tabela inteira.', code: 'BEGIN;\nUPDATE produtos SET preco = preco * 1.1 WHERE categoria = \'papelaria\';\nDELETE FROM itens\nWHERE quantidade > 0\n   OR true;\nCOMMIT;', answer: 5, explanation: 'OR true torna a condição sempre verdadeira, apagando todos os itens. Sem conferência, o COMMIT consolida o desastre.' },
  { id: 'sqe-03-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare exclusão física (DELETE) e exclusão lógica (coluna removido_em). Cite vantagens, custos e quando cada uma é adequada.', model: 'A exclusão física remove a linha e libera espaço; é simples e boa para dados temporários ou quando a legislação exige o apagamento. A exclusão lógica marca a linha como removida, preserva histórico e permite desfazer, mas exige filtrar em toda consulta (ou usar visões), complica restrições de unicidade (um e-mail removido ainda existe) e acumula dados. Em dados de negócio com auditoria, usa-se a exclusão lógica ou uma tabela de histórico; para logs temporários, a física.', rubric: ['Cita preservação de histórico e reversão na exclusão lógica', 'Cita o custo de filtrar sempre e o impacto em UNIQUE', 'Cita casos para exclusão física (temporários, exigência legal)', 'Faz uma recomendação por contexto'], explanation: 'A escolha depende de auditoria, privacidade e desempenho.' },
  { id: 'sqe-03-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele o §INSERT ... ON CONFLICT§. Implemente §upsert(linhas, nova, chave, modo)§: §linhas§ é um array de objetos (**não o altere**), §nova§ é a linha a inserir, §chave§ é a coluna única e §modo§ é §"nada"§ ou §"atualizar"§. Se não existir linha com o mesmo valor em §chave§, insira §nova§ no fim. Se existir: §"nada"§ não altera nada; §"atualizar"§ **mescla** os campos de §nova§ sobre a linha existente (mantendo a posição). Devolva §{ linhas, afetadas }§, onde §afetadas§ é 1 se houve inserção ou atualização e 0 caso contrário. Se §modo§ for inválido, lance §Error("modo inválido: MODO")§.', lang: 'javascript', starter: 'function upsert(linhas, nova, chave, modo) {\n  // seu código aqui\n}\n', hints: ['Procure o índice com findIndex pela chave.', 'Crie novos arrays e objetos em vez de alterar os existentes.', 'Valide o modo no começo.'], tests: [{ name: 'insere quando não há conflito', code: R`const base = [{ id: 7, email: 'gil@ex.com', nome: 'Gil' }];
const r = upsert(base, { id: 8, email: 'ana@ex.com', nome: 'Ana' }, 'email', 'nada');
assert.equal(r.afetadas, 1);
assert.deepEqual(r.linhas.map((x) => x.id), [7, 8]);
assert.equal(base.length, 1);` }, { name: 'do nothing e do update', code: R`const base = [{ id: 7, email: 'gil@ex.com', nome: 'Gil' }];
const a = upsert(base, { id: 8, email: 'gil@ex.com', nome: 'Gil2' }, 'email', 'nada');
assert.equal(a.afetadas, 0);
assert.deepEqual(a.linhas, [{ id: 7, email: 'gil@ex.com', nome: 'Gil' }]);
const b = upsert(base, { id: 8, email: 'gil@ex.com', nome: 'Gil2' }, 'email', 'atualizar');
assert.equal(b.afetadas, 1);
assert.deepEqual(b.linhas, [{ id: 8, email: 'gil@ex.com', nome: 'Gil2' }]);
assert.deepEqual(base, [{ id: 7, email: 'gil@ex.com', nome: 'Gil' }]);` }, { name: 'mescla campos e valida o modo', code: R`const base = [{ id: 1, k: 'a', x: 1, y: 2 }];
const r = upsert(base, { k: 'a', y: 9 }, 'k', 'atualizar');
assert.deepEqual(r.linhas, [{ id: 1, k: 'a', x: 1, y: 9 }]);
assert.throws(() => upsert(base, { k: 'a' }, 'k', 'talvez'), 'modo inválido: talvez');` }], solution: R`function upsert(linhas, nova, chave, modo) {
  if (modo !== 'nada' && modo !== 'atualizar') throw new Error('modo inválido: ' + modo);
  const i = linhas.findIndex((l) => l[chave] === nova[chave]);
  if (i < 0) return { linhas: [...linhas, { ...nova }], afetadas: 1 };
  if (modo === 'nada') return { linhas: linhas.slice(), afetadas: 0 };
  const copia = linhas.slice();
  copia[i] = { ...linhas[i], ...nova };
  return { linhas: copia, afetadas: 1 };
}
`, explanation: 'O upsert é atômico no banco, evitando a corrida "verificar e depois inserir". O modelo mostra as duas saídas: DO NOTHING ignora e DO UPDATE mescla os campos da linha que tentou entrar (EXCLUDED).' }
],
'sqe-04': [
  { id: 'sqe-04-e1', type: 'trace', difficulty: 2, points: 10, prompt: 'Clientes: Ana(1), Bruno(2), Carla(3), Diego(4). Pedidos: (10, cliente 1), (11, cliente 1), (12, cliente 2), (13, cliente 3).', code: 'SELECT c.nome, p.id\nFROM clientes c\nLEFT JOIN pedidos p ON p.cliente_id = c.id;', lang: 'sql', steps: [{ q: 'Quantas linhas o resultado tem?', answers: ['5'] }, { q: 'Qual cliente aparece com pedido NULL?', answers: ['Diego'] }], explanation: 'O LEFT JOIN preserva todos os clientes: 4 casamentos (Ana tem 2) mais Diego sem pedido (medido: 5 linhas).' },
  { id: 'sqe-04-e2', type: 'mc', difficulty: 3, points: 10, prompt: 'Qual consulta lista todos os clientes e, só para os que têm, o pedido pago (os demais com NULL)?', options: ['LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.status = \'pago\'', 'LEFT JOIN pedidos p ON p.cliente_id = c.id AND p.status = \'pago\'', 'INNER JOIN pedidos p ON p.cliente_id = c.id AND p.status = \'pago\'', 'JOIN pedidos p USING (id) WHERE p.status = \'pago\''], answer: 1, explanation: 'O filtro no ON mantém os 4 clientes; no WHERE, o LEFT vira INNER e restam 2 (medido).' },
  { id: 'sqe-04-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que impede a consulta de achar clientes sem pedidos.', code: 'SELECT c.nome\nFROM clientes c\nLEFT JOIN pedidos p ON p.cliente_id = c.id\nWHERE p.status = \'aberto\'\n   OR c.id = 0;', answer: 4, explanation: 'Para o anti-join o teste deve ser p.id IS NULL (uma coluna da tabela opcional que nunca é nula nos casamentos); a condição de status exclui justamente quem não tem pedido.' },
  { id: 'sqe-04-e4', type: 'tf', difficulty: 2, points: 5, prompt: 'JOIN sem a palavra INNER ou LEFT é um INNER JOIN.', answer: true, explanation: 'JOIN equivale a INNER JOIN.' },
  { id: 'sqe-04-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Uma pessoa afirma que "NATURAL JOIN é prático". Dê dois motivos para evitar e uma alternativa melhor, citando o que foi medido com USING e NATURAL JOIN em clientes e pedidos.', model: 'O NATURAL JOIN usa automaticamente todas as colunas de mesmo nome, então seu significado muda se alguém adicionar uma coluna homônima, e pode juntar colunas sem relação. Na loja, clientes e pedidos têm ambos uma coluna id; clientes JOIN pedidos USING (id) e pedidos NATURAL JOIN clientes devolveram 0 linhas, porque juntaram o id do cliente com o id do pedido. A alternativa é o ON explícito pela chave estrangeira (p.cliente_id = c.id), que documenta a intenção e não quebra com novas colunas.', rubric: ['Explica que usa todas as colunas homônimas e muda com o esquema', 'Cita o resultado de 0 linhas medido', 'Cita o risco de juntar colunas sem relação', 'Propõe ON explícito pela chave estrangeira'], explanation: 'Explícito é melhor que implícito em JOINs.' },
  { id: 'sqe-04-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele os JOINs sobre arrays de objetos. Implemente §juntar(tipo, esq, dir, on, colunasDir)§. §tipo§ é §"inner"§ ou §"left"§; §on§ é uma função §(l, r) => boolean§; §colunasDir§ é a lista de nomes das colunas da direita (usada para preencher §null§ quando não há correspondência no LEFT). O resultado é um array de objetos §{ ...l, ...r }§ (colunas da esquerda primeiro, depois as da direita), na ordem das linhas da esquerda e, para cada uma, na ordem das linhas da direita. Para §"left"§, a linha da esquerda sem correspondência sai com todas as §colunasDir§ iguais a §null§. Tipo inválido lança §Error("tipo inválido: TIPO")§.', lang: 'javascript', starter: 'function juntar(tipo, esq, dir, on, colunasDir) {\n  // seu código aqui\n}\n', hints: ['Para cada linha da esquerda, filtre as linhas da direita com on.', 'Se não houver correspondência e o tipo for left, gere o objeto com nulls.', 'Use Object.fromEntries(colunasDir.map((c) => [c, null])).'], tests: [{ name: 'inner e left', code: R`const c = [{ cid: 1, nome: 'Ana' }, { cid: 2, nome: 'Bruno' }, { cid: 4, nome: 'Diego' }];
const p = [{ pid: 10, cliente: 1 }, { pid: 11, cliente: 1 }, { pid: 12, cliente: 2 }];
const on = (l, r) => r.cliente === l.cid;
assert.deepEqual(juntar('inner', c, p, on, ['pid', 'cliente']).map((x) => x.nome + x.pid), ['Ana10', 'Ana11', 'Bruno12']);
const l = juntar('left', c, p, on, ['pid', 'cliente']);
assert.equal(l.length, 4);
assert.deepEqual(l[3], { cid: 4, nome: 'Diego', pid: null, cliente: null });` }, { name: 'filtro no ON x filtro no WHERE', code: R`const c = [{ cid: 1, nome: 'Ana' }, { cid: 3, nome: 'Carla' }];
const p = [{ pid: 10, cliente: 1, status: 'pago' }, { pid: 13, cliente: 3, status: 'cancelado' }];
const cols = ['pid', 'cliente', 'status'];
const noOn = juntar('left', c, p, (l, r) => r.cliente === l.cid && r.status === 'pago', cols);
assert.deepEqual(noOn.map((x) => x.nome + ':' + x.pid), ['Ana:10', 'Carla:null']);
const noWhere = juntar('left', c, p, (l, r) => r.cliente === l.cid, cols).filter((x) => x.status === 'pago');
assert.deepEqual(noWhere.map((x) => x.nome), ['Ana']);` }, { name: 'tipo inválido', code: R`assert.throws(() => juntar('cross', [], [], () => true, []), 'tipo inválido: cross');
assert.deepEqual(juntar('inner', [], [{ a: 1 }], () => true, ['a']), []);` }], solution: R`function juntar(tipo, esq, dir, on, colunasDir) {
  if (tipo !== 'inner' && tipo !== 'left') throw new Error('tipo inválido: ' + tipo);
  const nulos = Object.fromEntries(colunasDir.map((c) => [c, null]));
  const out = [];
  for (const l of esq) {
    const casam = dir.filter((r) => on(l, r));
    if (casam.length) casam.forEach((r) => out.push({ ...l, ...r }));
    else if (tipo === 'left') out.push({ ...l, ...nulos });
  }
  return out;
}
`, explanation: 'O modelo é um laço aninhado: para cada linha da esquerda, procura as da direita que satisfazem o ON. O LEFT preserva a linha sem correspondência com NULL; filtrar depois (WHERE) descarta as linhas com NULL e o LEFT vira INNER.' }
],
'sqe-05': [
  { id: 'sqe-05-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'A tabela pedidos tem 4 linhas e itens tem 6. Quantas linhas tem pedidos JOIN itens ON itens.pedido_id = pedidos.id, se todo item tem pedido e todo pedido tem item?', options: ['4', '6', '10', '24'], answer: 1, explanation: 'Cada linha do lado "muitos" casa com uma do lado "um": o resultado tem uma linha por item (medido: 6).' },
  { id: 'sqe-05-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Usar SELECT DISTINCT é a forma correta de corrigir uma soma duplicada causada por um JOIN um-para-muitos.', answer: false, explanation: 'DISTINCT remove linhas idênticas, não resolve a granularidade e pode colapsar itens legítimos com o mesmo valor. Agregue antes de juntar.' },
  { id: 'sqe-05-e3', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a pergunta ao tipo de JOIN.', pairs: [['Todos os clientes, com pedidos se houver', 'LEFT JOIN'], ['O que existe só em um dos lados de duas fontes', 'FULL JOIN com filtros de NULL'], ['Todas as combinações de datas e produtos', 'CROSS JOIN'], ['Pares de clientes da mesma cidade', 'Auto-junção com a.id < b.id']], explanation: 'A pergunta de negócio escolhe o JOIN.' },
  { id: 'sqe-05-e4', type: 'trace', difficulty: 2, points: 10, prompt: 'Consulta sobre pedidos juntos aos itens, agrupada por status. Dados: pago (pedidos 10 e 12, com 2 itens cada), aberto (pedido 11, 1 item), cancelado (pedido 13, 1 item).', code: 'SELECT ped.status, count(*), count(DISTINCT ped.id)\nFROM pedidos ped JOIN itens i ON i.pedido_id = ped.id\nGROUP BY ped.status;', lang: 'sql', steps: [{ q: 'Qual o valor de count(*) para o status pago?', answers: ['4'] }, { q: 'Qual o valor de count(DISTINCT ped.id) para pago?', answers: ['2'] }], explanation: 'count(*) conta linhas de item (4); count(DISTINCT) conta pedidos (2), como medido no PostgreSQL.' },
  { id: 'sqe-05-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Um relatório soma o frete (coluna do pedido) depois de juntar pedidos com itens e o total sai maior do que o esperado. Explique a causa e dê duas formas de corrigir.', model: 'O frete está no nível do pedido, mas o JOIN com itens repete cada pedido uma vez por item; ao somar a coluna do pedido, o frete é contado várias vezes. Correções: somar o frete antes de juntar (agregar pedidos em uma CTE ou subconsulta e juntar só o necessário), ou calcular o total do frete diretamente sobre a tabela de pedidos sem juntar com itens; também é possível somar apenas pedidos distintos com uma subconsulta. DISTINCT não é correção segura, pois dois pedidos com o mesmo frete seriam colapsados.', rubric: ['Identifica a repetição do pedido por item', 'Propõe agregar antes de juntar ou somar na tabela de pedidos', 'Rejeita DISTINCT como solução geral', 'Menciona a granularidade do resultado'], explanation: 'O problema é de granularidade, não de sintaxe.' },
  { id: 'sqe-05-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele a **duplicação por JOIN**. Implemente §somarComDuplicacao(pedidos, itens, campo)§, onde §pedidos§ são §{ id, ...campos }§ e §itens§ são §{ pedidoId, ... }§. Devolva §{ linhasDoJoin, errada, correta }§: §linhasDoJoin§ é o número de linhas do INNER JOIN por §pedidos.id = itens.pedidoId§; §errada§ é a soma de §pedido[campo]§ sobre **todas as linhas do JOIN** (como um SUM após o JOIN); §correta§ é a soma de §pedido[campo]§ **uma vez por pedido** que tenha pelo menos um item. Valores ausentes contam como 0.', lang: 'javascript', starter: 'function somarComDuplicacao(pedidos, itens, campo) {\n  // seu código aqui\n}\n', hints: ['Para cada pedido, conte quantos itens casam.', 'errada = soma de campo * quantidade de itens; correta = soma de campo para pedidos com itens > 0.', 'Trate undefined com (p[campo] || 0).'], tests: [{ name: 'frete duplicado', code: R`const pedidos = [{ id: 10, frete: 20 }, { id: 11, frete: 15 }, { id: 12, frete: 10 }, { id: 13, frete: 5 }];
const itens = [{ pedidoId: 10 }, { pedidoId: 10 }, { pedidoId: 11 }, { pedidoId: 12 }, { pedidoId: 12 }, { pedidoId: 13 }];
const r = somarComDuplicacao(pedidos, itens, 'frete');
assert.deepEqual(r, { linhasDoJoin: 6, errada: 40 + 15 + 20 + 5, correta: 50 });` }, { name: 'pedido sem item não entra no join', code: R`const pedidos = [{ id: 1, v: 100 }, { id: 2, v: 50 }];
const itens = [{ pedidoId: 1 }, { pedidoId: 1 }, { pedidoId: 1 }];
assert.deepEqual(somarComDuplicacao(pedidos, itens, 'v'), { linhasDoJoin: 3, errada: 300, correta: 100 });` }, { name: 'campo ausente e vazio', code: R`assert.deepEqual(somarComDuplicacao([{ id: 1 }], [{ pedidoId: 1 }, { pedidoId: 1 }], 'x'), { linhasDoJoin: 2, errada: 0, correta: 0 });
assert.deepEqual(somarComDuplicacao([], [], 'x'), { linhasDoJoin: 0, errada: 0, correta: 0 });` }], solution: R`function somarComDuplicacao(pedidos, itens, campo) {
  let linhas = 0, errada = 0, correta = 0;
  for (const p of pedidos) {
    const n = itens.filter((i) => i.pedidoId === p.id).length;
    const v = p[campo] || 0;
    linhas += n;
    errada += v * n;
    if (n > 0) correta += v;
  }
  return { linhasDoJoin: linhas, errada, correta };
}
`, explanation: 'Cada pedido aparece no JOIN uma vez por item; somar uma coluna do pedido depois do JOIN multiplica o valor pelo número de itens. A forma correta agrega no nível do pedido (antes de juntar).' }
]
};
