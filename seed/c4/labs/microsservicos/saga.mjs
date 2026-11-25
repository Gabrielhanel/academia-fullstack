// Sagas com orquestração: transações locais, compensações idempotentes e retomada após queda do orquestrador.
let semente = 12345; const rnd = () => (semente = (semente * 1664525 + 1013904223) % 4294967296) / 4294967296;
const N = 2000, P_ESTOQUE = 0.10, P_COBRANCA = 0.15, P_QUEDA = 0.03;
const novoMundo = () => ({ estoque: { reservas: new Map(), efeitos: 0 }, pagamentos: { cobrados: new Map(), estornados: new Set(), efeitos: 0 }, pedidos: new Map() });
// serviços (cada um com suas transações LOCAIS e idempotentes por pedidoId)
const servicos = (m, falhas) => ({
  reservar: (id) => { if (falhas.estoque.has(id)) throw new Error('sem estoque'); if (!m.estoque.reservas.has(id)) { m.estoque.reservas.set(id, 1); m.estoque.efeitos++; } },
  liberar: (id) => { if (m.estoque.reservas.delete(id)) m.estoque.efeitos++; },
  cobrar: (id) => { if (falhas.cobranca.has(id)) throw new Error('cartão recusado'); if (!m.pagamentos.cobrados.has(id)) { m.pagamentos.cobrados.set(id, 1); m.pagamentos.efeitos++; } },
  estornar: (id) => { if (m.pagamentos.cobrados.has(id) && !m.pagamentos.estornados.has(id)) { m.pagamentos.estornados.add(id); m.pagamentos.efeitos++; } }
});
const sorteia = () => { const f = { estoque: new Set(), cobranca: new Set() }; for (let i = 1; i <= N; i++) { if (rnd() < P_ESTOQUE) f.estoque.add(i); if (rnd() < P_COBRANCA) f.cobranca.add(i); } return f; };
const falhas = sorteia();
const invariantes = (m) => { let confirmadosSemReserva = 0, confirmadosSemCobranca = 0, canceladosComReserva = 0, canceladosCobradosSemEstorno = 0, pendentes = 0;
  for (const [id, st] of m.pedidos) { const reserva = m.estoque.reservas.has(id), cobrado = m.pagamentos.cobrados.has(id) && !m.pagamentos.estornados.has(id);
    if (st === 'CONFIRMADO') { if (!reserva) confirmadosSemReserva++; if (!cobrado) confirmadosSemCobranca++; }
    else if (st === 'CANCELADO') { if (reserva) canceladosComReserva++; if (cobrado) canceladosCobradosSemEstorno++; } else pendentes++; }
  const confirmados = [...m.pedidos.values()].filter((s) => s === 'CONFIRMADO').length, cancelados = [...m.pedidos.values()].filter((s) => s === 'CANCELADO').length;
  return { confirmados, cancelados, pendentes, confirmadosSemReserva, confirmadosSemCobranca, canceladosComReserva, canceladosCobradosSemEstorno }; };
console.log('N =', N, 'pedidos | falhas injetadas: estoque', falhas.estoque.size, '| cobrança', falhas.cobranca.size, '(sorteio determinístico)');

console.log('\n== 1. sem saga: executa os passos em sequência e, se um falha, só marca o pedido como erro');
{ const m = novoMundo(); const s = servicos(m, falhas);
  for (let id = 1; id <= N; id++) { m.pedidos.set(id, 'PENDENTE'); try { s.reservar(id); s.cobrar(id); m.pedidos.set(id, 'CONFIRMADO'); } catch { m.pedidos.set(id, 'CANCELADO'); } }
  console.log(JSON.stringify(invariantes(m))); }

{ const m = novoMundo(); const s = servicos(m, falhas);
  for (let id = 1; id <= N; id++) { m.pedidos.set(id, 'PENDENTE'); try { s.cobrar(id); s.reservar(id); m.pedidos.set(id, 'CONFIRMADO'); } catch { m.pedidos.set(id, 'CANCELADO'); } }
  console.log('(ordem invertida: cobrar antes de reservar)', JSON.stringify(invariantes(m))); }

console.log('\n== 2. saga orquestrada com compensações (sem quedas)');
const executaSaga = (m, s, id, log, quedaApos = null) => {
  const passos = [
    { nome: 'reservar', fazer: () => s.reservar(id), compensar: () => s.liberar(id) },
    { nome: 'cobrar', fazer: () => s.cobrar(id), compensar: () => s.estornar(id) },
    { nome: 'confirmar', fazer: () => m.pedidos.set(id, 'CONFIRMADO'), compensar: () => {} }
  ];
  const feitos = log.get(id)?.feitos ?? []; log.set(id, { feitos, estado: 'EM_ANDAMENTO' }); m.pedidos.set(id, m.pedidos.get(id) ?? 'PENDENTE');
  try {
    for (let i = 0; i < passos.length; i++) {
      if (feitos.includes(passos[i].nome)) continue;               // retomada: não refaz o que o log diz que foi feito
      passos[i].fazer(); feitos.push(passos[i].nome);
      if (quedaApos === passos[i].nome) throw Object.assign(new Error('queda do orquestrador'), { queda: true });
    }
    log.get(id).estado = 'CONCLUIDA';
  } catch (e) {
    if (e.queda) throw e;
    for (const p of [...passos].reverse()) if (feitos.includes(p.nome)) p.compensar();      // compensa em ordem inversa
    m.pedidos.set(id, 'CANCELADO'); log.get(id).estado = 'COMPENSADA';
  }
};
{ const m = novoMundo(); const s = servicos(m, falhas); const log = new Map(); for (let id = 1; id <= N; id++) executaSaga(m, s, id, log);
  console.log(JSON.stringify(invariantes(m))); console.log('efeitos aplicados: estoque', m.estoque.efeitos, '| pagamentos', m.pagamentos.efeitos); }

console.log('\n== 3. saga com quedas do orquestrador (3% dos pedidos caem após um passo) e retomada pelo log, com os passos idempotentes');
{ const m = novoMundo(); const s = servicos(m, falhas); const log = new Map(); let quedas = 0, retomadas = 0;
  for (let id = 1; id <= N; id++) {
    const queda = rnd() < P_QUEDA ? ['reservar', 'cobrar'][Math.floor(rnd() * 2)] : null;
    try { executaSaga(m, s, id, log, queda); } catch (e) { if (!e.queda) throw e; quedas++; executaSaga(m, s, id, log); retomadas++; }   // o orquestrador reinicia e retoma do log
  }
  console.log('quedas:', quedas, '| retomadas:', retomadas, '|', JSON.stringify(invariantes(m)));
  console.log('estados finais das sagas no log:', JSON.stringify([...log.values()].reduce((a, l) => (a[l.estado] = (a[l.estado] ?? 0) + 1, a), {}))); }

console.log('\n== 4. compensação idempotente: executar a compensação duas vezes não estorna duas vezes');
{ const m = novoMundo(); const s = servicos(m, { estoque: new Set(), cobranca: new Set() }); s.cobrar(1); s.estornar(1); s.estornar(1); s.liberar(1); s.liberar(1);
  console.log('efeitos de pagamento após cobrar + estornar x2:', m.pagamentos.efeitos, '(2 = cobrar e um estorno) | efeitos de estoque após liberar x2 sem reserva:', m.estoque.efeitos); }
