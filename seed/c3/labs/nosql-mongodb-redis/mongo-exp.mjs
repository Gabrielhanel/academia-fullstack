import { MongoClient } from 'mongodb';
const cli = new MongoClient('mongodb://127.0.0.1:57017', { directConnection: true });
await cli.connect();
const db = cli.db('lab');
const med = async (rotulo, fn, reps = 7) => { await fn(); const t = []; for (let i = 0; i < reps; i++) { const t0 = performance.now(); await fn(); t.push(performance.now() - t0); } t.sort((a, b) => a - b); console.log(rotulo.padEnd(62), 'mediana ms:', t[Math.floor(reps / 2)].toFixed(1)); };
const info = await db.admin().serverInfo();
console.log('MongoDB', info.version);

console.log('\n== CRUD e documentos');
await db.dropDatabase();
const pedidos = db.collection('pedidos');
const status = ['aberto', 'pago', 'cancelado', 'enviado'];
const docs = Array.from({ length: 100000 }, (_, i) => ({ numero: i + 1, clienteId: (i % 5000) + 1, status: status[i % 4], valor: (i % 1000) + 0.5, itens: [{ sku: 'A' + (i % 50), qtd: 1 + (i % 3) }, { sku: 'B' + (i % 30), qtd: 1 }], criado: new Date(Date.UTC(2026, 0, 1) + (i % 300) * 86400000) }));
for (let i = 0; i < docs.length; i += 10000) await pedidos.insertMany(docs.slice(i, i + 10000));
console.log('documentos:', await pedidos.countDocuments(), '| tamanho médio (bytes):', (await db.command({ collStats: 'pedidos' })).avgObjSize);
const um = await pedidos.findOne({ numero: 7 });
console.log('exemplo:', JSON.stringify(um).slice(0, 220));
console.log('tipo do _id:', um._id.constructor.name, '| _id é gerado automaticamente');

console.log('\n== índices e explain');
const explicar = async (filtro, ordem) => { const c = pedidos.find(filtro); if (ordem) c.sort(ordem); const e = await c.explain('executionStats'); const w = JSON.stringify(e.queryPlanner.winningPlan); return { estagio: /IXSCAN/.test(w) ? 'IXSCAN' : /COLLSCAN/.test(w) ? 'COLLSCAN' : '?', examinados: e.executionStats.totalDocsExamined, chaves: e.executionStats.totalKeysExamined, retornados: e.executionStats.nReturned }; };
console.log('sem índice, clienteId = 123:', JSON.stringify(await explicar({ clienteId: 123 })));
await med('find clienteId = 123 (sem índice)', () => pedidos.find({ clienteId: 123 }).toArray());
await pedidos.createIndex({ clienteId: 1 });
console.log('com índice, clienteId = 123:', JSON.stringify(await explicar({ clienteId: 123 })));
await med('find clienteId = 123 (com índice)', () => pedidos.find({ clienteId: 123 }).toArray());
await pedidos.createIndex({ status: 1, criado: -1 });
console.log('composto (status, criado) com status+ordem:', JSON.stringify(await explicar({ status: 'pago' }, { criado: -1 })));
console.log('só criado (não é prefixo):', JSON.stringify(await explicar({ criado: { $gte: new Date('2026-06-01') } })));
console.log('indices:', (await pedidos.indexes()).map((i) => i.name).join(', '));

console.log('\n== validação e unicidade');
await db.createCollection('clientes', { validator: { $jsonSchema: { bsonType: 'object', required: ['nome', 'email'], properties: { nome: { bsonType: 'string' }, email: { bsonType: 'string', pattern: '^.+@.+$' }, idade: { bsonType: 'int', minimum: 0 } } } } });
const clientes = db.collection('clientes');
await clientes.createIndex({ email: 1 }, { unique: true });
await clientes.insertOne({ nome: 'Ana', email: 'ana@ex.com', idade: 30 });
try { await clientes.insertOne({ nome: 'Sem email' }); } catch (e) { console.log('validação:', e.code, e.codeName); }
try { await clientes.insertOne({ nome: 'Bia', email: 'ana@ex.com' }); } catch (e) { console.log('duplicidade:', e.code, e.codeName); }
const semEsquema = db.collection('livre');
await semEsquema.insertMany([{ a: 1 }, { a: 'texto', b: [1, 2] }, { c: { d: true } }]);
console.log('coleção sem esquema aceitou 3 formas diferentes:', await semEsquema.countDocuments());

console.log('\n== atualizações atômicas x ler-modificar-gravar (100 concorrentes)');
const cont = db.collection('contadores');
await cont.insertOne({ _id: 'a', n: 0 }); await cont.insertOne({ _id: 'b', n: 0 });
await Promise.all(Array.from({ length: 100 }, () => cont.updateOne({ _id: 'a' }, { $inc: { n: 1 } })));
await Promise.all(Array.from({ length: 100 }, async () => { const d = await cont.findOne({ _id: 'b' }); await cont.updateOne({ _id: 'b' }, { $set: { n: d.n + 1 } }); }));
console.log('$inc atômico:', (await cont.findOne({ _id: 'a' })).n, '| ler-modificar-gravar:', (await cont.findOne({ _id: 'b' })).n);

console.log('\n== limite de 16 MB e array ilimitado');
try { await db.collection('grande').insertOne({ _id: 1, comentarios: Array.from({ length: 20000 }, (_, i) => 'x'.repeat(1000) + i) }); }
catch (e) { console.log('documento de ~20 MB:', e.codeName || e.name, '|', e.message.slice(0, 90)); }
await cli.close();
