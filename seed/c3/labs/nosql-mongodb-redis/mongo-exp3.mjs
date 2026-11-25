import { MongoClient } from 'mongodb';
const cli = new MongoClient('mongodb://127.0.0.1:57017', { directConnection: true });
await cli.connect();
const db = cli.db('lab'); const ped = db.collection('pedidos');
const med = async (rotulo, fn, reps = 7) => { await fn(); const t = []; for (let i = 0; i < reps; i++) { const t0 = performance.now(); await fn(); t.push(performance.now() - t0); } t.sort((a, b) => a - b); console.log(rotulo.padEnd(62), 'mediana ms:', t[Math.floor(reps / 2)].toFixed(1)); };
console.log('== limite de 16 MiB (servidor)');
for (const n of [14000, 16000]) {
  try { await db.collection('grande').deleteMany({}); await db.collection('grande').insertOne({ comentarios: Array.from({ length: n }, (_, i) => 'x'.repeat(1100) + i) }); console.log(n + ' comentários de ~1,1 KB (~' + (n * 1.1 / 1000).toFixed(1) + ' MB): inseriu'); }
  catch (e) { console.log(n + ' comentários (~' + (n * 1.1 / 1000).toFixed(1) + ' MB): ERRO', e.codeName || e.name, '| código', e.code, '|', String(e.message).slice(0, 100)); }
}
console.log('\n== $match antes de $group (índice em status+criado)');
const plano = async (pipeline) => { const e = await db.command({ explain: { aggregate: 'pedidos', pipeline, cursor: {} }, verbosity: 'executionStats' }); const s = JSON.stringify(e); return { IXSCAN: /IXSCAN/.test(s), COLLSCAN: /COLLSCAN/.test(s), docsExaminados: (s.match(/"totalDocsExamined":(\d+)/) || [])[1] }; };
console.log('$match + $count:', JSON.stringify(await plano([{ $match: { status: 'pago' } }, { $count: 'n' }])));
console.log('$group + $match:', JSON.stringify(await plano([{ $group: { _id: '$status', n: { $sum: 1 } } }, { $match: { _id: 'pago' } }])));
await med('$match status=pago, $group por clienteId (índice)', () => ped.aggregate([{ $match: { status: 'pago' } }, { $group: { _id: '$clienteId', n: { $sum: 1 } } }, { $count: 'clientes' }]).toArray());
await med('$group por clienteId, depois $match status (sem filtrar antes)', () => ped.aggregate([{ $group: { _id: { c: '$clienteId', s: '$status' }, n: { $sum: 1 } } }, { $match: { '_id.s': 'pago' } }, { $count: 'clientes' }]).toArray());
await cli.close();
