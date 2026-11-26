// Curso C5.5 da C5: Ferramentas de teste para JavaScript (disciplina: test-js).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c55-a.mjs';
import { REF2, lessonsB } from './c55-b.mjs';
import { REF3, lessonsC } from './c55-c.mjs';
import { exsets, assessment, project } from './c55-ex.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar(exsets);

export const TOPICS = ['Jest', 'Vitest', 'Supertest', 'Cypress', 'Playwright', 'Testes em pipelines de CI'];
export const COVER = {
  'Jest': ['ftj-01'],
  'Vitest': ['ftj-02'],
  'Supertest': ['ftj-03'],
  'Cypress': ['ftj-04'],
  'Playwright': ['ftj-05'],
  'Testes em pipelines de CI': ['ftj-06']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'JUnit XML', def: 'Formato de relatório de testes lido por painéis e sistemas de CI.' },
  { term: 'Fixture', def: 'Recurso de teste preparado e injetado (no Playwright: page, context, browser).' },
  { term: 'jsdom', def: 'Implementação de DOM em JavaScript puro usada para testar código de navegador no Node.' },
  { term: 'Lockfile', def: 'Arquivo que fixa as versões exatas das dependências instaladas (package-lock.json).' },
  { term: 'Headless', def: 'Execução do navegador sem interface gráfica.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'ferramentas-testes-js', disciplineId: 'test-js', areaId: 'test', requires: [],
  title: 'Ferramentas de teste para JavaScript: Jest, Vitest, Supertest, Cypress, Playwright e testes em CI',
  description: 'As principais ferramentas de teste do ecossistema JavaScript, todas executadas em Node.js 26.13.1: Jest 30.5.2 (ESM nativo: 13 testes em 0,659 s, snapshot inline, cobertura v8 de 100% das linhas), Vitest 5.1.2 (17 testes, expect.soft, test.concurrent, vi.stubEnv; Jest 1,54 s x Vitest 2,07 s x node:test 0,38 s em suítes minúsculas), Supertest 7.3.2 com Express 5.3.0 (5 testes: 201, 422, 404, 400 e 413), Cypress 16.3.0 (7 testes em 3 s; um erro real de should("match"); binário de 811 MB), Playwright 1.65.1 (11 testes em 12,3 s com 4 workers e 13,1 s com 1, shards 8,3 s e 7,9 s, 7 atrasos sem sleep, trace de 46.310 bytes) e pipelines de CI (workflow validado com o actionlint 1.7.12: exit 0 e 4 erros no defeituoso; não executado em runner). Projeto: testes de API e E2E. Firefox, WebKit, Mocha, Selenium, testes de componentes e visuais não foram executados.',
  objectives: ['Escolher entre Jest, Vitest e node:test conforme o projeto', 'Testar APIs HTTP com Supertest', 'Escrever E2E estáveis em Playwright e conhecer o Cypress', 'Medir e comparar ferramentas em vez de confiar em reputação', 'Montar e validar um pipeline de testes com matriz, shards, cache e artefatos'],
  level: 'I', prereqs: ['Fundamentos de testes (C5.4)', 'JavaScript e Node.js', 'Express (C4.1) para a aula de Supertest', 'Google Chrome para os E2E (opcional)'], hours: 11,
  syllabus: 'Jest; Vitest; Supertest; Cypress; Playwright; testes em pipelines de CI; projeto.',
  versions: 'Node.js 26.13.1, Jest 30.5.2 (ESM com --experimental-vm-modules, cobertura v8), Vitest 5.1.2 (@vitest/coverage-v8 5.1.2), Supertest 7.3.2, Express 5.3.0, Playwright 1.65.1 (Google Chrome do sistema), Cypress 16.3.0 (binário de 811 MB em cache dedicado) e actionlint 1.7.12 (imagem Docker), em 2026-11-25 (laboratório em seed/c5/labs/ferramentas-testes-js/). Tempos de uma máquina; os de parede são medianas de 5 execuções de suítes minúsculas, dominadas pela inicialização. Achados: should("match") no Cypress comparava o seletor; 4 workers quase não ganharam de 1 worker na suíte curta do Playwright. O workflow do GitHub Actions foi validado estaticamente, não executado. Os desafios de código são em JavaScript e modelam a lógica. Não executados: Firefox e WebKit no Playwright, Cypress Cloud, Mocha, Selenium, WebdriverIO, testes de componente e visuais.',
  skills: ['Jest', 'Vitest', 'Supertest', 'Playwright', 'Cypress', 'CI para testes', 'Medição de ferramentas'],
  modules: [
    { id: 'm1', title: 'Runners unitários: Jest e Vitest', lessons: ['ftj-01', 'ftj-02'] },
    { id: 'm2', title: 'API e E2E no navegador: Supertest e Cypress', lessons: ['ftj-03', 'ftj-04'] },
    { id: 'm3', title: 'Playwright e pipelines', lessons: ['ftj-05', 'ftj-06'] }
  ],
  materials: [REF.jestStart, REF.vitestGuide, REF2.supertest, REF2.cypressDocs, REF3.pwIntro, REF3.ghActions].map((r) => ({ ...r })),
  projectIds: ['testes-api-e-e2e'],
  supplement: {
    glossary,
    cheatsheet: R`### Jest
ESM: NODE_OPTIONS=--experimental-vm-modules, transform {}, import de @jest/globals · test.each · toBe/toEqual/toMatchObject · await em resolves/rejects · jest.fn/spyOn/mockRestore · fake timers + useRealTimers · snapshot inline pequeno · cobertura v8

### Vitest
vi no lugar de jest · include/coverage em vitest.config · expect.soft, test.concurrent, vi.stubEnv · vi.mock hoisted · vitest run no CI · migrar por ESM/TS, não por velocidade (Jest 1,54 s, Vitest 2,07 s, node:test 0,38 s em suítes minúsculas)

### Supertest
App Express como fábrica sem listen · .expect(status, corpo) · 400 JSON inválido, 413 corpo grande, 422 validação, 404 · banco novo por teste · error handler com 4 parâmetros · não cobre rede/TLS/proxy

### Cypress
Roda no navegador · fila de comandos (sem async/await) · retentativa · invoke("text") para texto · cy.intercept + cy.wait("@alias") · cy.session · binário grande (811 MB) → cache no CI · uma aba/uma origem

### Playwright
locators por papel/rótulo · auto-espera + expect web · page.route · trace (on-first-retry) · workers, --shard=i/n · webServer · channel chrome · storageState

### CI
needs, matriz (fail-fast false), shards, cache, artefatos em falha, permissions mínimas, timeout-minutes, concurrency · actionlint · dados não confiáveis por env · flaky: medir, quarentena com prazo`,
    mistakes: ['Esquecer o await em rejects/resolves.', 'Atualizar snapshots com -u sem revisar.', 'Migrar para o Vitest esperando ganho automático de velocidade.', 'Chamar listen no módulo do app e deixar portas abertas.', 'should("match") em elemento no Cypress.', 'Sleeps e waitForTimeout em E2E.', 'Workflow sem permissions, timeouts e actionlint.', 'Interpolar dados não confiáveis no run.'],
    prereqMap: R`**Antes deste curso:** Fundamentos de testes (C5.4), JavaScript e Node.js; Express (C4.1) ajuda na aula de Supertest.

| Este curso prepara para | Por quê |
|---|---|
| Contrato, carga e análise estática (C5.6) | testes de API, de contrato e pipelines estendidos |
| CI/CD (C6) | pipelines de build, testes e entrega |
| Qualidade e manutenção (C5.8) | métricas de qualidade e gestão de flaky |
| Front-end avançado | testes de componentes e E2E de interface |

Ordem interna: aulas 1 e 2 (Jest e Vitest) → 3 e 4 (Supertest e Cypress) → 5 e 6 (Playwright e CI).`,
    officialRefs: [REF.jestStart, REF.jestEsm, REF.jestMocks, REF.jestSnapshots, REF.vitestGuide, REF.vitestComparisons, REF.vitestMocking, REF.nodeTest, REF2.supertest, REF2.express, REF2.cypressDocs, REF2.cypressRetry, REF2.cypressBest, REF2.cypressNetwork, REF3.pwIntro, REF3.pwBest, REF3.pwLocators, REF3.pwWait, REF3.pwTrace, REF3.pwCi, REF3.pwShard, REF3.ghActions, REF3.ghHardening, REF3.actionlint],
    practice: ['Escreva testes com test.each e snapshot inline no Jest e rode com cobertura v8.', 'Porte os testes para o Vitest e compare os tempos.', 'Teste uma API Express 5 com Supertest cobrindo 201, 400, 404, 413 e 422.', 'Escreva 5 testes E2E no Playwright sem nenhum sleep, com um page.route.', 'Reproduza o erro do should("match") no Cypress e corrija.', 'Meça workers e shards do Playwright na sua máquina.', 'Escreva um workflow com matriz e shards e valide com o actionlint.', 'Faça o projeto integrador: testes de API e E2E.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
