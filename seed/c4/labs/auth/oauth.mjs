import express from 'express';
import crypto from 'node:crypto';
import { SignJWT, jwtVerify, generateKeyPair, exportJWK, createLocalJWKSet } from 'jose';
const sobe = (app) => new Promise((ok) => { const s = app.listen(0, '127.0.0.1', () => ok({ s, b: 'http://127.0.0.1:' + s.address().port })); });
const sha256b64 = (v) => crypto.createHash('sha256').update(v).digest('base64url');
const { publicKey, privateKey } = await generateKeyPair('RS256'); const jwk = { ...(await exportJWK(publicKey)), kid: 'idp-1', alg: 'RS256', use: 'sig' };

// ---- Servidor de autorização/OIDC didático (NÃO é um produto) ----
const idp = express(); idp.use(express.urlencoded({ extended: false }));
const codes = new Map(); const refresh = new Map(); const clientes = { app1: { redirect: 'http://127.0.0.1:9999/callback' } };
let ISS = '';
idp.get('/.well-known/openid-configuration', (req, res) => res.json({ issuer: ISS, authorization_endpoint: ISS + '/authorize', token_endpoint: ISS + '/token', jwks_uri: ISS + '/jwks', code_challenge_methods_supported: ['S256'], id_token_signing_alg_values_supported: ['RS256'] }));
idp.get('/jwks', (req, res) => res.json({ keys: [jwk] }));
idp.get('/authorize', (req, res) => {
  const q = req.query; const c = clientes[q.client_id];
  if (!c || q.redirect_uri !== c.redirect) return res.status(400).json({ erro: 'redirect_uri não registrado' });          // nunca redirecione para uma URI não registrada
  if (q.response_type !== 'code' || !q.code_challenge || q.code_challenge_method !== 'S256') return res.status(400).json({ erro: 'PKCE S256 obrigatório' });
  const code = crypto.randomBytes(16).toString('hex'); codes.set(code, { cliente: q.client_id, redirect: q.redirect_uri, challenge: q.code_challenge, nonce: q.nonce, usuario: 'ana', exp: Date.now() + 60_000 });
  res.redirect(302, q.redirect_uri + '?code=' + code + '&state=' + encodeURIComponent(q.state)); // usuário "autenticou e consentiu" automaticamente (didático)
});
idp.post('/token', async (req, res) => {
  const b = req.body;
  if (b.grant_type === 'authorization_code') {
    const c = codes.get(b.code); codes.delete(b.code);                                                                       // código de uso único
    if (!c || c.exp < Date.now() || c.cliente !== b.client_id || c.redirect !== b.redirect_uri) return res.status(400).json({ error: 'invalid_grant' });
    if (sha256b64(b.code_verifier ?? '') !== c.challenge) return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE falhou' });
    const agora = Math.floor(Date.now() / 1000);
    const id_token = await new SignJWT({ nonce: c.nonce, name: 'Ana' }).setProtectedHeader({ alg: 'RS256', kid: 'idp-1' }).setIssuer(ISS).setAudience(c.cliente).setSubject('u-1').setIssuedAt(agora).setExpirationTime(agora + 300).sign(privateKey);
    const access_token = await new SignJWT({ scope: 'pedidos:ler' }).setProtectedHeader({ alg: 'RS256', kid: 'idp-1' }).setIssuer(ISS).setAudience('api-pedidos').setSubject('u-1').setIssuedAt(agora).setExpirationTime(agora + 300).sign(privateKey);
    const rt = crypto.randomBytes(24).toString('hex'); refresh.set(rt, { familia: crypto.randomUUID(), usado: false, cliente: c.cliente });
    return res.json({ token_type: 'Bearer', access_token, id_token, refresh_token: rt, expires_in: 300 });
  }
  if (b.grant_type === 'refresh_token') {
    const r = refresh.get(b.refresh_token);
    if (!r) return res.status(400).json({ error: 'invalid_grant' });
    if (r.usado) { for (const [k, v] of refresh) if (v.familia === r.familia) refresh.delete(k); return res.status(400).json({ error: 'invalid_grant', error_description: 'reuso detectado: família revogada' }); }
    r.usado = true; const novo = crypto.randomBytes(24).toString('hex'); refresh.set(novo, { ...r, usado: false });
    return res.json({ token_type: 'Bearer', refresh_token: novo, expires_in: 300 });
  }
  res.status(400).json({ error: 'unsupported_grant_type' });
});
const I = await sobe(idp); ISS = I.b;

