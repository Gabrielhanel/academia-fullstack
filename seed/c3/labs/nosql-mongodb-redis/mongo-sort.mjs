import { MongoClient } from 'mongodb';
const cli = new MongoClient('mongodb://127.0.0.1:57017', { directConnection: true }); await cli.connect();
const ped = cli.db('lab').collection('pedidos');
const estagios = (n) => { const out = []; (function f(x) { if (!x) return; out.push(x.stage); f(x.inputStage); (x.inputStages || []).forEach(f); })(n); return out; };
for (const [rot, filtro, ordem] of [['status + ordem por criado desc (índice composto)', { status: 'pago' }, { criado: -1 }], ['status + ordem por valor (sem índice para a ordem)', { status: 'pago' }, { valor: 1 }]]) {
  const e = await ped.find(filtro).sort(ordem).explain('executionStats');
  console.log(rot + ':', estagios(e.queryPlanner.winningPlan).join(' > '), '| examinados', e.executionStats.totalDocsExamined, '| retornados', e.executionStats.nReturned);
}
await cli.close();
