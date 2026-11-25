SET search_path = mod;
\echo '== chaves: bigint x uuid v4 (300 mil linhas)'
CREATE TABLE k_bigint (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, v int);
CREATE TABLE k_uuid (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, v int);
\timing on
INSERT INTO k_bigint (v) SELECT g FROM generate_series(1, 300000) g;
INSERT INTO k_uuid (v) SELECT g FROM generate_series(1, 300000) g;
\timing off
SELECT 'bigint' AS chave, pg_size_pretty(pg_relation_size('k_bigint')) AS tabela, pg_size_pretty(pg_relation_size('k_bigint_pkey')) AS indice_pk
UNION ALL SELECT 'uuid v4', pg_size_pretty(pg_relation_size('k_uuid')), pg_size_pretty(pg_relation_size('k_uuid_pkey'));
SELECT pg_column_size(1::bigint) AS bytes_bigint, pg_column_size(gen_random_uuid()) AS bytes_uuid;
\echo '== desnormalização medida: total por pedido'
CREATE TABLE d_pedidos (id int PRIMARY KEY, cliente_id int NOT NULL, total_guardado numeric(12,2) NOT NULL DEFAULT 0);
CREATE TABLE d_itens (pedido_id int NOT NULL REFERENCES d_pedidos(id), item int NOT NULL, valor numeric(10,2) NOT NULL, PRIMARY KEY (pedido_id, item));
INSERT INTO d_pedidos (id, cliente_id) SELECT g, (g % 5000) + 1 FROM generate_series(1, 100000) g;
INSERT INTO d_itens SELECT p, i, ((p * i) % 90) + 10 FROM generate_series(1, 100000) p, generate_series(1, 5) i;
UPDATE d_pedidos p SET total_guardado = t.s FROM (SELECT pedido_id, sum(valor) s FROM d_itens GROUP BY 1) t WHERE t.pedido_id = p.id;
ANALYZE d_pedidos; ANALYZE d_itens;
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, BUFFERS OFF) SELECT p.id, sum(i.valor) FROM d_pedidos p JOIN d_itens i ON i.pedido_id = p.id WHERE p.cliente_id = 77 GROUP BY p.id;
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, BUFFERS OFF) SELECT id, total_guardado FROM d_pedidos WHERE cliente_id = 77;
CREATE INDEX ON d_pedidos (cliente_id); ANALYZE d_pedidos;
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, BUFFERS OFF) SELECT p.id, sum(i.valor) FROM d_pedidos p JOIN d_itens i ON i.pedido_id = p.id WHERE p.cliente_id = 77 GROUP BY p.id;
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, BUFFERS OFF) SELECT id, total_guardado FROM d_pedidos WHERE cliente_id = 77;
\echo '-- risco: contador diverge quando alguém esquece de atualizar'
INSERT INTO d_itens VALUES (1, 99, 1000);
SELECT p.id, p.total_guardado, (SELECT sum(valor) FROM d_itens WHERE pedido_id = p.id) AS total_real FROM d_pedidos p WHERE id = 1;
\echo '-- mantido por trigger: custo da escrita'
CREATE FUNCTION atualiza_total() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN UPDATE d_pedidos SET total_guardado = total_guardado + NEW.valor WHERE id = NEW.pedido_id; RETURN NEW; END $$;
CREATE TABLE d_itens2 (LIKE d_itens INCLUDING ALL);
ALTER TABLE d_itens2 ADD FOREIGN KEY (pedido_id) REFERENCES d_pedidos(id);
\timing on
INSERT INTO d_itens2 SELECT p, i + 10, 5 FROM generate_series(1, 50000) p, generate_series(1, 2) i;
CREATE TRIGGER t_total AFTER INSERT ON d_itens2 FOR EACH ROW EXECUTE FUNCTION atualiza_total();
INSERT INTO d_itens2 SELECT p, i + 20, 5 FROM generate_series(1, 50000) p, generate_series(1, 2) i;
\timing off
\echo '== evolução do esquema em tabela grande'
CREATE TABLE evol AS SELECT g AS id, md5(g::text) AS txt FROM generate_series(1, 500000) g;
\timing on
ALTER TABLE evol ADD COLUMN novo_a int DEFAULT 0;
ALTER TABLE evol ADD COLUMN novo_b text;
UPDATE evol SET novo_b = 'x';
\timing off
SELECT pg_size_pretty(pg_relation_size('evol')) AS tamanho_apos_update;
CREATE INDEX CONCURRENTLY idx_evol_txt ON evol (txt);
