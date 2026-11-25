import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client.ts';
import pg from 'pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const mediana = async (rotulo: string, fn: () => Promise<any>, reps = 7) => {
  await fn();
  const t: number[] = [];
  for (let i = 0; i < reps; i++) { const t0 = performance.now(); await fn(); t.push(performance.now() - t0); }
  t.sort((a, b) => a - b);
  console.log(rotulo.padEnd(58), 'mediana ms:', t[Math.floor(reps / 2)].toFixed(1));
};

console.log('== leitura: clientes com contagem de pedidos e total de itens (100 clientes, 500 pedidos, 1500 itens)');
await mediana('Prisma: include pedidos+itens, soma no JavaScript', async () => {
  const cs = await prisma.cliente.findMany({ include: { pedidos: { include: { itens: true } } } });
  return cs.map((c) => ({ id: c.id, pedidos: c.pedidos.length, itens: c.pedidos.reduce((s, p) => s + p.itens.reduce((a, i) => a + i.quantidade, 0), 0) }));
});
await mediana('Prisma: _count de pedidos (sem itens)', () => prisma.cliente.findMany({ select: { id: true, _count: { select: { pedidos: true } } } }));
await mediana('Prisma: $queryRaw com GROUP BY (SQL)', () => prisma.$queryRaw`SELECT c.id, count(DISTINCT p.id)::int AS pedidos, coalesce(sum(i.quantidade), 0)::int AS itens FROM "Cliente" c LEFT JOIN "Pedido" p ON p.\"clienteId\" = c.id LEFT JOIN "ItemPedido" i ON i.\"pedidoId\" = p.id GROUP BY c.id ORDER BY c.id`);
await mediana('pg (driver puro): o mesmo SQL', () => pool.query('SELECT c.id, count(DISTINCT p.id)::int AS pedidos, coalesce(sum(i.quantidade), 0)::int AS itens FROM "Cliente" c LEFT JOIN "Pedido" p ON p."clienteId" = c.id LEFT JOIN "ItemPedido" i ON i."pedidoId" = p.id GROUP BY c.id ORDER BY c.id'));

console.log('\n== escrita: inserir 1.000 clientes');
let n = 0;
const emails = (k: number) => Array.from({ length: 1000 }, (_, i) => ({ nome: 'Lote ' + i, email: `lote${k}-${i}@ex.com` }));
await mediana('Prisma: create em laço (1.000 comandos)', async () => { n++; for (const d of emails(n)) await prisma.cliente.create({ data: d }); }, 3);
await mediana('Prisma: createMany (1 comando)', async () => { n++; await prisma.cliente.createMany({ data: emails(n) }); }, 3);
await mediana('pg: INSERT multilinha com unnest e parâmetros', async () => { n++; const e = emails(n); await pool.query('INSERT INTO "Cliente" (nome, email) SELECT * FROM unnest($1::text[], $2::text[])', [e.map((x) => x.nome), e.map((x) => x.email)]); }, 3);
await prisma.$executeRawUnsafe(`DELETE FROM "Cliente" WHERE email LIKE 'lote%'`);
await prisma.$disconnect(); await pool.end();
