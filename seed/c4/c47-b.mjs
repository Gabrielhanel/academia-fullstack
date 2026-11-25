// C4.7 — Microsserviços. Aulas 3 e 4 (sagas e consistência; service mesh e o projeto).
import { REF } from './c47-a.mjs';
const R = String.raw;

export const REF2 = {
  saga: { title: 'microservices.io — Saga', url: 'https://microservices.io/patterns/data/saga.html', kind: 'artigo' },
  gardenSagas: { title: 'Hector Garcia-Molina e Salem — Sagas (1987)', url: 'https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf', kind: 'artigo' },
  outbox: { title: 'microservices.io — Transactional outbox', url: 'https://microservices.io/patterns/data/transactional-outbox.html', kind: 'artigo' },
  eventSourcing: { title: 'Martin Fowler — Event Sourcing', url: 'https://martinfowler.com/eaaDev/EventSourcing.html', kind: 'artigo' },
  cqrs: { title: 'Martin Fowler — CQRS', url: 'https://martinfowler.com/bliki/CQRS.html', kind: 'artigo' },
  helland: { title: 'Pat Helland — Life beyond Distributed Transactions: an Apostate\'s Opinion (CIDR 2007)', url: 'https://www.cidrdb.org/cidr2007/papers/cidr07p15.pdf', kind: 'artigo' },
  envoyDocs: { title: 'Envoy — Documentation', url: 'https://www.envoyproxy.io/docs/envoy/latest/', kind: 'doc' },
  envoyRetries: { title: 'Envoy — HTTP routing: retries', url: 'https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/http/http_routing', kind: 'doc' },
  envoyOutlier: { title: 'Envoy — Outlier detection', url: 'https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier', kind: 'doc' },
  envoyCircuit: { title: 'Envoy — Circuit breaking', url: 'https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking', kind: 'doc' },
  istio: { title: 'Istio — What is Istio?', url: 'https://istio.io/latest/about/service-mesh/', kind: 'doc' },
  linkerd: { title: 'Linkerd — Overview', url: 'https://linkerd.io/2/overview/', kind: 'doc' },
  spiffe: { title: 'SPIFFE — Overview', url: 'https://spiffe.io/docs/latest/spiffe-about/overview/', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'mic-03', moduleId: 'm2', order: 3, minutes: 90, tags: ['sagas', 'consistência', 'compensação', 'orquestração', 'coreografia', 'idempotência', 'event sourcing'],
  title: 'Sagas e consistência: transações locais, compensações, orquestração x coreografia e retomada',
  objectives: ['Explicar por que transações ACID distribuídas são evitadas e o que a saga propõe', 'Projetar uma saga com passos, compensações e ordem adequada', 'Comparar orquestração e coreografia', 'Medir o que ocorre sem saga e verificar invariantes com falhas injetadas', 'Tornar passos e compensações idempotentes e retomar sagas após a queda do orquestrador'],
  intro: R`Em um banco único, uma **transação** garante tudo-ou-nada. Com **serviços** que têm **bancos próprios**, não há transação comum barata: a operação "criar pedido, reservar estoque, cobrar" atravessa **três bancos**. A **saga** a divide em **transações locais** e, se algo falha, executa **ações compensatórias**. Aqui você mede, com **2.000 pedidos** e falhas injetadas: **sem saga**, **293 pedidos cancelados com estoque preso** (ou **166 cobrados sem estorno** se a ordem for outra); com **saga**, **0 inconsistências**, mesmo com **46 quedas do orquestrador**.`,
  theory: R`### Por que não "transação distribuída"
O **2PC** (*two-phase commit*) dá atomicidade entre bancos, mas **bloqueia recursos**, depende de um **coordenador** disponível e **não é suportado** por muitos brokers e APIs de terceiros: **reduz a disponibilidade** e a escala. Em microsserviços (e em APIs de pagamento, e-mail, etc.) **não se pode** abrir uma transação global. Pat Helland: *"vida além das transações distribuídas"*: **aceite consistência eventual** e **projete as compensações**.

### Saga
Uma **saga** é uma **sequência de transações locais** T1, T2, ... Tn; cada uma **confirma no seu serviço**; se Tk **falha**, executam-se **compensações** Ck-1 ... C1 (em **ordem inversa**) que **desfazem semanticamente** os efeitos (**não** "rollback" físico): **liberar a reserva**, **estornar o pagamento**, **cancelar o pedido**.
- **Transações compensáveis**: têm compensação (reservar estoque ↔ liberar);
- **Ponto de não retorno** (*pivot*): a transação que, **depois de confirmada, obriga a seguir até o fim** (ex.: **confirmar o pagamento definitivo**); **depois dela** só há **transações repetíveis** (retry até conseguir);
- **Ordene os passos**: **coloque os que mais podem falhar e são fáceis de compensar primeiro**, e os **difíceis de compensar** (e-mail ao cliente, nota fiscal) **por último**.
**Estados intermediários são visíveis** (falta de isolamento): o pedido fica **PENDENTE**; trate com **semântica** (estados "pendente", "reservado"), **bloqueios semânticos** e **leituras que toleram o intermediário**.

### Orquestração x coreografia
| | **Orquestração** | **Coreografia** |
|---|---|---|
| Quem controla | um **orquestrador** envia comandos e decide o próximo passo | cada serviço **reage a eventos** e publica o seguinte |
| Visibilidade | **fluxo explícito** em um lugar; fácil de monitorar | fluxo **espalhado**; difícil de entender |
| Acoplamento | serviços acoplados ao orquestrador (ele conhece todos) | acoplamento por **eventos** (ciclos acidentais possíveis) |
| Melhor para | fluxos **complexos**, com muitos passos e regras | fluxos **simples** com poucos participantes |
Ferramentas de **orquestração durável**: **Temporal**, **Camunda/Zeebe**, **AWS Step Functions**, **Azure Durable Functions** (**não executados** aqui; o laboratório usa um orquestrador **em memória** com **log** persistido).

### O laboratório: 2.000 pedidos, falhas injetadas
Serviços **locais e idempotentes**: **estoque** (reservar/liberar), **pagamentos** (cobrar/estornar) e **pedidos**; **falhas injetadas de forma determinística**: **194** pedidos sem estoque e **321** com cartão recusado. Resultados:
**1. Sem saga** (reservar → cobrar; se algo falha, só marca CANCELADO):
§§§
confirmados 1.513 | cancelados 487 | canceladosComReserva 293 | canceladosCobradosSemEstorno 0
§§§
**293 pedidos cancelados continuam com o estoque reservado** (vazamento de estoque). Com a **ordem invertida** (cobrar → reservar): **canceladosCobradosSemEstorno = 166**: **166 clientes cobrados por pedidos cancelados**.
**2. Saga orquestrada com compensações** (reservar → cobrar → confirmar, compensando em ordem inversa): **confirmados 1.513, cancelados 487, e 0 em todas as inconsistências** (**0** confirmados sem reserva/cobrança, **0** cancelados com reserva ou cobrados sem estorno). Efeitos aplicados: **estoque 2.099** (reservas + liberações), **pagamentos 1.513**.
**3. Saga com quedas do orquestrador** (3% dos pedidos: **46 quedas**, após *reservar* ou *cobrar*; o orquestrador **reinicia e retoma pelo log**): **46 retomadas**, **mesmos resultados e 0 inconsistências**; estados finais no log: **CONCLUIDA 1.513** e **COMPENSADA 487**.
**4. Compensação idempotente**: executar **estornar** duas vezes e **liberar** duas vezes (a segunda sem reserva) **não repete efeitos** (pagamentos: **2** efeitos = cobrar + um estorno; estoque: **0** na liberação extra).
**Modelo em memória** (sem broker, sem falhas reais de máquina): demonstra a **lógica**; produção exige **log durável**, **timeouts** e **monitoramento**.

### Requisitos de uma saga confiável
1. **Cada passo e cada compensação são idempotentes** (chave = §sagaId§ + passo): podem ser repetidos após timeouts/quedas;
2. **Persistir o estado da saga** (qual passo concluiu) **antes e depois** de cada chamada; **retomar** na reinicialização (como o log do laboratório);
3. **Compensações não podem falhar para sempre**: **retry com backoff** e **alerta/intervenção humana** (fila de "sagas travadas");
4. **Timeouts** por passo e **saga com prazo**;
5. **Mensagens duplicadas e fora de ordem**: consumidores idempotentes, **versões** (aula fil-03);
6. **Publicar eventos/comandos com outbox** (aula fil-04) para não perder mensagens;
7. **Observabilidade**: **sagaId** nos logs e traces (curso C4.6), **painel de sagas** em andamento/compensadas/travadas;
8. **Testes** com **injeção de falhas** em cada passo (como o laboratório) e verificação de **invariantes**.

### Consistência de leitura e outros padrões
- **Consistência eventual** nas visões: **réplicas de leitura** atualizadas por eventos (**CQRS**: modelo de escrita separado do de leitura; **não executado**); **Event Sourcing** (guardar **eventos** como fonte da verdade e derivar o estado; **não executado**) combina bem com sagas, mas **aumenta a complexidade**;
- **Reservas com expiração** (TCC: *Try-Confirm/Cancel*): reserva **temporária** que **expira** sozinha se ninguém confirmar;
- **Evite** sagas quando uma **fronteira diferente** resolve com **transação local** (mesmo serviço/banco): **a melhor saga é a que você não precisa**.`,
  concepts: [
    { term: 'Saga', def: 'Sequência de transações locais com compensações para manter a consistência entre serviços.' },
    { term: 'Compensação', def: 'Ação que desfaz semanticamente o efeito de um passo já confirmado.' },
    { term: 'Orquestração', def: 'Estilo de saga em que um coordenador comanda os passos.' },
    { term: 'Coreografia', def: 'Estilo de saga em que cada serviço reage a eventos e publica o próximo.' },
    { term: '2PC', def: 'Protocolo de confirmação em duas fases para transações distribuídas, que bloqueia recursos.' },
    { term: 'Ponto de não retorno (pivot)', def: 'Passo da saga a partir do qual só é possível avançar.' },
    { term: 'Log de saga', def: 'Registro persistente dos passos concluídos, usado para retomar a saga.' },
    { term: 'Invariante', def: 'Propriedade que deve valer sempre, como "pedido confirmado implica estoque reservado".' },
    { term: 'TCC (Try-Confirm/Cancel)', def: 'Padrão de reserva provisória que é confirmada ou cancelada depois.' },
    { term: 'CQRS', def: 'Separação entre o modelo de escrita (comandos) e o modelo de leitura (consultas).' }
  ],
  examples: R`**Analogia:** reservar uma **viagem**: passagem (T1), hotel (T2), carro (T3). Cada reserva é **confirmada no seu balcão** (transações locais). Se o **carro falha**, você **cancela o hotel e a passagem** (compensações) **na ordem inversa**. Sem a saga, você fica **com o hotel pago para uma viagem cancelada** (estoque preso / cobrança sem estorno). O **orquestrador** é o **agente de viagens** que sabe o roteiro e o **caderno de anotações** (o log) mostra onde parou se ele **adoecer no meio**; a **coreografia** é cada balcão **avisando o próximo**: sem agente, mas **ninguém enxerga o roteiro inteiro**. A **compensação idempotente** é o **cancelamento que, repetido, não devolve o dinheiro duas vezes**.

**Exemplo 1: sem saga.** 293 cancelados com estoque preso; com a ordem inversa, 166 cobrados sem estorno.

**Exemplo 2: com saga.** 1.513 confirmados e 487 cancelados, 0 inconsistências.

**Exemplo 3: quedas.** 46 quedas retomadas pelo log, invariantes intactas.`,
  code: [
    { title: 'Orquestrador de saga com compensações e log (JavaScript; resultados medidos)', lang: 'js', code: R`const executaSaga = (m, s, id, log, quedaApos = null) => {
  const passos = [
    { nome: 'reservar', fazer: () => s.reservar(id), compensar: () => s.liberar(id) },
    { nome: 'cobrar', fazer: () => s.cobrar(id), compensar: () => s.estornar(id) },
    { nome: 'confirmar', fazer: () => m.pedidos.set(id, 'CONFIRMADO'), compensar: () => {} }
  ];
  const feitos = log.get(id)?.feitos ?? []; log.set(id, { feitos, estado: 'EM_ANDAMENTO' });
  try {
    for (const p of passos) {
      if (feitos.includes(p.nome)) continue;                          // retomada: não refaz o que o log registra
      p.fazer(); feitos.push(p.nome);                                   // em produção: persistir o log antes/depois de cada chamada
      if (quedaApos === p.nome) throw Object.assign(new Error('queda'), { queda: true });
    }
    log.get(id).estado = 'CONCLUIDA';
  } catch (e) {
    if (e.queda) throw e;                                               // o orquestrador reinicia e retoma pelo log
    for (const p of [...passos].reverse()) if (feitos.includes(p.nome)) p.compensar();   // compensa em ordem inversa
    m.pedidos.set(id, 'CANCELADO'); log.get(id).estado = 'COMPENSADA';
  }
};
// 2.000 pedidos: 1.513 confirmados, 487 cancelados, 0 inconsistências; 46 quedas retomadas`, notes: [{ l: '9', t: 'O log permite pular passos já concluídos.' }, { l: '16', t: 'As compensações vão da última para a primeira.' }] },
    { title: 'Passos e compensações idempotentes (JavaScript)', lang: 'js', code: R`const servicos = (m, falhas) => ({
  reservar: (id) => { if (falhas.estoque.has(id)) throw new Error('sem estoque'); if (!m.estoque.reservas.has(id)) { m.estoque.reservas.set(id, 1); m.estoque.efeitos++; } },
  liberar:  (id) => { if (m.estoque.reservas.delete(id)) m.estoque.efeitos++; },                       // liberar duas vezes: o segundo é no-op
  cobrar:   (id) => { if (falhas.cobranca.has(id)) throw new Error('cartão recusado'); if (!m.pagamentos.cobrados.has(id)) { m.pagamentos.cobrados.set(id, 1); m.pagamentos.efeitos++; } },
  estornar: (id) => { if (m.pagamentos.cobrados.has(id) && !m.pagamentos.estornados.has(id)) { m.pagamentos.estornados.add(id); m.pagamentos.efeitos++; } }
});
// em produção a idempotência vem de uma chave (sagaId + passo) gravada na mesma transação local do efeito`, notes: [{ l: '3', t: 'A compensação só age se houver o que desfazer.' }, { l: '7', t: 'A chave de idempotência fica na transação local do serviço.' }] }
  ],
  bestPractices: ['Evite transações distribuídas: use sagas com transações locais e compensações.', 'Ordene os passos: o que mais falha e é fácil de compensar primeiro; o difícil de compensar por último.', 'Torne passos e compensações idempotentes e persista o log da saga para retomar.', 'Teste com injeção de falhas e verifique invariantes.', 'Use orquestração para fluxos complexos e coreografia para fluxos simples.', 'Monitore sagas travadas e tenha um procedimento humano para elas.'],
  mistakes: ['Tentar 2PC entre serviços ou APIs de terceiros.', 'Cancelar o pedido sem desfazer as reservas e cobranças.', 'Compensações não idempotentes.', 'Esquecer o log e perder o estado da saga em uma queda.', 'Ordem dos passos que deixa o passo mais difícil de compensar no início.', 'Ignorar os estados intermediários visíveis ao usuário.'],
  market: R`Sagas, outbox e idempotência são o vocabulário de consistência em microsserviços; ferramentas como Temporal e Step Functions tornaram a orquestração durável comum em produção.`,
  summary: R`A saga troca a transação global por transações locais e compensações. Medido com 2.000 pedidos e falhas injetadas (194 sem estoque, 321 com cartão recusado): sem saga, 293 pedidos cancelados ficaram com estoque preso (166 cobrados sem estorno com a ordem invertida); com saga orquestrada, 1.513 confirmados, 487 cancelados e 0 inconsistências; com 46 quedas do orquestrador e retomada pelo log, as invariantes se mantiveram; compensações repetidas não duplicam efeitos. Exija idempotência, log persistente, timeouts e observabilidade.`,
  refs: [REF2.saga, REF2.gardenSagas, REF2.helland, REF2.outbox, REF2.cqrs, REF2.eventSourcing],
  cards: [
    { q: 'O que é uma saga?', a: 'Sequência de transações locais com compensações para manter a consistência entre serviços.' },
    { q: 'Em que ordem se compensa?', a: 'Na ordem inversa dos passos confirmados.' },
    { q: 'Qual a diferença entre orquestração e coreografia?', a: 'Na orquestração um coordenador comanda os passos; na coreografia cada serviço reage a eventos.' },
    { q: 'Por que as compensações devem ser idempotentes?', a: 'Porque podem ser repetidas após timeouts ou quedas sem duplicar efeitos (medido: estorno não se repete).' },
    { q: 'O que o log da saga permite?', a: 'Retomar de onde parou após a queda do orquestrador (medido: 46 quedas, 0 inconsistências).' }
  ]
},
{
  id: 'mic-04', moduleId: 'm2', order: 4, minutes: 90, tags: ['service mesh', 'sidecar', 'Envoy', 'retries', 'timeouts', 'outlier detection', 'mTLS', 'plano de controle', 'projeto'],
  title: 'Service mesh: sidecars, retentativas e timeouts no proxy, detecção de outliers e o projeto',
  objectives: ['Explicar o que é uma malha de serviços, o plano de dados e o plano de controle', 'Configurar e medir, com o Envoy, retentativas, timeout por tentativa e detecção de outliers', 'Reconhecer o limite de retentativas simultâneas (circuit breaker) e o retry overflow', 'Avaliar quando uma malha vale o custo e quais funções ficam no código', 'Planejar o projeto integrador "Decomposição com sagas"'],
  intro: R`Uma **malha de serviços** (*service mesh*) move preocupações de **comunicação** (retentativas, timeouts, balanceamento, **mTLS**, observabilidade) para um **proxy ao lado de cada serviço** (**sidecar**), controlado por uma **camada central**. Aqui você usa o **Envoy 1.34.14 de verdade** como sidecar didático e mede: **retentativas** (**47,8% → 95,3%** de sucesso com requisições sequenciais), o **limite de retentativas simultâneas** (**56,6%** com 10 em paralelo e **209 retry overflows**), o **timeout por tentativa** (**504 em 632 ms**) e a **detecção de outliers** (instância defeituosa **ejetada** após ~3 falhas).`,
  theory: R`### O que é a malha
- **Plano de dados**: proxies **sidecar** (Envoy, Linkerd2-proxy) **interceptam** o tráfego de cada serviço e aplicam **políticas**: **balanceamento**, **retentativas**, **timeouts**, **disjuntores**, **detecção de outliers**, **mTLS**, **telemetria** (métricas e traces **sem alterar o código**), **roteamento** (canário, espelhamento).
- **Plano de controle** (Istio, Linkerd, Consul): **distribui a configuração** aos proxies (por xDS), **gerencia identidades e certificados** (SPIFFE) e **políticas de autorização**.
- **Variações**: **sidecar-less/ambient** (um proxy por nó), **bibliotecas** (gRPC com *xDS*), **gateway** (apenas na borda: aula api-08).
**Benefícios**: políticas **consistentes** em **qualquer linguagem**; **segurança** (mTLS automático, identidade por serviço); **observabilidade uniforme**; **mudanças sem redeploy** (rotas, timeouts). **Custos**: **complexidade operacional**, **latência e recursos** por sidecar, **depuração** mais difícil, **curva de aprendizado**, **mais componentes que podem falhar**. **Quando vale**: **dezenas de serviços**, **várias linguagens**, **requisitos de mTLS/zero trust** e **equipe de plataforma**. **Quando não**: poucos serviços (um **gateway** e **bibliotecas** bastam).

### O laboratório: Envoy como sidecar didático
Envoy **1.34.14** (contêiner oficial, configuração estática em §envoy.yaml§, **sem plano de controle**, **sem mTLS**), na frente de serviços Express.

**1. Retentativas (§retry_on: 5xx,connect-failure§, §num_retries: 3§, §per_try_timeout: 0,3s§)** com um serviço que **falha 50%** das vezes:
| Cenário | Sucesso | Chamadas ao serviço por requisição |
|---|---|---|
| **direto** ao serviço (500 req) | **47,8%** | 1,00 |
| **via Envoy, sequencial** (400 req) | **95,3%** | **1,95** |
| **via Envoy, 10 simultâneas** (500 req) | **56,6%** | **1,16** |
O **teórico** com 3 retentativas é **1 − 0,5⁴ = 93,75%**; o sequencial (**95,3%**) confere (amostra). Mas **com 10 requisições simultâneas** o sucesso **caiu para 56,6%**: o Envoy **recusou retentativas excedentes**: as estatísticas mostraram **§upstream_rq_retry_overflow§ = 209**. O motivo: o **circuit breaker padrão do cluster** limita as **retentativas simultâneas** (§max_retries§ = **3**): é uma **proteção contra *retry storms*** (aula mic-02), um **orçamento de retentativas**. **Lição**: **leia os padrões do seu proxy**; retentativas ilimitadas **amplificam falhas**; ajuste **com dados** (§retry_budget§ ou §max_retries§).
Estatísticas: §upstream_rq_retry§ (retentativas feitas), §upstream_rq_retry_success§, §upstream_rq_retry_overflow§ (recusadas pelo limite).

**2. Timeout por tentativa**: serviço que responde em **500 ms** com §per_try_timeout: 0,2s§ e **2 retentativas**: resposta **504** em **632 ms**; **3 chamadas** chegaram ao serviço (**§upstream_rq_per_try_timeout§ = 3**); **o serviço continuou trabalhando** nas tentativas canceladas (o proxy **abandona**, não **cancela** o trabalho do upstream): **o serviço também precisa de timeouts e de cancelamento** (aula api-08).

**3. Detecção de outliers** (§consecutive_5xx: 3§, §interval: 0,5s§, §base_ejection_time: 30s§): duas instâncias, **uma sempre devolve 503**. Primeira janela de 100 requisições: **97** com sucesso, **3** com 503 (a instância ruim recebeu **3**); **janelas 2 a 4**: **100% de sucesso** e **a instância ruim recebeu 0** (§ejections_active§ = 1): o Envoy **ejetou** a instância defeituosa do balanceamento e **a recolocará** depois do tempo de ejeção (com **limite de ejeção** para não esvaziar o cluster). **Complementa** health checks ativos.

### O que a malha NÃO resolve
- **Idempotência**: retentativas automáticas **exigem operações idempotentes** (aula api-07): o proxy **não sabe** se o POST é seguro de repetir (configure §retry_on§ conforme o método);
- **Consistência de dados** (sagas: aula mic-03), **contratos** e **versionamento**;
- **Latência de aplicação**: cada salto de sidecar **soma** (~ms);
- **Lógica de negócio** em políticas de rota: mantenha o proxy **burro**.

### Segurança: mTLS e identidade (conceito; não executado)
Na malha, cada carga de trabalho recebe uma **identidade** (SPIFFE ID, certificado de **vida curta** rotacionado automaticamente) e os sidecars **autenticam-se mutuamente** (**mTLS**): tráfego **cifrado** e **identificado** entre serviços, base de **políticas de autorização** ("o serviço pedidos pode chamar pagamentos") e de **zero trust**. Requer **plano de controle** e **autoridade certificadora** (**não executado** aqui).

### Alternativas e ferramentas
**Istio** (rico, complexo; modo **ambient**), **Linkerd** (leve, simples), **Consul Connect**, **Cilium**/eBPF; **gateways** (Kong, Envoy Gateway, NGINX); em **Kubernetes**, **Services** e **NetworkPolicies** cobrem o básico. **Comece simples**: **bibliotecas** + **gateway** + **observabilidade**; adote uma malha **quando a dor justificar**.

### Projeto integrador: decomposição com sagas
**Cenário**: decompor uma **loja** (monólito modular) em **pedidos, estoque, pagamentos e notificações**.
**Entregáveis**:
1. **Mapa de contextos delimitados** e **propriedade de dados** por serviço, com **ADR** justificando **o que vira serviço** e **o que permanece módulo** (e **medições** do custo de uma chamada de rede e do N+1 evitado por lote ou cópia de leitura);
2. **Contratos** (OpenAPI e AsyncAPI), **eventos versionados** e **outbox** (aula fil-04);
3. **Saga de pedido** **orquestrada** (reservar → cobrar → confirmar) com **compensações idempotentes**, **log persistente** (PostgreSQL), **retomada** após queda e **testes de injeção de falhas** com **verificação de invariantes** (como o laboratório);
4. **Notificações assíncronas** (fila, retry com backoff, DLQ) que **não derrubam o pedido** quando o serviço está fora;
5. **Resiliência**: **timeouts decrescentes**, **retry em um só nível** (borda/sidecar), **disjuntor**, **degradação graciosa**;
6. **Observabilidade**: **sagaId e traceId** nos logs, métricas RED por serviço e **SLO** de ponta a ponta com **burn rate** (curso C4.6);
7. **Opcional**: um **Envoy** na frente de um serviço com **retry, per_try_timeout e outlier detection**, com **medições**.
**Critérios**: **0 inconsistências** com falhas injetadas; **o pedido segue** com o e-mail fora; **nenhum banco compartilhado**; documentação de **limitações** (o que não foi executado).`,
  concepts: [
    { term: 'Service mesh', def: 'Infraestrutura de comunicação entre serviços feita por proxies sidecar e uma camada de controle.' },
    { term: 'Sidecar', def: 'Proxy que roda ao lado de cada serviço e intercepta seu tráfego.' },
    { term: 'Plano de dados', def: 'Conjunto de proxies que encaminham e governam o tráfego entre serviços.' },
    { term: 'Plano de controle', def: 'Componente que configura os proxies e gerencia identidades e políticas.' },
    { term: 'Envoy', def: 'Proxy de alto desempenho muito usado como plano de dados de malhas de serviços e gateways.' },
    { term: 'Outlier detection', def: 'Mecanismo que remove temporariamente do balanceamento instâncias com falhas consecutivas.' },
    { term: 'per_try_timeout', def: 'Tempo máximo de cada tentativa individual em uma política de retentativas.' },
    { term: 'retry overflow', def: 'Retentativa recusada porque o limite de retentativas simultâneas foi atingido.' },
    { term: 'mTLS', def: 'TLS mútuo: cliente e servidor autenticam-se com certificados.' },
    { term: 'SPIFFE', def: 'Padrão de identidade de cargas de trabalho, com certificados de vida curta.' }
  ],
  examples: R`**Analogia:** a malha é o **sistema de correios do prédio**: em vez de cada morador (serviço) saber **tentar de novo, avisar o porteiro e conferir o RG do entregador**, cada apartamento tem **um funcionário ao lado da porta** (sidecar) que faz isso por ele, seguindo **o regulamento enviado pela administração** (plano de controle). O **retry overflow** é o funcionário dizendo "**só posso repetir 3 entregas ao mesmo tempo**, senão entopimos o corredor". A **ejeção de outlier** é **parar de mandar encomendas ao apartamento cuja campainha só dá defeito** por um tempo.

**Exemplo 1: retentativas.** 47,8% direto; 95,3% sequencial via sidecar; 56,6% com 10 simultâneas (209 overflows).

**Exemplo 2: timeout.** 504 em 632 ms; 3 chamadas ao serviço.

**Exemplo 3: outlier.** A instância ruim recebeu 3 requisições na primeira janela e 0 nas seguintes.`,
  code: [
    { title: 'Envoy: retentativas, timeout e outlier detection (YAML, envoy.yaml do laboratório; trecho)', lang: 'yaml', code: R`routes:
  - match: { prefix: "/instavel" }
    route:
      cluster: instavel
      timeout: 2s
      retry_policy: { retry_on: "5xx,connect-failure", num_retries: 3, per_try_timeout: 0.3s }
  - match: { prefix: "/lento" }
    route:
      cluster: lento
      timeout: 2s
      retry_policy: { retry_on: "5xx", num_retries: 2, per_try_timeout: 0.2s }
clusters:
  - name: par
    type: STATIC
    lb_policy: ROUND_ROBIN
    outlier_detection: { consecutive_5xx: 3, interval: 0.5s, base_ejection_time: 30s, max_ejection_percent: 50 }
    # (o circuit_breakers padrão limita as retentativas simultâneas a max_retries = 3)`, notes: [{ l: '5', t: 'Cada tentativa tem seu prazo; o total é limitado por timeout.' }, { l: '15', t: 'A instância com 3 erros 5xx consecutivos é ejetada por 30 s.' }] },
    { title: 'Medindo as estatísticas do Envoy pela API de administração (JavaScript; resultados medidos)', lang: 'js', code: R`const stat = async (re) => { const t = await (await fetch('http://127.0.0.1:59901/stats')).text(); return Object.fromEntries(t.split('\n').filter((l) => re.test(l)).map((l) => l.split(': '))); };

await stat(/cluster\.instavel\.upstream_rq_retry(:|$)|upstream_rq_retry_overflow|upstream_rq_retry_success/);
// após 400 sequenciais + 500 simultâneas: retry 460, retry_overflow 209, retry_success 233
await stat(/cluster\.lento\.upstream_rq_per_try_timeout/);                     // 3
await stat(/cluster\.par\.outlier_detection\.ejections_active/);               // 1`, notes: [{ l: '4', t: 'O overflow revela o limite de retentativas simultâneas.' }, { l: '6', t: 'A ejeção ativa mostra a instância removida do balanceamento.' }] }
  ],
  bestPractices: ['Adote uma malha só quando a dor (muitos serviços, mTLS, políticas) justificar o custo.', 'Leia e ajuste os padrões do proxy: limites de retentativas, timeouts e circuit breakers.', 'Faça retentativas automáticas só em operações idempotentes.', 'Mantenha timeouts e cancelamento também no serviço, não só no proxy.', 'Use detecção de outliers e health checks juntos e limite a ejeção.', 'Mantenha o proxy sem regras de negócio.'],
  mistakes: ['Esperar que a malha resolva consistência de dados e contratos.', 'Retentativas automáticas em POSTs não idempotentes.', 'Ignorar os limites padrão (max_retries) e interpretar mal a taxa de sucesso.', 'Adotar uma malha com poucos serviços.', 'Confiar que o timeout do proxy cancela o trabalho do upstream.', 'Esquecer o custo de latência e recursos dos sidecars.'],
  market: R`Istio, Linkerd e Envoy aparecem em quase toda plataforma Kubernetes madura; saber quando uma malha compensa e como ela se comporta sob falha é diferencial em vagas de plataforma e arquitetura.`,
  summary: R`Uma malha move retentativas, timeouts, balanceamento, mTLS e telemetria para sidecars controlados por um plano de controle. Medido com o Envoy 1.34.14 como sidecar didático: o sucesso foi de 47,8% direto para 95,3% com retentativas sequenciais; com 10 requisições simultâneas caiu para 56,6% e houve 209 retry overflows (o limite padrão de retentativas simultâneas); o per_try_timeout de 0,2 s deu 504 em 632 ms e 3 chamadas ao serviço; a detecção de outliers ejetou a instância defeituosa (3 requisições na primeira janela e 0 depois). A malha não resolve idempotência, consistência nem contratos.`,
  refs: [REF2.envoyDocs, REF2.envoyRetries, REF2.envoyOutlier, REF2.envoyCircuit, REF2.istio, REF2.linkerd, REF2.spiffe],
  cards: [
    { q: 'O que são os planos de dados e de controle?', a: 'O de dados são os proxies que governam o tráfego; o de controle os configura e gerencia identidades e políticas.' },
    { q: 'Por que o sucesso caiu com requisições simultâneas no Envoy?', a: 'O circuit breaker padrão limita as retentativas simultâneas e o excedente é recusado (retry_overflow = 209).' },
    { q: 'O proxy cancela o trabalho do upstream em um timeout?', a: 'Não: ele abandona a espera; o serviço continuou trabalhando (3 chamadas medidas).' },
    { q: 'O que faz a detecção de outliers?', a: 'Ejeta temporariamente do balanceamento instâncias com falhas consecutivas.' },
    { q: 'Quando uma malha de serviços compensa?', a: 'Com muitos serviços e linguagens, exigência de mTLS e uma equipe de plataforma; senão, gateway e bibliotecas bastam.' }
  ]
}
];
