// C4.2 — NestJS. Aulas 7 a 9 (testes; microsserviços e filas; arquitetura modular, configuração e projeto).
import { REF } from './c42-a.mjs';
const R = String.raw;

export const REF3 = {
  nestTesting: { title: 'NestJS — Testing', url: 'https://docs.nestjs.com/fundamentals/testing', kind: 'doc' },
  nodeTest: { title: 'Node.js — Test runner', url: 'https://nodejs.org/api/test.html', kind: 'doc' },
  supertest: { title: 'SuperTest', url: 'https://github.com/forwardemail/supertest', kind: 'doc' },
  nestMicroBasics: { title: 'NestJS — Microservices: overview', url: 'https://docs.nestjs.com/microservices/basics', kind: 'doc' },
  nestQueues: { title: 'NestJS — Queues', url: 'https://docs.nestjs.com/techniques/queues', kind: 'doc' },
  bullmq: { title: 'BullMQ — Documentation', url: 'https://docs.bullmq.io/', kind: 'doc' },
  bullmqRetry: { title: 'BullMQ — Retrying failing jobs', url: 'https://docs.bullmq.io/guide/retrying-failing-jobs', kind: 'doc' },
  nestDynamic: { title: 'NestJS — Dynamic modules', url: 'https://docs.nestjs.com/fundamentals/dynamic-modules', kind: 'doc' },
  nestConfig: { title: 'NestJS — Configuration', url: 'https://docs.nestjs.com/techniques/configuration', kind: 'doc' },
  nestOpenapi: { title: 'NestJS — OpenAPI (Swagger)', url: 'https://docs.nestjs.com/openapi/introduction', kind: 'doc' },
  nestCqrs: { title: 'NestJS — CQRS', url: 'https://docs.nestjs.com/recipes/cqrs', kind: 'doc' },
  fowlerMicro: { title: 'Martin Fowler — Microservices', url: 'https://martinfowler.com/articles/microservices.html', kind: 'artigo' },
  fowlerMonolithFirst: { title: 'Martin Fowler — MonolithFirst', url: 'https://martinfowler.com/bliki/MonolithFirst.html', kind: 'artigo' }
};

