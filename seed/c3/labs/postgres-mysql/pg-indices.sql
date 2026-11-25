DROP SCHEMA IF EXISTS tuning CASCADE; CREATE SCHEMA tuning; SET search_path = tuning;
SELECT setseed(0.42);
CREATE TABLE pedidos AS
SELECT g AS id,
       (random() * 9999)::int + 1 AS cliente_id,
       (ARRAY['aberto','pago','cancelado','enviado'])[1 + (random() * 3)::int] AS status,
       (random() * 1000)::numeric(10,2) AS valor,
       date '2025-01-01' + (random() * 700)::int AS data,
       md5(g::text) AS codigo,
       jsonb_build_object('canal', (ARRAY['web','app','loja'])[1 + (random() * 2)::int], 'tags', to_jsonb(ARRAY[(ARRAY['a','b','c','d','e'])[1 + (random() * 4)::int]])) AS meta
FROM generate_series(1, 500000) g;
ALTER TABLE pedidos ADD PRIMARY KEY (id);
ANALYZE pedidos;
SELECT count(*) AS linhas, pg_size_pretty(pg_total_relation_size('pedidos')) AS tamanho FROM pedidos;
\echo '== 04 sem índice'
EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF) SELECT * FROM pedidos WHERE cliente_id = 123;
SELECT count(*) AS achados FROM pedidos WHERE cliente_id = 123;
CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);
ANALYZE pedidos;
\echo '== com índice B-tree'
EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF) SELECT * FROM pedidos WHERE cliente_id = 123;
SELECT pg_size_pretty(pg_relation_size('idx_pedidos_cliente')) AS tamanho_indice;
\echo '== função na coluna impede o índice'
CREATE INDEX idx_pedidos_data ON pedidos (data);
EXPLAIN (COSTS OFF) SELECT count(*) FROM pedidos WHERE data = date '2026-03-01';
EXPLAIN (COSTS OFF) SELECT count(*) FROM pedidos WHERE date_trunc('day', data::timestamp) = timestamp '2026-03-01';
EXPLAIN (COSTS OFF) SELECT count(*) FROM pedidos WHERE data >= date '2026-03-01' AND data < date '2026-03-02';
\echo '== LIKE com curinga no começo'
CREATE INDEX idx_pedidos_codigo ON pedidos (codigo text_pattern_ops);
EXPLAIN (COSTS OFF) SELECT id FROM pedidos WHERE codigo LIKE 'abc%';
EXPLAIN (COSTS OFF) SELECT id FROM pedidos WHERE codigo LIKE '%abc';
\echo '== índice composto: ordem importa'
CREATE INDEX idx_status_data ON pedidos (status, data);
ANALYZE pedidos;
EXPLAIN (COSTS OFF) SELECT count(*) FROM pedidos WHERE status = 'pago' AND data >= date '2026-01-01';
EXPLAIN (COSTS OFF) SELECT count(*) FROM pedidos WHERE data >= date '2026-12-01' AND data < date '2026-12-05';
EXPLAIN (COSTS OFF) SELECT id FROM pedidos WHERE status = 'pago' ORDER BY data LIMIT 5;
\echo '== cobertura index only'
CREATE INDEX idx_cob ON pedidos (cliente_id) INCLUDE (valor);
VACUUM (ANALYZE) pedidos;
EXPLAIN (COSTS OFF) SELECT cliente_id, valor FROM pedidos WHERE cliente_id = 777;
\echo '== índice parcial'
CREATE INDEX idx_abertos ON pedidos (data) WHERE status = 'aberto';
SELECT pg_size_pretty(pg_relation_size('idx_abertos')) AS parcial, pg_size_pretty(pg_relation_size('idx_pedidos_data')) AS completo;
EXPLAIN (COSTS OFF) SELECT count(*) FROM pedidos WHERE status = 'aberto' AND data = date '2026-03-01';
\echo '== baixa seletividade'
EXPLAIN (COSTS OFF) SELECT count(*) FROM pedidos WHERE status = 'pago';
\echo '== 05 GIN e GiST'
CREATE INDEX idx_meta_gin ON pedidos USING gin (meta);
EXPLAIN (COSTS OFF) SELECT count(*) FROM pedidos WHERE meta @> '{"canal":"loja"}';
SELECT pg_size_pretty(pg_relation_size('idx_meta_gin')) AS gin_meta, pg_size_pretty(pg_relation_size('idx_pedidos_cliente')) AS btree_cliente;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_codigo_trgm ON pedidos USING gin (codigo gin_trgm_ops);
EXPLAIN (COSTS OFF) SELECT id FROM pedidos WHERE codigo LIKE '%abc12%';
CREATE TABLE reservas (id serial, sala int, periodo tstzrange);
INSERT INTO reservas (sala, periodo) SELECT (g % 50) + 1, tstzrange(timestamptz '2026-01-01' + (g || ' hours')::interval, timestamptz '2026-01-01' + ((g + 2) || ' hours')::interval) FROM generate_series(1, 20000) g;
CREATE INDEX idx_per_gist ON reservas USING gist (periodo);
ANALYZE reservas;
EXPLAIN (COSTS OFF) SELECT count(*) FROM reservas WHERE periodo && tstzrange('2026-02-01', '2026-02-02');
SELECT count(*) FROM reservas WHERE periodo && tstzrange('2026-02-01', '2026-02-02');
CREATE TABLE reservas2 (id serial, sala int, periodo tstzrange, EXCLUDE USING gist (sala WITH =, periodo WITH &&));
CREATE EXTENSION IF NOT EXISTS btree_gist;
