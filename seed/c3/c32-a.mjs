// C3.2 — SQL avançado e analítico. Aulas 1 e 2 (window functions: ranking e agregação; deslocamento, frames e acumulados).
const R = String.raw;

export const REF = {
  tutWindow: { title: 'PostgreSQL 17 — Window Functions (tutorial)', url: 'https://www.postgresql.org/docs/17/tutorial-window.html', kind: 'doc' },
  windowSyntax: { title: 'PostgreSQL 17 — Window Function Calls', url: 'https://www.postgresql.org/docs/17/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS', kind: 'doc' },
  windowFunc: { title: 'PostgreSQL 17 — Window Functions (referência)', url: 'https://www.postgresql.org/docs/17/functions-window.html', kind: 'doc' },
  windowQuery: { title: 'PostgreSQL 17 — Window Function Processing', url: 'https://www.postgresql.org/docs/17/queries-table-expressions.html#QUERIES-WINDOW', kind: 'doc' },
  aggregate: { title: 'PostgreSQL 17 — Aggregate Functions', url: 'https://www.postgresql.org/docs/17/functions-aggregate.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'sqa-01', moduleId: 'm1', order: 1, minutes: 75, tags: ['window functions', 'OVER', 'PARTITION BY', 'ranking', 'row_number', 'rank'],
  title: 'Window functions I: OVER, PARTITION BY e rankings (row_number, rank, dense_rank)',
  objectives: ['Explicar a diferença entre agregação com §GROUP BY§ e função de janela com §OVER§', 'Usar §PARTITION BY§ e §ORDER BY§ dentro de §OVER§', 'Escolher entre §row_number§, §rank§ e §dense_rank§ e prever o resultado com empates', 'Resolver o problema "os N primeiros por grupo"', 'Calcular totais e percentuais do todo sem perder as linhas detalhadas'],
  intro: R`Com §GROUP BY§, as linhas de um grupo **colapsam em uma**. Muitas perguntas pedem o contrário: **manter cada linha** e, ao lado dela, mostrar algo calculado sobre um conjunto de linhas relacionadas ("qual a posição desta venda no ranking?", "quanto esta venda representa do total?"). É para isso que existem as **window functions** (funções de janela), a ferramenta mais poderosa do SQL analítico. Todos os resultados desta aula foram medidos no PostgreSQL 17.12, com a tabela de vendas do laboratório.`,
  theory: R`### Agregar x janela
- **Agregação (§GROUP BY§)**: várias linhas viram **uma** por grupo.
- **Função de janela (§OVER§)**: **cada linha é preservada** e recebe um valor calculado sobre uma "janela" de linhas relacionadas.
A sintaxe é §funcao(...) OVER (PARTITION BY ... ORDER BY ... frame)§. As três partes dentro de §OVER§ são opcionais:
- §PARTITION BY§: divide as linhas em **partições** independentes (como o §GROUP BY§, mas sem colapsar);
- §ORDER BY§: define a **ordem** dentro da partição (necessária para rankings e acumulados);
- **frame** (aula sqa-02): quais linhas, perto da atual, entram no cálculo.
Qualquer agregação (§sum§, §avg§, §count§...) pode virar função de janela ao receber um §OVER§. Medido: §sum(valor) OVER ()§ (janela sem partição nem ordem = a tabela inteira) devolveu **2400,00** em cada linha, e §round(100 * valor / sum(valor) OVER (), 1)§ deu **4,2%** para a venda de 100,00 e **6,3%** para as de 150,00. É o "percentual do total" sem precisar de subconsulta.

### Onde as janelas rodam na ordem lógica
Depois de §WHERE§, §GROUP BY§ e §HAVING§ e **antes** de §SELECT§ final, §DISTINCT§, §ORDER BY§ e §LIMIT§. Consequências:
- janelas só podem aparecer no §SELECT§ e no §ORDER BY§. Medido: §WHERE row_number() OVER (...) = 1§ falhou com **window functions are not allowed in WHERE**. Para filtrar pelo resultado de uma janela, use uma **subconsulta ou CTE** e filtre fora;
- o §WHERE§ elimina linhas **antes** da janela: filtrar por data antes muda o ranking. Se quiser o ranking sobre tudo e mostrar só parte, filtre **depois**.

### Funções de ranking
Medido, ordenando as vendas por valor decrescente (com empates: duas vendas de 200,00 e duas de 150,00):
| valor | row_number | rank | dense_rank |
|---|---|---|---|
| 500 | 1 | 1 | 1 |
| 400 | 2 | 2 | 2 |
| 300 | 3 | 3 | 3 |
| 250 | 4 | 4 | 4 |
| 200 | 5 | 5 | 5 |
| 200 | 6 | 5 | 5 |
| 150 | 7 | 7 | 6 |
| 150 | 8 | 7 | 6 |
- **§row_number()§**: numeração **única e sequencial**; em empate, o desempate é **arbitrário** a menos que você inclua um critério único no §ORDER BY§ (por isso usamos §s.id§ como desempate);
- **§rank()§**: empatados têm a **mesma posição** e a próxima **pula** (5, 5, **7**);
- **§dense_rank()§**: empatados têm a mesma posição e a próxima **não pula** (5, 5, **6**).
Escolha pelo que o negócio chama de "posição": campeonato (rank), "os 3 níveis de preço diferentes" (dense_rank), "uma linha por item" (row_number).
Outras: §ntile(n)§ divide em **n faixas** de tamanho igual; medido, com quatro vendedores ordenados pelo total e §ntile(2)§: Carla (1.000) e Ana (700) na faixa 1; Bruno (450) e Diego (250) na faixa 2. §percent_rank()§ e §cume_dist()§ dão posições relativas entre 0 e 1.

### PARTITION BY: ranking dentro de cada grupo
Medido: ranking de vendedores **dentro da região**, com §rank() OVER (PARTITION BY regiao ORDER BY total DESC)§: Norte: Carla (1.000) 1º e Diego (250) 2º; Sul: Ana (700) 1ª e Bruno (450) 2º. Cada região reinicia a contagem.
Note a estrutura em duas etapas: primeiro **agrega** (soma por vendedor, em uma subconsulta), depois **aplica a janela** sobre o resultado. A janela enxerga as linhas **depois** do §GROUP BY§, então também é possível escrever §rank() OVER (ORDER BY sum(valor) DESC)§ diretamente na mesma consulta agrupada.

### Os N primeiros por grupo
Problema clássico: "as 2 maiores vendas de cada vendedor". Resolve-se com §row_number()§ em uma subconsulta e filtro por §rn <= 2§ fora dela:
§§§
SELECT * FROM (
  SELECT vendedor_id, id, valor,
         row_number() OVER (PARTITION BY vendedor_id ORDER BY valor DESC, id) AS rn
  FROM vendas
) t
WHERE rn <= 2
ORDER BY vendedor_id, rn;
§§§
Medido: 7 linhas (Diego, com uma só venda, aparece uma vez). Se o requisito for "inclua os empatados", troque por §rank()§ ou §dense_rank()§ (o resultado pode ter mais de N linhas por grupo). Para **uma** linha por grupo, o PostgreSQL tem também §DISTINCT ON§ (aula sqa-05).

### Janelas nomeadas
Quando várias funções usam a mesma janela, declare-a uma vez: §... OVER w ... WINDOW w AS (PARTITION BY regiao ORDER BY total DESC)§. Evita repetição e erros de copiar e colar.

### Desempenho em uma frase
Uma janela exige **ordenar** os dados por partição e ordem; um índice que já entregue essa ordem pode evitar a ordenação (curso C3.3, **EXPLAIN**). Muitas janelas com a **mesma** definição compartilham a ordenação.`,
  concepts: [
    { term: 'Função de janela', def: 'Função que calcula um valor sobre um conjunto de linhas relacionadas sem colapsar as linhas.' },
    { term: 'OVER', def: 'Cláusula que define a janela (partição, ordem e frame) de uma função.' },
    { term: 'PARTITION BY', def: 'Divide as linhas em partições independentes dentro de OVER, sem colapsá-las.' },
    { term: 'row_number', def: 'Numeração sequencial única das linhas de uma partição.' },
    { term: 'rank', def: 'Posição com empates iguais e lacunas na numeração seguinte.' },
    { term: 'dense_rank', def: 'Posição com empates iguais e sem lacunas na numeração seguinte.' },
    { term: 'ntile', def: 'Função que divide as linhas ordenadas em n faixas de tamanho aproximadamente igual.' },
    { term: 'Top-N por grupo', def: 'Selecionar as N primeiras linhas de cada grupo usando uma função de janela e um filtro externo.' },
    { term: 'Janela nomeada', def: 'Definição de janela declarada com WINDOW e reutilizada por várias funções.' },
    { term: 'Desempate', def: 'Critério adicional no ORDER BY que torna a ordenação determinística.' }
  ],
  examples: R`**Analogia:** o GROUP BY é como **resumir uma turma em uma linha de boletim** (média da turma). A função de janela é **manter a lista de chamada** e, ao lado do nome de cada aluno, escrever "posição na turma" e "% da soma de pontos da turma". O PARTITION BY separa **as turmas** (cada uma com seu ranking); o ORDER BY define **quem vem primeiro**; e as diferenças entre row_number, rank e dense_rank são como o professor trata **empates**: cada um recebe um número diferente de qualquer jeito (row_number), todos dividem a medalha e o próximo pula (rank) ou todos dividem a medalha e o próximo é o seguinte (dense_rank).

**Exemplo 1: rank com empates.** Duas vendas de 200: posição 5 e 5, a próxima é 7 (rank) ou 6 (dense_rank).

**Exemplo 2: ranking por região.** Carla é 1ª no Norte e Ana é 1ª no Sul, cada uma na sua partição.

**Exemplo 3: percentual do total.** 100,00 de 2.400,00 dá 4,2%.`,
  code: [
    { title: 'Ranking e percentual do total (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`SELECT v.nome, s.valor,
       row_number() OVER (ORDER BY s.valor DESC, s.id) AS rn,
       rank()       OVER (ORDER BY s.valor DESC)       AS rk,
       dense_rank() OVER (ORDER BY s.valor DESC)       AS dr
FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id
ORDER BY s.valor DESC, s.id
LIMIT 8;
-- 500 1 1 1 | 400 2 2 2 | 300 3 3 3 | 250 4 4 4 | 200 5 5 5 | 200 6 5 5 | 150 7 7 6 | 150 8 7 6

SELECT id, valor,
       sum(valor) OVER () AS total_geral,
       round(100 * valor / sum(valor) OVER (), 1) AS pct
FROM vendas ORDER BY id LIMIT 3;     -- 100 → 4.2 | 150 → 6.3 | 150 → 6.3`, notes: [{ l: '2', t: 'row_number precisa de um desempate único (s.id) para ser determinístico.' }, { l: '3', t: 'rank e dense_rank dão o mesmo número aos empatados.' }, { l: '11', t: 'OVER () sem argumentos: a janela é a tabela inteira.' }] },
    { title: 'Ranking por grupo e Top-N (SQL, saída medida)', lang: 'sql', code: R`-- posição do vendedor dentro da região
SELECT nome, regiao, total,
       rank() OVER (PARTITION BY regiao ORDER BY total DESC) AS pos_na_regiao
FROM (SELECT v.nome, v.regiao, sum(s.valor) AS total
      FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id
      GROUP BY v.id, v.nome, v.regiao) t
ORDER BY regiao, pos_na_regiao;      -- Carla 1, Diego 2 (Norte) | Ana 1, Bruno 2 (Sul)

-- as 2 maiores vendas de cada vendedor
SELECT * FROM (
  SELECT vendedor_id, id, valor,
         row_number() OVER (PARTITION BY vendedor_id ORDER BY valor DESC, id) AS rn
  FROM vendas) t
WHERE rn <= 2 ORDER BY vendedor_id, rn;   -- 7 linhas

-- ERRO: window functions are not allowed in WHERE
-- SELECT id FROM vendas WHERE row_number() OVER (ORDER BY id) = 1;`, notes: [{ l: '2', t: 'PARTITION BY reinicia o ranking em cada região.' }, { l: '5', t: 'Primeiro agrega (soma por vendedor), depois aplica a janela.' }, { l: '16', t: 'Filtrar por resultado de janela exige subconsulta ou CTE.' }] }
  ],
  bestPractices: ['Inclua um desempate único no ORDER BY de row_number.', 'Escolha rank, dense_rank ou row_number conforme a regra de negócio sobre empates.', 'Para Top-N por grupo, use janela em subconsulta e filtre por fora.', 'Use janelas nomeadas quando várias funções compartilham a definição.', 'Lembre-se de que o WHERE roda antes da janela.', 'Confira o resultado com poucos dados e empates propositais.'],
  mistakes: ['Usar função de janela no WHERE.', 'Esperar que row_number desempate de forma estável sem critério único.', 'Confundir rank com dense_rank em relatórios de posição.', 'Filtrar por data antes do ranking e estranhar as posições.', 'Usar GROUP BY quando precisava manter as linhas detalhadas.', 'Esquecer o PARTITION BY e obter um ranking global.'],
  market: R`Window functions estão entre as perguntas mais frequentes de entrevistas de dados e backend ("top 3 por categoria", "ranking com empates") e são a base de relatórios modernos. Dominá-las reduz muito código de aplicação que apenas reordena e soma resultados.`,
  summary: R`Funções de janela preservam as linhas e calculam sobre uma janela definida em §OVER (PARTITION BY ... ORDER BY ...)§. §sum() OVER ()§ dá o total em cada linha (medido: 2.400,00 e percentuais 4,2% e 6,3%). §row_number§ é único, §rank§ empata com lacunas (5, 5, 7) e §dense_rank§ empata sem lacunas (5, 5, 6). Janelas não valem no §WHERE§ (use subconsulta ou CTE) e permitem Top-N por grupo e rankings por partição.`,
  refs: [REF.tutWindow, REF.windowSyntax, REF.windowFunc, REF.windowQuery],
  cards: [
    { q: 'Qual a diferença entre GROUP BY e função de janela?', a: 'GROUP BY colapsa as linhas de um grupo em uma; a função de janela preserva cada linha e acrescenta um valor calculado sobre a janela.' },
    { q: 'Qual a diferença entre rank e dense_rank?', a: 'Ambos dão a mesma posição aos empatados; rank pula números depois do empate (5, 5, 7) e dense_rank não (5, 5, 6).' },
    { q: 'Por que função de janela não pode ficar no WHERE?', a: 'Ela é avaliada depois do WHERE; para filtrar pelo resultado use subconsulta ou CTE.' },
    { q: 'Como obter as N maiores linhas de cada grupo?', a: 'row_number() OVER (PARTITION BY grupo ORDER BY valor DESC) em subconsulta e filtro rn <= N por fora.' },
    { q: 'O que significa OVER () vazio?', a: 'A janela é todo o conjunto de linhas (sem partição nem ordem).' }
  ]
},
{
  id: 'sqa-02', moduleId: 'm1', order: 2, minutes: 75, tags: ['lag', 'lead', 'acumulado', 'frame', 'ROWS', 'RANGE', 'média móvel'],
  title: 'Window functions II: lag, lead, acumulados, frames e médias móveis',
  objectives: ['Comparar uma linha com a anterior e a seguinte com §lag§ e §lead§', 'Calcular totais acumulados e médias móveis com frames §ROWS§', 'Distinguir §ROWS§ de §RANGE§ e prever o efeito de empates', 'Explicar o frame padrão e a armadilha de §last_value§', 'Calcular variações, percentuais acumulados e faixas (§ntile§)'],
  intro: R`Na aula anterior a janela era o conjunto inteiro ou a partição. Agora ela passa a **depender da linha atual**: "a venda anterior", "o acumulado até aqui", "a média das últimas 3". Isso é o que permite calcular **variações, acumulados, médias móveis e comparações entre períodos** com uma só consulta. O cuidado central é entender o **frame** (o conjunto de linhas ao redor da atual) e seu padrão, que surpreende quem usa §last_value§.`,
  theory: R`### lag e lead: olhar para os lados
§lag(coluna, n, padrao)§ devolve o valor de **n linhas antes** (padrão n = 1) dentro da partição e da ordem; §lead§ olha **para a frente**. Se a linha não existe, devolve §NULL§ (ou o valor padrão informado). Medido, para as vendas da Ana ordenadas por data:
| data | valor | anterior | variação | próximo |
|---|---|---|---|---|
| 2026-01-05 | 100 | NULL | NULL | 150 |
| 2026-01-20 | 150 | 100 | 50 | 150 |
| 2026-02-03 | 150 | 150 | 0 | 300 |
| 2026-03-10 | 300 | 150 | 150 | NULL |
A variação é §valor - lag(valor) OVER (ORDER BY data)§. Para variação percentual, divida por §lag§ e proteja contra divisão por zero (§nullif§). Use §PARTITION BY§ para comparar **dentro de cada vendedor** sem misturar histórias.

### Totais acumulados
§sum(valor) OVER (ORDER BY data)§ calcula o **acumulado** (running total): medido, para a Ana, 100, 250, 400 e 700. Com §PARTITION BY vendedor_id§ ele reinicia por vendedor. O percentual acumulado é o acumulado dividido pelo total da partição (§sum(valor) OVER (PARTITION BY vendedor_id)§): medido 14,3%, 35,7%, 57,1% e 100,0%.

### O frame: quais linhas entram
Quando há §ORDER BY§ na janela, existe um **frame**: o subconjunto de linhas da partição usado pela função. Sintaxe: §{ROWS | RANGE | GROUPS} BETWEEN início AND fim§, com limites §UNBOUNDED PRECEDING§, §n PRECEDING§, §CURRENT ROW§, §n FOLLOWING§, §UNBOUNDED FOLLOWING§.
- **§ROWS§** conta **linhas físicas**: §ROWS BETWEEN 1 PRECEDING AND CURRENT ROW§ = a linha anterior e a atual. Medido, média móvel de 2 vendas do Bruno (200, 200, 50): 200,0; 200,0; 125,0.
- **§RANGE§** trabalha com **valores**: inclui **todas as linhas empatadas** na chave do §ORDER BY§ ("pares" da linha atual).
- **§GROUPS§** conta grupos de pares.
**O frame padrão** (com §ORDER BY§) é §RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW§. A armadilha: com **empates** no §ORDER BY§, o acumulado de linhas empatadas é **o mesmo**. Medido, ordenando as vendas da Ana por valor (100, 150, 150, 300): §sum(valor) OVER (ORDER BY valor)§ (RANGE) deu **100, 400, 400, 700** (as duas de 150 somam juntas), enquanto §ROWS UNBOUNDED PRECEDING§ deu **100, 250, 400, 700**. Para acumulados linha a linha, **use ROWS** e/ou um desempate único.

### first_value, last_value e a armadilha
§first_value(x)§ e §last_value(x)§ devolvem o valor da primeira/última linha **do frame**. Com o frame padrão, a "última" linha do frame é a **linha atual**, então §last_value§ parece não funcionar. Medido (vendas da Ana por data): §first_value§ = 100 em todas as linhas; §last_value§ com frame padrão = 100, 150, 150, 300 (acompanha a linha atual!); com §ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING§ = **300** em todas. Regra: para §last_value§ (e §nth_value§), **declare o frame completo**.

### Agregações em janela: o que vale a pena
- Média móvel (§avg§ com §ROWS BETWEEN n PRECEDING AND CURRENT ROW§);
- Máximo/mínimo corrente (§max(valor) OVER (ORDER BY data)§);
- Contagem acumulada (§count(*) OVER (ORDER BY data)§);
- Participação no total (§valor / sum(valor) OVER ()§).
Para **dados esparsos** (dias sem venda), gere o calendário (§generate_series§, aula sqa-05) e junte antes de aplicar a janela; caso contrário "7 linhas anteriores" não são "7 dias anteriores". O frame §RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW§ (PostgreSQL 11 ou superior) trabalha por valor de data.

### ntile, percent_rank e cume_dist
§ntile(4)§ cria quartis; §percent_rank()§ = (posição − 1) / (linhas − 1); §cume_dist()§ = fração de linhas com valor menor ou igual. Úteis para **segmentação** (top 25%) e curva ABC.

### Performance e legibilidade
Uma consulta com várias janelas de definições diferentes ordena várias vezes. Agrupe funções com a **mesma** janela (§WINDOW w AS (...)§) e filtre linhas **antes** quando for correto. Em tabelas grandes, um índice que combine a partição e a ordem ajuda (curso C3.3).`,
  concepts: [
    { term: 'lag', def: 'Função de janela que devolve o valor de n linhas anteriores na partição ordenada.' },
    { term: 'lead', def: 'Função de janela que devolve o valor de n linhas seguintes.' },
    { term: 'Acumulado (running total)', def: 'Soma até a linha atual, calculada com sum e OVER (ORDER BY ...).' },
    { term: 'Frame', def: 'Subconjunto de linhas da partição usado no cálculo de cada linha (ROWS, RANGE ou GROUPS).' },
    { term: 'ROWS', def: 'Modo de frame que conta linhas físicas.' },
    { term: 'RANGE', def: 'Modo de frame por valor, que inclui todas as linhas empatadas na chave de ordenação.' },
    { term: 'Frame padrão', def: 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW quando há ORDER BY na janela.' },
    { term: 'Média móvel', def: 'Média calculada sobre as últimas n linhas ou período, usando um frame deslizante.' },
    { term: 'last_value', def: 'Último valor do frame; com o frame padrão devolve o valor da linha atual.' },
    { term: 'ntile', def: 'Divide as linhas ordenadas em n faixas (quartis, decis).' }
  ],
  examples: R`**Analogia:** imagine o **extrato de uma conta**: o saldo de cada linha é o **acumulado** das linhas anteriores (running total). O §lag§ é olhar a linha de cima para ver quanto o saldo mudou. O **frame** é a "lupa" que a função usa: com ROWS a lupa conta linhas ("as duas últimas"); com RANGE ela inclui todas as linhas "empatadas" com a atual (todos os lançamentos do mesmo valor ou do mesmo dia entram juntos). O last_value com a lupa padrão olha só "até a linha atual", por isso o "último" é sempre a própria linha, a menos que você abra a lupa até o fim.

**Exemplo 1: variação.** As vendas da Ana tiveram variações de 50, 0 e 150 em relação à anterior.

**Exemplo 2: RANGE x ROWS.** Com empates em 150, RANGE devolveu 100, 400, 400, 700 e ROWS 100, 250, 400, 700.

**Exemplo 3: last_value.** Frame padrão: 100, 150, 150, 300; frame completo: 300 em todas.`,
  code: [
    { title: 'lag, acumulado e média móvel (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`SELECT data, valor,
       lag(valor)  OVER (ORDER BY data) AS anterior,
       valor - lag(valor) OVER (ORDER BY data) AS variacao,
       lead(valor) OVER (ORDER BY data) AS proximo,
       sum(valor)  OVER (ORDER BY data) AS acumulado
FROM vendas WHERE vendedor_id = 1 ORDER BY data;
-- 100 NULL NULL 150 100 | 150 100 50 150 250 | 150 150 0 300 400 | 300 150 150 NULL 700

SELECT data, valor,
       round(avg(valor) OVER (ORDER BY data ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 1) AS media_movel_2
FROM vendas WHERE vendedor_id = 2 ORDER BY data;   -- 200.0 | 200.0 | 125.0`, notes: [{ l: '2', t: 'lag olha a linha anterior na ordem da janela; a primeira linha recebe NULL.' }, { l: '5', t: 'sum com OVER (ORDER BY ...) é o acumulado.' }, { l: '11', t: 'ROWS BETWEEN 1 PRECEDING AND CURRENT ROW é uma janela deslizante de 2 linhas.' }] },
    { title: 'RANGE x ROWS e a armadilha do last_value (SQL, saída medida)', lang: 'sql', code: R`SELECT id, valor,
       sum(valor) OVER (ORDER BY valor)                         AS acum_range,
       sum(valor) OVER (ORDER BY valor ROWS UNBOUNDED PRECEDING) AS acum_rows
FROM vendas WHERE vendedor_id = 1 ORDER BY valor, id;
-- 100: 100/100 | 150: 400/250 | 150: 400/400 | 300: 700/700

SELECT data, valor,
       last_value(valor) OVER (ORDER BY data) AS ultima_default,
       last_value(valor) OVER (ORDER BY data
         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS ultima_certa
FROM vendas WHERE vendedor_id = 1 ORDER BY data;
-- default: 100, 150, 150, 300 | certa: 300, 300, 300, 300`, notes: [{ l: '2', t: 'RANGE (padrão) soma os empatados juntos: as duas vendas de 150 mostram 400.' }, { l: '3', t: 'ROWS acumula linha a linha, sem tratar empatados em bloco.' }, { l: '9', t: 'Com o frame padrão o "último" é a linha atual.' }, { l: '11', t: 'Declare o frame completo para last_value.' }] }
  ],
  bestPractices: ['Use ROWS para acumulados linha a linha e médias móveis por contagem de linhas.', 'Declare o frame completo ao usar last_value ou nth_value.', 'Use PARTITION BY para não misturar entidades diferentes.', 'Trate o primeiro valor NULL de lag explicitamente (padrão ou coalesce).', 'Gere um calendário para séries com dias ausentes antes de aplicar a janela.', 'Reaproveite janelas nomeadas e filtre antes quando for correto.'],
  mistakes: ['Esperar que o acumulado com RANGE some linha a linha com empates.', 'Usar last_value sem frame e achar que a função está quebrada.', 'Calcular variação percentual sem proteger divisão por zero.', 'Misturar vendedores sem PARTITION BY.', 'Usar média móvel de n linhas em séries com buracos de datas.', 'Esquecer o ORDER BY e obter acumulado indeterminado.'],
  market: R`Séries temporais, variações mês a mês, médias móveis e acumulados são rotina em dashboards de produto, finanças e operações. A pergunta "por que o last_value não devolve o último valor?" é um clássico de entrevistas.`,
  summary: R`§lag§ e §lead§ olham para as linhas vizinhas (variações das vendas da Ana: 50, 0, 150). §sum() OVER (ORDER BY)§ dá o acumulado; o **frame** define as linhas usadas: §ROWS§ conta linhas, §RANGE§ (padrão com ORDER BY) soma empatados juntos (100, 400, 400, 700 contra 100, 250, 400, 700 em ROWS). §last_value§ com o frame padrão devolve a linha atual (100, 150, 150, 300): declare §UNBOUNDED FOLLOWING§ (300 em todas). Séries com buracos pedem calendário.`,
  refs: [REF.tutWindow, REF.windowSyntax, REF.windowFunc, REF.aggregate],
  cards: [
    { q: 'O que faz lag(valor) OVER (ORDER BY data)?', a: 'Devolve o valor da linha anterior na ordem da janela (NULL na primeira).' },
    { q: 'Qual o frame padrão quando há ORDER BY?', a: 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.' },
    { q: 'Por que ROWS e RANGE diferem com empates?', a: 'RANGE inclui todas as linhas empatadas na chave de ordenação; ROWS conta linhas físicas.' },
    { q: 'Por que last_value parece não funcionar?', a: 'Com o frame padrão o último valor do frame é a linha atual; declare ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.' },
    { q: 'Como calcular média móvel de 3 linhas?', a: 'avg(x) OVER (ORDER BY data ROWS BETWEEN 2 PRECEDING AND CURRENT ROW).' }
  ]
}
];
