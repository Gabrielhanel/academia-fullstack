// Hotspots = mudança (churn) × complexidade, mais autores por arquivo (fator de ônibus). Uso: node hotspots.mjs <repo>
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
export const complexidade = (codigo) => 1 + ((codigo.match(/\b(?:if|for|while|case|catch)\b|&&|\|\||\?\?/g) || []).length);
export function lerHistorico(texto) {
  const arquivos = {}; let autor = null;
  for (const linha of texto.split('\n')) {
    if (linha.startsWith('@@')) { autor = linha.slice(2); continue; }
    const m = /^(\d+|-)\t(\d+|-)\t(.+)$/.exec(linha);
    if (!m || !autor) continue;
    const f = (arquivos[m[3]] ||= { commits: 0, linhas: 0, autores: {} });
    f.commits++; f.linhas += (m[1] === '-' ? 0 : Number(m[1])) + (m[2] === '-' ? 0 : Number(m[2])); f.autores[autor] = (f.autores[autor] || 0) + 1;
  }
  return arquivos;
}
export function ranking(arquivos, complex) {
  return Object.entries(arquivos).map(([nome, f]) => {
    const c = complex[nome] ?? 1; const total = Object.values(f.autores).reduce((a, b) => a + b, 0); const maior = Math.max(...Object.values(f.autores));
    return { nome, commits: f.commits, linhas: f.linhas, complexidade: c, pontuacao: f.commits * c, autores: Object.keys(f.autores).length, concentracao: Math.round((maior / total) * 100) };
  }).sort((a, b) => b.pontuacao - a.pontuacao || a.nome.localeCompare(b.nome));
}
if (import.meta.url === 'file://' + process.argv[1]) {
  const repo = process.argv[2];
  const log = execFileSync('git', ['log', '--numstat', '--format=@@%an'], { cwd: repo, encoding: 'utf8' });
  const arqs = lerHistorico(log); const complex = {};
  for (const nome of Object.keys(arqs)) complex[nome] = complexidade(readFileSync(join(repo, nome), 'utf8'));
  console.log('arquivo'.padEnd(18), 'commits', 'linhas', 'complex.', 'pontuação', 'autores', 'concentração');
  for (const r of ranking(arqs, complex)) console.log(r.nome.padEnd(18), String(r.commits).padStart(7), String(r.linhas).padStart(6), String(r.complexidade).padStart(8), String(r.pontuacao).padStart(9), String(r.autores).padStart(7), (r.concentracao + '%').padStart(12));
}
