// Laboratório C7.3 (parte 1): hashing, efeito avalanche, hash de senha (scrypt, PBKDF2, Argon2id) e custo de quebra offline. Dados sintéticos.
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { spawnSync } from 'node:child_process';
const ms = (f, n = 1) => { const t = performance.now(); for (let i = 0; i < n; i++) f(i); return (performance.now() - t) / n; };
const sha256 = (b) => crypto.createHash('sha256').update(b).digest();
const fmt = (n) => (n >= 1e9 ? (n / 1e9).toFixed(1) + ' bilhões' : n >= 1e6 ? (n / 1e6).toFixed(1) + ' milhões' : n >= 1e3 ? (n / 1e3).toFixed(1) + ' mil' : n.toFixed(1));
const tempo = (s) => (s < 60 ? s.toFixed(1) + ' s' : s < 3600 ? (s / 60).toFixed(1) + ' min' : s < 86400 ? (s / 3600).toFixed(1) + ' h' : s < 86400 * 365 ? (s / 86400).toFixed(1) + ' dias' : (s / 86400 / 365).toExponential(2) + ' anos');

console.log('== 1. Vetores conhecidos e algoritmos');
console.log('SHA-256("abc") =', sha256('abc').toString('hex'), '(esperado ba7816bf…15ad)');
console.log('tamanhos de saída (bytes): md5', crypto.createHash('md5').update('a').digest().length, '| sha1', crypto.createHash('sha1').update('a').digest().length, '| sha256', 32, '| sha3-256', crypto.createHash('sha3-256').update('a').digest().length, '| blake2b512', crypto.createHash('blake2b512').update('a').digest().length);

console.log('\n== 2. Efeito avalanche (inverter 1 bit de 1.000 entradas aleatórias de 32 bytes)');
let total = 0; const N = 1000;
for (let i = 0; i < N; i++) { const a = crypto.randomBytes(32); const b = Buffer.from(a); b[i % 32] ^= 1 << (i % 8); const x = sha256(a), y = sha256(b); let d = 0; for (let k = 0; k < 32; k++) { let v = x[k] ^ y[k]; while (v) { d += v & 1; v >>= 1; } } total += d; }
console.log(`média de bits diferentes na saída: ${(total / N).toFixed(1)} de 256 (${((total / N / 256) * 100).toFixed(1)}%; ideal ≈ 50%)`);

console.log('\n== 3. Custo por tentativa (1 núcleo, esta máquina)');
const viaNode = 1000 / ms(() => sha256('x'), 300000);
const sp = spawnSync('openssl', ['speed', '-seconds', '2', '-bytes', '32', '-evp', 'sha256'], { encoding: 'utf8' });
const ult = sp.stdout.trim().split('\n').pop().trim().split(/\s+/); const bytesPorSeg = parseFloat(ult[ult.length - 1]) * 1000;
const rapido = bytesPorSeg / 32;   // hashes de 32 bytes por segundo, 1 núcleo, OpenSSL
const scryptMs = ms(() => crypto.scryptSync('senha', 'salt-sintetico-16b', 32), 20);
const scryptFort = ms(() => crypto.scryptSync('senha', 'salt-sintetico-16b', 32, { N: 2 ** 17, maxmem: 256 * 1024 * 1024 }), 3);
const pbkdf2Ms = ms(() => crypto.pbkdf2Sync('senha', 'salt-sintetico-16b', 600000, 32, 'sha256'), 3);
const argonMs = ms(() => crypto.argon2Sync('argon2id', { message: 'senha', nonce: Buffer.from('salt-sintetico-16b'), parallelism: 1, tagLength: 32, memory: 19456, passes: 2 }), 5);
console.log(`SHA-256 simples (OpenSSL):  ${fmt(rapido)} hashes/s por núcleo (${(1e9 / rapido).toFixed(0)} ns cada)`);
console.log(`SHA-256 via Node createHash: ${fmt(viaNode)} hashes/s (a sobrecarga de criar o objeto domina; não use como taxa de quebra)`);
console.log(`scrypt N=2^14 r=8 p=1:     ${scryptMs.toFixed(1)} ms  → ${(1000 / scryptMs).toFixed(1)} tentativas/s`);
console.log(`scrypt N=2^17 r=8 p=1:     ${scryptFort.toFixed(1)} ms  → ${(1000 / scryptFort).toFixed(1)} tentativas/s`);
console.log(`PBKDF2-SHA256 600.000 it.:  ${pbkdf2Ms.toFixed(1)} ms  → ${(1000 / pbkdf2Ms).toFixed(1)} tentativas/s`);
console.log(`Argon2id m=19 MiB, t=2, p=1: ${argonMs.toFixed(1)} ms  → ${(1000 / argonMs).toFixed(1)} tentativas/s`);
console.log(`razão SHA-256 simples / scrypt(2^14): ${(rapido / (1000 / scryptMs)).toExponential(2)}x mais tentativas por segundo`);

