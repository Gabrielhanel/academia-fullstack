// Modelo serverless local: cold start x warm, e idempotência com entrega "pelo menos uma vez".
// Não é a AWS Lambda: o "cold start" aqui é uma inicialização simulada (carga de CPU) do módulo.
import { performance } from 'node:perf_hooks';
function inicializar() { let x = 0; for (let i = 0; i < 4e7; i++) x += i % 7; return { pronto: true, x }; }
let ambiente = null;
async function invocar(evento) {
  const t0 = performance.now();
  let frio = false;
  if (!ambiente) { ambiente = inicializar(); frio = true; }
  const resultado = { ok: true, id: evento.id };
  return { frio, ms: +(performance.now() - t0).toFixed(3), resultado };
}
const r = [];
for (let i = 0; i < 6; i++) r.push(await invocar({ id: i }));
console.log('Invocações sequenciais no mesmo ambiente:');
r.forEach((x, i) => console.log(`  #${i + 1} ${x.frio ? 'FRIA ' : 'quente'} ${x.ms} ms`));
ambiente = null; // ambiente reciclado (escala a zero)
const novo = await invocar({ id: 99 });
console.log('Após reciclar o ambiente:', novo.frio ? 'FRIA' : 'quente', novo.ms, 'ms');

// Idempotência: a mesma mensagem entregue 3 vezes (retentativa) deve ter um único efeito.
const processados = new Set(); let saldo = 100;
function debitar(msg) { if (processados.has(msg.id)) return 'duplicada-ignorada'; processados.add(msg.id); saldo -= msg.valor; return 'processada'; }
const msg = { id: 'pedido-1', valor: 30 };
console.log('Entrega x3 com chave de idempotência:', [debitar(msg), debitar(msg), debitar(msg)].join(', '), '| saldo =', saldo);
let saldo2 = 100; const semChave = (m) => { saldo2 -= m.valor; };
semChave(msg); semChave(msg); semChave(msg);
console.log('Entrega x3 SEM chave de idempotência: saldo =', saldo2);
