import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from './generated/client.ts';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const consultas: string[] = [];
const prisma = new PrismaClient({ adapter, log: [{ emit: 'event', level: 'query' }] });
(prisma as any).$on('query', (e: any) => consultas.push(e.query));
const relogio = async <T>(rotulo: string, fn: () => Promise<T>) => {
  await fn(); // aquecimento
  const tempos: number[] = [];
  let r: any;
  for (let i = 0; i < 7; i++) {
    consultas.length = 0;
    const t0 = performance.now();
    r = await fn();
    tempos.push(performance.now() - t0);
  }
  tempos.sort((a, b) => a - b);
  console.log(rotulo.padEnd(50), 'consultas:', String(consultas.length).padStart(4), '| mediana ms:', tempos[3].toFixed(1));
  return r;
};

await prisma.$executeRawUnsafe('TRUNCATE "ItemPedido", "Pedido", "Produto", "Cliente" RESTART IDENTITY CASCADE');
// seed: 100 clientes, 5 produtos, 5 pedidos por cliente com 3 itens
await prisma.cliente.createMany({ data: Array.from({ length: 100 }, (_, i) => ({ nome: 'Cliente ' + (i + 1), email: `c${i + 1}@ex.com` })) });
await prisma.produto.createMany({ data: [1, 2, 3, 4, 5].map((i) => ({ nome: 'Produto ' + i, preco: new Prisma.Decimal(i * 10 + 0.5) })) });
const pedidos = [];
for (let c = 1; c <= 100; c++) for (let p = 0; p < 5; p++) pedidos.push({ clienteId: c });
await prisma.pedido.createMany({ data: pedidos });
const itens = [];
for (let p = 1; p <= 500; p++) for (const prod of [1, 2, 3]) itens.push({ pedidoId: p, produtoId: prod, quantidade: prod });
await prisma.itemPedido.createMany({ data: itens });
console.log('seed:', await prisma.cliente.count(), 'clientes,', await prisma.pedido.count(), 'pedidos,', await prisma.itemPedido.count(), 'itens');

console.log('\n== N+1');
await relogio('N+1: lista clientes e, em laço, os pedidos', async () => {
  const clientes = await prisma.cliente.findMany();
  let total = 0;
  for (const c of clientes) total += (await prisma.pedido.findMany({ where: { clienteId: c.id } })).length;
  return total;
});
await relogio("include + relationLoadStrategy 'query' (separadas)", () => prisma.cliente.findMany({ relationLoadStrategy: 'query', include: { pedidos: true } }));
await relogio('include (estratégia padrão com relationJoins)', () => prisma.cliente.findMany({ include: { pedidos: true } }));
await relogio("include + relationLoadStrategy 'join'", () => prisma.cliente.findMany({ relationLoadStrategy: 'join', include: { pedidos: true } }));
await relogio("include profundo 'query' (4 níveis)", () => prisma.cliente.findMany({ relationLoadStrategy: 'query', include: { pedidos: { include: { itens: { include: { produto: true } } } } } }));
await relogio("include profundo 'join' (4 níveis)", () => prisma.cliente.findMany({ relationLoadStrategy: 'join', include: { pedidos: { include: { itens: { include: { produto: true } } } } } }));
await relogio('groupBy: contagem de pedidos por cliente (SQL)', () => prisma.pedido.groupBy({ by: ['clienteId'], _count: { _all: true } }));
await relogio('select só o necessário (id, nome)', () => prisma.cliente.findMany({ select: { id: true, nome: true } }));
const amostra = consultas.slice(0, 1);
console.log('SQL do select enxuto:', amostra[0]);

console.log('\n== consulta gerada por include (estratégia padrão)');
consultas.length = 0;
await prisma.cliente.findMany({ where: { id: { lte: 2 } }, include: { pedidos: true } });
consultas.forEach((q, i) => console.log(`#${i + 1}`, q.replace(/\s+/g, ' ').slice(0, 230)));

console.log('\n== erros tipados');
try { await prisma.cliente.create({ data: { nome: 'x', email: 'c1@ex.com' } }); } catch (e: any) { console.log('unicidade:', e.code, '|', (e.meta && JSON.stringify(e.meta)) || ''); }
try { await prisma.pedido.create({ data: { clienteId: 9999 } }); } catch (e: any) { console.log('chave estrangeira:', e.code); }
try { await prisma.cliente.update({ where: { id: 9999 }, data: { nome: 'y' } }); } catch (e: any) { console.log('não encontrado:', e.code); }

console.log('\n== transações');
try {
  await prisma.$transaction(async (tx) => {
    await tx.cliente.create({ data: { nome: 'Dentro da tx', email: 'tx@ex.com' } });
    throw new Error('falha de negócio');
  });
} catch (e: any) { console.log('erro propagado:', e.message); }
console.log('cliente criado dentro da transação desfeita existe?', (await prisma.cliente.count({ where: { email: 'tx@ex.com' } })) === 1);
const [c, n] = await prisma.$transaction([prisma.cliente.count(), prisma.pedido.count()]);
console.log('$transaction([...]) em lote:', c, 'clientes e', n, 'pedidos');

console.log('\n== SQL cru parametrizado x concatenado');
const entrada = "' OR '1'='1";
const seguro = await prisma.$queryRaw`SELECT count(*)::int AS n FROM "Cliente" WHERE nome = ${entrada}`;
console.log('$queryRaw (tagged template, parâmetros):', JSON.stringify(seguro));
const inseguro = await prisma.$queryRawUnsafe(`SELECT count(*)::int AS n FROM "Cliente" WHERE nome = '${entrada}'`);
console.log('$queryRawUnsafe com concatenação:', JSON.stringify(inseguro));

console.log('\n== paginação: skip x cursor (500 pedidos)');
await relogio('skip 400 take 20', () => prisma.pedido.findMany({ orderBy: { id: 'asc' }, skip: 400, take: 20 }));
await relogio('cursor 400 take 20', () => prisma.pedido.findMany({ orderBy: { id: 'asc' }, cursor: { id: 401 }, take: 20 }));
consultas.length = 0; await prisma.pedido.findMany({ orderBy: { id: 'asc' }, skip: 400, take: 20 });
console.log('SQL do skip:', consultas[0]?.replace(/\s+/g, ' '));
consultas.length = 0; await prisma.pedido.findMany({ orderBy: { id: 'asc' }, cursor: { id: 401 }, take: 20 });
console.log('SQL do cursor:', consultas[0]?.replace(/\s+/g, ' ').slice(0, 260));

console.log('\n== Decimal');
const prod = await prisma.produto.findFirst();
console.log('tipo do preço:', prod?.preco.constructor.name, '| valor:', prod?.preco.toString(), '| soma 0.1+0.2 em Decimal:', new Prisma.Decimal(0.1).plus(0.2).toString(), '| em number:', 0.1 + 0.2);
await prisma.$disconnect();
