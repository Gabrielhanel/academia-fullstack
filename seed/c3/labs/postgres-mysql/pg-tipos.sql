\conninfo
\l+ restaurado
\dn
\dt tuning.*
\d tuning.clientes
\echo '== tipos'
SELECT 0.1::double precision + 0.2::double precision AS float_soma, 0.1::numeric + 0.2::numeric AS numeric_soma, (0.1::double precision + 0.2::double precision) = 0.3 AS float_igual, (0.1::numeric + 0.2::numeric) = 0.3 AS numeric_igual;
SET TIME ZONE 'America/Sao_Paulo';
CREATE TEMP TABLE t (sem_fuso timestamp, com_fuso timestamptz);
INSERT INTO t VALUES ('2026-03-01 12:00:00', '2026-03-01 12:00:00');
SELECT sem_fuso, com_fuso FROM t;
SET TIME ZONE 'UTC';
SELECT sem_fuso, com_fuso FROM t;
SELECT gen_random_uuid() IS NOT NULL AS uuid_ok, pg_typeof(gen_random_uuid()) AS tipo_uuid;
SELECT ARRAY[1,2,3] AS arr, (ARRAY[1,2,3])[2] AS segundo, ARRAY[1,2,3] @> ARRAY[2] AS contem;
SELECT pg_typeof(1) AS t1, pg_typeof(1.5) AS t2, pg_typeof(now()) AS t3, pg_typeof('x') AS t4, pg_typeof(true) AS t5;
SELECT length('ação') AS caracteres, octet_length('ação') AS bytes;
SELECT 2147483647::int + 1;
SELECT 2147483647::bigint + 1 AS bigint_ok;
SELECT '  x '::varchar(2) AS corta, 'abc'::char(5) || '|' AS char_pad;
