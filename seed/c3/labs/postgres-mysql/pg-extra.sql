SET search_path = tuning;
\echo '== seletividade alta x baixa'
EXPLAIN (COSTS OFF) SELECT * FROM pedidos WHERE status IN ('pago','cancelado','enviado');
EXPLAIN (COSTS OFF) SELECT * FROM pedidos WHERE cliente_id = 5;
\echo '== hash join / merge'
SET enable_nestloop = off;
EXPLAIN (COSTS OFF) SELECT c.nome FROM clientes c JOIN pedidos p ON p.cliente_id = c.id WHERE c.id < 50;
RESET enable_nestloop;
\echo '== função IMMUTABLE e índice de expressão'
CREATE INDEX idx_lower ON clientes (lower(nome));
EXPLAIN (COSTS OFF) SELECT id FROM clientes WHERE lower(nome) = 'cliente 77';
\echo '== pg_stat_statements/ extensões disponíveis'
SELECT name FROM pg_available_extensions WHERE name IN ('pg_stat_statements','pg_trgm','btree_gist','pgcrypto','uuid-ossp','tablefunc') ORDER BY 1;
SHOW shared_buffers; SHOW work_mem; SHOW max_connections;
