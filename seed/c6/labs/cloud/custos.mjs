// Modelo de custo com PREÇOS FICTÍCIOS (não são preços de nenhum provedor): compara VM fixa e serverless por volume.
const P = { vmMes: 25, reqPorMilhao: 0.30, gbSegundo: 0.00002, memGB: 0.5, duracaoS: 0.2 };
const serverless = (reqMes) => (reqMes / 1e6) * P.reqPorMilhao + reqMes * P.duracaoS * P.memGB * P.gbSegundo;
console.log('Preços fictícios:', JSON.stringify(P));
for (const r of [1e5, 1e6, 1e7, 5e7, 1e8, 2e8]) console.log(`  ${String(r).padStart(9)} req/mês  serverless=${serverless(r).toFixed(2).padStart(8)}  VM=${P.vmMes.toFixed(2)}  ${serverless(r) < P.vmMes ? 'serverless mais barato' : 'VM mais barata'}`);
const custoPorReq = serverless(1e6) / 1e6;
console.log('Ponto de equilíbrio (req/mês):', Math.round(P.vmMes / custoPorReq));
// Saída de dados (egress) fictícia: 0,08 por GB
const egress = (gb) => gb * 0.08;
console.log('Egress fictício de 5 TB/mês:', egress(5000).toFixed(2));
