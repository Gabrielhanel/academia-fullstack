// Curso C2.6 da C2: Testes de frontend (disciplina: fe-test).
import { makeCourse } from '../courses/_lib.mjs';
import { REF, lessonsA } from './c26-a.mjs';
import { REF2, lessonsB } from './c26-b.mjs';
import { REF3, lessonsC } from './c26-c.mjs';
import { exsetsA } from './c26-ex-a.mjs';
import { exsetsB, assessment, project } from './c26-ex-b.mjs';

const R = String.raw;
const dolar = (v) => (typeof v === 'string' ? v.replace(/DOLAR\{/g, '${') : Array.isArray(v) ? v.map(dolar) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dolar(x)])) : v);
const lessons = dolar([...lessonsA, ...lessonsB, ...lessonsC]);
const ex = dolar({ ...exsetsA, ...exsetsB });

export const TOPICS = ['Por que e o que testar', 'Testing Library', 'Vitest e Jest com componentes', 'Mock de rede com MSW', 'Testes visuais', 'Estratégia de testes no frontend'];
export const COVER = {
  'Por que e o que testar': ['tfe-01'],
  'Testing Library': ['tfe-03', 'tfe-04', 'tfe-05'],
  'Vitest e Jest com componentes': ['tfe-02', 'tfe-05'],
  'Mock de rede com MSW': ['tfe-06'],
  'Testes visuais': ['tfe-07'],
  'Estratégia de testes no frontend': ['tfe-08']
};

const glossary = lessons.flatMap((l) => l.concepts).concat([
  { term: 'Dublê de teste', def: 'Objeto que substitui uma dependência real em um teste (espião, mock, stub, fake).' },
  { term: 'Stub', def: 'Dublê que devolve respostas fixas programadas.' },
  { term: 'Fixture', def: 'Dados ou estado de preparação reutilizados por vários testes.' },
  { term: 'Snapshot', def: 'Registro da saída de um componente comparado com uma versão aprovada; útil em pouca quantidade e frágil em excesso.' },
  { term: 'Falso positivo', def: 'Teste que falha sem defeito real.' }
]).filter((g, i, a) => a.findIndex((x) => x.term === g.term) === i);

