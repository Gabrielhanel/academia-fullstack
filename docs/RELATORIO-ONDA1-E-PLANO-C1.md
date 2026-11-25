# Academia v2 — Relatório definitivo da Onda 1 e plano da C1

Data: 2026-11-18. Fonte: leitura direta do banco real do artifact `4b19ba2b…` (versão 10) com `list`/`get` (ArtifactData), comparada ao `seed/docs.json` e ao `src/engine.js` (checklists e cobertura). O seed e os testes não foram usados como evidência de persistência.

## 1. Relatório definitivo da Onda 1

| Critério | Resultado | Evidência (banco real) | Status |
| --- | --- | --- | --- |
| 5 cursos persistidos | Lógica, Git, HTML/CSS, JavaScript e TypeScript estão no banco; 0 duplicados | `kb_courses`: 6 documentos (os 5 + piloto `js-async`) | Aprovado |
| Marcador do seed | `seedinfo.rev = 3`, 156 documentos gravados; catálogo `seedRev = 3` | `kb_meta/seedinfo`, `kb_meta/catalog` | Aprovado |
| Módulos e aulas | 3+4+3+3+3 módulos; 9+7+7+7+7 = 37 aulas, todas existentes, sem aula em dois módulos, `courseId` correto | `kb_courses`, `kb_lessons` (44 = 37 + 7 do piloto) | Aprovado |
| Exercícios e gabaritos | 196 exercícios nos 5 cursos (228 com o piloto); 0 erros de `validateExercise` (gabarito, explicação, critérios) | `kb_exsets`: 44 conjuntos | Aprovado |
| Provas e aprovação | 5 provas de 12 itens, `passPct` 70, nenhum item `code` | `kb_assess` | Aprovado |
| Projetos integradores | 5 projetos ligados ao curso certo (`planejador-entregas`, `gerador-release`, `auditor-acessibilidade`, `mini-store`, `validador-tipado`) | `kb_projects` (18 = 12 da v1 + 6) | Aprovado |
| Glossário e suplementos | Os 5 têm glossário, cheatsheet, erros comuns, mapa de pré-requisitos, referências oficiais e prática | `kb_courses/<id>.supplement` | Aprovado |
| Referências e metadados | 84 referências com URLs únicas; `techVersions` presente em todas as aulas dos 5 cursos | `kb_refs`, checklist de aulas | Aprovado |
| Vínculos | Cada curso aponta só para aulas, prova e projeto próprios; 0 aulas, exercícios, provas ou projetos órfãos; catálogo liga cada curso às disciplinas que ele declara e vice-versa (Lógica → lógica, estruturas de dados, Big O; HTML/CSS → HTML, CSS, acessibilidade) | auditoria cruzada | Aprovado |
| Igualdade com o pacote | 176 documentos idênticos ao seed; 0 ausentes; 0 extras | comparação campo a campo | Aprovado |
| Cobertura | 6 cursos, 44 aulas, 228 exercícios, 0 pendências; 9 de 86 disciplinas cobertas, 77 sem curso | `E.coverage` sobre o banco | Aprovado |
| Dados anteriores e progresso | Seu estado (`data/users/<você>/state`) intacto: curso `js-async` iniciado, perfil, radar e minutos preservados | leitura do documento | Aprovado (só a sua conta) |
| Trilha de auditoria | 6 registros `seed`: Lógica atualizada (v1→v2), Git, HTML/CSS, JS e TS instalados | `kb_audit` | Aprovado |
| Persistência após recarga | `seedinfo.rev=3` e todos os documentos relidos depois da sua abertura e recarga | leitura posterior | Aprovado |
| Piloto `js-async` | Sem suplemento; as 7 aulas sem `techVersions` (7 falhas de checklist) | `kb_courses/js-async`, `kb_lessons/jsa-*` | Pendente (baixo risco) |
| CMS (revisão → publicação) | Não exercitado no banco real; só nos testes | `kb_drafts`/`kb_reviews` vazios | Não verificável |
| Progresso de outros alunos | Só leio o meu usuário (regras do banco); `kb_stats` está vazio | `kb_stats` | Não verificável |

