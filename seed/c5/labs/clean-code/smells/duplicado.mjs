// Smell: código duplicado (copia e cola) — três relatórios que só diferem no campo somado.
export function totalVendas(pedidos) {
  let total = 0;
  for (const p of pedidos) {
    if (p.status === 'pago') {
      total += p.valor;
    }
  }
  return Math.round(total * 100) / 100;
}
export function totalFretes(pedidos) {
  let total = 0;
  for (const p of pedidos) {
    if (p.status === 'pago') {
      total += p.frete;
    }
  }
  return Math.round(total * 100) / 100;
}
export function totalImpostos(pedidos) {
  let total = 0;
  for (const p of pedidos) {
    if (p.status === 'pago') {
      total += p.imposto;
    }
  }
  return Math.round(total * 100) / 100;
}
