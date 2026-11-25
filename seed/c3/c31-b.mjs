// C3.1 — SQL essencial. Aulas 4 a 6 (JOINs I; JOINs II e duplicação; agregações e GROUP BY).
const R = String.raw;

export const REF2 = {
  joins: { title: 'PostgreSQL 17 — Joined Tables', url: 'https://www.postgresql.org/docs/17/queries-table-expressions.html', kind: 'doc' },
  tutJoin: { title: 'PostgreSQL 17 — Joins Between Tables (tutorial)', url: 'https://www.postgresql.org/docs/17/tutorial-join.html', kind: 'doc' },
  tutAgg: { title: 'PostgreSQL 17 — Aggregate Functions (tutorial)', url: 'https://www.postgresql.org/docs/17/tutorial-agg.html', kind: 'doc' },
  aggFunc: { title: 'PostgreSQL 17 — Aggregate Functions', url: 'https://www.postgresql.org/docs/17/functions-aggregate.html', kind: 'doc' },
  groupby: { title: 'PostgreSQL 17 — GROUP BY e HAVING', url: 'https://www.postgresql.org/docs/17/queries-table-expressions.html#QUERIES-GROUP', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'sqe-04', moduleId: 'm2', order: 4, minutes: 70, tags: ['JOIN', 'INNER JOIN', 'LEFT JOIN', 'ON', 'chave estrangeira'],
  title: 'JOINs I: juntando tabelas com INNER JOIN e LEFT JOIN',
  objectives: ['Explicar o que um JOIN faz (combina linhas de duas tabelas por uma condição)', 'Escrever §INNER JOIN§ e §LEFT JOIN§ com a condição §ON§ correta', 'Encadear vários JOINs com apelidos de tabela', 'Achar linhas sem correspondência (anti-join com §LEFT JOIN ... IS NULL§)', 'Prever a diferença entre filtrar no §ON§ e no §WHERE§ em um LEFT JOIN'],
  intro: R`Os dados de um banco relacional ficam **separados em várias tabelas** (aula sqe-01). Para responder "quais pedidos cada cliente fez?", é preciso **juntar** as tabelas, e é isso que o §JOIN§ faz. É o conceito mais importante e mais mal compreendido do SQL. Todas as saídas abaixo foram medidas no PostgreSQL 17.`,
  theory: R`### A ideia do JOIN
Um §JOIN§ combina **cada linha** da tabela da esquerda com **as linhas da tabela da direita que satisfazem a condição §ON§**. O resultado é uma **nova tabela** com as colunas das duas. O ponto de partida é conceitual: o JOIN é um **produto cartesiano filtrado** (todas as combinações possíveis, mantendo as que satisfazem a condição); o banco, claro, não gera todas as combinações, e usa índices e algoritmos eficientes (C3.3).

### INNER JOIN
§§§
SELECT c.nome, p.id AS pedido, p.status
FROM clientes c
INNER JOIN pedidos p ON p.cliente_id = c.id
ORDER BY p.id;
§§§
Mantém **só os pares que casam**. Medido: 4 linhas (Ana 10, Ana 11, Bruno 12 e Carla 13). **Diego**, que não tem pedidos, **não aparece**. §JOIN§ sozinho significa §INNER JOIN§. Apelidos de tabela (§c§, §p§) encurtam o texto e **desambiguam** colunas de mesmo nome (§c.id§ e §p.id§).

### LEFT JOIN (LEFT OUTER JOIN)
Mantém **todas as linhas da esquerda**; quando não há correspondência, as colunas da direita vêm como **NULL**. Medido: o mesmo par de tabelas com §LEFT JOIN§ devolveu **5 linhas**: as 4 anteriores mais **Diego com pedido NULL**. Use-o quando a pergunta é "**para cada cliente**, mostre os pedidos, **mesmo que não tenha nenhum**".

### Anti-join: quem não tem correspondência
§§§
SELECT c.nome
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.id IS NULL;
§§§
Medido: devolveu **Diego**. O teste §IS NULL§ vale sobre uma coluna que **nunca é NULL** nas linhas que casam (a chave primária do lado direito). É um padrão para "clientes sem pedidos" (a alternativa com §NOT EXISTS§ aparece na aula sqe-07).

### ON x WHERE em um LEFT JOIN
Esta é a armadilha clássica. Medido, duas consultas aparentemente equivalentes:
- **filtro no §ON§:** §LEFT JOIN pedidos p ON p.cliente_id = c.id AND p.status = 'pago'§ devolveu os **4 clientes**: Ana (10), Bruno (12), Carla e Diego com pedido NULL. O filtro faz parte da **regra de casamento**; quem não tem pedido pago continua aparecendo.
- **filtro no §WHERE§:** §LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.status = 'pago'§ devolveu **só Ana e Bruno**. O §WHERE§ roda **depois** do JOIN e descarta as linhas em que §p.status§ é NULL (Carla e Diego), o que **transforma o LEFT JOIN em INNER JOIN**.
Regra: em **OUTER JOIN**, condições sobre a tabela "opcional" vão no §ON§; condições sobre a tabela preservada vão no §WHERE§.

### Vários JOINs
§§§
SELECT pr.nome AS produto, i.quantidade, ped.id AS pedido, c.nome AS cliente
FROM itens i
JOIN produtos pr ON pr.id = i.produto_id
JOIN pedidos ped ON ped.id = i.pedido_id
JOIN clientes c ON c.id = ped.cliente_id
ORDER BY ped.id, pr.id;
§§§
Medido: 6 linhas, uma por item (por exemplo, "Caneta, 10, pedido 10, Ana"). Leia em cadeia: cada §JOIN§ acrescenta uma tabela ao resultado acumulado. A **ordem de escrita** não é a ordem de execução: o otimizador escolhe a mais eficiente para JOINs internos.

### Escrevendo a condição ON
- Junte pela **chave estrangeira** e a **chave referenciada** (§p.cliente_id = c.id§).
- Para chaves **compostas**, use §AND§ entre os pares de colunas.
- Esquecer a condição transforma o JOIN em produto cartesiano (aula sqe-05).
- §USING (coluna)§ e §NATURAL JOIN§ são atalhos: §USING§ exige colunas **de mesmo nome** nas duas tabelas. Medido: §clientes JOIN pedidos USING (id)§ devolveu **0 linhas** (juntou o id do cliente com o id do pedido, que não têm relação!) e §pedidos NATURAL JOIN clientes§ também devolveu **0 linhas**, pois usa todas as colunas de mesmo nome (aqui, só §id§). **Evite §NATURAL JOIN§**: ele muda de significado quando alguém adiciona uma coluna homônima.

### Pensando em JOIN
Antes de escrever, responda: (1) **qual é a "linha" do resultado** (um pedido? um item? um cliente?), (2) **quais tabelas** fornecem as colunas, (3) como elas se ligam, (4) se **linhas sem correspondência** devem aparecer. A resposta de (1) é a **granularidade**; errar a granularidade é o erro mais comum (aula sqe-05).`,
  concepts: [
    { term: 'JOIN', def: 'Operação que combina linhas de duas tabelas segundo uma condição.' },
    { term: 'INNER JOIN', def: 'JOIN que mantém apenas os pares de linhas que satisfazem a condição.' },
    { term: 'LEFT JOIN', def: 'JOIN que mantém todas as linhas da esquerda, preenchendo a direita com NULL quando não há correspondência.' },
    { term: 'ON', def: 'Cláusula com a condição que define quais linhas se casam em um JOIN.' },
    { term: 'Apelido de tabela', def: 'Nome curto dado a uma tabela na consulta, usado para qualificar colunas.' },
    { term: 'Anti-join', def: 'Consulta que busca linhas sem correspondência em outra tabela (LEFT JOIN com IS NULL ou NOT EXISTS).' },
    { term: 'Granularidade', def: 'O que cada linha do resultado representa (um pedido, um item, um cliente).' },
    { term: 'USING', def: 'Atalho de JOIN para colunas de mesmo nome nas duas tabelas.' },
    { term: 'NATURAL JOIN', def: 'JOIN que usa automaticamente todas as colunas de mesmo nome; frágil e desaconselhado.' },
    { term: 'Tabela preservada', def: 'Em um OUTER JOIN, o lado cujas linhas são todas mantidas.' }
  ],
  examples: R`**Analogia:** o JOIN é como **cruzar duas listas de convidados** usando um código. A lista de clientes e a lista de pedidos têm, cada uma, o código do cliente. O **INNER JOIN** entrega só quem aparece nas duas listas. O **LEFT JOIN** entrega **todos os clientes**, deixando em branco a coluna de pedidos de quem não pediu nada. Filtrar "só os pedidos pagos" **dentro da regra de cruzamento** (ON) mantém os clientes sem pedido pago; filtrar **depois** (WHERE) elimina os em branco e faz o LEFT JOIN virar INNER.

**Exemplo 1: cliente sem pedido.** O LEFT JOIN trouxe Diego com NULL; o anti-join devolveu só ele.

**Exemplo 2: ON x WHERE.** Quatro clientes com o filtro no ON; dois com o filtro no WHERE.

**Exemplo 3: cadeia de JOINs.** Seis itens com produto, quantidade, pedido e cliente, em uma só consulta.`,
  code: [
    { title: 'INNER, LEFT e anti-join (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`SELECT c.nome, p.id AS pedido
FROM clientes c
INNER JOIN pedidos p ON p.cliente_id = c.id;        -- 4 linhas (sem Diego)

SELECT c.nome, p.id AS pedido
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id;         -- 5 linhas (Diego com NULL)

SELECT c.nome
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.id IS NULL;                                 -- Diego`, notes: [{ l: '3', t: 'INNER JOIN descarta quem não tem correspondência.' }, { l: '7', t: 'LEFT JOIN preserva todos os clientes.' }, { l: '12', t: 'IS NULL sobre a chave da direita identifica os sem correspondência.' }] },
    { title: 'Filtro no ON x filtro no WHERE (SQL, saída medida)', lang: 'sql', code: R`-- filtro no ON: continua com os 4 clientes
SELECT c.nome, p.id
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id AND p.status = 'pago'
ORDER BY c.id;          -- Ana 10 | Bruno 12 | Carla NULL | Diego NULL

-- filtro no WHERE: o LEFT JOIN vira INNER JOIN
SELECT c.nome, p.id
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.status = 'pago'
ORDER BY c.id;          -- Ana 10 | Bruno 12`, notes: [{ l: '4', t: 'A condição extra é parte da regra de casamento: quem não casa recebe NULL.' }, { l: '12', t: 'No WHERE, a linha com status NULL é descartada e os clientes sem pedido pago somem.' }] }
  ],
  bestPractices: ['Defina primeiro a granularidade do resultado e só depois escolha as tabelas.', 'Junte sempre por chave estrangeira e chave referenciada, com apelidos claros.', 'Em OUTER JOIN, ponha filtros da tabela opcional no ON.', 'Use LEFT JOIN com IS NULL (ou NOT EXISTS) para anti-joins.', 'Prefira ON explícito a USING e evite NATURAL JOIN.', 'Confira o número de linhas do resultado contra o esperado.'],
  mistakes: ['Esquecer a condição do JOIN e gerar produto cartesiano.', 'Filtrar a tabela opcional no WHERE e perder o efeito do LEFT JOIN.', 'Usar NATURAL JOIN ou USING com colunas homônimas sem relação (medido: 0 linhas).', 'Usar INNER JOIN quando a pergunta pede "mesmo sem correspondência".', 'Testar IS NULL em uma coluna que pode ser NULL nos casamentos.', 'Usar nomes de colunas ambíguos sem qualificar com o apelido.'],
  market: R`JOINs aparecem em praticamente todo relatório e API de leitura. Bugs de "cliente sumiu do relatório" ou "total duplicado" vêm de INNER x LEFT e de filtros no lugar errado. Em entrevistas, a pergunta "qual a diferença entre filtrar no ON e no WHERE?" é recorrente.`,
  summary: R`O JOIN combina linhas por uma condição. §INNER JOIN§ mantém só os casamentos (medido: 4 linhas, sem Diego); §LEFT JOIN§ preserva a esquerda com NULL na direita (5 linhas); §LEFT JOIN ... WHERE p.id IS NULL§ acha quem não tem correspondência (Diego). Filtro no §ON§ mantém os 4 clientes; no §WHERE§ restam 2 e o LEFT vira INNER. Cadeias de JOINs acrescentam uma tabela por vez. Evite §NATURAL JOIN§ e §USING§ com colunas sem relação (medido: 0 linhas).`,
  refs: [REF2.joins, REF2.tutJoin],
  cards: [
    { q: 'Qual a diferença entre INNER e LEFT JOIN?', a: 'INNER mantém só os pares que casam; LEFT mantém todas as linhas da esquerda, com NULL na direita quando não há correspondência.' },
    { q: 'Como achar clientes sem pedidos?', a: 'LEFT JOIN pedidos ... WHERE p.id IS NULL (ou NOT EXISTS).' },
    { q: 'Por que filtrar a tabela opcional no WHERE estraga um LEFT JOIN?', a: 'O WHERE descarta as linhas com NULL e o LEFT JOIN vira INNER; o filtro deve ir no ON.' },
    { q: 'O que é granularidade do resultado?', a: 'O que uma linha do resultado representa (um pedido, um item, um cliente).' },
    { q: 'Por que evitar NATURAL JOIN?', a: 'Ele usa todas as colunas homônimas e muda de significado quando uma coluna nova com o mesmo nome aparece.' }
  ]
},
{
  id: 'sqe-05', moduleId: 'm2', order: 5, minutes: 65, tags: ['JOIN', 'FULL JOIN', 'CROSS JOIN', 'self join', 'duplicação', 'granularidade'],
  title: 'JOINs II: FULL, CROSS, auto-junção e o perigo da duplicação',
  objectives: ['Usar §FULL JOIN§, §CROSS JOIN§ e a auto-junção (self join)', 'Prever o número de linhas de um JOIN um-para-muitos', 'Identificar e corrigir somas duplicadas por JOIN (armadilha de granularidade)', 'Explicar por que §DISTINCT§ não é correção para duplicação', 'Escolher o tipo de JOIN pela pergunta de negócio'],
  intro: R`Os tipos §INNER§ e §LEFT§ resolvem a maioria dos casos. Esta aula completa o conjunto (§FULL§, §CROSS§, a **auto-junção**) e trata o erro mais caro de SQL de relatório: **a duplicação silenciosa**. Quando se junta uma tabela "um" com uma tabela "muitos", cada linha "um" se **repete** e qualquer soma sobre ela fica errada.`,
  theory: R`### RIGHT e FULL JOIN
§RIGHT JOIN§ é o espelho do §LEFT JOIN§ (preserva a direita); troque a ordem das tabelas e use §LEFT§, que é mais fácil de ler. §FULL JOIN§ preserva **as duas** tabelas: casam quando possível e, onde não há correspondência, o outro lado vem NULL. Medido: §clientes FULL JOIN pedidos ON p.cliente_id = c.id AND p.status = 'pago'§ devolveu **6 linhas**: Ana-10 e Bruno-12 (casaram), Carla e Diego sem pedido pago, e os pedidos 11 e 13 sem cliente (nesta condição, não casaram com ninguém). Uso típico: **conciliar** duas fontes ("o que existe em A e não em B, e vice-versa").

### CROSS JOIN
Produz **todas as combinações** (sem condição). Medido: 4 clientes × 5 produtos = **20 linhas**. É útil de propósito (gerar uma grade de datas × produtos, por exemplo) e **desastroso por acidente**: um JOIN sem condição de uma tabela com 1 milhão de linhas com outra de 1 milhão gera 10¹² linhas.

### Auto-junção (self join)
Uma tabela pode ser junta a si mesma, com **dois apelidos**. Medido: §clientes a JOIN clientes b ON a.cidade = b.cidade AND a.id < b.id§ devolveu **Ana e Carla**, as duas de Porto Alegre. A condição §a.id < b.id§ evita pares repetidos (Ana-Carla e Carla-Ana) e a comparação de uma linha consigo mesma. Usos: hierarquias (funcionário e gerente), pares de itens, comparação entre linhas da mesma tabela.

### A armadilha da duplicação
Cada pedido tem vários itens. Se juntarmos §pedidos§ com §itens§, cada pedido **aparece uma vez por item**. Medido: a tabela §pedidos§ tem **4 linhas**, mas §pedidos JOIN itens§ tem **6**. Qualquer agregação feita sobre colunas **do pedido** (por exemplo, somar um frete que está em §pedidos§) conta o mesmo valor várias vezes. Por isso é essencial saber a **granularidade** de cada tabela e do resultado.
Exemplo medido de **contagem enganosa**: agrupando por status, §count(*)§ devolveu **4** para "pago", mas há só **2 pedidos pagos**: o 4 são **linhas de item** (pedido 10 com 2 itens e pedido 12 com 2 itens). §count(DISTINCT ped.id)§ devolveu o valor correto, **2**. Ao somar, o valor do **item** (preço × quantidade) está correto porque a granularidade do item é a do JOIN: **341,70** no total (medido), igual à soma dos itens.

### Como se proteger
1. **Declare a granularidade** antes de escrever: "uma linha por item", "uma linha por pedido", "uma linha por cliente".
2. **Agregue antes de juntar** quando precisar combinar tabelas de granularidades diferentes: calcule a soma dos itens por pedido em uma subconsulta/CTE (aulas sqe-07 e sqe-08) e junte o resultado.
3. **Use §count(DISTINCT chave)§** para contar entidades, mas lembre que isso **não corrige somas** (somar sobre colunas repetidas continua errado).
4. **Compare totais** com uma consulta mais simples (por exemplo, o total geral da tabela de itens).
5. **Não use §DISTINCT§ para "consertar"**: ele remove linhas idênticas, mas dois itens diferentes de mesmo valor podem ser colapsados e o total fica **subestimado**; o erro muda de direção, não some.

### Escolhendo o JOIN pela pergunta
- "Pedidos **e** seus clientes" → INNER.
- "**Todos os clientes**, com pedidos se houver" → LEFT.
- "Clientes **sem** pedidos" → LEFT + IS NULL (ou NOT EXISTS).
- "O que existe **só em um dos lados**" → FULL + filtros de NULL.
- "Todas as combinações" → CROSS (conscientemente).
- "Relação entre linhas da mesma tabela" → self join.

### Desempenho em uma frase
O custo de um JOIN depende de **índices** nas colunas de junção e do **tamanho** dos conjuntos; o plano de execução e os índices são o tema do curso C3.3.`,
  concepts: [
    { term: 'FULL JOIN', def: 'JOIN que preserva as linhas das duas tabelas, com NULL onde não há correspondência.' },
    { term: 'CROSS JOIN', def: 'JOIN sem condição que produz todas as combinações de linhas das duas tabelas.' },
    { term: 'Auto-junção', def: 'JOIN de uma tabela com ela mesma, usando dois apelidos.' },
    { term: 'Produto cartesiano', def: 'Conjunto de todos os pares formados por uma linha de cada tabela.' },
    { term: 'Duplicação por JOIN', def: 'Repetição de linhas do lado "um" quando junto ao lado "muitos", que distorce somas e contagens.' },
    { term: 'Um-para-muitos', def: 'Relação em que uma linha de uma tabela se associa a várias linhas de outra.' },
    { term: 'count(DISTINCT)', def: 'Contagem de valores distintos; conta entidades, mas não corrige somas duplicadas.' },
    { term: 'Agregar antes de juntar', def: 'Calcular os totais por chave em uma subconsulta ou CTE e só então fazer o JOIN.' },
    { term: 'Conciliação', def: 'Comparação de duas fontes para achar itens que existem em uma e faltam na outra.' },
    { term: 'Explosão de linhas', def: 'Crescimento inesperado do número de linhas de um JOIN sem condição ou com condição frouxa.' }
  ],
  examples: R`**Analogia:** imagine uma **nota fiscal com várias linhas de produto**. O cabeçalho tem o frete de R$ 20. Se você "achata" a nota em uma planilha com **uma linha por produto** e repete o cabeçalho em cada linha, somar a coluna do frete dá R$ 20 **vezes o número de produtos**. O JOIN faz exatamente esse achatamento. A solução é somar o frete **no nível do cabeçalho** (agregar antes de juntar) ou contar o cabeçalho **uma vez só**.

**Exemplo 1: duplicação medida.** Pedidos: 4 linhas; pedidos JOIN itens: 6 linhas.

**Exemplo 2: contagem enganosa.** Status pago: count(*) = 4 (itens), count(DISTINCT pedido) = 2.

**Exemplo 3: auto-junção.** Pares de clientes da mesma cidade: só Ana e Carla.`,
  code: [
    { title: 'Duplicação e a contagem correta (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`SELECT count(*) FROM pedidos;                                    -- 4
SELECT count(*) FROM pedidos p JOIN itens i ON i.pedido_id = p.id; -- 6

SELECT ped.status,
       count(*)                AS linhas_de_item,
       count(DISTINCT ped.id)  AS pedidos_distintos
FROM pedidos ped
JOIN itens i ON i.pedido_id = ped.id
GROUP BY ped.status
ORDER BY ped.status;
-- aberto 1 1 | cancelado 1 1 | pago 4 2`, notes: [{ l: '2', t: 'Seis linhas para quatro pedidos: cada pedido repete uma vez por item.' }, { l: '5', t: 'count(*) conta linhas do JOIN (itens), não pedidos.' }, { l: '6', t: 'count(DISTINCT) conta pedidos de verdade.' }] },
    { title: 'FULL, CROSS e auto-junção (SQL, saída medida)', lang: 'sql', code: R`SELECT c.nome, p.id AS pedido
FROM clientes c
FULL JOIN pedidos p ON p.cliente_id = c.id AND p.status = 'pago'
ORDER BY c.id, p.id;   -- Ana 10 | Bruno 12 | Carla - | Diego - | - 11 | - 13

SELECT count(*) FROM clientes CROSS JOIN produtos;   -- 20

SELECT a.nome AS cliente_a, b.nome AS cliente_b
FROM clientes a
JOIN clientes b ON a.cidade = b.cidade AND a.id < b.id;   -- Ana | Carla`, notes: [{ l: '3', t: 'FULL preserva as duas pontas: clientes sem pedido pago e pedidos sem cliente neste casamento.' }, { l: '6', t: '4 x 5 combinações: sem condição, o produto cartesiano.' }, { l: '10', t: 'a.id < b.id evita pares repetidos e a comparação consigo mesmo.' }] }
  ],
  bestPractices: ['Declare a granularidade do resultado antes de juntar.', 'Agregue antes de juntar quando as granularidades diferirem.', 'Use count(DISTINCT chave) para contar entidades.', 'Compare totais com uma consulta simples de controle.', 'Use CROSS JOIN apenas de propósito e com tabelas pequenas.', 'Prefira LEFT a RIGHT para legibilidade.'],
  mistakes: ['Somar uma coluna do lado "um" depois de juntar com o lado "muitos".', 'Usar DISTINCT para esconder duplicação.', 'Esquecer a condição e gerar produto cartesiano.', 'Contar com count(*) achando que conta pedidos.', 'Usar FULL JOIN sem necessidade, complicando a leitura.', 'Fazer auto-junção sem evitar pares repetidos.'],
  market: R`Relatórios financeiros com totais duplicados são um dos bugs mais caros do dia a dia de dados: o número está "quase certo" e passa despercebido. Saber nomear a granularidade e agregar antes de juntar é uma habilidade que equipes de dados e de backend procuram.`,
  summary: R`§FULL JOIN§ preserva os dois lados, §CROSS JOIN§ gera todas as combinações (4 × 5 = 20, medido) e a auto-junção compara linhas da mesma tabela (Ana e Carla). Juntar o lado "um" ao lado "muitos" **duplica** o "um" (4 pedidos viram 6 linhas): §count(*)§ por status deu 4 para "pago" contra 2 pedidos reais (§count(DISTINCT)§). Declare a granularidade, agregue antes de juntar e não use §DISTINCT§ para consertar duplicação.`,
  refs: [REF2.joins, REF2.tutJoin],
  cards: [
    { q: 'O que um CROSS JOIN produz?', a: 'Todas as combinações de linhas das duas tabelas; 4 clientes por 5 produtos geram 20 linhas.' },
    { q: 'Por que um JOIN um-para-muitos duplica somas?', a: 'Cada linha do lado "um" se repete uma vez por linha do lado "muitos"; somar suas colunas conta o valor várias vezes.' },
    { q: 'Como contar pedidos corretamente após juntar com itens?', a: 'count(DISTINCT pedido_id), não count(*).' },
    { q: 'DISTINCT corrige somas duplicadas?', a: 'Não: pode colapsar linhas legítimas e o total muda de direção; corrija a granularidade (agregue antes de juntar).' },
    { q: 'Para que serve a condição a.id < b.id em uma auto-junção?', a: 'Evita pares repetidos e a comparação de uma linha com ela mesma.' }
  ]
},
{
  id: 'sqe-06', moduleId: 'm2', order: 6, minutes: 70, tags: ['GROUP BY', 'HAVING', 'agregação', 'count', 'sum', 'avg', 'FILTER'],
  title: 'Agregações: GROUP BY, HAVING, funções de agregação e FILTER',
  objectives: ['Usar §count§, §sum§, §avg§, §min§ e §max§ e prever o efeito do NULL', 'Agrupar com §GROUP BY§ e explicar a regra "toda coluna não agregada deve estar no GROUP BY"', 'Distinguir §WHERE§ (filtra linhas) de §HAVING§ (filtra grupos)', 'Usar §FILTER§, §count(DISTINCT)§ e §string_agg§', 'Tratar grupos vazios com §coalesce§ e §LEFT JOIN§'],
  intro: R`Agregar é **resumir muitas linhas em poucos números**: total vendido por mês, média por categoria, clientes por cidade. Em SQL isso é feito com **funções de agregação** e o §GROUP BY§. Os erros típicos são esquecer como o NULL se comporta, misturar §WHERE§ e §HAVING§ e contar linhas de um JOIN achando que são entidades (aula anterior).`,
  theory: R`### Funções de agregação
Uma função de agregação recebe **várias linhas** e devolve **um valor**: §count§, §sum§, §avg§, §min§, §max§ e §string_agg§ (concatena). Medido na tabela de produtos: por categoria, **acessorios** teve 2 produtos, média 82,50, mínimo 45,00 e máximo 120,00; **papelaria** teve 3 produtos, média 8,13, mínimo 2,00 e máximo 18,90.
**NULL:** as agregações **ignoram NULL** (exceto §count(*)§). Medido: §count(*)§ = 4, §count(cidade)§ = 3 e §count(DISTINCT cidade)§ = **2** (Porto Alegre e Caxias do Sul). §avg§ só considera os valores não nulos (se faltarem dados, a média é de quem tem).
**Grupo vazio:** §sum§ de nenhuma linha devolve **NULL**, não zero (medido: §sum(preco)§ da categoria inexistente deu NULL; §coalesce(sum(preco), 0)§ deu 0). §count§ de nenhuma linha devolve 0.
Resultado de §avg§ em §numeric§ tem muitas casas decimais (medido: 8,1333333333333333): use §round§ para exibir.

### GROUP BY
§§§
SELECT categoria, count(*) AS n, round(avg(preco), 2) AS media
FROM produtos
GROUP BY categoria
ORDER BY categoria;
§§§
Cria **um grupo por valor** de §categoria§ e calcula as agregações **dentro de cada grupo**. **Regra:** toda coluna na lista do §SELECT§ que **não é agregada** precisa estar no §GROUP BY§ (ou ser funcionalmente dependente da chave primária agrupada, no PostgreSQL). Medido: §SELECT nome, categoria, count(*) FROM produtos GROUP BY categoria§ falhou com **column "produtos.nome" must appear in the GROUP BY clause or be used in an aggregate function**: o banco não sabe qual nome mostrar para o grupo todo. (Alguns bancos permitem isso silenciosamente e devolvem um valor arbitrário; o PostgreSQL protege você.)
Agrupar por várias colunas (§GROUP BY ano, categoria§) cria um grupo por **combinação**. Agrupe pela **chave** da entidade, não só pelo nome: dois clientes podem se chamar "Ana" (§GROUP BY c.id, c.nome§).

### WHERE x HAVING
- §WHERE§ filtra **linhas antes** de agrupar (não pode usar agregações).
- §HAVING§ filtra **grupos depois** de agregar (pode usar agregações).
Medido: clientes cujo gasto total passa de 100 (§HAVING sum(preco*quantidade) > 100§) devolveu Ana (192,80) e Bruno (108,90). Outro exemplo: §WHERE preco > 10 GROUP BY categoria HAVING count(*) >= 2§ devolveu só acessorios (2), pois na papelaria só o Caderno custa mais de 10. **Regra de desempenho:** o que puder ser filtrado por linha, filtre no §WHERE§ (reduz o trabalho do agrupamento).

### FILTER, DISTINCT e string_agg
- §count(*) FILTER (WHERE preco > 10)§ conta **só as linhas que satisfazem** a condição, dentro do grupo. Medido: acessorios 2 e papelaria 1. Permite várias contagens condicionais em uma só passagem (em outros bancos usa-se §CASE WHEN§ dentro da agregação).
- §count(DISTINCT x)§ conta valores distintos; §sum(DISTINCT x)§ existe, mas é raramente o que se quer.
- §string_agg(nome, ', ' ORDER BY nome)§ junta textos. Medido: papelaria → "Caderno, Caneta, Lápis".

### Agregando sobre JOINs
Agregações sobre JOINs herdam o problema de granularidade (aula sqe-05). Medido: por status, as linhas de item e os pedidos distintos diferem (**pago: 4 itens, 2 pedidos**). O valor total por status somando preço × quantidade (181,70 para pago) está correto porque o item é a granularidade da soma.
**Contando filhos com LEFT JOIN:** §count(p.id)§ conta apenas pedidos existentes (Diego → **0**); §count(*)§ conta a linha do cliente mesmo sem pedido (Diego → **1**, errado). Medido nos dois. Regra: com LEFT JOIN, conte uma **coluna da tabela opcional**.

### Ordem lógica, de novo
§FROM§ → §WHERE§ → §GROUP BY§ → §HAVING§ → §SELECT§ → §ORDER BY§ → §LIMIT§. Por isso §HAVING§ pode usar agregações e o §WHERE§ não; e §ORDER BY§ pode ordenar por uma agregação (§ORDER BY sum(...) DESC§).

### Conjuntos de agrupamento (visão geral)
O padrão SQL oferece §GROUPING SETS§, §ROLLUP§ e §CUBE§ para subtotais e totais gerais em uma só consulta (documentados pelo PostgreSQL); são tema do curso C3.2 (SQL analítico).`,
  concepts: [
    { term: 'Função de agregação', def: 'Função que resume várias linhas em um valor (count, sum, avg, min, max).' },
    { term: 'GROUP BY', def: 'Cláusula que forma grupos de linhas por valores de colunas para agregar dentro de cada grupo.' },
    { term: 'HAVING', def: 'Cláusula que filtra grupos depois da agregação.' },
    { term: 'FILTER', def: 'Cláusula que restringe as linhas consideradas por uma agregação específica.' },
    { term: 'count(*) x count(coluna)', def: 'count(*) conta linhas; count(coluna) ignora NULL.' },
    { term: 'coalesce', def: 'Função que devolve o primeiro argumento não nulo; usada para trocar NULL por um padrão.' },
    { term: 'string_agg', def: 'Agregação que concatena textos de um grupo com um separador.' },
    { term: 'Grupo', def: 'Conjunto de linhas com os mesmos valores nas colunas do GROUP BY.' },
    { term: 'Dependência funcional', def: 'Relação em que uma coluna é determinada por outra (nome depende da chave primária).' },
    { term: 'GROUPING SETS / ROLLUP / CUBE', def: 'Extensões do GROUP BY para subtotais e totais em uma só consulta.' }
  ],
  examples: R`**Analogia:** agregar é **fechar o caixa**: você separa as notas por categoria (GROUP BY), soma cada pilha (sum) e conta quantas notas há (count). O WHERE é descartar notas **antes** de separar (por exemplo, as de teste); o HAVING é descartar **pilhas inteiras** depois de somar (por exemplo, as que ficaram abaixo de um valor). Contar linhas de JOIN é como contar **cada recibo anexado** a uma nota como se fosse uma nota diferente.

**Exemplo 1: resumo por categoria.** Duas linhas de resultado, com contagem, média, mínimo e máximo.

**Exemplo 2: HAVING.** Apenas clientes com gasto acima de 100: Ana (192,80) e Bruno (108,90).

**Exemplo 3: LEFT JOIN e contagem.** Diego tem 0 pedidos com count(p.id) e 1 (errado) com count(*).`,
  code: [
    { title: 'Resumo por categoria e HAVING (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`SELECT categoria, count(*) AS n, round(avg(preco), 2) AS media,
       min(preco), max(preco)
FROM produtos
GROUP BY categoria
ORDER BY categoria;      -- acessorios 2 82.50 45.00 120.00 | papelaria 3 8.13 2.00 18.90

SELECT c.nome, sum(pr.preco * i.quantidade) AS gasto
FROM clientes c
JOIN pedidos ped ON ped.cliente_id = c.id
JOIN itens i ON i.pedido_id = ped.id
JOIN produtos pr ON pr.id = i.produto_id
GROUP BY c.id, c.nome
HAVING sum(pr.preco * i.quantidade) > 100
ORDER BY gasto DESC;     -- Ana 192.80 | Bruno 108.90`, notes: [{ l: '4', t: 'Um grupo por categoria; as agregações rodam dentro de cada grupo.' }, { l: '12', t: 'Agrupe pela chave (c.id) e inclua o nome para exibir.' }, { l: '13', t: 'HAVING filtra os grupos depois da soma.' }] },
    { title: 'FILTER, grupos vazios e contagem com LEFT JOIN (SQL, saída medida)', lang: 'sql', code: R`SELECT categoria, count(*) FILTER (WHERE preco > 10) AS caros
FROM produtos GROUP BY categoria ORDER BY 1;       -- acessorios 2 | papelaria 1

SELECT sum(preco) FROM produtos WHERE categoria = 'nenhuma';                 -- NULL
SELECT coalesce(sum(preco), 0) FROM produtos WHERE categoria = 'nenhuma';   -- 0

SELECT c.nome, count(p.id) AS pedidos       -- Ana 2 | Bruno 1 | Carla 1 | Diego 0
FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id, c.nome ORDER BY c.id;

SELECT c.nome, count(*) AS errado           -- Diego aparece com 1
FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id, c.nome ORDER BY c.id;`, notes: [{ l: '1', t: 'FILTER conta só as linhas que satisfazem a condição, por grupo.' }, { l: '4', t: 'Soma de um conjunto vazio é NULL, não zero.' }, { l: '7', t: 'Com LEFT JOIN, conte uma coluna da tabela opcional.' }, { l: '11', t: 'count(*) conta a linha do cliente mesmo sem pedido: Diego sai com 1.' }] }
  ],
  bestPractices: ['Filtre linhas no WHERE e grupos no HAVING.', 'Agrupe pela chave da entidade.', 'Trate grupos vazios com coalesce quando o NULL for indesejado.', 'Use count(coluna da tabela opcional) após LEFT JOIN.', 'Use round e formatação só na apresentação.', 'Confira os totais com uma consulta de controle.'],
  mistakes: ['Usar agregação no WHERE.', 'Selecionar colunas não agregadas fora do GROUP BY.', 'Esquecer que sum de vazio é NULL.', 'Contar linhas de JOIN como entidades.', 'Agrupar só pelo nome em vez da chave.', 'Usar count(*) após LEFT JOIN para contar filhos.'],
  market: R`Agregações são a base de dashboards e relatórios. As perguntas mais comuns de teste técnico são "qual a diferença entre WHERE e HAVING?" e "o que count(coluna) faz com NULL?". Erros de granularidade em agregações geram números errados em painéis de decisão.`,
  summary: R`As agregações resumem linhas e ignoram NULL (§count(*)§ 4, §count(cidade)§ 3, distintas 2). §GROUP BY§ forma grupos e exige que as colunas não agregadas estejam no agrupamento (o PostgreSQL recusa o contrário). §WHERE§ filtra linhas, §HAVING§ filtra grupos (medido: Ana e Bruno com gasto acima de 100). §FILTER§ faz contagens condicionais; §sum§ de vazio é NULL (use §coalesce§); após §LEFT JOIN§ conte uma coluna da tabela opcional (Diego 0, não 1).`,
  refs: [REF2.tutAgg, REF2.aggFunc, REF2.groupby],
  cards: [
    { q: 'Qual a diferença entre WHERE e HAVING?', a: 'WHERE filtra linhas antes do agrupamento; HAVING filtra grupos depois das agregações.' },
    { q: 'Por que SELECT nome ... GROUP BY categoria falha?', a: 'nome não é agregado nem está no GROUP BY; o banco não sabe qual valor mostrar para o grupo.' },
    { q: 'O que sum devolve para zero linhas?', a: 'NULL (e não 0); use coalesce(sum(x), 0).' },
    { q: 'Como contar filhos após LEFT JOIN?', a: 'count(coluna da tabela opcional), por exemplo count(p.id); count(*) conta o pai mesmo sem filhos.' },
    { q: 'Para que serve FILTER?', a: 'Para restringir as linhas de uma agregação específica dentro do grupo.' }
  ]
}
];
