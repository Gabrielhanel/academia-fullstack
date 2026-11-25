import { MongoClient } from 'mongodb';
async function tentar(uri, rotulo) {
  const cli = new MongoClient(uri, { directConnection: true });
  await cli.connect();
  const db = cli.db('lab'); const contas = db.collection('contas');
  try { await db.createCollection('contas'); } catch {}
  await contas.deleteMany({}); await contas.insertMany([{ _id: 'ana', saldo: 100 }, { _id: 'bruno', saldo: 50 }]);
  const s = cli.startSession();
  try {
    await s.withTransaction(async () => {
      await contas.updateOne({ _id: 'bruno' }, { $inc: { saldo: 70 } }, { session: s });
      await contas.updateOne({ _id: 'ana' }, { $inc: { saldo: -70 } }, { session: s });
    });
    console.log(rotulo + ': transação confirmada ->', JSON.stringify(await contas.find().sort({ _id: 1 }).toArray()));
  } catch (e) { console.log(rotulo + ': erro:', e.codeName || e.name, '|', String(e.message).slice(0, 100)); }
  // aborto
  const s2 = cli.startSession();
  try {
    await s2.withTransaction(async () => {
      await contas.updateOne({ _id: 'bruno' }, { $inc: { saldo: 1000 } }, { session: s2 });
      throw new Error('falha de negócio');
    });
  } catch (e) { console.log(rotulo + ': abortada:', e.message, '| saldo do bruno:', (await contas.findOne({ _id: 'bruno' }))?.saldo); }
  // atomicidade de um documento sem transação
  await contas.updateOne({ _id: 'ana' }, { $inc: { saldo: -10 }, $set: { atualizado: true } });
  console.log(rotulo + ': atualização de um documento é atômica ->', JSON.stringify(await contas.findOne({ _id: 'ana' })));
  await cli.close();
}
await tentar('mongodb://127.0.0.1:57017', 'standalone');
await tentar('mongodb://127.0.0.1:57018', 'replica set');
