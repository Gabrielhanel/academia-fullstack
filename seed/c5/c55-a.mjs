// C5.5 — Ferramentas de teste para JavaScript. Aulas 1 e 2 (Jest; Vitest).
const R = String.raw;

export const REF = {
  jestStart: { title: 'Jest — Getting Started', url: 'https://jestjs.io/docs/getting-started', kind: 'doc' },
  jestEsm: { title: 'Jest — ECMAScript Modules', url: 'https://jestjs.io/docs/ecmascript-modules', kind: 'doc' },
  jestMocks: { title: 'Jest — Mock Functions', url: 'https://jestjs.io/docs/mock-functions', kind: 'doc' },
  jestSnapshots: { title: 'Jest — Snapshot Testing', url: 'https://jestjs.io/docs/snapshot-testing', kind: 'doc' },
  vitestGuide: { title: 'Vitest — Guide', url: 'https://vitest.dev/guide/', kind: 'doc' },
  vitestComparisons: { title: 'Vitest — Comparisons with other test runners', url: 'https://vitest.dev/guide/comparisons', kind: 'doc' },
  vitestMocking: { title: 'Vitest — Mocking', url: 'https://vitest.dev/guide/mocking', kind: 'doc' },
  nodeTest: { title: 'Node.js — Test runner', url: 'https://nodejs.org/api/test.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'ftj-01', moduleId: 'm1', order: 1, minutes: 75, tags: ['Jest', 'matchers', 'mocks', 'snapshots', 'fake timers', 'cobertura'],
  title: 'Jest: runner, matchers, mocks, snapshots, timers falsos e cobertura em projetos ESM',
  objectives: ['Configurar o Jest 30 para ESM nativo e cobertura v8', 'Escrever testes com describe, test, test.each e os matchers mais usados', 'Usar jest.fn, jest.spyOn e timers falsos e entender o que cada um restaura', 'Usar snapshots com critério (inline) e saber seus riscos', 'Interpretar a cobertura e a saída do runner', 'Comparar o Jest com o node:test em recursos e custo de inicialização'],
  intro: R`O **Jest** (Meta, hoje na OpenJS Foundation) é o **runner mais difundido** do ecossistema JavaScript: traz **descoberta de testes, execução em paralelo, asserções (§expect§), mocks, snapshots, timers falsos e cobertura** em um pacote só. No laboratório (**Jest 30.5.2** em Node 26.13.1, **ESM nativo**), **13 testes** passaram (**§Time: 0.659 s§** do próprio Jest; **1,54 s** de parede, **mediana de 5 execuções**), com **1 snapshot inline** e cobertura v8 de **100% das linhas** (91,3% dos ramos) do domínio e do serviço.`,
  theory: R`### O que o Jest oferece
- **Runner** com **workers em paralelo** (um processo por arquivo de teste, por padrão), **isolamento** por arquivo (módulos recarregados), **filtros** (§-t§, §--onlyChanged§), **modo watch**;
- **Asserções** (§expect(...).toBe/toEqual/toMatchObject/toThrow/resolves/rejects§);
- **Mocks** (§jest.fn§, §jest.spyOn§, §jest.mock§), **timers falsos** (§jest.useFakeTimers§), **snapshots**;
- **Cobertura** (§--coverage§, provedor **v8** ou **Babel/istanbul**), **relatores** (texto, lcov, JUnit via pacote);
- **Ecossistema** enorme (Testing Library, jest-extended), documentação e respostas.
**Contra:** **transformações** (Babel/ts-jest/SWC) para TypeScript e JSX **custam**; **suporte a ESM** ainda exige **flag experimental**; **inicialização** mais lenta que a de runners nativos (**medido** abaixo).

### Configuração para ESM nativo
No laboratório (§jest.config.mjs§): §transform: {}§ (**sem Babel**: o Node entende ESM), §coverageProvider: 'v8'§, §testMatch§ e §collectCoverageFrom§. **Execução:** §NODE_OPTIONS=--experimental-vm-modules npx jest§ (o Jest 30 usa o **VM Modules** do Node: o Node avisa **"VM Modules is an experimental feature"**). **Detalhes de ESM:** o objeto global §jest§ **não existe**: importe §import { jest, describe, test, expect } from '@jest/globals'§; §jest.mock§ de módulos ESM exige §jest.unstable_mockModule§ + importação dinâmica (**por isso** o laboratório injeta dependências **em vez de mockar módulos**: pat-04). **TypeScript:** §ts-jest§, §@swc/jest§ ou Babel; muitos projetos **migram para Vitest** justamente aqui (aula ftj-02).

### Escrevendo testes
- **Estrutura:** §describe§ agrupa; §test§/§it§ define; §beforeEach§/§afterEach§ preparam e limpam;
- **Tabelas:** §test.each([...])('%s', (...) => {...})§ com placeholders (§%s§, §%#§ = índice): o laboratório testou **3 totais** e **3 erros** com **uma** definição cada;
- **Matchers principais:** §toBe§ (**Object.is**, primitivos), §toEqual§ (**igualdade profunda**, ignora §undefined§), §toStrictEqual§ (mais rígido), §toMatchObject§ (**subconjunto**: **ignora campos extras**), §toHaveLength§, §toContain§, §toThrow(/regex/)§, §resolves§/§rejects§ para promessas, §toBeCloseTo§ para floats;
- **Assíncrono:** retorne a promessa ou use §async/await§; **sempre** §await expect(...).rejects§ (**sem await o teste passa sem verificar**: **erro clássico**).

### Mocks e espiões
- **§jest.fn(impl?)§**: função instrumentada: §toHaveBeenCalled()§, §toHaveBeenCalledTimes(n)§, §toHaveBeenCalledWith(...)§, §toHaveBeenLastCalledWith(...)§, §mockReturnValue§, §mockResolvedValue§, §mockImplementation§; **§mock.calls§** dá os argumentos;
- **§jest.spyOn(obj, 'metodo')§**: **observa** (e opcionalmente **substitui**) um método existente; **§mockRestore()§** devolve o original: **medido:** com §mockReturnValue('falso')§ o método devolveu **falso**; após §mockRestore()§ voltou a **real**;
- **Reinicialização:** §clearMocks§ (limpa **chamadas**), §resetMocks§ (limpa e **remove implementações**), §restoreMocks§ (restaura §spyOn§) na **configuração**: **escolha uma política** para **evitar vazamento** entre testes (o laboratório **recria** os mocks em §beforeEach§);
- **Medido (serviço de pedidos):** com cupom §BEMVINDO10§ o serviço **cobrou 18** (§toHaveBeenCalledWith({ pedidoId: 7, valor: 18 })§), **notificou 1 vez** (§toHaveBeenLastCalledWith('ana', 'Pedido 7 pago: R$ 18.00')§); com **cupom expirado** a promessa **rejeitou** e §salvar§/§cobrar§ **não foram chamados** (§not.toHaveBeenCalled()§).
- **Aviso** (tst-04): **estado > interação**; **não mocke o que não possui**.

### Timers falsos
§jest.useFakeTimers()§ substitui §setTimeout§, §setInterval§, §Date§ etc.; §jest.advanceTimersByTime(ms)§ avança; §jest.runAllTimers()§ esgota. **Medido:** um timer de **60 s** disparou só após §advanceTimersByTime(59999)§ + §advanceTimersByTime(1)§: **zero espera real**. **Sempre** §jest.useRealTimers()§ em §afterEach§. **Cuidado** com **promessas** e timers falsos (§advanceTimersByTimeAsync§ para **fluxos assíncronos**).

### Snapshots
**Snapshot** grava a **saída** (estrutura de dados, JSX serializado) e **compara** nas execuções seguintes. **Inline** (§toMatchInlineSnapshot§, **no próprio arquivo**) e **em arquivo** (§__snapshots__§). **Medido:** o objeto do cupom (§{ "desconto": 0.2, "valido": true }§) foi **gravado** e **conferido** (**1 snapshot passou**). **Quando ajuda:** **saídas grandes e estáveis** (relatórios, mensagens de erro, serialização). **Riscos:** **aprovar sem ler** (atualizar com §-u§ **por reflexo**), **snapshots enormes** (ninguém revisa), **testes frágeis** (ruído como datas e ids), **não dizem a intenção**. **Regras:** **pequenos**, **determinísticos** (relógio e ids fixos), **revisados em PR**; prefira **asserções explícitas** para **regras de negócio**.

### Cobertura
§--coverage§ (**v8** ou **istanbul**) mede **linhas, ramos, funções, instruções**. **Medido:** **100% das linhas e instruções**, **91,3% dos ramos** (21/23), **100% das funções** em §dominio.mjs§ e §servico.mjs§. **Como no tst-06:** **cobertura ≠ qualidade** (**mutação** pergunta se os testes verificam); use **limiares por pasta** (§coverageThreshold§) como **alarme** (código **novo**), não meta global.

### Velocidade e custo
**Medido** (binário direto, **mediana de 5 execuções**, suítes **minúsculas**): **Jest 1,54 s** (13 testes), **node:test 0,38 s** (12 testes de domínio). A diferença vem da **inicialização** (carregar o framework, criar contexto VM por arquivo): **em suítes grandes**, **paralelismo e cache de transformação** pesam mais. **Dicas:** **§--shard§** para **dividir** em CI, **§--maxWorkers§**, **evite** transformações **desnecessárias**, **isolamento** só quando preciso.

### Jest x node:test (para um projeto Node puro)
| Critério | Jest | node:test |
|---|---|---|
| Instalação | dependência | **embutido** |
| ESM | **flag experimental** | nativo |
| Mocks, timers, snapshots, cobertura | **completos** | **mock.fn/timers/snapshot/coverage embutidos** (menos recursos) |
| Ecossistema (Testing Library, matchers extras) | **enorme** | menor |
| Inicialização (medida) | 1,54 s | **0,38 s** |
Em **front-ends React/Vue** o Jest (ou o Vitest) com **jsdom** segue **o padrão**; em **bibliotecas e serviços Node** o **node:test** **basta** muitas vezes.

### Boas práticas
1. **Um comportamento por teste**; **nomes** que **descrevem** o comportamento;
2. **Política única** de reset de mocks; **timers reais** de volta;
3. **Sempre** §await§ em §resolves§/§rejects§; §expect.assertions(n)§ para **garantir** que o ramo **assíncrono** foi **verificado**;
4. **Snapshots pequenos** e **revisados**;
5. **Relógio e ids injetados** (determinismo);
6. **Cobertura como alarme**; **mutação** nos módulos críticos;
7. **CI:** §--ci§ (**não** grava snapshots novos), **JUnit**/artefatos (aula ftj-06).`,
  concepts: [
    { term: 'Jest', def: 'Framework de testes JavaScript com runner paralelo, asserções, mocks, snapshots, timers falsos e cobertura.' },
    { term: 'Matcher', def: 'Função de asserção do expect (toBe, toEqual, toThrow) que compara o valor recebido com o esperado.' },
    { term: 'Snapshot', def: 'Registro da saída de um código usado para detectar mudanças em execuções futuras.' },
    { term: 'Timer falso', def: 'Substituição de setTimeout e Date por versões controláveis pelo teste.' },
    { term: 'Spy', def: 'Função que observa chamadas a um método existente, podendo ou não substituir seu comportamento.' },
    { term: 'Provedor de cobertura v8', def: 'Mecanismo de cobertura nativo do motor V8, sem instrumentação por transformação do código.' },
    { term: 'VM Modules', def: 'Recurso experimental do Node que permite ao Jest carregar ESM nativo em contextos isolados.' }
  ],
  examples: R`**Analogia:** o Jest é uma **caixa de ferramentas completa** (chaves, trena, nível): resolve quase tudo, mas é **pesada de carregar** até para pendurar um quadro; o node:test é a **chave de fenda no bolso**: menos recursos, **pronta na hora**.

**Exemplo 1: test.each.** Três totais e três erros, uma definição para cada grupo.

**Exemplo 2: spyOn.** Substituir um método devolve "falso"; mockRestore() devolve "real".

**Exemplo 3: timers falsos.** Um timeout de 60 s dispara com 59999 + 1 ms simulados, sem esperar.`,
  code: [
    { title: 'Configuração e execução do Jest 30 com ESM nativo (JavaScript e shell; resultado medido: 13 testes)', lang: 'js', code: R`// jest.config.mjs
export default {
  testMatch: ['<rootDir>/jest/**/*.test.mjs'],
  transform: {},                       // ESM nativo: sem Babel
  coverageProvider: 'v8',
  collectCoverageFrom: ['src/dominio.mjs', 'src/servico.mjs'],
  coverageReporters: ['text-summary', 'text']
};

// shell
// NODE_OPTIONS=--experimental-vm-modules npx jest --coverage
// Tests: 13 passed, 13 total | Snapshots: 1 passed | Time: 0.659 s
// Cobertura: 100% linhas, 91,3% ramos`, notes: [{ l: '4', t: 'transform vazio desliga o Babel: o Node carrega o ESM.' }, { l: '12', t: 'A flag experimental é necessária para ESM no Jest.' }] },
    { title: 'test.each, matchers e snapshot inline (JavaScript, Jest; testado)', lang: 'js', code: R`import { describe, test, expect } from '@jest/globals';
import { calcularTotal, validarCupom } from '../src/dominio.mjs';

describe('calcularTotal', () => {
  test.each([
    ['sem desconto', [{ sku: 'A', preco: 10, qtd: 3 }], {}, 30],
    ['desconto acima de 100% é limitado', [{ sku: 'A', preco: 10, qtd: 1 }], { desconto: 5 }, 0]
  ])('%s', (_nome, itens, opcoes, esperado) => { expect(calcularTotal(itens, opcoes)).toBe(esperado); });

  test.each([[[], /pedido sem itens/], [[{ sku: 'Y', preco: 1, qtd: 1.5 }], /quantidade inválida: Y/]])('erro %#', (itens, msg) => {
    expect(() => calcularTotal(itens)).toThrow(msg);
  });

  test('snapshot inline do cupom', () => {
    expect(validarCupom('natal20', '2026-12-01')).toMatchInlineSnapshot(§
{
  "desconto": 0.2,
  "valido": true,
}
§);
  });
});`, notes: [{ l: '9', t: '%# é o índice do caso na tabela.' }, { l: '14', t: 'O snapshot inline fica no arquivo e é revisado em PR.' }] },
    { title: 'jest.fn, spyOn e timers falsos (JavaScript, Jest; testado)', lang: 'js', code: R`import { jest, test, expect, beforeEach, afterEach } from '@jest/globals';

test('cobra o valor com desconto e notifica uma vez', async () => {
  const repo = { salvar: jest.fn(() => 7), marcarPago: jest.fn(() => 1) };
  const pagamento = { cobrar: jest.fn(async () => ({ aprovado: true })) };
  const notificador = { enviar: jest.fn(async () => {}) };
  const servico = new ServicoPedidos({ repo, pagamento, notificador, relogio });
  await expect(servico.criar({ cliente: 'ana', itens: [{ sku: 'A', preco: 10, qtd: 2 }], cupom: 'BEMVINDO10' })).resolves.toEqual({ id: 7, status: 'pago', total: 18 });
  expect(pagamento.cobrar).toHaveBeenCalledWith({ pedidoId: 7, valor: 18 });
  expect(notificador.enviar).toHaveBeenLastCalledWith('ana', 'Pedido 7 pago: R$ 18.00');
});

describe('timers falsos', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  test('avança 60 s sem esperar', () => {
    const cb = jest.fn();
    setTimeout(cb, 60000);
    jest.advanceTimersByTime(59999); expect(cb).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1); expect(cb).toHaveBeenCalledTimes(1);
  });
});`, notes: [{ l: '8', t: 'resolves exige await: sem ele o teste passaria sem verificar.' }, { l: '14', t: 'Sempre voltar aos timers reais depois do teste.' }] }
  ],
  bestPractices: ['Use ESM nativo com transform vazio quando o código for JavaScript puro e registre a flag experimental no script.', 'Importe jest, describe, test e expect de @jest/globals em projetos ESM.', 'Defina uma política única de reset de mocks e recrie os dublês em beforeEach.', 'Sempre use await com resolves e rejects e expect.assertions para ramos assíncronos.', 'Mantenha snapshots pequenos, determinísticos e revisados; use asserções explícitas para regras de negócio.', 'Use cobertura como alarme com limiares para código novo e mutação nos módulos críticos.', 'Use --ci, --shard e relatórios (JUnit) no pipeline.'],
  mistakes: ['Esquecer o await em expect(...).rejects, fazendo o teste passar sem verificar.', 'Atualizar snapshots com -u sem revisar.', 'Mocks que vazam entre testes por falta de reset.', 'Esquecer jest.useRealTimers depois de timers falsos.', 'Perseguir a cobertura global como meta.', 'Usar jest.mock em ESM sem conhecer unstable_mockModule.'],
  market: R`O **Jest** aparece em **grande parte das vagas front-end e Node**; **configurar ESM e TypeScript**, **escrever mocks e snapshots com critério** e **migrar para o Vitest** são **tarefas frequentes** de manutenção.`,
  summary: R`O Jest reúne runner paralelo, asserções, mocks, snapshots, timers falsos e cobertura. Em ESM nativo exige NODE_OPTIONS=--experimental-vm-modules, transform vazio e import de @jest/globals. Medido (Jest 30.5.2): 13 testes e 1 snapshot inline em 0,659 s (1,54 s de parede, mediana de 5), cobertura v8 de 100% das linhas e 91,3% dos ramos; o node:test rodou 12 testes de domínio em 0,38 s. Use test.each, matchers com critério, mocks recriados por teste, timers reais restaurados, snapshots pequenos e cobertura como alarme.`,
  refs: [REF.jestStart, REF.jestEsm, REF.jestMocks, REF.jestSnapshots, REF.nodeTest],
  cards: [
    { q: 'Por que usar @jest/globals em projetos ESM?', a: 'O objeto global jest não é injetado em módulos ESM; é preciso importar jest, describe, test e expect explicitamente.' },
    { q: 'O que acontece se esquecer o await em expect(...).rejects?', a: 'O teste termina antes da verificação e pode passar mesmo com o erro errado; use await ou retorne a promessa.' },
    { q: 'Qual a diferença entre toEqual e toMatchObject?', a: 'toEqual compara profundamente o objeto inteiro; toMatchObject verifica um subconjunto e ignora campos extras.' },
    { q: 'Quando o snapshot é arriscado?', a: 'Quando é grande, ruidoso (datas, ids) ou atualizado com -u sem revisão; prefira asserções explícitas para regras de negócio.' }
  ]
},
{
  id: 'ftj-02', moduleId: 'm1', order: 2, minutes: 75, tags: ['Vitest', 'Vite', 'ESM', 'vi.fn', 'concorrência', 'cobertura', 'migração do Jest'],
  title: 'Vitest: runner nativo em ESM e TypeScript, compatível com o Jest, com recursos próprios e migração',
  objectives: ['Explicar o que é o Vitest, como difere do Jest e quando migrar', 'Escrever testes com a API compatível (vi.fn, vi.spyOn, vi.useFakeTimers) e recursos próprios (expect.soft, test.concurrent, vi.stubEnv)', 'Configurar cobertura v8 e inclusão de arquivos em vitest.config', 'Comparar tempos e recursos de Jest, Vitest e node:test com dados medidos', 'Planejar uma migração do Jest com o mínimo de mudanças', 'Conhecer os limites: modo watch, browser mode e testes de tipo (analisados, não executados)'],
  intro: R`O **Vitest** nasceu no ecossistema **Vite** e oferece **ESM e TypeScript nativos**, **API quase idêntica à do Jest** e **modo watch** muito rápido. No laboratório (**Vitest 5.1.2**), os **mesmos testes do Jest** foram portados trocando **só o import** e §jest.§ por §vi.§: **17 testes** passaram (**817 ms**; **2,07 s** de parede, mediana de 5), com recursos próprios (§expect.soft§, §test.concurrent§, §vi.stubEnv§). A cobertura (v8) deu **100% das linhas** e **91,89% dos ramos**, incluindo o app Express. Nos tempos medidos, o **node:test foi o mais rápido para suítes minúsculas** (**0,38 s**).`,
  theory: R`### O que é e por que existe
O **Vitest** é um **runner de testes** que **reaproveita a configuração e o pipeline de transformação do Vite** (esbuild/Rolldown): **TypeScript, JSX e ESM funcionam sem Babel** nem flags experimentais. É **mantido** pela comunidade do Vite. **Motivos** para adotá-lo: **projetos Vite** (mesma config e *plugins* da aplicação), **TypeScript** sem **ts-jest**, **ESM nativo**, **modo watch** com **HMR** (reexecuta só o afetado), **velocidade** em suítes **grandes** (**paralelismo por arquivo** em **workers**/**threads**), **API do Jest** (migração fácil).

### Compatibilidade com o Jest
| Jest | Vitest |
|---|---|
| §jest.fn()§ | §vi.fn()§ |
| §jest.spyOn()§ | §vi.spyOn()§ |
| §jest.useFakeTimers()§ | §vi.useFakeTimers()§ |
| §jest.mock('./mod')§ | §vi.mock('./mod')§ (**hoisted**, funciona com ESM) |
| §expect(...)§ e matchers | **iguais** (§toBe§, §toEqual§, §toMatchInlineSnapshot§...) |
| §describe/test/it/each§ | **iguais** |
| globais (§jest§, §expect§) | **explícitos** por padrão (§import { vi, test, expect } from 'vitest'§) ou §globals: true§ |
**Medido:** o arquivo do Vitest foi gerado do arquivo do Jest com **duas trocas** (§@jest/globals§ → §vitest§ e §jest.§ → §vi.§) e **todos os 13 testes** (**incluindo o snapshot inline**) **passaram**, mais **4 testes** novos.
**Diferenças a observar:** (1) **mocks de módulo** são **hoisted** e **assíncronos** de forma diferente (§vi.importActual§); (2) **ordem de execução** e **isolamento** padrão (§isolate§, §pool§: **threads** ou **forks**); (3) **matchers de snapshot** com **formatação** levemente distinta; (4) **timers falsos** têm **opções** diferentes (§toFake§); (5) **cobertura** exige o pacote §@vitest/coverage-v8§.

### Configuração (vitest.config.mjs)
§defineConfig({ test: { include: [...], coverage: { provider: 'v8', include: [...], reporter: [...] } } })§. **Pontos:** §include§ (padrões dos arquivos), §environment§ (§'node'§, §'jsdom'§, §'happy-dom'§), §setupFiles§, §globals§, §pool§, §coverage§ (§thresholds§). **Execução:** §vitest§ (**watch** no terminal interativo), §vitest run§ (**uma vez**, **CI**), §vitest run --coverage§, §vitest --shard=1/3§.

### Recursos próprios (medidos)
- **§expect.soft§**: **acumula** falhas **sem interromper** o teste: bom para **várias verificações** independentes (o laboratório usou **2** asserções soft);
- **§test.concurrent§**: executa testes **do mesmo arquivo em paralelo** (dois testes de **30 ms** cada: **concorrentes**); **cuidado** com **estado compartilhado**;
- **§vi.stubEnv§/§vi.unstubAllEnvs§**: **variáveis de ambiente** temporárias (§MODO=teste§ **dentro** do teste e **removida** depois);
- **§vi.mock§ hoisted**, §vi.hoisted§, §vi.importActual§ para **mocks parciais de módulo**;
- **Modo browser** (executar testes em **navegador real** via Playwright), **testes de tipos** (§expectTypeOf§), **benchmarks** (§bench§), **in-source testing**, **UI** (§--ui§): **recursos existentes** na documentação, **não executados** neste laboratório.

### Vitest com Supertest
A **mesma configuração** roda os testes de API (**aula ftj-03**): **5 testes** de §app.mjs§ (Express 5) **passaram em 1,44 s**; incluir §api/**§ no §include§ e **a cobertura** passou a medir §app.mjs§: **98,11%** das instruções, **91,89%** dos ramos e **91,66%** das funções (**vitest run vitest api --coverage**).

### Medido: Jest x Vitest x node:test
| Ferramenta | Testes | Tempo de parede (mediana de 5) |
|---|---|---|
| **Jest 30.5.2** | 13 | **1,54 s** |
| **Vitest 5.1.2** | 17 | **2,07 s** |
| **Vitest + Supertest** | 5 | 2,60 s (inclui carregar o Express e o SQLite) |
| **node:test** (domínio do C5.4) | 12 | **0,38 s** |
**Leitura honesta:** são **suítes minúsculas**; o tempo é **inicialização** (framework, transformações, workers). **O Vitest não foi mais rápido que o Jest aqui** (2,07 s x 1,54 s), ao contrário da **reputação** em **suítes grandes** e no **modo watch** (**não medidos**). **Conclusão:** **meça no seu projeto** antes de **decidir por velocidade**; **o motivo mais forte para migrar** costuma ser **ESM/TypeScript sem atrito**, **não** a velocidade.

### Migrando do Jest
1. **Instale** §vitest§ (e §@vitest/coverage-v8§); **crie** §vitest.config§ (reaproveitando aliases);
2. **Troque** imports e §jest.§ por §vi.§ (**codemod** ou §sed§); **ligue** §globals: true§ se **não quiser** mudar os imports;
3. **Revise** §jest.mock§ (hoisting e módulos ESM), **timers**, **matchers customizados** e **snapshots** (§-u§ **uma vez**, **revisando** o diff);
4. **Ambientes** (§jsdom§), **setup** (§setupFilesAfterEach§ → §setupFiles§), **transformações** (**remova** Babel/ts-jest);
5. **CI**: §vitest run§, cobertura, **shards**;
6. **Rode as duas** ferramentas **em paralelo** por uma semana, **comparando** resultados.

### Quando escolher cada um
| Situação | Escolha |
|---|---|
| **Projeto Vite** (React/Vue/Svelte) | **Vitest** |
| **TypeScript/ESM** sem querer configurar transformações | **Vitest** |
| **Base grande** já em **Jest** estável | **manter** o Jest (migre se doer) |
| **Biblioteca Node** pequena, sem dependências | **node:test** |
| **React Native** | **Jest** (o ecossistema usa Jest) |

### Cuidados
- **Concorrência** (§test.concurrent§) e **estado global** (aula pat-01);
- **Isolamento** (§isolate: false§ acelera, mas **vaza** módulos entre arquivos);
- **Versões:** **Vitest** e **Vite** têm **faixas compatíveis**; **fixe** versões exatas;
- **Watch** em CI: **nunca** (§run§).`,
  concepts: [
    { term: 'Vitest', def: 'Runner de testes baseado no Vite, com ESM e TypeScript nativos e API compatível com o Jest.' },
    { term: 'vi', def: 'Objeto utilitário do Vitest para mocks, espiões, timers falsos e variáveis de ambiente.' },
    { term: 'expect.soft', def: 'Asserção que registra a falha mas permite que o teste continue, acumulando todas as falhas.' },
    { term: 'test.concurrent', def: 'Modo em que testes do mesmo arquivo executam em paralelo.' },
    { term: 'Hoisting de mocks', def: 'Elevação das chamadas de mock de módulo para o início do arquivo, antes dos imports.' },
    { term: 'Pool de workers', def: 'Conjunto de threads ou processos em que o runner executa os arquivos de teste em paralelo.' },
    { term: 'Browser mode', def: 'Modo do Vitest que executa os testes em um navegador real.' }
  ],
  examples: R`**Analogia:** o Vitest é o **irmão mais novo do Jest que cresceu falando "ESM" e "TypeScript"**: usa quase o mesmo vocabulário, então **a mudança é leve**; mas, para **abrir uma gaveta pequena** (suíte de 12 testes), o **node:test** ainda é **mais ágil**.

**Exemplo 1: porte.** Dois replace e os 13 testes do Jest passam no Vitest, inclusive o snapshot.

**Exemplo 2: recursos próprios.** expect.soft, testes concorrentes e variável de ambiente temporária.

**Exemplo 3: medição.** Jest 1,54 s, Vitest 2,07 s e node:test 0,38 s em suítes minúsculas: o tempo é de inicialização.`,
  code: [
    { title: 'vitest.config.mjs com cobertura v8 (JavaScript; testado)', lang: 'js', code: R`import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['vitest/**/*.test.mjs', 'api/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      include: ['src/dominio.mjs', 'src/servico.mjs', 'src/app.mjs'],
      reporter: ['text-summary', 'text']
    }
  }
});
// npx vitest run                      # 22 testes (17 + 5)
// npx vitest run --coverage           # Lines 100% | Branches 91,89%`, notes: [{ l: '5', t: 'include define quais arquivos são testes.' }, { l: '12', t: 'Resultado medido no laboratório.' }] },
    { title: 'Portando do Jest e usando recursos próprios (JavaScript, Vitest; testado)', lang: 'js', code: R`// gerado do arquivo do Jest com dois replace:
//   import { jest, ... } from '@jest/globals'  ->  import { vi, ... } from 'vitest'
//   jest.fn / jest.spyOn / jest.useFakeTimers  ->  vi.fn / vi.spyOn / vi.useFakeTimers
import { vi, describe, test, expect } from 'vitest';

describe('recursos específicos do Vitest', () => {
  test('expect.soft acumula falhas sem interromper o teste', () => {
    expect.soft(1 + 1).toBe(2);
    expect.soft('a').toBe('a');
  });
  test.concurrent('concorrente A', async () => { await new Promise((r) => setTimeout(r, 30)); expect(1).toBe(1); });
  test.concurrent('concorrente B', async () => { await new Promise((r) => setTimeout(r, 30)); expect(2).toBe(2); });
  test('vi.stubEnv e vi.unstubAllEnvs', () => {
    vi.stubEnv('MODO', 'teste');
    expect(process.env.MODO).toBe('teste');
    vi.unstubAllEnvs();
    expect(process.env.MODO).toBeUndefined();
  });
});`, notes: [{ l: '7', t: 'Com expect.soft, todas as falhas aparecem de uma vez.' }, { l: '16', t: 'A variável de ambiente é restaurada ao final.' }] },
    { title: 'Mock de módulo hoisted (TypeScript/JavaScript; trecho conceitual, não executado nesta aula)', lang: 'js', code: R`import { vi, test, expect } from 'vitest';
import { enviarEmail } from './email.mjs';
import { cadastrar } from './cadastro.mjs';

// hoisted: roda antes dos imports, substituindo o módulo inteiro
vi.mock('./email.mjs', () => ({ enviarEmail: vi.fn(async () => ({ ok: true })) }));

test('cadastro envia o e-mail de boas-vindas', async () => {
  await cadastrar({ nome: 'Ana', email: 'ana@exemplo.com' });
  expect(enviarEmail).toHaveBeenCalledWith('ana@exemplo.com', expect.stringContaining('Bem-vinda'));
});

// mock parcial: mantém o resto do módulo original
vi.mock('./util.mjs', async () => ({ ...(await vi.importActual('./util.mjs')), agora: () => 1700000000000 }));`, notes: [{ l: '6', t: 'vi.mock é elevado para o topo do arquivo.' }, { l: '14', t: 'importActual permite mocks parciais.' }] }
  ],
  bestPractices: ['Migre do Jest por ESM e TypeScript sem atrito, não apenas por velocidade; meça no seu projeto.', 'Fixe versões exatas do Vitest e do Vite e instale o provedor de cobertura correspondente.', 'Use vitest run no CI e nunca o modo watch.', 'Use expect.soft para verificações independentes e test.concurrent só sem estado compartilhado.', 'Recrie os dublês por teste e restaure variáveis de ambiente e timers.', 'Revise os mocks de módulo (hoisting) e os snapshots na migração.', 'Rode as duas ferramentas em paralelo durante a migração para comparar resultados.'],
  mistakes: ['Migrar achando que a velocidade será sempre maior sem medir.', 'Usar test.concurrent com estado global compartilhado.', 'Desligar o isolamento para acelerar e vazar módulos entre arquivos.', 'Esquecer de instalar o pacote de cobertura.', 'Deixar o watch ligado no CI.', 'Atualizar snapshots em massa na migração sem revisar.'],
  market: R`O **Vitest** é **o runner padrão** de projetos **Vite** e vem **substituindo o Jest** em muitas bases **TypeScript/ESM**; **saber migrar** e **medir** antes de decidir é **diferencial** em **vagas front-end e full stack**.`,
  summary: R`O Vitest é um runner nativo em ESM e TypeScript, baseado no Vite, com API quase idêntica à do Jest (vi no lugar de jest). Medido (5.1.2): os 13 testes do Jest passaram com duas trocas de texto, mais 4 testes de recursos próprios (expect.soft, test.concurrent, vi.stubEnv) em 817 ms; cobertura v8 de 100% das linhas e 91,89% dos ramos; tempos de parede em suítes minúsculas: Jest 1,54 s, Vitest 2,07 s e node:test 0,38 s, então o motivo da migração costuma ser ESM e TypeScript, não a velocidade. Modo browser, testes de tipo e benchmarks não foram executados.`,
  refs: [REF.vitestGuide, REF.vitestComparisons, REF.vitestMocking, REF.jestStart, REF.nodeTest],
  cards: [
    { q: 'O que muda ao portar um teste do Jest para o Vitest?', a: 'Basicamente o import (vitest em vez de @jest/globals) e jest. por vi.; mocks de módulo, timers e snapshots merecem revisão.' },
    { q: 'O Vitest foi mais rápido que o Jest no laboratório?', a: 'Não: 2,07 s contra 1,54 s de parede em suítes minúsculas; o tempo é de inicialização e o ganho do Vitest aparece em suítes grandes e no watch (não medidos).' },
    { q: 'Para que serve expect.soft?', a: 'Registrar a falha sem interromper o teste, acumulando todas as falhas independentes.' },
    { q: 'Quando manter o Jest?', a: 'Em bases grandes e estáveis em Jest, em React Native e quando o custo da migração não compensa.' }
  ]
}
];
