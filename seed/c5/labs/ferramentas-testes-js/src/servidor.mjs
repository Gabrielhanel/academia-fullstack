// Servidor HTTP mínimo (node:http) com API e uma página para o teste E2E.
import { createServer } from 'node:http';
import { ServicoPedidos } from './servico.mjs';
import { RepositorioPedidos } from './repositorio.mjs';
const PAGINA = `<!doctype html><meta charset="utf-8"><title>Loja</title>
<h1>Nova compra</h1>
<label>Cliente <input id="cliente" value="ana"></label>
<label>SKU <input id="sku" value="A1"></label>
<label>Qtd <input id="qtd" type="number" value="2"></label>
<label>Cupom <input id="cupom"></label>
<button id="comprar">Comprar</button>
<p id="resultado" role="status"></p>
<script>
document.getElementById('comprar').onclick = async () => {
  const r = await fetch('/pedidos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cliente: cliente.value, itens: [{ sku: sku.value, qtd: Number(qtd.value), preco: 10 }], cupom: cupom.value || undefined }) });
  const j = await r.json();
  await new Promise((res) => setTimeout(res, Number(new URLSearchParams(location.search).get('atraso') || 0)));
  resultado.textContent = r.ok ? 'Pedido ' + j.id + ' ' + j.status + ': R$ ' + j.total.toFixed(2) : 'Erro: ' + j.erro;
};
</script>`;
export function criarServidor({ pagamento = { cobrar: async () => ({ aprovado: true }) }, notificador = { enviar: async () => {} }, relogio = () => new Date(), repo = new RepositorioPedidos() } = {}) {
  const servico = new ServicoPedidos({ repo, pagamento, notificador, relogio });
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const json = (status, corpo) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(corpo)); };
    try {
      if (req.method === 'GET' && url.pathname === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(PAGINA); }
      if (req.method === 'POST' && url.pathname === '/pedidos') {
        let corpo = ''; for await (const c of req) corpo += c;
        return json(201, await servico.criar(JSON.parse(corpo)));
      }
      const m = /^\/pedidos\/(\d+)$/.exec(url.pathname);
      if (req.method === 'GET' && m) { const p = repo.buscar(Number(m[1])); return p ? json(200, p) : json(404, { erro: 'pedido não encontrado' }); }
      return json(404, { erro: 'rota inexistente' });
    } catch (e) { return json(422, { erro: e.message }); }
  });
  return { server, servico, repo, ouvir: () => new Promise((r) => server.listen(0, '127.0.0.1', () => r(server.address().port))), fechar: () => new Promise((r) => server.close(r)) };
}
