// Laboratório C7.3 (parte 2): cifras simétricas e assimétricas, assinaturas, troca de chaves híbrida e pós-quântica. Dados sintéticos.
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
const t = (f, n) => { const a = performance.now(); for (let i = 0; i < n; i++) f(); return (performance.now() - a) / n; };
const hex = (b) => Buffer.from(b).toString('hex');

console.log('== 1. AES-256-GCM: confidencialidade + integridade');
const chave = crypto.randomBytes(32), nonce = crypto.randomBytes(12), claro = Buffer.from('saldo=1000;conta=ana (dado sintético)');
const cifra = crypto.createCipheriv('aes-256-gcm', chave, nonce); cifra.setAAD(Buffer.from('v1'));
const ct = Buffer.concat([cifra.update(claro), cifra.final()]), tag = cifra.getAuthTag();
console.log(`claro ${claro.length} B → cifrado ${ct.length} B + nonce ${nonce.length} B + tag ${tag.length} B (sobrecarga ${nonce.length + tag.length} B)`);
const dec = (c, n, tg, aad = 'v1') => { const d = crypto.createDecipheriv('aes-256-gcm', chave, n); d.setAAD(Buffer.from(aad)); d.setAuthTag(tg); return Buffer.concat([d.update(c), d.final()]).toString(); };
console.log('decifra correta:', dec(ct, nonce, tag));
const adult = Buffer.from(ct); adult[0] ^= 1;
try { dec(adult, nonce, tag); console.log('adulterado: DECIFROU (inesperado)'); } catch (e) { console.log('1 bit do cifrado alterado → falha de autenticação:', e.message); }
try { dec(ct, nonce, tag, 'v2'); } catch (e) { console.log('AAD diferente (contexto) → falha:', e.message); }

console.log('\n== 2. Reutilizar o nonce no GCM/CTR vaza o XOR dos textos claros (dois-time pad)');
const p1 = Buffer.from('transferir 100 para a conta 2'), p2 = Buffer.from('transferir 999 para a conta 7');
const enc = (p) => { const c = crypto.createCipheriv('aes-256-gcm', chave, nonce); return Buffer.concat([c.update(p), c.final()]); };
const c1 = enc(p1), c2 = enc(p2); const n = Math.min(c1.length, c2.length);
const xc = Buffer.alloc(n), xp = Buffer.alloc(n); for (let i = 0; i < n; i++) { xc[i] = c1[i] ^ c2[i]; xp[i] = p1[i] ^ p2[i]; }
console.log('c1 XOR c2 == p1 XOR p2 (mesmo nonce e chave):', xc.equals(xp), '→ quem conhece um claro recupera o outro');
const c3 = (() => { const c = crypto.createCipheriv('aes-256-gcm', chave, crypto.randomBytes(12)); return Buffer.concat([c.update(p2), c.final()]); })();
const x3 = Buffer.alloc(n); for (let i = 0; i < n; i++) x3[i] = c1[i] ^ c3[i];
console.log('com nonce novo, o XOR dos cifrados continua igual ao dos claros?', x3.equals(xp));

console.log('\n== 3. Modo ECB revela padrões; GCM não');
const blocos = Buffer.concat(Array.from({ length: 10 }, () => Buffer.from('BLOCO-IGUAL-16B!')));
const unicos = (b) => new Set(Array.from({ length: b.length / 16 }, (_, i) => hex(b.subarray(i * 16, i * 16 + 16)))).size;
const ecb = (() => { const c = crypto.createCipheriv('aes-256-ecb', chave, null); return Buffer.concat([c.update(blocos), c.final()]); })();
const gcm = (() => { const c = crypto.createCipheriv('aes-256-gcm', chave, crypto.randomBytes(12)); return Buffer.concat([c.update(blocos), c.final()]); })();
console.log(`10 blocos idênticos → blocos cifrados distintos: ECB ${unicos(ecb.subarray(0, 160))} | GCM ${unicos(gcm.subarray(0, 160))}`);

console.log('\n== 4. HKDF: derivar chaves distintas de um segredo');
const ikm = crypto.randomBytes(32);
const k1 = Buffer.from(crypto.hkdfSync('sha256', ikm, Buffer.alloc(0), 'cifrar', 32)), k2 = Buffer.from(crypto.hkdfSync('sha256', ikm, Buffer.alloc(0), 'autenticar', 32));
console.log('chaves derivadas com rótulos diferentes são diferentes:', !k1.equals(k2));

