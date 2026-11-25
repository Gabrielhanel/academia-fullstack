// Curso C3.6 da C3: ORMs com Prisma e TypeORM (disciplina: orm).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c36-a.mjs';
import { REF2, lessonsB } from './c36-b.mjs';
import { REF3, lessonsC } from './c36-c.mjs';
import { exsetsA } from './c36-ex-a.mjs';
import { exsetsB, assessment, project } from './c36-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Prisma schema e migrations', 'Problema N+1 e performance', 'ORM vs SQL puro'];
export const COVER = {
  'Prisma schema e migrations': ['orm-01', 'orm-02', 'orm-03', 'orm-04'],
  'Problema N+1 e performance': ['orm-05'],
  'ORM vs SQL puro': ['orm-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Mapeamento objeto-relacional', def: 'Técnica que associa classes e atributos a tabelas e colunas, e converte entre os dois modelos.' },
  { term: 'Repositório', def: 'Camada que encapsula o acesso a dados de um conceito de domínio.' },
  { term: 'Conexão e pool', def: 'Canal de comunicação com o banco e o conjunto reutilizável delas.' },
  { term: 'DTO', def: 'Objeto com apenas os campos necessários para transferir dados entre camadas.' },
  { term: 'Observabilidade de consultas', def: 'Capacidade de ver quais consultas rodam, quantas e quanto demoram.' },
  { term: 'Fonte da verdade do esquema', def: 'O único artefato (esquema ou migrações) que define a estrutura do banco.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'orms-node', disciplineId: 'orm', areaId: 'data', requires: ['javascript-fundamentos', 'typescript-fundamentos'],
  title: 'ORMs com Node.js: Prisma, TypeORM, N+1 e quando usar SQL puro',
  description: 'Acesso a dados com ORMs em Node.js e TypeScript: o descompasso objeto-relacional e os padrões (Active Record, Data Mapper, query builder, cliente gerado); Prisma 7 (schema.prisma, prisma.config.ts, adaptador de driver, migrações com migrate dev e deploy, cliente gerado, select e include, paginação por cursor, erros P2002/P2003/P2025, transações, SQL cru seguro e Decimal); TypeORM 1.1 (EntitySchema, DataSource, repositórios, QueryBuilder, erros do driver, transações e o risco do synchronize); o problema N+1 e o desempenho (contagem de consultas, estratégias de carga, agregação no banco, lotes) e a decisão entre ORM e SQL puro com abordagem híbrida, testes e migrações. Tudo foi executado em Prisma 7.10.1, TypeORM 1.1.3 e PostgreSQL 17.12 com um conjunto de 100 clientes, 500 pedidos e 1.500 itens; os desafios do laboratório modelam a lógica em JavaScript.',
  objectives: ['Explicar o descompasso objeto-relacional e os padrões de ORM e escolher a ferramenta', 'Modelar esquemas e migrações no Prisma 7 e revisar o SQL gerado', 'Consultar, paginar, tratar erros e usar transações no Prisma e no TypeORM', 'Detectar e corrigir o N+1 medindo consultas e tempos', 'Usar SQL cru parametrizado e lotes onde o ORM não é a melhor opção', 'Documentar decisões ORM x SQL com testes e medições'],
  level: 'M', prereqs: ['SQL essencial (curso C3.1)', 'Modelagem de dados (curso C3.4)', 'JavaScript e TypeScript (Onda 1)', 'Node.js 22 ou superior e Docker ou um PostgreSQL 15 ou superior para praticar'], hours: 22,
  syllabus: 'Padrões de ORM; Prisma 7: schema, configuração, migrações e cliente; consultas, relações, paginação, erros, transações e SQL cru; TypeORM: entidades, repositórios, QueryBuilder e migrações; N+1, estratégias de carga e lotes; ORM x SQL puro, abordagem híbrida e testes.',
  versions: 'Prisma 7.10.1 (prisma, @prisma/client e @prisma/adapter-pg), TypeORM 1.1.3, pg 8.23.1, tsx 4.23, Node.js 26.13 e PostgreSQL 17.12, em 2026-11-25 (laboratório em seed/c3/labs/orms-node/). A tag latest do pacote prisma apontava para 8.0.0-rc.35 (pré-lançamento): o curso fixa a série 7.10.1. Todas as medições (contagens de consultas e medianas de 7 execuções após aquecimento) vêm de uma máquina e um contêiner, com um conjunto pequeno de dados; a ordem de grandeza e a forma valem mais que os milissegundos. Não foram executados: MySQL com ORMs, Drizzle, Kysely, decoradores do TypeORM, migrações geradas pela CLI do TypeORM, prisma migrate deploy em CI, Prisma Studio e a causa da lentidão da estratégia query do TypeORM.',
  skills: ['Modelagem com Prisma', 'Migrações', 'Consultas e relações', 'Tratamento de erros de banco', 'Transações em ORMs', 'Detecção e correção de N+1', 'SQL cru seguro', 'Decisão ORM x SQL'],
  modules: [
    { id: 'm1', title: 'ORMs e Prisma', lessons: ['orm-01', 'orm-02'] },
    { id: 'm2', title: 'Consultas e TypeORM', lessons: ['orm-03', 'orm-04'] },
    { id: 'm3', title: 'Desempenho e decisão', lessons: ['orm-05', 'orm-06'] }
  ],
  materials: [REF.prismaSchema, REF.prismaMigrate, REF2.prismaRelationQueries, REF2.typeormGetting, REF3.prismaPerf, REF.ormHate].map((r) => ({ ...r })),
  projectIds: ['api-catalogo-orm'],
  supplement: {
    glossary,
    cheatsheet: R`### Padrões
Active Record (o objeto se salva) · Data Mapper (mapeador separado) · query builder · cliente gerado (Prisma) · leia o SQL gerado e meça

### Prisma 7
schema.prisma (generator prisma-client + output; datasource sem url) · prisma.config.ts (url, migrações) · adaptador @prisma/adapter-pg · migrate dev (gera e aplica) / migrate deploy (só aplica) · prisma generate (cliente) · revisar SQL · @@index nas FKs · fixar versões

### Consultas
select (só campos) / include (relações) · relationLoadStrategy join x query · skip/take (OFFSET) x cursor · groupBy/_count no banco · erros P2002 P2003 P2025 · $transaction([...]) e interativa (use tx) · $queryRaw com template (parâmetros) · $queryRawUnsafe só com texto fixo ou parâmetros posicionais · Prisma.Decimal

### TypeORM
EntitySchema ou decoradores · DataSource · repositórios · QueryBuilder (parâmetros nomeados) · QueryFailedError (23505, 23503) · ds.transaction(manager) · synchronize só em testes; produção = migrações revisadas

### N+1 e desempenho
1 + N consultas · carregar relações em lote · agregar no banco · select enxuto · createMany / unnest / COPY (3,1 s x 217 ms x 37 ms para 1.000) · join profundo nem sempre vence · log de consultas, contador por requisição, teste de contagem

### Decisão
ORM para CRUD e relações simples · SQL cru parametrizado para janelas, CTEs, relatórios e cargas · camada de acesso (repositórios) · uma fonte de migrações · testes de integração · ADR com medição`,
    mistakes: ['Achar que o ORM dispensa saber SQL e índices.', 'Navegar relações em laços e gerar N+1.', 'Concatenar entrada do usuário em $queryRawUnsafe ou em consultas do TypeORM.', 'Aplicar migrações geradas sem revisar o SQL.', 'Deixar synchronize ligado em produção.', 'Somar e contar no JavaScript o que o banco agrega melhor.', 'Inserir milhares de linhas com create em laço.', 'Usar o cliente global dentro de uma transação interativa.'],
    prereqMap: R`**Antes deste curso:** SQL essencial (C3.1) e modelagem de dados (C3.4); JavaScript e TypeScript (Onda 1).

| Este curso prepara para | Por quê |
|---|---|
| Backend com Node e NestJS (C4) | camada de acesso a dados com Prisma ou TypeORM |
| Autenticação e APIs (C4) | modelos de usuários e sessões, erros mapeados para HTTP |
| Testes (C5) | testes de integração de repositórios e de contagem de consultas |
| Segurança (C7) | injeção de SQL e migrações seguras |
| Arquitetura (C8) | repositórios, ADRs e abordagem híbrida |

Ordem interna: aulas 1 e 2 (ORMs e Prisma) → 3 e 4 (consultas e TypeORM) → 5 e 6 (desempenho e decisão).`,
    officialRefs: [REF.ormHate, REF.activeRecord, REF.dataMapper, REF.prismaSchema, REF.prismaMigrate, REF.prismaRelations, REF.prismaClient, REF.prismaConfig, REF.typeormSite, REF2.prismaCrud, REF2.prismaRelationQueries, REF2.prismaPagination, REF2.prismaTransactions, REF2.prismaRaw, REF2.prismaErrors, REF2.typeormGetting, REF2.typeormEntity, REF2.typeormRelations, REF2.typeormMigrations, REF2.typeormTransactions, REF2.typeormQueryBuilder, REF2.owaspSqli, REF3.prismaPerf, REF3.prismaLogging, REF3.typeormLogging, REF3.pgExplain, REF3.pgUnnest, REF3.nodePg, REF3.pgCopy, REF3.kysely],
    practice: ['Escreva um schema.prisma, gere a migração inicial e leia o SQL.', 'Reproduza o N+1 e conte as consultas com o log do Prisma e do TypeORM.', 'Compare include com join e com consultas separadas em 1, 2 e 4 níveis.', 'Trate P2002, P2003 e P2025 como respostas HTTP.', 'Prove que $queryRaw com template resiste à injeção e que $queryRawUnsafe concatenado não.', 'Meça create em laço, createMany e INSERT com unnest.', 'Veja o que synchronize faria ao remover um campo da entidade.', 'Faça o projeto integrador: a API de catálogo com ADR.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
