function traduzirPagamento(respostaGateway) {
  const mapaStatus = { approved: 'APROVADO', declined: 'RECUSADO', pending: 'PENDENTE' };
  return { pedidoId: respostaGateway.order_ref, status: mapaStatus[respostaGateway.status] ?? 'DESCONHECIDO', valorCentavos: Math.round(respostaGateway.amount * 100) };
}
console.log(traduzirPagamento({ order_ref: 'P1', status: 'approved', amount: 25.5 }));
const itens = [
  { id: 'R1', nome: 'Pagamento com Pix', valor: 9, esforco: 5, risco: 2, prazoLegal: false },
  { id: 'R2', nome: 'Cupom de desconto', valor: 6, esforco: 3, risco: 1, prazoLegal: false },
  { id: 'R3', nome: 'Exclusão de dados (LGPD)', valor: 5, esforco: 4, risco: 3, prazoLegal: true },
  { id: 'R4', nome: 'Tema escuro', valor: 2, esforco: 2, risco: 1, prazoLegal: false }
];
const pontos = (i) => +((i.valor / i.esforco) * (i.prazoLegal ? 2 : 1) - i.risco * 0.1).toFixed(2);
console.log(itens.map((i) => ({ id: i.id, nome: i.nome, pontos: pontos(i) })).sort((a, b) => b.pontos - a.pontos));
function checarMoscow(itensComClasse, limite = 0.6) {
  const total = itensComClasse.reduce((s, i) => s + i.esforco, 0);
  const must = itensComClasse.filter((i) => i.classe === 'M').reduce((s, i) => s + i.esforco, 0);
  return { proporcaoMust: +(must / total).toFixed(2), ok: must / total <= limite };
}
console.log(checarMoscow([{ esforco: 5, classe: 'M' }, { esforco: 4, classe: 'M' }, { esforco: 3, classe: 'S' }, { esforco: 2, classe: 'C' }]));
