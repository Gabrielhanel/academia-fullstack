// Atualização completa do preview, na ordem certa: radar → pacote → relatórios → pacote (com os relatórios como páginas).
// Uso: node preview/refresh.mjs [--skip-links] [--skip-radar] [--force]
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const R = fileURLToPath(new URL('../', import.meta.url));
const a = process.argv.slice(2); const has = (f) => a.includes(f); const force = has('--force') ? ['--force'] : [];
const steps = [
  !has('--skip-radar') && ['Radar (endoflife.date)', 'preview/radar-update.mjs', []],
  ['Pacote', 'preview/build-preview.mjs', []],
  ['Relatório: radar × aulas', 'preview/report-radar-impact.mjs', []],
  ['Relatório: versões', 'preview/report-versions.mjs', force],
  !has('--skip-links') && ['Relatório: links', 'preview/report-links.mjs', force],
  ['Pacote final (com relatórios)', 'preview/build-preview.mjs', []]
].filter(Boolean);
let falhas = 0;
for (const [nome, script, args] of steps) {
  console.log('\n=== ' + nome + ' ===');
  const r = spawnSync(process.execPath, [R + script, ...args], { cwd: R, stdio: 'inherit' });
  if (r.status !== 0) { falhas++; console.log('✖ ' + nome + ' terminou com código ' + r.status + (nome.startsWith('Pacote') ? ' — interrompendo' : ' — seguindo')); if (nome.startsWith('Pacote')) break; }
}
console.log('\n' + (falhas ? 'Concluído com ' + falhas + ' falha(s).' : 'Tudo atualizado.') + ' Recarregue http://127.0.0.1:8081 (páginas #pg-rel-radar-aulas, #pg-rel-versoes, #pg-rel-links).');
process.exit(falhas ? 1 : 0);
