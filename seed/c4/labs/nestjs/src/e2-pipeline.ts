import 'reflect-metadata';
import { Body, CallHandler, CanActivate, Catch, ArgumentsHost, Controller, ExceptionFilter, ExecutionContext, Get, HttpException, HttpStatus, Injectable, Module, NestInterceptor, NotFoundException, Param, ParseIntPipe, PipeTransform, Post, Query, SetMetadata, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe, RequestTimeoutException, ForbiddenException, BadRequestException, ParseUUIDPipe, DefaultValuePipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IsEmail, IsInt, IsString, Min, MinLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Observable, map, tap, timeout, catchError, throwError, TimeoutError, of, delay } from 'rxjs';
import { subir } from './util.js';

const trilha: string[] = [];
const marca = (x: string) => trilha.push(x);

class CriarUsuarioDto {
  @IsString() @MinLength(3) nome!: string;
  @IsEmail() email!: string;
  @Type(() => Number) @IsInt() @Min(18) idade!: number;
  @IsOptional() @IsString() apelido?: string;
}

const PAPEIS = 'papeis';
const Papeis = (...p: string[]) => SetMetadata(PAPEIS, p);
@Injectable() class PapelGuard implements CanActivate {
  constructor(private r: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    marca('guard');
    const exigidos = this.r.get<string[]>(PAPEIS, ctx.getHandler());
    if (!exigidos) return true;
    const papel = ctx.switchToHttp().getRequest().headers['x-papel'];
    if (!papel) return false;                 // vira 403 Forbidden
    return exigidos.includes(String(papel));
  }
}
@Injectable() class LogInterceptor implements NestInterceptor {
  intercept(_c: ExecutionContext, next: CallHandler): Observable<any> { marca('interceptor:antes'); return next.handle().pipe(tap(() => marca('interceptor:depois'))); }
}
@Injectable() class EnvelopeInterceptor implements NestInterceptor {
  intercept(_c: ExecutionContext, next: CallHandler) { return next.handle().pipe(map((d) => ({ dados: d }))); }
}
@Injectable() class TimeoutInterceptor implements NestInterceptor {
  intercept(_c: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(timeout(100), catchError((e) => (e instanceof TimeoutError ? throwError(() => new RequestTimeoutException('tempo esgotado')) : throwError(() => e))));
  }
}
class MarcaPipe implements PipeTransform { transform(v: any) { marca('pipe'); return v; } }
class ErroDominio extends Error { constructor(public codigo: string, m: string) { super(m); } }
@Catch(ErroDominio) class DominioFilter implements ExceptionFilter {
  catch(e: ErroDominio, host: ArgumentsHost) { marca('filter'); const res = host.switchToHttp().getResponse(); res.status(409).json({ type: 'https://exemplo.com/erros/' + e.codigo, title: e.message, status: 409 }); }
}

@Controller('u')
@UseFilters(DominioFilter)
class UCtrl {
  @Post() @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) criar(@Body() dto: CriarUsuarioDto) { return { ok: true, tipoIdade: typeof dto.idade, dto }; }
  @Get('lista') lista(@Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number, @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number) { return { pagina, limite }; }
  @Get('id/:id') porId(@Param('id', ParseIntPipe) id: number) { return { id, tipo: typeof id }; }
  @Get('uuid/:id') uuid(@Param('id', new ParseUUIDPipe()) id: string) { return { id }; }
  @Get('naoachou') nao() { throw new NotFoundException('usuário não existe'); }
  @Get('dominio') dom() { throw new ErroDominio('saldo-insuficiente', 'saldo insuficiente'); }
  @Get('bug') bug() { (null as any).x; }
  @Get('http') http() { throw new HttpException({ erro: 'custom', campos: ['a'] }, HttpStatus.I_AM_A_TEAPOT); }
  @Get('admin') @Papeis('admin') @UseGuards(PapelGuard) admin() { marca('handler'); return 'área admin'; }
  @Get('ordem') @UseGuards(PapelGuard) @UseInterceptors(LogInterceptor) @UsePipes(MarcaPipe) ordem(@Query('x') x: string) { marca('handler'); return 'ok'; }
  @Get('envelope') @UseInterceptors(EnvelopeInterceptor) env() { return { n: 1 }; }
  @Get('lento') @UseInterceptors(TimeoutInterceptor) lento() { return of('tarde').pipe(delay(400)); }
}
@Module({ controllers: [UCtrl], providers: [PapelGuard] }) class App {}

const { app, f } = await subir(App);
const j = (o: unknown): RequestInit => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(o) });
const show = (r: { status: number; corpo: string }) => r.status + ' ' + r.corpo;
console.log('== pipes e validação');
console.log('DTO válido (idade "30" como texto, transform:true):', show(await f('/u', j({ nome: 'Ana', email: 'ana@x.com', idade: '30' }))));
console.log('DTO inválido:', show(await f('/u', j({ nome: 'A', email: 'x', idade: 10 }))));
console.log('campo extra com forbidNonWhitelisted:', show(await f('/u', j({ nome: 'Ana', email: 'ana@x.com', idade: 30, admin: true }))));
console.log('ParseIntPipe "abc":', show(await f('/u/id/abc')));
console.log('ParseIntPipe "42":', show(await f('/u/id/42')));
console.log('ParseUUIDPipe inválido:', show(await f('/u/uuid/123')));
console.log('DefaultValuePipe + ParseIntPipe sem query:', show(await f('/u/lista')), '| com ?pagina=3&limite=5:', show(await f('/u/lista?pagina=3&limite=5')));
console.log('\n== guards');
console.log('sem papel:', show(await f('/u/admin')));
console.log('papel user:', show(await f('/u/admin', { headers: { 'x-papel': 'user' } })));
console.log('papel admin:', show(await f('/u/admin', { headers: { 'x-papel': 'admin' } })));
console.log('\n== ordem de execução');
trilha.length = 0; await f('/u/ordem?x=1'); console.log(trilha.join(' -> '));
console.log('\n== interceptors');
console.log('envelope:', show(await f('/u/envelope')));
const t0 = performance.now(); const lento = await f('/u/lento'); console.log('timeout 100 ms em uma rota de 400 ms:', show(lento), '| levou', Math.round(performance.now() - t0), 'ms');
console.log('\n== filtros e exceções');
console.log('NotFoundException:', show(await f('/u/naoachou')));
console.log('HttpException com objeto:', show(await f('/u/http')));
trilha.length = 0; console.log('ErroDominio com filtro:', show(await f('/u/dominio')), '| filtro executou:', trilha.includes('filter'));
console.log('bug (TypeError) sem filtro:', show(await f('/u/bug')));
console.log('rota inexistente:', show(await f('/u/nada')));
await app.close();
