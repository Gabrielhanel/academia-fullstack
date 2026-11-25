import 'reflect-metadata';
import { DataSource, EntitySchema } from 'typeorm';

const Cliente = new EntitySchema({
  name: 'Cliente', tableName: 'tor_cliente',
  columns: { id: { type: Number, primary: true, generated: 'increment' }, nome: { type: String }, email: { type: String, unique: true } },
  relations: { pedidos: { type: 'one-to-many', target: 'Pedido', inverseSide: 'cliente' } }
});
const Pedido = new EntitySchema({
  name: 'Pedido', tableName: 'tor_pedido',
  columns: { id: { type: Number, primary: true, generated: 'increment' }, status: { type: String, default: 'aberto' } },
  relations: { cliente: { type: 'many-to-one', target: 'Cliente', inverseSide: 'pedidos', joinColumn: { name: 'cliente_id' }, onDelete: 'RESTRICT' } },
  indices: [{ columns: ['cliente'] }]
});

const consultas = [];
const logger = { logQuery: (q) => consultas.push(q), logQueryError() {}, logQuerySlow() {}, logSchemaBuild() {}, logMigration() {}, log() {} };
const ds = new DataSource({ type: 'postgres', host: '127.0.0.1', port: 55432, username: 'postgres', password: 'lab', database: 'ormlab', entities: [Cliente, Pedido], synchronize: false, logger, logging: ['query'] });
await ds.initialize();
const relogio = async (rotulo, fn) => {
  await fn();
  const tempos = []; let r;
  for (let i = 0; i < 7; i++) { consultas.length = 0; const t0 = performance.now(); r = await fn(); tempos.push(performance.now() - t0); }
  tempos.sort((a, b) => a - b);
  console.log(rotulo.padEnd(50), 'consultas:', String(consultas.length).padStart(4), '| mediana ms:', tempos[3].toFixed(1));
  return r;
};

await ds.query('DROP TABLE IF EXISTS tor_pedido, tor_cliente CASCADE');
await ds.synchronize();
console.log('tabelas criadas por synchronize() em um banco vazio');
const cr = ds.getRepository('Cliente'), pr = ds.getRepository('Pedido');
await cr.insert(Array.from({ length: 100 }, (_, i) => ({ nome: 'Cliente ' + (i + 1), email: `t${i + 1}@ex.com` })));
const peds = []; for (let c = 1; c <= 100; c++) for (let p = 0; p < 5; p++) peds.push({ cliente: { id: c } });
await pr.insert(peds);
console.log('seed:', await cr.count(), 'clientes,', await pr.count(), 'pedidos');

console.log('\n== N+1');
await relogio('N+1: find() e, em laço, pedidos de cada cliente', async () => { const cs = await cr.find(); let t = 0; for (const c of cs) t += (await pr.find({ where: { cliente: { id: c.id } } })).length; return t; });
await relogio("find({ relations }) (estratégia 'join', padrão)", () => cr.find({ relations: { pedidos: true } }));
await relogio("find({ relations, relationLoadStrategy: 'query' })", () => cr.find({ relations: { pedidos: true }, relationLoadStrategy: 'query' }));
await relogio('QueryBuilder: contagem por cliente (agregação)', () => pr.createQueryBuilder('p').select('p.cliente_id', 'cliente').addSelect('count(*)', 'n').groupBy('p.cliente_id').getRawMany());
consultas.length = 0; await cr.find({ where: { id: 1 }, relations: { pedidos: true } });
console.log('SQL do join:', consultas[0].replace(/\s+/g, ' ').slice(0, 260));
consultas.length = 0; await cr.find({ relations: { pedidos: true }, take: 10, skip: 5 });
console.log('take/skip com relations gera', consultas.length, 'consultas:', consultas.map((q) => q.replace(/\s+/g, ' ').slice(0, 90)).join(' || '));

console.log('\n== erros');
try { await cr.insert({ nome: 'x', email: 't1@ex.com' }); } catch (e) { console.log('unicidade:', e.name, '| code', e.driverError?.code, '|', e.driverError?.constraint); }
try { await pr.insert({ cliente: { id: 9999 } }); } catch (e) { console.log('chave estrangeira:', e.name, '| code', e.driverError?.code); }

console.log('\n== transação');
try { await ds.transaction(async (m) => { await m.getRepository('Cliente').insert({ nome: 'tx', email: 'tx@ex.com' }); throw new Error('falha de negócio'); }); } catch (e) { console.log('erro propagado:', e.message); }
console.log('cliente da transação desfeita existe?', (await cr.count({ where: { email: 'tx@ex.com' } })) === 1);

console.log('\n== SQL cru');
const entrada = "' OR '1'='1";
console.log('query com parâmetro $1:', JSON.stringify(await ds.query('SELECT count(*)::int AS n FROM tor_cliente WHERE nome = $1', [entrada])));
console.log('query com concatenação:', JSON.stringify(await ds.query(`SELECT count(*)::int AS n FROM tor_cliente WHERE nome = '${entrada}'`)));

console.log('\n== synchronize em produção: o que ele faria com uma entidade alterada');
const ClienteV2 = new EntitySchema({ name: 'Cliente', tableName: 'tor_cliente', columns: { id: { type: Number, primary: true, generated: 'increment' }, nome: { type: String } }, relations: { pedidos: { type: 'one-to-many', target: 'Pedido', inverseSide: 'cliente' } } });
const ds2 = new DataSource({ type: 'postgres', host: '127.0.0.1', port: 55432, username: 'postgres', password: 'lab', database: 'ormlab', entities: [ClienteV2, Pedido] });
await ds2.initialize();
const plano = await ds2.driver.createSchemaBuilder().log();
console.log('comandos que synchronize() executaria:'); plano.upQueries.forEach((q) => console.log('  ', q.query));
await ds2.destroy();
await ds.destroy();
