// C5.5 — Ferramentas de teste para JavaScript. Aulas 3 e 4 (Supertest; Cypress).
import { REF } from './c55-a.mjs';
const R = String.raw;

export const REF2 = {
  supertest: { title: 'Supertest — HTTP assertions', url: 'https://github.com/ladjs/supertest', kind: 'doc' },
  express: { title: 'Express — Documentation', url: 'https://expressjs.com/', kind: 'doc' },
  cypressDocs: { title: 'Cypress — Documentation', url: 'https://docs.cypress.io/', kind: 'doc' },
  cypressRetry: { title: 'Cypress — Retry-ability', url: 'https://docs.cypress.io/app/core-concepts/retry-ability', kind: 'doc' },
  cypressBest: { title: 'Cypress — Best Practices', url: 'https://docs.cypress.io/app/core-concepts/best-practices', kind: 'doc' },
  cypressNetwork: { title: 'Cypress — Network Requests (intercept)', url: 'https://docs.cypress.io/app/guides/network-requests', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'ftj-03', moduleId: 'm2', order: 3, minutes: 70, tags: ['Supertest', 'Express 5', 'testes de API', 'HTTP', 'status', 'corpo JSON'],
  title: 'Supertest: testar APIs HTTP do Express em processo, sem abrir portas nem subir servidores',
  objectives: ['Estruturar uma API Express 5 testável (fábrica do app sem listen)', 'Escrever testes de API com Supertest: status, cabeçalhos e corpo', 'Testar caminhos de erro: validação (422), inexistente (404), JSON inválido (400) e payload grande (413)', 'Injetar dependências (gateway, relógio, repositório) para isolar efeitos', 'Testar concorrência simples e estado persistido', 'Saber o que o Supertest não cobre (rede real, TLS, proxy) e como complementar'],
  intro: R`O **Supertest** envia requisições HTTP a um **app Express** (ou qualquer §http.Server§) **em processo**, abrindo uma **porta efêmera** por baixo dos panos e fechando em seguida. Combina com **Jest, Vitest ou node:test**. No laboratório (**Supertest 7.3.2**, **Express 5.3.0**, sob Vitest), **5 testes** passaram em **1,44 s**: **201** com corpo e cobrança, **422/404**, **400 para JSON inválido**, **413 para corpo acima de 10 kb** e **3 requisições em paralelo** com ids distintos.`,
  theory: R`### Por que Supertest
Testar a **API real pela interface HTTP** (rota, *middlewares*, parser JSON, códigos de status, cabeçalhos) **sem** processo externo, **sem porta fixa** e **sem esperas**. É um **teste de integração estreito** (aula tst-02): **rotas + serviço + banco real em memória**, com **terceiros falsos**.

### Arquitetura testável
**Exporte o app sem chamar §listen§** (fábrica):
§criarApp({ pagamento, notificador, relogio, repo })§ monta o Express, as rotas e devolve §{ app, repo, servico }§. **Um arquivo separado** (§servidor.mjs§) chama §app.listen§. **Benefícios:** **testes** criam **apps novos** (banco novo, relógio fixo) **sem conflito**; **injeção de dependências** (pat-04): o teste passa um **gateway falso**.
**Express 5** (5.3.0): **promessas rejeitadas** em handlers **vão ao *error handler*** automaticamente (sem §try/catch§ por rota); o **laboratório** ainda usa §try/catch§ para mapear **erros de domínio a 422**.

### Anatomia do teste
- §request(app)§ **sobe** o servidor em porta efêmera **para cada requisição**; §.post('/pedidos').send({...})§; §.set('Header', 'valor')§; §.query({...})§;
- **Asserções fluentes:** §.expect(201)§, §.expect('Content-Type', /json/)§, §.expect(422, { erro: '...' })§ (status **e** corpo);
- **Ou** leia §res.status§, §res.body§, §res.headers§ e **asserte com o runner** (§expect(res.body).toEqual(...)§): **mais legível** para **corpos grandes**;
- **Async/await** (§await request(app).get(...)§); **nunca** deixe a promessa **sem await**.

### Medido: os 5 testes do laboratório
1. **Fluxo feliz:** §POST /pedidos§ com cupom §bemvindo10§ → **201**, **§Content-Type: json§**, corpo §{ id: 1, status: 'pago', total: 18 }§; o **gateway falso** recebeu §{ pedidoId: 1, valor: 18 }§; §GET /pedidos/1§ → **200** com §status: 'pago'§, §cliente: 'ana'§ e **1 item**;
2. **Erros de domínio:** lista vazia → **422** §{ erro: 'pedido sem itens' }§; cupom desconhecido → **422**; pedido inexistente → **404** §{ erro: 'pedido não encontrado' }§; rota inexistente → **404** (o Express responde);
3. **Corpo inválido:** §'{"cliente": '§ (JSON truncado) → **400** com §{ erro: 'JSON inválido' }§ (**error handler** converte o §entity.parse.failed§); **corpo de 20.000 caracteres** → **413** (limite de **10 kb** do §express.json§);
4. **Pagamento recusado:** **201** com §status: 'novo'§ e §motivo§; o **repositório** (acessado direto) tem §{ novo: 1 }§;
5. **Paralelismo:** **3 POSTs simultâneos** → ids **[1, 2, 3]** (ordenados): **o repositório SQLite** serializa as gravações.
**Achado de design:** o **error handler** do Express **precisa** ter **4 parâmetros** (§err, req, res, next§) para ser reconhecido; **sem** o 4º, o Express o trata como **middleware comum** e o erro cai no **padrão** (HTML).

### Autenticação, cookies e arquivos
- **Cabeçalhos:** §.set('Authorization', 'Bearer ' + token)§: gere o **token de teste** com a **mesma biblioteca** (C4.4) ou **injete** o *verificador*;
- **Sessões/cookies:** §request.agent(app)§ **mantém cookies** entre chamadas;
- **Upload:** §.attach('arquivo', buffer, 'nome.png')§; **download:** §.buffer()§ e §.parse()§.
(**Não executados** neste laboratório: são **recursos documentados** do Supertest.)

### O que fazer em cada teste de API
1. **Prepare** os dados **pela API** (ou direto no repositório de teste), **não** pela UI;
2. **Verifique** **status**, **forma do corpo** e **efeito persistido**;
3. **Teste erros** (400, 401, 403, 404, 409, 413, 422, 429) **tanto quanto** o caminho feliz;
4. **Contratos:** compare com o **OpenAPI** (§jest-openapi§, §openapi-validator§) **ou** teste de **contrato** (C5.6);
5. **Nomes** que dizem **o comportamento** ("pagamento recusado mantém o pedido como novo").

### Limites do Supertest
- **Não** exercita **rede real**, **TLS**, **proxy reverso**, **HTTP/2**, **limites do SO**, **timeouts** de balanceador;
- **Não** valida o **front-end**; para isso **E2E** (ftj-04 e ftj-05);
- **Servidores externos:** funciona com **URL** (§request('http://host')§), mas **evite** testes automáticos contra **ambientes compartilhados**;
- **WebSocket/SSE:** não é o foco (use clientes específicos).

### Comparando com testar via §fetch§
O teste do **C5.4** abria o servidor e usava §fetch§: **funciona**, mas exige **abrir/fechar** manualmente. O **Supertest** **esconde** essa mecânica, **dá asserções fluentes** e **funciona com qualquer runner**. Para **APIs Fastify**, use §fastify.inject§; para **NestJS**, §@nestjs/testing§ + **Supertest** (C4.2).

### Boas práticas
- **App novo por teste** (banco em memória novo; **ids previsíveis**);
- **Relógio e dependências externas injetados**;
- **Um comportamento por teste**; **dados mínimos**;
- **Cuidado com testes paralelos** que **compartilham** o app: **isole**;
- **Limite de corpo e erros de parse** testados (**segurança**: C4.4/C7);
- **Rode no CI** como **teste de integração** (PR).`,
  concepts: [
    { term: 'Supertest', def: 'Biblioteca que envia requisições HTTP a um app em processo e oferece asserções fluentes sobre a resposta.' },
    { term: 'Fábrica de app', def: 'Função que monta e devolve a aplicação sem iniciar o servidor, facilitando testes isolados.' },
    { term: 'Error handler (Express)', def: 'Middleware com quatro parâmetros (err, req, res, next) que trata erros lançados ou passados adiante.' },
    { term: '413 Payload Too Large', def: 'Status HTTP devolvido quando o corpo da requisição excede o limite configurado.' },
    { term: '422 Unprocessable Content', def: 'Status HTTP para requisições bem formadas, mas com dados semanticamente inválidos.' },
    { term: 'Agent', def: 'Instância do Supertest que mantém cookies entre requisições.' },
    { term: 'Teste de integração estreito', def: 'Teste que integra poucos componentes reais, mantendo os demais como dublês.' }
  ],
  examples: R`**Analogia:** o Supertest é um **cliente de testes dentro do restaurante**: bate na porta da cozinha (a rota), recebe o prato (a resposta) e confere **temperatura (status), apresentação (corpo) e se o estoque baixou (efeito)**, **sem sair para a rua**.

**Exemplo 1: erros.** JSON truncado devolve 400 com mensagem própria; corpo de 20 kb devolve 413.

**Exemplo 2: efeito persistido.** Pagamento recusado deixa o pedido "novo" no banco real.

**Exemplo 3: paralelismo.** Três POSTs simultâneos geram os ids 1, 2 e 3.`,
  code: [
    { title: 'App Express 5 testável: fábrica sem listen (JavaScript; testado)', lang: 'js', code: R`import express from 'express';
import { ServicoPedidos } from './servico.mjs';
import { RepositorioPedidos } from './repositorio.mjs';

export function criarApp({ pagamento, notificador, relogio = () => new Date(), repo = new RepositorioPedidos() } = {}) {
  const servico = new ServicoPedidos({ repo, pagamento, notificador, relogio });
  const app = express();
  app.use(express.json({ limit: '10kb' }));
  app.post('/pedidos', async (req, res) => {
    try { res.status(201).json(await servico.criar(req.body)); } catch (e) { res.status(422).json({ erro: e.message }); }
  });
  app.get('/pedidos/:id', (req, res) => {
    const p = repo.buscar(Number(req.params.id));
    if (!p) return res.status(404).json({ erro: 'pedido não encontrado' });
    res.json(p);
  });
  // 4 parâmetros: reconhecido como error handler
  app.use((err, req, res, next) => res.status(err.status || 500).json({ erro: err.type === 'entity.parse.failed' ? 'JSON inválido' : err.message }));
  return { app, repo, servico };
}`, notes: [{ l: '5', t: 'O app é montado, mas não escuta em porta nenhuma.' }, { l: '17', t: 'O handler de erro precisa dos 4 parâmetros.' }] },
    { title: 'Testes com Supertest sob Vitest (JavaScript; 5 testes passam em 1,44 s)', lang: 'js', code: R`import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.mjs';

const relogio = () => new Date('2026-11-25T10:00:00Z');
const corpo = (extra = {}) => ({ cliente: 'ana', itens: [{ sku: 'A', qtd: 2, preco: 10 }], ...extra });

test('POST cria, cobra e GET devolve o pedido persistido', async () => {
  const cobrancas = [];
  const { app } = criarApp({ relogio, pagamento: { cobrar: async (c) => { cobrancas.push(c); return { aprovado: true }; } } });
  const r = await request(app).post('/pedidos').send(corpo({ cupom: 'bemvindo10' })).expect('Content-Type', /json/).expect(201);
  expect(r.body).toEqual({ id: 1, status: 'pago', total: 18 });
  expect(cobrancas).toEqual([{ pedidoId: 1, valor: 18 }]);
  await request(app).get('/pedidos/1').expect(200);
});

test('JSON inválido vira 400 e payload grande vira 413', async () => {
  const { app } = criarApp({ relogio });
  const ruim = await request(app).post('/pedidos').set('content-type', 'application/json').send('{"cliente": ');
  expect(ruim.status).toBe(400); expect(ruim.body).toEqual({ erro: 'JSON inválido' });
  const grande = await request(app).post('/pedidos').send({ cliente: 'x'.repeat(20000), itens: [] });
  expect(grande.status).toBe(413);
});

test('3 requisições em paralelo mantêm ids distintos', async () => {
  const { app } = criarApp({ relogio });
  const rs = await Promise.all([1, 2, 3].map((n) => request(app).post('/pedidos').send(corpo({ cliente: 'c' + n }))));
  expect(rs.map((r) => r.body.id).sort()).toEqual([1, 2, 3]);
});`, notes: [{ l: '10', t: 'expect(status) e expect(header) fluentes; também dá para usar o runner.' }, { l: '24', t: 'Cada teste cria um app novo com banco em memória.' }] },
    { title: 'Autenticação, cookies e upload com Supertest (JavaScript; trecho conceitual, não executado nesta aula)', lang: 'js', code: R`// Cabeçalho de autorização
await request(app).get('/perfil').set('Authorization', 'Bearer ' + tokenDeTeste).expect(200);

// Agent: mantém cookies entre chamadas (login por sessão)
const agente = request.agent(app);
await agente.post('/login').send({ email: 'ana@exemplo.com', senha: 'segredo-de-teste' }).expect(204);
await agente.get('/conta').expect(200);

// Upload
await request(app).post('/avatar').attach('arquivo', Buffer.from('PNG...'), 'avatar.png').expect(201);`, notes: [{ l: '5', t: 'O agent guarda o cookie de sessão.' }, { l: '9', t: 'attach monta o multipart.' }] }
  ],
  bestPractices: ['Exporte o app como fábrica sem listen e injete dependências nos testes.', 'Crie um app e um banco novos por teste para ter isolamento e ids previsíveis.', 'Verifique status, forma do corpo e o efeito persistido, inclusive nos caminhos de erro.', 'Teste limites de corpo e erros de parse (400 e 413) e o formato do erro padrão.', 'Garanta o error handler com 4 parâmetros e cabeçalhos de segurança relevantes.', 'Combine com testes de contrato e E2E; Supertest não cobre rede, TLS nem proxy.', 'Sempre use await nas chamadas.'],
  mistakes: ['Chamar listen no módulo do app e deixar portas abertas nos testes.', 'Compartilhar o mesmo app e banco entre testes paralelos.', 'Testar só o caminho feliz.', 'Esquecer o await e deixar a asserção sem efeito.', 'Error handler com 3 parâmetros (não é reconhecido).', 'Usar o Supertest contra ambientes compartilhados.'],
  market: R`**Testes de API com Supertest** (Express/Nest) são **rotina** em vagas **backend Node**; mostrar **cobertura de erros** (400/404/413/422) e **isolamento** é **o que revisores procuram**.`,
  summary: R`O Supertest testa APIs HTTP em processo, em porta efêmera, com asserções fluentes. Estruture o Express 5 como fábrica sem listen, injete gateway, relógio e repositório e verifique status, corpo e efeito persistido. Medido (Supertest 7.3.2, Express 5.3.0, Vitest): 5 testes em 1,44 s cobrindo 201, 422, 404, 400 (JSON inválido), 413 (corpo acima de 10 kb) e 3 requisições paralelas com ids distintos. Não cobre rede real, TLS nem proxy; autenticação, cookies e upload foram apenas descritos.`,
  refs: [REF2.supertest, REF2.express, REF.vitestGuide, REF.nodeTest],
  cards: [
    { q: 'Por que exportar o app sem chamar listen?', a: 'Para que cada teste crie um app isolado e o Supertest abra portas efêmeras, sem conflitos nem servidores presos.' },
    { q: 'Como o Express reconhece um error handler?', a: 'Pelos quatro parâmetros (err, req, res, next); com três é tratado como middleware comum.' },
    { q: 'Quais erros HTTP o laboratório testou além do 201?', a: '422 (validação), 404 (inexistente), 400 (JSON inválido) e 413 (corpo acima do limite de 10 kb).' },
    { q: 'O que o Supertest não cobre?', a: 'Rede real, TLS, proxy reverso, HTTP/2 e limites do ambiente; use E2E e testes de contrato.' }
  ]
},
{
  id: 'ftj-04', moduleId: 'm2', order: 4, minutes: 75, tags: ['Cypress', 'E2E', 'retry-ability', 'cy.intercept', 'comandos encadeados', 'Electron'],
  title: 'Cypress: E2E que roda dentro do navegador, com retentativa automática de comandos e asserções',
  objectives: ['Explicar a arquitetura do Cypress (executa no navegador) e suas consequências', 'Escrever specs com cy.visit, cy.get, cy.contains e asserções com retentativa automática', 'Entender a fila de comandos e por que não se usa async/await com cy', 'Usar cy.intercept para simular a rede e cy.wait para sincronizar', 'Corrigir um erro real de asserção (should("match") em elemento x texto)', 'Pesar os custos (binário grande, limites de abas e origens) e comparar com Playwright'],
  intro: R`O **Cypress** executa os testes **dentro do navegador**, ao lado da aplicação, com **retentativa automática** de comandos e asserções e uma **interface de depuração** (modo *open*). No laboratório (**Cypress 16.3.0**, Electron, headless), **7 testes** passaram em **3 s**; antes, **1 falhou de verdade**: §should('match', regex)§ **testava o seletor do elemento** e não o texto. Corrigido com §invoke('text')§. O **binário** do Cypress ocupou **811 MB** no cache: um custo real.`,
  theory: R`### Arquitetura e consequências
O Cypress **roda no mesmo *event loop* da página** (o código do teste é carregado no navegador): **acesso síncrono ao DOM**, **espiar e controlar a rede** (§cy.intercept§), **depuração por *time travel*** (snapshots a cada comando) e **recarregamento automático** no modo interativo. **Preço:** **uma aba** e **uma origem** por teste (limites **documentados** e **atenuados** por §cy.origin§), **não** automatiza **vários navegadores ao mesmo tempo**, e os testes são **JavaScript/TypeScript no navegador** (**sem** acesso direto ao Node: **tarefas** via §cy.task§). **Binário** próprio (**Electron**) baixado no **cache** (**811 MB** medidos aqui); suporta **Chrome**, **Firefox**, **Edge** e **Electron**.

### Comandos encadeados e fila
Os comandos §cy.*§ **não executam na hora**: **entram numa fila** e **rodam depois**, **um por vez**, **com retentativa**. Por isso:
- **não use** §async/await§ com §cy§ (**os comandos não devolvem promessas reais**): encadeie §.then()§ ou §.should()§;
- **variáveis** com **alias** (§.as('pedido')§ e §cy.get('@pedido')§) ou §.then()§;
- **asserções** (§.should(...)§) **são comandos** que **repetem** o comando anterior **até passar** ou **estourar o tempo** (§defaultCommandTimeout§: **4000 ms** no laboratório).

### Retentativa (*retry-ability*)
§cy.get('[role=status]').should('have.text', 'Erro: cupom desconhecido')§ **tenta de novo** até o texto **aparecer** ou o **timeout**: é o **equivalente Cypress** da **espera por condição** (aula tst-03). **Medido:** com **resposta atrasada** em **0, 100, 200 e 300 ms**, os **4 testes passaram sem nenhum §wait§ numérico** (**285, 348, 463 e 562 ms**). **Regra de ouro:** **nunca** §cy.wait(500)§; use **asserções** ou §cy.wait('@alias')§ para **requisições**.
**Cuidado:** **só o último comando** da cadeia **antes** de §.should§ é **repetido**; **encadeamentos longos** com **ações** (§click§) **não** são repetidos (**ações** não são retentadas). **Prefira** §cy.contains('button', 'Comprar').click()§ e **asserções finais**.

### O erro que o laboratório encontrou
Primeira versão: §cy.get('[role=status]').should('match', /Pedido \d+ pago: R\$ 20\.00/)§. **Falhou** após **4000 ms**: "**expected '<p#resultado>' to match /Pedido .../**". Motivo: no Cypress/Chai-jQuery, **§match§ aplicado ao elemento** compara **o seletor** (jQuery §.is()§), **não o texto**. **Correção:** §.invoke('text').should('match', /.../)§ **ou** §.should('have.text', ...)§ / §.should('contain.text', ...)§. **Lição:** a **mensagem** do erro **mostrava o elemento**, **não o texto**: **leia** o erro **inteiro**.

### Seletores e boas práticas oficiais
- **Prefira** §data-cy§/§data-testid§ ou **texto/rótulo** (§cy.contains§); **evite** classes de estilo e posição (aula tst-03);
- **Não dependa** de **estado de testes anteriores**: cada teste **parte do zero** (§beforeEach§ cria dados **via API/cy.task**, **não pela UI**);
- **Não logue pela UI** em todo teste: **§cy.session§** (cache de sessão) e **login por API**;
- **Controle a rede:** **§cy.intercept§** para **respostas fixas** (falhas simuladas) ou **espiar** chamadas reais;
- **Não teste sites de terceiros**;
- **Configure** §baseUrl§ para §cy.visit('/')§.

### cy.intercept e sincronização
No laboratório: §cy.intercept('POST', '/pedidos', { statusCode: 422, body: { erro: 'estoque indisponível' } }).as('pedido')§; depois do clique, §cy.wait('@pedido')§ e a **asserção** do texto §Erro: estoque indisponível§: **passou em 313 ms** e **sem backend real**. **Usos:** **simular** erros **raros** (500, timeout, resposta lenta), **espiar** payloads, **stubar** terceiros. **Cuidado:** **excesso de stubs** vira **teste de mock** (**perde** a integração): **mantenha** um **E2E feliz sem stubs**.

### Configuração (cypress.config.mjs)
§defineConfig({ e2e: { baseUrl, specPattern, supportFile, video, screenshotOnRunFailure, defaultCommandTimeout } })§. **Execução:** §npx cypress open§ (**interativo**), §npx cypress run§ (**headless/CI**; escolhe **Electron** por padrão, §--browser chrome§). **Variáveis do cache:** §CYPRESS_CACHE_FOLDER§. **O servidor da aplicação** precisa **estar no ar** (script ou §start-server-and-test§): no laboratório, §node servidor-e2e.mjs§ **antes**.
**Medido (§cypress run§, spec com 7 testes):** **Tests 7 / Passing 7 / Failing 0**; **Duration: 3 seconds** (1.145 ms do primeiro teste, **o resto** entre **285 e 562 ms**).

### Cypress x Playwright (resumo; aula ftj-05 aprofunda)
| Critério | Cypress | Playwright |
|---|---|---|
| **Modelo** | **no navegador**, comandos em fila | **fora do navegador** (protocolo), async/await |
| **Depuração** | **time travel** excelente | **trace viewer**, inspetor |
| **Abas/origens** | **limitado** (cy.origin) | **livre** (várias abas, contextos, origens) |
| **Navegadores** | Chrome, Firefox, Edge, Electron | Chromium, Firefox, WebKit |
| **Paralelismo** | pago/serviço (Cypress Cloud) ou divisão manual | **embutido** (workers, shards) |
| **Linguagem** | JS/TS | JS/TS, Python, Java, .NET |
| **Instalação** | **binário grande** (811 MB medidos) | navegadores próprios (ou **canal do sistema**: Chrome) |

### Componentes e outras camadas
**Component Testing** (montar componentes React/Vue/Angular em um navegador real) e **API testing** (§cy.request§) existem no Cypress; **não foram executados** aqui. **Para API pura**, **Supertest** (ftj-03) é **mais simples** e **rápido**.

### Quando escolher
**Cypress**: **time** que **valoriza depuração visual**, **app de uma origem**, **equipe front-end** que **escreve os testes**. **Playwright**: **multi-navegador/WebKit**, **várias abas/origens**, **paralelismo nativo**, **projetos poliglotas**. **Em ambos:** **poucos E2E** (pirâmide).

### Armadilhas
- **Esperas numéricas** (§cy.wait(1000)§); **async/await** com §cy§; **dependência entre testes**;
- **Stubs demais**; **login pela UI** sempre; **seletores frágeis**;
- **Servidor da aplicação não iniciado** no CI (falha **ruidosa**, mas **comum**);
- **Cache do binário** não persistido no CI (**baixa 800 MB a cada execução**): **guarde** o cache (§actions/cache§).`,
  concepts: [
    { term: 'Cypress', def: 'Ferramenta de testes E2E que executa o código de teste dentro do navegador, com retentativa automática de comandos e asserções.' },
    { term: 'Retry-ability', def: 'Capacidade do Cypress de repetir comandos de consulta e asserções até passarem ou esgotar o tempo.' },
    { term: 'cy.intercept', def: 'Comando do Cypress para espiar, modificar ou simular requisições de rede.' },
    { term: 'Alias', def: 'Nome dado a um comando ou requisição (.as) para reutilizá-lo depois com @nome.' },
    { term: 'cy.session', def: 'Comando que guarda e restaura o estado de sessão entre testes, evitando login repetido.' },
    { term: 'Time travel', def: 'Depuração do Cypress que mostra o estado da página a cada comando executado.' },
    { term: 'Cache do binário', def: 'Pasta onde o Cypress guarda o executável baixado, separada dos pacotes npm.' }
  ],
  examples: R`**Analogia:** o Cypress é um **assistente que mora dentro da loja**: vê tudo de perto e **insiste** (retenta) até o item aparecer na prateleira, mas **só trabalha em uma loja por vez** e ocupa um **armário grande** (o binário).

**Exemplo 1: retentativa.** Respostas atrasadas em 0, 100, 200 e 300 ms passam sem nenhum wait numérico.

**Exemplo 2: erro de asserção.** should("match") no elemento comparava o seletor; invoke("text") resolveu.

**Exemplo 3: intercept.** Uma falha 422 simulada aparece na tela sem backend real.`,
  code: [
    { title: 'cypress.config.mjs e spec (JavaScript; 7 testes passam em 3 s)', lang: 'js', code: R`// cypress.config.mjs
import { defineConfig } from 'cypress';
export default defineConfig({
  e2e: { baseUrl: 'http://127.0.0.1:4571', specPattern: 'cypress/e2e/**/*.cy.js', supportFile: false, video: false, screenshotOnRunFailure: false, defaultCommandTimeout: 4000 }
});

// cypress/e2e/compra.cy.js
describe('Compra', () => {
  it('compra com sucesso', () => {
    cy.visit('/');
    cy.get('#qtd').clear().type('2');
    cy.contains('button', 'Comprar').click();
    cy.get('[role=status]').invoke('text').should('match', /Pedido \d+ pago: R\$ 20\.00/);   // invoke('text'): o texto, não o elemento
  });
  [0, 100, 200, 300].forEach((atraso) => {
    it('espera automática com resposta atrasada em ' + atraso + ' ms', () => {
      cy.visit('/?atraso=' + atraso);
      cy.contains('button', 'Comprar').click();
      cy.get('[role=status]').invoke('text').should('match', /^Pedido \d+ pago/);   // retenta até passar (4 s)
    });
  });
});`, notes: [{ l: '13', t: 'Sem invoke("text"), match comparava o seletor do elemento.' }, { l: '20', t: 'Nenhum cy.wait numérico: a asserção retenta.' }] },
    { title: 'cy.intercept para simular falhas e cy.wait no alias (JavaScript; testado)', lang: 'js', code: R`it('cy.intercept simula falha do servidor', () => {
  cy.intercept('POST', '/pedidos', { statusCode: 422, body: { erro: 'estoque indisponível' } }).as('pedido');
  cy.visit('/');
  cy.contains('button', 'Comprar').click();
  cy.wait('@pedido');                                                         // sincroniza com a requisição
  cy.get('[role=status]').should('have.text', 'Erro: estoque indisponível');  // asserção com retentativa
});`, notes: [{ l: '2', t: 'A resposta é simulada: o backend nem é chamado.' }, { l: '5', t: 'wait no alias espera a requisição, não um tempo fixo.' }] },
    { title: 'Executar no CI: servidor, cache do binário e navegador (shell/YAML; exemplo, não executado em runner)', lang: 'yaml', code: R`# passos de um job (trecho)
- uses: actions/cache@v4
  with:
    path: ~/.cache/Cypress
    key: cypress-DOLAR{{ runner.os }}-DOLAR{{ hashFiles('package-lock.json') }}
- run: npm ci
- run: node servidor-e2e.mjs &              # a aplicação precisa estar no ar
- run: npx wait-on http://127.0.0.1:4571
- run: npx cypress run --browser chrome`, notes: [{ l: '3', t: 'Sem cache, o binário de ~800 MB é baixado a cada execução.' }, { l: '8', t: 'wait-on evita rodar antes de o servidor responder.' }] }
  ],
  bestPractices: ['Nunca use cy.wait numérico: use asserções com retentativa ou cy.wait em aliases de requisições.', 'Não use async/await com cy; encadeie comandos, aliases e then.', 'Cada teste parte do zero, com dados criados por API ou tarefa, e reutilize sessão com cy.session.', 'Use seletores estáveis (data-cy, texto, rótulo) e verifique o texto com invoke("text") ou have.text.', 'Mantenha ao menos um E2E sem stubs de rede.', 'Persista o cache do binário no CI e inicie o servidor da aplicação antes do cypress run.', 'Guarde screenshots e vídeos das falhas como artefatos.'],
  mistakes: ['should("match") em elemento esperando comparar texto.', 'cy.wait(1000) em vez de asserções.', 'async/await com comandos cy.', 'Testes dependentes uns dos outros.', 'Stubs demais, perdendo a integração.', 'CI sem cache do binário e sem servidor no ar.'],
  market: R`**Cypress** e **Playwright** dividem o **mercado de E2E web**; **dominar a retentativa**, o **intercept** e os **limites de arquitetura** ajuda a **escolher a ferramenta certa** em **entrevistas** e **projetos**.`,
  summary: R`O Cypress executa os testes no navegador, com fila de comandos e retentativa automática de comandos de consulta e asserções (sem async/await com cy). Medido (16.3.0, Electron, headless): 7 testes passaram em 3 s, incluindo respostas atrasadas em 0 a 300 ms sem wait numérico e uma falha simulada com cy.intercept; antes, should("match") no elemento falhou por comparar o seletor, resolvido com invoke("text"). O binário ocupou 811 MB; há limites de abas e origens. Compare com o Playwright e guarde o cache no CI.`,
  refs: [REF2.cypressDocs, REF2.cypressRetry, REF2.cypressBest, REF2.cypressNetwork],
  cards: [
    { q: 'Por que não se usa async/await com comandos cy?', a: 'Os comandos entram em uma fila e executam depois; não devolvem promessas reais. Use encadeamento, aliases e then.' },
    { q: 'O que aconteceu com should("match") no laboratório?', a: 'No elemento, match compara o seletor, não o texto; a correção foi invoke("text").should("match", regex) ou have.text.' },
    { q: 'Como o Cypress evita esperas fixas?', a: 'Asserções e comandos de consulta são repetidos até passar ou estourar o timeout; para requisições, usa-se cy.wait("@alias").' },
    { q: 'Qual é um custo prático do Cypress?', a: 'O binário grande (811 MB medidos), que precisa de cache no CI, e os limites de uma aba e uma origem por teste.' }
  ]
}
];
