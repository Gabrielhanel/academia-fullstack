# Academia v2 — Auditoria da Onda 1 e Planejamento Geral

Data: 2026-11-18

A Onda 1 NÃO está oficialmente concluída: o banco real só tem 2 dos 5 cursos, por causa de um defeito de versionamento do seed (`SEED_REV`). Nada novo foi implementado nesta etapa.

## Relatório de fechamento da Onda 1

| Critério | Resultado encontrado | Evidência | Pendências | Status |
| --- | --- | --- | --- | --- |
| 5 cursos no catálogo (seed) | Os 5 existem no seed: Lógica, Git, HTML/CSS, JavaScript, TypeScript | `seed/docs.json`, auditoria local | Nenhuma no seed | Aprovado |
| Cursos gravados no banco real | Só 2 cursos no banco; Git, HTML/CSS, JS e TS não estão gravados | Leitura do banco (`db_list`/`db_get`); reprodução local do upgrade | Corrigir `SEED_REV` e o dono abrir a v2 | Reprovado |
| Módulos, aulas, exercícios, provas, projetos | Completos no seed: 0 duplicados, 0 órfãos, 0 erros de validação | Auditoria sobre `seed/docs.json` | Confirmar no banco após correção | Parcial |
| Conteúdo persistido de verdade | Prova só vale para o curso 1; cursos 2–5 ausentes | Leitura direta do banco | Reverificar após o dono abrir a v2 | Reprovado |
| Dados sobrevivem a recarga e novo login | Não verificado no banco real (navegador exige login do dono) | Limite da ferramenta; e2e cobre só ambiente simulado | Dono recarrega e eu releio o banco | Parcial |
| Revisão, aprovação e publicação no CMS | Funciona nos testes (rascunho→revisão→aprovado→publicado, checklist, auditoria) | 124/124 testes passam | Teste no banco real | Parcial |
| Relatório de cobertura | Bate com as contagens do seed | `E.coverage` conferido | Conferir no banco real | Parcial |
| Análise de itens | Funciona (só sinaliza, não altera) | Testes unitários | Sem dados reais de alunos | Aprovado |
| Vínculo exercício/prova/projeto ↔ curso | Sem órfãos nem vínculos trocados | Auditoria do seed | Nenhuma | Aprovado |
| Referências e suplementos | 14 referências oficiais do TS verificadas; piloto `js-async` sem `techVersions` por aula (7 falhas de checklist) e sem suplemento | Checklist de aulas | Completar o piloto | Parcial |
| Testes automatizados | 124/124 passam, mas não cobrem o caminho real de upgrade | `npm test` | Teste com banco pré-existente em `rev` 2 | Parcial |

**Conclusão:** a Onda 1 não pode ser considerada oficialmente concluída. O conteúdo está pronto e verificado no seed, mas só o curso 1 está gravado no banco real.

## Pendências, riscos e ação do dono

| # | Item | Risco | Correção proposta | Quem |
| --- | --- | --- | --- | --- |
| 1 | `SEED_REV` fixo em 2: o `installSeed` pula a instalação quando o banco já está em `rev` 2 | Alto: cursos 2–5 nunca chegam ao banco | Subir `SEED_REV` para 3 em `src/app.html`, `seed/docs.mjs` e `seedRev` do catálogo em `seed/build.mjs` | Sonnet; revisão Opus |
| 2 | Sem teste do caminho real de upgrade | Médio | Teste e2e com banco em `rev` 2 e só o curso 1, exigindo cursos 2–5 e vínculos do catálogo | Sonnet |
| 3 | Recarga e progresso por usuário não verificados no banco real | Médio | Dono abre a v2 como dono, recarrega; eu releio o banco | Dono + Claude |
| 4 | Piloto `js-async` sem `techVersions` e sem suplemento | Baixo | Completar metadados e suplemento | Sonnet |
| 5 | Catálogo: 86 disciplinas (9 cobertas, 77 pendentes), não 71/66 | Baixo | Planejar com 77 | Decisão do dono |
| 6 | Laboratório só executa JavaScript; HTML/CSS analisado como texto; TS não compilado | Médio | Labs na Trilha A | Opus (arquitetura) |

