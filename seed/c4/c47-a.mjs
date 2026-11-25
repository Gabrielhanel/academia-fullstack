// C4.7 — Microsserviços. Aulas 1 e 2 (decomposição de serviços; comunicação síncrona x assíncrona).
const R = String.raw;

export const REF = {
  fowlerMicro: { title: 'Martin Fowler — Microservices', url: 'https://martinfowler.com/articles/microservices.html', kind: 'artigo' },
  monolithFirst: { title: 'Martin Fowler — MonolithFirst', url: 'https://martinfowler.com/bliki/MonolithFirst.html', kind: 'artigo' },
  boundedContext: { title: 'Martin Fowler — Bounded Context', url: 'https://martinfowler.com/bliki/BoundedContext.html', kind: 'artigo' },
  microservicesIo: { title: 'microservices.io — Pattern language', url: 'https://microservices.io/patterns/index.html', kind: 'catálogo' },
  strangler: { title: 'Martin Fowler — Strangler Fig', url: 'https://martinfowler.com/bliki/StranglerFigApplication.html', kind: 'artigo' },
  conway: { title: 'Martin Fowler — Conway\'s Law', url: 'https://martinfowler.com/bliki/ConwaysLaw.html', kind: 'artigo' },
  fallacies: { title: 'Fallacies of distributed computing (resumo)', url: 'https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing', kind: 'artigo' },
  circuitBreaker: { title: 'Martin Fowler — Circuit Breaker', url: 'https://martinfowler.com/bliki/CircuitBreaker.html', kind: 'artigo' },
  awsRetries: { title: 'AWS Builders\' Library — Timeouts, retries and backoff with jitter', url: 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/', kind: 'artigo' },
  eipMessaging: { title: 'Enterprise Integration Patterns — Messaging', url: 'https://www.enterpriseintegrationpatterns.com/patterns/messaging/', kind: 'livro' },
  grpc: { title: 'gRPC — Introduction', url: 'https://grpc.io/docs/what-is-grpc/introduction/', kind: 'doc' },
  asyncapi: { title: 'AsyncAPI — documentação', url: 'https://www.asyncapi.com/docs', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'mic-01', moduleId: 'm1', order: 1, minutes: 85, tags: ['microsserviços', 'decomposição', 'bounded context', 'monólito modular', 'acoplamento', 'N+1 entre serviços', 'disponibilidade'],
  title: 'Decomposição de serviços: quando dividir, como achar as fronteiras e o custo da rede',
  objectives: ['Explicar o que microsserviços resolvem e o que custam', 'Decidir entre monólito modular e microsserviços com critérios e medir o custo de uma chamada de rede', 'Identificar fronteiras por contextos delimitados e por propriedade de dados', 'Reconhecer o monólito distribuído e o N+1 entre serviços', 'Calcular a disponibilidade composta de uma cadeia síncrona'],
  intro: R`**Microsserviços** dividem um sistema em **serviços pequenos, implantáveis de forma independente, cada um dono dos seus dados**. Resolvem **escala organizacional** e **isolamento de falhas**, mas **trocam chamadas de função por chamadas de rede**. Aqui você mede o preço: **~0,026 µs** (função) contra **~4,1 ms** (HTTP em localhost); um "N+1 entre serviços" de **129,8 ms** que cai para **2,4 ms** com uma chamada em lote; e a disponibilidade de uma cadeia (**5 serviços de 99,9% = 99,5%**).`,
  theory: R`### O que são (e o que não são)
Um **microsserviço**: **pequeno o bastante** para uma equipe entender, **implantado independentemente**, **dono dos seus dados**, que **colabora por rede** através de **contratos** (API/eventos). Não é "uma API por tabela" nem "um repositório por função". A definição é **organizacional e de dados**, não de tamanho.
**Benefícios** (quando há escala e equipes): **implantação independente** (menos coordenação), **escala seletiva** (só o serviço quente), **isolamento de falhas**, **autonomia tecnológica**, **equipes pequenas e donas** (Lei de Conway: a arquitetura reflete a comunicação entre equipes).
**Custos** (sempre): **latência e falhas de rede**, **consistência distribuída** (aula mic-03), **observabilidade complexa** (curso C4.6), **operação** (muitos pipelines, versões, configurações), **testes de integração** mais difíceis, **segurança** entre serviços (curso C4.4), **duplicação** e **versionamento de contratos** (aula api-07). Falácias da computação distribuída: **a rede não é confiável, a latência não é zero, a banda não é infinita**.

### Monólito modular primeiro
**MonolithFirst** (Fowler): comece por um **monólito modular** (aula nst-09), com **fronteiras de módulos e dados privados**; **extraia serviços** quando houver **razão concreta**: escala diferente, **equipes** que se bloqueiam, **ciclos de implantação** conflitantes, **requisitos de isolamento** (conformidade, falhas). **Evite** microsserviços para **times pequenos** e **domínios incertos**: errar a fronteira em microsserviços custa **muito mais** que em módulos. **Strangler Fig**: extraia **pedaço a pedaço** de um monólito legado, roteando o tráfego pelo caminho novo.

### Medido: o custo de cruzar a rede (Node 26.13.1, Express 5.3.0, localhost)
| Operação | Tempo |
|---|---|
| chamada de **função** no mesmo processo | **~0,026 µs** (25,8 ns) |
| **uma chamada HTTP** ao serviço de clientes | **~4,1 ms** |
Uma diferença de **mais de cinco ordens de grandeza**, **em localhost** (em rede real: **+0,5 a muitos ms** por salto e **falhas parciais**). Consequência: **não** divida em microsserviços funcionalidades que **conversam o tempo todo**.

### O N+1 entre serviços
Compor **50 pedidos** com o **nome do cliente** (cada pedido tem um clienteId; **dado de outro serviço**):
| Estratégia | Mediana |
|---|---|
| **50 chamadas HTTP em sequência** | **129,8 ms** |
| **50 chamadas em paralelo** (§Promise.all§) | **70,2 ms** |
| **1 chamada em lote** (ids distintos na query) | **2,4 ms** |
O **lote** foi **~54x** mais rápido que a sequência. Soluções: **APIs em lote** (§GET /clientes?ids=...§), **GraphQL/BFF** com DataLoader (aula api-04), **replicar dados de leitura** (o serviço de pedidos guarda uma **cópia** do nome do cliente, atualizada por **eventos**: consistência eventual, aula mic-02), **composição na borda** (API composition). Se você precisa de **muitos** desses, talvez **as fronteiras estejam erradas**.

### Disponibilidade composta (cálculo)
Se uma requisição passa por **n serviços em série** e cada um tem disponibilidade **a**, o total é **aⁿ**:
| a | n | Composta | Indisponível em 30 dias |
|---|---|---|---|
| 99,9% | 1 | 99,90% | 43 min |
| 99,9% | 3 | 99,70% | 129 min |
| 99,9% | 5 | **99,50%** | **216 min** |
| 99,9% | 10 | **99,00%** | **430 min** |
| 99,0% | 5 | **95,10%** | **2.117 min** |
Por isso: **reduza a profundidade** das cadeias síncronas, use **assincronia** onde possível (aula mic-02), **degrade graciosamente** (cache, valores padrão) e **meça os SLOs** de ponta a ponta (curso C4.6).

### Como achar as fronteiras
1. **Contextos delimitados** (DDD): onde **o mesmo termo muda de significado** ("Cliente" no cadastro ≠ "Cliente" na cobrança): fronteira natural.
2. **Capacidades de negócio**: pedidos, catálogo, pagamentos, estoque, envio.
3. **Propriedade de dados**: **cada dado tem um único dono**; outros serviços **pedem por API ou recebem eventos**, **nunca** leem o banco do dono (**banco compartilhado = acoplamento oculto**).
4. **Frequência de mudança e de escala** juntas: o que muda e escala **junto** fica **junto**.
5. **Equipes**: um serviço por equipe (ou pouco mais).
6. **Transações**: operações que **precisam de atomicidade** forte **entre entidades** pedem o **mesmo serviço**; senão você precisará de **sagas** (aula mic-03).
**Teste**: "posso **implantar** este serviço **sozinho**, sem alterar os outros?"; "**uma mudança** de requisito **toca quantos serviços**?"

### Anti-padrões
- **Monólito distribuído**: serviços que **precisam ser implantados juntos** e **chamam-se em cadeia**: **todos os custos, nenhum benefício**.
- **Banco compartilhado** entre serviços; **serviços "anêmicos"** (CRUD de tabelas) com a lógica espalhada em orquestradores;
- **Nanoserviços** (granularidade excessiva);
- **Chamadas síncronas em cadeia** profundas; **ausência de timeouts** (aula api-08);
- **Compartilhar bibliotecas de domínio** que acoplam versões.

### Padrões de apoio
**API Gateway/BFF** (aula api-08), **service discovery**, **configuração externa**, **observabilidade**, **CI/CD por serviço**, **contratos testados** (Pact), **feature flags** e **versionamento** (aula api-07).`,
  concepts: [
    { term: 'Microsserviço', def: 'Serviço pequeno, implantável de forma independente e dono dos seus dados, que colabora por contratos.' },
    { term: 'Contexto delimitado', def: 'Fronteira dentro da qual um modelo de domínio e seus termos têm um significado consistente.' },
    { term: 'Monólito modular', def: 'Aplicação única dividida em módulos com fronteiras e dados privados.' },
    { term: 'Monólito distribuído', def: 'Conjunto de serviços acoplados que precisam ser implantados juntos, sem os benefícios dos microsserviços.' },
    { term: 'Strangler Fig', def: 'Estratégia de migrar um sistema legado extraindo funcionalidades gradualmente.' },
    { term: 'N+1 entre serviços', def: 'Uma chamada de rede por item de uma lista para obter dados de outro serviço.' },
    { term: 'API composition', def: 'Composição, em um ponto de entrada, de dados vindos de vários serviços.' },
    { term: 'Propriedade de dados', def: 'Princípio de que cada dado pertence a um único serviço.' },
    { term: 'Lei de Conway', def: 'Observação de que a arquitetura do sistema tende a espelhar a estrutura de comunicação das equipes.' },
    { term: 'Disponibilidade composta', def: 'Disponibilidade resultante de vários componentes em série, o produto das individuais.' }
  ],
  examples: R`**Analogia:** um monólito é **uma cozinha grande**: tudo à mão, mas todos se esbarram. Microsserviços são **cada prato em uma cozinha separada em prédios diferentes**: cada equipe trabalha sem esbarrar, **mas passar o sal agora exige um mensageiro** (a rede), e o jantar só sai se **todos os prédios** estiverem abertos (disponibilidade composta). Dividir **mal** é montar **uma cozinha de molhos num prédio e uma de panelas em outro**: o cozinheiro passa o dia indo e vindo (**N+1 entre serviços**).

**Exemplo 1: custo.** Função 0,026 µs x HTTP 4,1 ms.

**Exemplo 2: N+1.** 129,8 ms em sequência; 2,4 ms em lote.

**Exemplo 3: cadeia.** 5 serviços de 99,9% = 99,5% (216 min/mês).`,
  code: [
    { title: 'Compor pedidos com clientes: sequência, paralelo e lote (JavaScript, Express 5; medianas medidas)', lang: 'js', code: R`// serviço de clientes: GET /clientes/:id e GET /clientes?ids=1,2,3
const base = 'http://clientes.interno';

// 1) em sequência: 50 chamadas -> ~129,8 ms
const a = []; for (const p of pedidos) a.push({ ...p, cliente: (await (await fetch(base + '/clientes/' + p.clienteId)).json()).nome });

// 2) em paralelo: ~70,2 ms (sobrecarrega o serviço com 50 chamadas simultâneas)
const b = await Promise.all(pedidos.map(async (p) => ({ ...p, cliente: (await (await fetch(base + '/clientes/' + p.clienteId)).json()).nome })));

// 3) em lote: 1 chamada -> ~2,4 ms
const ids = [...new Set(pedidos.map((p) => p.clienteId))];
const lista = await (await fetch(base + '/clientes?ids=' + ids.join(','))).json();
const nomes = Object.fromEntries(lista.map((c) => [c.id, c.nome]));
const c = pedidos.map((p) => ({ ...p, cliente: nomes[p.clienteId] }));`, notes: [{ l: '5', t: 'Cada iteração paga a latência de uma ida e volta.' }, { l: '12', t: 'Ids distintos em uma só chamada: o ganho é de ordem de grandeza.' }] },
    { title: 'Disponibilidade composta (JavaScript, cálculo do laboratório)', lang: 'js', code: R`const composta = (a, n) => a ** n;
for (const [a, n] of [[0.999, 1], [0.999, 3], [0.999, 5], [0.999, 10], [0.99, 5]])
  console.log(a, n, (composta(a, n) * 100).toFixed(2) + '%', ((1 - composta(a, n)) * 43200).toFixed(0) + ' min em 30 dias');
// 99,9% x 5 = 99,50% (216 min) | 99,9% x 10 = 99,00% (430 min) | 99% x 5 = 95,10% (2.117 min)`, notes: [{ l: '1', t: 'Em série, as disponibilidades se multiplicam.' }] }
  ],
  bestPractices: ['Comece por um monólito modular e extraia serviços com razão concreta.', 'Defina fronteiras por contextos delimitados e propriedade de dados.', 'Nunca compartilhe o banco entre serviços.', 'Evite cadeias síncronas profundas e chamadas por item (use lotes, cópias de leitura ou composição).', 'Meça o custo de rede e a disponibilidade composta antes de dividir.', 'Garanta implantação e testes independentes por serviço.'],
  mistakes: ['Dividir cedo demais, sem equipes nem escala que justifiquem.', 'Banco compartilhado entre serviços.', 'Monólito distribuído com implantações acopladas.', 'Um serviço por tabela (anêmicos) e nanoserviços.', 'Fazer N chamadas de rede por lista.', 'Ignorar a disponibilidade composta das dependências.'],
  market: R`Muitas empresas migraram para microsserviços cedo demais e voltaram a monólitos modulares; saber argumentar com critérios, números e fronteiras é um diferencial em entrevistas de arquitetura.`,
  summary: R`Microsserviços dão independência de implantação e de escala ao custo de rede, consistência distribuída e operação. Medido: uma chamada de função ~0,026 µs contra ~4,1 ms de HTTP em localhost; compor 50 pedidos com clientes levou 129,8 ms em sequência, 70,2 ms em paralelo e 2,4 ms em lote. Cinco serviços de 99,9% em série dão 99,5% (216 min/mês). Comece por um monólito modular, defina fronteiras por contexto e dados e evite monólitos distribuídos.`,
  refs: [REF.fowlerMicro, REF.monolithFirst, REF.boundedContext, REF.strangler, REF.conway, REF.fallacies],
  cards: [
    { q: 'Quando dividir em microsserviços?', a: 'Quando há escala, equipes ou ciclos de implantação que justifiquem; por padrão, comece por um monólito modular.' },
    { q: 'Qual o custo de uma chamada de rede?', a: 'Medido: ~4,1 ms em HTTP localhost contra ~0,026 µs de uma chamada de função.' },
    { q: 'O que é um monólito distribuído?', a: 'Serviços acoplados que precisam ser implantados juntos, com todos os custos e nenhum benefício.' },
    { q: 'Como evitar o N+1 entre serviços?', a: 'APIs em lote, cópias de leitura por eventos, composição na borda ou BFF (medido: 129,8 → 2,4 ms).' },
    { q: 'Qual a disponibilidade de 5 serviços de 99,9% em série?', a: '99,5% (216 minutos de indisponibilidade em 30 dias).' }
  ]
},
{
  id: 'mic-02', moduleId: 'm1', order: 2, minutes: 85, tags: ['comunicação síncrona', 'assíncrona', 'eventos', 'retry storm', 'acoplamento temporal', 'timeouts', 'filas', 'gRPC'],
  title: 'Comunicação entre serviços: síncrona x assíncrona, retentativas em cadeia e acoplamento temporal',
  objectives: ['Comparar comunicação síncrona (HTTP/gRPC) e assíncrona (eventos/filas)', 'Medir a amplificação de retentativas em cadeia e reduzi-la', 'Demonstrar o acoplamento temporal e como a fila o remove', 'Escolher entre comandos, eventos e consultas', 'Aplicar timeouts, disjuntores e orçamento de tempo'],
  intro: R`Como os serviços **conversam** define **como falham juntos**. A comunicação **síncrona** é simples, mas **acopla no tempo** (o chamado precisa estar no ar **agora**) e **propaga falhas**. A **assíncrona** (eventos e filas) **desacopla**, mas exige **consistência eventual**. Aqui você mede: **retentativas em cadeia** (3 × 3 = **9 chamadas** ao serviço doente), e o **e-mail fora do ar**: **50 de 50** pedidos falham no modelo síncrono; com **fila**, **50 de 50** aceitos e **enviados em 0,2 s** quando o serviço volta.`,
  theory: R`### Estilos
| Estilo | Exemplos | Característica |
|---|---|---|
| **Síncrono request-response** | HTTP/REST, **gRPC** | resposta **agora**; **acoplamento temporal**; simples de entender |
| **Assíncrono por mensagens** | **filas** (SQS, RabbitMQ, BullMQ), **comandos** | o produtor **não espera**; o consumidor processa **no seu tempo** |
| **Eventos** (pub/sub, logs: Kafka) | "PedidoCriado" | **vários consumidores** reagem; **produtor não conhece** quem consome |
**gRPC**: **contratos Protobuf**, **HTTP/2**, streaming, **menor sobrecarga** e geração de clientes; ótimo **entre serviços internos** (**não executado** aqui); **REST/JSON** para APIs **públicas**.

### Comandos, eventos e consultas
- **Comando**: "**faça isto**" (§ReservarEstoque§): **um destinatário**, pode **falhar/ser recusado**; nome no **imperativo**.
- **Evento**: "**isto aconteceu**" (§PedidoCriado§): **fato imutável**, **muitos interessados**, nome no **passado**; o produtor **não** controla o que os consumidores fazem.
- **Consulta**: "**me diga**" (§ObterCliente§): leitura, geralmente **síncrona**.
**Eventos finos** (só ids: o consumidor **busca** o resto: mais chamadas, dados sempre atuais) x **eventos grossos** (**carregam o estado**: consumidor **independente**, mas **acopla ao esquema** e pode ficar **desatualizado**). **Versione** os eventos (aula api-07) e documente (**AsyncAPI**, **CloudEvents**: aula fil-04).

### Acoplamento temporal (medido)
Cenário: o serviço de **e-mail** está **fora do ar** quando **50 pedidos** chegam.
- **Modelo síncrono** (o pedido chama o e-mail): **50 de 50 falharam**: ou o **pedido inteiro falha** (perde-se venda por causa de um serviço **secundário**) ou **fica sem aviso**.
- **Modelo assíncrono** (o pedido **enfileira** o aviso; um worker envia com **retry** de 100 ms): **50 de 50 pedidos aceitos**; **0 e-mails enviados** enquanto o serviço estava fora (a fila **acumulou**); **depois que voltou, 50 de 50 enviados em 0,2 s**.
Princípio: **dependências não essenciais** à **resposta ao usuário** devem ser **assíncronas**; as **essenciais** (cobrar o cartão agora) podem ser síncronas **com timeout e plano B**.

### Retentativas em cadeia (medido)
Cadeia **A → B → C**, cada camada **tenta até 3 vezes** quando recebe **5xx**, e C **sempre falha**: **uma** requisição ao A resulta em **1** chamada a A, **3** a B e **9** a C (**3 × 3**); com quatro camadas seriam **27**. Isso **amplifica a carga justamente no serviço que está doente**, impedindo sua recuperação (*retry storm*). **Medido**: com **retry só na borda** (A) e **B e C sem retry**: **3** chamadas a C (3x em vez de 9x).
**Regras**:
1. **Repita em um só nível** (preferencialmente **perto do cliente**/no **sidecar**), **não em todas as camadas**;
2. **Limite** tentativas e use **backoff exponencial com jitter** (aula fil-03);
3. Só repita **operações idempotentes** (aula api-07);
4. **Orçamento de retentativas** (*retry budget*): no máximo ~**10–20%** de requisições extras (o Envoy faz isso: aula mic-04);
5. **Propague o prazo** (*deadline*) para que as camadas de baixo **não trabalhem para uma requisição que já expirou** (gRPC faz isso nativamente).

### Timeouts e orçamento de tempo
**Todo** chamado de rede precisa de **timeout** (aula api-08). Os timeouts das camadas **devem decrescer**: se A espera 2 s por B, B deve esperar **menos** de 2 s por C (**senão A desiste e B continua trabalhando**: o chamado **não é cancelado**, medido no gateway). **Disjuntor** (aula api-08) e **bulkheads** (pools separados por dependência) **isolam** falhas; **degradação graciosa** (cache, padrão, funcionalidade reduzida).

### Consistência e idempotência
A comunicação assíncrona traz **entrega pelo menos uma vez** e **fora de ordem**: consumidores **idempotentes** (aula fil-03), **outbox** para publicar (aula fil-04), **chaves de partição** para ordem por entidade, **tolerância a eventos duplicados e atrasados** (versão/timestamp). **Consistência eventual**: o cliente pode **ler dados antigos**; a interface deve **comunicar** ("processando...") e o produto **aceitar** o atraso.

### Escolhendo
| Situação | Escolha |
|---|---|
| **Consulta** necessária **agora** para responder | síncrona (com cache, timeout, disjuntor) |
| **Efeito colateral não essencial** (e-mail, relatório, indexação) | **assíncrona** (fila/evento) |
| **Notificar vários serviços** de um fato | **evento** |
| **Operação que precisa de confirmação** de outro serviço | síncrona **ou** saga assíncrona (aula mic-03) |
| **Alto volume e reprocessamento** | **log de eventos** (Kafka) |
**Regra de bolso**: **sincronize só o que o usuário precisa ver na resposta**; o resto, **eventos**.

### Contratos e descoberta
Contratos **versionados** e **testados** (OpenAPI, Protobuf, AsyncAPI; aula api-03); **descoberta de serviços** (DNS, Kubernetes Services, registro); **balanceamento** (cliente ou proxy: aula mic-04); **nenhum endereço fixo**; **configuração por ambiente**.`,
  concepts: [
    { term: 'Acoplamento temporal', def: 'Dependência de que o outro serviço esteja disponível no mesmo momento da chamada.' },
    { term: 'Comando', def: 'Mensagem que pede a um destinatário para executar uma ação.' },
    { term: 'Evento', def: 'Registro imutável de algo que aconteceu, que vários consumidores podem tratar.' },
    { term: 'Retry storm', def: 'Amplificação de carga causada por retentativas em várias camadas durante uma falha.' },
    { term: 'Retry budget', def: 'Limite de retentativas extras permitidas como proporção das requisições.' },
    { term: 'Deadline', def: 'Prazo absoluto propagado entre serviços para abandonar trabalho já expirado.' },
    { term: 'Bulkhead', def: 'Isolamento de recursos por dependência para conter falhas.' },
    { term: 'Degradação graciosa', def: 'Oferecer uma versão reduzida do serviço quando uma dependência falha.' },
    { term: 'Consistência eventual', def: 'Garantia de que as cópias dos dados convergem com o tempo, não instantaneamente.' },
    { term: 'gRPC', def: 'Framework de chamadas remotas com contratos Protobuf sobre HTTP/2.' }
  ],
  examples: R`**Analogia:** a chamada **síncrona** é **telefonar para a padaria e esperar na linha**: se o telefone está ocupado, você **fica parado**; e se **três funcionários** repassam a ligação tentando 3 vezes cada, a padaria recebe **9 ligações para um único pedido** (retry storm). A **fila** é **deixar um bilhete na porta da padaria**: ela lê quando abrir, e **você segue com o seu dia**; quando a padaria reabre, **lê os 50 bilhetes de uma vez**. O **evento** é **pendurar um aviso no mural do prédio** ("saiu pão quente"): quem se interessa **lê**, e quem avisa **não sabe** quem leu.

**Exemplo 1: acoplamento.** E-mail fora: 50/50 falhas no síncrono; 50/50 aceitos e 50/50 enviados depois no assíncrono.

**Exemplo 2: retry storm.** 3 × 3 = 9 chamadas ao serviço doente.

**Exemplo 3: orçamento.** Retry só na borda: 3 chamadas em vez de 9.`,
  code: [
    { title: 'Retentativas em um só nível e timeouts decrescentes (JavaScript; chamadas medidas)', lang: 'js', code: R`const comRetry = async (fn, tentativas) => { let r; for (let i = 0; i < tentativas; i++) { r = await fn(); if (r.status < 500) return r; } return r; };

// RUIM: retry em cada camada (A:3 x B:3 => 9 chamadas ao C que já está doente)
// B: await comRetry(() => fetch(urlC), 3);   A: await comRetry(() => fetch(urlB), 3);

// MELHOR: retry apenas na borda; as camadas internas falham rápido
// B: await fetch(urlC, { signal: AbortSignal.timeout(500) });
// A: await comRetry(() => fetch(urlB, { signal: AbortSignal.timeout(1000) }), 3);   // 3 chamadas ao C
// Observação: o timeout de A (1000) é maior que o de B para C (500) -> B desiste antes de A`, notes: [{ l: '8', t: 'Os timeouts devem decrescer ao descer as camadas.' }] },
    { title: 'Desacoplar no tempo com uma fila (JavaScript, BullMQ 6.7.10; resultado medido)', lang: 'js', code: R`import { Queue, Worker } from 'bullmq';
const fila = new Queue('emails', { connection: conn });
// o pedido apenas ENFILEIRA o aviso e responde (não depende do serviço de e-mail estar no ar)
await fila.add('enviar', { pedidoId }, { attempts: 20, backoff: { type: 'fixed', delay: 100 }, removeOnComplete: true });

new Worker('emails', async (job) => {
  const r = await fetch(urlEmail + '/enviar/' + job.data.pedidoId);
  if (r.status >= 500) throw new Error('e-mail indisponível');           // tenta de novo
}, { connection: conn, concurrency: 5 });
// serviço fora: 50 pedidos aceitos, 0 e-mails; ao voltar: 50 de 50 enviados em 0,2 s`, notes: [{ l: '4', t: 'O pedido não espera nem falha por causa do e-mail.' }, { l: '8', t: 'O worker repete até o serviço voltar.' }] }
  ],
  bestPractices: ['Torne assíncrono tudo o que não precisa estar na resposta ao usuário.', 'Repita em um só nível, com limite, backoff, jitter e só para operações idempotentes.', 'Faça os timeouts decrescerem a cada camada e propague prazos.', 'Use disjuntores, bulkheads e degradação graciosa nas dependências síncronas.', 'Projete consumidores idempotentes e tolerantes a eventos duplicados e fora de ordem.', 'Documente e teste os contratos de APIs e de eventos.'],
  mistakes: ['Retry em todas as camadas.', 'Cadeias síncronas profundas e sem timeouts.', 'Tornar o pedido dependente de um serviço secundário como o e-mail.', 'Eventos que expõem o modelo interno do produtor.', 'Ignorar duplicatas e a ordem das mensagens.', 'Esconder a consistência eventual do usuário.'],
  market: R`Retry storms e cascatas de falhas são causas clássicas de grandes quedas; saber desacoplar no tempo e controlar retentativas é uma habilidade central de arquitetos e SREs.`,
  summary: R`A comunicação síncrona acopla no tempo; a assíncrona desacopla mas exige consistência eventual e idempotência. Medido: com o e-mail fora do ar, 50 de 50 pedidos falharam no modelo síncrono; com fila, 50 foram aceitos e 50 e-mails enviados em 0,2 s quando o serviço voltou. Retry em cada camada (3 × 3) gerou 9 chamadas ao serviço doente; retry só na borda, 3. Use timeouts decrescentes, disjuntores, eventos e filas para o que não precisa estar na resposta.`,
  refs: [REF.eipMessaging, REF.awsRetries, REF.circuitBreaker, REF.grpc, REF.asyncapi, REF.microservicesIo],
  cards: [
    { q: 'O que é acoplamento temporal?', a: 'Depender de que outro serviço esteja no ar no momento da chamada; a fila o remove.' },
    { q: 'Qual a diferença entre comando e evento?', a: 'Comando pede uma ação a um destinatário; evento registra um fato para vários interessados.' },
    { q: 'Por que o retry em cada camada é perigoso?', a: 'Multiplica as chamadas (3 × 3 = 9 ao serviço doente, medido), agravando a falha.' },
    { q: 'O que deve ser assíncrono?', a: 'O que não precisa estar na resposta ao usuário: e-mails, relatórios, indexação.' },
    { q: 'Por que os timeouts devem decrescer?', a: 'Para o chamador interno desistir antes do externo e evitar trabalho inútil.' }
  ]
}
];
