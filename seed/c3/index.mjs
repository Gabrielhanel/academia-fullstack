// Registro dos cursos da C3 (produção em lotes). Cada curso é carregado só se o arquivo existir.
import { existsSync } from 'node:fs';
export const C3_FILES = ['c31-sql-essencial', 'c32-sql-avancado', 'c33-postgres-mysql', 'c34-modelagem', 'c35-transacoes', 'c36-orms', 'c37-nosql', 'c38-cache'];
export async function loadC3() {
  const out = [];
  for (const f of C3_FILES) {
    if (!existsSync(new URL('./' + f + '.mjs', import.meta.url))) continue;
    const m = await import('./' + f + '.mjs');
    out.push({ file: f, W: m.COURSE, cover: m.COVER, topics: m.TOPICS });
  }
  return out;
}
