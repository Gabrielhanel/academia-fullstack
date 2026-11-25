// C3.1 — SQL essencial: exercícios das aulas 6 a 9, prova final e projeto integrador.
const R = String.raw;

export const exsetsB = {
'sqe-06': [
  { id: 'sqe-06-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual a diferença entre WHERE e HAVING?', options: ['Nenhuma: são sinônimos', 'WHERE filtra linhas antes do agrupamento; HAVING filtra grupos depois das agregações', 'WHERE só funciona com JOIN', 'HAVING filtra colunas'], answer: 1, explanation: 'Medido: HAVING sum(...) > 100 devolveu Ana e Bruno; funções de agregação não são aceitas no WHERE.' },
  { id: 'sqe-06-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'A soma (sum) de uma coluna em um conjunto sem nenhuma linha devolve 0.', answer: false, explanation: 'sum de nenhuma linha devolve NULL; use coalesce(sum(x), 0). count devolve 0 (medido).' },
  { id: 'sqe-06-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que faz o PostgreSQL recusar a consulta.', code: 'SELECT nome, categoria, count(*)\nFROM produtos\nGROUP BY categoria\nORDER BY categoria;', answer: 1, explanation: 'nome não é agregado nem está no GROUP BY: o banco não sabe qual nome mostrar para o grupo (medido: column "produtos.nome" must appear in the GROUP BY clause).' },
  { id: 'sqe-06-e4', type: 'trace', difficulty: 2, points: 10, prompt: 'Clientes: Ana (2 pedidos), Bruno (1), Carla (1), Diego (0 pedidos). Consulta com LEFT JOIN de clientes com pedidos, agrupada por cliente.', code: 'SELECT c.nome, count(p.id) AS a, count(*) AS b\nFROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id\nGROUP BY c.id, c.nome;', lang: 'sql', steps: [{ q: 'Quanto vale a para Diego?', answers: ['0'] }, { q: 'Quanto vale b para Diego?', answers: ['1'] }], explanation: 'count(p.id) ignora o NULL do LEFT JOIN (0); count(*) conta a linha do cliente (1), o que está errado para contar pedidos (medido).' },
  { id: 'sqe-06-e5', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a contagem condicional de produtos caros por categoria.', code: 'SELECT categoria, count(*) [[0]] (WHERE preco > 10) AS caros\nFROM produtos\n[[1]] BY categoria;', answers: [['FILTER'], ['GROUP']], explanation: 'FILTER restringe as linhas de uma agregação dentro do grupo (medido: acessorios 2, papelaria 1).' },
  { id: 'sqe-06-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele §GROUP BY§ com agregações. Implemente §agregar(linhas, opcoes)§ com §opcoes§ = §{ por, medidas, having }§. §por§ é a lista de colunas de agrupamento (os grupos saem na **ordem da primeira aparição**). §medidas§ é um objeto §{ nome: { fn, coluna?, distinto? } }§ com §fn§ em §"count"§, §"sum"§, §"avg"§, §"min"§ ou §"max"§. As agregações **ignoram §null§ e §undefined§**; §count§ sem §coluna§ conta linhas (como §count(*)§). §distinto: true§ considera valores distintos. Para um grupo sem valores não nulos, §sum§, §avg§, §min§ e §max§ valem §null§ e §count§ vale 0. §having§ (opcional) é uma função aplicada à linha de resultado. Cada linha de saída é §{ ...colunas de por, ...medidas }§, nessa ordem. §por§ vazio gera um único grupo com todas as linhas (e uma linha de saída mesmo sem linhas de entrada). §fn§ desconhecida lança §Error("função desconhecida: FN")§.', lang: 'javascript', starter: 'function agregar(linhas, opcoes) {\n  // seu código aqui\n}\n', hints: ['Monte um Map de chave JSON para as linhas do grupo.', 'Escreva uma função calcular(fn, valores, distinto) que já recebe os valores não nulos.', 'Aplique having depois de calcular as medidas.'], tests: [{ name: 'resumo por categoria', code: R`const p = [{ categoria: 'papelaria', preco: 3.5 }, { categoria: 'papelaria', preco: 18.9 }, { categoria: 'acessorios', preco: 120 }, { categoria: 'papelaria', preco: 2 }, { categoria: 'acessorios', preco: 45 }];
const r = agregar(p, { por: ['categoria'], medidas: { n: { fn: 'count' }, maior: { fn: 'max', coluna: 'preco' }, soma: { fn: 'sum', coluna: 'preco' } } });
assert.deepEqual(r, [{ categoria: 'papelaria', n: 3, maior: 18.9, soma: 24.4 }, { categoria: 'acessorios', n: 2, maior: 120, soma: 165 }]);` }, { name: 'NULL, distinto e having', code: R`const c = [{ cidade: 'POA', gasto: 10 }, { cidade: 'POA', gasto: null }, { cidade: 'Caxias', gasto: null }, { cidade: 'POA', gasto: 10 }];
const r = agregar(c, { por: ['cidade'], medidas: { linhas: { fn: 'count' }, comGasto: { fn: 'count', coluna: 'gasto' }, distintos: { fn: 'count', coluna: 'gasto', distinto: true }, soma: { fn: 'sum', coluna: 'gasto' }, media: { fn: 'avg', coluna: 'gasto' } } });
assert.deepEqual(r[0], { cidade: 'POA', linhas: 3, comGasto: 2, distintos: 1, soma: 20, media: 10 });
assert.deepEqual(r[1], { cidade: 'Caxias', linhas: 1, comGasto: 0, distintos: 0, soma: null, media: null });
const h = agregar(c, { por: ['cidade'], medidas: { n: { fn: 'count' } }, having: (l) => l.n > 1 });
assert.deepEqual(h, [{ cidade: 'POA', n: 3 }]);` }, { name: 'sem agrupamento e função inválida', code: R`assert.deepEqual(agregar([{ x: 2 }, { x: 4 }], { por: [], medidas: { m: { fn: 'avg', coluna: 'x' } } }), [{ m: 3 }]);
assert.deepEqual(agregar([], { por: [], medidas: { n: { fn: 'count' }, s: { fn: 'sum', coluna: 'x' } } }), [{ n: 0, s: null }]);
assert.throws(() => agregar([{ x: 1 }], { por: [], medidas: { m: { fn: 'mediana', coluna: 'x' } } }), 'função desconhecida: mediana');` }], solution: R`function agregar(linhas, opcoes) {
  const { por = [], medidas = {}, having } = opcoes;
  const grupos = new Map();
  for (const l of linhas) {
    const k = JSON.stringify(por.map((c) => l[c]));
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(l);
  }
  if (!por.length && !grupos.size) grupos.set('[]', []);
  const calc = (def, g) => {
    const { fn, coluna, distinto } = def;
    if (!['count', 'sum', 'avg', 'min', 'max'].includes(fn)) throw new Error('função desconhecida: ' + fn);
    let v = coluna === undefined ? g.map(() => 1) : g.map((l) => l[coluna]).filter((x) => x !== null && x !== undefined);
    if (distinto) v = [...new Set(v)];
    if (fn === 'count') return v.length;
    if (!v.length) return null;
    if (fn === 'sum') return v.reduce((a, b) => a + b, 0);
    if (fn === 'avg') return v.reduce((a, b) => a + b, 0) / v.length;
    if (fn === 'min') return v.reduce((a, b) => (b < a ? b : a));
    return v.reduce((a, b) => (b > a ? b : a));
  };
  const out = [];
  for (const g of grupos.values()) {
    const linha = {};
    por.forEach((c) => { linha[c] = g[0][c]; });
    for (const [nome, def] of Object.entries(medidas)) linha[nome] = calc(def, g);
    if (!having || having(linha)) out.push(linha);
  }
  return out;
}
`, explanation: 'O modelo reproduz as regras medidas: agregações ignoram NULL, count(*) conta linhas, sum de vazio é NULL e o HAVING filtra grupos já calculados. Somas de decimais em ponto flutuante podem ter ruído; em SQL use numeric.' }
],
'sqe-07': [
  { id: 'sqe-07-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual consulta lista com segurança os clientes sem pedidos mesmo que pedidos.cliente_id possa conter NULL?', options: ['WHERE id NOT IN (SELECT cliente_id FROM pedidos)', 'WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id)', 'WHERE id IN (SELECT cliente_id FROM pedidos)', 'WHERE id <> ALL (SELECT NULL)'], answer: 1, explanation: 'NOT IN devolve 0 linhas se a lista tiver NULL (medido); NOT EXISTS é seguro.' },
  { id: 'sqe-07-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma subconsulta correlacionada referencia colunas da consulta externa.', answer: true, explanation: 'É isso que a torna dependente da linha externa (medido: a média da categoria de cada produto).' },
  { id: 'sqe-07-e3', type: 'trace', difficulty: 3, points: 10, prompt: 'Considere os valores de preço: 3,50; 18,90; 120,00; 45,00; 2,00 (média 37,88).', code: 'SELECT nome FROM produtos\nWHERE preco > (SELECT avg(preco) FROM produtos);', lang: 'sql', steps: [{ q: 'Quantos produtos são devolvidos?', answers: ['2'] }, { q: 'Qual o mais caro devolvido?', answers: ['Mochila'] }], explanation: 'Só Mochila (120) e Garrafa (45) superam a média (medido).' },
  { id: 'sqe-07-e4', type: 'match', difficulty: 2, points: 10, prompt: 'Associe a necessidade ao melhor construto.', pairs: [['Filtrar por existência de relacionados sem duplicar linhas', 'EXISTS ou IN'], ['Trazer colunas da outra tabela', 'JOIN'], ['Ausência de relacionados com colunas anuláveis', 'NOT EXISTS'], ['Comparar com um valor agregado', 'Subconsulta escalar']], explanation: 'Cada construto tem seu uso natural.' },
  { id: 'sqe-07-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Explique em palavras por que x NOT IN (1, 2, NULL) nunca é verdadeiro e como corrigir uma consulta que sofre disso.', model: 'x NOT IN (1, 2, NULL) equivale a x <> 1 AND x <> 2 AND x <> NULL. A última comparação é desconhecida (NULL), e verdadeiro AND desconhecido é desconhecido; o WHERE só mantém linhas verdadeiras, então nunca passa ninguém. Correção: usar NOT EXISTS correlacionado, ou LEFT JOIN com IS NULL, ou filtrar os NULL da subconsulta (WHERE cliente_id IS NOT NULL) e declarar a coluna como NOT NULL quando fizer sentido.', rubric: ['Expande NOT IN em uma sequência de <> com AND', 'Explica que a comparação com NULL é desconhecida', 'Explica que o WHERE só mantém o verdadeiro', 'Propõe NOT EXISTS, anti-join ou filtro de NULL'], explanation: 'É a armadilha mais importante da aula.' },
  { id: 'sqe-07-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele §NOT IN§ x §NOT EXISTS§. Implemente §notIn3(valor, lista)§, que devolve §true§, §false§ ou §null§ (desconhecido) como o SQL: §false§ se §valor§ estiver na lista; senão §null§ se a lista contiver §null§ (ou se §valor§ for §null§ e a lista não for vazia); senão §true§ (lista vazia dá §true§). Implemente também §semCorrespondencia(chaves, referencias, metodo)§: §chaves§ é uma lista de ids, §referencias§ é a lista de valores da chave estrangeira (pode ter §null§) e §metodo§ é §"notIn"§ (mantém só quem tem §notIn3§ **exatamente §true§**) ou §"notExists"§ (mantém quem não aparece em §referencias§, ignorando §null§). Método inválido lança §Error("método inválido: M")§.', lang: 'javascript', starter: 'function notIn3(valor, lista) {\n  // seu código aqui\n}\nfunction semCorrespondencia(chaves, referencias, metodo) {\n}\n', hints: ['Primeiro a lista vazia (true), depois valor nulo (null), depois a presença (false).', 'Depois, se a lista tiver null, o resultado é null.', 'notIn filtra com notIn3(...) === true.'], tests: [{ name: 'lógica do NOT IN', code: R`assert.equal(notIn3(3, [1, 2]), true);
assert.equal(notIn3(2, [1, 2]), false);
assert.equal(notIn3(3, [1, 2, null]), null);
assert.equal(notIn3(2, [1, 2, null]), false);
assert.equal(notIn3(null, [1, 2]), null);
assert.equal(notIn3(null, []), true);
assert.equal(notIn3(3, []), true);` }, { name: 'clientes sem pedidos', code: R`const clientes = [1, 2, 3, 4];
assert.deepEqual(semCorrespondencia(clientes, [1, 1, 2, 3], 'notIn'), [4]);
assert.deepEqual(semCorrespondencia(clientes, [1, 1, 2, 3], 'notExists'), [4]);` }, { name: 'a armadilha do NULL', code: R`const clientes = [1, 2, 3, 4];
const refs = [1, 2, 3, null];
assert.deepEqual(semCorrespondencia(clientes, refs, 'notIn'), []);
assert.deepEqual(semCorrespondencia(clientes, refs, 'notExists'), [4]);
assert.throws(() => semCorrespondencia(clientes, refs, 'join'), 'método inválido: join');` }], solution: R`function notIn3(valor, lista) {
  if (lista.length === 0) return true;
  if (valor === null) return null;
  if (lista.includes(valor)) return false;
  if (lista.includes(null)) return null;
  return true;
}
function semCorrespondencia(chaves, referencias, metodo) {
  if (metodo === 'notIn') return chaves.filter((k) => notIn3(k, referencias) === true);
  if (metodo === 'notExists') return chaves.filter((k) => !referencias.some((r) => r !== null && r === k));
  throw new Error('método inválido: ' + metodo);
}
`, explanation: 'O modelo mostra por que NOT IN falha com NULL: o resultado vira desconhecido e o WHERE o descarta. NOT EXISTS testa a existência de uma linha casando, sem comparações com NULL.' }
],
'sqe-08': [
  { id: 'sqe-08-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual o papel da parte recursiva de uma CTE recursiva?', options: ['Definir o nome da CTE', 'Referenciar a própria CTE para gerar novas linhas até não haver mais', 'Ordenar o resultado', 'Fazer o commit da transação'], answer: 1, explanation: 'O caso base gera as linhas iniciais; a parte recursiva usa a própria CTE para gerar as próximas, até não produzir linhas novas.' },
  { id: 'sqe-08-e2', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma CTE recursiva sem condição de parada em um grafo com ciclo pode rodar indefinidamente.', answer: true, explanation: 'Sem parada, a recursão continua a gerar caminhos; proteja com limite de nível, caminho acumulado ou CYCLE.' },
  { id: 'sqe-08-e3', type: 'trace', difficulty: 2, points: 10, prompt: 'Categorias: 1 Eletrônicos (raiz); 2 Celulares (pai 1); 3 Smartphones (pai 2); 4 Livros (raiz). Consulta recursiva a partir das raízes.', code: 'WITH RECURSIVE arvore AS (\n  SELECT id, 0 AS nivel FROM categorias WHERE pai IS NULL\n  UNION ALL\n  SELECT c.id, a.nivel + 1 FROM categorias c JOIN arvore a ON c.pai = a.id\n)\nSELECT id, nivel FROM arvore ORDER BY nivel, id;', lang: 'sql', steps: [{ q: 'Quantas linhas tem o resultado?', answers: ['4'] }, { q: 'Qual o nível de Smartphones (id 3)?', answers: ['2'] }], explanation: 'Raízes no nível 0 (ids 1 e 4), Celulares no 1 e Smartphones no 2 (medido).' },
  { id: 'sqe-08-e4', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha cuja ausência torna a recursão potencialmente infinita.', code: 'WITH RECURSIVE contagem(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM contagem\n)\nSELECT sum(n) FROM contagem;', answer: 4, explanation: 'Falta a condição de parada (WHERE n < 5, por exemplo); a parte recursiva gera linhas sem fim.' },
  { id: 'sqe-08-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Compare CTE, subconsulta, visão e tabela temporária: quando usar cada uma?', model: 'A subconsulta é curta e local, boa para um valor ou filtro simples. A CTE nomeia etapas de uma única consulta, melhora a leitura, permite reuso dentro da consulta e oferece recursão. A visão salva uma consulta no banco para reuso por várias consultas e controle de acesso. A tabela temporária guarda dados reais, aceita índices e serve a processos longos ou etapas caras reutilizadas várias vezes. A escolha depende do escopo (consulta, sessão, banco) e do custo; o desempenho deve ser medido com EXPLAIN.', rubric: ['Descreve o escopo de cada uma', 'Associa a CTE à legibilidade e à recursão', 'Associa a visão ao reuso e à segurança', 'Cita medir com EXPLAIN em vez de supor'], explanation: 'São ferramentas de organização com escopos diferentes.' },
  { id: 'sqe-08-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Modele uma **CTE recursiva sobre um grafo**. Implemente §caminhos(arestas, origem, opcoes)§: §arestas§ é uma lista de §{ de, para }§; a partir de §origem§ (nível 0), gere **todos os caminhos** (como §UNION ALL§), nível a nível. Cada resultado é §{ nivel, caminho }§ com §caminho§ como texto §"a>b>c"§. **Não estenda** um caminho para um nó que já esteja nele (proteção contra ciclos) e, se §opcoes.maxNivel§ existir, não gere níveis maiores. A ordem é por nível e, dentro do nível, a ordem em que os caminhos foram gerados (caminhos do nível anterior em ordem, e, para cada um, as arestas na ordem de §arestas§).', lang: 'javascript', starter: 'function caminhos(arestas, origem, opcoes = {}) {\n  // seu código aqui\n}\n', hints: ['Comece com [{ nivel: 0, nos: [origem] }].', 'A cada rodada, estenda cada caminho do último nível pelas arestas que saem do último nó.', 'Ignore a extensão quando o nó destino já está em nos.'], tests: [{ name: 'árvore simples', code: R`const arestas = [{ de: 'Eletrônicos', para: 'Celulares' }, { de: 'Celulares', para: 'Smartphones' }, { de: 'Livros', para: 'Ficção' }];
assert.deepEqual(caminhos(arestas, 'Eletrônicos'), [{ nivel: 0, caminho: 'Eletrônicos' }, { nivel: 1, caminho: 'Eletrônicos>Celulares' }, { nivel: 2, caminho: 'Eletrônicos>Celulares>Smartphones' }]);` }, { name: 'grafo com ciclo', code: R`const arestas = [{ de: '1', para: '2' }, { de: '2', para: '3' }, { de: '3', para: '1' }, { de: '1', para: '3' }];
assert.deepEqual(caminhos(arestas, '1').map((x) => x.caminho), ['1', '1>2', '1>3', '1>2>3']);` }, { name: 'limite de nível e origem isolada', code: R`const a = [{ de: 'a', para: 'b' }, { de: 'b', para: 'c' }, { de: 'c', para: 'd' }];
assert.deepEqual(caminhos(a, 'a', { maxNivel: 2 }).map((x) => x.caminho), ['a', 'a>b', 'a>b>c']);
assert.deepEqual(caminhos(a, 'z'), [{ nivel: 0, caminho: 'z' }]);` }], solution: R`function caminhos(arestas, origem, opcoes = {}) {
  const { maxNivel } = opcoes;
  const resultado = [{ nivel: 0, caminho: origem }];
  let atual = [[origem]];
  let nivel = 0;
  while (atual.length && (maxNivel === undefined || nivel < maxNivel)) {
    const proximo = [];
    for (const nos of atual) {
      const ultimo = nos[nos.length - 1];
      for (const a of arestas) {
        if (a.de === ultimo && !nos.includes(a.para)) proximo.push([...nos, a.para]);
      }
    }
    nivel++;
    proximo.forEach((nos) => resultado.push({ nivel, caminho: nos.join('>') }));
    atual = proximo;
  }
  return resultado;
}
`, explanation: 'É o que uma CTE recursiva faz: o caso base é a origem e cada rodada estende os caminhos do nível anterior. Acumular o caminho e recusar nós repetidos é a proteção contra ciclos (no PostgreSQL, também a cláusula CYCLE).' }
],
'sqe-09': [
  { id: 'sqe-09-e1', type: 'mc', difficulty: 2, points: 10, prompt: 'Qual é a defesa principal contra injeção de SQL?', options: ['Remover aspas da entrada manualmente', 'Consultas parametrizadas (comando com marcadores e valores separados)', 'Esconder as mensagens de erro', 'Usar apenas letras maiúsculas'], answer: 1, explanation: 'Com parâmetros, o banco nunca interpreta o valor como SQL (medido: a entrada maliciosa devolveu 0 linhas como parâmetro e 5 linhas concatenada).' },
  { id: 'sqe-09-e2', type: 'tf', difficulty: 3, points: 10, prompt: 'Parâmetros ($1) podem ser usados para escolher dinamicamente o nome da coluna do ORDER BY.', answer: false, explanation: 'Parâmetros substituem valores, não identificadores. Para colunas, use uma lista de permissão que mapeia a escolha do usuário para nomes fixos.' },
  { id: 'sqe-09-e3', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha vulnerável à injeção de SQL.', code: 'app.get("/produtos", async (req, res) => {\n  const nome = req.query.nome;\n  const sql = "SELECT id, nome FROM loja.produtos WHERE nome = \'" + nome + "\'";\n  const { rows } = await pool.query(sql);\n  res.json(rows);\n});', answer: 3, explanation: 'A entrada do usuário é concatenada ao texto SQL. Use pool.query("... WHERE nome = $1", [nome]).' },
  { id: 'sqe-09-e4', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete a consulta preparada.', code: 'PREPARE busca([[0]]) AS\n  SELECT nome FROM produtos WHERE nome = [[1]];\nEXECUTE busca(\'Caneta\');', answers: [['text'], ['$1']], explanation: 'PREPARE declara o tipo do parâmetro e o marcador $1; EXECUTE fornece o valor.' },
  { id: 'sqe-09-e5', type: 'open', difficulty: 3, points: 10, prompt: 'Você recebeu um relatório de vendas com total geral 341,70, mas a soma dos totais por cliente dá 301,70. Descreva como investigar a diferença e quais conferências deveriam existir.', model: 'Investigar o que difere entre as duas visões: o total por cliente exclui pedidos cancelados, e o pedido cancelado vale 40,00; 301,70 + 40,00 = 341,70, então a diferença é explicada por um filtro de status. Em geral: comparar os filtros das duas consultas, conferir a granularidade (linhas do JOIN contra pedidos distintos), checar clientes sem pedido, NULL e duplicações, e reconciliar com uma consulta de controle simples sobre a tabela de itens. As conferências devem fazer parte do processo (testes de totais, comparação com o sistema de origem) e documentar o critério de cada número.', rubric: ['Identifica o filtro de status como explicação', 'Faz a reconciliação aritmética', 'Cita conferências de granularidade, NULL e duplicação', 'Propõe conferências permanentes'], explanation: 'Números plausíveis podem estar incorretos: reconciliar é parte do ofício.' },
  { id: 'sqe-09-e6', type: 'code', difficulty: 3, points: 25, prompt: 'Implemente duas funções de **SQL seguro**. §consultaSegura(sql, valores)§ devolve §{ sql, valores }§ se o texto for aceitável e lança erro caso contrário: o texto **não pode conter aspas simples (§\'§), ponto e vírgula (§;§) nem §--§** (erro §"SQL contém literal ou comando extra"§); os marcadores §$1§, §$2§, ... devem formar a sequência **1..n sem lacunas**, cada um usado **ao menos uma vez**, e n deve ser igual a §valores.length§ (erro §"marcadores e valores não conferem"§). §colunaPermitida(entrada, permitidas, padrao)§ devolve §entrada§ se estiver em §permitidas§ (comparação exata) e §padrao§ caso contrário.', lang: 'javascript', starter: 'function consultaSegura(sql, valores) {\n  // seu código aqui\n}\nfunction colunaPermitida(entrada, permitidas, padrao) {\n}\n', hints: ['Use uma expressão regular para detectar os caracteres proibidos.', 'Extraia os marcadores com /\\$(\\d+)/g e converta para número.', 'O maior marcador precisa ser igual a valores.length e todos de 1 até n devem aparecer.'], tests: [{ name: 'aceita consultas parametrizadas', code: R`const r = consultaSegura('SELECT id FROM produtos WHERE nome = $1 AND preco < $2', ['Caneta', 10]);
assert.deepEqual(r, { sql: 'SELECT id FROM produtos WHERE nome = $1 AND preco < $2', valores: ['Caneta', 10] });
assert.deepEqual(consultaSegura('SELECT 1', []).valores, []);
assert.deepEqual(consultaSegura('SELECT * FROM t WHERE a = $1 OR b = $1', ['x']).valores, ['x']);` }, { name: 'rejeita literais e comandos extras', code: R`assert.throws(() => consultaSegura("SELECT id FROM produtos WHERE nome = ''", []), 'SQL contém literal ou comando extra');
assert.throws(() => consultaSegura('SELECT 1; DROP TABLE produtos', []), 'SQL contém literal ou comando extra');
assert.throws(() => consultaSegura('SELECT 1 -- comentário', []), 'SQL contém literal ou comando extra');` }, { name: 'marcadores e valores', code: R`assert.throws(() => consultaSegura('SELECT $1, $2', ['a']), 'marcadores e valores não conferem');
assert.throws(() => consultaSegura('SELECT $1', ['a', 'b']), 'marcadores e valores não conferem');
assert.throws(() => consultaSegura('SELECT $2', ['a', 'b']), 'marcadores e valores não conferem');
assert.equal(colunaPermitida('preco', ['nome', 'preco'], 'nome'), 'preco');
assert.equal(colunaPermitida('preco; DROP TABLE x', ['nome', 'preco'], 'nome'), 'nome');
assert.equal(colunaPermitida(undefined, ['nome'], 'nome'), 'nome');` }], solution: R`function consultaSegura(sql, valores) {
  if (/['";]|--/.test(sql)) throw new Error('SQL contém literal ou comando extra');
  const usados = new Set([...sql.matchAll(/\$(\d+)/g)].map((m) => Number(m[1])));
  const n = valores.length;
  let ok = usados.size === n;
  for (let i = 1; i <= n && ok; i++) if (!usados.has(i)) ok = false;
  if (!ok) throw new Error('marcadores e valores não conferem');
  return { sql, valores };
}
function colunaPermitida(entrada, permitidas, padrao) {
  return permitidas.includes(entrada) ? entrada : padrao;
}
`, explanation: 'O modelo é uma versão simplificada de uma barreira de revisão: nada de literais no texto SQL, marcadores conferidos e identificadores só de uma lista de permissão. Na prática, o driver faz a separação entre comando e valores; a barreira ajuda a impedir regressões.' }
]
};

const P = 'sql-essencial-p';
export const assessment = {
  id: 'sql-essencial', title: 'Avaliação final — SQL essencial', passPct: 70, minutes: 45,
  items: [
    { id: P + '1', type: 'mc', difficulty: 1, points: 10, prompt: 'Qual restrição garante que toda referência a outra tabela aponta para uma linha existente?', options: ['CHECK', 'UNIQUE', 'FOREIGN KEY', 'DEFAULT'], answer: 2, explanation: 'A chave estrangeira impõe a integridade referencial (medido: o DELETE do cliente com pedidos foi recusado).' },
    { id: P + '2', type: 'tf', difficulty: 2, points: 10, prompt: 'SELECT nome FROM clientes WHERE email = NULL devolve os clientes sem e-mail.', answer: false, explanation: 'Comparar com NULL é desconhecido; use IS NULL (medido: = NULL devolveu 0 linhas).' },
    { id: P + '3', type: 'mc', difficulty: 2, points: 10, prompt: 'Em ordem lógica, qual cláusula é avaliada primeiro?', options: ['SELECT', 'ORDER BY', 'WHERE', 'FROM'], answer: 3, explanation: 'FROM (e JOINs) vem antes de WHERE, GROUP BY, HAVING, SELECT, ORDER BY e LIMIT.' },
    { id: P + '4', type: 'trace', difficulty: 2, points: 10, prompt: 'Tabela pedidos com 4 linhas e itens com 6 linhas (todo pedido tem item e todo item tem pedido).', code: 'SELECT count(*) FROM pedidos p JOIN itens i ON i.pedido_id = p.id;\nSELECT count(DISTINCT p.id) FROM pedidos p JOIN itens i ON i.pedido_id = p.id;', lang: 'sql', steps: [{ q: 'Resultado da primeira consulta?', answers: ['6'] }, { q: 'Resultado da segunda consulta?', answers: ['4'] }], explanation: 'O JOIN produz uma linha por item (6); os pedidos distintos são 4.' },
    { id: P + '5', type: 'mc', difficulty: 3, points: 10, prompt: 'Um LEFT JOIN de clientes com pedidos seguido de WHERE p.status = \'pago\' devolve só quem tem pedido pago. Qual a correção para manter todos os clientes e exibir só o pedido pago?', options: ['Trocar para RIGHT JOIN', 'Mover a condição de status para o ON', 'Usar DISTINCT', 'Trocar LEFT por CROSS'], answer: 1, explanation: 'No WHERE o LEFT JOIN vira INNER; no ON o filtro faz parte do casamento (medido: 4 contra 2 clientes).' },
    { id: P + '6', type: 'bug', difficulty: 3, points: 10, prompt: 'Clique na linha que pode devolver zero linhas se pedidos.cliente_id tiver algum NULL.', code: 'SELECT c.nome\nFROM clientes c\nWHERE c.id NOT IN (\n  SELECT p.cliente_id FROM pedidos p\n);', answer: 3, explanation: 'NOT IN com um NULL na subconsulta nunca é verdadeiro. Use NOT EXISTS (correlacionado).' },
    { id: P + '7', type: 'fill', difficulty: 2, points: 10, prompt: 'Complete para listar categorias com mais de 2 produtos.', code: 'SELECT categoria, count(*)\nFROM produtos\nGROUP BY categoria\n[[0]] count(*) [[1]] 2;', answers: [['HAVING'], ['>']], explanation: 'HAVING filtra grupos após a agregação (medido: papelaria com 3).' },
    { id: P + '8', type: 'match', difficulty: 2, points: 10, prompt: 'Associe o problema à técnica.', pairs: [['Clientes sem pedidos', 'LEFT JOIN com IS NULL ou NOT EXISTS'], ['Total duplicado após JOIN um-para-muitos', 'Agregar antes de juntar'], ['Percorrer uma hierarquia de categorias', 'CTE recursiva'], ['Entrada do usuário em consultas', 'Consulta parametrizada']], explanation: 'Cada problema do curso tem sua técnica.' },
    { id: P + '9', type: 'mc', difficulty: 3, points: 10, prompt: 'Um relatório mostra o total de frete 55 vezes maior do que o esperado depois de juntar pedidos com itens. Qual é a causa mais provável?', options: ['O banco está corrompido', 'A coluna do pedido foi somada depois de repetir o pedido uma vez por item', 'O ORDER BY está errado', 'Falta um índice'], answer: 1, explanation: 'Duplicação por JOIN: o pedido se repete por item e o frete é somado várias vezes.' },
    { id: P + '10', type: 'tf', difficulty: 2, points: 10, prompt: 'Uma CTE recursiva precisa de uma condição de parada ou de proteção contra ciclos para terminar de forma segura.', answer: true, explanation: 'Sem parada, a recursão pode continuar indefinidamente.' },
    { id: P + '11', type: 'open', difficulty: 3, points: 10, prompt: 'Explique, com suas palavras, como funciona a injeção de SQL e por que consultas parametrizadas a impedem. Inclua o que fazer quando o nome da coluna de ordenação vem do usuário.', model: 'A injeção ocorre quando a aplicação monta o comando SQL concatenando texto do usuário, e esse texto contém sintaxe SQL que o banco interpreta como parte do comando (por exemplo, \' OR \'1\'=\'1 torna a condição sempre verdadeira). Em uma consulta parametrizada o comando com marcadores e os valores são enviados separadamente, e o banco trata os valores sempre como dados, nunca como SQL. Parâmetros não servem para identificadores: para a coluna de ordenação, usa-se uma lista de permissão que mapeia a escolha do usuário para nomes de colunas conhecidos e ignora qualquer outro valor. Também ajuda o menor privilégio da conta do banco.', rubric: ['Explica a concatenação como causa', 'Explica a separação entre comando e valores nos parâmetros', 'Propõe allowlist para identificadores', 'Cita menor privilégio ou outra camada de defesa'], explanation: 'É o conhecimento mínimo de segurança para quem escreve SQL.' },
    { id: P + '12', type: 'mc', difficulty: 3, points: 10, prompt: 'Cenário: você precisa do total gasto por cliente (incluindo clientes sem pedidos, com total 0) e da contagem de pedidos de cada um. Qual abordagem é a mais segura contra duplicações?', options: ['JOIN direto com itens e count(*) por cliente', 'CTE que agrega os itens por pedido e por cliente, depois LEFT JOIN com clientes, usando coalesce e count de uma coluna da tabela opcional', 'SELECT DISTINCT sobre o JOIN completo', 'Subconsultas NOT IN'], answer: 1, explanation: 'Agregar antes de juntar, LEFT JOIN para manter os clientes e count(coluna opcional) evitam duplicação e contagens erradas.' }
  ]
};

export const project = {
  id: 'relatorios-loja', name: 'Relatórios de uma loja: consultas versionadas, conferidas e seguras', lv: 'M', stack: 'PostgreSQL 17, psql, Node.js e o driver pg', ds: ['sql'],
  desc: 'A partir de um esquema de loja fornecido (clientes, produtos, pedidos, itens e uma tabela de categorias hierárquica), entregue um conjunto de **consultas versionadas** que respondem a perguntas de negócio, com **conferência de totais** e uma pequena **camada de acesso em Node.js** que usa **somente consultas parametrizadas**. O projeto exercita modelo relacional, filtros, DML com transação, JOINs, agregações, subconsultas, CTEs (inclusive recursivas) e SQL seguro.',
  rf: ['Consultas: clientes sem pedidos (NOT EXISTS), ranking de clientes por gasto sem pedidos cancelados, vendas por categoria e por mês, produtos acima da média da própria categoria e árvore de categorias com nível e caminho', 'Uma consulta de contagem de pedidos por cliente que inclua clientes sem pedidos (LEFT JOIN com count de coluna da tabela opcional)', 'Um script de carga que insere dados em lote, usa upsert (ON CONFLICT) e uma alteração de preço dentro de transação conferida com RETURNING', 'Um conjunto de consultas de controle que reconcilie os totais (soma dos itens, soma por cliente e pedidos cancelados)', 'Uma camada de acesso em Node.js com funções que recebem parâmetros (nome, faixa de preço, ordenação) e usam consultas parametrizadas e allowlist para a coluna de ordenação', 'Um README com o esquema, como executar, as decisões de granularidade e as limitações'],
  rnf: ['Nenhuma consulta de aplicação concatena entrada do usuário', 'Colunas explícitas (sem SELECT *) e apelidos legíveis', 'Dinheiro em numeric e datas em date ou timestamptz', 'Scripts idempotentes e versionados', 'Resultados conferidos por consultas de controle documentadas'],
  ac: ['Cada consulta tem a saída esperada registrada e conferida contra os dados de exemplo', 'A conferência mostra que o total geral dos itens é igual à soma dos pedidos não cancelados mais os cancelados', 'Um teste mostra que uma entrada maliciosa (por exemplo, apóstrofo e OR) não altera o resultado da função de busca', 'O anti-join funciona também quando se insere um pedido com cliente_id nulo na tabela de testes (se a coluna permitir) ou o projeto explica por que a coluna é NOT NULL', 'O README explica a granularidade de cada consulta de resumo'],
  ch: ['Adicionar uma view com o ranking de clientes e consultar a view', 'Implementar paginação por chave na listagem de produtos e comparar com OFFSET usando EXPLAIN', 'Adicionar frete ao pedido e corrigir o relatório de receita para não duplicar o frete', 'Escrever um teste automatizado das consultas com um banco em contêiner', 'Comparar as mesmas consultas em MySQL e anotar as diferenças de sintaxe']
};
