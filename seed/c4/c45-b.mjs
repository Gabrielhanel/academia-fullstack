// C4.5 — Filas e processamento assíncrono. Aulas 3 e 4 (retry, backoff e DLQ; integrações entre sistemas e o projeto).
import { REF } from './c45-a.mjs';
const R = String.raw;

export const REF2 = {
  awsBackoff: { title: 'AWS Builders\' Library — Timeouts, retries and backoff with jitter', url: 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/', kind: 'artigo' },
  outbox: { title: 'microservices.io — Transactional outbox', url: 'https://microservices.io/patterns/data/transactional-outbox.html', kind: 'artigo' },
  idempotentConsumer: { title: 'microservices.io — Idempotent Consumer', url: 'https://microservices.io/patterns/communication-style/idempotent-consumer.html', kind: 'artigo' },
  pgSelect: { title: 'PostgreSQL — SELECT (The Locking Clause: FOR UPDATE, SKIP LOCKED)', url: 'https://www.postgresql.org/docs/17/sql-select.html', kind: 'doc' },
  sagas: { title: 'microservices.io — Saga pattern', url: 'https://microservices.io/patterns/data/saga.html', kind: 'artigo' },
  webhookGuide: { title: 'Stripe — Webhooks (retentativas e assinaturas)', url: 'https://docs.stripe.com/webhooks', kind: 'doc' },
  cloudEvents: { title: 'CloudEvents — especificação', url: 'https://cloudevents.io/', kind: 'especificação' },
  asyncapi: { title: 'AsyncAPI — documentação', url: 'https://www.asyncapi.com/docs', kind: 'doc' }
};

export const lessonsB = [
{
  id: 'fil-03', moduleId: 'm2', order: 3, minutes: 85, tags: ['retry', 'backoff', 'jitter', 'DLQ', 'mensagem venenosa', 'job travado', 'idempotência'],
  title: 'Retry, backoff e dead letter queue: falhas transitórias, mensagens venenosas, jobs travados e idempotência',
  objectives: ['Distinguir falhas transitórias de permanentes e decidir o que repetir', 'Medir intervalos de backoff fixo e exponencial e aplicar jitter', 'Implementar uma dead letter queue com contexto da falha e reprocessamento', 'Explicar e reproduzir o job travado (stalled) e o que ele implica para a idempotência', 'Projetar processadores idempotentes'],
  intro: R`Em sistemas assíncronos, **falhar é normal**: a API de terceiros cai, o banco dá *timeout*, um deploy reinicia o worker. O que importa é **como reagir**: **repetir** (com **intervalos crescentes e aleatórios**), **separar** o que **nunca** vai funcionar (**mensagem venenosa**) em uma **DLQ**, e garantir que **repetir não duplique efeitos**. Aqui você mede **intervalos reais** (**fixo ~200 ms**; **exponencial 115 → 303 → 505 → 807 ms**), uma **DLQ** que recebeu 2 de 5 jobs e o **job travado** executado **2 vezes**.`,
  theory: R`### Falha transitória x permanente
- **Transitória**: *timeout*, 503, deadlock, conexão resetada → **repetir** pode resolver;
- **Permanente**: **payload inválido**, **404** do recurso, **regra de negócio** violada, bug → **repetir não ajuda** (**mensagem venenosa**).
O processador deve **classificar**: lançar um erro **repetível** (deixa o BullMQ tentar de novo) ou um **erro definitivo** (§UnrecoverableError§ no BullMQ: **vai direto para failed**, **sem** novas tentativas — não executado aqui) e **registrar** o motivo.

### Tentativas e backoff
§{ attempts: 5, backoff: { type: 'fixed' | 'exponential', delay: 100 } }§. Medido (o job **falha 4 vezes e conclui na 5ª**, delay base **100 ms**):
| Estratégia | Intervalos entre as tentativas (ms) |
|---|---|
| **fixed** | 169, 202, 202, 202 |
| **exponential** | **115, 303, 505, 807** |
O fixo repete a cada **~200 ms** (100 de espera + sobrecarga do processamento e do polling); o **exponencial** cresce (**~2^n × base**, somando a sobrecarga). **Exponencial** dá **tempo de recuperação** ao sistema que está falhando; **fixo** pode **martelar** um serviço doente.

### Jitter: espalhar as tentativas
Se **mil jobs** falham ao mesmo tempo (a API caiu) e **todos** repetem em **1 s, 2 s, 4 s**, geram **ondas sincronizadas** (*thundering herd*) que **derrubam de novo** o serviço quando ele volta. O **jitter** (aleatoriedade) **espalha**. No BullMQ, uma **estratégia personalizada** no worker:
§§§
new Worker('fila', processa, { settings: { backoffStrategy: (n) => { const base = 100 * 2 ** (n - 1); return Math.round(base / 2 + Math.random() * base / 2); } } });
// job: { attempts: 4, backoff: { type: 'custom' } }
§§§
Medido (3 atrasos sorteados entre **metade da base e a base**): **84, 194, 301 ms**; o job que **sempre falhava** terminou **failed após 4 tentativas**. A AWS descreve o *full jitter* (**aleatório entre 0 e a base**) como uma ótima escolha (**artigo "Timeouts, retries, and backoff with jitter"**).
**Limites**: **tentativas máximas** e **prazo total**; **retry storm** (várias camadas repetindo, multiplicando a carga: repita **em um só nível**); só repita operações **idempotentes** (ou torne-as).

### Dead letter queue (DLQ)
Jobs que **esgotaram as tentativas** vão para uma **fila separada** com **contexto**: dados, **motivo**, **número de tentativas**, origem e *stack*. No BullMQ: ouvir §worker.on('failed')§ e, quando §job.attemptsMade >= attempts§, adicionar à fila §*-dlq§. Medido (5 jobs, 2 corrompidos, §attempts: 3§):
- processados com sucesso: **1, 3, 5**;
- **falharam na fila principal: 2** (guardados com §removeOnFail: false§) e **na DLQ: 2**;
- conteúdo da DLQ: §{"id":2,"motivo":"payload inválido","tentativas":3}§ e §{"id":4,"motivo":"payload inválido","tentativas":3}§;
- **depois de "corrigir o problema"**, um worker da DLQ **reprocessou 2 e 4**.
**Operação da DLQ**: **alerta** quando **não está vazia** (é um **incidente em potencial**); **painel** para inspecionar; **reprocessar** (*redrive*) **depois** de corrigir a causa (nunca em laço cego); **retenção** e **análise** (**por que** falhou?). Uma DLQ **ignorada** é uma **lixeira de dados perdidos**.

### Job travado (stalled)
Um worker **renova uma trava** do job enquanto o processa. Se **perde a trava** (o processo **caiu**, ou o **event loop foi bloqueado** e não renovou), o job é considerado **travado**: o BullMQ **o devolve à fila** (até §maxStalledCount§ vezes) e **outro worker** o executa. Medido: com §lockDuration: 500§ e um **laço síncrono de 2,5 s** no processamento, o job foi **executado 2 vezes** (§execuções do mesmo job: 2§), houve o evento **stalled** (1) e o worker original, ao tentar finalizar, recebeu **"Missing lock for job 1. moveToFinished"**; o estado final foi **completed**.
**Lições**: a) **at-least-once é real**: o job pode **rodar duas vezes mesmo sem erro**; b) **não bloqueie o event loop** nos processadores (aula nex-01) e ajuste §lockDuration§ ao trabalho; c) **idempotência obrigatória**; d) **registre** o evento §stalled§ como métrica.

### Idempotência do processador
Faça o **efeito** ser **único** mesmo com **N execuções**:
- **Chave de idempotência** do **trabalho** (§pedido-7:email-confirmacao§) e uma **tabela de processados** (§INSERT ... ON CONFLICT DO NOTHING§: se inseriu, executa; senão ignora). Medido: as **duas entregas do mesmo trabalho** produziram **"aplicado, ignorado"**: **1 efeito**;
- **Operações naturalmente idempotentes** (§UPDATE ... SET status='enviado' WHERE id=?§, **upsert**);
- **Repassar a chave** a serviços externos que a aceitam (aula api-07);
- **Atomicidade**: gravar a **chave e o efeito** na **mesma transação** quando o efeito é no banco; para efeitos **externos** (e-mail), aceite "**pelo menos uma vez**" ou use o **padrão outbox** (aula fil-04).
- **Ordem**: filas com várias consumidores **não garantem ordem**; se importa, **particione por chave** ou carregue **versões**/*timestamps* e descarte o antigo.

### Resumo de decisões
| Situação | Ação |
|---|---|
| Erro transitório | repetir com **backoff exponencial + jitter**, com **limite** |
| Erro permanente / payload inválido | **falhar direto** (sem repetir) → **DLQ** |
| Esgotou as tentativas | **DLQ** com contexto + **alerta** |
| Job travado | recuperar (stalled) e **idempotência** |
| Dependência fora do ar | **disjuntor** (aula api-08) e **pausar** a fila |`,
  concepts: [
    { term: 'Falha transitória', def: 'Falha provisória que pode desaparecer ao repetir a operação.' },
    { term: 'Mensagem venenosa', def: 'Mensagem que sempre falha ao ser processada, bloqueando ou desperdiçando recursos.' },
    { term: 'Backoff exponencial', def: 'Espera que cresce a cada tentativa, normalmente dobrando.' },
    { term: 'Jitter', def: 'Aleatoriedade acrescentada aos intervalos de repetição para evitar ondas sincronizadas.' },
    { term: 'Thundering herd', def: 'Estouro de manada: muitos clientes repetindo ao mesmo tempo e sobrecarregando o serviço.' },
    { term: 'Dead letter queue (DLQ)', def: 'Fila que guarda os jobs que esgotaram as tentativas, com contexto, para análise e reprocessamento.' },
    { term: 'Job travado (stalled)', def: 'Job cujo worker perdeu a trava, devolvido à fila para outro worker.' },
    { term: 'lockDuration', def: 'Tempo que a trava de um job vale sem ser renovada.' },
    { term: 'Redrive', def: 'Reenvio dos jobs da DLQ para a fila de origem depois de corrigir a causa.' },
    { term: 'Tabela de processados', def: 'Registro das chaves já tratadas, usado para ignorar duplicatas.' }
  ],
  examples: R`**Analogia:** o **backoff exponencial com jitter** é **ligar para uma loja ocupada**: você tenta, espera 1 min, tenta de novo, espera 2... e **não liga na mesma hora que todo mundo** (jitter), senão **a linha trava de novo**. A **DLQ** é a **gaveta de cartas devolvidas** do correio: a carta que **nunca pôde ser entregue** (endereço inexistente) vai para lá **com um bilhete explicando o motivo**, e alguém **a examina**. O **job travado** é **o cozinheiro que ficou parado tempo demais**: o gerente (BullMQ) dá o pedido a outro — e se o primeiro **acordar e terminar também**, o prato sai **duas vezes**, por isso a cozinha **precisa reconhecer o pedido repetido**.

**Exemplo 1: intervalos.** Fixo ~200 ms; exponencial 115, 303, 505, 807 ms.

**Exemplo 2: DLQ.** 2 dos 5 jobs foram para a DLQ com motivo e 3 tentativas; reprocessados depois.

**Exemplo 3: stalled.** O mesmo job rodou 2 vezes; "Missing lock for job 1".`,
  code: [
    { title: 'Tentativas, backoff e DLQ no BullMQ (JavaScript; resultados medidos)', lang: 'js', code: R`import { Queue, Worker } from 'bullmq';
const q = new Queue('pedidos', { connection: conn }), dlq = new Queue('pedidos-dlq', { connection: conn });
const opts = { attempts: 3, backoff: { type: 'exponential', delay: 100 }, removeOnFail: false };

const w = new Worker('pedidos', async (job) => {
  if (job.data.corrompido) throw new Error('payload inválido');          // falha repetida até esgotar
  await processar(job.data);
}, { connection: conn, concurrency: 2 });

w.on('failed', async (job, err) => {
  if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {              // esgotou as tentativas
    await dlq.add('morto', { origem: job.queueName, id: job.id, dados: job.data, motivo: err.message, tentativas: job.attemptsMade });
  }
});
// 5 jobs (2 corrompidos): processados 1,3,5 | DLQ: 2 e 4 com motivo "payload inválido" e 3 tentativas`, notes: [{ l: '9', t: 'Só vai para a DLQ quem esgotou as tentativas.' }, { l: '11', t: 'O contexto da falha acompanha o job.' }] },
    { title: 'Backoff com jitter e processador idempotente (JavaScript)', lang: 'js', code: R`const w = new Worker('fila', processa, { connection: conn, settings: {
  backoffStrategy: (n) => { const base = 100 * 2 ** (n - 1); return Math.round(base / 2 + Math.random() * base / 2); }   // 84, 194, 301 ms nas medições
} });
await q.add('j', {}, { attempts: 4, backoff: { type: 'custom' } });

async function processaIdempotente(job) {
  const r = await db.query('insert into processados (chave) values ($1) on conflict do nothing', [job.data.chave]);
  if (r.rowCount === 0) return 'ignorado';                               // já tratado: segunda entrega
  await efeito(job.data); return 'aplicado';
}`, notes: [{ l: '2', t: 'Metade da base mais um valor aleatório até a outra metade.' }, { l: '7', t: 'rowCount 0 indica que a chave já existia.' }] }
  ],
  bestPractices: ['Repita só falhas transitórias, com backoff exponencial, jitter e limite de tentativas.', 'Falhe direto as mensagens venenosas e envie-as à DLQ com contexto.', 'Alerte quando a DLQ não estiver vazia e planeje o redrive depois de corrigir a causa.', 'Não bloqueie o event loop e ajuste o lockDuration ao trabalho.', 'Torne os processadores idempotentes com chave de trabalho e tabela de processados.', 'Repita em um só nível para evitar retry storms.'],
  mistakes: ['Repetir erros permanentes indefinidamente.', 'Backoff fixo e curto sobre um serviço doente.', 'DLQ sem alerta nem dono.', 'Reprocessar a DLQ em laço sem corrigir a causa.', 'Supor que um job roda uma vez só, mesmo sem erro.', 'Processadores que bloqueiam o event loop e perdem a trava.'],
  market: R`Retry com backoff e jitter, DLQ e idempotência são tema clássico de design de sistemas e de plantões; incidentes de "tempestade de retries" e de mensagens venenosas travando filas são comuns.`,
  summary: R`Repita só falhas transitórias, com backoff exponencial, jitter e limite. Medido no BullMQ 6.7.10: o backoff fixo de 100 ms deu ~200 ms entre tentativas e o exponencial 115, 303, 505 e 807 ms; com jitter, 84, 194 e 301 ms e job failed após 4 tentativas; uma DLQ recebeu os 2 jobs corrompidos de 5 com motivo e 3 tentativas e foi reprocessada; um laço de 2,5 s com lockDuration de 500 ms fez o mesmo job rodar 2 vezes ("Missing lock for job 1"). Daí a idempotência: duas entregas, um efeito.`,
  refs: [REF.bullmqRetry, REF.bullmqStalled, REF2.awsBackoff, REF.sqsDlq, REF2.idempotentConsumer],
  cards: [
    { q: 'Por que usar jitter no backoff?', a: 'Para espalhar as tentativas e evitar ondas sincronizadas que derrubam o serviço de novo.' },
    { q: 'O que é uma mensagem venenosa?', a: 'Uma mensagem que sempre falha; deve ir para a DLQ em vez de ser repetida indefinidamente.' },
    { q: 'Um job pode executar duas vezes sem erro?', a: 'Sim: se o worker perde a trava (stalled), outro o executa (medido: 2 execuções).' },
    { q: 'Como tornar um processador idempotente?', a: 'Com uma chave de trabalho e uma tabela de processados (insert ... on conflict do nothing).' },
    { q: 'O que fazer quando a DLQ não está vazia?', a: 'Alertar, investigar a causa e só então reprocessar (redrive).' }
  ]
},
{
  id: 'fil-04', moduleId: 'm2', order: 4, minutes: 90, tags: ['integrações', 'outbox', 'escrita dupla', 'SKIP LOCKED', 'consumidor idempotente', 'webhooks', 'sagas', 'projeto'],
  title: 'Integrações entre sistemas: escrita dupla, outbox transacional, relay, consumidor idempotente e o projeto',
  objectives: ['Reconhecer o problema da escrita dupla (banco e fila) e medir a inconsistência', 'Implementar o padrão outbox com um relay usando SKIP LOCKED', 'Aceitar duplicatas (at-least-once) e proteger o consumidor com idempotência', 'Projetar webhooks de entrada e saída com assinatura, retentativas e idempotência', 'Planejar o projeto integrador "Pipeline de jobs"'],
  intro: R`Quase toda integração faz **duas coisas**: **gravar no banco** e **avisar outro sistema** (publicar um evento). Sem cuidado, **uma pode acontecer sem a outra**. Aqui você mede o problema (**4 de 20 pedidos sem evento**), a solução (**outbox transacional**: pedido e evento na **mesma transação**, com um **relay** que publica depois) e o preço (**28 publicações para 20 eventos**: **duplicatas**), resolvido pelo **consumidor idempotente** (**20 efeitos**).`,
  theory: R`### O problema da escrita dupla (dual write)
§§§
await db.query('insert into pedidos ...');   // 1) commit no banco
await fila.add('pedido.criado', ...);        // 2) publicar — e se falhar? se o processo cair entre 1 e 2?
§§§
Não existe **transação distribuída barata** entre banco e fila: se o passo 2 **falha** (fila indisponível, processo morre), o pedido existe **sem evento** (e o estoque/e-mail nunca saem). Se invertermos a ordem, publicamos **eventos de pedidos que não existem**. Medido (20 pedidos; a fila falhou em 4, **depois** do commit): **20 pedidos gravados, 16 eventos publicados, 4 pedidos sem evento** — **inconsistência silenciosa**.

### Outbox transacional
Grave o **evento** em uma tabela **§outbox§ na mesma transação** do negócio; **depois**, um processo (**relay**) lê a outbox e **publica**:
§§§
begin;
insert into pedidos (total) values ($1) returning id;
insert into outbox (tipo, payload) values ('pedido.criado', '{"pedidoId": 7}');
commit;                                                     -- ambos ou nenhum
§§§
Medido: **20 pedidos e 20 linhas na outbox** (juntos); um **rollback** deixou **ambas as contagens inalteradas (20 e 20)**: **nada fica pela metade**.

### O relay (SKIP LOCKED)
§§§
begin;
select id, tipo, payload from outbox where publicado_em is null order by id limit 8 for update skip locked;
-- publicar cada evento na fila (com msgId = 'out-' || id)
update outbox set publicado_em = now() where id = any($1);
commit;
§§§
- §FOR UPDATE SKIP LOCKED§ (PostgreSQL) permite **vários relays em paralelo** sem pegar as mesmas linhas;
- Se o relay **cai entre publicar e marcar**, a transação **desfaz** a marcação e **o evento será publicado de novo**: **at-least-once**. Medido (o relay caiu **uma vez** nessa janela): **28 publicações para 20 eventos** (**8 duplicatas**), **0 pendentes** na outbox, **5 rodadas**.
- Alternativas ao polling: **CDC** (captura de mudanças do log do banco, **Debezium**, **replicação lógica**; **não executado**), que lê o **WAL** e **evita polling**.
- **Limpeza** da outbox (arquivar/apagar publicados) e **índice parcial** em §publicado_em IS NULL§; **ordem** por id **por agregado**.

### Consumidor idempotente
Como **duplicatas são inevitáveis**, o consumidor **registra o §msgId§**:
§§§
insert into processados (msg_id) values ($1) on conflict do nothing;   -- rowCount 1: primeira vez → aplicar o efeito; 0: duplicata → ignorar
§§§
Idealmente, **o registro e o efeito** estão **na mesma transação**. Medido: o consumidor **recebeu 28 mensagens**, de **20 msgIds distintos**, e aplicou **20 efeitos** (os 8 duplicados foram ignorados). **Limpeza** da tabela por TTL (o prazo deve **exceder** a janela de reentrega).

### Garantias que obtemos
**Outbox + relay + consumidor idempotente** = **entrega at-least-once** com **efeito exatamente uma vez** para o consumidor **dentro do seu banco**. **Não** garante **ordem global**: use **chave de partição** ou **versões** se a ordem importa.

### Webhooks (integração por HTTP)
- **Saída** (você chama o cliente): **assine** o corpo (**HMAC** com segredo por cliente e **timestamp**), **retente** com backoff por **dias**, **exponha o id do evento** (idempotência do cliente), **registre** tentativas e permita **reenvio**; **desative** endpoints que falham por muito tempo; **timeout curto**;
- **Entrada** (você recebe): **verifique a assinatura** (**tempo constante**, aula aut-03) e o **timestamp** (anti-replay), responda **2xx rápido** e **processe em fila**, **deduplique** pelo id do evento, **não confie** na ordem.
(Práticas descritas a partir de provedores como a Stripe; **não executadas** aqui.)

### Sagas e consistência entre serviços
Uma operação que atravessa **vários serviços** (pedido → pagamento → estoque) **não pode** ser uma transação ACID: usa-se **saga**: uma sequência de **transações locais** com **ações compensatórias** em caso de falha (**coreografia** por eventos ou **orquestração** por um coordenador). Eventos vêm do **outbox**; cada passo é **idempotente**; **compensações** também. Veja o curso de microsserviços (C4.7).

### Contratos de eventos
Defina **esquemas** e **versione** (§tipo§, §versao§, §id§, §tempo§, §fonte§, §dados§): o padrão **CloudEvents** padroniza o envelope; **AsyncAPI** documenta APIs assíncronas (como o OpenAPI, aula api-03); consumidores **tolerantes**; **testes de contrato** (aula api-08).

### Projeto integrador: pipeline de jobs
**Cenário**: uma loja com **pedidos**, **e-mails de confirmação**, **relatórios** e **integração com um ERP** (API externa com limite de taxa).
**Entregáveis**:
1. **Outbox transacional** (PostgreSQL) e **relay** com **SKIP LOCKED**, medindo **duplicatas**;
2. **Filas BullMQ** (e-mails, relatórios, ERP) com **concorrência**, **prioridades** e **limitador** para o ERP;
3. **Retry com backoff exponencial e jitter**, **mensagens venenosas** para **DLQ** com contexto e **alerta**; ferramenta de **redrive**;
4. **Processadores idempotentes** (tabela de processados) e **teste** que entrega cada mensagem **2 vezes**;
5. **API 202** com status do trabalho (aula fil-01);
6. **Teste de falha**: derrubar o worker no meio de um job e **comprovar a recuperação** (stalled) sem duplicar efeitos;
7. **Métricas** (tamanho, idade, falhas, DLQ) e **desligamento ordenado**;
8. **ADR** com as garantias (at-least-once + idempotência) e limitações.
**Critérios**: nenhum pedido sem evento (**0 inconsistências**); **efeitos únicos** sob duplicatas; **DLQ** monitorada; **Redis com noeviction** e persistência documentados.`,
  concepts: [
    { term: 'Escrita dupla', def: 'Gravar em dois sistemas (banco e fila) sem transação comum, arriscando inconsistência.' },
    { term: 'Outbox transacional', def: 'Padrão que grava o evento em uma tabela na mesma transação do negócio para publicação posterior.' },
    { term: 'Relay', def: 'Processo que lê a outbox e publica os eventos na fila ou no broker.' },
    { term: 'SKIP LOCKED', def: 'Cláusula do PostgreSQL que pula linhas já bloqueadas, permitindo consumidores paralelos.' },
    { term: 'CDC', def: 'Captura de mudanças do log do banco para gerar eventos sem polling.' },
    { term: 'Consumidor idempotente', def: 'Consumidor que ignora mensagens já processadas, pelo id da mensagem.' },
    { term: 'Webhook', def: 'Chamada HTTP feita por um sistema para notificar outro sobre um evento.' },
    { term: 'Saga', def: 'Sequência de transações locais com compensações para operações entre serviços.' },
    { term: 'CloudEvents', def: 'Especificação de um envelope padrão para descrever eventos.' },
    { term: 'AsyncAPI', def: 'Especificação para descrever APIs assíncronas e baseadas em eventos.' }
  ],
  examples: R`**Analogia:** a **escrita dupla** é **vender o produto e depois lembrar de avisar a entrega**: se você **esquece** (ou desmaia entre os dois passos), o cliente **pagou e ninguém despachou**. O **outbox** é **anotar o aviso no mesmo recibo da venda** (os dois valem juntos ou nenhum); o **relay** é o **mensageiro** que passa pelo balcão, **leva os avisos pendentes** e os marca como entregues — se ele cair no meio do caminho, **entrega de novo** no dia seguinte, por isso o **destinatário confere o número do aviso** (consumidor idempotente) e ignora o repetido.

**Exemplo 1: inconsistência.** 20 pedidos, 16 eventos: 4 sem aviso.

**Exemplo 2: outbox.** 20 pedidos e 20 eventos; o rollback não deixou nada pela metade.

**Exemplo 3: duplicatas.** 28 publicações para 20 eventos; 20 efeitos aplicados.`,
  code: [
    { title: 'Pedido e evento na mesma transação (JavaScript, pg 8.23.1; contagens medidas)', lang: 'js', code: R`const c = await pool.connect();
try {
  await c.query('begin');
  const { rows: [p] } = await c.query('insert into pedidos (total) values ($1) returning id', [total]);
  await c.query("insert into outbox (tipo, payload) values ('pedido.criado', $1)", [{ pedidoId: p.id }]);
  await c.query('commit');                                                   // pedido E evento, ou nenhum
} catch (e) { await c.query('rollback'); throw e; } finally { c.release(); }
// 20 pedidos -> 20 linhas na outbox; um rollback não deixa nada pela metade`, notes: [{ l: '6', t: 'O commit é atômico para as duas tabelas.' }] },
    { title: 'Relay com SKIP LOCKED e consumidor idempotente (JavaScript; resultados medidos)', lang: 'js', code: R`async function relay(lote = 8) {
  const cl = await pool.connect();
  try {
    await cl.query('begin');
    const { rows } = await cl.query('select id, tipo, payload from outbox where publicado_em is null order by id limit $1 for update skip locked', [lote]);
    for (const e of rows) await fila.add(e.tipo, { ...e.payload, msgId: 'out-' + e.id });          // pode duplicar se o relay cair antes do commit
    if (rows.length) await cl.query('update outbox set publicado_em = now() where id = any($1)', [rows.map((r) => r.id)]);
    await cl.query('commit'); return rows.length;
  } catch (e) { await cl.query('rollback'); return -1; } finally { cl.release(); }
}
const consumidor = new Worker('eventos', async (job) => {
  const r = await pool.query('insert into processados (msg_id) values ($1) on conflict do nothing', [job.data.msgId]);
  if (r.rowCount === 1) await aplicarEfeito(job.data);                                          // só na primeira vez
}, { connection: conn });
// com uma queda do relay: 28 publicações, 20 msgIds distintos, 20 efeitos`, notes: [{ l: '5', t: 'SKIP LOCKED permite vários relays sem conflito.' }, { l: '11', t: 'A segunda entrega encontra a chave e ignora o efeito.' }] }
  ],
  bestPractices: ['Evite a escrita dupla: use outbox transacional (ou CDC).', 'Use SKIP LOCKED para relays paralelos e limpe a outbox.', 'Assuma at-least-once e proteja todos os consumidores com idempotência.', 'Assine e deduplique webhooks e processe-os em fila.', 'Use sagas com compensações para operações entre serviços.', 'Versione os esquemas de eventos e teste os contratos.'],
  mistakes: ['Gravar no banco e publicar sem transação comum.', 'Publicar antes do commit e emitir eventos de dados que não existem.', 'Consumidores sem idempotência.', 'Webhooks sem assinatura nem deduplicação.', 'Tabela de processados com prazo menor que a janela de reentrega.', 'Supor ordem global entre eventos.'],
  market: R`O outbox transacional é um dos padrões mais cobrados em arquiteturas orientadas a eventos; saber explicar a escrita dupla, o relay e a idempotência do consumidor é diferencial em entrevistas de sistemas distribuídos.`,
  summary: R`A escrita dupla perde eventos: medido, 20 pedidos gravados e 16 eventos publicados (4 sem evento). O outbox grava o evento na mesma transação (20 pedidos e 20 eventos; o rollback não deixou nada pela metade) e um relay com SKIP LOCKED publica depois; com uma queda do relay houve 28 publicações para 20 eventos (8 duplicatas) e 0 pendentes. O consumidor idempotente recebeu 28 mensagens de 20 msgIds e aplicou 20 efeitos. Assine e deduplique webhooks e use sagas entre serviços.`,
  refs: [REF2.outbox, REF2.idempotentConsumer, REF2.pgSelect, REF2.sagas, REF2.webhookGuide, REF2.cloudEvents, REF2.asyncapi],
  cards: [
    { q: 'Qual o problema da escrita dupla?', a: 'Banco e fila não compartilham transação; uma das escritas pode falhar (medido: 4 de 20 pedidos sem evento).' },
    { q: 'O que o outbox garante?', a: 'Que o evento é gravado atomicamente com o negócio; um relay o publica depois, pelo menos uma vez.' },
    { q: 'Para que serve o SKIP LOCKED?', a: 'Para vários relays lerem linhas diferentes da outbox sem bloquear uns aos outros.' },
    { q: 'Por que há duplicatas na outbox?', a: 'Se o relay cai entre publicar e marcar, republica (medido: 28 publicações para 20 eventos).' },
    { q: 'Como lidar com as duplicatas?', a: 'Consumidor idempotente com tabela de msgIds processados (medido: 20 efeitos).' }
  ]
}
];
