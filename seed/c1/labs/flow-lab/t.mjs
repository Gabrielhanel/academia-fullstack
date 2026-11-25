import { createHash } from 'node:crypto';
const flags = { checkout_v2: { ligada: true, percentual: 25, permitidos: ['ana@empresa.com'] } };
const balde = (flag, usuario) => createHash('sha256').update(flag + ':' + usuario).digest().readUInt32BE(0) % 100;
function ativa(nome, usuario) {
  const f = flags[nome];
  if (!f || !f.ligada) return false;
  if (f.permitidos?.includes(usuario)) return true;
  return balde(nome, usuario) < f.percentual;
}
const usuarios = Array.from({ length: 1000 }, (_, i) => 'u' + i);
const ligados = usuarios.filter((u) => ativa('checkout_v2', u)).length;
console.log(ativa('checkout_v2', 'ana@empresa.com'), ativa('checkout_v2', 'u1') === ativa('checkout_v2', 'u1'), ligados);
flags.checkout_v2.ligada = false;
console.log(usuarios.filter((u) => ativa('checkout_v2', u)).length);
const backlog = [
  { id: 'PIX-1', titulo: 'Gerar QR Code', pontos: 5 }, { id: 'PIX-2', titulo: 'Webhook de confirmação', pontos: 8 }, { id: 'PIX-3', titulo: 'Status do pedido', pontos: 3 }, { id: 'PIX-4', titulo: 'Reembolso', pontos: 8 }, { id: 'DOC-1', titulo: 'Documentar a API', pontos: 2 }
];
const velocidades = [21, 18, 24, 20, 17];
const media = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const capacidade = Math.floor(media(velocidades.slice(-3)));
let usados = 0; const sprint = [];
for (const item of backlog) { if (usados + item.pontos <= capacidade) { sprint.push(item.id); usados += item.pontos; } }
console.log(capacidade, sprint, usados);
const pert = (o, m, p) => ({ esperado: +((o + 4 * m + p) / 6).toFixed(2), desvio: +((p - o) / 6).toFixed(2) });
const t1 = pert(2, 4, 12), t2 = pert(3, 5, 7); console.log(t1, t2);
const soma = (ts) => ({ esperado: ts.reduce((s, t) => s + t.esperado, 0), desvio: +Math.sqrt(ts.reduce((s, t) => s + t.desvio ** 2, 0)).toFixed(2) });
const total = soma([t1, t2]); console.log(total, total.esperado - total.desvio, total.esperado + total.desvio, media(velocidades), media(velocidades.slice(-3)).toFixed(1));
