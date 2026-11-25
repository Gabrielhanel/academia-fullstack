// C3.1 — SQL essencial. Aulas 7 a 9 (subqueries; CTEs; SQL seguro, legível e projeto).
const R = String.raw;

export const REF3 = {
  subq: { title: 'PostgreSQL 17 — Subquery Expressions', url: 'https://www.postgresql.org/docs/17/functions-subquery.html', kind: 'doc' },
  with: { title: 'PostgreSQL 17 — WITH Queries (CTE)', url: 'https://www.postgresql.org/docs/17/queries-with.html', kind: 'doc' },
  prepare: { title: 'PostgreSQL 17 — PREPARE', url: 'https://www.postgresql.org/docs/17/sql-prepare.html', kind: 'doc' },
  owaspSqli: { title: 'OWASP — SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html', kind: 'doc' },
  tableExpr: { title: 'PostgreSQL 17 — Table Expressions', url: 'https://www.postgresql.org/docs/17/queries-table-expressions.html', kind: 'doc' },
  conditional: { title: 'PostgreSQL 17 — Conditional Expressions (CASE, COALESCE)', url: 'https://www.postgresql.org/docs/17/functions-conditional.html', kind: 'doc' },
  explainIntro: { title: 'PostgreSQL 17 — Using EXPLAIN', url: 'https://www.postgresql.org/docs/17/using-explain.html', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'sqe-07', moduleId: 'm3', order: 7, minutes: 70, tags: ['subquery', 'EXISTS', 'IN', 'NOT IN', 'correlacionada', 'NULL'],
  title: 'Subqueries: escalares, IN, EXISTS, correlacionadas e a armadilha do NOT IN',
  objectives: ['Escrever subconsultas escalares, de lista (§IN§) e de existência (§EXISTS§)', 'Distinguir subconsulta correlacionada de não correlacionada', 'Usar subqueries na lista do §SELECT§, no §FROM§ e no §WHERE§', 'Explicar por que §NOT IN§ com NULL devolve zero linhas e preferir §NOT EXISTS§', 'Escolher entre JOIN, §IN§ e §EXISTS§ para a mesma pergunta'],
  intro: R`Uma **subconsulta** (*subquery*) é um §SELECT§ dentro de outro. Ela resolve perguntas em duas etapas: "quais produtos custam **mais que a média**?" exige primeiro calcular a média. Esta aula mostra os formatos, a diferença entre subconsultas simples e **correlacionadas** e uma **armadilha séria**: o §NOT IN§ combinado com NULL, que devolve zero linhas sem avisar.`,
  theory: R`### Subconsulta escalar
Devolve **uma linha e uma coluna** e pode ser usada onde um valor cabe. Medido: §SELECT nome FROM produtos WHERE preco > (SELECT avg(preco) FROM produtos)§ devolveu **Mochila e Garrafa** (a média é 37,88; só esses dois estão acima). Se a subconsulta devolver **mais de uma linha**, o banco acusa erro; se devolver nenhuma, o valor é NULL.

### IN com subconsulta
§WHERE id IN (SELECT cliente_id FROM pedidos WHERE status = 'pago')§ mantém quem aparece na lista. Medido: devolveu **Ana e Bruno**. É equivalente a um JOIN, mas **sem duplicar** linhas (um cliente com vários pedidos pagos aparece uma vez), o que evita o problema de granularidade (aula sqe-05).

### EXISTS e NOT EXISTS
§EXISTS (subconsulta)§ é verdadeiro se a subconsulta devolver **pelo menos uma linha**; o conteúdo do §SELECT§ interno não importa (por convenção, §SELECT 1§). Medido: §WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id)§ devolveu **Diego**, o cliente sem pedidos. A subconsulta **referencia a linha de fora** (§c.id§): é **correlacionada**.

### Subconsulta correlacionada
Depende de colunas da consulta externa e é, conceitualmente, avaliada **uma vez por linha externa**. Medido: para cada produto, a média da **sua categoria**: §(SELECT round(avg(p2.preco), 2) FROM produtos p2 WHERE p2.categoria = pr.categoria)§ devolveu 8,13 para os de papelaria e 82,50 para os de acessórios. Na prática, o otimizador costuma transformar muitos casos em JOINs eficientes; mas uma correlacionada mal escrita pode ser lenta (C3.3: EXPLAIN). **Não correlacionada** é avaliada uma vez (como a média global acima).

### A armadilha do NOT IN
Medido:
- §WHERE id NOT IN (SELECT cliente_id FROM pedidos)§ devolveu Diego (correto, pois nenhum §cliente_id§ é NULL);
- §WHERE id NOT IN (SELECT NULL::int)§ devolveu **0 linhas**.
Por quê? §x NOT IN (a, b, NULL)§ equivale a §x <> a AND x <> b AND x <> NULL§; o último termo é **desconhecido**, e verdadeiro AND desconhecido é **desconhecido**: o §WHERE§ não deixa passar ninguém. **Uma única linha NULL na subconsulta zera o resultado.** Por isso: **prefira §NOT EXISTS§** (correlacionado) ou o anti-join com §LEFT JOIN ... IS NULL§, que tratam NULL de forma previsível. §IN§ (positivo) não tem o problema.

### Subconsultas no FROM (tabelas derivadas)
§SELECT categoria, n FROM (SELECT categoria, count(*) AS n FROM produtos GROUP BY categoria) t WHERE n > 2§ devolveu a papelaria (3). A subconsulta no §FROM§ **precisa de apelido** (§t§). É a técnica para **filtrar sobre uma agregação com mais controle** e para "agregar antes de juntar" (aula sqe-05). As CTEs (próxima aula) fazem o mesmo com mais legibilidade.

### ALL e ANY
§preco > ALL (SELECT preco FROM produtos WHERE categoria = 'papelaria')§ exige ser maior que **todos** (medido: devolveu os ids 3 e 4, Mochila e Garrafa). §ANY§ (ou §SOME§) exige **algum**. §= ANY (...)§ equivale a §IN§.

### Subconsulta na lista do SELECT
Uma escalar na lista funciona como coluna calculada (a média da categoria, acima). Para muitas linhas, **uma junção com agregação** é mais eficiente do que uma subconsulta correlacionada por linha.

### IN, EXISTS ou JOIN?
- Só **filtrar** pela existência de relacionados → §EXISTS§ (ou §IN§). Sem duplicação.
- Precisar de **colunas do outro lado** → JOIN.
- **Ausência** de relacionados → §NOT EXISTS§ (preferível) ou anti-join.
- Valor de comparação **agregado** → subconsulta escalar ou CTE.
O planejador do PostgreSQL costuma gerar planos equivalentes para §IN§, §EXISTS§ e JOIN em casos simples; escolha pela **clareza** e verifique com §EXPLAIN§ quando o desempenho importar (curso C3.3).`,
  concepts: [
    { term: 'Subconsulta', def: 'Consulta SELECT aninhada dentro de outra consulta.' },
    { term: 'Subconsulta escalar', def: 'Subconsulta que devolve uma única linha e coluna, usada como valor.' },
    { term: 'IN', def: 'Teste de pertinência a uma lista ou ao resultado de uma subconsulta.' },
    { term: 'EXISTS', def: 'Teste verdadeiro quando a subconsulta devolve pelo menos uma linha.' },
    { term: 'Subconsulta correlacionada', def: 'Subconsulta que usa colunas da consulta externa.' },
    { term: 'Tabela derivada', def: 'Subconsulta no FROM, com apelido obrigatório.' },
    { term: 'NOT IN com NULL', def: 'Armadilha em que um NULL na lista faz a condição nunca ser verdadeira.' },
    { term: 'NOT EXISTS', def: 'Teste de ausência de linhas relacionadas, seguro com NULL.' },
    { term: 'ALL e ANY', def: 'Quantificadores que comparam um valor com todos ou algum dos valores da subconsulta.' },
    { term: 'Semi-junção', def: 'Operação que mantém linhas de uma tabela que têm correspondência em outra, sem duplicá-las (IN e EXISTS).' }
  ],
  examples: R`**Analogia:** uma subconsulta é **perguntar a outra pessoa antes de decidir**. "A Mochila é cara?" depende de "qual é a média dos preços?", e você precisa primeiro obter essa média. A **correlacionada** é perguntar, para cada produto, "e a média **da categoria dele**?". O **NOT IN com NULL** é como uma lista de convidados com **uma linha em branco**: ao perguntar "este nome não está na lista?", a linha em branco "pode ser qualquer pessoa", então você nunca tem certeza de que o nome **não** está lá, e acaba não deixando ninguém passar.

**Exemplo 1: acima da média.** Mochila e Garrafa estão acima da média global.

**Exemplo 2: sem pedidos.** NOT EXISTS devolve Diego.

**Exemplo 3: NOT IN com NULL.** Devolve zero linhas, mesmo existindo clientes sem pedidos.`,
  code: [
    { title: 'Escalar, IN e NOT EXISTS (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`-- produtos acima da média
SELECT nome FROM produtos
WHERE preco > (SELECT avg(preco) FROM produtos)
ORDER BY id;                                   -- Mochila, Garrafa

-- clientes com pedido pago (sem duplicar)
SELECT nome FROM clientes
WHERE id IN (SELECT cliente_id FROM pedidos WHERE status = 'pago')
ORDER BY id;                                   -- Ana, Bruno

-- clientes sem pedidos
SELECT nome FROM clientes c
WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id)
ORDER BY id;                                   -- Diego`, notes: [{ l: '3', t: 'A subconsulta escalar roda uma vez e devolve a média global.' }, { l: '8', t: 'IN é uma semi-junção: cada cliente aparece uma vez.' }, { l: '13', t: 'A subconsulta é correlacionada (usa c.id) e é a forma segura de testar ausência.' }] },
    { title: 'A armadilha do NOT IN com NULL (SQL, saída medida)', lang: 'sql', code: R`SELECT nome FROM clientes
WHERE id NOT IN (SELECT cliente_id FROM pedidos);        -- Diego (nenhum cliente_id é NULL)

SELECT nome FROM clientes
WHERE id NOT IN (SELECT NULL::int);                      -- 0 linhas!

-- correlacionada por linha: a média da categoria
SELECT pr.nome, pr.preco,
       (SELECT round(avg(p2.preco), 2) FROM produtos p2
        WHERE p2.categoria = pr.categoria) AS media_cat
FROM produtos pr ORDER BY pr.id;`, notes: [{ l: '5', t: 'Com um NULL na lista, x NOT IN (...) nunca é verdadeiro.' }, { l: '9', t: 'A subconsulta depende de pr.categoria: é correlacionada.' }] }
  ],
  bestPractices: ['Prefira NOT EXISTS (ou anti-join) a NOT IN quando a coluna puder ser NULL.', 'Use EXISTS/IN para filtrar por existência sem duplicar linhas.', 'Dê apelido a toda tabela derivada.', 'Use subconsultas escalares só quando devolverem uma linha.', 'Prefira CTEs a subconsultas muito aninhadas.', 'Verifique o plano quando houver correlacionadas em tabelas grandes.'],
  mistakes: ['Usar NOT IN sobre uma coluna que aceita NULL.', 'Escrever uma subconsulta escalar que devolve várias linhas.', 'Usar JOIN para filtrar por existência e duplicar linhas.', 'Esquecer o apelido da tabela derivada.', 'Aninhar subconsultas demais, prejudicando a leitura.', 'Assumir que correlacionada é sempre lenta (ou sempre rápida) sem medir.'],
  market: R`A diferença entre NOT IN e NOT EXISTS é uma pergunta clássica e um bug real de produção: relatórios de "clientes sem pedido" que passam a retornar vazio depois que uma linha NULL entra. Dominar subconsultas também é pré-requisito para CTEs e window functions.`,
  summary: R`Subconsultas respondem perguntas em duas etapas. Escalares devolvem um valor (medido: Mochila e Garrafa acima da média), §IN§ e §EXISTS§ testam existência sem duplicar linhas e as correlacionadas dependem da linha externa (média por categoria 8,13 e 82,50). §NOT IN§ com um NULL na lista devolve **0 linhas** (medido): use §NOT EXISTS§. Tabelas derivadas exigem apelido e preparam o caminho para as CTEs.`,
  refs: [REF3.subq, REF3.tableExpr],
  cards: [
    { q: 'O que torna uma subconsulta correlacionada?', a: 'Ela usa colunas da consulta externa e é avaliada conceitualmente por linha externa.' },
    { q: 'Por que NOT IN com NULL devolve zero linhas?', a: 'x <> NULL é desconhecido; verdadeiro AND desconhecido é desconhecido e o WHERE não deixa ninguém passar.' },
    { q: 'Qual a alternativa segura ao NOT IN?', a: 'NOT EXISTS (ou LEFT JOIN ... IS NULL).' },
    { q: 'Por que IN não duplica linhas como JOIN?', a: 'IN é uma semi-junção: só testa pertinência, não combina colunas.' },
    { q: 'Subconsulta no FROM precisa de quê?', a: 'De um apelido (alias).' }
  ]
},
{
  id: 'sqe-08', moduleId: 'm3', order: 8, minutes: 70, tags: ['CTE', 'WITH', 'recursão', 'hierarquia', 'MATERIALIZED', 'legibilidade'],
  title: 'CTEs: WITH, consultas em etapas, CTEs recursivas e hierarquias',
  objectives: ['Escrever consultas em etapas com §WITH§ (common table expressions)', 'Usar CTEs para agregar antes de juntar e para nomear passos', 'Escrever uma CTE recursiva (caso base, parte recursiva e condição de parada)', 'Percorrer hierarquias (categorias, organogramas) com recursão', 'Entender a materialização (§MATERIALIZED§ e §NOT MATERIALIZED§)'],
  intro: R`Consultas complexas viram **uma sopa de parênteses** quando se usam muitas subconsultas aninhadas. As **CTEs** (*common table expressions*, cláusula §WITH§) permitem **nomear etapas** e ler a consulta de cima para baixo, como um programa. E elas têm um superpoder: a **recursão**, que percorre árvores e grafos (categorias, organogramas, rotas) sem sair do SQL.`,
  theory: R`### WITH: etapas nomeadas
§§§
WITH gasto AS (
  SELECT ped.cliente_id, sum(pr.preco * i.quantidade) AS total
  FROM pedidos ped
  JOIN itens i ON i.pedido_id = ped.id
  JOIN produtos pr ON pr.id = i.produto_id
  WHERE ped.status <> 'cancelado'
  GROUP BY ped.cliente_id
)
SELECT c.nome, g.total
FROM gasto g JOIN clientes c ON c.id = g.cliente_id
ORDER BY g.total DESC;
§§§
A CTE §gasto§ é como uma **tabela temporária que só existe nesta consulta**. Medido: devolveu **Ana (192,80) e Bruno (108,90)** (o pedido cancelado de Carla ficou de fora). Vantagens: **legibilidade** (cada passo tem nome), **reuso** (uma CTE pode ser usada várias vezes na consulta) e a técnica **agregar antes de juntar** (aula sqe-05) fica natural. Várias CTEs separam-se por vírgula e **uma pode usar as anteriores**.

### Materialização
No PostgreSQL 12 e posteriores, uma CTE simples, usada **uma vez**, é **incorporada** à consulta principal (o otimizador a trata como uma subconsulta); se for usada **mais de uma vez**, é **materializada** (calculada uma vez e guardada). Você pode forçar: §WITH x AS MATERIALIZED (...)§ ou §WITH x AS NOT MATERIALIZED (...)§. Medido: §WITH ped_pagos AS MATERIALIZED (SELECT id FROM pedidos WHERE status = 'pago') SELECT count(*) FROM ped_pagos§ devolveu **2**. Em versões antigas e em outros bancos a regra pode ser diferente (**consulte a documentação do seu produto**).

### CTE recursiva
A forma é §WITH RECURSIVE nome AS (caso base UNION ALL parte recursiva)§: o **caso base** produz as linhas iniciais e a **parte recursiva** referencia a própria CTE para produzir as próximas, **até não gerar linhas novas**. Medido, contagem de 1 a 5:
§§§
WITH RECURSIVE contagem(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM contagem WHERE n < 5
)
SELECT sum(n) FROM contagem;     -- 15
§§§
**Sempre tenha uma condição de parada** (§WHERE n < 5§): sem ela, a consulta roda indefinidamente (o PostgreSQL só para se você usar §LIMIT§ ou cancelar).

### Hierarquias
Uma tabela com **autorreferência** (§categorias(id, nome, pai)§) guarda uma árvore. Medido, com Eletrônicos > Celulares > Smartphones e Livros:
§§§
WITH RECURSIVE arvore AS (
  SELECT id, nome, 0 AS nivel, nome::text AS caminho FROM categorias WHERE pai IS NULL
  UNION ALL
  SELECT c.id, c.nome, a.nivel + 1, a.caminho || ' > ' || c.nome
  FROM categorias c JOIN arvore a ON c.pai = a.id
)
SELECT nivel, caminho FROM arvore ORDER BY caminho;
§§§
Resultado: níveis 0 a 2 com os caminhos "Eletrônicos", "Eletrônicos > Celulares", "Eletrônicos > Celulares > Smartphones" e "Livros". Usos: menus, organogramas, listas de materiais, comentários aninhados, **grafos de dependência**.
**Ciclos:** em um grafo com ciclo, a recursão não termina. Proteja-se com um **limite de nível**, acumulando o caminho e testando se o nó já foi visitado, ou com a cláusula §CYCLE§ (PostgreSQL 14 ou superior; consulte a documentação). §UNION§ (sem §ALL§) remove linhas repetidas e **pode** encerrar alguns ciclos simples, ao custo de comparar todas as linhas.

### CTE x subconsulta x visão
- **CTE**: nome e escopo de **uma consulta**; ótima para ler e organizar.
- **Subconsulta**: curta e local.
- **Visão** (view, curso C3.2): consulta **salva no banco**, reutilizável por várias consultas.
- **Tabela temporária** (§CREATE TEMP TABLE§): guarda dados de verdade, com índices, útil em processos longos.
Cuidado com o mito "CTE é sempre mais lenta/rápida": depende da versão e do plano; **meça com §EXPLAIN§**.

### CTEs de modificação (visão geral)
O PostgreSQL permite §INSERT§, §UPDATE§ e §DELETE§ com §RETURNING§ **dentro** de uma CTE, encadeando operações (por exemplo, arquivar o que foi apagado). É um recurso poderoso; use-o com testes e transação.`,
  concepts: [
    { term: 'CTE', def: 'Common table expression: consulta nomeada definida com WITH e válida para uma única consulta.' },
    { term: 'WITH RECURSIVE', def: 'Forma de CTE que referencia a si mesma para percorrer hierarquias e grafos.' },
    { term: 'Caso base', def: 'Parte não recursiva de uma CTE recursiva que gera as linhas iniciais.' },
    { term: 'Parte recursiva', def: 'Parte que referencia a própria CTE para gerar as próximas linhas até não haver novas.' },
    { term: 'Condição de parada', def: 'Condição que impede a recursão infinita.' },
    { term: 'Materialização', def: 'Cálculo único de uma CTE guardando o resultado, em vez de incorporá-la à consulta.' },
    { term: 'Autorreferência', def: 'Coluna que referencia a chave da própria tabela (por exemplo, pai).' },
    { term: 'Ciclo', def: 'Caminho que volta a um nó já visitado, capaz de tornar uma recursão infinita.' },
    { term: 'Tabela temporária', def: 'Tabela que existe só durante a sessão ou transação e guarda dados reais.' },
    { term: 'Agregar antes de juntar', def: 'Calcular totais por chave em uma CTE e só então fazer o JOIN.' }
  ],
  examples: R`**Analogia:** uma CTE é **uma receita dividida em etapas nomeadas** ("faça o molho", "cozinhe a massa", "monte o prato"), em vez de uma frase gigante com parênteses. A **recursão** é como **abrir uma pasta, depois as subpastas, depois as subpastas das subpastas** até não haver mais nada para abrir; a condição de parada é saber quando não há mais subpastas (ou limitar a profundidade, caso haja um atalho que volte para uma pasta já visitada).

**Exemplo 1: gasto por cliente.** Uma CTE de totais por cliente, depois o JOIN com os nomes.

**Exemplo 2: contagem recursiva.** Soma de 1 a 5 igual a 15, com parada em n < 5.

**Exemplo 3: árvore de categorias.** Níveis e caminhos de "Eletrônicos > Celulares > Smartphones".`,
  code: [
    { title: 'CTE de etapas (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`WITH gasto AS (
  SELECT ped.cliente_id, sum(pr.preco * i.quantidade) AS total
  FROM pedidos ped
  JOIN itens i ON i.pedido_id = ped.id
  JOIN produtos pr ON pr.id = i.produto_id
  WHERE ped.status <> 'cancelado'
  GROUP BY ped.cliente_id
)
SELECT c.nome, g.total
FROM gasto g
JOIN clientes c ON c.id = g.cliente_id
ORDER BY g.total DESC;       -- Ana 192.80 | Bruno 108.90`, notes: [{ l: '1', t: 'A CTE nomeia o passo "gasto por cliente".' }, { l: '6', t: 'O filtro por status entra antes do agrupamento (WHERE).' }, { l: '10', t: 'O JOIN final combina o resultado agregado com os nomes: agregou antes de juntar.' }] },
    { title: 'CTE recursiva para uma árvore (SQL, saída medida)', lang: 'sql', code: R`CREATE TEMP TABLE categorias (id int, nome text, pai int);
INSERT INTO categorias VALUES
  (1,'Eletrônicos',NULL),(2,'Celulares',1),(3,'Smartphones',2),(4,'Livros',NULL);

WITH RECURSIVE arvore AS (
  SELECT id, nome, 0 AS nivel, nome::text AS caminho
  FROM categorias WHERE pai IS NULL
  UNION ALL
  SELECT c.id, c.nome, a.nivel + 1, a.caminho || ' > ' || c.nome
  FROM categorias c JOIN arvore a ON c.pai = a.id
)
SELECT nivel, caminho FROM arvore ORDER BY caminho;
-- 0 Eletrônicos | 1 Eletrônicos > Celulares | 2 Eletrônicos > Celulares > Smartphones | 0 Livros`, notes: [{ l: '6', t: 'Caso base: as raízes (sem pai).' }, { l: '9', t: 'Parte recursiva: filhos das linhas já produzidas.' }, { l: '10', t: 'A recursão termina quando nenhuma categoria tem pai igual a um nó novo.' }] }
  ],
  bestPractices: ['Use CTEs para nomear etapas e agregar antes de juntar.', 'Dê nomes descritivos às CTEs e comente decisões não óbvias.', 'Em CTEs recursivas, sempre garanta uma condição de parada e proteja-se de ciclos.', 'Meça com EXPLAIN antes de supor que uma CTE é mais rápida ou mais lenta.', 'Use MATERIALIZED quando precisar reutilizar um cálculo caro uma vez só.', 'Prefira visões para lógica reaproveitada por várias consultas.'],
  mistakes: ['Esquecer a condição de parada na recursão.', 'Ignorar ciclos em grafos.', 'Usar CTEs encadeadas sem necessidade, complicando a leitura.', 'Achar que CTE sempre materializa (ou nunca) sem verificar a versão.', 'Misturar UNION e UNION ALL sem entender a diferença.', 'Gerar caminhos como texto sem limite de tamanho em hierarquias profundas.'],
  market: R`CTEs tornam consultas de relatório legíveis e revisáveis, e a recursão resolve problemas de hierarquia que equipes costumam levar para o código da aplicação. Perguntas de entrevista comuns: "como você percorre uma árvore em SQL?" e "qual a diferença entre CTE e subconsulta?".`,
  summary: R`§WITH§ nomeia etapas de uma consulta (medido: gasto por cliente, Ana 192,80 e Bruno 108,90, sem o pedido cancelado) e facilita agregar antes de juntar. No PostgreSQL 12+, uma CTE usada uma vez é incorporada e uma usada várias vezes é materializada; §MATERIALIZED§ e §NOT MATERIALIZED§ forçam. §WITH RECURSIVE§ combina caso base, §UNION ALL§ e parte recursiva com condição de parada (soma 1 a 5 = 15; árvore com níveis 0 a 2). Proteja-se contra ciclos.`,
  refs: [REF3.with, REF3.tableExpr],
  cards: [
    { q: 'O que é uma CTE?', a: 'Uma consulta nomeada com WITH, válida só para a consulta em que foi definida.' },
    { q: 'Quais as partes de uma CTE recursiva?', a: 'Caso base, UNION ALL e parte recursiva que referencia a própria CTE, com condição de parada.' },
    { q: 'O que acontece em um grafo com ciclo?', a: 'A recursão pode não terminar; limite o nível, acumule o caminho ou use CYCLE.' },
    { q: 'O que faz MATERIALIZED?', a: 'Força o cálculo único da CTE e o armazenamento do resultado.' },
    { q: 'Quando preferir uma visão a uma CTE?', a: 'Quando a lógica precisa ser reutilizada por várias consultas e fica salva no banco.' }
  ]
},
{
  id: 'sqe-09', moduleId: 'm3', order: 9, minutes: 70, tags: ['injeção de SQL', 'prepared statements', 'legibilidade', 'boas práticas', 'projeto'],
  title: 'SQL seguro e profissional: parâmetros, injeção, legibilidade e revisão de consultas',
  objectives: ['Explicar a injeção de SQL e preveni-la com consultas parametrizadas', 'Usar §PREPARE§/§EXECUTE§ (e parâmetros de drivers) em vez de concatenar texto', 'Aplicar convenções de legibilidade e revisão de consultas', 'Conferir resultados com consultas de controle e contagens', 'Planejar o projeto integrador de relatórios'],
  intro: R`Saber escrever consultas corretas não basta: elas também precisam ser **seguras**, **legíveis** e **verificadas**. Esta aula fecha o curso com o erro de segurança mais clássico em acesso a bancos, a **injeção de SQL**, e com a disciplina de revisar e conferir consultas antes de confiar nos números. Termina com a apresentação do projeto integrador.`,
  theory: R`### Injeção de SQL
Acontece quando a aplicação **monta o texto SQL concatenando dados do usuário**. Se o usuário digitar um valor que **contém sintaxe SQL**, o banco o interpreta como **comando**. Exemplo (medido no PostgreSQL 17): uma tela de busca monta §"SELECT ... WHERE nome = '" + entrada + "'"§. Com a entrada §' OR '1'='1§, o texto final vira §WHERE nome = '' OR '1'='1'§, que é **sempre verdadeiro**: a consulta devolveu **5 linhas** (todas) em vez de 0. Casos reais incluem vazar tabelas inteiras, ignorar a senha de um login e, com permissões excessivas, alterar ou apagar dados. A injeção de SQL figura nas listas de riscos do OWASP há muitos anos.

### A defesa principal: consultas parametrizadas
Em vez de misturar dados e comando, envie o **comando com marcadores** (§$1§, §?§, §:nome§ conforme o driver) e os **valores separadamente**; o banco **nunca interpreta o valor como SQL**.
§§§
PREPARE busca(text) AS SELECT nome FROM produtos WHERE nome = $1;
EXECUTE busca('Caneta');            -- Caneta
EXECUTE busca($$' OR '1'='1$$);     -- 0 linhas: o texto é só um valor
§§§
Medido: o mesmo texto malicioso, passado como **parâmetro**, devolveu **0 linhas**. Nos drivers de aplicação (Node, Java, Python), use sempre a API parametrizada (por exemplo, §client.query('SELECT ... WHERE nome = $1', [nome])§ no §pg§); o preparo de verdade acontece no protocolo, sem montar texto.
**Limites dos parâmetros:** servem para **valores**, não para **nomes** de tabelas, colunas ou direção de ordenação. Para esses casos, use uma **lista de permissão** (allowlist): mapeie a escolha do usuário para identificadores conhecidos e **nunca** aceite o texto cru.

### Outras camadas de defesa
- **Menor privilégio**: a conta usada pela aplicação não deve ser dona do esquema nem ter permissão de apagar tabelas.
- **Validação de entrada** (tipo, tamanho, formato), útil mas **não substitui** a parametrização.
- **ORMs e construtores de consulta** parametrizam por padrão, mas **SQL cru dentro deles** (§$queryRaw§, §sql.raw§) exige a mesma disciplina (curso C3.6).
- **Mensagens de erro** genéricas para o usuário; detalhes só no log.
- **Escapar manualmente** é frágil; prefira parâmetros.
(O tema é aprofundado na onda de segurança, C7.)

### Legibilidade e revisão
- Palavras reservadas em maiúsculas, uma cláusula por linha, indentação consistente, apelidos significativos (§ped§, §itens§; evite §a§, §b§ em consultas grandes).
- **Qualifique colunas** com o apelido da tabela em consultas com JOIN.
- **Comente decisões**, não o óbvio ("exclui cancelados porque não geram receita").
- Evite §SELECT *§ e §NATURAL JOIN§.
- Prefira **CTEs** a subconsultas profundamente aninhadas.
- Versione os scripts (migrações, curso C3.6) e **revise consultas como código**.

### Verifique os números
1. **Reconcilie** totais: o total por cliente soma o total geral? (Medido: a soma dos itens deu **341,70**; os totais por cliente somam, sem o cancelado, 192,80 + 108,90 = 301,70, e o pedido cancelado vale 40,00: 301,70 + 40,00 = 341,70.)
2. **Confira a granularidade**: o número de linhas é o esperado? (**4 pedidos, 6 linhas** ao juntar itens.)
3. **Teste casos de borda**: NULL, grupos vazios, duplicatas, datas nos extremos.
4. **Compare** com uma consulta mais simples ou com o sistema de origem.
5. **Use transações** ao alterar dados e valide com §RETURNING§.

### Tipos e conversões que enganam
Divisão de inteiros (§5/2 = 2§), comparação de texto com número, fusos horários (§timestamptz§), comparação de datas com horas e maiúsculas/minúsculas em textos (§collation§ do banco). Converta de forma **explícita** (§::numeric§, §CAST§) e documente a suposição.

### Antes de ir para a produção
- Rode §EXPLAIN§ para consultas pesadas (curso C3.3).
- Defina **índices** para os filtros e junções usados (curso C3.3).
- Evite consultas sem limite em telas (§LIMIT§ e paginação por chave).
- Considere **timeouts** de consulta e monitoramento de consultas lentas.

### Projeto integrador (visão geral)
*Relatórios de uma loja*: a partir de um esquema fornecido, entregar um conjunto de consultas versionadas (clientes sem pedidos, ranking de clientes, vendas por categoria e mês, produtos acima da média da categoria, árvore de categorias), com conferência de totais e uma camada de acesso parametrizada em Node.js (ou outra linguagem), sem concatenação de texto.`,
  concepts: [
    { term: 'Injeção de SQL', def: 'Ataque em que dados do usuário alteram a estrutura do comando SQL montado por concatenação.' },
    { term: 'Consulta parametrizada', def: 'Consulta com marcadores e valores enviados separadamente, que o banco nunca interpreta como SQL.' },
    { term: 'PREPARE e EXECUTE', def: 'Comandos do PostgreSQL que preparam uma consulta com parâmetros e a executam com valores.' },
    { term: 'Lista de permissão (allowlist)', def: 'Conjunto fixo de valores aceitos para partes não parametrizáveis, como nomes de colunas.' },
    { term: 'Menor privilégio', def: 'Princípio de dar à conta da aplicação só as permissões necessárias.' },
    { term: 'Consulta de controle', def: 'Consulta simples usada para conferir o resultado de uma consulta complexa.' },
    { term: 'Reconciliação', def: 'Conferência de que totais de visões diferentes batem entre si.' },
    { term: 'Collation', def: 'Regra de comparação e ordenação de textos do banco.' },
    { term: 'Timeout de consulta', def: 'Limite de tempo para uma consulta, que protege o banco de consultas descontroladas.' },
    { term: 'Revisão de SQL', def: 'Leitura crítica de consultas e scripts, como em qualquer código.' }
  ],
  examples: R`**Analogia:** concatenar texto é **ditar ao motorista de um táxi o endereço escrito pelo passageiro, palavra por palavra**: se o passageiro escrever "Rua A e depois me leve ao banco", o motorista obedece à frase inteira. A consulta parametrizada é entregar ao motorista **um formulário com um campo "endereço" a preencher**: tudo que o passageiro escrever naquele campo é **o endereço**, nunca uma instrução. Revisar consultas é como **conferir o troco**: você não confia no resultado só porque a conta "parece certa".

**Exemplo 1: injeção medida.** A condição maliciosa concatenada devolveu 5 linhas; a mesma entrada como parâmetro devolveu 0.

**Exemplo 2: reconciliação.** 341,70 de itens = 301,70 de pedidos não cancelados + 40,00 do pedido cancelado.

**Exemplo 3: granularidade.** 4 pedidos viram 6 linhas ao juntar itens: o número de linhas confirma o tipo de JOIN.`,
  code: [
    { title: 'Parametrizado x concatenado (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`-- INSEGURO: o texto da aplicação virou comando
SELECT count(*) FROM produtos WHERE nome = '' OR '1'='1';       -- 5 (todas as linhas)

-- SEGURO: o valor é só um valor
PREPARE busca(text) AS SELECT nome FROM produtos WHERE nome = $1;
EXECUTE busca('Caneta');            -- Caneta
EXECUTE busca($$' OR '1'='1$$);     -- 0 linhas`, notes: [{ l: '2', t: 'O que o usuário digitou passou a fazer parte da lógica da consulta.' }, { l: '5', t: 'PREPARE define o comando com o marcador $1.' }, { l: '7', t: 'O texto malicioso é comparado literalmente com nome e não encontra nada.' }] },
    { title: 'Consulta parametrizada em Node.js com o driver pg (JavaScript)', lang: 'js', code: R`import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function buscarProdutos(nome) {
  const { rows } = await pool.query(
    'SELECT id, nome, preco FROM loja.produtos WHERE nome = $1',
    [nome]
  );
  return rows;
}

// nomes de colunas NÃO são parâmetros: use allowlist
const ORDENACOES = { preco: 'preco', nome: 'nome' };
export async function listar(ordem) {
  const coluna = ORDENACOES[ordem] ?? 'nome';
  const { rows } = await pool.query('SELECT id, nome, preco FROM loja.produtos ORDER BY ' + coluna);
  return rows;
}`, notes: [{ l: '6', t: 'O texto SQL e os valores seguem separados até o servidor.' }, { l: '14', t: 'Identificadores não aceitam parâmetros: mapeie a escolha do usuário para valores fixos.' }, { l: '16', t: 'A concatenação só usa um valor vindo da allowlist, nunca o texto cru.' }] }
  ],
  bestPractices: ['Use sempre consultas parametrizadas para valores.', 'Use allowlist para nomes de colunas e direção de ordenação.', 'Dê à aplicação uma conta de menor privilégio.', 'Revise e versione SQL como código.', 'Reconcilie totais e confira a granularidade antes de publicar um relatório.', 'Converta tipos de forma explícita.'],
  mistakes: ['Concatenar entrada do usuário no texto SQL.', 'Confiar em "escapar" aspas manualmente.', 'Usar SQL cru em ORMs sem parâmetros.', 'Publicar um número sem conferi-lo.', 'Mostrar erros do banco ao usuário final.', 'Dar ao usuário da aplicação permissão de dono do esquema.'],
  market: R`Injeção de SQL continua sendo um dos incidentes de segurança mais citados, e é pergunta obrigatória em revisões de código e entrevistas de backend. Hábitos de revisão e conferência de números distinguem quem apenas escreve SQL de quem entrega relatórios confiáveis.`,
  summary: R`Injeção de SQL ocorre ao concatenar entrada do usuário no comando (medido: a condição maliciosa devolveu 5 linhas). A defesa principal é a consulta parametrizada (medido: o mesmo texto como parâmetro devolveu 0 linhas); identificadores usam allowlist; a conta da aplicação segue o menor privilégio. Legibilidade, revisão e conferência (341,70 = 301,70 + 40,00; 4 pedidos viram 6 linhas) completam o profissionalismo. O projeto integrador reúne tudo em relatórios versionados e seguros.`,
  refs: [REF3.prepare, REF3.owaspSqli, REF3.conditional, REF3.explainIntro],
  cards: [
    { q: 'O que causa a injeção de SQL?', a: 'Montar o comando SQL concatenando texto do usuário, que passa a ser interpretado como sintaxe.' },
    { q: 'Qual a defesa principal?', a: 'Consultas parametrizadas: comando com marcadores e valores enviados separadamente.' },
    { q: 'Parâmetros servem para nomes de colunas?', a: 'Não; use uma lista de permissão para identificadores.' },
    { q: 'Por que conferir totais com consulta de controle?', a: 'Para detectar duplicação, filtros errados e outros erros que produzem números plausíveis porém incorretos.' },
    { q: 'O que significa menor privilégio?', a: 'A conta da aplicação só tem as permissões estritamente necessárias.' }
  ]
}
];