**Parecer:** os cinco cursos estão persistidos e íntegros. Os critérios essenciais passam. O piloto `js-async` não é um dos cinco, mas tem pendência. Recomendo aprovar a Onda 1 com essa ressalva, e tratar o piloto antes da C1 ou junto dela.

## 2. Pendência encontrada e proposta (nada foi corrigido)

**Causa:** o piloto foi gravado quando o pacote ainda não carimbava `seedRev`/`seedStamp`. O `seedPlan` só atualiza documento com carimbo e `updatedAt` igual ao do pacote, então tratou o piloto como "editado" e o pulou. É o comportamento protetor do mecanismo, não um defeito novo.

**Risco de manter:** baixo. As aulas do piloto não passam no checklist de publicação (campo versão), e o curso fica sem glossário e cheatsheet. Não afeta os cinco cursos nem o progresso.

**Soluções:**
- **A (recomendada):** 8 gravações pontuais via `ArtifactData` com `if_version`: `kb_courses/js-async.supplement` e `techVersions` em `kb_lessons/jsa-01..07`. Só acrescentam campos novos, não mudam código nem publicação, e voltam atrás removendo os campos (`__delete__`). O conteúdo vem do `seed/pilot.mjs`, já testado.
- **B:** `SEED_REV` 4 e regra nova no `seedPlan` para adotar documentos sem carimbo. Mexe no motor de migração, tem risco de sobrescrever edições e exigiria o Opus. Não vale por 8 campos.

Informativo: 18 referências antigas (`ref-0..17`) diferem do seed só em metadados (`updatedAt`, `tech`, `lessonIds`). Não é problema e não precisa de ação.

## 3. Plano da C1 — Base da Web e do Ofício (proposta; nada produzido)

O catálogo tem 10 disciplinas e 43 tópicos. Proponho **7 cursos**, mantendo os 43 tópicos e cada disciplina ligada ao seu curso. O formato já existe (`disciplineIds` agrupa várias disciplinas, como a Lógica faz com 3), então **não muda o formato de exercício nem o esquema**.

| # | Curso | Disciplinas | Tópicos | Aulas | Nível |
| --- | --- | --- | --- | --- | --- |
| C1.1 | Linux, terminal e sistemas operacionais | Linux/Shell + Sistemas operacionais | 9 | 9 | I→A |
| C1.2 | Redes de computadores e HTTP | Redes | 5 | 7 | I→A |
| C1.3 | Ferramentas do desenvolvedor e expressões regulares | Ferramentas + Regex | 8 | 8 | I→A |
| C1.4 | Paradigmas de programação | Paradigmas | 3 | 6 | M→A |
| C1.5 | APIs do navegador e Web Platform | Web Platform | 5 | 7 | I→A |
| C1.6 | Fluxo profissional e agilidade | Fluxo + Agilidade | 8 | 7 | I→A |
| C1.7 | Requisitos e modelagem de domínio | Requisitos | 5 + "Levantamento de requisitos" | 7 | I→A |
| | **Total** | **10** | **43** | **51** | |

"Levantamento de requisitos" está em Agilidade, mas é tema do C1.7; ele é ensinado lá e referenciado no C1.6, sem duplicar a aula.

### Conteúdo por curso

**C1.1 Linux, terminal e SO.**
- Objetivos: navegar e operar o sistema pelo terminal; entender processos, threads, memória e I/O; escrever scripts de automação; diagnosticar um servidor.
- Módulos: (1) arquivos, comandos essenciais e permissões (3 aulas); (2) processos, threads, memória e I/O (3); (3) Shell Script, automação e troubleshooting (3).
- Pré-requisitos: Lógica de programação, Git (terminal).
- Exercícios e prova: ~4 por aula (mc, tf, bug, fill, trace, open); prova de 12 itens sem `code`. Comandos shell não rodam no laboratório, então são corrigidos por `fill`/`trace`/`mc`.
- Projeto: script de backup e rotação de logs, com checklist de troubleshooting.
- Referências oficiais: GNU Bash Reference Manual, man7.org (páginas do Linux), POSIX (opengroup.org), documentação do kernel.
- Dependências: base de Docker, CI/CD, Nginx e cloud (C6); concorrência (C1.4).