console.log('\n== 5. Assimétrica: desempenho e tamanhos (1 núcleo)');
const msg = Buffer.from('documento sintético a ser assinado');
const linhas = [];
const medirAss = (nome, gen, sign, verify) => { const kp = gen(); const sig = sign(kp); const ok = verify(kp, sig); const ts = t(() => sign(kp), 50), tv = t(() => verify(kp, sig), 200); const pub = kp.publicKey.export({ type: 'spki', format: 'der' }).length; linhas.push(`${nome.padEnd(12)} chave pública ${String(pub).padStart(4)} B | assinatura ${String(sig.length).padStart(4)} B | assinar ${(1000 / ts).toFixed(0).padStart(6)} /s | verificar ${(1000 / tv).toFixed(0).padStart(6)} /s | válida: ${ok}`); return { kp, sig }; };
const ed = medirAss('Ed25519', () => crypto.generateKeyPairSync('ed25519'), (k) => crypto.sign(null, msg, k.privateKey), (k, s) => crypto.verify(null, msg, k.publicKey, s));
medirAss('ECDSA P-256', () => crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' }), (k) => crypto.sign('sha256', msg, k.privateKey), (k, s) => crypto.verify('sha256', msg, k.publicKey, s));
medirAss('RSA-PSS 2048', () => crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }), (k) => crypto.sign('sha256', msg, { key: k.privateKey, padding: crypto.constants.RSA_PKCS1_PSS_PADDING }), (k, s) => crypto.verify('sha256', msg, { key: k.publicKey, padding: crypto.constants.RSA_PKCS1_PSS_PADDING }, s));
medirAss('ML-DSA-65', () => crypto.generateKeyPairSync('ml-dsa-65'), (k) => crypto.sign(null, msg, k.privateKey), (k, s) => crypto.verify(null, msg, k.publicKey, s));
linhas.forEach((l) => console.log(l));
const bad = Buffer.from(msg); bad[0] ^= 1;
console.log('Ed25519: assinatura sobre mensagem adulterada é válida?', crypto.verify(null, bad, ed.kp.publicKey, ed.sig));

console.log('\n== 6. RSA-OAEP: limite do tamanho do claro e uso correto (híbrido)');
const rsa = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const oaep = { key: rsa.publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' };
try { crypto.publicEncrypt(oaep, Buffer.alloc(190)); console.log('190 bytes: cifrou (máximo = 256 − 2×32 − 2 = 190)'); crypto.publicEncrypt(oaep, Buffer.alloc(191)); } catch (e) { console.log('191 bytes: recusado →', e.code || e.message.slice(0, 50)); }

console.log('\n== 7. Troca de chaves híbrida: X25519 + HKDF + AES-GCM (ECIES simplificado)');
const alice = crypto.generateKeyPairSync('x25519'), bob = crypto.generateKeyPairSync('x25519');
const sa = crypto.diffieHellman({ privateKey: alice.privateKey, publicKey: bob.publicKey }), sb = crypto.diffieHellman({ privateKey: bob.privateKey, publicKey: alice.publicKey });
console.log('segredo compartilhado igual nos dois lados:', sa.equals(sb), `(${sa.length} B)`);
const kk = Buffer.from(crypto.hkdfSync('sha256', sa, Buffer.alloc(0), 'canal-v1', 32)), nn = crypto.randomBytes(12);
const cc = crypto.createCipheriv('aes-256-gcm', kk, nn); const ctt = Buffer.concat([cc.update('mensagem sintética'), cc.final()]), tg = cc.getAuthTag();
const dd = crypto.createDecipheriv('aes-256-gcm', Buffer.from(crypto.hkdfSync('sha256', sb, Buffer.alloc(0), 'canal-v1', 32)), nn); dd.setAuthTag(tg);
console.log('Bob decifra:', Buffer.concat([dd.update(ctt), dd.final()]).toString());
console.log('sem autenticar as chaves públicas, um intermediário poderia trocá-las (por isso certificados/assinaturas)');

console.log('\n== 8. Pós-quântica no Node (ML-KEM-768 e ML-DSA-65): tamanhos');
try {
  const kem = crypto.generateKeyPairSync('ml-kem-768');
  const { ciphertext, sharedKey } = crypto.encapsulate(kem.publicKey); const sk2 = crypto.decapsulate(kem.privateKey, ciphertext);
  console.log(`ML-KEM-768: chave pública ${kem.publicKey.export({ type: 'spki', format: 'der' }).length} B, texto cifrado de encapsulamento ${ciphertext.length} B, segredo ${sharedKey.length} B, iguais: ${Buffer.from(sharedKey).equals(Buffer.from(sk2))}`);
  console.log(`X25519 para comparação: chave pública ${alice.publicKey.export({ type: 'spki', format: 'der' }).length} B, "ciphertext" = chave efêmera de 32 B`);
} catch (e) { console.log('encapsulate indisponível:', e.message); }
console.log('versão OpenSSL do Node:', process.versions.openssl, '| Node:', process.version);
