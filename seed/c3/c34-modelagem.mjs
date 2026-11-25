// Curso C3.4 da C3: Modelagem de dados (disciplina: modeling).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c34-a.mjs';
import { REF2, lessonsB } from './c34-b.mjs';
import { REF3, lessonsC } from './c34-c.mjs';
import { exsetsA } from './c34-ex-a.mjs';
import { exsetsB, assessment, project } from './c34-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Entidades e relacionamentos', 'Normalização (1FN a 3FN)', 'Relacionamentos 1:N e N:N', 'Desnormalização consciente', 'Modelagem para escala'];
export const COVER = {
  'Entidades e relacionamentos': ['mod-01'],
  'Normalização (1FN a 3FN)': ['mod-02'],
  'Relacionamentos 1:N e N:N': ['mod-03'],
  'Desnormalização consciente': ['mod-04'],
  'Modelagem para escala': ['mod-05', 'mod-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Modelo de dados', def: 'Descrição estruturada das entidades, atributos, relacionamentos e regras que um sistema precisa guardar.' },
  { term: 'Esquema', def: 'Conjunto de tabelas, tipos e restrições que implementa o modelo lógico.' },
  { term: 'Migração', def: 'Mudança versionada do esquema ou dos dados.' },
  { term: 'ADR', def: 'Registro de decisão de arquitetura, com contexto, decisão e consequências.' },
  { term: 'Integridade de dados', def: 'Garantia de que os dados respeitam as regras definidas (chaves, tipos, restrições).' },
  { term: 'Superchave', def: 'Conjunto de colunas que identifica unicamente uma linha, mesmo que não seja mínimo.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'modelagem-dados', disciplineId: 'modeling', areaId: 'data', requires: [],
  title: 'Modelagem de dados: entidades, normalização, relacionamentos, desnormalização e escala',
  description: 'Do problema ao esquema: levantamento de entidades, atributos, relacionamentos e cardinalidades, diagrama entidade-relacionamento e tradução para tabelas; anomalias de atualização, inserção e exclusão e a normalização até a 3FN (dependência funcional, decomposição sem perdas, BCNF em visão geral); relacionamentos 1:N, N:N, 1:1 e autorrelacionamentos, ações referenciais, domínios (tabela de domínio, CHECK e ENUM) e o problema das associações polimórficas; desnormalização consciente com medições de ganho, custo e divergência; e modelagem para escala (chaves bigint e UUID, evolução do esquema com expandir e contrair, multi-tenancy, particionamento, sharding) e padrões (exclusão lógica, histórico com validade, hierarquias, EAV x JSONB). Todos os experimentos foram executados em PostgreSQL 17.12; os desafios do laboratório modelam a lógica em JavaScript (tradução de relacionamentos, fecho de atributos, ações referenciais, verificação de totais, planejamento de chaves e lotes, regras de unicidade e árvores).',
  objectives: ['Levantar entidades, relacionamentos e cardinalidades a partir de requisitos e traduzi-los em tabelas', 'Identificar anomalias e normalizar até a 3FN verificando a decomposição', 'Implementar relacionamentos com chaves, ações referenciais e domínios adequados', 'Decidir sobre desnormalização com medição e plano de consistência', 'Projetar chaves, evolução do esquema e isolamento de tenants para escala', 'Aplicar padrões de exclusão lógica, histórico e hierarquias'],
  level: 'M', prereqs: ['SQL essencial (curso C3.1)', 'Recomendado: PostgreSQL e MySQL (curso C3.3) para os experimentos de chaves e esquema', 'Docker (opcional) ou PostgreSQL 15 ou superior'], hours: 18,
  syllabus: 'Entidades, atributos, relacionamentos, cardinalidade e DER; anomalias, dependências funcionais e formas normais até a 3FN; 1:N, N:N, 1:1, ações referenciais, domínios e polimorfismo; desnormalização consciente; chaves, evolução do esquema, multi-tenancy, particionamento e sharding; exclusão lógica, histórico temporal, hierarquias e atributos flexíveis.',
  versions: 'PostgreSQL 17.12 (imagem oficial postgres:17), em 2026-11-25; extensões btree_gist e ltree da própria imagem. Todos os experimentos e mensagens de erro citados foram executados nele (laboratório em seed/c3/labs/modelagem-dados/). Não foram executados: UUIDv7 (sem função nativa no 17), row level security, NOT VALID e VALIDATE CONSTRAINT, sharding, tablefunc e MySQL (diferenças vêm de aulas anteriores ou da documentação). Tempos são de uma máquina e um contêiner.',
  skills: ['Modelagem conceitual e lógica', 'Normalização', 'Integridade referencial', 'Desnormalização com medição', 'Chaves e evolução do esquema', 'Multi-tenancy', 'Padrões de modelagem', 'Documentação com DER e ADR'],
  modules: [
    { id: 'm1', title: 'Do problema ao modelo', lessons: ['mod-01', 'mod-02'] },
    { id: 'm2', title: 'Relacionamentos e desnormalização', lessons: ['mod-03', 'mod-04'] },
    { id: 'm3', title: 'Escala e padrões', lessons: ['mod-05', 'mod-06'] }
  ],
  materials: [REF.er, REF.mermaidEr, REF.normalization, REF2.fk, REF3.altertable, REF3.expandContract, REF3.ltree].map((r) => ({ ...r })),
  projectIds: ['modelo-plataforma-cursos'],
  supplement: {
    glossary,
    cheatsheet: R`### Conceitual → lógico → físico
substantivos = entidades · verbos = relacionamentos · regras = cardinalidade/restrições · DER (Mermaid) · chave substituta + naturais UNIQUE NOT NULL

### Tradução
1:N → FK no lado N (NOT NULL se obrigatório) · 1:1 → FK UNIQUE (ou PK compartilhada) · N:N → tabela de ligação com PK composta e atributos do par · multivalorado → tabela própria · preço cobrado no item (histórico)

### Normalização
anomalias: atualização, inserção, exclusão · DF X → Y · 1FN: valores atômicos · 2FN: sem dependência parcial · 3FN: sem dependência transitiva ("a chave, a chave inteira e nada além da chave") · decomposição sem perdas: reconstrua e compare (EXCEPT) · pare na 3FN

### Integridade
RESTRICT (padrão) / CASCADE (dependentes sem sentido sem o pai) / SET NULL · domínio: tabela (muda com o negócio), CHECK, ENUM · polimórfico sem FK = órfãos · índice na FK (PostgreSQL)

### Desnormalização
normalize → indexe → meça → só então desnormalize · defina a fonte da verdade e quem mantém · consulta de verificação · trigger custa escrita · histórico (preço cobrado) não é otimização

### Escala
bigint sequencial x UUID (v4 aleatório custa índice e inserção) · expandir e contrair, backfill em lotes, CONCURRENTLY, lock_timeout · tenant_id + chaves compostas + RLS · réplicas, particionamento, sharding por último

### Padrões
soft delete + UNIQUE parcial · validade com tstzrange + EXCLUDE · hierarquia: adjacência, caminho, ltree, fechamento · atributos variáveis: colunas + JSONB (evite EAV) · saldo = soma de lançamentos`,
    mistakes: ['Ir direto para as tabelas sem entender o negócio.', 'Repetir fatos em várias linhas e aceitar dados contraditórios.', 'Resolver N:N com listas em uma coluna.', 'Usar CASCADE sem avaliar a cadeia de exclusões.', 'Desnormalizar antes de indexar e medir.', 'Fazer um UPDATE gigante em uma tabela de produção.', 'Usar UNIQUE comum com exclusão lógica.', 'Adotar EAV como solução geral para atributos flexíveis.'],
    prereqMap: R`**Antes deste curso:** SQL essencial (C3.1). Recomendado: PostgreSQL e MySQL (C3.3).

| Este curso prepara para | Por quê |
|---|---|
| Transações e concorrência (C3.5) | restrições e integridade são a base de transações corretas |
| ORMs (C3.6) | mapeamento de entidades e relacionamentos |
| NoSQL (C3.7) | comparar modelagem relacional e orientada a documentos |
| Cache (C3.8) | decidir o que e como duplicar dados |
| Arquitetura (C8) | multi-tenancy, particionamento, sharding e evolução |

Ordem interna: aulas 1 e 2 (do problema ao modelo) → 3 e 4 (relacionamentos e desnormalização) → 5 e 6 (escala e padrões).`,
    officialRefs: [REF.er, REF.mermaidEr, REF.constraints, REF.createTable, REF.normalization, REF.fd, REF.mysqlForeign, REF2.fk, REF2.enums, REF2.triggers, REF2.matview, REF2.denorm, REF2.jsonTypes, REF3.uuid, REF3.altertable, REF3.createIndex, REF3.partitioning, REF3.rls, REF3.ltree, REF3.rangeTypes, REF3.expandContract, REF3.evolutionary],
    practice: ['Levante entidades e relacionamentos de um texto de requisitos e desenhe o DER em Mermaid.', 'Reproduza as três anomalias em uma tabela plana e elimine-as normalizando até a 3FN.', 'Verifique uma decomposição reconstruindo a tabela original com JOIN e EXCEPT.', 'Teste cada ação referencial (RESTRICT, CASCADE, SET NULL) e anote os erros.', 'Modele um domínio de três formas e compare o custo de acrescentar um valor.', 'Meça uma consulta antes e depois de indexar e de desnormalizar e provoque uma divergência.', 'Compare a inserção e o índice com bigint e UUID e faça um backfill em lotes.', 'Faça o projeto integrador: o modelo da plataforma de cursos com ADR.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
