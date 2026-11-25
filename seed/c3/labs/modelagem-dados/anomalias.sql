DROP SCHEMA IF EXISTS mod CASCADE; CREATE SCHEMA mod; SET search_path = mod;
\echo '== tabela única (sem normalizar)'
CREATE TABLE pedidos_plano (pedido int, cliente text, cidade text, produto text, categoria text, preco numeric(10,2), qtd int, PRIMARY KEY (pedido, produto));
INSERT INTO pedidos_plano VALUES (1,'Ana','Porto Alegre','Caneta','papelaria',3.50,10),(1,'Ana','Porto Alegre','Caderno','papelaria',18.90,2),(2,'Ana','Porto Alegre','Mochila','acessorios',120,1),(3,'Bruno','Caxias','Caderno','papelaria',18.90,1);
SELECT count(*) AS linhas, count(DISTINCT cliente) AS clientes FROM pedidos_plano;
\echo '-- anomalia de atualização: mudar a cidade da Ana em UMA linha'
UPDATE pedidos_plano SET cidade = 'Gramado' WHERE pedido = 1 AND produto = 'Caneta';
SELECT DISTINCT cliente, cidade FROM pedidos_plano WHERE cliente = 'Ana' ORDER BY 2;
\echo '-- anomalia de inserção: cadastrar cliente sem pedido'
INSERT INTO pedidos_plano (cliente, cidade) VALUES ('Carla', 'Pelotas');
\echo '-- anomalia de exclusão: apagar o pedido 3 perde o Bruno'
DELETE FROM pedidos_plano WHERE pedido = 3;
SELECT count(*) AS bruno_restante FROM pedidos_plano WHERE cliente = 'Bruno';
\echo '-- preço do Caderno repetido: divergência possível'
UPDATE pedidos_plano SET preco = 20 WHERE pedido = 1 AND produto = 'Caderno';
SELECT DISTINCT produto, preco FROM pedidos_plano WHERE produto = 'Caderno' ORDER BY 2;
\echo '== normalizado (3FN)'
CREATE TABLE clientes (id serial PRIMARY KEY, nome text NOT NULL UNIQUE, cidade text);
CREATE TABLE produtos (id serial PRIMARY KEY, nome text NOT NULL UNIQUE, categoria text NOT NULL, preco numeric(10,2) NOT NULL CHECK (preco >= 0));
CREATE TABLE pedidos (id int PRIMARY KEY, cliente_id int NOT NULL REFERENCES clientes(id));
CREATE TABLE itens (pedido_id int REFERENCES pedidos(id) ON DELETE CASCADE, produto_id int REFERENCES produtos(id), qtd int NOT NULL CHECK (qtd > 0), preco_unitario numeric(10,2) NOT NULL, PRIMARY KEY (pedido_id, produto_id));
INSERT INTO clientes (nome, cidade) VALUES ('Ana','Porto Alegre'),('Bruno','Caxias'),('Carla','Pelotas');
INSERT INTO produtos (nome, categoria, preco) VALUES ('Caneta','papelaria',3.50),('Caderno','papelaria',18.90),('Mochila','acessorios',120);
INSERT INTO pedidos VALUES (1,1),(2,1),(3,2);
INSERT INTO itens VALUES (1,1,10,3.50),(1,2,2,18.90),(2,3,1,120),(3,2,1,18.90);
UPDATE clientes SET cidade = 'Gramado' WHERE nome = 'Ana';
SELECT c.nome, c.cidade, count(DISTINCT p.id) AS pedidos FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.id ORDER BY c.id;
DELETE FROM pedidos WHERE id = 3;
SELECT nome FROM clientes WHERE nome = 'Bruno';
\echo '== reconstrução sem perdas'
CREATE TEMP TABLE reconstruido AS SELECT p.id AS pedido, c.nome AS cliente, c.cidade, pr.nome AS produto, pr.categoria, i.preco_unitario AS preco, i.qtd FROM itens i JOIN pedidos p ON p.id = i.pedido_id JOIN clientes c ON c.id = p.cliente_id JOIN produtos pr ON pr.id = i.produto_id;
SELECT count(*) AS linhas_reconstruidas FROM reconstruido;
\echo '== dependência transitiva (2FN x 3FN)'
CREATE TABLE func_ruim (id int PRIMARY KEY, nome text, depto_id int, depto_nome text);
INSERT INTO func_ruim VALUES (1,'A',10,'Vendas'),(2,'B',10,'Vendas'),(3,'C',20,'TI');
UPDATE func_ruim SET depto_nome = 'Comercial' WHERE id = 1;
SELECT depto_id, array_agg(DISTINCT depto_nome ORDER BY depto_nome) AS nomes FROM func_ruim GROUP BY depto_id ORDER BY 1;
\echo '== 1FN: lista em coluna'
CREATE TABLE alunos_ruim (id int PRIMARY KEY, nome text, telefones text);
INSERT INTO alunos_ruim VALUES (1,'Ana','1111,2222'),(2,'Bruno','3333');
SELECT id FROM alunos_ruim WHERE telefones LIKE '%222%';
SELECT id FROM alunos_ruim WHERE telefones LIKE '%22%';
