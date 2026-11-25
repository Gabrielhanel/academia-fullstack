// Curso C5.1 da C5: Clean Code e SOLID (disciplina: clean).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c51-a.mjs';
import { lessonsB } from './c51-b.mjs';
import { lessonsC } from './c51-c.mjs';
import { exsets, assessment, project } from './c51-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['Nomes, funções e comentários', 'Os cinco princípios SOLID', 'Refatoração', 'Code smells', 'Technical Debt'];
export const COVER = {
  'Nomes, funções e comentários': ['cln-01'],
  'Os cinco princípios SOLID': ['cln-02'],
  'Refatoração': ['cln-03'],
  'Code smells': ['cln-04'],
  'Technical Debt': ['cln-05']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Lint', def: 'Análise estática automática que aponta problemas de estilo e erros prováveis no código.' },
  { term: 'Prettier', def: 'Formatador de código automático e opinativo que elimina discussões de estilo.' },
  { term: 'Regra do escoteiro', def: 'Deixar o código um pouco melhor do que foi encontrado ao passar por ele.' },
  { term: 'Lei de Deméter', def: 'Orientação de que um módulo deve falar só com seus colaboradores diretos, evitando cadeias de chamadas.' },
  { term: 'Objeto de valor', def: 'Objeto imutável definido por seus valores (dinheiro, CPF), que substitui primitivos soltos.' },
  { term: 'Mutação (teste de)', def: 'Técnica que altera o código de propósito para verificar se os testes detectam a alteração.' },
  { term: 'Hotspot', def: 'Parte do código muito alterada e complexa, com maior custo de manutenção.' },
  { term: 'Yagni', def: 'Princípio de não construir flexibilidade antes de haver necessidade real.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'clean-code', disciplineId: 'clean', areaId: 'arch', requires: [],
  title: 'Clean Code e SOLID: nomes, funções, princípios de design, refatoração, smells e dívida técnica',
  description: 'Escrever e manter código que outras pessoas leiam e alterem com segurança, com experimentos executados: nomes, funções e comentários (função legada de 46 linhas com 20 avisos do ESLint: complexidade 14, aninhamento 5, 5 parâmetros, 8 números mágicos, 5 ==; versão refatorada com 1 aviso); os cinco princípios SOLID com pares de código que violam e respeitam (Retângulo 20 x Quadrado 16, relógio injetado, registro de regras); refatoração em passos pequenos com testes de caracterização (17 casos nas duas versões, 36 testes; uma mutação > por >= derruba 1 teste) e adaptador de migração; code smells com o jscpd (4 clones, 21 linhas, 75% x 0 clones; nenhum detectado sem calibrar os limites); e dívida técnica com juros, payback, hotspots, registro e comunicação (modelo com dados hipotéticos). Projeto: refatoração guiada. SonarQube, CodeScene, ferramentas de mutação e análise de acoplamento não foram executados.',
  objectives: ['Escrever nomes, funções e comentários que revelam intenção', 'Aplicar SOLID com consciência dos custos e do excesso de abstração', 'Refatorar com segurança usando testes de caracterização e adaptadores', 'Reconhecer code smells e escolher o tratamento adequado', 'Medir, registrar, priorizar e comunicar a dívida técnica'],
  level: 'M', prereqs: ['JavaScript (Onda 1) e noções de testes', 'Git básico (Onda 1)', 'Node.js 22 ou superior (o curso usa 26.13.1)'], hours: 9,
  syllabus: 'Nomes, funções e comentários; SOLID; refatoração; code smells; dívida técnica; projeto de refatoração guiada.',
  versions: 'Node.js 26.13.1 (node:test), ESLint 10.15.0 e jscpd 5.4.3, em 2026-11-25 (laboratório em seed/c5/labs/clean-code/). Medidas de uma execução; as regras e limites do ESLint (complexity 5, max-depth 3, max-params 4, max-lines-per-function 20) são didáticos e arbitrários. Achados: sem limites ajustados o jscpd não detectou os clones; o modelo de dívida usa dados hipotéticos. Os desafios de código são em JavaScript e modelam a lógica. Não executados: SonarQube, CodeScene, Stryker (teste de mutação automatizado), dependency-cruiser, TypeScript e medição em repositórios Git reais (os comandos de hotspot são exemplos).',
  skills: ['Legibilidade de código', 'Princípios SOLID', 'Refatoração segura', 'Detecção de code smells', 'Gestão de dívida técnica', 'Testes de caracterização'],
  modules: [
    { id: 'm1', title: 'Legibilidade e princípios', lessons: ['cln-01', 'cln-02'] },
    { id: 'm2', title: 'Refatoração e smells', lessons: ['cln-03', 'cln-04'] },
    { id: 'm3', title: 'Dívida técnica', lessons: ['cln-05'] }
  ],
  materials: [REF.cleanCode, REF.fowlerRefactoring, REF.refGuruSmells, REF.fowlerTechDebt, REF.nodeTest].map((r) => ({ ...r })),
  projectIds: ['refatoracao-guiada'],
  supplement: {
    glossary,
    cheatsheet: R`### Nomes e funções
Nome revela intenção e usa o vocabulário do domínio · números mágicos → constantes · funções pequenas, uma coisa, um nível de abstração · até 3–4 parâmetros (objeto nomeado) · sem flags · guard clauses · comando x consulta · === sempre (mas caracterize antes de trocar)

### Comentários
Só o porquê, avisos e documentação pública · nada de código comentado · extraia função em vez de comentar bloco

### SOLID
SRP: um motivo para mudar · OCP: estender sem editar (registro/mapa) · LSP: subtipo respeita o contrato (Quadrado 16 ≠ 20) · ISP: interfaces pequenas, definidas por quem usa · DIP: injete relógio, repositório, clientes · abstraia na 2ª/3ª variação (Yagni)

### Refatoração
Sem mudar comportamento · passos pequenos, testes verdes · dois chapéus · caracterização/golden master · mutação testa os testes · adaptador com assinatura antiga · Strangler para o estrutural

### Smells
Bloaters · abusadores de OO · impedidores de mudança · dispensáveis · acopladores · duplicação de conhecimento x acidental · calibrar o jscpd

### Dívida técnica
Principal x juros · quadrante deliberada/inadvertida x prudente/imprudente · juros = mudanças × minutos extras · payback = esforço ÷ juros · hotspots = mudança × complexidade · registre com tíquete e ADR · comunique em tempo, risco, custo`,
    mistakes: ['Nomes de uma letra e comentários que repetem o código.', 'Trocar == por === sem caracterizar o comportamento.', 'Refatorar sem testes ou misturar com mudança de comportamento.', 'Herdar só para reaproveitar código (LSP).', 'Abstrair antes da segunda ou terceira variação.', 'Confiar em ferramentas com configuração padrão sem calibrar.', 'Pagar a dívida mais feia em vez da mais cara.', 'TODOs sem tíquete e sem dono.'],
    prereqMap: R`**Antes deste curso:** JavaScript e testes básicos da Onda 1; Git para commits pequenos.

| Este curso prepara para | Por quê |
|---|---|
| Design Patterns (C5.2) | os padrões materializam SOLID e remedeiam smells |
| Fundamentos de testes (C5.4) | testes de caracterização e mutação são a rede da refatoração |
| Qualidade e manutenção (C5.8) | métricas, code review e dívida técnica aprofundados |
| Arquitetura (C8) | os mesmos princípios em escala de módulos e serviços |

Ordem interna: aulas 1 e 2 (legibilidade e SOLID) → 3 e 4 (refatoração e smells) → 5 (dívida técnica e projeto).`,
    officialRefs: [REF.cleanCode, REF.googleJs, REF.eslintComplexity, REF.eslintMaxDepth, REF.eslintMagic, REF.eslintEqeqeq, REF.nodeTest, REF.solidRelevance, REF.liskovWing, REF.fowlerRefactoring, REF.fowlerCodeSmell, REF.refGuruSmells, REF.legacyBook, REF.fowlerTechDebt, REF.fowlerDebtQuadrant, REF.jscpd, REF.fowlerYagni],
    practice: ['Renomeie e extraia funções de um trecho seu e meça com o ESLint.', 'Escreva testes de caracterização e faça uma mutação para testá-los.', 'Reproduza o contrato do Quadrado e do Retângulo e corrija com formas imutáveis.', 'Injete relógio e repositório em um serviço e teste de forma determinística.', 'Rode o jscpd em um projeto e calibre os limites.', 'Monte um backlog de dívida com juros e payback.', 'Faça o projeto integrador: refatoração guiada.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
