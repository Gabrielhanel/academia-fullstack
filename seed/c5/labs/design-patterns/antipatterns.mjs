// Anti-patterns didáticos: God Object (muitas dependências) x responsabilidade separada (função pura).
export class PedidoGod {
  constructor(deps) { this.deps = deps; this.dependenciasExigidas = Object.keys(deps).length; }
  descontoDoCliente(cliente, total) { return cliente.vip && total > 100 ? total * 0.1 : 0; }
  fechar(pedido) { this.deps.estoque.reservar(pedido); this.deps.pagamento.cobrar(pedido); this.deps.repo.salvar(pedido); this.deps.email.enviar(pedido); this.deps.logger.log(pedido); return this.deps.relogio(); }
}
export const descontoDoCliente = (cliente, total) => (cliente.vip && total > 100 ? total * 0.1 : 0);
// Callback hell x async/await
export const lerEmCadeia = (ler, cb) => ler('a', (e1, a) => { if (e1) return cb(e1); ler('b', (e2, b) => { if (e2) return cb(e2); ler('c', (e3, c) => { if (e3) return cb(e3); cb(null, [a, b, c]); }); }); });
export const lerComAwait = async (ler) => [await ler('a'), await ler('b'), await ler('c')];
