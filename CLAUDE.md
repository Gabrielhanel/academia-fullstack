# Academia Full Stack v2 — instruções do projeto

SPA de arquivo único (JS puro, rotas por hash) com base de conhecimento (KB) própria. IA é complementar: o aluno estuda, faz exercícios e provas sem chamadas de IA. Preserve o que funciona; evolua de forma incremental e verificável. A v1 (`9191d866-2f03-45b0-9329-e83b9bfb6b6e`) não pode ser alterada.

Plano completo: `PLANO-ACADEMIA-V2.md` (aguardar aprovação do dono antes de cada etapa).

## Comandos
- `npm run seed` gera `seed/docs.json`
- `npm run build` gera `dist/index.html`; depois `cp seed/docs.json dist/seed-docs.json`
- `npm test` roda engine e e2e (jsdom); deve ficar verde antes de publicar
- Publicação: artifact `4b19ba2b-a8d1-43e4-b861-ae7ccf703f91`, arquivos `index.html` e `seed-docs.json`

## Regras
- Ao publicar conteúdo novo, suba `SEED_REV` em `src/app.html`, `seed/docs.mjs` e `seedRev` do catálogo em `seed/build.mjs`. Sem isso o banco existente não instala o conteúdo novo. Todo upgrade precisa de teste e2e com banco pré-existente.
- Persistência só conta se relida do banco real (`db_get`/`db_list`), não pela UI nem pelos testes.
- Curso novo reaproveita o molde da Onda 1: `<curso>-a.mjs`/`-b.mjs` (aulas), `<curso>-ex.mjs` (exercícios, prova `passPct`, projeto), `<curso>.mjs` (metadados, módulos, suplemento) e `makeCourse` de `seed/courses/_lib.mjs`; entra em `WAVE1` de `seed/build.mjs`. Convenções: "§" vira crase; código em `String.raw`; `DOLAR{` vira `${`.
- Correção determinística: mc, tf, bug, match, fill, trace, code (Worker, só JS), open. A prova não aceita itens `code`.
- Código de exemplo é executado ou compilado antes de publicar; referências só depois de abertas.
- Padrão de qualidade: objetivos, módulos, aulas completas, exercícios com gabarito comentado, prova final, projeto integrador, glossário, cheatsheet, mapa de pré-requisitos, referências oficiais.

## Modelos
- Sonnet: conteúdo (aulas, exercícios, provas, projetos, suplementos, referências) e tarefas bem delimitadas.
- Opus: arquitetura, segurança, integridade de dados, migrações, revisão crítica. Antes de usar, explicar o motivo e dar resumo técnico, arquivos, decisões e como validar. Troca manual com `/model`.

Decisões detalhadas: `seed/arch.md`, seção "Decisões de produção de conteúdo".
