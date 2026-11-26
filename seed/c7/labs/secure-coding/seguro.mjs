// Laboratório C7.4 (parte 1): secure coding. Pares vulnerável x corrigido. Uso educacional, local; payloads inofensivos (echo e variável global marcadora).
import fs from 'node:fs';
import path from 'node:path';
import { exec, execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pexec = promisify(exec), pexecFile = promisify(execFile);

// 1. Path traversal
export const lerVulneravel = (base, nome) => fs.readFileSync(path.join(base, nome), 'utf8');
export function lerSeguro(base, nome) {
  if (typeof nome !== 'string' || nome.includes('\0')) throw new Error('nome inválido');
  const raiz = fs.realpathSync(base);
  const alvo = path.resolve(raiz, nome);
  if (alvo !== raiz && !alvo.startsWith(raiz + path.sep)) throw new Error('fora do diretório permitido');
  const real = fs.realpathSync(alvo);                       // resolve symlinks
  if (!real.startsWith(raiz + path.sep)) throw new Error('fora do diretório permitido (symlink)');
  return fs.readFileSync(real, 'utf8');
}

// 2. Injeção de comando
export const checarVulneravel = async (host) => (await pexec('echo checando ' + host)).stdout.trim();
export async function checarSeguro(host) {
  if (!/^[A-Za-z0-9]([A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$/.test(host)) throw new Error('host inválido');
  return (await pexecFile('echo', ['checando', host])).stdout.trim();
}

// 3. ReDoS
export const emailVulneravel = (s) => /^([a-zA-Z0-9]+)+@exemplo\.test$/.test(s);
export const emailSeguro = (s) => s.length <= 254 && /^[a-zA-Z0-9]+@exemplo\.test$/.test(s);

// 4. Poluição de protótipo
export function mesclarVulneravel(destino, origem) {
  for (const k of Object.keys(origem)) {
    if (origem[k] && typeof origem[k] === 'object') { destino[k] = destino[k] || {}; mesclarVulneravel(destino[k], origem[k]); } else destino[k] = origem[k];
  }
  return destino;
}
export function mesclarSeguro(destino, origem) {
  for (const k of Object.keys(origem)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    if (origem[k] && typeof origem[k] === 'object' && !Array.isArray(origem[k])) { destino[k] = Object.hasOwn(destino, k) && typeof destino[k] === 'object' ? destino[k] : {}; mesclarSeguro(destino[k], origem[k]); } else destino[k] = origem[k];
  }
  return destino;
}

// 5. eval x parser
export const calcularVulneravel = (expr) => eval(expr);
export function calcularSeguro(expr) {
  if (!/^[0-9+\-*/(). ]+$/.test(expr)) throw new Error('expressão inválida');
  const tok = expr.match(/\d+(?:\.\d+)?|[+\-*/()]/g) || []; let i = 0;
  const primario = () => { const t = tok[i++]; if (t === '(') { const v = soma(); if (tok[i++] !== ')') throw new Error('expressão inválida'); return v; } if (t === '-') return -primario(); if (t === undefined || !/^\d/.test(t)) throw new Error('expressão inválida'); return Number(t); };
  const produto = () => { let v = primario(); while (tok[i] === '*' || tok[i] === '/') { const o = tok[i++]; const d = primario(); v = o === '*' ? v * d : v / d; } return v; };
  const soma = () => { let v = produto(); while (tok[i] === '+' || tok[i] === '-') { const o = tok[i++]; const d = produto(); v = o === '+' ? v + d : v - d; } return v; };
  const r = soma(); if (i !== tok.length) throw new Error('expressão inválida'); return r;
}

// 6. Dinheiro
export const somarFloat = (precos) => precos.reduce((a, b) => a + b, 0);
export const somarCentavos = (precosEmCentavos) => precosEmCentavos.reduce((a, b) => a + b, 0);
