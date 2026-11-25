import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Controller, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe, Inject } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

interface Usuario { id: number; nome: string }
@Injectable() class UsuariosRepo { async buscar(id: number): Promise<Usuario | undefined> { throw new Error('banco real não deve ser chamado nos testes'); } }
@Injectable() class UsuariosService {
  constructor(private repo: UsuariosRepo) {}
  async obter(id: number) { const u = await this.repo.buscar(id); if (!u) throw new NotFoundException('usuário não existe'); return { ...u, nome: u.nome.toUpperCase() }; }
}
@Controller('usuarios') class UsuariosCtrl { constructor(private s: UsuariosService) {} @Get(':id') obter(@Param('id', ParseIntPipe) id: number) { return this.s.obter(id); } }
@Module({ controllers: [UsuariosCtrl], providers: [UsuariosService, UsuariosRepo] }) class UsuariosModule {}

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
});

test('sem a substituição, o repositório real lança (prova de que o override foi necessário)', async () => {
  const mod = await Test.createTestingModule({ imports: [UsuariosModule] }).compile();
  const app = mod.createNestApplication(); await app.init();
  const r = await request(app.getHttpServer()).get('/usuarios/1');
  assert.equal(r.status, 500);
  await app.close();
});