**C1.2 Redes e HTTP.**
- Objetivos: explicar TCP/IP e DNS; ler uma requisição HTTP/HTTPS; comparar HTTP/1.1, HTTP/2 e HTTP/3; escolher protocolo de comunicação.
- Módulos: (1) camadas, TCP/IP e DNS (2 aulas); (2) HTTP, HTTPS/TLS e protocolos (3); (3) HTTP/2, HTTP/3 e diagnóstico (2).
- Pré-requisitos: nenhum além de lógica; Linux ajuda no diagnóstico.
- Projeto: relatório de diagnóstico de uma requisição (DNS → TCP → TLS → HTTP) com `curl`/DevTools.
- Referências oficiais: RFC 9110 (HTTP), RFC 9112/9113/9114, RFC 1035 (DNS), MDN HTTP.
- Dependências: Web Platform (WebSockets/SSE), APIs REST (C4), Nginx (C6), segurança (C7).

**C1.3 Ferramentas do desenvolvedor e regex.**
- Objetivos: usar editor, terminal e depurador; configurar ESLint, Prettier e hooks de Git; escrever regex legíveis e seguras.
- Módulos: (1) editor, terminal e depuração no navegador e no Node.js (3 aulas); (2) linters, formatadores, scripts e hooks (2); (3) regex: classes e quantificadores, grupos, âncoras e lookarounds, backtracking (3).
- Pré-requisitos: JavaScript, Git.
- Exercícios: regex e trechos de JS rodam no laboratório (`code`); o resto vai em bug, fill e mc.
- Projeto: repositório com ESLint, Prettier, hook de pré-commit e um validador de formatos com regex testada.
- Referências oficiais: documentação do ESLint, Prettier, Node.js (debugger), Chrome DevTools, MDN (RegExp).
- Dependências: Testes (C5), CI/CD (C6).

**C1.4 Paradigmas de programação.**
- Objetivos: aplicar OOP e programação funcional; entender concorrência x paralelismo e escolher entre modelos.
- Módulos: (1) orientação a objetos (2 aulas); (2) programação funcional (2); (3) concorrência e paralelismo (2).
- Pré-requisitos: JavaScript e TypeScript; o módulo 3 usa processos e threads (C1.1).
- Exercícios: `code` em JS (verificáveis); projeto: o mesmo problema resolvido em OOP e em estilo funcional, com comparação.
- Referências oficiais: MDN (classes, closures), TC39, documentação do TypeScript.
- Dependências: Clean Code/SOLID e Design Patterns (C5), arquitetura (C8), Java e Kotlin (C9).

**C1.5 APIs do navegador e Web Platform.**
- Objetivos: usar DOM e eventos; persistir dados no cliente; delegar trabalho a Workers; entender Service Workers e PWA; escolher entre WebSockets e SSE.
- Módulos: (1) DOM, eventos e Storage/IndexedDB/Cache API (3 aulas); (2) Web Workers (1); (3) Service Workers, PWA, WebSockets e SSE (3).
- Pré-requisitos: JavaScript, HTML/CSS, Redes (C1.2).
- Exercícios: as APIs não rodam no Worker do laboratório, então vão em mc, bug, fill, trace e match; os exemplos de código são executados em navegador real antes de publicar.
- Projeto: PWA offline com cache e sincronização.
- Referências oficiais: MDN Web APIs, HTML Living Standard, W3C Service Workers.
- Dependências: React/Next.js (C2), performance frontend (C2).

**C1.6 Fluxo profissional e agilidade.**
- Objetivos: abrir e revisar Pull Requests; escolher Git Flow ou trunk-based; documentar tecnicamente; aplicar Scrum e Kanban e fazer estimativas.
- Módulos: (1) Pull Requests, code review, documentação técnica (3 aulas); (2) Git Flow x trunk-based (1); (3) Scrum, Kanban e estimativas (3).
- Pré-requisitos: Git e GitHub.
- Exercícios: mc, tf, open com rubrica, match, bug (diff comentado); projeto: guia de contribuição, modelo de PR e uma simulação de sprint.
- Referências oficiais: Scrum Guide, docs do GitHub, Conventional Commits, trunkbaseddevelopment.com.
- Dependências: CI/CD (C6), qualidade (C5).

