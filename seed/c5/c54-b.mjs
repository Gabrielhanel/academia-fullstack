// C5.4 — Fundamentos de testes. Aulas 3 e 4 (testes end-to-end; mocking e stubbing).
import { REF } from './c54-a.mjs';
const R = String.raw;

export const REF2 = {
  puppeteer: { title: 'Puppeteer — Documentation', url: 'https://pptr.dev/', kind: 'doc' },
  playwrightWait: { title: 'Playwright — Auto-waiting (actionability)', url: 'https://playwright.dev/docs/actionability', kind: 'doc' },
  testingLibQueries: { title: 'Testing Library — About queries', url: 'https://testing-library.com/docs/queries/about/', kind: 'doc' },
  noMoreE2e: { title: 'Google Testing Blog — Just Say No to More End-to-End Tests', url: 'https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html', kind: 'artigo' },
  mocksArentStubs: { title: 'Martin Fowler — Mocks Aren\'t Stubs', url: 'https://martinfowler.com/articles/mocksArentStubs.html', kind: 'artigo' },
  testDouble: { title: 'Martin Fowler — TestDouble', url: 'https://martinfowler.com/bliki/TestDouble.html', kind: 'artigo' },
  nodeMock: { title: 'Node.js — Test runner: mocking', url: 'https://nodejs.org/api/test.html#mocking', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'tst-03', moduleId: 'm2', order: 3, minutes: 75, tags: ['E2E', 'Puppeteer', 'Chrome headless', 'flakiness', 'esperas', 'seletores'],
  title: 'Testes end-to-end: o fluxo completo no navegador, flakiness e como mantê-los confiáveis',
  objectives: ['Definir E2E, o que ele cobre e por que deve ser poucos e focados em fluxos críticos', 'Executar um E2E em Chrome headless contra um servidor e um banco reais', 'Medir a flakiness de uma espera fixa e corrigi-la com espera por condição', 'Escolher seletores estáveis (papéis e rótulos) e dados de teste previsíveis', 'Reduzir o custo do E2E (paralelismo, reuso de sessão, apenas o que importa) e conhecer o papel de Playwright e Cypress (C5.5)', 'Tratar testes intermitentes como defeito'],
  intro: R`O teste **end-to-end** (E2E) percorre o sistema **como o usuário**: abre o **navegador**, **clica**, **digita** e **verifica** o que aparece, passando por **front-end, API e banco reais**. É a **maior confiança** e o **maior custo**: no laboratório, **3 testes E2E** levaram **2.983 ms** (≈ **994 ms** por teste, com a abertura do **Chrome headless**), contra **321 ms** de **5 testes de integração**. E a **flakiness** foi medida: uma **espera fixa de 120 ms** falhou em **8 de 14 execuções** com resposta atrasada (0 a 300 ms); a **espera por condição** falhou em **0 de 14**.`,
  theory: R`### O que é E2E e para que serve
Um teste E2E exercita **o sistema inteiro** (UI → API → banco → integrações) **por fora**. Ele **responde** "**o fluxo crítico funciona para o usuário?**" (cadastro, login, compra, pagamento). **Vantagens:** **confiança máxima** (tudo junto), **independe da implementação** (pode **sobreviver a refatorações**). **Custos:** **lento** (segundos), **frágil** (muitas partes móveis), **difícil de diagnosticar** ("falhou: em qual camada?"), **caro de manter**, **ambientes** complexos. Por isso: **poucos**, **só fluxos críticos** (o "caminho feliz" e algumas falhas **importantes**), **todo o resto em camadas menores** (Google: *Just Say No to More End-to-End Tests*).

### Executando no laboratório
Stack: **Puppeteer-core 25.18.1** controlando o **Google Chrome** do sistema (**headless**), contra o servidor do laboratório (**§node:http§**, **SQLite real em memória**, **porta efêmera**). O **teste** (§e2e.test.mjs§):
1. **Sobe** o servidor e o navegador **uma vez** (§t.after§ fecha **ambos**);
2. **Compra com sucesso:** abre §/§, clica §#comprar§, **espera** o texto §Pedido ...§ e verifica **§Pedido 1 pago: R$ 20.00§**; **e confere no banco real** que o pedido está §pago§;
3. **Cupom desconhecido:** digita §XYZ§ no campo de cupom e verifica **§Erro: cupom desconhecido§**.
**3 testes passaram** (cada subteste ≈ 450 a 510 ms; o conjunto, **2.198 ms**, com **a abertura do Chrome** dominando).
**Ferramentas:** **Puppeteer** (somente Chrome/Chromium, **baixo nível**), **Playwright** e **Cypress** (**mais recursos**: auto-espera, rastreamento, vários navegadores; **C5.5** as executa).

### Flakiness: o inimigo do E2E
**Teste intermitente (*flaky*)** passa e falha **sem mudança no código**: **corrói a confiança** (as pessoas **ignoram** falhas) e **custa** reexecuções. Causas comuns: **esperas fixas** (§sleep§), **dependência de tempo/rede/ordem**, **dados compartilhados**, **animações**, **condição de corrida** entre o teste e a página, **ambiente lento** (CI) e **relógio real**.
**Experimento medido (§e2e-flaky.mjs§):** a página tem um **atraso** artificial de 0 a 300 ms **antes** de mostrar o resultado (simulando **API lenta**). **14 execuções** por modo (atrasos 0, 50, 100, 150, 200, 250, 300, duas vezes cada):
| Estratégia | Falhas | Tempo médio |
|---|---|---|
| **Espera fixa de 120 ms** (§sleep(120)§ após o clique) | **8/14** | 224 ms |
| **Espera por condição** (§waitForFunction§ até o texto aparecer, **timeout 5 s**) | **0/14** | 269 ms |
**Leitura:** a espera fixa **falha quando a página demora mais que o chute** (≥ 100 ms de atraso) **e desperdiça tempo** quando é **rápida**; a espera **por condição** espera **o necessário**, **sem chute**, e **só falha** se algo **realmente** estiver errado (timeout). **Regra:** **nunca durma**; **espere pelo estado observável** ("o texto apareceu", "o botão ficou habilitado", "a requisição terminou"). Ferramentas modernas (**Playwright**) **esperam automaticamente** (*actionability*: visível, estável, habilitado) **antes** de cada ação.

### Seletores estáveis
- **Evite** seletores **frágeis** (§div > div:nth-child(3) > span§) e **classes de estilo** (§.btn-primary-lg§): **mudam com o design**;
- **Prefira** **papéis e rótulos acessíveis** (§getByRole('button', { name: 'Comprar' })§, **label**, **texto**): **parecem com o usuário** e **forçam acessibilidade** (**Testing Library**: *query by role*);
- **Atributos de teste** (§data-testid§) **quando não há alternativa semântica**; **IDs** estáveis (os do laboratório);
- **Centralize** seletores em **objetos de página** (*page objects*) ou funções auxiliares: **um ponto** para mudar.

### Dados e ambiente
- **Dados determinísticos:** **crie** (via API/banco) **o que o teste precisa**; **não dependa** do que "já existe";
- **Isolamento:** **contas/pedidos únicos** por teste ou **banco novo por execução** (como no laboratório);
- **Terceiros:** **falsifique** gateways e e-mails (o laboratório injeta o pagamento **aprovando**); E2E contra **sandbox real** é **raro e separado**;
- **Autenticação:** **reutilize sessão** (cookie/*storage state*) em vez de **logar pela UI** em cada teste;
- **Ambiente:** o mesmo **tipo** de ambiente em CI (**contêiner**, **versão do navegador fixada**: lembre **§--no-sandbox§** em contêineres e **versões do Chrome** do **CI**);
- **Relógio:** **injete** ou **fixe** (o servidor do laboratório usa um relógio fixo).

### Diagnóstico
Quando um E2E falha, você precisa de **evidências**: **captura de tela**, **vídeo**, **trace** (Playwright), **logs do console** e **da rede**, **HTML da página**. **Configure o CI para guardar esses artefatos** nas falhas. **Reproduza localmente** com **o mesmo navegador**.

### Estratégia: quantos E2E?
- **Um por jornada crítica** (compra, login, cadastro), **não por tela**;
- **Cenários de erro** importantes **somente se** a **integração** não cobre;
- **Paralelize** (workers) **com dados isolados**;
- **Fumaça (*smoke*)** pós-deploy: **2 ou 3** E2E contra **produção/homologação** (somente leitura ou dados descartáveis);
- **Orçamento de flakiness:** **meta ≈ 0**; **teste flaky** é **quarentenado** (**tíquete + prazo**) e **corrigido** ou **removido**;
- **Visual/regressão de aparência** (screenshots): **uma camada à parte**, com **cuidado** (fontes, antialiasing).
**Alternativas mais baratas** para **parte** da confiança do E2E: **testes de componente** no navegador (Testing Library/Playwright CT), **testes de contrato** (C5.6) e **testes de API**.

### Medido nesta aula, resumido
| Item | Resultado |
|---|---|
| E2E: 3 testes (Chrome headless) | **passam** em 2.983 ms (processo isolado) / 2.198 ms (arquivo do teste) |
| Espera fixa de 120 ms | **8/14 falhas** |
| Espera por condição | **0/14 falhas** (269 ms em média) |
Números de **uma máquina e uma execução**: o **padrão** (a espera fixa falha quando o atraso excede o chute) é **robusto**, **a contagem exata** não é.

### Antipadrões
- **Sleep** em vez de espera por condição;
- **Seletores frágeis**; **dados compartilhados**; **testes dependentes entre si**;
- **E2E para tudo** (cone de sorvete);
- **Ignorar falhas intermitentes** ("rode de novo");
- **Login pela UI** em **todo** teste;
- **Testes que dependem de terceiros reais**.`,
  concepts: [
    { term: 'Teste end-to-end (E2E)', def: 'Teste que percorre o sistema completo pela interface do usuário, incluindo front-end, API e banco.' },
    { term: 'Headless', def: 'Modo de execução do navegador sem interface gráfica visível, usado em automação e CI.' },
    { term: 'Teste flaky', def: 'Teste que passa ou falha de forma intermitente sem mudança no código.' },
    { term: 'Espera por condição', def: 'Esperar por um estado observável (texto, elemento, resposta) em vez de um tempo fixo.' },
    { term: 'Seletor por papel', def: 'Localizar elementos pelo papel acessível e nome (botão "Comprar"), próximo do uso real.' },
    { term: 'Page object', def: 'Objeto que concentra seletores e ações de uma página, isolando o teste de mudanças na interface.' },
    { term: 'Smoke test', def: 'Verificação rápida e superficial de que o sistema implantado está de pé e os fluxos essenciais funcionam.' }
  ],
  examples: R`**Analogia:** o E2E é o **ensaio geral de uma peça**: com cenário, luz, som e atores juntos; **insubstituível** antes da estreia, mas **caro e lento**: ninguém ensaia a peça inteira a cada vez que muda uma fala; essas se testam **separadamente**.

**Exemplo 1: fluxo crítico.** Compra com sucesso: o texto "Pedido 1 pago: R$ 20.00" aparece e o banco real guarda o pedido pago.

**Exemplo 2: espera fixa.** Com resposta atrasada de 0 a 300 ms, a espera de 120 ms falhou em 8 de 14 execuções.

**Exemplo 3: espera por condição.** A mesma página, com waitForFunction, falhou 0 de 14 e levou 269 ms em média.`,
  code: [
    { title: 'E2E com Puppeteer e Chrome headless (JavaScript, node:test; 3 testes passam)', lang: 'js', code: R`import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { criarServidor } from '../src/servidor.mjs';

test('E2E: o fluxo de compra no navegador real', async (t) => {
  const s = criarServidor({ relogio: () => new Date('2026-11-25T10:00:00Z') });
  const porta = await s.ouvir();
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await s.fechar(); });
  const base = 'http://127.0.0.1:' + porta;

  await t.test('compra com sucesso', async () => {
    const page = await browser.newPage();
    await page.goto(base + '/');
    await page.click('#comprar');
    await page.waitForFunction(() => document.getElementById('resultado').textContent.startsWith('Pedido'));
    assert.equal(await page.$eval('#resultado', (e) => e.textContent), 'Pedido 1 pago: R$ 20.00');
    assert.equal(s.repo.buscar(1).status, 'pago');   // confere o efeito no banco real
    await page.close();
  });
});`, notes: [{ l: '9', t: 'Navegador e servidor sobem uma vez e fecham em t.after.' }, { l: '16', t: 'Espera por condição observável, sem sleep.' }] },
    { title: 'Espera fixa x espera por condição (JavaScript; resultado medido: 8/14 x 0/14 falhas)', lang: 'js', code: R`for (const atraso of [0, 50, 100, 150, 200, 250, 300, 0, 50, 100, 150, 200, 250, 300]) {
  const page = await browser.newPage();
  await page.goto(base + '/?atraso=' + atraso);   // a página atrasa o resultado de propósito
  await page.click('#comprar');

  // FRÁGIL: depende de um chute sobre o tempo da página
  await new Promise((r) => setTimeout(r, 120));

  // ROBUSTO: espera o estado observável (timeout só para erros reais)
  await page.waitForFunction(() => document.getElementById('resultado').textContent.startsWith('Pedido'), { timeout: 5000 });
}
// espera fixa de 120 ms: falhas 8/14 | tempo médio 224 ms
// espera por condição : falhas 0/14 | tempo médio 269 ms`, notes: [{ l: '7', t: 'O sleep falha quando a resposta passa do chute e desperdiça tempo quando é rápida.' }, { l: '10', t: 'Os números vêm de uma máquina e uma execução.' }] },
    { title: 'Seletores estáveis e page object (JavaScript; exemplo conceitual com Playwright, não executado nesta aula)', lang: 'js', code: R`// Frágil
await page.click('div > div:nth-child(3) > button.btn-primary-lg');

// Estável: papel acessível e rótulo (com auto-espera do Playwright)
await page.getByLabel('Cliente').fill('ana');
await page.getByRole('button', { name: 'Comprar' }).click();
await expect(page.getByRole('status')).toHaveText('Pedido 1 pago: R$ 20.00');

// Page object: um ponto para mudar quando a interface mudar
class PaginaCompra {
  constructor(page) { this.page = page; }
  async comprar({ cliente, cupom }) {
    await this.page.getByLabel('Cliente').fill(cliente);
    if (cupom) await this.page.getByLabel('Cupom').fill(cupom);
    await this.page.getByRole('button', { name: 'Comprar' }).click();
  }
  resultado() { return this.page.getByRole('status'); }
}`, notes: [{ l: '5', t: 'Seletores por rótulo e papel parecem com o usuário e forçam acessibilidade.' }, { l: '9', t: 'O page object concentra seletores e ações.' }] }
  ],
  bestPractices: ['Limite os E2E a poucas jornadas críticas e teste o resto em camadas menores.', 'Nunca use sleep: espere por um estado observável com timeout.', 'Prefira seletores por papel, rótulo ou texto e centralize-os em page objects.', 'Crie os dados de cada teste e falsifique terceiros; reutilize sessão em vez de logar pela UI.', 'Guarde captura de tela, vídeo, trace e logs nas falhas do CI.', 'Trate testes flaky como defeitos: quarentena com prazo, correção ou remoção.', 'Fixe a versão do navegador e o ambiente do CI.'],
  mistakes: ['Esperas fixas com sleep.', 'Seletores frágeis (posição, classes de estilo).', 'E2E para tudo (cone de sorvete).', 'Dados compartilhados e testes dependentes entre si.', 'Ignorar falhas intermitentes ("rode de novo").', 'Depender de serviços de terceiros reais.'],
  market: R`**Automação de UI** (Playwright e Cypress, C5.5) é pedida em vagas de **QA, SDET e front-end**; **saber por que testes ficam flaky** e **como estabilizá-los** é **a pergunta de entrevista** mais comum da área.`,
  summary: R`O E2E exercita o sistema inteiro pela interface: dá máxima confiança e custa mais (no laboratório 3 testes em Chrome headless levaram 2.983 ms, ≈ 994 ms cada). A flakiness mede-se e corrige-se: uma espera fixa de 120 ms falhou em 8 de 14 execuções com resposta atrasada, enquanto a espera por condição falhou em 0 de 14. Use poucos E2E nas jornadas críticas, seletores por papel e rótulo, dados isolados, terceiros falsificados e evidências nas falhas; trate testes intermitentes como defeitos. Playwright e Cypress ficam para a C5.5.`,
  refs: [REF2.puppeteer, REF2.playwrightWait, REF2.testingLibQueries, REF2.noMoreE2e, REF.nonDeterminism, REF.testPyramid],
  cards: [
    { q: 'Por que limitar o número de testes E2E?', a: 'São lentos, frágeis e difíceis de diagnosticar; devem cobrir só jornadas críticas, deixando o resto para camadas menores.' },
    { q: 'O que o experimento de espera fixa x condição mostrou?', a: 'Espera fixa de 120 ms falhou em 8/14 execuções com atraso de até 300 ms; a espera por condição falhou em 0/14.' },
    { q: 'Que seletores preferir em E2E?', a: 'Papéis, rótulos e textos acessíveis (ou data-testid quando necessário), centralizados em page objects; evite posição e classes de estilo.' },
    { q: 'O que guardar quando um E2E falha no CI?', a: 'Captura de tela, vídeo, trace, logs de console e rede e o HTML da página.' }
  ]
},
{
  id: 'tst-04', moduleId: 'm2', order: 4, minutes: 80, tags: ['mocks', 'stubs', 'spies', 'fakes', 'dublês de teste', 'node:test', 'acoplamento à implementação'],
  title: 'Mocking e stubbing: dublês de teste, verificação de estado x de interação e o custo do excesso de mocks',
  objectives: ['Distinguir dummy, stub, spy, mock e fake e escolher o dublê adequado', 'Usar mock.fn, mockImplementation e mock.timers do node:test', 'Contrastar teste de estado com teste de interação e medir a fragilidade do over-mocking', 'Decidir o que simular (fronteiras) e o que manter real', 'Evitar mockar o que você não possui e usar fakes e contratos', 'Controlar tempo e aleatoriedade sem esperar'],
  intro: R`**Dublês de teste** (*test doubles*) **substituem** dependências **difíceis** (rede, banco, e-mail, relógio) para que o teste seja **rápido e determinístico**. Mas dublês demais **acoplam o teste à implementação**: no laboratório, depois de **renomear internamente** §salvar§ para §inserir§ (sem mudar nenhum comportamento observável), o **teste com mocks de interação falhou** e o **teste de estado com fake continuou passando**. Esta aula mostra **quando e como** usar cada dublê e o **§mock§ do §node:test§** (§mock.fn§, §mockImplementation§, §mock.timers§).`,
  theory: R`### Taxonomia (Fowler, Meszaros)
| Dublê | O que faz | Exemplo no laboratório |
|---|---|---|
| **Dummy** | **preenche** um parâmetro **sem ser usado** | §notificador: {}§ em um teste que nunca notifica |
| **Stub** | **devolve respostas fixas** | §cobrar: async () => ({ aprovado: false })§ |
| **Spy** | **registra as chamadas** para verificação posterior | §cobrar.mock.calls[0].arguments[0]§ |
| **Mock** | **pré-programado com expectativas**; **o teste falha** se não forem cumpridas | §assert.equal(notificador.enviar.mock.callCount(), 1)§ |
| **Fake** | **implementação funcional simplificada** | §RepositorioPedidos§ em memória (SQLite) |
Na prática, a maioria das bibliotecas (inclusive §node:test§) chama de "mock" **uma função instrumentada** (§mock.fn§) que **serve de stub e spy**. Os **conceitos** importam mais que os **nomes**.

### Verificação de estado x de interação
- **Estado:** "**depois** de criar o pedido, o **repositório contém** um pedido **pago**" (o resultado **observável**);
- **Interação:** "**o serviço chamou** §repo.salvar§ **uma vez** com estes argumentos **e depois** §pagamento.cobrar§".
**Estado** é **mais robusto** a **refatorações**; **interação** é **necessária** quando o **efeito colateral não é observável** pelo estado (**e-mail enviado**, **cobrança no gateway**, **auditoria**). **Regra:** **prefira estado**; **use interação** nas **fronteiras** (terceiros) e **só** para o que **importa** (o **quê**, não o **como/ordem**).
Escolas: **clássica/Detroit** (**estado**, colaboradores reais, **fakes**) e **mockista/Londres** (**interação**, tudo simulado, bom para **descobrir o design** com TDD). **Os dois funcionam**; os **riscos** mudam (**mocks demais = frágil**; **reais demais = lento/difícil de isolar**).

### O módulo mock do node:test (Node 26.13.1)
- §mock.fn(implementacao?)§: função instrumentada; §fn.mock.calls§ (cada chamada: §arguments§, §result§, §error§, §this§), §fn.mock.callCount()§, §fn.mock.mockImplementation(novo)§ (**trocar** o comportamento), §mockImplementationOnce§, §resetCalls§;
- §mock.method(objeto, 'metodo', impl)§: **substitui** um método existente (com §t.mock§ ele é **restaurado ao fim do teste**; com o §mock§ global, chame §mock.restoreAll()§);
- **§mock.timers§** (§enable({ apis: ['setTimeout'] })§, §tick(ms)§, §reset()§): **controla o tempo** sem esperar: no laboratório, §setTimeout(..., 60000)§ **só disparou** após §tick(59999)§ + §tick(1)§ (**sem dormir 60 s**);
- §mock.module§ (módulos ESM; recurso **experimental** em versões do Node: confira a documentação da sua versão).
**Medido (5 testes do §servico.mock.test.mjs§):**
1. **Spy/mock:** com cupom §BEMVINDO10§ o serviço **cobrou 18** (§{ pedidoId: 7, valor: 18 }§), **notificou 1 vez** com §Pedido 7 pago: R$ 18.00§ e **marcou pago 1 vez**;
2. **Stub:** com pagamento **recusado** (§mockImplementation§), o resultado é §{ status: 'novo', motivo: 'pagamento recusado' }§ e **nada** foi marcado pago nem notificado;
3. **Cupom expirado** (relógio fixo em **2026-12-30**): rejeita com **cupom expirado** e **nenhum efeito colateral** (§salvar§ e §cobrar§ com **0** chamadas);
4. **Tempo simulado:** o timer de 60 s disparou **sem esperar**;
5. **Fake:** com o **repositório real em memória**, o teste lê o **estado** (§buscar(id).status === 'pago'§).

### Medido: o custo do over-mocking
No experimento (§overmock.mjs§) a **mesma função** tem **duas implementações** com **o mesmo comportamento observável**: **V1** chama §repo.salvar(...)§; **V2** (refatoração **interna**) chama §repo.inserir(...)§ **com o mesmo efeito**. Dois testes:
| Teste | V1 | V2 |
|---|---|---|
| **Mock de interação** (§repo.salvar.mock.callCount() === 1§) | passa | **FALHA** |
| **Estado com fake** (o fake guarda o pedido; verifica total) | passa | **passa** |
O teste de mock **quebrou** porque **conhece o nome interno**; o de estado **sobreviveu à refatoração**. **Moral:** **testes devem falhar quando o comportamento muda**, **não quando a estrutura muda** (cln-03: refatorar **sem alterar testes**).

### O que simular e o que manter real
- **Simule (fronteiras):** **rede/HTTP de terceiros**, **e-mail/SMS**, **pagamento**, **relógio**, **aleatoriedade**, **sistema de arquivos** (quando necessário);
- **Mantenha real:** **regras de domínio puras**, **o seu banco** (em integração), **coleções**, **funções utilitárias**;
- **Não mocke o que você não possui** (Freeman e Pryce): **não** simule **tipos de terceiros** diretamente (o cliente HTTP, o ORM) **espalhados pelos testes**; **crie um adaptador seu** (aula pat-02) e **simule o adaptador**; **teste o adaptador** com **integração/contrato**;
- **Não mocke o próprio objeto sob teste** (testa o mock).

### Dublês podem mentir
O dublê **reflete o que você acha** que o terceiro faz; se **divergir**, os testes **passam** e a **produção falha**. **Mitigação:** **testes de contrato** (consumidor e provedor: C5.6), **fixtures gravadas** de **respostas reais**, **testes de fumaça** contra **sandbox**; **fakes** de **bibliotecas** mantidas pelo **fornecedor** (por exemplo, emuladores oficiais).

### Controlando o tempo e o acaso
- **Relógio injetado** (§relogio: () => new Date(...)§): **preferível** a mockar §Date§ **globalmente**;
- **mock.timers** para **timeouts, debounce, retry com backoff**: **sem sleep**;
- **Aleatoriedade:** **injete** uma **fonte** (§random: () => 0.5§) ou **semente**;
- **Identificadores:** injete **gerador de id**.

### Boas práticas
1. **Um dublê por fronteira**, **não por classe**;
2. **Verifique o essencial** (o **quê**), **evite asserções de ordem/contagem** se **não importam**;
3. **Reutilize fakes** (repositório em memória) em **vários testes**: **uma implementação**, **muitos testes**;
4. **Limite** mocks por teste (**mais de 3** é sinal de **acoplamento** ou **design** com **muitas dependências**: SRP/God Object, aula pat-05);
5. **Nomeie** pelo **comportamento**; **evite** testes que **repetem** a implementação linha a linha;
6. **Reinicie** dublês entre testes (§mock.reset()§ / **criar de novo** em cada teste: o laboratório usa uma **função §montar()§**).

### Armadilhas
- **Over-mocking** (medido acima); **mock de tudo** (o teste só testa os mocks);
- **Dublê de dublê**; **testes que repetem o código**;
- **Mocks globais** que **vazam** entre testes (§Date§, §fetch§);
- **Stubs com dados irreais** (formatos que o terceiro **nunca** devolve);
- **Ignorar** o **caminho de erro** do terceiro (timeouts, 5xx, respostas parciais): **simule falhas** também.`,
  concepts: [
    { term: 'Dublê de teste', def: 'Objeto ou função que substitui uma dependência real em um teste (dummy, stub, spy, mock ou fake).' },
    { term: 'Stub', def: 'Dublê que devolve respostas pré-definidas.' },
    { term: 'Spy', def: 'Dublê que registra como foi chamado para verificação posterior.' },
    { term: 'Mock', def: 'Dublê com expectativas de interação cuja violação faz o teste falhar.' },
    { term: 'Fake', def: 'Implementação funcional simplificada de uma dependência, como um repositório em memória.' },
    { term: 'Verificação de estado', def: 'Verificar o resultado observável (valores, dados armazenados) em vez das chamadas feitas.' },
    { term: 'Over-mocking', def: 'Excesso de mocks de interação que acopla o teste à implementação e o quebra em refatorações.' }
  ],
  examples: R`**Analogia:** testar com mocks demais é **ensaiar a peça com atores que só leem as falas na ordem exata**: se o diretor troca a ordem de duas entradas (sem mudar a história), o ensaio **desmorona**; testar o **estado** é verificar se, **no fim**, a **história foi contada**.

**Exemplo 1: spy.** O serviço cobrou 18 (com cupom), notificou 1 vez e marcou pago 1 vez.

**Exemplo 2: over-mocking.** Renomear salvar para inserir quebrou o teste de mock; o teste de estado com fake continuou verde.

**Exemplo 3: tempo simulado.** Um timer de 60 s disparou com tick(59999) + tick(1), sem esperar.`,
  code: [
    { title: 'mock.fn, mockImplementation e verificação de interação nas fronteiras (JavaScript, node:test; 5 testes passam)', lang: 'js', code: R`import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { ServicoPedidos } from '../src/servico.mjs';

const relogio = () => new Date('2026-11-25T10:00:00Z');
const montar = (extra = {}) => {
  const repo = { salvar: mock.fn(() => 7), marcarPago: mock.fn(() => 1) };
  const pagamento = { cobrar: mock.fn(async () => ({ aprovado: true })) };
  const notificador = { enviar: mock.fn(async () => {}) };
  return { repo, pagamento, notificador, servico: new ServicoPedidos({ repo, pagamento, notificador, relogio, ...extra }) };
};

test('spy/mock: cobra o valor com desconto e notifica uma vez', async () => {
  const { servico, pagamento, notificador } = montar();
  const r = await servico.criar({ cliente: 'ana', itens: [{ sku: 'A', preco: 10, qtd: 2 }], cupom: 'BEMVINDO10' });
  assert.deepEqual(r, { id: 7, status: 'pago', total: 18 });
  assert.deepEqual(pagamento.cobrar.mock.calls[0].arguments[0], { pedidoId: 7, valor: 18 });
  assert.equal(notificador.enviar.mock.callCount(), 1);
});

test('stub: pagamento recusado não marca como pago nem notifica', async () => {
  const { servico, pagamento, notificador, repo } = montar();
  pagamento.cobrar.mock.mockImplementation(async () => ({ aprovado: false }));
  await servico.criar({ cliente: 'ana', itens: [{ sku: 'A', preco: 10, qtd: 2 }] });
  assert.equal(repo.marcarPago.mock.callCount(), 0);
  assert.equal(notificador.enviar.mock.callCount(), 0);
});`, notes: [{ l: '6', t: 'Uma função montar() cria dublês novos por teste: sem vazamento de estado.' }, { l: '24', t: 'mockImplementation troca o comportamento do dublê só neste teste.' }] },
    { title: 'Tempo simulado com mock.timers e fake em vez de mock (JavaScript, node:test)', lang: 'js', code: R`test('mock.timers: controla o tempo sem esperar', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  let chamou = false;
  setTimeout(() => { chamou = true; }, 60000);
  mock.timers.tick(59999); assert.equal(chamou, false);
  mock.timers.tick(1);     assert.equal(chamou, true);   // 60 s simulados em microssegundos
  mock.timers.reset();
});

test('fake em vez de mock: teste de estado com o repositório real em memória', async () => {
  const { RepositorioPedidos } = await import('../src/repositorio.mjs');
  const repo = new RepositorioPedidos();
  const servico = new ServicoPedidos({ repo, pagamento: { cobrar: async () => ({ aprovado: true }) }, notificador: { enviar: async () => {} }, relogio });
  const r = await servico.criar({ cliente: 'ana', itens: [{ sku: 'A', preco: 10, qtd: 2 }] });
  assert.equal(repo.buscar(r.id).status, 'pago');   // verifica o estado, não as chamadas
});`, notes: [{ l: '2', t: 'enable substitui as APIs de timer pelo relógio simulado; reset restaura.' }, { l: '14', t: 'O teste sobrevive a renomear métodos internos do repositório.' }] },
    { title: 'Over-mocking: o teste de interação quebra na refatoração e o de estado não (resultado medido)', lang: 'js', code: R`// V1 chama repo.salvar(...); V2 (refatoração interna) chama repo.inserir(...) com o mesmo efeito
const testeComMock = async (impl) => {
  const repo = { salvar: mock.fn(() => 1) };
  await impl({ repo, pagamento })([{ preco: 5, qtd: 2 }]);
  assert.equal(repo.salvar.mock.callCount(), 1);            // acoplado ao nome interno
};
const testeDeEstado = async (impl) => {
  const repo = repoFake();                                    // guarda o que for salvo ou inserido
  const r = await impl({ repo, pagamento })([{ preco: 5, qtd: 2 }]);
  assert.equal(r.total, 10); assert.equal(repo.dados[0].total, 10);
};
// mock de interação: V1 passa | V2 FALHA ;  estado (fake): V1 passa | V2 passa`, notes: [{ l: '5', t: 'Verifica o nome do método interno, não o comportamento.' }, { l: '12', t: 'Resultado do overmock.mjs do laboratório.' }] }
  ],
  bestPractices: ['Prefira verificação de estado e use interação apenas nas fronteiras e para efeitos não observáveis.', 'Crie dublês novos em cada teste (função montar) e reutilize fakes bem testados.', 'Não mocke o que você não possui: crie um adaptador seu e simule o adaptador.', 'Controle tempo e aleatoriedade por injeção ou mock.timers, nunca por sleep.', 'Simule também os caminhos de falha do terceiro (timeout, 5xx, resposta parcial).', 'Mais de três mocks em um teste indicam acoplamento ou design com dependências demais.', 'Proteja-se contra dublês que mentem com testes de contrato e fixtures de respostas reais.'],
  mistakes: ['Mockar tudo e testar apenas os mocks.', 'Verificar ordem e contagem de chamadas internas sem necessidade.', 'Mockar o objeto sob teste.', 'Mocks globais (Date, fetch) que vazam entre testes.', 'Stubs com dados que o terceiro nunca devolve.', 'Ignorar o caminho de erro do terceiro.'],
  market: R`**Saber escolher entre estado e interação** e evitar **over-mocking** é um **diferencial** em **revisões de teste** e **entrevistas**; frameworks (Jest, Vitest, Sinon, Mockito) usam **a mesma taxonomia**, então o conhecimento **transfere**.`,
  summary: R`Dublês de teste (dummy, stub, spy, mock e fake) substituem dependências difíceis, mas mocks de interação demais acoplam o teste à implementação: no laboratório, renomear internamente salvar para inserir quebrou o teste com mocks e não o de estado com fake. Use mock.fn, mockImplementation e mock.timers do node:test (5 testes passam), prefira estado, simule apenas as fronteiras, não mocke o que você não possui e proteja-se de dublês que mentem com testes de contrato.`,
  refs: [REF2.mocksArentStubs, REF2.testDouble, REF2.nodeMock, REF.nodeTest, REF.nonDeterminism],
  cards: [
    { q: 'Qual a diferença entre stub e spy?', a: 'O stub devolve respostas fixas; o spy registra as chamadas para verificação posterior (uma mock.fn serve como os dois).' },
    { q: 'O que o experimento de over-mocking mostrou?', a: 'Após renomear salvar para inserir sem mudar o comportamento, o teste de mock falhou e o teste de estado com fake passou.' },
    { q: 'O que significa "não mocke o que você não possui"?', a: 'Não simule tipos de terceiros diretamente nos testes; crie um adaptador próprio, simule-o e teste o adaptador com integração ou contrato.' },
    { q: 'Como testar um timeout de 60 s sem esperar?', a: 'Com mock.timers: enable, tick(ms) para avançar o relógio e reset ao final.' }
  ]
}
];
