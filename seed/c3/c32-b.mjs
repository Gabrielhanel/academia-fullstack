// C3.2 — SQL avançado e analítico. Aulas 3 e 4 (views; funções, procedures e triggers).
const R = String.raw;

export const REF2 = {
  createView: { title: 'PostgreSQL 17 — CREATE VIEW', url: 'https://www.postgresql.org/docs/17/sql-createview.html', kind: 'doc' },
  createMatView: { title: 'PostgreSQL 17 — CREATE MATERIALIZED VIEW', url: 'https://www.postgresql.org/docs/17/sql-creatematerializedview.html', kind: 'doc' },
  refreshMatView: { title: 'PostgreSQL 17 — REFRESH MATERIALIZED VIEW', url: 'https://www.postgresql.org/docs/17/sql-refreshmaterializedview.html', kind: 'doc' },
  rulesViews: { title: 'PostgreSQL 17 — Views and the Rule System', url: 'https://www.postgresql.org/docs/17/rules-views.html', kind: 'doc' },
  createFunction: { title: 'PostgreSQL 17 — CREATE FUNCTION', url: 'https://www.postgresql.org/docs/17/sql-createfunction.html', kind: 'doc' },
  createProcedure: { title: 'PostgreSQL 17 — CREATE PROCEDURE', url: 'https://www.postgresql.org/docs/17/sql-createprocedure.html', kind: 'doc' },
  plpgsql: { title: 'PostgreSQL 17 — PL/pgSQL', url: 'https://www.postgresql.org/docs/17/plpgsql.html', kind: 'doc' },
  createTrigger: { title: 'PostgreSQL 17 — CREATE TRIGGER', url: 'https://www.postgresql.org/docs/17/sql-createtrigger.html', kind: 'doc' },
  xfunc: { title: 'PostgreSQL 17 — User-Defined Functions', url: 'https://www.postgresql.org/docs/17/xfunc.html', kind: 'doc' },
  call: { title: 'PostgreSQL 17 — CALL', url: 'https://www.postgresql.org/docs/17/sql-call.html', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'sqa-03', moduleId: 'm2', order: 3, minutes: 70, tags: ['view', 'materialized view', 'WITH CHECK OPTION', 'abstração', 'segurança'],
  title: 'Views e views materializadas: consultas salvas, atualização e segurança',
  objectives: ['Criar views para dar nome a consultas e simplificar o acesso a dados', 'Distinguir view comum de view materializada e prever quando cada uma fica desatualizada', 'Usar §WITH CHECK OPTION§ e entender quando uma view é atualizável', 'Usar views como camada de abstração e de controle de acesso', 'Escolher entre view, view materializada, CTE e tabela de resumo'],
  intro: R`Uma **view** é uma **consulta salva com um nome**. Para quem consulta, ela se comporta como uma tabela, mas **não guarda dados** (a comum) e sempre reflete o estado atual. Já a **view materializada** guarda o **resultado** e precisa ser **atualizada** explicitamente. Esta aula mostra quando usar cada uma, o que acontece ao inserir ou alterar por meio de uma view e como views ajudam a **proteger e organizar** o acesso a dados. Tudo foi executado no PostgreSQL 17.12.`,
  theory: R`### View comum
§§§
CREATE VIEW resumo_vendedor AS
SELECT v.id, v.nome, v.regiao, count(*) AS vendas, sum(s.valor) AS total
FROM vendedores v JOIN vendas s ON s.vendedor_id = v.id
GROUP BY v.id, v.nome, v.regiao;

SELECT * FROM resumo_vendedor ORDER BY id;
§§§
Medido: devolveu Ana (4 vendas, 700,00), Bruno (3, 450,00), Carla (3, 1.000,00) e Diego (1, 250,00). Uma view comum **não armazena dados**: a consulta é **reescrita** a cada uso (o PostgreSQL substitui o nome da view pela sua definição) e, por isso, **sempre mostra os dados atuais**. Vantagens:
- **nome e reuso**: a regra "total por vendedor" fica em **um** lugar;
- **abstração**: a aplicação consulta a view e o esquema por trás pode mudar;
- **segurança**: dê permissão na view (§GRANT SELECT§) e não nas tabelas, expondo só as colunas e linhas permitidas. (Em PostgreSQL, §security_barrier§ e as permissões do dono da view têm detalhes importantes: consulte a documentação antes de usar views como única barreira de segurança.)
Custos: a view **não torna a consulta mais rápida** (o custo é o da consulta original) e **camadas de views sobre views** dificultam entender o plano.

### View materializada
§CREATE MATERIALIZED VIEW mv_total_regiao AS SELECT ...§ **executa a consulta e guarda o resultado** como uma tabela. Consultar é rápido (lê o resultado pronto) e permite **índices**, mas os dados ficam **velhos** até um §REFRESH MATERIALIZED VIEW§. Medido:
1. inicialmente, Norte = **1.250,00** na view materializada e na view comum;
2. inserimos uma venda de 1.000,00 no Norte;
3. a **view materializada** continuou mostrando **1.250,00** (desatualizada); a **view comum** mostrou **2.250,00**;
4. após §REFRESH MATERIALIZED VIEW mv_total_regiao§, a materializada passou a mostrar **2.250,00**.
Quando usar: relatórios caros que podem tolerar **atraso** (diário, de hora em hora). Opções: §REFRESH ... CONCURRENTLY§ (atualiza sem bloquear leituras; exige um **índice único** na view) e agendamento externo (cron, tarefas do banco, ferramentas de orquestração). Não há atualização automática em tempo real no PostgreSQL: se precisa, use consulta direta, triggers cuidadosos ou tabelas de resumo mantidas pela aplicação.

### Views atualizáveis
Uma view **simples** (uma só tabela, sem agregação, sem §DISTINCT§, sem §LIMIT§ etc.) é **automaticamente atualizável**: §INSERT§, §UPDATE§ e §DELETE§ na view atuam na tabela de base. Medido: criamos §vendas_sul§ como §SELECT * FROM vendedores WHERE regiao = 'Sul'§ e apagamos o vendedor inserido por ela.
Uma view com **§GROUP BY§** não é: medido, §UPDATE resumo_vendedor SET total = 0§ falhou com **cannot update view "resumo_vendedor" ... Views containing GROUP BY are not automatically updatable** (e sugeriu um gatilho §INSTEAD OF§). Para views complexas, escreva triggers §INSTEAD OF§ ou atualize as tabelas diretamente.

### WITH CHECK OPTION
Sem ela, é possível inserir **por uma view** uma linha que a própria view **não enxerga**. Com §WITH CHECK OPTION§ o banco recusa. Medido: com §CREATE VIEW vendas_sul AS SELECT * FROM vendedores WHERE regiao = 'Sul' WITH CHECK OPTION§, inserir (9, 'Eva', 'Norte') falhou com **new row violates check option for view "vendas_sul"**; inserir (9, 'Eva', 'Sul') foi aceito. Use quando a view representa um **subconjunto** que não deve ser violado.

### Manutenção
- §CREATE OR REPLACE VIEW§ permite mudar a definição **mantendo** as colunas existentes (só acrescenta no final);
- §DROP VIEW§ falha se outros objetos dependem dela (use §CASCADE§ com cuidado);
- views **dependem** das tabelas: alterar ou apagar uma coluna usada pela view é bloqueado, e **§SELECT *§** em uma view **congela** a lista de colunas no momento da criação (colunas novas da tabela não aparecem). Liste as colunas explicitamente.

### Escolhendo
- **CTE**: etapas de **uma** consulta (aula sqe-08);
- **View**: consulta reutilizada por **várias** consultas e sempre atual;
- **View materializada**: resultado caro e reutilizado, com **atraso aceitável**;
- **Tabela de resumo** mantida por processo: quando é preciso controle fino de atualização incremental;
- **Visão por papel**: exposição segura de dados.`,
  concepts: [
    { term: 'View', def: 'Consulta salva com um nome que se comporta como uma tabela e não guarda dados.' },
    { term: 'View materializada', def: 'Consulta cujo resultado é armazenado e só é atualizado por REFRESH.' },
    { term: 'REFRESH MATERIALIZED VIEW', def: 'Comando que recalcula e substitui o conteúdo de uma view materializada.' },
    { term: 'REFRESH CONCURRENTLY', def: 'Atualização que não bloqueia leituras e exige um índice único na view.' },
    { term: 'View atualizável', def: 'View simples cujas alterações são repassadas automaticamente à tabela de base.' },
    { term: 'WITH CHECK OPTION', def: 'Cláusula que impede inserir ou alterar linhas fora do filtro da view.' },
    { term: 'INSTEAD OF trigger', def: 'Gatilho que substitui a operação em uma view, permitindo atualizar views complexas.' },
    { term: 'Reescrita de consulta', def: 'Substituição do nome da view pela sua definição na hora de executar a consulta.' },
    { term: 'Camada de abstração', def: 'Interface estável (views) que isola a aplicação da estrutura das tabelas.' },
    { term: 'Tabela de resumo', def: 'Tabela mantida por processo com agregados pré-calculados.' }
  ],
  examples: R`**Analogia:** a view comum é uma **janela de vidro** para a tabela: você sempre enxerga o que há do outro lado. A view materializada é uma **fotografia** daquela janela: é rápida de olhar, mas só muda quando você tira outra foto (REFRESH). O WITH CHECK OPTION é um **porteiro** que só deixa entrar pela janela quem pertence ao grupo que a janela mostra.

**Exemplo 1: foto desatualizada.** Depois de inserir uma venda de 1.000, a view comum mostrou 2.250 e a materializada ainda 1.250, até o REFRESH.

**Exemplo 2: porteiro.** Inserir um vendedor da região Norte pela view do Sul foi recusado.

**Exemplo 3: view com GROUP BY.** UPDATE nela falha: o banco não sabe a qual linha de qual tabela o total pertence.`,
  code: [
    { title: 'View comum x materializada (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`CREATE VIEW resumo_vendedor AS
SELECT v.id, v.nome, v.regiao, count(*) AS vendas, sum(s.valor) AS total
FROM vendedores v JOIN vendas s ON s.vendedor_id = v.id
GROUP BY v.id, v.nome, v.regiao;

CREATE MATERIALIZED VIEW mv_total_regiao AS
SELECT v.regiao, sum(s.valor) AS total
FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id
GROUP BY v.regiao;

INSERT INTO vendas VALUES (12, 3, '2026-03-25', 1000, 'C');

SELECT total FROM mv_total_regiao WHERE regiao = 'Norte';              -- 1250.00 (velha)
SELECT sum(total) FROM resumo_vendedor WHERE regiao = 'Norte';         -- 2250.00 (atual)

REFRESH MATERIALIZED VIEW mv_total_regiao;
SELECT total FROM mv_total_regiao WHERE regiao = 'Norte';              -- 2250.00`, notes: [{ l: '6', t: 'A materializada executa a consulta uma vez e guarda o resultado.' }, { l: '11', t: 'Os dados novos entram na tabela, mas não na materializada.' }, { l: '16', t: 'REFRESH reexecuta a consulta e substitui o conteúdo.' }] },
    { title: 'View atualizável e WITH CHECK OPTION (SQL, saída medida)', lang: 'sql', code: R`CREATE VIEW vendas_sul AS
SELECT * FROM vendedores WHERE regiao = 'Sul' WITH CHECK OPTION;

INSERT INTO vendas_sul VALUES (9, 'Eva', 'Norte');
-- ERROR: new row violates check option for view "vendas_sul"

INSERT INTO vendas_sul VALUES (9, 'Eva', 'Sul');     -- ok
DELETE FROM vendas_sul WHERE id = 9;                 -- ok

UPDATE resumo_vendedor SET total = 0;
-- ERROR: cannot update view "resumo_vendedor"
-- DETAIL: Views containing GROUP BY are not automatically updatable.`, notes: [{ l: '2', t: 'A view é simples (uma tabela, só filtro), por isso é atualizável.' }, { l: '5', t: 'CHECK OPTION recusa linhas que a view não enxergaria.' }, { l: '10', t: 'Views com agregação exigem INSTEAD OF triggers para aceitar escrita.' }] }
  ],
  bestPractices: ['Liste as colunas da view explicitamente em vez de SELECT *.', 'Use views para nomear regras de negócio reutilizadas.', 'Use views materializadas para relatórios caros que toleram atraso e documente a frequência de REFRESH.', 'Crie um índice único e use REFRESH CONCURRENTLY quando leituras não podem bloquear.', 'Use WITH CHECK OPTION em views que representam subconjuntos graváveis.', 'Evite cadeias profundas de views sobre views.'],
  mistakes: ['Achar que a view materializada se atualiza sozinha.', 'Achar que uma view deixa a consulta mais rápida.', 'Usar SELECT * em views e perder colunas novas (ou quebrar ao alterar tabelas).', 'Tentar atualizar views com GROUP BY ou JOIN complexo sem triggers.', 'Confiar em views como única barreira de segurança sem estudar as regras de permissão.', 'Esquecer o REFRESH após cargas de dados.'],
  market: R`Views e views materializadas aparecem em data warehouses, painéis e APIs de leitura. A pergunta "qual a diferença entre view e view materializada?" é recorrente, e o erro de esquecer o refresh está por trás de muitos "o relatório está desatualizado".`,
  summary: R`Uma view é uma consulta nomeada, reescrita a cada uso e sempre atual (medido: 2.250 após o insert). A view materializada guarda o resultado e só muda com §REFRESH§ (medido: 1.250 até o refresh, depois 2.250). Views simples são atualizáveis; com §WITH CHECK OPTION§ recusam linhas fora do filtro (medido: Eva no Norte recusada); views com §GROUP BY§ não são atualizáveis. Escolha entre CTE, view, materializada e tabela de resumo conforme reuso e atraso aceitável.`,
  refs: [REF2.createView, REF2.createMatView, REF2.refreshMatView, REF2.rulesViews],
  cards: [
    { q: 'Uma view comum guarda dados?', a: 'Não: a consulta é reescrita a cada uso e sempre mostra o estado atual.' },
    { q: 'Quando uma view materializada fica desatualizada?', a: 'Quando as tabelas mudam e ninguém executa REFRESH MATERIALIZED VIEW.' },
    { q: 'O que faz WITH CHECK OPTION?', a: 'Impede inserir ou alterar, pela view, linhas que ela não enxergaria.' },
    { q: 'Por que não se atualiza uma view com GROUP BY?', a: 'O banco não sabe como mapear o valor agregado para as linhas das tabelas de base; seria preciso um trigger INSTEAD OF.' },
    { q: 'O que exige o REFRESH CONCURRENTLY?', a: 'Um índice único na view materializada.' }
  ]
},
{
  id: 'sqa-04', moduleId: 'm2', order: 4, minutes: 75, tags: ['função', 'procedure', 'PL/pgSQL', 'trigger', 'transação', 'regras de negócio'],
  title: 'Funções, stored procedures e triggers: lógica dentro do banco com PL/pgSQL',
  objectives: ['Criar funções em SQL e em PL/pgSQL e chamá-las em consultas', 'Distinguir função (§SELECT§) de procedure (§CALL§) e saber quando usar cada uma', 'Tratar erros com §RAISE EXCEPTION§ e entender o efeito na transação', 'Criar triggers para auditoria e regras de integridade', 'Avaliar custos e riscos de colocar lógica no banco'],
  intro: R`O banco não serve só para guardar dados: ele também pode **executar lógica**. **Funções** devolvem valores e podem ser usadas em consultas; **procedures** executam ações (e podem controlar transações); **triggers** disparam automaticamente em eventos como §INSERT§. Esta aula mostra a sintaxe com **PL/pgSQL** no PostgreSQL 17 e, principalmente, **quando vale a pena** (e quando não vale) mover regras para o banco.`,
  theory: R`### Funções
Uma função tem nome, parâmetros, tipo de retorno e **linguagem**. Em SQL puro:
§§§
CREATE FUNCTION imposto(valor numeric, taxa numeric DEFAULT 0.1)
RETURNS numeric LANGUAGE sql IMMUTABLE
AS $$ SELECT round(valor * taxa, 2) $$;

SELECT imposto(100), imposto(100, 0.25);
§§§
Medido: **10,00** e **25,00**. Pontos: parâmetros com §DEFAULT§; o corpo vai entre §$$...$$§ (delimitador de texto que evita aspas); **volatilidade** (§IMMUTABLE§ = mesma entrada, mesma saída, sempre; §STABLE§ = constante dentro de uma consulta; §VOLATILE§ = pode mudar, o padrão) informa o otimizador e **precisa ser verdadeira**, pois afeta planos e índices de expressão.

### PL/pgSQL
A linguagem procedural do PostgreSQL acrescenta **variáveis, condicionais, laços e tratamento de exceções**:
§§§
CREATE FUNCTION total_vendedor(p_id int) RETURNS numeric
LANGUAGE plpgsql STABLE AS $$
DECLARE t numeric;
BEGIN
  SELECT coalesce(sum(valor), 0) INTO t FROM vendas WHERE vendedor_id = p_id;
  RETURN t;
END $$;
§§§
Medido: §total_vendedor(1)§ = **700,00** e §total_vendedor(99)§ = **0** (vendedor inexistente). Estruturas úteis: §DECLARE§, §IF ... THEN ... ELSIF ... END IF§, §LOOP§/§FOR§/§WHILE§, §RETURN§, §RETURN QUERY§ (funções que devolvem tabelas: §RETURNS TABLE (...)§), §EXCEPTION WHEN ... THEN§ e §FOUND§ após comandos. **Nomeie variáveis com prefixo** (§p_§, §v_§) para não colidirem com nomes de colunas.

### Procedures
Criadas com §CREATE PROCEDURE§ e chamadas com **§CALL§**, não devolvem valor (podem ter parâmetros §OUT§) e, ao contrário das funções, **podem executar §COMMIT§ e §ROLLBACK§ dentro do corpo** (quando chamadas fora de um bloco de transação). Medido:
§§§
CREATE PROCEDURE registrar_venda(p_id int, p_vendedor int, p_valor numeric)
LANGUAGE plpgsql AS $$
BEGIN
  IF p_valor <= 0 THEN RAISE EXCEPTION 'valor inválido: %', p_valor; END IF;
  INSERT INTO vendas VALUES (p_id, p_vendedor, current_date, p_valor, 'X');
  INSERT INTO log_vendas (venda_id, evento) VALUES (p_id, 'criada');
END $$;
§§§
§CALL registrar_venda(20, 1, 80)§ criou **1 venda** e **1 registro de log**. §CALL registrar_venda(21, 1, -5)§ falhou com **valor inválido: -5** e **não criou a venda 21** (contagem 0): a exceção **desfaz** tudo o que a chamada fez, pois o comando roda em uma transação (aqui, a implícita de um comando isolado). Procedures são uma boa forma de **empacotar uma operação de negócio** (validar, gravar em várias tabelas, registrar auditoria) em **uma ida ao banco**.

### Funções x procedures
- **Função**: usada **em consultas** (§SELECT f(x)§, §WHERE f(x) > 0§, em índices por expressão); não controla transações; pode devolver tabela.
- **Procedure**: **ação** invocada por §CALL§; pode controlar transações; não participa de consultas.

### Triggers
Um **trigger** executa uma **função de gatilho** automaticamente em §INSERT§, §UPDATE§, §DELETE§ ou §TRUNCATE§, **antes** (§BEFORE§: pode alterar §NEW§ ou cancelar) ou **depois** (§AFTER§), **por linha** (§FOR EACH ROW§) ou **por comando**. Medido:
§§§
CREATE FUNCTION trg_audita() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO log_vendas (venda_id, evento) VALUES (NEW.id, 'trigger:' || TG_OP);
  RETURN NEW;
END $$;
CREATE TRIGGER t_audita AFTER INSERT ON vendas
FOR EACH ROW EXECUTE FUNCTION trg_audita();
§§§
Ao inserir a venda 22, o log recebeu **22 | trigger:INSERT**, sem a aplicação fazer nada. Usos legítimos: **auditoria**, manter **colunas derivadas** (§atualizado_em§), **validações** que constraints não expressam, **sincronização** entre tabelas. Riscos: lógica **invisível** para quem lê o código da aplicação, **efeito cascata** (triggers que disparam triggers), impacto no **desempenho** de cargas em massa e **dificuldade de depurar**. Regra prática: use triggers para **invariantes e auditoria**, não para o fluxo principal do negócio.

### Lógica no banco ou na aplicação?
- **No banco** (constraints, procedures, triggers): garante a regra para **todos** os clientes, reduz idas ao banco, fica perto dos dados.
- **Na aplicação**: mais fácil de **testar, versionar, depurar e escalar**, com linguagens e ferramentas mais ricas.
Equilíbrio habitual: **integridade no banco** (constraints, chaves, às vezes triggers de auditoria) e **regras de negócio na aplicação**, com procedures para operações críticas e **pesadas em dados** (cargas, fechamentos). Seja qual for a escolha, **versione** o código do banco (migrações, curso C3.6), **teste-o** e **documente-o**.

### Segurança das funções
- §SECURITY DEFINER§ executa com as permissões do **dono** da função: poderoso e perigoso; defina §SET search_path§ na função e conceda §EXECUTE§ só a quem precisa.
- **Nunca** monte SQL dinâmico por concatenação dentro de funções: use §EXECUTE ... USING§ com parâmetros e §format('%I', nome)§ para identificadores (aula sqe-09).`,
  concepts: [
    { term: 'Função', def: 'Rotina do banco que devolve um valor ou tabela e pode ser usada dentro de consultas.' },
    { term: 'Procedure', def: 'Rotina chamada por CALL que executa ações e pode controlar transações.' },
    { term: 'PL/pgSQL', def: 'Linguagem procedural do PostgreSQL com variáveis, condicionais, laços e exceções.' },
    { term: 'Volatilidade', def: 'Classificação da função (IMMUTABLE, STABLE, VOLATILE) que orienta o otimizador.' },
    { term: 'RAISE EXCEPTION', def: 'Comando do PL/pgSQL que lança um erro e desfaz a transação em andamento.' },
    { term: 'Trigger', def: 'Gatilho que executa uma função automaticamente em eventos de INSERT, UPDATE, DELETE ou TRUNCATE.' },
    { term: 'NEW e OLD', def: 'Variáveis de trigger com a linha nova e a antiga.' },
    { term: 'BEFORE e AFTER', def: 'Momentos em que o trigger dispara em relação à operação.' },
    { term: 'SECURITY DEFINER', def: 'Modo em que a função roda com as permissões do seu dono.' },
    { term: 'SQL dinâmico', def: 'Comando SQL montado em tempo de execução; exige parâmetros e quoting de identificadores.' }
  ],
  examples: R`**Analogia:** uma função é uma **calculadora do banco** (entra 100, sai 10). Uma procedure é um **procedimento operacional padrão** ("registrar venda": validar, gravar, anotar no diário), executado do começo ao fim ou cancelado por inteiro. O trigger é o **alarme de um cofre**: dispara sozinho quando alguém abre, sem que o usuário peça, e por isso precisa ser usado com parcimônia, pois quem lê o código da aplicação não vê o alarme.

**Exemplo 1: função em consulta.** imposto(100) devolve 10,00 e imposto(100, 0,25) devolve 25,00.

**Exemplo 2: procedure com validação.** Valor negativo gera erro e nada é gravado.

**Exemplo 3: auditoria por trigger.** O INSERT da venda 22 gerou um registro de log automaticamente.`,
  code: [
    { title: 'Funções SQL e PL/pgSQL (SQL, saída medida no PostgreSQL 17)', lang: 'sql', code: R`CREATE FUNCTION imposto(valor numeric, taxa numeric DEFAULT 0.1)
RETURNS numeric LANGUAGE sql IMMUTABLE
AS $$ SELECT round(valor * taxa, 2) $$;

SELECT imposto(100), imposto(100, 0.25);        -- 10.00 | 25.00

CREATE FUNCTION total_vendedor(p_id int) RETURNS numeric
LANGUAGE plpgsql STABLE AS $$
DECLARE t numeric;
BEGIN
  SELECT coalesce(sum(valor), 0) INTO t FROM vendas WHERE vendedor_id = p_id;
  RETURN t;
END $$;

SELECT total_vendedor(1), total_vendedor(99);   -- 700.00 | 0`, notes: [{ l: '2', t: 'IMMUTABLE promete que a função é determinística: não minta, pois o otimizador confia.' }, { l: '4', t: 'O corpo entre $$ evita escapar aspas.' }, { l: '9', t: 'Prefixe variáveis (p_ e v_) para não confundir com colunas.' }, { l: '12', t: 'coalesce garante 0 para vendedor sem vendas.' }] },
    { title: 'Procedure com validação e trigger de auditoria (SQL, saída medida)', lang: 'sql', code: R`CREATE TABLE log_vendas (id serial PRIMARY KEY, venda_id int, evento text, quando timestamptz DEFAULT now());

CREATE PROCEDURE registrar_venda(p_id int, p_vendedor int, p_valor numeric)
LANGUAGE plpgsql AS $$
BEGIN
  IF p_valor <= 0 THEN RAISE EXCEPTION 'valor inválido: %', p_valor; END IF;
  INSERT INTO vendas VALUES (p_id, p_vendedor, current_date, p_valor, 'X');
  INSERT INTO log_vendas (venda_id, evento) VALUES (p_id, 'criada');
END $$;

CALL registrar_venda(20, 1, 80);     -- 1 venda e 1 log
CALL registrar_venda(21, 1, -5);     -- ERROR: valor inválido: -5 (nada gravado)

CREATE FUNCTION trg_audita() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO log_vendas (venda_id, evento) VALUES (NEW.id, 'trigger:' || TG_OP);
  RETURN NEW;
END $$;
CREATE TRIGGER t_audita AFTER INSERT ON vendas
FOR EACH ROW EXECUTE FUNCTION trg_audita();

INSERT INTO vendas VALUES (22, 2, '2026-04-01', 10, 'Z');   -- log: 22 | trigger:INSERT`, notes: [{ l: '6', t: 'A exceção desfaz tudo o que a chamada fez.' }, { l: '12', t: 'Valor inválido: o RAISE EXCEPTION impede a gravação.' }, { l: '15', t: 'Função de gatilho devolve trigger e usa NEW e TG_OP.' }, { l: '19', t: 'O trigger dispara por linha, depois do INSERT.' }] }
  ],
  bestPractices: ['Declare a volatilidade correta (IMMUTABLE, STABLE ou VOLATILE).', 'Prefixe variáveis em PL/pgSQL.', 'Use procedures para operações de negócio atômicas e pesadas em dados.', 'Use triggers para auditoria e invariantes, não para o fluxo principal.', 'Versione e teste o código do banco como qualquer código.', 'Evite SQL dinâmico por concatenação: use EXECUTE ... USING e format com %I.'],
  mistakes: ['Marcar como IMMUTABLE uma função que lê tabelas ou o relógio.', 'Esconder regras de negócio importantes em triggers sem documentação.', 'Variáveis com o mesmo nome de colunas.', 'Confiar em SECURITY DEFINER sem fixar o search_path.', 'Cascatas de triggers difíceis de depurar.', 'Usar função onde era preciso uma procedure com controle de transação (e vice-versa).'],
  market: R`Em sistemas legados e em ERPs financeiros, é comum encontrar muita lógica em procedures e triggers; saber lê-las e mantê-las é valioso. Em arquiteturas modernas, a tendência é concentrar regras na aplicação e deixar no banco a integridade e a auditoria, mas procedures continuam úteis em processamentos em lote.`,
  summary: R`Funções devolvem valores e entram em consultas (medido: §imposto(100)§ = 10,00; §total_vendedor(99)§ = 0); procedures executam ações com §CALL§ e podem controlar transações (medido: valor inválido levantou exceção e nada foi gravado). Triggers disparam automaticamente (medido: o INSERT da venda 22 gerou o log §trigger:INSERT§). Declare volatilidade correta, prefira lógica de negócio testável na aplicação e use o banco para integridade e auditoria.`,
  refs: [REF2.createFunction, REF2.createProcedure, REF2.plpgsql, REF2.createTrigger, REF2.xfunc, REF2.call],
  cards: [
    { q: 'Qual a diferença entre função e procedure?', a: 'A função devolve valor e é usada em consultas; a procedure é chamada com CALL, executa ações e pode controlar transações.' },
    { q: 'O que acontece quando uma procedure lança RAISE EXCEPTION?', a: 'O erro desfaz o que a chamada fez dentro da transação (medido: a venda 21 não foi criada).' },
    { q: 'Para que servem NEW e OLD?', a: 'Em triggers, representam a linha nova e a linha antiga.' },
    { q: 'Quais os riscos dos triggers?', a: 'Lógica invisível, cascatas, impacto no desempenho de cargas em massa e dificuldade de depuração.' },
    { q: 'O que significa IMMUTABLE?', a: 'A mesma entrada sempre produz a mesma saída, sem consultar dados mutáveis; o otimizador confia nisso.' }
  ]
}
];