const course = {
  id: 'testes-frontend', disciplineId: 'fe-test', areaId: 'front', requires: ['javascript-fundamentos', 'typescript-fundamentos', 'html-css-a11y'],
  title: 'Testes de frontend: Vitest, Testing Library, MSW, testes visuais e estratégia',
  description: 'Como testar interfaces com confiança e a um custo razoável: por que e o que testar (custo, risco, troféu de testes, comportamento versus implementação); Vitest e Jest (ambiente jsdom, dublês, temporizadores falsos, cobertura); Testing Library (consultas por papel e nome acessível, jest-dom, acessibilidade com axe, user-event, assincronia com findBy e waitFor, formulários, teclado, provedores, hooks e roteamento); simulação da rede com MSW (handlers, cenários de erro, contrato); testes visuais e E2E (regressão visual, histórias com interação, Playwright); e a estratégia (níveis, CI, testes instáveis e cobertura útil). Os exemplos foram executados com Vitest 5.1, jsdom, Testing Library, user-event, MSW 3, jest-axe e pixelmatch (15 testes), e os desafios do laboratório verificam a lógica pura (priorização por risco, espião e relógio falso, consulta por papel, espera por condição, histórico em memória, servidor simulado, comparação de capturas e classificação de testes instáveis).',
  objectives: ['Decidir o que testar, em que nível e a que custo, e distinguir comportamento de implementação', 'Configurar o Vitest com jsdom e usar dublês e temporizadores falsos com critério', 'Escrever testes de componentes por papel, rótulo e teclado, com user-event e esperas por condição', 'Testar componentes com provedores, hooks e rotas e isolar o estado entre testes', 'Simular a rede com MSW, incluindo cenários de erro, lentidão e contrato', 'Proteger a aparência e os fluxos críticos com testes visuais e E2E e desenhar a estratégia e o pipeline'],
  level: 'A', prereqs: ['React essencial (curso C2.1) e, de preferência, estado de servidor (C2.4)', 'HTML, CSS e acessibilidade (Onda 1)', 'Recomendado: Next.js (curso C2.5) e ferramentas (C1.3: depuração e ESLint)', 'Node.js 22 ou superior para executar os exemplos'], hours: 24,
  syllabus: 'Custo e risco dos testes, pirâmide e troféu; Vitest e Jest (jsdom, setup, dublês, temporizadores falsos, cobertura); Testing Library (consultas, jest-dom, axe, user-event, assincronia, formulários, teclado, provedores, renderHook, roteamento); MSW; testes visuais, Storybook e E2E com Playwright; estratégia, CI, testes instáveis e cobertura.',
  versions: 'Vitest 5.1.1, jsdom 31.0.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @testing-library/user-event 14.6.13, @testing-library/jest-dom 8.0.0, msw 3.0.7, @vitest/coverage-v8 5.1.1, pixelmatch 8.0.0, jest-axe 11.0.0 (axe-core 4.14.1), React 19.3.1, verificados com npm em 2026-11-25 (Node.js 26). Os exemplos de componentes foram executados em jsdom (15 testes, cobertura v8) e a comparação de imagens com pixelmatch em matrizes sintéticas. Não foram executados: Jest, Playwright (E2E e capturas de tela), Storybook, o MSW com Service Worker no navegador, React Router, serviços de revisão visual e a CI; esses pontos seguem a documentação oficial de cada ferramenta e estão marcados nas aulas.',
  skills: ['Estratégia de testes', 'Testes de componentes com Testing Library', 'Dublês e controle do tempo', 'Simulação de rede com MSW', 'Testes de acessibilidade', 'Testes visuais e E2E', 'Integração contínua e testes instáveis', 'Cobertura útil'],
  modules: [
    { id: 'm1', title: 'Base', lessons: ['tfe-01', 'tfe-02'] },
    { id: 'm2', title: 'Testing Library', lessons: ['tfe-03', 'tfe-04', 'tfe-05'] },
    { id: 'm3', title: 'Rede e visual', lessons: ['tfe-06', 'tfe-07'] },
    { id: 'm4', title: 'Estratégia', lessons: ['tfe-08'] }
  ],
  materials: [REF.tlIntro, REF.tlPriority, REF.vitestGuide, REF2.userEvent, REF2.mswIntro, REF3.pwIntro, REF3.testingTrophy].map((r) => ({ ...r })),
  projectIds: ['suite-de-testes-app'],
  supplement: {
    glossary,
    cheatsheet: R`### O que e como testar
Comportamento visível, não implementação · nível mais barato que dá confiança · troféu: estático > integração de componentes > unitário > E2E · prioridade = probabilidade × impacto / custo · preparar, agir, verificar · nomes descrevem comportamento

### Vitest
environment: jsdom · setupFiles (jest-dom, cleanup) · test/describe/beforeEach · test.each · vi.fn / vi.spyOn / vi.mock (só fronteiras) · restaurar dublês · vi.useFakeTimers + advanceTimersByTime + useRealTimers · coverage v8 (ramos) · sem .only commitado

### Testing Library
getBy (existe; lança) · queryBy (ausência; null) · findBy (assíncrono) · ...AllBy · prioridade: getByRole(name) > getByLabelText > getByText > getByTestId · within · screen · jest-dom (toBeInTheDocument, toHaveTextContent, toBeDisabled, toHaveFocus) · jest-axe: regras automáticas, não é tudo

### Interações e assincronia
userEvent.setup() + await click/type/tab/keyboard · fireEvent só para eventos sem equivalente · findBy / waitFor (só asserções) · sem sleep · act automático nas ações; avisos de act = esperar o resultado · testar foco e teclado

### Contexto, hooks, rotas
render com wrapper / render personalizado · QueryClient novo por teste, retry false · store por teste · renderHook + wrapper, act · roteador em memória · mocke fronteiras

### MSW
handlers padrão + server.use por teste · onUnhandledRequest: error · resetHandlers em afterEach · HttpResponse.json / error / status · delay · capturar o corpo enviado · alinhar ao contrato · reuso no navegador/Storybook

### Visual e E2E
jsdom não vê layout/cor · linha de base + captura + limiar + revisão · mesmo ambiente, sem animações, dados fixos, máscaras · histórias com play · Playwright: localizadores por papel, asserções com nova tentativa, isolamento, poucos fluxos críticos

### Estratégia
Plano de testes · CI do mais barato ao mais caro · flaky: medir, quarentena com prazo, corrigir a causa · cobertura de ramos com limiar que impede queda · teste que reproduz cada bug`,
    mistakes: ['Testar estado interno, classes CSS ou posições no DOM.', 'Perseguir 100% de cobertura sem asserções.', 'Mockar o que se testa ou usar dublês em tudo.', 'Esquecer o await em user-event e usar pausas fixas.', 'Usar getByTestId por padrão em vez de getByRole.', 'Compartilhar QueryClient, store ou handlers entre testes.', 'Handlers do MSW divergentes do contrato real.', 'Repetir a CI até ficar verde em vez de corrigir testes instáveis.'],
    prereqMap: R`**Antes deste curso:** React essencial (componentes, estado, efeitos, formulários), HTML/CSS/acessibilidade e JavaScript assíncrono. Recomendado: estado de servidor (C2.4) e Next.js (C2.5).

| Este curso prepara para | Por quê |
|---|---|
| Performance frontend | testes que protegem otimizações e orçamentos |
| Arquitetura frontend | estratégia de testes em monorepos e microfrontends, contratos |
| Fundamentos de testes e ferramentas JS (C5) | teoria geral (TDD, dublês), testes de API e E2E em profundidade |
| CI/CD (C6) | pipelines, paralelismo e relatórios |

Ordem interna: aulas 1 e 2 (base) → 3 a 5 (Testing Library) → 6 e 7 (rede, visual e E2E) → 8 (estratégia).`,
    officialRefs: [REF.tlIntro, REF.tlQueries, REF.tlPriority, REF.tlReact, REF.vitestGuide, REF.vitestMocking, REF.vitestEnv, REF.vitestCoverage, REF.jestDocs, REF.kentDodds, REF.jestAxe, REF.ariaRoles, REF2.userEvent, REF2.asyncMethods, REF2.reactAct, REF2.renderHook, REF2.tlWrapper, REF2.commonMistakes, REF2.mswIntro, REF2.mswNode, REF2.mswBrowser, REF2.mswBest, REF3.pwIntro, REF3.pwSnap, REF3.pwBest, REF3.pwRetries, REF3.pwLocators, REF3.sbTesting, REF3.sbInteraction, REF3.pixelmatch, REF3.ghActions, REF3.fowlerFlaky, REF3.testingTrophy],
    practice: ['Reescreva um teste de implementação como teste de comportamento e compare a fragilidade ao refatorar.', 'Configure o Vitest com jsdom e jest-dom e meça a cobertura de ramos de um componente.', 'Teste um relógio com setInterval usando temporizadores falsos.', 'Teste um formulário com user-event, validação, erro acessível e ordem do foco.', 'Crie um render personalizado com provedores e um QueryClient novo por teste.', 'Configure o MSW com handlers padrão e sobrescritas de 500, 422 e rede.', 'Compare duas capturas com pixelmatch e ajuste o limiar e a proporção.', 'Faça o projeto integrador: a suíte de testes de um app e o relatório de estratégia.']
  }
};

export const COURSE = makeCourse({ course, lessons, exsets: ex, assessment, project });
