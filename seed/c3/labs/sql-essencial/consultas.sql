SET search_path = loja;
\echo '== 01 NULL e três valores'
SELECT nome, email FROM clientes WHERE email = NULL;
SELECT nome, email FROM clientes WHERE email IS NULL;
SELECT count(*) AS total, count(email) AS com_email, count(cidade) AS com_cidade FROM clientes;
SELECT nome FROM clientes WHERE cidade <> 'Porto Alegre';
SELECT nome FROM clientes WHERE cidade IS DISTINCT FROM 'Porto Alegre';
\echo '== 02 SELECT/WHERE/ORDER'
SELECT nome, preco FROM produtos WHERE categoria = 'papelaria' AND preco < 10 ORDER BY preco DESC;
SELECT nome FROM produtos WHERE nome LIKE '%a' ORDER BY nome;
SELECT nome, preco FROM produtos ORDER BY preco DESC LIMIT 2 OFFSET 1;
SELECT DISTINCT categoria FROM produtos ORDER BY 1;
SELECT nome, cidade FROM clientes ORDER BY cidade;
SELECT nome, cidade FROM clientes ORDER BY cidade NULLS FIRST;
SELECT nome FROM produtos WHERE preco BETWEEN 3.5 AND 45 ORDER BY id;
SELECT id, preco * 1.1 AS com_reajuste, round(preco * 1.1, 1) AS arred FROM produtos WHERE id IN (1,3) ORDER BY id;
\echo '== 03 DML'
BEGIN;
INSERT INTO clientes (id, nome, cidade) VALUES (5,'Eva','Pelotas') RETURNING id, nome;
UPDATE produtos SET preco = preco * 1.10 WHERE categoria = 'papelaria' RETURNING id, preco;
DELETE FROM clientes WHERE id = 5 RETURNING id;
ROLLBACK;
SELECT count(*) AS clientes_apos_rollback FROM clientes;
INSERT INTO clientes VALUES (6,'Fred','X','ana@ex.com');
INSERT INTO produtos VALUES (9,'Grátis','papelaria',-1);
DELETE FROM clientes WHERE id = 1;
INSERT INTO clientes VALUES (7,'Gil','Y','gil@ex.com') ON CONFLICT (email) DO NOTHING;
INSERT INTO clientes VALUES (8,'Gil2','Y','gil@ex.com') ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome RETURNING id, nome;
DELETE FROM clientes WHERE id IN (7,8);
\echo '== 04 JOINs'
SELECT c.nome, p.id AS pedido, p.status FROM clientes c INNER JOIN pedidos p ON p.cliente_id = c.id ORDER BY p.id;
SELECT c.nome, p.id AS pedido FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id ORDER BY c.id, p.id;
SELECT c.nome FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL;
SELECT c.nome, p.id FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id AND p.status = 'pago' ORDER BY c.id;
SELECT c.nome, p.id FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.status = 'pago' ORDER BY c.id;
SELECT count(*) AS linhas_cross FROM clientes CROSS JOIN produtos;
SELECT pr.nome AS produto, i.quantidade, ped.id AS pedido, c.nome AS cliente FROM itens i JOIN produtos pr ON pr.id = i.produto_id JOIN pedidos ped ON ped.id = i.pedido_id JOIN clientes c ON c.id = ped.cliente_id ORDER BY ped.id, pr.id;
SELECT a.nome AS cliente_a, b.nome AS cliente_b FROM clientes a JOIN clientes b ON a.cidade = b.cidade AND a.id < b.id;
SELECT c.nome, p.id AS pedido FROM clientes c FULL JOIN pedidos p ON p.cliente_id = c.id AND p.status = 'pago' ORDER BY c.id, p.id;
\echo '== 05 duplicação em JOIN'
SELECT sum(pr.preco * i.quantidade) AS total_correto FROM itens i JOIN produtos pr ON pr.id = i.produto_id;
SELECT count(*) AS pedidos_vezes_itens FROM pedidos p JOIN itens i ON i.pedido_id = p.id;
SELECT count(*) AS pedidos FROM pedidos;
\echo '== 06 agregações'
SELECT categoria, count(*) AS n, round(avg(preco),2) AS media, min(preco), max(preco) FROM produtos GROUP BY categoria ORDER BY categoria;
SELECT ped.status, count(*) AS pedidos, sum(pr.preco * i.quantidade) AS valor FROM pedidos ped JOIN itens i ON i.pedido_id = ped.id JOIN produtos pr ON pr.id = i.produto_id GROUP BY ped.status ORDER BY valor DESC;
SELECT c.nome, sum(pr.preco * i.quantidade) AS gasto FROM clientes c JOIN pedidos ped ON ped.cliente_id = c.id JOIN itens i ON i.pedido_id = ped.id JOIN produtos pr ON pr.id = i.produto_id GROUP BY c.id, c.nome HAVING sum(pr.preco * i.quantidade) > 100 ORDER BY gasto DESC;
SELECT count(*) AS todas, count(cidade) AS com_cidade, count(DISTINCT cidade) AS cidades_distintas FROM clientes;
SELECT categoria, count(*) FILTER (WHERE preco > 10) AS caros FROM produtos GROUP BY categoria ORDER BY 1;
SELECT sum(preco) AS soma_vazia FROM produtos WHERE categoria = 'nenhuma';
SELECT coalesce(sum(preco),0) AS soma_vazia_zero FROM produtos WHERE categoria = 'nenhuma';
SELECT nome, categoria, count(*) FROM produtos GROUP BY categoria;
\echo '== 07 subqueries'
SELECT nome FROM produtos WHERE preco > (SELECT avg(preco) FROM produtos) ORDER BY id;
SELECT nome FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos WHERE status = 'pago') ORDER BY id;
SELECT nome FROM clientes c WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id) ORDER BY id;
SELECT nome FROM clientes WHERE id NOT IN (SELECT cliente_id FROM pedidos) ORDER BY id;
SELECT nome FROM clientes WHERE id NOT IN (SELECT NULL::int);
SELECT pr.nome, pr.preco, (SELECT round(avg(p2.preco),2) FROM produtos p2 WHERE p2.categoria = pr.categoria) AS media_cat FROM produtos pr ORDER BY pr.id;
SELECT categoria, n FROM (SELECT categoria, count(*) AS n FROM produtos GROUP BY categoria) t WHERE n > 2;
SELECT id FROM produtos WHERE preco > ALL (SELECT preco FROM produtos WHERE categoria = 'papelaria') ORDER BY id;
\echo '== 08 CTEs'
WITH gasto AS (SELECT ped.cliente_id, sum(pr.preco * i.quantidade) AS total FROM pedidos ped JOIN itens i ON i.pedido_id = ped.id JOIN produtos pr ON pr.id = i.produto_id WHERE ped.status <> 'cancelado' GROUP BY ped.cliente_id) SELECT c.nome, g.total FROM gasto g JOIN clientes c ON c.id = g.cliente_id ORDER BY g.total DESC;
WITH RECURSIVE contagem(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM contagem WHERE n < 5) SELECT sum(n) AS soma_1_a_5 FROM contagem;
CREATE TEMP TABLE categorias (id int, nome text, pai int);
INSERT INTO categorias VALUES (1,'Eletrônicos',NULL),(2,'Celulares',1),(3,'Smartphones',2),(4,'Livros',NULL);
WITH RECURSIVE arvore AS (SELECT id, nome, 0 AS nivel, nome::text AS caminho FROM categorias WHERE pai IS NULL UNION ALL SELECT c.id, c.nome, a.nivel + 1, a.caminho || ' > ' || c.nome FROM categorias c JOIN arvore a ON c.pai = a.id) SELECT nivel, caminho FROM arvore ORDER BY caminho;
WITH ped_pagos AS MATERIALIZED (SELECT id FROM pedidos WHERE status = 'pago') SELECT count(*) AS pagos FROM ped_pagos;
\echo '== 09 ordem lógica e injeção'
SELECT nome AS n FROM produtos WHERE n = 'Caneta';
SELECT nome AS n FROM produtos ORDER BY n LIMIT 1;
PREPARE busca(text) AS SELECT nome FROM produtos WHERE nome = $1;
EXECUTE busca('Caneta');
EXECUTE busca($$' OR '1'='1$$);
SELECT 'x' AS texto, 5/2 AS divisao_inteira, 5/2.0 AS divisao_decimal, 5::numeric/2 AS cast_numeric;
SELECT now()::date >= date '2026-01-01' AS ok_data;
\echo '== 10 extras de agregação e JOIN'
SELECT ped.status, count(*) AS linhas_de_item, count(DISTINCT ped.id) AS pedidos_distintos FROM pedidos ped JOIN itens i ON i.pedido_id = ped.id GROUP BY ped.status ORDER BY ped.status;
SELECT c.nome, count(p.id) AS pedidos FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.id, c.nome ORDER BY c.id;
SELECT c.nome, count(*) AS errado FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.id, c.nome ORDER BY c.id;
SELECT categoria, count(*) FROM produtos WHERE preco > 10 GROUP BY categoria HAVING count(*) >= 2 ORDER BY 1;
SELECT categoria, avg(preco) AS media_sem_arredondar FROM produtos GROUP BY categoria ORDER BY 1;
SELECT string_agg(nome, ', ' ORDER BY nome) AS nomes FROM produtos WHERE categoria = 'papelaria';
SELECT c.nome, p.id FROM clientes c JOIN pedidos p USING (id) ORDER BY 1;
SELECT p.id, p.status FROM pedidos p NATURAL JOIN clientes;
\echo '== 11 injeção por concatenação'
SELECT count(*) AS linhas_com_texto_malicioso_concatenado FROM produtos WHERE nome = '' OR '1'='1';
SELECT count(*) AS linhas_parametrizado FROM produtos WHERE nome = $$' OR '1'='1$$;
