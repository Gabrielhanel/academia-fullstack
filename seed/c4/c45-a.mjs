// C4.5 — Filas e processamento assíncrono. Aulas 1 e 2 (filas e jobs; BullMQ).
const R = String.raw;

export const REF = {
  bullmq: { title: 'BullMQ — Documentation', url: 'https://docs.bullmq.io/', kind: 'doc' },
  bullmqQueues: { title: 'BullMQ — Queues', url: 'https://docs.bullmq.io/guide/queues', kind: 'doc' },
  bullmqConcurrency: { title: 'BullMQ — Concurrency', url: 'https://docs.bullmq.io/guide/workers/concurrency', kind: 'doc' },
  bullmqRetry: { title: 'BullMQ — Retrying failing jobs', url: 'https://docs.bullmq.io/guide/retrying-failing-jobs', kind: 'doc' },
  bullmqRate: { title: 'BullMQ — Rate limiting', url: 'https://docs.bullmq.io/guide/rate-limiting', kind: 'doc' },
  bullmqStalled: { title: 'BullMQ — Stalled jobs', url: 'https://docs.bullmq.io/guide/jobs/stalled', kind: 'doc' },
  redisLmove: { title: 'Redis — LMOVE', url: 'https://redis.io/docs/latest/commands/lmove/', kind: 'doc' },
  redisPersistence: { title: 'Redis — Persistence', url: 'https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/', kind: 'doc' },
  eip: { title: 'Enterprise Integration Patterns', url: 'https://www.enterpriseintegrationpatterns.com/', kind: 'livro' },
  rabbitReliability: { title: 'RabbitMQ — Reliability Guide', url: 'https://www.rabbitmq.com/docs/reliability', kind: 'doc' },
  sqsDlq: { title: 'Amazon SQS — Dead-letter queues', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html', kind: 'doc' }
};

export const lessonsA = [
{
  id: 'fil-01', moduleId: 'm1', order: 1, minutes: 75, tags: ['filas', 'jobs', 'produtor e consumidor', 'at-least-once', 'confiabilidade', 'Redis'],
  title: 'Filas e jobs: por que desacoplar, semânticas de entrega e o que acontece quando o trabalhador cai',
  objectives: ['Explicar o modelo produtor-fila-consumidor e os problemas que ele resolve', 'Distinguir at-most-once, at-least-once e exactly-once (e por que o último é raro)', 'Medir a perda de um job quando o trabalhador cai em uma fila ingênua x uma fila confiável', 'Escolher entre chamada direta, evento e fila de jobs', 'Descrever o ciclo de vida de um job'],
  intro: R`Enviar um e-mail, gerar um relatório, redimensionar uma imagem: tarefas **lentas, falíveis ou que ocorrem em picos** não devem rodar **dentro da requisição HTTP**. A solução é **enfileirar um job** e responder rápido (**202 Accepted**); **trabalhadores** o processam depois. Aqui você mede, com **Redis 8.12.0**, o que acontece quando o trabalhador **cai no meio de um job**: a fila ingênua **perdeu 1 job**; a confiável **o manteve visível**.`,
  theory: R`### Por que filas
- **Latência**: responda ao usuário em milissegundos; o trabalho pesado segue em segundo plano;
- **Absorção de picos** (*load leveling*): a fila **amortece** rajadas; os trabalhadores consomem **no seu ritmo**;
- **Desacoplamento** no tempo e na implantação: o produtor **não espera** o consumidor (nem precisa estar no ar ao mesmo tempo);
- **Resiliência**: falhas transitórias são **repetidas** (aula fil-03);
- **Escala independente**: mais trabalhadores sem mexer na API;
- **Controle de concorrência e de taxa** (proteger o banco ou uma API externa).
**Custos**: **consistência eventual** (o resultado não está pronto na resposta), **mais componentes** a operar, **duplicidade** de execução (abaixo), **depuração** mais difícil e a necessidade de **observabilidade** (curso C4.6).

### Anatomia
**Produtor** (API) → **fila** (Redis/BullMQ, RabbitMQ, SQS, Kafka) → **trabalhadores** (*workers*) → efeito (e-mail enviado, arquivo gerado) → **resultado/status** (consultado por polling, **webhook**, WebSocket: aula api-05).
**Job**: **nome**, **dados** (pequenos: **ids**, não arquivos), **opções** (tentativas, atraso, prioridade) e **estado**: §waiting§ → §active§ → §completed§ | §failed§ (+ §delayed§ para agendados e §waiting-children§ para fluxos).
**Padrão de API**: §POST /relatorios§ → **202** com §{ id, status: "na fila", urlStatus: "/relatorios/123" }§ → o cliente consulta §GET /relatorios/123§.

### Semânticas de entrega
| Garantia | Significado | Como ocorre |
|---|---|---|
| **At-most-once** | **0 ou 1** vez | tira da fila **antes** de processar; se o trabalhador cair, o job **se perde** |
| **At-least-once** | **1 ou mais** vezes | só confirma **depois** de processar; se cair, **reentrega** → **duplicatas** possíveis |
| **Exactly-once** | exatamente 1 | **em geral inviável de ponta a ponta** (rede e falhas parciais); consegue-se **efeito único** com **at-least-once + idempotência** (aulas fil-03 e fil-04) |
**Regra prática**: **projete para at-least-once** e torne **o processamento idempotente**.

### Medido: o trabalhador cai no meio do 3º job (6 jobs, Redis 8.12.0)
Dois trabalhadores (processos filhos) que **retiram** o job e **caem** (§process.exit(1)§) ao processar o 3º:
- **Lista + §BRPOP§ (ingênua)**: o job é **removido da fila ao ser lido**. Resultado: **2 concluídos, 3 ainda na fila, 1 perdido**.
- **Lista + §BLMOVE§ para uma lista "processando"** (confiável): o job é **movido atomicamente** para "processando" **antes** de ser executado. Resultado: **2 concluídos, 3 na fila, 1 preso em "processando"**, **0 perdidos**.
Mas **alguém precisa devolver** o job preso à fila (detectar que o dono morreu: **trava com prazo**, *heartbeat*, **visibilidade** como o *visibility timeout* do SQS): é exatamente o que **bibliotecas** como o **BullMQ** fazem (aula fil-02). **Não reinvente**: filas confiáveis têm muitos detalhes (travas, relógio, reentrada, atraso, prioridade).

### Escolhendo
| Necessidade | Escolha |
|---|---|
| Resposta **agora**, operação curta | chamada direta (HTTP/gRPC) |
| **Notificar** vários interessados | evento em um **broker** (pub/sub, tópicos) |
| Trabalho **longo, retentável**, com picos e controle de taxa | **fila de jobs** (BullMQ, SQS, Sidekiq, Celery) |
| **Log durável** com reprocessamento e ordem por chave | **Kafka**/streams (curso de mensageria) |
**Redis como fila**: simples e rápido; **durabilidade depende da persistência** (AOF/RDB; aula nsq-07) e da **política de memória** (**noeviction** para filas!). Para garantias fortes de entrega e roteamento, considere **RabbitMQ/SQS**.

### Quais dados colocar no job
**Ids e parâmetros**, não objetos grandes (o job vive em Redis: memória) nem **segredos** (ficam em logs/painéis); **versione** o formato (§{ versao: 2 }§) e mantenha consumidores **tolerantes**; inclua **idempotency key** e **correlation id** (aula nex-07/api-08).

### Observabilidade mínima
**Tamanho da fila**, **idade do job mais antigo**, **taxa de conclusão e de falha**, **tempo de processamento** (p95), **jobs travados**, **tamanho da DLQ** (curso C4.6). **Alerta** em **crescimento sustentado** da fila.`,
  concepts: [
    { term: 'Fila', def: 'Estrutura que guarda tarefas para processamento posterior por consumidores.' },
    { term: 'Job', def: 'Unidade de trabalho colocada em uma fila, com dados e opções.' },
    { term: 'Worker', def: 'Processo que consome jobs de uma fila e os executa.' },
    { term: 'At-most-once', def: 'Entrega de no máximo uma vez, com risco de perda.' },
    { term: 'At-least-once', def: 'Entrega de uma ou mais vezes, com risco de duplicatas.' },
    { term: 'Exactly-once', def: 'Entrega de exatamente uma vez; de ponta a ponta, em geral só se obtém o efeito por idempotência.' },
    { term: 'Load leveling', def: 'Uso da fila para amortecer picos de carga.' },
    { term: '202 Accepted', def: 'Status que indica que a requisição foi aceita para processamento assíncrono.' },
    { term: 'Visibility timeout', def: 'Prazo em que um job retirado fica invisível aos outros consumidores antes de voltar à fila.' },
    { term: 'BLMOVE', def: 'Comando Redis que move um elemento de uma lista a outra de forma atômica, bloqueando se vazia.' }
  ],
  examples: R`**Analogia:** a fila de jobs é a **bandeja de pedidos da cozinha**: o garçom (API) **deixa o pedido** e volta a atender; os cozinheiros (workers) **pegam um por vez**. A fila **ingênua** é o cozinheiro que **rasga o pedido ao pegá-lo**: se ele desmaia, **o pedido some**. A fila **confiável** é o cozinheiro que **move o pedido para o "em preparo"**: se ele desmaia, o pedido **continua visível**, e o gerente (o BullMQ) **o devolve à bandeja** quando percebe que o cozinheiro sumiu. Como às vezes o pedido é feito duas vezes, a cozinha **precisa reconhecer um pedido repetido** (idempotência).

**Exemplo 1: perda.** BRPOP: 1 job perdido; BLMOVE: 0 perdidos (1 preso).

**Exemplo 2: 202.** POST /relatorios devolve 202 e um link de status.

**Exemplo 3: garantia.** Projetar para at-least-once com processamento idempotente.`,
  code: [
    { title: 'Fila ingênua x confiável com listas do Redis (JavaScript, ioredis; resultado medido)', lang: 'js', code: R`import Redis from 'ioredis';
const r = new Redis({ host: '127.0.0.1', port: 57379 });

// INGÊNUA: o job sai da fila ao ser lido; se o trabalhador cair, ele se perde
const job = (await r.brpop('fila', 1))?.[1];

// CONFIÁVEL: o job é movido atomicamente para "processando"
const job2 = await r.blmove('fila', 'processando', 'RIGHT', 'LEFT', 1);
await executar(job2);
await r.lrem('processando', 1, job2);                  // só confirma depois de processar (at-least-once)

// Medido (6 jobs; o trabalhador cai no 3º):
//   BRPOP : concluídos 2, na fila 3, perdidos 1
//   BLMOVE: concluídos 2, na fila 3, presos em "processando" 1, perdidos 0`, notes: [{ l: '5', t: 'BRPOP remove o job antes de ele ser processado.' }, { l: '9', t: 'LREM confirma só depois do processamento.' }] },
    { title: 'API que aceita e enfileira (JavaScript, Express 5 e BullMQ)', lang: 'js', code: R`app.post('/relatorios', async (req, res) => {
  const job = await fila.add('gerar', { relatorioId: crypto.randomUUID(), params: req.body }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: { count: 1000 } });
  res.status(202).set('Location', '/relatorios/' + job.id).json({ id: job.id, status: 'na fila' });
});
app.get('/relatorios/:id', async (req, res) => {
  const job = await fila.getJob(req.params.id); if (!job) return res.sendStatus(404);
  res.json({ id: job.id, status: await job.getState(), resultado: job.returnvalue ?? null });
});`, notes: [{ l: '3', t: '202 Accepted: o trabalho ainda não terminou.' }, { l: '7', t: 'O cliente consulta o estado do job.' }] }
  ],
  bestPractices: ['Projete para at-least-once e torne o processamento idempotente.', 'Coloque ids e parâmetros pequenos nos jobs, nunca arquivos ou segredos.', 'Responda 202 com um link de status para trabalhos assíncronos.', 'Use filas confiáveis (BullMQ, SQS) em vez de listas ingênuas.', 'Monitore o tamanho e a idade da fila.', 'Configure o Redis de filas com persistência e noeviction.'],
  mistakes: ['Remover o job da fila antes de processá-lo.', 'Supor entrega exatamente uma vez.', 'Jobs com payloads enormes.', 'Executar tarefas longas dentro da requisição HTTP.', 'Redis de filas com política de eviction que descarta jobs.', 'Não monitorar a fila.'],
  market: R`Filas são o primeiro recurso para tornar APIs rápidas e resilientes; entender as semânticas de entrega e a idempotência é pergunta frequente em entrevistas de sistemas.`,
  summary: R`Filas desacoplam, amortecem picos e permitem retentativas. As semânticas são at-most-once, at-least-once (a prática, com duplicatas) e exactly-once (obtido por idempotência). Medido no Redis 8.12.0: quando o trabalhador cai, a lista com BRPOP perdeu 1 job e a lista com BLMOVE o manteve visível em "processando" (0 perdidos), mas alguém precisa devolvê-lo à fila, o que o BullMQ faz. Use 202 com link de status, jobs pequenos e idempotência.`,
  refs: [REF.eip, REF.redisLmove, REF.rabbitReliability, REF.redisPersistence],
  cards: [
    { q: 'O que é at-least-once?', a: 'O job é entregue uma ou mais vezes: confirma-se só depois de processar, com risco de duplicatas.' },
    { q: 'O que o experimento mostrou com BRPOP?', a: 'O trabalhador que caiu levou o job junto: 1 job perdido.' },
    { q: 'Por que o BLMOVE é mais seguro?', a: 'Move o job atomicamente para "processando": ele continua visível se o trabalhador cair.' },
    { q: 'O que responder à API de um trabalho assíncrono?', a: '202 Accepted com um identificador e um link para consultar o status.' },
    { q: 'Como obter o efeito de exactly-once?', a: 'Com entrega at-least-once e processamento idempotente.' }
  ]
},
{
  id: 'fil-02', moduleId: 'm1', order: 2, minutes: 85, tags: ['BullMQ', 'concorrência', 'prioridade', 'atraso', 'agendador', 'limitador', 'retenção'],
  title: 'BullMQ na prática: concorrência, prioridade, atraso, agendadores, limite de taxa e retenção',
  objectives: ['Criar filas, produtores e workers com BullMQ e entender o papel do Redis', 'Medir o efeito da concorrência na vazão', 'Usar prioridade, jobs atrasados, agendadores e o limitador de taxa', 'Controlar a retenção de jobs e o uso de memória', 'Encerrar workers com ordem (graceful shutdown)'],
  intro: R`O **BullMQ** é a biblioteca de filas mais usada no ecossistema Node: jobs em **Redis**, workers com **concorrência**, **prioridades**, **atrasos**, **repetições**, **limites de taxa** e **recuperação de jobs travados**. Aqui (BullMQ **6.7.10**, Redis **8.12.0**) você mede a **vazão** (**18 → 89 → 273 jobs/s** com concorrência 1, 5 e 20), a **ordem de prioridade**, o **atraso**, o **agendador**, o **limitador** e o **impacto da retenção** em chaves e memória.`,
  theory: R`### Peças
- **Queue**: o **produtor** adiciona jobs (§add§, §addBulk§).
- **Worker**: o **consumidor**; recebe uma função §async (job) => resultado§ (lançar erro **falha** o job).
- **QueueEvents**: escuta eventos **de todos** os workers (§completed§, §failed§, §stalled§...).
- **Redis**: o **estado** (listas, hashes, conjuntos ordenados). Requer **persistência** e **política §noeviction§** (aula nsq-07). BullMQ 6 exige o pacote **ioredis** instalado.
§§§
const fila = new Queue('relatorios', { connection: { host, port } });
await fila.add('gerar', { id: 42 }, { attempts: 3 });
const w = new Worker('relatorios', async (job) => { /* ... */ return resultado; }, { connection: { host, port }, concurrency: 5 });
§§§

### Concorrência
Cada worker processa **N jobs ao mesmo tempo** (§concurrency§) **no mesmo processo**: ótimo para **E/S** (aguardando rede/banco); **inútil para CPU** (o event loop é um só: aula nex-01). Medido (**100 jobs de 50 ms**):
| concurrency | Tempo total | Vazão |
|---|---|---|
| **1** | 5.420 ms | **18 jobs/s** |
| **5** | 1.125 ms | **89 jobs/s** |
| **20** | 366 ms | **273 jobs/s** |
A vazão **cresce quase linearmente** com a concorrência enquanto o gargalo for **esperar** (aqui, um *sleep*). Limites reais: **conexões do banco** (pool), **limites de API de terceiros**, **memória** e **CPU**. Para **CPU**: **mais processos**/**sandboxed processors** (processadores em processos filhos/threads), **não** mais concorrência. **Escale** com **mais workers** (processos/instâncias) — o Redis **distribui** os jobs.

### Prioridade, atraso e agendadores
- **Prioridade** (§priority§: **menor número = mais urgente**). Medido: jobs adicionados na ordem baixa(10), normal-a, alta(1), normal-b, media(5) executaram: **normal-a → normal-b → alta → media → baixa**. **Atenção**: **jobs sem prioridade foram antes de todos os priorizados** (no BullMQ, a prioridade 0/padrão é a mais alta); se quiser ordenar **todos**, atribua prioridade **a todos**. Prioridades custam um pouco mais de processamento no Redis (**use poucos níveis**).
- **Atraso** (§delay: 500§): o job só fica disponível depois. Medido: o job imediato rodou aos **26 ms** e o de **500 ms** aos **573 ms** (a precisão depende do polling do worker e da carga).
- **Agendador** (§upsertJobScheduler§, que **substitui as antigas "repeatable jobs"**): cron ou §every§. Medido: um agendador **a cada 200 ms** por ~**1,1 s** gerou **6 execuções**. Use **ids estáveis** (§'a-cada-200ms'§) para **não duplicar** agendamentos a cada deploy (o *upsert* é idempotente) e lembre que **vários workers** **não** executam o mesmo tique duas vezes (um job por ocorrência).
- **LIFO**, **jobs pai-filho/fluxos** (§FlowProducer§): dependências entre jobs (**não executados** aqui).

### Limite de taxa
§limiter: { max: 5, duration: 1000 }§ no **worker** limita **quantos jobs por janela** (útil para **APIs externas com cota**). Medido: **15 jobs** com limite de **5 por segundo** levaram **2.042 ms** (≈ 3 janelas), enquanto sem limite seriam centenas de ms. O limite é **global** à fila (entre todos os workers), não por processo. Para limitar **por chave** (por cliente) há **grupos** (versão Pro, **não executada**) ou controle manual.

### Retenção e memória
Por padrão, **jobs concluídos e falhos ficam no Redis** (úteis para inspeção, mas **crescem sem limite**). Medido (2.000 jobs com ~200 bytes de dados):
| Opção | Chaves no Redis | Concluídos guardados | used_memory |
|---|---|---|---|
| guardar todos (padrão) | **2.005** | 2.000 | **5,1 MiB** |
| §removeOnComplete: true§ | **4** | 0 | **3,3 MiB** |
| §removeOnComplete: { count: 10 }§ | **15** | 10 | **3,5 MiB** |
Em produção, **sempre limite** (§removeOnComplete: { age: 3600, count: 1000 }§) e **guarde as falhas** por mais tempo (§removeOnFail: { age: 7 * 24 * 3600 }§) para depuração/DLQ. Sem isso, o Redis **enche** (e com §noeviction§ as **escritas passam a falhar**: aula nsq-07).

### Encerramento ordenado
No **SIGTERM**: §await worker.close()§ **espera os jobs ativos terminarem** (e **para de pegar novos**); depois feche a conexão. Defina **prazo** e, se estourar, deixe a **detecção de travados** devolver os jobs. Combine com o desligamento ordenado do servidor HTTP (aula nex-07) e com §enableShutdownHooks()§ do Nest (aula nst-02).

### Boas práticas
1. **Um worker por tipo de trabalho** (ou fila por prioridade/SLA) para **isolar** cargas;
2. **Concorrência** ajustada ao gargalo; **conexões separadas** do Redis para produtores e workers (o BullMQ cuida; **não** compartilhe a conexão do cache);
3. **Idempotência** nos processadores (aula fil-03);
4. **Timeouts** nas chamadas dentro do job (nada de job que **trava para sempre**);
5. **Retenção** limitada e **métricas** (§getJobCounts§: waiting, active, delayed, failed);
6. **Separar o Redis das filas** do Redis de **cache** (políticas de memória **opostas**: aula nsq-07).`,
  concepts: [
    { term: 'Queue (BullMQ)', def: 'Objeto produtor que adiciona jobs a uma fila armazenada no Redis.' },
    { term: 'Worker (BullMQ)', def: 'Objeto consumidor que processa os jobs com uma função e uma concorrência.' },
    { term: 'concurrency', def: 'Número de jobs que um worker processa ao mesmo tempo no mesmo processo.' },
    { term: 'priority', def: 'Ordem de atendimento dos jobs; números menores são mais urgentes.' },
    { term: 'delay', def: 'Tempo de espera antes de o job ficar disponível.' },
    { term: 'Job scheduler', def: 'Agendamento recorrente (every ou cron) de jobs, criado de forma idempotente por upsert.' },
    { term: 'limiter', def: 'Opção do worker que limita o número de jobs processados por janela de tempo.' },
    { term: 'removeOnComplete', def: 'Opção que remove ou limita os jobs concluídos guardados no Redis.' },
    { term: 'QueueEvents', def: 'Canal de eventos de uma fila, ouvido por qualquer processo.' },
    { term: 'worker.close()', def: 'Encerra o worker aguardando os jobs ativos e sem pegar novos.' }
  ],
  examples: R`**Analogia:** a **concorrência** é o **número de bocas do fogão** que o cozinheiro usa ao mesmo tempo: enquanto uma panela cozinha (espera de E/S) ele cuida das outras — **mas se o trabalho é cortar legumes (CPU), mais bocas não ajudam**, é preciso **mais cozinheiros**. A **prioridade** é a **fita vermelha** no pedido (e os pedidos **sem fita passaram na frente** dos com fita no teste); o **atraso** é "**só comece às 20h**"; o **limitador** é "**no máximo 5 pratos por minuto para o delivery**"; a **retenção** é "**guarde só as últimas 10 comandas**, não o arquivo morto de todas".

**Exemplo 1: vazão.** 18, 89 e 273 jobs/s com concorrência 1, 5 e 20.

**Exemplo 2: retenção.** 2.005 chaves (padrão) contra 4 (removeOnComplete) e 15 (últimos 10).

**Exemplo 3: limitador.** 15 jobs a 5/s levaram ~2 s.`,
  code: [
    { title: 'Concorrência, prioridade e agendador (JavaScript, BullMQ 6.7.10; resultados medidos)', lang: 'js', code: R`import { Queue, Worker } from 'bullmq';
const conn = { host: '127.0.0.1', port: 57379 };
const q = new Queue('conc', { connection: conn });
const w = new Worker('conc', async () => { await sleep(50); }, { connection: conn, concurrency: 20 });   // 100 jobs: 366 ms (273 jobs/s)
await q.addBulk(Array.from({ length: 100 }, (_, i) => ({ name: 'j', data: { i } })));

// prioridade: menor número = mais urgente; jobs SEM prioridade vão antes dos priorizados
await q.add('baixa', {}, { priority: 10 }); await q.add('alta', {}, { priority: 1 });

// atraso e agendador idempotente
await q.add('em-500ms', {}, { delay: 500 });
await q.upsertJobScheduler('a-cada-200ms', { every: 200 }, { name: 'tique', data: {} });`, notes: [{ l: '4', t: 'Mais concorrência ajuda quando o gargalo é esperar.' }, { l: '10', t: 'upsertJobScheduler com id estável não duplica agendamentos.' }] },
    { title: 'Retenção, limitador e encerramento (JavaScript)', lang: 'js', code: R`const opts = { removeOnComplete: { age: 3600, count: 1000 }, removeOnFail: { age: 7 * 24 * 3600 } };   // não deixe o Redis crescer sem limite
await q.add('gerar', { id: 42 }, { ...opts, attempts: 3, backoff: { type: 'exponential', delay: 1000 } });

const w = new Worker('api-externa', processa, { connection: conn, concurrency: 10, limiter: { max: 5, duration: 1000 } });   // respeita a cota da API de terceiros

process.on('SIGTERM', async () => { await w.close(); await q.close(); process.exit(0); });   // espera os jobs ativos terminarem`, notes: [{ l: '4', t: 'O limitador é global à fila.' }, { l: '6', t: 'close() para de pegar jobs e aguarda os ativos.' }] }
  ],
  bestPractices: ['Ajuste a concorrência ao gargalo (E/S x CPU) e escale com mais workers.', 'Limite a retenção de jobs concluídos e guarde as falhas por mais tempo.', 'Use ids estáveis em agendadores para não duplicá-los.', 'Atribua prioridade a todos os jobs se quiser uma ordem total.', 'Use limitador de taxa para respeitar cotas de APIs externas.', 'Separe o Redis das filas do Redis de cache e use noeviction.'],
  mistakes: ['Aumentar a concorrência para tarefas de CPU.', 'Deixar jobs concluídos acumularem no Redis.', 'Esperar que jobs sem prioridade fiquem atrás dos priorizados.', 'Criar um agendador novo a cada deploy.', 'Encerrar o processo sem worker.close().', 'Usar o mesmo Redis (e a mesma política de memória) para cache e filas.'],
  market: R`BullMQ é a escolha padrão de filas em Node; conhecer concorrência, retenção, agendadores e limites evita incidentes de memória e de sobrecarga de dependências.`,
  summary: R`O BullMQ guarda jobs no Redis e processa com workers. Medido (BullMQ 6.7.10, Redis 8.12.0): 100 jobs de 50 ms levaram 5.420, 1.125 e 366 ms com concorrência 1, 5 e 20 (18, 89 e 273 jobs/s); jobs sem prioridade passaram antes dos priorizados; o atraso de 500 ms executou aos 573 ms; um agendador de 200 ms deu 6 execuções em ~1,1 s; o limitador de 5/s fez 15 jobs levarem ~2 s; guardar todos os 2.000 concluídos usou 2.005 chaves e 5,1 MiB contra 4 chaves e 3,3 MiB com removeOnComplete. Limite a retenção e encerre com worker.close().`,
  refs: [REF.bullmq, REF.bullmqQueues, REF.bullmqConcurrency, REF.bullmqRate, REF.redisPersistence],
  cards: [
    { q: 'Quando a concorrência do worker ajuda?', a: 'Em tarefas de E/S; para CPU use mais processos (medido: 18 → 273 jobs/s com sleep).' },
    { q: 'Qual a ordem de prioridade no BullMQ?', a: 'Menor número é mais urgente e jobs sem prioridade vão antes de todos os priorizados.' },
    { q: 'Como criar agendamentos sem duplicá-los?', a: 'Com upsertJobScheduler e um id estável.' },
    { q: 'Por que limitar removeOnComplete?', a: 'Para o Redis não crescer sem limite (medido: 2.005 chaves contra 4).' },
    { q: 'O que faz worker.close()?', a: 'Para de pegar jobs e aguarda os ativos terminarem.' }
  ]
}
];
