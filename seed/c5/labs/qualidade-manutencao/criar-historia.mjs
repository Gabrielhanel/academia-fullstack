// Cria um repositório Git SINTÉTICO e determinístico (datas e autores fixos) para a análise de hotspots.
// Uso: node criar-historia.mjs <diretório-vazio>
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
const dir = process.argv[2]; mkdirSync(join(dir, 'src'), { recursive: true });
const git = (args, env = {}) => execFileSync('git', args, { cwd: dir, env: { ...process.env, ...env }, stdio: 'pipe' });
git(['init', '-q', '-b', 'main']); git(['config', 'user.name', 'x']); git(['config', 'user.email', 'x@x']);
const complexo = (n) => 'export function f' + n + '(a) {\n' + Array.from({ length: 12 }, (_, i) => '  if (a === ' + i + ') return ' + i + ';').join('\n') + '\n  return -1;\n}\n';
const simples = (n) => 'export const g' + n + ' = (a) => a + ' + n + ';\n';
const autores = [['Ana', 'ana@ex.com'], ['Bia', 'bia@ex.com'], ['Caio', 'caio@ex.com']];
let dia = 0; let n = 0;
const commit = (arquivos, msg, autor) => {
  const data = new Date(Date.UTC(2026, 0, 5 + dia, 12)).toISOString(); dia += 2;
  for (const [f, conteudo, modo] of arquivos) { const p = join(dir, f); (modo === 'append' ? appendFileSync : writeFileSync)(p, conteudo); git(['add', f]); }
  const [nome, email] = autores[autor];
  git(['commit', '-q', '-m', msg], { GIT_AUTHOR_NAME: nome, GIT_AUTHOR_EMAIL: email, GIT_AUTHOR_DATE: data, GIT_COMMITTER_NAME: nome, GIT_COMMITTER_EMAIL: email, GIT_COMMITTER_DATE: data });
};
commit([['src/pedido.js', complexo(0)], ['src/util.js', simples(0)], ['src/config.js', complexo(1)], ['src/legado.js', complexo(2)], ['src/relatorio.js', simples(1)]], 'inicio', 0);
for (let i = 0; i < 24; i++) commit([['src/pedido.js', complexo(10 + i), 'append']], 'pedido: regra ' + i, i % 3 === 0 ? 0 : 0);   // muita mudança e quase só uma pessoa
for (let i = 0; i < 14; i++) commit([['src/util.js', simples(10 + i), 'append']], 'util: helper ' + i, i % 3);                      // muita mudança, simples, várias pessoas
for (let i = 0; i < 3; i++) commit([['src/relatorio.js', simples(30 + i), 'append']], 'relatorio: ajuste ' + i, 1);
commit([['src/config.js', complexo(40), 'append']], 'config: nova chave', 2);
console.log('commits:', git(['rev-list', '--count', 'HEAD']).toString().trim());