**O que o dono faz:** abrir a v2 logado como dono (https://claude.ai/artifact/AGspvEEyUWzn9D3WZSqGU8), esperar o aviso "Base de conhecimento atualizada…", recarregar e avisar. Depois a releitura do banco. Só funciona depois da correção do item 1.

## Inventário dos cursos restantes (77 disciplinas)

O catálogo tem 86 disciplinas em 17 áreas. A Onda 1 cobre 9 (lógica, estruturas de dados, Big O, Git, HTML, CSS, acessibilidade, JavaScript e TypeScript). Restam 77, não 66. Complexidade vem da proporção de tópicos de nível Avançado/Especialista no ementa; importância Full Stack vem de quantas das 11 trilhas incluem a disciplina. Ambas são aproximações calculadas, não julgamento editorial. Pré-requisitos seguem a ordem das ondas: cada onda depende das anteriores.

| Disciplina | Área | Tópicos | Complexidade | Importância Full Stack | Onda |
| --- | --- | --- | --- | --- | --- |
| APIs do navegador e Web Platform | Frontend | 5 | Média | Baixa | C1 |
| Linux, terminal e Shell Script | Infraestrutura e DevOps | 6 | Baixa | Baixa | C1 |
| Paradigmas de programação | Fundamentos de computação | 3 | Média | Baixa | C1 |
| Sistemas operacionais | Fundamentos de computação | 3 | Média | Baixa | C1 |
| Redes de computadores | Fundamentos de computação | 5 | Baixa | Média | C1 |
| Expressões regulares | Fundamentos de computação | 3 | Baixa | Baixa | C1 |
| Fluxo profissional | Engenharia de software | 4 | Média | Baixa | C1 |
| Agilidade | Engenharia de software | 4 | Baixa | Baixa | C1 |
| Requisitos e modelagem de domínio | Engenharia de software | 5 | Baixa | Baixa | C1 |
| Ferramentas do desenvolvedor | Engenharia de software | 5 | Baixa | Baixa | C1 |
| React | Frontend | 11 | Média | Média | C2 |
| Gerenciamento de estado | Frontend | 7 | Média | Média | C2 |
| Next.js | Frontend | 9 | Média | Baixa | C2 |
| Tailwind CSS e Design Systems | Frontend | 7 | Alta | Baixa | C2 |
| Arquitetura frontend e Microfrontends | Frontend | 4 | Alta | Baixa | C2 |
| Performance frontend | Frontend | 6 | Alta | Baixa | C2 |
| Testes de frontend | Frontend | 6 | Alta | Baixa | C2 |
| SQL | Banco de dados | 9 | Baixa | Alta | C3 |
| PostgreSQL e MySQL | Banco de dados | 7 | Alta | Baixa | C3 |
| Modelagem de dados | Banco de dados | 5 | Média | Média | C3 |
| Transações e concorrência | Banco de dados | 4 | Alta | Baixa | C3 |
| ORMs (Prisma, TypeORM) | Banco de dados | 3 | Alta | Baixa | C3 |
| NoSQL, MongoDB e Redis | Banco de dados | 6 | Alta | Baixa | C3 |
| Estratégias de cache | Banco de dados | 4 | Alta | Média | C3 |
| Node.js e Express | Backend | 9 | Média | Baixa | C4 |
| NestJS | Backend | 10 | Média | Baixa | C4 |
| APIs REST, GraphQL e WebSockets | Backend | 10 | Média | Alta | C4 |
| Autenticação e autorização | Backend | 7 | Alta | Alta | C4 |
| Filas e processamento assíncrono | Backend | 5 | Alta | Baixa | C4 |
| Logs e observabilidade | Backend | 4 | Alta | Baixa | C4 |
| Microsserviços | Backend | 4 | Alta | Baixa | C4 |
| Python para desenvolvedores | Backend | 6 | Baixa | Baixa | C4 |
| Clean Code e SOLID | Arquitetura e engenharia | 5 | Alta | Alta | C5 |
| Design Patterns | Arquitetura e engenharia | 5 | Média | Baixa | C5 |
| Documentação arquitetural | Arquitetura e engenharia | 4 | Alta | Baixa | C5 |
| Fundamentos de testes | Testes e qualidade | 8 | Média | Alta | C5 |
| Ferramentas JS (Jest, Vitest, Supertest, Cypress, Playwright) | Testes e qualidade | 6 | Alta | Baixa | C5 |
| Contrato, carga e análise estática | Testes e qualidade | 4 | Alta | Baixa | C5 |
| Estruturas internas das linguagens | Fundamentos de computação | 2 | Alta | Baixa | C5 |
| Qualidade e manutenção de software | Engenharia de software | 6 | Alta | Baixa | C5 |
| Docker, Compose e Kubernetes | Infraestrutura e DevOps | 6 | Alta | Alta | C6 |
| CI/CD e GitHub Actions | Infraestrutura e DevOps | 4 | Alta | Média | C6 |
| Nginx, proxy reverso e deploy | Infraestrutura e DevOps | 3 | Alta | Baixa | C6 |
| Cloud (AWS, Azure, Google Cloud) | Infraestrutura e DevOps | 6 | Média | Baixa | C6 |
| Infraestrutura como código | Infraestrutura e DevOps | 2 | Alta | Baixa | C6 |
| Monitoramento | Infraestrutura e DevOps | 4 | Alta | Baixa | C6 |
| OWASP | Segurança | 2 | Alta | Baixa | C7 |
| Vulnerabilidades web | Segurança | 5 | Média | Baixa | C7 |
| Criptografia, hashing e segredos | Segurança | 3 | Alta | Baixa | C7 |
| Secure coding e LGPD | Segurança | 4 | Alta | Média | C7 |
| Estilos arquiteturais | Arquitetura e engenharia | 7 | Alta | Alta | C8 |
| Event-Driven, CQRS e Event Sourcing | Arquitetura e engenharia | 4 | Alta | Baixa | C8 |
| Escalabilidade e resiliência | Arquitetura e engenharia | 4 | Alta | Baixa | C8 |
| Message brokers | Mensageria | 6 | Alta | Média | C8 |
| Resiliência em mensageria | Mensageria | 4 | Alta | Baixa | C8 |
| Escalabilidade | Performance e escalabilidade | 7 | Alta | Média | C8 |
| Profiling e memória | Performance e escalabilidade | 3 | Alta | Baixa | C8 |
| Fundamentos de System Design | System Design | 6 | Alta | Baixa | C8 |
| Estudos de caso de System Design | System Design | 6 | Alta | Baixa | C8 |
| Testes na JVM | Testes e qualidade | 4 | Alta | Média | C9 |
| Java | Java e Kotlin | 9 | Média | Baixa | C9 |
| Spring | Java e Kotlin | 4 | Alta | Baixa | C9 |
| Kotlin no backend | Java e Kotlin | 4 | Alta | Baixa | C9 |
| Fundamentos mobile | Mobile | 6 | Baixa | Alta | C10 |
| React Native e Expo | Mobile | 12 | Alta | Baixa | C10 |
| Kotlin e Android | Mobile | 11 | Média | Baixa | C10 |
| Swift e iOS (complementar) | Mobile | 4 | Média | Baixa | C10 |
| Escolha de tecnologia mobile | Mobile | 3 | Alta | Alta | C10 |
| Dart | Flutter e Dart | 10 | Média | Baixa | C10 |
| Flutter | Flutter e Dart | 21 | Alta | Baixa | C10 |
| Arquitetura de apps Flutter | Flutter e Dart | 6 | Alta | Baixa | C10 |
| Fundamentos de IA e ML | IA aplicada | 3 | Baixa | Baixa | C11 |
| Engenharia de prompts | IA aplicada | 3 | Baixa | Baixa | C11 |
| IA em aplicações | IA aplicada | 9 | Alta | Baixa | C11 |
| IA na engenharia de software | IA aplicada | 2 | Alta | Baixa | C11 |
| Entrevistas e System Design | Carreira e preparação profissional | 4 | Alta | Baixa | C11 |
| Carreira e comunicação | Carreira e preparação profissional | 3 | Baixa | Baixa | C11 |

## Trilha B — produção de cursos: 11 ondas (C1–C11), 77 disciplinas

O número de ondas vem do volume e das dependências. As 77 disciplinas entram todas. Cada onda segue o padrão da Onda 1: objetivos, módulos, aulas completas, exercícios com gabarito comentado, prova final, projeto integrador, glossário, cheatsheet, mapa de pré-requisitos e referências oficiais verificáveis.

| Onda | Escopo | Disc. | Por que nesta ordem |
| --- | --- | --- | --- |
| C1 | Base da web e do ofício: redes, SO, Linux, regex, paradigmas, Web Platform, ferramentas, fluxo, agilidade, requisitos | 10 | Pré-requisito de quase tudo; baixo risco técnico |
| C2 | Frontend moderno: React, estado, Next.js, Tailwind, arquitetura, performance, testes | 7 | Continua TypeScript e HTML/CSS; abre a trilha Full Stack |
| C3 | Dados: SQL, modelagem, PostgreSQL/MySQL, transações, ORMs, NoSQL, cache | 7 | O backend depende de dados |
| C4 | Backend: Node/Express, NestJS, APIs, autenticação, filas, observabilidade, microsserviços, Python | 8 | Precisa de C3 e de JS/TS |
| C5 | Engenharia e qualidade: Clean Code/SOLID, patterns, testes, ferramentas de teste, qualidade, ADRs, estruturas internas | 8 | Consolida prática antes de arquitetura |
| C6 | Infra e entrega: Docker/Kubernetes, CI/CD, Nginx, cloud, IaC, monitoramento | 6 | Entrega o que C2–C5 constroem |
| C7 | Segurança: OWASP, vulnerabilidades web, criptografia, secure coding/LGPD | 4 | Depende de web, backend e autenticação |
| C8 | Arquitetura e sistemas distribuídos: estilos, event-driven, brokers, resiliência, escalabilidade, profiling, System Design | 9 | Exige C3–C7; o mais abstrato |
| C9 | JVM: Java, Spring, Kotlin no backend, testes na JVM | 4 | Trilha alternativa de backend |
| C10 | Mobile: fundamentos, React Native, Kotlin/Android, iOS, Flutter/Dart, escolha de tecnologia | 8 | React Native precisa de C2; Kotlin se apoia em C9 |
| C11 | IA aplicada e carreira | 6 | Fecha com o que muda mais rápido; entrevistas usam C8 |

**Conclusão de uma onda** (critério igual para todas):

- Cursos gravados no banco real e relidos via `db_get`/`db_list`.
- Checklist editorial sem falhas em cada aula, curso, exercício e prova.
- Código de exemplo verificado com a ferramenta real (compilador, interpretador ou teste).
- Referências oficiais abertas e conferidas, com data.
- Suíte de testes verde, incluindo o teste de upgrade do seed.
- Relatório de fechamento no formato da auditoria, aprovado pelo dono.

**Decisão aberta:** agrupar disciplinas em cursos (estimativa minha de 35–45 cursos) ou 1 curso por disciplina (77). Recomendo agrupar onde o ementa é curto (2–5 tópicos) e manter curso próprio acima de 8 tópicos (React, SQL, Flutter, JavaScript).

## Trilha A — evoluções da plataforma

Independente da B. O ponto de encontro é o formato de exercício e o esquema do banco; mudar qualquer um exige aviso e `SEED_REV` novo.

| Item | Valor para o aluno | Depende de | Executor | Observação |
| --- | --- | --- | --- | --- |
| Correção do `SEED_REV` + teste de upgrade | Todo conteúdo chega ao banco | — | Sonnet; Opus revisa | Pré-requisito de qualquer onda |
| Teste de upgrade por onda | Evita repetir o defeito | Item acima | Sonnet | Rotina |
| Laboratório SQL | Pratica SQL sem IA (C3) | Motor SQL no navegador | Opus (arquitetura, segurança); Sonnet (itens) | Antes da C3 |
| Labs Git, HTML/CSS e TS | Hoje corrigidos como texto/objetivo | Execução isolada | Opus (arquitetura); Sonnet (itens) | Compilar TS exige decisão de isolamento |
| Execução isolada de outras linguagens | Python, Java, Kotlin, Dart | Sandbox | Opus | Segurança |
| Parsons Problems | Prática de código mais leve | Formato de exercício | Sonnet | Baixo risco |
| Teste de nivelamento | Indica por onde começar | Mapa de competências | Sonnet; Opus no modelo de pontuação | |
| Variantes determinísticas | Evita decorar gabarito | Formato de exercício | Opus (integridade) | Reproduzível |
| Mapa de competências | Progresso real | Banco de itens | Opus (modelo); Sonnet (UI) | |
| Certificados | Comprova conclusão | Mapa; regras de aprovação | Opus (integridade) | Sem valor oficial por si só |
| Radar e hub de pesquisa | Atualiza referências | `kb_radar` | Sonnet | IA complementar |
| Turmas e professores | Uso em sala | Permissões do banco | Opus (acesso) | Dados de usuários |
| Busca | Acha aulas e glossário | Índice | Sonnet | |
| Extras (glossários, cheatsheets globais) | Revisão rápida | Cursos publicados | Sonnet | |

**Quando usar Opus:** itens que mudam arquitetura, regras do banco, execução de código isolada, certificados ou integridade das notas. Cada um vem com um pacote: motivo, resumo técnico, arquivos e funcionalidades afetados, decisões do dono e como validar. A troca de modelo é manual (`/model`).

**Integração entre trilhas:**

- Onda de curso não altera o formato de exercício; se precisar, vira item da Trilha A antes.
- Item da Trilha A não altera conteúdo de curso; usa o seed existente como teste.
- Toda publicação sobe `SEED_REV` e passa pelo teste de upgrade.

## Próximo passo recomendado

Etapa curta de correção da Onda 1 antes da C1 (nada disso foi aplicado; aguarda aprovação):

1. Subir `SEED_REV` de 2 para 3 em `src/app.html`, `seed/docs.mjs` e no `seedRev` do catálogo (`seed/build.mjs`).
2. Criar o teste e2e de upgrade: banco com `rev` 2 e só o curso 1; exigir cursos 2–5 e vínculos do catálogo.
3. Completar o piloto `js-async` (`techVersions` por aula e suplemento).
4. Rodar build e testes, publicar.
5. Dono abre a v2 logado, espera o aviso de atualização e recarrega.
6. Releitura do banco e relatório final da Onda 1.

**Critérios de aceite:**

- O banco real contém os 5 cursos, com aulas, exercícios, provas e projetos, sem duplicados.
- Recarregar e novo login mantêm catálogo e progresso.
- Testes passam, inclusive o de upgrade.
- Cobertura e análise de itens batem com os dados lidos do banco.

Executor: Sonnet nos itens 1–4; Opus revisa a integridade do upgrade (item 1). Depois da aprovação do relatório final, a C1 começa com Sonnet.
