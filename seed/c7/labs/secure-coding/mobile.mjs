// Laboratório C7.4 (parte 3): modelos locais de segurança mobile (sem dispositivo): fixação de chave (pinning) e segredos embutidos em pacotes de aplicativo.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { varrer } from '../criptografia/scanner.mjs';
const d = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-mob-'));
const sh = (args, opt = {}) => spawnSync('openssl', args, { cwd: d, encoding: 'utf8', ...opt });
const novoCert = (nome, chave) => { if (!chave) sh(['ecparam', '-name', 'prime256v1', '-genkey', '-noout', '-out', nome + '.key']); sh(['req', '-new', '-x509', '-key', chave || nome + '.key', '-out', nome + '.crt', '-days', '30', '-subj', '/CN=api.exemplo.test']); return fs.readFileSync(path.join(d, nome + '.crt'), 'utf8'); };
const pinSpki = (pem) => crypto.createHash('sha256').update(new crypto.X509Certificate(pem).publicKey.export({ type: 'spki', format: 'der' })).digest('base64');
const fixar = (pem, pins) => pins.includes(pinSpki(pem));

console.log('== 1. Fixação de chave pública (SPKI pinning), modelo');
const servidor = novoCert('servidor'), pin = pinSpki(servidor);
console.log('pin do servidor (SHA-256 do SPKI, base64):', pin);
console.log('conexão com o certificado correto aceita:', fixar(servidor, [pin]));
const intruso = novoCert('intruso');
console.log('certificado de outro emissor/chave (intermediário) aceito:', fixar(intruso, [pin]), '(mesmo que um certificado válido de uma CA confiável pelo sistema)');
const renovado = novoCert('renovado', path.join(d, 'servidor.key'));
console.log('certificado RENOVADO com a mesma chave aceito:', fixar(renovado, [pin]), '| certificados diferentes (serial/validade):', renovado !== servidor);
const novaChave = novoCert('rotacao'); const pinNovo = pinSpki(novaChave);
console.log('rotação de chave SEM pin de reserva — app com um só pin aceita a nova chave:', fixar(novaChave, [pin]), '→ app quebrado até atualizar');
console.log('rotação COM pin de reserva já distribuído (pins [atual, reserva]) aceita:', fixar(novaChave, [pin, pinNovo]));

console.log('\n== 2. Segredos embutidos no pacote do aplicativo');
const tok = 'ghp_' + crypto.randomBytes(40).toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 36);
const chaveApi = 'k' + crypto.randomBytes(18).toString('base64url');
const variantes = {
  'texto claro': `const API_KEY = "${chaveApi}";\nconst GITHUB_TOKEN = "${tok}";`,
  'ofuscado em base64': `const T = atob("${Buffer.from(tok).toString('base64')}");`,
  'dividido em partes': `const T = "${tok.slice(0, 8)}" + "${tok.slice(8, 20)}" + "${tok.slice(20)}";`
};
for (const [nome, codigo] of Object.entries(variantes)) { const a = varrer(codigo); console.log(`${nome.padEnd(20)} scanner por padrão/entropia: ${a.length} achado(s) ${a.map((x) => x.regra).join(', ')}`); }
const decodificado = Buffer.from(Buffer.from(tok).toString('base64'), 'base64').toString();
console.log('qualquer pessoa com o pacote decodifica o base64 em uma linha:', decodificado === tok, '→ ofuscação não é proteção');
console.log('o pacote de um aplicativo é um arquivo (APK/IPA = zip): o atacante o recebe inteiro e roda ferramentas locais');
fs.rmSync(d, { recursive: true, force: true });