export const lessonsC = [
{
  id: 'nst-07', moduleId: 'm3', order: 7, minutes: 80, tags: ['testes', 'Test.createTestingModule', 'overrideProvider', 'supertest', 'node:test', 'mocks'],
  title: 'Testes no Nest: unitários com módulo de teste, e2e com Supertest e substituição de providers',
  objectives: ['Montar um módulo de teste com Test.createTestingModule e providers falsos', 'Escrever testes e2e de rotas com Supertest, cobrindo sucesso e erro', 'Usar overrideProvider para trocar dependências em testes', 'Executar os testes com o runner nativo do Node (node:test) em um projeto ESM', 'Distinguir testes unitários, de integração e e2e e escolher o equilíbrio'],
  intro: R`A injeção de dependências existe, em boa parte, **para tornar o código testável**. O pacote §@nestjs/testing§ monta um **módulo de teste** em que você **troca** o repositório real por um **falso**, e o **Supertest** chama as rotas **sem abrir porta**. Aqui os três testes do laboratório rodam com o **runner nativo do Node**: unitário, e2e com override e a prova de que, **sem** o override, o repositório real é chamado (e a rota devolve **500**).`,
  theory: R`### Pirâmide de testes
- **Unitários**: uma classe (um serviço) com **dependências falsas**: **rápidos** e numerosos;
- **Integração**: vários componentes reais juntos (serviço + repositório + banco de teste);
- **e2e (ponta a ponta)**: o app inteiro por HTTP (módulos, pipes, guards, filtros) com dependências **externas** substituídas ou **reais em contêineres**: poucos e valiosos.
No Nest os três usam o mesmo mecanismo: §Test.createTestingModule§.

### Teste unitário com módulo de teste
§§§
const mod = await Test.createTestingModule({
  providers: [UsuariosService, { provide: UsuariosRepo, useValue: { buscar: async (id) => (id === 1 ? { id, nome: 'ana' } : undefined) } }]
}).compile();
const s = mod.get(UsuariosService);
assert.deepEqual(await s.obter(1), { id: 1, nome: 'ANA' });
await assert.rejects(() => s.obter(2), { message: 'usuário não existe' });
§§§
O serviço real recebe o **repositório falso** pela DI: **sem banco**, **sem HTTP**. (Medido: o teste passou em ~350 ms, incluindo a inicialização.)
**Falsos**: **stub** (devolve valores fixos), **mock** (verifica chamadas), **fake** (implementação simples, como um repositório em memória). Prefira **fakes** e **stubs** simples; mocks de **interações** acoplam o teste à implementação.

### Teste e2e com override
§§§
const mod = await Test.createTestingModule({ imports: [UsuariosModule] })
  .overrideProvider(UsuariosRepo).useValue({ buscar: async (id) => (id === 1 ? { id, nome: 'ana' } : undefined) })
  .compile();
const app = mod.createNestApplication(); await app.init();
await request(app.getHttpServer()).get('/usuarios/1').expect(200).expect({ id: 1, nome: 'ANA' });
await request(app.getHttpServer()).get('/usuarios/2').expect(404);
await request(app.getHttpServer()).get('/usuarios/abc').expect(400);   // ParseIntPipe
await app.close();
§§§
Medido: **200**, **404** e **400** como esperado, em ~140 ms. Atenção: o app de teste **não** herda configurações do §main.ts§ (pipes/filtros **globais** registrados com §app.useGlobalPipes§): **repita-os** no teste (ou registre-os via §APP_PIPE§/§APP_FILTER§ **dentro de um módulo**, que valem para o teste também).
**Prova de necessidade do override**: sem o §overrideProvider§, a rota chamou o repositório real (que lança) e respondeu **500**; o Nest registrou o erro no log (§[ExceptionsHandler] Error: banco real não deve ser chamado nos testes§). Um teste e2e que **acidentalmente** acessa o banco real é um perigo: **falhe alto**, como o repositório do exemplo.

### Supertest e o runner do Node
- **Supertest** (§request(app.getHttpServer())§) chama o servidor **sem porta fixa**; encadeia §.expect(status)§ e §.expect(corpo)§.
- **§node:test§** + §node:assert§: runner **nativo** (sem Jest/Vitest): §node --test dist/arquivo.test.js§ (saída medida: **3 testes, 3 passaram**, 0 falhas, ~1,7 s). Num projeto TypeScript, **compile antes** (§tsc§) ou use um runner que aceite decoradores e metadados (Jest com §ts-jest§/SWC, Vitest com plugin SWC): o curso de **ferramentas JS de testes (C5)** compara. Os **metadados de DI** exigem que o transpilador emita §design:paramtypes§.

### O que testar
- **Serviços**: regras de negócio, **casos de borda** e erros de domínio (unitário);
- **Controllers + pipes + guards + filtros**: contrato HTTP (e2e): **status**, **corpo**, **cabeçalhos**, **validação**, **autorização**, **formato de erro** (inclusive o **500 sem vazamento**);
- **Repositórios**: contra um **banco real em contêiner** (integração): consultas, constraints e transações (curso C3, **não executado** aqui);
- **Contratos** com outros serviços: testes de **contrato** (Pact, **não executado**).
- **Não** teste o framework (que o §@Get§ funciona), teste **seu** comportamento.

### Boas práticas
1. **Arrange-Act-Assert**; **um comportamento por teste**; nomes descritivos.
2. **Independência**: cada teste monta o seu módulo (**sem estado compartilhado**); feche o app (§app.close()§).
3. **Determinismo**: controle **relógio**, **ids** e **aleatoriedade** (injete-os como providers).
4. **Dados de teste** construídos por **fábricas** pequenas.
5. **Cobertura** como **indicador**, não meta cega; foque em **risco**.
6. **Rápido**: unitários em milissegundos; e2e em dezenas a centenas de ms por teste; suíte completa em segundos a poucos minutos.
7. **CI**: rode tudo a cada alteração; **falhas** bloqueiam o merge.

### Testando guards, pipes e filtros isoladamente
Instancie o componente com dependências falsas e passe um **ExecutionContext falso** (ou use o e2e). Para **guards**, a matriz **papel × rota × resultado** é um excelente teste de tabela.

### Armadilhas
- **Mocks demais** (o teste passa e a produção quebra);
- **Testes dependentes da ordem** ou de dados compartilhados;
- **Esquecer** de reproduzir a configuração global do app;
- **Portas fixas** (use §listen(0)§/Supertest);
- **Logs ruidosos**: §Test.createTestingModule(...).setLogger(...)§ ou §logger: false§ (nós mostramos o log do erro 500 de propósito).`,
  concepts: [
    { term: 'Test.createTestingModule', def: 'Cria um módulo de teste do Nest, onde providers podem ser substituídos.' },
    { term: 'overrideProvider', def: 'Substitui um provider por um valor, classe ou fábrica nos testes.' },
    { term: 'Supertest', def: 'Biblioteca que faz requisições HTTP a um servidor Node sem abrir porta fixa.' },
    { term: 'Stub', def: 'Dublê que devolve respostas fixas.' },
    { term: 'Mock', def: 'Dublê que também verifica como foi chamado.' },
    { term: 'Fake', def: 'Implementação simplificada usável em testes, como um repositório em memória.' },
    { term: 'Teste e2e', def: 'Teste que exercita a aplicação por suas interfaces externas, como HTTP.' },
    { term: 'node:test', def: 'Runner de testes nativo do Node.js.' },
    { term: 'Arrange-Act-Assert', def: 'Estrutura de teste: preparar, executar e verificar.' },
    { term: 'Teste de contrato', def: 'Teste que verifica o acordo de comunicação entre consumidor e provedor.' }
  ],
  examples: R`**Analogia:** o módulo de teste é o **ensaio geral da peça** com **atores substitutos**: o palco, as falas e as luzes (módulo, pipes, guards) são os reais, mas o **ator que beberia veneno de verdade** (o banco) é trocado por um **boneco**. O **teste sem override** é **ensaiar com o veneno de verdade** — e por isso o boneco deve **explodir** se alguém tentar a bebida real.

**Exemplo 1: unitário.** Serviço real e repositório falso: passou (~350 ms).

**Exemplo 2: e2e.** 200, 404 e 400 pelas rotas reais com override.

**Exemplo 3: sem override.** O repositório real foi chamado: 500.`,
  code: [
    { title: 'Testes unitário e e2e com node:test e Supertest (TypeScript, 3 testes passaram)', lang: 'ts', code: R`import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import request from 'supertest';

test('unitário: o serviço com repositório falso', async () => {
  const mod = await Test.createTestingModule({ providers: [UsuariosService, { provide: UsuariosRepo, useValue: { buscar: async (id: number) => (id === 1 ? { id, nome: 'ana' } : undefined) } }] }).compile();
  const s = mod.get(UsuariosService);
  assert.deepEqual(await s.obter(1), { id: 1, nome: 'ANA' });
  await assert.rejects(() => s.obter(2), { message: 'usuário não existe' });
});

test('e2e: rotas HTTP com o módulo real e o repositório substituído', async () => {
  const mod = await Test.createTestingModule({ imports: [UsuariosModule] }).overrideProvider(UsuariosRepo).useValue({ buscar: async (id: number) => (id === 1 ? { id, nome: 'ana' } : undefined) }).compile();
  const app = mod.createNestApplication(); await app.init();
  const http = app.getHttpServer();
  await request(http).get('/usuarios/1').expect(200).expect({ id: 1, nome: 'ANA' });
  await request(http).get('/usuarios/2').expect(404);
  await request(http).get('/usuarios/abc').expect(400);
  await app.close();
});`, notes: [{ l: '7', t: 'O serviço real recebe o repositório falso pela DI.' }, { l: '16', t: 'Supertest chama o servidor sem porta fixa.' }] },
    { title: 'Comando e resultado (bash, saída medida)', lang: 'bash', code: R`npx tsc -p .
node --test dist/e3-testes.test.js
# ✔ unitário: o serviço com repositório falso
# ✔ e2e: rotas HTTP com o módulo real e o repositório substituído
# ✔ sem a substituição, o repositório real lança (500)
# ℹ tests 3 | pass 3 | fail 0`, notes: [{ l: '1', t: 'Compila antes, pois o runner nativo não lê decoradores em TypeScript.' }] }
  ],
  bestPractices: ['Teste serviços com dependências falsas e a API por e2e com Supertest.', 'Substitua dependências externas com overrideProvider e falhe alto se o real for chamado.', 'Registre configurações globais em módulos (APP_PIPE, APP_FILTER) para valerem nos testes.', 'Mantenha testes independentes, determinísticos e rápidos.', 'Prefira fakes e stubs simples a mocks de interação.', 'Teste os caminhos de erro e o vazamento de informações.'],
  mistakes: ['Testar com o banco real sem querer.', 'Esquecer a configuração global do main.ts nos testes e2e.', 'Mocks demais e testes acoplados à implementação.', 'Compartilhar estado entre testes.', 'Não fechar o app e deixar o runner pendurado.', 'Usar um transpilador que não emite metadados de DI.'],
  market: R`Testabilidade é um dos grandes argumentos do Nest. Em entrevistas e revisões, saber montar um módulo de teste, substituir providers e escrever e2e confiáveis é cobrado em vagas sênior.`,
  summary: R`O módulo de teste do Nest troca providers por falsos. Medido com o runner nativo do Node: 3 testes passaram (unitário em ~350 ms; e2e com 200, 404 e 400 em ~140 ms; e a rota sem o override chamou o repositório real e devolveu 500). Reproduza a configuração global nos testes, mantenha-os independentes e rápidos e teste também os caminhos de erro. Banco real e testes de contrato não foram executados.`,
  refs: [REF3.nestTesting, REF3.nodeTest, REF3.supertest],
  cards: [
    { q: 'Como substituir uma dependência em um teste e2e?', a: 'Com overrideProvider(Token).useValue(falso) antes de compile().' },
    { q: 'Por que o app de teste pode se comportar diferente do real?', a: 'Porque não herda o main.ts: pipes e filtros globais precisam ser repetidos ou registrados em módulos.' },
    { q: 'Para que serve o Supertest?', a: 'Para chamar as rotas do servidor sem abrir uma porta fixa.' },
    { q: 'Stub, mock e fake?', a: 'Stub devolve respostas fixas; mock verifica chamadas; fake é uma implementação simples.' },
    { q: 'Por que compilar antes de rodar node --test?', a: 'O runner não lê decoradores em TypeScript nem emite metadados de DI.' }
  ]
},
{
  id: 'nst-08', moduleId: 'm3', order: 8, minutes: 85, tags: ['microsserviços', 'TCP', 'MessagePattern', 'EventPattern', 'BullMQ', 'filas', 'retry'],
  title: 'Microsserviços e filas com Nest: transporte TCP, eventos e jobs com BullMQ',
  objectives: ['Criar um microsserviço Nest com transporte TCP e um cliente com request-response e eventos', 'Distinguir @MessagePattern (resposta) de @EventPattern (sem resposta)', 'Usar @nestjs/bullmq com Redis, com retries e backoff, e interpretar os estados dos jobs', 'Medir latência e comportamento diante de um servidor indisponível', 'Decidir quando usar chamadas diretas, eventos ou filas'],
  intro: R`O Nest oferece uma camada de **microsserviços** (transportes TCP, Redis, NATS, Kafka, gRPC...) e integração com **filas** (BullMQ). Aqui você **executa** um microsserviço **TCP** (500 chamadas em **292 ms**, **0,58 ms** cada; falha limpa com **ECONNREFUSED** quando o servidor está parado) e uma **fila BullMQ em Redis** com **retry e backoff** (um job instável que **falha duas vezes e conclui na terceira**; um quebrado que **falha de vez**).`,
  theory: R`### Dois estilos de comunicação
- **Request-response**: o cliente **envia** e **espera a resposta** (§@MessagePattern§). Simples, mas **acopla no tempo**: se o servidor cair, o cliente falha.
- **Eventos** (*fire and forget*): o cliente **notifica** (§@EventPattern§) e **não espera**; vários consumidores podem reagir. **Desacopla no tempo**, mas exige **tratar consistência** (curso C4.7).

### Microsserviço TCP (medido)
§§§
@Controller() class MatematicaCtrl {
  @MessagePattern({ cmd: 'soma' }) soma(@Payload() d: { a: number; b: number }) { return d.a + d.b; }
  @EventPattern('usuario.criado') criado(@Payload() d: any) { eventos.push(d); }
}
const micro = await NestFactory.createMicroservice(MicroModule, { transport: Transport.TCP, options: { host: '127.0.0.1', port: 41234 } });
await micro.listen();
const client = ClientProxyFactory.create({ transport: Transport.TCP, options: { host: '127.0.0.1', port: 41234 } });
await firstValueFrom(client.send({ cmd: 'soma' }, { a: 2, b: 3 }));   // 5
client.emit('usuario.criado', { id: 1 });                              // sem resposta
§§§
Medido:
- §soma(2, 3)§ por TCP = **5**;
- **500 chamadas sequenciais** request-response: **292 ms** no total (**~0,58 ms por chamada**, em **localhost**: em rede real some a latência de rede);
- **2 eventos** emitidos foram recebidos;
- Com o servidor **parado**, o cliente falhou com **ECONNREFUSED** (e, sem tratamento, uma requisição HTTP que dependesse dele ficaria **sem resposta** ou com **erro 500**): use **timeout** (§timeout(1500)§ do RxJS), **retry** com limite e **disjuntor** (curso C4.7).
Outros transportes: **Redis** (pub/sub), **NATS**, **MQTT**, **RabbitMQ**, **Kafka**, **gRPC** (contratos Protobuf): escolha por **garantias** (entrega, ordem, persistência) e **operação** (**não executados** aqui, exceto TCP). O **TCP** do Nest é simples e **sem garantias de entrega/persistência**: serve a **aprendizado** e a comunicação **interna simples**.
Uma aplicação pode ser **híbrida** (§app.connectMicroservice()§): HTTP + microsserviço no mesmo processo.

### Filas com BullMQ
**BullMQ** mantém **jobs** em **Redis**: um **produtor** adiciona, um **worker** processa, com **persistência**, **retries**, **backoff**, **prioridade**, **atraso**, **repetição** e **concorrência**. No Nest: §@nestjs/bullmq§.
§§§
@Processor('trabalhos') class TrabalhoProc extends WorkerHost {
  async process(job: Job) { ... }                     // lança erro => nova tentativa
}
BullModule.forRoot({ connection: { host: '127.0.0.1', port: 57379 } }), BullModule.registerQueue({ name: 'trabalhos' })
await fila.add('instavel', { x: 2 }, { attempts: 3, backoff: { type: 'fixed', delay: 100 }, removeOnComplete: false, removeOnFail: false });
§§§
Resultado medido (Redis 8; BullMQ 6.7.10; **§attempts: 3§**, backoff fixo de 100 ms):
| Job | Estado final | Tentativas | Execuções do processador | Motivo da falha |
|---|---|---|---|---|
| simples | **completed** | 1 | 1 | — |
| instável (falha nas 2 primeiras) | **completed** | **3** | 3 | falha transitória 2 (a última que ocorreu) |
| quebrado (sempre falha) | **failed** | **3** | 3 | falha permanente |
Contagens finais: **2 completed, 1 failed**, 0 waiting, 0 delayed.
**Requisito encontrado**: o BullMQ 6 exige instalar o pacote §ioredis§ (ou passar um cliente já construído; erro: "BullMQ could not load the optional 'ioredis' package").

### Fila ou chamada direta?
| Use | Quando |
|---|---|
| **Chamada direta (HTTP/TCP/gRPC)** | precisa da **resposta agora**; operação **curta** e **idempotente**; poucos consumidores |
| **Evento (pub/sub, broker)** | **notificar** vários interessados; **desacoplar** produtores de consumidores |
| **Fila de jobs** | trabalho **longo**, **retentável**, com **picos** (e-mail, relatórios, vídeo), **limitar concorrência** |
**Cuidados com filas**:
- **At-least-once**: um job pode executar **mais de uma vez** (retry, falha após efeito colateral) → **processadores idempotentes** (chave de idempotência, §upsert§);
- **Poison messages**: jobs que **sempre** falham devem ir para uma **dead letter queue** após as tentativas (curso de filas, C4.5); aqui o job §failed§ ficou **guardado** (§removeOnFail: false§) para inspeção;
- **Backoff exponencial com jitter** para não sobrecarregar a dependência que falhou;
- **Redis** como fila exige **persistência** (AOF) e **monitoramento** (aulas nsq-07 e nsq-09);
- **Observabilidade**: tamanho da fila, idade do job mais antigo, taxa de falhas, tempo de processamento (curso C4.6);
- **Graceful shutdown**: o worker deve **terminar o job atual** (§worker.close()§; no Nest, o ciclo de vida da aula nst-02).

### Quando microsserviços?
Eles resolvem **escala organizacional** e **isolamento de falhas**, e **custam** rede, consistência distribuída, observabilidade e operação. **Comece por um monólito modular** (aula nst-09) e **extraia serviços** quando houver razão (curso C4.7). Martin Fowler: **MonolithFirst**.`,
  concepts: [
    { term: 'MessagePattern', def: 'Decorador de um handler de microsserviço que responde a requisições do tipo request-response.' },
    { term: 'EventPattern', def: 'Decorador de um handler que consome eventos sem devolver resposta.' },
    { term: 'ClientProxy', def: 'Cliente do Nest que envia mensagens e eventos a um microsserviço.' },
    { term: 'Transporte', def: 'Mecanismo de comunicação usado entre serviços, como TCP, Redis, NATS ou Kafka.' },
    { term: 'Job', def: 'Unidade de trabalho colocada em uma fila para processamento posterior.' },
    { term: 'Worker', def: 'Processo ou classe que consome jobs de uma fila.' },
    { term: 'Backoff', def: 'Espera crescente ou fixa entre tentativas após uma falha.' },
    { term: 'At-least-once', def: 'Garantia de entrega que pode repetir mensagens, exigindo idempotência.' },
    { term: 'Dead letter queue', def: 'Fila que guarda os jobs que esgotaram as tentativas.' },
    { term: 'Aplicação híbrida', def: 'Aplicação Nest que serve HTTP e também atua como microsserviço.' }
  ],
  examples: R`**Analogia:** a chamada **request-response** é **ligar para o fornecedor e esperar na linha**: se ele não atender, você fica sem resposta. O **evento** é **deixar um recado no quadro** que vários setores leem quando puderem. A **fila de jobs** é **a bandeja de pedidos da cozinha**: se um prato dá errado, o cozinheiro **tenta de novo** (retry) com uma pausa (backoff); depois de três tentativas, o prato vai para uma **bandeja de pratos com problema** (failed/DLQ) para o chef examinar — o pedido **não some**.

**Exemplo 1: TCP.** 500 chamadas em 292 ms; servidor parado → ECONNREFUSED.

**Exemplo 2: retry.** O job instável concluiu na 3ª tentativa.

**Exemplo 3: falha definitiva.** O job quebrado ficou failed após 3 tentativas.`,
  code: [
    { title: 'Microsserviço TCP e cliente (TypeScript, medidas reais)', lang: 'ts', code: R`@Controller() class MatematicaCtrl {
  @MessagePattern({ cmd: 'soma' }) soma(@Payload() d: { a: number; b: number }) { return d.a + d.b; }
  @EventPattern('usuario.criado') criado(@Payload() d: any) { eventos.push(d); }
}
@Module({ controllers: [MatematicaCtrl] }) class MicroModule {}

const micro = await NestFactory.createMicroservice(MicroModule, { transport: Transport.TCP, options: { host: '127.0.0.1', port: 41234 } });
await micro.listen();
const client: ClientProxy = ClientProxyFactory.create({ transport: Transport.TCP, options: { host: '127.0.0.1', port: 41234 } });
await client.connect();
await firstValueFrom(client.send({ cmd: 'soma' }, { a: 2, b: 3 }));        // 5
client.emit('usuario.criado', { id: 1 });                                   // evento: sem resposta
// servidor parado => ECONNREFUSED; proteja com timeout:
await firstValueFrom(client.send({ cmd: 'soma' }, { a: 1, b: 1 }).pipe(timeout(1500)));`, notes: [{ l: '2', t: 'Request-response: o cliente espera o retorno.' }, { l: '12', t: 'Evento: não espera resposta.' }, { l: '14', t: 'Sempre defina um timeout nas chamadas entre serviços.' }] },
    { title: 'Fila BullMQ com retry e backoff (TypeScript, estados medidos)', lang: 'ts', code: R`@Processor('trabalhos') class TrabalhoProc extends WorkerHost {
  async process(job: Job): Promise<any> {
    tentativas[job.name] = (tentativas[job.name] ?? 0) + 1;
    if (job.name === 'instavel' && tentativas[job.name] < 3) throw new Error('falha transitória ' + tentativas[job.name]);
    if (job.name === 'quebrado') throw new Error('falha permanente');
    return { ok: true, tentativa: tentativas[job.name] };
  }
}
@Module({ imports: [BullModule.forRoot({ connection: { host: '127.0.0.1', port: 57379 } }), BullModule.registerQueue({ name: 'trabalhos' })], providers: [TrabalhoProc, Produtor] }) class FilaModule {}

const opts = { attempts: 3, backoff: { type: 'fixed' as const, delay: 100 }, removeOnComplete: false, removeOnFail: false };
await fila.add('simples', { x: 1 }, opts);     // completed, 1 tentativa
await fila.add('instavel', { x: 2 }, opts);    // completed, 3 tentativas
await fila.add('quebrado', { x: 3 }, opts);    // failed, 3 tentativas
// contagens: 2 completed, 1 failed`, notes: [{ l: '4', t: 'Lançar o erro dispara uma nova tentativa.' }, { l: '12', t: 'Com attempts 3, o instável conclui na terceira.' }] }
  ],
  bestPractices: ['Use timeouts, retries limitados e disjuntores nas chamadas entre serviços.', 'Prefira eventos para notificar e filas para trabalho longo e retentável.', 'Torne os processadores idempotentes.', 'Configure backoff com jitter e guarde os jobs que falham de vez.', 'Monitore o tamanho e a idade da fila.', 'Comece por um monólito modular e extraia serviços com razão clara.'],
  mistakes: ['Chamar outro serviço sem timeout.', 'Assumir que um job executa exatamente uma vez.', 'Retries ilimitados sem backoff.', 'Usar o TCP do Nest em produção esperando garantias de entrega.', 'Esquecer a persistência do Redis usado como fila.', 'Dividir em microsserviços cedo demais.'],
  market: R`Mensageria e filas são parte de quase toda arquitetura de backend moderna; saber diferenciar request-response, eventos e jobs, e tratar retries e idempotência, aparece em entrevistas de sistemas.`,
  summary: R`O Nest oferece microsserviços (aqui, TCP: 500 chamadas request-response em 292 ms, 2 eventos entregues, ECONNREFUSED com o servidor parado) e filas com @nestjs/bullmq (Redis 8, BullMQ 6.7.10, attempts 3 e backoff de 100 ms: o job instável concluiu na 3ª tentativa, o quebrado ficou failed após 3; 2 completed e 1 failed). Use timeouts, idempotência e backoff, monitore a fila e comece por um monólito modular.`,
  refs: [REF3.nestMicroBasics, REF3.nestQueues, REF3.bullmq, REF3.bullmqRetry, REF3.fowlerMonolithFirst],
  cards: [
    { q: 'MessagePattern ou EventPattern?', a: 'MessagePattern responde a requisições (request-response); EventPattern consome eventos sem resposta.' },
    { q: 'O que aconteceu com o job instável?', a: 'Falhou duas vezes e concluiu na terceira tentativa (attempts 3).' },
    { q: 'Por que processadores de fila devem ser idempotentes?', a: 'Porque a entrega é pelo menos uma vez e um job pode executar mais de uma vez.' },
    { q: 'O que fazer com jobs que sempre falham?', a: 'Guardá-los em uma dead letter queue ou como failed para inspeção, após as tentativas.' },
    { q: 'O que o BullMQ 6 exige instalar à parte?', a: 'O pacote ioredis (ou um cliente já construído).' }
  ]
},
{
  id: 'nst-09', moduleId: 'm3', order: 9, minutes: 90, tags: ['arquitetura modular', 'módulos dinâmicos', 'configuração', 'monólito modular', 'estrutura de pastas', 'projeto'],
  title: 'Arquitetura modular com Nest: módulos dinâmicos, configuração validada, monólito modular e o projeto',
  objectives: ['Criar módulos dinâmicos (forRoot) e módulos globais com configuração', 'Validar a configuração na partida com @nestjs/config', 'Organizar um monólito modular com fronteiras claras entre módulos', 'Medir o custo de partida em função do número de módulos', 'Planejar o projeto integrador "API Nest modular"'],
  intro: R`À medida que o sistema cresce, a pergunta deixa de ser "como escrever um controller" e passa a ser "**como organizar dezenas de módulos** sem virar uma **bola de lama**". O Nest oferece **módulos dinâmicos** (configuráveis), **configuração validada** e a base para um **monólito modular**. Aqui você mede a **configuração que falha na partida**, um módulo **dinâmico e global**, e o **tempo de partida** com **1, 50 e 200 módulos** (**18 ms, 132 ms, 310 ms**).`,
  theory: R`### Módulos dinâmicos
Um módulo **configurável** (como um cliente de banco) expõe um método estático que **devolve um §DynamicModule§**:
§§§
const DB = Symbol('DB_OPCOES');
@Global() @Module({}) class BancoModule {
  static forRoot(opcoes: { url: string; pool: number }): DynamicModule {
    return { module: BancoModule, providers: [{ provide: DB, useValue: opcoes }], exports: [DB] };
  }
}
@Module({ imports: [BancoModule.forRoot({ url: 'postgres://localhost/app', pool: 10 }), RecursoModule] }) class App {}
§§§
Medido: um controller em §RecursoModule§, **sem importar** o §BancoModule§ (ele é **global**), injetou §DB§ e devolveu §{"url":"postgres://localhost/app","pool":10}§. Convenções: §forRoot()§ (configuração **única**, no módulo raiz), §forRootAsync()§ (com §useFactory§ e dependências, ex.: ler do ConfigService), §forFeature()§ (registro **por módulo de funcionalidade**, como as filas de um módulo). O **§ConfigurableModuleBuilder§** gera esse boilerplate.

### Configuração validada na partida
§@nestjs/config§ carrega variáveis (§.env§, ambiente) e as expõe pelo §ConfigService§. Com §validate§, a aplicação **recusa subir** com configuração inválida:
§§§
const validar = (cfg) => { if (!cfg.DATABASE_URL) throw new Error('DATABASE_URL é obrigatória'); return { ...cfg, PORT: Number(cfg.PORT ?? 3000) }; };
ConfigModule.forRoot({ ignoreEnvFile: true, validate: validar, isGlobal: true })
§§§
Medido: sem §DATABASE_URL§, **"DATABASE_URL é obrigatória"** (lançado **na avaliação de §ConfigModule.forRoot§**, antes de a aplicação existir: **falha rápida**); com §DATABASE_URL§ e §PORT=8080§, a rota devolveu §{"porta":8080,"banco":"postgres://localhost/app"}§. Use um **esquema** (Zod ou class-validator) em vez de ifs, **namespaces tipados** (§registerAs§) e **nunca** versione o §.env§ (aula nex-07: os 12 fatores).

### Estrutura de pastas e fronteiras
Organize por **funcionalidade (domínio)**, não por tipo técnico:
§§§
src/
  usuarios/   (usuarios.module.ts, usuarios.controller.ts, usuarios.service.ts, usuarios.repo.ts, dto/)
  pedidos/    (...)
  pagamentos/ (...)
  comum/      (filtros, guards, interceptors, decoradores compartilhados)
  config/     (configuração e validação)
  main.ts
§§§
**Regras de fronteira** de um **monólito modular**:
1. Cada módulo expõe uma **API pública pequena** (§exports§); o resto é **privado**;
2. Um módulo **não acessa o banco/tabelas de outro**: usa o **serviço público** ou **eventos**;
3. **Dependências em um só sentido** (sem ciclos); camadas: **apresentação → aplicação → domínio → infraestrutura**;
4. **Comunicação entre módulos por eventos** (§@nestjs/event-emitter§, **não executado**) quando o acoplamento temporal não for necessário;
5. **Testes de arquitetura** (por exemplo, **dependency-cruiser** ou ESLint com regras de importação, **não executados**) impedem violações.
Isso **prepara** a extração futura de **microsserviços**: as fronteiras já existem.

### Padrões úteis
- **Repository**: isola o acesso a dados (troca ORM/banco, facilita testes);
- **DTO** de entrada e **modelo/DTO de saída** (não devolva entidades do banco);
- **Serviço de aplicação** (casos de uso) x **serviço de domínio** (regras) em domínios complexos;
- **CQRS** (separar comandos e consultas) em casos específicos (**@nestjs/cqrs**, **não executado**); **eventos de domínio**;
- **Mappers** entre camadas;
- **Feature flags** e **versionamento de API** (curso de APIs, C4.3).
Evite **arquitetura demais** para um CRUD: **complexidade proporcional** ao problema.

### Documentação e contratos
O pacote **@nestjs/swagger** gera **OpenAPI** a partir dos decoradores (**não executado** aqui; curso de APIs (C4.3)): o **contrato** vira artefato **testável** e fonte para **clientes gerados**.

### Custo de partida (medido)
Cada módulo com **1 controller e 1 provider**: **1 módulo** ~**18 ms**; **50** ~**132 ms**; **200** ~**310 ms** para **criar e escutar** (uma execução, sem logger). A partida **cresce com o número de módulos e providers**, mas **linearmente e de forma modesta**; em **serverless** (arranques frios) ou em **escalas automáticas**, considere o custo. Evite **I/O pesado** em §onModuleInit§.

### Projeto integrador: API Nest modular
**Cenário**: **API de pedidos** com **usuários, catálogo, pedidos e pagamentos** em **Nest 12** (monólito modular), **PostgreSQL** (aula C3.6: Prisma) e **Redis**.
**Entregáveis**:
1. **Módulos por domínio** com **exports** mínimos; **módulos dinâmicos** para banco e filas; **configuração validada**;
2. **DTOs com ValidationPipe global** (whitelist, forbidNonWhitelisted, transform);
3. **Guard global** que nega por padrão + **@Public()** + **papéis** e **verificação do dono** do pedido;
4. **Filtro global** com **Problem Details** e **sem vazamento**; **erros de domínio**;
5. **Interceptors**: log com **id da requisição**, **timeout** e **envelope** (se adotado);
6. **Fila BullMQ** para e-mail/relatório com **retry/backoff** e **processador idempotente**;
7. **Testes**: unitários dos serviços, **e2e** das rotas (200/400/401/403/404/409/500), teste da **matriz de autorização**;
8. **Desligamento ordenado** (§enableShutdownHooks§) e **/saude**;
9. **ADR** com as decisões (por que Nest, fronteiras, onde cabe um microsserviço).
**Critérios**: nenhum acesso entre tabelas de módulos diferentes, 500 sem vazamento, matriz de autorização coberta e número medido de módulos/tempo de partida.`,
  concepts: [
    { term: 'DynamicModule', def: 'Módulo configurado em tempo de execução por um método estático como forRoot.' },
    { term: 'forRoot / forFeature', def: 'Convenções para configurar um módulo globalmente ou por funcionalidade.' },
    { term: 'ConfigModule', def: 'Módulo do Nest que carrega e valida a configuração por variáveis de ambiente.' },
    { term: 'Monólito modular', def: 'Aplicação única dividida em módulos com fronteiras e APIs públicas bem definidas.' },
    { term: 'Fronteira de módulo', def: 'Limite que define o que é público e o que é privado em um módulo.' },
    { term: 'Repository', def: 'Padrão que encapsula o acesso a dados de uma entidade.' },
    { term: 'CQRS', def: 'Separação entre modelos de comando (escrita) e de consulta (leitura).' },
    { term: 'Evento de domínio', def: 'Fato relevante ocorrido no domínio, publicado para outros módulos reagirem.' },
    { term: 'ConfigurableModuleBuilder', def: 'Utilitário do Nest que gera o boilerplate de módulos configuráveis.' },
    { term: 'Falha rápida', def: 'Recusar a partida quando a configuração é inválida.' }
  ],
  examples: R`**Analogia:** um **monólito modular** é um **prédio com apartamentos independentes**: cada apartamento (módulo) tem **sua porta e suas regras**, e só se fala com os vizinhos pela **interfone** (API pública ou eventos), nunca entrando pela janela (acessando a tabela alheia). Se um dia um apartamento precisar virar uma **casa separada** (microsserviço), o **interfone já está instalado**. O **módulo dinâmico** é o **apartamento com um quadro de ajustes na entrada** (voltagem, temperatura) que o morador define ao se mudar.

**Exemplo 1: dinâmico.** forRoot({url, pool}) disponível globalmente.

**Exemplo 2: configuração.** Sem DATABASE_URL, a aplicação nem existe.

**Exemplo 3: custo.** 18, 132 e 310 ms para 1, 50 e 200 módulos.`,
  code: [
    { title: 'Módulo dinâmico, global e configuração validada (TypeScript, saídas medidas)', lang: 'ts', code: R`const DB = Symbol('DB_OPCOES');
@Global() @Module({}) class BancoModule {
  static forRoot(opcoes: { url: string; pool: number }): DynamicModule {
    return { module: BancoModule, providers: [{ provide: DB, useValue: opcoes }], exports: [DB] };
  }
}
@Controller('b') class BCtrl { constructor(@Inject(DB) private o: { url: string; pool: number }) {} @Get() g() { return this.o; } }
@Module({ controllers: [BCtrl] }) class RecursoModule {}
@Module({ imports: [BancoModule.forRoot({ url: 'postgres://localhost/app', pool: 10 }), RecursoModule] }) class App {}
// GET /b -> {"url":"postgres://localhost/app","pool":10}

const validar = (cfg: Record<string, unknown>) => { if (!cfg.DATABASE_URL) throw new Error('DATABASE_URL é obrigatória'); return { ...cfg, PORT: Number(cfg.PORT ?? 3000) }; };
@Module({ imports: [ConfigModule.forRoot({ ignoreEnvFile: true, validate: validar, isGlobal: true })] }) class AppConfig {}
// sem DATABASE_URL: "DATABASE_URL é obrigatória" (falha antes de a app existir)
// com DATABASE_URL e PORT=8080: {"porta":8080,"banco":"postgres://localhost/app"}`, notes: [{ l: '2', t: 'Global: os exports valem em toda a aplicação.' }, { l: '13', t: 'A validação roda ao avaliar forRoot.' }] },
    { title: 'Estrutura por domínio e regra de dependência (texto)', lang: 'text', code: R`src/
  usuarios/    usuarios.module.ts  usuarios.service.ts  usuarios.repo.ts  dto/
  pedidos/     pedidos.module.ts   pedidos.service.ts   pedidos.repo.ts   dto/
  pagamentos/  pagamentos.module.ts ...
  comum/       filtros/  guards/  interceptors/  decoradores/
  config/      config.module.ts  env.schema.ts
  main.ts

regras: pedidos -> usuarios (via UsuariosService público) | nunca pedidos -> tabela de usuarios
        módulos não se importam em ciclo | comunicação opcional por eventos de domínio`, notes: [{ l: '9', t: 'As fronteiras de módulo preparam a extração de microsserviços.' }] }
  ],
  bestPractices: ['Organize por domínio e mantenha APIs públicas pequenas.', 'Use módulos dinâmicos para recursos configuráveis e valide a configuração na partida.', 'Proíba o acesso direto às tabelas de outros módulos.', 'Evite dependências circulares entre módulos.', 'Comece pelo monólito modular e extraia serviços com razão clara.', 'Proporcione a arquitetura ao tamanho do problema.'],
  mistakes: ['Organizar apenas por tipo técnico (todos os controllers juntos).', 'Tornar tudo global.', 'Deixar módulos acessarem as tabelas uns dos outros.', 'Configuração lida do ambiente em qualquer lugar do código.', 'Arquitetura excessiva para um CRUD simples.', 'Fazer I/O pesado em onModuleInit e atrasar a partida.'],
  market: R`Estruturar o Nest em módulos coesos com fronteiras claras é o que separa projetos que escalam em equipe dos que viram um emaranhado; é tema recorrente em entrevistas de arquitetura e em ADRs.`,
  summary: R`Módulos dinâmicos (forRoot) configuram recursos e os globais evitam importações repetidas (medido: DB injetado sem importar o módulo). O @nestjs/config com validate falha na partida (medido: "DATABASE_URL é obrigatória"); com as variáveis, a rota devolveu porta 8080 e o banco. O monólito modular usa fronteiras por domínio; o custo de partida medido foi 18, 132 e 310 ms para 1, 50 e 200 módulos. O projeto integra tudo em uma API Nest modular.`,
  refs: [REF3.nestDynamic, REF3.nestConfig, REF3.nestOpenapi, REF3.nestCqrs, REF3.fowlerMicro],
  cards: [
    { q: 'O que é um módulo dinâmico?', a: 'Um módulo configurado em tempo de execução por um método estático como forRoot, que devolve um DynamicModule.' },
    { q: 'Quando a validação do @nestjs/config roda?', a: 'Ao avaliar ConfigModule.forRoot, antes de a aplicação existir (falha rápida).' },
    { q: 'O que é um monólito modular?', a: 'Aplicação única com módulos de fronteiras claras, APIs públicas pequenas e sem acesso às tabelas alheias.' },
    { q: 'Como o custo de partida cresce?', a: 'De forma modesta (medido: 18, 132 e 310 ms para 1, 50 e 200 módulos).' },
    { q: 'Por que organizar por domínio?', a: 'Porque agrupa o que muda junto e facilita extrair serviços e manter fronteiras.' }
  ]
}
];
