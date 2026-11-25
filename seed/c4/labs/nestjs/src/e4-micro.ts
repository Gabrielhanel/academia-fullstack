import 'reflect-metadata';
import { Controller, Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ClientProxy, ClientProxyFactory, EventPattern, MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { BullModule, InjectQueue, Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { firstValueFrom, timeout } from 'rxjs';

console.log('== 1. microsserviço com transporte TCP (request-response e eventos)');
const eventos: any[] = [];
@Controller() class MatematicaCtrl {
  @MessagePattern({ cmd: 'soma' }) soma(@Payload() d: { a: number; b: number }) { return d.a + d.b; }
  @EventPattern('usuario.criado') criado(@Payload() d: any) { eventos.push(d); }
}
@Module({ controllers: [MatematicaCtrl] }) class MicroModule {}
const micro = await NestFactory.createMicroservice(MicroModule, { transport: Transport.TCP, options: { host: '127.0.0.1', port: 41234 }, logger: false, abortOnError: false });
await micro.listen();
const client: ClientProxy = ClientProxyFactory.create({ transport: Transport.TCP, options: { host: '127.0.0.1', port: 41234 } });
await client.connect();
console.log('soma(2, 3) por TCP =', await firstValueFrom(client.send({ cmd: 'soma' }, { a: 2, b: 3 })));
const t0 = performance.now(); for (let i = 0; i < 500; i++) await firstValueFrom(client.send({ cmd: 'soma' }, { a: i, b: 1 }));
console.log('500 chamadas sequenciais request-response: total', Math.round(performance.now() - t0), 'ms | média', ((performance.now() - t0) / 500).toFixed(2), 'ms por chamada');
client.emit('usuario.criado', { id: 1 }); client.emit('usuario.criado', { id: 2 });
await new Promise((r) => setTimeout(r, 100)); console.log('eventos recebidos (emit, sem resposta):', eventos.length);
await client.close(); await micro.close();
const client2: ClientProxy = ClientProxyFactory.create({ transport: Transport.TCP, options: { host: '127.0.0.1', port: 41234 } });
try { await firstValueFrom(client2.send({ cmd: 'soma' }, { a: 1, b: 1 }).pipe(timeout(1500))); } catch (e: any) { console.log('com o servidor parado, o cliente falha com:', e.code || e.name || e.message); }
await client2.close();

console.log('\n== 2. fila BullMQ com @nestjs/bullmq (retry e backoff)');
const tentativas: Record<string, number> = {};
@Processor('trabalhos') class TrabalhoProc extends WorkerHost {
  async process(job: Job): Promise<any> {
    tentativas[job.name] = (tentativas[job.name] ?? 0) + 1;
    if (job.name === 'instavel' && tentativas[job.name] < 3) throw new Error('falha transitória ' + tentativas[job.name]);
    if (job.name === 'quebrado') throw new Error('falha permanente');
    return { ok: true, tentativa: tentativas[job.name] };
  }
}
@Injectable() class Produtor { constructor(@InjectQueue('trabalhos') public fila: Queue) {} }
@Module({ imports: [BullModule.forRoot({ connection: { host: '127.0.0.1', port: 57379 } }), BullModule.registerQueue({ name: 'trabalhos' })], providers: [TrabalhoProc, Produtor] }) class FilaModule {}
const ctx = await NestFactory.createApplicationContext(FilaModule, { logger: false, abortOnError: false });
const prod = ctx.get(Produtor);
await prod.fila.obliterate({ force: true });
const opts = { attempts: 3, backoff: { type: 'fixed' as const, delay: 100 }, removeOnComplete: false, removeOnFail: false };
const jOk = await prod.fila.add('simples', { x: 1 }, opts);
const jInst = await prod.fila.add('instavel', { x: 2 }, opts);
const jQueb = await prod.fila.add('quebrado', { x: 3 }, opts);
await new Promise((r) => setTimeout(r, 1500));
for (const [nome, j] of [['simples', jOk], ['instavel', jInst], ['quebrado', jQueb]] as const) { const s = await j.getState(); const atual = await prod.fila.getJob(j.id!); console.log(nome.padEnd(9), '| estado:', s.padEnd(9), '| tentativas feitas:', atual?.attemptsMade, '| execuções do processador:', tentativas[nome], '| motivo da falha:', atual?.failedReason ?? '-'); }
console.log('contagens:', JSON.stringify(await prod.fila.getJobCounts('completed', 'failed', 'waiting', 'delayed')));
await prod.fila.obliterate({ force: true });
await ctx.close();
