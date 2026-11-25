// C2.6 — Testes de frontend. Aulas 1 a 3 (por que e o que testar; Vitest e Jest; Testing Library: consultas e acessibilidade).
const R = String.raw;

export const REF = {
  tlIntro: { title: 'Testing Library — Guiding Principles', url: 'https://testing-library.com/docs/guiding-principles/', kind: 'doc' },
  tlQueries: { title: 'Testing Library — About Queries', url: 'https://testing-library.com/docs/queries/about/', kind: 'doc' },
  tlPriority: { title: 'Testing Library — Which query should I use?', url: 'https://testing-library.com/docs/queries/about/#priority', kind: 'doc' },
  tlReact: { title: 'Testing Library — React Testing Library', url: 'https://testing-library.com/docs/react-testing-library/intro/', kind: 'doc' },
  vitestGuide: { title: 'Vitest — Guia', url: 'https://vitest.dev/guide/', kind: 'doc' },
  vitestMocking: { title: 'Vitest — Mocking', url: 'https://vitest.dev/guide/mocking', kind: 'doc' },
  vitestEnv: { title: 'Vitest — Test environment', url: 'https://vitest.dev/guide/environment', kind: 'doc' },
  vitestCoverage: { title: 'Vitest — Coverage', url: 'https://vitest.dev/guide/coverage', kind: 'doc' },
  jestDocs: { title: 'Jest — Getting Started', url: 'https://jestjs.io/docs/getting-started', kind: 'doc' },
  kentDodds: { title: 'Kent C. Dodds — Write tests. Not too many. Mostly integration.', url: 'https://kentcdodds.com/blog/write-tests', kind: 'doc' },
  jestAxe: { title: 'jest-axe (GitHub)', url: 'https://github.com/nickcolley/jest-axe', kind: 'doc' },
  ariaRoles: { title: 'MDN — ARIA: roles', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'tfe-01', moduleId: 'm1', order: 1, minutes: 60, tags: ['estratégia', 'pirâmide', 'troféu de testes', 'comportamento', 'risco', 'custo'],
  title: 'Por que e o que testar: custo, risco, troféu de testes e comportamento versus implementação',
  objectives: ['Explicar o que um teste de frontend protege e o que ele custa (escrita, manutenção, lentidão, falsos alarmes)', 'Comparar a pirâmide e o troféu de testes e escolher o nível adequado para cada tipo de código', 'Distinguir testar comportamento de testar implementação e reconhecer testes frágeis', 'Priorizar o que testar por risco, impacto e custo', 'Escrever um teste no padrão preparar, agir, verificar com nome que descreve o comportamento'],
  intro: `Testes são **uma forma de comprar confiança**: confiança para refatorar, atualizar bibliotecas e publicar sexta-feira. Mas também têm **custo**: tempo para escrever, tempo para manter, tempo de execução e a irritação dos **falsos alarmes** (o teste quebra, o programa está certo). A pergunta útil, portanto, não é "quanto testar?" e sim **"qual teste me dá mais confiança pelo menor custo?"**. Esta aula constrói o raciocínio (risco, nível e comportamento) usado no resto do curso. Os exemplos de testes foram executados com Vitest 5.1, Testing Library e jsdom no laboratório; a **fronteira com a C5** (teoria geral de testes, TDD, dublês, testes de API e E2E em profundidade) é respeitada: aqui o foco é a **interface**.`,
  theory: `### O que um teste de frontend protege
Uma tela é uma promessa: "se a pessoa fizer X, verá Y". Um bom teste **falha quando a promessa quebra** e **passa quando o código muda sem quebrar a promessa**. Isso define a qualidade de um teste: sensibilidade a **defeitos reais** e **indiferença** a mudanças internas.

### O custo dos testes
- **Escrita** e **manutenção** (cada mudança de código pode exigir ajuste de testes);
- **Tempo de execução** (testes lentos deixam de ser rodados);
- **Falsos negativos** (o teste passa e há bug): dão falsa segurança;
- **Falsos positivos** (o teste quebra sem bug): corroem a confiança; a equipe passa a ignorar ou apagar testes;
- **Instabilidade (flakiness)**: testes que ora passam, ora falham sem mudança de código (aula 8).
Por isso testes **demais**, **acoplados à implementação** ou **instáveis** são pior que poucos testes bons.

### Níveis de teste
- **Unitário**: uma função ou módulo isolado (formatadores, validadores, reducers, seletores). Rápido, barato, ótimo para **lógica pura**;
- **Componente / integração de UI**: um componente (ou um fluxo curto) renderizado em jsdom, interagido como a pessoa faz (Testing Library). É o nível central do frontend;
- **Integração com rede simulada**: componentes + busca de dados, com a rede simulada por MSW (aula 6);
- **E2E (ponta a ponta)**: navegador real, backend real ou de teste, fluxos críticos (cadastro, compra). Alta confiança, **lento e caro**; poucos;
- **Estático**: TypeScript, ESLint e a verificação de acessibilidade pegam muitos defeitos **sem rodar** o programa e são o nível mais barato.

### Pirâmide x troféu
A **pirâmide** clássica recomenda muitos unitários, alguns de integração e poucos E2E. O **troféu de testes** (popularizado por Kent C. Dodds) ajusta para o frontend: **base estática** (tipos e lint), **muitos testes de integração de componentes** (o ponto ideal entre confiança e custo), **alguns unitários** para lógica pura e **poucos E2E** para os fluxos críticos. A mensagem: "escreva testes, **não demais**, **principalmente de integração**". O formato ideal depende do produto: um app cheio de regras de negócio tem mais unitários; um app de formulários tem mais integração de componentes.

### Comportamento, não implementação
Um teste de **comportamento** verifica o que a pessoa **vê e faz**: "ao clicar em Incrementar, a contagem mostra 1". Um teste de **implementação** verifica detalhes internos: "o estado §n§ vale 1", "a função §setN§ foi chamada", "o componente filho recebeu a prop X", "a classe CSS é §btn-primary§". Os testes de implementação **quebram em refatorações que preservam o comportamento** (trocar §useState§ por §useReducer§, renomear uma função, reorganizar componentes) e **passam quando há bug visível** (o estado muda, mas a interface não atualiza). A Testing Library foi desenhada em torno do princípio: **"quanto mais seus testes se parecem com a forma como seu software é usado, mais confiança eles podem dar"**.
Sinais de um teste frágil: usa §.state()§ ou instâncias internas, busca elementos por classe CSS ou por posição (§container.children[2]§), verifica chamadas de funções internas em vez de efeitos visíveis, mocka tudo, repete a implementação (o teste calcula com a mesma fórmula do código).

### O que testar (e o que não)
Teste: regras de negócio, validações, fluxos críticos (cadastro, login, compra), estados de erro e carregamento, **acessibilidade básica** (papéis, rótulos, teclado), integração com a rede (contratos), casos de borda (lista vazia, texto longo). **Não** teste: a biblioteca (React já tem testes), detalhes visuais triviais (use revisão e testes visuais em pontos-chave), código sem lógica (um componente que só repassa props), valores constantes.

### Priorizar por risco
Para cada funcionalidade, estime **probabilidade de falha**, **impacto** (dinheiro, segurança, reputação) e **custo do teste**. Priorize **alto risco × baixo custo**. Pagamento e login merecem teste mesmo que caros; um rótulo decorativo, não. O desafio de código da aula implementa esse cálculo.

### Estrutura de um teste: preparar, agir, verificar
§§§
test('mostra o erro quando o e-mail é inválido', async () => {
  // preparar
  render(<Cadastro onEnviar={onEnviar} />);
  // agir
  await user.type(screen.getByLabelText('E-mail'), 'invalido');
  await user.click(screen.getByRole('button', { name: 'Enviar' }));
  // verificar
  expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido');
});
§§§
**Nomes** descrevem o comportamento e a condição ("mostra o erro quando o e-mail é inválido"), não o método. Um teste verifica **uma ideia**; vários §expect§ da mesma ideia são aceitáveis. Evite lógica no teste (§if§, laços): se for preciso, o teste precisa de teste.

### O que foi medido
No laboratório (Vitest 5.1.1, jsdom, Testing Library, 11 testes), todos passaram e a cobertura v8 dos componentes foi de **100%**. Cobertura alta **não** prova qualidade: significa que as linhas **executaram**, não que foram **verificadas** (aula 8).

### Quando escrever os testes
**Depois** do código para explorar, ou **antes** (TDD, C5) quando o requisito é claro. Ao corrigir um bug, escreva **primeiro** o teste que o reproduz: ele falha, a correção o faz passar e o bug não volta. Teste **o contrato** (entradas e saídas visíveis) e **refatore sem medo**.`,
  concepts: [
    { term: 'Teste de componente', def: 'Teste que renderiza um componente e interage com ele como a pessoa usuária, verificando o resultado visível.' },
    { term: 'Pirâmide de testes', def: 'Modelo com muitos testes unitários, alguns de integração e poucos de ponta a ponta.' },
    { term: 'Troféu de testes', def: 'Modelo para frontend que valoriza a análise estática e os testes de integração de componentes.' },
    { term: 'Teste frágil', def: 'Teste que quebra com refatorações que não mudam o comportamento.' },
    { term: 'Falso positivo', def: 'Teste que falha sem existir defeito no programa.' },
    { term: 'Falso negativo', def: 'Teste que passa embora exista defeito.' },
    { term: 'Flakiness', def: 'Instabilidade de um teste que passa e falha sem mudança de código.' },
    { term: 'Preparar, agir, verificar', def: 'Estrutura de um teste: montar o cenário, executar a ação e conferir o resultado.' },
    { term: 'Análise estática', def: 'Verificação do código sem executá-lo (tipos, lint).' }
  ],
  examples: R`**Analogia:** testes são **seguro e alarme** da casa. Um alarme que dispara toda vez que o vento balança a cortina (teste frágil) é desligado pelos moradores; um que só toca com a porta forçada (teste de comportamento) é respeitado. E ninguém instala câmera em cada gaveta: o investimento vai para a porta e as janelas (risco alto).

**Medido (Vitest 5.1.1, jsdom, Testing Library):**
§§§
3 arquivos, 11 testes: todos passaram
cobertura v8 dos componentes: statements 100%, branches 100%, functions 100%
userEvent.click -> "Contagem: 1" | fireEvent.click -> "Contagem: 2"
§§§

**Teste de implementação x de comportamento (mesma funcionalidade):**
§§§
frágil:     expect(wrapper.state('n')).toBe(1)              // quebra se o estado virar useReducer
comportamento: expect(screen.getByText('Contagem: 1')).toBeInTheDocument()   // só quebra se a promessa quebrar
§§§

**Cenário ilustrativo (não medido):** uma equipe tinha 90% de cobertura e medo de refatorar: os testes verificavam nomes de funções e o estado interno e quebravam a cada mudança. Reescrever os mais importantes para o nível do comportamento (clicar, digitar, ver) reduziu os alarmes falsos e a equipe voltou a refatorar com confiança.`,
  code: [
    { title: 'Um teste de comportamento no padrão preparar, agir, verificar (executado)', lang: 'jsx', code: R`import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Contador } from './Contador.jsx';

test('incrementa a contagem ao clicar no botão', async () => {
  const user = userEvent.setup();
  render(<Contador />);                                              // preparar
  await user.click(screen.getByRole('button', { name: 'Incrementar' })); // agir
  expect(screen.getByText('Contagem: 1')).toBeInTheDocument();      // verificar
});`, notes: [{ l: '5', t: 'O nome descreve a condição e o resultado visível.' }, { l: '8', t: 'O botão é encontrado pelo papel e pelo nome acessível, como a pessoa o percebe.' }, { l: '9', t: 'Nenhuma verificação do estado interno.' }] },
    { title: 'Teste de implementação a evitar', lang: 'jsx', code: R`// Ruim: acoplado ao detalhe interno e à estrutura do DOM
test('estado n vale 1', () => {
  const { container } = render(<Contador />);
  container.querySelector('.btn-primary').click();      // classe CSS: detalhe visual
  expect(container.children[0].children[0].textContent).toBe('Contagem: 1');   // posição no DOM
});`, notes: [{ l: '4', t: 'A classe pode mudar sem mudar o comportamento.' }, { l: '5', t: 'A posição no DOM quebra com qualquer reorganização do HTML.' }] }
  ],
  bestPractices: ['Teste comportamento visível: o que a pessoa vê e faz.', 'Escolha o nível mais barato que dá confiança suficiente.', 'Priorize por risco, impacto e custo.', 'Dê aos testes nomes que descrevem o comportamento e a condição.', 'Escreva primeiro o teste que reproduz um bug.', 'Use análise estática (tipos e lint) como primeira camada.'],
  mistakes: ['Testar estado interno, nomes de funções ou classes CSS.', 'Perseguir cobertura em vez de confiança.', 'Mockar tudo e testar só os mocks.', 'Muitos E2E lentos e instáveis.', 'Testes com lógica (if, laços) e várias ideias.', 'Ignorar testes que falham de vez em quando.'],
  market: `Saber decidir o que e como testar é o que diferencia quem "escreve testes" de quem entrega confiança. Perguntas sobre testar comportamento versus implementação e sobre o troféu de testes aparecem em quase toda entrevista de frontend de nível pleno e sênior.`,
  summary: `Testes compram confiança e têm custo (escrita, manutenção, lentidão, falsos alarmes). O troféu de testes para frontend valoriza a análise estática e, sobretudo, testes de integração de componentes, com alguns unitários para lógica pura e poucos E2E. Teste o comportamento visível, não a implementação, priorize por risco e custo e use preparar-agir-verificar com nomes descritivos. Cobertura alta não prova qualidade.`,
  refs: [REF.tlIntro, REF.kentDodds, REF.tlReact],
  cards: [
    { q: 'O que torna um teste de frontend bom?', a: 'Falhar quando o comportamento visível quebra e continuar passando em refatorações que não mudam o comportamento.' },
    { q: 'O que é o troféu de testes?', a: 'Modelo que dá peso à análise estática e aos testes de integração de componentes, com alguns unitários e poucos E2E.' },
    { q: 'Exemplos de teste de implementação?', a: 'Verificar estado interno, chamadas de funções internas, classes CSS ou a posição de elementos no DOM.' },
    { q: 'Cobertura de 100% garante qualidade?', a: 'Não: indica que as linhas executaram, não que o comportamento foi verificado.' }
  ]
},
{
  id: 'tfe-02', moduleId: 'm1', order: 2, minutes: 70, tags: ['Vitest', 'Jest', 'jsdom', 'mocks', 'espiões', 'temporizadores falsos', 'cobertura'],
  title: 'Vitest e Jest: configuração, ambiente jsdom, mocks, espiões e temporizadores falsos',
  objectives: ['Configurar o Vitest com ambiente jsdom, arquivo de setup e jest-dom', 'Escrever asserções, agrupar testes e usar ganchos de ciclo de vida (beforeEach, afterEach)', 'Criar espiões e mocks com vi.fn e vi.spyOn e saber o que verificar com eles', 'Controlar o tempo com temporizadores falsos', 'Medir a cobertura com o provedor v8 e interpretá-la; conhecer as diferenças com o Jest'],
  intro: `Um **test runner** encontra os arquivos de teste, executa as funções §test§/§it§, relata o resultado e oferece asserções (§expect§), dublês (§vi.fn§), controle de tempo e cobertura. **Vitest** e **Jest** são os dois mais usados no ecossistema JavaScript; a API é quase a mesma, e esta aula usa o **Vitest 5.1** (medido no laboratório) apontando as diferenças do Jest. Ela cobre a configuração do ambiente **jsdom** (um DOM simulado em Node), os dublês (espiões e mocks) e o controle do tempo, que é o que torna testes de temporizadores **rápidos e determinísticos**.`,
  theory: `### Vitest e Jest
- **Vitest**: roda sobre o Vite (aproveita a mesma configuração e transformação, ESM nativo, TypeScript e JSX sem configuração extra), modo *watch* rápido; API compatível com o Jest (§test§, §expect§, §vi.fn§, §vi.mock§);
- **Jest**: o executor consolidado da era do React, com muito material; usa Babel/ts-jest para transformar, tem suporte a ESM mais trabalhoso; objeto §jest§ no lugar de §vi§;
- **Escolha**: projetos com Vite (ou novos) tendem ao Vitest; bases existentes em Jest continuam válidas; a migração é majoritariamente trocar §jest§ por §vi§ e ajustar a configuração. A documentação oficial de cada um está nas referências.

### Configuração mínima (Vitest)
§§§
// vitest.config.mjs
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/setup.js'] }
});
// src/setup.js
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
afterEach(() => cleanup());
§§§
- §environment: 'jsdom'§: simula o navegador (§document§, §window§, eventos); **não é um navegador real** (sem layout, sem pintura, sem alguns recursos); alternativas: **happy-dom** (mais leve) e o **modo navegador** do Vitest (navegador real);
- §globals: true§: expõe §test§, §expect§, §vi§ sem importar (opcional; importar explicitamente é mais claro);
- §setupFiles§: código executado antes de cada arquivo de teste (matchers do jest-dom, limpeza);
- o §cleanup§ automático da Testing Library só funciona com §globals§ ligado; sem isso, chame-o em §afterEach§.
Rodar: §npx vitest§ (watch) ou §npx vitest run§ (uma vez, para a CI). Medido: 3 arquivos, 11 testes, **todos passaram**.

### Anatomia
§§§
describe('Cadastro', () => {
  beforeEach(() => { /* cria o que todo teste precisa */ });
  test('...', () => {});
  test.each([[1, 2], [2, 3]])('soma 1 a %i', (a, b) => expect(a + 1).toBe(b));
});
§§§
- **§describe§** agrupa; **§beforeEach§/§afterEach§** garantem que **cada teste começa limpo** (nada de estado compartilhado entre testes); **§test.each§** testa tabelas de casos; §test.skip§/§test.only§ (nunca commite um §.only§);
- **asserções**: §toBe§ (identidade, §Object.is§), §toEqual§ (estrutura), §toBeInTheDocument§, §toHaveTextContent§, §toBeDisabled§ (do jest-dom), §toThrow§, §resolves§/§rejects§;
- cada teste deve **funcionar sozinho e em qualquer ordem**.

### Dublês: espiões e mocks
- **§vi.fn()§**: função falsa que **registra chamadas** (§mock.calls§), pode ter retorno programado (§mockReturnValue§, §mockResolvedValue§) e implementação (§mockImplementation§);
- **§vi.spyOn(objeto, 'metodo')§**: envolve um método real, registrando as chamadas, e pode ser restaurado (§mockRestore§);
- **§vi.mock('./modulo')§**: substitui um módulo inteiro;
- Medido: com §onEnviar = vi.fn().mockResolvedValue()§, o formulário com e-mail inválido deixou §onEnviar§ com **0 chamadas** e, com e-mail válido, **1 chamada** com §{"nome":"Ana","email":"ana@x.com"}§.
**Regras de uso:** use dublês para **fronteiras** (rede, relógio, aleatoriedade, funções recebidas por props como §onEnviar§); **não** mocke o que você está testando nem detalhes internos; verifique **efeitos visíveis** primeiro e chamadas só para callbacks que são parte do contrato; restaure os dublês (§vi.restoreAllMocks()§ em §afterEach§ ou a opção §restoreMocks§).

### Temporizadores falsos
§vi.useFakeTimers()§ substitui §setTimeout§, §setInterval§ e §Date§ por versões controladas; §vi.advanceTimersByTime(ms)§ avança o relógio **instantaneamente**. Medido com um relógio que incrementa a cada segundo (§setInterval§ de 1000 ms): no tempo 0 mostrava §0s§ e, depois de avançar **3000 ms** (em um §act§ assíncrono), mostrava §3s§, sem esperar três segundos reais. Lembre de **voltar** ao tempo real (§vi.useRealTimers()§) e de envolver atualizações de estado em §act§. Com **userEvent**, passe o avanço para a biblioteca (§userEvent.setup({ advanceTimers: vi.advanceTimersByTime })§) quando usar timers falsos.

### Cobertura
§vitest run --coverage§ com o provedor **v8** (pacote §@vitest/coverage-v8§) mostra linhas, ramos, funções e instruções executados. Medido: **100%** de statements, branches, functions e lines nos componentes do laboratório. Como usar: para **achar código nunca exercitado** (casos de erro esquecidos), não como meta de equipe (pessoas passam a escrever testes sem asserções para subir o número). Um teste que executa uma linha sem verificar nada conta como cobertura.

### Diferenças práticas Vitest x Jest
| | Vitest | Jest |
|---|---|---|
| Objeto de dublês | §vi§ | §jest§ |
| Transformação | Vite (esbuild/oxc) | Babel ou ts-jest |
| ESM | nativo | exige configuração |
| Modo observação | muito rápido | bom |
| Ambiente | jsdom, happy-dom, modo navegador | jsdom |
| Ecossistema | crescente, compatível | muito grande |

### Organização
Arquivos de teste ao lado do código (§Componente.test.jsx§) ou em §__tests__§; utilitários de teste compartilhados (§renderComProvedores§, fábricas de dados) em um módulo de suporte; **fábricas** de dados (§criarUsuario({ nome })§) evitam repetição e deixam claro o que importa em cada teste.

### Pegadinhas
Estado compartilhado entre testes; esquecer de restaurar espiões; timers falsos que vazam; assumir que o jsdom mede layout (§getBoundingClientRect§ devolve zeros); importar de caminhos diferentes (duas cópias de um módulo); testes que dependem da ordem de execução.`,
  concepts: [
    { term: 'Test runner', def: 'Ferramenta que encontra, executa e relata os testes (Vitest, Jest).' },
    { term: 'jsdom', def: 'Implementação de DOM em JavaScript para simular o navegador em Node.' },
    { term: 'Setup file', def: 'Arquivo executado antes dos testes para configurar matchers e limpeza.' },
    { term: 'Espião (spy)', def: 'Função que registra as chamadas, podendo envolver uma função real.' },
    { term: 'Mock', def: 'Dublê com comportamento programado que substitui uma dependência.' },
    { term: 'Temporizador falso', def: 'Substituto controlável de setTimeout, setInterval e Date.' },
    { term: 'Cobertura', def: 'Proporção do código executada durante os testes.' },
    { term: 'test.each', def: 'Recurso que executa o mesmo teste para uma tabela de casos.' },
    { term: 'Matcher', def: 'Função de asserção como toBe ou toBeInTheDocument.' }
  ],
  examples: R`**Analogia:** o test runner é o **inspetor de qualidade** da fábrica; o jsdom é a **maquete** do salão onde os produtos são testados (não tem o clima do salão real); o espião é o **gravador** que anota quem ligou; o temporizador falso é o **controle remoto do relógio**: avança uma hora em um segundo.

**Resultados medidos (Vitest 5.1.1, jsdom 31, Testing Library 16.3.3):**
§§§
formulário: e-mail inválido -> onEnviar: 0 chamadas | válido -> 1 chamada {"nome":"Ana","email":"ana@x.com"}
relógio com setInterval de 1000 ms: t=0 -> 0s | advanceTimersByTime(3000) -> 3s (sem esperar)
cobertura v8: statements 100% (38/38), branches 100% (15/15), functions 100% (16/16), lines 100% (10/10)
11 testes em 3 arquivos: todos passaram
§§§
Nota: o Vitest 5.1 avisou que, quando as opções de esbuild e oxc são informadas juntas, as de oxc prevalecem; a configuração de JSX automático funcionou nos testes.

**Cenário ilustrativo (não medido):** uma suíte esperava 2 segundos reais em cada teste de "mensagem some depois de 2 s". Com timers falsos os 40 testes passaram a rodar em milissegundos, e a CI deixou de ter falhas por lentidão.`,
  code: [
    { title: 'Configuração e teste com dublê (executado)', lang: 'jsx', code: R`// vitest.config.mjs
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'jsdom', globals: true, setupFiles: ['./src/setup.js'], coverage: { provider: 'v8' } } });

// Cadastro.test.jsx
test('não envia com e-mail inválido e envia com válido', async () => {
  const user = userEvent.setup();
  const onEnviar = vi.fn().mockResolvedValue();
  render(<Cadastro onEnviar={onEnviar} />);
  await user.type(screen.getByLabelText('E-mail'), 'invalido');
  await user.click(screen.getByRole('button', { name: 'Enviar' }));
  expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido');
  expect(onEnviar).not.toHaveBeenCalled();
});`, notes: [{ l: '2', t: 'jsdom como ambiente e arquivo de setup com os matchers do jest-dom.' }, { l: '8', t: 'onEnviar é uma fronteira (callback recebido por props): um dublê é adequado.' }, { l: '12', t: 'Primeiro o efeito visível; depois o contrato com o callback.' }] },
    { title: 'Temporizadores falsos (executado)', lang: 'jsx', code: R`import { act } from 'react';

test('o relógio avança a cada segundo', async () => {
  vi.useFakeTimers();
  render(<Relogio />);
  expect(screen.getByText('0s')).toBeInTheDocument();
  await act(async () => { vi.advanceTimersByTime(3000); });
  expect(screen.getByText('3s')).toBeInTheDocument();
  vi.useRealTimers();
});`, notes: [{ l: '4', t: 'Troca setInterval, setTimeout e Date por versões controladas.' }, { l: '7', t: 'O avanço do relógio causa atualização de estado: use act.' }, { l: '9', t: 'Restaure o tempo real para não afetar outros testes.' }] }
  ],
  bestPractices: ['Use ambiente jsdom com arquivo de setup e jest-dom.', 'Garanta que cada teste começa limpo e roda em qualquer ordem.', 'Use dublês apenas nas fronteiras e restaure-os.', 'Prefira timers falsos a esperas reais.', 'Use a cobertura para achar lacunas, não como meta.', 'Evite .only e .skip commitados.'],
  mistakes: ['Estado compartilhado entre testes.', 'Mockar o próprio objeto de teste ou detalhes internos.', 'Esquecer de restaurar espiões e timers.', 'Esperar tempo real em testes.', 'Confundir jsdom com navegador (sem layout).', 'Perseguir 100% de cobertura com testes sem asserções.'],
  market: `Vitest e Jest são requisitos de praticamente toda vaga de frontend. Saber configurar o ambiente, usar dublês nas fronteiras e controlar o tempo, e discutir os limites do jsdom e da cobertura, é o conhecimento prático básico de qualquer pessoa que escreve testes de UI.`,
  summary: `Vitest e Jest executam e relatam os testes, com API quase igual (vi no lugar de jest). Configure o ambiente jsdom, o setup com jest-dom e a limpeza. Cada teste deve começar limpo (beforeEach e cleanup). Espiões e mocks (vi.fn, vi.spyOn) servem às fronteiras; verifique primeiro o efeito visível. Temporizadores falsos tornam testes de tempo rápidos (medido: 3000 ms avançados instantaneamente) e a cobertura v8 indica código não exercitado, não qualidade.`,
  refs: [REF.vitestGuide, REF.vitestMocking, REF.vitestEnv, REF.vitestCoverage, REF.jestDocs],
  cards: [
    { q: 'Para que serve o setupFiles?', a: 'Executar antes dos testes a configuração comum, como os matchers do jest-dom e a limpeza da Testing Library.' },
    { q: 'Quando usar um dublê (vi.fn)?', a: 'Nas fronteiras: rede, relógio, aleatoriedade e callbacks recebidos por props; não nos detalhes internos do que se testa.' },
    { q: 'O que fazem os temporizadores falsos?', a: 'Substituem setTimeout, setInterval e Date por versões controladas que podem ser avançadas instantaneamente.' },
    { q: 'A cobertura mede qualidade dos testes?', a: 'Não: mede o código executado, mesmo sem asserções.' }
  ]
},
{
  id: 'tfe-03', moduleId: 'm2', order: 3, minutes: 70, tags: ['Testing Library', 'getByRole', 'consultas', 'acessibilidade', 'jest-dom', 'axe'],
  title: 'Testing Library I: consultas por papel, nome acessível e acessibilidade nos testes',
  objectives: ['Escolher a consulta correta pela ordem de prioridade (getByRole primeiro) e justificá-la', 'Distinguir getBy, queryBy e findBy (e as versões All) e usar cada uma na situação certa', 'Usar o nome acessível (label, aria-label, texto) como forma de encontrar elementos', 'Verificar acessibilidade básica com jest-axe e entender seus limites', 'Reconhecer consultas frágeis (classes, ids, testid) e substituí-las'],
  intro: `A **Testing Library** é uma família de bibliotecas (React, DOM, Vue, Angular...) com uma ideia única: **encontre os elementos como a pessoa os encontra**. Em vez de procurar por classes CSS ou pela posição no DOM, você pergunta "existe um **botão** chamado Enviar?", "há um campo com o **rótulo** E-mail?". Isso torna os testes **robustos a refatorações** e, de quebra, **testa a acessibilidade**: se o teste não encontra o botão pelo papel e nome, a tecnologia assistiva também terá dificuldade. Os resultados abaixo foram medidos no laboratório (Testing Library React 16.3.3 sobre @testing-library/dom 10.4.2).`,
  theory: `### Os três tipos de consulta
- **§getBy…§**: devolve o elemento ou **lança erro** se não houver (ou se houver mais de um). Use para afirmar que **existe** agora. Medido: §getByText('não existe')§ lançou "Unable to find an element with the text: não existe...";
- **§queryBy…§**: devolve o elemento ou **§null§**, sem lançar. Use para afirmar que **não existe** (§expect(queryBy…).not.toBeInTheDocument()§). Medido: §queryByText('não existe')§ devolveu §null§;
- **§findBy…§**: **assíncrona**; espera o elemento aparecer (padrão de 1000 ms) e falha com tempo esgotado. Use para o que **surge depois** (resposta da rede, atualização assíncrona), aula 4;
- as versões **§…AllBy…§** devolvem listas (e exigem ao menos um, exceto §queryAllBy§). Medido: §getAllByRole('button')§ devolveu 1 elemento no contador.

### Prioridade das consultas (da melhor para a pior)
A documentação define uma ordem baseada na **experiência da pessoa**:
1. **Acessíveis a todos**: §getByRole§ (com §name§), §getByLabelText§ (campos de formulário), §getByPlaceholderText§, §getByText§ (conteúdo não interativo), §getByDisplayValue§;
2. **Semânticas**: §getByAltText§ (imagens), §getByTitle§;
3. **Último recurso**: §getByTestId§ (atributo §data-testid§, **invisível** para a pessoa).
Regra: use **§getByRole§** sempre que possível: ele valida **papel e nome acessível** ao mesmo tempo. Exemplo medido: §getByRole('button', { name: 'Incrementar' })§ encontrou o §<button>§ pelo nome calculado do conteúdo. Use §getByLabelText§ para campos (**§<label>§ associado** ao campo), §getByText§ para textos e §getByTestId§ apenas quando nada acessível serve (e considere melhorar o HTML antes).

### Papéis e nome acessível
Papéis implícitos: §<button>§ → §button§; §<a href>§ → §link§; §<input type="checkbox">§ → §checkbox§; §<h1>§…§<h6>§ → §heading§ (§level§); §<ul>§ → §list§ e §<li>§ → §listitem§; §<form>§ → §form§ (com nome); §<nav>§ → §navigation§; §<main>§ → §main§; §<img alt>§ → §img§. O **nome acessível** vem (em ordem simplificada) de §aria-labelledby§, §aria-label§, do §<label>§ associado, do conteúdo de texto (botões, links), do §alt§ ou §title§. Filtros úteis: §{ name }§ (texto ou RegExp), §{ level }§ (heading), §{ checked }§, §{ pressed }§, §{ expanded }§, §{ hidden: true }§ (inclui elementos fora da árvore de acessibilidade). O papel de um §<div onClick>§ é **genérico**: ele não é encontrável por papel de botão, e isso é um **sinal de problema de acessibilidade**, não do teste.

### Elementos "por dentro" e correspondência
Textos são comparados por padrão com **correspondência exata e normalizada** (espaços colapsados). Use RegExp (§/incrementar/i§) para variações; use §within(elemento)§ para restringir a busca a uma região (§within(screen.getByRole('list')).getAllByRole('listitem')§); use §screen§ para consultar o documento todo (preferível a desestruturar o retorno do §render§).

### Asserções do jest-dom
§toBeInTheDocument§, §toBeVisible§, §toBeDisabled§/§toBeEnabled§, §toHaveTextContent§, §toHaveValue§, §toBeChecked§, §toHaveAttribute§, §toHaveAccessibleName§, §toHaveFocus§. Elas dão **mensagens de erro legíveis** e expressam a intenção. Prefira-as a §expect(el.textContent).toBe(...)§.

### Depurando
§screen.debug()§ imprime o DOM; §screen.logTestingPlaygroundURL()§ sugere a melhor consulta; mensagens de erro de §getByRole§ listam os papéis disponíveis e seus nomes acessíveis, o que costuma resolver a dúvida na hora.

### Acessibilidade nos testes
- Consultas por papel e rótulo **já** exercitam a acessibilidade básica;
- **jest-axe** (ou vitest-axe) roda o **axe-core** no HTML renderizado e acusa **violações** automáticas. Medido: o formulário com rótulos → §0§ violações; um §<input>§ **sem rótulo** → violação §label§;
- limites: o axe automático encontra só uma **parte** dos problemas (em geral, os que podem ser decididos por regras: rótulos, contraste calculável, atributos ARIA inválidos); **não** garante usabilidade com leitor de tela nem foco coerente. Complemente com testes de **teclado** (§userEvent.tab()§, aula 4) e verificação manual (C1);
- o jsdom não calcula **contraste** nem layout: verifique cores no navegador (testes visuais, aula 7).

### Consultas frágeis x robustas
| Frágil | Robusta |
|---|---|
| §container.querySelector('.btn-primary')§ | §getByRole('button', { name: 'Salvar' })§ |
| §getByTestId('campo-email')§ | §getByLabelText('E-mail')§ |
| §container.children[2]§ | §getByRole('listitem')§ + §within§ |
| §getByText('Salvar')§ para um botão | §getByRole('button', { name: 'Salvar' })§ |

### Idioma e textos
Os testes que usam texto acoplam-se ao **idioma**. Em apps internacionalizados, consulte por papel e nome, usando um provedor de tradução de teste com mensagens conhecidas, ou use identificadores estáveis das mensagens.`,
  concepts: [
    { term: 'getBy, queryBy, findBy', def: 'Consultas que lançam erro se ausente, devolvem null se ausente e esperam o aparecimento, respectivamente.' },
    { term: 'getByRole', def: 'Consulta que encontra elementos pelo papel ARIA e pelo nome acessível.' },
    { term: 'Nome acessível', def: 'Texto que identifica um elemento para tecnologias assistivas, vindo de rótulo, aria-label ou conteúdo.' },
    { term: 'getByLabelText', def: 'Consulta que encontra campos de formulário pelo texto do rótulo associado.' },
    { term: 'data-testid', def: 'Atributo de teste usado como último recurso para encontrar elementos.' },
    { term: 'within', def: 'Função que restringe as consultas a uma região do DOM.' },
    { term: 'jest-dom', def: 'Conjunto de matchers para o DOM, como toBeInTheDocument e toHaveTextContent.' },
    { term: 'axe-core', def: 'Motor que verifica automaticamente regras de acessibilidade em HTML.' },
    { term: 'screen', def: 'Objeto da Testing Library que consulta o documento inteiro.' }
  ],
  examples: R`**Analogia:** as consultas por papel são **procurar uma pessoa pelo crachá e pela função** ("a pessoa da recepção chamada Ana"), em vez de "a terceira cadeira à esquerda com o casaco azul" (posição, classe). Se o crachá está errado, o problema é do crachá (acessibilidade), não da busca.

**Resultados medidos (Testing Library React 16.3.3, jsdom 31):**
§§§
getByText('não existe')  -> lança: "Unable to find an element with the text: não existe. ..."
queryByText('não existe') -> null
getByRole('button', { name: 'Incrementar' }) -> <BUTTON>
getAllByRole('button') -> 1 elemento
jest-axe: formulário rotulado -> 0 violações | input sem rótulo -> violação "label"
§§§

**Tabela de decisão rápida:**
§§§
afirmar que existe agora         -> getBy / getAllBy
afirmar que NÃO existe           -> queryBy ... not.toBeInTheDocument()
algo que aparece depois          -> await findBy
campo de formulário              -> getByLabelText
botão, link, título, lista       -> getByRole + name
último recurso                   -> getByTestId
§§§

**Cenário ilustrativo (não medido):** uma suíte usava §data-testid§ em todos os elementos. Um redesign trocou botões por §<div onClick>§ estilizados e os testes continuaram passando, mas a tela deixou de ser acessível ao teclado. Migrar as consultas para §getByRole§ fez os testes falharem no ponto certo e levou à correção do HTML.`,
  code: [
    { title: 'Consultas por papel e rótulo, e ausência com queryBy (executado)', lang: 'jsx', code: R`test('formulário acessível', async () => {
  const user = userEvent.setup();
  render(<Cadastro onEnviar={vi.fn()} />);
  const nome = screen.getByLabelText('Nome');
  const email = screen.getByLabelText('E-mail');
  await user.type(nome, 'Ana');
  await user.type(email, 'invalido');
  await user.click(screen.getByRole('button', { name: 'Enviar' }));
  expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido');
  await user.clear(email); await user.type(email, 'ana@x.com');
  await user.click(screen.getByRole('button', { name: 'Enviar' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();     // ausência: queryBy
});`, notes: [{ l: '4', t: 'Rótulo associado: encontra o campo como a pessoa o percebe.' }, { l: '9', t: 'role="alert" é anunciado por leitores de tela e também encontrável.' }, { l: '12', t: 'Para afirmar que não existe, use queryBy e não getBy (medido: devolve null).' }] },
    { title: 'Verificação automática de acessibilidade com jest-axe (executado)', lang: 'jsx', code: R`import { axe } from 'jest-axe';

test('sem violações automáticas de acessibilidade', async () => {
  const { container } = render(<Cadastro onEnviar={() => {}} />);
  const resultado = await axe(container);
  expect(resultado.violations).toHaveLength(0);       // medido: 0
});

test('acusa campo sem rótulo', async () => {
  const { container } = render(<form><input name="x" /></form>);
  const r = await axe(container);
  expect(r.violations.map((v) => v.id)).toContain('label');   // medido: "label"
});`, notes: [{ l: '6', t: 'Medido: formulário rotulado sem violações.' }, { l: '13', t: 'O axe encontra só o que pode ser decidido por regras; não substitui teste de teclado e leitor de tela.' }] }
  ],
  bestPractices: ['Prefira getByRole com name; use getByLabelText para campos.', 'Use queryBy para afirmar ausência e findBy para o que aparece depois.', 'Deixe getByTestId como último recurso e melhore o HTML antes.', 'Use os matchers do jest-dom.', 'Rode jest-axe nos componentes principais e complemente com teste de teclado.', 'Use within para regiões e screen para o documento.'],
  mistakes: ['Usar querySelector, classes ou posições.', 'Usar getBy para provar que algo não existe.', 'Usar getByText para botões em vez de getByRole.', 'Espalhar data-testid por todo lado.', 'Achar que jest-axe garante acessibilidade total.', 'Testar clicando em div sem papel e achar normal.'],
  market: `Testing Library é o padrão de fato para testes de componentes. Quem domina a ordem de prioridade das consultas escreve testes robustos e, de quebra, melhora a acessibilidade: duas competências muito valorizadas e que aparecem em entrevistas técnicas de frontend.`,
  summary: `A Testing Library encontra elementos como a pessoa os percebe. getBy lança se ausente, queryBy devolve null (para ausência) e findBy espera. Prefira getByRole com nome acessível, depois getByLabelText e getByText, deixando getByTestId como último recurso. Os matchers do jest-dom dão mensagens claras. jest-axe verifica regras automáticas (medido: 0 violações no formulário rotulado, violação label sem rótulo), mas não substitui teclado e leitor de tela.`,
  refs: [REF.tlQueries, REF.tlPriority, REF.tlReact, REF.jestAxe, REF.ariaRoles],
  cards: [
    { q: 'Qual consulta usar para afirmar que um elemento não existe?', a: 'queryBy (devolve null), com not.toBeInTheDocument().' },
    { q: 'Por que getByRole é a consulta preferida?', a: 'Valida o papel e o nome acessível ao mesmo tempo, refletindo como a pessoa e as tecnologias assistivas percebem o elemento.' },
    { q: 'Quando usar getByTestId?', a: 'Como último recurso, quando nenhuma consulta acessível serve; antes, considere melhorar o HTML.' },
    { q: 'O que o jest-axe não garante?', a: 'Usabilidade com leitor de tela, ordem de foco coerente e contraste real; verifica só regras automáticas.' }
  ]
}
];
