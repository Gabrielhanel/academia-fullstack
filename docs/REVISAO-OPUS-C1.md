# Pacote de revisão para o Opus — integração da C1 (7 cursos)

Data: 2026-11-18. Preparado pelo Sonnet 5.5, conforme `CLAUDE.md` ("Opus: arquitetura, segurança, integridade de dados, migrações, revisão crítica"). **Nada aqui foi executado no banco real, publicado ou integrado ao build.**

## 1. Por que esta revisão precisa do Opus
A C1 acrescenta **7 cursos (51 aulas, 123 documentos, cerca de 1,2 MB)** a um banco que já existe e tem dados de uso. A integração mexe em três coisas que as regras do projeto reservam à revisão crítica: o **`SEED_REV`**, o comportamento do **`seedPlan`/`mergeCatalog`** em bancos pré-existentes e a **forma de publicar** (lote único ou em lotes). Um erro aqui pode gerar escrita desnecessária, instalação parcial ou conteúdo que não aparece para quem já tem banco. Este documento resume o que existe, o que foi decidido e o que ainda é decisão.

## 2. Resumo técnico do que existe
- **Conteúdo pronto e isolado:** `seed/c1/` contém, por curso, `cNN-a/b/(c).mjs` (aulas), `cNN-ex.mjs` (exercícios, prova, projeto) e `cNN-<nome>.mjs` (metadados, módulos e suplemento), exportando `COURSE` (saída de `makeCourse`), `TOPICS` e `COVER`. `seed/c1/index.mjs` lista os arquivos e `loadC1()` os carrega **dinamicamente apenas para as ferramentas** de validação; o build não os importa.
- **Cursos:** `linux-terminal-so`, `redes-http`, `ferramentas-regex`, `paradigmas-programacao`, `web-platform`, `fluxo-agilidade`, `requisitos-dominio`. Ids de aula, prova e projeto sem colisão com a Onda 1 e o piloto (checado por `validate.mjs`).
- **Verificações já feitas:** ver `RELATORIO-EXECUCAO-C1.md` (validação estrutural, 57 desafios `code` em Worker de Chrome real, 190 URLs abertas, `npm test` 125/125, hash de `docs.json` e `seed.json` inalterado).
- **Estado do app:** `SEED_REV = 3` em `src/app.html:952`, `seed/docs.mjs:6` e `seed/build.mjs:43` (`seedRev: 3`). Publicado: artefato `4b19ba2b-…`, versão 10.

## 3. Como o app instala e atualiza o seed (conferido no código)
- `installSeed` (`src/app.html:957`) só roda para o dono (`ADMIN`) quando `kb_meta/seedinfo.rev < SEED_REV`. Monta o plano com `E.seedPlan` e grava **um documento por vez** (`DB.doc(path).set`). O `seedinfo.rev` só é atualizado se **nenhuma** gravação falhar; em caso de falha, a próxima carga tenta de novo.
- `E.seedPlan` (`src/engine.js`): documento ausente → `create`; catálogo → `merge` se `cur.seedRev < d.data.seedRev`; demais documentos → `update` **somente** se `cur.seedRev != null`, `cur.seedStamp` existe, `cur.updatedAt === cur.seedStamp` (não editado) e `cur.seedRev < d.data.seedRev`; senão `skip`. Rascunhos pendentes também forçam `skip`.
- `E.mergeCatalog`: une `courses` por disciplina, acrescenta áreas, disciplinas e **trilhas que não existem** e grava `seedRev`; **nunca remove nem renomeia**.
- `seed/docs.mjs` (`put`) carimba **todo** documento do pacote com `seedRev = SEED_REV` e `seedStamp = updatedAt`.

