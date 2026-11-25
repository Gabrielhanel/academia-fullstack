# Pacote de visualização local (C2–C11)

Disponibiliza no Frontend local, **por curso e já validado**, o que as ondas C2–C11 produziram, sem esperar a C11 e sem tocar em `seed/`, `src/`, `dist/`, `SEED_REV`, `seedPlan`, banco real ou artifact publicado.

## Uso
```
node preview/build-preview.mjs            # descobre cursos prontos, valida, gera preview/dist/ (incremental e idempotente)
node preview/serve.mjs 8081               # http://127.0.0.1:8081  (origem própria: não mexe nos dados da porta 8080)
node preview/build-preview.mjs --dry-run  # só mostra o que entraria
node preview/build-preview.mjs --rollback # volta ao pacote anterior (backups em preview/state/backups/)
node --test preview/test/                 # testes do gerador
```
Opções: `--waves c2,c3` limita as ondas; `--no-validate` pula `seed/cN/validate.mjs` (só depuração; o resultado fica registrado como "ignorado").

## Como funciona
1. Para cada onda `seed/cN/index.mjs` (`CN_FILES`), carrega os cursos existentes. Curso com erro de carga fica **bloqueado**.
2. **Portão**: metadados, disciplina existente no catálogo, módulos/aulas, exercícios com explicação/gabarito em toda aula, prova, projeto, glossário, cheatsheet, referências oficiais e de aula, `validateCourse/Lesson/Exercise/Bundle/Docs`, sem caminho já ocupado (base ou outra onda) e `seed/cN/validate.mjs <curso>` com código 0. Reprovou em qualquer item → não entra no pacote.
3. Gera `preview/dist/seed-docs.json` = `seed/docs.json` (intacto) + documentos dos cursos aprovados + catálogo com o vínculo curso→disciplina + página `#pg-producao-c2-c11` (status de produção).
4. Cada documento recebe `seedRev`/`seedStamp` por revisão do pacote (só sobe quando o conteúdo do documento muda). O app aplica com o **próprio** `ACT['kb-install']` → `installSeed` → `E.seedPlan`: cria o que falta, atualiza só o que veio do pacote e não foi editado, nunca sobrescreve edições nem registros do usuário, e não duplica.
5. `preview/dist/index.html` é cópia de `dist/index.html` com um script final que, ao abrir, chama `kb-install` se faltar curso do manifesto. `?nopack=1` desliga isso.

## Progresso do aluno (conclusão de aulas, provas, exercícios)
O app guarda o progresso em `localStorage` (`afs2:u:state`) da origem aberta (porta). Para não depender disso, `preview/serve.mjs` também grava o estado em **`preview/data/progress.json`** (via `PUT /__progress`, a cada mudança, com backup em `preview/data/backups/`, no máximo 1 a cada 10 min, últimos 30). Ao abrir uma origem sem progresso (outra porta, site data limpo), o estado é restaurado desse arquivo. Só funciona com `node preview/serve.mjs` (não com `python -m http.server`). Faça cópia de `preview/data/` para backup externo.

## Radar (alertas de versão e fim de suporte)
Não atualiza sozinho. `node preview/radar-update.mjs` consulta a API pública do endoflife.date (só GET, nada seu é enviado), grava `preview/state/radar.json` e depois `node preview/build-preview.mjs` leva as entradas para o pacote (inclui `lastCheck` do radarcfg). Cobre React, Next.js, React Native, Kotlin, Node.js, NestJS, PostgreSQL, Redis, Docker, Kubernetes, RabbitMQ e Kafka. Sem fonte automática: TypeScript, Flutter, Dart, Java, AWS, Azure, GCP, Jest, Vitest, Playwright, Cypress. Entradas da base oficial nunca são sobrescritas; fatos já presentes nela não são repetidos. `--dry-run` só mostra.

## Relatórios de revisão (sugestões; nada é alterado sozinho)
- `node preview/report-radar-impact.mjs` — alertas de EOL de relevância alta × aulas/cursos que citam a mesma tecnologia e versão.
- `node preview/report-versions.mjs [--force]` — versões declaradas nos cursos × mais recente estável (npm registry e endoflife.date; cache 24 h). Runtimes e bancos ainda suportados aparecem como informativo.
- `node preview/report-links.mjs [--force] [--limit N]` — testa todas as URLs do pacote (máx. 2 conexões por site, cache 7 dias): ok / redirecionado / bloqueado / quebrado.
- `node preview/refresh.mjs [--skip-links] [--skip-radar] [--force]` — tudo na ordem certa (radar → pacote → relatórios → pacote final).
Saídas em `preview/state/reports/*.md|json`; o gerador as publica como páginas `#pg-rel-radar-aulas`, `#pg-rel-versoes`, `#pg-rel-links`. Só GET/HEAD públicos, nada seu é enviado. Limitações: o cruzamento radar×aulas casa texto (pode haver falso positivo, ex. "Node 22+" como requisito mínimo); a extração de versões lê texto livre e mostra o que não conseguiu mapear; sites que bloqueiam bots aparecem como "bloqueado".

## Estado e reversão
`preview/state/manifest.json` guarda hash, revisão e resultado dos validadores por curso/documento. Antes de sobrescrever `preview/dist/` o gerador salva backup. Apagar `preview/` remove tudo; no navegador, o conteúdo instalado fica na origem do preview (porta 8081) e pode ser descartado limpando só essa origem.

## Limitações
- Persistência = `localStorage` (`afs2:kb`); o pacote C2–C4 já passa de 4 MB. O Chrome desta máquina aceitou mais de 16 milhões de caracteres; navegadores com ≈5 MB podem não comportar. Se o cache falhar, o script reinstala do `seed-docs.json` a cada abertura.
- Não é a integração oficial (que exige `seed/build.mjs`, `SEED_REV` e publicação) nem grava no banco real.
- Não gera `kb_refs` dos novos cursos; as referências aparecem nas aulas e no suplemento.
- C1 não está nas ondas do gerador.
