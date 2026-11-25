import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

function arquivosMd(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivosMd(p) : n.endsWith('.md') ? [p] : [];
  });
}
function linksQuebrados(raiz) {
  const problemas = [];
  for (const arq of arquivosMd(raiz)) {
    const texto = readFileSync(arq, 'utf8');
    for (const m of texto.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const alvo = m[1].split('#')[0];
      if (!alvo || /^[a-z]+:/i.test(alvo)) continue;
      if (!existsSync(resolve(dirname(arq), alvo))) problemas.push(arq + ' -> ' + m[1]);
    }
  }
  return problemas;
}
console.log(linksQuebrados('docs'));
const regras = [
  ['/src/pagamentos/', ['@equipe-pagamentos']],
  ['*.sql', ['@dba']],
  ['/docs/', ['@equipe-docs']]
];
function donos(caminho) {
  let resp = [];
  for (const [padrao, donos] of regras) {
    const ancorado = padrao.startsWith('/');
    const casa = padrao.endsWith('/')
      ? (ancorado ? caminho.startsWith(padrao.slice(1)) : ('/' + caminho).includes(padrao))
      : padrao.startsWith('*.') ? caminho.endsWith(padrao.slice(1)) : caminho === padrao.replace(/^\//, '');
    if (casa) resp = donos;
  }
  return resp;
}
console.log(donos('src/pagamentos/pix.js'), donos('db/schema.sql'), donos('README.md'));
