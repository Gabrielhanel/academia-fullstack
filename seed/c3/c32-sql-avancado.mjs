// Curso C3.2 da C3: SQL avançado e analítico (disciplina: sql, tópicos A e E).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c32-a.mjs';
import { REF2, lessonsB } from './c32-b.mjs';
import { REF3, lessonsC } from './c32-c.mjs';
import { exsetsA } from './c32-ex-a.mjs';
import { exsetsB, assessment, project } from './c32-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Window functions', 'Views e Stored Procedures', 'SQL analítico avançado'];
export const COVER = {
  'Window functions': ['sqa-01', 'sqa-02'],
  'Views e Stored Procedures': ['sqa-03', 'sqa-04'],
  'SQL analítico avançado': ['sqa-05', 'sqa-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'SQL analítico', def: 'Uso de SQL para análise: janelas, agregações multinível, séries temporais e padrões de comportamento.' },
  { term: 'Conjunto de agrupamento', def: 'Combinação de colunas pela qual se agrega em um GROUPING SETS, ROLLUP ou CUBE.' },
  { term: 'Série temporal', def: 'Sequência de valores indexados pelo tempo.' },
  { term: 'Retenção', def: 'Proporção de usuários que voltam a usar o produto após certo período.' },
  { term: 'Dimensão', def: 'Eixo de análise (região, produto, mês) pelo qual se detalham as medidas.' },
  { term: 'Medida', def: 'Valor numérico agregado em uma análise (total, contagem, média).' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'sql-avancado', disciplineId: 'sql', areaId: 'data', requires: [],
  title: 'SQL avançado e analítico: window functions, views, procedures e análise de dados',
  description: 'O segundo curso de SQL: funções de janela (OVER, PARTITION BY, ranking, lag e lead, acumulados, frames ROWS e RANGE e a armadilha do last_value); views e views materializadas (atualização, WITH CHECK OPTION, quando usar cada uma); funções, procedures e triggers em PL/pgSQL (com atomicidade, auditoria e os riscos de lógica no banco); SQL analítico (ROLLUP, CUBE, GROUPING SETS, grouping(), DISTINCT ON, date_trunc, calendário com generate_series, tabelas cruzadas); e padrões avançados (LATERAL, mediana e moda, JSONB, ilhas e coortes). Todos os exemplos foram executados em PostgreSQL 17.12; os desafios do laboratório modelam a lógica em JavaScript (ranking, frames, views, procedure atômica, rollup, ilhas e estatísticas).',
  objectives: ['Aplicar funções de janela para rankings, variações, acumulados e médias móveis', 'Escolher entre view, view materializada, CTE e tabela de resumo', 'Escrever funções, procedures e triggers em PL/pgSQL com atenção a transações e riscos', 'Construir relatórios com subtotais, calendários completos e tabelas cruzadas', 'Resolver problemas de análise: Top-N por grupo, ilhas, coortes, JSONB e estatísticas'],
  level: 'A', prereqs: ['SQL essencial (curso C3.1): SELECT, JOINs, agregações, subqueries e CTEs', 'Docker (opcional) ou PostgreSQL 15 ou superior para praticar', 'Noções de transações (aprofundadas no curso C3.5)'], hours: 16,
  syllabus: 'Funções de janela (ranking, lag e lead, acumulados, frames); views e views materializadas; funções, procedures e triggers em PL/pgSQL; ROLLUP, CUBE, GROUPING SETS, DISTINCT ON, date_trunc, generate_series e pivot com FILTER; LATERAL, percentis, JSONB, ilhas e coortes.',
  versions: 'PostgreSQL 17.12 (imagem oficial postgres:17 do Docker Hub) com o cliente psql do próprio contêiner, em 2026-11-25. Todas as consultas das aulas foram executadas nele (laboratório em seed/c3/labs/sql-avancado/). Não foram executados: MySQL, MariaDB, SQL Server, Oracle, a extensão tablefunc (crosstab), REFRESH MATERIALIZED VIEW CONCURRENTLY, triggers INSTEAD OF, row-level security e a cláusula CYCLE. Diferenças de dialeto vêm da documentação e estão sinalizadas.',
  skills: ['Funções de janela', 'Views e views materializadas', 'PL/pgSQL', 'Triggers e auditoria', 'Relatórios com subtotais', 'LATERAL e JSONB', 'Séries temporais e coortes', 'Estatística descritiva em SQL'],
  modules: [
    { id: 'm1', title: 'Funções de janela', lessons: ['sqa-01', 'sqa-02'] },
    { id: 'm2', title: 'Views e lógica no banco', lessons: ['sqa-03', 'sqa-04'] },
    { id: 'm3', title: 'SQL analítico', lessons: ['sqa-05', 'sqa-06'] }
  ],
  materials: [REF.tutWindow, REF.windowFunc, REF2.createView, REF2.createMatView, REF2.plpgsql, REF3.grouping, REF3.lateral].map((r) => ({ ...r })),
  projectIds: ['painel-analitico'],
  supplement: {
    glossary,
    cheatsheet: R`### Janela
função() OVER (PARTITION BY … ORDER BY … frame) · não vale no WHERE (use subconsulta) · row_number único · rank (5,5,7) · dense_rank (5,5,6) · ntile(n) · lag/lead · sum() OVER (ORDER BY) = acumulado

### Frame
Padrão com ORDER BY: RANGE UNBOUNDED PRECEDING → CURRENT ROW (empatados juntos) · ROWS: linhas físicas · last_value: use UNBOUNDED FOLLOWING · média móvel: ROWS BETWEEN n PRECEDING AND CURRENT ROW

### Views
VIEW: reescrita, sempre atual · MATERIALIZED: guarda resultado, REFRESH (CONCURRENTLY exige índice único) · WITH CHECK OPTION · GROUP BY não é atualizável · evite SELECT * em views

### Rotinas
FUNCTION (usa em consultas; IMMUTABLE/STABLE/VOLATILE) · PROCEDURE + CALL (pode COMMIT/ROLLBACK) · RAISE EXCEPTION desfaz · TRIGGER (NEW/OLD, BEFORE/AFTER) para auditoria e invariantes · prefixe variáveis · SECURITY DEFINER com search_path fixo

### Analítico
ROLLUP (hierárquico) · CUBE (todas as combinações) · GROUPING SETS · grouping() diferencia subtotal de NULL · DISTINCT ON · date_trunc · generate_series + LEFT JOIN · pivot: sum() FILTER (WHERE …)

### Avançado
LATERAL (por linha) · percentile_cont(0.5) WITHIN GROUP · mode() · JSONB: -> ->> @> ? jsonb_array_elements_text · ilhas: dia − row_number · coorte: primeiro evento por usuário`,
    mistakes: ['Usar função de janela no WHERE.', 'Achar que last_value devolve o último valor sem declarar o frame.', 'Esperar que a view materializada se atualize sozinha.', 'Marcar uma função como IMMUTABLE sem ser.', 'Esconder o fluxo principal em triggers.', 'Confundir NULL de subtotal com NULL de dado.', 'Agrupar só períodos com dados e omitir meses vazios.', 'Usar JSONB para tudo e perder tipos e restrições.'],
    prereqMap: R`**Antes deste curso:** SQL essencial (C3.1): SELECT, JOINs, agregações, subconsultas e CTEs.

| Este curso prepara para | Por quê |
|---|---|
| PostgreSQL e MySQL (C3.3) | EXPLAIN de janelas, índices para partições e ordenações |
| Transações e concorrência (C3.5) | procedures e triggers rodam em transações |
| ORMs (C3.6) | views, funções e SQL cru dentro de ORMs |
| NoSQL (C3.7) | JSONB e agregações em documentos |
| Arquitetura (C8) | views materializadas, CQRS e relatórios |

Ordem interna: aulas 1 e 2 (janelas) → 3 e 4 (views e rotinas) → 5 e 6 (SQL analítico).`,
    officialRefs: [REF.tutWindow, REF.windowSyntax, REF.windowFunc, REF.windowQuery, REF.aggregate, REF2.createView, REF2.createMatView, REF2.refreshMatView, REF2.rulesViews, REF2.createFunction, REF2.createProcedure, REF2.plpgsql, REF2.createTrigger, REF2.xfunc, REF2.call, REF3.grouping, REF3.distinctOn, REF3.datetime, REF3.setReturning, REF3.lateral, REF3.orderedSet, REF3.json, REF3.jsonFunc],
    practice: ['Carregue o esquema de vendas e reproduza os rankings com empates.', 'Calcule variações e acumulados e compare ROWS com RANGE em dados com empates.', 'Crie uma view e uma view materializada, insira dados e observe a diferença antes e depois do REFRESH.', 'Escreva uma função, uma procedure com validação e um trigger de auditoria e teste o caminho de falha.', 'Monte um relatório com ROLLUP e rotule os subtotais com grouping().', 'Gere um calendário com generate_series e preencha os meses vazios.', 'Resolva o padrão de ilhas e uma coorte com dados pequenos.', 'Faça o projeto integrador: o painel analítico.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
