// Registro dos cursos da C7 (produção em lotes). Cada curso é carregado só se o arquivo existir.
import { existsSync } from 'node:fs';
export const C7_FILES = ['c71-owasp', 'c72-vulnerabilidades-web', 'c73-criptografia', 'c74-secure-coding'];
export async function loadC7() {
  const out = [];
  for (const f of C7_FILES) {
    if (!existsSync(new URL('./' + f + '.mjs', import.meta.url))) continue;
    const m = await import('./' + f + '.mjs');
    out.push({ file: f, W: m.COURSE, cover: m.COVER, topics: m.TOPICS });
  }
  return out;
}
