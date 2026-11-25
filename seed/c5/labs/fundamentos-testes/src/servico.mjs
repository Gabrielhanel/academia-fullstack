// Serviço de aplicação: orquestra regras, repositório, pagamento e notificação (dependências injetadas).
import { calcularTotal, validarCupom } from './dominio.mjs';
export class ServicoPedidos {
  constructor({ repo, pagamento, notificador, relogio }) { Object.assign(this, { repo, pagamento, notificador, relogio }); }
  async criar({ cliente, itens, cupom }) {
    const hoje = this.relogio().toISOString().slice(0, 10);
    let desconto = 0;
    if (cupom) { const c = validarCupom(cupom, hoje); if (!c.valido) throw new Error(c.motivo); desconto = c.desconto; }
    const total = calcularTotal(itens, { desconto });
    const id = this.repo.salvar({ cliente, itens, total, criadoEm: this.relogio().toISOString() });
    const cobranca = await this.pagamento.cobrar({ pedidoId: id, valor: total });
    if (!cobranca.aprovado) return { id, status: 'novo', total, motivo: 'pagamento recusado' };
    this.repo.marcarPago(id);
    await this.notificador.enviar(cliente, 'Pedido ' + id + ' pago: R$ ' + total.toFixed(2));
    return { id, status: 'pago', total };
  }
}