## 4. Pontos de integração propostos (sem executar)
Arquivo `seed/build.mjs` (hoje: `WAVE1` na linha 10; usos nas linhas 40, 46, 109 e 111; `seedRev` na linha 43):
1. Importar **estaticamente** os sete `COURSE` (por exemplo, `import { COURSE as LINUX } from './c1/c11-linux-so.mjs'`) e criar `const WAVE2 = [...]` com a ordem desejada.
2. Linha 40: o vínculo de disciplinas já suporta `disciplineIds` (`[W.course.disciplineId, ...(W.course.disciplineIds || [])]`); basta incluir `WAVE2`. No app, `coursesOf` (`src/app.html:224`) e a cobertura em `src/engine.js:219` já tratam `disciplineIds`.
3. Linhas 46, 109 e 111: acrescentar `WAVE2` a projetos, referências, cursos, aulas, exercícios e avaliações. **Manter `WAVE2` depois de `WAVE1` em todas as listas** (ver D2).
4. `SEED_REV` e `seedRev` do catálogo: subir nos três lugares exigidos por `CLAUDE.md` (decisão D3).
5. Disciplinas: confirmar que as dez (`linux`, `os`, `net`, `devtools`, `regex`, `paradigms`, `browser`, `workflow`, `agile`, `requirements`) existem no catálogo (existem hoje, com `courses: []`).

## 5. Decisões para o Opus (com recomendação)

### D1. Publicar em um lote ou em dois?
- **Dois lotes (recomendado, como no plano):** lote 1 = C1.1–C1.4; lote 2 = C1.5–C1.7. Cada lote com `SEED_REV` novo (4 e 5), teste de upgrade e **releitura do banco real** (`db_list`/`db_get`) antes do seguinte. Dependências entre cursos ficam resolvidas: `web-platform` requer `redes-http` (lote 1), `requisitos-dominio` requer `fluxo-agilidade` (mesmo lote 2).
- **Lote único:** menos ciclos, mas uma falha afeta os 123 documentos de uma vez e a instalação sequencial (ver D4) fica mais longa.
- Pergunta: o Opus concorda com dois lotes e com a ordem C1.1→C1.4 / C1.5→C1.7?

### D2. Estabilidade dos ids de `kb_refs`
`build.mjs:109` cria referências com `id: 'ref-' + refs.length` percorrendo `[...PILOT.lessons, ...WAVE1.flatMap(...)]`. Os ids são **posicionais**. Se as aulas da C1 entrarem **depois** das atuais, as 190 URLs novas recebem ids novos e os existentes não mudam (URLs já vistas são ignoradas). Se entrarem **antes** ou no meio, os ids existentes deslocam e o `seedPlan` gravaria referências diferentes sob o mesmo caminho. **Recomendação:** `WAVE2` sempre depois de `WAVE1`; teste que compara os ids de `kb_refs` do pacote atual com os do novo (os existentes devem ser idênticos). O Opus deve confirmar que nada no app depende de ids de referência persistidos pelo usuário.

### D3. Qual `SEED_REV`?
- Lote 1 → `SEED_REV = 4`; lote 2 → `SEED_REV = 5` (três lugares: `src/app.html:952`, `seed/docs.mjs:6`, `seed/build.mjs:43`).
- **Observação de custo (importante):** como `put` carimba todos os documentos com o `SEED_REV` novo e `seedPlan` devolve `update` para qualquer documento não editado com `seedRev` menor, **um aumento de revisão reescreve todos os documentos existentes não editados (212 hoje) além dos novos** (123 da C1, cerca de 335 gravações sequenciais no primeiro carregamento do dono), mesmo que o conteúdo seja idêntico. Não há risco de perda (grava o mesmo conteúdo), mas há tempo de espera e mais chances de falha parcial.
- **Opção a considerar (mudança só em `docs.mjs`, sem tocar no motor):** manter nos documentos antigos o `seedRev` da sua última mudança de conteúdo (3) e carimbar com a revisão nova apenas os documentos novos ou alterados; o `SEED_REV` global continuaria sendo o portão do `installSeed` e do catálogo. Resultado: o upgrade grava só os 123 novos e o catálogo. Em contrapartida, a regra "revisão = revisão do pacote" passa a ser "revisão por documento", o que precisa ser documentado e testado, inclusive para bancos que ficaram em revisões antigas (≤ 2). **Decisão do Opus:** aceitar o custo das 335 gravações ou adotar a revisão por documento.

