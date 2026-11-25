// Registro dos cursos da C4 (produção em lotes). Cada curso é carregado só se o arquivo existir.
import { existsSync } from 'node:fs';
export const C4_FILES = ['c41-node-express', 'c42-nestjs', 'c43-apis', 'c44-auth', 'c45-filas', 'c46-observabilidade', 'c47-microsservicos', 'c48-python'];
export async function loadC4() {
  const out = [];
  for (const f of C4_FILES) {
    if (!existsSync(new URL('./' + f + '.mjs', import.meta.url))) continue;
    const m = await import('./' + f + '.mjs');
    out.push({ file: f, W: m.COURSE, cover: m.COVER, topics: m.TOPICS });
  }
  return out;
}
