// Registro dos cursos da C1. Cada curso é carregado só se o arquivo existir (produção em lotes).
import { existsSync } from 'node:fs';
export const C1_FILES = ['c11-linux-so', 'c12-redes', 'c13-ferramentas', 'c14-paradigmas', 'c15-web-platform', 'c16-fluxo', 'c17-requisitos'];
export async function loadC1() {
  const out = [];
  for (const f of C1_FILES) {
    if (!existsSync(new URL('./' + f + '.mjs', import.meta.url))) continue;
    const m = await import('./' + f + '.mjs');
    out.push({ file: f, W: m.COURSE, cover: m.COVER, topics: m.TOPICS });
  }
  return out;
}
