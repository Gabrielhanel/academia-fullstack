// Envelope encryption e rotação de chave (modelo local de KMS). Dados sintéticos.
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
const gcm = (chave, claro) => { const n = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', chave, n); const ct = Buffer.concat([c.update(claro), c.final()]); return Buffer.concat([n, c.getAuthTag(), ct]); };
const ungcm = (chave, blob) => { const d = crypto.createDecipheriv('aes-256-gcm', chave, blob.subarray(0, 12)); d.setAuthTag(blob.subarray(12, 28)); return Buffer.concat([d.update(blob.subarray(28)), d.final()]); };
const kms = { kek: { v1: crypto.randomBytes(32) }, atual: 'v1' };   // a KEK nunca sai do "KMS"
const embrulhar = (dek) => ({ ver: kms.atual, blob: gcm(kms.kek[kms.atual], dek) });
const desembrulhar = (w) => ungcm(kms.kek[w.ver], w.blob);
const [N, tam] = process.argv[2] ? process.argv[2].split('x').map(Number) : [10000, 1024];
const registros = Array.from({ length: N }, (_, i) => { const dek = crypto.randomBytes(32); return { id: i, dado: gcm(dek, crypto.randomBytes(tam)), chaveEmbrulhada: embrulhar(dek) }; });
const hashDados = () => crypto.createHash('sha256').update(Buffer.concat(registros.map((r) => r.dado))).digest('hex');
console.log(`${N} registros de ${tam} B, cada um com sua DEK, embrulhada pela KEK ${kms.atual}`);
console.log('decifrar o registro 0 com a DEK desembrulhada:', ungcm(desembrulhar(registros[0].chaveEmbrulhada), registros[0].dado).length, 'B recuperados');
const antes = hashDados();
kms.kek.v2 = crypto.randomBytes(32);
let t0 = performance.now(); for (const r of registros) { const dek = desembrulhar(r.chaveEmbrulhada); kms.atual = 'v2'; r.chaveEmbrulhada = embrulhar(dek); kms.atual = 'v1'; } kms.atual = 'v2';
const tRot = performance.now() - t0;
console.log(`rotação da KEK (v1 → v2): reembrulhar ${N} DEKs em ${tRot.toFixed(0)} ms; dados cifrados inalterados: ${hashDados() === antes}`);
t0 = performance.now(); for (const r of registros) { const dek = desembrulhar(r.chaveEmbrulhada); const claro = ungcm(dek, r.dado); r.dado = gcm(dek, claro); } const tRe = performance.now() - t0;
console.log(`alternativa sem envelope (decifrar e recifrar todos os dados): ${tRe.toFixed(0)} ms para ${N} x ${tam} B (${(tRe / tRot).toFixed(1)}x mais lento que reembrulhar)`);
console.log('após a rotação, decifra com a v2:', ungcm(desembrulhar(registros[0].chaveEmbrulhada), registros[0].dado).length, 'B');
delete kms.kek.v1; delete kms.kek.v2;   // destruir a KEK = "crypto shredding"
try { desembrulhar(registros[0].chaveEmbrulhada); } catch { console.log('após destruir a KEK: impossível desembrulhar a DEK; os dados cifrados tornam-se ilegíveis'); }
