const VAGAS = ['rápido', 'rápida', 'fácil', 'amigável', 'robusto', 'flexível', 'eficiente', 'seguro', 'adequado', 'etc'];
function revisarRequisito(texto) {
  const problemas = [];
  const t = texto.toLowerCase();
  const vagas = VAGAS.filter((p) => new RegExp('\\b' + p + '\\b', 'i').test(t));
  if (vagas.length) problemas.push('termos vagos: ' + vagas.join(', '));
  if (!/\b(deve|devem)\b/.test(t)) problemas.push('sem "deve"');
  if (/\be\b.*\b(deve|devem)\b|\bdeve\b.*\be\b.*\bdeve\b/.test(t)) problemas.push('possível mais de uma ideia');
  if (!/\d/.test(t)) problemas.push('sem número ou limite verificável');
  return problemas;
}
console.log(revisarRequisito('O sistema deve ser rápido e seguro.'));
console.log(revisarRequisito('O sistema deve responder a 95 % das buscas em até 300 ms com 500 usuários simultâneos.'));
const historia = { id: 'US-042', como: 'cliente da loja', quero: 'acompanhar o status do meu pedido', para: 'saber quando devo estar em casa para receber', pontos: 3, criterios: [ { dado: 'um pedido enviado há 2 dias', quando: 'abro "Meus pedidos"', entao: 'vejo o status "Enviado" e o código de rastreio' }, { dado: 'um pedido de outro cliente', quando: 'tento abri-lo', entao: 'recebo "pedido não encontrado"' } ] };
function revisarHistoria(h, maxPontos = 5) {
  const p = [];
  if (!h.como || !h.quero || !h.para) p.push('faltam como/quero/para');
  if (!h.criterios || h.criterios.length < 2) p.push('menos de 2 critérios (testável)');
  else if (h.criterios.some((c) => !c.dado || !c.quando || !c.entao)) p.push('critério incompleto');
  if (!(h.pontos > 0)) p.push('sem estimativa');
  else if (h.pontos > maxPontos) p.push('grande demais: dividir');
  return p;
}
console.log(revisarHistoria(historia));
console.log(revisarHistoria({ ...historia, pontos: 13, criterios: [] }));
const notas = [
  { tipo: 'ator', nome: 'Cliente' },
  { tipo: 'comando', nome: 'Realizar pedido', ator: 'Cliente', causa: ['Pedido realizado'] },
  { tipo: 'evento', nome: 'Pedido realizado' },
  { tipo: 'politica', nome: 'Solicitar pagamento', quando: 'Pedido realizado', dispara: 'Cobrar pagamento' },
  { tipo: 'comando', nome: 'Cobrar pagamento', ator: null, causa: ['Pagamento aprovado', 'Pagamento recusado'] },
  { tipo: 'evento', nome: 'Pagamento aprovado' },
  { tipo: 'evento', nome: 'Pagamento recusado' },
  { tipo: 'evento', nome: 'Estoque reservado' }
];
function lacunas(notas) {
  const eventos = notas.filter((n) => n.tipo === 'evento').map((n) => n.nome);
  const comEvento = new Set(notas.filter((n) => n.tipo === 'comando').flatMap((n) => n.causa));
  const disparados = new Set(notas.filter((n) => n.tipo === 'politica').map((n) => n.dispara));
  return {
    eventosSemCausa: eventos.filter((e) => !comEvento.has(e)),
    comandosSemOrigem: notas.filter((n) => n.tipo === 'comando' && !n.ator && !disparados.has(n.nome)).map((n) => n.nome)
  };
}
console.log(lacunas(notas));