### D4. Instalação parcial e falhas
`installSeed` grava sequencialmente e só marca `seedinfo.rev` se todas as gravações derem certo. Se falhar no meio: os documentos já gravados ficam com a revisão nova (portanto `skip` na próxima tentativa) e os faltantes são gravados na seguinte. Isso é consistente, mas: (a) **não há transação** entre curso, aulas, exercícios e prova; um curso pode aparecer com aulas faltando até a próxima carga (o `courseChecklist` marca "aulas publicadas"); (b) o dono vê o progresso, mas **usuários comuns não instalam** (somente `ADMIN`). **Perguntas:** vale ordenar as gravações para que o documento do **curso** seja o último de cada curso (assim o curso só aparece quando suas aulas já existem)? Isso mexe na ordem do plano (hoje, a ordem do array `docs`) e precisa de teste.

### D5. Trilhas (`tracks`) e `mergeCatalog`
`mergeCatalog` **só acrescenta trilhas que não existem pelo id**; **não altera a lista `ds` de uma trilha existente**. Hoje as disciplinas da C1 estão assim nas trilhas: `linux` → `ops`; `net` → `fs-ts` e `sd`; `paradigms` → `jvm`; `workflow` e `agile` → `job`; `os`, `devtools`, `regex`, `browser` e `requirements` → **nenhuma**. Para o aluno, cursos fora de uma trilha só aparecem pela disciplina/área. Se o dono quiser incluir essas disciplinas em trilhas (por exemplo `browser`, `devtools` e `regex` em `fs-ts`), **isso não chega a bancos existentes** sem mudar o `mergeCatalog` (ou sem edição manual no admin). **Decisão do Opus e do dono:** alterar `mergeCatalog` para unir `ds` de trilhas (mudança de motor, com teste) ou deixar para uma etapa própria. O plano da C2 faz a mesma pergunta para `fe-test`, `fe-perf` e `fe-arch`; convém decidir uma vez.

### D6. Tamanho e limites
O pacote cresce de ~0,93 MB (`docs.json`) para cerca de 2,1 MB e `seed.json` de ~1,05 MB para ~2,3 MB (estimativa: + 1,22 MB de documentos da C1; o `seed.json` também inclui o índice de referências). O maior documento novo tem 19,9 KB (`kb_courses/fluxo-agilidade`), abaixo do maior atual (`kb_meta/catalog`, 30 KB). Limite de página/arquivo do Artifact: 16 MB. **Pergunta:** há limite de tamanho por documento ou de gravações do banco que ainda não foi medido? (Não há evidência de limite; apenas o catálogo de 30 KB já funciona.)

### D7. Segurança do conteúdo
- Nenhuma ocorrência de `<script`, `<iframe` ou URLs `javascript:` nos textos; ocorrências de `onerror =` estão só em blocos de código (JavaScript de exemplo).
- O renderizador de Markdown (`md()`, `src/app.html:340`) aplica `esc()` ao texto, a títulos, listas, tabelas e citações e usa `codeBlock()` para código; divide o texto por três crases, por isso o validador agora checa que cada campo tem cercas **balanceadas**. **Pedido ao Opus:** confirmar que `codeBlock()` e `inl()` (negrito, código em linha, links) não permitem HTML ativo e que os links de `refs` só aceitam `http(s)`.
- Os desafios `code` rodam no Worker isolado e não têm acesso ao DOM; os exercícios foram executados no Worker de um Chrome real (`browser-check.mjs`).

### D8. Piloto `js-async`
Continua pendente a correção do piloto no banco real (8 gravações `ArtifactData` com `if_version`, reversíveis; solução A do relatório da Onda 1). O piloto não tem `seedRev` nem `seedStamp`, portanto o `seedPlan` o pula (risco baixo). A missão da C1 proibiu tocá-lo. **Decisão do dono**, não do Opus; mas o Opus deve saber que o piloto ficará fora de qualquer upgrade por seed.

