// Gera o índice dos ADRs (tabela Markdown) a partir dos arquivos: número, título, status e data.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { secao } from './adr-lint.mjs';
export function gerarIndice(dir) {
  const linhas = readdirSync(dir).filter((f) => /^\d{4}-.*\.md$/.test(f)).sort().map((f) => {
    const t = readFileSync(join(dir, f), 'utf8');
    const titulo = /^# ADR-(\d{4}): (.+)$/m.exec(t);
    return '| [' + titulo[1] + '](' + f + ') | ' + titulo[2] + ' | ' + secao(t, 'Status') + ' | ' + secao(t, 'Data') + ' |';
  });
  return ['| ADR | Título | Status | Data |', '|---|---|---|---|', ...linhas].join('\n') + '\n';
}
if (import.meta.url === 'file://' + process.argv[1]) process.stdout.write(gerarIndice(process.argv[2] || 'adrs'));
