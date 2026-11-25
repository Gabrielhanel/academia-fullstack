import { MongoClient } from 'mongodb';
const cli = new MongoClient('mongodb://127.0.0.1:57017', { directConnection: true });
await cli.connect(); const db = cli.db('lab');
for (const n of [15000, 15500]) {
  try { await db.collection('grande').deleteMany({}); await db.collection('grande').insertOne({ comentarios: Array.from({ length: n }, (_, i) => 'x'.repeat(1100) + i) }); console.log(n + ' comentários (~' + (n * 1104 / 1e6).toFixed(2) + ' MB, limite do servidor = 16.777.216 bytes): inseriu'); }
  catch (e) { console.log(n + ' comentários (~' + (n * 1104 / 1e6).toFixed(2) + ' MB): ERRO', e.codeName || e.name, '| código', e.code, '|', String(e.message).slice(0, 120)); }
}
await cli.close();
