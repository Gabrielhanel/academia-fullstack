// C3.1 — SQL essencial. Aulas 1 a 3 (modelo relacional; SELECT, WHERE e ORDER BY; INSERT, UPDATE e DELETE).
const R = String.raw;

export const REF = {
  tutTable: { title: 'PostgreSQL 17 — Creating a New Table', url: 'https://www.postgresql.org/docs/17/tutorial-table.html', kind: 'doc' },
  ddlConstraints: { title: 'PostgreSQL 17 — Constraints', url: 'https://www.postgresql.org/docs/17/ddl-constraints.html', kind: 'doc' },
  datatype: { title: 'PostgreSQL 17 — Data Types', url: 'https://www.postgresql.org/docs/17/datatype.html', kind: 'doc' },
  select: { title: 'PostgreSQL 17 — SELECT', url: 'https://www.postgresql.org/docs/17/sql-select.html', kind: 'doc' },
  comparison: { title: 'PostgreSQL 17 — Comparison Functions and Operators', url: 'https://www.postgresql.org/docs/17/functions-comparison.html', kind: 'doc' },
  matching: { title: 'PostgreSQL 17 — Pattern Matching (LIKE)', url: 'https://www.postgresql.org/docs/17/functions-matching.html', kind: 'doc' },
  limit: { title: 'PostgreSQL 17 — LIMIT and OFFSET', url: 'https://www.postgresql.org/docs/17/queries-limit.html', kind: 'doc' },
  orderby: { title: 'PostgreSQL 17 — Sorting Rows', url: 'https://www.postgresql.org/docs/17/queries-order.html', kind: 'doc' },
  insert: { title: 'PostgreSQL 17 — INSERT', url: 'https://www.postgresql.org/docs/17/sql-insert.html', kind: 'doc' },
  update: { title: 'PostgreSQL 17 — UPDATE', url: 'https://www.postgresql.org/docs/17/sql-update.html', kind: 'doc' },
  delete: { title: 'PostgreSQL 17 — DELETE', url: 'https://www.postgresql.org/docs/17/sql-delete.html', kind: 'doc' },
  returning: { title: 'PostgreSQL 17 — Returning Data from Modified Rows', url: 'https://www.postgresql.org/docs/17/dml-returning.html', kind: 'doc' },
  psql: { title: 'PostgreSQL 17 — psql', url: 'https://www.postgresql.org/docs/17/app-psql.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'sqe-01', moduleId: 'm1', order: 1, minutes: 65, tags: ['modelo relacional', 'tabelas', 'chaves', 'tipos', 'NULL', 'constraints'],
  title: 'O modelo relacional: tabelas, chaves, tipos, restrições e o valor NULL',
  objectives: ['Explicar o modelo relacional: relações (tabelas), tuplas (linhas), atributos (colunas) e domínios (tipos)', 'Distinguir chave primária, chave estrangeira e restrições UNIQUE, NOT NULL e CHECK', 'Escrever um esquema simples com §CREATE TABLE§ e interpretar seus erros de violação', 'Explicar o NULL como "valor desconhecido" e prever a lógica de três valores', 'Escolher tipos de dados adequados para texto, números, dinheiro e datas'],
  intro: R`Quase todo sistema guarda dados em **bancos relacionais**, e a linguagem para conversar com eles é o **SQL**. Antes de escrever consultas, é preciso entender **como os dados são organizados**: tabelas, linhas, colunas, **chaves** que ligam uma tabela a outra e **restrições** que impedem dados inválidos. Esta aula também apresenta o **NULL**, a fonte de mais bugs sutis em SQL. Todos os exemplos foram executados em **PostgreSQL 17.12**; diferenças em outros bancos são citadas só como alerta.`,
  theory: R`### Um banco relacional é um conjunto de tabelas
O modelo relacional (proposto por E. F. Codd em 1970) organiza os dados em **relações**, que no SQL chamamos de **tabelas**. Cada tabela tem **colunas** (atributos) com **nome e tipo** e **linhas** (tuplas) com um valor por coluna. Três ideias importam:
1. **A ordem das linhas não existe.** Uma tabela é um **conjunto** (na prática, um multiconjunto): sem §ORDER BY§, o banco devolve as linhas na ordem que lhe for conveniente, e essa ordem pode mudar.
2. **Cada coluna tem um tipo** (domínio): o banco recusa um texto onde se espera um número.
3. **As relações entre tabelas são feitas por valores**, não por ponteiros: um pedido guarda o §cliente_id§ do cliente, e é esse valor que permite juntar as tabelas depois (aula sqe-04).

### O esquema do curso
Usaremos uma loja pequena (PostgreSQL 17, esquema §loja§): §clientes(id, nome, cidade, email)§, §produtos(id, nome, categoria, preco)§, §pedidos(id, cliente_id, data, status)§ e §itens(pedido_id, produto_id, quantidade)§. O arquivo do laboratório mostra todas as instruções.

### CREATE TABLE e tipos
§§§
CREATE TABLE produtos (
  id        integer PRIMARY KEY,
  nome      text NOT NULL,
  categoria text NOT NULL,
  preco     numeric(10,2) NOT NULL CHECK (preco >= 0)
);
§§§
Tipos mais usados (PostgreSQL): §integer§ e §bigint§ (inteiros), §numeric(p,s)§ (decimal exato, **o tipo para dinheiro**), §double precision§ (ponto flutuante, aproximado), §text§ e §varchar(n)§ (textos), §boolean§, §date§, §timestamp§ e §timestamptz§ (data e hora). **Nunca use ponto flutuante para dinheiro**: §0.1 + 0.2§ não é exatamente §0.3§ em ponto flutuante; §numeric§ guarda o valor exato. Em outros bancos os nomes dos tipos variam (o C3.3 compara PostgreSQL e MySQL).

### Chaves
- **Chave primária** (§PRIMARY KEY§): identifica cada linha de forma **única** e **nunca é NULL**. Pode ser uma coluna (§id§) ou **composta** (em §itens§, o par §(pedido_id, produto_id)§ identifica o item: o mesmo produto não aparece duas vezes no mesmo pedido).
- **Chave estrangeira** (§FOREIGN KEY§ / §REFERENCES§): a coluna §pedidos.cliente_id§ só aceita valores que existam em §clientes.id§. Isso é a **integridade referencial**.
- **Chave natural x substituta**: o e-mail identifica uma pessoa (natural), mas muda; um §id§ numérico sem significado (substituto) é estável. Em geral usa-se a substituta como chave primária e se declara a natural como §UNIQUE§.

### Restrições (constraints)
Medidas no laboratório (as mensagens vêm do PostgreSQL 17):
- §UNIQUE§: inserir um cliente com o e-mail §ana@ex.com§ já existente falhou com **duplicate key value violates unique constraint "clientes_email_key"**;
- §CHECK§: inserir um produto com preço §-1§ falhou com **violates check constraint "produtos_preco_check"**;
- §FOREIGN KEY§: apagar o cliente §1§, que ainda tem pedidos, falhou com **violates foreign key constraint "pedidos_cliente_id_fkey"**;
- §NOT NULL§ e §DEFAULT§ (o status de um pedido nasce §'aberto'§).
**Regra de ouro:** deixe o banco impor as regras que **sempre** valem. Validar só na aplicação deixa brechas (outro serviço, um script, um erro).

### NULL: "não sei", não "zero" nem "vazio"
§NULL§ representa um valor **ausente ou desconhecido**. Por isso o SQL usa **lógica de três valores** (verdadeiro, falso, **desconhecido**):
- §email = NULL§ **não** devolve ninguém (medido: 0 linhas), porque "desconhecido = desconhecido" é **desconhecido**, não verdadeiro. Para testar, use **§IS NULL§** (medido: devolveu o cliente sem e-mail);
- na tabela de 4 clientes, §count(*)§ foi **4**, §count(email)§ foi **3** e §count(cidade)§ foi **3**: as funções de agregação **ignoram NULL**, e §count(*)§ conta linhas;
- §cidade <> 'Porto Alegre'§ devolveu só **Bruno**, e não Diego (cuja cidade é NULL): a comparação com NULL é desconhecida e o §WHERE§ só deixa passar o **verdadeiro**. Para incluir os NULL, use **§IS DISTINCT FROM§** (medido: devolveu Bruno **e** Diego).
Cuidado também com §NOT IN§ e NULL (aula sqe-07) e com §NULL§ em concatenação (§'a' || NULL§ é NULL).

### Esquemas, psql e boas práticas
No PostgreSQL, §CREATE SCHEMA§ agrupa tabelas e §SET search_path§ indica onde procurá-las. O cliente de linha de comando é o **§psql§**: §\dt§ lista tabelas, §\d produtos§ descreve uma tabela, §\echo§ imprime texto e §-f arquivo.sql§ executa um arquivo. Use nomes **minúsculos com sublinhado** (§data_pedido§), no singular ou plural **de forma consistente**, e evite palavras reservadas (§user§, §order§) como nomes.`,
  concepts: [
    { term: 'Relação (tabela)', def: 'Conjunto de linhas com as mesmas colunas, cada uma com nome e tipo.' },
    { term: 'Tupla (linha)', def: 'Um registro da tabela, com um valor por coluna.' },
    { term: 'Chave primária', def: 'Coluna ou conjunto de colunas que identifica cada linha de forma única e não nula.' },
    { term: 'Chave estrangeira', def: 'Coluna que só aceita valores existentes na chave de outra tabela; garante a integridade referencial.' },
    { term: 'Integridade referencial', def: 'Garantia de que toda referência a outra tabela aponta para uma linha existente.' },
    { term: 'Constraint (restrição)', def: 'Regra declarada no banco (NOT NULL, UNIQUE, CHECK, FOREIGN KEY) que rejeita dados inválidos.' },
    { term: 'NULL', def: 'Marcador de valor ausente ou desconhecido; comparações com NULL resultam em desconhecido.' },
    { term: 'Lógica de três valores', def: 'Lógica do SQL com verdadeiro, falso e desconhecido; o WHERE só mantém o verdadeiro.' },
    { term: 'Chave substituta', def: 'Identificador artificial (por exemplo, um inteiro sequencial) sem significado de negócio.' },
    { term: 'numeric', def: 'Tipo decimal exato, adequado para dinheiro; diferente dos tipos de ponto flutuante.' }
  ],
  examples: R`**Analogia:** uma tabela é uma **planilha com regras**: cada coluna aceita só um tipo de dado, a primeira coluna não pode repetir nem ficar vazia, e uma coluna só pode citar códigos que existam em outra planilha (chave estrangeira). O **NULL** é uma **célula em branco com um ponto de interrogação**: não é zero nem texto vazio, é "não sei". Perguntar "o valor desta célula é igual ao valor daquela célula em branco?" não tem resposta "sim" nem "não": a resposta é "não sei".

**Exemplo 1: erro de constraint.** Inserir um segundo cliente com o mesmo e-mail falhou no PostgreSQL com a mensagem de violação de unicidade, e a tabela ficou intacta.

**Exemplo 2: NULL em comparações.** Com Diego sem cidade, §cidade <> 'Porto Alegre'§ devolveu só Bruno; §IS DISTINCT FROM§ devolveu os dois.

**Exemplo 3: contagem e NULL.** §count(*)§ = 4; §count(email)§ = 3.`,
  code: [
    { title: 'Esquema da loja (SQL, executado no PostgreSQL 17)', lang: 'sql', code: R`CREATE SCHEMA loja;
SET search_path = loja;

CREATE TABLE clientes (
  id     integer PRIMARY KEY,
  nome   text NOT NULL,
  cidade text,
  email  text UNIQUE
);

CREATE TABLE pedidos (
  id         integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes(id),
  data       date NOT NULL,
  status     text NOT NULL DEFAULT 'aberto'
);

CREATE TABLE itens (
  pedido_id  integer REFERENCES pedidos(id),
  produto_id integer REFERENCES produtos(id),
  quantidade integer NOT NULL CHECK (quantidade > 0),
  PRIMARY KEY (pedido_id, produto_id)
);`, notes: [{ l: '5', t: 'PRIMARY KEY implica NOT NULL e UNIQUE.' }, { l: '8', t: 'UNIQUE aceita NULL: vários clientes sem e-mail são permitidos.' }, { l: '12', t: 'REFERENCES cria a chave estrangeira; o banco recusa um pedido de um cliente inexistente.' }, { l: '22', t: 'Chave primária composta: o mesmo produto não se repete no mesmo pedido.' }] },
    { title: 'NULL em ação (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`SELECT nome FROM clientes WHERE email = NULL;           -- 0 linhas
SELECT nome FROM clientes WHERE email IS NULL;          -- Bruno
SELECT count(*), count(email), count(cidade) FROM clientes;  -- 4, 3, 3
SELECT nome FROM clientes WHERE cidade <> 'Porto Alegre';          -- Bruno
SELECT nome FROM clientes WHERE cidade IS DISTINCT FROM 'Porto Alegre'; -- Bruno e Diego`, notes: [{ l: '1', t: '= NULL é sempre desconhecido: nunca devolve linhas.' }, { l: '3', t: 'count(*) conta linhas; count(coluna) ignora NULL.' }, { l: '5', t: 'IS DISTINCT FROM trata NULL como um valor comparável.' }] }
  ],
  bestPractices: ['Declare chaves primárias, estrangeiras, UNIQUE, NOT NULL e CHECK no banco.', 'Use numeric para dinheiro; nunca ponto flutuante.', 'Use IS NULL, IS NOT NULL e IS DISTINCT FROM ao lidar com valores ausentes.', 'Prefira chave primária substituta e declare a natural como UNIQUE.', 'Nunca dependa da ordem das linhas sem ORDER BY.', 'Use nomes consistentes, minúsculos e sem palavras reservadas.'],
  mistakes: ['Escrever = NULL ou <> NULL esperando um resultado.', 'Guardar dinheiro em double precision.', 'Validar regras só na aplicação.', 'Contar com count(coluna) achando que conta linhas.', 'Usar texto (como "sim"/"não") em vez de boolean ou de tabela de domínio.', 'Assumir que a ordem de inserção é a ordem de leitura.'],
  market: R`Praticamente toda vaga de desenvolvimento exige SQL, e a diferença entre pessoas juniores e plenas aparece no domínio de chaves, restrições e NULL: bugs de relatórios que "somem" linhas, duplicam totais ou aceitam dados inválidos vêm daqui. Entrevistas costumam pedir "o que acontece com NULL em uma comparação?".`,
  summary: R`O modelo relacional organiza dados em tabelas com colunas tipadas; as relações entre tabelas são feitas por valores (chaves). A chave primária identifica a linha; a estrangeira garante a integridade referencial; UNIQUE, NOT NULL e CHECK impedem dados inválidos (medido: mensagens de violação no PostgreSQL 17). NULL significa desconhecido: §= NULL§ nunca é verdadeiro (use §IS NULL§), agregações ignoram NULL (§count(*)§ 4, §count(email)§ 3) e §<>§ não inclui NULL (use §IS DISTINCT FROM§).`,
  refs: [REF.tutTable, REF.ddlConstraints, REF.datatype, REF.comparison, REF.psql],
  cards: [
    { q: 'O que a chave estrangeira garante?', a: 'Que toda referência aponta para uma linha existente na outra tabela (integridade referencial).' },
    { q: 'Por que WHERE email = NULL não devolve linhas?', a: 'A comparação com NULL é desconhecida e o WHERE só mantém o verdadeiro; use IS NULL.' },
    { q: 'Qual a diferença entre count(*) e count(coluna)?', a: 'count(*) conta linhas; count(coluna) ignora os valores NULL.' },
    { q: 'Qual tipo usar para dinheiro?', a: 'numeric (decimal exato), nunca ponto flutuante.' },
    { q: 'Existe ordem natural das linhas de uma tabela?', a: 'Não: sem ORDER BY a ordem não é garantida.' }
  ]
},
{
  id: 'sqe-02', moduleId: 'm1', order: 2, minutes: 65, tags: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT', 'LIKE', 'DISTINCT'],
  title: 'Consultando dados: SELECT, WHERE, ORDER BY, LIMIT e DISTINCT',
  objectives: ['Escrever consultas com §SELECT§, §FROM§, §WHERE§, §ORDER BY§ e §LIMIT§', 'Combinar condições com §AND§, §OR§, §NOT§, §IN§, §BETWEEN§ e §LIKE§', 'Usar expressões, apelidos (§AS§) e funções simples na lista de colunas', 'Ordenar com controle de NULL (§NULLS FIRST§) e paginar com §LIMIT§ e §OFFSET§', 'Explicar a ordem lógica de execução e por que um apelido não vale no §WHERE§'],
  intro: R`Consultar é a operação mais comum em SQL. Um §SELECT§ descreve **o que você quer**, não **como obter**: o banco decide a forma mais eficiente. Esta aula cobre filtros, ordenação e paginação e, principalmente, a **ordem lógica** em que as cláusulas são avaliadas, que explica erros como "a coluna não existe" ao usar um apelido no §WHERE§.`,
  theory: R`### Anatomia de um SELECT
§§§
SELECT   colunas e expressões
FROM     tabela
WHERE    condição sobre linhas
ORDER BY ordenação
LIMIT    quantidade OFFSET deslocamento;
§§§
O SQL é **declarativo**: você declara o resultado desejado. Cada cláusula tem papel próprio, e a **ordem de escrita** não é a **ordem lógica de avaliação**.

### Ordem lógica de execução
1. §FROM§ (de onde vêm as linhas, e §JOIN§s);
2. §WHERE§ (filtra **linhas**);
3. §GROUP BY§ (agrupa) e §HAVING§ (filtra **grupos**), vistos na aula sqe-06;
4. §SELECT§ (calcula as colunas e os apelidos);
5. §DISTINCT§;
6. §ORDER BY§;
7. §LIMIT§ / §OFFSET§.
Consequência medida: §SELECT nome AS n FROM produtos WHERE n = 'Caneta'§ falhou com **column "n" does not exist**, porque o §WHERE§ roda **antes** do §SELECT§ criar o apelido; já §ORDER BY n§ funcionou (devolveu "Caderno" com §LIMIT 1§), porque a ordenação roda **depois**. Repita a expressão no §WHERE§ ou use uma subconsulta/CTE.

### Filtros
- Comparações: §=§, §<>§ (ou §!=§), §<§, §<=§, §>§, §>=§.
- Lógicos: §AND§, §OR§, §NOT§; **§AND§ tem precedência sobre §OR§**: use parênteses para deixar a intenção explícita.
- §IN (1, 3)§ e §NOT IN§; §BETWEEN a AND b§ (**inclusivo** nos dois extremos; medido: §preco BETWEEN 3.5 AND 45§ devolveu Caneta 3,50, Caderno e Garrafa 45,00).
- Texto: §LIKE§ com §%§ (qualquer sequência) e §_§ (um caractere); §ILIKE§ ignora maiúsculas (extensão do PostgreSQL). Medido: §nome LIKE '%a'§ devolveu Caneta, Garrafa e Mochila. Cuidado: um padrão que começa com §%§ costuma impedir o uso de índice comum (tema do C3.3).
- Ausentes: §IS NULL§, §IS NOT NULL§, §IS DISTINCT FROM§ (aula sqe-01).
Medido: §WHERE categoria = 'papelaria' AND preco < 10 ORDER BY preco DESC§ devolveu Caneta (3,50) e Lápis (2,00), nessa ordem.

### Expressões e apelidos
A lista do §SELECT§ aceita colunas, expressões aritméticas, funções e literais. §preco * 1.1 AS com_reajuste§ calcula por linha; §round(preco * 1.1, 1)§ arredonda. Medido: para o produto 1 (3,50), §preco * 1.1§ deu **3.850** (a escala do resultado cresce) e §round(..., 1)§ deu **3.9**. **Divisão inteira:** §5/2§ devolve **2** (inteiros), enquanto §5/2.0§ devolve **2,5000000000000000** e §5::numeric/2§ também (medido). Para evitar surpresas, converta explicitamente com §CAST§ ou §::§.
§SELECT *§ é útil para explorar, mas evite em código de aplicação: colunas novas mudam o resultado e trazem dados desnecessários.

### DISTINCT
§SELECT DISTINCT categoria FROM produtos§ remove linhas duplicadas **do resultado** (medido: duas categorias, acessorios e papelaria). §DISTINCT§ pode esconder um erro de JOIN (aula sqe-05); use-o com consciência.

### ORDER BY
- §ASC§ (padrão) e §DESC§; várias colunas: §ORDER BY categoria, preco DESC§; também aceita posição (§ORDER BY 1§) e expressões.
- **NULL na ordenação:** no PostgreSQL, os NULL vêm **por último** em ordem crescente. Medido: §ORDER BY cidade§ colocou Diego (NULL) por último; §ORDER BY cidade NULLS FIRST§ o colocou primeiro. (A posição padrão dos NULL varia entre bancos; verifique a documentação do seu produto.)
- Sem §ORDER BY§ a ordem **não é garantida**.

### LIMIT e OFFSET
§LIMIT n§ restringe a quantidade e §OFFSET m§ pula as primeiras. Medido: §ORDER BY preco DESC LIMIT 2 OFFSET 1§ devolveu Garrafa (45,00) e Caderno (18,90), pulando a Mochila (120,00). Regras: **sempre** combine com §ORDER BY§ (senão "as primeiras" é arbitrário); §OFFSET§ grande é **lento** (o banco ainda percorre as linhas puladas); para listas longas, prefira **paginação por chave** (§WHERE id > último ORDER BY id LIMIT n§). O padrão SQL tem §FETCH FIRST n ROWS ONLY§, também aceito pelo PostgreSQL; outros bancos usam §TOP§ ou §ROWNUM§.

### Escrevendo consultas legíveis
Uma cláusula por linha, palavras reservadas em maiúsculas (convenção), apelidos curtos e significativos, parênteses para misturar §AND§ e §OR§ e **nunca** montar SQL concatenando texto do usuário (aula sqe-09).`,
  concepts: [
    { term: 'SELECT', def: 'Comando que declara as colunas e expressões desejadas no resultado.' },
    { term: 'WHERE', def: 'Cláusula que filtra linhas antes do agrupamento e da lista do SELECT.' },
    { term: 'ORDER BY', def: 'Cláusula que ordena o resultado; sem ela a ordem não é garantida.' },
    { term: 'Ordem lógica de execução', def: 'Sequência em que as cláusulas são avaliadas: FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT.' },
    { term: 'Apelido (alias)', def: 'Nome dado a uma coluna ou tabela com AS; não existe ainda no WHERE.' },
    { term: 'LIKE', def: 'Operador de comparação de padrões de texto com % e _.' },
    { term: 'BETWEEN', def: 'Teste de intervalo inclusivo nos dois extremos.' },
    { term: 'LIMIT e OFFSET', def: 'Cláusulas que limitam e deslocam o número de linhas devolvidas.' },
    { term: 'Paginação por chave', def: 'Paginar com WHERE sobre a última chave vista em vez de OFFSET, mantendo desempenho estável.' },
    { term: 'Declarativo', def: 'Estilo em que se descreve o resultado, e o banco escolhe como calculá-lo.' }
  ],
  examples: R`**Analogia:** um SELECT é um **pedido a um bibliotecário**: "traga os livros de papelaria com preço abaixo de 10, do mais caro para o mais barato, só os dois primeiros". Você não diz **em que estante procurar** (o banco decide). A ordem lógica é a do bibliotecário: primeiro vai ao acervo (FROM), tira os que não servem (WHERE), prepara a ficha de cada um (SELECT), ordena a pilha (ORDER BY) e entrega só os primeiros (LIMIT). Por isso você não pode usar, ao separar os livros, um "apelido" que só criará depois, na ficha.

**Exemplo 1: filtro composto.** Produtos de papelaria abaixo de 10, do mais caro ao mais barato: Caneta 3,50 e Lápis 2,00.

**Exemplo 2: apelido no WHERE.** Falha com "column n does not exist"; o mesmo apelido em ORDER BY funciona.

**Exemplo 3: paginação.** Pular 1 e levar 2 após ordenar por preço decrescente devolve Garrafa e Caderno.`,
  code: [
    { title: 'Filtros e ordenação (SQL, executado no PostgreSQL 17)', lang: 'sql', code: R`SELECT nome, preco
FROM produtos
WHERE categoria = 'papelaria' AND preco < 10
ORDER BY preco DESC;           -- Caneta 3.50, Lápis 2.00

SELECT nome FROM produtos WHERE preco BETWEEN 3.5 AND 45 ORDER BY id;  -- Caneta, Caderno, Garrafa

SELECT nome, cidade FROM clientes ORDER BY cidade NULLS FIRST;  -- Diego primeiro

SELECT nome, preco FROM produtos ORDER BY preco DESC LIMIT 2 OFFSET 1;  -- Garrafa, Caderno`, notes: [{ l: '3', t: 'AND combina as duas condições; ambas precisam ser verdadeiras.' }, { l: '7', t: 'BETWEEN inclui os dois extremos (3,50 e 45,00 entram).' }, { l: '9', t: 'NULLS FIRST sobrescreve a posição padrão dos NULL.' }, { l: '11', t: 'OFFSET 1 pula o mais caro; LIMIT 2 devolve os dois seguintes.' }] },
    { title: 'Ordem lógica e apelidos (SQL)', lang: 'sql', code: R`-- ERRO: column "n" does not exist (o WHERE roda antes do SELECT)
SELECT nome AS n FROM produtos WHERE n = 'Caneta';

-- OK: ORDER BY roda depois do SELECT
SELECT nome AS n FROM produtos ORDER BY n LIMIT 1;   -- Caderno

-- OK: repetir a expressão (ou usar subconsulta/CTE)
SELECT nome AS n FROM produtos WHERE nome = 'Caneta';

-- divisão: inteira x decimal
SELECT 5/2 AS inteira, 5/2.0 AS decimal;   -- 2 e 2.5000000000000000`, notes: [{ l: '2', t: 'O apelido só passa a existir na fase SELECT, depois do WHERE.' }, { l: '5', t: 'O ORDER BY enxerga os apelidos do SELECT.' }, { l: '12', t: 'Dois inteiros dão divisão inteira; um decimal força divisão decimal.' }] }
  ],
  bestPractices: ['Sempre use ORDER BY quando a ordem importa, inclusive com LIMIT.', 'Use parênteses ao misturar AND e OR.', 'Liste as colunas explicitamente em código de aplicação.', 'Prefira paginação por chave a OFFSET grande.', 'Converta tipos explicitamente em divisões e comparações ambíguas.', 'Escreva uma cláusula por linha e use apelidos claros.'],
  mistakes: ['Usar apelido do SELECT no WHERE.', 'Esquecer ORDER BY e depender da ordem "natural".', 'Misturar AND e OR sem parênteses.', 'Usar SELECT * em consultas de produção.', 'Usar OFFSET grande em tabelas enormes.', 'Usar DISTINCT para "consertar" duplicatas sem entender a causa.'],
  market: R`Consultar bem é o dia a dia: relatórios, telas, filtros de API. Equipes valorizam quem escreve consultas legíveis, que entende a ordem lógica (por isso sabe porque o apelido falha), pagina de forma eficiente e não confia na ordem implícita das linhas.`,
  summary: R`Um SELECT declara o resultado; a ordem lógica é FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT (medido: apelido falha no WHERE e funciona no ORDER BY). Filtre com comparações, AND/OR (parênteses), IN, BETWEEN (inclusivo) e LIKE; ordene com ASC/DESC e NULLS FIRST; pagine com LIMIT/OFFSET sempre com ORDER BY e prefira paginação por chave. Divisão de inteiros é inteira (5/2 = 2).`,
  refs: [REF.select, REF.comparison, REF.matching, REF.orderby, REF.limit],
  cards: [
    { q: 'Qual a ordem lógica de avaliação de um SELECT?', a: 'FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT.' },
    { q: 'Por que um apelido não vale no WHERE?', a: 'Porque o WHERE é avaliado antes do SELECT criar o apelido; no ORDER BY ele vale.' },
    { q: 'BETWEEN inclui os extremos?', a: 'Sim, nos dois extremos.' },
    { q: 'Por que LIMIT deve vir com ORDER BY?', a: 'Sem ordenação, "as primeiras linhas" é arbitrário.' },
    { q: 'Quanto é 5/2 com inteiros em PostgreSQL?', a: '2 (divisão inteira); use 5/2.0 ou cast para obter 2,5.' }
  ]
},
{
  id: 'sqe-03', moduleId: 'm1', order: 3, minutes: 65, tags: ['INSERT', 'UPDATE', 'DELETE', 'RETURNING', 'upsert', 'transação'],
  title: 'Alterando dados: INSERT, UPDATE, DELETE, RETURNING e upsert',
  objectives: ['Inserir linhas com §INSERT§ (uma ou várias) e nomear as colunas', 'Alterar e apagar com §UPDATE§ e §DELETE§ sempre com §WHERE§ revisado', 'Usar §RETURNING§ para obter as linhas afetadas', 'Aplicar §ON CONFLICT§ (upsert) para inserir ou atualizar', 'Usar §BEGIN§, §COMMIT§ e §ROLLBACK§ para testar mudanças com segurança'],
  intro: R`Ler dados é seguro; **alterá-los** exige cuidado: um §UPDATE§ ou §DELETE§ sem §WHERE§ afeta a tabela inteira. Esta aula mostra os três comandos de escrita, o §RETURNING§ (que devolve o que mudou), o **upsert** e o hábito mais importante para quem mexe em dados: **fazer a mudança dentro de uma transação e conferir antes de confirmar**.`,
  theory: R`### INSERT
§§§
INSERT INTO clientes (id, nome, cidade) VALUES (5, 'Eva', 'Pelotas');
INSERT INTO produtos (id, nome, categoria, preco) VALUES (6,'A','x',1), (7,'B','x',2);
INSERT INTO arquivo SELECT * FROM clientes WHERE cidade IS NULL;
§§§
**Sempre nomeie as colunas**: o código continua correto se a tabela ganhar uma coluna ou mudar de ordem. Colunas omitidas recebem o §DEFAULT§ ou §NULL§ (e a inserção falha se a coluna for §NOT NULL§ sem padrão). Várias linhas em um só §INSERT§ são **muito mais eficientes** do que um comando por linha. É possível inserir o resultado de um §SELECT§.

### UPDATE
§UPDATE produtos SET preco = preco * 1.10 WHERE categoria = 'papelaria'§. O lado direito vê os **valores antigos** da linha. Sem §WHERE§, **todas** as linhas mudam. Medido (dentro de uma transação): o reajuste de 10% nos produtos de papelaria devolveu, via §RETURNING§, os preços **3,85**, **20,79** e **2,20**, que vieram de 3,50, 18,90 e 2,00.

### DELETE
§DELETE FROM clientes WHERE id = 5§. Também sem §WHERE§ apaga tudo (para esvaziar uma tabela grande, §TRUNCATE§ é mais rápido, mas tem regras próprias). A **chave estrangeira** protege: medido, apagar o cliente §1§, que tem pedidos, falhou com "violates foreign key constraint". As opções de §ON DELETE§ na declaração da chave definem o comportamento: §RESTRICT§ ou §NO ACTION§ (padrão: recusa), §CASCADE§ (apaga os dependentes), §SET NULL§ e §SET DEFAULT§. **Cuidado com §CASCADE§**: apaga em cadeia sem aviso.
**Exclusão lógica** (*soft delete*): em vez de apagar, marcar uma coluna (§removido_em§). Preserva histórico, mas exige filtrar em toda consulta e atrapalha constraints de unicidade.

### RETURNING
O PostgreSQL permite §RETURNING colunas§ em §INSERT§, §UPDATE§ e §DELETE§, devolvendo as linhas **afetadas** em uma só ida ao banco. Medido: §INSERT ... RETURNING id, nome§ devolveu (5, Eva). Ótimo para obter ids gerados, confirmar o que foi alterado e **auditar** um §DELETE§ antes de confirmar. (Outros bancos têm mecanismos diferentes: por exemplo, MySQL não tem §RETURNING§ em §UPDATE§ e §DELETE§; confirme na documentação do seu produto.)

### Upsert: ON CONFLICT
Inserir **ou** atualizar, de forma atômica:
§§§
INSERT INTO clientes (id, nome, cidade, email) VALUES (7, 'Gil', 'Y', 'gil@ex.com')
ON CONFLICT (email) DO NOTHING;
INSERT INTO clientes (id, nome, cidade, email) VALUES (8, 'Gil2', 'Y', 'gil@ex.com')
ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome RETURNING id, nome;
§§§
Medido: depois de inserir o Gil, o segundo comando, com o mesmo e-mail, **atualizou** a linha existente (id 7) e devolveu (7, Gil2); não criou o id 8. §EXCLUDED§ refere-se à linha que **tentou** entrar. O upsert exige uma **restrição única** como alvo. Em MySQL o equivalente é §INSERT ... ON DUPLICATE KEY UPDATE§ (documentação; não executado aqui).

### Transações para experimentar com segurança
§BEGIN;§ abre uma transação, os comandos seguintes ficam **provisórios**, e você escolhe §COMMIT;§ (confirmar) ou §ROLLBACK;§ (desfazer). Medido: dentro de §BEGIN§, inserimos o cliente 5, reajustamos preços e apagamos o cliente 5; após §ROLLBACK§, §count(*)§ de clientes voltou a **4** e os preços voltaram aos originais. Hábito profissional: **rode o §UPDATE§ ou §DELETE§ em uma transação, confira com §RETURNING§ ou com um §SELECT§, e só então §COMMIT§**. Transações em profundidade são o tema do curso C3.5.

### Boas práticas de escrita
- Sempre escreva o §WHERE§ **primeiro**, ou comece com um §SELECT§ com o mesmo §WHERE§ para ver quantas linhas serão afetadas.
- Prefira alterar por **chave primária** quando for uma linha só.
- Em produção, use um papel (usuário) **sem permissão** de §DELETE§ em tabelas que não precisa alterar.
- Registre o **número de linhas afetadas** (o cliente do banco informa) e confira-o.
- Nunca monte comandos por concatenação de texto (aula sqe-09).`,
  concepts: [
    { term: 'INSERT', def: 'Comando que adiciona linhas a uma tabela.' },
    { term: 'UPDATE', def: 'Comando que altera colunas de linhas existentes, filtradas pelo WHERE.' },
    { term: 'DELETE', def: 'Comando que remove linhas existentes, filtradas pelo WHERE.' },
    { term: 'RETURNING', def: 'Cláusula do PostgreSQL que devolve as linhas inseridas, alteradas ou apagadas.' },
    { term: 'Upsert', def: 'Inserir a linha ou atualizá-la se já existir conflito de unicidade (ON CONFLICT).' },
    { term: 'EXCLUDED', def: 'Pseudotabela que contém a linha que tentou ser inserida em um ON CONFLICT.' },
    { term: 'ON DELETE CASCADE', def: 'Regra de chave estrangeira que apaga as linhas dependentes junto com a referenciada.' },
    { term: 'Exclusão lógica', def: 'Marcar a linha como removida em vez de apagá-la fisicamente.' },
    { term: 'Transação', def: 'Conjunto de comandos que é confirmado ou desfeito como um todo.' },
    { term: 'TRUNCATE', def: 'Comando que esvazia uma tabela rapidamente, com regras próprias.' }
  ],
  examples: R`**Analogia:** alterar dados em produção é como **editar um documento compartilhado sem o histórico ligado**. A transação é o botão "**ver como ficaria**": você faz as mudanças, confere o resultado e só então confirma; se algo estiver errado, descarta tudo. O §RETURNING§ é o **recibo** imediato do que foi feito. O upsert é "**cadastre este cliente; se já existir, apenas atualize**", sem verificar antes e correr o risco de outra pessoa cadastrar no meio.

**Exemplo 1: reajuste com conferência.** Dentro de uma transação, §UPDATE ... RETURNING§ mostrou os três preços novos; o §ROLLBACK§ restaurou os antigos.

**Exemplo 2: chave estrangeira.** O DELETE de um cliente com pedidos foi recusado pelo banco.

**Exemplo 3: upsert.** Inserir o mesmo e-mail duas vezes atualizou a linha original (id 7) em vez de criar outra.`,
  code: [
    { title: 'Alteração segura dentro de uma transação (SQL, PostgreSQL 17)', lang: 'sql', code: R`BEGIN;

INSERT INTO clientes (id, nome, cidade) VALUES (5, 'Eva', 'Pelotas')
RETURNING id, nome;                                   -- 5 | Eva

UPDATE produtos SET preco = preco * 1.10
WHERE categoria = 'papelaria'
RETURNING id, preco;                                  -- 1 3.85 | 2 20.79 | 5 2.20

DELETE FROM clientes WHERE id = 5 RETURNING id;       -- 5

ROLLBACK;                                             -- tudo desfeito
SELECT count(*) FROM clientes;                        -- 4`, notes: [{ l: '1', t: 'A partir daqui as mudanças ficam provisórias.' }, { l: '7', t: 'RETURNING mostra o que realmente foi alterado.' }, { l: '13', t: 'ROLLBACK descarta; trocar por COMMIT confirmaria.' }] },
    { title: 'Upsert e restrições (SQL, PostgreSQL 17)', lang: 'sql', code: R`INSERT INTO clientes (id, nome, cidade, email)
VALUES (7, 'Gil', 'Y', 'gil@ex.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO clientes (id, nome, cidade, email)
VALUES (8, 'Gil2', 'Y', 'gil@ex.com')
ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
RETURNING id, nome;                                   -- 7 | Gil2

DELETE FROM clientes WHERE id = 1;
-- ERROR: violates foreign key constraint "pedidos_cliente_id_fkey"`, notes: [{ l: '3', t: 'DO NOTHING ignora a linha duplicada sem erro.' }, { l: '8', t: 'DO UPDATE atualiza a linha existente com os valores da linha nova (EXCLUDED).' }, { l: '12', t: 'O banco protege a integridade: o cliente 1 ainda tem pedidos.' }] }
  ],
  bestPractices: ['Nomeie sempre as colunas no INSERT.', 'Teste UPDATE e DELETE primeiro como SELECT com o mesmo WHERE.', 'Faça mudanças em massa dentro de uma transação e confira antes do COMMIT.', 'Use RETURNING para obter ids e auditar o que foi afetado.', 'Use ON CONFLICT para evitar corridas de "verificar e inserir".', 'Evite CASCADE sem avaliar o impacto; considere exclusão lógica quando precisar de histórico.'],
  mistakes: ['Rodar UPDATE ou DELETE sem WHERE.', 'Depender da ordem das colunas no INSERT sem nomeá-las.', 'Verificar com SELECT e depois inserir (corrida) em vez de usar upsert.', 'Confirmar uma transação sem conferir o número de linhas afetadas.', 'Usar CASCADE sem perceber a cadeia de exclusões.', 'Apagar dados que deveriam ser arquivados.'],
  market: R`Acidentes com UPDATE e DELETE sem WHERE são clássicos de incidentes em produção. Equipes maduras exigem transações, revisão de comandos e papéis com permissões mínimas. Saber usar RETURNING e upsert reduz idas ao banco e evita corridas.`,
  summary: R`§INSERT§ adiciona (nomeie as colunas e prefira lotes), §UPDATE§ altera e §DELETE§ remove, sempre com §WHERE§ conferido; §RETURNING§ devolve o que foi afetado; §ON CONFLICT§ faz upsert (medido: o mesmo e-mail atualizou o id 7). A chave estrangeira recusa apagar linhas referenciadas. Use §BEGIN§/§ROLLBACK§ para testar (medido: clientes voltou a 4) e confirme com §COMMIT§ só depois de conferir.`,
  refs: [REF.insert, REF.update, REF.delete, REF.returning, REF.ddlConstraints],
  cards: [
    { q: 'O que acontece com um UPDATE sem WHERE?', a: 'Todas as linhas da tabela são alteradas.' },
    { q: 'O que o RETURNING faz?', a: 'Devolve as linhas inseridas, alteradas ou apagadas pelo comando.' },
    { q: 'Como fazer inserir-ou-atualizar de forma atômica no PostgreSQL?', a: 'INSERT ... ON CONFLICT (coluna única) DO UPDATE.' },
    { q: 'Como testar uma mudança sem consolidar?', a: 'Dentro de BEGIN, conferir com RETURNING ou SELECT e terminar com ROLLBACK (ou COMMIT para confirmar).' },
    { q: 'O que a chave estrangeira faz ao apagar uma linha referenciada?', a: 'Por padrão recusa o DELETE; ON DELETE CASCADE apagaria os dependentes.' }
  ]
}
];
