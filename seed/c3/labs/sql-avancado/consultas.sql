SET search_path = vendas;
\echo '== 01 ranking'
SELECT v.nome, s.valor, row_number() OVER (ORDER BY s.valor DESC, s.id) AS rn, rank() OVER (ORDER BY s.valor DESC) AS rk, dense_rank() OVER (ORDER BY s.valor DESC) AS dr FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id ORDER BY s.valor DESC, s.id LIMIT 8;
SELECT nome, regiao, total, rank() OVER (PARTITION BY regiao ORDER BY total DESC) AS pos_na_regiao FROM (SELECT v.nome, v.regiao, sum(s.valor) AS total FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id GROUP BY v.id, v.nome, v.regiao) t ORDER BY regiao, pos_na_regiao;
SELECT s.id, s.valor, sum(s.valor) OVER () AS total_geral, round(100 * s.valor / sum(s.valor) OVER (), 1) AS pct FROM vendas s ORDER BY s.id LIMIT 3;
SELECT * FROM (SELECT vendedor_id, id, valor, row_number() OVER (PARTITION BY vendedor_id ORDER BY valor DESC, id) AS rn FROM vendas) t WHERE rn <= 2 ORDER BY vendedor_id, rn;
\echo '== 02 lag, acumulado, frames'
SELECT data, valor, lag(valor) OVER (ORDER BY data) AS anterior, valor - lag(valor) OVER (ORDER BY data) AS variacao, lead(valor) OVER (ORDER BY data) AS proximo FROM vendas WHERE vendedor_id = 1 ORDER BY data;
SELECT data, valor, sum(valor) OVER (ORDER BY data) AS acumulado FROM vendas WHERE vendedor_id = 1 ORDER BY data;
SELECT id, valor, sum(valor) OVER (ORDER BY valor) AS acum_range, sum(valor) OVER (ORDER BY valor ROWS UNBOUNDED PRECEDING) AS acum_rows FROM vendas WHERE vendedor_id = 1 ORDER BY valor, id;
SELECT data, valor, round(avg(valor) OVER (ORDER BY data ROWS BETWEEN 1 PRECEDING AND CURRENT ROW), 1) AS media_movel_2 FROM vendas WHERE vendedor_id = 2 ORDER BY data;
SELECT data, valor, first_value(valor) OVER (ORDER BY data) AS primeira, last_value(valor) OVER (ORDER BY data) AS ultima_default, last_value(valor) OVER (ORDER BY data ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS ultima_certa FROM vendas WHERE vendedor_id = 1 ORDER BY data;
SELECT nome, total, ntile(2) OVER (ORDER BY total DESC) AS metade FROM (SELECT v.nome, sum(s.valor) AS total FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id GROUP BY v.nome) t ORDER BY total DESC;
SELECT id, valor FROM vendas WHERE row_number() OVER (ORDER BY id) = 1;
\echo '== 03 views'
CREATE VIEW resumo_vendedor AS SELECT v.id, v.nome, v.regiao, count(*) AS vendas, sum(s.valor) AS total FROM vendedores v JOIN vendas s ON s.vendedor_id = v.id GROUP BY v.id, v.nome, v.regiao;
SELECT * FROM resumo_vendedor ORDER BY id;
CREATE MATERIALIZED VIEW mv_total_regiao AS SELECT v.regiao, sum(s.valor) AS total FROM vendas s JOIN vendedores v ON v.id = s.vendedor_id GROUP BY v.regiao;
SELECT * FROM mv_total_regiao ORDER BY regiao;
INSERT INTO vendas VALUES (12,3,'2026-03-25',1000,'C');
SELECT regiao, total FROM mv_total_regiao WHERE regiao = 'Norte';
SELECT regiao, sum(total) AS total_view_normal FROM resumo_vendedor WHERE regiao = 'Norte' GROUP BY regiao;
REFRESH MATERIALIZED VIEW mv_total_regiao;
SELECT regiao, total FROM mv_total_regiao WHERE regiao = 'Norte';
DELETE FROM vendas WHERE id = 12;
REFRESH MATERIALIZED VIEW mv_total_regiao;
CREATE VIEW vendas_sul AS SELECT * FROM vendedores WHERE regiao = 'Sul' WITH CHECK OPTION;
INSERT INTO vendas_sul VALUES (9,'Eva','Norte');
INSERT INTO vendas_sul VALUES (9,'Eva','Sul');
DELETE FROM vendas_sul WHERE id = 9;
UPDATE resumo_vendedor SET total = 0;
\echo '== 04 funções e procedures'
CREATE FUNCTION imposto(valor numeric, taxa numeric DEFAULT 0.1) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT round(valor * taxa, 2) $$;
SELECT imposto(100), imposto(100, 0.25);
CREATE FUNCTION total_vendedor(p_id int) RETURNS numeric LANGUAGE plpgsql STABLE AS $$ DECLARE t numeric; BEGIN SELECT coalesce(sum(valor), 0) INTO t FROM vendas WHERE vendedor_id = p_id; RETURN t; END $$;
SELECT total_vendedor(1), total_vendedor(99);
CREATE TABLE log_vendas (id serial PRIMARY KEY, venda_id int, evento text, quando timestamptz DEFAULT now());
CREATE PROCEDURE registrar_venda(p_id int, p_vendedor int, p_valor numeric) LANGUAGE plpgsql AS $$ BEGIN IF p_valor <= 0 THEN RAISE EXCEPTION 'valor inválido: %', p_valor; END IF; INSERT INTO vendas VALUES (p_id, p_vendedor, current_date, p_valor, 'X'); INSERT INTO log_vendas (venda_id, evento) VALUES (p_id, 'criada'); END $$;
CALL registrar_venda(20, 1, 80);
SELECT count(*) AS vendas_20 FROM vendas WHERE id = 20;
SELECT count(*) AS logs FROM log_vendas;
CALL registrar_venda(21, 1, -5);
SELECT count(*) AS vendas_21 FROM vendas WHERE id = 21;
CREATE FUNCTION trg_audita() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO log_vendas (venda_id, evento) VALUES (NEW.id, 'trigger:' || TG_OP); RETURN NEW; END $$;
CREATE TRIGGER t_audita AFTER INSERT ON vendas FOR EACH ROW EXECUTE FUNCTION trg_audita();
INSERT INTO vendas VALUES (22, 2, '2026-04-01', 10, 'Z');
SELECT venda_id, evento FROM log_vendas ORDER BY id;
DELETE FROM vendas WHERE id IN (20, 22); DELETE FROM log_vendas;
