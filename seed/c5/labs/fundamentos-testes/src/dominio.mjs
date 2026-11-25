// Regras puras do domínio de pedidos.
export const arredondar = (v) => Math.round(v * 100) / 100;
export function calcularTotal(itens, { desconto = 0 } = {}) {
  if (!Array.isArray(itens) || itens.length === 0) throw new Error('pedido sem itens');
  let bruto = 0;
  for (const i of itens) {
    if (!Number.isFinite(i.preco) || i.preco < 0) throw new Error('preço inválido: ' + i.sku);
    if (!Number.isInteger(i.qtd) || i.qtd < 1) throw new Error('quantidade inválida: ' + i.sku);
    bruto += i.preco * i.qtd;
  }
  const d = Math.min(Math.max(desconto, 0), 1);
  return arredondar(bruto * (1 - d));
}
export function validarCupom(codigo, hoje) {
  const regras = { BEMVINDO10: { pct: 0.1, ate: '2026-12-31' }, NATAL20: { pct: 0.2, ate: '2026-12-25' } };
  const r = regras[String(codigo || '').toUpperCase()];
  if (!r) return { valido: false, motivo: 'cupom desconhecido' };
  if (hoje > r.ate) return { valido: false, motivo: 'cupom expirado' };
  return { valido: true, desconto: r.pct };
}
