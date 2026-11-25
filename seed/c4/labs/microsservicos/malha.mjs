import express from 'express';
import { execFileSync } from 'node:child_process';
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
let semente = 99; const rnd = () => (semente = (semente * 1664525 + 1013904223) % 4294967296) / 4294967296;
const sobe = (app, porta) => new Promise((ok) => { const s = app.listen(porta, '127.0.0.1', () => ok(s)); });
let chInstavel = 0, chLento = 0, chBom = 0, chRuim = 0;
const instavel = express(); instavel.get('/instavel', (req, res) => { chInstavel++; res.status(rnd() < 0.5 ? 503 : 200).end(); });
const lento = express(); lento.get('/lento', async (req, res) => { chLento++; await sleep(500); res.end('ok'); });
const bom = express(); bom.get('/par', (req, res) => { chBom++; res.end('bom'); });
const ruim = express(); ruim.get('/par', (req, res) => { chRuim++; res.status(503).end(); });
const srvs = [await sobe(instavel, 59201), await sobe(lento, 59202), await sobe(bom, 59203), await sobe(ruim, 59204)];
try { execFileSync('docker', ['rm', '-f', 'c4-envoy'], { stdio: 'ignore' }); } catch {}
execFileSync('docker', ['run', '-d', '--name', 'c4-envoy', '--network', 'host', '-v', new URL('./envoy/envoy.yaml', import.meta.url).pathname + ':/etc/envoy/envoy.yaml:ro', 'envoyproxy/envoy:v1.34-latest', '-c', '/etc/envoy/envoy.yaml', '--log-level', 'warn']);
for (let i = 0; i < 60; i++) { try { const r = await fetch('http://127.0.0.1:59901/ready'); if (r.ok) break; } catch {} await sleep(250); }
const versao = await (await fetch('http://127.0.0.1:59901/server_info')).json(); console.log('Envoy', versao.version.split('/')[1], '(contêiner oficial envoyproxy/envoy:v1.34-latest) como proxy sidecar didático | Node', process.version);
const stat = async (re) => { const t = await (await fetch('http://127.0.0.1:59901/stats')).text(); return Object.fromEntries(t.split('\n').filter((l) => re.test(l)).map((l) => l.split(': '))); };
const rajada = async (url, n, conc = 10) => { const codigos = {}; let i = 0; await Promise.all(Array.from({ length: conc }, async () => { while (i++ < n) { const r = await fetch(url).catch(() => ({ status: 0 })); codigos[r.status] = (codigos[r.status] ?? 0) + 1; await r.text?.().catch(() => {}); } })); return codigos; };

console.log('\n== 1. retentativas no sidecar: upstream que falha 50% das vezes');
let c = await rajada('http://127.0.0.1:59201/instavel', 500); const diretoOk = c[200] ?? 0;
console.log('direto ao serviço (500 requisições): sucesso =', (diretoOk / 5).toFixed(1) + '%');
const via = async (n, conc) => { chInstavel = 0; const cc = await rajada('http://127.0.0.1:59200/instavel', n, conc); const ok = cc[200] ?? 0; const st = await stat(/cluster\.instavel\.upstream_rq_retry(:|$)|cluster\.instavel\.upstream_rq_retry_overflow|cluster\.instavel\.upstream_rq_retry_success/); return { ok, chamadas: chInstavel, st }; };
let antes = await stat(/cluster\.instavel\.upstream_rq_retry(:|$)|cluster\.instavel\.upstream_rq_retry_overflow|cluster\.instavel\.upstream_rq_retry_success/);
let r1 = await via(400, 1);
console.log('via Envoy, requisições SEQUENCIAIS (400): sucesso =', (r1.ok / 4).toFixed(1) + '% | chamadas ao serviço:', r1.chamadas, '(≈', (r1.chamadas / 400).toFixed(2), 'por requisição) | teórico com 3 retentativas: ' + ((1 - 0.5 ** 4) * 100).toFixed(2) + '%');
console.log('   retentativas acumuladas no Envoy:', JSON.stringify(r1.st));
let r2 = await via(500, 10);
console.log('via Envoy, 10 requisições SIMULTÂNEAS (500): sucesso =', (r2.ok / 5).toFixed(1) + '% | chamadas ao serviço:', r2.chamadas, '(≈', (r2.chamadas / 500).toFixed(2), 'por requisição)');
console.log('   estatísticas acumuladas:', JSON.stringify(r2.st), '→ o disjuntor padrão do cluster limita as retentativas simultâneas (max_retries = 3): o excedente é recusado (upstream_rq_retry_overflow)');

console.log('\n== 2. timeout por tentativa: upstream que responde em 500 ms (per_try_timeout 0,2 s, 2 retentativas)');
const t0 = performance.now(); const r = await fetch('http://127.0.0.1:59200/lento'); await r.text(); console.log('resposta:', r.status, '| tempo total:', (performance.now() - t0).toFixed(0), 'ms | chamadas que chegaram ao serviço:', chLento, '(o upstream continua trabalhando nas tentativas canceladas)');
const st2 = await stat(/cluster\.lento\.upstream_rq_timeout|cluster\.lento\.upstream_rq_per_try_timeout/); console.log('estatísticas:', JSON.stringify(st2));

console.log('\n== 3. detecção de outliers: dois instâncias, uma sempre falha (consecutive_5xx 3)');
const janelas = []; for (let j = 0; j < 4; j++) { chBom = chRuim = 0; const cc = await rajada('http://127.0.0.1:59200/par', 100, 5); janelas.push({ janela: j + 1, sucesso: cc[200] ?? 0, erros503: cc[503] ?? 0, chamadasInstanciaBoa: chBom, chamadasInstanciaRuim: chRuim }); await sleep(700); }
for (const j of janelas) console.log('janela', j.janela, '(100 requisições): 200 =', j.sucesso, '| 503 =', j.erros503, '| instância boa recebeu', j.chamadasInstanciaBoa, '| instância ruim recebeu', j.chamadasInstanciaRuim);
console.log('estatísticas:', JSON.stringify(await stat(/cluster\.par\.outlier_detection\.(ejections_active|ejections_enforced_total|ejections_consecutive_5xx|ejections_detected_consecutive_5xx)/)));
srvs.forEach((s) => s.close()); execFileSync('docker', ['rm', '-f', 'c4-envoy'], { stdio: 'ignore' });
