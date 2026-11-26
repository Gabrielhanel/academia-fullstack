// Registro dos cursos da C6 (produção em lotes). Cada curso é carregado só se o arquivo existir.
import { existsSync } from 'node:fs';
export const C6_FILES = ['c61-docker-k8s', 'c62-cicd', 'c63-nginx', 'c64-cloud', 'c65-iac', 'c66-monitoramento'];
export async function loadC6() {
  const out = [];
  for (const f of C6_FILES) {
    if (!existsSync(new URL('./' + f + '.mjs', import.meta.url))) continue;
    const m = await import('./' + f + '.mjs');
    out.push({ file: f, W: m.COURSE, cover: m.COVER, topics: m.TOPICS });
  }
  return out;
}
