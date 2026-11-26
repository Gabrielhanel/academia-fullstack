// Verificações em Chrome real (puppeteer-core): XSS executa?, cookie visível?, CSRF same-site x cross-site, leitura via CORS.
// Uso: PUPPETEER_PATH=<caminho do puppeteer-core> node navegador.mjs   (somente 127.0.0.1/localhost; servidores efêmeros)
import http from 'node:http';
import { criarWeb, iniciar } from './web.mjs';
const { default: puppeteer } = await import(process.env.PUPPETEER_PATH || 'puppeteer-core');
const V = criarWeb({ seguro: false }), S = criarWeb({ seguro: true });
await iniciar(V); await iniciar(S);
const porta = (a) => a.server.address().port;
const hostLocal = (a) => 'http://localhost:' + porta(a);   // origem "da vítima" (cookies por host, sem porta)
S.origens = [hostLocal(S)];
// servidor do atacante (páginas estáticas que usam ?alvo=)
const A = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); const alvo = u.searchParams.get('alvo');
  res.writeHead(200, { 'content-type': 'text/html' });
  if (u.pathname === '/csrf.html') res.end(`<form id=f method=POST action="${alvo}/transferir"><input name=para value=2><input name=valor value=100></form><script>f.submit()</script>`);
  else res.end(`<title>aguardando</title><script>fetch("${alvo}/api/saldo",{credentials:"include"}).then(r=>r.text()).then(t=>document.title="LIDO:"+t).catch(e=>document.title="BLOQUEADO")</script>`);
});
await new Promise((r) => A.listen(0, '127.0.0.1', r)); const pa = A.address().port;
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
console.log('Chrome:', await b.version());
const novaPagina = async () => { const c = await b.createBrowserContext(); const p = await c.newPage(); p.dialogs = 0; p.on('dialog', async (d) => { p.dialogs++; await d.dismiss(); }); return { p, c }; };
const saldo = (a) => a.db.prepare('select saldo from contas where usuario_id=1').get().saldo;
const logar = async (p, a) => { await p.goto(hostLocal(a) + '/saude'); return p.evaluate(async () => { const r = await fetch('/login', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'ana@exemplo.test', senha: 'ana-senha-1' }) }); return r.json(); }); };

// 1) XSS refletido e armazenado
for (const [nome, a] of [['vulnerável', V], ['corrigida', S]]) {
  const { p, c } = await novaPagina();
  await p.goto(hostLocal(a) + '/ola?nome=' + encodeURIComponent('<script>alert(1)</script>'), { waitUntil: 'load' });
  const refl = p.dialogs;
  await p.evaluate(async () => { await fetch('/comentarios', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ autor: 'x', texto: '<img src=x onerror=alert(2)>' }) }); });
  await p.goto(hostLocal(a) + '/comentarios', { waitUntil: 'load' }); await new Promise((r) => setTimeout(r, 300));
  console.log(`XSS (${nome}): alert refletido executou ${refl}x; armazenado executou ${p.dialogs - refl}x`);
  await c.close();
}
// 2) cookie visível ao JavaScript (roubo por XSS)
for (const [nome, a] of [['vulnerável', V], ['corrigida', S]]) {
  const { p, c } = await novaPagina(); await logar(p, a);
  const ck = await p.evaluate(() => document.cookie);
  console.log(`document.cookie (${nome}):`, ck ? 'contém ' + ck.split('=')[0] + ' (roubável por XSS)' : 'vazio (HttpOnly)'); await c.close();
}
// 3) CSRF: atacante na mesma "site" (outra porta de localhost) e em outra site (127.0.0.1)
for (const [nome, a] of [['vulnerável', V], ['corrigida', S]]) {
  for (const [rotulo, hostAtq] of [['same-site (localhost:outra-porta)', 'localhost'], ['cross-site (127.0.0.1)', '127.0.0.1']]) {
    const { p, c } = await novaPagina(); await logar(p, a); const antes = saldo(a);
    await p.goto(`http://${hostAtq}:${pa}/csrf.html?alvo=${encodeURIComponent(hostLocal(a))}`, { waitUntil: 'load' }); await new Promise((r) => setTimeout(r, 400));
    console.log(`CSRF (${nome}) atacante ${rotulo}: saldo ${antes} → ${saldo(a)} ${saldo(a) < antes ? '(TRANSFERÊNCIA FEITA)' : '(sem efeito)'}`); await c.close();
  }
}
// 4) CORS: página de outra origem lê o saldo da vítima?
for (const [nome, a] of [['vulnerável', V], ['corrigida', S]]) {
  for (const [rotulo, hostAtq] of [['same-site', 'localhost'], ['cross-site', '127.0.0.1']]) {
    const { p, c } = await novaPagina(); await logar(p, a);
    await p.goto(`http://${hostAtq}:${pa}/cors.html?alvo=${encodeURIComponent(hostLocal(a))}`); await p.waitForFunction(() => document.title !== 'aguardando', { timeout: 5000 }).catch(() => {});
    console.log(`CORS (${nome}) atacante ${rotulo}:`, await p.title()); await c.close();
  }
}
await b.close(); A.close(); V.server.close(); S.server.close();
