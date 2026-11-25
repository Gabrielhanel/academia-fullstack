SET search_path = tuning;
\echo '== baixa seletividade com SELECT *'
EXPLAIN (COSTS OFF) SELECT * FROM pedidos WHERE status = 'pago';
SELECT status, count(*) FROM pedidos GROUP BY status ORDER BY 1;
\echo '== btree_gist e EXCLUDE'
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE reservas2 (id serial, sala int, periodo tstzrange, EXCLUDE USING gist (sala WITH =, periodo WITH &&));
INSERT INTO reservas2 (sala, periodo) VALUES (1, '[2026-01-01 10:00,2026-01-01 12:00)');
INSERT INTO reservas2 (sala, periodo) VALUES (1, '[2026-01-01 11:00,2026-01-01 13:00)');
INSERT INTO reservas2 (sala, periodo) VALUES (2, '[2026-01-01 11:00,2026-01-01 13:00)');
\echo '== 06 plano com estimativas'
CREATE TABLE clientes AS SELECT g AS id, 'cliente ' || g AS nome, (ARRAY['SP','RS','RJ','MG'])[1 + (g % 4)] AS uf FROM generate_series(1, 10000) g;
ALTER TABLE clientes ADD PRIMARY KEY (id);
ANALYZE clientes;
EXPLAIN (ANALYZE, COSTS ON, TIMING OFF, BUFFERS OFF) SELECT c.nome, count(*) FROM pedidos p JOIN clientes c ON c.id = p.cliente_id WHERE c.uf = 'RS' AND p.status = 'pago' GROUP BY c.nome ORDER BY 2 DESC LIMIT 3;
\echo '== join com poucas linhas usa nested loop'
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, BUFFERS OFF) SELECT c.nome, p.valor FROM clientes c JOIN pedidos p ON p.cliente_id = c.id WHERE c.id = 42;
\echo '== estatísticas desatualizadas'
CREATE TABLE evt (id serial PRIMARY KEY, tipo text);
CREATE INDEX ON evt (tipo);
INSERT INTO evt (tipo) SELECT 'a' FROM generate_series(1, 100000);
ANALYZE evt;
INSERT INTO evt (tipo) SELECT 'b' FROM generate_series(1, 50000);
EXPLAIN (ANALYZE, COSTS ON, TIMING OFF, BUFFERS OFF) SELECT * FROM evt WHERE tipo = 'b';
ANALYZE evt;
EXPLAIN (ANALYZE, COSTS ON, TIMING OFF, BUFFERS OFF) SELECT * FROM evt WHERE tipo = 'b';
\echo '== OFFSET x paginação por chave'
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, BUFFERS OFF) SELECT id FROM pedidos ORDER BY id LIMIT 20 OFFSET 400000;
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, BUFFERS OFF) SELECT id FROM pedidos WHERE id > 400000 ORDER BY id LIMIT 20;
\echo '== custo de escrita dos índices'
CREATE TABLE w1 (id int, a int, b int, c int); CREATE TABLE w2 (id int, a int, b int, c int);
CREATE INDEX ON w2 (a); CREATE INDEX ON w2 (b); CREATE INDEX ON w2 (c); CREATE INDEX ON w2 (a, b, c);
\timing on
INSERT INTO w1 SELECT g, g % 100, g % 1000, g % 7 FROM generate_series(1, 300000) g;
INSERT INTO w2 SELECT g, g % 100, g % 1000, g % 7 FROM generate_series(1, 300000) g;
\timing off
\echo '== dead tuples e VACUUM'
CREATE TABLE v (id int PRIMARY KEY, x int);
INSERT INTO v SELECT g, 0 FROM generate_series(1, 100000) g;
UPDATE v SET x = 1;
SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'v';
SELECT pg_size_pretty(pg_relation_size('v')) AS antes_vacuum;
VACUUM v;
SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'v';
SELECT pg_size_pretty(pg_relation_size('v')) AS depois_vacuum;
\echo '== partições'
CREATE TABLE log_p (id bigserial, criado date NOT NULL, msg text) PARTITION BY RANGE (criado);
CREATE TABLE log_p_2026_01 PARTITION OF log_p FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE log_p_2026_02 PARTITION OF log_p FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE log_p_2026_03 PARTITION OF log_p FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
INSERT INTO log_p (criado, msg) SELECT date '2026-01-01' + (g % 89), 'x' FROM generate_series(1, 90000) g;
SELECT tableoid::regclass AS particao, count(*) FROM log_p GROUP BY 1 ORDER BY 1;
EXPLAIN (COSTS OFF) SELECT count(*) FROM log_p WHERE criado >= '2026-02-10' AND criado < '2026-02-20';
EXPLAIN (COSTS OFF) SELECT count(*) FROM log_p WHERE msg = 'x';
INSERT INTO log_p (criado, msg) VALUES ('2027-01-01', 'fora');
\echo '== remover partição'
ALTER TABLE log_p DETACH PARTITION log_p_2026_01;
SELECT count(*) AS depois_detach FROM log_p;
