// Curso C5.4 da C5: Fundamentos de testes (disciplina: testing).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c54-a.mjs';
import { REF2, lessonsB } from './c54-b.mjs';
import { REF3, lessonsC } from './c54-c.mjs';
import { exsets, assessment, project } from './c54-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['Pirâmide de testes', 'Testes unitários', 'Testes de integração', 'Testes end-to-end', 'Mocking e stubbing', 'TDD', 'BDD', 'Estratégia de qualidade'];
export const COVER = {
  'Pirâmide de testes': ['tst-01'],
  'Testes unitários': ['tst-01'],
  'Testes de integração': ['tst-02'],
  'Testes end-to-end': ['tst-03'],
  'Mocking e stubbing': ['tst-04'],
  'TDD': ['tst-05'],
  'BDD': ['tst-06'],
  'Estratégia de qualidade': ['tst-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Regressão', def: 'Defeito introduzido por uma mudança em algo que antes funcionava.' },
  { term: 'Fixture', def: 'Dados ou estado preparados para um teste.' },
  { term: 'Test runner', def: 'Programa que descobre, executa e relata testes (node:test, Jest, Vitest).' },
  { term: 'Teste de fumaça', def: 'Verificação rápida de que o essencial funciona após uma implantação.' },
  { term: 'Teste exploratório', def: 'Teste conduzido por uma pessoa que aprende e investiga o sistema ao mesmo tempo, sem roteiro fixo.' },
  { term: 'Orçamento de flakiness', def: 'Limite acordado de testes intermitentes tolerados, em geral próximo de zero.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'fundamentos-testes', disciplineId: 'testing', areaId: 'test', requires: [],
  title: 'Fundamentos de testes: pirâmide, unitários, integração, E2E, mocking, TDD, BDD e estratégia de qualidade',
  description: 'Testar software com evidências executadas em Node.js 26.13.1 (node:test, node:sqlite, fast-check 4.11.0, Cucumber 13.3.0 e Chrome headless via Puppeteer): pirâmide e testes unitários (AAA, tabelas, propriedades com contraexemplo reduzido; 12 testes em 613 ms), integração com banco real (SQLite em memória: rollback, restrições, cascata) e API HTTP em porta efêmera, E2E (3 testes em 2.983 ms; espera fixa 8/14 falhas x espera por condição 0/14), mocking e stubbing (mock.fn, mock.timers; over-mocking: renomear salvar para inserir quebra o teste de mock e não o de estado), TDD (kata executado: 0, 2, 4, 5, 6, 7, 8 e 8 testes verdes), BDD (7 cenários e 40 passos em português) e estratégia (cobertura de 100% das linhas com 2 de 7 mutantes sobreviventes; 7/7 após dois testes de fronteira). Projeto: suíte de testes do zero. Jest, Vitest, Playwright, Cypress, Testcontainers e Stryker não foram executados.',
  objectives: ['Escolher a camada certa para cada verificação (pirâmide)', 'Escrever testes unitários, de propriedade e de integração confiáveis', 'Testar fluxos E2E sem flakiness', 'Usar dublês com critério e evitar o over-mocking', 'Aplicar TDD e BDD onde agregam valor', 'Avaliar a qualidade dos testes com cobertura e mutação e montar uma estratégia por risco'],
  level: 'I', prereqs: ['JavaScript e Node.js (Onda 1 e C4.1)', 'Clean Code e SOLID (C5.1) e Design Patterns (C5.2) recomendados', 'Google Chrome instalado para os experimentos de E2E (opcional)'], hours: 12,
  syllabus: 'Pirâmide e testes unitários; integração; E2E; mocking e stubbing; TDD; BDD e estratégia de qualidade; projeto.',
  versions: 'Node.js 26.13.1 (node:test, node:sqlite com SQLite 3.54.1, mock.fn e mock.timers), fast-check 4.11.0, @cucumber/cucumber 13.3.0 e puppeteer-core 25.18.1 com o Google Chrome do sistema, em 2026-11-25 (laboratório em seed/c5/labs/fundamentos-testes/). Tempos de uma máquina e uma execução; o tempo por camada inclui a inicialização do Node e o do E2E, a abertura do Chrome. Achados registrados: o teste de restrição só valeu após inserir uma linha; o cenário do cupom expirado tinha a data errada; os passos do Cucumber exigiram {word} para valores sem aspas; o TDD foi reconstruído em versões sucessivas (não é o histórico real); a mutação foi manual (7 mutantes). Os desafios de código são em JavaScript e modelam a lógica. Não executados: Jest, Vitest, Playwright, Cypress (C5.5), Testcontainers e Stryker.',
  skills: ['Pirâmide de testes', 'Testes unitários e de propriedade', 'Testes de integração com banco real', 'E2E estável', 'Dublês de teste', 'TDD e BDD', 'Cobertura e mutação', 'Estratégia de testes'],
  modules: [
    { id: 'm1', title: 'Pirâmide, unitários e integração', lessons: ['tst-01', 'tst-02'] },
    { id: 'm2', title: 'E2E e dublês', lessons: ['tst-03', 'tst-04'] },
    { id: 'm3', title: 'TDD, BDD e estratégia', lessons: ['tst-05', 'tst-06'] }
  ],
  materials: [REF.testPyramid, REF.practicalPyramid, REF.nodeTest, REF2.mocksArentStubs, REF3.northBdd, REF3.tddFowler].map((r) => ({ ...r })),
  projectIds: ['suite-de-testes-do-zero'],
  supplement: {
    glossary,
    cheatsheet: R`### Pirâmide e unitários
Muitos unitários, alguns de integração, poucos E2E · troféu e favo são variações · cone de sorvete é antipadrão · F.I.R.S.T. · AAA · tabelas, fronteiras, erros · propriedades (fast-check): semente fixa, shrinking · injete relógio e ids

### Integração
Banco real (SQLite em memória; Postgres em contêiner se o dialeto importa) · um banco por teste · transações, CHECK, cascata (PRAGMA foreign_keys no SQLite) · HTTP em porta efêmera, finally fecha · teste de restrição precisa de dados que a violem · terceiros: fakes e contratos

### E2E
Poucas jornadas críticas · nunca sleep: espera por condição (fixa 8/14 falhas x condição 0/14) · seletores por papel/rótulo · dados isolados, terceiros falsificados, sessão reutilizada · evidências nas falhas · flaky = defeito

### Dublês
Dummy, stub, spy, mock, fake · estado por padrão, interação nas fronteiras · não mocke o que não possui (adaptador) · mock.fn, mockImplementation, mock.timers · over-mocking quebra na refatoração

### TDD e BDD
Red → green → refactor · 3 regras · fake it, triangulação · spike descartável · BDD: conversa (três amigos), Gherkin declarativo, Cucumber ({string}, {int}, {word})

### Estratégia
Por risco · commit: unitários + estáticos; PR: integração + BDD; antes do deploy: E2E, carga, contrato; depois: fumaça · cobertura é alarme; mutação pergunta se os testes verificam (100% de linhas e 2/7 mutantes vivos) · métricas úteis x vaidade (Goodhart)`,
    mistakes: ['Cone de sorvete: muitos E2E, poucos unitários.', 'Testes dependentes de ordem, data ou estado global.', 'Teste de restrição sem dados que a violem.', 'Esperas fixas (sleep) em E2E.', 'Over-mocking e mocks do que não se possui.', 'Pular o vermelho no TDD.', 'BDD sem conversa, com cenários imperativos.', 'Perseguir cobertura como meta.'],
    prereqMap: R`**Antes deste curso:** JavaScript e Node.js; Clean Code e SOLID (C5.1) ajudam a escrever código testável.

| Este curso prepara para | Por quê |
|---|---|
| Ferramentas de teste JS (C5.5) | Jest, Vitest, Supertest, Cypress e Playwright aplicam estes conceitos |
| Contrato, carga e análise estática (C5.6) | testes de contrato e carga estendem a pirâmide |
| Qualidade e manutenção (C5.8) | métricas, revisão e dívida técnica |
| CI/CD (C6) | quando cada camada roda no pipeline |

Ordem interna: aulas 1 e 2 (unitários e integração) → 3 e 4 (E2E e dublês) → 5 e 6 (TDD, BDD e estratégia).`,
    officialRefs: [REF.testPyramid, REF.practicalPyramid, REF.testSizes, REF.trophy, REF.nodeTest, REF.nodeSqlite, REF.fastCheck, REF.unitTest, REF.integrationTest, REF.nonDeterminism, REF.testcontainers, REF.sqliteConstraints, REF2.puppeteer, REF2.playwrightWait, REF2.testingLibQueries, REF2.noMoreE2e, REF2.mocksArentStubs, REF2.testDouble, REF2.nodeMock, REF3.tddFowler, REF3.tddBeck, REF3.northBdd, REF3.gherkin, REF3.cucumberDocs, REF3.testCoverage, REF3.stryker, REF3.spotifyHoneycomb, REF3.nodeCoverage],
    practice: ['Escreva testes AAA e uma tabela parametrizada para uma função de domínio.', 'Escreva uma propriedade com fast-check e reproduza um contraexemplo com a semente.', 'Teste um repositório com um banco novo em memória, incluindo rollback e restrições.', 'Teste uma API HTTP em porta efêmera com um gateway falso.', 'Meça a diferença entre espera fixa e espera por condição em um E2E.', 'Reproduza o over-mocking renomeando um método interno.', 'Resolva o kata da calculadora de strings com TDD, registrando os testes verdes por passo.', 'Escreva 5 cenários Gherkin e rode a mutação manual no seu código.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
