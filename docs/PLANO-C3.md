# PLANO C3 — Dados (SQL, modelagem, PostgreSQL/MySQL, transações, ORMs, NoSQL, cache)

Gerado em 2026-11-25. Fonte do escopo: `PLANO-ACADEMIA-V2.md` (tabela de disciplinas e "Trilha B") e `seed/seed.json` (tópicos oficiais por disciplina). Produção isolada em `seed/c3/` (nada integrado, publicado nem gravado no banco real).

## 1. Disciplinas e tópicos oficiais
| Disciplina (id) | Tópicos (nível) |
|---|---|
| SQL (`sql`) | Modelo relacional (I); SELECT, WHERE e ORDER BY (I); INSERT, UPDATE e DELETE (I); JOINs (M); Agregações e GROUP BY (M); Subqueries e CTEs (M); Window functions (A); Views e Stored Procedures (A); SQL analítico avançado (E) |
| PostgreSQL e MySQL (`pg`) | Instalação e psql (I); Tipos de dados (M); PostgreSQL vs MySQL (M); Índices B-tree, GIN, GiST (A); EXPLAIN ANALYZE (A); Query optimization (A); Replicação, particionamento e backup (E) |
| Modelagem de dados (`modeling`) | Entidades e relacionamentos (I); Normalização 1FN a 3FN (M); Relacionamentos 1:N e N:N (M); Desnormalização consciente (A); Modelagem para escala (E) |
| Transações e concorrência (`tx`) | ACID (M); Níveis de isolamento (A); Locks e deadlocks (A); MVCC (E) |
| ORMs Prisma e TypeORM (`orm`) | Prisma schema e migrations (M); Problema N+1 e performance (A); ORM vs SQL puro (E) |
| NoSQL, MongoDB e Redis (`nosql`) | Tipos de bancos NoSQL (I); MongoDB (M); Modelagem orientada a documentos (M); Redis: estruturas de dados (A); Agregações no MongoDB (A); Teorema CAP (E) |
| Estratégias de cache (`cache`) | Cache-aside (M); Write-through e write-behind (A); Invalidação de cache (A); Cache distribuído (E) |
Total: 38 tópicos em 7 disciplinas. (Divergência registrada: a tabela do plano diz "SQL 9, PostgreSQL e MySQL 7, Modelagem 5, Transações 4, ORMs 3, NoSQL 6, Cache 4" = 38; coincide com `seed.json`.)

## 2. Cursos propostos e agrupamento
Regra herdada da C2: um curso por disciplina quando a disciplina tem profundidade para isso; disciplinas pequenas ou fortemente acopladas se juntam; disciplinas grandes se dividem por nível. Decisão: **8 cursos** (SQL e PostgreSQL/MySQL são grandes; as demais ficam como cursos próprios).

| Curso | Id do curso | Disciplina | Tópicos | Aulas | Exercícios | Desafios code | Justificativa |
|---|---|---|---|---|---|---|---|
| C3.1 SQL essencial | `sql-essencial` | `sql` | 6 (I e M) | 9 | 54 | 8 | Base da onda: modelo relacional, consultas, DML, JOINs, agregações, subqueries e CTEs. |
| C3.2 SQL avançado e analítico | `sql-avancado` | `sql` | 3 (A e E) | 6 | 38 | 7 | Window functions, views, procedures e SQL analítico exigem o curso anterior; separar mantém a profundidade. |
| C3.3 PostgreSQL e MySQL: operação e desempenho | `postgres-mysql` | `pg` | 7 | 9 | 54 | 8 | Instalação, tipos, índices, EXPLAIN, otimização, replicação e backup; precisa de SQL essencial. |
| C3.4 Modelagem de dados | `modelagem-dados` | `modeling` | 5 | 6 | 38 | 7 | Disciplina própria; vem antes ou em paralelo ao SQL essencial na prática, mas o exercício usa SQL. |
| C3.5 Transações e concorrência | `transacoes-concorrencia` | `tx` | 4 | 7 | 42 | 8 | ACID, isolamento, locks, MVCC: exige experimentos com duas sessões. |
| C3.6 ORMs: Prisma e TypeORM | `orms-node` | `orm` | 3 | 6 | 38 | 7 | Depende de SQL, modelagem e Node/TypeScript. |
| C3.7 NoSQL: MongoDB e Redis | `nosql-mongodb-redis` | `nosql` | 6 | 9 | 54 | 8 | Disciplina com dois sistemas diferentes; CAP fecha o curso. |
| C3.8 Estratégias de cache | `estrategias-cache` | `cache` | 4 | 6 | 38 | 7 | Usa Redis (C3.7) e conceitos de consistência; fecha a onda. |
Estimativa total: **58 aulas, ~356 exercícios, ~60 desafios code, 8 provas, 8 projetos.**
Alternativas descartadas: fundir `sql` e `pg` (curso de 20+ aulas, mistura de níveis); fundir `tx` com `pg` (transações são conceito independente do produto); fundir `orm` com `sql` (ORMs dependem de Node).

## 3. Ordem, pré-requisitos e dependências
C3.1 → C3.4 (modelagem) → C3.2 → C3.3 → C3.5 → C3.6 → C3.7 → C3.8. `requires` (cursos da Onda 1): `javascript-fundamentos` para C3.6 e C3.7/C3.8 (código Node); demais cursos só pedem lógica de programação. Dependências em texto (`prereqs`): C3.2–C3.5 pedem C3.1; C3.6 pede C3.1, C3.4 e TypeScript; C3.8 pede C3.7. Prepara C4 (backend), C6 (backup e infra), C7 (injeção de SQL) e C8 (replicação, CAP, cache distribuído).

## 4. Projetos integradores (um por curso, `ds` com os ids das disciplinas)
C3.1 *Relatórios de uma loja* (consultas, JOINs, CTEs); C3.2 *Painel analítico* (window functions e views); C3.3 *Tuning de um banco* (índices, EXPLAIN, particionamento, backup e restauração); C3.4 *Modelo de uma plataforma de cursos* (DER, 3FN, desnormalização justificada); C3.5 *Banco de reservas sem corrida* (isolamento, locks, deadlock); C3.6 *API de catálogo com Prisma e TypeORM* (migrations, N+1 resolvido); C3.7 *Feed de eventos* (MongoDB + Redis); C3.8 *Camada de cache para uma API* (cache-aside, invalidação, métricas).

## 5. Ferramentas e ambientes
PostgreSQL e MySQL (contêineres oficiais via Docker, se o Docker funcionar e puder baixar imagens; caso contrário, PGlite/SQLite apenas como apoio e registrado como **não equivalente**), MongoDB e Redis (contêineres oficiais), Node.js com `pg`, `mysql2`, `mongodb`, `ioredis`, Prisma, TypeORM. O que não rodar será registrado como "não executado" em cada laboratório (`seed/c3/labs/<curso>/README.md`).

## 6. Estratégia de validação
Validadores copiados de `seed/c2` (`validate.mjs`, `refs-check.mjs`, `browser-check.mjs`, `index.mjs`) com `C3_FILES`; os desafios code do app são JavaScript puro em Worker (simulam lógica: planejador de JOIN, parser de expressões, grafo de espera de deadlock, política de cache etc.), enquanto SQL real é validado nos laboratórios. Colisões de ids: aulas `sqe-NN`, `sqa-NN`, `pgm-NN`, `mod-NN`, `trx-NN`, `orm-NN`, `nsq-NN`, `cch-NN` (conferir contra Onda 1, C1 e C2 antes de criar). Referências: todas abertas com `refs-check.mjs`.
