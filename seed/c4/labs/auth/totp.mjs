import crypto from 'node:crypto';
const hotp = (segredo, contador, digitos = 6, alg = 'sha1') => {
  const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(contador));
  const h = crypto.createHmac(alg, segredo).update(buf).digest(); const o = h[h.length - 1] & 0xf;
  const bin = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(bin % 10 ** digitos).padStart(digitos, '0');
};
const totp = (segredo, t = Date.now() / 1000, passo = 30, digitos = 6, alg = 'sha1') => hotp(segredo, Math.floor(t / passo), digitos, alg);
console.log('== 1. vetores de teste da RFC 6238 (SHA-1, 8 dígitos, segredo "12345678901234567890")');
const seg = Buffer.from('12345678901234567890');
const vetores = [[59, '94287082'], [1111111109, '07081804'], [1111111111, '14050471'], [1234567890, '89005924'], [2000000000, '69279037'], [20000000000, '65353130']];
for (const [t, esperado] of vetores) { const obtido = totp(seg, t, 30, 8); console.log('T =', String(t).padEnd(11), 'esperado', esperado, '| obtido', obtido, '|', obtido === esperado ? 'ok' : 'DIVERGE'); }
console.log('\n== 2. verificação com janela e proteção contra reuso');
const segredoUsuario = crypto.randomBytes(20); const ultimoPasso = new Map();
const verificar = (usuario, codigo, t = Date.now() / 1000, janela = 1) => {
  const passo = Math.floor(t / 30);
  for (let d = -janela; d <= janela; d++) {
    const esperado = hotp(segredoUsuario, passo + d);
    if (crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(codigo.padStart(6, '0').slice(0, 6)))) {
      if ((ultimoPasso.get(usuario) ?? -1) >= passo + d) return 'recusado: código já usado (reuso)';
      ultimoPasso.set(usuario, passo + d); return 'aceito (deslocamento ' + d + ')';
    }
  }
  return 'recusado';
};
const t0 = 1_800_000_000;
console.log('código do passo atual:', verificar('ana', hotp(segredoUsuario, Math.floor(t0 / 30)), t0));
console.log('mesmo código de novo:', verificar('ana', hotp(segredoUsuario, Math.floor(t0 / 30)), t0));
console.log('código do passo anterior (relógio atrasado 30 s) para outro usuário:', verificar('bia', hotp(segredoUsuario, Math.floor(t0 / 30) - 1), t0));
console.log('código de 3 passos atrás (90 s):', verificar('caio', hotp(segredoUsuario, Math.floor(t0 / 30) - 3), t0));
console.log('código errado:', verificar('dani', '000000', t0));
console.log('\n== 3. força bruta: espaço de 6 dígitos x tentativas permitidas');
const tentativas = 5, espaco = 10 ** 6; console.log('chance de acertar com', tentativas, 'tentativas por código:', (tentativas / espaco * 100).toFixed(4) + '% (cálculo); com janela de ±1 passo (3 códigos válidos) e 5 tentativas:', (tentativas * 3 / espaco * 100).toFixed(4) + '% (cálculo)');
console.log('URI de provisionamento (QR code):', 'otpauth://totp/Exemplo:ana@exemplo.com?secret=' + base32(segredoUsuario).slice(0, 8) + '…&issuer=Exemplo&algorithm=SHA1&digits=6&period=30');
function base32(buf) { const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = '', out = ''; for (const b of buf) bits += b.toString(2).padStart(8, '0'); for (let i = 0; i + 5 <= bits.length; i += 5) out += a[parseInt(bits.slice(i, i + 5), 2)]; return out; }
