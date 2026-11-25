import { fork } from 'node:child_process';
for (const modo of ['sem tratamento de SIGTERM', 'graceful', 'graceful + fechar ociosas após cada resposta']) {
  const filho = fork(new URL('./servidor-lento.mjs', import.meta.url), [modo === 'graceful' ? 'graceful' : modo.startsWith('graceful +') ? 'graceful-connection-close' : 'simples']);
  const msgs = []; filho.on('message', (m) => msgs.push(m));
  const port = await new Promise((ok) => filho.once('message', (m) => ok(m.port)));
  const t0 = performance.now();
  const req = fetch('http://127.0.0.1:' + port + '/lento').then(async (r) => 'status ' + r.status + ' ' + await r.text()).catch((e) => 'falhou: ' + (e.cause?.code || e.message));
  await new Promise((r) => setTimeout(r, 200));
  const fim = new Promise((ok) => filho.once('exit', (code, sig) => ok({ code, sig })));
  filho.kill('SIGTERM');
  const novo = await fetch('http://127.0.0.1:' + port + '/saude').then((r) => 'status ' + r.status).catch((e) => 'recusada: ' + (e.cause?.code || e.message));
  console.log(modo.padEnd(28), '| requisição em andamento:', await req, '| nova requisição após o SIGTERM:', novo, '| saída do processo:', JSON.stringify(await fim), '| em', (performance.now() - t0).toFixed(0), 'ms');
}
