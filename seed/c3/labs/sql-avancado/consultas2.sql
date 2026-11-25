SET search_path = vendas;
\echo '== 05 analítico I'
SELECT v.regiao, v.nome, sum(s.valor) AS total FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id GROUP BY ROLLUP (v.regiao, v.nome) ORDER BY v.regiao NULLS LAST, v.nome NULLS LAST;
SELECT v.regiao, s.produto, sum(s.valor) AS total, grouping(v.regiao, s.produto) AS g FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id GROUP BY CUBE (v.regiao, s.produto) ORDER BY g, v.regiao NULLS LAST, s.produto NULLS LAST;
SELECT v.regiao, s.produto, sum(s.valor) AS total FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id GROUP BY GROUPING SETS ((v.regiao), (s.produto), ()) ORDER BY 1 NULLS LAST, 2 NULLS LAST;
SELECT coalesce(v.regiao, 'TOTAL') AS regiao, sum(s.valor) FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id GROUP BY ROLLUP (v.regiao) ORDER BY 1;
SELECT DISTINCT ON (vendedor_id) vendedor_id, data, valor FROM vendas ORDER BY vendedor_id, data DESC;
SELECT date_trunc('month', data)::date AS mes, sum(valor) AS total FROM vendas GROUP BY 1 ORDER BY 1;
SELECT m::date AS mes, coalesce(t.total, 0) AS total FROM generate_series('2026-01-01'::date, '2026-04-01', interval '1 month') m LEFT JOIN (SELECT date_trunc('month', data) AS mes, sum(valor) AS total FROM vendas GROUP BY 1) t ON t.mes = m ORDER BY 1;
SELECT produto, sum(valor) FILTER (WHERE extract(month FROM data) = 1) AS jan, sum(valor) FILTER (WHERE extract(month FROM data) = 2) AS fev, sum(valor) FILTER (WHERE extract(month FROM data) = 3) AS mar FROM vendas GROUP BY produto ORDER BY produto;
\echo '== 06 analítico II'
SELECT v.nome, t.* FROM vendedores v CROSS JOIN LATERAL (SELECT id, valor FROM vendas s WHERE s.vendedor_id = v.id ORDER BY valor DESC LIMIT 1) t ORDER BY v.id;
SELECT v.nome, t.id FROM vendedores v LEFT JOIN LATERAL (SELECT id FROM vendas s WHERE s.vendedor_id = v.id AND s.valor > 450) t ON true ORDER BY v.id;
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY valor) AS mediana, avg(valor) AS media, percentile_disc(0.5) WITHIN GROUP (ORDER BY valor) AS mediana_disc FROM vendas;
SELECT mode() WITHIN GROUP (ORDER BY produto) AS produto_mais_frequente FROM vendas;
CREATE TEMP TABLE eventos (id serial, usuario int, dados jsonb);
INSERT INTO eventos (usuario, dados) VALUES (1, '{"tipo":"clique","pagina":"/a","tags":["x","y"]}'), (1, '{"tipo":"compra","valor":99.9}'), (2, '{"tipo":"clique","pagina":"/b"}');
SELECT dados->>'tipo' AS tipo, count(*) FROM eventos GROUP BY 1 ORDER BY 1;
SELECT usuario, dados->'tags'->>0 AS primeira_tag, (dados->>'valor')::numeric AS valor FROM eventos ORDER BY id;
SELECT count(*) FROM eventos WHERE dados @> '{"tipo":"clique"}';
SELECT id, jsonb_array_elements_text(dados->'tags') AS tag FROM eventos WHERE dados ? 'tags';
CREATE TEMP TABLE logins (usuario int, dia date);
INSERT INTO logins VALUES (1,'2026-03-01'),(1,'2026-03-02'),(1,'2026-03-03'),(1,'2026-03-07'),(1,'2026-03-08'),(2,'2026-03-05');
SELECT usuario, min(dia) AS inicio, max(dia) AS fim, count(*) AS dias FROM (SELECT usuario, dia, dia - (row_number() OVER (PARTITION BY usuario ORDER BY dia))::int AS grp FROM logins) t GROUP BY usuario, grp ORDER BY usuario, inicio;
WITH primeiro AS (SELECT usuario, min(date_trunc('month', dia)) AS coorte FROM logins GROUP BY usuario) SELECT coorte::date, count(*) AS usuarios FROM primeiro GROUP BY 1;
SELECT vendedor_id, valor, sum(valor) OVER (PARTITION BY vendedor_id ORDER BY data) AS acumulado, round(100.0 * sum(valor) OVER (PARTITION BY vendedor_id ORDER BY data) / sum(valor) OVER (PARTITION BY vendedor_id), 1) AS pct_acum FROM vendas WHERE vendedor_id = 1 ORDER BY data;
