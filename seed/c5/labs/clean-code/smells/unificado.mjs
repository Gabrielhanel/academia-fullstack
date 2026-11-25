// Refatoração "extrair função": um só lugar para a regra (somar só pedidos pagos, arredondar em centavos).
export const somarPagos = (pedidos, campo) => Math.round(pedidos.filter((p) => p.status === 'pago').reduce((t, p) => t + p[campo], 0) * 100) / 100;
export const totalVendas = (pedidos) => somarPagos(pedidos, 'valor');
export const totalFretes = (pedidos) => somarPagos(pedidos, 'frete');
export const totalImpostos = (pedidos) => somarPagos(pedidos, 'imposto');