## 6. Decisões que pertencem ao dono
1. Aprovar a publicação em dois lotes (D1) e a ordem dos cursos.
2. Aprovar o custo das ~335 gravações no primeiro carregamento ou a revisão por documento (D3).
3. Incluir as disciplinas sem trilha (`browser`, `devtools`, `regex`, `os`, `requirements`) em alguma trilha (D5).
4. Revisão pedagógica humana dos textos antes de publicar (o `RELATORIO-EXECUCAO-C1.md` informa que ela ainda não foi feita).
5. Corrigir o piloto `js-async` (D8).

## 7. Como validar (comandos e testes a escrever)
Comandos que já existem:
- `node seed/c1/validate.mjs` (7 cursos, sem falhas), `node seed/c1/refs-check.mjs` (190 URLs), `node seed/c1/browser-check.mjs` (57 desafios no Chrome; ver `seed/c1/labs/README.md`), `npm test` (125/125).

Testes de upgrade a escrever **antes** de publicar (padrão do teste "Upgrade rev 2 → 3" em `test/e2e.test.cjs`):
1. **Banco em rev 3 → lote 1 (rev 4):** instala os cursos de C1.1 a C1.4 (curso, aulas, exercícios, prova e projeto); catálogo mesclado (cursos vinculados às disciplinas, inclusive via `disciplineIds`); aula **editada** pelo usuário preservada; progresso, notas e `data/users/` byte a byte iguais; nenhuma escrita em `data/users/` nem em `kb_stats/`; segunda execução idempotente; `kb-install` repetido não duplica.
2. **Banco em rev 4 → lote 2 (rev 5):** idem para C1.5 a C1.7; dependências (`requires`) resolvem.
3. **Banco vazio:** instala tudo em uma passada e a contagem de documentos bate (212 + 123 = 335 em lote único; 212 + 21 + 17 + 19 + 15 = 284 após o lote 1).
4. **Falha no meio:** simular erro na N-ésima gravação; o `seedinfo.rev` não avança; a segunda carga completa sem duplicar; nenhum documento fica com `seedStamp` inconsistente.
5. **Ids de `kb_refs`:** os existentes permanecem idênticos (D2).
6. **Documento editado pelo usuário** (curso, aula, prova) não é sobrescrito; **rascunho pendente** também não.
7. **Leitura no banco real após cada lote:** `db_list` por coleção e `db_get` de uma aula, um `exset`, a prova e o projeto de cada curso, comparando com o pacote (persistência só conta se relida do banco real).
8. **Renderização:** abrir uma aula de cada curso no app (ou jsdom) e conferir que nenhum HTML do conteúdo vira elemento ativo.

## 8. O que o Opus não precisa rever (já coberto por ferramentas)
Estrutura de cada curso, colisões de caminho, cobertura de tópicos, correção dos exercícios `code` e abertura das referências são verificadas automaticamente. A revisão deve se concentrar em **D1 a D7**.

## 9. Riscos resumidos
| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Ids de `kb_refs` deslocados | baixa (se `WAVE2` vier depois) | médio | D2: ordem fixa e teste de ids |
| ~335 gravações sequenciais no primeiro carregamento | certa (sem D3-opção) | baixo a médio (tempo, falha parcial) | revisão por documento ou aceitar o custo |
| Curso visível com aulas ainda não gravadas | possível em falha parcial | baixo | D4: gravar o documento do curso por último |
| Trilhas não atualizadas em bancos existentes | certa | baixo (UX) | D5 |
| Conteúdo desatualizar (versões) | certa com o tempo | baixo | cada curso registra versões e data de consulta; revisão semestral |
| Erro factual remanescente | média | médio | revisão pedagógica humana; três correções já feitas por checagem de fonte |
