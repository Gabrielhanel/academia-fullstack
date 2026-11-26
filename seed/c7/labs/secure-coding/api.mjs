// Laboratório C7.4 (parte 2): segurança de APIs. JWT mínimo (vulnerável x corrigido), PKCE, token bucket e chaves de API. Dados sintéticos.
import crypto from 'node:crypto';
export const b64u = (b) => Buffer.from(b).toString('base64url');
const dec = (s) => JSON.parse(Buffer.from(s, 'base64url').toString());
const hmac = (chave, dados) => crypto.createHmac('sha256', chave).update(dados).digest('base64url');

export function assinarHS256(payload, segredo, header = { alg: 'HS256', typ: 'JWT' }) {
  const corpo = b64u(JSON.stringify(header)) + '.' + b64u(JSON.stringify(payload));
  return corpo + '.' + hmac(segredo, corpo);
}
export function assinarRS256(payload, chavePrivada) {
  const corpo = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' + b64u(JSON.stringify(payload));
  return corpo + '.' + crypto.sign('sha256', Buffer.from(corpo), chavePrivada).toString('base64url');
}
// VULNERÁVEL: confia no alg do cabeçalho, aceita "none", usa a chave pública como segredo HMAC e não valida exp/aud/iss
export function verificarVulneravel(token, chave) {
  const [h, p, s] = token.split('.'); const header = dec(h);
  if (header.alg === 'none') return dec(p);
  if (header.alg === 'HS256') { if (hmac(chave, h + '.' + p) !== s) throw new Error('assinatura inválida'); return dec(p); }
  if (header.alg === 'RS256') { if (!crypto.verify('sha256', Buffer.from(h + '.' + p), chave, Buffer.from(s, 'base64url'))) throw new Error('assinatura inválida'); return dec(p); }
  throw new Error('alg desconhecido');
}
// CORRIGIDO: algoritmo fixado no servidor, assinatura em tempo constante, exp/nbf/iss/aud obrigatórios, tamanho limitado
export function verificarSeguro(token, { alg, chave, iss, aud, agora = Math.floor(Date.now() / 1000) }) {
  if (typeof token !== 'string' || token.length > 4096) throw new Error('token inválido');
  const partes = token.split('.'); if (partes.length !== 3) throw new Error('token inválido');
  const [h, p, s] = partes; const header = dec(h);
  if (header.alg !== alg) throw new Error('algoritmo não permitido');
  const dados = Buffer.from(h + '.' + p);
  let ok = false;
  if (alg === 'HS256') { const esp = Buffer.from(hmac(chave, h + '.' + p)), rec = Buffer.from(s); ok = esp.length === rec.length && crypto.timingSafeEqual(esp, rec); }
  else if (alg === 'RS256') ok = crypto.verify('sha256', dados, chave, Buffer.from(s, 'base64url'));
  if (!ok) throw new Error('assinatura inválida');
  const c = dec(p);
  if (typeof c.exp !== 'number' || c.exp <= agora) throw new Error('token expirado');
  if (typeof c.nbf === 'number' && c.nbf > agora) throw new Error('token ainda não válido');
  if (c.iss !== iss) throw new Error('emissor inválido');
  if (c.aud !== aud) throw new Error('audiência inválida');
  return c;
}
// PKCE (RFC 7636): code_challenge = BASE64URL(SHA256(code_verifier))
export const pkceChallenge = (verifier) => crypto.createHash('sha256').update(verifier).digest('base64url');
// Token bucket com relógio injetável
export class TokenBucket {
  constructor(capacidade, repoeSegundo, agora = () => Date.now()) { Object.assign(this, { capacidade, repoeSegundo, agora, tokens: capacidade, ult: agora() }); }
  tentar(custo = 1) { const t = this.agora(); this.tokens = Math.min(this.capacidade, this.tokens + ((t - this.ult) / 1000) * this.repoeSegundo); this.ult = t; if (this.tokens >= custo) { this.tokens -= custo; return true; } return false; }
}
// Chaves de API: o servidor guarda só o hash (chaves aleatórias de 256 bits dispensam hash lento)
export function criarChaveApi() { const id = crypto.randomBytes(6).toString('hex'), segredo = crypto.randomBytes(32).toString('base64url'); return { chave: `ak_${id}_${segredo}`, registro: { id, hash: crypto.createHash('sha256').update(segredo).digest('hex') } }; }
export function conferirChaveApi(chave, registros) {
  const m = /^ak_([0-9a-f]{12})_([A-Za-z0-9_-]{43})$/.exec(chave); if (!m) return false;
  const reg = registros.find((r) => r.id === m[1]); if (!reg) return false;
  return crypto.timingSafeEqual(Buffer.from(crypto.createHash('sha256').update(m[2]).digest('hex')), Buffer.from(reg.hash));
}
