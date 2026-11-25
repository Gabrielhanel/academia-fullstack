# Laboratório do C3.1 — SQL essencial
- Ambiente: PostgreSQL 17.12 (imagem oficial `postgres:17` do Docker Hub, contêiner `c3-pg17` em `127.0.0.1:55432`, criado só para o laboratório), cliente `psql` do próprio contêiner.
- Arquivos: `schema.sql` (esquema `loja` com clientes, produtos, pedidos e itens), `consultas.sql` (todas as consultas das aulas, agrupadas por aula), `saida.txt` (saída real, incluindo os erros esperados).
- Reexecutar: `docker run -d --name c3-pg17 -e POSTGRES_PASSWORD=lab -p 127.0.0.1:55432:5432 postgres:17` e `cat schema.sql consultas.sql | docker exec -i c3-pg17 psql -U postgres -q`.
- Executado: todas as consultas de `consultas.sql` em PostgreSQL 17. Erros esperados (violação de UNIQUE, CHECK, FK, GROUP BY, alias no WHERE) aparecem no topo de `saida.txt` por serem escritos em stderr.
- Não executado: MySQL, MariaDB, SQLite, SQL Server e Oracle. Comentários sobre diferenças de dialeto vêm da documentação e estão sinalizados nas aulas.
