// C3.2 — SQL avançado e analítico. Aulas 5 e 6 (ROLLUP, CUBE, calendário, pivot; LATERAL, estatística, JSONB e padrões analíticos).
const R = String.raw;

export const REF3 = {
  grouping: { title: 'PostgreSQL 17 — GROUPING SETS, CUBE e ROLLUP', url: 'https://www.postgresql.org/docs/17/queries-table-expressions.html#QUERIES-GROUPING-SETS', kind: 'doc' },
  distinctOn: { title: 'PostgreSQL 17 — SELECT (DISTINCT ON)', url: 'https://www.postgresql.org/docs/17/sql-select.html#SQL-DISTINCT', kind: 'doc' },
  datetime: { title: 'PostgreSQL 17 — Date/Time Functions', url: 'https://www.postgresql.org/docs/17/functions-datetime.html', kind: 'doc' },
  setReturning: { title: 'PostgreSQL 17 — Set Returning Functions (generate_series)', url: 'https://www.postgresql.org/docs/17/functions-srf.html', kind: 'doc' },
  lateral: { title: 'PostgreSQL 17 — LATERAL Subqueries', url: 'https://www.postgresql.org/docs/17/queries-table-expressions.html#QUERIES-LATERAL', kind: 'doc' },
  orderedSet: { title: 'PostgreSQL 17 — Ordered-Set Aggregate Functions', url: 'https://www.postgresql.org/docs/17/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE', kind: 'doc' },
  json: { title: 'PostgreSQL 17 — JSON Types', url: 'https://www.postgresql.org/docs/17/datatype-json.html', kind: 'doc' },
  jsonFunc: { title: 'PostgreSQL 17 — JSON Functions and Operators', url: 'https://www.postgresql.org/docs/17/functions-json.html', kind: 'doc' }
};

