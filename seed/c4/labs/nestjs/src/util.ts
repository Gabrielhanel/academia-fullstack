import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
export async function subir(modulo: any, opcoes: any = {}) {
  const app = await NestFactory.create(modulo, { logger: false, abortOnError: false, ...opcoes });
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const f = async (p: string, o?: RequestInit) => { const r = await fetch(base.replace('[::1]', '127.0.0.1') + p, o); const t = await r.text(); return { status: r.status, corpo: t }; };
  return { app, f };
}