**C1.7 Requisitos e modelagem de domínio.**
- Objetivos: separar requisitos funcionais e não funcionais; escrever histórias com critérios de aceitação; conduzir Event Storming; especificar por exemplos (BDD); modelar um domínio com DDD.
- Módulos: (1) requisitos e histórias (2 aulas); (2) Event Storming e BDD (2); (3) DDD e levantamento de requisitos (3).
- Pré-requisitos: C1.6; lógica.
- Exercícios: open com rubrica, match, mc; projeto: especificação e modelo de domínio de um sistema pequeno.
- Referências oficiais: Gherkin/Cucumber docs, Domain-Driven Design Reference (Evans, livro), eventstorming.com.
- Dependências: arquitetura (C8), testes (C5), modelagem de dados (C3).

### Decisões que precisam de revisão do Opus
1. **Agrupamento em 7 cursos** e o vínculo de curso a mais de uma disciplina (já suportado, mas muda o desenho do catálogo e da cobertura).
2. **Exercícios de shell, redes e APIs do navegador**: o laboratório só executa JS; manter os formatos atuais dá correção determinística, mas com menos prática executável. Executar shell ou DOM é Trilha A, fora desta etapa.
3. **Publicação por onda:** `SEED_REV` 4 e teste de upgrade com banco em rev 3, incluindo a regra do piloto.
4. **Pilot**: se escolher a solução B, o Opus revisa a mudança no `seedPlan`.

## 4. Critérios de aceite da C1
- 7 cursos persistidos no banco real e relidos via `get`/`list`, sem duplicados nem órfãos.
- Os 43 tópicos do catálogo mapeados a aulas, e as 10 disciplinas ligadas aos cursos no catálogo.
- Checklist editorial sem falhas em todas as aulas, cursos, exercícios e provas.
- Cada curso com objetivos, módulos, aulas completas, exercícios com gabarito comentado, prova (12 itens, 70%), projeto, glossário, cheatsheet, mapa de pré-requisitos e referências oficiais.
- Exemplos executados ou testados com a ferramenta real (bash, curl, Node, navegador); referências oficiais abertas e datadas.
- `SEED_REV` 4 nos três pontos, teste e2e de upgrade a partir da rev 3 e idempotência.
- `npm test` verde; cobertura 9 → 19 disciplinas; os cinco cursos da Onda 1 e o piloto sem alteração.
- Relatório de fechamento no formato desta auditoria, aprovado por você.

## 5. Ordem de produção recomendada
1. **C1.1 Linux + SO:** pré-requisito de Docker, CI e servidores; shell é verificável no ambiente real.
2. **C1.2 Redes e HTTP:** base de Web Platform, APIs e segurança.
3. **C1.3 Ferramentas + Regex:** melhora o trabalho de todos os cursos seguintes; é o que mais usa o laboratório JS.
4. **C1.4 Paradigmas:** usa threads do C1.1; alto valor com baixo risco técnico.
5. **C1.5 Web Platform:** precisa de Redes e dos exemplos testados em navegador real.
6. **C1.6 Fluxo + agilidade:** só depende de Git.
7. **C1.7 Requisitos e DDD:** o mais conceitual; fecha a onda e prepara C5 e C8.

Publicação em **dois lotes** (C1.1–C1.4 e C1.5–C1.7), cada um com `SEED_REV` novo, teste de upgrade e releitura do banco antes do próximo. Isso reduz o risco de um lote grande quebrar o upgrade.

## 6. Pendências
- Piloto `js-async` (decidir A ou B).
- CMS no banco real e progresso de outros alunos: não verificáveis por mim.
- Aprovação sua do plano e do agrupamento em 7 cursos antes de produzir qualquer aula.

## 7. Visão das 77 disciplinas
A C1 cobre 10. Restam 67, nas ondas C2–C11 do plano. A decisão aberta (agrupar ou 1 curso por disciplina) fica resolvida com o critério acima: agrupar onde o ementa tem 2–5 tópicos, curso próprio acima de 8 tópicos. Nenhuma disciplina sai do escopo.