// ---- Cliente (app1) ----
const redirect = 'http://127.0.0.1:9999/callback';
const iniciar = async (alt = {}) => {
  const verifier = crypto.randomBytes(32).toString('base64url'), state = crypto.randomBytes(8).toString('hex'), nonce = crypto.randomBytes(8).toString('hex');
  const p = new URLSearchParams({ response_type: 'code', client_id: 'app1', redirect_uri: redirect, scope: 'openid profile', state, nonce, code_challenge: sha256b64(verifier), code_challenge_method: 'S256', ...alt });
  for (const [k, v] of Object.entries(alt)) if (v === undefined) p.delete(k);
  const r = await fetch(I.b + '/authorize?' + p, { redirect: 'manual' });
  return { verifier, state, nonce, r };
};
const troca = async (code, verifier, extra = {}) => { const r = await fetch(I.b + '/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: 'app1', redirect_uri: redirect, code_verifier: verifier, ...extra }) }); return { s: r.status, j: await r.json() }; };
const codeDe = (r) => new URL(r.headers.get('location')).searchParams;
console.log('== 1. descoberta e JWKS');
const disc = await (await fetch(I.b + '/.well-known/openid-configuration')).json(); console.log('discovery:', Object.keys(disc).join(', ')); const jwks = createLocalJWKSet(await (await fetch(disc.jwks_uri)).json());
console.log('\n== 2. fluxo código de autorização + PKCE (caminho feliz)');
let f = await iniciar(); let loc = codeDe(f.r); console.log('/authorize →', f.r.status, '| state devolvido igual:', loc.get('state') === f.state);
let t = await troca(loc.get('code'), f.verifier); console.log('/token →', t.s, '| campos:', Object.keys(t.j).join(', '));
const id = await jwtVerify(t.j.id_token, jwks, { issuer: ISS, audience: 'app1' }); console.log('id_token válido: sub =', id.payload.sub, '| nonce confere:', id.payload.nonce === f.nonce, '| aud =', id.payload.aud);
const at = await jwtVerify(t.j.access_token, jwks, { issuer: ISS, audience: 'api-pedidos' }); console.log('access_token para a API: aud =', at.payload.aud, '| scope =', at.payload.scope);
try { await jwtVerify(t.j.access_token, jwks, { issuer: ISS, audience: 'app1' }); console.log('access_token aceito como id_token (ERRO)'); } catch (e) { console.log('access_token usado como id_token (audiência errada):', e.code); }
console.log('\n== 3. ataques e erros');
let x = await troca(loc.get('code'), f.verifier); console.log('reutilizar o código de autorização:', x.s, JSON.stringify(x.j));
f = await iniciar(); loc = codeDe(f.r); x = await troca(loc.get('code'), crypto.randomBytes(32).toString('base64url')); console.log('code_verifier errado (código interceptado sem o verifier):', x.s, JSON.stringify(x.j));
f = await iniciar(); loc = codeDe(f.r); x = await troca(loc.get('code'), f.verifier, { redirect_uri: 'http://127.0.0.1:9999/outro' }); console.log('redirect_uri diferente na troca:', x.s, JSON.stringify(x.j));
f = await iniciar({ redirect_uri: 'https://malvado.example/cb' }); console.log('redirect_uri não registrado em /authorize:', f.r.status);
f = await iniciar({ code_challenge: undefined }); console.log('sem PKCE:', f.r.status);
console.log('\n== 4. rotação do refresh token com detecção de reuso');
f = await iniciar(); loc = codeDe(f.r); t = await troca(loc.get('code'), f.verifier); const rt1 = t.j.refresh_token;
const ref = async (rt) => { const r = await fetch(I.b + '/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: rt, client_id: 'app1' }) }); return { s: r.status, j: await r.json() }; };
const r2 = await ref(rt1); console.log('usar rt1:', r2.s, '→ novo refresh token emitido:', !!r2.j.refresh_token);
const r3 = await ref(rt1); console.log('reusar rt1 (roubado):', r3.s, JSON.stringify(r3.j));
const r4 = await ref(r2.j.refresh_token); console.log('o rt2 legítimo depois do reuso:', r4.s, JSON.stringify(r4.j), '(a família inteira foi revogada)');
I.s.close();