console.log('\n== 4. Tempo para esgotar espaços de senha em 1 núcleo (estimativa = espaço / taxa medida; GPUs/ASICs são muito mais rápidos)');
const espacos = { '8 minúsculas (26^8)': 26 ** 8, '8 alfanuméricas (62^8)': 62 ** 8, '12 alfanuméricas (62^12)': 62 ** 12 };
for (const [nome, e] of Object.entries(espacos)) console.log(`${nome.padEnd(26)} espaço ${e.toExponential(2)} | SHA-256: ${tempo(e / rapido)} | scrypt 2^14: ${tempo(e / (1000 / scryptMs))} | argon2id: ${tempo(e / (1000 / argonMs))}`);

console.log('\n== 5. Dicionário contra hash SEM salt x COM salt (senhas sintéticas fracas)');
const dic = []; for (const base of ['senha', 'admin', 'qwerty', 'brasil', 'futebol', 'ana-senha-fraca-']) for (let i = 0; i < 20000; i++) dic.push(base + i);
const alvos = ['senha123', 'brasil4567', 'ana-senha-fraca-19999'].map((s) => s);
const semSalt = alvos.map((s) => sha256(s).toString('hex'));
let t0 = performance.now(); const tabela = new Map(dic.map((p) => [sha256(p).toString('hex'), p])); const tConstr = performance.now() - t0;
t0 = performance.now(); const achados = semSalt.map((h) => tabela.get(h)); const tBusca = performance.now() - t0;
console.log(`SEM salt: tabela de ${dic.length} candidatos construída em ${tConstr.toFixed(0)} ms (reutilizável para TODOS os usuários); ${achados.filter(Boolean).length}/${alvos.length} senhas recuperadas em ${tBusca.toFixed(2)} ms de consulta`);
const salts = alvos.map(() => crypto.randomBytes(16)); const comSalt = alvos.map((s, i) => crypto.scryptSync(s, salts[i], 32).toString('hex'));
const lote = 20; t0 = performance.now(); let rec = 0;
for (let i = 0; i < alvos.length; i++) for (const p of dic.slice(0, lote)) { if (crypto.scryptSync(p, salts[i], 32).toString('hex') === comSalt[i]) rec++; }
const tl = performance.now() - t0;
console.log(`COM salt+scrypt: ${lote} candidatos x ${alvos.length} usuários = ${lote * alvos.length} tentativas em ${tl.toFixed(0)} ms (${(tl / (lote * alvos.length)).toFixed(1)} ms por tentativa); tabela pré-computada não serve (cada usuário tem salt próprio); recuperadas nesse lote: ${rec}`);
console.log(`extrapolação: os ${dic.length} candidatos x ${alvos.length} usuários levariam ≈ ${tempo((dic.length * alvos.length * scryptMs) / 1000)} (1 núcleo), contra ${(tBusca).toFixed(2)} ms da consulta na tabela sem salt (após ${tConstr.toFixed(0)} ms para montá-la, uma única vez)`);

console.log('\n== 6. HMAC e comparação em tempo constante');
const chave = crypto.randomBytes(32); const msg = 'pedido=42&valor=100';
const tag = crypto.createHmac('sha256', chave).update(msg).digest();
const ok = crypto.timingSafeEqual(tag, crypto.createHmac('sha256', chave).update(msg).digest());
const adulterado = crypto.timingSafeEqual(tag, crypto.createHmac('sha256', chave).update('pedido=42&valor=900').digest());
console.log('HMAC confere para mensagem original:', ok, '| para mensagem adulterada:', adulterado);
const ext = sha256(msg + 'x').toString('hex').slice(0, 12), hc = sha256(chave.toString('hex') + msg).toString('hex').slice(0, 12);
console.log('hash(msg||x) não exige a chave (extensão de comprimento é ponto de atenção de SHA-256 puro); HMAC resolve:', ext !== hc);
