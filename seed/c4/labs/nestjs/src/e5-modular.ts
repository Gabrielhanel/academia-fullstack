import 'reflect-metadata';
import { Controller, DynamicModule, Get, Global, Inject, Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { subir } from './util.js';

console.log('== 1. módulo dinâmico (forRoot) e módulo global');
const DB = Symbol('DB_OPCOES');
@Global() @Module({}) class BancoModule {
  static forRoot(opcoes: { url: string; pool: number }): DynamicModule { return { module: BancoModule, providers: [{ provide: DB, useValue: opcoes }], exports: [DB] }; }
}
@Controller('b') class BCtrl { constructor(@Inject(DB) private o: { url: string; pool: number }) {} @Get() g() { return this.o; } }
@Module({ controllers: [BCtrl] }) class RecursoModule {}   // não importa BancoModule: ele é global
@Module({ imports: [BancoModule.forRoot({ url: 'postgres://localhost/app', pool: 10 }), RecursoModule] }) class App1 {}
{ const { app, f } = await subir(App1); console.log(JSON.stringify(await f('/b'))); await app.close(); }

console.log('\n== 2. configuração com @nestjs/config e validação na partida');
const validar = (cfg: Record<string, unknown>) => { if (!cfg.DATABASE_URL) throw new Error('DATABASE_URL é obrigatória'); return { ...cfg, PORT: Number(cfg.PORT ?? 3000) }; };
@Injectable() class Servico { constructor(private c: ConfigService) {} resumo() { return { porta: this.c.get('PORT'), banco: this.c.get('DATABASE_URL') }; } }
@Controller('cfg') class CfgCtrl { constructor(private s: Servico) {} @Get() g() { return this.s.resumo(); } }
const criarApp2 = () => { @Module({ imports: [ConfigModule.forRoot({ ignoreEnvFile: true, validate: validar, isGlobal: true })], controllers: [CfgCtrl], providers: [Servico] }) class App2 {} return App2; };
delete process.env.DATABASE_URL;
try { await subir(criarApp2()); console.log('subiu sem DATABASE_URL (inesperado)'); } catch (e: any) { console.log('sem DATABASE_URL (a validação roda ao montar o módulo, antes de escutar):', String(e.message).split('\n')[0]); }
process.env.DATABASE_URL = 'postgres://localhost/app'; process.env.PORT = '8080';
{ const { app, f } = await subir(criarApp2()); console.log('com variáveis:', JSON.stringify(await f('/cfg'))); await app.close(); }

console.log('\n== 3. tempo de partida x número de módulos (1 execução por tamanho)');
const fabrica = (n: number) => {
  const mods: any[] = [];
  for (let i = 0; i < n; i++) {
    @Injectable() class S { v() { return i; } }
    @Controller('r' + i) class C { constructor(private s: S) {} @Get() g() { return this.s.v(); } }
    @Module({ controllers: [C], providers: [S] }) class M {}
    mods.push(M);
  }
  @Module({ imports: mods }) class Raiz {}
  return Raiz;
};
for (const n of [1, 50, 200]) { const R = fabrica(n); const t0 = performance.now(); const { app } = await subir(R); const ms = performance.now() - t0; console.log(String(n).padStart(3), 'módulos (cada um com 1 controller e 1 provider):', Math.round(ms), 'ms para criar e escutar'); await app.close(); }
