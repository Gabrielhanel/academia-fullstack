import 'reflect-metadata';
import { Controller, Get, Inject, Injectable, Module, Scope, forwardRef, Global } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { subir } from './util.js';

console.log('== 1. encapsulamento de módulos');
@Injectable() class SecretoService { v() { return 'segredo'; } }
@Module({ providers: [SecretoService] }) class SecretoModule {}                   // NÃO exporta
@Controller('x') class XCtrl { constructor(private s: SecretoService) {} @Get() g() { return this.s.v(); } }
@Module({ imports: [SecretoModule], controllers: [XCtrl] }) class AppSemExport {}
try { await subir(AppSemExport); } catch (e: any) { console.log('sem exports:', String(e.message).split('\n')[0].slice(0, 150)); }
@Module({ providers: [SecretoService], exports: [SecretoService] }) class SecretoModuleOk {}
@Module({ imports: [SecretoModuleOk], controllers: [XCtrl] }) class AppComExport {}
{ const { app, f } = await subir(AppComExport); console.log('com exports:', JSON.stringify(await f('/x'))); await app.close(); }

console.log('\n== 2. providers customizados e tokens');
const CONFIG = Symbol('CONFIG');
@Injectable() class Relogio { agora() { return 'real'; } }
class RelogioFalso { agora() { return 'falso'; } }
@Controller('c') class CCtrl {
  constructor(@Inject(CONFIG) private cfg: { porta: number }, @Inject('RELOGIO') private r: Relogio, @Inject('FABRICA') private fab: string, @Inject('ALIAS') private alias: Relogio) {}
  @Get() g() { return { cfg: this.cfg, relogio: this.r.agora(), fabrica: this.fab, alias: this.alias.agora() }; }
}
@Module({ controllers: [CCtrl], providers: [
  { provide: CONFIG, useValue: { porta: 3000 } },
  Relogio, { provide: 'RELOGIO', useClass: RelogioFalso },
  { provide: 'FABRICA', useFactory: (c: { porta: number }) => 'porta ' + c.porta, inject: [CONFIG] },
  { provide: 'ALIAS', useExisting: Relogio }
] }) class AppCustom {}
{ const { app, f } = await subir(AppCustom); console.log(JSON.stringify(await f('/c'))); await app.close(); }

console.log('\n== 3. escopos: singleton x por requisição');
let criadosSingleton = 0, criadosRequest = 0;
@Injectable() class Unico { constructor() { criadosSingleton++; } }
@Injectable({ scope: Scope.REQUEST }) class PorRequisicao { constructor() { criadosRequest++; } }
@Controller('s') class SCtrl { constructor(private u: Unico, private r: PorRequisicao) {} @Get() g() { return 'ok'; } }
@Module({ controllers: [SCtrl], providers: [Unico, PorRequisicao] }) class AppEscopo {}
{ const { app, f } = await subir(AppEscopo); for (let i = 0; i < 5; i++) await f('/s'); console.log('instâncias singleton:', criadosSingleton, '| instâncias por requisição após 5 requisições:', criadosRequest); await app.close(); }

console.log('\n== 4. dependência circular');
@Injectable() class A { constructor(@Inject(forwardRef(() => B)) public b: any) {} }
@Injectable() class B { constructor(@Inject(forwardRef(() => A)) public a: any) {} }
@Module({ providers: [A, B] }) class AppCircularOk {}
{ const app = await NestFactory.createApplicationContext(AppCircularOk, { logger: false, abortOnError: false }); console.log('com forwardRef: resolvido =', !!app.get(A).b && !!app.get(B).a); await app.close(); }

console.log('\n== 5. ciclo de vida e desligamento');
const ordem: string[] = [];
@Injectable() class Ciclo { onModuleInit() { ordem.push('onModuleInit'); } onApplicationBootstrap() { ordem.push('onApplicationBootstrap'); } onModuleDestroy() { ordem.push('onModuleDestroy'); } beforeApplicationShutdown(s?: string) { ordem.push('beforeApplicationShutdown(' + s + ')'); } onApplicationShutdown(s?: string) { ordem.push('onApplicationShutdown(' + s + ')'); } }
@Module({ providers: [Ciclo] }) class AppCiclo {}
{ const app = await NestFactory.create(AppCiclo, { logger: false }); app.enableShutdownHooks(); await app.listen(0, '127.0.0.1'); await app.close(); console.log(ordem.join(' -> ')); }
