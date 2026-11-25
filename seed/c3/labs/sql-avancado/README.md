# Laboratório do C3.2 — SQL avançado e analítico
- Ambiente: PostgreSQL 17.12 (imagem oficial `postgres:17`, contêiner `c3-pg17`, `127.0.0.1:55432`), cliente `psql` do contêiner.
- Arquivos: `schema.sql` (esquema `vendas`: vendedores e vendas), `consultas.sql` + `saida.txt` (janelas, views, funções, procedures e trigger), `consultas2.sql` + `saida2.txt` (ROLLUP/CUBE/GROUPING SETS, DISTINCT ON, calendário, pivot, LATERAL, estatística, JSONB, ilhas e coorte). Os erros esperados aparecem no topo de `saida.txt` (stderr).
- Reexecutar: subir o contêiner (ver `labs/sql-essencial/README.md`) e `cat schema.sql consultas.sql | docker exec -i c3-pg17 psql -U postgres -q`; para a parte 2, `(echo "SET search_path = vendas;"; sed -n '2,$p' consultas2.sql) | docker exec -i c3-pg17 psql -U postgres -q`.
- Não executado: `REFRESH ... CONCURRENTLY`, triggers INSTEAD OF, row-level security, `tablefunc` (crosstab), cláusula CYCLE, MySQL e demais bancos.
