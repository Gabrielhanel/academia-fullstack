import { MongoClient } from 'mongodb';
const cli = new MongoClient('mongodb://127.0.0.1:57017', { directConnection: true });
await cli.connect();
const db = cli.db('lab');
const med = async (rotulo, fn, reps = 7) => { await fn(); const t = []; for (let i = 0; i < reps; i++) { const t0 = performance.now(); await fn(); t.push(performance.now() - t0); } t.sort((a, b) => a - b); console.log(rotulo.padEnd(62), 'mediana ms:', t[Math.floor(reps / 2)].toFixed(1)); };

console.log('== limite de 16 MB (servidor)');
try { await db.collection('grande').insertOne({ _id: 2, comentarios: Array.from({ length: 15000 }, (_, i) => 'x'.repeat(1100) + i) }); console.log('inseriu'); }
catch (e) { console.log('documento de ~16,5 MB:', e.codeName || e.name, '| código', e.code, '|', e.message.slice(0, 110)); }

console.log('\n== modelagem: embutir x referenciar (10.000 clientes, 5 pedidos cada)');
await db.collection('cli_ref').drop().catch(() => {}); await db.collection('ped_ref').drop().catch(() => {}); await db.collection('cli_emb').drop().catch(() => {});
const clientes = Array.from({ length: 10000 }, (_, i) => ({ _id: i + 1, nome: 'Cliente ' + (i + 1) }));
const peds = []; for (let c = 1; c <= 10000; c++) for (let p = 0; p < 5; p++) peds.push({ clienteId: c, valor: p * 10 + 5, status: 'pago' });
await db.collection('cli_ref').insertMany(clientes);
for (let i = 0; i < peds.length; i += 10000) await db.collection('ped_ref').insertMany(peds.slice(i, i + 10000));
await db.collection('ped_ref').createIndex({ clienteId: 1 });
await db.collection('cli_emb').insertMany(clientes.map((c) => ({ ...c, pedidos: peds.filter(() => false) })));
const emb = clientes.map((c) => ({ ...c, pedidos: [0, 1, 2, 3, 4].map((p) => ({ valor: p * 10 + 5, status: 'pago' })) }));
await db.collection('cli_emb').deleteMany({}); await db.collection('cli_emb').insertMany(emb);
const alvo = 4321;
await med('embutido: 1 find por _id (cliente com pedidos)', () => db.collection('cli_emb').findOne({ _id: alvo }));
await med('referenciado: 2 consultas (cliente e seus pedidos)', async () => { await db.collection('cli_ref').findOne({ _id: alvo }); await db.collection('ped_ref').find({ clienteId: alvo }).toArray(); });
await med('referenciado: 1 agregação com $lookup', () => db.collection('cli_ref').aggregate([{ $match: { _id: alvo } }, { $lookup: { from: 'ped_ref', localField: '_id', foreignField: 'clienteId', as: 'pedidos' } }]).toArray());
await med('lista de 100 clientes com pedidos (embutido)', () => db.collection('cli_emb').find({ _id: { $lte: 100 } }).toArray());
await med('lista de 100 clientes com pedidos ($lookup)', () => db.collection('cli_ref').aggregate([{ $match: { _id: { $lte: 100 } } }, { $lookup: { from: 'ped_ref', localField: '_id', foreignField: 'clienteId', as: 'pedidos' } }]).toArray());
await med('atualizar um pedido embutido (arrayFilters)', () => db.collection('cli_emb').updateOne({ _id: alvo }, { $set: { 'pedidos.$[p].status': 'enviado' } }, { arrayFilters: [{ 'p.valor': 5 }] }));
console.log('tamanho médio: embutido', (await db.command({ collStats: 'cli_emb' })).avgObjSize, 'bytes | cliente referenciado', (await db.command({ collStats: 'cli_ref' })).avgObjSize, '+ pedido', (await db.command({ collStats: 'ped_ref' })).avgObjSize, 'bytes');

console.log('\n== agregação');
const ped = db.collection('pedidos');
const exp = async (pipeline) => { const e = await ped.aggregate(pipeline).explain('executionStats'); const w = JSON.stringify(e); return { estagio: /IXSCAN/.test(w) ? 'IXSCAN' : 'COLLSCAN', examinados: e.executionStats?.totalDocsExamined ?? e.stages?.[0]?.$cursor?.executionStats?.totalDocsExamined }; };
const r1 = await ped.aggregate([{ $group: { _id: '$status', pedidos: { $sum: 1 }, total: { $sum: '$valor' } } }, { $sort: { _id: 1 } }]).toArray();
console.log('por status:', JSON.stringify(r1));
const r2 = await ped.aggregate([{ $match: { status: 'pago' } }, { $unwind: '$itens' }, { $group: { _id: '$itens.sku', qtd: { $sum: '$itens.qtd' } } }, { $sort: { qtd: -1, _id: 1 } }, { $limit: 3 }]).toArray();
console.log('top 3 SKUs vendidos (pagos):', JSON.stringify(r2));
console.log('$match primeiro (índice composto):', JSON.stringify(await exp([{ $match: { status: 'pago' } }, { $group: { _id: null, n: { $sum: 1 } } }])));
console.log('$group sem $match (varredura):', JSON.stringify(await exp([{ $group: { _id: '$status', n: { $sum: 1 } } }])));
await med('aggregate: receita por status no servidor', () => ped.aggregate([{ $group: { _id: '$status', total: { $sum: '$valor' } } }]).toArray());
await med('find tudo e somar no cliente (100 mil docs)', async () => { const docs = await ped.find({}, { projection: { status: 1, valor: 1 } }).toArray(); const m = {}; for (const d of docs) m[d.status] = (m[d.status] || 0) + d.valor; return m; }, 3);
const f = await ped.aggregate([{ $facet: { porStatus: [{ $group: { _id: '$status', n: { $sum: 1 } } }, { $sort: { _id: 1 } }], valorMax: [{ $group: { _id: null, max: { $max: '$valor' } } }] } }]).toArray();
console.log('$facet:', JSON.stringify(f[0]));

console.log('\n== TTL (documentos que expiram)');
const ev = db.collection('eventos');
await ev.createIndex({ expiraEm: 1 }, { expireAfterSeconds: 0 });
await ev.insertMany([{ n: 1, expiraEm: new Date(Date.now() - 1000) }, { n: 2, expiraEm: new Date(Date.now() + 3600000) }]);
console.log('antes (t=0 s):', await ev.countDocuments());
await new Promise((r) => setTimeout(r, 75000));
console.log('depois de 75 s:', await ev.countDocuments(), '(o monitor de TTL roda a cada ~60 s)');
await cli.close();
