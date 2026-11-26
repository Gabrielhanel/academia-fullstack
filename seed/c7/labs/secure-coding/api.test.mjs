import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import * as A from './api.mjs';

const agora = 1_800_000_000;
const P = { sub: 'ana', papel: 'usuario', iss: 'https://auth.exemplo.test', aud: 'api-pedidos', exp: agora + 600 };
const segredo = crypto.randomBytes(32);

test('JWT: alg=none aceito só pelo verificador vulnerável', () => {
  const none = A.b64u(JSON.stringify({ alg: 'none', typ: 'JWT' })) + '.' + A.b64u(JSON.stringify({ ...P, papel: 'admin' })) + '.';
  assert.equal(A.verificarVulneravel(none, segredo).papel, 'admin');
  assert.throws(() => A.verificarSeguro(none, { alg: 'HS256', chave: segredo, iss: P.iss, aud: P.aud, agora }), /algoritmo não permitido/);
  console.log('  alg=none: vulnerável aceitou token sem assinatura (papel admin); corrigida recusou ("algoritmo não permitido")');
});
test('JWT: confusão RS256/HS256 usando a chave pública como segredo', () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = publicKey.export({ type: 'spki', format: 'pem' });
  const legitimo = A.assinarRS256(P, privateKey);
  assert.equal(A.verificarVulneravel(legitimo, publicKey).sub, 'ana');
  const forjado = A.assinarHS256({ ...P, papel: 'admin' }, pem);                 // atacante só conhece a chave pública
  const vul = (() => { try { return A.verificarVulneravel(forjado, pem).papel; } catch { return 'recusado'; } })();
  assert.equal(vul, 'admin');
  assert.throws(() => A.verificarSeguro(forjado, { alg: 'RS256', chave: publicKey, iss: P.iss, aud: P.aud, agora }), /algoritmo não permitido/);
  assert.equal(A.verificarSeguro(legitimo, { alg: 'RS256', chave: publicKey, iss: P.iss, aud: P.aud, agora }).sub, 'ana');
  console.log('  confusão de algoritmo: token HS256 assinado com a chave pública virou admin na vulnerável; corrigida fixa RS256 e recusou');
});
test('JWT: expiração, emissor e audiência', () => {
  const seg = (t) => A.verificarSeguro(t, { alg: 'HS256', chave: segredo, iss: P.iss, aud: P.aud, agora });
  const expirado = A.assinarHS256({ ...P, exp: agora - 1 }, segredo);
  assert.equal(A.verificarVulneravel(expirado, segredo).sub, 'ana'); assert.throws(() => seg(expirado), /expirado/);
  assert.throws(() => seg(A.assinarHS256({ ...P, aud: 'outra-api' }, segredo)), /audiência/);
  assert.throws(() => seg(A.assinarHS256({ ...P, iss: 'https://evil.test' }, segredo)), /emissor/);
  assert.throws(() => seg(A.assinarHS256({ sub: 'x', iss: P.iss, aud: P.aud }, segredo)), /expirado/);
  assert.equal(seg(A.assinarHS256(P, segredo)).sub, 'ana');
  const adulterado = A.assinarHS256(P, segredo).split('.'); adulterado[1] = A.b64u(JSON.stringify({ ...P, papel: 'admin' }));
  assert.throws(() => seg(adulterado.join('.')), /assinatura inválida/);
  console.log('  exp/iss/aud: vulnerável aceitou token expirado; corrigida exige exp, iss e aud e recusou payload adulterado');
});
test('JWT: segredo fraco quebrado por dicionário x segredo aleatório', () => {
  const fraco = 'secret123', token = A.assinarHS256(P, fraco);
  const dic = ['admin', 'password', '123456', 'senha', 'jwtsecret', 'changeme', ...Array.from({ length: 100000 }, (_, i) => 'secret' + i)];
  const [h, p, s] = token.split('.'); const corpo = h + '.' + p;
  const t0 = performance.now(); let ach = null, n = 0;
  for (const c of dic) { n++; if (crypto.createHmac('sha256', c).update(corpo).digest('base64url') === s) { ach = c; break; } }
  const t = performance.now() - t0; assert.equal(ach, fraco);
  const forte = A.assinarHS256(P, segredo); const [h2, p2, s2] = forte.split('.'); let achou = false;
  for (const c of dic.slice(0, 20000)) if (crypto.createHmac('sha256', c).update(h2 + '.' + p2).digest('base64url') === s2) achou = true;
  assert.equal(achou, false);
  console.log(`  segredo "secret123" recuperado em ${n} tentativas / ${t.toFixed(0)} ms (${(n / (t / 1000) / 1000).toFixed(0)} mil/s); segredo aleatório de 256 bits não está em dicionário (2^256 possibilidades)`);
});
test('PKCE: vetor da RFC 7636 (Apêndice B)', () => {
  assert.equal(A.pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  const v = crypto.randomBytes(32).toString('base64url'); assert.equal(v.length, 43);
  console.log('  code_challenge do vetor da RFC confere; verifier aleatório de 43 caracteres (32 bytes)');
});
test('Rate limit: token bucket (capacidade 10, 5 tokens/s)', () => {
  let t = 0; const b = new A.TokenBucket(10, 5, () => t);
  const rajada = Array.from({ length: 20 }, () => b.tentar()); const ok1 = rajada.filter(Boolean).length;
  t += 1000; const ok2 = Array.from({ length: 20 }, () => b.tentar()).filter(Boolean).length;
  t += 10000; const ok3 = Array.from({ length: 20 }, () => b.tentar()).filter(Boolean).length;
  assert.deepEqual([ok1, ok2, ok3], [10, 5, 10]);
  console.log(`  rajada de 20: ${ok1} aceitas; após 1 s: ${ok2} (5 tokens repostos); após 10 s parado: ${ok3} (volta à capacidade)`);
});
test('Chaves de API: só o hash é guardado', () => {
  const { chave, registro } = A.criarChaveApi();
  assert.equal(A.conferirChaveApi(chave, [registro]), true);
  assert.equal(A.conferirChaveApi(chave.slice(0, -1) + (chave.endsWith('A') ? 'B' : 'A'), [registro]), false);
  assert.equal(A.conferirChaveApi('ak_000000000000_' + 'x'.repeat(43), [registro]), false);
  assert.ok(!JSON.stringify(registro).includes(chave.split('_')[2]));
  console.log('  chave de', chave.length, 'caracteres; registro guarda id + SHA-256 (64 hex); chave adulterada e id desconhecido recusados');
});
