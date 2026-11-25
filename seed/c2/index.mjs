// Registro dos cursos da C2 (produção em lotes). Cada curso é carregado só se o arquivo existir.
import { existsSync } from 'node:fs';
export const C2_FILES = ['c21-react-essencial', 'c22-tailwind-ds', 'c23-react-avancado', 'c24-estado', 'c25-nextjs', 'c26-testes-front', 'c27-performance', 'c28-arquitetura'];
export async function loadC2() {
  const out = [];
  for (const f of C2_FILES) {
    if (!existsSync(new URL('./' + f + '.mjs', import.meta.url))) continue;
    const m = await import('./' + f + '.mjs');
    out.push({ file: f, W: m.COURSE, cover: m.COVER, topics: m.TOPICS });
  }
  return out;
}
