// C5.6 — Contrato, carga e análise estática. Aulas 1 e 2 (testes de contrato com Pact; testes de carga com k6).
const R = String.raw;

export const REF = {
  pactDocs: { title: 'Pact — Documentation', url: 'https://docs.pact.io/', kind: 'doc' },
  pactHow: { title: 'Pact — How Pact works', url: 'https://docs.pact.io/getting_started/how_pact_works', kind: 'doc' },
  pactJs: { title: 'Pact — JavaScript implementation guide', url: 'https://docs.pact.io/implementation_guides/javascript/', kind: 'doc' },
  pactCanIDeploy: { title: 'Pact — can-i-deploy', url: 'https://docs.pact.io/pact_broker/can_i_deploy', kind: 'doc' },
  cdc: { title: 'Ian Robinson — Consumer-Driven Contracts: A Service Evolution Pattern', url: 'https://martinfowler.com/articles/consumerDrivenContracts.html', kind: 'artigo' },
  contractTest: { title: 'Martin Fowler — ContractTest', url: 'https://martinfowler.com/bliki/ContractTest.html', kind: 'artigo' },
  k6Docs: { title: 'Grafana k6 — Documentation', url: 'https://grafana.com/docs/k6/latest/', kind: 'doc' },
  k6Scenarios: { title: 'Grafana k6 — Scenarios', url: 'https://grafana.com/docs/k6/latest/using-k6/scenarios/', kind: 'doc' },
  k6Thresholds: { title: 'Grafana k6 — Thresholds', url: 'https://grafana.com/docs/k6/latest/using-k6/thresholds/', kind: 'doc' },
  k6TestTypes: { title: 'Grafana k6 — Test types', url: 'https://grafana.com/docs/k6/latest/testing-guides/test-types/', kind: 'doc' },
  k6OpenClosed: { title: 'Grafana k6 — Open and closed models', url: 'https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'tav-01', moduleId: 'm1', order: 1, minutes: 80, tags: ['testes de contrato', 'Pact', 'consumer-driven', 'provedor', 'estados', 'can-i-deploy'],
  title: 'Testes de contrato com Pact: o consumidor define o que usa e o provedor prova que continua atendendo',
  objectives: ['Explicar o problema que os testes de contrato resolvem e como diferem de integração e E2E', 'Escrever um teste de consumidor com Pact (PactV4) usando matchers e gerar o arquivo de contrato', 'Verificar o contrato contra o provedor real com estados do provedor', 'Distinguir mudança compatível (campo extra) de incompatível (campo renomeado ou removido)', 'Conhecer o papel do broker e do can-i-deploy (analisados, não executados)', 'Avaliar quando contratos valem a pena e quando não'],
  intro: R`Em sistemas com **vários times e serviços**, o **teste de integração ponta a ponta** é **lento e frágil**, e os **dublês** do consumidor **podem divergir** do provedor real. O **teste de contrato orientado ao consumidor** (*consumer-driven contract*) resolve isso: o **consumidor** registra **o que realmente usa** (um **arquivo de contrato**) e o **provedor** **verifica** que continua atendendo. No laboratório (**Pact 17.1.4**), **2 testes** do consumidor passaram e geraram o contrato; a **verificação do provedor correto** passou (200 e 404); com o campo **§nome§ renomeado para §name§** a verificação **falhou** com "**Actual map is missing the following keys: nome**" — e o **campo extra §vip§ não quebrou** nada.`,
  theory: R`### O problema
O **consumidor** (front-end, BFF, outro serviço) depende de **campos, tipos e códigos** da resposta do **provedor**. Se o provedor **renomeia** um campo, **remove** algo ou **muda um tipo**, o consumidor **quebra em produção**, **e todos os testes de cada lado continuam verdes**: o consumidor testa **contra um mock** (aula tst-04) e o provedor testa **a si mesmo**. Opções:
- **E2E** com **ambos no ar**: **lento**, **caro**, **ambientes** complexos (aula tst-03);
- **Documentação** (OpenAPI): **descreve** o que o provedor **oferece**, **não** o que cada consumidor **usa**;
- **Testes de contrato**: **verificam o acordo** **entre os dois lados**, **cada um sozinho**, **sem ambiente conjunto**.

### Como o Pact funciona
1. **Consumidor** escreve um teste que **descreve interações** ("quando eu pedir GET /clientes/1, espero 200 com {id, nome, email}") e roda **contra um servidor simulado do Pact** (**mock server**, em Rust via *pact-core*): o **código real do consumidor** (§buscarCliente§) **é exercitado**;
2. Se o consumidor passa, o Pact **grava o contrato** (**§pacts/loja-web-api-clientes.json§**) com **interações**, **estados do provedor** e **regras de correspondência** (*matching rules*);
3. O **provedor** **reproduz** cada interação **contra o provedor real** (**Verifier**) e **compara** respostas com o contrato; **estados** (§given§) preparam os dados (§'o cliente 1 existe'§);
4. (**Opcional, em equipes**) o **Pact Broker/PactFlow** **guarda** contratos e resultados, e o **§can-i-deploy§** **responde** "**posso implantar esta versão?**" **verificando** **compatibilidade** com os **ambientes** (**não executado** neste laboratório).
**Orientado ao consumidor:** o **contrato** só contém **o que o consumidor usa**; **o provedor pode evoluir livremente** o que **ninguém usa**.

### Medido: o consumidor (PactV4)
§new PactV4({ consumer: 'loja-web', provider: 'api-clientes', dir: 'pacts', spec: 4 })§; **duas interações**:
1. **§given('o cliente 1 existe')§** + §uponReceiving('uma busca do cliente 1')§ + §withRequest('GET', '/clientes/1')§ + §willRespondWith(200, ...)§ com **corpo com matchers**: §id: integer(1)§, §nome: string('Ana Souza')§, §email: regex(/^[^@\s]+@[^@\s]+$/, 'ana@exemplo.com')§;
2. **cliente 999 inexistente**: **404** com §{ erro: like('cliente não encontrado') }§.
**§executeTest(async (mock) => ...)§** chama **o código real** (§buscarCliente(mock.url, 1)§) e **verifica** o **resultado** (§saudacao: 'Olá, Ana!'§). **2 testes passaram** em ~2 s (inclui carregar o *core* nativo). O **JSON** do contrato guardou o **corpo de exemplo** e as **regras** (§$.id§ **integer**, §$.email§ **regex**).
**Matchers (MatchersV3):** §like§ (**mesmo tipo**), §integer§, §string§, §regex§, §eachLike§ (**lista** de objetos do **mesmo formato**), §datetime§, §uuid§: **evitam** acoplar o contrato a **valores exatos** (**só** o que importa: **forma e tipo**).

### Medido: a verificação do provedor
§new Verifier({ provider: 'api-clientes', providerBaseUrl, pactUrls: [...], stateHandlers: {...} }).verifyProvider()§ **com o provedor real** (Express em porta efêmera):
- **provedor correto** → **"has status code 200 (OK)"**, **"has a matching body (OK)"** e **404 (OK)**: **verificação passou**;
- **provedor com o campo §nome§ renomeado para §name§** (**mudança incompatível**) → **"has a matching body (FAILED)"**, "**$ -> Actual map is missing the following keys: nome**" e "**There were 1 pact failures**": **a mudança seria barrada no CI do provedor**, **antes** do deploy;
- **campo extra** (§vip§, que o provedor devolve e o contrato **não menciona**) **não quebrou**: **mudanças aditivas são compatíveis** (**lei de Postel**: "**seja liberal no que aceita**").
**Estados do provedor** (§stateHandlers§): **preparam** os dados de cada cenário ("o cliente 999 não existe"); aqui, **vazios** porque os dados são **fixos**; em um serviço real, **inserem/limpam** registros no banco de teste.

### O que é compatível e o que não é
| Mudança no provedor | Compatível? |
|---|---|
| **Adicionar** campo na resposta | **Sim** (se o consumidor ignora campos extras) |
| **Renomear/remover** campo usado | **Não** (verificação falha) |
| **Mudar o tipo** de um campo usado | **Não** |
| **Novo endpoint** | Sim |
| **Tornar obrigatório** um campo da **requisição** | **Não** (quebra consumidores que não o enviam) |
| **Mudar código de status** de erro (404 → 400) | **Não**, se o consumidor depende dele |
**Estratégias de evolução:** **expandir e contrair** (adicione o novo campo, **migre** consumidores, **depois** remova o antigo, com **contratos** dizendo **quando é seguro**); **versionamento** (C4.3); **depreciação** com prazo.

### Contratos x outros testes
| | **Contrato** | **Integração** | **E2E** |
|---|---|---|---|
| **Pergunta** | os dois lados **concordam** na interface? | meu código funciona com **meu** banco/HTTP? | o **sistema** funciona **para o usuário**? |
| **Ambiente** | **cada lado isolado** | um componente **real** + dublês | **tudo** no ar |
| **Detecta** | quebra de **interface** entre times | defeitos de **junção** local | **fluxos** completos |
| **Custo** | **baixo/médio** | médio | **alto** |
**Não substituem** uns aos outros: **contratos** **cobrem** a **fronteira entre times/serviços**; **integração** cobre **seu próprio** acesso a dados; **poucos E2E** cobrem **jornadas**.

### Quando vale a pena
- **Muitos consumidores** ou **times diferentes** (microsserviços, BFFs, apps móveis com **versões antigas** em campo);
- **Provedor** de **terceiros** que **você controla pouco**: **contratos** viram **testes de regressão** do que **você usa** (com cuidado);
- **Deploys independentes** que **precisam** de **can-i-deploy**.
**Não vale** (ou **custa mais que ganha**): **um** consumidor e **um** provedor **no mesmo repositório** e **mesmo time** (**integração** basta); **APIs públicas** com **milhares de consumidores desconhecidos** (use **OpenAPI** + **compatibilidade** + **versionamento**; contratos **bidirecionais** com **OpenAPI** existem no PactFlow, **não executados**).

### Boas práticas
1. **Contrato = o que o consumidor realmente usa**, **não** o schema inteiro;
2. **Matchers por tipo**, **não valores fixos** (exceto quando o valor **importa**);
3. **Um estado por cenário**, **nomes claros**;
4. **Testes do consumidor exercitam o código real** (não **mockam** o cliente HTTP);
5. **Verificação no CI do provedor a cada PR**; **contratos publicados** no **broker** com **versão/branch**;
6. **can-i-deploy** antes de **cada deploy**;
7. **Mensagens/eventos** (Kafka, filas) **também** têm contratos (**Pact de mensagens**: **não executado**).

### Armadilhas
- **Contrato com valores fixos demais** (quebra por **dados**, não por **interface**);
- **Estados** **mal preparados** (verificação **passa** ou **falha** por **dados**);
- **Provedor verificado contra versão antiga** do contrato (**sem broker**, arquivos **desatualizados**);
- **Usar Pact para testar regras de negócio** (**não** é o objetivo: **só** a **interface**);
- **Ignorar** o **caminho de erro** (404/422): **também** é **contrato**.`,
  concepts: [
    { term: 'Teste de contrato', def: 'Teste que verifica que consumidor e provedor concordam sobre o formato das mensagens trocadas, sem exigir um ambiente conjunto.' },
    { term: 'Consumer-driven contract', def: 'Contrato definido pelo que o consumidor realmente usa, verificado depois contra o provedor.' },
    { term: 'Estado do provedor', def: 'Preparação de dados no provedor para uma interação do contrato (por exemplo, "o cliente 1 existe").' },
    { term: 'Matching rules', def: 'Regras que fazem o contrato exigir forma e tipo, e não valores exatos.' },
    { term: 'Pact Broker', def: 'Serviço que armazena contratos e resultados de verificação, usado para can-i-deploy.' },
    { term: 'can-i-deploy', def: 'Verificação que informa se uma versão pode ser implantada sem quebrar os contratos do ambiente.' },
    { term: 'Mudança aditiva', def: 'Alteração que apenas acrescenta campos ou endpoints, normalmente compatível com consumidores existentes.' }
  ],
  examples: R`**Analogia:** o contrato é a **encomenda por escrito** entre uma padaria (provedor) e um restaurante (consumidor): o restaurante anota **o que usa** ("pão de 50 g, crocante"); a padaria **prova**, **toda manhã**, que **ainda atende**, e **pode inventar pães novos** sem avisar ninguém, mas **mudar o pão encomendado** exige **conversar antes**.

**Exemplo 1: contrato gerado.** Duas interações (cliente 1 e cliente 999) viram um arquivo JSON com regras de correspondência.

**Exemplo 2: mudança incompatível barrada.** nome vira name: a verificação falha com "missing the following keys: nome".

**Exemplo 3: mudança aditiva.** O campo vip extra não quebra nada.`,
  code: [
    { title: 'Teste do consumidor com PactV4 e matchers (JavaScript, Vitest; 2 testes passam e geram o contrato)', lang: 'js', code: R`import { test, expect } from 'vitest';
import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import { buscarCliente } from '../src/consumidor.mjs';

const { like, integer, string, regex } = MatchersV3;
const pact = new PactV4({ consumer: 'loja-web', provider: 'api-clientes', dir: 'pacts', spec: 4 });

test('cliente existente: o consumidor usa id, nome e email', async () => {
  await pact.addInteraction().given('o cliente 1 existe').uponReceiving('uma busca do cliente 1')
    .withRequest('GET', '/clientes/1')
    .willRespondWith(200, (b) => b.headers({ 'Content-Type': 'application/json' })
      .jsonBody({ id: integer(1), nome: string('Ana Souza'), email: regex(/^[^@\s]+@[^@\s]+$/, 'ana@exemplo.com') }))
    .executeTest(async (mock) => {
      const c = await buscarCliente(mock.url, 1);          // código REAL do consumidor
      expect(c).toEqual({ id: 1, nome: 'Ana Souza', email: 'ana@exemplo.com', saudacao: 'Olá, Ana!' });
    });
});`, notes: [{ l: '10', t: 'Matchers de tipo: o contrato exige forma, não valores fixos.' }, { l: '14', t: 'O consumidor real roda contra o mock server do Pact.' }] },
    { title: 'Verificação do provedor com estados (JavaScript; verificação OK e falha ao renomear nome → name)', lang: 'js', code: R`import { Verifier } from '@pact-foundation/pact';
import { criarProvedor } from './src/provedor.mjs';

const campo = process.argv[2] || 'nome';                 // 'name' simula a mudança incompatível
const server = criarProvedor({ campoNome: campo }).listen(0, '127.0.0.1');
const porta = server.address().port;
await new Verifier({
  provider: 'api-clientes', providerBaseUrl: 'http://127.0.0.1:' + porta,
  pactUrls: ['pacts/loja-web-api-clientes.json'],
  stateHandlers: { 'o cliente 1 existe': async () => {}, 'o cliente 999 não existe': async () => {} }
}).verifyProvider();
// campo "nome": has a matching body (OK)
// campo "name": has a matching body (FAILED) -> Actual map is missing the following keys: nome`, notes: [{ l: '9', t: 'Os estados preparam os dados de cada interação.' }, { l: '12', t: 'Um campo extra (vip) não quebra; um campo renomeado quebra.' }] },
    { title: 'Publicar contratos e consultar can-i-deploy (shell; trecho conceitual, não executado nesta aula)', lang: 'bash', code: R`# publicar o contrato do consumidor no broker, com versão (commit) e branch
pact-broker publish pacts --consumer-app-version "$GIT_SHA" --branch "$GIT_BRANCH" --broker-base-url "$PACT_BROKER_URL"

# antes do deploy: esta versão do consumidor é compatível com o que está em produção?
pact-broker can-i-deploy --pacticipant loja-web --version "$GIT_SHA" --to-environment production

# registrar o deploy realizado
pact-broker record-deployment --pacticipant loja-web --version "$GIT_SHA" --environment production`, notes: [{ l: '2', t: 'O broker guarda contratos e resultados de verificação.' }, { l: '5', t: 'can-i-deploy falha o pipeline se houver incompatibilidade.' }] }
  ],
  bestPractices: ['Descreva no contrato apenas o que o consumidor realmente usa e use matchers de tipo.', 'Exercite o código real do consumidor contra o mock server do Pact.', 'Verifique o contrato no CI do provedor a cada PR, com estados claros.', 'Trate adições como compatíveis e renomeações, remoções e mudanças de tipo como quebras que exigem expandir e contrair.', 'Inclua os caminhos de erro (404, 422) nos contratos.', 'Use um broker e can-i-deploy quando houver deploys independentes de vários times.', 'Não use contratos para regras de negócio nem como substituto de integração e E2E.'],
  mistakes: ['Contratos com valores fixos demais.', 'Mockar o cliente HTTP em vez de rodar o consumidor real contra o Pact.', 'Estados do provedor vazios ou mal preparados.', 'Verificar o provedor contra contratos desatualizados.', 'Adotar contratos para um único consumidor no mesmo time.', 'Esquecer o caminho de erro.'],
  market: R`**Testes de contrato** são **padrão** em arquiteturas de **microsserviços** e **apps móveis**; **explicar a diferença para integração/E2E** e **o fluxo can-i-deploy** é **pergunta recorrente** em vagas de **backend e plataforma**.`,
  summary: R`Testes de contrato orientados ao consumidor registram o que o consumidor usa (arquivo de contrato) e o provedor prova que continua atendendo, sem ambiente conjunto. Medido (Pact 17.1.4): 2 testes do consumidor passaram e geraram o contrato; a verificação do provedor correto passou (200 e 404); com o campo nome renomeado para name falhou ("missing the following keys: nome") e o campo extra vip não quebrou. Mudanças aditivas são compatíveis; renomear, remover ou mudar o tipo não são. Broker e can-i-deploy foram apenas descritos.`,
  refs: [REF.pactDocs, REF.pactHow, REF.pactJs, REF.pactCanIDeploy, REF.cdc, REF.contractTest],
  cards: [
    { q: 'O que o contrato do Pact contém?', a: 'As interações que o consumidor usa (requisição, resposta esperada, estados do provedor e regras de correspondência), e não o schema completo do provedor.' },
    { q: 'Que mudança do provedor quebrou a verificação no laboratório?', a: 'Renomear nome para name: "Actual map is missing the following keys: nome"; o campo extra vip não quebrou.' },
    { q: 'Para que serve o can-i-deploy?', a: 'Verificar, via broker, se uma versão pode ser implantada sem quebrar contratos do ambiente de destino.' },
    { q: 'Quando contratos não valem a pena?', a: 'Com um único consumidor no mesmo time e repositório (integração basta) ou APIs públicas com consumidores desconhecidos (OpenAPI e versionamento).' }
  ]
},
{
  id: 'tav-02', moduleId: 'm1', order: 2, minutes: 85, tags: ['carga', 'k6', 'modelo aberto', 'thresholds', 'latência', 'percentis', 'SLO'],
  title: 'Testes de carga com k6: modelos aberto e fechado, thresholds, percentis e como ler os resultados',
  objectives: ['Explicar o objetivo de um teste de carga e distinguir smoke, carga, estresse, pico e resistência', 'Escrever scripts k6 com cenários, checks e thresholds', 'Distinguir o modelo fechado (VUs) do aberto (taxa de chegada) e saber por que importa', 'Ler métricas: vazão, média, mediana e percentis, taxa de falhas, iterações descartadas', 'Executar o k6 em Docker contra um serviço local e interpretar o resultado', 'Evitar armadilhas: medir no mesmo host, aquecimento, dados e ambiente não representativos'],
  intro: R`Um **teste de carga** responde: "**o sistema atende a demanda esperada dentro dos objetivos de desempenho (SLO)?**". O **k6** (Grafana) escreve cenários em **JavaScript**, roda em **Go** e **falha o pipeline** quando um **threshold** é violado. No laboratório (**k6 em Docker**, contra um **Express de thread única**): **smoke** (**50** requisições, **p95 = 2,8 ms**, **0% de falhas**) e **carga em modelo aberto** de **50 iterações/s por 15 s** (**750** requisições, **p95 = 13,0 ms**, **0% de falhas**, thresholds **passaram**, saída **0**). O **estresse** é a próxima aula.`,
  theory: R`### Tipos de teste de desempenho
| Tipo | Pergunta | Forma |
|---|---|---|
| **Smoke** | o script e o serviço **funcionam**? | **1 VU**, poucos segundos |
| **Carga (*load*)** | atende a **demanda esperada**? | **carga típica** por **minutos/horas** |
| **Estresse** | **onde** e **como** quebra? | **acima** do esperado, **crescente** (aula tav-03) |
| **Pico (*spike*)** | resiste a **picos súbitos**? | **salto** de carga |
| **Resistência (*soak*)** | **vaza** memória/conexões ao longo do tempo? | **carga moderada** por **horas** |
| **Capacidade** | **quanto** suporta com o SLO? | **escada** até violar o SLO |
**Regra:** **sempre comece pelo smoke**; **objetivos** (SLO) **antes** dos números: "**p95 < 300 ms e < 1% de erros a 200 req/s**".

### k6 em resumo
**Scripts em JS** (**não** é Node: **não** há §require('fs')§/npm completo; módulos §k6/http§, §k6/metrics§, §k6/execution§), **executor em Go** (**eficiente**: milhares de VUs), **thresholds** (**critérios de passa/falha**), **checks** (**asserções** que **não interrompem**), **cenários** (executores), **tags** e **métricas customizadas**, **saídas** (§--summary-export§, Prometheus, InfluxDB, Grafana Cloud). **Execução neste laboratório:** **§docker run --rm --user $(id -u):$(id -g) --network host -v ... grafana/k6 run ...§** (**--user** evita **erro de permissão** ao **exportar** o resumo; **--network host** alcança o **serviço local**).

### Modelo fechado x aberto
- **Fechado (VUs):** **N usuários virtuais** em laço: cada VU **espera a resposta** antes da **próxima** iteração. **Quando o servidor fica lento, a taxa de requisições cai** (**o gerador se adapta**): **mascara** a degradação (**omissão coordenada**: a **latência real** vista por **quem chegasse** **seria maior** que a medida);
- **Aberto (taxa de chegada):** **§constant-arrival-rate§**/**§ramping-arrival-rate§**: **iterações chegam em uma taxa fixa**, **independentemente** da latência (como **tráfego real da internet**): **filas crescem** e **aparecem** como **latência** e **iterações descartadas** (§dropped_iterations§) se faltarem VUs.
**Regra:** **sites e APIs públicas** → **modelo aberto**; **sistemas com número fixo de usuários concorrentes** (call center, app interno) → **fechado**. **O laboratório usa o aberto.**

### O script de carga (§carga/carga.js§)
§executor: 'constant-arrival-rate'§, §rate: 50§, §timeUnit: '1s'§, §duration: '15s'§, §preAllocatedVUs: 20§, §maxVUs: 100§; **cada iteração**: **80%** §GET /clientes/1§ (rápido) e **20%** §GET /relatorio?n=100000§ (**~12 ms** de CPU); §check(r, { 'status 200': ... })§; **thresholds:** §http_req_failed: ['rate<0.01']§ e §http_req_duration: ['p(95)<150']§.
**Medido (uma execução):**
| Cenário | Requisições | Taxa | média | mediana | **p95** | máx | Falhas | VUs máx | Saída |
|---|---|---|---|---|---|---|---|---|---|
| **smoke** (1 VU, 5 s) | 50 | 9,7/s | 2,5 ms | 1,7 | **2,8 ms** | 34,9 | **0%** | 1 | **0** |
| **carga** (50 it/s, 15 s) | **750** | **50,0/s** | 3,9 ms | 1,6 | **13,0 ms** | 36,9 | **0%** | 20 | **0** |
**Leitura:** a **taxa de 50 req/s** foi **exatamente** a **pedida** (modelo aberto) e o **p95** (**13 ms**) ficou **muito abaixo** do threshold (**150 ms**): **o serviço** tem **folga** nessa carga. A **média (3,9 ms)** **esconde** a **cauda** (as requisições do **relatório** levam **~12 ms**: o **p95** as mostra); **por isso** olhamos **percentis**.

### Métricas e como lê-las
- **§http_req_duration§**: **tempo total** da requisição (sem DNS/handshake em keep-alive); **sub-métricas** (§waiting§ = **TTFB**, §connecting§, §sending§, §receiving§);
- **Percentis:** **p50** (mediana: **típico**), **p90/p95** (**experiência de 1 em 10/20**), **p99** (**cauda**); **médias enganam** (distribuições **assimétricas**): **reporte percentis**; **máximo** é **ruidoso**;
- **§http_req_failed§**: **fração** de **erros** (status ≥ 400 **ou** falha de rede); **§checks§**: **% de asserções** que passaram (**falha não aborta**);
- **§http_reqs§**: **contagem e taxa** (**vazão**); **§iterations§** e **§dropped_iterations§** (**no modelo aberto**, **iterações que não puderam começar** por falta de VUs);
- **§vus§/§vus_max§**: **concorrência** usada (**lei de Little**: **L = λ × W**: concorrência = **taxa** × **tempo de resposta**).
**Thresholds:** **expressões** (§p(95)<150§, §rate<0.01§, §count>100§) **por métrica e por tag** (§http_req_duration{endpoint:relatorio}§); **§abortOnFail§** interrompe cedo. **O k6 sai com código ≠ 0** se violados (**99** no laboratório do estresse), **ideal para CI** (aula ftj-06).

### Como desenhar um teste de carga confiável
1. **Objetivos** (SLO) **claros** e **perfil de tráfego realista** (**mistura** de endpoints: aqui 80/20; **horário de pico**; **dados** variados);
2. **Ambiente** parecido com **produção** (**tamanho**, **banco**, **cache**, **rede**): **resultados em laptop não generalizam**;
3. **Gerador de carga em outra máquina** (**competir por CPU** com o serviço **distorce**: **no laboratório, ambos no mesmo host**: **limitação importante**);
4. **Aquecimento** (JIT, caches, pools) **antes** de medir (**descarte** o início ou use **estágios**);
5. **Dados** de teste **suficientes** e **sem efeitos colaterais** (limpe **depois**);
6. **Repita** (**variância**): **3 execuções** e **mediana**; **registre versão do código** e **configuração**;
7. **Observabilidade do serviço durante o teste** (CPU, memória, GC, conexões, filas: C4.6) para **explicar** os números;
8. **Automatize** (smoke a cada PR; carga **noturna**; **comparar com a linha de base**).

### Armadilhas
- **Modelo fechado** **escondendo** degradação (omissão coordenada);
- **Medir só a média**; **ignorar a cauda**;
- **Gerador saturado** (**o gargalo é o k6**, não o serviço): **monitore** a CPU do gerador;
- **Dados cacheados** (**mesma chave** sempre: **superestima** o desempenho);
- **Testar contra produção** sem **cuidado** (**efeitos colaterais**, **custos**, **impacto aos usuários**);
- **Comparar execuções** em **ambientes diferentes**;
- **Carga irreal** (sem **think time**, **distribuição** diferente).

### Conexão com o curso
O **servidor** do laboratório roda em **uma thread** (**event loop do Node**: C4.1): **trabalho síncrono** (o §/relatorio§ é um laço de CPU) **enfileira** as demais requisições: **a degradação** será **vista** na **aula tav-03 (estresse)**.`,
  concepts: [
    { term: 'Teste de carga', def: 'Teste que aplica a demanda esperada a um sistema para verificar se atende aos objetivos de desempenho.' },
    { term: 'Modelo aberto', def: 'Geração de carga por taxa de chegada fixa, independente da latência do servidor.' },
    { term: 'Modelo fechado', def: 'Geração de carga por número fixo de usuários virtuais que esperam a resposta antes da próxima iteração.' },
    { term: 'Threshold', def: 'Critério de passa ou falha do k6 sobre uma métrica (por exemplo, p(95)<150).' },
    { term: 'Percentil', def: 'Valor abaixo do qual está uma fração das observações (p95: 95% das requisições foram mais rápidas).' },
    { term: 'Omissão coordenada', def: 'Distorção em que o gerador de carga reduz a taxa quando o servidor fica lento, escondendo a latência real.' },
    { term: 'Lei de Little', def: 'Relação L = λ × W entre concorrência, taxa de chegada e tempo médio de resposta.' }
  ],
  examples: R`**Analogia:** o teste de carga é **simular a hora do rush de um restaurante**: no **modelo aberto**, os clientes **chegam no ritmo combinado** mesmo com a cozinha lenta (a fila cresce e você a vê); no **fechado**, o salão tem **um número fixo de mesas**, e se a cozinha atrasa **ninguém novo entra**, então **a fila some** e a lentidão **parece** menor do que é.

**Exemplo 1: carga aberta.** 50 it/s por 15 s geraram exatamente 750 requisições, com p95 de 13 ms e 0% de falhas.

**Exemplo 2: média x percentil.** A média de 3,9 ms esconde as requisições de 12 ms do relatório; o p95 as revela.

**Exemplo 3: threshold.** p(95)<150 e rate<0.01 passaram: o k6 saiu com código 0.`,
  code: [
    { title: 'Smoke e carga em modelo aberto com thresholds (JavaScript do k6; execuções medidas)', lang: 'js', code: R`import http from 'k6/http';
import { check } from 'k6';

// carga/carga.js: 50 iterações por segundo durante 15 s, independentemente da latência
export const options = {
  scenarios: { carga: { executor: 'constant-arrival-rate', rate: 50, timeUnit: '1s', duration: '15s', preAllocatedVUs: 20, maxVUs: 100 } },
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<150'] }
};

export default function () {
  const base = __ENV.BASE || 'http://127.0.0.1:4580';
  const r = Math.random() < 0.8 ? http.get(base + '/clientes/1') : http.get(base + '/relatorio?n=100000');
  check(r, { 'status 200': (x) => x.status === 200 });
}
// resultado: 750 requisições, 50,0 req/s, p95 13,0 ms, 0% de falhas, saída 0`, notes: [{ l: '5', t: 'constant-arrival-rate é o modelo aberto: a taxa não depende da latência.' }, { l: '7', t: 'Thresholds transformam o teste em critério de passa/falha para o CI.' }] },
    { title: 'Executar o k6 no Docker contra um serviço local (shell)', lang: 'bash', code: R`#!/usr/bin/env bash
# rodar-k6.sh: sobe o provedor, roda um cenário do k6 e exporta o resumo em JSON
ESC="DOLAR{1:-smoke}"; mkdir -p resultados
node servidor-carga.mjs > /dev/null 2>&1 & PID=$!; sleep 1
docker run --rm --user "$(id -u):$(id -g)" --network host \
  -v "$PWD/carga:/scripts:ro" -v "$PWD/resultados:/out" \
  grafana/k6:latest run --quiet --summary-export="/out/$ESC.json" "/scripts/$ESC.js"
echo "$ESC exit=$?"; kill $PID`, notes: [{ l: '5', t: '--user evita o erro de permissão ao exportar o resumo; --network host alcança o servidor local.' }, { l: '8', t: 'O código de saída do k6 reflete os thresholds.' }] },
    { title: 'Checks, tags e métricas customizadas (JavaScript do k6; conceitual, parcialmente executado)', lang: 'js', code: R`import http from 'k6/http';
import { check, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const duracaoRelatorio = new Trend('duracao_relatorio', true);
const errosDeNegocio = new Counter('erros_de_negocio');

export const options = { thresholds: { 'http_req_duration{endpoint:relatorio}': ['p(95)<300'], duracao_relatorio: ['p(99)<500'] } };

export default function () {
  group('relatório', () => {
    const r = http.get('http://127.0.0.1:4580/relatorio?n=100000', { tags: { endpoint: 'relatorio' } });
    duracaoRelatorio.add(r.timings.duration);
    if (!check(r, { 'tem soma': (x) => typeof x.json('soma') === 'number' })) errosDeNegocio.add(1);
  });
}`, notes: [{ l: '8', t: 'Thresholds por tag permitem metas por endpoint.' }, { l: '14', t: 'Checks não interrompem o teste; os contadores registram as falhas de negócio.' }] }
  ],
  bestPractices: ['Defina SLOs antes de medir e comece sempre por um smoke test.', 'Use o modelo aberto (taxa de chegada) para tráfego público e reporte percentis (p95 e p99), não só a média.', 'Rode o gerador de carga em outra máquina e acompanhe a CPU dele e a do serviço.', 'Aqueça o sistema, use dados variados e repita a medição, registrando versão e configuração.', 'Use thresholds para transformar o teste em critério de CI e métricas por endpoint com tags.', 'Observe CPU, memória, GC e filas do serviço durante o teste para explicar os números.', 'Compare com uma linha de base e não generalize resultados de laptop para produção.'],
  mistakes: ['Usar apenas o modelo fechado e esconder a degradação.', 'Reportar só a média.', 'Gerador e serviço disputando a mesma CPU sem declarar.', 'Cachear a mesma chave e superestimar o desempenho.', 'Testar contra produção sem cuidado.', 'Comparar execuções de ambientes diferentes.'],
  market: R`**Testes de carga com k6** (ou Gatling/JMeter) são **parte** de **SRE, backend e plataforma**; **explicar modelo aberto x fechado, percentis e thresholds** é **o que diferencia** quem **entende de desempenho**.`,
  summary: R`Testes de carga verificam se o sistema atende a demanda esperada dentro dos SLOs; comece por smoke e use o modelo aberto (taxa de chegada) para tráfego público, com thresholds e percentis. Medido (k6 em Docker, Express de thread única, mesmo host): smoke com 50 requisições e p95 de 2,8 ms; carga de 50 it/s por 15 s com 750 requisições, p95 de 13,0 ms e 0% de falhas (média de 3,9 ms escondendo a cauda de ~12 ms). Cuide do gerador em outra máquina, aquecimento, dados variados e repetição.`,
  refs: [REF.k6Docs, REF.k6Scenarios, REF.k6Thresholds, REF.k6TestTypes, REF.k6OpenClosed],
  cards: [
    { q: 'Qual a diferença entre os modelos aberto e fechado?', a: 'No aberto as iterações chegam em taxa fixa independentemente da latência; no fechado cada VU espera a resposta e a taxa cai quando o servidor fica lento, mascarando a degradação.' },
    { q: 'Por que reportar percentis e não só a média?', a: 'A média esconde a cauda: no laboratório a média foi 3,9 ms e o p95, 13,0 ms por causa do endpoint de relatório.' },
    { q: 'Para que servem os thresholds do k6?', a: 'Definem critérios de passa/falha sobre métricas; o k6 sai com código diferente de zero quando violados, útil em CI.' },
    { q: 'Qual a principal limitação do laboratório de carga?', a: 'Gerador e servidor no mesmo host disputando CPU, servidor de thread única e sem banco: não representa produção.' }
  ]
}
];
