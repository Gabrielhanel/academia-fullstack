// Versão refatorada: mesmo comportamento observável, em funções pequenas com nomes de domínio.
const LIMITE_DESCONTO_FIXO = 500;
const DESCONTO_FIXO = 25;
const LIMITE_FRETE_GRATIS = 1000;
const FRETE_POR_UF = { SP: 10, RJ: 15 };
const FRETE_PADRAO = 30;
const FATOR_POR_PERFIL = { 1: 0.9, 2: 0.8 };
const FATOR_SEM_DESCONTO = 1;

const arredondar = (v) => Math.round(v * 100) / 100;

export function subtotalDosItens(itens, perfil) {
  const fator = FATOR_POR_PERFIL[String(perfil)] ?? FATOR_SEM_DESCONTO;
  return itens.filter((i) => i.q > 0).reduce((soma, i) => soma + i.p * i.q * fator, 0);
}

export function aplicarDescontoFixo(valor) {
  return valor > LIMITE_DESCONTO_FIXO ? valor - DESCONTO_FIXO : valor;
}

export function calcularFrete(valor, uf) {
  if (valor > LIMITE_FRETE_GRATIS) return 0;
  return FRETE_POR_UF[uf] ?? FRETE_PADRAO;
}

export function calcularTotal({ itens, perfil, comFrete, uf, cupom }) {
  if (!itens || itens.length === 0) return 0;
  const comDesconto = aplicarDescontoFixo(subtotalDosItens(itens, perfil));
  const comEntrega = comDesconto + (comFrete === true ? calcularFrete(comDesconto, uf) : 0);
  const aposCupom = comEntrega - (cupom || 0);
  return arredondar(Math.max(aposCupom, 0));
}

// Adaptador com a assinatura antiga, para que os chamadores migrem aos poucos.
export const proc = (d, t, f, c, x) => calcularTotal({ itens: d, perfil: t, comFrete: f, uf: c, cupom: x });
