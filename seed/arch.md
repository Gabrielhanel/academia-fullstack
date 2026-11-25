Esta página documenta a arquitetura da v2: o que roda hoje e como evoluir para produção. Ela fica na base de conhecimento e pode ser editada na gestão de conteúdo.

## Princípio
O conhecimento pertence à plataforma. Cursos, aulas, exercícios, avaliações, projetos e referências ficam no banco, versionados. A visualização só lê o que está publicado. A IA é um recurso complementar e pode ser desligada em Configurações sem afetar o estudo.

| Funciona sem IA | Usa IA (opcional) |
|---|---|
| Catálogo, cursos, aulas, exemplos de código | Tirar dúvidas sobre uma aula |
| Exercícios e avaliações com correção automática | Explicar um erro de exercício de outra forma |
| Laboratório com testes automatizados | Analisar código e interpretar erros |
| Progresso, revisão espaçada, histórico, relatórios | Plano de revisão personalizado |
| Pesquisa na base, biblioteca, radar, recomendações | Explicar ou comparar resultados de pesquisa |

## Separação por domínios
1. **Conteúdo educacional (KB):** catálogo, cursos, aulas, páginas de referência. Coleções `kb_meta`, `kb_courses`, `kb_lessons`, `kb_pages`.
2. **Gestão de aprendizagem (LMS):** progresso por curso e aula, minutos, histórico, revisão espaçada (SM-2). Documento privado por aluno em `data/users/<id>/state`.
3. **Exercícios e avaliações:** `kb_exsets` (por aula) e `kb_assess` (por curso). Correção determinística no módulo Engine.
4. **Projetos e laboratório:** `kb_projects` (com testes opcionais) e execução isolada em Web Worker.
5. **Pesquisa e referências:** `kb_refs` (biblioteca da plataforma) e biblioteca pessoal no estado do aluno.
6. **Inteligência artificial:** módulo AI, isolado, sem escrita na base.

Fluxo editorial: `kb_drafts` (rascunhos de itens publicados), `kb_versions` (versões anteriores), `kb_reviews` (fila de revisão). Rascunhos, versões e fila só são visíveis ao administrador.

## Fluxo de revisão e publicação
1. O administrador edita no CMS. Se o item já está publicado, a edição vira um rascunho separado; os alunos continuam vendo a versão publicada.
2. O rascunho pode ser enviado para revisão.
3. Ao publicar, a versão anterior é arquivada em `kb_versions` e a nova ganha número de versão. Qualquer versão pode ser restaurada como rascunho.
4. O Radar e a Pesquisa só criam **sugestões** na fila de revisão. Nenhuma atualização altera conteúdo publicado automaticamente.

## Exercícios
Tipos: múltipla escolha, verdadeiro ou falso, associação, preenchimento de código, identificação de erro (correção automática), desafio de programação (testes automatizados), resposta aberta e exercício prático (autoavaliação com critérios cadastrados). Cada exercício guarda enunciado, resposta esperada, explicação, critérios, dificuldade e pontos; cada tentativa guarda resultado e data.

## Laboratório e execução segura
Nesta versão, JavaScript roda em um **Web Worker** criado a partir de um blob, no navegador do aluno: sem acesso ao DOM, sem acesso à rede (bloqueada pela política de segurança da página) e com tempo máximo de execução. Nada roda no servidor.

Para outras linguagens em produção: um serviço de execução separado do servidor principal, com containers efêmeros sem rede, limites de CPU, memória e tempo, e isolamento adicional (por exemplo, gVisor ou Firecracker). Uma opção pronta é hospedar o Judge0. A API principal só envia código e casos de teste para esse serviço e recebe o resultado.

## Central de Pesquisa Técnica
Hoje: busca local em toda a base (aulas, cursos, disciplinas, referências, radar, páginas, projetos) e links prontos para a busca de fontes oficiais (MDN, documentações por tecnologia, GitHub, npm, pub.dev, Maven Central, OSV.dev, NVD, OWASP, IETF). O aluno lê na fonte e salva a referência com URL, data, versão e confiabilidade. A página não consegue buscar na web por conta própria, porque a política de segurança bloqueia chamadas externas; por isso nenhum resultado externo é exibido como se tivesse sido coletado.

