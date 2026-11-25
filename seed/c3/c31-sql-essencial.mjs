// Curso C3.1 da C3: SQL essencial (disciplina: sql, tópicos I e M).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c31-a.mjs';
import { REF2, lessonsB } from './c31-b.mjs';
import { REF3, lessonsC } from './c31-c.mjs';
import { exsetsA } from './c31-ex-a.mjs';
import { exsetsB, assessment, project } from './c31-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Modelo relacional', 'SELECT, WHERE e ORDER BY', 'INSERT, UPDATE e DELETE', 'JOINs', 'Agregações e GROUP BY', 'Subqueries e CTEs'];
export const COVER = {
  'Modelo relacional': ['sqe-01'],
  'SELECT, WHERE e ORDER BY': ['sqe-02'],
  'INSERT, UPDATE e DELETE': ['sqe-03'],
  'JOINs': ['sqe-04', 'sqe-05'],
  'Agregações e GROUP BY': ['sqe-06'],
  'Subqueries e CTEs': ['sqe-07', 'sqe-08']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'SQL', def: 'Linguagem declarativa padrão para consultar e manipular bancos de dados relacionais.' },
  { term: 'Esquema (schema)', def: 'Agrupamento de tabelas e objetos do banco sob um nome.' },
  { term: 'psql', def: 'Cliente de linha de comando do PostgreSQL.' },
  { term: 'Cardinalidade', def: 'Número de linhas relacionadas em um relacionamento (um-para-um, um-para-muitos, muitos-para-muitos).' },
  { term: 'Idempotência', def: 'Propriedade de um script que pode ser executado várias vezes com o mesmo resultado.' },
  { term: 'Planejador (otimizador)', def: 'Componente do banco que escolhe a forma de executar uma consulta.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'sql-essencial', disciplineId: 'sql', areaId: 'data', requires: [],
  title: 'SQL essencial: modelo relacional, consultas, JOINs, agregações, subqueries e CTEs',
  description: 'SQL do zero ao nível de trabalho: o modelo relacional (tabelas, chaves, restrições, tipos e o valor NULL com sua lógica de três valores); SELECT, WHERE, ORDER BY e LIMIT com a ordem lógica de execução; INSERT, UPDATE, DELETE, RETURNING, upsert e transações para alterar dados com segurança; JOINs (INNER, LEFT, FULL, CROSS e auto-junção) e o perigo da duplicação por granularidade; agregações com GROUP BY, HAVING e FILTER; subconsultas (escalares, IN, EXISTS, correlacionadas e a armadilha do NOT IN com NULL); CTEs e recursão; e SQL seguro contra injeção. Todos os exemplos foram executados em PostgreSQL 17.12 (contêiner oficial); os desafios do laboratório modelam a lógica em JavaScript (lógica de três valores, consulta, upsert, JOIN, duplicação, agregação, NOT IN, recursão e consulta segura).',
  objectives: ['Explicar o modelo relacional, chaves e restrições e prever o efeito do NULL', 'Escrever consultas com filtros, ordenação, paginação e a ordem lógica correta', 'Alterar dados com segurança usando transações, RETURNING e upsert', 'Combinar tabelas com JOINs corretos e evitar duplicação por granularidade', 'Resumir dados com GROUP BY, HAVING, subqueries e CTEs, inclusive recursivas', 'Escrever SQL parametrizado, legível e conferido'],
  level: 'I', prereqs: ['Lógica de programação básica', 'Noções de planilha ou de tabelas de dados', 'Docker (opcional) ou uma instalação de PostgreSQL 15 ou superior para praticar'], hours: 22,
  syllabus: 'Modelo relacional, chaves, restrições, tipos e NULL; SELECT, WHERE, ORDER BY, LIMIT e DISTINCT; INSERT, UPDATE, DELETE, RETURNING, ON CONFLICT e transações; INNER, LEFT, FULL, CROSS e auto-junção, duplicação por JOIN; agregações, GROUP BY, HAVING e FILTER; subconsultas, EXISTS e NOT IN; CTEs e recursão; injeção de SQL, parâmetros e revisão de consultas.',
  versions: 'PostgreSQL 17.12 (imagem oficial postgres:17 do Docker Hub) com o cliente psql do próprio contêiner, em 2026-11-25. Todas as consultas foram executadas nele; o laboratório está em seed/c3/labs/sql-essencial/. MySQL, MariaDB, SQLite, SQL Server e Oracle não foram executados: as menções a diferenças de dialeto vêm da documentação e estão sinalizadas. O driver pg do Node.js foi apresentado em código, mas não executado neste curso.',
  skills: ['Modelo relacional', 'Consultas SQL', 'Manipulação de dados', 'JOINs', 'Agregações', 'Subconsultas e CTEs', 'SQL seguro', 'Conferência de resultados'],
  modules: [
    { id: 'm1', title: 'Fundamentos e consultas', lessons: ['sqe-01', 'sqe-02', 'sqe-03'] },
    { id: 'm2', title: 'Juntando e resumindo dados', lessons: ['sqe-04', 'sqe-05', 'sqe-06'] },
    { id: 'm3', title: 'Consultas compostas e boas práticas', lessons: ['sqe-07', 'sqe-08', 'sqe-09'] }
  ],
  materials: [REF.tutTable, REF.select, REF.insert, REF2.joins, REF2.tutAgg, REF3.subq, REF3.with, REF3.owaspSqli].map((r) => ({ ...r })),
  projectIds: ['relatorios-loja'],
  supplement: {
    glossary,
    cheatsheet: R`### Ordem lógica
FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT/OFFSET · apelido do SELECT não vale no WHERE

### NULL
= NULL nunca é verdadeiro: IS NULL, IS NOT NULL, IS DISTINCT FROM · agregações ignoram NULL · count(*) conta linhas · sum de vazio = NULL (coalesce) · NOT IN com NULL = 0 linhas → NOT EXISTS

### DML
INSERT (nomeie colunas) · UPDATE/DELETE sempre com WHERE · BEGIN … ROLLBACK/COMMIT · RETURNING · ON CONFLICT DO NOTHING/UPDATE (EXCLUDED)

### JOIN
INNER: só casamentos · LEFT: preserva a esquerda · FULL: as duas · CROSS: todas as combinações · filtro da tabela opcional no ON · anti-join: LEFT + IS NULL · evite NATURAL JOIN · um-para-muitos duplica o "um": agregue antes de juntar, count(DISTINCT)

### Agregação
count/sum/avg/min/max · WHERE filtra linhas, HAVING filtra grupos · FILTER (WHERE …) · count(coluna da tabela opcional) após LEFT JOIN

### Subconsultas e CTEs
escalar, IN, EXISTS, correlacionada · WITH nomeia etapas · WITH RECURSIVE: base + UNION ALL + parte recursiva + parada · MATERIALIZED

### Segurança
Parâmetros ($1) para valores · allowlist para colunas · nunca concatenar entrada do usuário · menor privilégio`,
    mistakes: ['Comparar com = NULL em vez de IS NULL.', 'Usar double precision para dinheiro.', 'Rodar UPDATE ou DELETE sem WHERE ou sem transação.', 'Filtrar a tabela opcional de um LEFT JOIN no WHERE.', 'Somar colunas do lado "um" depois de juntar com o lado "muitos".', 'Usar NOT IN sobre colunas que aceitam NULL.', 'Contar filhos com count(*) após LEFT JOIN.', 'Concatenar entrada do usuário no texto SQL.'],
    prereqMap: R`**Antes deste curso:** lógica de programação básica. Não é preciso saber outro banco.

| Este curso prepara para | Por quê |
|---|---|
| SQL avançado e analítico (C3.2) | window functions e views partem de JOINs, agregações e CTEs |
| PostgreSQL e MySQL (C3.3) | índices, EXPLAIN e otimização usam as consultas deste curso |
| Modelagem de dados (C3.4) | chaves, restrições e granularidade |
| Transações e concorrência (C3.5) | BEGIN, COMMIT e ROLLBACK aparecem aqui |
| ORMs (C3.6) | o ORM gera o SQL que você aprendeu a ler |
| Backend (C4) e segurança (C7) | parâmetros, injeção e acesso a dados |

Ordem interna: aulas 1 a 3 (fundamentos e DML) → 4 a 6 (JOINs e agregações) → 7 a 9 (subconsultas, CTEs e SQL seguro).`,
    officialRefs: [REF.tutTable, REF.ddlConstraints, REF.datatype, REF.select, REF.comparison, REF.matching, REF.limit, REF.orderby, REF.insert, REF.update, REF.delete, REF.returning, REF.psql, REF2.joins, REF2.tutJoin, REF2.tutAgg, REF2.aggFunc, REF3.subq, REF3.with, REF3.prepare, REF3.owaspSqli, REF3.conditional, REF3.explainIntro],
    practice: ['Instale o PostgreSQL (ou rode o contêiner oficial) e carregue o esquema da loja.', 'Reproduza os experimentos de NULL e anote cada resultado.', 'Escreva um UPDATE com RETURNING dentro de uma transação e desfaça com ROLLBACK.', 'Escreva um LEFT JOIN com o filtro no ON e outro no WHERE e compare os resultados.', 'Provoque uma duplicação de soma e corrija agregando antes de juntar.', 'Reproduza a armadilha do NOT IN e troque por NOT EXISTS.', 'Escreva uma CTE recursiva para uma árvore de categorias.', 'Faça o projeto integrador com a camada de acesso parametrizada.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
