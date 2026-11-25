// Registro dos cursos da C5 (produção em lotes). Cada curso é carregado só se o arquivo existir.
import { existsSync } from 'node:fs';
export const C5_FILES = ['c51-clean-code', 'c52-patterns', 'c53-arquitetura-docs', 'c54-testes', 'c55-testes-js', 'c56-testes-avancados', 'c57-internals', 'c58-qualidade'];
export async function loadC5() {
  const out = [];
  for (const f of C5_FILES) {
    if (!existsSync(new URL('./' + f + '.mjs', import.meta.url))) continue;
    const m = await import('./' + f + '.mjs');
    out.push({ file: f, W: m.COURSE, cover: m.COVER, topics: m.TOPICS });
  }
  return out;
}