export const lessonsC = [
{
  id: 'sqa-05', moduleId: 'm3', order: 5, minutes: 75, tags: ['ROLLUP', 'CUBE', 'GROUPING SETS', 'DISTINCT ON', 'date_trunc', 'generate_series', 'pivot'],
  title: 'SQL analítico I: subtotais, séries de datas e tabelas cruzadas',
  objectives: ['Gerar subtotais e totais gerais com §ROLLUP§, §CUBE§ e §GROUPING SETS§', 'Distinguir um NULL de dado de um NULL de subtotal com §grouping()§', 'Obter "a última linha por grupo" com §DISTINCT ON§', 'Agrupar por período com §date_trunc§ e preencher meses sem dados com §generate_series§', 'Montar uma tabela cruzada (pivot) com §FILTER§'],
  intro: R`Relatórios gerenciais pedem **subtotais**, **totais gerais**, **séries por mês sem buracos** e **tabelas cruzadas** (produtos nas linhas e meses nas colunas). É possível fazer tudo isso com SQL, em uma consulta, sem pós-processar na aplicação. Esta aula reúne as ferramentas: §ROLLUP§, §CUBE§, §GROUPING SETS§, §DISTINCT ON§, §date_trunc§, §generate_series§ e §FILTER§. Resultados medidos no PostgreSQL 17.12.`,
  theory: R`### Subtotais com ROLLUP
§GROUP BY ROLLUP (regiao, nome)§ gera os totais por (região, nome), **subtotais por região** e **o total geral**. Medido (vendas por vendedor):
| regiao | nome | total |
|---|---|---|
| Norte | Carla | 1000,00 |
| Norte | Diego | 250,00 |
| Norte | (NULL) | **1250,00** |
| Sul | Ana | 700,00 |
| Sul | Bruno | 450,00 |
| Sul | (NULL) | **1150,00** |
| (NULL) | (NULL) | **2400,00** |
São **7 linhas**: 4 detalhes, 2 subtotais e 1 total geral. §ROLLUP§ respeita a **hierarquia** (do mais específico ao mais geral): (a, b), (a), (). Use em relatórios com **níveis** (região > vendedor, ano > mês > dia).

### CUBE: todas as combinações
§CUBE (regiao, produto)§ gera **todas** as combinações de agrupamento: (região, produto), (região), (produto) e (). Medido: **12 linhas** (6 detalhes, 2 subtotais por região, 3 subtotais por produto e o total 2400). Útil para análises "dimensionais" em que qualquer eixo pode ser o recorte.

### GROUPING SETS: você escolhe
§GROUPING SETS ((regiao), (produto), ())§ lista **exatamente** os agrupamentos desejados. Medido: **6 linhas** (2 regiões, 3 produtos e o total). §ROLLUP§ e §CUBE§ são atalhos para conjuntos de agrupamento específicos.

### Distinguindo NULL de subtotal: grouping()
Nas linhas de subtotal, as colunas "ausentes" aparecem como NULL, mas **um NULL real nos dados** também apareceria como NULL. A função §grouping(colunas)§ devolve um **número** (uma máscara de bits): **0** se as colunas estão no agrupamento da linha, e bits ligados para as que foram "totalizadas". Medido no CUBE: §grouping(regiao, produto)§ foi **0** nos detalhes, **1** nos subtotais por região (produto totalizado), **2** nos subtotais por produto e **3** no total geral. Use-a para **rotular** (§CASE WHEN grouping(regiao) = 1 THEN 'TODAS' ...§) ou ordenar. Medido, um rótulo simples: §coalesce(regiao, 'TOTAL')§ com §ROLLUP (regiao)§ devolveu Norte, Sul e TOTAL; ele só é seguro se a coluna **nunca for NULL** nos dados.

### DISTINCT ON (PostgreSQL)
§SELECT DISTINCT ON (vendedor_id) vendedor_id, data, valor FROM vendas ORDER BY vendedor_id, data DESC§ devolve **uma linha por vendedor**: a de data mais recente (o §ORDER BY§ define "qual linha"). Medido: Ana 2026-03-10 (300), Bruno 2026-03-01 (50), Carla 2026-03-15 (100), Diego 2026-03-20 (250). É a forma **concisa** do "primeiro/último por grupo" (a alternativa portável é §row_number()§ com filtro). O §ORDER BY§ precisa **começar** pelas expressões do §DISTINCT ON§. (Extensão do PostgreSQL: não existe em MySQL ou SQL Server.)

### Datas: date_trunc e extract
§date_trunc('month', data)§ "arredonda" a data para o **início do mês** (e também 'day', 'week', 'quarter', 'year'). Medido: totais por mês: **2026-01 = 950**, **2026-02 = 750**, **2026-03 = 700**. §extract(month FROM data)§ devolve o número do mês. Atenção a **fusos**: com §timestamptz§, o "início do mês" depende do fuso da sessão.

### generate_series: calendário sem buracos
Agrupar só os meses que **têm dados** esconde meses sem venda. Gere o calendário e use §LEFT JOIN§:
§§§
SELECT m::date AS mes, coalesce(t.total, 0) AS total
FROM generate_series('2026-01-01'::date, '2026-04-01', interval '1 month') m
LEFT JOIN (SELECT date_trunc('month', data) AS mes, sum(valor) AS total
           FROM vendas GROUP BY 1) t ON t.mes = m
ORDER BY 1;
§§§
Medido: janeiro 950, fevereiro 750, março 700 e **abril 0** (mês sem vendas, que o agrupamento simples omitiria). Essencial para gráficos de série temporal, médias móveis por dia e detecção de lacunas.

### Tabela cruzada (pivot) com FILTER
O PostgreSQL não tem um §PIVOT§ nativo; o padrão é **uma agregação condicional por coluna**:
§§§
SELECT produto,
       sum(valor) FILTER (WHERE extract(month FROM data) = 1) AS jan,
       sum(valor) FILTER (WHERE extract(month FROM data) = 2) AS fev,
       sum(valor) FILTER (WHERE extract(month FROM data) = 3) AS mar
FROM vendas GROUP BY produto ORDER BY produto;
§§§
Medido: A = 300, 150, 300; B = 150, 200, 100; C = 500, 400, 300. As colunas são **fixas na consulta**; para colunas dinâmicas, gere o SQL na aplicação (com cuidado, aula sqe-09) ou use a extensão §tablefunc§ (§crosstab§; não executada aqui). Em outros bancos, a mesma ideia usa §CASE WHEN§ dentro da agregação.

### Boas práticas de relatórios
- **Ordene** explicitamente (o resultado de ROLLUP não vem ordenado);
- **Rotule** subtotais com §grouping()§;
- Documente a **granularidade** de cada nível;
- Valide o **total geral** contra uma consulta simples (2400,00 aqui);
- Considere **materializar** relatórios caros (aula sqa-03).`,
  concepts: [
    { term: 'ROLLUP', def: 'Extensão do GROUP BY que gera subtotais hierárquicos e o total geral.' },
    { term: 'CUBE', def: 'Extensão do GROUP BY que gera todas as combinações de agrupamento das colunas.' },
    { term: 'GROUPING SETS', def: 'Extensão do GROUP BY que lista exatamente os agrupamentos desejados.' },
    { term: 'grouping()', def: 'Função que indica se uma coluna foi totalizada (subtotal) na linha de resultado.' },
    { term: 'DISTINCT ON', def: 'Extensão do PostgreSQL que mantém a primeira linha de cada grupo segundo o ORDER BY.' },
    { term: 'date_trunc', def: 'Função que arredonda uma data ou hora para o início de uma unidade (mês, semana, dia).' },
    { term: 'generate_series', def: 'Função que gera uma sequência de números ou datas, útil para calendários.' },
    { term: 'Tabela cruzada (pivot)', def: 'Tabela com valores de uma dimensão transformados em colunas.' },
    { term: 'Subtotal', def: 'Total parcial de um nível de agrupamento.' },
    { term: 'Calendário sem buracos', def: 'Série completa de períodos juntada por LEFT JOIN para exibir períodos sem dados.' }
  ],
  examples: R`**Analogia:** o ROLLUP é uma **planilha com subtotais automáticos** ("total do Norte", "total do Sul", "total geral"). O CUBE é um **painel dinâmico** em que você pode olhar por região, por produto, por ambos ou pelo todo. O generate_series é a **régua do calendário** para não esquecer os meses vazios. E o pivot é **girar a planilha**: valores que estavam nas linhas (meses) viram colunas.

**Exemplo 1: subtotais.** Sete linhas: quatro vendedores, dois subtotais de região e o total 2.400.

**Exemplo 2: o mês que sumiria.** Sem o calendário, abril não aparece; com ele, aparece com 0.

**Exemplo 3: pivot.** O produto C vendeu 500 em janeiro, 400 em fevereiro e 300 em março.`,
  code: [
    { title: 'ROLLUP, CUBE e grouping() (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`SELECT v.regiao, v.nome, sum(s.valor) AS total
FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id
GROUP BY ROLLUP (v.regiao, v.nome)
ORDER BY v.regiao NULLS LAST, v.nome NULLS LAST;   -- 7 linhas, última: NULL NULL 2400.00

SELECT v.regiao, s.produto, sum(s.valor) AS total,
       grouping(v.regiao, s.produto) AS g
FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id
GROUP BY CUBE (v.regiao, s.produto)
ORDER BY g, v.regiao NULLS LAST, s.produto NULLS LAST;   -- 12 linhas, g de 0 a 3

SELECT DISTINCT ON (vendedor_id) vendedor_id, data, valor
FROM vendas ORDER BY vendedor_id, data DESC;   -- a venda mais recente de cada vendedor`, notes: [{ l: '3', t: 'ROLLUP: detalhe, subtotal por região e total geral.' }, { l: '7', t: 'grouping distingue o NULL de subtotal de um NULL real: 0 detalhe, 1 e 2 subtotais, 3 total.' }, { l: '12', t: 'DISTINCT ON mantém a primeira linha de cada vendedor segundo o ORDER BY.' }] },
    { title: 'Calendário e tabela cruzada (SQL, saída medida)', lang: 'sql', code: R`SELECT m::date AS mes, coalesce(t.total, 0) AS total
FROM generate_series('2026-01-01'::date, '2026-04-01', interval '1 month') m
LEFT JOIN (SELECT date_trunc('month', data) AS mes, sum(valor) AS total
           FROM vendas GROUP BY 1) t ON t.mes = m
ORDER BY 1;                      -- jan 950 | fev 750 | mar 700 | abr 0

SELECT produto,
       sum(valor) FILTER (WHERE extract(month FROM data) = 1) AS jan,
       sum(valor) FILTER (WHERE extract(month FROM data) = 2) AS fev,
       sum(valor) FILTER (WHERE extract(month FROM data) = 3) AS mar
FROM vendas GROUP BY produto ORDER BY produto;   -- A 300 150 300 | B 150 200 100 | C 500 400 300`, notes: [{ l: '2', t: 'O calendário é a tabela preservada do LEFT JOIN.' }, { l: '3', t: 'date_trunc leva cada data ao início do seu mês.' }, { l: '8', t: 'Uma agregação condicional por coluna do pivot.' }] }
  ],
  bestPractices: ['Use grouping() para rotular subtotais em vez de depender de NULL.', 'Ordene explicitamente os resultados de ROLLUP, CUBE e GROUPING SETS.', 'Gere o calendário com generate_series para séries sem buracos.', 'Use date_trunc para agrupar por período e fique atento ao fuso horário.', 'Use DISTINCT ON com cuidado (é extensão do PostgreSQL); prefira row_number() quando precisar de portabilidade.', 'Valide totais gerais e subtotais com consultas de controle.'],
  mistakes: ['Confundir NULL de subtotal com NULL de dado.', 'Esquecer o ORDER BY e exibir subtotais fora de lugar.', 'Agrupar só por períodos com dados e esconder meses vazios.', 'Usar DISTINCT ON sem ORDER BY coerente.', 'Fixar colunas de pivot que mudam ao longo do tempo sem atualizar a consulta.', 'Ignorar fusos ao usar date_trunc com timestamptz.'],
  market: R`Relatórios com subtotais, séries sem buracos e tabelas cruzadas são pedidos diários de áreas de negócio. Quem domina essas construções entrega relatórios completos direto do banco, evitando planilhas manuais.`,
  summary: R`§ROLLUP§ gera subtotais hierárquicos (medido: 7 linhas, total 2.400), §CUBE§ todas as combinações (12 linhas) e §GROUPING SETS§ exatamente os pedidos (6 linhas); §grouping()§ distingue subtotal de NULL real (0 a 3). §DISTINCT ON§ devolve a última venda por vendedor; §date_trunc§ agrupa por período; §generate_series§ com §LEFT JOIN§ revela meses sem dados (abril = 0); pivot se faz com §FILTER§ por coluna.`,
  refs: [REF3.grouping, REF3.distinctOn, REF3.datetime, REF3.setReturning, REF3.orderedSet],
  cards: [
    { q: 'Qual a diferença entre ROLLUP e CUBE?', a: 'ROLLUP gera subtotais hierárquicos (a,b), (a), (); CUBE gera todas as combinações de agrupamento.' },
    { q: 'Para que serve grouping()?', a: 'Para identificar se uma coluna foi totalizada na linha, distinguindo subtotal de NULL real.' },
    { q: 'Como preencher meses sem dados em uma série?', a: 'Gerar o calendário com generate_series e juntar com LEFT JOIN, usando coalesce para o valor.' },
    { q: 'O que faz DISTINCT ON (coluna)?', a: 'Mantém a primeira linha de cada valor da coluna, conforme o ORDER BY.' },
    { q: 'Como fazer um pivot no PostgreSQL sem extensão?', a: 'Uma agregação condicional por coluna, com FILTER ou CASE WHEN.' }
  ]
},
{
  id: 'sqa-06', moduleId: 'm3', order: 6, minutes: 80, tags: ['LATERAL', 'percentile', 'JSONB', 'gaps and islands', 'coorte', 'estatística'],
  title: 'SQL analítico II: LATERAL, estatísticas, JSONB e padrões (ilhas e coortes)',
  objectives: ['Usar §LATERAL§ para subconsultas que dependem da linha anterior (Top-N por linha)', 'Calcular mediana e moda com agregações de conjunto ordenado', 'Consultar e transformar JSONB (§->§, §->>§, §@>§, §?§, §jsonb_array_elements_text§)', 'Aplicar o padrão de "ilhas" para sequências consecutivas', 'Montar coortes e preparar o projeto analítico'],
  intro: R`Esta aula fecha o curso com ferramentas que resolvem perguntas difíceis: "a maior venda **de cada** vendedor, com tudo sobre ela", "a **mediana**, que resiste a valores extremos", "quantos dias **seguidos** o usuário acessou", "**coortes** de usuários por mês de entrada", e dados semiestruturados em **JSONB**. São padrões que aparecem em produtos de dados reais. Resultados medidos no PostgreSQL 17.12.`,
  theory: R`### LATERAL: subconsulta que enxerga a linha à esquerda
Em um §JOIN§ comum, a subconsulta da direita **não pode** referenciar colunas da esquerda. Com §LATERAL§ ela **pode**, sendo reavaliada para cada linha da esquerda. É o "§for each§" do SQL. Medido: a maior venda de cada vendedor:
§§§
SELECT v.nome, t.id, t.valor
FROM vendedores v
CROSS JOIN LATERAL (SELECT id, valor FROM vendas s
                    WHERE s.vendedor_id = v.id ORDER BY valor DESC LIMIT 1) t
ORDER BY v.id;
§§§
Resultado: Ana 4/300, Bruno 5/200, Carla 8/500, Diego 11/250. Com §LIMIT n§ dentro, vira um **Top-N por linha** (alternativa à janela da aula sqa-01, muitas vezes mais eficiente com um bom índice). Para **manter vendedores sem resultado**, use §LEFT JOIN LATERAL (...) t ON true§: medido, com o filtro "valor > 450", só a Carla (venda 8) teve linha; os demais saíram com NULL. Também serve para **chamar funções que devolvem conjuntos** com argumentos da linha (§unnest§, §jsonb_array_elements§).

### Estatística: agregações de conjunto ordenado
- **Mediana**: §percentile_cont(0.5) WITHIN GROUP (ORDER BY valor)§ interpola; §percentile_disc(0.5)§ devolve um valor **existente**. Medido (11 vendas): mediana **200**, média **218,18**, mediana discreta **200,00**. A mediana é **resistente a valores extremos**, diferente da média.
- **Moda**: §mode() WITHIN GROUP (ORDER BY produto)§ devolve o valor mais frequente (medido: **A**).
- Outras: §stddev§, §variance§, §corr§ (correlação), §regr_slope§ (regressão linear). Para análises sérias, entenda os pressupostos estatísticos; o SQL calcula, mas **não interpreta**.

### JSONB
O tipo §jsonb§ guarda JSON **binário**, indexável. Medido com uma tabela de eventos (três linhas):
- §dados->>'tipo'§ extrai **texto**; §dados->'tags'->>0§ navega objetos e arrays (primeira tag "x"); §->§ devolve JSONB e §->>§ devolve texto. Contagem por tipo: **clique 2** e **compra 1**;
- §(dados->>'valor')::numeric§ converte para número (99,9);
- §dados @> '{"tipo":"clique"}'§ (**contém**) devolveu **2**;
- §dados ? 'tags'§ testa a existência de uma chave;
- §jsonb_array_elements_text(dados->'tags')§ **expande** um array em linhas (x e y).
Quando usar JSONB: atributos **variáveis** ou opcionais, payloads de eventos, integrações. Quando **não** usar: dados que você filtra, junta e valida o tempo todo (**colunas normais**, com tipos e constraints). Indexe com §GIN§ para §@>§ e §?§ (curso C3.3). Em MySQL o tipo equivalente é §JSON§ (funções diferentes; não executado aqui).

### Padrão "ilhas": sequências consecutivas
Quantos dias seguidos cada usuário acessou? Truque: subtrair o §row_number()§ da data; **dias consecutivos geram o mesmo valor**:
§§§
SELECT usuario, min(dia) AS inicio, max(dia) AS fim, count(*) AS dias
FROM (SELECT usuario, dia,
             dia - (row_number() OVER (PARTITION BY usuario ORDER BY dia))::int AS grp
      FROM logins) t
GROUP BY usuario, grp
ORDER BY usuario, inicio;
§§§
Medido: usuário 1 tem uma sequência de **2026-03-01 a 2026-03-03 (3 dias)** e outra de **03-07 a 03-08 (2 dias)**; o usuário 2 tem 1 dia. Aplicações: sequências de login, períodos de contrato contínuos, intervalos de indisponibilidade. O inverso (as **lacunas**) usa §lag§ para achar saltos.

### Coortes
Uma **coorte** agrupa usuários pelo **momento de entrada** (mês do primeiro acesso) para acompanhar o comportamento ao longo do tempo (retenção). A base é uma CTE com o **primeiro evento** por usuário (§min(...) GROUP BY usuario§) e a junção com os eventos seguintes. Medido, o primeiro acesso dos dois usuários caiu em **2026-03**: coorte de **2 usuários**. A retenção calcula, para cada coorte e mês seguinte, a **fração de usuários ativos**.

### Juntando o que você aprendeu
Em um projeto analítico, o fluxo típico é: **CTEs** para etapas, **janelas** para rankings e variações, **ROLLUP** para subtotais, **calendário** para períodos vazios, **views** para publicar o resultado e **JSONB** para campos flexíveis. Valide sempre: totais, granularidade e NULL (curso C3.1), e **meça** o desempenho (curso C3.3).`,
  concepts: [
    { term: 'LATERAL', def: 'Modificador que permite a uma subconsulta no FROM referenciar colunas de itens anteriores.' },
    { term: 'percentile_cont', def: 'Agregação de conjunto ordenado que calcula um percentil com interpolação (mediana com 0,5).' },
    { term: 'percentile_disc', def: 'Percentil que devolve um valor existente no conjunto.' },
    { term: 'mode', def: 'Agregação que devolve o valor mais frequente.' },
    { term: 'JSONB', def: 'Tipo binário do PostgreSQL para JSON, com operadores de contenção e índices GIN.' },
    { term: 'Operador @>', def: 'Operador de contenção do JSONB: o valor da esquerda contém o da direita.' },
    { term: 'Ilhas (gaps and islands)', def: 'Padrão para identificar sequências consecutivas de valores usando a diferença com row_number.' },
    { term: 'Coorte', def: 'Grupo de usuários definidos por um momento comum, como o mês de entrada.' },
    { term: 'Retenção', def: 'Fração de usuários de uma coorte que continuam ativos em períodos seguintes.' },
    { term: 'Mediana', def: 'Valor central de um conjunto ordenado, resistente a valores extremos.' }
  ],
  examples: R`**Analogia:** o LATERAL é um **"para cada vendedor, vá buscar a maior venda dele"**: uma tarefa que depende de quem está na vez. A mediana é **a pessoa do meio da fila** (não muda se o mais alto da fila crescer), enquanto a média é arrastada por valores extremos. O padrão de ilhas é **contar blocos de dias seguidos** em um calendário: se você numerar os dias de acesso e subtrair o número da data, todos os dias do mesmo bloco caem no mesmo "código de bloco". Uma coorte é a **turma que entrou no mesmo mês**: você a acompanha ao longo do tempo para ver quantos continuam.

**Exemplo 1: Top-1 por vendedor.** Quatro linhas com a maior venda de cada um.

**Exemplo 2: mediana x média.** Mediana 200 e média 218,18.

**Exemplo 3: ilhas.** O usuário 1 teve uma sequência de 3 dias e outra de 2.`,
  code: [
    { title: 'LATERAL e estatísticas (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`SELECT v.nome, t.id, t.valor
FROM vendedores v
CROSS JOIN LATERAL (SELECT id, valor FROM vendas s
                    WHERE s.vendedor_id = v.id
                    ORDER BY valor DESC LIMIT 1) t
ORDER BY v.id;                  -- Ana 4 300 | Bruno 5 200 | Carla 8 500 | Diego 11 250

SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY valor) AS mediana,
       avg(valor) AS media,
       mode() WITHIN GROUP (ORDER BY produto) AS moda
FROM vendas;                    -- 200 | 218.18 | A`, notes: [{ l: '3', t: 'A subconsulta usa v.id: só é possível com LATERAL.' }, { l: '4', t: 'ORDER BY + LIMIT 1 dentro: a maior venda de cada vendedor.' }, { l: '9', t: 'Agregações de conjunto ordenado usam WITHIN GROUP.' }] },
    { title: 'JSONB e ilhas (SQL, saída medida)', lang: 'sql', code: R`CREATE TEMP TABLE eventos (id serial, usuario int, dados jsonb);
INSERT INTO eventos (usuario, dados) VALUES
  (1, '{"tipo":"clique","pagina":"/a","tags":["x","y"]}'),
  (1, '{"tipo":"compra","valor":99.9}'),
  (2, '{"tipo":"clique","pagina":"/b"}');

SELECT dados->>'tipo' AS tipo, count(*) FROM eventos GROUP BY 1 ORDER BY 1;  -- clique 2 | compra 1
SELECT count(*) FROM eventos WHERE dados @> '{"tipo":"clique"}';             -- 2
SELECT id, jsonb_array_elements_text(dados->'tags') AS tag
FROM eventos WHERE dados ? 'tags';                                           -- 1 x | 1 y

SELECT usuario, min(dia) AS inicio, max(dia) AS fim, count(*) AS dias
FROM (SELECT usuario, dia,
             dia - (row_number() OVER (PARTITION BY usuario ORDER BY dia))::int AS grp
      FROM logins) t
GROUP BY usuario, grp ORDER BY usuario, inicio;
-- 1: 03-01..03-03 (3) | 1: 03-07..03-08 (2) | 2: 03-05..03-05 (1)`, notes: [{ l: '7', t: '->> extrai texto; usado para agrupar por um campo do JSON.' }, { l: '8', t: '@> testa contenção e pode usar um índice GIN.' }, { l: '9', t: 'jsonb_array_elements_text expande o array em linhas.' }, { l: '14', t: 'Data menos row_number é constante dentro de uma sequência consecutiva.' }] }
  ],
  bestPractices: ['Use LATERAL para Top-N por linha e para funções que devolvem conjuntos.', 'Prefira a mediana à média quando houver valores extremos.', 'Use JSONB para atributos variáveis e colunas normais para dados estruturados e consultados com frequência.', 'Indexe JSONB com GIN quando filtrar por @> ou ?.', 'Valide padrões como ilhas com dados pequenos e casos de borda (um dia só, datas repetidas).', 'Documente a definição de coorte e de retenção.'],
  mistakes: ['Esquecer o ON true no LEFT JOIN LATERAL.', 'Usar a média onde a mediana descreveria melhor.', 'Guardar tudo em JSONB e perder tipos e restrições.', 'Esquecer de converter ->> (texto) para número antes de comparar ou somar.', 'Aplicar o padrão de ilhas com datas repetidas sem deduplicar.', 'Definir coortes de forma inconsistente entre relatórios.'],
  market: R`Análise de produto (retenção, funil, coortes) e dados semiestruturados em JSON são rotina em empresas de tecnologia. Saber resolver isso direto no banco acelera respostas e reduz a dependência de ferramentas externas.`,
  summary: R`§LATERAL§ permite subconsultas que dependem da linha à esquerda (medido: a maior venda de cada vendedor; com §LEFT JOIN LATERAL ... ON true§ só a Carla teve venda acima de 450). Mediana, média e moda mostram valores diferentes (200, 218,18 e A). JSONB oferece §->§, §->>§, §@>§, §?§ e expansão de arrays. O padrão de ilhas conta sequências consecutivas (3 e 2 dias) e as coortes agrupam usuários pelo mês de entrada.`,
  refs: [REF3.lateral, REF3.orderedSet, REF3.json, REF3.jsonFunc],
  cards: [
    { q: 'O que o LATERAL permite?', a: 'Que uma subconsulta no FROM referencie colunas de itens anteriores, sendo avaliada para cada linha.' },
    { q: 'Por que a mediana pode ser melhor que a média?', a: 'Porque é resistente a valores extremos; a média é arrastada por eles.' },
    { q: 'Qual a diferença entre -> e ->> em JSONB?', a: '-> devolve JSONB; ->> devolve texto.' },
    { q: 'Como funciona o padrão de ilhas?', a: 'Subtrai-se o row_number da data; dias consecutivos geram o mesmo valor e podem ser agrupados.' },
    { q: 'O que é uma coorte?', a: 'Um grupo de usuários definido por um momento comum, como o mês de entrada.' }
  ]
}
];
