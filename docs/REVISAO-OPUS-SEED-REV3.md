# Pacote de revisão (Opus) — SEED_REV 2 → 3

## Arquivos modificados
- `src/app.html:952` — `SEED_REV=3`
- `seed/docs.mjs:6` — `SEED_REV = 3` (todo doc do pacote sai com `seedRev: 3`)
- `seed/build.mjs:43` — `seedRev: 3` no catálogo
- `seed/pilot.mjs` — `techVersions` por aula (herda `course.versions`) e `supplement` do `js-async`
- `test/e2e.test.cjs` — teste existente atualizado (rev esperado 3) e novo teste de upgrade
- `dist/index.html`, `dist/seed-docs.json` — regenerados (não publicados)
- Não houve mudança em `src/engine.js` (`seedPlan`/`mergeCatalog`).

## Comportamento anterior e novo
- Antes: `installSeed` só roda se `kb_meta/seedinfo.rev < SEED_REV`. Com o banco em 2 e `SEED_REV=2`, nada era instalado.
- Agora: banco em 2 < 3, então roda `installSeed`. Nenhuma outra referência à versão existe (`grep` em src, seed, test e docs).

## Estratégia de upgrade (inalterada, só dispara de novo)
`E.seedPlan` por documento:
- ausente no banco → `create`;
- presente, `seedRev` menor, `updatedAt === seedStamp` (não editado) e sem rascunho pendente → `update`;
- qualquer outro caso → `skip` (edição do admin protegida);
- catálogo → `merge` (`mergeCatalog`: só acrescenta cursos e disciplinas, nunca remove nem renomeia).
Gravação doc a doc. O marcador `seedinfo.rev` só sobe se nenhuma gravação falhar, então uma falha parcial é retomada na visita seguinte. Só o ADMIN executa. Dados de aluno (`data/users/*`) e `kb_stats` não entram no plano.

## Riscos
- Duplicação: ids são caminhos de documento, então `set` no mesmo caminho não duplica. O merge do catálogo usa união de conjunto. Coberto pelo teste.
- Sobrescrita: docs de rev 2 não editados (inclusive o piloto) são atualizados para o conteúdo novo. É o desenho do mecanismo, mas é uma troca de conteúdo; edições do admin ficam protegidas.
- Reversão: não há rollback automático. Antes de abrir a v2, o dono deve exportar a base (CMS → Importar/exportar). Isso é recomendado, não verificado aqui.
- Fora do alcance: o upgrade real depende do `fetch('seed-docs.json')` no artifact publicado e do `isOwner()` verdadeiro.

## Testes
- `npm test`: 125/125 (124 anteriores + upgrade). Antes da correção eram 124.
- O novo teste parte de banco com `seedinfo.rev=2`, tudo carimbado rev 2, só curso 1 (Lógica) e piloto, e catálogo sem os cursos 2–5. Verifica:
  - cursos 2–5 instalados com módulos, aulas, exercícios, prova e projeto;
  - vínculos no catálogo, sem repetição, nome editado preservado;
  - `seedinfo.rev=3`;
  - aula editada pelo admin preservada;
  - `data/users/aluno1/state` e `kb_stats/u1` idênticos byte a byte, sem escrita neles, nenhum documento apagado;
  - suplemento do piloto instalado;
  - segunda execução: 0 gravações, mesmo tamanho do banco; reinstalação manual (`kb-install`) idem.
- Controle negativo: com `SEED_REV=2` no app o teste falha (marcador não sobe); restaurado para 3 e reconstruído.
- Checklist de todas as aulas do seed (212 documentos no pacote): 0 falhas (inclui as 7 do piloto, antes sem `techVersions`).

## Limite
Os testes usam banco simulado (mock). Não provam persistência no banco real; isso exige o dono abrir a v2 e a releitura via `db_get`/`db_list`.