Produção: uma interface `SearchProvider` no backend, com adaptadores trocáveis. Opções levantadas em novembro de 2026:
- **Web search da Anthropic API** (ferramenta de servidor `web_search_20250305` ou versões posteriores): US$ 10 por 1.000 buscas, mais tokens; aceita `allowed_domains` para restringir a documentação oficial e devolve citações. Fonte: https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/web-search-tool
- **Tavily** (1.000 créditos por mês no plano gratuito, segundo a documentação: https://docs.tavily.com/documentation/api-credits) e **Exa** como alternativas.
- **Não usar:** Bing Web Search API (aposentada em 11/08/2025) e Google Custom Search JSON API (fechada a novos clientes; descontinuação anunciada para 01/01/2027: https://developers.google.com/custom-search/v1/overview).
- Os termos de armazenamento de resultados variam por provedor. Verifique antes de guardar resultados em cache; guarde sempre a sua síntese e a URL de origem.

## Radar de Conhecimento
Hoje: atualizações registradas com fonte, data, versão, tipo e relevância. A chave de deduplicação combina domínio da fonte, tecnologia, tipo e versão; registros repetidos são recusados. Relevância por CVSS: 9,0 a 10 crítica, 7,0 a 8,9 alta, 4,0 a 6,9 média, abaixo disso informativa. Notificações só aparecem para itens novos, nas tecnologias acompanhadas e acima da relevância mínima escolhida. Sem novidades, nada é notificado.

As entradas iniciais foram verificadas em endoflife.date em 17/11/2026. É uma fonte comunitária: confirme nas notas de release oficiais antes de decisões importantes.

Produção (coleta automática):
- Jobs repetíveis por fonte em uma fila (por exemplo, BullMQ com Redis): GitHub Releases dos repositórios oficiais, endoflife.date (API v1), OSV.dev (`POST /v1/querybatch`) e NVD API 2.0.
- Limites documentados: GitHub REST com 60 requisições por hora sem autenticação e 5.000 com token (https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api). NVD: 5 requisições por 30 s sem chave e 50 com chave.
- Deduplicação no banco com chave única `(source, external_id)`, por exemplo `github:nodejs/node:v26.13.1` ou o ID OSV/GHSA/CVE.
- A IA só resume itens já coletados de fontes oficiais, nunca "descobre" versões. Para economizar, use a Message Batches API (50% de desconto).
- Alternativa sem backend: uma tarefa agendada do Claude que verifica as fontes e grava itens novos nesta base, mantendo as mesmas regras de deduplicação.

## Segurança das integrações
- Chaves de API ficam só no backend (variáveis de ambiente ou gerenciador de segredos), nunca no frontend.
- Conteúdo vindo da internet é tratado como dado não confiável: vai para a IA delimitado e com instrução explícita para não seguir comandos contidos nele.
- A IA só pode citar aulas que existem: links internos para aulas inexistentes são removidos da resposta.

## Credenciais (produção)
| Variável | Para quê | Obrigatória |
|---|---|---|
| `DATABASE_URL` | PostgreSQL | Sim |
| `ANTHROPIC_API_KEY` | Professor IA e resumos do radar | Não (a plataforma funciona sem) |
| `GITHUB_TOKEN` | Releases do radar com limite maior | Recomendada |
| `NVD_API_KEY` | Vulnerabilidades com limite maior | Opcional |
| `TAVILY_API_KEY` ou `EXA_API_KEY` | Provedor de pesquisa alternativo | Opcional |
| `REDIS_URL` | Filas e cache | Para o radar automático |

**Assinatura do Claude e API são cobranças diferentes.** A API é cobrada à parte, no Claude Console. O plano Pro não inclui uso da API (https://support.claude.com/en/articles/8325606-what-is-the-pro-plan). Desde outubro de 2026, os planos Max, Ultra e Team recebem um crédito mensal de API, usado só no Console (https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers). Crie um workspace com limite de gastos para a plataforma.

Nesta versão hospedada no claude.ai, o professor IA usa a conta Claude de quem está vendo a página. Não há chave de API na página.

## Modelo de dados para produção (Prisma, resumo)
```prisma
model Course { id String @id; disciplineId String; title String; description String; level Level; hours Int; status Status; version Int; modules Module[] }
model Module { id String @id; courseId String; order Int; title String; lessons Lesson[]; @@unique([courseId, order]) }
model Lesson { id String @id; moduleId String; order Int; title String; status Status; version Int; body Json; tags String[]; versions LessonVersion[] }
model LessonVersion { id String @id @default(cuid()); lessonId String; version Int; body Json; archivedAt DateTime; @@unique([lessonId, version]) }
model Exercise { id String @id; lessonId String?; assessmentId String?; type ExerciseType; prompt String; spec Json; explanation String; difficulty Int; points Int }
model Attempt { id String @id @default(cuid()); userId String; exerciseId String; score Int; correct Boolean; response Json; createdAt DateTime @default(now()); @@index([userId, exerciseId]) }
model Reference { id String @id; title String; url String?; kind String; tech String?; version String?; publishedAt DateTime?; reliability String; ownerId String? }
model RadarUpdate { id String @id @default(cuid()); source String; externalId String; tech String; type String; relevance String; title String; url String; version String?; publishedAt DateTime; summary String; @@unique([source, externalId]) }
model ReviewRequest { id String @id @default(cuid()); kind String; targetId String?; radarUpdateId String?; reason String; status String; createdAt DateTime @default(now()) }
model Notification { id String @id @default(cuid()); userId String; radarUpdateId String; seenAt DateTime?; @@unique([userId, radarUpdateId]) }
enum Status { DRAFT REVIEW PUBLISHED }
```

## Migração da v1
A v1 gerava aulas, exercícios e avaliações com IA a cada acesso e guardava o progresso por módulo gerado. Na v2:
- O progresso da v1 pode ser importado em Configurações: perfil, trilha, minutos, atividades, cartões de revisão e status de projetos são mesclados; o histórico de tentativas fica preservado em separado no Histórico.
- As aulas geradas por IA na v1 não entram na base, porque não passaram por revisão editorial.
- A v1 continua disponível e intacta como artefato separado.

## Backup
Em Gestão de conteúdo → Importar / exportar, o administrador exporta a base inteira em um pacote JSON, que também é o formato de importação em lote. Cada aluno exporta o próprio progresso em Configurações.

## Decisões de produção de conteúdo (registradas em 2026-11-18)
Estas decisões valem para a produção dos cursos restantes e para qualquer sessão que continue o trabalho.

1. **Reaproveitamento da estrutura.** Todo curso novo parte do molde da Onda 1, sem reinventar o formato: arquivos `<curso>-a.mjs` e `<curso>-b.mjs` (aulas com as 12 seções), `<curso>-ex.mjs` (exercícios por aula, prova final e projeto integrador), `<curso>.mjs` (metadados, módulos e suplemento com glossário, cheatsheet, erros comuns, mapa de pré-requisitos, referências oficiais e prática) e a função `makeCourse` de `_lib.mjs`. O curso entra na lista `WAVE1` de `seed/build.mjs`. Os campos obrigatórios são os do checklist de publicação (`E.lessonChecklist` e `E.courseChecklist`).
2. **Sonnet para conteúdo.** Aulas, exercícios, provas, projetos, suplementos e referências são tarefas bem especificadas e ficam com o Sonnet. O Opus fica com arquitetura, segurança, integridade de dados, migrações, algoritmos pedagógicos complexos e revisões críticas, como a diretriz mestra já determina. A troca de modelo não é automática: o usuário a faz com /model, e quem estiver trabalhando avisa quando uma etapa pede o outro modelo.
3. **Verificação mecânica antes de publicar.** Exemplos de código da linguagem do curso são executados ou compilados; as soluções dos desafios passam nos próprios testes (a suíte `engine.test.cjs` faz isso automaticamente); as referências só são citadas depois de lidas.
4. **Persistência exige atualizar o marcador de instalação.** Ao publicar conteúdo novo no pacote da plataforma, `SEED_REV` (em `src/app.html`, `seed/docs.mjs` e no catálogo) deve ser incrementado. Sem isso, um banco que já tem o marcador `kb_meta/seedinfo` com a revisão atual não instala o conteúdo novo. Defeito encontrado na auditoria da Onda 1.
