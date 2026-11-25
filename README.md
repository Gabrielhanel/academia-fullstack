# Academia Full Stack v2

Plataforma de ensino com base de conhecimento própria. A IA é complementar: catálogo, aulas, exercícios, avaliações, laboratório, progresso, revisão, pesquisa e radar funcionam sem ela.

## Estrutura
| Caminho | Conteúdo |
|---|---|
| `src/engine.js` | Regras puras: correção determinística, validação de conteúdo, SM-2, radar (deduplicação, CVSS, notificações), busca local, fonte do sandbox de testes |
| `src/app.html` | Página: Store, KB (conteúdo + CMS e versões), LMS, Assess, Lab, Research, Radar, AI, UI |
| `seed/pilot.mjs` | Curso piloto "JavaScript Assíncrono" (7 aulas, 32 exercícios, avaliação com 10 questões, projeto com 5 testes) |
| `seed/build.mjs` | Catálogo (17 áreas, 86 disciplinas), trilhas, 13 projetos, páginas, radar verificado e referências → `seed/seed.json` |
| `seed/docs.mjs` | Converte o seed em documentos do banco → `seed/docs.json` (publicado como `seed-docs.json`) |
| `test/engine.test.cjs` | Testes do Engine e do conteúdo (cada solução de referência passa; cada código inicial falha) |
| `test/e2e.test.cjs` | Testes de ponta a ponta com jsdom, banco em memória e IA indisponível |

## Comandos
```
npm install
npm run seed
npm run build
cp seed/docs.json dist/seed-docs.json
npm test
node preview/refresh.mjs
node preview/serve.mjs 8081
```
Para atualizar (dia a dia):
```
node preview/refresh.mjs
node preview/serve.mjs 8081
```

## Banco (coleções)
`kb_meta/catalog`, `kb_meta/radarcfg`, `kb_courses`, `kb_lessons`, `kb_exsets`, `kb_assess`, `kb_projects`, `kb_pages`, `kb_refs`, `kb_radar` (leitura para todos, escrita só do dono); `kb_drafts`, `kb_versions`, `kb_reviews` (só administrador); `data/users/<id>/state` e `data/users/<id>/C_<chat>` (privados por aluno).

## Configuração externa (produção)
Veja a página "Arquitetura" dentro da plataforma: provedores de pesquisa, coleta automática do radar, execução isolada para outras linguagens e variáveis de ambiente. A assinatura do Claude não inclui a API; a API é cobrada à parte no Claude Console.
